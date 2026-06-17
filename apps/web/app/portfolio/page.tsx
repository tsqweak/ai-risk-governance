import { BarChart3, Boxes, Gauge, TrendingUp } from "lucide-react";
import { getExecutiveCommandCenter } from "../data";
import { MaturityCard, ProgressBar } from "../components/dashboard";
import { ActionRequiredList, Breadcrumbs, Metric, Section, SecondaryNav } from "../components/ui";
import { humanize } from "../components/format";
import { portfolioSecondaryNav } from "../navigation-model";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const data = await getExecutiveCommandCenter();
  const maxFindings = Math.max(1, ...Object.values(data.findingsBySystem));
  const actionItems = [
    ...data.openFindings.slice(0, 4).map((finding) => ({
      href: "/findings",
      title: `${finding.aiSystem.name}: ${finding.title}`,
      detail: `${finding.findingId} is ${humanize(finding.status)} and assigned to ${finding.owner}.`,
      status: finding.severity,
      owner: finding.owner,
      category: "Control Finding"
    })),
    ...data.evidenceHealth.filter((record) => record.health !== "CURRENT" || record.validation !== "VALID").slice(0, 4).map((record) => ({
      href: "/evidence-health",
      title: `${record.aiSystem.name} evidence gap`,
      detail: `${record.evidenceRequirement.evidenceType} is ${humanize(record.health)}.`,
      status: record.health,
      category: "Evidence Gap"
    }))
  ].slice(0, 6);

  return (
    <>
      <header>
        <Breadcrumbs items={[{ label: "Portfolio" }]} />
        <p className="text-sm font-medium text-brand">Portfolio risk</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">AI portfolio dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Risk tiering, lifecycle distribution, findings load, and maturity scoring across AI systems.</p>
        <SecondaryNav items={portfolioSecondaryNav} />
      </header>
      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Systems" value={data.systems.length} icon={Boxes} />
        <Metric label="Risk tiers" value={Object.keys(data.byRiskTier).length} icon={Gauge} />
        <Metric label="Lifecycle stages" value={Object.keys(data.byLifecycle).length} icon={BarChart3} />
        <Metric label="Avg maturity" value={Math.round(data.maturity.reduce((sum, row) => sum + row.maturity.score, 0) / Math.max(data.maturity.length, 1))} icon={TrendingUp} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="AI Systems by risk tier">
          <Panel entries={data.byRiskTier} />
        </Section>
        <Section title="AI Systems by lifecycle">
          <Panel entries={Object.fromEntries(Object.entries(data.byLifecycle).map(([key, value]) => [humanize(key), value]))} tone="amber" />
        </Section>
      </div>
      <Section id="action-required" title="Action Required">
        <ActionRequiredList items={actionItems} />
      </Section>
      <Section title="Findings by system">
        <div className="rounded-md border border-line bg-white p-5">
          <div className="grid gap-4">
            {Object.entries(data.findingsBySystem).map(([system, count]) => (
              <ProgressBar key={system} label={system} value={count} total={maxFindings} tone={count > 0 ? "red" : "teal"} />
            ))}
          </div>
        </div>
      </Section>
      <Section title="Governance maturity scores">
        <div className="grid gap-4 md:grid-cols-2">
          {data.maturity.map(({ system, maturity }) => <MaturityCard key={system.id} name={system.name} score={maturity.score} level={maturity.level} />)}
        </div>
      </Section>
      <Section id="trends" title="Trends">
        <div className="rounded-md border border-line bg-white p-5 text-sm leading-6 text-slate-700">
          Trends are currently represented by lifecycle distribution, risk tier distribution, findings load, and maturity scores above. Phase 10 Analytics & Trends will expand this area without changing the Portfolio ownership model.
        </div>
      </Section>
    </>
  );
}

function Panel({ entries, tone = "teal" }: { entries: Record<string, number>; tone?: "teal" | "amber" }) {
  const max = Math.max(1, ...Object.values(entries));
  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="grid gap-4">
        {Object.entries(entries).map(([label, value]) => <ProgressBar key={label} label={label} value={value} total={max} tone={tone} />)}
      </div>
    </div>
  );
}
