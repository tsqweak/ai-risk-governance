# AI Risk Governance Roadmap

Current release: v0.6.0
Documentation baseline: v0.6.1

Current roadmap sequence:

1. Connector consistency cleanup
2. UX Refactor 2 - Full Site IA Redesign
3. Phase 10 - Portfolio Analytics & Trends

## Vision

AI Risk Governance is a bank-grade governance platform for the full lifecycle of AI systems. It is designed to help IT Risk, Internal Audit, Compliance, AI Governance Committees, CIO/CRO leadership, and regulators understand, evidence, and monitor AI risk in a way that extends traditional governance patterns into AI-specific and agentic AI governance.

The platform demonstrates the progression:

```text
Traditional Governance -> AI Governance -> Agentic AI Governance
```

Traditional governance asks whether systems have owners, controls, evidence, approvals, monitoring, and audit trails. AI governance adds model, prompt, data, vendor, explainability, validation, human oversight, and AI risk domain controls. Agentic AI governance adds delegated authority, permitted actions, tool permissions, approval thresholds, execution logs, kill switches, and escalation for autonomous or semi-autonomous activity.

The platform now treats the full AI system boundary as a core governance principle:

```text
AI System -> Assets -> Evidence Sources -> Governance
```

AI governance cannot operate only at the repository level. AI systems are composed of repositories, databases, containers, documentation, MCP servers, external services, secrets, logs, and other assets. Evidence originates from those assets, and governance must be able to trace each asset to evidence, controls, monitoring, assurance, and audit outcomes.

## Objectives

- Maintain a complete registry of AI systems across ownership, lifecycle, risk tier, jurisdiction, components, controls, and evidence.
- Map regulatory expectations to requirements, controls, evidence, and AI systems across major financial-services jurisdictions.
- Continuously monitor control health and generate findings, exceptions, and executive-ready risk views.
- Treat evidence as a governed object with ownership, validation, review, expiry, and traceability.
- Treat AI system assets as governed sources of evidence, not as informal implementation details.
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

## Phase 7 Planned Work - Evidence Repository & Auditor Experience

Phase 7 will transform evidence from a governance attribute into a first-class governance asset. Auditors, regulators, risk teams, and governance committees should be able to move from regulation to requirement to control to evidence to finding to exception without losing context.

Planned capabilities:

- Enterprise evidence repository.
- Evidence viewer and evidence health dashboard.
- Evidence traceability navigation.
- Evidence search, filtering, and download capability.
- Auditor evidence package generation.
- Auditor workspace enhancements.

## Phase 8 Planned Work - Repository Discovery & Governance Profiling

Phase 8 will onboard AI systems through repository discovery and governance profiling. It should generate suggested governance profiles for human review rather than making final governance decisions automatically.

Planned capabilities:

- Repository discovery for GitHub and local repositories.
- Governance profiling engine.
- AI component detection for models, prompts, agents, tools, databases, and external services.
- Evidence source detection for prompt files, configuration files, policy files, workflows, logs, monitoring sources, and approval sources.
- Human review workflow for suggested, reviewed, approved, and rejected profiles.
- Repository onboarding dashboard and review pages.

## Phase 8.5 Planned Work - AI Governance Manifest Standard

Phase 8.5 establishes `AI Governance.yaml` as the foundational onboarding artifact for governed AI systems.

Enterprise story:

```text
No manifest.
No onboarding.
No governance.
```

`AI Governance.yaml` becomes the entry point into governance by declaring ownership, purpose, AI characteristics, assets, evidence sources, risk profile, regulatory scope, and data context. Manifest v2 expands the standard from repository-first onboarding to full AI system asset inventory.

## Phase 9 Planned Work - Governance Operations & Evidence Automation

Phase 9 will operationalize governance through asset discovery, evidence collection, validation, and assurance.

Planned capabilities:

- AI System Asset Inventory
- Asset Connectors
- Evidence Source Registry
- Evidence Collection Engine
- Evidence Validation Engine
- Evidence Freshness Monitoring
- Assurance Scoring
- Governance Operations Dashboard

### Phase 9H MVP - Secrets Metadata Connector

Status: MVP

Phase 9H adds secrets governance evidence without collecting secrets, tokens,
credentials, or sensitive values. The connector collects metadata that helps
prove whether secrets are inventoried, owned, mapped to source systems and
usage, governed by rotation policy, associated with Travel Brain, and prohibited
from plaintext collection.

Implemented MVP capabilities:

- Secret inventory metadata.
- Secret owner and accountable team metadata.
- Source system and environment metadata.
- Usage mapping and associated AI-system metadata.
- Rotation date and rotation cadence evidence.
- Plaintext prohibition evidence.
- Validation and assurance rules that never require secret values.
- Control traceability for security, auditability, operational resilience, and
  AI-system governance controls.

Remaining maturation work: scheduled source metadata collection, richer
read-only source integrations where APIs expose safe names, stale rotation
remediation, missing ownership remediation, and connector consistency cleanup.

### Phase 9X MVP - Asset Discovery Engine

Status: MVP

Phase 9X turns asset discovery into a governed operating capability. The engine
compares declared system boundaries against discovered assets and surfaces
repositories, databases, containers, MCP servers, logs, documentation, policies,
secrets metadata, external services, and other assets that humans may forget to
declare.

Implemented MVP capabilities:

- Cross-source asset discovery.
- Manifest-to-reality comparison.
- Undeclared asset detection.
- Missing evidence source detection.
- Discovery findings and review status.
- Known, unknown, untracked, orphaned, and missing asset classification.
- Explainable source, evidence, reason, confidence, and recommended action.
- Travel Brain validation against repository, workflow, connector, documentation,
  runtime, and metadata sources.

Remaining maturation work: scheduled discovery runs, reviewer assignment,
inventory update workflow, richer source adapters, asset criticality workflow,
historical discovery drift, and automated recommendations for evidence source
creation.

### Connector Consistency Cleanup Planned Work

Status: Current Focus

After Secrets and Asset Discovery, the connector layer should be normalized so
GitHub, Logs, Supabase, Portainer, MCP, Notion, and Secrets follow consistent
patterns for collection, validation, assurance, freshness, drift, traceability,
gap artifacts, and reviewer follow-up.

## UX Refactor 2 Planned Work - Full Site IA Redesign

Status: Planned

Priority: High

UX Refactor 2 will implement the long-term information architecture blueprint in `docs/UX_ARCHITECTURE_REVIEW.md`. It should occur after the major evidence domains, Asset Discovery Engine, and connector consistency cleanup are implemented so the redesign reflects real governance workflows rather than only GitHub-backed evidence.

Dependency:

Complete evidence domains and connector consistency first:

- GitHub
- Logs
- Portainer
- Supabase
- MCP
- Notion
- Secrets
- Asset Discovery Engine
- Connector consistency cleanup

Planned objectives:

- Simplify navigation and reduce global sidebar complexity.
- Remove duplicate destinations and overlapping page responsibilities.
- Consolidate fragmented workflows into hub-based architecture.
- Improve auditor, executive, control-owner, and system-owner journeys.
- Reduce page sprawl while preserving drill-down traceability.

Decision rationale:

Do not redesign around GitHub-only evidence. Complete the major evidence domains, run Asset Discovery, normalize connector behavior, then redesign around real workflows, real evidence, and the way auditors, executives, control owners, and system owners actually move through the platform.

## Future Phase Planned Work - Skill Governance

Skill Governance is a future governance capability that should be sequenced after completion of the major evidence domains and UX Refactor 2.

Skills are increasingly replacing human SOPs, workflows, playbooks, and procedures. In the governance model, Skills should eventually be governed as first-class assets alongside agents, tools, prompts, and models because they may make decisions, execute workflows, influence business outcomes, and encode authority.

Planned capabilities:

- Skill registry and ownership model.
- Skill approval and review workflow.
- Skill version history and lifecycle tracking.
- Skill prompt and workflow traceability.
- Skill authority classification.
- Skill usage evidence and monitoring evidence.
- Skill-to-control and Skill-to-risk mapping.
- Skill evidence sources for definitions, prompts, workflows, owners, approvals, reviews, usage metadata, and version history.

Governance principle:

```text
Human SOP -> AI Skill -> Evidence -> Assurance -> Governance
```

Skill Governance should preserve human accountability and auditor traceability even when a skill automates a previously human-owned procedure.

## Phase 10 Planned Work - Portfolio Analytics & Trends

Phase 10 will add executive-grade analytical depth across the portfolio. These capabilities were previously planned as Phase 9, but the Evidence Source Framework and Manifest v2 work showed that governance operations should come before advanced analytics.

Planned capabilities:

- Dynamic Charts
- Historical Trend Storage
- Executive PDF Export
- Advanced Portfolio Analytics

## Roadmap Principles

- Build from governance concepts the audience already understands.
- Make AI-specific risk visible without hiding the familiar control, evidence, and accountability structure.
- Keep agentic AI governance concrete by tying autonomy to actions, tools, approvals, logs, and human oversight.
- Govern the whole AI system, not only the repository.
- Treat assets as the origin point for evidence and assurance.
- Use `AI Governance.yaml` as the foundational onboarding artifact for AI systems.
- Preserve regulator and auditor traceability from executive summary down to control, evidence, and system detail.
