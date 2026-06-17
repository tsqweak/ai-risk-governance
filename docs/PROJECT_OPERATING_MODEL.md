# Project Operating Model

## Purpose

This document is the operating constitution for the AI-Risk-Governance project.
It captures the project vision, architecture principles, governance principles,
evidence principles, UX direction, lessons learned, roadmap direction, and
implementation guardrails.

Every future Codex implementation must read these documents before making
architectural or implementation decisions:

1. `docs/PROJECT_OPERATING_MODEL.md`
2. `docs/ROADMAP.md`
3. `docs/BACKLOG.md`
4. `docs/FEATURE_REGISTRY.md`

Use these documents together:

- `PROJECT_OPERATING_MODEL.md` defines the operating principles and guardrails.
- `ROADMAP.md` defines strategic direction and phase sequencing.
- `BACKLOG.md` defines future work, deferred work, and superseded work.
- `FEATURE_REGISTRY.md` defines what actually exists and its maturity.
- `UX_ARCHITECTURE_REVIEW.md` defines the long-term UX architecture direction.

When these documents appear to conflict, use `FEATURE_REGISTRY.md` as the source
of truth for current feature status and maturity. Use this operating model as
the source of truth for architectural principles and implementation behavior.

## 1. Project Vision

AI-Risk-Governance exists to become a bank-grade AI governance platform for
AI systems, AI-enabled business processes, and agentic AI. It is designed for
governance, risk, compliance, audit, and executive stakeholders who need to
understand whether AI systems are controlled, evidenced, monitored, and fit for
operation.

Primary audiences:

- CIO
- CRO
- Internal Audit
- Risk Committees
- Compliance
- AI Governance Teams
- Regulators

The core mission is to move from:

`Document Governance -> Operationalize Governance`

The platform should teach and demonstrate the progression:

`Traditional Governance -> AI Governance -> Agentic AI Governance`

The product should not feel like a generic AI dashboard. It should feel like an
enterprise governance, risk, assurance, and oversight platform.

## 2. Architecture Principles

The core architecture principle is:

`AI System -> Assets -> Evidence Sources -> Evidence Artifacts -> Assurance -> Governance`

AI systems are larger than repositories. A real AI system may include code,
databases, containers, prompts, policies, logs, approval records, model
configurations, runtime tools, monitoring outputs, documentation, and external
services.

Travel Brain established the reference lesson. Its governance surface includes:

- GitHub
- Local repositories
- Supabase
- Portainer
- Notion
- MCP servers
- External APIs
- Secrets
- Logs

Architecture decisions must start from the governed object graph, not from pages.
The platform governs AI systems, their assets, the evidence those assets produce,
and the assurance conclusions supported by that evidence.

Core architectural rules:

- The AI System is the primary governed object.
- The Portfolio is the primary organizing surface.
- The AI System Workspace is the canonical system-level view.
- Evidence & Assurance is the canonical proof layer.
- Assets are the origin point for operational evidence.
- Connectors turn asset visibility into evidence collection.
- Evidence artifacts must be attributable to sources, collections, versions, and controls.
- Assurance must be traceable to evidence, validation checks, controls, risks, and governance requirements.

## 3. Governance Principles

Governance must be designed into the lifecycle of an AI system rather than added
as documentation after the fact.

Approved governance principles:

- Governance by Design
- Manifest First
- Discovery Validates
- Human Accountability Remains Explicit
- Explainability Over Status
- Evidence Must Support Controls
- Controls Must Support Risks
- Risks Must Support Regulatory Requirements

AI Governance.yaml is the foundational onboarding artifact. It declares the
intended governance profile of the AI system, including ownership, purpose,
AI characteristics, assets, evidence sources, risk profile, data profile, and
regulatory scope.

Discovery does not replace governance judgment. Discovery validates, challenges,
and enriches declared governance information. Final governance decisions remain
human-reviewed and accountable.

Human-governed decisions must remain explicit, including:

- Risk acceptance
- Exception approval
- Production approval
- Authority delegation
- Committee decisions
- Material lifecycle decisions

Agentic AI governance must explicitly address:

- Tool permissions
- Delegated authority
- Human approval gates
- Execution logging
- Kill switches
- Runtime limits
- Unauthorized action prevention
- Monitoring and escalation

## 4. Evidence Principles

Evidence is the foundation of governance assurance, but evidence alone is not
the same as assurance.

Required evidence maturity model:

`Metadata -> Evidence Source -> Evidence Artifact -> Assurance -> Explainable Assurance`

Operating distinctions:

- Metadata is not evidence.
- Evidence is not assurance.
- Assurance is not governance.
- A page existing is not the same as a capability being complete.

Required principle:

Never stop at metadata if evidence can be collected.

Evidence must be:

- Inspectable
- Attributable
- Versioned
- Traceable
- Freshness-aware
- Reviewable
- Linked to controls
- Linked to assurance explanations
- Safe for audit and regulatory review

Verifiable evidence must preserve:

- Source
- Collection method
- Collection timestamp
- Version or commit SHA where applicable
- Artifact hash where applicable
- Validation result
- Assurance result
- Linked controls
- Linked risks or requirements where applicable

Runtime evidence must preserve privacy and security boundaries. Do not collect:

- Secrets
- Tokens
- Credentials
- Customer content
- Personal data
- Sensitive payloads

Sanitized runtime evidence can still be operationally meaningful when it shows
event type, timestamp, action category, control result, correlation ID, source,
hash, validation, retention, and assurance context.

Real evidence is preferred over seeded examples. Seeded data is acceptable only
when a source is not yet available, and the gap must be explicit.

## 5. UX Principles

The product should organize around user questions and governance workflows, not
around feature inventory.

Approved UX principles:

- Workflow over dashboards.
- Fewer global choices.
- Canonical object pages.
- Evidence & Assurance is the proof layer.
- Executives see conclusions.
- Auditors see proof.
- Control owners see actions.
- System owners see posture.
- Avoid capability-first navigation.
- Prefer question-first navigation.

Evidence & Assurance is the canonical workflow for proof, artifacts, snapshots,
drift, assurance, traceability, and audit packages.

AI System Workspaces remain the canonical place to understand the posture of a
specific AI system.

Specialist pages should drill down from hubs. They should not become duplicate
canonical destinations.

## 6. Lessons Learned

Lesson: Metadata is not evidence.

Metadata can prove that something was registered, but it does not prove what the
artifact says, whether it is current, or whether it supports a control.

Lesson: Evidence without assurance is weak.

Collected artifacts must be validated and mapped to controls. Otherwise the
platform only stores proof-like material without explaining its governance value.

Lesson: Pass, Warning, and Fail must be explainable.

Every governance conclusion must answer why it occurred, which evidence supports
it, which validation checks ran, what is missing, and what would cause failure.

Lesson: AI systems are larger than repositories.

Repository discovery is necessary, but insufficient. Governance must see assets,
evidence sources, runtime behavior, documentation, external services, and human
governance records.

Lesson: Manifest first. Discovery validates.

AI Governance.yaml declares the intended governance profile. Discovery checks
whether reality supports that declaration.

Lesson: Evidence collection must eventually become real.

Seeded examples are useful for demonstrating workflows, but operating maturity
requires real source collection and explicit gap reporting.

Lesson: Do not redesign UX before enough evidence domains exist.

The platform should not be redesigned around GitHub-only evidence. Complete
major evidence domains first, then redesign around real evidence workflows.

Lesson: Build one connector fully before starting the next.

A mature connector should support collection, validation, assurance, traceability,
freshness, and explainability. Starting many metadata-only connectors creates
governance theater.

Lesson: Discovery should find assets humans forget.

Asset discovery should challenge the declared manifest and surface overlooked
repositories, databases, containers, MCP servers, logs, documentation, policies,
secrets metadata, and external services. Discovery enriches the governed object
graph; it does not replace accountable human review.

Lesson: GitHub proves design intent.

GitHub artifacts such as manifests, prompts, policies, and workflows show how
the system is intended to be governed.

Lesson: Logs prove operational reality.

Runtime evidence shows whether the system operated, whether monitoring ran, and
whether control results exist.

Lesson: Portainer should prove deployed-state reality.

Deployment and container metadata should support evidence about runtime posture,
deployment state, and operational control coverage.

Lesson: Evidence must work in both directions.

Auditors need `Control -> Evidence`. Evidence reviewers need
`Evidence -> Control`. Both paths must be supported.

Lesson: Failure scenarios are part of assurance.

Controls should explain how they operate and how they fail, such as prompt
changes without approval, policy changes, removed workflows, stale evidence, or
missing approval records.

Lesson: Human governance evidence cannot be fully automated.

Risk acceptance, production approval, committee decisions, and exception approval
require accountable human judgment, even when supporting evidence can be
automatically collected.

Lesson: UX hubs prevent navigation sprawl.

Evidence & Assurance should absorb proof-related workflows instead of adding
new global navigation entries for every capability.

Lesson: The Feature Registry prevents false completion.

A feature should not be marked complete simply because a route exists. Maturity
depends on whether the workflow is operational, evidenced, tested, and useful.

Lesson: No manifest. No onboarding. No governance.

AI Governance.yaml is the entry point for scalable enterprise onboarding.

Lesson: Governance engineering must teach the implementation story.

Non-engineers should be able to follow:

`Requirement -> Control -> Implementation -> Evidence -> Monitoring -> Assurance Story`

Lesson: Skills are future governed assets.

Skills are increasingly becoming AI versions of human SOPs, workflows,
playbooks, and procedures. Future governance must treat Skills as owned,
versioned, approved, evidenced, and traceable assets.

Lesson: Governance should operationalize, not document.

Documentation is useful only when it leads to controlled operation, evidence
collection, assurance, review, and accountable decisions.

## 7. Current Architecture

Use `docs/FEATURE_REGISTRY.md` as the source of truth for current status and
maturity. As of the current operating model, the platform is generally at
Level 3 MVP maturity, with selected Level 4 Operational capabilities.

Completed or mature baseline capabilities include:

- AI System Registry
- Regulatory Mapping
- Monitoring Engine
- Findings
- Evidence Governance
- AI Governance
- Agentic Governance
- Lifecycle Governance
- AI Risk Framework
- Governance Engineering

Operational capabilities include:

- GitHub Connector
- Logs Connector
- Supabase Connector

MVP capabilities include:

- Evidence Repository
- Auditor Workspace
- Repository Discovery
- AI Governance Manifest
- Travel Brain Pilot
- Asset Inventory
- Evidence Source Registry
- Governance Operations Dashboard
- Evidence Traceability
- Explainable Assurance
- Verifiable Evidence
- Evidence Automation
- Evidence & Assurance Hub
- Portainer Connector
- MCP Connector

Partial capabilities include:

- Notion Governance Connector

Planned capabilities include:

- Secrets Metadata Connector
- UX Refactor 2 - Full Site IA Redesign
- Skill Governance

## 8. Connector Strategy

Approved connector roadmap:

1. GitHub
2. Logs
3. Portainer
4. Supabase
5. MCP
6. Notion
7. Secrets

Phase 9 is not complete until the major Travel Brain evidence domains support:

- Collection
- Validation
- Assurance
- Traceability

This applies to:

- GitHub
- Logs
- Portainer
- Supabase
- MCP
- Notion
- Secrets

Connector maturity requires:

1. Connection or connector-ready source model
2. Evidence source registration
3. Evidence artifact or sanitized artifact collection
4. Validation status
5. Assurance result
6. Explainable assurance
7. Control-to-evidence and evidence-to-control traceability
8. Freshness, drift, or health monitoring where applicable

GitHub is the reference connector for design-intent evidence. Logs are the
reference connector for operational-runtime evidence. Supabase is the reference
connector for data-governance evidence. Portainer and MCP are MVP reference
patterns that need consistency cleanup before they can be promoted. Notion is
partial until scoped human-governance evidence can be collected. Secrets is the
next connector target and must collect metadata only, never secret values.

Current connector status:

- GitHub Connector: Operational
- Logs Connector: Operational
- Supabase Connector: Operational
- Portainer Connector: MVP
- MCP Connector: MVP
- Notion Connector: Partial
- Secrets Connector: Not Started

## 9. UX Refactor Strategy

UX Refactor 1 established the Evidence & Assurance Hub as the canonical proof
layer. It consolidated evidence, artifacts, snapshots, drift, sources, assurance,
packages, and traceability into a single workflow.

UX Refactor 2 is planned but intentionally delayed.

Reference:

- `docs/UX_ARCHITECTURE_REVIEW.md`

Rationale:

- Do not redesign around GitHub-only evidence.
- Complete major evidence domains first.
- Redesign around real workflows and real evidence once GitHub, Logs, Portainer,
  Supabase, MCP, Notion, and Secrets are sufficiently represented.

Long-term top-level UX direction:

- Executive
- Portfolio
- Governance
- Evidence & Assurance
- Auditor Workspace
- Committee
- Administration

The goal is to reduce global navigation complexity, remove duplicate destinations,
and make workflows easier for executives, auditors, control owners, and system
owners.

## 10. Current Focus

Current phase:

`Phase 9H - Secrets Metadata Connector`

Current objective:

Create a secrets metadata evidence domain that proves inventory, ownership,
storage location, access policy, rotation records, and plaintext prohibition
without collecting or exposing secret values.

Current success criteria:

- Secret inventory metadata is represented as governed asset evidence.
- Secret values, tokens, credentials, customer content, personal data, and
  sensitive payloads are never collected.
- Storage locations, owners, rotation dates, access policy metadata, and
  plaintext-prohibition evidence are inspectable.
- Evidence is validated, freshness-aware, and attributable to a source.
- Assurance is explainable and mapped to controls, risks, and AI systems.
- Missing sources produce explicit gap artifacts rather than invented evidence.

Current risks:

- Accidentally collecting secret values or sensitive configuration.
- Treating metadata as sufficient evidence without validation and assurance.
- Creating a connector pattern that diverges from GitHub, Logs, Supabase,
  Portainer, MCP, and Notion evidence workflows.
- Marking the connector mature before collection, validation, assurance,
  freshness, and traceability exist.

Current open questions:

- Which source system should provide Travel Brain secrets metadata?
- What metadata can be collected safely without exposing values?
- Which controls require rotation, ownership, storage, or access-policy proof?
- What freshness threshold should apply to secrets metadata?
- Should stale rotation metadata generate findings immediately or remain
  reviewer-attested at first?

Current roadmap sequence:

1. Phase 9H - Secrets Metadata Connector
2. Phase 9X - Asset Discovery Engine
3. Connector consistency cleanup
4. UX Refactor 2 - Full Site IA Redesign
5. Phase 10 - Analytics & Trends

## 11. Codex Guardrails

Before implementing, Codex must:

1. Read `docs/PROJECT_OPERATING_MODEL.md`.
2. Read `docs/ROADMAP.md`.
3. Read `docs/BACKLOG.md`.
4. Read `docs/FEATURE_REGISTRY.md`.
5. Identify the current feature maturity before changing behavior.
6. Determine whether the task is documentation, planning, UX architecture, or
   implementation.
7. Inspect existing schemas, data models, routes, and tests before adding new
   abstractions.

Never:

- Stop at metadata if evidence can be collected.
- Create Pass, Warning, or Fail without explanation.
- Create assurance without traceability.
- Create duplicate canonical pages.
- Introduce navigation outside the approved IA direction.
- Mark a feature complete because a page exists.
- Collect secrets, tokens, credentials, customer content, personal data, or
  sensitive payloads.
- Hide missing sources by inventing fake evidence.
- Bypass human accountability with automatic governance decisions.
- Redesign the full UX before major evidence domains exist.
- Break the AI System Workspace as the canonical system-level view.
- Break Evidence & Assurance as the canonical proof layer.

Always:

- Preserve the governance story.
- Preserve the evidence chain.
- Preserve audit traceability.
- Prefer real evidence over seeded examples.
- Document gaps explicitly.
- Update `FEATURE_REGISTRY.md` when feature maturity changes.
- Add or update smoke tests for new governance workflows.
- Keep Evidence & Assurance as the proof hub.
- Use AI Governance.yaml as the onboarding anchor.
- Maintain bidirectional control-to-evidence traceability.
- Show why an assurance result passed, warned, or failed.
- Show failure conditions for controls and assurance claims.
- Protect privacy and security boundaries.
- Keep human approval and accountability visible.

## 12. Future Evolution

The long-term governance operating flow is:

```text
AI Governance.yaml
  -> Discovery
  -> Evidence Collection
  -> Validation
  -> Assurance
  -> Governance Operations
```

The enterprise operating story is:

1. AI Governance.yaml declares the system, ownership, assets, evidence sources,
   risk profile, and regulatory scope.
2. Discovery validates the manifest against repositories, runtime assets,
   documentation systems, external services, and operational sources.
3. Connectors collect evidence from governed assets.
4. Validation determines whether evidence exists, is current, is versioned, and
   supports the expected control.
5. Assurance explains whether governance claims are supported.
6. Governance Operations gives risk, audit, compliance, control owners, and
   executives an operating view of governance health.

The project must continue evolving from documentation to operations, from status
to assurance, and from seeded examples to real evidence.
