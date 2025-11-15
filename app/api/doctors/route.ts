import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all available doctors
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const specialization = searchParams.get("specialization");
    const userId = searchParams.get("userId");

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
    const body = await request.json();
    const {
      userId,
      specialization,
      licenseNumber,
      bio,
      experience,
      consultationFee,
    } = body;

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
        user: true,
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
