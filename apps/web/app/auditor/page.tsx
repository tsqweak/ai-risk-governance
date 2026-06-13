import Link from "next/link";
import { AlertTriangle, ClipboardCheck, FileSearch, GitBranch, Radar } from "lucide-react";
import { getExecutiveCommandCenter } from "../data";
import { formatDate } from "../components/format";
import { Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function AuditorPage() {
  const data = await getExecutiveCommandCenter();
  const evidenceGaps = data.evidenceHealth.filter((record) => record.health === "MISSING" || record.health === "EXPIRED");
  const failedRuns = data.testRuns.filter((run) => run.result === "FAIL");

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Auditor workspace</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Audit-ready AI governance workbench</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Start from findings, exceptions, evidence health, traceability, or failed control tests and drill into the supporting AI system record.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Findings" value={data.findings.length} icon={FileSearch} />
        <Metric label="Exceptions" value={data.activeExceptions.length} icon={AlertTriangle} />
        <Metric label="Evidence gaps" value={evidenceGaps.length} icon={ClipboardCheck} />
        <Metric label="Failed tests" value={failedRuns.length} icon={Radar} />
        <Metric label="Trace paths" value={data.regulations.length} icon={GitBranch} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        <Quick href="/findings" label="Findings" />
        <Quick href="/exceptions" label="Exceptions" />
        <Quick href="/evidence" label="Evidence" />
        <Quick href="/traceability" label="Traceability" />
        <Quick href="/control-health" label="Control Testing" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Priority findings">
          <div className="rounded-md border border-line bg-white">
            {data.findings.map((finding) => (
              <Link key={finding.id} href={`/systems/${finding.aiSystem.slug}/monitoring`} className="block border-b border-line p-4 last:border-0 hover:bg-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{finding.findingId}</div>
                    <div className="mt-1 text-xs text-slate-500">{finding.aiSystem.name} · {finding.controlTest.testId}</div>
                  </div>
                  <div className="flex gap-2"><StatusBadge status={finding.severity} /><StatusBadge status={finding.status} /></div>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Evidence gaps">
          <div className="rounded-md border border-line bg-white">
            {evidenceGaps.map((record) => (
              <div key={record.id} className="border-b border-line p-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{record.aiSystem.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{record.evidenceRequirement.evidenceType} · {record.evidenceRequirement.controlId}</div>
                  </div>
                  <StatusBadge status={record.health} />
                </div>
                <p className="mt-2 text-sm text-slate-700">{record.rationale}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Exceptions under audit">
        <div className="rounded-md border border-line bg-white">
          {data.activeExceptions.map((exception) => (
            <div key={exception.id} className="border-b border-line p-4 last:border-0">
              <div className="text-sm font-semibold text-ink">{exception.exceptionId}</div>
              <div className="mt-1 text-xs text-slate-500">{exception.finding.aiSystem.name} · approved by {exception.approvedBy} · expires {formatDate(exception.expirationDate)}</div>
              <p className="mt-2 text-sm text-slate-700">{exception.rationale}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function Quick({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded-md border border-line bg-white px-4 py-3 text-center text-sm font-semibold text-ink hover:bg-panel">{label}</Link>;
}
