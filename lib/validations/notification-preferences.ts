import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  appointmentReminders: z.boolean().optional(),
  bookingConfirmations: z.boolean().optional(),
  cancellationAlerts: z.boolean().optional(),
  rescheduleAlerts: z.boolean().optional(),
});

export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
