# AI Risk Governance Backlog

Current release: v0.6.0
Current platform state: Connector consistency cleanup planning update after Asset Discovery Engine MVP

Current roadmap sequence:

1. Connector consistency cleanup
2. UX Refactor 2 - Full Site IA Redesign
3. Phase 10 - Portfolio Analytics & Trends

This backlog reflects the project state after the Evidence Source Framework, AI Governance Manifest v2, and Travel Brain asset inventory analysis. The core planning principle is now:

```text
AI System -> Assets -> Evidence Sources -> Governance
```

AI governance cannot operate only at the repository level. Repositories remain important, but governed AI systems also include databases, containers, documentation, MCP servers, external services, secrets, logs, and other operational assets.

## Phase 7 - Evidence Repository & Auditor Experience

Goal: Make evidence feel like governed proof, not passive attachments. Phase 7 should strengthen auditor workflows, traceability, evidence review, and evidence export patterns across controls, risks, findings, regulations, monitoring, implementations, and AI systems.

- Evidence Repository
- Evidence Viewer
- Evidence Download Capability
- Evidence Traceability Navigation
- Evidence Search & Filtering
- Auditor Evidence Package Generation

## Phase 8 - Real Project Onboarding

Goal: Move from seeded demonstration systems toward real project intake, portfolio scale, and operational onboarding. Phase 8 should support bringing existing projects into the governance platform with enough metadata, owners, lifecycle state, risk context, regulatory scope, and evidence expectations to make them governable.

- Existing Codex Project Onboarding
- Portfolio Search & Filtering
- Real Project Onboarding
- Cross-System Reporting
- AI Governance Manifest onboarding
- Repository Discovery & Governance Profiling
- Human review workflow for suggested governance profiles

## Phase 9 - Governance Operations & Evidence Automation

Goal: Operationalize governance through asset discovery, evidence collection, evidence validation, freshness monitoring, and assurance. Phase 9 should move the platform from governance documentation toward governance operations.

- AI System Asset Inventory
- Asset Connectors
- Evidence Source Registry
- Evidence Collection Engine
- Evidence Validation Engine
- Evidence Freshness Monitoring
- Assurance Scoring
- Governance Operations Dashboard
- Asset Criticality Classification
- Asset Drift Monitoring
- Governance Manifest Drift Monitoring

## Phase 9 Connector Roadmap

Phase 9 is not complete until the major Travel Brain evidence domains support collection, validation, assurance, and traceability. GitHub, Logs, Supabase, Portainer, MCP, Notion gap evidence, Secrets metadata, and Asset Discovery now prove the operating pattern. The next gap is normalizing connector and discovery behavior before UX Refactor 2.

### 9A - GitHub Evidence & Assurance

Status: Operational

Scope: Repository discovery, manifest collection, prompt collection, policy collection, workflow collection, provenance, artifact assurance, and control support validation.

### 9B - Evidence Traceability

Status: Planned

Scope: Bidirectional navigation and reporting across `Control -> Evidence` and `Evidence -> Control`, with auditor-oriented traceability views.

### 9C - Logs Connector

Status: Operational

Scope: Execution logs, monitoring results, control results, correlation IDs, runtime assurance, and evidence freshness.

### 9D - Portainer Connector

Status: MVP

Scope: Container metadata, deployment metadata, runtime metadata, image provenance, service health, and deployment drift.

### 9E - Supabase Connector

Status: Operational

Scope: Schema evidence, table inventory, column inventory, RLS policies, role inventory, extension metadata, historical snapshots, drift detection, control validation, generated findings, and privacy/security/audit control support. Remaining future work includes scheduled collection, reviewer attestations, remediation workflow, approved baseline management, and richer query/audit log evidence.

### 9F - MCP Connector

Status: MVP

Scope: MCP server inventory, tool registry, tool permissions, authority classification, capability inventory, delegated authority enforcement, and agentic assurance. Remaining work includes live endpoint-level metadata validation, scheduled freshness collection, MCP drift detection, and policy remediation for unclassified write-capable tools.

### 9G - Notion Governance Connector

Status: Partial

Scope: Governance records, approval notes, committee decisions, review evidence, ownership evidence, exceptions, and human-governed evidence. Connector-ready schema, evidence sources, gap artifacts, assurance, and traceability exist. Real collection is blocked until scoped Travel Brain Notion credentials and a shared governance page or database are configured.

### 9H - Secrets Metadata Connector

Status: MVP

Scope: Metadata-only Travel Brain secret inventory, ownership, source system, environment, rotation evidence, usage mapping, associated AI system, plaintext prohibition evidence, assurance warnings, and bidirectional control traceability. Secret values, tokens, passwords, API key values, certificates, private keys, and connection strings must never be collected, stored, displayed, logged, hashed, exported, or persisted. Remaining work includes scheduled source metadata collection and remediation of stale rotation or missing ownership warnings.

### 9X - Asset Discovery Engine

Status: MVP

Scope: Cross-source discovery of AI-system assets that humans may forget to
declare, including repositories, databases, containers, logs, MCP servers,
documentation, governance records, external services, and secrets metadata.
Discovery should compare actual assets against `AI Governance.yaml`, evidence
sources, controls, risks, and assurance gaps for human review. Travel Brain now
has discovery runs, sources, and findings that classify known, unknown,
untracked, orphaned, and missing assets with evidence, confidence, and
recommended actions.

### Connector Consistency Cleanup

Status: Current Focus

Scope: Normalize connector behavior across GitHub, Logs, Supabase, Portainer,
MCP, Notion, and Secrets so each domain follows consistent patterns for
collection, validation, assurance, traceability, freshness, drift, gap artifacts,
source issues, and reviewer follow-up.

### Phase 9 Completion Criteria

Phase 9 is complete only when these evidence domains support collection, validation, assurance, and traceability:

- GitHub
- Logs
- Portainer
- Supabase
- MCP
- Notion
- Secrets
- Asset Discovery

Phase 9 follow-on work should then complete connector consistency cleanup before
UX Refactor 2.

## Phase 10 - Portfolio Analytics & Trends

Goal: Add executive-grade analytical depth across the portfolio. Phase 10 should focus on trend storage, dynamic visualization, report generation, and portfolio-level analysis that helps leadership understand compliance posture, governance health, and risk movement over time.

- Dynamic Charts
- Historical Trend Storage
- Executive PDF Export
- Advanced Portfolio Analytics

## Future Initiatives

### UX Refactor 2 - Full Site IA Redesign

Status: Planned

Priority: High

Reference: `docs/UX_ARCHITECTURE_REVIEW.md`

Objectives:

- Simplify navigation
- Remove duplication
- Consolidate workflows
- Reduce page sprawl
- Improve auditor workflow
- Improve executive workflow
- Improve control-owner workflow
- Improve system-owner workflow
- Implement hub-based architecture
- Reduce global sidebar complexity

Dependencies:

- GitHub evidence domain
- Logs evidence domain
- Portainer evidence domain
- Supabase evidence domain
- MCP evidence domain
- Notion evidence domain
- Secrets evidence domain
- Asset Discovery Engine
- Connector consistency cleanup

Decision rationale:

UX Refactor 1 created the Evidence & Assurance Hub and reduced proof-layer fragmentation, but the broader platform should not be redesigned around GitHub-only evidence. Complete the major evidence domains, run Asset Discovery, normalize connector behavior, then redesign the full site around real workflows, real assets, and real evidence.

### Skill Governance

Status: Planned

Priority: Medium

Position: After connector completion and UX Refactor 2.

Goal: Govern AI Skills as first-class governance assets. Skills are increasingly replacing human SOPs, workflows, playbooks, and procedures, so the platform should eventually govern Skills the same way it governs agents, tools, prompts, and models.

Governance principles:

- Skills are often AI versions of human SOPs.
- Skills may make decisions, execute workflows, and influence business outcomes.
- Skills require explicit ownership, approvals, reviews, evidence, and traceability.
- Skill governance should preserve human accountability even when a workflow is automated or semi-automated.

Objectives:

- Govern AI Skills as first-class assets
- Track Skill ownership
- Track Skill approvals
- Track Skill reviews
- Track Skill versions
- Track Skill prompts
- Track Skill workflows
- Track Skill usage evidence
- Track Skill authority
- Track Skill lifecycle

Future evidence sources:

- Skill definition
- Skill prompt
- Skill workflow
- Skill owner
- Skill approvals
- Skill reviews
- Skill usage metadata
- Skill version history

## Operational Enhancements

Goal: Deepen operational governance workflows that already exist conceptually or structurally but need richer workflow behavior, review cadence, or evidence depth.

- Warning-generating tests
- Finding aging and SLA tracking
- Exception expiration monitoring
- Tool permission review dates
- Authority change approval
- Prompt change approval workflow
- Model validation detail page
- Agent lifecycle workflow
- AI risk domain testing evidence

## Deferred Enhancements

These items remain useful but are not part of the immediate Phase 7-10 critical path.

- Codex integration
- Codex project import
- Jurisdiction normalization
- Enhanced onboarding validation
- Remediation workflow
- Control test scheduling
- Manual evidence upload
- Regulatory gap remediation workflow
- Portfolio expansion

## Removed / Superseded Items

These items are removed from the active backlog because they were completed, absorbed into later phases, or superseded by the Phase 6F information architecture.

- Dynamic AI System Routes - superseded by the unified dynamic AI System Workspace at `/systems/[slug]`.
- Expanded Lifecycle Management - completed through Phase 6C AI Lifecycle Governance.
- AI intake process - completed or absorbed into lifecycle and administration architecture.
- Approval workflow - completed across lifecycle, risk acceptance, and governance committee patterns.
- Development stage gates - completed through lifecycle stage-gate controls.
- Testing stage gates - completed through lifecycle stage-gate controls.
- Pilot approvals - completed through lifecycle approval model.
- Production approvals - completed through lifecycle approval model.
- Retirement workflow - completed through lifecycle governance model.
- Evidence complete lifecycle control - completed through Phase 6C controls and monitoring.
- AI risk register - completed through Phase 6D AI Risk Assessment Framework.
- Inherent and residual risk models - completed through Phase 6D.
- Risk treatment and acceptance model - completed through Phase 6D.
- Control Implementation Registry - completed through Phase 6E Governance Engineering.
- Implementation Evidence - completed through Phase 6E.
- Governance Engineering Dashboard - completed through Phase 6E.
- AI System Governance Engineering View - completed through Phase 6E and surfaced in the Phase 6F unified workspace.
- Guided walkthrough placeholders - completed through Phase 6F.
- Governance Framework navigation - completed through Phase 6F.
- Auditor Workspace navigation - completed through Phase 6F.
- Governance Committee navigation - completed through Phase 6F.
