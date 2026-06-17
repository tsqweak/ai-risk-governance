import Link from "next/link";
import { BookOpen } from "lucide-react";
import { LearningPanel, Section } from "../components/ui";

export const dynamic = "force-dynamic";

const frameworkTopics = [
  {
    title: "Governance Philosophy",
    why: "Governance must prove that AI systems are owned, risk-assessed, controlled, monitored, and explainable.",
    controls: "Owner assignment, committee approval, lifecycle gates, policy mapping.",
    evidence: "Approval records, system inventory, risk assessment, committee minutes.",
    monitoring: "CCM checks confirm ownership, evidence completeness, and control operation.",
    example: "Travel Brain is production because owners, risk tier, approvals, controls, and evidence are visible."
  },
  {
    title: "Regulatory Scope",
    why: "Regulators expect traceability from supervisory obligation to requirement, control, evidence, and issue handling.",
    controls: "Regulatory mapping, control coverage, evidence requirements, gap tracking.",
    evidence: "Regulatory mapping records, control evidence, retained audit packages.",
    monitoring: "Coverage and evidence-health views show current, missing, and expired proof.",
    example: "Travel Brain maps OSFI E-23 expectations to governance, inventory, and monitoring evidence."
  },
  {
    title: "AI Risk Model",
    why: "AI risk is multi-dimensional and must explain both inherent and residual exposure.",
    controls: "Risk register, treatment plans, acceptance approvals, linked control mitigations.",
    evidence: "Risk assessment, residual risk rationale, acceptance record, monitoring report.",
    monitoring: "Findings and control tests show whether risk controls continue to operate.",
    example: "Travel Brain hallucination risk is mitigated through bounded authority, oversight, and monitoring."
  },
  {
    title: "Human Oversight",
    why: "Humans must know when to review, challenge, approve, escalate, or stop AI outcomes.",
    controls: "Oversight procedure, escalation path, approval workflow, exception handling.",
    evidence: "Oversight procedure, approval record, review samples, exception approvals.",
    monitoring: "CCM tests and findings identify missing oversight evidence or overdue reviews.",
    example: "Travel Brain has an oversight procedure for escalated customer recommendation concerns."
  },
  {
    title: "Delegated Authority",
    why: "Agentic AI must operate inside approved authority boundaries.",
    controls: "Authority level assignment, approval thresholds, tool permissions, kill switch.",
    evidence: "Authority approval, tool policy, execution logs, kill-switch test evidence.",
    monitoring: "Agentic controls validate approval references, logging, and emergency stop readiness.",
    example: "Autonomous Payment Agent remains pilot because production authority is blocked by assurance gaps."
  },
  {
    title: "Evidence Governance",
    why: "Evidence is proof that governance is operating, not a passive attachment.",
    controls: "Evidence ownership, reviewer assignment, expiration, validation, package generation.",
    evidence: "Evidence objects, evidence health, audit packages, provenance records.",
    monitoring: "Evidence health identifies current, expiring, expired, missing, and invalid proof.",
    example: "Travel Brain has risk, data, monitoring, approval, and oversight evidence packaged for audit."
  },
  {
    title: "Continuous Monitoring",
    why: "Governance assurance requires recurring checks, not point-in-time declarations.",
    controls: "Control tests, monitoring schedules, findings, exceptions, remediation targets.",
    evidence: "Monitoring reports, test run evidence references, findings, exception approvals.",
    monitoring: "CCM results show pass, warning, fail, linked findings, and approved exceptions.",
    example: "Legacy Branch Assistant demonstrates how expired evidence becomes a finding and exception."
  }
];

export default function GovernanceFrameworkPage() {
  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Governance framework</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">How bank-grade AI governance works</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Educational reference area for the operating model behind the platform: compliance, governance, AI risk, oversight, evidence, and continuous monitoring.
        </p>
      </header>

      <Section title="Framework story">
        <div className="grid gap-4 lg:grid-cols-3">
          <LearningPanel title="Traditional Governance">
            Systems need owners, controls, evidence, approvals, monitoring, issue management, and audit trails.
          </LearningPanel>
          <LearningPanel title="AI Governance">
            AI systems also need model, prompt, data, validation, explainability, oversight, and residual risk governance.
          </LearningPanel>
          <LearningPanel title="Agentic AI Governance">
            Agentic systems add delegated authority, tools, actions, approval thresholds, execution logs, and kill switches.
          </LearningPanel>
        </div>
      </Section>

      <Section title="Framework topics">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {frameworkTopics.map((topic) => (
            <details key={topic.title} className="rounded-md border border-line bg-white p-4 open:bg-panel">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
                <BookOpen className="h-4 w-4 text-brand" />
                {topic.title}
              </summary>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
                <p><span className="font-semibold text-ink">Why it matters:</span> {topic.why}</p>
                <p><span className="font-semibold text-ink">Controls:</span> {topic.controls}</p>
                <p><span className="font-semibold text-ink">Evidence:</span> {topic.evidence}</p>
                <p><span className="font-semibold text-ink">Monitoring:</span> {topic.monitoring}</p>
                <p><span className="font-semibold text-ink">Travel Brain Example:</span> {topic.example}</p>
              </div>
            </details>
          ))}
        </div>
      </Section>

      <Section title="Operational links">
        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/ai-governance" className="rounded-md border border-line bg-white p-4 text-sm font-semibold text-ink hover:bg-panel">AI Governance</Link>
          <Link href="/agentic-governance" className="rounded-md border border-line bg-white p-4 text-sm font-semibold text-ink hover:bg-panel">Agentic Governance</Link>
          <Link href="/governance-engineering" className="rounded-md border border-line bg-white p-4 text-sm font-semibold text-ink hover:bg-panel">Governance Engineering</Link>
        </div>
      </Section>
    </>
  );
}
