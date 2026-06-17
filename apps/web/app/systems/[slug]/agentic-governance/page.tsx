import { notFound } from "next/navigation";
import { Bot, ClipboardCheck, FileText, KeyRound, Power, Route, ShieldCheck, Wrench } from "lucide-react";
import { getAiSystemAgenticGovernance } from "../../../data";
import { formatDate, humanize } from "../../../components/format";
import { LearningPanel, Metric, RiskBadge, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function SystemAgenticGovernancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemAgenticGovernance(slug);
  if (!system) notFound();

  const highestAgenticLevel = Math.max(0, ...system.agents.map((agent) => agent.agenticLevel));

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI system agentic governance</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">{system.name}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Authority, actions, governed tools, approvals, execution logs, kill switch readiness, agentic controls, and risk domains.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4 xl:grid-cols-7">
        <Metric label="Agentic Level" value={highestAgenticLevel} icon={Bot} />
        <Metric label="Actions" value={system.agentActions.length} icon={Route} />
        <Metric label="Tools" value={system.governedTools.length} icon={Wrench} />
        <Metric label="Logs" value={system.executionLogs.length} icon={FileText} />
        <Metric label="Authority" value={system.authorityAssignment?.delegatedAuthority.authorityLevel ?? "None"} icon={KeyRound} />
        <Metric label="Kill Switch" value={system.killSwitch?.status ?? "Missing"} icon={Power} />
        <Metric label="Controls" value={system.systemControls.length} icon={ShieldCheck} />
      </div>

      <Section title="Educational Layer">
        <div className="grid gap-4 lg:grid-cols-2">
          <Concept
            title="Kill Switch"
            traditional="Emergency stop, rollback, and operational resilience"
            ai="AI systems need a way to suspend unsafe behavior and revert to manual operation."
            agentic="Autonomous agents need tested emergency stop controls before they can execute high-impact actions."
            travel="Travel Brain has no execution authority, so the control focus is bounded read-only tools and escalation."
            autonomous="Autonomous Payment Agent has a kill switch record, but it is not tested, which creates a finding."
          />
          <Concept
            title="Approval Workflow"
            traditional="Maker-checker, dual approval, and committee approval"
            ai="AI approvals connect risk tier, authority, and evidence to accountable human roles."
            agentic="High-impact actions need approval references in execution logs so auditors can trace action to authorization."
            travel="Travel Brain needs no approval for recommendation-only actions."
            autonomous="Autonomous Payment Agent uses dual and committee approval workflows for transaction actions."
          />
        </div>
      </Section>

      <Section title="Authority & Actions">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <article className="rounded-md border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink">Delegated Authority</h2>
            {system.authorityAssignment ? (
              <>
                <div className="mt-3 text-2xl font-semibold text-ink">Level {system.authorityAssignment.delegatedAuthority.authorityLevel}</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{system.authorityAssignment.delegatedAuthority.authorityDescription}</p>
                <p className="mt-3 text-xs text-slate-500">{system.authorityAssignment.notes}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-700">No delegated authority assignment exists.</p>
            )}
          </article>
          <div className="rounded-md border border-line bg-white">
            {system.agentActions.map((action) => (
              <div key={action.id} className="flex flex-col gap-2 border-b border-line p-4 last:border-0 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{action.name}</div>
                  <div className="mt-1 text-xs text-slate-500">Approval: {humanize(action.approvalRequirement)}</div>
                  <p className="mt-2 text-sm text-slate-700">{action.description}</p>
                </div>
                <RiskBadge level={action.riskLevel} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Agentic governance assurance">
        <div className="grid gap-4 lg:grid-cols-3">
          <AssuranceCard
            title="Tools"
            risk={`Tool risk is governed through ${system.governedTools.length} governed tool records.`}
            approval={`${system.governedTools.length} governed tool records and authority limits`}
            evidence={`${system.evidenceObjects.length} evidence objects available for proof and download`}
            monitoring={`${system.testRuns.filter((run) => run.controlTest.testId === "CCM-012").length} agentic monitoring runs`}
            owner={system.technologyOwner}
            review={system.governedTools.map((tool) => formatDate(tool.nextReviewDate)).join(", ") || "No review dates"}
          />
          <AssuranceCard
            title="Authority"
            risk={`Risk assessment: ${system.assessment?.delegatedAuthorityRisk ?? "Unassessed"} delegated authority risk`}
            approval={system.authorityAssignment ? `Level ${system.authorityAssignment.delegatedAuthority.authorityLevel} authority assigned` : "No authority assignment"}
            evidence="Authority assignment, approval workflow, lifecycle approvals, and execution evidence"
            monitoring={`${system.agenticFindings.length} agentic findings`}
            owner={system.riskOwner || "Unassigned"}
            review={formatDate(system.nextReviewDate)}
          />
          <AssuranceCard
            title="Actions"
            risk={`${system.agentActions.length} agent actions with risk ratings and approval requirements`}
            approval={system.agentActions.map((action) => `${action.name}: ${humanize(action.approvalRequirement)}`).join("; ")}
            evidence="Execution logs, approval references, kill-switch records, and monitoring reports"
            monitoring={`${system.executionLogs.length} execution logs reviewed`}
            owner={system.businessOwner}
            review={formatDate(system.lastReviewDate)}
          />
        </div>
      </Section>

      <Section title="Tools, Logs & Kill Switch">
        <div className="grid gap-4 xl:grid-cols-3">
          <Panel title="Governed Tools">
            {system.governedTools.map((tool) => (
              <Row key={tool.id} title={tool.name} detail={`${humanize(tool.permissionType)} · review due ${formatDate(tool.nextReviewDate)}`} status={tool.riskLevel} risk />
            ))}
          </Panel>
          <Panel title="Execution Logs">
            {system.executionLogs.map((log) => (
              <div key={log.id} className="border-b border-line py-3 last:border-0">
                <div className="text-sm font-semibold text-ink">{log.executionId} · {log.action.name}</div>
                <div className="mt-1 text-xs text-slate-500">{formatDate(log.timestamp)} · {log.tool.name} · {log.approvalReference ?? "No approval reference"}</div>
                <p className="mt-2 text-sm text-slate-700">{log.outcome}</p>
              </div>
            ))}
          </Panel>
          <Panel title="Kill Switch">
            {system.killSwitch ? (
              <div className="grid gap-3 text-sm">
                <Row title="Status" detail={`Owner ${system.killSwitch.owner}`} status={system.killSwitch.status} />
                <Row title="Enabled" detail={system.killSwitch.enabled ? "Emergency stop is configured" : "Emergency stop is disabled"} status={system.killSwitch.enabled ? "APPROVED" : "BLOCKED"} />
                <Row title="Last tested" detail={formatDate(system.killSwitch.lastTested)} status={system.killSwitch.lastTested ? "CURRENT" : "MISSING"} />
              </div>
            ) : (
              <p className="text-sm text-slate-700">No kill switch record exists.</p>
            )}
          </Panel>
        </div>
      </Section>

      <Section title="Agentic Controls & Risk Domains">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-line bg-white">
            {system.systemControls.map(({ id, control, auditStatus }) => (
              <div key={id} className="flex items-start justify-between gap-3 border-b border-line p-4 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-ink">{control.code} · {control.title}</div>
                  <p className="mt-1 text-sm text-slate-700">{control.description}</p>
                </div>
                <StatusBadge status={auditStatus} />
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {system.agenticRiskDomains.map(([label, level]) => (
              <div key={label} className="rounded-md border border-line bg-white p-4">
                <div className="text-xs text-slate-500">{label}</div>
                <div className="mt-2"><RiskBadge level={level} /></div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

function AssuranceCard({ title, risk, approval, evidence, monitoring, owner, review }: { title: string; risk: string; approval: string; evidence: string; monitoring: string; owner: string; review: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
        <p><span className="font-semibold text-ink">Risk Assessment:</span> {risk}</p>
        <p><span className="font-semibold text-ink">Approval:</span> {approval}</p>
        <p><span className="font-semibold text-ink">Evidence:</span> {evidence}</p>
        <p><span className="font-semibold text-ink">Monitoring:</span> {monitoring}</p>
        <p><span className="font-semibold text-ink">Owner:</span> {owner}</p>
        <p><span className="font-semibold text-ink">Review Date:</span> {review}</p>
      </div>
    </article>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ title, detail, status, risk = false }: { title: string; detail: string; status: string; risk?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line py-3 last:border-0">
      <div>
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="mt-1 text-xs text-slate-500">{detail}</div>
      </div>
      {risk ? <RiskBadge level={status} /> : <StatusBadge status={status} />}
    </div>
  );
}
