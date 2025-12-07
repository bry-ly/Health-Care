import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { upsertMedicalHistorySchema } from "@/lib/validations/medical-history";

// GET /api/medical-history - Get current user's medical history
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    const medicalHistory = await prisma.medicalHistory.findUnique({
      where: { patientId: session.user.id },
      include: {
        allergies: {
          orderBy: { createdAt: "desc" },
        },
        chronicConditions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return successResponse(medicalHistory);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/medical-history - Create or update medical history
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validationResult = upsertMedicalHistorySchema.safeParse({
      ...body,
      patientId: session.user.id,
    });

    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues.map((e) => e.message).join(", ")
      );
    }

    const data = validationResult.data;

    // Upsert medical history
    const medicalHistory = await prisma.medicalHistory.upsert({
      where: { patientId: session.user.id },
      create: {
        patientId: session.user.id,
        bloodType: data.bloodType,
        height: data.height,
        weight: data.weight,
        surgicalHistory: data.surgicalHistory,
        familyHistory: data.familyHistory,
        currentMedications: data.currentMedications,
        lifestyle: data.lifestyle,
        notes: data.notes,
      },
      update: {
        bloodType: data.bloodType,
        height: data.height,
        weight: data.weight,
        surgicalHistory: data.surgicalHistory,
        familyHistory: data.familyHistory,
        currentMedications: data.currentMedications,
        lifestyle: data.lifestyle,
        notes: data.notes,
      },
      include: {
        allergies: true,
        chronicConditions: true,
      },
    });

    return successResponse(
      medicalHistory,
      "Medical history updated successfully"
    );
  } catch (error) {
    return serverErrorResponse(error);
  }
}
