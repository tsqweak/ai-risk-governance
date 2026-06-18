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
  "New",
  "In Review",
  "Waiting on Evidence",
  "Remediation Planned",
  "Exception Requested",
  "Accepted Risk",
  "Resolved",
  "Closed"
];

const queueScopes = [
  "My Work",
  "Team Queue",
  "Audit Blockers",
  "High Severity",
  "Discovery Review",
  "Exceptions Expiring",
  "Committee-Ready"
];

const scopeAliases: Record<string, string[]> = {
  "My Work": ["My Work"],
  "Team Queue": ["My Work", "Audit Blockers", "High Severity", "Discovery", "Committee Ready"],
  "Audit Blockers": ["Audit Blockers"],
  "High Severity": ["High Severity"],
  "Discovery Review": ["Discovery", "Discovery Review"],
  "Exceptions Expiring": ["Exception", "Exceptions Expiring", "Committee Ready"],
  "Committee-Ready": ["Committee Ready", "Committee-Ready"]
};

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
  const [scope, setScope] = useState("My Work");
  const [severity, setSeverity] = useState("All");
  const [owner, setOwner] = useState("All");
  const [dateRange, setDateRange] = useState("Next 30 days");
  const [system, setSystem] = useState("All");

  const owners = useMemo(() => unique(items.map((item) => item.owner)), [items]);
  const systems = useMemo(() => unique(items.map((item) => item.impactedAiSystem)), [items]);
  const severities = useMemo(() => unique(items.map((item) => item.severity)).sort((a, b) => (severityRank[a] ?? 9) - (severityRank[b] ?? 9)), [items]);
  const filteredItems = useMemo(() => {
    const matchingScopes = scopeAliases[scope] ?? [scope];
    return items
      .filter((item) => scope === "Team Queue" || item.scopes.some((itemScope) => matchingScopes.includes(itemScope)))
      .filter((item) => severity === "All" || item.severity === severity)
      .filter((item) => owner === "All" || item.owner === owner)
      .filter((item) => system === "All" || item.impactedAiSystem === system)
      .sort(workItemSort);
  }, [items, owner, scope, severity, system]);

  const selected = filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? items[0];
  const counts = getCounts(filteredItems);

  return (
    <div data-governance-workbench="root" className="fixed inset-0 z-50 flex min-w-0 flex-col overflow-hidden bg-[#f3f5f8] text-[13px] text-[#172033]">
      <TopAppBar />
      <BreadcrumbBar />

      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2.5">
        <div className="flex h-9 shrink-0 items-center justify-between rounded border border-[#ccd5e1] bg-white px-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-[#111827]">Governance Work</h1>
            <span className="h-4 w-px bg-[#d7dee8]" />
            <span className="hidden text-xs font-medium text-[#526174] min-[1380px]:inline">AI governance operations queue · Evidence-backed action for systems, controls, risks, and audit blockers</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#526174]">
            <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">Reference portfolio</span>
            <span>Scope: {scope}</span>
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1 text-[#27364a]">{filteredItems.length} action items</span>
          </div>
        </div>

        <section data-governance-workbench="case-layout" className="grid min-h-0 flex-1 grid-cols-[470px_minmax(0,1fr)_172px] overflow-hidden rounded border border-[#ccd5e1] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] min-[1366px]:grid-cols-[480px_minmax(0,1fr)_184px] min-[1500px]:grid-cols-[580px_minmax(0,1fr)_210px]">
          <div className="flex min-h-0 min-w-0 flex-col border-r border-[#cfd7e3]">
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
        <span>AI Governance Ops</span>
      </div>
      <button className="flex h-8 shrink-0 items-center gap-2 rounded border border-white/20 bg-white/5 px-2.5 text-sm font-medium text-white/90 min-[1500px]:px-3" type="button">
        AI Risk Portfolio
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
          <div className="text-[10px] text-white/65">AI Governance Analyst</div>
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
        <FilterSelect label="Scope" value={scope} values={queueScopes} onChange={onScopeChange} />
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
      <div data-governance-workbench="queue-scroll" className="h-full overflow-auto">
        <table className="w-full table-fixed border-collapse text-left text-[12px]">
          <thead className="sticky top-0 z-10 bg-[#f6f8fb] text-[11px] font-semibold text-[#344256]">
            <tr className="border-b border-[#cfd7e3]">
              <th className="w-[36px] px-2 py-2">Type</th>
              <th className="border-l border-[#d9e0ea] px-2.5 py-2">Issue</th>
              <th className="w-[118px] border-l border-[#d9e0ea] px-2.5 py-2 min-[1366px]:w-[132px] min-[1500px]:w-[148px]">AI System</th>
              <th className="hidden w-[98px] border-l border-[#d9e0ea] px-2.5 py-2 min-[1700px]:table-cell">Owner</th>
              <th className="w-[86px] border-l border-[#d9e0ea] px-2.5 py-2 min-[1500px]:w-[102px]">Due ↑</th>
              <th className="w-[78px] border-l border-[#d9e0ea] px-2 py-2">Evidence</th>
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
                    <span className="mb-1 block text-[10px] font-semibold uppercase text-[#526174]">{item.issueType} · {item.actionLabel}</span>
                    <WrappedText>{caseTitle(item)}</WrappedText>
                    <span className="mt-1 block text-[11px] font-medium text-[#526174]">{item.controlId} · {committeeReadiness(item)}</span>
                  </td>
                  <td className="border-l border-[#e1e6ee] px-2.5 py-2.5 leading-4 text-[#27364a]">
                    <WrappedText>{item.impactedAiSystem}</WrappedText>
                    <span className="mt-1 block text-[11px] text-[#526174]">{aiRelationship(item)}</span>
                  </td>
                  <td className="hidden border-l border-[#e1e6ee] px-2.5 py-2.5 text-[#27364a] min-[1700px]:table-cell"><WrappedText>{item.owner}</WrappedText></td>
                  <td className="border-l border-[#e1e6ee] px-2.5 py-2.5 font-semibold leading-4 text-[#b45309]">{item.dueDate}</td>
                  <td className="border-l border-[#e1e6ee] px-2.5 py-2.5">
                    <ToneBadge tone={evidenceConfidence(item)} />
                    <span className="mt-1 block text-[10px] font-semibold text-[#526174]">{humanize(item.severity)}</span>
                  </td>
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
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-[#cfd7e3] bg-white">
      <div className="flex min-h-14 shrink-0 items-start justify-between border-b border-[#cfd7e3] px-5 py-3">
        <div className="min-w-0">
          <div className="mb-1 font-mono text-[11px] font-semibold text-[#526174]">{formatCaseId(item)}</div>
          <h2 className="text-[18px] font-semibold leading-6 text-[#111827]">{caseTitle(item)}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#344256]">
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">{item.impactedAiSystem}</span>
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">{riskTier(item)}</span>
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">{item.controlId}</span>
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">{auditImpact(item)}</span>
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">Evidence {evidenceConfidence(item)}</span>
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">{governanceBlocker(item)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#f3f6fa]" type="button"><MoreVertical className="h-4 w-4" /></button>
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#f3f6fa]" type="button"><X className="h-4 w-4" /></button>
        </div>
      </div>

      <div data-governance-workbench="case-scroll" className="min-h-0 flex-1 overflow-y-auto p-4 min-[1500px]:p-5">
        <div className="grid grid-cols-[1.05fr_1fr_0.82fr_0.92fr_1.2fr] rounded border border-[#cfd7e3] bg-[#fbfcfe]">
          <CaseFact label="Owner" value={item.owner} icon={UserRound} />
          <CaseFact label="Due Date" value={item.dueDate} urgent />
          <CaseFact label="AI Object" value={aiRelationship(item)} />
          <CaseFact label="Workflow" value={humanize(item.workflowState)} badge={item.workflowState} />
          <CaseFact label="Committee" value={committeeReadiness(item)} />
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
              {committeeReadiness(item).includes("Ready") ? "Send to Committee" : "Escalate"}
            </button>
          </div>
        </div>

        <Accordion title="Case Summary" defaultOpen>
          <OperationalSummary item={item} />
        </Accordion>
        <Accordion title="Impact if ignored">
          {item.impact}
        </Accordion>
        <Accordion title="Evidence used" defaultOpen>
          <EvidenceMiniTable item={item} />
        </Accordion>
        <Accordion title="Additional Details">
          Affected scope: {item.controlId}. AI object relationship: {aiRelationship(item)}. Audit impact: {auditImpact(item)}. Committee readiness: {committeeReadiness(item)}. Traceability: {item.traceability}. Package readiness: {item.packageStatus}.
        </Accordion>
      </div>
    </section>
  );
}

function RightRail({ item }: { item: GovernanceWorkItem }) {
  return (
    <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex h-10 shrink-0 border-b border-[#cfd7e3] text-[11px] font-semibold min-[1500px]:h-11 min-[1500px]:text-xs">
        <button className="border-b-2 border-[#0b4a92] px-2.5 text-[#0b4a92] min-[1500px]:px-3" type="button">Workflow</button>
        <button className="px-2.5 text-[#27364a] min-[1500px]:px-3" type="button">Audit</button>
      </div>
      <div data-governance-workbench="rail-scroll" className="min-h-0 flex-1 overflow-y-auto">
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
      </div>
    </aside>
  );
}

function ProofAssuranceLayer({ item }: { item: GovernanceWorkItem }) {
  const steps = [
    {
      label: "Claim",
      title: governanceClaim(item),
      detail: item.controlId,
      tone: item.controlId === "Unmapped" ? "Missing" : "Current",
      statusLabel: item.controlId === "Unmapped" ? "Control missing" : "Control mapped"
    },
    {
      label: "Current proof",
      title: currentProof(item),
      detail: item.evidenceArtifact,
      tone: item.evidenceArtifact === "Missing" ? "Missing" : "Warning",
      statusLabel: item.evidenceArtifact === "Missing" ? "No artifact" : "Proof exists"
    },
    {
      label: "Blocking gap",
      title: proofBlockingGap(item),
      detail: evidenceBlocker(item),
      tone: proofBlockerTone(item),
      statusLabel: proofBlockerTone(item) === "Current" ? "No blocker" : "Blocks proof"
    },
    {
      label: "Source",
      title: `${sourceConnector(item)} connector`,
      detail: item.evidenceSource,
      tone: sourceHealthTone(item),
      statusLabel: sourceHealthLabel(item)
    },
    {
      label: "Limitation",
      title: sourceLimitation(item),
      detail: sourceHealthLabel(item),
      tone: sourceHealthTone(item),
      statusLabel: sourceHealthTone(item) === "Current" ? "Usable" : "Review"
    },
    {
      label: "Assurance",
      title: assuranceJudgment(item),
      detail: assuranceReason(item),
      tone: evidenceConfidence(item),
      statusLabel: `Assurance ${evidenceConfidence(item).toLowerCase()}`
    },
    {
      label: "Package impact",
      title: packageConsequence(item),
      detail: "Q2 AI Governance package",
      tone: packageTone(item),
      statusLabel: packageTone(item) === "Missing" ? "Package blocked" : `Package ${packageTone(item).toLowerCase()}`
    },
    {
      label: "Next proof action",
      title: item.actionLabel,
      detail: nextProofAction(item),
      tone: item.packageStatus === "Blocked" ? "Warning" : "Current",
      statusLabel: "Next"
    }
  ];

  return (
    <section data-governance-workbench="proof-strip" className="max-h-[124px] shrink-0 overflow-hidden rounded border border-[#cfd7e3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] min-[1366px]:max-h-[132px]">
      <div className="flex h-7 items-center justify-between border-b border-[#e1e6ee] px-3 min-[1366px]:h-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#344256]">
          Proof Chain & Assurance
          <CircleHelp className="h-4 w-4 text-[#526174]" />
        </div>
        <button className="text-xs font-semibold text-[#0b4a92]" type="button">Expand proof</button>
      </div>
      <div className="grid grid-cols-[repeat(8,minmax(0,1fr))] gap-1.5 overflow-x-auto p-1.5 min-[1366px]:p-2 min-[1500px]:grid-cols-[repeat(8,minmax(108px,1fr))]">
        {steps.map((step, index) => (
          <div key={`${step.label}-${step.title}`} className="relative min-w-[136px] rounded border border-[#d8e0ea] bg-[#fbfcfe] px-2 py-1.5 text-[11px] min-[1500px]:min-w-0">
            {index < steps.length - 1 ? <span className="absolute -right-2 top-1/2 text-[#8a95a6]">→</span> : null}
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#344256]">{step.label}</span>
              <ToneBadge tone={step.tone} label={step.statusLabel} />
            </div>
            <div className="mt-1 line-clamp-2 leading-4 text-[#172033]">{step.title}</div>
            <div className="mt-1 hidden truncate text-[10px] font-medium text-[#526174] min-[1366px]:block" title={step.detail}>{step.detail}</div>
          </div>
        ))}
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

function OperationalSummary({ item }: { item: GovernanceWorkItem }) {
  const rows = [
    ["Trigger", operationalTrigger(item)],
    ["Governance impact", auditImpact(item)],
    ["Evidence blocker", evidenceBlocker(item)],
    ["Recommended next action", item.recommendedAction]
  ];

  return (
    <dl className="grid gap-2">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[132px_1fr] gap-3">
          <dt className="text-xs font-semibold uppercase text-[#526174]">{label}</dt>
          <dd className="text-sm leading-5 text-[#27364a]">{value}</dd>
        </div>
      ))}
    </dl>
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

function ToneBadge({ tone, label }: { tone: string; label?: string }) {
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

  return <span className={`inline-flex max-w-full items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-4 ${className}`}>{label ?? humanize(tone)}</span>;
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
  if (state === "Waiting on Evidence") return "Waiting on Evidence";
  if (state === "New") return "New";
  if (state === "Remediation Planned") return "Remediation Planned";
  if (state === "Accepted Risk") return "Accepted Risk";
  if (state === "Exception Requested") return "Exception Requested";
  if (state === "Resolved") return "Resolved";
  if (state === "Closed") return "Closed";
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
  const rawTitle = item.issue.includes(" · ") ? item.issue.split(" · ").slice(1).join(" · ") : item.issue;
  const normalizedTitle = rawTitle.replace(/ failed for .+$/, "");
  if (`${normalizedTitle} ${item.evidenceRequirement}`.toLowerCase().includes("governance engineering implemented")) {
    return `Runtime controls not validated for ${item.impactedAiSystem}`;
  }
  if (item.issueType === "Failed Validation") {
    if (item.evidenceRequirement.toLowerCase().includes("governance engineering")) {
      return `Runtime controls not validated for ${item.impactedAiSystem}`;
    }
    return `${item.evidenceRequirement} failed for ${item.impactedAiSystem}`;
  }
  if (item.issueType === "Evidence Gap") return `${item.evidenceRequirement} evidence blocks ${item.impactedAiSystem}`;
  if (item.issueType === "Source Issue") return `${sourceConnector(item)} source limitation for ${item.impactedAiSystem}`;
  if (item.issueType === "Discovery Finding") return `Classify discovered asset for ${item.impactedAiSystem}`;
  if (item.issueType === "Exception") return `Review exception before expiry for ${item.impactedAiSystem}`;
  if (item.issueType === "Risk Acceptance") return `Confirm accepted risk for ${item.impactedAiSystem}`;
  if (item.issueType === "Review Task") return `Verify evidence artifact for ${item.impactedAiSystem}`;
  return normalizedTitle;
}

function operationalTrigger(item: GovernanceWorkItem) {
  if (item.issueType === "Failed Validation") return `${item.controlId} failed monitoring for ${item.impactedAiSystem}.`;
  if (item.issueType === "Evidence Gap") return `${item.evidenceRequirement} is not current enough for the active package.`;
  if (item.issueType === "Source Issue") return `${sourceConnector(item)} evidence source is not fully usable.`;
  if (item.issueType === "Discovery Finding") return `Discovery found an asset signal that needs inventory classification.`;
  if (item.issueType === "Exception") return `Exception record is approaching governance review.`;
  if (item.issueType === "Risk Acceptance") return `Accepted residual risk requires review against appetite.`;
  return item.nextStep;
}

function evidenceBlocker(item: GovernanceWorkItem) {
  if (item.evidenceArtifact === "Missing") return "Required evidence artifact is missing.";
  if (item.packageStatus === "Blocked") return "Audit package readiness is blocked until proof is refreshed or accepted.";
  if (evidenceConfidence(item) === "Missing") return "Assurance confidence is missing or failed.";
  if (evidenceConfidence(item) === "Warning") return "Evidence exists but needs assurance review before use.";
  return "Evidence is available and traceable.";
}

function governanceClaim(item: GovernanceWorkItem) {
  if (item.issueType === "Failed Validation") return `${item.evidenceRequirement} is implemented and monitored.`;
  if (item.issueType === "Evidence Gap") return `${item.evidenceRequirement} can support ${item.controlId}.`;
  if (item.issueType === "Source Issue") return `${sourceConnector(item)} can provide governed evidence.`;
  if (item.issueType === "Discovery Finding") return `The discovered asset is classified and controlled.`;
  if (item.issueType === "Exception") return `The exception remains approved, owned, and time-bound.`;
  if (item.issueType === "Risk Acceptance") return `The accepted risk remains within appetite.`;
  return `${item.controlId} has usable governance proof.`;
}

function currentProof(item: GovernanceWorkItem) {
  if (item.evidenceArtifact === "Missing") return "No usable evidence artifact is attached.";
  if (item.issueType === "Failed Validation") return `Monitoring finding ${item.evidenceArtifact} exists.`;
  if (item.issueType === "Evidence Gap") return `${item.evidenceSource} requirement is registered.`;
  if (item.issueType === "Source Issue") return `${item.evidenceArtifact} records the source condition.`;
  if (item.issueType === "Discovery Finding") return `${item.evidenceArtifact} supports discovery review.`;
  return `${item.evidenceArtifact} is attached to the case.`;
}

function proofBlockingGap(item: GovernanceWorkItem) {
  if (item.evidenceArtifact === "Missing") return "Evidence artifact missing.";
  if (item.packageStatus === "Blocked") return `${item.actionLabel} required before package use.`;
  if (evidenceConfidence(item) === "Missing") return "Assurance confidence missing.";
  if (evidenceConfidence(item) === "Warning") return "Evidence needs reviewer confirmation.";
  return "No current proof blocker.";
}

function proofBlockerTone(item: GovernanceWorkItem) {
  if (proofBlockingGap(item) === "No current proof blocker.") return "Current";
  if (item.packageStatus === "Blocked" || evidenceConfidence(item) === "Missing") return "Missing";
  return "Warning";
}

function sourceLimitation(item: GovernanceWorkItem) {
  if (item.issueType === "Source Issue") return `${sourceConnector(item)} has a collection or validation limitation.`;
  if (item.evidenceArtifact === "Missing") return `${sourceConnector(item)} has not produced the required artifact.`;
  if (sourceHealthTone(item) !== "Current") return `${sourceConnector(item)} needs source-health review.`;
  return `${sourceConnector(item)} source is usable for this proof path.`;
}

function assuranceJudgment(item: GovernanceWorkItem) {
  if (evidenceConfidence(item) === "Missing") return "Insufficient for audit.";
  if (evidenceConfidence(item) === "Warning") return "Usable only after review.";
  return "Sufficient for current review.";
}

function assuranceReason(item: GovernanceWorkItem) {
  if (item.evidenceArtifact === "Missing") return "Required artifact is absent.";
  if (item.packageStatus === "Blocked") return "Package readiness is blocked.";
  if (evidenceConfidence(item) === "Warning") return "Evidence exists but confidence is not final.";
  return "Evidence is mapped, current, and traceable.";
}

function packageConsequence(item: GovernanceWorkItem) {
  if (item.packageStatus === "Blocked") return "Q2 package blocked.";
  if (item.packageStatus === "Needs review") return "Package needs reviewer signoff.";
  if (item.packageStatus === "Package-ready") return "Package can use this proof.";
  return `${item.packageStatus} package state.`;
}

function nextProofAction(item: GovernanceWorkItem) {
  if (item.evidenceArtifact === "Missing") return "Request missing evidence.";
  if (item.packageStatus === "Blocked") return "Resolve blocker or document exception.";
  if (evidenceConfidence(item) === "Warning") return "Verify evidence sufficiency.";
  return "Add proof to package when needed.";
}

function evidenceConfidence(item: GovernanceWorkItem) {
  const status = `${item.assuranceStatus} ${item.status} ${item.packageStatus}`.toUpperCase();
  if (status.includes("MISSING") || status.includes("INVALID") || status.includes("FAIL") || status.includes("BLOCKED")) return "Missing";
  if (status.includes("WARNING") || status.includes("PARTIAL") || status.includes("EXPIRED") || status.includes("REVIEW") || status.includes("OPEN")) return "Warning";
  return "Current";
}

function sourceConnector(item: GovernanceWorkItem) {
  const source = `${item.evidenceSource} ${item.evidenceArtifact} ${item.evidenceUsed}`.toLowerCase();
  if (source.includes("github") || source.includes("repository")) return "GitHub";
  if (source.includes("log") || source.includes("runtime")) return "Logs";
  if (source.includes("supabase") || source.includes("schema") || source.includes("rls")) return "Supabase";
  if (source.includes("portainer") || source.includes("deployment") || source.includes("container")) return "Portainer";
  if (source.includes("mcp") || source.includes("tool registry") || source.includes("authority")) return "MCP";
  if (source.includes("secret")) return "Secrets";
  if (source.includes("notion") || source.includes("approval")) return "Notion";
  if (item.issueType === "Discovery Finding") return "Discovery";
  if (item.issueType === "Failed Validation" || item.issueType === "Finding") return "Monitoring";
  return "Configured source";
}

function sourceHealthTone(item: GovernanceWorkItem) {
  if (item.issueType === "Source Issue" || item.status === "MISSING" || item.status === "BLOCKED") return "Warning";
  if (item.evidenceArtifact === "Missing") return "Missing";
  return "Current";
}

function sourceHealthLabel(item: GovernanceWorkItem) {
  if (item.issueType === "Source Issue") return "Source limitation";
  if (item.evidenceArtifact === "Missing") return "Evidence missing";
  return `${sourceConnector(item)} current`;
}

function packageTone(item: GovernanceWorkItem) {
  if (item.packageStatus === "Package-ready") return "Current";
  if (item.packageStatus === "Blocked") return "Missing";
  return "Warning";
}

function riskTier(item: GovernanceWorkItem) {
  if (item.severity === "CRITICAL" || item.severity === "HIGH") return "High-risk AI";
  if (item.issueType === "Risk Acceptance") return "Accepted residual risk";
  if (item.issueType === "Exception") return "Exception posture";
  return "Governed AI system";
}

function auditImpact(item: GovernanceWorkItem) {
  if (item.packageStatus === "Blocked") return "Blocks audit";
  if (item.scopes.includes("Audit Blockers")) return "Audit blocker";
  if (item.packageStatus === "Package-ready") return "Package-ready";
  return "Audit review needed";
}

function governanceBlocker(item: GovernanceWorkItem) {
  if (item.issueType === "Discovery Finding") return "Inventory gap";
  if (item.issueType === "Source Issue") return "Source limitation";
  if (item.issueType === "Evidence Gap") return "Evidence blocker";
  if (item.issueType === "Failed Validation") return "Control failure";
  if (item.issueType === "Risk Acceptance") return "Risk decision";
  if (item.issueType === "Exception") return "Exception review";
  return "Governance action";
}

function committeeReadiness(item: GovernanceWorkItem) {
  if (item.scopes.includes("Committee-Ready") || item.scopes.includes("Committee Ready")) {
    return evidenceConfidence(item) === "Missing" ? "Committee blocked by evidence" : "Committee-ready";
  }
  if (item.workflowState === "Waiting on Evidence") return "Needs evidence";
  if (item.workflowState === "Exception Requested" || item.workflowState === "Accepted Risk") return "Needs owner response";
  return "Owner action needed";
}

function aiRelationship(item: GovernanceWorkItem) {
  const text = `${item.issue} ${item.evidenceRequirement} ${item.evidenceSource} ${item.evidenceUsed}`.toLowerCase();
  if (text.includes("agent")) return "Agent";
  if (text.includes("prompt")) return "Prompt";
  if (text.includes("tool") || text.includes("mcp")) return "Tool";
  if (text.includes("model")) return "Model";
  if (text.includes("data") || text.includes("schema") || text.includes("supabase")) return "Data source";
  if (text.includes("api") || text.includes("external")) return "External service";
  if (item.controlId !== "Unmapped" && item.controlId !== "Risk" && item.controlId !== "Discovery") return "Control";
  if (item.issueType === "Risk Acceptance") return "Risk";
  return "System";
}

function hashCode(value: string) {
  return value.split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}
