import { notFound } from "next/navigation";
import { Bot, BrainCircuit, FileCheck2, KeyRound, ShieldCheck, UserCheck, Wrench } from "lucide-react";
import { getAiSystemAiGovernance } from "../../../data";
import { formatDate, humanize } from "../../../components/format";
import { LearningPanel, Metric, RiskBadge, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function SystemAiGovernancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemAiGovernance(slug);
  if (!system) notFound();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI system governance view</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">{system.name} AI governance</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          AI-specific inventory, prompts, agents, delegated authority, tool permissions, human oversight, AI controls, risk domains, and governance findings.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4 xl:grid-cols-7">
        <Metric label="Models" value={system.aiModels.length} icon={BrainCircuit} />
        <Metric label="Prompts" value={system.promptAssets.length} icon={FileCheck2} />
        <Metric label="Agents" value={system.agents.length} icon={Bot} />
        <Metric label="Authority" value={system.authorityAssignment?.delegatedAuthority.authorityLevel ?? "None"} icon={KeyRound} />
        <Metric label="Tools" value={system.toolPermissions.length} icon={Wrench} />
        <Metric label="Oversight" value={system.humanOversight?.oversightRequired ? "Yes" : "No"} icon={UserCheck} />
        <Metric label="AI Controls" value={system.systemControls.length} icon={ShieldCheck} />
      </div>

      <Section title="Learning Layer">
        <div className="grid gap-4 lg:grid-cols-3">
          <Concept
            title="AI Model Inventory"
            traditional="Technology asset inventory and model inventory"
            interpretation="Models are governed AI components with provider, version, validation, owner, fallback, and lifecycle controls."
            example="Travel Brain uses GPT-5 from OpenAI for travel recommendations and planning with approved validation."
            evidence="Model inventory record, validation approval, fallback design, and owner attestation."
          />
          <Concept
            title="Human Oversight"
            traditional="Manual review and escalation controls"
            interpretation="AI outputs need defined review points where humans can challenge, intervene, or escalate."
            example="Travel Brain requires recommendation review for escalated customer concerns and proposed authority expansion."
            evidence="Oversight procedure, escalation path, review samples, and governance minutes."
          />
          <Concept
            title="Tool Permissions"
            traditional="Access management and entitlement review"
            interpretation="Agentic AI needs explicit permission boundaries for read, write, execute, and administrative tools."
            example="Travel Brain can read Weather and Excursion APIs, but Booking API and Calendar Write are not approved."
            evidence="Tool permission register, denied permission rationale, access review, and security approval."
          />
        </div>
      </Section>

      <Section title="Model Inventory">
        <div className="grid gap-3 md:grid-cols-2">
          {system.aiModels.map((model) => (
            <article key={model.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-ink">{model.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">{model.provider} · {model.version} · {model.modelType}</p>
                </div>
                <StatusBadge status={model.validationStatus} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{model.purpose}</p>
              <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                <span>Owner: {model.owner}</span>
                <span>Validated: {formatDate(model.validationDate)}</span>
                <span>Fallback: {model.fallbackModel ?? "None"}</span>
                <span>Lifecycle: {humanize(model.lifecycleStatus)}</span>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Prompt Inventory">
        <div className="grid gap-3">
          {system.promptAssets.map((prompt) => (
            <article key={prompt.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-ink">{prompt.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">Version {prompt.version} · Owner {prompt.owner} · Modified {formatDate(prompt.lastModified)}</p>
                </div>
                <StatusBadge status={prompt.approvalStatus} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{prompt.description}</p>
              <div className="mt-4 grid gap-2">
                {prompt.versions.map((version) => (
                  <div key={version.id} className="rounded border border-line bg-panel p-3 text-sm">
                    <div className="font-medium text-ink">v{version.version} · {formatDate(version.modifiedAt)} · {version.modifiedBy}</div>
                    <div className="mt-1 text-slate-700">{version.changeSummary}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Agent Registry & Authority">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3">
            {system.agents.map((agent) => (
              <article key={agent.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">{agent.name}</h2>
                    <p className="mt-1 text-xs text-slate-500">Level {agent.agenticLevel}: {agent.agenticLevelName} · {humanize(agent.lifecycleStatus)}</p>
                  </div>
                  <RiskBadge level={agent.riskLevel} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{agent.purpose}</p>
              </article>
            ))}
          </div>
          <article className="rounded-md border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink">Delegated Authority</h2>
            {system.authorityAssignment ? (
              <>
                <div className="mt-3 text-2xl font-semibold text-ink">Level {system.authorityAssignment.delegatedAuthority.authorityLevel}</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{system.authorityAssignment.delegatedAuthority.authorityDescription}</p>
                <dl className="mt-4 grid gap-3 text-sm">
                  <Fact label="Approval required" value={system.authorityAssignment.delegatedAuthority.approvalRequired ? "Yes" : "No"} />
                  <Fact label="Maximum impact" value={system.authorityAssignment.delegatedAuthority.maximumImpact} />
                  <Fact label="Escalation" value={system.authorityAssignment.delegatedAuthority.escalationPath} />
                </dl>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-700">No delegated authority assignment exists.</p>
            )}
          </article>
        </div>
      </Section>

      <Section title="Tool Permissions & Oversight">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-md border border-line bg-white">
            {system.toolPermissions.map((permission) => (
              <div key={permission.id} className="flex flex-col gap-2 border-b border-line p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{permission.toolName}</div>
                  <div className="mt-1 text-xs text-slate-500">{humanize(permission.permissionType)} · Owner {permission.owner}</div>
                  <p className="mt-2 text-sm text-slate-700">{permission.rationale}</p>
                </div>
                <StatusBadge status={permission.approved ? "APPROVED" : "REJECTED"} />
              </div>
            ))}
          </div>
          <article className="rounded-md border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink">Human Oversight</h2>
            {system.humanOversight ? (
              <dl className="mt-4 grid gap-3">
                <Fact label="Required" value={system.humanOversight.oversightRequired ? "Yes" : "No"} />
                <Fact label="Type" value={system.humanOversight.oversightType} />
                <Fact label="Review point" value={system.humanOversight.reviewPoint} />
                <Fact label="Escalation" value={system.humanOversight.escalationPath} />
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-700">No human oversight framework exists.</p>
            )}
          </article>
        </div>
      </Section>

      <Section title="AI Controls & Risk Domains">
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
            {system.aiRiskDomains.map(([label, level]) => (
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
