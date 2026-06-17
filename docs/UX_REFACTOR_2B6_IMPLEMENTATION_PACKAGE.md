# UX Refactor 2B.6 Implementation Package

## Scope

UX Refactor 2B.6 improved task completion without changing the approved 2B navigation architecture, route structure, or governance capabilities.

The missing input file `docs/UX_REFACTOR_2B_WORKFLOW_REVIEW.md` was not present in the repository at implementation time. The live Enterprise Workflow Review findings from the prior assessment were used as the workflow review input.

## Workflow Improvements

- Added reusable workflow context panels that answer:
  - Where am I?
  - Why am I here?
  - What should I do next?
  - How do I get back?
- Added reusable workflow step indicators for control proof, artifact verification, evidence review, and system owner workflows.
- Added task-specific action labels to Action Required lists instead of generic labels.

## Evidence Accessibility Improvements

Improved evidence navigation so users can move through:

Control -> Evidence Requirement -> Evidence Source -> Evidence Artifact -> Assurance -> Traceability

Implemented improvements:

- Control pages now show an explicit proof path.
- Control pages now deep-link to evidence sources and supporting artifacts.
- Evidence source registry rows now have stable anchors for exact source links.
- Evidence object pages now show an evidence accessibility path.
- Evidence object pages link mapped controls directly.
- Evidence artifact pages now show verification steps from source to artifact, snapshot, assurance, traceability, and drift.

## Deep-Link Improvements

Replaced broad dashboard links with exact object or row targets where practical:

- Failed validations link to exact system monitoring run anchors.
- Findings link to exact finding anchors.
- Evidence health issues link to exact evidence health row anchors.
- Monitoring findings and test runs expose task-specific action links.
- Evidence health rows link to the mapped control and owning system evidence workspace.

## Control Owner Workflow

Improved `Governance -> Control Owner Queue`.

Each queue item now shows:

- issue
- owner
- due date
- severity
- current status
- recommended action
- task-specific action label

Queue actions now include labels such as:

- Remediate Control
- Review Evidence
- Review Finding
- Review System

## Auditor Workflow

Improved `Auditor Workspace -> Prove a Control`.

The auditor flow now shows a guided proof path:

Select Control -> Required Evidence -> Evidence Available -> Evidence Missing -> Assurance -> Traceability -> Package Ready

The page now provides concrete control proof starting points:

- AI-GOV-003 Prompt approved
- AI-GOV-006 Tool permissions approved
- AUD-001 Audit trail completeness

The Action Required queue now deep-links to exact evidence health rows, exact monitoring runs, and evidence objects.

## System Owner Workflow

Added to AI System Workspace:

- System Health Summary
- System Action Required

The system workspace now answers:

- what changed
- what requires action
- what is blocking governance
- what is blocking audit

System owner actions use exact links to monitoring findings, failed test runs, evidence health rows, and system evidence pages.

## Executive Workflow

Executive workflow now separates:

- Decision Required
- Operational Issues

Decision Required focuses on material risks and material exceptions.

Operational Issues contains items that executives may need awareness of but should usually delegate to governance or control owners.

## Findings Experience

Findings now behave more like action objects.

Each finding exposes:

- why it exists
- evidence used
- impact
- owner
- due date
- recommended action
- current severity and status
- task-specific actions

Findings have stable anchors so other workflows can link directly to the exact finding.

## Breadcrumb And Context Improvements

Added or improved persistent context on:

- Control detail pages
- Evidence object pages
- Evidence artifact pages
- Findings page
- AI System workspace shell
- System overview page

Users should now be less likely to feel dropped into disconnected detail pages.

## Files Changed

- `apps/web/app/components/ui.tsx`
- `apps/web/app/governance/page.tsx`
- `apps/web/app/auditor-workspace/page.tsx`
- `apps/web/app/executive/page.tsx`
- `apps/web/app/findings/page.tsx`
- `apps/web/app/evidence-health/page.tsx`
- `apps/web/app/evidence/[evidenceId]/page.tsx`
- `apps/web/app/evidence-artifacts/[id]/page.tsx`
- `apps/web/app/evidence-assurance/sources/page.tsx`
- `apps/web/app/controls/[controlId]/page.tsx`
- `apps/web/app/systems/[slug]/layout.tsx`
- `apps/web/app/systems/[slug]/page.tsx`
- `apps/web/app/systems/[slug]/monitoring/page.tsx`

## Validation

Required validation:

- `npm run typecheck`
- `npm run build`
- `npm run smoke`
