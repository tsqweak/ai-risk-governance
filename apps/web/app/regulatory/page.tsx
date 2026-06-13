import Link from "next/link";
import { FileSearch, Landmark, ShieldCheck, TriangleAlert } from "lucide-react";
import { getRegulationsWithCoverage } from "../data";
import { formatDate } from "../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function RegulatoryDashboardPage() {
  const regulations = await getRegulationsWithCoverage();
  const requirements = regulations.reduce((sum, regulation) => sum + regulation.requirements.length, 0);
  const controls = regulations.reduce((sum, regulation) => sum + regulation.controls.length, 0);
  const openGaps = regulations.reduce((sum, regulation) => sum + regulation.coverage.uncoveredRequirements, 0);
  const avgCoverage = Math.round(
    regulations.reduce((sum, regulation) => sum + regulation.coverage.coveragePercentage, 0) / Math.max(regulations.length, 1)
  );

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Regulatory mapping engine</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Regulatory coverage dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Trace regulations to requirements, requirements to controls, controls to evidence, and controls to AI systems.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Regulations" value={regulations.length} icon={Landmark} />
        <Metric label="Requirements" value={requirements} icon={FileSearch} />
        <Metric label="Controls" value={controls} icon={ShieldCheck} />
        <Metric label="Avg coverage" value={`${avgCoverage}%`} icon={TriangleAlert} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LearningPanel title="What regulatory traceability means">
          Traceability connects a supervisory expectation to the exact requirement, control, evidence, and AI system that satisfies it. This is what lets audit and regulator conversations move from opinion to proof.
        </LearningPanel>
        <LearningPanel title="Why coverage is not just a percentage">
          Coverage shows where a requirement has at least one mapped control operating on an AI system. Open gaps identify requirements that need control design, evidence, or implementation work.
        </LearningPanel>
        <LearningPanel title="How auditors use this view">
          Auditors can start with a regulation, inspect requirements, follow mapped controls, and then verify evidence on the AI systems in scope.
        </LearningPanel>
      </div>

      <Section title="Regulations">
        <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Regulation</th>
                <th className="px-4 py-3">Jurisdiction</th>
                <th className="px-4 py-3">Regulator</th>
                <th className="px-4 py-3">Requirements</th>
                <th className="px-4 py-3">Controls</th>
                <th className="px-4 py-3">Coverage</th>
                <th className="px-4 py-3">Open gaps</th>
                <th className="px-4 py-3">Effective</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {regulations.map((regulation) => (
                <tr key={regulation.id} className="hover:bg-panel/70">
                  <td className="px-4 py-4">
                    <Link href={`/regulatory/${regulation.slug}`} className="font-semibold text-ink hover:text-brand">
                      {regulation.name}
                    </Link>
                    <div className="mt-1 text-xs text-slate-500">{regulation.status}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{regulation.jurisdiction}</td>
                  <td className="px-4 py-4 text-slate-700">{regulation.regulator}</td>
                  <td className="px-4 py-4 text-slate-700">{regulation.coverage.totalRequirements}</td>
                  <td className="px-4 py-4 text-slate-700">{regulation.controls.length}</td>
                  <td className="px-4 py-4"><StatusBadge status={`${regulation.coverage.coveragePercentage}%`} /></td>
                  <td className="px-4 py-4 text-slate-700">{regulation.coverage.uncoveredRequirements}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(regulation.effectiveDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
