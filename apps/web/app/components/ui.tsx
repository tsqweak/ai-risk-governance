import clsx from "clsx";
import Link from "next/link";
import { Activity, Bot, BookOpen, BrainCircuit, BriefcaseBusiness, ClipboardCheck, Database, FileSearch, Flame, Gauge, GitBranch, Landmark, Library, Map, Radar, ShieldCheck, UserPlus, Users } from "lucide-react";
import { humanize } from "./format";

export function RiskBadge({ level }: { level: string }) {
  const tone = {
    LOW: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-900 ring-amber-200",
    HIGH: "bg-orange-50 text-orange-900 ring-orange-200",
    CRITICAL: "bg-red-50 text-red-900 ring-red-200"
  }[level] ?? "bg-slate-50 text-slate-800 ring-slate-200";

  return <span className={clsx("rounded px-2.5 py-1 text-xs font-semibold ring-1", tone)}>{humanize(level)}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone = {
    ON_TRACK: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    REVIEWED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    COLLECTED: "bg-sky-50 text-sky-800 ring-sky-200",
    REQUESTED: "bg-amber-50 text-amber-900 ring-amber-200",
    NEEDS_ATTENTION: "bg-amber-50 text-amber-900 ring-amber-200",
    NOT_STARTED: "bg-slate-100 text-slate-700 ring-slate-200",
    COVERED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    OPEN_GAP: "bg-red-50 text-red-900 ring-red-200",
    BLOCKED: "bg-red-50 text-red-900 ring-red-200",
    EXPIRED: "bg-red-50 text-red-900 ring-red-200",
    PASS: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    WARNING: "bg-amber-50 text-amber-900 ring-amber-200",
    FAIL: "bg-red-50 text-red-900 ring-red-200",
    OPEN: "bg-red-50 text-red-900 ring-red-200",
    IN_PROGRESS: "bg-amber-50 text-amber-900 ring-amber-200",
    ACCEPTED: "bg-sky-50 text-sky-800 ring-sky-200",
    REMEDIATED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 ring-slate-200",
    CRITICAL: "bg-red-50 text-red-900 ring-red-200",
    HIGH: "bg-orange-50 text-orange-900 ring-orange-200",
    MEDIUM: "bg-amber-50 text-amber-900 ring-amber-200",
    LOW: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    INFORMATIONAL: "bg-slate-100 text-slate-700 ring-slate-200",
    DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
    SUBMITTED: "bg-sky-50 text-sky-800 ring-sky-200",
    APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    REJECTED: "bg-red-50 text-red-900 ring-red-200",
    ARCHIVED: "bg-slate-100 text-slate-700 ring-slate-200",
    CURRENT: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    EXPIRING_SOON: "bg-amber-50 text-amber-900 ring-amber-200",
    MISSING: "bg-red-50 text-red-900 ring-red-200",
    VALID: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    INVALID: "bg-red-50 text-red-900 ring-red-200"
  }[status] ?? "bg-slate-50 text-slate-800 ring-slate-200";

  return <span className={clsx("rounded px-2 py-1 text-xs font-medium ring-1", tone)}>{humanize(status)}</span>;
}

export function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Activity }) {
  return (
    <div className="border-y border-line bg-white px-5 py-4 sm:border sm:first:rounded-l-md sm:last:rounded-r-md">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Icon className="h-4 w-4 text-brand" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function LearningPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="rounded-md border border-teal-200 bg-teal-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-teal-900">
        <BookOpen className="h-4 w-4" />
        {title}
      </div>
      <div className="mt-2 text-sm leading-6 text-teal-950">{children}</div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const nav = [
    ["/executive", "Executive", BriefcaseBusiness],
    ["/portfolio", "Portfolio", Gauge],
    ["/ai-governance", "AI Governance", BrainCircuit],
    ["/agentic-governance", "Agentic Governance", Bot],
    ["/", "AI Systems", Database],
    ["/systems/travel-brain", "Travel Brain", Gauge],
    ["/onboarding", "Onboarding", UserPlus],
    ["/controls", "Controls", Library],
    ["/regulatory", "Regulatory", Map],
    ["/regulatory-coverage", "Coverage", Landmark],
    ["/traceability", "Traceability", GitBranch],
    ["/monitoring", "Monitoring", Radar],
    ["/control-health", "Control Health", ShieldCheck],
    ["/findings", "Findings", FileSearch],
    ["/exceptions", "Exceptions", ClipboardCheck],
    ["/risk-heatmap", "Risk Heatmap", Flame],
    ["/governance-committee", "Committee", Users],
    ["/evidence", "Evidence", ClipboardCheck],
    ["/auditor", "Auditor", FileSearch]
  ] as const;

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <ShieldCheck className="h-6 w-6 text-brand" />
          <div>
            <div className="text-sm font-semibold text-ink">AI Risk Governance</div>
            <div className="text-xs text-slate-500">Financial controls MVP</div>
          </div>
        </div>
        <nav className="p-3">
          {nav.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-panel hover:text-ink">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="border-b border-line bg-white px-5 py-4 lg:hidden">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-5 w-5 text-brand" />
            AI Risk Governance
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 py-7">{children}</div>
      </main>
    </div>
  );
}
