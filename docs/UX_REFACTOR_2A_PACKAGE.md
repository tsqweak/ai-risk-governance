# UX Refactor 2A Package

Purpose: final Information Architecture blueprint for UX Refactor 2 before implementation work begins.

Status: Architecture package only. No application code, components, routes, schemas, or visual redesigns are changed by this package.

Amendment status: Updated by UX Refactor 2A.6 to apply the approved expert-review decisions. The final approved architecture keeps Auditor Workspace and AI Systems as top-level navigation, removes Findings as a top-level workspace, treats Findings as a shared action model, adds Control Owner Queue, groups Evidence & Assurance navigation, and defines Action Required as a reusable platform pattern.

Authoritative inputs:

- `docs/PROJECT_OPERATING_MODEL.md`
- `docs/ROADMAP.md`
- `docs/BACKLOG.md`
- `docs/FEATURE_REGISTRY.md`
- `docs/PLATFORM_REVIEW_PACKAGE.md`
- `docs/UX_ARCHITECTURE_REVIEW.md`

## Executive Summary

The platform is now functionally richer than its information architecture. Core governance capabilities exist across AI system registry, controls, regulatory mapping, findings, exceptions, evidence, assurance, connectors, asset discovery, AI governance, agentic governance, lifecycle governance, risk, and platform review. The problem to solve in UX Refactor 2 is not visual polish or missing page count. The problem is route ownership, workflow clarity, and trust.

The final IA should organize the product around governed objects and governance workflows:

```text
AI System -> Assets -> Evidence Sources -> Evidence Artifacts -> Assurance -> Governance
```

The global navigation should expose a small number of stable work areas:

```text
Executive
Portfolio
AI Systems
Governance
Evidence & Assurance
Auditor Workspace
Administration
```

Everything else should become a secondary navigation item, workspace tab, object detail, queue, or redirected legacy route.

## Current State Assessment

### Current Strengths

- The AI System Workspace is the strongest existing organizing model.
- Evidence & Assurance is already established as the canonical proof layer.
- Control detail pages are strong canonical object pages with evidence, assurance, validation, findings, and traceability.
- Platform Review now provides route, feature, evidence, connector, navigation, drift, and open issue inventory.
- GitHub, Logs, Supabase, MCP, Secrets, Notion gap artifacts, Portainer gap artifacts, and Asset Discovery now create a broad evidence operating model.
- Discovery now validates whether findings are real before counting them as inventory.
- Supabase is operational again with real metadata, snapshots, drift, and control validation.
- Portainer warning language correctly describes a Private Infrastructure Access Limitation, not a Portainer outage.

### Current Problems

- The global sidebar still exposes implementation-phase pages as peer destinations.
- Evidence remains spread across legacy evidence routes, Evidence & Assurance routes, system tabs, auditor pages, and connector-specific artifact pages.
- Auditor workflow has too many possible starting points.
- Executive workflow is split across Executive, Portfolio, Board Report, Risk Heatmap, Regulatory Coverage, and Control Health.
- Governance discipline pages overlap with system-level tabs.
- Administration, onboarding, manifest, platform review, and pilot content are not consistently grouped.
- `/auditor` and `/auditor-workspace` duplicate audit entry points.
- `/projects/travel-brain` and `/regulatory-mapping` are deprecated route candidates.
- Governance Operations is still reachable as a standalone route even though it belongs inside Evidence & Assurance.

### Current Route Counts

From the current Platform Review Package:

| Status | Count |
| --- | ---: |
| Active | 68 |
| Review | 11 |
| Deprecated | 2 |

| Category | Count |
| --- | ---: |
| Evidence | 30 |
| Operational | 21 |
| Workspace | 11 |
| Hub | 6 |
| Dashboard | 5 |
| Administration | 3 |
| Object Detail | 3 |
| Deprecated | 2 |

The route inventory confirms that the app has become evidence-heavy and capability-heavy. UX Refactor 2 should reduce top-level choices without losing traceability.

## Future Information Architecture

### Top-Level Navigation

Final recommended top-level navigation:

| Item | Purpose | Why It Exists |
| --- | --- | --- |
| Executive | Senior leadership posture and decision review. | CIO, CRO, board, and risk committee users need a concise answer to compliance, governance health, material risk, and decisions required. |
| Portfolio | Cross-system management of governed AI systems. | The portfolio is the primary organizing surface for comparing systems, owners, risks, evidence health, findings, and lifecycle state. |
| AI Systems | Object inventory and direct access to governed AI System Workspaces. | The AI System is the primary governed object, so users need a stable direct-access route to system inventory and canonical system workspaces without turning Portfolio into a detail finder. |
| Governance | Controls, compliance, lifecycle, risk, AI governance, agentic governance, and governance engineering. | Governance teams need discipline-oriented workbenches and action queues. |
| Evidence & Assurance | Canonical proof layer for sources, artifacts, snapshots, drift, assurance, traceability, connector evidence, and packages. | Auditable proof must have one home. Metadata is not evidence, and evidence needs source, validation, freshness, hash, traceability, and assurance context. |
| Auditor Workspace | Canonical audit execution and regulator-support workflow. | Internal Audit and regulators are primary platform audiences; they need one visible path from scope to proof to audit package. |
| Administration | Onboarding, standards, manifests, platform review, libraries, configuration, pilot material, and connector setup. | Setup, standards, and platform governance should not compete with daily governance workflows. |

### Why Other Items Should Not Be Top-Level

| Current Item | Final Placement | Rationale |
| --- | --- | --- |
| Framework | Governance or Administration | Framework content supports governance structure and configuration; it is not a daily top-level workspace. |
| Findings | Shared action model across Executive, Portfolio, AI Systems, Governance, Evidence & Assurance, and Auditor Workspace | Findings are important enough to appear everywhere action is required, but not a separate top-level workspace. |
| Committee | Governance secondary workflow | Committee decisions are governance actions: approvals, risk acceptances, authority changes, and lifecycle decisions. |
| Travel Brain Pilot | Administration -> Onboarding -> Pilot Assessments | Pilot content is validation/onboarding material, not a production governance destination. |
| Compliance | Governance -> Compliance and Portfolio -> Regulatory Coverage | Compliance is a governance discipline and portfolio lens, not a separate global hub. |
| Risk Management | Governance -> Risk and Portfolio risk views | Risk should be reachable through governance and portfolio context. |
| Control Monitoring | Governance -> Monitoring and Findings queues | Monitoring is a control workflow, not a top-level area. |
| AI Manifest | Administration -> Standards / Onboarding | Manifest is an onboarding standard and evidence source declaration mechanism. |
| Engineering | Governance -> Governance Engineering | Governance engineering is a discipline inside Governance. |
| Walkthroughs | Administration -> Support / Demonstrations | Walkthroughs are support content, not operational navigation. |
| Platform Review | Administration -> Platform Review | Platform review is meta-governance and release review. |
| Governance Operations | Evidence & Assurance -> Operations | Connector/source/artifact operations belong to the proof layer. |

## Navigation Blueprint

### Primary Navigation

```text
Executive
Portfolio
AI Systems
Governance
Evidence & Assurance
Auditor Workspace
Administration
```

### Executive Secondary Navigation

```text
Overview
Compliance Posture
Governance Health
Material Risks
Decisions Required
Board Report
Portfolio Health
```

### Portfolio Secondary Navigation

```text
Overview
AI Systems
Risk Heatmap
Regulatory Coverage
Control Health
Evidence Health
Action Required
Trends
```

### AI Systems Secondary Navigation

```text
Inventory
Discovery Gaps
Onboarding Status
System Workspaces
Owners
Lifecycle
```

Canonical AI System Workspace tabs:

```text
Overview
Action Required
Controls
Evidence
Monitoring
Risk
Regulations
Lifecycle
AI Governance
Agentic Governance
Governance Engineering
Audit Trail
```

If tab overload remains, group tabs into: Posture, Governance, Evidence, Operations, Audit.

### Governance Secondary Navigation

```text
Overview
Controls
Control Owner Queue
Compliance
Monitoring
Lifecycle
Risk
AI Governance
Agentic Governance
Governance Engineering
Committee Decisions
```

### Evidence & Assurance Secondary Navigation

```text
Overview

Review
  Repository
  Health
  Assurance
  Traceability
  Packages

Sources
  Sources
  Asset Discovery
  Operations

Artifacts
  Artifacts
  Snapshots
  Drift

Evidence Domains
  Runtime
  Deployments
  Data Governance
  MCP Governance
  Governance Evidence
  Secrets Governance
```

### Auditor Workspace Secondary Navigation

```text
Scope
Prove a Control
Traceability
Evidence Review
Artifact Verification
Findings / Exceptions Review
Audit Package
```

### Administration Secondary Navigation

```text
Overview
Onboarding
Repository Discovery
Manifest Registry
Pilot Assessments
Platform Review
Framework
Control Library
Regulatory Library
Connector Configuration
Owner Management
Support / Walkthroughs
```

Administration secondary navigation should be grouped into:

```text
Onboarding
Standards
Platform Operations
Libraries
Support
```

## Workspace Blueprint

### Executive Workspace

Purpose: decision support for senior leadership, board, and risk committee review.

Users: CIO, CRO, executive leadership, board reporting preparers, risk committee members.

Primary workflows:

- Review compliance posture.
- Review governance health.
- Identify material risks and material gaps.
- Review decisions required.
- Open board-ready report.
- Drill into portfolio only when needed.

Major pages:

- Executive Overview
- Board Report
- Material Gaps
- Decisions Required
- Portfolio Health

### Auditor Workspace

Purpose: independent verification of governance claims.

Users: Internal Audit, external audit, regulators, compliance assurance.

Primary workflows:

- Define audit scope.
- Trace regulation to requirement to control to evidence.
- Review control operation and assurance.
- Inspect evidence artifacts, snapshots, hashes, timestamps, source records, and drift.
- Review findings and exceptions.
- Generate audit package.

Major pages:

- Audit Dashboard
- Scope
- Traceability
- Control Review
- Evidence Review
- Artifact Verification
- Findings / Exceptions
- Audit Packages

Placement: top-level workspace. Evidence & Assurance remains the canonical proof layer, but Auditor Workspace remains the canonical audit execution route.

Canonical workflow:

```text
Scope
  -> Prove a Control
  -> Traceability
  -> Evidence Review
  -> Artifact Verification
  -> Audit Package
```

Audit package lifecycle:

```text
Draft
  -> Scope Confirmed
  -> Evidence Complete
  -> Exceptions Reviewed
  -> Ready for Export
  -> Archived
```

### Governance Workspace

Purpose: operating workspace for governance disciplines.

Users: AI governance team, risk, compliance, control owners, model risk, security governance, governance engineering.

Primary workflows:

- Manage controls and compliance obligations.
- Monitor controls and findings.
- Operate the Control Owner Queue.
- Govern lifecycle gates.
- Review risks and exceptions.
- Govern AI-specific and agentic controls.
- Review governance engineering implementation evidence.
- Prepare committee decisions.

Major pages:

- Governance Overview
- Controls
- Compliance
- Monitoring
- Lifecycle
- Risk
- AI Governance
- Agentic Governance
- Governance Engineering
- Committee Decisions
- Control Owner Queue

### Control Owner Queue

Purpose: one place for control owners to understand required action.

Users: control owners, governance operators, risk/control reviewers, system owners who inherit control remediation.

Primary workflows:

- Review failed controls.
- Review evidence issues for owned controls.
- Review findings and exceptions linked to owned controls.
- Review overdue control reviews and validation tasks.
- Assign or update remediation tasks.
- Follow the proof path to evidence, assurance, source, drift, or system context.

Queue inputs:

- Failed controls.
- Evidence gaps.
- Invalid or stale evidence.
- Failed validations.
- Open control findings.
- Exceptions requiring owner review.
- Overdue reviews.
- Remediation tasks.

### AI System Workspace

Purpose: canonical system-level view of one governed AI system.

Users: system owners, product owners, control owners, governance reviewers, auditors.

Primary workflows:

- Understand system posture.
- Review action required.
- Verify controls, evidence, monitoring, risk, regulations, lifecycle, AI governance, agentic governance, implementation evidence, and audit trail.
- Follow system-specific evidence into canonical Evidence & Assurance objects.

Major pages:

- System Overview
- Action Required
- Controls
- Evidence
- Monitoring
- Risk
- Regulations
- Lifecycle
- AI Governance
- Agentic Governance
- Governance Engineering
- Audit Trail

### Administration Workspace

Purpose: setup, standards, onboarding, platform governance, and configuration.

Users: platform owner, governance administrators, onboarding reviewers, standards owners.

Primary workflows:

- Onboard systems and repositories.
- Review manifests and discovery profiles.
- Manage standards and framework configuration.
- Review platform review package.
- Configure connector sources and ownership metadata.
- Access pilot assessments and support walkthroughs.

Major pages:

- Administration Overview
- Onboarding
- Repository Discovery
- Manifest Registry
- Pilot Assessments
- Platform Review
- Framework
- Libraries
- Connector Configuration

## Object Model

| Object | Owner | Lifecycle | Navigation Relationship |
| --- | --- | --- | --- |
| AI System | Business owner and accountable executive | Intake -> Assessment -> Pilot -> Production -> Monitoring -> Retirement | Primary governed object. Listed in Portfolio and AI Systems; canonical detail at system workspace. |
| Control | Control owner | Designed -> Implemented -> Tested -> Assured -> Remediated / Retired | Managed in Governance; detail pages link to evidence, findings, exceptions, risks, regulations, and systems. |
| Evidence | Evidence owner or control owner | Required -> Collected -> Validated -> Reviewed -> Expired / Replaced | Managed in Evidence & Assurance; scoped views appear in system and auditor workflows. |
| Evidence Source | Connector/source owner | Proposed -> Connected -> Collected -> Freshness monitored -> Gap / retired | Managed in Evidence & Assurance Sources and Administration connector setup. |
| Finding | Assigned remediation owner | Open -> Triaged -> Assigned -> Remediating -> Validated -> Closed / Accepted | Shared action model surfaced in Executive, Portfolio, AI Systems, Governance, Evidence & Assurance, and Auditor Workspace. |
| Exception | Risk owner and approving authority | Requested -> Reviewed -> Approved -> Monitored -> Expired / Closed | Shared action model surfaced through Governance, Auditor Workspace, Executive material decisions, and system workspaces. |
| Risk | Risk owner | Identified -> Assessed -> Treated -> Accepted / Monitored -> Closed | Governance Risk and Portfolio lenses; links to controls, findings, exceptions, and systems. |
| Asset | System owner or asset owner | Discovered / Declared -> Validated -> Tracked -> Retired | AI System and Evidence & Assurance Asset Discovery; assets produce evidence sources. |
| Connector | Platform owner and source owner | Configured -> Connected -> Collected -> Validated -> Warning / Error / Retired | Evidence & Assurance Operations and Administration connector setup. |
| Approval | Accountable decision owner | Requested -> Reviewed -> Approved / Rejected -> Audited | Governance Committee and system lifecycle workflows; evidence for human accountability. |
| Review | Reviewer or assurance owner | Scheduled -> Performed -> Recorded -> Follow-up -> Closed | Auditor, Governance, Control, Evidence, and Committee workflows. |

## Findings Action Model

Findings are no longer a top-level workspace. They are a cross-platform action model surfaced wherever users need to act.

| Category | Owner | Lifecycle | Primary Workspace |
| --- | --- | --- | --- |
| Control Finding | Control owner | Open -> Triaged -> Assigned -> Remediating -> Validated -> Closed | Governance -> Control Owner Queue |
| Evidence Gap | Evidence owner or control owner | Open -> Source identified -> Evidence collected -> Validated -> Closed | Evidence & Assurance -> Review / Health |
| Source Issue | Connector owner or source owner | Open -> Diagnosed -> Collection restored / Gap accepted -> Validated -> Closed | Evidence & Assurance -> Sources / Operations |
| Discovery Finding | System owner or governance reviewer | Open -> Reviewed -> Declared / Accepted / Rejected -> Inventory updated -> Closed | AI Systems and Evidence & Assurance -> Asset Discovery |
| Exception | Risk owner and approving authority | Requested -> Reviewed -> Approved / Rejected -> Monitored -> Expired / Closed | Governance -> Committee Decisions and Auditor Workspace |
| Risk Acceptance | Risk owner and accountable executive | Requested -> Reviewed -> Approved / Rejected -> Monitored -> Renewed / Closed | Executive Decisions Required and Governance -> Risk |
| Review Task | Assigned reviewer | Open -> In Review -> Follow-up required / Complete -> Closed | Owning workspace: Governance, Evidence & Assurance, Auditor Workspace, or AI Systems |

Findings must always show:

- Why the item exists.
- Evidence or source used.
- Control, risk, system, or asset impact.
- Owner.
- Recommended action.
- Due date or review cadence when applicable.
- Current lifecycle state.

## Action Required Pattern

Action Required is a reusable platform pattern, not a single page or system tab.

Used by:

- Executive
- Portfolio
- AI Systems
- Governance
- Evidence & Assurance
- Auditor Workspace

Inputs:

- Open findings.
- Evidence gaps.
- Failed validations.
- Overdue reviews.
- Connector warnings.
- Discovery findings.
- Exceptions pending review.
- Risk acceptances pending decision.
- Control failures.
- Audit package blockers.

Prioritization:

1. Material executive decision required.
2. Control failure affecting high-risk or production AI systems.
3. Evidence missing, invalid, stale, or unverifiable for mapped controls.
4. Connector/source issue blocking assurance.
5. Open discovery finding changing system boundary or asset inventory.
6. Overdue review or approval.
7. Accepted-risk item approaching expiry.

Ownership:

- Every Action Required item must resolve to one accountable owner.
- Executive sees only material decisions and summarized risk.
- Portfolio sees cross-system action concentration.
- AI Systems sees system-scoped action.
- Governance sees control, risk, lifecycle, and committee action.
- Evidence & Assurance sees proof, source, artifact, and assurance action.
- Auditor Workspace sees audit-scope blockers and proof gaps.

## Evidence & Assurance Model

Evidence & Assurance is the canonical proof layer. It should answer:

- What proof exists?
- What source produced it?
- Is it valid, current, attributable, and inspectable?
- What controls depend on it?
- What does it prove?
- What fails if it disappears?
- What warnings or failures require action?

### Final Structure

| Section | Job |
| --- | --- |
| Overview | Proof posture, issue counts, critical evidence gaps, assurance warnings, source health. |
| Review | Repository, Health, Assurance, Traceability, and Packages. This is the default proof review workflow. |
| Sources | Sources, Asset Discovery, and Operations. This is the source and collection workflow. |
| Artifacts | Artifacts, Snapshots, and Drift. This is the verifiable artifact workflow. |
| Evidence Domains | Runtime, Deployments, Data Governance, MCP Governance, Governance Evidence, and Secrets Governance. These are domain-specific proof views. |

### Consolidation Rules

- Legacy `/evidence`, `/evidence-repository`, `/evidence-health`, `/audit-packages`, `/traceability`, and `/governance-operations` should no longer be standalone top-level experiences.
- System evidence tabs should remain, but they must be scoped views of canonical Evidence & Assurance records.
- Connector-specific artifact pages should remain as drill-down object details.
- Governance Operations should become Evidence & Assurance Operations or be distributed across Sources, Artifacts, Assurance, Drift, and Asset Discovery.
- Auditor Workspace should remain top-level while using Evidence & Assurance records rather than duplicating proof logic.

## Route Rationalization

Classification definitions:

- Keep: canonical route remains and may receive secondary navigation or content refinements.
- Merge: content should move into a canonical hub/workflow; route may redirect after migration.
- Move: route remains conceptually valid but should live under another hub path or secondary navigation.
- Deprecate: route should redirect or be removed after compatibility period.

| Route | Decision | Final Home | Rationale |
| --- | --- | --- | --- |
| `/` | Move | `/ai-systems` or `/portfolio/ai-systems` | Root currently acts as AI Systems. Make this explicit or redirect root to the chosen command center default. |
| `/administration` | Keep | Administration | Canonical setup and platform governance workspace. |
| `/agentic-governance` | Move | Governance -> Agentic Governance | Valid discipline page, but not top-level. |
| `/ai-governance` | Move | Governance -> AI Governance | Valid discipline page, but not top-level. |
| `/ai-lifecycle` | Move | Governance -> Lifecycle | Valid governance discipline. |
| `/ai-risk` | Move | Governance -> Risk and Portfolio risk views | Valid risk dashboard, but should be contextual. |
| `/audit-packages` | Merge | Evidence & Assurance -> Packages | Audit packages belong in proof/audit workflow. |
| `/auditor` | Deprecate | Auditor Workspace | Duplicate of auditor workspace. Redirect after migration. |
| `/auditor-workspace` | Keep | Auditor Workspace | Canonical audit execution workspace and top-level navigation item. |
| `/control-health` | Move | Portfolio -> Control Health and Governance -> Monitoring | Useful cross-system dashboard, not standalone global nav. |
| `/controls` | Keep | Governance -> Controls | Canonical control register. |
| `/controls/[controlId]` | Keep | Object detail | Strong canonical control detail page. |
| `/deployment-evidence/[id]` | Keep | Evidence artifact detail | Connector-specific drill-down proof page. |
| `/evidence` | Merge | Evidence & Assurance -> Repository | Legacy evidence workbench should redirect to canonical proof hub or repository. |
| `/evidence-artifacts/[id]` | Keep | Evidence artifact detail | Canonical verifiable artifact detail. |
| `/evidence-artifacts/[id]/drift` | Keep | Evidence artifact drill-down | Deep verification page for drift. |
| `/evidence-assurance` | Keep | Evidence & Assurance | Canonical proof hub. |
| `/evidence-assurance/artifacts` | Keep | Evidence & Assurance -> Artifacts | Canonical artifact workbench. |
| `/evidence-assurance/asset-discovery` | Keep | Evidence & Assurance -> Asset Discovery | Discovery is evidence-backed inventory assurance. |
| `/evidence-assurance/assurance` | Keep | Evidence & Assurance -> Assurance | Canonical explainable assurance view. |
| `/evidence-assurance/data-governance` | Keep | Evidence & Assurance -> Data Governance | Supabase evidence domain belongs here. |
| `/evidence-assurance/deployments` | Keep | Evidence & Assurance -> Deployments | Deployment proof and Portainer export pattern belong here. |
| `/evidence-assurance/drift` | Keep | Evidence & Assurance -> Drift | Canonical drift workbench. |
| `/evidence-assurance/governance-evidence` | Keep | Evidence & Assurance -> Governance Evidence | Human-governance proof and Notion gaps belong here. |
| `/evidence-assurance/health` | Keep | Evidence & Assurance -> Health | Canonical evidence health view. |
| `/evidence-assurance/mcp-governance` | Keep | Evidence & Assurance -> MCP Governance | Actual agent capability proof belongs here. |
| `/evidence-assurance/packages` | Keep | Evidence & Assurance -> Packages | Canonical package workflow. |
| `/evidence-assurance/repository` | Keep | Evidence & Assurance -> Repository | Canonical evidence repository. |
| `/evidence-assurance/runtime` | Keep | Evidence & Assurance -> Runtime | Runtime proof belongs here. |
| `/evidence-assurance/secrets-governance` | Keep | Evidence & Assurance -> Secrets Governance | Metadata-only secrets proof belongs here. |
| `/evidence-assurance/snapshots` | Keep | Evidence & Assurance -> Snapshots | Canonical historical proof view. |
| `/evidence-assurance/sources` | Keep | Evidence & Assurance -> Sources | Canonical evidence source registry. |
| `/evidence-assurance/traceability` | Keep | Evidence & Assurance -> Traceability | Canonical proof traceability. |
| `/evidence-health` | Merge | Evidence & Assurance -> Health | Legacy direct route duplicates canonical health route. |
| `/evidence-repository` | Merge | Evidence & Assurance -> Repository | Legacy direct route duplicates canonical repository route. |
| `/evidence/[evidenceId]` | Keep | Evidence object detail | Existing evidence object detail remains useful. |
| `/evidence/[evidenceId]/download` | Keep | Evidence object route handler | Download/export support remains a drill-down utility. |
| `/exceptions` | Move | Shared Action Model -> Exceptions | Exceptions are surfaced through Governance, Auditor Workspace, Executive material decisions, and system workspaces. |
| `/executive` | Keep | Executive | Canonical leadership workspace. |
| `/findings` | Move | Shared Action Model | Findings remain an object/action register, but not a top-level workspace. Surface through Action Required, Governance, Portfolio, AI Systems, Evidence & Assurance, and Auditor Workspace. |
| `/governance` | Keep | Governance | Canonical governance discipline hub. |
| `/governance-committee` | Move | Governance -> Committee Decisions | Committee is a governance decision workflow. |
| `/governance-engineering` | Move | Governance -> Governance Engineering | Valid discipline page, but not global top-level. |
| `/governance-framework` | Move | Administration -> Framework or Governance -> Framework | Framework is standards/configuration support. |
| `/governance-manifest` | Move | Administration -> Standards / Manifest | Manifest is onboarding standard and evidence declaration. |
| `/governance-manifest/registry` | Move | Administration -> Manifest Registry | Manifest registry belongs in Administration. |
| `/governance-operations` | Merge | Evidence & Assurance -> Sources / Assurance / Operations | Operational proof mechanics belong in Evidence & Assurance. |
| `/mcp-evidence/[id]` | Keep | Evidence artifact detail | Connector-specific drill-down proof page. |
| `/monitoring` | Move | Governance -> Monitoring | Control monitoring is governance discipline workflow. |
| `/notion-evidence/[id]` | Keep | Evidence artifact detail | Human-governance evidence/gap detail page. |
| `/onboarding` | Move | Administration -> Onboarding | Onboarding belongs under Administration. |
| `/onboarding/repositories` | Move | Administration -> Repository Discovery | Repository discovery is onboarding workflow. |
| `/onboarding/repositories/[id]` | Keep | Administration object detail | Repository onboarding detail remains useful. |
| `/onboarding/travel-brain-pilot` | Move | Administration -> Pilot Assessments | Pilot material should not be global or persona nav. |
| `/platform-review` | Move | Administration -> Platform Review | Platform review is meta-governance. |
| `/platform-review/export` | Move | Administration -> Platform Review Export | Export belongs under Platform Review. |
| `/platform-review/package` | Move | Administration -> Platform Review Package | Package view belongs under Platform Review. |
| `/portfolio` | Keep | Portfolio | Canonical cross-system workspace. |
| `/projects/travel-brain` | Deprecate | `/systems/travel-brain` | Legacy project route duplicates canonical AI System workspace. |
| `/regulatory` | Move | Governance -> Compliance | Regulatory workbench is compliance discipline. |
| `/regulatory-coverage` | Move | Portfolio -> Regulatory Coverage and Governance -> Compliance | Coverage is a portfolio/compliance lens. |
| `/regulatory-mapping` | Deprecate | Governance -> Compliance | Deprecated legacy route. |
| `/regulatory/[slug]` | Keep | Object detail | Regulation detail remains canonical object detail. |
| `/reports/executive` | Move | Executive -> Board Report | Executive reporting belongs under Executive. |
| `/risk-heatmap` | Move | Portfolio -> Risk Heatmap | Risk heatmap is portfolio analysis. |
| `/runtime-evidence/[id]` | Keep | Evidence artifact detail | Connector-specific drill-down proof page. |
| `/secret-evidence/[id]` | Keep | Evidence artifact detail | Metadata-only secret evidence detail page. |
| `/supabase-evidence/[id]` | Keep | Evidence artifact detail | Data-governance evidence detail page. |
| `/systems/[slug]` | Keep | AI System Workspace | Canonical governed object workspace. |
| `/systems/[slug]/agentic-governance` | Keep | AI System Workspace tab | System-scoped agentic governance view. |
| `/systems/[slug]/ai-governance` | Keep | AI System Workspace tab | System-scoped AI governance view. |
| `/systems/[slug]/audit-trail` | Keep | AI System Workspace tab | System-scoped audit trail. |
| `/systems/[slug]/controls` | Keep | AI System Workspace tab | System-scoped controls. |
| `/systems/[slug]/evidence` | Keep | AI System Workspace tab | Scoped view of canonical evidence records. |
| `/systems/[slug]/governance-engineering` | Keep | AI System Workspace tab | System-scoped implementation evidence. |
| `/systems/[slug]/lifecycle` | Keep | AI System Workspace tab | System lifecycle governance. |
| `/systems/[slug]/monitoring` | Keep | AI System Workspace tab | System-scoped monitoring. |
| `/systems/[slug]/regulations` | Keep | AI System Workspace tab | System regulatory scope. |
| `/systems/[slug]/risk` | Keep | AI System Workspace tab | System risk view. |
| `/traceability` | Merge | Evidence & Assurance -> Traceability | Traceability should live in canonical proof layer. |
| `/walkthroughs` | Move | Administration -> Support / Walkthroughs | Support/demo content should not be operational top-level. |

## Migration Plan

### UX Refactor 2B - App Shell Refactor

Goal: implement the navigation shell and route ownership decisions without redesigning every page.

Recommended order:

1. Freeze this IA package as the route ownership contract.
2. Update global navigation to the seven final top-level items.
3. Add secondary navigation models for Executive, Portfolio, AI Systems, Governance, Evidence & Assurance, Auditor Workspace, and Administration.
4. Remove specialist pages from global navigation.
5. Preserve all existing route URLs during the first shell pass.
6. Add in-page breadcrumbs that show final IA ownership.
7. Add redirect decisions only after the secondary nav proves stable.

Success criteria:

- Global navigation has exactly the seven approved top-level areas: Executive, Portfolio, AI Systems, Governance, Evidence & Assurance, Auditor Workspace, Administration.
- Every visible route has a clear parent hub.
- Evidence & Assurance remains the canonical proof layer.
- No implementation-phase page appears as a peer of Executive or Portfolio.

### UX Refactor 2C - Workspace Migration

Goal: consolidate duplicate workflows and migrate pages into canonical workspaces.

Recommended order:

1. Preserve Auditor Workspace as the canonical top-level audit journey with clear scope-to-package flow.
2. Merge legacy evidence routes into Evidence & Assurance equivalents.
3. Move Governance Operations into Evidence & Assurance operations/source/assurance workflows.
4. Move committee decisions into Governance.
5. Move onboarding, manifest, pilot, framework, platform review, and walkthroughs into grouped Administration sections.
6. Implement Findings as a shared action model for findings, exceptions, evidence gaps, source issues, discovery findings, risk acceptances, and review tasks.
7. Refine AI System Workspace tab grouping and add Action Required.
8. Add Governance -> Control Owner Queue.
9. Add redirects for deprecated routes after route analytics and internal links are updated.

Success criteria:

- Auditors have one official workflow.
- Executives are not exposed to connector mechanics unless summarized as assurance risk.
- Control owners can start from findings, controls, or system workspace and reach the same proof.
- System owners can see action required without scanning every tab.
- Legacy routes redirect to canonical locations.

## Implementation Guardrails

- Do not create a marketing site, landing page, or hero-led experience.
- Preserve app shell, navigation, tables, queues, workflows, evidence, and audit trails.
- Prefer dense, operational layouts for governance users.
- Do not use card walls as a substitute for workflow structure.
- Do not remove traceability while consolidating routes.
- Do not hide warnings; move them to the correct work queue.
- Keep evidence source gaps explicit when real collection is unavailable.
- Keep metadata, evidence, assurance, and governance distinct.

## Open Questions

| Question | Recommendation |
| --- | --- |
| Should Auditor Workspace remain top-level? | Yes. Auditor Workspace is a primary audience workflow and remains top-level while reusing Evidence & Assurance proof records. |
| Should AI Systems be top-level or inside Portfolio? | AI Systems remains top-level as object inventory and direct access. Portfolio remains cross-system management and comparison. |
| Should Findings include Exceptions? | Findings is a shared action model, not a top-level workspace. Exceptions are one action category surfaced through Governance, Auditor Workspace, Executive material decisions, and system workspaces. |
| Should Governance Operations remain a named page? | It can remain as Evidence & Assurance Operations, but should not be standalone global navigation. |
| Should connector pages be visible to executives? | Only as summarized assurance risk. Detailed source, connector, drift, and artifact mechanics belong in Evidence & Assurance. |
| Should Platform Review be user-facing? | Keep it under Administration as platform governance and release review, not as a daily business workflow. |
| Should route paths change in 2B? | Prefer navigation ownership first, redirects second. Avoid breaking links before canonical destinations are stable. |

## Final Architecture Decision

UX Refactor 2 should implement a bank-grade governance application shell:

```text
Executive
Portfolio
AI Systems
Governance
Evidence & Assurance
Auditor Workspace
Administration
```

The design center is not a dashboard collection. It is an operational governance system where executives see conclusions, auditors see proof, governance teams see work queues, control owners see required action, and system owners see posture for the AI systems they own.
