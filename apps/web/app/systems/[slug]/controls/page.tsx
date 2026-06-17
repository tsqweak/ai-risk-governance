import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardCheck, FileSearch, GitBranch, Radar } from "lucide-react";
import { getAiSystemWorkspace } from "../../../data";
import { formatDate, humanize } from "../../../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function SystemControlsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemWorkspace(slug);
  if (!system) notFound();
  const controlEvidence = new Map<string, typeof system.evidenceObjects>();
  for (const evidence of system.evidenceObjects) {
    for (const link of evidence.requirementLinks) {
      const current = controlEvidence.get(link.evidenceRequirement.controlId) ?? [];
      controlEvidence.set(link.evidenceRequirement.controlId, [...current, evidence]);
    }
  }

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Controls</p>
        <h2 className="mt-1 text-3xl font-semibold text-ink">{system.name} control posture</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Control design, ownership, operating status, and evidence paths for the selected AI system.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Controls" value={system.systemControls.length} icon={ClipboardCheck} />
        <Metric label="Evidence Objects" value={system.evidenceObjects.length} icon={FileSearch} />
        <Metric label="Monitoring Tests" value={system.testRuns.length} icon={Radar} />
        <Metric label="Findings" value={system.findings.length} icon={GitBranch} />
      </div>

      <Section title="Why this matters">
        <LearningPanel title="Controls to Assurance">
          A control is useful when it has an owner, operating status, evidence, monitoring, and an implementation path where technical enforcement matters.
        </LearningPanel>
      </Section>

      <Section title="System controls">
        <div className="grid gap-3">
          {system.systemControls.map(({ id, control, auditStatus, notes }) => {
            const evidence = controlEvidence.get(control.code) ?? [];
            const runs = system.testRuns.filter((run) => run.evidenceReference.includes(control.code) || run.resultDetails.includes(control.code));
            const findings = system.findings.filter((finding) => finding.description.includes(control.code) || finding.title.includes(control.title));
            const exceptions = findings.flatMap((finding) => finding.exceptions);
            return (
            <article key={id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{control.code} · {control.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{humanize(control.category)} · Owner {control.ownerRole} · {control.testingFrequency}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{notes || control.description}</p>
                </div>
                <StatusBadge status={auditStatus} />
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <AssuranceBox title="Evidence" status={evidence.length > 0 ? "COLLECTED" : "MISSING"}>
                  {evidence.length > 0 ? evidence.map((item) => (
                    <Link key={item.id} href={`/evidence/${item.evidenceId}`} className="block text-xs font-semibold text-brand hover:text-blue-700">
                      {item.evidenceId} · {item.title}
                    </Link>
                  )) : <span>No directly linked evidence object.</span>}
                </AssuranceBox>
                <AssuranceBox title="Review & Approval History" status={auditStatus}>
                  <div>Owner: {control.ownerRole}</div>
                  <div>Review cadence: {control.testingFrequency}</div>
                  <div>Approvals: {system.lifecycleApprovals.filter((approval) => approval.status === "APPROVED").length} approved lifecycle records</div>
                </AssuranceBox>
                <AssuranceBox title="Monitoring, Findings & Exceptions" status={findings.length > 0 ? "OPEN" : runs.length > 0 ? "PASS" : "NEEDS_ATTENTION"}>
                  <div>Tests: {runs.length || system.testRuns.length} monitored runs</div>
                  <div>Findings: {findings.length}</div>
                  <div>Exceptions: {exceptions.length}</div>
                </AssuranceBox>
              </div>
            </article>
          );})}
        </div>
      </Section>
    </>
  );
}

function AssuranceBox({ title, status, children }: { title: string; status: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-panel p-3 text-xs leading-5 text-slate-700">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-ink">{title}</div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-2 grid gap-1">{children}</div>
    </div>
  );
}
