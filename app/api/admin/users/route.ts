import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET all users (admin only) or search by email (doctor/admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Allow doctors to search for patients by email
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (email) {
      // Doctors can search for patients, admins can search for anyone
      if (session.user.role !== "ADMIN" && session.user.role !== "DOCTOR") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          phone: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ users: user ? [user] : [] }, { status: 200 });
    }

    // Full list only for admins
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Use better-auth's internal API to create user with password
    // This ensures the Account record is created with properly hashed password
    try {
      // Create a mock request to better-auth's handler
      const mockRequest = new Request(new URL("/api/auth/sign-up/email", "http://localhost:3000"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      // Use better-auth's handler to create the user
      const { POST } = await import("@/app/api/auth/[...all]/route");
      const response = await POST(mockRequest as any);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to create user account");
      }

      const signupData = await response.json();

      if (!signupData || !signupData.user) {
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }

      // Update user role and phone after creation
      const updatedUser = await prisma.user.update({
        where: { id: signupData.user.id },
        data: {
          role,
          ...(phone && { phone }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          phone: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ user: updatedUser }, { status: 201 });
    } catch (error: any) {
      console.error("Error creating user with better-auth:", error);
      // If user already exists from better-auth perspective
      if (error.message?.includes("already exists") || error.message?.includes("duplicate") || error.message?.includes("email")) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: error.message || "Failed to create user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

