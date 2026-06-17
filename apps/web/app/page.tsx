import Link from "next/link";
import { Activity, ClipboardCheck, Gauge, Library } from "lucide-react";
import { getAiSystems } from "./data";
import { formatDate } from "./components/format";
import { ActionRequiredList, Breadcrumbs, LearningPanel, Metric, RiskBadge, Section, SecondaryNav, StatusBadge } from "./components/ui";
import { aiSystemsSecondaryNav } from "./navigation-model";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const systems = await getAiSystems();
  const totalControls = systems.reduce((sum, system) => sum + system.systemControls.length, 0);
  const attention = systems.flatMap((system) => system.systemControls).filter((control) => control.auditStatus !== "ON_TRACK").length;
  const reviewedEvidence = systems.flatMap((system) => system.evidenceItems).filter((item) => item.status === "REVIEWED").length;
  const actionItems = systems.flatMap((system) => [
    ...system.systemControls.filter((control) => control.auditStatus !== "ON_TRACK").map((control) => ({
      href: `/systems/${system.slug}/controls`,
      title: `${system.name}: mapped control requires attention`,
      detail: control.notes,
      status: control.auditStatus,
      owner: system.riskOwner,
      category: "Failed Control"
    })),
    ...system.evidenceItems.filter((item) => item.status !== "REVIEWED").map((item) => ({
      href: `/systems/${system.slug}/evidence`,
      title: `${system.name}: ${item.title}`,
      detail: `${item.controlCode} evidence is ${item.status}; due ${formatDate(item.dueDate)}.`,
      status: item.status,
      owner: item.owner,
      category: "Evidence Gap"
    }))
  ]).slice(0, 6);

  return (
    <>
      <header>
        <Breadcrumbs items={[{ label: "AI Systems" }]} />
        <p className="text-sm font-medium text-brand">AI System Inventory</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">Bank-grade AI System Registry</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          A governed inventory for AI systems across business ownership, lifecycle status, risk tiering, control health, evidence, and review cadence.
        </p>
        <SecondaryNav items={aiSystemsSecondaryNav} />
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="AI systems" value={systems.length} icon={Activity} />
        <Metric label="Mapped controls" value={totalControls} icon={Library} />
        <Metric label="Control attention" value={attention} icon={Gauge} />
        <Metric label="Evidence reviewed" value={reviewedEvidence} icon={ClipboardCheck} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LearningPanel title="What is an AI System?">
          An AI System is more than a model. In a bank-grade registry it includes models, agents, prompts, tools, APIs, data sources, workflows, vendors, controls, evidence, and human oversight.
        </LearningPanel>
        <LearningPanel title="Why Risk Tiering Matters">
          Risk tiers help governance teams decide review depth, evidence expectations, control testing frequency, and executive escalation before a system reaches production.
        </LearningPanel>
        <LearningPanel title="Why Ownership Matters">
          Clear business, technology, risk, and executive owners prevent AI systems from becoming orphaned services with unclear accountability during incidents, audits, or regulatory exams.
        </LearningPanel>
      </div>

      <Section title="Action Required">
        <ActionRequiredList items={actionItems} />
      </Section>

      <Section id="system-workspaces" title="Registry">
        <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">System</th>
                <th className="px-4 py-3">Lifecycle</th>
                <th className="px-4 py-3">Environment</th>
                <th className="px-4 py-3">Overall risk</th>
                <th className="px-4 py-3">Business owner</th>
                <th className="px-4 py-3">Risk owner</th>
                <th className="px-4 py-3">Next review</th>
                <th className="px-4 py-3">Control health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {systems.map((system) => {
                const healthy = system.systemControls.filter((control) => control.auditStatus === "ON_TRACK").length;
                const total = system.systemControls.length;
                return (
                  <tr key={system.id} className="hover:bg-panel/70">
                    <td className="px-4 py-4">
                      <Link href={`/systems/${system.slug}`} className="font-semibold text-ink hover:text-brand">
                        {system.name}
                      </Link>
                      <div className="mt-1 text-xs text-slate-500">{system.useCaseType}</div>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={system.lifecycleStatus} /></td>
                    <td className="px-4 py-4 text-slate-700">{system.environment}</td>
                    <td className="px-4 py-4"><RiskBadge level={system.assessment?.overallRiskTier ?? "LOW"} /></td>
                    <td className="px-4 py-4 text-slate-700">{system.businessOwner}</td>
                    <td className="px-4 py-4 text-slate-700">{system.riskOwner}</td>
                    <td className="px-4 py-4 text-slate-700">{formatDate(system.nextReviewDate)}</td>
                    <td className="px-4 py-4 text-slate-700">{healthy}/{total} on track</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section id="owners" title="Owner Coverage">
          <div className="overflow-hidden rounded-md border border-line bg-white">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">System</th><th className="px-4 py-3">Business</th><th className="px-4 py-3">Risk</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {systems.map((system) => (
                  <tr key={system.id}>
                    <td className="px-4 py-4 font-medium text-ink">{system.name}</td>
                    <td className="px-4 py-4 text-slate-700">{system.businessOwner}</td>
                    <td className="px-4 py-4 text-slate-700">{system.riskOwner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section id="lifecycle" title="Lifecycle Coverage">
          <div className="overflow-hidden rounded-md border border-line bg-white">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">System</th><th className="px-4 py-3">Lifecycle</th><th className="px-4 py-3">Next Review</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {systems.map((system) => (
                  <tr key={system.id}>
                    <td className="px-4 py-4 font-medium text-ink">{system.name}</td>
                    <td className="px-4 py-4"><StatusBadge status={system.lifecycleStatus} /></td>
                    <td className="px-4 py-4 text-slate-700">{formatDate(system.nextReviewDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </>
  );
}
