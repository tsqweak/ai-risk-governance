import { AlertTriangle, ClipboardCheck, FileWarning, Gauge, Landmark, ShieldCheck, Sparkles } from "lucide-react";
import { getExecutiveCommandCenter } from "../data";
import { ProgressBar, MaturityCard } from "../components/dashboard";
import { ActionRequiredList, Breadcrumbs, Metric, Section, SecondaryNav } from "../components/ui";
import { executiveSecondaryNav } from "../navigation-model";

export const dynamic = "force-dynamic";

export default async function ExecutivePage() {
  const data = await getExecutiveCommandCenter();
  const totalEvidence = data.evidenceHealth.length;
  const decisionItems = [
    ...data.criticalFindings.slice(0, 3).map((finding) => ({
      href: `/findings#finding-${finding.findingId}`,
      title: `${finding.findingId} · ${finding.title}`,
      detail: `${finding.aiSystem.name} has a critical governance finding tied to ${finding.controlTest.testId}.`,
      status: finding.severity,
      owner: finding.owner,
      dueDate: formatExecutiveDate(finding.remediationTargetDate),
      severity: finding.severity,
      category: "Material Risk",
      actionLabel: "Review Decision",
      recommendedAction: "Decide whether remediation is sufficient, escalation is needed, or risk acceptance should be reviewed."
    })),
    ...data.activeExceptions.slice(0, 2).map((exception) => ({
      href: "/exceptions",
      title: `${exception.exceptionId} active exception`,
      detail: exception.rationale,
      status: "ACCEPTED",
      owner: exception.approvedBy,
      dueDate: formatExecutiveDate(exception.expirationDate),
      severity: "HIGH",
      category: "Material Exception",
      actionLabel: "Review Exception",
      recommendedAction: "Confirm the exception remains appropriate and time-bound."
    }))
  ].slice(0, 4);
  const operationalItems = [
    ...data.openFindings.filter((finding) => finding.severity !== "CRITICAL").slice(0, 2).map((finding) => ({
      href: `/findings#finding-${finding.findingId}`,
      title: `${finding.findingId} · ${finding.title}`,
      detail: `${finding.aiSystem.name} requires owner remediation.`,
      status: finding.severity,
      owner: finding.owner,
      dueDate: formatExecutiveDate(finding.remediationTargetDate),
      severity: finding.severity,
      category: "Operational Issue",
      actionLabel: "Delegate Follow-up",
      recommendedAction: "Delegate to the control owner queue unless materiality changes."
    })),
    ...data.evidenceHealth.filter((record) => record.health !== "CURRENT" || record.validation !== "VALID").slice(0, 3).map((record) => ({
      href: `/evidence-health#evidence-health-${record.id}`,
      title: `${record.aiSystem.name} evidence requires review`,
      detail: `${record.evidenceRequirement.evidenceType} is ${record.health} with ${record.validation} validation.`,
      status: record.health,
      owner: record.aiSystem.riskOwner || record.aiSystem.businessOwner,
      severity: record.health === "MISSING" || record.health === "EXPIRED" ? "HIGH" : "MEDIUM",
      category: "Operational Evidence Issue",
      actionLabel: "Delegate Evidence Review",
      recommendedAction: "Assign to evidence owner or audit support workflow."
    }))
  ].slice(0, 6);

  return (
    <>
      <header>
        <Breadcrumbs items={[{ label: "Executive" }]} />
        <p className="text-sm font-medium text-brand">Executive command center</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">AI Governance portfolio health</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Board-ready view of AI systems, risk exposure, evidence health, regulatory coverage, open issues, and governance maturity.
        </p>
        <SecondaryNav items={executiveSecondaryNav} />
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
        <div className="grid gap-4">
          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Decision Required</h2>
            <ActionRequiredList items={decisionItems} emptyMessage="No material executive decisions are currently required." />
          </div>
          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Operational Issues</h2>
            <ActionRequiredList items={operationalItems} emptyMessage="No operational issues require executive awareness." />
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

function formatExecutiveDate(value: Date | null) {
  return value ? value.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "Not scheduled";
}
