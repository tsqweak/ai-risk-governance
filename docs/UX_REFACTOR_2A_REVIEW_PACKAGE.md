# UX Refactor 2A.5 Expert Architecture Review Package

Purpose: independent architecture review of `docs/UX_REFACTOR_2A_PACKAGE.md` before UX Refactor 2B implementation.

Status: Architecture review only. No application code, routes, components, schemas, or UI implementation are changed by this package.

Review board:

1. Governance Platform Architect
2. Audit & Compliance UX Architect
3. Enterprise Information Architect
4. Frontend App Shell Architect

Reviewed inputs:

- `docs/PROJECT_OPERATING_MODEL.md`
- `docs/ROADMAP.md`
- `docs/BACKLOG.md`
- `docs/FEATURE_REGISTRY.md`
- `docs/PLATFORM_REVIEW_PACKAGE.md`
- `docs/UX_ARCHITECTURE_REVIEW.md`
- `docs/UX_REFACTOR_2A_PACKAGE.md`

## Executive Review Decision

Decision: B. Modify architecture first.

The 2A proposal is directionally strong and should not be discarded. It correctly identifies the need for a smaller app shell, canonical object pages, Evidence & Assurance as the proof layer, and route rationalization. However, the review board does not recommend proceeding directly to UX Refactor 2B until several architecture decisions are tightened.

The highest-risk issues are:

- Auditor Workspace is demoted too aggressively into Evidence & Assurance.
- AI Systems is elevated as a top-level peer to Portfolio without a clean boundary.
- Findings is promoted to top-level without enough separation between finding register, exceptions, evidence gaps, discovery findings, and control-owner work.
- Evidence & Assurance secondary navigation is too large and connector-shaped.
- Administration scope is broad enough to become a new catch-all.
- Control Owner workflow is still described but not structurally anchored.

The proposal should be amended before implementation, but it does not require a significant redesign.

## Overall Assessment

| Dimension | Assessment | Rationale |
| --- | --- | --- |
| Understandable | Medium-high | The seven-area model is clearer than the current sidebar, but AI Systems vs Portfolio and Findings vs Governance create potential ambiguity. |
| Scalable | Medium | The model reduces top-level sprawl, but Evidence & Assurance and Administration could become large secondary-nav dumping grounds. |
| Auditable | Medium-high | The proof model is strong, but demoting Auditor Workspace risks making the official audit journey less visible. |
| Governable | High | The object model aligns with the operating model, though ownership for reviews, approvals, and remediation needs sharper queue placement. |
| Operational | Medium-high | Governance, evidence, and findings workflows are plausible, but action queues need clearer homes for control owners and system owners. |

## Reviewer 1: Governance Platform Architect

### Summary

The proposal respects the core governed object graph:

```text
AI System -> Assets -> Evidence Sources -> Evidence Artifacts -> Assurance -> Governance
```

It correctly treats the AI System as the primary governed object and Evidence & Assurance as the canonical proof layer. It also correctly keeps assets, connectors, evidence sources, and assurance distinct.

The main concern is that the operating model says the Portfolio is the primary organizing surface, while the 2A proposal adds AI Systems as a separate top-level item. That can work, but only if the product explicitly distinguishes Portfolio as cross-system management and AI Systems as object inventory and direct object access. Without that distinction, users may wonder whether they begin in Portfolio or AI Systems.

### Strengths

- Strong alignment to the evidence maturity model: metadata, evidence source, evidence artifact, assurance, explainable assurance.
- Strong route rationalization around canonical object pages.
- Correct separation of governance disciplines from proof mechanics.
- Correct preservation of source-gap evidence instead of hiding incomplete collection.
- Good inclusion of Asset Discovery in Evidence & Assurance, because discovery findings are evidence-backed inventory challenges.

### Concerns

- Control Owner is not represented as a workspace, queue, or clear primary workflow despite being a named persona in the operating model.
- Approval and Review are included in the object model, but their workflow homes are too diffuse across Governance, Findings, Evidence & Assurance, and Administration.
- Findings as top-level may absorb too many governance objects without a stronger taxonomy.
- Administration includes connector configuration, framework, libraries, owner management, platform review, onboarding, and support; this could become the new Operational Views bucket.
- Asset lifecycle needs a clearer promotion path from discovered or untracked asset to governed asset.

### Recommended Changes

1. Define a Control Owner Queue either inside Governance or Findings before 2B implementation.
2. Define the asset review lifecycle:
   `Discovered -> Reviewed -> Declared -> Evidence Source Required -> Governed -> Retired`.
3. Clarify Approval and Review routing:
   - Approvals: Governance -> Committee Decisions and AI System lifecycle.
   - Reviews: Evidence & Assurance for evidence reviews, Governance for control reviews, Auditor Workspace for audit reviews.
4. Keep AI Systems top-level only if it is framed as the object inventory, not a second portfolio dashboard.
5. Split Administration into explicit secondary groups: Onboarding, Standards, Platform Operations, Libraries, Support.

## Reviewer 2: Audit & Compliance UX Architect

### Summary

The architecture improves proof centralization, but the proposed Auditor Workspace placement is risky. Auditors are a primary audience, and the UX Architecture Review explicitly identified the need for one official audit starting point. Hiding Auditor Workspace inside Evidence & Assurance may make information architecture cleaner on paper while making the audit workflow less discoverable.

An auditor asking "prove this control" should be able to move quickly:

```text
Auditor Workspace -> Scope -> Control -> Evidence -> Artifact -> Assurance -> Package
```

The 2A proposal supports that path conceptually, but not strongly enough in navigation.

### Strengths

- Evidence & Assurance contains the right proof primitives: repository, health, sources, artifacts, snapshots, drift, assurance, traceability, packages.
- Control detail pages remain canonical and strong.
- Evidence artifacts remain inspectable and attributable.
- Traceability is preserved as a first-class Evidence & Assurance workflow.
- Audit packages remain in the proof layer instead of a disconnected export area.

### Concerns

- Auditor Workspace is downgraded from a top-level workflow despite audit being a primary platform audience.
- Evidence & Assurance has too many connector/domain tabs before the auditor reaches "prove this control."
- Audit package workflow is listed but not described as a staged workflow with readiness, scope, included controls, included evidence, and unresolved gaps.
- Traceability needs multiple entry modes: regulation-led, control-led, evidence-led, finding-led, and system-led.
- Findings top-level may split the auditor's review path if audit findings and operational findings are not clearly distinguished.

### Friction: "Prove This Control"

Current proposed path may become:

```text
Evidence & Assurance -> Auditor Workspace -> Traceability -> Control Review -> Evidence Review -> Artifact Verification
```

This is acceptable but one step too buried for a primary audience. It also assumes the auditor knows Evidence & Assurance contains audit work.

Preferred path:

```text
Auditor Workspace -> Prove a Control -> Control Detail -> Evidence Artifacts -> Assurance Explanation -> Audit Package
```

If the final top-level set cannot include Auditor Workspace, then the app shell should include an explicit role switcher or persistent "Auditor" entry inside Evidence & Assurance, visually stronger than an ordinary secondary tab.

### Recommended Changes

1. Restore Auditor Workspace as a top-level item, or create a persistent role/workspace rail where Auditor is always visible.
2. If Auditor Workspace remains inside Evidence & Assurance, make it the first or last pinned item and label it "Auditor Workspace", not just "Auditor".
3. Add an auditor-specific "Prove a Control" entry point.
4. Define audit package states:
   `Draft -> Scope Confirmed -> Evidence Complete -> Exceptions Reviewed -> Ready for Export -> Archived`.
5. Add traceability modes:
   Regulation, Requirement, Control, Evidence, Finding, AI System.

## Reviewer 3: Enterprise Information Architect

### Summary

The proposal substantially improves the current IA by shrinking top-level navigation and classifying routes. The strongest move is route ownership: every route gets a future home. The weakest move is replacing one broad navigation problem with two secondary-navigation problems: Evidence & Assurance and Administration.

The architecture should optimize for "Where do I work?" and "What object am I looking at?" The proposal partly does this, but the top-level distinction between Portfolio and AI Systems is not yet crisp enough.

### Strengths

- Strong route rationalization table.
- Clear intent to keep specialist routes out of global navigation.
- Good consolidation of legacy evidence routes.
- Correctly moves pilot and manifest work under Administration.
- Correctly deprecates `/projects/travel-brain` and `/regulatory-mapping`.

### Concerns

- Seven top-level items are acceptable, but the proposed set is not obviously better than the UX Architecture Review's prior set with Auditor Workspace and Committee.
- AI Systems and Portfolio overlap because Portfolio already includes AI Systems.
- Findings and Governance overlap because findings are governance work and remediation work.
- Evidence & Assurance has seventeen secondary items, which is too many for a normal secondary nav.
- Administration could become the place for anything awkward.
- "Committee Decisions" is buried under Governance even though Risk Committee is a primary audience.

### Recommended Navigation Revision

The review board recommends this slightly revised top-level model:

```text
Executive
Portfolio
Governance
Evidence & Assurance
Auditor Workspace
Findings
Administration
```

In this revision:

- AI Systems becomes the first Portfolio secondary item and remains a persistent object shortcut pattern.
- Auditor Workspace remains top-level because audit is a primary platform journey.
- Committee Decisions sits under Governance and appears in Executive "Decisions Required."

Alternative if AI Systems must remain top-level:

```text
Executive
Portfolio
AI Systems
Governance
Evidence & Assurance
Auditor Workspace
Administration
```

In this alternative, Findings becomes a high-priority queue under Governance, Portfolio, and Auditor Workspace rather than a top-level item.

### Recommended Evidence & Assurance Consolidation

Group the secondary nav into sections rather than a long flat list:

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

This preserves all content while reducing perceived complexity.

## Reviewer 4: Frontend App Shell Architect

### Summary

The app shell direction is correct: persistent left navigation, hub-level secondary navigation, object pages, and drill-down verification pages. The key shell risk is secondary-navigation overload and inconsistent object context.

The shell should make three layers obvious:

```text
Global workspace -> Secondary workflow -> Object context
```

For example:

```text
Evidence & Assurance -> Traceability -> Control SEC-001
```

or:

```text
Portfolio -> AI Systems -> Travel Brain
```

### Strengths

- Preserves app-shell model rather than drifting into marketing-site patterns.
- Correctly avoids hero-based layouts.
- Defines secondary navigation for major hubs.
- Keeps object details canonical.
- Adds Action Required to AI System Workspace, which is essential.

### Concerns

- Secondary navigation needs grouping, overflow, or progressive disclosure.
- AI System Workspace still has too many tabs even after adding Action Required.
- Action Required exists in the proposal but not as a cross-shell pattern.
- Findings should be a shared queue component/pattern across Executive, Portfolio, Governance, System Workspace, and Auditor Workspace.
- The route migration plan preserves URLs first, but it should also define breadcrumb and page-title rules so users understand the future IA while routes remain unchanged.

### Recommended App Shell Rules

1. Global nav shows only primary workspaces.
2. Secondary nav shows hub workflows and may be grouped.
3. Object header shows object type, owner, status, risk, evidence health, and actions.
4. Action Required appears consistently across Executive, Portfolio, Governance, AI System Workspace, Evidence & Assurance, and Auditor Workspace.
5. Breadcrumbs show IA ownership even before URL restructuring.
6. Every page has one job: overview, queue, workbench, object detail, verification, or administration.

### Recommended Object Page Pattern

Canonical object pages should use a common structure:

```text
Object header
  Identity
  Owner
  Status
  Risk / assurance posture
  Last updated

Action Required
  Findings
  Evidence gaps
  Failed checks
  Review tasks

Evidence and Traceability
  Linked controls
  Linked evidence
  Linked findings
  Linked risks

Audit Trail
  Changes
  Reviews
  Approvals
```

## Special Focus Area Review

### 1. Executive Workflow

Strengths:

- Correctly centers compliance posture, governance health, material risk, decisions required, and board report.
- Correctly hides connector mechanics from executive users.

Weaknesses:

- Decisions Required may be split across Executive, Governance Committee, Findings, and Exceptions.
- Executive workflow needs a single materiality filter to prevent operational warnings from overwhelming leadership.

Recommended changes:

- Define "Executive Materiality" as a filtering rule for findings, exceptions, evidence gaps, and decisions.
- Make Board Report a clear Executive secondary item.
- Surface Committee Decisions in Executive only when material or approval-required.

### 2. Auditor Workflow

Strengths:

- Evidence & Assurance has the right proof objects.
- Traceability and artifact verification are preserved.

Weaknesses:

- Auditor Workspace placement is too hidden for a primary user group.
- "Prove this control" is not explicit enough.

Recommended changes:

- Keep Auditor Workspace top-level or make it a pinned role workspace in the shell.
- Add "Prove a Control" as an audit task.
- Define audit package lifecycle and readiness checks.

### 3. Governance Workflow

Strengths:

- Governance disciplines are appropriately grouped: controls, compliance, monitoring, lifecycle, risk, AI governance, agentic governance, engineering.
- Committee Decisions fit naturally as governance decisions.

Weaknesses:

- Control Owner workflow remains underdefined.
- Governance may compete with Findings for remediation ownership.

Recommended changes:

- Add Control Owner Queue under Governance.
- Define which finding types are owned by Governance vs Evidence & Assurance vs System Owner.
- Keep Committee Decisions under Governance but summarize them in Executive.

### 4. Control Owner Workflow

Strengths:

- Control detail pages are strong and should remain canonical.
- Findings and evidence links can support control-owner action.

Weaknesses:

- There is no explicit "My Controls" or control-owner queue.
- Control owners may not know whether to start in Governance, Findings, Monitoring, or Evidence & Assurance.

Recommended changes:

- Add Governance -> Control Owner Queue.
- Add Control Detail -> Action Required as the primary panel.
- Include evidence freshness, failed validation, findings, exceptions, and remediation owner in the same control-owner view.

### 5. System Owner Workflow

Strengths:

- AI System Workspace is correctly retained as canonical.
- Action Required is added to the system workspace.

Weaknesses:

- AI Systems vs Portfolio separation could confuse system owners.
- The system workspace still risks tab overload.

Recommended changes:

- Make Portfolio -> AI Systems the normal discovery path, with optional AI Systems shortcut if retained.
- Group system tabs into Posture, Governance, Evidence, Operations, Audit.
- Make Action Required the first workspace panel after Overview.

### 6. Evidence & Assurance Workflow

Strengths:

- Correct canonical proof layer.
- Correct inclusion of sources, artifacts, snapshots, drift, assurance, traceability, and packages.
- Correct inclusion of connector evidence domains.

Weaknesses:

- Secondary nav is too large and connector-shaped.
- Auditor and governance operations workflows may get buried among evidence domains.

Recommended changes:

- Group Evidence & Assurance nav into Review, Sources, Artifacts, and Evidence Domains.
- Add Evidence Review Queue as a first-class view.
- Add Operations as a named subarea or distribute it cleanly, but avoid a vague hidden migration.

### 7. Findings Workflow

Strengths:

- Findings as an action register is a strong operating concept.
- Exceptions, warnings, evidence gaps, control failures, discovery findings, and remediation belong in a shared action model.

Weaknesses:

- Top-level Findings may duplicate Governance work queues and Auditor finding review.
- Not all warnings are findings; connector source issues, discovery review items, evidence health warnings, and control failures need clear taxonomy.

Recommended changes:

- Define finding categories:
  - Control Finding
  - Evidence Gap
  - Source Issue
  - Discovery Finding
  - Exception
  - Risk Acceptance
  - Review Task
- Define finding ownership and lifecycle before implementation.
- If top-level Findings remains, make it an action register, not another dashboard.

## Challenged Assumptions

### Top-Level Navigation Choices

Challenge: The proposed top-level nav improves simplicity but may remove two role-critical destinations: Auditor Workspace and Committee.

Review conclusion: Auditor Workspace should remain highly visible. Committee can move under Governance if Executive has a Decisions Required view.

### Evidence & Assurance Structure

Challenge: The structure is correct but too flat.

Review conclusion: Keep all evidence domains, but group secondary navigation to prevent a long list of proof mechanics.

### Findings Placement

Challenge: Findings as top-level is plausible but not yet proven.

Review conclusion: Keep Findings top-level only if it becomes the enterprise action register with a clear taxonomy and ownership model. Otherwise place it under Governance and Portfolio while preserving cross-links.

### Administration Scope

Challenge: Administration is at risk of becoming the new catch-all.

Review conclusion: Define subgroups and keep daily governance work out of Administration.

### AI Systems vs Portfolio Separation

Challenge: The operating model says Portfolio is the primary organizing surface.

Review conclusion: Prefer AI Systems as Portfolio's first secondary item unless direct object access is proven important enough to justify top-level placement.

### Auditor Workspace Placement

Challenge: Demoting Auditor Workspace contradicts the primary audience model and prior UX review.

Review conclusion: Keep Auditor Workspace top-level or pin it visibly as a role workspace. Do not bury it as an ordinary Evidence & Assurance tab.

## Major Architecture Strengths

- The proposal is grounded in the correct object graph.
- Evidence & Assurance remains the proof layer.
- Route rationalization is thorough and implementable.
- Legacy evidence routes have clear migration destinations.
- Governance Operations is correctly removed from standalone top-level navigation.
- Pilot, manifest, walkthrough, and platform review content are moved away from daily operating workflows.
- AI System Workspace remains canonical.
- Action Required is introduced where it matters most.

## Major Architecture Risks

| Risk | Severity | Why It Matters | Recommended Mitigation |
| --- | --- | --- | --- |
| Auditor workflow hidden | High | Internal Audit and regulators are primary audiences; audit entry must be obvious. | Keep Auditor Workspace top-level or pin it as a role workspace. |
| AI Systems / Portfolio ambiguity | High | Users may not know where cross-system work starts. | Make AI Systems a Portfolio subarea or define strict object-inventory role. |
| Evidence & Assurance secondary-nav overload | Medium-high | The hub may feel as complex as the old sidebar. | Group secondary nav into Review, Sources, Artifacts, Evidence Domains. |
| Findings taxonomy unclear | Medium-high | Warnings, findings, exceptions, gaps, and review tasks can blur. | Define categories, ownership, lifecycle, and materiality. |
| Administration catch-all | Medium | Moving miscellaneous items into Administration may recreate sprawl. | Create Administration subgroups and exclude daily workflows. |
| Control Owner path weak | Medium-high | Control owners may still lack a clear work queue. | Add Control Owner Queue and action-required pattern. |
| Committee visibility reduced | Medium | Risk Committee decisions are material governance events. | Keep Committee under Governance but surface decisions in Executive. |

## Required Architecture Changes Before 2B

1. Decide whether Auditor Workspace is top-level. The review board recommends yes.
2. Decide whether AI Systems is top-level. The review board recommends placing it under Portfolio unless there is a strong object-access reason.
3. Define Findings taxonomy, ownership, and lifecycle.
4. Add Control Owner Queue to Governance.
5. Group Evidence & Assurance secondary navigation.
6. Split Administration into explicit subgroups.
7. Define breadcrumb and page-title rules for routes that keep old URLs during 2B.
8. Define Action Required as a reusable app-shell pattern, not just a system tab.

## Recommended Revised Architecture

Preferred top-level navigation:

```text
Executive
Portfolio
Governance
Evidence & Assurance
Auditor Workspace
Findings
Administration
```

Recommended secondary ownership:

| Area | Owns |
| --- | --- |
| Executive | Leadership posture, board report, material gaps, decisions required. |
| Portfolio | AI Systems, portfolio health, risk heatmap, regulatory coverage, control health, evidence health, trends. |
| Governance | Controls, compliance, monitoring, lifecycle, risk, AI governance, agentic governance, governance engineering, committee decisions, control owner queue. |
| Evidence & Assurance | Repository, health, sources, artifacts, snapshots, drift, assurance, traceability, evidence domains, packages. |
| Auditor Workspace | Scope, prove a control, traceability, evidence review, artifact verification, findings/exceptions review, audit package. |
| Findings | Enterprise action register for findings, exceptions, evidence gaps, source issues, discovery findings, remediation, accepted risk. |
| Administration | Onboarding, manifests, repository discovery, platform review, standards, framework, libraries, connector configuration, support. |

Acceptable alternate top-level navigation if AI Systems must remain visible:

```text
Executive
Portfolio
AI Systems
Governance
Evidence & Assurance
Auditor Workspace
Administration
```

In the alternate model, Findings should be a major queue inside Governance, Portfolio, and Auditor Workspace rather than top-level.

## Final Recommendation

Decision: B. Modify architecture first.

Support:

- The 2A architecture is close enough that a significant redesign is unnecessary.
- Proceeding directly to 2B would bake in avoidable ambiguity around Auditor Workspace, AI Systems vs Portfolio, Findings ownership, and secondary-nav overload.
- A short architecture amendment should be completed before app-shell implementation.

Recommended next step:

Create a 2A amendment or update `docs/UX_REFACTOR_2A_PACKAGE.md` with the required decisions above, then proceed to UX Refactor 2B App Shell Refactor.

