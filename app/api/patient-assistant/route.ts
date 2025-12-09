import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";

const MODEL_NAME = "gemini-2.5-flash";

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
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const systemPreamble =
    "You are a calm, concise assistant that helps patients understand appointments, preparation, aftercare, and portal features. " +
    "Avoid medical diagnosis or prescribing. Encourage contacting their doctor for clinical concerns. Keep answers short and actionable.";

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
    const result = await model.generateContent(composedPrompt);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("patient-assistant error", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
