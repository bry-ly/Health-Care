import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { getClientIp, withRateLimit } from "@/lib/rate-limit";

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

  // Fallback to a known-available model if the configured one is unsupported.
  const modelName = MODEL_NAME;
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
