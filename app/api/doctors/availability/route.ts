import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { weeklyAvailabilitySchema } from "@/lib/validations/appointment";
import { ZodError } from "zod";

// GET doctor's availability
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId");
    const userId = searchParams.get("userId");

    if (!doctorId && !userId) {
      return NextResponse.json(
        { error: "Doctor ID or User ID is required" },
        { status: 400 }
      );
    }

    let doctor;
    if (userId) {
      doctor = await prisma.doctor.findUnique({
        where: { userId },
      });
      if (!doctor) {
        return NextResponse.json(
          { error: "Doctor profile not found" },
          { status: 404 }
        );
      }
    } else {
      doctor = await prisma.doctor.findUnique({
        where: { id: doctorId! },
      });
      if (!doctor) {
        return NextResponse.json(
          { error: "Doctor not found" },
          { status: 404 }
        );
      }
    }

    const availability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctor.id,
        isActive: true,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST/PUT create or update availability schedule
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
    const validated = weeklyAvailabilitySchema.parse(body);
    const { doctorId, availability } = validated;

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    // Check authorization: Only the doctor themselves or an admin can update availability
    if (session.user.role !== "ADMIN" && doctor.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only update your own availability." },
        { status: 403 }
      );
    }

    // Delete existing availability for this doctor
    await prisma.doctorAvailability.deleteMany({
      where: { doctorId },
    });

    // Create new availability records
    const createdAvailability = await prisma.$transaction(
      availability.map((avail) =>
        prisma.doctorAvailability.create({
          data: {
            doctorId,
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            breakStart: avail.breakStart || null,
            breakEnd: avail.breakEnd || null,
            isActive: avail.isActive,
          },
        })
      )
    );

    return NextResponse.json(
      { availability: createdAvailability },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating availability:", error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => {
        const field = issue.path.join(".");
        return `${field}: ${issue.message}`;
      });
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: errorMessages.join(", ") 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create availability" },
      { status: 500 }
    );
  }
}

// PATCH update specific day availability
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Availability ID is required" },
        { status: 400 }
      );
    }

    const availability = await prisma.doctorAvailability.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}



