import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET all appointments for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const statusParam = searchParams.get("status");

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let appointments;
    const status = statusParam as AppointmentStatus | undefined;

    // Admin can see all appointments
    if (session.user.role === "ADMIN" || role === "admin") {
      appointments = await prisma.appointment.findMany({
        where: {
          ...(status && { status }),
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          appointmentDate: "asc",
        },
      });
    } else if (role === "doctor" || session.user.role === "DOCTOR") {
      // Fetch appointments for doctor
      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      const doctor = await prisma.doctor.findUnique({
        where: { userId },
      });

      // If doctor profile doesn't exist, return empty array instead of 404
      if (!doctor) {
        return NextResponse.json({ appointments: [] }, { status: 200 });
      }

      appointments = await prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
          ...(status && { status }),
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          appointmentDate: "asc",
        },
      });
    } else {
      // Fetch appointments for patient
      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      appointments = await prisma.appointment.findMany({
        where: {
          patientId: userId,
          ...(status && { status }),
        },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          appointmentDate: "asc",
        },
      });
    }

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST create a new appointment
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      reason,
      duration,
    } = body;

    // Validate required fields
    if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Role-based validation and authorization
    if (session.user.role === "PATIENT") {
      // Patients can only book appointments for themselves
      if (patientId !== session.user.id) {
        return NextResponse.json(
          { error: "Patients can only book appointments for themselves" },
          { status: 403 }
        );
      }
    } else if (session.user.role === "DOCTOR") {
      // Doctors can only create appointments for themselves as the doctor
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user.id },
      });

      if (!doctor) {
        return NextResponse.json(
          { error: "Doctor profile not found" },
          { status: 404 }
        );
      }

      if (doctor.id !== doctorId) {
        return NextResponse.json(
          { error: "Doctors can only create appointments for themselves" },
          { status: 403 }
        );
      }
    }
    // ADMIN can create appointments for anyone

    // Check if time slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        status: {
          notIn: ["CANCELLED"],
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "Time slot is not available" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        reason,
        duration: duration || 30,
        status: "PENDING",
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: true,
      },
    });

    // Create notification with email
    const { createNotification } = await import("@/lib/notifications");
    await createNotification({
      userId: patientId,
      appointmentId: appointment.id,
      type: "BOOKING_CONFIRMATION",
      title: "Appointment Booked",
      message: `Your appointment has been booked for ${new Date(
        appointmentDate
      ).toLocaleDateString()} at ${timeSlot}`,
      sendEmail: true,
      emailData: {
        patientName: appointment.patient.name,
        doctorName: appointment.doctor.user.name,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        reason: reason || undefined,
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

// PATCH update an appointment (reschedule/cancel/accept/reject)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { appointmentId, status: statusParam, appointmentDate, timeSlot, cancelReason } =
      body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Get the appointment first to check authorization
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: true,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Authorization check: Doctors can only update appointments where they are the assigned doctor
    if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user.id },
      });

      if (!doctor || doctor.id !== existingAppointment.doctorId) {
        return NextResponse.json(
          { error: "Forbidden. You can only manage appointments where you are the assigned doctor." },
          { status: 403 }
        );
      }
    } else if (session.user.role === "PATIENT") {
      // Patients can only update their own appointments
      if (existingAppointment.patientId !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden. You can only manage your own appointments." },
          { status: 403 }
        );
      }
    }
    // ADMIN can update any appointment

    const updateData: {
      status?: AppointmentStatus;
      appointmentDate?: Date;
      timeSlot?: string;
      cancelReason?: string;
    } = {};

    if (statusParam) updateData.status = statusParam as AppointmentStatus;
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (timeSlot) updateData.timeSlot = timeSlot;
    if (cancelReason) updateData.cancelReason = cancelReason;

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: true,
      },
    });

    // Create notification based on action
    const { createNotification } = await import("@/lib/notifications");
    const oldDate = appointment.appointmentDate;
    const oldTimeSlot = appointment.timeSlot;

    if (statusParam === "CANCELLED") {
      await createNotification({
        userId: appointment.patientId,
        appointmentId: appointment.id,
        type: "CANCELLATION",
        title: "Appointment Cancelled",
        message: `Your appointment has been cancelled. Reason: ${cancelReason || "N/A"}`,
        sendEmail: true,
        emailData: {
          patientName: appointment.patient.name,
          doctorName: appointment.doctor.user.name,
          appointmentDate: oldDate,
          timeSlot: oldTimeSlot,
          cancelReason: cancelReason || undefined,
        },
      });
    } else if (statusParam === "CONFIRMED") {
      await createNotification({
        userId: appointment.patientId,
        appointmentId: appointment.id,
        type: "BOOKING_CONFIRMATION",
        title: "Appointment Confirmed",
        message: `Your appointment has been confirmed for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.timeSlot}`,
        sendEmail: true,
        emailData: {
          patientName: appointment.patient.name,
          doctorName: appointment.doctor.user.name,
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
          reason: appointment.reason || undefined,
        },
      });
    } else if (appointmentDate || timeSlot) {
      await createNotification({
        userId: appointment.patientId,
        appointmentId: appointment.id,
        type: "RESCHEDULE",
        title: "Appointment Rescheduled",
        message: `Your appointment has been rescheduled to ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.timeSlot}`,
        sendEmail: true,
        emailData: {
          patientName: appointment.patient.name,
          doctorName: appointment.doctor.user.name,
          oldDate,
          oldTimeSlot,
          newDate: appointment.appointmentDate,
          newTimeSlot: appointment.timeSlot,
        },
      });
    }

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE an appointment
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Get the appointment first to check authorization
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: true,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Authorization check
    if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user.id },
      });

      if (!doctor || doctor.id !== existingAppointment.doctorId) {
        return NextResponse.json(
          { error: "Forbidden. You can only delete appointments where you are the assigned doctor." },
          { status: 403 }
        );
      }
    } else if (session.user.role === "PATIENT") {
      // Patients can only delete their own appointments
      if (existingAppointment.patientId !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden. You can only delete your own appointments." },
          { status: 403 }
        );
      }
    }
    // ADMIN can delete any appointment

    // Delete the appointment
    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    // Create notification for the other party
    const { createNotification } = await import("@/lib/notifications");
    const notifyUserId = session.user.role === "PATIENT" 
      ? existingAppointment.doctor.userId 
      : existingAppointment.patientId;

    await createNotification({
      userId: notifyUserId,
      type: "CANCELLATION",
      title: "Appointment Deleted",
      message: `An appointment scheduled for ${existingAppointment.appointmentDate.toLocaleDateString()} at ${existingAppointment.timeSlot} has been deleted.`,
      sendEmail: true,
      emailData: {
        patientName: existingAppointment.patient.name,
        doctorName: existingAppointment.doctor.user.name,
        appointmentDate: existingAppointment.appointmentDate,
        timeSlot: existingAppointment.timeSlot,
      },
    });

    return NextResponse.json(
      { message: "Appointment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
