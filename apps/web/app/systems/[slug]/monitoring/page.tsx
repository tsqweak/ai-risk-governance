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
          {system.testRuns.map((run) => (
            <div key={run.id} className="flex flex-col gap-2 border-b border-line p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-ink">{run.controlTest.testId} · {run.controlTest.title}</div>
                <div className="mt-1 text-xs text-slate-500">{formatDate(run.executionDate)} · {run.evidenceReference}</div>
                <p className="mt-2 text-sm text-slate-700">{run.resultDetails}</p>
              </div>
              <StatusBadge status={run.result} />
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Findings">
          <div className="rounded-md border border-line bg-white">
            {system.findings.length > 0 ? system.findings.map((finding) => (
              <div key={finding.id} className="border-b border-line p-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{finding.findingId}</div>
                    <div className="mt-1 text-xs text-slate-500">Owner: {finding.owner} · Target {formatDate(finding.remediationTargetDate)}</div>
                  </div>
                  <div className="flex gap-2"><StatusBadge status={finding.severity} /><StatusBadge status={finding.status} /></div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{finding.description}</p>
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
