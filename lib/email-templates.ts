import { format } from "date-fns";

export function appointmentConfirmationEmail(data: {
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  timeSlot: string;
  reason?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Appointment Confirmed</h2>
          <p>Dear ${data.patientName},</p>
          <p>Your appointment has been successfully booked.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Doctor:</strong> ${data.doctorName}</p>
            <p><strong>Date:</strong> ${format(data.appointmentDate, "EEEE, MMMM d, yyyy")}</p>
            <p><strong>Time:</strong> ${data.timeSlot}</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
          </div>
          <p>Please arrive 10 minutes before your scheduled appointment time.</p>
          <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
          <p>Best regards,<br>Healthcare Appointment System</p>
        </div>
      </body>
    </html>
  `;
}

export function appointmentReminderEmail(data: {
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  timeSlot: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Appointment Reminder</h2>
          <p>Dear ${data.patientName},</p>
          <p>This is a reminder that you have an upcoming appointment.</p>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Doctor:</strong> ${data.doctorName}</p>
            <p><strong>Date:</strong> ${format(data.appointmentDate, "EEEE, MMMM d, yyyy")}</p>
            <p><strong>Time:</strong> ${data.timeSlot}</p>
          </div>
          <p>Please arrive 10 minutes before your scheduled appointment time.</p>
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          <p>Best regards,<br>Healthcare Appointment System</p>
        </div>
      </body>
    </html>
  `;
}

export function appointmentCancellationEmail(data: {
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  timeSlot: string;
  cancelReason?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Cancelled</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Dear ${data.patientName},</p>
          <p>Your appointment has been cancelled.</p>
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Doctor:</strong> ${data.doctorName}</p>
            <p><strong>Date:</strong> ${format(data.appointmentDate, "EEEE, MMMM d, yyyy")}</p>
            <p><strong>Time:</strong> ${data.timeSlot}</p>
            ${data.cancelReason ? `<p><strong>Reason:</strong> ${data.cancelReason}</p>` : ""}
          </div>
          <p>If you would like to book a new appointment, please visit our booking system.</p>
          <p>Best regards,<br>Healthcare Appointment System</p>
        </div>
      </body>
    </html>
  `;
}

export function appointmentRescheduleEmail(data: {
  patientName: string;
  doctorName: string;
  oldDate: Date;
  oldTimeSlot: string;
  newDate: Date;
  newTimeSlot: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Rescheduled</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Appointment Rescheduled</h2>
          <p>Dear ${data.patientName},</p>
          <p>Your appointment has been rescheduled.</p>
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p><strong>Doctor:</strong> ${data.doctorName}</p>
            <p><strong>Previous:</strong> ${format(data.oldDate, "EEEE, MMMM d, yyyy")} at ${data.oldTimeSlot}</p>
            <p><strong>New Date:</strong> ${format(data.newDate, "EEEE, MMMM d, yyyy")}</p>
            <p><strong>New Time:</strong> ${data.newTimeSlot}</p>
          </div>
          <p>Please arrive 10 minutes before your scheduled appointment time.</p>
          <p>Best regards,<br>Healthcare Appointment System</p>
        </div>
      </body>
    </html>
  `;
}



