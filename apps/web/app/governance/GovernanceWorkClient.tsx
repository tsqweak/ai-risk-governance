"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Bookmark,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  Filter,
  Home,
  Menu,
  MoreVertical,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X
} from "lucide-react";
import { humanize } from "../components/format";

export type GovernanceWorkItem = {
  id: string;
  issueType: string;
  issue: string;
  impactedAiSystem: string;
  owner: string;
  dueDate: string;
  severity: string;
  status: string;
  why: string;
  evidenceUsed: string;
  impact: string;
  recommendedAction: string;
  nextStep: string;
  actionLabel: string;
  controlId: string;
  evidenceRequirement: string;
  evidenceSource: string;
  evidenceArtifact: string;
  assuranceStatus: string;
  traceability: string;
  packageStatus: string;
  workflowState: string;
  scopes: string[];
  exactObjectHref: string;
};

const workflowStates = [
  "Issue Identified",
  "Assigned",
  "Evidence Requested",
  "In Review",
  "Remediation Planned",
  "Remediation Implemented",
  "Closed"
];

const severityRank: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  FAIL: 1,
  WARNING: 2,
  MEDIUM: 2,
  LOW: 3,
  INFORMATIONAL: 4
};

export function GovernanceWorkClient({ items }: { items: GovernanceWorkItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const [scope, setScope] = useState("Enterprise");
  const [severity, setSeverity] = useState("All");
  const [owner, setOwner] = useState("All");
  const [dateRange, setDateRange] = useState("Next 30 days");
  const [system, setSystem] = useState("All");

  const owners = useMemo(() => unique(items.map((item) => item.owner)), [items]);
  const systems = useMemo(() => unique(items.map((item) => item.impactedAiSystem)), [items]);
  const severities = useMemo(() => unique(items.map((item) => item.severity)).sort((a, b) => (severityRank[a] ?? 9) - (severityRank[b] ?? 9)), [items]);
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => severity === "All" || item.severity === severity)
      .filter((item) => owner === "All" || item.owner === owner)
      .filter((item) => system === "All" || item.impactedAiSystem === system)
      .sort(workItemSort);
  }, [items, owner, severity, system]);

  const selected = filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? items[0];
  const counts = getCounts(filteredItems);

  return (
    <div className="fixed inset-0 z-50 flex min-w-0 flex-col overflow-hidden bg-[#f3f5f8] text-[13px] text-[#172033]">
      <TopAppBar />
      <BreadcrumbBar />

      <main className="flex min-h-0 flex-1 flex-col gap-2 p-2.5">
        <div className="flex h-9 shrink-0 items-center justify-between rounded border border-[#ccd5e1] bg-white px-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-[#111827]">Governance Work</h1>
            <span className="h-4 w-px bg-[#d7dee8]" />
            <span className="hidden text-xs font-medium text-[#526174] min-[1380px]:inline">Enterprise work queue · Cases requiring owner action, evidence, or review</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#526174]">
            <span>View: Operations</span>
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1 text-[#27364a]">37 active cases</span>
          </div>
        </div>

        <section className="grid min-h-0 flex-1 grid-cols-[470px_minmax(0,1fr)_172px] overflow-hidden rounded border border-[#ccd5e1] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] min-[1366px]:grid-cols-[480px_minmax(0,1fr)_184px] min-[1500px]:grid-cols-[580px_minmax(0,1fr)_210px]">
          <div className="flex min-w-0 flex-col border-r border-[#cfd7e3]">
            <FilterBar
              scope={scope}
              severity={severity}
              owner={owner}
              dateRange={dateRange}
              system={system}
              owners={owners}
              systems={systems}
              severities={severities}
              counts={counts}
              onScopeChange={setScope}
              onSeverityChange={setSeverity}
              onOwnerChange={setOwner}
              onDateRangeChange={setDateRange}
              onSystemChange={setSystem}
            />
            <QueueTable items={filteredItems} selected={selected} onSelect={setSelectedId} />
          </div>

          {selected ? <CasePanel item={selected} /> : <EmptyCasePanel />}
          {selected ? <RightRail item={selected} /> : null}
        </section>

        {selected ? <ProofAssuranceLayer item={selected} /> : null}
      </main>
    </div>
  );
}

function TopAppBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 bg-[#061b2c] px-3 text-white shadow-sm min-[1500px]:gap-4 min-[1500px]:px-4">
      <button className="inline-flex h-7 w-7 items-center justify-center rounded text-white/90 hover:bg-white/10" type="button" aria-label="Menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 font-semibold">
        <Building2 className="h-5 w-5" />
        <span>GRC Hub</span>
      </div>
      <button className="flex h-8 shrink-0 items-center gap-2 rounded border border-white/20 bg-white/5 px-2.5 text-sm font-medium text-white/90 min-[1500px]:px-3" type="button">
        Enterprise GRC
        <ChevronDown className="h-4 w-4" />
      </button>
      <div className="mx-auto flex h-8 min-w-[260px] max-w-[500px] flex-1 items-center gap-2 rounded border border-white/20 bg-white/5 px-3 text-sm text-white/70">
        <Search className="h-4 w-4" />
        <span className="truncate">Search systems, issues, controls, evidence...</span>
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[11px]">⌘K</span>
      </div>
      <TopUtility icon={Bookmark} label="Bookmarks" />
      <TopUtility icon={ClipboardList} label="Tasks" badge="12" />
      <TopUtility icon={Bell} label="Notifications" badge="7" />
      <TopUtility icon={CircleHelp} label="Help" />
      <div className="flex shrink-0 items-center gap-2 border-l border-white/15 pl-2 min-[1500px]:pl-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-semibold text-[#061b2c]">JD</span>
        <div className="hidden leading-tight min-[1366px]:block">
          <div className="text-xs font-semibold">Jane Doe</div>
          <div className="text-[10px] text-white/65">GRC Analyst</div>
        </div>
      </div>
    </header>
  );
}

function BreadcrumbBar() {
  return (
    <nav className="flex h-10 shrink-0 items-center gap-2 border-b border-[#cfd7e3] bg-white px-4 text-xs font-semibold text-[#27364a]">
      <Home className="h-4 w-4 text-[#526174]" />
      <ChevronRight className="h-4 w-4 text-[#8a95a6]" />
      <span>Governance</span>
      <ChevronRight className="h-4 w-4 text-[#8a95a6]" />
      <span className="text-[#111827]">Governance Work</span>
    </nav>
  );
}

function FilterBar({
  scope,
  severity,
  owner,
  dateRange,
  system,
  owners,
  systems,
  severities,
  counts,
  onScopeChange,
  onSeverityChange,
  onOwnerChange,
  onDateRangeChange,
  onSystemChange
}: {
  scope: string;
  severity: string;
  owner: string;
  dateRange: string;
  system: string;
  owners: string[];
  systems: string[];
  severities: string[];
  counts: ReturnType<typeof getCounts>;
  onScopeChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
  onSystemChange: (value: string) => void;
}) {
  return (
    <div className="border-b border-[#cfd7e3] bg-white">
      <div className="grid grid-cols-[102px_82px_92px_112px] gap-2 px-2 py-2 min-[1500px]:grid-cols-[96px_96px_108px_116px_96px] min-[1500px]:px-3 min-[1500px]:py-2.5">
        <FilterSelect label="Scope" value={scope} values={["Enterprise", "My Work", "Audit Blockers", "High Severity"]} onChange={onScopeChange} />
        <FilterSelect label="Severity" value={severity} values={["All", ...severities]} onChange={onSeverityChange} />
        <FilterSelect label="Owner" value={owner} values={["All", ...owners]} onChange={onOwnerChange} />
        <FilterSelect label="Due Date" value={dateRange} values={["Next 30 days", "Next 7 days", "Overdue", "All"]} onChange={onDateRangeChange} icon={CalendarDays} />
        <div className="hidden min-[1500px]:block">
          <FilterSelect label="AI System" value={system} values={["All", ...systems]} onChange={onSystemChange} />
        </div>
      </div>
      <div className="flex h-8 items-center gap-2 border-t border-[#e1e6ee] px-2.5 text-[11px] text-[#526174] min-[1500px]:gap-4 min-[1500px]:px-3 min-[1500px]:text-xs">
        <span>{counts.total} items</span>
        <span className="text-[#9aa5b5]">|</span>
        <LegendDot color="bg-red-600" label={`${counts.critical} Critical`} />
        <LegendDot color="bg-orange-500" label={`${counts.high} High`} />
        <LegendDot color="bg-amber-400" label={`${counts.medium} Medium`} />
        <LegendDot color="bg-green-600" label={`${counts.low} Low`} />
        <button className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b4a92]" type="button">
          <Filter className="h-3.5 w-3.5" />
          More filters
        </button>
        <button className="text-xs font-semibold text-[#0b4a92]" type="button">Clear</button>
        <button className="hidden text-xs font-semibold text-[#0b4a92] min-[1500px]:inline" type="button">Save view</button>
      </div>
    </div>
  );
}

function QueueTable({ items, selected, onSelect }: { items: GovernanceWorkItem[]; selected?: GovernanceWorkItem; onSelect: (id: string) => void }) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden bg-white">
      <div className="h-full overflow-auto">
        <table className="w-full table-fixed border-collapse text-left text-[12px]">
          <thead className="sticky top-0 z-10 bg-[#f6f8fb] text-[11px] font-semibold text-[#344256]">
            <tr className="border-b border-[#cfd7e3]">
              <th className="w-[36px] px-2 py-2">Type</th>
              <th className="border-l border-[#d9e0ea] px-2.5 py-2">Issue</th>
              <th className="w-[118px] border-l border-[#d9e0ea] px-2.5 py-2 min-[1366px]:w-[132px] min-[1500px]:w-[148px]">AI System</th>
              <th className="hidden w-[98px] border-l border-[#d9e0ea] px-2.5 py-2 min-[1700px]:table-cell">Owner</th>
              <th className="w-[86px] border-l border-[#d9e0ea] px-2.5 py-2 min-[1500px]:w-[102px]">Due ↑</th>
              <th className="w-[70px] border-l border-[#d9e0ea] px-2 py-2">Severity</th>
              <th className="hidden w-[112px] border-l border-[#d9e0ea] px-2.5 py-2 min-[1700px]:table-cell">State</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 18).map((item) => {
              const active = selected?.id === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`cursor-pointer border-b border-[#e1e6ee] ${active ? "bg-[#edf4ff] shadow-[inset_3px_0_0_#0b4a92]" : "bg-white hover:bg-[#f7faff]"}`}
                >
                  <td className="px-2 py-2.5">{severityIcon(item.severity)}</td>
                  <td className="border-l border-[#e1e6ee] px-2.5 py-2.5 font-semibold leading-4 text-[#172033]">
                    <WrappedText>{caseTitle(item)}</WrappedText>
                  </td>
                  <td className="border-l border-[#e1e6ee] px-2.5 py-2.5 leading-4 text-[#27364a]"><WrappedText>{item.impactedAiSystem}</WrappedText></td>
                  <td className="hidden border-l border-[#e1e6ee] px-2.5 py-2.5 text-[#27364a] min-[1700px]:table-cell"><WrappedText>{item.owner}</WrappedText></td>
                  <td className="border-l border-[#e1e6ee] px-2.5 py-2.5 font-semibold leading-4 text-[#b45309]">{item.dueDate}</td>
                  <td className="border-l border-[#e1e6ee] px-2.5 py-2.5"><ToneBadge tone={item.severity} /></td>
                  <td className="hidden border-l border-[#e1e6ee] px-2.5 py-2.5 min-[1700px]:table-cell"><ToneBadge tone={item.workflowState} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CasePanel({ item }: { item: GovernanceWorkItem }) {
  return (
    <section className="min-w-0 overflow-auto border-r border-[#cfd7e3] bg-white">
      <div className="flex min-h-14 items-start justify-between border-b border-[#cfd7e3] px-5 py-3">
        <div className="min-w-0">
          <div className="mb-1 font-mono text-[11px] font-semibold text-[#526174]">{formatCaseId(item)}</div>
          <h2 className="text-[18px] font-semibold leading-6 text-[#111827]">{caseTitle(item)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#f3f6fa]" type="button"><MoreVertical className="h-4 w-4" /></button>
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#f3f6fa]" type="button"><X className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="p-4 min-[1500px]:p-5">
        <div className="grid grid-cols-[1.05fr_1fr_0.82fr_0.92fr_1.2fr] rounded border border-[#cfd7e3] bg-[#fbfcfe]">
          <CaseFact label="Owner" value={item.owner} icon={UserRound} />
          <CaseFact label="Due Date" value={item.dueDate} urgent />
          <CaseFact label="Severity" value={humanize(item.severity)} badge={item.severity} />
          <CaseFact label="Status" value={humanize(item.workflowState)} badge={item.workflowState} />
          <CaseFact label="ID" value={formatCaseId(item)} />
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold text-[#344256]">Recommended Next Action</div>
          <div className="flex flex-wrap gap-2">
            <Link href={item.exactObjectHref} className="inline-flex h-9 min-w-[160px] items-center justify-center gap-2 whitespace-nowrap rounded bg-[#0b3b78] px-3 text-sm font-semibold text-white hover:bg-[#092f60] min-[1500px]:min-w-[176px] min-[1500px]:px-4">
              <ClipboardList className="h-4 w-4" />
              {item.actionLabel}
            </Link>
            <button className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded border border-[#c8d2df] bg-white px-3 text-xs font-semibold text-[#0b3b78]" type="button">
              <UserRound className="h-4 w-4" />
              Assign to Owner
            </button>
            <button className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded border border-[#c8d2df] bg-white px-3 text-xs font-semibold text-[#0b3b78]" type="button">
              <AlertTriangle className="h-4 w-4" />
              Escalate Issue
            </button>
          </div>
        </div>

        <Accordion title="Why this exists" defaultOpen>
          {item.why}
        </Accordion>
        <Accordion title="Impact if ignored">
          {item.impact}
        </Accordion>
        <Accordion title="Evidence used" defaultOpen>
          <EvidenceMiniTable item={item} />
        </Accordion>
        <Accordion title="Additional Details">
          Affected scope: {item.controlId}. Traceability: {item.traceability}. Package readiness: {item.packageStatus}.
        </Accordion>
      </div>
    </section>
  );
}

function RightRail({ item }: { item: GovernanceWorkItem }) {
  return (
    <aside className="min-w-0 overflow-auto bg-white">
      <div className="flex h-10 border-b border-[#cfd7e3] text-[11px] font-semibold min-[1500px]:h-11 min-[1500px]:text-xs">
        <button className="border-b-2 border-[#0b4a92] px-2.5 text-[#0b4a92] min-[1500px]:px-3" type="button">Workflow</button>
        <button className="px-2.5 text-[#27364a] min-[1500px]:px-3" type="button">Audit</button>
      </div>
      <div className="border-b border-[#cfd7e3] p-2.5 min-[1500px]:p-3">
        <h3 className="mb-3 text-xs font-semibold uppercase text-[#344256]">Workflow State</h3>
        <ol className="space-y-2 min-[1500px]:space-y-2.5">
          {workflowStates.map((state, index) => {
            const active = state === mapWorkflowState(item.workflowState);
            const passed = index < workflowStates.indexOf(mapWorkflowState(item.workflowState));
            return (
              <li key={state} className="grid grid-cols-[15px_1fr] gap-1.5 text-[11px] min-[1500px]:grid-cols-[16px_1fr] min-[1500px]:gap-2">
                <span className={`mt-1 h-3 w-3 rounded-full border ${active ? "border-[#0b4a92] bg-[#0b4a92] ring-4 ring-[#e5f0ff]" : passed ? "border-[#0b4a92] bg-[#0b4a92]" : "border-[#8a95a6] bg-white"}`} />
                <span>
                  <span className={`block font-semibold ${active ? "text-[#111827]" : "text-[#344256]"}`}>{state}{active ? " (Current)" : ""}</span>
                  <span className="text-[#526174]">Jun 16, 2026 09:{index + 12}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="p-2.5 min-[1500px]:p-3">
        <h3 className="mb-3 text-xs font-semibold uppercase text-[#344256]">Audit Trail</h3>
        <div className="space-y-2 min-[1500px]:space-y-2.5">
          {auditEntries(item).map((entry) => (
            <div key={entry.label} className="grid grid-cols-[16px_1fr] gap-1.5 text-[11px] min-[1500px]:grid-cols-[18px_1fr] min-[1500px]:gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#526174]" />
              <div>
                <div className="font-semibold text-[#111827]">{entry.label}</div>
                <div className="text-[#526174]">{entry.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ProofAssuranceLayer({ item }: { item: GovernanceWorkItem }) {
  const steps = [
    ["1. Control", item.controlId, "Control Owner", item.owner, "Current"],
    ["2. Evidence Requirement", item.evidenceRequirement, "Owner", "Model Risk", "Current"],
    ["3. Evidence Source", item.evidenceSource, "Data Owner", item.owner, "Current"],
    ["4. Evidence Artifact", item.evidenceArtifact, "Submitted By", item.owner, item.evidenceArtifact === "Missing" ? "Missing" : "Warning"],
    ["5. Assurance", item.assuranceStatus, "Reviewer", "Governance", item.assuranceStatus === "VALID" || item.assuranceStatus === "PASS" ? "Current" : "Warning"],
    ["6. Traceability", item.traceability, "AI System", item.impactedAiSystem, "Current"],
    ["7. Package", item.packageStatus, "Included In", "Q2 2026 GRC Pack", item.packageStatus === "Package-ready" ? "Current" : "Missing"]
  ];

  return (
    <section className="shrink-0 rounded border border-[#cfd7e3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex h-8 items-center justify-between border-b border-[#e1e6ee] px-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#344256]">
          Proof Chain & Assurance
          <CircleHelp className="h-4 w-4 text-[#526174]" />
        </div>
        <button className="text-xs font-semibold text-[#0b4a92]" type="button">Expand proof</button>
      </div>
      <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_92px] gap-1.5 p-2 min-[1500px]:grid-cols-[repeat(7,minmax(108px,1fr))_112px]">
        {steps.map(([label, title, metaLabel, metaValue, status], index) => (
          <div key={`${label}-${title}`} className="relative min-w-0 rounded border border-[#d8e0ea] bg-[#fbfcfe] px-2 py-1.5 text-[11px]">
            {index < steps.length - 1 ? <span className="absolute -right-2 top-1/2 text-[#8a95a6]">→</span> : null}
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#344256]">{label}</span>
              <ToneBadge tone={status} />
            </div>
            <div className="mt-1 hidden leading-4 text-[#172033] min-[1500px]:block">{title}</div>
          </div>
        ))}
        <div className="rounded border border-[#d8e0ea] bg-[#fbfcfe] p-2 text-[11px]">
          <div className="font-semibold text-[#111827]">Status Legend</div>
          <div className="mt-2 grid gap-1.5">
            <LegendDot color="bg-green-600" label="Current" />
            <LegendDot color="bg-amber-400" label="Warning" />
            <LegendDot color="bg-red-600" label="Missing" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({ label, value, values, onChange, icon: Icon }: { label: string; value: string; values: string[]; onChange: (value: string) => void; icon?: typeof CalendarDays }) {
  return (
    <label className="grid gap-1 text-[11px] font-semibold text-[#344256]">
      {label}
      <span className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full appearance-none rounded border border-[#c8d2df] bg-white px-2 pr-7 text-xs font-medium text-[#172033] outline-none">
          {values.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
        </select>
        {Icon ? <Icon className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-[#526174]" /> : <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-[#526174]" />}
      </span>
    </label>
  );
}

function CaseFact({ label, value, icon: Icon, urgent, badge }: { label: string; value: string; icon?: typeof UserRound; urgent?: boolean; badge?: string }) {
  return (
    <div className="min-w-0 border-r border-[#cfd7e3] p-3 last:border-r-0">
      <div className="text-[11px] font-semibold text-[#526174]">{label}</div>
      <div className={`mt-2 flex min-w-0 items-center gap-2 break-words text-xs font-semibold leading-4 ${urgent ? "text-red-700" : "text-[#172033]"}`}>
        {Icon ? <Icon className="h-4 w-4 text-[#526174]" /> : null}
        {badge ? <ToneBadge tone={badge} /> : <span className="min-w-0">{value}</span>}
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="mt-3 rounded border border-[#cfd7e3] bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-3 text-sm font-semibold text-[#111827]">
        <ChevronRight className="h-4 w-4 text-[#526174]" />
        {title}
      </summary>
      <div className="border-t border-[#e1e6ee] px-3 py-3 text-sm leading-5 text-[#27364a]">{children}</div>
    </details>
  );
}

function EvidenceMiniTable({ item }: { item: GovernanceWorkItem }) {
  const rows = [
    [item.evidenceArtifact, item.owner, item.dueDate, item.assuranceStatus, item.packageStatus],
    [item.evidenceSource, "Governance", "Current cycle", "Medium", "Partial"],
    [item.evidenceRequirement, "Control Owner", "Review cycle", "High", item.evidenceArtifact === "Missing" ? "Insufficient" : "Sufficient"]
  ];

  return (
    <table className="min-w-full border border-[#e1e6ee] text-xs">
      <thead className="bg-[#f6f8fb] text-[#344256]">
        <tr>
          <th className="px-2 py-2 text-left">Evidence Item</th>
          <th className="px-2 py-2 text-left">Provided By</th>
          <th className="px-2 py-2 text-left">Provided On</th>
          <th className="px-2 py-2 text-left">Quality</th>
          <th className="px-2 py-2 text-left">Sufficiency</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([evidence, providedBy, providedOn, quality, sufficiency]) => (
          <tr key={`${evidence}-${providedBy}`} className="border-t border-[#e1e6ee]">
            <td className="px-2 py-2 font-medium">{evidence}</td>
            <td className="px-2 py-2">{providedBy}</td>
            <td className="px-2 py-2">{providedOn}</td>
            <td className="px-2 py-2"><ToneBadge tone={quality} /></td>
            <td className="px-2 py-2"><ToneBadge tone={sufficiency} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmptyCasePanel() {
  return <section className="grid place-items-center bg-white text-sm text-[#526174]">No case selected.</section>;
}

function TopUtility({ icon: Icon, label, badge }: { icon: typeof Bookmark; label: string; badge?: string }) {
  return (
    <button className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-white/90" type="button" aria-label={label}>
      <Icon className="h-4 w-4" />
      <span className="hidden min-[1450px]:inline">{label}</span>
      {badge ? <span className="grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-[#061b2c]">{badge}</span> : null}
    </button>
  );
}

function ToneBadge({ tone }: { tone: string }) {
  const normalized = tone.toUpperCase().replaceAll(" ", "_");
  const className = {
    CRITICAL: "border-red-300 bg-red-50 text-red-700",
    HIGH: "border-orange-300 bg-orange-50 text-orange-700",
    MEDIUM: "border-amber-300 bg-amber-50 text-amber-700",
    LOW: "border-green-300 bg-green-50 text-green-700",
    NEW: "border-slate-300 bg-slate-50 text-slate-700",
    IN_REVIEW: "border-blue-300 bg-blue-50 text-blue-700",
    IN_PROGRESS: "border-blue-300 bg-blue-50 text-blue-700",
    EVIDENCE_REQUESTED: "border-blue-300 bg-blue-50 text-blue-700",
    WAITING_ON_EVIDENCE: "border-blue-300 bg-blue-50 text-blue-700",
    CURRENT: "border-green-300 bg-green-50 text-green-700",
    PRESENT: "border-green-300 bg-green-50 text-green-700",
    VALID: "border-green-300 bg-green-50 text-green-700",
    PASS: "border-green-300 bg-green-50 text-green-700",
    SUFFICIENT: "border-green-300 bg-green-50 text-green-700",
    WARNING: "border-amber-300 bg-amber-50 text-amber-700",
    PARTIAL: "border-amber-300 bg-amber-50 text-amber-700",
    NEEDS_REVIEW: "border-amber-300 bg-amber-50 text-amber-700",
    FAIL: "border-red-300 bg-red-50 text-red-700",
    MISSING: "border-red-300 bg-red-50 text-red-700",
    BLOCKED: "border-red-300 bg-red-50 text-red-700",
    INSUFFICIENT: "border-red-300 bg-red-50 text-red-700"
  }[normalized] ?? "border-slate-300 bg-slate-50 text-slate-700";

  return <span className={`inline-flex max-w-full items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-4 ${className}`}>{humanize(tone)}</span>;
}

function LegendDot({ color, label, detail }: { color: string; label: string; detail?: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span><span className="font-semibold text-[#172033]">{label}</span>{detail ? <span className="block text-[11px] text-[#526174]">{detail}</span> : null}</span>
    </span>
  );
}

function severityIcon(severity: string) {
  if (severity === "LOW") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (severity === "CRITICAL") return <ShieldAlert className="h-4 w-4 text-red-600" />;
  if (severity === "HIGH") return <AlertTriangle className="h-4 w-4 text-orange-600" />;
  return <AlertTriangle className="h-4 w-4 text-amber-500" />;
}

function WrappedText({ children }: { children: string }) {
  return <span className="block whitespace-normal break-words">{children}</span>;
}

function getCounts(items: GovernanceWorkItem[]) {
  return {
    total: items.length,
    critical: items.filter((item) => item.severity === "CRITICAL").length,
    high: items.filter((item) => item.severity === "HIGH").length,
    medium: items.filter((item) => item.severity === "MEDIUM" || item.severity === "WARNING").length,
    low: items.filter((item) => item.severity === "LOW").length
  };
}

function auditEntries(item: GovernanceWorkItem) {
  return [
    { label: "Status changed to In Review", value: `${item.owner} · current cycle` },
    { label: "Evidence submitted", value: item.evidenceArtifact },
    { label: "Issue assigned", value: item.owner },
    { label: "Issue created by source", value: item.evidenceSource }
  ];
}

function mapWorkflowState(state: string) {
  if (state === "Waiting on Evidence") return "Evidence Requested";
  if (state === "New") return "Issue Identified";
  if (state === "Remediation Planned") return "Remediation Planned";
  if (state === "Accepted Risk" || state === "Exception Requested") return "Remediation Planned";
  if (state === "Closed" || state === "Resolved") return "Closed";
  return "In Review";
}

function workItemSort(a: GovernanceWorkItem, b: GovernanceWorkItem) {
  return (severityRank[a.severity] ?? 5) - (severityRank[b.severity] ?? 5) || a.issueType.localeCompare(b.issueType);
}

function formatCaseId(item: GovernanceWorkItem) {
  const numeric = Math.abs(hashCode(item.id)).toString().padStart(6, "0").slice(0, 6);
  return `GW-2026-${numeric}`;
}

function caseTitle(item: GovernanceWorkItem) {
  if (item.issue.includes(" · ")) return item.issue.split(" · ").slice(1).join(" · ").replace(/ failed for .+$/, "");
  if (item.issueType === "Failed Validation") return item.evidenceRequirement;
  return item.issue.replace(/ failed for .+$/, "");
}

function hashCode(value: string) {
  return value.split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}
