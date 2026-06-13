# AI Risk Governance Roadmap

Current release: v0.6.0
Documentation baseline: v0.6.1

## Vision

AI Risk Governance is a bank-grade governance platform for the full lifecycle of AI systems. It is designed to help IT Risk, Internal Audit, Compliance, AI Governance Committees, CIO/CRO leadership, and regulators understand, evidence, and monitor AI risk in a way that extends traditional governance patterns into AI-specific and agentic AI governance.

The platform demonstrates the progression:

```text
Traditional Governance -> AI Governance -> Agentic AI Governance
```

Traditional governance asks whether systems have owners, controls, evidence, approvals, monitoring, and audit trails. AI governance adds model, prompt, data, vendor, explainability, validation, human oversight, and AI risk domain controls. Agentic AI governance adds delegated authority, permitted actions, tool permissions, approval thresholds, execution logs, kill switches, and escalation for autonomous or semi-autonomous activity.

## Objectives

- Maintain a complete registry of AI systems across ownership, lifecycle, risk tier, jurisdiction, components, controls, and evidence.
- Map regulatory expectations to requirements, controls, evidence, and AI systems across major financial-services jurisdictions.
- Continuously monitor control health and generate findings, exceptions, and executive-ready risk views.
- Treat evidence as a governed object with ownership, validation, review, expiry, and traceability.
- Provide executive, auditor, compliance, and governance committee experiences from the same source of record.
- Encode AI-specific governance for models, prompts, agents, AI risk domains, human oversight, and delegated authority.
- Extend governance to agentic systems that can use tools, draft or execute actions, and operate with different autonomy levels.

## Completed Phases

### Phase 1 - AI System Registry

Delivered the core AI system inventory and Travel Brain seed profile. The registry treats an AI system as more than a model: it includes models, agents, prompts, tools, APIs, data sources, workflows, vendors, controls, evidence, ownership, oversight, lifecycle status, jurisdictions, and audit history.

### Phase 2 - Regulatory Mapping Engine

Delivered regulatory traceability from regulations to requirements, controls, evidence expectations, and AI systems. The mapping engine supports educational review of obligations and audit-style traceability.

### Phase 3A - Continuous Control Monitoring Engine

Delivered recurring governance checks, control test execution, test run storage, finding generation, approved exceptions, and monitoring interpretations that translate traditional controls into AI governance terms.

### Phase 3B - Monitoring Dashboards & Control Health

Delivered dashboards for control health, findings, exceptions, AI-system monitoring, risk heatmaps, and portfolio-level monitoring views.

### Phase 4 - Evidence Objects & Evidence Governance

Delivered evidence requirements, evidence objects, evidence health, validation status, expiration monitoring, linked controls, linked regulations, and evidence-based findings.

### Phase 5 - Executive & Auditor Experience

Delivered executive-grade portfolio, regulatory coverage, governance committee, auditor workspace, board-reporting, and command-center views.

### Phase 6A - AI Governance Framework

Delivered AI-specific governance records for model validation, prompt assets and versions, agents, delegated authority, tool permissions, human oversight, and AI risk domains.

### Phase 6B - Agentic AI Controls

Delivered agentic governance concepts for delegated authority, permitted actions, governed tools, approval workflows, execution logs, kill switches, risk domains, and agentic findings.

## Phase 6C Planned Work - AI Lifecycle Governance

Phase 6C will formalize end-to-end AI lifecycle governance so that intake, development, testing, pilot, production, and retirement decisions are governed through explicit approval gates.

Planned capabilities:

- AI intake process for new, existing, vendor, embedded, and agentic AI use cases.
- Approval workflow for business, technology, risk, compliance, security, privacy, model risk, and executive stakeholders.
- Development stage gates for design, data sourcing, model or prompt construction, vendor dependency review, and control design.
- Testing stage gates for validation, bias and fairness review, privacy review, resilience testing, explainability review, red teaming, and user acceptance.
- Pilot approvals that define scope, users, data boundaries, monitoring requirements, rollback criteria, and escalation paths.
- Production approvals that require completed evidence, accepted residual risk, defined monitoring, and assigned accountable owners.
- Retirement workflow for decommissioning AI systems, revoking tools, preserving evidence, closing findings, and documenting customer or operational impact.

## Phase 7 Planned Work - Portfolio Expansion & Codex Integration

Phase 7 will expand the platform from a seeded demonstration portfolio into a broader project-onboarding and cross-system governance experience.

Planned capabilities:

- Real project onboarding for existing AI systems and active development projects.
- Portfolio expansion across multiple systems, risk tiers, jurisdictions, owners, and business lines.
- Cross-system reporting for control health, regulatory coverage, findings, exceptions, evidence posture, AI risk domains, and agentic authority.
- Codex integration for importing project metadata, creating governance records from repositories, and linking development activity to governance evidence.

## Roadmap Principles

- Build from governance concepts the audience already understands.
- Make AI-specific risk visible without hiding the familiar control, evidence, and accountability structure.
- Keep agentic AI governance concrete by tying autonomy to actions, tools, approvals, logs, and human oversight.
- Preserve regulator and auditor traceability from executive summary down to control, evidence, and system detail.
