import Link from "next/link";
import { Flame, ShieldAlert, Target } from "lucide-react";
import { getRiskHeatmap } from "../data";
import { Metric, RiskBadge, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

const riskOrder = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const severityOrder = ["NONE", "INFORMATIONAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default async function RiskHeatmapPage() {
  const systems = await getRiskHeatmap();
  const highest = systems.filter((system) => system.highestFindingSeverity === "HIGH" || system.highestFindingSeverity === "CRITICAL").length;

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Risk heatmap</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">AI system risk and finding severity</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Portfolio view plotting inherent AI risk tier against highest open finding severity.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-3">
        <Metric label="AI systems" value={systems.length} icon={Target} />
        <Metric label="High severity exposure" value={highest} icon={ShieldAlert} />
        <Metric label="Open findings" value={systems.reduce((sum, system) => sum + system.openFindingCount, 0)} icon={Flame} />
      </div>

      <Section title="Heatmap">
        <div className="overflow-x-auto rounded-md border border-line bg-white p-5">
          <div className="grid min-w-[760px] grid-cols-[120px_repeat(6,1fr)] gap-2">
            <div />
            {severityOrder.map((severity) => <div key={severity} className="text-center text-xs font-semibold uppercase text-slate-500">{severity}</div>)}
            {riskOrder.map((risk) => (
              <RiskRow key={risk} risk={risk} systems={systems} />
            ))}
          </div>
        </div>
      </Section>

      <Section title="Systems">
        <div className="grid gap-4 md:grid-cols-2">
          {systems.map((system) => (
            <Link key={system.id} href={`/systems/${system.slug}/monitoring`} className="rounded-md border border-line bg-white p-5 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{system.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {system.openFindingCount} open findings · {system.regulatoryExposure} jurisdictions · maturity {system.maturity.score}
                  </div>
                </div>
                <div className="flex gap-2"><RiskBadge level={system.assessment?.overallRiskTier ?? "LOW"} /><StatusBadge status={system.highestFindingSeverity} /></div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

function RiskRow({ risk, systems }: { risk: string; systems: Awaited<ReturnType<typeof getRiskHeatmap>> }) {
  return (
    <>
      <div className="flex items-center text-sm font-semibold text-ink">{risk}</div>
      {severityOrder.map((severity) => {
        const cellSystems = systems.filter((system) => (system.assessment?.overallRiskTier ?? "LOW") === risk && system.highestFindingSeverity === severity);
        return (
          <div key={`${risk}-${severity}`} className={`min-h-24 rounded border border-line p-2 ${cellTone(risk, severity)}`}>
            {cellSystems.map((system) => (
              <div key={system.id} className="mb-1 rounded bg-white/80 px-2 py-1 text-xs font-medium text-ink shadow-sm">
                <div>{system.name}</div>
                <div className="mt-0.5 text-[11px] font-normal text-slate-500">Reg {system.regulatoryExposure} · Maturity {system.maturity.score}</div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

function cellTone(risk: string, severity: string) {
  if (risk === "CRITICAL" || severity === "CRITICAL" || severity === "HIGH") return "bg-red-50";
  if (risk === "HIGH" || severity === "MEDIUM") return "bg-orange-50";
  if (risk === "MEDIUM" || severity === "LOW") return "bg-amber-50";
  return "bg-emerald-50";
}
