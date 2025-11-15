import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// PATCH update doctor profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const {
      specialization,
      licenseNumber,
      bio,
      experience,
      consultationFee,
      isAvailable,
    } = body;

    // Find the doctor
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Check authorization: Only the doctor themselves or an admin can update
    if (session.user.role !== "ADMIN" && doctor.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only update your own profile." },
        { status: 403 }
      );
    }

    // Check if licenseNumber is being changed and if it's already taken
    if (licenseNumber && licenseNumber !== doctor.licenseNumber) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { licenseNumber },
      });

      if (existingDoctor && existingDoctor.id !== id) {
        return NextResponse.json(
          { error: "License number is already in use" },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: {
      specialization?: string;
      licenseNumber?: string;
      bio?: string | null;
      experience?: number;
      consultationFee?: number;
      isAvailable?: boolean;
    } = {};

    if (specialization !== undefined) {
      updateData.specialization = specialization;
    }

    if (licenseNumber !== undefined) {
      updateData.licenseNumber = licenseNumber;
    }

    if (bio !== undefined) {
      updateData.bio = bio || null;
    }

    if (experience !== undefined) {
      updateData.experience = experience;
    }

    if (consultationFee !== undefined) {
      updateData.consultationFee = consultationFee;
    }

    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
    }

    // Update doctor profile
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ doctor: updatedDoctor }, { status: 200 });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return NextResponse.json(
      { error: "Failed to update doctor profile" },
      { status: 500 }
    );
  }
}

// GET doctor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        availability: {
          where: {
            isActive: true,
          },
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ doctor }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 }
    );
  }
}


