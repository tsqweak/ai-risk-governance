# Governance Work Experience Foundation

Status: Accepted first baseline on `codex/fresh-governance-work-experience`.

Purpose: create the first product-experience foundation screen from the Product Experience Blueprint without redesigning the whole application or adding new governance capabilities.

## Source Of Truth

Primary product source:

- `docs/PRODUCT_EXPERIENCE_BLUEPRINT.md`

Operating constraints respected:

- Governance capability already exists.
- Evidence capability already exists.
- Connector capability already exists.
- The current product weakness is human usability.
- Governance Work should answer: `What needs governance attention today?`

## Implemented Experience

The Governance Work route now behaves as an AI Governance Operations workbench inspired by enterprise case-management patterns from ServiceNow GRC, Archer, AuditBoard, and Workiva without copying their generic GRC language.

Design decision:

```text
The screen should feel like:
"I am working case GW-2026-123456."

Not:
"I am looking at a governance dashboard."
```

The first screen is dominated by:

- Top enterprise application bar for the Governance Work prototype.
- Compact breadcrumb/header row.
- Horizontal filters above the work queue.
- Dense work queue table.
- Selected case record beside the queue.
- Right rail for workflow state and audit trail summary.
- Bottom proof chain and assurance layer.
- One primary recommended action with limited secondary actions.

Accepted baseline decision:

- The current enterprise case-management workbench composition is the first fresh Governance Work experience foundation.
- The selected case record is the primary work object.
- The queue, workflow rail, and proof layer support the case rather than acting as separate dashboards.
- The previous sidebar-dominant Governance Work composition should not be used as the baseline for this workspace.
- The product language should read as AI Governance Operations, not generic GRC.

Prototype boundary:

- The route visually covers the existing global app shell so the old left sidebar is not the visual baseline for this workspace.
- The global app shell still exists outside this prototype route and was not redesigned.
- The prototype uses route-local shell treatment for Governance Work only; this does not redesign the rest of the application.

## Queue Model

The work queue uses existing platform data from:

- Failed validations.
- Evidence gaps.
- Open findings.
- Evidence source issues.
- Asset discovery findings.
- Active exceptions.
- Accepted risks.
- Evidence review tasks.

Data provenance:

- Governance Work is powered by Prisma database records returned by `getExecutiveCommandCenter`, `getGovernanceOperationsDashboard`, and `getAiRiskDashboard`.
- The current records are a mixed reference portfolio: seeded/reference portfolio records, Travel Brain connector/reference evidence, and stored database records produced by prior evidence collection runs.
- The page does not perform live connector collection on render.
- The page does not yet represent automatic ingestion of Russell's full real project portfolio.
- The UI labels the current scope as `Reference portfolio` so users do not mistake the work queue for a complete live inventory of actual projects.
- Future work should connect this experience to real onboarded systems through the existing manifest, discovery, and evidence-source operating model.

Each row exposes:

- Type indicator.
- Human-readable governance work-item title.
- Impacted AI system.
- Impacted control, risk, or audit scope.
- Owner.
- Due date.
- Severity.
- Evidence confidence.
- Workflow state.
- Recommended next action.
- Committee readiness where relevant.

Queue controls support:

- Scope.
- Severity.
- Owner.
- Due date.
- AI system.

Blueprint queue scopes:

- My Work.
- Team Queue.
- Audit Blockers.
- High Severity.
- Discovery Review.
- Exceptions Expiring.
- Committee-Ready.

Responsive desktop behavior:

- At standard desktop widths, the queue prioritizes issue, AI system, due date, and severity.
- Less critical queue columns are hidden at normal desktop widths to preserve scannability.
- Filter controls are simplified below wider desktop widths to avoid crowding.
- Count and filter actions are intentionally quieter than the work queue and selected case.

## Selected Case Record

The selected record answers:

- Case ID.
- Case type.
- Impacted AI system.
- Lifecycle/risk posture.
- Affected control, risk, or audit scope.
- Audit impact.
- Evidence confidence.
- Governance blocker.
- Trigger.
- Governance impact.
- Evidence blocker.
- Who owns it.
- When it is due.
- Which workflow state it is in.
- Which action is defensible next.

The primary action deep-links to the exact existing object whenever the data already provides one.

The selected case summary intentionally avoids dense source paragraphs. It uses four operational lines:

- Trigger.
- Governance impact.
- Evidence blocker.
- Recommended next action.

## Evidence And Traceability

Evidence is visible in two layers:

1. The selected case record contains compact evidence-used sections.
2. A bottom `Proof Chain & Assurance` layer provides the audit/proof path, matching the enterprise reference layout.

The proof layer now answers the operational question: `Can we prove this case, and what is blocking us?`

The proof layer shows:

- Governance claim.
- Current proof available.
- Blocking gap.
- Evidence source or connector.
- Source limitation.
- Assurance judgment and reason.
- Audit or package consequence.
- Next proof action.

It helps the analyst answer:

- What evidence supports this issue?
- Where did the evidence come from?
- What control, risk, source, or requirement does it support?
- Is the evidence current, missing, stale, warning, or blocked?
- Can this support audit or committee review?
- What exact proof action should happen next?

Responsive proof behavior:

- At wide desktop widths, proof cards can show compact proof labels.
- At smaller desktop widths, the proof layer behaves more like a status strip so evidence labels are not awkwardly truncated.
- The proof layer remains visible but secondary to the selected case record.
- Missing proof states must be contextual. For example, the UI distinguishes evidence missing, assurance confidence missing, and package readiness blocked.

## What Changed

Changed files:

- `apps/web/app/governance/page.tsx`
- `apps/web/app/governance/GovernanceWorkClient.tsx`
- `docs/GOVERNANCE_WORK_EXPERIENCE_FOUNDATION.md`

## What Did Not Change

This work did not:

- Redesign global navigation.
- Redesign all workspaces.
- Add new routes.
- Add new governance capabilities.
- Change schemas.
- Change connector behavior.
- Remove compatibility routes.
- Create a competing roadmap.

## Remaining Weaknesses

- Secondary action buttons are experience placeholders and do not yet execute remediation or workflow transitions.
- Some existing object links still land on broader legacy pages because exact object-level routes do not exist for every source object.
- Audit trail summary entries are derived from current records rather than persisted case-history events.
- Due-date semantics are inconsistent across source objects because some source data uses operational phrases instead of normalized dates.
- The route-level prototype visually replaces the app shell, but the global shell still exists behind it in the DOM.
- Some evidence quality and package-readiness values are derived from current source mappings rather than a dedicated case-management schema.
- At `1280 x 720`, the proof strip is compact and secondary, but still consumes meaningful vertical space. Later interaction work should collapse or drawerize proof by default at smaller desktop heights.
- Real project onboarding and live portfolio ingestion remain out of scope for this design baseline. The current Governance Work queue should be treated as a database-backed reference portfolio until project ingestion and portfolio onboarding are connected through the existing manifest, discovery, and evidence-source operating model.

## Accepted Desktop QA

Validated viewport targets:

- `1512 x 860`
- `1366 x 768`
- `1280 x 720`

Accepted QA results:

- No horizontal cropping.
- Top-right app and user controls do not clip.
- Filter row visible text does not clip.
- Queue table visible text does not clip.
- Selected case header visible text does not clip.
- Action button visible text does not clip.
- Right workflow rail remains readable.
- Proof and assurance strip visible text does not clip.
- Selected case remains visually dominant across the tested desktop widths.
- Proof remains secondary rather than competing with the case record.

## Validation

Required validation:

- `npm run typecheck`
- `npm run build`
- `npm run smoke`
