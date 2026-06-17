import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, ClipboardCheck, FileWarning } from "lucide-react";
import { getAiSystemMonitoring } from "../../../data";
import { formatDate } from "../../../components/format";
import { Metric, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function AiSystemMonitoringPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemMonitoring(slug);
  if (!system) notFound();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI System Monitoring</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">{system.name}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Control health, recent monitoring activity, findings, exceptions, and evidence status for this AI system.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Pass" value={system.controlHealth.PASS ?? 0} icon={CheckCircle2} />
        <Metric label="Warnings" value={system.controlHealth.WARNING ?? 0} icon={AlertTriangle} />
        <Metric label="Fail" value={system.controlHealth.FAIL ?? 0} icon={FileWarning} />
        <Metric label="Evidence objects" value={system.evidenceObjects.length} icon={ClipboardCheck} />
      </div>

      <Section title="Recent test runs">
        <div className="rounded-md border border-line bg-white">
          {system.testRuns.map((run) => {
            const linkedFinding = system.findings.find((finding) => finding.controlTestId === run.controlTestId);
            return (
            <div id={`run-${run.id}`} key={run.id} className="scroll-mt-32 flex flex-col gap-2 border-b border-line p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-ink">{run.controlTest.testId} · {run.controlTest.title}</div>
                <div className="mt-1 text-xs text-slate-500">{formatDate(run.executionDate)} · {run.evidenceReference}</div>
                <p className="mt-2 text-sm text-slate-700">{run.resultDetails}</p>
                <div className="mt-3 grid gap-2 rounded border border-line bg-panel p-3 text-xs leading-5 text-slate-600 md:grid-cols-3">
                  <div><span className="font-semibold text-ink">Evidence Reviewed:</span> {run.evidenceReference}</div>
                  <div><span className="font-semibold text-ink">Owner:</span> {system.businessOwner} / {system.riskOwner || "Unassigned"}</div>
                  <div><span className="font-semibold text-ink">Linked Findings:</span> {system.findings.filter((finding) => finding.controlTestId === run.controlTestId).length}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {linkedFinding ? <Link href={`/findings#finding-${linkedFinding.findingId}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">
                    Review linked finding
                  </Link> : null}
                  <Link href={`/systems/${slug}/evidence`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">
                    Review supporting evidence
                  </Link>
                </div>
              </div>
              <StatusBadge status={run.result} />
            </div>
          );
          })}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Findings">
          <div className="rounded-md border border-line bg-white">
            {system.findings.length > 0 ? system.findings.map((finding) => (
              <div id={`finding-${finding.findingId}`} key={finding.id} className="scroll-mt-32 border-b border-line p-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{finding.findingId}</div>
                    <div className="mt-1 text-xs text-slate-500">Owner: {finding.owner} · Target {formatDate(finding.remediationTargetDate)}</div>
                  </div>
                  <div className="flex gap-2"><StatusBadge status={finding.severity} /><StatusBadge status={finding.status} /></div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{finding.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/findings#finding-${finding.findingId}`} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Review finding action</Link>
                  <Link href={`/systems/${slug}/controls`} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Remediate control</Link>
                  <Link href={`/exceptions`} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Review exception</Link>
                </div>
              </div>
            )) : <div className="p-4 text-sm text-slate-600">No findings for this AI system.</div>}
          </div>
        </Section>

        <Section title="Evidence status">
          <div className="rounded-md border border-line bg-white p-5">
            <div className="grid gap-3">
              {Object.entries(system.evidenceStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded border border-line bg-panel p-3 text-sm">
                  <StatusBadge status={status} />
                  <span className="font-semibold text-slate-700">{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              {system.evidenceObjects.slice(0, 5).map((evidence) => (
                <Link key={evidence.id} href={`/evidence/${evidence.evidenceId}`} className="rounded border border-line bg-panel p-3 text-xs font-semibold text-slate-700 hover:bg-white">
                  Supporting evidence: {evidence.evidenceId} · {evidence.title}
                </Link>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <Section title="Exceptions">
        <div className="rounded-md border border-line bg-white">
          {system.findings.flatMap((finding) => finding.exceptions).length > 0 ? system.findings.flatMap((finding) => finding.exceptions).map((exception) => (
            <div key={exception.id} className="border-b border-line p-4 last:border-0">
              <div className="text-sm font-semibold text-ink">{exception.exceptionId}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{exception.rationale}</p>
              <div className="mt-1 text-xs text-slate-500">Approved by {exception.approvedBy}; expires {formatDate(exception.expirationDate)}</div>
            </div>
          )) : <div className="p-4 text-sm text-slate-600">No exceptions for this AI system.</div>}
        </div>
      </Section>
    </>
  );
}
