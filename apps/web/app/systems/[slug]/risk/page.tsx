import { notFound } from "next/navigation";
import { AlertTriangle, ClipboardCheck, FileCheck2, GitCompare, ShieldCheck, Target } from "lucide-react";
import { getAiSystemRisk } from "../../../data";
import { formatDate, humanize } from "../../../components/format";
import { LearningPanel, Metric, RiskBadge, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function SystemRiskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemRisk(slug);
  if (!system) notFound();
  const accepted = system.aiRisks.filter((risk) => risk.status === "ACCEPTED");
  const highResidual = system.aiRisks.filter((risk) => risk.residualRating === "HIGH" || risk.residualRating === "CRITICAL");

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI system risk view</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">{system.name} risk register</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          AI-specific risk register, treatment plans, risk acceptance, linked controls, evidence, findings, and residual risk logic.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Risks" value={system.aiRisks.length} icon={AlertTriangle} />
        <Metric label="Accepted" value={accepted.length} icon={ClipboardCheck} />
        <Metric label="High Residual" value={highResidual.length} icon={Target} />
        <Metric label="Controls" value={new Set(system.aiRisks.flatMap((risk) => risk.controlLinks.map((link) => link.controlId))).size} icon={ShieldCheck} />
        <Metric label="Evidence" value={new Set(system.aiRisks.flatMap((risk) => risk.evidenceLinks.map((link) => link.evidenceObjectId))).size} icon={FileCheck2} />
      </div>

      <Section title="Educational Layer">
        <div className="grid gap-4 lg:grid-cols-2">
          {system.aiRisks.slice(0, 2).map((risk) => (
            <LearningPanel key={risk.id} title={risk.title}>
              <div className="grid gap-2">
                <p><span className="font-semibold">Risk Description:</span> {risk.description}</p>
                <p><span className="font-semibold">Controls:</span> {risk.controlLinks.map((link) => `${link.control.code} ${link.control.title}`).join("; ") || "No linked controls"}</p>
                <p><span className="font-semibold">Residual Risk Logic:</span> {risk.residualRiskLogic}</p>
                <p><span className="font-semibold">Travel Brain Example:</span> Recommendation-only systems reduce residual risk by limiting authority and using oversight evidence.</p>
              </div>
            </LearningPanel>
          ))}
        </div>
      </Section>

      <Section title="Risk Register">
        <div className="grid gap-4">
          {system.aiRisks.map((risk) => (
            <article key={risk.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-ink">{risk.riskId} · {risk.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{risk.description}</p>
                  <div className="mt-2 text-xs text-slate-500">{risk.category} · Owner {risk.owner} · Review {formatDate(risk.reviewDate)}</div>
                </div>
                <div className="flex gap-2">
                  <RiskBadge level={risk.residualRating} />
                  <StatusBadge status={risk.status} />
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <RiskFact label="Inherent" likelihood={risk.inherentLikelihood} impact={risk.inherentImpact} rating={risk.inherentRating} />
                <RiskFact label="Residual" likelihood={risk.residualLikelihood} impact={risk.residualImpact} rating={risk.residualRating} />
                <div className="rounded-md border border-line bg-panel p-3">
                  <div className="text-xs text-slate-500">Treatment</div>
                  <div className="mt-2"><StatusBadge status={risk.treatment} /></div>
                  <p className="mt-2 text-xs leading-5 text-slate-700">{risk.treatmentPlan}</p>
                </div>
                <div className="rounded-md border border-line bg-panel p-3">
                  <div className="text-xs text-slate-500">Acceptance</div>
                  {risk.acceptanceApprover ? (
                    <p className="mt-2 text-xs leading-5 text-slate-700">
                      {risk.acceptanceApprover} · {formatDate(risk.acceptanceApprovalDate)} · expires {formatDate(risk.acceptanceExpirationDate)}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-700">Not accepted</p>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700"><span className="font-semibold">Residual Risk Logic:</span> {risk.residualRiskLogic}</p>
            </article>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <Panel title="Controls">
          {system.aiRisks.flatMap((risk) => risk.controlLinks.map((link) => (
            <Row key={`${risk.id}-${link.id}`} title={link.control.code} subtitle={`${risk.title} · ${link.control.title}`} status={link.control.category} />
          )))}
        </Panel>
        <Panel title="Evidence">
          {system.aiRisks.flatMap((risk) => risk.evidenceLinks.map((link) => (
            <Row key={`${risk.id}-${link.id}`} title={link.evidenceObject.evidenceId} subtitle={`${risk.title} · ${link.evidenceObject.title}`} status={link.evidenceObject.status} />
          )))}
        </Panel>
        <Panel title="Findings">
          {system.aiRisks.flatMap((risk) => risk.findingLinks.map((link) => (
            <Row key={`${risk.id}-${link.id}`} title={link.finding.findingId} subtitle={`${risk.title} · ${link.finding.controlTest.title}`} status={link.finding.status} />
          )))}
        </Panel>
      </div>
    </>
  );
}

function RiskFact({ label, likelihood, impact, rating }: { label: string; likelihood: string; impact: string; rating: string }) {
  return (
    <div className="rounded-md border border-line bg-panel p-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <GitCompare className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2"><RiskBadge level={rating} /></div>
      <div className="mt-2 text-xs leading-5 text-slate-700">Likelihood {humanize(likelihood)} · Impact {humanize(impact)}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode[] }) {
  return (
    <section className="rounded-md border border-line bg-white">
      <h2 className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">{title}</h2>
      <div className="divide-y divide-line">
        {children.length === 0 ? <p className="p-4 text-sm text-slate-600">No linked records.</p> : children}
      </div>
    </section>
  );
}

function Row({ title, subtitle, status }: { title: string; subtitle: string; status: string }) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
