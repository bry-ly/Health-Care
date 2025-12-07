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
import { createChronicConditionSchema } from "@/lib/validations/medical-history";

// GET /api/medical-history/conditions - Get all chronic conditions for current user
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
      include: { chronicConditions: { orderBy: { createdAt: "desc" } } },
    });

    if (!medicalHistory) {
      return successResponse([]);
    }

    return successResponse(medicalHistory.chronicConditions);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/medical-history/conditions - Add a new chronic condition
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
    const validationResult = createChronicConditionSchema.safeParse({
      ...body,
      medicalHistoryId: medicalHistory.id,
    });

    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues.map((e) => e.message).join(", ")
      );
    }

    const data = validationResult.data;

    const condition = await prisma.chronicCondition.create({
      data: {
        medicalHistoryId: medicalHistory.id,
        condition: data.condition,
        diagnosedDate: data.diagnosedDate,
        status: data.status,
        treatment: data.treatment,
        notes: data.notes,
      },
    });

    return successResponse(condition, "Condition added successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/medical-history/conditions - Delete a chronic condition
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const conditionId = searchParams.get("id");

    if (!conditionId) {
      return errorResponse("Condition ID is required");
    }

    // Verify the condition belongs to the user
    const condition = await prisma.chronicCondition.findUnique({
      where: { id: conditionId },
      include: { medicalHistory: true },
    });

    if (!condition || condition.medicalHistory.patientId !== session.user.id) {
      return notFoundResponse("Condition");
    }

    await prisma.chronicCondition.delete({
      where: { id: conditionId },
    });

    return successResponse(null, "Condition deleted successfully");
  } catch (error) {
    return serverErrorResponse(error);
  }
}
