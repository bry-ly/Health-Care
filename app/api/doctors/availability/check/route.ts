import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  format,
  parse,
  isAfter,
  isBefore,
  addMinutes,
  setHours,
  setMinutes,
} from "date-fns";

// GET available time slots for a doctor on a specific date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: "Doctor ID and date are required" },
        { status: 400 }
      );
    }

    // Parse date string (format: YYYY-MM-DD)
    const [year, month, day] = date.split("-").map(Number);
    const appointmentDate = new Date(year, month - 1, day);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Get ALL doctor's availability records for this day (supports multiple time slots)
    const doctorAvailabilities = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    if (!doctorAvailabilities || doctorAvailabilities.length === 0) {
      return NextResponse.json(
        {
          availableSlots: [],
          message:
            "Doctor has not set availability for this day. Please contact the doctor or check back later.",
        },
        { status: 200 }
      );
    }

    // Create date boundaries for the appointment date
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing appointments for this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELLED"],
        },
      },
    });

    // Generate time slots from ALL availability periods
    const slotDuration = 30; // minutes
    const availableSlots: string[] = [];
    const workingPeriods: { start: string; end: string }[] = [];

    for (const doctorAvailability of doctorAvailabilities) {
      // Parse working hours for this slot
      const [startHour, startMin] = doctorAvailability.startTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = doctorAvailability.endTime
        .split(":")
        .map(Number);

      workingPeriods.push({
        start: doctorAvailability.startTime,
        end: doctorAvailability.endTime,
      });

      let currentTime = setMinutes(
        setHours(appointmentDate, startHour),
        startMin
      );
      const endTime = setMinutes(setHours(appointmentDate, endHour), endMin);

      while (isBefore(currentTime, endTime)) {
        const nextSlot = addMinutes(currentTime, slotDuration);

        // Make sure the full appointment fits within the working period
        if (isAfter(nextSlot, endTime)) {
          break;
        }

        // Check if slot conflicts with existing appointments
        const slotTimeStr = format(currentTime, "HH:mm");
        const conflicts = existingAppointments.some((apt) => {
          const aptTime = parse(apt.timeSlot, "HH:mm", new Date());
          const aptEnd = addMinutes(aptTime, apt.duration);
          return (
            (isAfter(currentTime, aptTime) && isBefore(currentTime, aptEnd)) ||
            (isAfter(nextSlot, aptTime) && isBefore(nextSlot, aptEnd)) ||
            (isBefore(currentTime, aptTime) && isAfter(nextSlot, aptEnd)) ||
            format(currentTime, "HH:mm") === apt.timeSlot
          );
        });

        if (!conflicts) {
          // Avoid duplicates (in case time slots overlap)
          if (!availableSlots.includes(slotTimeStr)) {
            availableSlots.push(slotTimeStr);
          }
        }

        currentTime = nextSlot;
      }
    }

    // Sort slots chronologically
    availableSlots.sort();

    return NextResponse.json(
      {
        availableSlots,
        workingHours: workingPeriods,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
