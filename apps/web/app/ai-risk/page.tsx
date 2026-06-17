import Link from "next/link";
import { AlertTriangle, ClipboardCheck, GitCompare, ListChecks, ShieldAlert, Target } from "lucide-react";
import { getAiRiskDashboard } from "../data";
import { formatDate, humanize } from "../components/format";
import { LearningPanel, Metric, RiskBadge, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function AiRiskPage() {
  const data = await getAiRiskDashboard();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI risk assessment framework</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">AI risk register and residual risk posture</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Enterprise risk view of AI-specific risks, inherent and residual ratings, treatments, acceptances, linked controls, evidence, and findings.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Risks" value={data.kpis.totalRisks} icon={ShieldAlert} />
        <Metric label="Open Risks" value={data.kpis.openRisks} icon={AlertTriangle} />
        <Metric label="Accepted" value={data.kpis.acceptedRisks} icon={ClipboardCheck} />
        <Metric label="Critical Residual" value={data.kpis.criticalResidual} icon={Target} />
        <Metric label="High Residual" value={data.kpis.highResidual} icon={GitCompare} />
      </div>

      <Section title="Educational Layer">
        <div className="grid gap-4 lg:grid-cols-3">
          {data.risks.slice(0, 3).map((risk) => (
            <LearningPanel key={risk.id} title={risk.title}>
              <div className="grid gap-2">
                <p><span className="font-semibold">Risk Description:</span> {risk.description}</p>
                <p><span className="font-semibold">Controls:</span> {risk.controlLinks.map((link) => link.control.code).join(", ") || "No linked controls"}</p>
                <p><span className="font-semibold">Residual Risk Logic:</span> {risk.residualRiskLogic}</p>
                <p><span className="font-semibold">Travel Brain Example:</span> Travel Brain risks show how customer-facing recommendation risk can be reduced through bounded authority, evidence, and oversight.</p>
              </div>
            </LearningPanel>
          ))}
        </div>
      </Section>

      <Section title="Open Risks">
        <div className="grid gap-3">
          {data.openRisks.map((risk) => (
            <Link key={risk.id} href={`/systems/${risk.aiSystem.slug}/risk`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{risk.riskId} · {risk.title}</div>
                  <p className="mt-1 text-sm text-slate-700">{risk.description}</p>
                  <div className="mt-2 text-xs text-slate-500">{risk.aiSystem.name} · {risk.category} · review {formatDate(risk.reviewDate)}</div>
                </div>
                <div className="flex gap-2">
                  <RiskBadge level={risk.residualRating} />
                  <StatusBadge status={risk.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Panel title="Risks by Category" entries={data.byCategory} />
        <Panel title="Residual Rating" entries={data.byResidual} risk />
        <Panel title="Accepted Risks" entries={Object.fromEntries(data.acceptedRisks.map((risk) => [risk.title, 1]))} />
        <Panel title="Treatment Plans" entries={data.byTreatment} />
      </div>

      <Section title="Inherent vs Residual">
        <div className="rounded-md border border-line bg-white">
          {data.risks.map((risk) => (
            <div key={risk.id} className="grid gap-3 border-b border-line p-4 last:border-0 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <div>
                <div className="text-sm font-semibold text-ink">{risk.title}</div>
                <div className="mt-1 text-xs text-slate-500">{risk.aiSystem.name} · {risk.category}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Inherent</div>
                <div className="mt-1"><RiskBadge level={risk.inherentRating} /></div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Residual</div>
                <div className="mt-1"><RiskBadge level={risk.residualRating} /></div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Treatment</div>
                <div className="mt-1"><StatusBadge status={risk.treatment} /></div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function Panel({ title, entries, risk = false }: { title: string; entries: Record<string, number>; risk?: boolean }) {
  return (
    <section className="rounded-md border border-line bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <ListChecks className="h-4 w-4 text-brand" />
        {title}
      </h2>
      <div className="mt-4 divide-y divide-line">
        {Object.entries(entries).length === 0 ? <p className="py-3 text-sm text-slate-600">No records.</p> : null}
        {Object.entries(entries).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
            <div className="text-slate-700">{humanize(label)}</div>
            <div>{risk ? <RiskBadge level={label} /> : <span className="font-semibold text-ink">{value}</span>}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
