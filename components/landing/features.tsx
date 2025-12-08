import {
  Bell,
  Calendar,
  FileText,
  Lock,
  MessagesSquare,
  Sparkles,
  Stethoscope,
  Timer,
} from "lucide-react";

const features = [
  {
    title: "Instant scheduling",
    description:
      "Open slots update in real-time so you can lock in visits without back-and-forth calls.",
    icon: Calendar,
    accent: "from-emerald-400/70 to-cyan-400/70",
    details: ["Hold & confirm in one tap", "Keeps preferred doctors on top"],
  },
  {
    title: "Visit prep & follow-ups",
    description:
      "Clear pre-visit steps, files, and reminders to show up ready and leave with next steps.",
    icon: Sparkles,
    accent: "from-amber-300/70 to-orange-400/70",
    details: ["Reminders 24h and 1h out", "Auto-track labs and tasks"],
  },
  {
    title: "Secure messaging",
    description:
      "Reach your care team with threaded messages, attachments, and gentle nudges to reply.",
    icon: MessagesSquare,
    accent: "from-sky-300/70 to-indigo-400/70",
    details: [
      "Typing indicators & read receipts",
      "Share photos or PDF orders",
    ],
  },
  {
    title: "Records in one place",
    description:
      "Test results, visit summaries, allergies, and meds stay organized with quick export.",
    icon: FileText,
    accent: "from-lime-300/70 to-emerald-400/70",
    details: [
      "Download summary in 2 clicks",
      "Share securely with new providers",
    ],
  },
  {
    title: "Doctor discovery",
    description:
      "Find specialists with rich profiles, availability, and insurance fit before you book.",
    icon: Stethoscope,
    accent: "from-fuchsia-300/70 to-purple-400/70",
    details: [
      "Filters by specialty and location",
      "Save favorites for quick rebooking",
    ],
  },
  {
    title: "Privacy-first by design",
    description:
      "Data is encrypted in transit and at rest with tight audit trails for every access.",
    icon: Lock,
    accent: "from-slate-300/70 to-slate-500/70",
    details: ["SOC2-ready controls", "Granular notification preferences"],
  },
];

const signals = [
  { label: "Avg. reschedule time", value: "38s" },
  { label: "On-time reminders sent", value: "99.2%" },
  { label: "Messages answered", value: "Under 15m" },
];

export default function Features() {
  return (
    <section className="relative overflow-hidden py-14 md:py-24" id="features">
      <div
        className="absolute inset-0 -z-10 bg-linear-to-b from-slate-50 via-white to-white"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl space-y-12 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-3xl space-y-4 text-center md:space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Patient-first
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Realtime
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Secure
            </span>
          </div>
          <h2 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
            Everything you need to run care smoothly
          </h2>
          <p className="text-lg text-slate-600 md:text-xl">
            Scheduling, follow-ups, records, and messaging live in one calm
            place so patients and care teams stay in sync without extra calls.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)]"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${feature.accent}`}
                aria-hidden
              />
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-900 ring-1 ring-slate-100">
                  <feature.icon className="size-5" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {feature.details.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-slate-300"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white/70 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur md:grid-cols-3">
          {signals.map((signal) => (
            <div
              key={signal.label}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
            >
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Timer className="size-4" />
                {signal.label}
              </div>
              <span className="text-base font-semibold text-slate-900">
                {signal.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 md:text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-white">
            <Bell className="size-4" />
            Smart reminders keep everyone on time
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
            <Timer className="size-4" />
            Reschedules happen in seconds, not calls
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
            <MessagesSquare className="size-4" />
            Secure messaging stays threaded and private
          </span>
        </div>
      </div>
    </section>
  );
}
