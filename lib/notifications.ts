import { prisma } from "@/lib/prisma";
import { sendEmail } from "./email";
import {
  appointmentConfirmationEmail,
  appointmentReminderEmail,
  appointmentCancellationEmail,
  appointmentRescheduleEmail,
} from "./email-templates";
import { NotificationType } from "@prisma/client";

export interface CreateNotificationOptions {
  userId: string;
  appointmentId?: string;
  type: NotificationType;
  title: string;
  message: string;
  sendEmail?: boolean;
  emailData?: {
    patientName: string;
    doctorName: string;
    appointmentDate?: Date;
    timeSlot?: string;
    reason?: string;
    cancelReason?: string;
    oldDate?: Date;
    oldTimeSlot?: string;
    newDate?: Date;
    newTimeSlot?: string;
  };
}

export async function createNotification(options: CreateNotificationOptions) {
  try {
    const { userId, appointmentId, type, title, message, sendEmail: shouldSendEmail, emailData } = options;

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        appointmentId: appointmentId || null,
        type,
        title,
        message,
        emailSent: false,
      },
    });

    // Send email if requested and email data is provided
    if (shouldSendEmail && emailData) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        let emailHtml = "";
        const emailSubject = title;

        switch (type) {
          case "BOOKING_CONFIRMATION":
          case "NEW_BOOKING":
            if (emailData.appointmentDate && emailData.timeSlot) {
              emailHtml = appointmentConfirmationEmail({
                patientName: emailData.patientName,
                doctorName: emailData.doctorName,
                appointmentDate: emailData.appointmentDate,
                timeSlot: emailData.timeSlot,
                reason: emailData.reason,
              });
            }
            break;
          case "APPOINTMENT_REMINDER":
            if (emailData.appointmentDate && emailData.timeSlot) {
              emailHtml = appointmentReminderEmail({
                patientName: emailData.patientName,
                doctorName: emailData.doctorName,
                appointmentDate: emailData.appointmentDate,
                timeSlot: emailData.timeSlot,
              });
            }
            break;
          case "CANCELLATION":
            if (emailData.appointmentDate && emailData.timeSlot) {
              emailHtml = appointmentCancellationEmail({
                patientName: emailData.patientName,
                doctorName: emailData.doctorName,
                appointmentDate: emailData.appointmentDate,
                timeSlot: emailData.timeSlot,
                cancelReason: emailData.cancelReason,
              });
            }
            break;
          case "RESCHEDULE":
            if (emailData.oldDate && emailData.oldTimeSlot && emailData.newDate && emailData.newTimeSlot) {
              emailHtml = appointmentRescheduleEmail({
                patientName: emailData.patientName,
                doctorName: emailData.doctorName,
                oldDate: emailData.oldDate,
                oldTimeSlot: emailData.oldTimeSlot,
                newDate: emailData.newDate,
                newTimeSlot: emailData.newTimeSlot,
              });
            }
            break;
        }

        if (emailHtml) {
          const emailResult = await sendEmail({
            to: user.email,
            subject: emailSubject,
            html: emailHtml,
          });

          if (emailResult.success) {
            await prisma.notification.update({
              where: { id: notification.id },
              data: { emailSent: true },
            });
          }
        }
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

