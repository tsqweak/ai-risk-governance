# UX Refactor 2A Final Architecture

Purpose: final amended Information Architecture package for UX Refactor 2B implementation planning.

Status: Architecture only. This document does not implement UI, change routes, modify components, or alter schemas.

## Final Recommendation

UX Refactor 2B is ready: YES.

Rationale: the approved amendments resolve the expert review blockers. Auditor Workspace remains visible as a top-level workflow, AI Systems remains top-level with a clear object-inventory role, Findings is converted from a workspace into a shared action model, Control Owner Queue is added, Evidence & Assurance navigation is grouped, Administration is split into bounded sections, and Action Required is defined as a reusable platform pattern.

## Final Top-Level Navigation

```text
Executive
Portfolio
AI Systems
Governance
Evidence & Assurance
Auditor Workspace
Administration
```

| Top-Level Item | Purpose | Primary Users | Boundary |
| --- | --- | --- | --- |
| Executive | Leadership posture, material risk, decisions required, board reporting. | CIO, CRO, Risk Committee, executive stakeholders. | Summarizes governance, risk, compliance, and assurance. Does not expose raw connector mechanics. |
| Portfolio | Cross-system management and comparison. | AI governance team, risk, compliance, portfolio owners. | Compares systems across lifecycle, risk, controls, evidence health, regulatory coverage, findings, and trends. |
| AI Systems | Object inventory and direct access to AI System Workspaces. | System owners, governance reviewers, auditors, control owners. | Lists governed systems and opens canonical system workspaces. Does not duplicate portfolio analytics. |
| Governance | Governance disciplines, controls, compliance, risk, lifecycle, committee decisions, and control owner work. | Governance team, control owners, compliance, risk, model risk. | Owns governance workflows and action queues, not proof mechanics. |
| Evidence & Assurance | Canonical proof layer. | Evidence owners, auditors, governance operators, source owners. | Owns evidence sources, artifacts, snapshots, drift, assurance, traceability, packages, and evidence domains. |
| Auditor Workspace | Audit execution and regulator-support workflow. | Internal Audit, external audit, regulators, compliance assurance. | Owns audit scope, proof requests, evidence review, artifact verification, exceptions review, and audit package readiness. |
| Administration | Setup, onboarding, standards, platform operations, libraries, and support. | Platform owner, governance administrators, onboarding reviewers. | Owns configuration and standards. Does not become a daily workflow catch-all. |

## Portfolio vs AI Systems

Portfolio and AI Systems both remain top-level, but they have different jobs.

### Portfolio

Purpose: cross-system management.

Portfolio answers:

- Which systems require attention?
- Which systems are high risk?
- How does evidence health compare across systems?
- Which systems have findings, exceptions, or regulatory gaps?
- Where are trends improving or deteriorating?

Portfolio owns:

- Portfolio overview.
- AI system comparison.
- Risk heatmap.
- Regulatory coverage.
- Control health.
- Evidence health by system.
- Cross-system Action Required.
- Trends.

### AI Systems

Purpose: object inventory and direct access.

AI Systems answers:

- Which AI systems exist?
- Who owns each system?
- What lifecycle state is each system in?
- Which system workspace should I open?
- Which systems have discovery or onboarding gaps?

AI Systems owns:

- System inventory.
- Direct system workspace access.
- Discovery gaps by system.
- Onboarding status.
- Owners and lifecycle summaries.

Rule: Portfolio is the management lens. AI Systems is the governed-object inventory.

## Workspace Model

### Executive Workspace

Purpose: concise leadership posture and decision support.

Primary workflows:

- Review compliance posture.
- Review governance health.
- Review material risk.
- Review decisions required.
- Open board-ready reporting.
- Drill into portfolio or auditor proof only when needed.

Secondary navigation:

```text
Overview
Compliance Posture
Governance Health
Material Risks
Decisions Required
Board Report
Portfolio Health
```

### Portfolio Workspace

Purpose: cross-system governance management.

Primary workflows:

- Compare AI systems.
- Review cross-system risk and control health.
- Review evidence health by system.
- Review regulatory coverage.
- Review cross-system Action Required.
- Identify portfolio trends.

Secondary navigation:

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

### AI Systems Workspace

Purpose: governed AI-system inventory and direct system access.

Primary workflows:

- Find a system.
- Open an AI System Workspace.
- Review system owner, lifecycle, risk tier, and governance status.
- Review discovery and onboarding gaps.

Secondary navigation:

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

If tab overload remains during implementation, group tabs into:

```text
Posture
Governance
Evidence
Operations
Audit
```

### Governance Workspace

Purpose: governance discipline operations and decision workflows.

Primary workflows:

- Manage controls and control ownership.
- Operate Control Owner Queue.
- Review compliance, monitoring, lifecycle, risk, AI governance, and agentic governance.
- Review governance engineering implementation evidence.
- Prepare committee decisions.

Secondary navigation:

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

### Evidence & Assurance Workspace

Purpose: canonical proof layer.

Primary workflows:

- Review evidence repository and health.
- Inspect sources, asset discovery, and operations.
- Inspect artifacts, snapshots, and drift.
- Review assurance explanations and traceability.
- Review evidence domains.
- Prepare packages.

Grouped secondary navigation:

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

### Auditor Workspace

Purpose: audit execution and regulator support.

Canonical workflow:

```text
Scope
  -> Prove a Control
  -> Traceability
  -> Evidence Review
  -> Artifact Verification
  -> Audit Package
```

Secondary navigation:

```text
Scope
Prove a Control
Traceability
Evidence Review
Artifact Verification
Findings / Exceptions Review
Audit Package
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

Audit package readiness must show:

- Scope.
- Included systems.
- Included controls.
- Included evidence.
- Artifact validation status.
- Exceptions reviewed.
- Open proof gaps.
- Export readiness.

### Administration Workspace

Purpose: setup, standards, platform operations, libraries, and support.

Administration is split into bounded sections:

```text
Onboarding
Standards
Platform Operations
Libraries
Support
```

Section ownership:

| Section | Owns |
| --- | --- |
| Onboarding | System onboarding, repository discovery, manifest intake, pilot assessments. |
| Standards | Governance manifest standard, framework configuration, control standards, regulatory standard references. |
| Platform Operations | Platform review, connector configuration, source setup, owner management. |
| Libraries | Control library, regulatory library, reusable governance references. |
| Support | Walkthroughs, demos, help material, non-operational guidance. |

Rule: daily governance work should not move into Administration. If a page creates operational action, it belongs in Executive, Portfolio, AI Systems, Governance, Evidence & Assurance, or Auditor Workspace.

## Findings Action Model

Findings is no longer a top-level workspace. It is a shared action model.

Findings appear through:

- Executive Action Required.
- Portfolio Action Required.
- AI System Workspace Action Required.
- Governance Control Owner Queue.
- Evidence & Assurance Review and Sources.
- Auditor Workspace findings and exceptions review.

### Findings Taxonomy

| Category | Owner | Lifecycle | Primary Workspace |
| --- | --- | --- | --- |
| Control Finding | Control owner | Open -> Triaged -> Assigned -> Remediating -> Validated -> Closed | Governance -> Control Owner Queue |
| Evidence Gap | Evidence owner or control owner | Open -> Source identified -> Evidence collected -> Validated -> Closed | Evidence & Assurance -> Review / Health |
| Source Issue | Connector owner or source owner | Open -> Diagnosed -> Collection restored / Gap accepted -> Validated -> Closed | Evidence & Assurance -> Sources / Operations |
| Discovery Finding | System owner or governance reviewer | Open -> Reviewed -> Declared / Accepted / Rejected -> Inventory updated -> Closed | AI Systems and Evidence & Assurance -> Asset Discovery |
| Exception | Risk owner and approving authority | Requested -> Reviewed -> Approved / Rejected -> Monitored -> Expired / Closed | Governance -> Committee Decisions and Auditor Workspace |
| Risk Acceptance | Risk owner and accountable executive | Requested -> Reviewed -> Approved / Rejected -> Monitored -> Renewed / Closed | Executive Decisions Required and Governance -> Risk |
| Review Task | Assigned reviewer | Open -> In Review -> Follow-up required / Complete -> Closed | Owning workspace: Governance, Evidence & Assurance, Auditor Workspace, or AI Systems |

Every finding or action item must show:

- Why it exists.
- Evidence or source used.
- Control, risk, system, asset, or audit impact.
- Accountable owner.
- Recommended action.
- Due date or review cadence when applicable.
- Lifecycle state.

## Action Required Pattern

Action Required is a reusable platform pattern.

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
5. Discovery finding changing system boundary or asset inventory.
6. Overdue review or approval.
7. Accepted-risk item approaching expiry.

Ownership rules:

- Every Action Required item has one accountable owner.
- Executive sees only material decisions and summarized risk.
- Portfolio sees cross-system action concentration.
- AI Systems sees object-scoped action and discovery/onboarding gaps.
- Governance sees control, risk, lifecycle, and committee action.
- Evidence & Assurance sees proof, source, artifact, and assurance action.
- Auditor Workspace sees audit-scope blockers and proof gaps.

## Control Owner Queue

Location:

```text
Governance -> Control Owner Queue
```

Purpose: one place for control owners to see and act on owned-control issues.

The queue shows:

- Failed controls.
- Evidence issues.
- Findings.
- Overdue reviews.
- Remediation tasks.
- Exceptions requiring owner review.
- Failed validations.

Workflow:

```text
Open Queue
  -> Filter by owner / control / system / severity
  -> Review failed control or evidence issue
  -> Open control detail
  -> Inspect evidence and assurance
  -> Assign or update remediation
  -> Validate fix
  -> Close or escalate
```

Required queue fields:

- Control.
- Owner.
- AI system.
- Issue category.
- Severity.
- Evidence status.
- Validation status.
- Due date.
- Recommended action.
- Linked proof.

## Evidence & Assurance Structure

Evidence & Assurance remains the canonical proof layer.

It must answer:

- What proof exists?
- What source produced it?
- Is it valid, current, attributable, and inspectable?
- What controls depend on it?
- What does it prove?
- What fails if it disappears?
- What warnings or failures require action?

Grouped structure:

| Group | Sections | Purpose |
| --- | --- | --- |
| Overview | Overview | Proof posture, assurance warnings, source health, and critical evidence gaps. |
| Review | Repository, Health, Assurance, Traceability, Packages | Default proof review workflow. |
| Sources | Sources, Asset Discovery, Operations | Source coverage, connector health, asset boundary, source gaps, and collection operations. |
| Artifacts | Artifacts, Snapshots, Drift | Verifiable artifacts, point-in-time evidence, and changes requiring review. |
| Evidence Domains | Runtime, Deployments, Data Governance, MCP Governance, Governance Evidence, Secrets Governance | Domain-specific proof views. |

Consolidation rules:

- Legacy evidence routes should redirect or link into Evidence & Assurance.
- System Evidence tabs remain scoped views of canonical evidence records.
- Connector-specific evidence pages remain deep proof details.
- Governance Operations becomes Evidence & Assurance Operations.
- Auditor Workspace uses Evidence & Assurance records, but remains a top-level audit workflow.

## Object Model Updates

| Object | Owner | Lifecycle | Navigation Relationship |
| --- | --- | --- | --- |
| AI System | Business owner and accountable executive | Intake -> Assessment -> Pilot -> Production -> Monitoring -> Retirement | Top-level AI Systems inventory and canonical AI System Workspace. Also summarized in Portfolio. |
| Control | Control owner | Designed -> Implemented -> Tested -> Assured -> Remediated / Retired | Governance, Control Owner Queue, control detail, system controls, auditor proof paths. |
| Evidence | Evidence owner or control owner | Required -> Collected -> Validated -> Reviewed -> Expired / Replaced | Evidence & Assurance, system Evidence tab, Auditor Workspace. |
| Evidence Source | Connector/source owner | Proposed -> Connected -> Collected -> Freshness monitored -> Gap / Retired | Evidence & Assurance Sources and Administration connector setup. |
| Finding | Assigned remediation owner | Open -> Triaged -> Assigned -> Remediating -> Validated -> Closed / Accepted | Shared action model across workspaces. |
| Exception | Risk owner and approving authority | Requested -> Reviewed -> Approved -> Monitored -> Expired / Closed | Governance Committee Decisions, Auditor Workspace, Executive material decisions. |
| Risk | Risk owner | Identified -> Assessed -> Treated -> Accepted / Monitored -> Closed | Governance Risk, Portfolio risk views, Executive material risk. |
| Asset | System owner or asset owner | Discovered / Declared -> Reviewed -> Tracked -> Retired | AI System Workspace and Evidence & Assurance Asset Discovery. |
| Connector | Platform owner and source owner | Configured -> Connected -> Collected -> Validated -> Warning / Error / Retired | Evidence & Assurance Operations and Administration connector setup. |
| Approval | Accountable decision owner | Requested -> Reviewed -> Approved / Rejected -> Audited | Governance Committee Decisions and AI System lifecycle. |
| Review | Reviewer or assurance owner | Scheduled -> Performed -> Recorded -> Follow-up -> Closed | Governance reviews, evidence reviews, audit reviews, control owner reviews. |

## Route Ownership Guidance

UX Refactor 2B should update navigation ownership before changing URLs.

Rules:

- Preserve existing URLs during the app-shell pass where feasible.
- Add breadcrumbs showing final IA ownership.
- Move global nav links first.
- Add redirects only after internal links and workspace ownership are stable.
- Do not remove drill-down proof routes.
- Do not hide evidence gaps or warnings while consolidating pages.

Important route ownership decisions:

| Current Route | Final Ownership |
| --- | --- |
| `/auditor-workspace` | Top-level Auditor Workspace. |
| `/findings` | Shared action model; surfaced through Action Required and owning workspaces. |
| `/exceptions` | Shared action model; surfaced through Governance, Auditor Workspace, Executive material decisions, and system workspaces. |
| `/evidence`, `/evidence-repository`, `/evidence-health`, `/audit-packages`, `/traceability` | Evidence & Assurance grouped workflows. |
| `/governance-operations` | Evidence & Assurance -> Sources / Operations. |
| `/onboarding`, `/governance-manifest`, `/platform-review`, `/walkthroughs` | Administration grouped sections. |
| `/` | AI Systems inventory or redirect to the approved AI Systems route. |
| `/portfolio` | Portfolio cross-system management. |
| `/systems/[slug]` | Canonical AI System Workspace. |

## Implementation Guidance for UX Refactor 2B

2B should implement the app shell and navigation ownership only.

Recommended order:

1. Use this document as the IA source of truth.
2. Update global navigation to the approved seven top-level items.
3. Add grouped secondary navigation models.
4. Preserve current route URLs where feasible.
5. Add breadcrumbs that show final IA ownership.
6. Add Action Required as a consistent page pattern.
7. Add Governance -> Control Owner Queue as an architecture-owned destination.
8. Keep Auditor Workspace top-level.
9. Move Findings out of top-level navigation and into shared action surfaces.
10. Keep Evidence & Assurance as the proof layer.
11. Keep Administration grouped and bounded.

Do not:

- Create a marketing site or landing-page experience.
- Add hero-first layouts.
- Turn pages into card walls.
- Hide source gaps, evidence warnings, or failed validations.
- Break traceability.
- Remove canonical object detail pages.

## UX Refactor 2B Readiness

Ready: YES.

Why:

- Final navigation is approved.
- Auditor Workspace placement is resolved.
- AI Systems and Portfolio boundaries are explicit.
- Findings is defined as a shared action model.
- Findings taxonomy, owners, lifecycles, and primary workspaces are defined.
- Action Required is defined as a reusable pattern.
- Control Owner Queue is defined.
- Evidence & Assurance navigation is grouped.
- Administration is split into bounded sections.
- Implementation guidance is clear and limited to app shell and navigation ownership.

