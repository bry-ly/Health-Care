import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notificationPreferencesSchema } from "@/lib/validations/notification-preferences";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Get or create default preferences
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      // Return default values if no preferences exist yet
      preferences = {
        id: "",
        userId: session.user.id,
        appointmentReminders: true,
        bookingConfirmations: true,
        cancellationAlerts: true,
        rescheduleAlerts: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return successResponse({
      appointmentReminders: preferences.appointmentReminders,
      bookingConfirmations: preferences.bookingConfirmations,
      cancellationAlerts: preferences.cancellationAlerts,
      rescheduleAlerts: preferences.rescheduleAlerts,
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return serverErrorResponse("Failed to fetch notification preferences");
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const result = notificationPreferencesSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("Invalid request data");
    }

    // Upsert preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: result.data,
      create: {
        userId: session.user.id,
        ...result.data,
      },
    });

    return successResponse({
      appointmentReminders: preferences.appointmentReminders,
      bookingConfirmations: preferences.bookingConfirmations,
      cancellationAlerts: preferences.cancellationAlerts,
      rescheduleAlerts: preferences.rescheduleAlerts,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return serverErrorResponse("Failed to update notification preferences");
  }
}
