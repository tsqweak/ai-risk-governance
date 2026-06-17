import Link from "next/link";
import { AlertTriangle, Boxes, ClipboardCheck, Factory, History, Hourglass } from "lucide-react";
import { getAiLifecycleDashboard } from "../data";
import { formatDate, humanize } from "../components/format";
import { LearningPanel, Metric, RiskBadge, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

const lifecycleEducation = {
  PROPOSED: {
    traditional: "Technology intake and demand governance",
    ai: "AI use cases need intake that captures purpose, owners, data, jurisdictions, autonomy, and expected impact.",
    approvals: "AI Intake",
    evidence: "Intake record, business purpose, owner attestation, preliminary risk screen"
  },
  DEVELOPMENT: {
    traditional: "Project delivery controls and design approval",
    ai: "AI development needs approved risk tiering, regulatory applicability, model/prompt design, and control design before testing.",
    approvals: "AI Intake, Risk Assessment, Regulatory Mapping",
    evidence: "Risk assessment, architecture, data inventory, regulatory mapping"
  },
  TESTING: {
    traditional: "Testing, validation, and release readiness",
    ai: "AI testing needs validation of models, prompts, data, human oversight, explainability, resilience, and control evidence.",
    approvals: "Risk Assessment, Regulatory Mapping, Evidence Completeness, Validation",
    evidence: "Validation report, testing results, evidence package, oversight procedure"
  },
  PILOT: {
    traditional: "Limited release and controlled production-like trial",
    ai: "AI pilots need scoped users, bounded data, monitoring, rollback, escalation, and approval to prevent uncontrolled expansion.",
    approvals: "Pilot Approval",
    evidence: "Pilot approval, monitoring plan, rollback criteria, issue log"
  },
  PRODUCTION: {
    traditional: "Production release approval and operating controls",
    ai: "Production AI needs completed evidence, accepted residual risk, current monitoring, accountable owners, and approved authority boundaries.",
    approvals: "Production Approval",
    evidence: "Production approval, monitoring report, evidence pack, risk acceptance"
  },
  RETIRED: {
    traditional: "System decommissioning and record retention",
    ai: "AI retirement needs tool revocation, evidence preservation, residual obligation closure, and customer or operational impact assessment.",
    approvals: "Retirement Approval",
    evidence: "Retirement approval, access removal record, evidence archive, closure attestation"
  }
} as const;

export default async function AiLifecyclePage() {
  const data = await getAiLifecycleDashboard();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI lifecycle governance</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Stage gates from intake through retirement</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Govern AI systems across proposed, development, testing, pilot, production, and retired stages with approval evidence, gate controls, monitoring, and audit-ready lifecycle history.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Systems" value={data.kpis.systems} icon={Boxes} />
        <Metric label="Pending Approvals" value={data.kpis.pendingApprovals} icon={Hourglass} />
        <Metric label="Blocked Systems" value={data.kpis.blockedSystems} icon={AlertTriangle} />
        <Metric label="Production" value={data.kpis.productionSystems} icon={Factory} />
        <Metric label="Retired" value={data.kpis.retiredSystems} icon={History} />
      </div>

      <Section title="Educational Layer">
        <div className="grid gap-4 lg:grid-cols-3">
          {Object.entries(lifecycleEducation).map(([stage, education]) => (
            <LearningPanel key={stage} title={humanize(stage)}>
              <div className="grid gap-2">
                <p><span className="font-semibold">Traditional Governance Interpretation:</span> {education.traditional}</p>
                <p><span className="font-semibold">AI Governance Interpretation:</span> {education.ai}</p>
                <p><span className="font-semibold">Required Approvals:</span> {education.approvals}</p>
                <p><span className="font-semibold">Required Evidence:</span> {education.evidence}</p>
              </div>
            </LearningPanel>
          ))}
        </div>
      </Section>

      <Section title="Systems by Lifecycle Stage">
        <div className="grid gap-3">
          {data.systems.map((system) => (
            <Link key={system.id} href={`/systems/${system.slug}/lifecycle`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{system.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {humanize(system.lifecycleStatus)} · {system.lifecycleApprovals.length} approval(s) · {system.systemControls.length} lifecycle gate(s)
                  </div>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={system.lifecycleStatus} />
                  <RiskBadge level={system.assessment?.overallRiskTier ?? "LOW"} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Registry
          title="Pending Approvals"
          rows={data.pendingApprovals.map((approval) => [
            approval.approvalId,
            approval.aiSystem.name,
            approval.approvalType,
            approval.status
          ])}
        />
        <Registry
          title="Blocked Systems"
          rows={data.blockedSystems.map((system) => [
            system.name,
            humanize(system.lifecycleStatus),
            `${system.findings.length} lifecycle finding(s)`,
            system.systemControls.some((mapping) => mapping.auditStatus === "BLOCKED") ? "BLOCKED" : "OPEN"
          ])}
        />
        <Registry
          title="Production Systems"
          rows={data.productionSystems.map((system) => [
            system.name,
            system.businessOwner,
            formatDate(system.nextReviewDate),
            system.lifecycleStatus
          ])}
        />
        <Registry
          title="Retired Systems"
          rows={data.retiredSystems.map((system) => [
            system.name,
            system.businessOwner,
            formatDate(system.nextReviewDate),
            system.lifecycleStatus
          ])}
        />
      </div>

      <Section title="Lifecycle Controls">
        <div className="grid gap-3 md:grid-cols-2">
          {data.lifecycleControls.map(({ id, control, aiSystem, auditStatus }) => (
            <article key={id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{control.code} · {control.title}</div>
                  <p className="mt-1 text-xs text-slate-500">{aiSystem.name} · {control.ownerRole}</p>
                </div>
                <StatusBadge status={auditStatus} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{control.description}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

function Registry({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="rounded-md border border-line bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <ClipboardCheck className="h-4 w-4 text-brand" />
        {title}
      </h2>
      <div className="mt-4 divide-y divide-line">
        {rows.length === 0 ? <p className="py-3 text-sm text-slate-600">No records.</p> : null}
        {rows.map((row) => (
          <div key={row.join("-")} className="grid gap-2 py-3 text-sm sm:grid-cols-4">
            <div className="font-medium text-ink">{row[0]}</div>
            <div className="text-slate-600">{row[1]}</div>
            <div className="text-slate-600">{row[2]}</div>
            <div><StatusBadge status={row[3]} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
