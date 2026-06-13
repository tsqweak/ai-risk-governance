import Link from "next/link";
import { AlertTriangle, Bot, ClipboardCheck, FileText, KeyRound, Power, Route, ShieldCheck, Wrench } from "lucide-react";
import { getAgenticGovernanceDashboard } from "../data";
import { formatDate, humanize } from "../components/format";
import { LearningPanel, Metric, RiskBadge, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function AgenticGovernancePage() {
  const data = await getAgenticGovernanceDashboard();

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Agentic AI controls</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Delegated authority, tools, approvals, and execution</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Govern agentic systems by tracing authority, permitted actions, governed tools, approval workflows, execution logs, kill switches, and findings.
          </p>
        </div>
        <Link href="/systems/autonomous-payment-agent/agentic-governance" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Open Payment Agent
        </Link>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4 xl:grid-cols-8">
        <Metric label="Agents" value={data.kpis.agents} icon={Bot} />
        <Metric label="Actions" value={data.kpis.actions} icon={Route} />
        <Metric label="Tools" value={data.kpis.tools} icon={Wrench} />
        <Metric label="Approvals" value={data.kpis.workflows} icon={ClipboardCheck} />
        <Metric label="Execution Logs" value={data.kpis.logs} icon={FileText} />
        <Metric label="Kill Switches" value={data.kpis.killSwitches} icon={Power} />
        <Metric label="Level 4 Systems" value={data.kpis.autonomousSystems} icon={KeyRound} />
        <Metric label="Open Findings" value={data.kpis.openFindings} icon={AlertTriangle} />
      </div>

      <Section title="Educational Layer">
        <div className="grid gap-4 lg:grid-cols-2">
          <Concept
            title="Delegated Authority"
            traditional="Delegation of authority and approval limits"
            ai="AI systems need explicit boundaries for what recommendations, drafts, or actions are permitted."
            agentic="Agents need action-level authority, especially when tools can write records, execute workflows, or move money."
            travel="Travel Brain is Level 1 and can recommend excursions or draft packing lists only."
            autonomous="Autonomous Payment Agent is Level 4 and can execute payment transactions in a controlled pilot."
          />
          <Concept
            title="Execution Logging"
            traditional="Audit trail and activity logging"
            ai="AI usage needs traceability for inputs, outputs, controls, owners, and evidence."
            agentic="Agentic AI needs action logs that show the agent, tool, action, outcome, timestamp, initiator, and approval reference."
            travel="Travel Brain logs recommendations and drafts with no approval reference because it has no execution authority."
            autonomous="Autonomous Payment Agent logs payment execution with approval workflow and approval reference."
          />
        </div>
      </Section>

      <Section title="Agentic Systems">
        <div className="grid gap-3">
          {data.systems.map((system) => (
            <Link key={system.id} href={`/systems/${system.slug}/agentic-governance`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{system.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {system.agents.length} agent(s) · {system.agentActions.length} action(s) · {system.governedTools.length} tool(s) · {system.executionLogs.length} log(s)
                  </div>
                </div>
                <div className="flex gap-2">
                  <RiskBadge level={system.assessment?.overallRiskTier ?? "LOW"} />
                  {system.killSwitch ? <StatusBadge status={system.killSwitch.status} /> : <StatusBadge status="MISSING" />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Registry title="Actions" rows={data.actions.map((action) => [action.name, action.aiSystem.name, humanize(action.approvalRequirement), action.riskLevel])} risk />
        <Registry title="Tools" rows={data.tools.map((tool) => [tool.name, tool.aiSystem.name, humanize(tool.permissionType), tool.riskLevel])} risk />
        <Registry title="Approval Workflows" rows={data.workflows.map((workflow) => [workflow.name, humanize(workflow.approvalLevel), workflow.approverRole, "APPROVED"])} />
        <Registry title="Kill Switches" rows={data.killSwitches.map((killSwitch) => [killSwitch.aiSystem.name, killSwitch.owner, formatDate(killSwitch.lastTested), killSwitch.status])} />
      </div>

      <Section title="Agentic Controls">
        <div className="grid gap-3 md:grid-cols-2">
          {data.controls.map((control) => (
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

function Concept({ title, traditional, ai, agentic, travel, autonomous }: { title: string; traditional: string; ai: string; agentic: string; travel: string; autonomous: string }) {
  return (
    <LearningPanel title={title}>
      <div className="grid gap-2">
        <p><span className="font-semibold">Traditional Governance Concept:</span> {traditional}</p>
        <p><span className="font-semibold">AI Governance Interpretation:</span> {ai}</p>
        <p><span className="font-semibold">Agentic AI Interpretation:</span> {agentic}</p>
        <p><span className="font-semibold">Travel Brain Example:</span> {travel}</p>
        <p><span className="font-semibold">Autonomous Agent Example:</span> {autonomous}</p>
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
