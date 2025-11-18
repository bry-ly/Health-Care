import { z } from "zod";

export const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  appointmentDate: z.string().or(z.date()),
  timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  reason: z.string().optional(),
  symptoms: z.string().optional(),
  duration: z.number().int().min(15).max(120).default(30),
  appointmentType: z.enum(["CONSULTATION", "FOLLOW_UP", "CHECKUP", "EMERGENCY", "SURGERY", "TEST", "OTHER"]).optional().default("CONSULTATION"),
  urgencyLevel: z.enum(["ROUTINE", "URGENT", "EMERGENCY"]).optional().default("ROUTINE"),
  patientPhone: z.string().optional(),
  patientEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
  isFollowUp: z.boolean().optional().default(false),
  previousAppointmentId: z.string().optional(),
});

export const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  appointmentDate: z.string().or(z.date()),
  timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  cancelReason: z.string().min(1, "Cancel reason is required"),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  breakStart: z
    .union([
      z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  breakEnd: z
    .union([
      z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  isActive: z.boolean().default(true),
});

export const weeklyAvailabilitySchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  availability: z.array(availabilitySchema),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type WeeklyAvailabilityInput = z.infer<typeof weeklyAvailabilitySchema>;




