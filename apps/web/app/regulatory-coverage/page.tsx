import { AlertTriangle, Globe2, Landmark, ShieldCheck } from "lucide-react";
import { getExecutiveCommandCenter } from "../data";
import { ProgressBar } from "../components/dashboard";
import { Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function RegulatoryCoveragePage() {
  const data = await getExecutiveCommandCenter();
  const totalGaps = data.regulations.reduce((sum, regulation) => sum + regulation.coverage.uncoveredRequirements, 0);

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Regulatory coverage center</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Coverage, gaps, findings, and evidence by regulator</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Regulator-friendly view of jurisdiction coverage and evidence health across mapped AI governance obligations.</p>
      </header>
      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Jurisdictions" value={Object.keys(data.coverageByJurisdiction).length} icon={Globe2} />
        <Metric label="Regulations" value={data.regulations.length} icon={Landmark} />
        <Metric label="Open gaps" value={totalGaps} icon={AlertTriangle} />
        <Metric label="Avg coverage" value={`${data.kpis.regulatoryCoverage}%`} icon={ShieldCheck} />
      </div>
      <Section title="Coverage by jurisdiction">
        <div className="rounded-md border border-line bg-white p-5">
          <div className="grid gap-4">
            {Object.entries(data.coverageByJurisdiction).map(([jurisdiction, row]) => (
              <ProgressBar key={jurisdiction} label={`${jurisdiction} (${row.gaps} gaps)`} value={Math.round(row.coverage / row.count)} total={100} tone={row.gaps > 0 ? "amber" : "teal"} />
            ))}
          </div>
        </div>
      </Section>
      <Section title="Coverage by regulation">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Regulation</th><th className="px-4 py-3">Jurisdiction</th><th className="px-4 py-3">Coverage</th><th className="px-4 py-3">Open gaps</th><th className="px-4 py-3">Evidence gaps</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.regulations.map((regulation) => {
                const evidence = data.evidenceByRegulation[regulation.name] ?? { current: 0, gaps: 0, total: 0 };
                return (
                  <tr key={regulation.id}>
                    <td className="px-4 py-4 font-medium text-ink">{regulation.name}</td>
                    <td className="px-4 py-4 text-slate-700">{regulation.jurisdiction}</td>
                    <td className="px-4 py-4"><StatusBadge status={`${regulation.coverage.coveragePercentage}%`} /></td>
                    <td className="px-4 py-4 text-slate-700">{regulation.coverage.uncoveredRequirements}</td>
                    <td className="px-4 py-4 text-slate-700">{evidence.gaps}/{evidence.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
