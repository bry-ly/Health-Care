import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ChevronRight,
  MessagesSquare,
  ShieldCheck,
  Timer,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { TextEffect } from "@/components/ui/text-effect";
import { HeroHeader } from "./header";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

const heroSignals = [
  {
    label: "Avg. reschedule time",
    value: "38s",
    detail: "Self-serve changes without calls",
    icon: Timer,
  },
  {
    label: "Reminders delivered",
    value: "99.2%",
    detail: "24h + 1h before every visit",
    icon: Bell,
  },
  {
    label: "Messages answered",
    value: "Under 15m",
    detail: "Threaded, secure replies from care",
    icon: MessagesSquare,
  },
];

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden contain-strict opacity-70 lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(214,26%,85%,.12)_0,hsla(214,26%,55%,.04)_50%,hsla(214,26%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(214,26%,85%,.08)_0,hsla(214,26%,45%,.03)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(214,26%,85%,.06)_0,hsla(214,26%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-32">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full bg-linear-to-b from-slate-50 via-white to-white [background:radial-gradient(120%_120%_at_10%_20%,rgba(14,165,233,0.09)_0,rgba(14,165,233,0)_60%),radial-gradient(120%_120%_at_90%_0%,rgba(94,234,212,0.12)_0,rgba(94,234,212,0)_55%)]"
            />

            <div className="mx-auto max-w-7xl px-6">
              <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
                <div className="sm:mx-auto sm:text-center lg:mx-0 lg:max-w-3xl lg:text-left">
                  <AnimatedGroup variants={transitionVariants}>
                    <Link
                      href="/dashboard"
                      className="bg-white/70 text-foreground hover:bg-white group mx-auto flex w-fit items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm shadow-md shadow-slate-900/5 transition duration-300 backdrop-blur lg:mx-0"
                    >
                      <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        <ShieldCheck className="size-4 text-emerald-500" />
                        Patient-first platform
                      </span>
                      <span className="h-4 w-px bg-slate-200" />
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        See how the dashboard feels
                        <ChevronRight className="size-4" />
                      </span>
                    </Link>
                  </AnimatedGroup>

                  <TextEffect
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    as="h1"
                    className="mt-8 text-balance text-4xl font-semibold leading-tight md:text-6xl lg:text-6.5xl"
                  >
                    Care that stays on schedule and keeps patients in the loop.
                  </TextEffect>

                  <TextEffect
                    per="line"
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    delay={0.45}
                    as="p"
                    className="mt-6 max-w-2xl text-balance text-lg text-slate-600 sm:mx-auto lg:mx-0"
                  >
                    Real-time scheduling, calming reminders, and secure
                    messaging live together so your next visit is always
                    prepared—no phone tag, no surprises.
                  </TextEffect>

                  <AnimatedGroup
                    variants={{
                      container: {
                        visible: {
                          transition: {
                            staggerChildren: 0.05,
                            delayChildren: 0.75,
                          },
                        },
                      },
                      ...transitionVariants,
                    }}
                    className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
                  >
                    <div className="bg-slate-900 text-white hover:shadow-lg hover:shadow-slate-900/20 rounded-2xl p-[0.35rem] shadow-md shadow-slate-900/10 transition">
                      <Button
                        asChild
                        size="lg"
                        className="rounded-xl px-5 text-base"
                      >
                        <Link href="/signup">
                          <span className="text-nowrap">Get started</span>
                        </Link>
                      </Button>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      variant="ghost"
                      className="h-10.5 rounded-xl px-5"
                    >
                      <Link href="/login">
                        <span className="text-nowrap">Sign in</span>
                      </Link>
                    </Button>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                        <Timer className="size-4" />
                      </span>
                      <span>
                        Hold a slot, reschedule, and get 24h + 1h reminders
                        automatically.
                      </span>
                    </div>
                  </AnimatedGroup>

                  <div className="mt-10 grid gap-3 sm:grid-cols-3">
                    {heroSignals.map((signal) => (
                      <div
                        key={signal.label}
                        className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)] backdrop-blur"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 ring-1 ring-slate-100">
                            <signal.icon className="size-5" />
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              {signal.label}
                            </p>
                            <p className="text-lg font-semibold text-slate-900">
                              {signal.value}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {signal.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.6,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="relative"
                >
                  <div className="mask-b-from-55% relative overflow-hidden rounded-3xl border border-slate-100/80 bg-white/70 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.35)] ring-1 ring-white/60 backdrop-blur-xl">
                    <div
                      className="absolute inset-0 bg-linear-to-tr from-slate-50 via-transparent to-cyan-50"
                      aria-hidden
                    />
                    <div className="relative p-4">
                      <Image
                        className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                        src="/preview/patientdash-dark.png"
                        alt="app screen"
                        width="2700"
                        height="1440"
                      />
                      <Image
                        className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                        src="/preview/patientdash-light.jpg"
                        alt="app screen"
                        width="2700"
                        height="1440"
                      />
                    </div>

                    <div className="absolute left-6 top-6 flex flex-col gap-3">
                      <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-md shadow-slate-900/10 ring-1 ring-slate-100 backdrop-blur">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                          <ChevronRight className="size-4" /> Next visit
                        </div>
                        <div className="mt-1 text-base font-semibold">
                          Today · 3:15 PM
                        </div>
                        <div className="text-sm text-slate-600">
                          Dr. Lee, Family Medicine · Televisit
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs text-white shadow-lg shadow-slate-900/20">
                        <ShieldCheck className="size-4 text-emerald-300" />
                        Secure messaging unlocked
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-md shadow-slate-900/10 ring-1 ring-slate-100 backdrop-blur">
                      <ArrowRight className="size-4 text-slate-500" />
                      Reminders on · arrives 24h + 1h out
                    </div>
                  </div>
                </AnimatedGroup>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
