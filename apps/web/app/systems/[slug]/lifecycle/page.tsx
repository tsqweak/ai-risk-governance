import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ClipboardCheck, FileCheck2, Flag, History, ShieldCheck } from "lucide-react";
import { getAiSystemLifecycle } from "../../../data";
import { formatDate, humanize } from "../../../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

const stageEducation = {
  PROPOSED: ["Technology intake", "AI purpose, owners, data, jurisdictions, autonomy, and impact are identified.", "AI Intake", "Intake record and preliminary risk screen"],
  DEVELOPMENT: ["Design and delivery governance", "Risk tiering, regulatory mapping, model/prompt design, and controls are defined.", "Risk Assessment and Regulatory Mapping", "Risk assessment, architecture, data inventory"],
  TESTING: ["Testing and validation", "Models, prompts, controls, oversight, evidence, and resilience are validated before advancement.", "Evidence Completeness and Validation", "Validation report, testing evidence, oversight procedure"],
  PILOT: ["Limited release governance", "Pilot scope, users, data boundaries, rollback, and monitoring are approved.", "Pilot Approval", "Pilot approval, monitoring plan, issue log"],
  PRODUCTION: ["Production release governance", "Production requires completed evidence, accepted residual risk, monitoring, and accountable ownership.", "Production Approval", "Production approval, evidence pack, monitoring report"],
  RETIRED: ["Decommissioning governance", "Retirement preserves evidence, revokes access, closes obligations, and documents residual impact.", "Retirement Approval", "Retirement approval, evidence archive, closure attestation"]
} as const;

export default async function SystemLifecyclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemLifecycle(slug);
  if (!system) notFound();
  const education = stageEducation[system.lifecycleStatus];

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI system lifecycle view</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">{system.name} lifecycle governance</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Lifecycle history, approvals, stage gates, lifecycle findings, and evidence for auditor and regulator review.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Stage" value={humanize(system.lifecycleStatus)} icon={Flag} />
        <Metric label="Approvals" value={system.lifecycleApprovals.length} icon={ClipboardCheck} />
        <Metric label="Stage Gates" value={system.systemControls.length} icon={ShieldCheck} />
        <Metric label="Findings" value={system.findings.length} icon={AlertTriangle} />
        <Metric label="Evidence" value={system.evidenceObjects.length + system.evidenceItems.length} icon={FileCheck2} />
      </div>

      <Section title="Educational Layer">
        <LearningPanel title={humanize(system.lifecycleStatus)}>
          <div className="grid gap-2">
            <p><span className="font-semibold">Traditional Governance Interpretation:</span> {education[0]}</p>
            <p><span className="font-semibold">AI Governance Interpretation:</span> {education[1]}</p>
            <p><span className="font-semibold">Required Approvals:</span> {education[2]}</p>
            <p><span className="font-semibold">Required Evidence:</span> {education[3]}</p>
          </div>
        </LearningPanel>
      </Section>

      <Section title="Lifecycle History">
        <div className="rounded-md border border-line bg-white">
          {system.lifecycleRecords.map((record) => (
            <div key={record.id} className="grid gap-3 border-b border-line p-4 last:border-0 lg:grid-cols-[1fr_1fr_1fr_1fr_2fr]">
              <div>
                <div className="text-xs text-slate-500">Stage</div>
                <div className="mt-1 text-sm font-semibold text-ink">{humanize(record.lifecycleStage)}</div>
              </div>
              <Fact label="Owner" value={record.stageOwner} />
              <Fact label="Entry" value={formatDate(record.stageEntryDate)} />
              <Fact label="Exit" value={formatDate(record.stageExitDate)} />
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={record.approvalStatus} />
                  <History className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-2 text-sm text-slate-700">{record.notes}</p>
                <div className="mt-3 rounded border border-line bg-panel p-3 text-xs leading-5 text-slate-600">
                  <div><span className="font-semibold text-ink">Required Evidence:</span> {stageEducation[record.lifecycleStage][3]}</div>
                  <div><span className="font-semibold text-ink">Review History:</span> Stage owner {record.stageOwner}; entry {formatDate(record.stageEntryDate)}; exit {formatDate(record.stageExitDate)}</div>
                  <div><span className="font-semibold text-ink">Approval Evidence:</span> {system.lifecycleApprovals.filter((approval) => approval.approvalType.includes(stageEducation[record.lifecycleStage][2].split(" ")[0])).length || "Mapped through lifecycle approvals"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Panel title="Approvals">
          {system.lifecycleApprovals.map((approval) => (
            <Row key={approval.id} title={approval.approvalType} subtitle={`${approval.approvalId} · ${approval.approver} · ${formatDate(approval.approvalDate)}`} status={approval.status} detail={`${approval.comments} Approval evidence is retained as a lifecycle authorization record reviewed by ${approval.approver}.`} />
          ))}
        </Panel>
        <Panel title="Stage Gates">
          {system.systemControls.map(({ id, control, auditStatus, notes }) => (
            <Row key={id} title={`${control.code} · ${control.title}`} subtitle={`${humanize(control.category)} · ${control.ownerRole}`} status={auditStatus} detail={`${notes} Gate evidence is supported by lifecycle approvals, evidence objects, monitoring results, and findings where applicable.`} />
          ))}
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Panel title="Findings">
          {system.findings.length === 0 ? <p className="p-4 text-sm text-slate-600">No lifecycle findings.</p> : null}
          {system.findings.map((finding) => (
            <Row key={finding.id} title={finding.title} subtitle={`${finding.findingId} · ${finding.owner}`} status={finding.status} detail={finding.description} />
          ))}
        </Panel>
        <Panel title="Evidence">
          {system.evidenceObjects.map((evidence) => (
            <Link key={evidence.id} href={`/evidence/${evidence.evidenceId}`} className="block hover:bg-panel">
              <Row title={evidence.title} subtitle={`${evidence.evidenceId} · ${evidence.evidenceType} · expires ${formatDate(evidence.expirationDate)}`} status={evidence.status} detail={evidence.description} />
            </Link>
          ))}
          {system.evidenceItems.map((evidence) => (
            <Row key={evidence.id} title={evidence.title} subtitle={`${evidence.controlCode} · due ${formatDate(evidence.dueDate)}`} status={evidence.status} detail={evidence.location} />
          ))}
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-white">
      <h2 className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">{title}</h2>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function Row({ title, subtitle, status, detail }: { title: string; subtitle: string; status: string; detail: string }) {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-ink">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{detail}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
