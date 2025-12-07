/**
 * Smart Appointment Reminders System
 * Handles sending reminder emails for upcoming appointments
 */

import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { format, addHours, subHours } from "date-fns";
import { render } from "@react-email/render";
import { Appointment24hReminder } from "@/components/emails/appointment-24h-reminder";
import { Appointment1hReminder } from "@/components/emails/appointment-1h-reminder";
import { AppointmentFollowup } from "@/components/emails/appointment-followup";

export interface ReminderResult {
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Get appointments that need 24-hour reminders
 */
export async function getAppointmentsNeeding24hReminder() {
  const now = new Date();
  const in24Hours = addHours(now, 24);
  const in23Hours = addHours(now, 23);

  return prisma.appointment.findMany({
    where: {
      reminder24hSent: false,
      status: { in: ["PENDING", "CONFIRMED"] },
      appointmentDate: {
        gte: in23Hours,
        lte: in24Hours,
      },
    },
    include: {
      patient: true,
      doctor: {
        include: {
          user: true,
        },
      },
    },
  });
}

/**
 * Get appointments that need 1-hour reminders
 */
export async function getAppointmentsNeeding1hReminder() {
  const now = new Date();
  const in1Hour = addHours(now, 1);
  const in30Min = addHours(now, 0.5);

  return prisma.appointment.findMany({
    where: {
      reminder1hSent: false,
      status: { in: ["PENDING", "CONFIRMED"] },
      appointmentDate: {
        gte: in30Min,
        lte: in1Hour,
      },
    },
    include: {
      patient: true,
      doctor: {
        include: {
          user: true,
        },
      },
    },
  });
}

/**
 * Get completed appointments that need follow-up emails
 */
export async function getAppointmentsNeedingFollowUp() {
  const now = new Date();
  const oneDayAgo = subHours(now, 24);
  const twoDaysAgo = subHours(now, 48);

  return prisma.appointment.findMany({
    where: {
      followUpSent: false,
      status: "COMPLETED",
      appointmentDate: {
        gte: twoDaysAgo,
        lte: oneDayAgo,
      },
    },
    include: {
      patient: true,
      doctor: {
        include: {
          user: true,
        },
      },
    },
  });
}

/**
 * Send 24-hour reminder emails
 */
export async function send24hReminders(): Promise<ReminderResult> {
  const result: ReminderResult = { sent: 0, failed: 0, errors: [] };

  try {
    const appointments = await getAppointmentsNeeding24hReminder();

    for (const appointment of appointments) {
      try {
        const email = appointment.patientEmail || appointment.patient.email;
        const formattedDate = format(
          appointment.appointmentDate,
          "EEEE, MMMM d, yyyy"
        );
        const formattedTime = format(
          new Date(`2000-01-01T${appointment.timeSlot}`),
          "h:mm a"
        );

        const html = await render(
          Appointment24hReminder({
            patientName: appointment.patient.name,
            doctorName: appointment.doctor.user.name,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
            appointmentType: appointment.appointmentType || undefined,
          })
        );

        await sendEmail({
          to: email,
          subject: `Appointment Reminder - Tomorrow with Dr. ${appointment.doctor.user.name}`,
          html,
        });

        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { reminder24hSent: true },
        });

        result.sent++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `Failed to send 24h reminder for appointment ${appointment.id}: ${error}`
        );
      }
    }
  } catch (error) {
    result.errors.push(`Error fetching appointments: ${error}`);
  }

  return result;
}

/**
 * Send 1-hour reminder emails
 */
export async function send1hReminders(): Promise<ReminderResult> {
  const result: ReminderResult = { sent: 0, failed: 0, errors: [] };

  try {
    const appointments = await getAppointmentsNeeding1hReminder();

    for (const appointment of appointments) {
      try {
        const email = appointment.patientEmail || appointment.patient.email;
        const formattedTime = format(
          new Date(`2000-01-01T${appointment.timeSlot}`),
          "h:mm a"
        );

        const html = await render(
          Appointment1hReminder({
            patientName: appointment.patient.name,
            doctorName: appointment.doctor.user.name,
            appointmentTime: formattedTime,
          })
        );

        await sendEmail({
          to: email,
          subject: `⏰ Appointment in 1 Hour - Dr. ${appointment.doctor.user.name}`,
          html,
        });

        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { reminder1hSent: true },
        });

        result.sent++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `Failed to send 1h reminder for appointment ${appointment.id}: ${error}`
        );
      }
    }
  } catch (error) {
    result.errors.push(`Error fetching appointments: ${error}`);
  }

  return result;
}

/**
 * Send follow-up emails
 */
export async function sendFollowUpEmails(): Promise<ReminderResult> {
  const result: ReminderResult = { sent: 0, failed: 0, errors: [] };

  try {
    const appointments = await getAppointmentsNeedingFollowUp();

    for (const appointment of appointments) {
      try {
        const email = appointment.patientEmail || appointment.patient.email;
        const formattedDate = format(
          appointment.appointmentDate,
          "MMMM d, yyyy"
        );

        const html = await render(
          AppointmentFollowup({
            patientName: appointment.patient.name,
            doctorName: appointment.doctor.user.name,
            appointmentDate: formattedDate,
          })
        );

        await sendEmail({
          to: email,
          subject: `Thank You for Your Visit - Dr. ${appointment.doctor.user.name}`,
          html,
        });

        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { followUpSent: true },
        });

        result.sent++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `Failed to send follow-up for appointment ${appointment.id}: ${error}`
        );
      }
    }
  } catch (error) {
    result.errors.push(`Error fetching appointments: ${error}`);
  }

  return result;
}

/**
 * Send all types of reminders
 */
export async function sendAllReminders(): Promise<{
  reminder24h: ReminderResult;
  reminder1h: ReminderResult;
  followUp: ReminderResult;
}> {
  const [reminder24h, reminder1h, followUp] = await Promise.all([
    send24hReminders(),
    send1hReminders(),
    sendFollowUpEmails(),
  ]);

  return { reminder24h, reminder1h, followUp };
}
