import Link from "next/link";
import { AlertTriangle, ClipboardCheck, FileWarning, Gauge, Landmark, ShieldCheck, Sparkles } from "lucide-react";
import { getExecutiveCommandCenter } from "../data";
import { ProgressBar, MaturityCard } from "../components/dashboard";
import { Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function ExecutivePage() {
  const data = await getExecutiveCommandCenter();
  const totalEvidence = data.evidenceHealth.length;

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Executive command center</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">AI Governance portfolio health</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Board-ready view of AI systems, risk exposure, evidence health, regulatory coverage, open issues, and governance maturity.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4 xl:grid-cols-7">
        <Metric label="AI Systems" value={data.kpis.totalSystems} icon={Sparkles} />
        <Metric label="High Risk" value={data.kpis.highRiskSystems} icon={Gauge} />
        <Metric label="Critical Findings" value={data.kpis.criticalFindings} icon={FileWarning} />
        <Metric label="Open Findings" value={data.kpis.openFindings} icon={AlertTriangle} />
        <Metric label="Active Exceptions" value={data.kpis.activeExceptions} icon={ShieldCheck} />
        <Metric label="Evidence Health" value={`${data.kpis.evidenceHealthPct}%`} icon={ClipboardCheck} />
        <Metric label="Reg Coverage" value={`${data.kpis.regulatoryCoverage}%`} icon={Landmark} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-line bg-white p-5">
          <h2 className="text-base font-semibold text-ink">Portfolio summary</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Travel Brain is operating as the production-ready AI system with current evidence and no findings. Legacy Branch Assistant remains the audit case study with evidence and oversight gaps that demonstrate monitoring escalation.
          </p>
          <div className="mt-5 grid gap-4">
            <ProgressBar label="Evidence current" value={data.evidenceHealth.filter((record) => record.health === "CURRENT").length} total={totalEvidence} />
            <ProgressBar label="Regulatory coverage average" value={data.kpis.regulatoryCoverage} total={100} tone="amber" />
            <ProgressBar label="Monitoring pass rate" value={data.testRuns.filter((run) => run.result === "PASS").length} total={data.testRuns.length} />
          </div>
        </div>
        <div className="rounded-md border border-line bg-white p-5">
          <h2 className="text-base font-semibold text-ink">Executive actions</h2>
          <div className="mt-4 space-y-3">
            <Action href="/systems/legacy-branch-assistant/monitoring" label="Review Legacy Branch Assistant findings" status="FAIL" />
            <Action href="/evidence" label="Inspect evidence health gaps" status="WARNING" />
            <Action href="/regulatory-coverage" label="Review regulatory open gaps" status="WARNING" />
          </div>
        </div>
      </div>

      <Section title="Governance maturity">
        <div className="grid gap-4 md:grid-cols-2">
          {data.maturity.map(({ system, maturity }) => (
            <MaturityCard key={system.id} name={system.name} score={maturity.score} level={maturity.level} />
          ))}
        </div>
      </Section>
    </>
  );
}

function Action({ href, label, status }: { href: string; label: string; status: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded border border-line bg-panel p-3 text-sm hover:bg-white">
      <span className="font-medium text-ink">{label}</span>
      <StatusBadge status={status} />
    </Link>
  );
}
