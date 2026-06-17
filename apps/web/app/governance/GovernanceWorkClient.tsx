"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProofChain, StatusBadge } from "../components/ui";

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

const scopes = ["My Work", "Audit Blockers", "High Severity", "Discovery", "Committee Ready"] as const;

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

export function GovernanceWorkClient({ items }: { items: GovernanceWorkItem[] }) {
  const [scope, setScope] = useState<(typeof scopes)[number]>("My Work");
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => item.scopes.includes(scope));
    return filtered.length ? filtered : items;
  }, [items, scope]);
  const selected = filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? items[0];

  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-md border border-line bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand">Queue scope</div>
            <h2 className="mt-1 text-lg font-semibold text-ink">What needs governance attention today?</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Select a scope, choose a queue item, then resolve it from the on-page workbench without losing context.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {scopes.map((itemScope) => (
              <button
                key={itemScope}
                type="button"
                onClick={() => {
                  setScope(itemScope);
                  const nextItem = items.find((item) => item.scopes.includes(itemScope));
                  if (nextItem) setSelectedId(nextItem.id);
                }}
                className={`rounded border px-3 py-2 text-xs font-semibold ${scope === itemScope ? "border-brand bg-sky-50 text-brand" : "border-line bg-panel text-slate-700 hover:bg-white"}`}
              >
                {itemScope}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 overflow-hidden rounded-md border border-line bg-white xl:order-1">
          <div className="border-b border-line p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority Queue</div>
            <div className="mt-1 text-sm text-slate-600">{filteredItems.length} item(s) in {scope}</div>
          </div>

          <div className="max-h-[42rem] overflow-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Issue Type</th>
                <th className="px-4 py-3">Issue</th>
                <th className="px-4 py-3">AI System</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {filteredItems.map((item) => {
                const selectedRow = selected?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    className={selectedRow ? "bg-sky-50" : "hover:bg-panel"}
                  >
                    <td className="px-4 py-4">
                      <button type="button" onClick={() => setSelectedId(item.id)} className="text-left text-xs font-semibold uppercase tracking-wide text-brand">
                        {item.issueType}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button type="button" onClick={() => setSelectedId(item.id)} className="max-w-md text-left">
                        <span className="block font-semibold text-ink">{item.issue}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{item.nextStep}</span>
                      </button>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{item.impactedAiSystem}</td>
                    <td className="px-4 py-4 text-slate-700">{item.owner}</td>
                    <td className="px-4 py-4 text-slate-700">{item.dueDate}</td>
                    <td className="px-4 py-4"><StatusBadge status={item.severity} /></td>
                    <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        <div className="order-1 xl:order-2">
          {selected ? <SelectedItemPanel item={selected} /> : null}
        </div>
      </section>
    </div>
  );
}

function SelectedItemPanel({ item }: { item: GovernanceWorkItem }) {
  return (
    <section className="space-y-5">
      <article className="rounded-md border border-line bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand">Selected item</div>
            <h2 className="mt-1 text-xl font-semibold text-ink">{item.issue}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {item.issueType} for {item.impactedAiSystem}. Owner: {item.owner}. Due: {item.dueDate}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={item.severity} />
            <StatusBadge status={item.status} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ExplanationCard title="Why this exists" text={item.why} />
          <ExplanationCard title="Evidence used" text={item.evidenceUsed} />
          <ExplanationCard title="Impact" text={item.impact} />
          <ExplanationCard title="What happens next" text={item.nextStep} />
        </div>

        <div className="mt-4 rounded-md border border-line bg-panel p-4">
          <div className="text-sm font-semibold text-ink">Recommended action</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{item.recommendedAction}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton label={item.actionLabel} primary />
          <ActionButton label="Request Evidence" />
          <ActionButton label="Review Exception" />
          <ActionButton label="Accept Risk" />
          <ActionButton label="Escalate" />
          <ActionButton label="Verify Evidence" />
          <Link href={item.exactObjectHref} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">
            Review exact object
          </Link>
        </div>
      </article>

      <aside className="space-y-5">
        <ProofChain steps={[
          { stage: "control", title: item.controlId, detail: "Control or governance object affected by this item.", href: item.controlId.startsWith("AI-") || item.controlId.includes("-") ? `/controls/${item.controlId}` : undefined, status: item.controlId === "Unmapped" ? "MISSING" : "PRESENT" },
          { stage: "requirement", title: item.evidenceRequirement, detail: "Evidence expectation or review requirement.", status: item.evidenceRequirement === "Unmapped" ? "MISSING" : "PRESENT" },
          { stage: "source", title: item.evidenceSource, detail: "Source system, connector, or governance record used.", status: item.evidenceSource === "Unmapped" ? "MISSING" : "PRESENT" },
          { stage: "artifact", title: item.evidenceArtifact, detail: "Artifact, metadata record, finding, or validation evidence.", status: item.evidenceArtifact === "Missing" ? "MISSING" : "PRESENT" },
          { stage: "assurance", title: item.assuranceStatus, detail: "Current validation or confidence state.", status: item.assuranceStatus },
          { stage: "traceability", title: item.traceability, detail: "How this links back to governance ownership.", status: "PRESENT" },
          { stage: "package", title: item.packageStatus, detail: "Whether this can support audit or committee review.", status: item.packageStatus === "Package-ready" ? "PASS" : "WARNING" }
        ]} />

        <div className="rounded-md border border-line bg-white p-4">
          <div className="text-sm font-semibold text-ink">Workflow State</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {workflowStates.map((state) => (
              <span
                key={state}
                className={`rounded border px-3 py-2 text-xs font-semibold ${state === item.workflowState ? "border-brand bg-sky-50 text-brand" : "border-line bg-panel text-slate-600"}`}
              >
                {state}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            Why this matters: the workflow state shows whether governance is waiting on evidence, remediation, exception handling, risk acceptance, or closure.
          </p>
        </div>
      </aside>
    </section>
  );
}

function ExplanationCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded border border-line bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function ActionButton({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <button
      type="button"
      className={`rounded border px-3 py-2 text-xs font-semibold ${primary ? "border-brand bg-brand text-white" : "border-line bg-panel text-slate-700 hover:bg-white"}`}
    >
      {label}
    </button>
  );
}
