import { AlertTriangle, CheckCircle2, ClipboardList, FileWarning } from "lucide-react";
import { getMonitoringDashboard } from "../data";
import { formatDate } from "../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  const { controlTests, testRuns, findings, exceptions } = await getMonitoringDashboard();
  const passCount = testRuns.filter((run) => run.result === "PASS").length;
  const warningCount = testRuns.filter((run) => run.result === "WARNING").length;
  const failCount = testRuns.filter((run) => run.result === "FAIL").length;
  const openFindings = findings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS").length;

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Continuous control monitoring</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">AI governance operating system</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Continuous checks evaluate AI systems against governance controls, produce test runs, generate findings, and track exceptions.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Passing runs" value={passCount} icon={CheckCircle2} />
        <Metric label="Warnings" value={warningCount} icon={AlertTriangle} />
        <Metric label="Failed runs" value={failCount} icon={FileWarning} />
        <Metric label="Open findings" value={openFindings} icon={ClipboardList} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LearningPanel title="What continuous monitoring means">
          Continuous control monitoring turns governance from a periodic document exercise into repeatable checks that test whether AI systems remain owned, reviewed, evidenced, mapped, and explainable.
        </LearningPanel>
        <LearningPanel title="Why findings matter">
          Findings are durable risk records. They give owners remediation targets, help audit sample issues, and let governance committees see whether accepted risk is temporary or persistent.
        </LearningPanel>
        <LearningPanel title="Why exceptions matter">
          Exceptions document approved risk acceptance with rationale, approver, approval date, and expiration date. They should be time-bound, visible, and reviewed.
        </LearningPanel>
      </div>

      <Section title="Control tests">
        <div className="grid gap-4 md:grid-cols-2">
          {controlTests.map((test) => (
            <article key={test.id} className="rounded-md border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand">{test.testId}</div>
                  <h2 className="mt-2 text-base font-semibold text-ink">{test.title}</h2>
                </div>
                <StatusBadge status={test.severityIfFailed} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{test.description}</p>
              <div className="mt-4 grid gap-3">
                <Explainer label="Traditional Governance Concept" value={test.traditionalGovernanceConcept} />
                <Explainer label="AI Governance Interpretation" value={test.aiGovernanceInterpretation} />
                <Explainer label="Why it matters" value={test.whyItMatters} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Latest test runs">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Test</th>
                <th className="px-4 py-3">AI system</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {testRuns.slice(0, 30).map((run) => (
                <tr key={run.id}>
                  <td className="px-4 py-4 font-medium text-ink">{run.controlTest.testId}</td>
                  <td className="px-4 py-4 text-slate-700">{run.aiSystem.name}</td>
                  <td className="px-4 py-4"><StatusBadge status={run.result} /></td>
                  <td className="px-4 py-4 text-slate-700">{run.resultDetails}</td>
                  <td className="px-4 py-4 text-slate-500">{run.evidenceReference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Findings and exceptions">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-md border border-line bg-white">
            {findings.map((finding) => (
              <div key={finding.id} className="border-b border-line p-4 last:border-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-ink">{finding.findingId} · {finding.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{finding.aiSystem.name} · Owner: {finding.owner} · Target: {formatDate(finding.remediationTargetDate)}</div>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={finding.severity} />
                    <StatusBadge status={finding.status} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{finding.description}</p>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-line bg-white">
            {exceptions.length > 0 ? exceptions.map((exception) => (
              <div key={exception.id} className="border-b border-line p-4 last:border-0">
                <div className="text-sm font-semibold text-ink">{exception.exceptionId}</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{exception.rationale}</p>
                <div className="mt-2 text-xs text-slate-500">Approved by {exception.approvedBy}; expires {formatDate(exception.expirationDate)}</div>
              </div>
            )) : (
              <div className="p-4 text-sm text-slate-600">No exceptions currently recorded.</div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

function Explainer({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm leading-6 text-slate-700">{value}</div>
    </div>
  );
}
