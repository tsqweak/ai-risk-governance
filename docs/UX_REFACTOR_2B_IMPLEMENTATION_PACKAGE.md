# UX Refactor 2B Implementation Package

## Scope

UX Refactor 2B implemented the approved app shell and information architecture from `docs/UX_REFACTOR_2A_FINAL.md`.

This phase changed navigation ownership and workflow orientation only. It did not delete routes, introduce redirects, or remove existing functionality.

## Global Navigation Changes

Global navigation is now limited to the approved seven workspaces:

1. Executive
2. Portfolio
3. AI Systems
4. Governance
5. Evidence & Assurance
6. Auditor Workspace
7. Administration

Removed from global navigation:

- Framework
- Committee
- Travel Brain Pilot
- Direct system shortcuts
- Compliance
- Risk Management
- Control Monitoring
- AI Manifest
- Engineering
- Walkthroughs

These routes remain available through secondary navigation under their owning workspaces.

## Shell Changes

- Updated the app sidebar to present the platform as a governance operating system rather than a mixed route directory.
- Added reusable breadcrumb support for primary workspace pages.
- Added reusable secondary navigation for workspace-specific route ownership.
- Added reusable grouped secondary navigation for Evidence & Assurance and Administration.
- Added a reusable Action Required list for cross-platform findings, evidence gaps, source issues, discovery findings, review tasks, exceptions, risk acceptances, and failed validations.

## Secondary Navigation Ownership

Executive owns executive posture, portfolio health, compliance posture, governance health, material risks, decisions required, and board reporting.

Portfolio owns cross-system management, AI systems, risk heatmap, regulatory coverage, control health, evidence health, action required, and future trends.

AI Systems owns inventory, discovery gaps, onboarding status, direct system workspaces, owners, and lifecycle coverage.

Governance owns overview, controls, Control Owner Queue, compliance, monitoring, lifecycle, risk, AI governance, agentic governance, governance engineering, and committee decisions.

Evidence & Assurance owns grouped proof workflows:

- Overview
- Review: Repository, Health, Assurance, Traceability, Packages
- Sources: Sources, Asset Discovery, Operations
- Artifacts: Artifacts, Snapshots, Drift
- Evidence Domains: Runtime, Deployments, Data Governance, MCP Governance, Governance Evidence, Secrets Governance

Auditor Workspace owns the canonical audit workflow:

Scope -> Prove a Control -> Traceability -> Evidence Review -> Artifact Verification -> Audit Package

Administration owns:

- Onboarding
- Standards
- Platform Operations
- Libraries
- Support

## Action Required Implementation

Action Required is implemented as a reusable platform pattern, not a standalone page.

It is surfaced in:

- Executive
- Portfolio
- AI Systems
- Governance
- Evidence & Assurance
- Auditor Workspace

Current sources use existing platform data only:

- Open and critical findings
- Evidence health gaps
- Failed control validations
- Source issues
- Discovery findings
- Evidence review tasks
- Active exceptions
- Overdue system reviews

## Control Owner Queue

Governance now includes `Governance / Control Owner Queue`.

The queue uses existing data only and combines:

- Failed control test runs
- Evidence health issues
- Open findings
- Overdue reviews
- Remediation tasks already represented by the platform data model

No fake queue data was added.

## Auditor Workflow Implementation

Auditor Workspace now makes the approved workflow visible:

1. Scope
2. Prove a Control
3. Traceability
4. Evidence Review
5. Artifact Verification
6. Audit Package

The page also surfaces an auditor-specific Action Required queue using evidence gaps, failed validations, and evidence review tasks.

## Evidence & Assurance Grouping

Evidence & Assurance navigation was consolidated from a long flat link strip into the approved grouped navigation model.

All existing evidence routes remain accessible. No evidence functionality was removed.

## Administration Grouping

Administration was split into:

- Onboarding
- Standards
- Platform Operations
- Libraries
- Support

Onboarding, manifests, repository discovery, platform review, review exports, walkthroughs, controls, and regulatory libraries now have explicit Administration ownership.

## Routes Preserved

No routes were deleted.

Findings remains routable but is no longer a global navigation item. It is now treated as a shared action model surfaced through workspace Action Required queues and owning workflows.

## Review Items For UX Refactor 2C

- Route migration can now consolidate legacy paths under workspace-owned URLs.
- Object pages should be standardized more fully around Overview, Action Required, Evidence, Traceability, and History / Audit Trail.
- Findings can be refactored from a standalone route into a shared object model with workspace-scoped filtered views.
- Administration placeholder sections for owner management and support can become first-class operational pages.
- Portfolio Trends should be expanded during Phase 10 Analytics & Trends rather than UX Refactor 2B.

## Validation Plan

Required validation:

- `npm run typecheck`
- `npm run build`
- `npm run smoke`
- `APP_URL=http://localhost:3003 npm run smoke`, if a local app can be served on port 3003
