import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, parse, isAfter, isBefore, addMinutes, setHours, setMinutes } from "date-fns";

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

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Get doctor's availability for this day
    const doctorAvailability = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!doctorAvailability) {
      return NextResponse.json(
        { availableSlots: [], message: "Doctor is not available on this day" },
        { status: 200 }
      );
    }

    // Get existing appointments for this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
          lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
        },
        status: {
          notIn: ["CANCELLED"],
        },
      },
    });

    // Parse working hours
    const [startHour, startMin] = doctorAvailability.startTime.split(":").map(Number);
    const [endHour, endMin] = doctorAvailability.endTime.split(":").map(Number);
    
    const breakStart = doctorAvailability.breakStart
      ? doctorAvailability.breakStart.split(":").map(Number)
      : null;
    const breakEnd = doctorAvailability.breakEnd
      ? doctorAvailability.breakEnd.split(":").map(Number)
      : null;

    // Generate time slots (30-minute intervals by default)
    const slotDuration = 30; // minutes
    const availableSlots: string[] = [];
    
    let currentTime = setMinutes(setHours(appointmentDate, startHour), startMin);
    const endTime = setMinutes(setHours(appointmentDate, endHour), endMin);

    while (isBefore(currentTime, endTime)) {
      const nextSlot = addMinutes(currentTime, slotDuration);
      
      // Check if current slot is within break time
      const isInBreak = breakStart && breakEnd && 
        isAfter(currentTime, setMinutes(setHours(appointmentDate, breakStart[0]), breakStart[1])) &&
        isBefore(nextSlot, setMinutes(setHours(appointmentDate, breakEnd[0]), breakEnd[1]));

      if (!isInBreak) {
        // Check if slot conflicts with existing appointments
        const slotTimeStr = format(currentTime, "HH:mm");
        const conflicts = existingAppointments.some((apt) => {
          const aptTime = parse(apt.timeSlot, "HH:mm", new Date());
          const aptEnd = addMinutes(aptTime, apt.duration);
          return (
            (isAfter(currentTime, aptTime) && isBefore(currentTime, aptEnd)) ||
            (isAfter(nextSlot, aptTime) && isBefore(nextSlot, aptEnd)) ||
            (isBefore(currentTime, aptTime) && isAfter(nextSlot, aptEnd))
          );
        });

        if (!conflicts) {
          availableSlots.push(slotTimeStr);
        }
      }

      currentTime = nextSlot;
    }

    return NextResponse.json(
      { availableSlots, workingHours: { start: doctorAvailability.startTime, end: doctorAvailability.endTime } },
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



