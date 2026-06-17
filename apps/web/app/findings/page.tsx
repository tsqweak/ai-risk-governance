import { AlertTriangle, FileWarning, ListChecks, ShieldAlert } from "lucide-react";
import { getFindingsDashboard } from "../data";
import { formatDate } from "../components/format";
import { Breadcrumbs, Metric, Section, StatusBadge, TaskLink, WorkflowContext } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function FindingsPage() {
  const { findings, bySeverity, bySystem, byRegulation, trend } = await getFindingsDashboard();
  const openFindings = findings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS");
  const highPlus = findings.filter((finding) => finding.severity === "CRITICAL" || finding.severity === "HIGH").length;

  return (
    <>
      <header>
        <Breadcrumbs items={[{ label: "Governance", href: "/governance" }, { label: "Findings" }]} />
        <p className="text-sm font-medium text-brand">Findings</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Monitoring findings dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Risk-focused view of open findings by severity, AI system, regulatory theme, and trend.
        </p>
        <WorkflowContext
          title="Findings action model"
          why="Findings are durable governance work items created when monitoring, evidence, or control validation indicates a control may not be operating."
          next="Review the impact, owner, due date, evidence used, and recommended action; then remediate the control, request evidence, review an exception, or accept risk where appropriate."
          backHref="/governance#control-owner-queue"
          backLabel="Back to Control Owner Queue"
        />
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Open findings" value={openFindings.length} icon={FileWarning} />
        <Metric label="High or critical" value={highPlus} icon={ShieldAlert} />
        <Metric label="Accepted" value={findings.filter((finding) => finding.status === "ACCEPTED").length} icon={AlertTriangle} />
        <Metric label="Total findings" value={findings.length} icon={ListChecks} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Findings by severity" data={bySeverity} />
        <Panel title="Findings by AI System" data={bySystem} />
        <Panel title="Findings trend" data={trend} />
      </div>

      <Section title="Findings by regulation">
        <div className="rounded-md border border-line bg-white p-5">
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(byRegulation).map(([regulation, count]) => (
              <div key={regulation} className="flex items-center justify-between rounded border border-line bg-panel p-3 text-sm">
                <span className="font-medium text-ink">{regulation}</span>
                <span className="font-semibold text-slate-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Open finding register">
        <div className="rounded-md border border-line bg-white">
          {findings.map((finding) => (
            <div id={`finding-${finding.findingId}`} key={finding.id} className="scroll-mt-24 border-b border-line p-4 last:border-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{finding.findingId}</div>
                  <div className="mt-1 text-xs text-slate-500">{finding.aiSystem.name} · {finding.controlTest.testId} · Target {formatDate(finding.remediationTargetDate)}</div>
                </div>
                <div className="flex gap-2"><StatusBadge status={finding.severity} /><StatusBadge status={finding.status} /></div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{finding.description}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <ActionFact label="Why this exists" value={finding.controlTest.title} />
                <ActionFact label="Evidence used" value={finding.controlTest.description} />
                <ActionFact label="Impact" value={finding.controlTest.whyItMatters} />
                <ActionFact label="Owner" value={finding.owner} />
              </div>
              <div className="mt-4 rounded border border-line bg-panel p-3 text-sm leading-6 text-slate-700">
                <span className="font-semibold text-ink">Recommended action:</span> Review the failed control context, update supporting evidence or remediation notes, and document exception or risk acceptance if remediation cannot complete by {formatDate(finding.remediationTargetDate)}.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <TaskLink href={`/systems/${finding.aiSystem.slug}/monitoring#finding-${finding.findingId}`}>Review Finding</TaskLink>
                <TaskLink href={`/systems/${finding.aiSystem.slug}/controls`}>Remediate Control</TaskLink>
                <TaskLink href={`/systems/${finding.aiSystem.slug}/monitoring#finding-${finding.findingId}`}>Review Test Evidence</TaskLink>
                <TaskLink href="/exceptions">Review Exception</TaskLink>
                <TaskLink href={`/systems/${finding.aiSystem.slug}/risk`}>Accept Risk</TaskLink>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function ActionFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm leading-6 text-slate-700">{value}</div>
    </div>
  );
}

function Panel({ title, data }: { title: string; data: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(data));
  return (
    <Section title={title}>
      <div className="rounded-md border border-line bg-white p-5">
        <div className="grid gap-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-sm"><span className="font-medium text-ink">{key.replaceAll("_", " ")}</span><span className="text-slate-600">{value}</span></div>
              <div className="mt-2 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-amber-500" style={{ width: `${Math.round((value / max) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
