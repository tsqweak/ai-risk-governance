import { getExecutiveCommandCenter } from "../../data";
import { MaturityCard, ProgressBar } from "../../components/dashboard";
import { Section, StatusBadge } from "../../components/ui";
import { formatDate } from "../../components/format";

export const dynamic = "force-dynamic";

export default async function ExecutiveReportPage() {
  const data = await getExecutiveCommandCenter();
  const topRisks = data.findings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS").slice(0, 5);

  return (
    <>
      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium text-brand">Executive reporting</p>
        <h1 className="mt-1 text-4xl font-semibold text-ink">AI Governance Board Report</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Prepared for Risk Committee, CIO/CRO leadership, Internal Audit, and regulatory demonstration.</p>
      </header>
      <Section title="Portfolio Summary">
        <div className="grid gap-4 md:grid-cols-4">
          <ReportMetric label="AI systems" value={data.kpis.totalSystems} />
          <ReportMetric label="Open findings" value={data.kpis.openFindings} />
          <ReportMetric label="Evidence health" value={`${data.kpis.evidenceHealthPct}%`} />
          <ReportMetric label="Reg coverage" value={`${data.kpis.regulatoryCoverage}%`} />
        </div>
      </Section>
      <Section title="Top Risks">
        <div className="rounded-md border border-line bg-white">
          {topRisks.map((finding) => (
            <div key={finding.id} className="border-b border-line p-4 last:border-0">
              <div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold text-ink">{finding.title}</div><div className="mt-1 text-xs text-slate-500">{finding.aiSystem.name} · target {formatDate(finding.remediationTargetDate)}</div></div><StatusBadge status={finding.severity} /></div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{finding.description}</p>
            </div>
          ))}
        </div>
      </Section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Regulatory Coverage">
          <div className="rounded-md border border-line bg-white p-5">
            <div className="grid gap-4">{data.regulations.map((regulation) => <ProgressBar key={regulation.id} label={regulation.name} value={regulation.coverage.coveragePercentage} total={100} tone={regulation.coverage.uncoveredRequirements ? "amber" : "teal"} />)}</div>
          </div>
        </Section>
        <Section title="Governance Maturity">
          <div className="grid gap-4">{data.maturity.map(({ system, maturity }) => <MaturityCard key={system.id} name={system.name} score={maturity.score} level={maturity.level} />)}</div>
        </Section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Exceptions">
          <div className="rounded-md border border-line bg-white">{data.activeExceptions.map((exception) => <div key={exception.id} className="border-b border-line p-4 last:border-0"><div className="text-sm font-semibold text-ink">{exception.exceptionId}</div><div className="mt-1 text-xs text-slate-500">{exception.finding.aiSystem.name} · expires {formatDate(exception.expirationDate)}</div></div>)}</div>
        </Section>
        <Section title="Trends">
          <div className="rounded-md border border-line bg-white p-5">
            <ProgressBar label="Monitoring pass rate" value={data.testRuns.filter((run) => run.result === "PASS").length} total={data.testRuns.length} />
            <div className="mt-4"><ProgressBar label="Evidence current" value={data.evidenceHealth.filter((record) => record.health === "CURRENT").length} total={data.evidenceHealth.length} /></div>
          </div>
        </Section>
      </div>
    </>
  );
}

function ReportMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-md border border-line bg-white p-5"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-3 text-3xl font-semibold text-ink">{value}</div></div>;
}
