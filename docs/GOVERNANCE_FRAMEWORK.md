# AI Governance Framework

Current release: v0.6.0
Documentation baseline: v0.6.1

## Governance Philosophy

The AI-Risk-Governance platform starts from a familiar bank governance pattern: systems need accountable owners, risk classification, controls, evidence, monitoring, issue management, approvals, and audit trails.

AI governance extends that pattern. An AI system is not only an application or a model. It may include models, prompts, agents, tools, APIs, data sources, workflows, vendors, human oversight procedures, delegated authority, and evidence. Governance must therefore cover the full AI operating context, not only the algorithm.

Agentic AI governance extends it again. When systems can draft, recommend, call tools, write records, trigger workflows, or execute actions, governance must explicitly define what the agent is allowed to do, what requires approval, what is prohibited, and how humans can supervise, interrupt, investigate, or retire the capability.

The educational model is:

```text
Traditional Governance
  -> AI Governance
  -> Agentic AI Governance
```

## Regulatory Scope

The framework is designed for multi-jurisdiction financial-services governance. It does not replace legal interpretation, but it provides a structured way to map regulatory expectations to controls, evidence, and accountable owners.

### OSFI

OSFI expectations emphasize governance, accountability, inventory completeness, model risk management, validation, monitoring, third-party risk, and evidence of ongoing control operation.

### OCC / Fed / FDIC

US banking expectations emphasize board and senior management oversight, model risk management, independent validation, third-party risk, operational resilience, consumer protection, data governance, and auditability.

### FCA

FCA expectations emphasize accountability, operational resilience, consumer outcomes, outsourcing and third-party risk, governance forums, monitoring, and escalation for important business services.

### EU AI Act

EU AI Act expectations emphasize risk management, data governance, technical documentation, recordkeeping, transparency, human oversight, accuracy, robustness, cybersecurity, and lifecycle obligations for high-risk AI systems.

### Japan FSA

Japan FSA expectations are treated as part of the platform's international supervisory scope, with emphasis on governance, risk management, accountability, operational resilience, data protection, outsourcing, monitoring, and explainability for financial institutions.

## Multi-Dimensional AI Risk Model

The platform classifies AI risk across multiple dimensions rather than relying on a single label.

### Customer Impact

Assesses whether AI outputs can affect customers, customer experience, suitability, eligibility, access, advice, communications, or outcomes.

### Financial Impact

Assesses whether AI can affect financial transactions, pricing, balances, fees, credit, payments, trading, or financial reporting.

### Privacy Impact

Assesses whether AI uses personal information, sensitive data, confidential records, behavioral data, or data that creates consent, retention, minimization, or cross-border transfer obligations.

### Operational Impact

Assesses whether AI affects important business services, workflow execution, incident response, service continuity, vendor dependency, operational resilience, or production stability.

### Regulatory Impact

Assesses whether the system falls under supervisory expectations, audit commitments, legal obligations, model risk rules, consumer protection rules, privacy rules, or AI-specific regulations.

### Autonomy Level

Assesses what the AI system can do without direct human action. Autonomy ranges from informational and recommendation-only use to drafting, approval-gated execution, and autonomous execution within defined guardrails.

## AI Governance Model

The AI governance model covers the AI-specific objects that must be governed around each AI system:

- AI system purpose, business context, lifecycle status, environment, and accountable owners.
- Model inventory, model validation, limitations, performance expectations, and review status.
- Prompt registry, prompt ownership, prompt version history, approval status, and prompt guardrails.
- Agent registry, agent purpose, agent lifecycle, owner, and agentic level.
- Tool inventory and permissions, including read, write, execute, administrative, and denied capabilities.
- Human oversight roles, escalation paths, review points, and intervention procedures.
- AI risk domains such as hallucination, prompt injection, model drift, tool misuse, autonomy, explainability, bias, privacy, security, and operational resilience.
- Controls, evidence, findings, exceptions, and regulatory mappings that prove the governance model is operating.

## Agentic Governance Model

The agentic governance model applies when AI systems can use tools, take steps in workflows, draft operational actions, or execute approved or autonomous actions.

Agentic governance requires:

- Agent registration with system linkage, owner, purpose, lifecycle, and agentic level.
- Delegated authority assignment that states what the AI system can and cannot do.
- Permitted action registry defining action types, impact, approval requirements, and prohibitions.
- Governed tool permissions tied to authority level and reviewed by accountable owners.
- Approval workflows for actions that exceed recommendation-only or low-risk thresholds.
- Execution logs that record agent, action, tool, outcome, timestamp, initiator, and approval reference.
- Kill switch, suspension, rollback, escalation, and incident response procedures.
- Agentic risk assessment for uncontrolled actions, authority bypass, tool abuse, runaway automation, and human oversight failure.

## Evidence Governance Philosophy

Evidence is governed as a durable object with ownership, lifecycle, review, validation, and traceability. The platform should be able to show not only that a control exists, but that evidence exists to prove the control is designed, approved, operating, and reviewed.

Evidence governance principles:

- Evidence must be linked to AI systems, controls, regulatory requirements, and accountable owners.
- Evidence must have a status, due date, review date, validation posture, and location.
- Missing, stale, expired, incomplete, or unreviewed evidence should be visible.
- Auditor and regulator views should trace from obligation to control to evidence without relying on informal explanation.
- Evidence should support both operating effectiveness and governance education.

## Continuous Monitoring Philosophy

Continuous monitoring turns governance from a point-in-time attestation into an operating discipline.

Monitoring should:

- Test whether required governance records exist and remain current.
- Detect control gaps, stale reviews, missing evidence, expired exceptions, and incomplete AI governance profiles.
- Generate findings where governance conditions fail.
- Recognize approved exceptions while preserving visibility into accepted risk.
- Provide dashboards for control health, findings, exceptions, risk heatmaps, and system-specific monitoring.
- Translate traditional control concepts into AI governance and agentic AI interpretations.

## Human Oversight Philosophy

Human oversight is not a generic label. It must define who is accountable, when humans review activity, what they can approve, what they can stop, and how escalations happen.

Oversight should be proportional to risk:

- Recommendation-only systems may need periodic review, escalation for unusual outputs, and evidence of monitoring.
- Drafting systems may need human review before customer, financial, legal, or operational impact.
- Execution systems may need explicit approval workflows, authority thresholds, logging, rollback, and incident response.
- Autonomous systems require the strongest constraints, continuous monitoring, kill switches, and executive-level acceptance of residual risk.

## Delegated Authority Framework

Delegated authority defines the boundary between advice, drafting, approved execution, and autonomous execution.

The framework should answer:

- What can the AI system do?
- What is it prohibited from doing?
- Which tools can it use?
- Can it read data, write records, trigger workflows, or execute transactions?
- What impact level is permitted?
- Which actions require human approval?
- Who approves authority changes?
- How are actions logged and reviewed?
- How can the authority be suspended or revoked?

Authority levels should be explicit, reviewed, evidenced, and tied to both technical enforcement and governance approval. A system such as Travel Brain can be governed as recommendation-only, while higher-risk pilots can be governed with approval-gated or autonomous execution controls.
