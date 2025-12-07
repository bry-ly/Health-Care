import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { createAllergySchema } from "@/lib/validations/medical-history";

// GET /api/medical-history/allergies - Get all allergies for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    // First get or create medical history
    const medicalHistory = await prisma.medicalHistory.findUnique({
      where: { patientId: session.user.id },
      include: { allergies: { orderBy: { createdAt: "desc" } } },
    });

    if (!medicalHistory) {
      return successResponse([]);
    }

    return successResponse(medicalHistory.allergies);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/medical-history/allergies - Add a new allergy
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    // Get or create medical history
    let medicalHistory = await prisma.medicalHistory.findUnique({
      where: { patientId: session.user.id },
    });

    if (!medicalHistory) {
      medicalHistory = await prisma.medicalHistory.create({
        data: { patientId: session.user.id },
      });
    }

    const body = await request.json();
    const validationResult = createAllergySchema.safeParse({
      ...body,
      medicalHistoryId: medicalHistory.id,
    });

    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues.map((e) => e.message).join(", ")
      );
    }

    const data = validationResult.data;

    const allergy = await prisma.allergy.create({
      data: {
        medicalHistoryId: medicalHistory.id,
        allergen: data.allergen,
        reaction: data.reaction,
        severity: data.severity,
        diagnosedDate: data.diagnosedDate,
        notes: data.notes,
      },
    });

    return successResponse(allergy, "Allergy added successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/medical-history/allergies - Delete an allergy
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const allergyId = searchParams.get("id");

    if (!allergyId) {
      return errorResponse("Allergy ID is required");
    }

    // Verify the allergy belongs to the user
    const allergy = await prisma.allergy.findUnique({
      where: { id: allergyId },
      include: { medicalHistory: true },
    });

    if (!allergy || allergy.medicalHistory.patientId !== session.user.id) {
      return notFoundResponse("Allergy");
    }

    await prisma.allergy.delete({
      where: { id: allergyId },
    });

    return successResponse(null, "Allergy deleted successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}
