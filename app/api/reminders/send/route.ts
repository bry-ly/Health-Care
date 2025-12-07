import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { sendAllReminders } from "@/lib/reminders";

/**
 * POST /api/reminders/send
 * Trigger reminder emails for upcoming appointments
 *
 * This endpoint can be called:
 * 1. Manually by an admin
 * 2. By a cron job service (e.g., Vercel Cron, Railway Cron, etc.)
 *
 * For cron job access, you can add an API key check:
 * const apiKey = request.headers.get("x-api-key");
 * if (apiKey === process.env.CRON_API_KEY) { ... }
 */
export async function POST(request: NextRequest) {
  try {
    // Check for cron API key first (for automated cron jobs)
    const apiKey = request.headers.get("x-cron-api-key");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set and request has valid key, allow access
    if (cronSecret && apiKey === cronSecret) {
      const results = await sendAllReminders();
      return successResponse(results, "Reminder emails processed (cron)");
    }

    // Otherwise, require admin authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    // Only allow admins to trigger reminders manually
    if (session.user.role !== "ADMIN") {
      return errorResponse(
        "Only administrators can trigger reminder emails",
        403
      );
    }

    const results = await sendAllReminders();

    return successResponse(results, "Reminder emails processed");
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * GET /api/reminders/send
 * Get status/stats about pending reminders (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    if (session.user.role !== "ADMIN") {
      return errorResponse("Only administrators can view reminder stats", 403);
    }

    // Import here to avoid circular dependencies
    const {
      getAppointmentsNeeding24hReminder,
      getAppointmentsNeeding1hReminder,
      getAppointmentsNeedingFollowUp,
    } = await import("@/lib/reminders");

    const [pending24h, pending1h, pendingFollowUp] = await Promise.all([
      getAppointmentsNeeding24hReminder(),
      getAppointmentsNeeding1hReminder(),
      getAppointmentsNeedingFollowUp(),
    ]);

    return successResponse({
      pending24hReminders: pending24h.length,
      pending1hReminders: pending1h.length,
      pendingFollowUps: pendingFollowUp.length,
      totalPending:
        pending24h.length + pending1h.length + pendingFollowUp.length,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
