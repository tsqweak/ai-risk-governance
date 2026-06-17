import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ClipboardCheck, Cpu, FileCheck2, Gauge, Landmark, Radar, ShieldCheck } from "lucide-react";
import { getAiSystemWorkspace } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { ActionRequiredList, LearningPanel, Metric, RiskBadge, Section, StatusBadge, WorkflowContext } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function SystemWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemWorkspace(slug);
  if (!system) notFound();
  const failedRuns = system.testRuns.filter((run) => run.result === "FAIL");
  const evidenceIssues = system.evidenceHealth.filter((record) => record.health !== "CURRENT" || record.validation !== "VALID");
  const openFindings = system.findings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS");
  const actionItems = [
    ...openFindings.slice(0, 4).map((finding) => ({
      href: `/systems/${slug}/monitoring#finding-${finding.findingId}`,
      title: `${finding.findingId} · ${finding.title}`,
      detail: finding.description,
      status: finding.severity,
      owner: finding.owner,
      dueDate: formatDate(finding.remediationTargetDate),
      severity: finding.severity,
      category: "Control Finding",
      actionLabel: "Review Finding",
      impact: finding.description,
      evidenceUsed: `${finding.controlTest.testId} · ${finding.controlTest.title}`,
      nextStep: "Review Finding",
      recommendedAction: "Review impact, update remediation evidence, or document an exception."
    })),
    ...failedRuns.slice(0, 3).map((run) => ({
      href: `/systems/${slug}/monitoring#run-${run.id}`,
      title: `${run.controlTest.testId} failed`,
      detail: run.resultDetails,
      status: run.result,
      owner: system.riskOwner || system.businessOwner,
      dueDate: "Immediate review",
      severity: run.controlTest.severityIfFailed,
      category: "Failed Validation",
      actionLabel: "Remediate Control",
      impact: run.controlTest.whyItMatters,
      evidenceUsed: `${run.controlTest.testId} · ${run.evidenceReference}`,
      nextStep: "Remediate Control",
      recommendedAction: "Review the failed test and supporting evidence before the next control cycle."
    })),
    ...evidenceIssues.slice(0, 3).map((record) => ({
      href: `/evidence-health#evidence-health-${record.id}`,
      title: `${record.evidenceRequirement.evidenceType} evidence is ${humanize(record.health)}`,
      detail: record.rationale,
      status: record.health,
      owner: system.businessOwner,
      dueDate: "Before audit package",
      severity: record.health === "MISSING" || record.health === "EXPIRED" ? "HIGH" : "MEDIUM",
      category: "Evidence Gap",
      actionLabel: "Request Evidence",
      impact: `Control ${record.evidenceRequirement.controlId} may not be audit-ready until evidence is refreshed.`,
      evidenceUsed: `${record.evidenceRequirement.evidenceType} · ${record.validation}`,
      nextStep: "Request Evidence",
      recommendedAction: "Refresh or attach evidence to the mapped requirement."
    }))
  ].slice(0, 7);
  const latestAuditEvent = system.auditEvents[0];
  const blockingGovernance = openFindings.length + failedRuns.length;
  const blockingAudit = evidenceIssues.filter((record) => record.health === "MISSING" || record.health === "EXPIRED" || record.validation === "INVALID").length;

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Workspace overview</p>
        <h2 className="mt-1 text-3xl font-semibold text-ink">Compliance, governance, and risk in one system view</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Start here to understand what is happening, why it matters, what evidence exists, and what action is required for this AI system.
        </p>
        <WorkflowContext
          title="System owner workflow"
          why="This workspace explains the health of one governed AI system across controls, evidence, monitoring, risk, and audit readiness."
          next="Start with System Health Summary, clear System Action Required items, then use the tabs above to review the exact supporting evidence or monitoring record."
          backHref="/"
          backLabel="Back to AI Systems"
        />
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4 xl:grid-cols-7">
        <Metric label="Reg exposure" value={system.workspaceMetrics.regulatoryExposure} icon={Landmark} />
        <Metric label="Controls" value={system.workspaceMetrics.controls} icon={ShieldCheck} />
        <Metric label="Evidence" value={`${system.workspaceMetrics.evidenceHealthPct}%`} icon={FileCheck2} />
        <Metric label="Monitoring" value={`${system.workspaceMetrics.monitoringPassRate}%`} icon={Radar} />
        <Metric label="Open findings" value={system.workspaceMetrics.openFindings} icon={AlertTriangle} />
        <Metric label="Risks" value={system.workspaceMetrics.risks} icon={Gauge} />
        <Metric label="Implementations" value={system.workspaceMetrics.implementations} icon={Cpu} />
      </div>

      <Section title="System Health Summary">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <HealthCard title="What changed?" value={latestAuditEvent ? latestAuditEvent.summary : "No recent audit events recorded."} detail={latestAuditEvent ? `${latestAuditEvent.actor} · ${formatDate(latestAuditEvent.createdAt)}` : "Audit trail has no current event."} />
          <HealthCard title="Requires action" value={`${actionItems.length} open item(s)`} detail={actionItems.length ? "Review the prioritized queue below." : "No owner action currently required."} />
          <HealthCard title="Blocking governance" value={`${blockingGovernance} issue(s)`} detail={blockingGovernance ? "Open findings or failed validations require governance review." : "No governance blockers found."} />
          <HealthCard title="Blocking audit" value={`${blockingAudit} evidence issue(s)`} detail={blockingAudit ? "Missing, expired, or invalid evidence can block audit packaging." : "Evidence posture does not currently block audit packaging."} />
        </div>
      </Section>

      <Section title="System Action Required">
        <ActionRequiredList items={actionItems} />
      </Section>

      <Section title="Governance story">
        <div className="grid gap-4 lg:grid-cols-3">
          <LearningPanel title="Compliance">
            Regulatory obligations are mapped to controls and evidence so audit and compliance teams can trace expectations to proof.
          </LearningPanel>
          <LearningPanel title="Governance">
            Lifecycle gates, ownership, approval records, authority boundaries, and engineering implementations show whether the system is governed.
          </LearningPanel>
          <LearningPanel title="Risk">
            Inherent and residual risks, monitoring results, findings, and exceptions show whether AI risk remains inside appetite.
          </LearningPanel>
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-md border border-line bg-white p-5">
          <h3 className="text-base font-semibold text-ink">System profile</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">{system.businessPurpose}</p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <Fact label="Use case" value={system.useCaseType} />
            <Fact label="Environment" value={humanize(system.environment)} />
            <Fact label="Next review" value={formatDate(system.nextReviewDate)} />
            <Fact label="Business owner" value={system.businessOwner} />
            <Fact label="Technology owner" value={system.technologyOwner} />
            <Fact label="Executive sponsor" value={system.executiveSponsor} />
          </dl>
        </section>

        <section className="rounded-md border border-line bg-white p-5">
          <h3 className="text-base font-semibold text-ink">Decisions and blockers</h3>
          <div className="mt-4 grid gap-3">
            {system.findings.slice(0, 4).map((finding) => (
              <Link key={finding.id} href={`/systems/${slug}/monitoring#finding-${finding.findingId}`} className="rounded border border-line bg-panel p-3 hover:bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{finding.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{finding.controlTest.testId} · {finding.owner}</div>
                  </div>
                  <StatusBadge status={finding.severity} />
                </div>
              </Link>
            ))}
            {system.findings.length === 0 ? <p className="text-sm text-slate-600">No open governance blockers for this system.</p> : null}
          </div>
        </section>
      </div>

      <Section title="Evidence as proof">
        <div className="grid gap-3 md:grid-cols-2">
          {system.evidenceObjects.slice(0, 6).map((evidence) => (
            <Link key={evidence.id} href={`/evidence/${evidence.evidenceId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{evidence.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{evidence.evidenceType} · Owner {evidence.owner}</div>
                </div>
                <StatusBadge status={evidence.status} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Workspace navigation">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <WorkspaceLink href={`/systems/${slug}/risk`} title="Risk" detail="Risk register, residual risk, treatment plans, and acceptances." />
          <WorkspaceLink href={`/systems/${slug}/regulations`} title="Regulations" detail="Regulatory exposure, coverage, and traceability." />
          <WorkspaceLink href={`/systems/${slug}/controls`} title="Controls" detail="Control design, status, evidence, and testing posture." />
          <WorkspaceLink href={`/systems/${slug}/evidence`} title="Evidence" detail="Evidence objects, requirements, owners, and validation state." />
          <WorkspaceLink href={`/systems/${slug}/monitoring`} title="Monitoring" detail="Continuous control tests, findings, and exceptions." />
          <WorkspaceLink href={`/systems/${slug}/governance-engineering`} title="Governance Engineering" detail="Control to implementation to evidence to monitoring." />
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function WorkspaceLink({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <Link href={href} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </Link>
  );
}

function HealthCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
  );
}
