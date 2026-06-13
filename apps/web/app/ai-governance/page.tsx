import Link from "next/link";
import { Bot, BrainCircuit, ClipboardCheck, FileCheck2, KeyRound, ShieldCheck, UserCheck, Wrench } from "lucide-react";
import { getAiGovernanceDashboard } from "../data";
import { humanize } from "../components/format";
import { LearningPanel, Metric, RiskBadge, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function AiGovernancePage() {
  const data = await getAiGovernanceDashboard();

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">AI governance framework</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">AI assets, authority, and oversight</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Portfolio view of models, prompts, agents, delegated authority, tool permissions, human oversight, AI-specific controls, and governance findings.
          </p>
        </div>
        <Link href="/systems/travel-brain/ai-governance" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Open Travel Brain
        </Link>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4 xl:grid-cols-8">
        <Metric label="Models" value={data.kpis.models} icon={BrainCircuit} />
        <Metric label="Approved Prompts" value={data.kpis.approvedPrompts} icon={FileCheck2} />
        <Metric label="Agents" value={data.kpis.agents} icon={Bot} />
        <Metric label="Authorities" value={data.kpis.authorityAssignments} icon={KeyRound} />
        <Metric label="Approved Tools" value={data.kpis.approvedPermissions} icon={Wrench} />
        <Metric label="Oversight" value={data.kpis.oversightDefined} icon={UserCheck} />
        <Metric label="AI Controls" value={data.kpis.aiControls} icon={ShieldCheck} />
        <Metric label="Open AI Findings" value={data.kpis.openAiFindings} icon={ClipboardCheck} />
      </div>

      <Section title="Learning Layer">
        <div className="grid gap-4 lg:grid-cols-2">
          <Concept
            title="Prompt Governance"
            traditional="Application configuration management"
            interpretation="Prompts are governed production artifacts with owners, approvals, version history, and retirement paths."
            example="Travel Brain uses an approved Travel Planning Prompt v1.0 with recommendation-only guardrails."
            evidence="Prompt approval record, version history, test results, and change approval."
          />
          <Concept
            title="Delegated Authority"
            traditional="Delegation of authority and approval limits"
            interpretation="Agentic systems need explicit boundaries for whether they can inform, recommend, draft, execute with approval, or execute autonomously."
            example="Travel Brain is Authority Level 1: recommend only, with no booking, calendar, or transaction authority."
            evidence="Authority assignment, tool permission register, committee approval, and escalation path."
          />
        </div>
      </Section>

      <Section title="Systems">
        <div className="grid gap-3">
          {data.systems.map((system) => (
            <Link key={system.id} href={`/systems/${system.slug}/ai-governance`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{system.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {system.aiModels.length} model(s) · {system.promptAssets.length} prompt(s) · {system.agents.length} agent(s) · Authority {system.authorityAssignment?.delegatedAuthority.authorityLevel ?? "Unassigned"}
                  </div>
                </div>
                <RiskBadge level={system.assessment?.overallRiskTier ?? "LOW"} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Registry title="Model Inventory" rows={data.models.map((model) => [model.name, model.aiSystem.name, model.provider, model.validationStatus])} />
        <Registry title="Prompt Registry" rows={data.prompts.map((prompt) => [prompt.name, prompt.aiSystem.name, prompt.version, prompt.approvalStatus])} />
        <Registry title="Agent Registry" rows={data.agents.map((agent) => [agent.name, agent.aiSystem.name, `Level ${agent.agenticLevel}`, agent.riskLevel])} risk />
        <Registry title="Tool Permissions" rows={data.permissions.map((permission) => [permission.toolName, permission.aiSystem.name, humanize(permission.permissionType), permission.approved ? "APPROVED" : "REJECTED"])} />
      </div>

      <Section title="AI Governance Controls">
        <div className="grid gap-3 md:grid-cols-2">
          {data.aiControls.map((control) => (
            <article key={control.id} className="rounded-md border border-line bg-white p-4">
              <div className="text-sm font-semibold text-ink">{control.code} · {control.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{control.description}</p>
              <div className="mt-3 text-xs text-slate-500">{humanize(control.category)} · {control.testingFrequency}</div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

function Concept({ title, traditional, interpretation, example, evidence }: { title: string; traditional: string; interpretation: string; example: string; evidence: string }) {
  return (
    <LearningPanel title={title}>
      <div className="grid gap-2">
        <p><span className="font-semibold">Traditional Governance Concept:</span> {traditional}</p>
        <p><span className="font-semibold">AI Governance Interpretation:</span> {interpretation}</p>
        <p><span className="font-semibold">Travel Brain Example:</span> {example}</p>
        <p><span className="font-semibold">Evidence:</span> {evidence}</p>
      </div>
    </LearningPanel>
  );
}

function Registry({ title, rows, risk = false }: { title: string; rows: string[][]; risk?: boolean }) {
  return (
    <section className="rounded-md border border-line bg-white p-5">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-4 divide-y divide-line">
        {rows.map((row) => (
          <div key={row.join("-")} className="grid gap-2 py-3 text-sm sm:grid-cols-4">
            <div className="font-medium text-ink">{row[0]}</div>
            <div className="text-slate-600">{row[1]}</div>
            <div className="text-slate-600">{row[2]}</div>
            <div>{risk ? <RiskBadge level={row[3]} /> : <StatusBadge status={row[3]} />}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
