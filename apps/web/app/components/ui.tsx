import clsx from "clsx";
import Link from "next/link";
import { Activity, Bot, BookOpen, BrainCircuit, BriefcaseBusiness, ClipboardCheck, Cpu, Database, FileSearch, Flame, Gauge, GitBranch, Landmark, Library, Map, Radar, Route, ShieldAlert, ShieldCheck, UserPlus, Users } from "lucide-react";
import { sidebarNavigation } from "../navigation-model";
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
    SUGGESTED: "bg-sky-50 text-sky-800 ring-sky-200",
    NEEDS_ATTENTION: "bg-amber-50 text-amber-900 ring-amber-200",
    NOT_STARTED: "bg-slate-100 text-slate-700 ring-slate-200",
    COVERED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    OPEN_GAP: "bg-red-50 text-red-900 ring-red-200",
    BLOCKED: "bg-red-50 text-red-900 ring-red-200",
    EXPIRED: "bg-red-50 text-red-900 ring-red-200",
    PASS: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    MATCH: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    WARNING: "bg-amber-50 text-amber-900 ring-amber-200",
    DRIFT: "bg-amber-50 text-amber-900 ring-amber-200",
    UNAVAILABLE: "bg-slate-100 text-slate-700 ring-slate-200",
    FAIL: "bg-red-50 text-red-900 ring-red-200",
    OPEN: "bg-red-50 text-red-900 ring-red-200",
    IN_PROGRESS: "bg-amber-50 text-amber-900 ring-amber-200",
    IN_TREATMENT: "bg-amber-50 text-amber-900 ring-amber-200",
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
    INVALID: "bg-red-50 text-red-900 ring-red-200",
    PROPOSED: "bg-slate-100 text-slate-700 ring-slate-200",
    DEVELOPMENT: "bg-sky-50 text-sky-800 ring-sky-200",
    TESTING: "bg-amber-50 text-amber-900 ring-amber-200",
    PILOT: "bg-violet-50 text-violet-900 ring-violet-200",
    PRODUCTION: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    RETIRED: "bg-slate-100 text-slate-700 ring-slate-200",
    PENDING: "bg-amber-50 text-amber-900 ring-amber-200",
    MITIGATE: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    ACCEPT: "bg-sky-50 text-sky-800 ring-sky-200",
    TRANSFER: "bg-violet-50 text-violet-900 ring-violet-200",
    AVOID: "bg-red-50 text-red-900 ring-red-200",
    PLANNED: "bg-slate-100 text-slate-700 ring-slate-200",
    IMPLEMENTED: "bg-sky-50 text-sky-800 ring-sky-200",
    VALIDATED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    ACTIVE: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    DEGRADED: "bg-amber-50 text-amber-900 ring-amber-200",
    INACTIVE: "bg-slate-100 text-slate-700 ring-slate-200",
    STALE: "bg-amber-50 text-amber-900 ring-amber-200",
    PRESENT: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    CONNECTED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    CONFIGURED: "bg-sky-50 text-sky-800 ring-sky-200",
    GAP: "bg-amber-50 text-amber-900 ring-amber-200",
    DISCONNECTED: "bg-slate-100 text-slate-700 ring-slate-200",
    ERROR: "bg-red-50 text-red-900 ring-red-200",
    REVIEW: "bg-amber-50 text-amber-900 ring-amber-200",
    DEPRECATED: "bg-red-50 text-red-900 ring-red-200",
    COMPLETE: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    OPERATIONAL: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    MVP: "bg-sky-50 text-sky-800 ring-sky-200",
    PARTIAL: "bg-amber-50 text-amber-900 ring-amber-200"
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

export function Section({ title, children, action, id }: { title: string; children: React.ReactNode; action?: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mt-8 scroll-mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <span className="text-slate-300">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-brand">{item.label}</Link>
          ) : (
            <span className="text-slate-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SecondaryNav({ items }: { items: ReadonlyArray<readonly [string, string]> }) {
  return (
    <nav className="mt-5 flex gap-2 overflow-x-auto border-y border-line py-3">
      {items.map(([href, label]) => (
        <Link key={`${href}-${label}`} href={href} className="whitespace-nowrap rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel hover:text-ink">
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function GroupedSecondaryNav({ groups }: { groups: ReadonlyArray<{ title: string; items: ReadonlyArray<readonly [string, string]> }> }) {
  return (
    <nav className="mt-5 grid gap-4 border-y border-line py-4 md:grid-cols-2 xl:grid-cols-4">
      {groups.map((group) => (
        <div key={group.title}>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{group.title}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.items.map(([href, label]) => (
              <Link key={`${group.title}-${href}-${label}`} href={href} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel hover:text-ink">
                {label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export type ActionRequiredItem = {
  href: string;
  title: string;
  detail: string;
  status: string;
  owner?: string;
  category?: string;
  actionLabel?: string;
  dueDate?: string;
  severity?: string;
  impact?: string;
  evidenceUsed?: string;
  nextStep?: string;
  recommendedAction?: string;
};

export function ActionRequiredList({ items, emptyMessage = "No action required items are currently open." }: { items: ActionRequiredItem[]; emptyMessage?: string }) {
  if (items.length === 0) {
    return <div className="rounded-md border border-line bg-white p-4 text-sm text-slate-600">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      {items.map((item, index) => (
        <Link key={`${item.href}-${item.title}-${index}`} href={item.href} className="block border-b border-line p-4 last:border-0 hover:bg-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">{item.category ?? "Action Required"}</div>
              <div className="mt-1 text-sm font-semibold text-ink">{item.title}</div>
              <p className="mt-1 text-sm leading-6 text-slate-700">{item.detail}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <ActionItemFact label="Impact" value={item.impact ?? item.detail} />
                <ActionItemFact label="Evidence Used" value={item.evidenceUsed ?? "Linked source evidence, validation result, or control test context."} />
                <ActionItemFact label="Owner" value={item.owner ?? "Unassigned"} />
                <ActionItemFact label="Due Date" value={item.dueDate ?? "Review cycle"} />
              </div>
              <div className="mt-3 rounded border border-line bg-panel p-3 text-xs leading-5 text-slate-700">
                <span className="font-semibold text-ink">Recommended action:</span> {item.recommendedAction ?? "Review the supporting evidence and decide whether to remediate, request evidence, escalate, or close."}
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-700">Next step: {item.nextStep ?? item.actionLabel ?? "Review Action"}</div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <StatusBadge status={item.status} />
              {item.severity ? <StatusBadge status={item.severity} /> : null}
              <span className="text-xs font-semibold text-brand">{item.actionLabel ?? "Review Action"}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ActionItemFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-white px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xs leading-5 text-slate-700">{value}</div>
    </div>
  );
}

export type ProofChainStep = {
  stage: "control" | "requirement" | "source" | "artifact" | "assurance" | "traceability" | "package";
  label?: string;
  title?: string;
  detail?: string;
  href?: string;
  status?: string;
  current?: boolean;
};

const proofChainDefaults: Record<ProofChainStep["stage"], { label: string; title: string; detail: string }> = {
  control: {
    label: "Control",
    title: "Control",
    detail: "Governance obligation being proven."
  },
  requirement: {
    label: "Evidence Requirement",
    title: "Required Evidence",
    detail: "Proof expected for this control."
  },
  source: {
    label: "Evidence Source",
    title: "Source",
    detail: "System or connector where proof originated."
  },
  artifact: {
    label: "Evidence Artifact",
    title: "Artifact",
    detail: "Collected proof object or snapshot."
  },
  assurance: {
    label: "Assurance",
    title: "Assurance",
    detail: "Validation result and confidence."
  },
  traceability: {
    label: "Traceability",
    title: "Traceability",
    detail: "Links back to controls, risks, and systems."
  },
  package: {
    label: "Package",
    title: "Package",
    detail: "Audit or board package readiness."
  }
};

export function ProofChain({ steps }: { steps: ProofChainStep[] }) {
  const orderedStages: ProofChainStep["stage"][] = ["control", "requirement", "source", "artifact", "assurance", "traceability", "package"];
  const stepByStage = new globalThis.Map(steps.map((step) => [step.stage, step]));

  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-ink">Persistent proof path</div>
          <p className="mt-1 text-xs leading-5 text-slate-600">Control to evidence requirement to source to artifact to assurance to traceability to package.</p>
        </div>
      </div>
      <div className="grid gap-2 lg:grid-cols-7">
        {orderedStages.map((stage) => {
          const step = stepByStage.get(stage);
          const defaults = proofChainDefaults[stage];
          const content = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{step?.label ?? defaults.label}</div>
                {step?.status ? <StatusBadge status={step.status} /> : null}
              </div>
              <div className="mt-2 break-words text-sm font-semibold text-ink">{step?.title ?? defaults.title}</div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{step?.detail ?? defaults.detail}</p>
            </>
          );
          const className = clsx(
            "min-h-36 rounded border p-3",
            step?.current ? "border-brand bg-sky-50" : "border-line bg-panel",
            step?.href ? "hover:bg-white" : ""
          );

          return step?.href ? (
            <Link key={stage} href={step.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={stage} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WorkflowContext({
  title,
  why,
  next,
  backHref,
  backLabel
}: {
  title: string;
  why: string;
  next: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mt-5 rounded-md border border-line bg-white p-4">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Why you are here</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{why}</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">What to do next</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{next}</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Return path</div>
          {backHref ? (
            <Link href={backHref} className="mt-1 inline-flex rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
              {backLabel ?? "Go back"}
            </Link>
          ) : (
            <p className="mt-1 text-sm leading-6 text-slate-700">Use the workspace navigation above to return to the owning workflow.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkflowSteps({ steps }: { steps: Array<{ label: string; href?: string; status?: string }> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const content = (
          <>
            <span className="text-slate-400">{index + 1}</span>
            <span>{step.label}</span>
            {step.status ? <StatusBadge status={step.status} /> : null}
          </>
        );
        const className = "inline-flex items-center gap-2 rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700";
        return step.href ? (
          <Link key={`${step.label}-${index}`} href={step.href} className={`${className} hover:bg-white hover:text-ink`}>
            {content}
          </Link>
        ) : (
          <span key={`${step.label}-${index}`} className={className}>
            {content}
          </span>
        );
      })}
    </div>
  );
}

export function TaskLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white hover:text-ink">
      {children}
    </Link>
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
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto border-r border-line bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <ShieldCheck className="h-6 w-6 text-brand" />
          <div>
            <div className="text-sm font-semibold text-ink">AI Governance Command Center</div>
            <div className="text-xs text-slate-500">Compliance {"->"} Governance {"->"} Risk</div>
          </div>
        </div>
        <nav className="space-y-4 p-3">
          {sidebarNavigation.map((group) => (
            <div key={group.title}>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.title}</div>
              <div className="grid gap-1">
                {group.items.map(({ href, label, icon }) => {
                  const Icon = navIcons[icon];
                  return (
                  <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-panel hover:text-ink">
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                  );
                })}
              </div>
            </div>
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

const navIcons = {
  Bot,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  Cpu,
  Database,
  FileSearch,
  Gauge,
  GitBranch,
  Landmark,
  Radar,
  Route,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users
} as const;
