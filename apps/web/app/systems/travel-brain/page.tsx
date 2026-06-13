import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, ClipboardList, Gauge, ShieldCheck } from "lucide-react";
import { classifyRisk } from "@airg/risk-engine";
import { getAiSystem } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { LearningPanel, Metric, RiskBadge, Section, StatusBadge } from "../../components/ui";

export const dynamic = "force-dynamic";

const tabs = ["Overview", "Ownership", "Risk Assessment", "Data & Jurisdictions", "Models / Tools / Vendors", "Controls", "Evidence", "Audit Trail", "Learning Notes"];

export default async function TravelBrainSystemPage() {
  const system = await getAiSystem("travel-brain");
  if (!system) notFound();

  const jurisdictions = JSON.parse(system.jurisdictionsJson) as string[];
  const liveClassification = classifyRisk({
    customerFacing: system.customerFacing,
    internalUserFacing: system.internalUserFacing,
    personalData: system.personalData,
    materialBusinessProcess: system.materialBusinessProcess,
    regulatedActivity: system.regulatedActivity,
    autonomousAction: system.autonomousAction,
    financialTransaction: system.financialTransaction,
    externalThirdPartyDependency: system.externalThirdPartyDependency,
    dataClassification: system.dataClassification,
    recommendationOnly: system.useCaseType.toLowerCase().includes("recommendation")
  });

  const needsAttention = system.systemControls.filter((control) => control.auditStatus !== "ON_TRACK").length;
  const reviewedEvidence = system.evidenceItems.filter((item) => item.status === "REVIEWED").length;

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">AI System Detail</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{system.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{system.description}</p>
        </div>
        <RiskBadge level={system.assessment?.overallRiskTier ?? liveClassification.overallRiskTier} />
      </header>

      <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-line pb-2">
        {tabs.map((tab) => (
          <a key={tab} href={`#${tab.toLowerCase().replaceAll(" ", "-").replaceAll("/", "")}`} className="whitespace-nowrap rounded px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white hover:text-ink">
            {tab}
          </a>
        ))}
      </nav>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Risk score" value={system.assessment?.score ?? liveClassification.score} icon={Gauge} />
        <Metric label="Controls" value={system.systemControls.length} icon={ShieldCheck} />
        <Metric label="Attention items" value={needsAttention} icon={AlertTriangle} />
        <Metric label="Reviewed evidence" value={`${reviewedEvidence}/${system.evidenceItems.length}`} icon={CheckCircle2} />
      </div>

      <Section title="Overview">
        <div id="overview" className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-md border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Business purpose</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{system.businessPurpose}</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <Fact label="Lifecycle" value={humanize(system.lifecycleStatus)} />
              <Fact label="Environment" value={humanize(system.environment)} />
              <Fact label="Use case" value={system.useCaseType} />
            </dl>
          </div>
          <LearningPanel title="What is an AI System?">
            Travel Brain is treated as a full system: ranking model, prompt, API, data source, vendor dependency, controls, evidence, audit trail, and human accountability.
          </LearningPanel>
        </div>
      </Section>

      <Section title="Ownership">
        <div id="ownership" className="grid gap-4 md:grid-cols-4">
          <Fact label="Business owner" value={system.businessOwner} />
          <Fact label="Technology owner" value={system.technologyOwner} />
          <Fact label="Risk owner" value={system.riskOwner} />
          <Fact label="Executive sponsor" value={system.executiveSponsor} />
        </div>
      </Section>

      <Section title="Risk Assessment">
        <div id="risk-assessment" className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Multi-dimensional risk classification</h3>
              <RiskBadge level={system.assessment?.overallRiskTier ?? liveClassification.overallRiskTier} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{system.assessment?.rationale ?? liveClassification.rationale}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {Object.entries(liveClassification.dimensions).map(([key, value]) => (
                <div key={key} className="rounded border border-line bg-panel p-3">
                  <div className="text-xs text-slate-500">{humanize(key.replace(/[A-Z]/g, "_$&").toUpperCase())}</div>
                  <div className="mt-2"><RiskBadge level={value} /></div>
                </div>
              ))}
            </div>
          </div>
          <LearningPanel title="Why autonomy changes regulatory risk">
            Autonomous action changes the control question from “is advice appropriate?” to “can the system cause an outcome?” That increases expectations for human oversight, rollback, logging, and pre-use approval.
          </LearningPanel>
        </div>
      </Section>

      <Section title="Data & Jurisdictions">
        <div id="data-&-jurisdictions" className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-md border border-line bg-white p-5">
            <dl className="grid gap-3 sm:grid-cols-3">
              <Fact label="Personal data" value={system.personalData ? "Yes" : "No"} />
              <Fact label="Data classification" value={humanize(system.dataClassification)} />
              <Fact label="Jurisdictions" value={jurisdictions.join(", ")} />
              <Fact label="Customer-facing" value={system.customerFacing ? "Yes" : "No"} />
              <Fact label="Financial transactions" value={system.financialTransaction ? "Yes" : "No"} />
              <Fact label="Third-party dependency" value={system.externalThirdPartyDependency ? "Yes" : "No"} />
            </dl>
          </div>
          <LearningPanel title="Why customer-facing AI receives more scrutiny">
            Customer-facing AI can influence expectations, eligibility perceptions, explanations, complaints, and fair-treatment outcomes. Banks need stronger disclosure, monitoring, and escalation evidence.
          </LearningPanel>
        </div>
      </Section>

      <Section title="Models / Tools / Vendors">
        <div id="models--tools--vendors" className="grid gap-3 md:grid-cols-2">
          {system.components.map((component) => (
            <article key={component.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{component.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{humanize(component.type)} · {component.provider}</div>
                </div>
                <RiskBadge level={component.criticality} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{component.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Controls">
        <div id="controls" className="grid gap-3">
          {system.systemControls.map(({ id, control, auditStatus, notes }) => (
            <div key={id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{control.code} · {control.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{humanize(control.category)} · {control.testingFrequency}</div>
                </div>
                <StatusBadge status={auditStatus} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{notes}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Evidence">
        <div id="evidence" className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Evidence</th><th className="px-4 py-3">Control</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {system.evidenceItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 font-medium text-ink">{item.title}</td>
                  <td className="px-4 py-4 text-slate-700">{item.controlCode}</td>
                  <td className="px-4 py-4 text-slate-700">{item.owner}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.dueDate)}</td>
                  <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Audit Trail">
        <div id="audit-trail" className="rounded-md border border-line bg-white">
          {system.auditEvents.map((event) => (
            <div key={event.id} className="flex gap-3 border-b border-line p-4 last:border-0">
              <ClipboardList className="mt-0.5 h-4 w-4 text-brand" />
              <div>
                <div className="text-sm font-semibold text-ink">{event.eventType}</div>
                <div className="mt-1 text-sm text-slate-700">{event.summary}</div>
                <div className="mt-1 text-xs text-slate-500">{event.actor} · {formatDate(event.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Learning Notes">
        <div id="learning-notes" className="grid gap-4 md:grid-cols-2">
          <LearningPanel title="Why ownership matters">
            Named owners create accountability for system purpose, production operations, risk acceptance, evidence quality, and executive escalation.
          </LearningPanel>
          <LearningPanel title="Why risk tiering matters">
            Tiering turns abstract AI risk into concrete governance intensity: approval depth, control coverage, testing cadence, audit sampling, and reporting.
          </LearningPanel>
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white px-3 py-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
