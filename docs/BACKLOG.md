# AI Risk Governance Backlog

Current release: v0.6.0
Current platform state: Phase 8.5.1 planning update

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

Phase 9 is not complete until the major Travel Brain evidence domains support collection, validation, assurance, and traceability. GitHub now proves the operating pattern against the real Travel Brain repository, but Travel Brain governance also depends on logs, Portainer, Supabase, MCP, Notion, and secrets metadata.

### 9A - GitHub Evidence & Assurance

Status: In Progress

Scope: Repository discovery, manifest collection, prompt collection, policy collection, workflow collection, provenance, artifact assurance, and control support validation.

### 9B - Evidence Traceability

Status: Planned

Scope: Bidirectional navigation and reporting across `Control -> Evidence` and `Evidence -> Control`, with auditor-oriented traceability views.

### 9C - Logs Connector

Status: Planned

Scope: Execution logs, monitoring results, control results, correlation IDs, runtime assurance, and evidence freshness.

### 9D - Portainer Connector

Status: Planned

Scope: Container metadata, deployment metadata, runtime metadata, image provenance, service health, and deployment drift.

### 9E - Supabase Connector

Status: Planned

Scope: Schema evidence, RLS policies, data inventory, query/audit logs, access controls, and privacy control support.

### 9F - MCP Connector

Status: Planned

Scope: MCP server inventory, tool registry, tool permissions, execution activity, delegated authority enforcement, and agentic assurance.

### 9G - Notion Governance Connector

Status: Planned

Scope: Governance records, approval notes, committee decisions, review evidence, exceptions, and human-governed evidence.

### 9H - Secrets Metadata Connector

Status: Planned

Scope: Secret inventory metadata, ownership, storage location, access policy, rotation records, and plaintext prohibition evidence. Secret values must never be collected.

### Phase 9 Completion Criteria

Phase 9 is complete only when these evidence domains support collection, validation, assurance, and traceability:

- GitHub
- Logs
- Portainer
- Supabase
- MCP
- Notion
- Secrets

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

Decision rationale:

UX Refactor 1 created the Evidence & Assurance Hub and reduced proof-layer fragmentation, but the broader platform should not be redesigned around GitHub-only evidence. Complete the major evidence domains first, then redesign the full site around real workflows, real assets, and real evidence.

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
