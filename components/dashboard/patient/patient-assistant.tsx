"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ShimmerText from "@/components/ui/shimmer-text";
import { Loader2, Send, ShieldCheck, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type PatientAssistantProps = {
  compact?: boolean;
};

export function PatientAssistant({ compact = false }: PatientAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I can help you prep for visits, understand reminders, and use this portal. I cannot diagnose—reach out to your doctor for clinical questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const lastThree = useMemo(() => messages.slice(-6), [messages]);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/patient-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          history: lastThree,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || "I had trouble replying—please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for newline
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card
      className={cn(
        compact ? "border-none bg-transparent p-0 shadow-none" : "h-full"
      )}
    >
      <CardHeader className={cn(compact ? "px-0 pt-0 pb-3" : undefined)}>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
          <ShieldCheck className="size-4" />
          Patient assistant
        </div>
        <CardTitle className={cn(compact ? "text-lg" : "text-xl")}>
          Need help with your visit?
        </CardTitle>
        <CardDescription className={cn(compact ? "text-xs" : undefined)}>
          Ask about scheduling, preparation, reminders, or general health info.
          No diagnosis or treatment. Always check with your clinician.
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(compact ? "space-y-3 px-0 pb-0" : "space-y-4")}
      >
        <div
          className={cn(
            "space-y-3 overflow-y-auto rounded-lg border bg-muted/40 p-3 text-sm",
            compact ? "h-48" : "h-56"
          )}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "assistant" ? "justify-start" : "justify-end"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 shadow-sm",
                  message.role === "assistant"
                    ? "bg-white text-slate-800 ring-1 ring-slate-200"
                    : "bg-emerald-600 text-white"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start gap-2">
              <div className="max-w-[85%] rounded-2xl bg-white px-3 py-2 text-slate-800 shadow-sm ring-1 ring-slate-200">
                <ShimmerText
                  text="Thinking…"
                  typewriter
                  speedMsPerChar={32}
                  startDelayMs={0}
                  className="text-sm"
                  wrapperClassName="p-0 justify-start"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your visit prep, reminders, or portal… (Enter to send, Shift+Enter for newline)"
            className="min-h-24"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1">
              <Sparkles className="size-4" />
              Gets context from your last few messages only.
            </div>
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" />
                  Thinking…
                </>
              ) : (
                <>
                  <Send className="mr-1 size-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
