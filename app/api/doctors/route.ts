import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET all available doctors
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const specialization = searchParams.get("specialization");
    const userId = searchParams.get("userId");
    const doctorId = searchParams.get("doctorId");

    // If doctorId is provided, return that specific doctor
    if (doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          availability: true,
        },
      });

      if (!doctor) {
        return NextResponse.json({ doctors: [] }, { status: 200 });
      }

      return NextResponse.json({ doctors: [doctor] }, { status: 200 });
    }

    // If userId is provided, return doctor for that user
    if (userId) {
      const doctor = await prisma.doctor.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          availability: true,
        },
      });

      if (!doctor) {
        return NextResponse.json({ doctors: [] }, { status: 200 });
      }

      return NextResponse.json({ doctors: [doctor] }, { status: 200 });
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        isAvailable: true,
        ...(specialization && { specialization }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        availability: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ doctors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

// POST create a new doctor profile
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      userId,
      specialization,
      licenseNumber,
      bio,
      experience,
      consultationFee,
    } = body;

    // Validate required fields
    if (!userId || !specialization || !licenseNumber) {
      return NextResponse.json(
        { error: "User ID, specialization, and license number are required" },
        { status: 400 }
      );
    }

    // Check authorization: Only ADMIN can create doctor profiles for others
    // Doctors can create their own profile if they don't have one
    if (session.user.role !== "ADMIN" && session.user.id !== userId) {
      return NextResponse.json(
        { error: "Forbidden. You can only create your own doctor profile." },
        { status: 403 }
      );
    }

    // Verify the user exists and has DOCTOR role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "User must have DOCTOR role to create a doctor profile" },
        { status: 400 }
      );
    }

    // Check if doctor profile already exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (existingDoctor) {
      return NextResponse.json(
        { error: "Doctor profile already exists" },
        { status: 400 }
      );
    }

    // Check if license number is already taken
    const existingLicense = await prisma.doctor.findUnique({
      where: { licenseNumber },
    });

    if (existingLicense) {
      return NextResponse.json(
        { error: "License number is already in use" },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.create({
      data: {
        userId,
        specialization,
        licenseNumber,
        bio,
        experience: experience || 0,
        consultationFee: consultationFee || 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        availability: true,
      },
    });

    return NextResponse.json({ doctor }, { status: 201 });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { error: "Failed to create doctor profile" },
      { status: 500 }
    );
  }
}
