import React from "react";
import { render } from "@react-email/components";
import { AppointmentConfirmationEmail } from "@/components/emails/appointment-confirmation";
import { AppointmentReminderEmail } from "@/components/emails/appointment-reminder";
import { AppointmentCancellationEmail } from "@/components/emails/appointment-cancellation";
import { AppointmentRescheduleEmail } from "@/components/emails/appointment-reschedule";

export async function appointmentConfirmationEmail(data: {
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  timeSlot: string;
  reason?: string;
}) {
  const html = await render(
    <AppointmentConfirmationEmail
      patientName={data.patientName}
      doctorName={data.doctorName}
      appointmentDate={data.appointmentDate}
      timeSlot={data.timeSlot}
      reason={data.reason}
    />
  );
  return html;
}

export async function appointmentReminderEmail(data: {
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  timeSlot: string;
}) {
  const html = await render(
    <AppointmentReminderEmail
      patientName={data.patientName}
      doctorName={data.doctorName}
      appointmentDate={data.appointmentDate}
      timeSlot={data.timeSlot}
    />
  );
  return html;
}

export async function appointmentCancellationEmail(data: {
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  timeSlot: string;
  cancelReason?: string;
}) {
  const html = await render(
    <AppointmentCancellationEmail
      patientName={data.patientName}
      doctorName={data.doctorName}
      appointmentDate={data.appointmentDate}
      timeSlot={data.timeSlot}
      cancelReason={data.cancelReason}
    />
  );
  return html;
}

export async function appointmentRescheduleEmail(data: {
  patientName: string;
  doctorName: string;
  oldDate: Date;
  oldTimeSlot: string;
  newDate: Date;
  newTimeSlot: string;
}) {
  const html = await render(
    <AppointmentRescheduleEmail
      patientName={data.patientName}
      doctorName={data.doctorName}
      oldDate={data.oldDate}
      oldTimeSlot={data.oldTimeSlot}
      newDate={data.newDate}
      newTimeSlot={data.newTimeSlot}
    />
  );
  return html;
}



