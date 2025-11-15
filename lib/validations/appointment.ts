import { z } from "zod";

export const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  appointmentDate: z.string().or(z.date()),
  timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  reason: z.string().optional(),
  duration: z.number().int().min(15).max(120).default(30),
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
  doctorId: z.string().min(1, "Doctor ID is required"),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional().nullable(),
  breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional().nullable(),
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




