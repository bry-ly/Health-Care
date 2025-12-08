import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  ClipboardList,
  Stethoscope,
  Bell,
  ShieldCheck,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

export default function ContentSection() {
  return (
    <section className="py-16 md:py-32" id="patient-content">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-10">
          <h2 className="max-w-3xl text-4xl font-medium tracking-tight">
            Take control of your healthcare journey with ease and confidence.
          </h2>

          <BentoGrid>
            {patientItems.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={item.span}
              />
            ))}
          </BentoGrid>

          <div className="flex justify-center mt-8">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="gap-2 pr-2.5"
            >
              <Link href="/signup">
                <span>Get Started Now</span>
                <ChevronRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const patientItems = [
  {
    title: "Dashboard Overview",
    description:
      "Get a complete snapshot of your health status, upcoming appointments, and recent activities.",
    header: (
      <div className="flex h-full min-h-28 w-full items-start justify-between rounded-xl border border-neutral-200/60 bg-linear-to-br from-slate-50 to-slate-100 p-4 shadow-sm dark:border-white/10 dark:from-slate-900 dark:to-slate-800">
        <div className="space-y-2 text-xs text-neutral-700 dark:text-white/85">
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            Dashboard
          </div>
          <ul className="space-y-1">
            <li className="flex items-center justify-between gap-2 rounded-lg bg-white/85 px-3 py-1.5 shadow-sm ring-1 ring-neutral-200/70 backdrop-blur dark:bg-white/10 dark:ring-white/10">
              <span>Upcoming appointments</span>
              <span className="font-semibold">2</span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-1.5 shadow-sm ring-1 ring-neutral-200/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
              <span>Total appointments</span>
              <span className="font-semibold">6</span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg bg-white/75 px-3 py-1.5 shadow-sm ring-1 ring-neutral-200/50 backdrop-blur dark:bg-white/10 dark:ring-white/10">
              <span>Preferred doctors</span>
              <span className="font-semibold">0 saved</span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-1.5 shadow-sm ring-1 ring-neutral-200/40 backdrop-blur dark:bg-white/10 dark:ring-white/10">
              <span>Profile status</span>
              <span className="font-semibold">80% complete</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-end gap-2 text-[11px] text-neutral-700 dark:text-white/80">
          <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm ring-1 ring-neutral-200/70 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            Next: Dr. Patel · 4:30 PM
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-neutral-200/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            Book / manage in dashboard
          </span>
        </div>
      </div>
    ),
    icon: <LayoutDashboard className="h-4 w-4 text-neutral-500" />,
    span: "md:col-span-2",
  },
  {
    title: "Book Appointment",
    description: "Schedule appointments with specialists easily and quickly.",
    header: (
      <div className="flex h-full min-h-28 w-full flex-col justify-between rounded-xl border border-neutral-200/60 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 shadow-sm ring-1 ring-white/40 backdrop-blur dark:border-white/10 dark:from-sky-900 dark:to-indigo-900">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-900 dark:text-sky-100">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />5
          open slots today
        </div>
        <div className="space-y-2 text-xs text-neutral-700 dark:text-white">
          <div className="flex items-center justify-between rounded-lg bg-white/90 px-3 py-2 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            <span>Dr. Patel · 4:30 PM</span>
            <ChevronRight className="h-3 w-3 animate-pulse" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            <span>Dr. Lee · 5:15 PM</span>
            <ChevronRight
              className="h-3 w-3 animate-pulse"
              style={{ animationDelay: "120ms" }}
            />
          </div>
          <ul className="ml-1 space-y-1 text-[11px] text-neutral-600 dark:text-white/80">
            <li>Tomorrow: 3 slots with Dr. Chen</li>
            <li>Friday: evening telehealth available</li>
          </ul>
        </div>
      </div>
    ),
    icon: <Calendar className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Medical Records",
    description: "Securely access your complete medical history and documents.",
    header: (
      <div className="flex h-full min-h-28 w-full flex-col justify-between rounded-xl border border-neutral-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm ring-1 ring-white/50 backdrop-blur dark:border-white/10 dark:from-amber-900 dark:to-orange-900">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-100">
          <span className="flex items-center gap-2">
            <ClipboardList className="h-3 w-3" />
            Recent labs ready
          </span>
          <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold text-amber-900 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:text-white dark:ring-white/10">
            New
          </span>
        </div>
        <div className="space-y-1 text-xs text-neutral-700 dark:text-white/90">
          <div className="h-2.5 w-28 rounded-full bg-neutral-900/30 dark:bg-white/30 animate-pulse" />
          <div
            className="h-2.5 w-32 rounded-full bg-neutral-900/20 dark:bg-white/20 animate-pulse"
            style={{ animationDelay: "120ms" }}
          />
          <div
            className="h-2.5 w-24 rounded-full bg-neutral-900/20 dark:bg-white/20 animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-900/90 dark:text-amber-100/80">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          Normal range
        </div>
        <ul className="text-[11px] text-amber-900/90 dark:text-amber-100/80">
          <li>Next lab: Lipids · Jan 12</li>
          <li>Document: MRI-report.pdf</li>
        </ul>
      </div>
    ),
    icon: <FileText className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Prescriptions",
    description:
      "View your current prescriptions and manage refills effortlessly.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-24 items-center justify-between rounded-xl bg-linear-to-br from-blue-100 to-indigo-100 p-4 shadow-sm ring-1 ring-white/40 backdrop-blur dark:from-blue-900 dark:to-indigo-900">
        <div className="space-y-2 text-xs text-neutral-700 dark:text-white/90">
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 font-semibold shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            <Pill className="h-3 w-3" />
            Atorvastatin · Nightly
          </div>
          <div className="h-2.5 w-32 rounded-full bg-neutral-900/20 dark:bg-white/20 animate-pulse" />
          <div className="h-2.5 w-24 rounded-full bg-neutral-900/10 dark:bg-white/10" />
          <ul className="space-y-1 text-[11px] text-neutral-700 dark:text-white/80">
            <li>Metformin · Morning</li>
            <li>Vitamin D3 · Weekly</li>
          </ul>
        </div>
        <div className="flex flex-col items-end gap-2 text-[11px] text-neutral-700 dark:text-white/80">
          <span className="rounded-lg bg-white/90 px-3 py-1 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            Refill in 5 days
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10 animate-pulse">
            Reminder on
          </span>
        </div>
      </div>
    ),
    icon: <Pill className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Test Results",
    description: "Access your lab results and diagnostic reports instantly.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-24 items-center justify-between rounded-xl bg-linear-to-br from-green-100 to-emerald-100 p-4 shadow-sm ring-1 ring-white/40 backdrop-blur dark:from-green-900 dark:to-emerald-900">
        <div className="space-y-2 text-xs text-neutral-800 dark:text-white/90">
          <div className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 font-semibold shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            CBC Panel · Today
          </div>
          <div className="h-2.5 w-28 rounded-full bg-neutral-900/20 dark:bg-white/20 animate-pulse" />
          <div className="h-2.5 w-20 rounded-full bg-neutral-900/10 dark:bg-white/10" />
          <ul className="space-y-1 text-[11px] text-neutral-800/80 dark:text-white/80">
            <li>Hemoglobin: 13.8 g/dL</li>
            <li>Platelets: 240k /µL</li>
          </ul>
        </div>
        <div className="flex flex-col items-end gap-2 text-[11px] text-emerald-900 dark:text-emerald-100">
          <span className="rounded-lg bg-white/90 px-3 py-1 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            All in range
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10 animate-pulse">
            Signed by Dr. Lee
          </span>
        </div>
      </div>
    ),
    icon: <ClipboardList className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Find Doctors",
    description: "Browse and connect with top healthcare professionals.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-24 items-center justify-between rounded-xl bg-linear-to-br from-orange-100 to-rose-100 p-4 shadow-sm ring-1 ring-white/40 backdrop-blur dark:from-orange-900 dark:to-rose-900">
        <div className="space-y-2 text-xs text-neutral-800 dark:text-white/90">
          <div className="rounded-full bg-white/85 px-3 py-1.5 font-semibold shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            Near you · Cardiology
          </div>
          <div className="h-2.5 w-32 rounded-full bg-neutral-900/20 dark:bg-white/20 animate-pulse" />
          <div className="h-2.5 w-20 rounded-full bg-neutral-900/10 dark:bg-white/10" />
          <ul className="space-y-1 text-[11px] text-neutral-700 dark:text-white/80">
            <li>Dr. Singh · 0.8 mi</li>
            <li>Dr. Alvarez · 1.2 mi</li>
          </ul>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-neutral-700 dark:text-white/80">
          <span className="rounded-lg bg-white/90 px-3 py-1 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            12 providers
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10 animate-pulse">
            3 new
          </span>
        </div>
      </div>
    ),
    icon: <Stethoscope className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Notifications",
    description: "Stay updated with important health alerts and reminders.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-24 items-center justify-between rounded-xl bg-linear-to-br from-purple-100 to-violet-100 p-4 shadow-sm ring-1 ring-white/40 backdrop-blur dark:from-purple-900 dark:to-violet-900">
        <div className="space-y-2 text-xs text-neutral-800 dark:text-white/90">
          <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 font-semibold shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            <Bell className="h-3 w-3" />
            Reminders scheduled
          </div>
          <div className="h-2.5 w-32 rounded-full bg-neutral-900/20 dark:bg-white/20 animate-pulse" />
          <div className="h-2.5 w-24 rounded-full bg-neutral-900/10 dark:bg-white/10" />
          <ul className="space-y-1 text-[11px] text-neutral-700 dark:text-white/80">
            <li>24h: Dr. Patel visit · ON</li>
            <li>1h: Medication reminder · ON</li>
          </ul>
        </div>
        <div className="flex flex-col items-end gap-2 text-[11px] text-neutral-700 dark:text-white/80">
          <span className="rounded-lg bg-white/90 px-3 py-1 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            24h reminder · ON
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-white/60 backdrop-blur dark:bg-white/10 dark:ring-white/10 animate-pulse">
            1h reminder · ON
          </span>
        </div>
      </div>
    ),
    icon: <Bell className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Secure Messaging",
    description: "Chat with your care team for follow-ups and clarifications.",
    header: (
      <div className="relative flex h-full min-h-28 w-full items-start gap-3 overflow-hidden rounded-xl border border-neutral-200/60 bg-gradient-to-br from-slate-50/85 to-white p-4 shadow-sm dark:border-white/10 dark:from-slate-900 dark:to-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/85 text-xs font-semibold text-white shadow-sm">
          RN
        </div>
        <div className="flex flex-1 flex-col gap-2 text-xs text-neutral-700 dark:text-white/90">
          <div className="w-fit max-w-[82%] rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-neutral-200/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            Your lab results look good. Keep hydrated!
          </div>
          <div className="w-fit max-w-[76%] rounded-lg bg-white/85 px-3 py-2 shadow-sm ring-1 ring-neutral-200/50 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            Thanks! Any next steps?
          </div>
          <div className="ml-1 flex w-fit items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 shadow-sm ring-1 ring-neutral-200/60 backdrop-blur dark:bg-white/10 dark:ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce" />
            <span
              className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce"
              style={{ animationDelay: "120ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce"
              style={{ animationDelay: "240ms" }}
            />
          </div>
        </div>
      </div>
    ),
    icon: <MessageCircle className="h-4 w-4 text-neutral-500" />,
  },
];
