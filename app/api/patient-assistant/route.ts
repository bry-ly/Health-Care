import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { getClientIp, withRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

type BookingExtraction = {
  doctorName?: string;
  doctorId?: string;
  specialization?: string;
  date?: string;
  time?: string;
  reason?: string;
  durationMinutes?: number;
};

const MODEL_NAME = process.env.GEMINI_MODEL;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimitKey = `patient-assistant:${session.user.id ?? getClientIp(request)}`;
  const rateLimit = withRateLimit(rateLimitKey, {
    limit: 10,
    windowSeconds: 60,
  });

  if (!rateLimit.success && rateLimit.response) {
    return rateLimit.response;
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set on the server" },
      { status: 500 }
    );
  }

  const { prompt, history } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const sanitizedHistory: Array<{ role: string; content: string }> =
    Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              typeof item.content === "string" &&
              (item.role === "user" || item.role === "assistant")
          )
          .slice(-6)
      : [];

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Support booking intent: when the client requests booking, try structured extraction and creation.
  if (typeof prompt === "string" && prompt.toLowerCase().includes("book")) {
    const bookingResponse = await handleBookingIntent({
      prompt,
      session,
      modelName: MODEL_NAME,
    });

    if (bookingResponse) {
      return bookingResponse;
    }
  }

  // Fallback to a known-available model if the configured one is unsupported.
  const modelName = MODEL_NAME || "gemini-1.5-pro";
  const model = genAI.getGenerativeModel({
    model: modelName,
    tools: [{ googleSearch: {} }],
  });

  const systemPreamble =
    "You are a calm, concise assistant that can share general, educational health information (what a condition is, common symptoms, typical next steps), " +
    "but you must not diagnose, confirm a condition, or prescribe. Always include a brief disclaimer and encourage the user to contact a clinician for personal evaluation. " +
    "You also help with appointments, preparation, aftercare, reminders, and portal features. Keep answers short and practical.";

  const conversation = sanitizedHistory
    .map(
      (item) =>
        `${item.role === "user" ? "Patient" : "Assistant"}: ${item.content}`
    )
    .join("\n");

  const composedPrompt = [
    systemPreamble,
    conversation,
    `Patient: ${prompt}`,
    "Assistant:",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    let result;
    try {
      result = await model.generateContent(composedPrompt);
    } catch (err) {
      // Attempt fallback to a stable model if the requested one is unavailable
      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        tools: [{ googleSearch: {} }],
      });
      result = await fallbackModel.generateContent(composedPrompt);
    }
    const reply = result.response.text();
    const sources =
      result.response.candidates?.[0]?.groundingMetadata?.webSearchSources ||
      [];

    return NextResponse.json({ reply, sources });
  } catch (error) {
    console.error("patient-assistant error", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

async function handleBookingIntent({
  prompt,
  session,
  modelName,
}: {
  prompt: string;
  session: any;
  modelName?: string;
}): Promise<NextResponse | null> {
  try {
    const extractorClient = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY as string
    );
    const extractor = extractorClient.getGenerativeModel({
      model: modelName || "gemini-1.5-pro",
    });
    const extractionPrompt =
      "Extract appointment booking details from the patient message. " +
      "Return ONLY compact JSON with keys: doctorName (string), doctorId (string optional), specialization (string optional), date (YYYY-MM-DD), time (HH:mm 24h), reason (string), durationMinutes (number, default 30). " +
      "If any required field (doctor, date, time) is missing, still return JSON with nulls for missing fields. No prose, no backticks.";

    const extraction = await extractor.generateContent(
      `${extractionPrompt}\nPatient message: ${prompt}\nJSON:`
    );

    const extracted = safeParseJson<BookingExtraction>(
      extraction.response.text()
    );

    if (!extracted) {
      return NextResponse.json(
        {
          reply:
            "I couldn't read the details. Please include doctor name, date (YYYY-MM-DD), and time (HH:mm).",
        },
        { status: 200 }
      );
    }

    const missingFields = [];
    if (!extracted.doctorName && !extracted.doctorId)
      missingFields.push("doctor");
    if (!extracted.date) missingFields.push("date");
    if (!extracted.time) missingFields.push("time");

    if (missingFields.length) {
      return NextResponse.json(
        {
          reply: `I need ${missingFields.join(", ")} to book. Please share doctor name, date (YYYY-MM-DD), and time (HH:mm).`,
        },
        { status: 200 }
      );
    }

    const doctor = await findDoctor(extracted);

    if (!doctor) {
      return NextResponse.json(
        {
          reply:
            "I couldn't find that doctor. Please provide the doctor's name or specialization exactly as shown in your doctor list.",
        },
        { status: 200 }
      );
    }

    const appointmentDate = buildDate(extracted.date!, extracted.time!);
    if (!appointmentDate) {
      return NextResponse.json(
        {
          reply:
            "I couldn't parse the date/time. Please use YYYY-MM-DD for date and HH:mm (24h) for time.",
        },
        { status: 200 }
      );
    }

    const slotTaken = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        appointmentDate: appointmentDate,
        timeSlot: extracted.time,
        status: {
          notIn: ["CANCELLED"],
        },
      },
    });

    if (slotTaken) {
      return NextResponse.json(
        {
          reply: "That time is already booked. Please pick another time slot.",
        },
        { status: 200 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.user.id,
        doctorId: doctor.id,
        appointmentDate,
        timeSlot: extracted.time!,
        reason: extracted.reason || "AI-booked appointment",
        duration: extracted.durationMinutes || 30,
        appointmentType: "CONSULTATION",
        urgencyLevel: "ROUTINE",
        status: "PENDING",
      },
      include: {
        doctor: { include: { user: true } },
        patient: true,
      },
    });

    // Send confirmation notification + email to patient
    const { createNotification } = await import("@/lib/notifications");
    await createNotification({
      userId: session.user.id,
      appointmentId: appointment.id,
      type: "BOOKING_CONFIRMATION",
      title: "Appointment Booked",
      message: `Your appointment has been booked for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.timeSlot}`,
      sendEmail: true,
      emailData: {
        patientName: appointment.patient.name,
        doctorName: appointment.doctor.user.name,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        reason: appointment.reason || undefined,
      },
    });

    return NextResponse.json(
      {
        reply: `Booked with ${appointment.doctor.user.name} on ${appointment.appointmentDate.toDateString()} at ${appointment.timeSlot}. Status: pending confirmation.`,
        appointment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("booking intent error", error);
    return NextResponse.json(
      {
        reply:
          "I couldn't complete the booking. Please check the details and try again.",
      },
      { status: 200 }
    );
  }
}

function safeParseJson<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

async function findDoctor(extracted: BookingExtraction) {
  if (extracted.doctorId) {
    const byId = await prisma.doctor.findUnique({
      where: { id: extracted.doctorId },
      include: { user: true },
    });
    if (byId) return byId;
  }

  if (extracted.doctorName) {
    const byName = await prisma.doctor.findFirst({
      where: {
        user: {
          name: {
            contains: extracted.doctorName,
            mode: "insensitive",
          },
        },
        ...(extracted.specialization
          ? { specialization: extracted.specialization }
          : {}),
      },
      include: { user: true },
    });
    if (byName) return byName;
  }

  if (extracted.specialization) {
    return prisma.doctor.findFirst({
      where: { specialization: extracted.specialization },
      include: { user: true },
    });
  }

  return null;
}

function buildDate(date: string, time: string): Date | null {
  try {
    const [hour, minute] = time.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    const base = new Date(date);
    if (Number.isNaN(base.getTime())) return null;
    base.setHours(hour, minute, 0, 0);
    return base;
  } catch {
    return null;
  }
}
