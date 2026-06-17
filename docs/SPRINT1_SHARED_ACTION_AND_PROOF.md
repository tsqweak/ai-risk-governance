# Sprint 1 Shared Action And Proof Experience

Status: Implemented.

Scope: Shared Action And Proof Experience only. This sprint did not redesign navigation, redesign workspaces, change routes, or create new governance capabilities.

## Implemented Action Model

Implemented a reusable action-item pattern in `apps/web/app/components/ui.tsx`.

The shared action item now supports:

- title;
- issue type;
- impact;
- owner;
- due date;
- status;
- severity;
- evidence used;
- recommended action;
- next step;
- task-specific action label.

The pattern is used across the major workflow surfaces that already had action queues:

- Governance Work;
- Control Owner Queue;
- Auditor Workspace;
- AI System Workspace;
- Evidence & Assurance.

Action items now answer:

- why the item exists;
- what evidence supports it;
- what the impact is;
- who owns it;
- what action is recommended;
- what happens next.

## Proof Chain Implementation

Implemented a reusable `ProofChain` component in `apps/web/app/components/ui.tsx`.

The proof chain uses the approved pattern:

Control -> Evidence Requirement -> Evidence Source -> Evidence Artifact -> Assurance -> Traceability -> Package

The component supports:

- stage label;
- stage title;
- detail;
- link;
- status;
- current-stage emphasis.

It is now displayed on:

- control detail pages;
- evidence object pages;
- GitHub evidence artifact pages;
- runtime evidence artifact pages;
- deployment evidence artifact pages;
- Supabase evidence artifact pages;
- MCP evidence artifact pages;
- Notion governance evidence artifact pages;
- secrets metadata evidence artifact pages;
- Auditor Workspace Prove a Control flow;
- Evidence & Assurance proof workflow.

## Evidence Accessibility Improvements

Evidence references now provide a clearer path to:

- linked control;
- evidence requirement;
- evidence source;
- evidence artifact;
- assurance result;
- traceability;
- package readiness.

Evidence object pages now show a persistent proof path rather than a local-only workflow step list.

Evidence artifact pages now preserve context with:

- breadcrumbs;
- workflow context;
- proof chain;
- source links;
- assurance links;
- traceability links;
- package readiness status.

System evidence traceability now uses task-specific action language: `Review Evidence`.

## Control Page Improvements

Control detail pages now make the control feel like a proof object.

Added:

- current proof status;
- audit readiness;
- action required section;
- evidence used in the action item;
- impact and recommended action;
- reusable proof chain;
- package-readiness status.

The control page now tells users whether the control is package-ready, what evidence supports it, what is missing, and what to do next.

## Auditor Workflow Improvements

Auditor Workspace now uses the reusable proof chain for `Prove a Control`.

The flow explicitly guides the auditor through:

- select control;
- required evidence;
- evidence source;
- available and missing evidence;
- assurance;
- traceability;
- package status.

Auditor action items now include evidence used, impact, owner, due date, severity, recommended action, and next step.

## Governance Queue Improvements

Governance Work and Control Owner Queue action items now include:

- issue type;
- owner;
- due date;
- severity;
- status;
- impact;
- evidence used;
- recommended action;
- next step;
- exact task-specific action label.

Generic fallback text was changed from `Review Item` to `Review Action`.

## AI System Workspace Improvements

System Action Required now uses the enriched shared action pattern.

System owners can see:

- what changed;
- what requires action;
- what blocks governance;
- what blocks audit;
- evidence used for each action;
- recommended next step.

## Remaining Gaps

Some lower-priority pages still contain legacy generic language in descriptive copy or metric labels, especially older dashboards and platform-review/admin pages. Those were not broadly refactored because Sprint 1 was scoped to the shared action and proof experience, not a full wording or route cleanup.

Future refinements:

- apply the shared action pattern to additional legacy register pages;
- add object-level action drawers for exceptions and risk acceptances;
- add package-readiness calculations to more evidence domains;
- replace remaining broad workflow cards with exact-object deep links where data supports it;
- add visual regression screenshots after UX stabilization.

## Validation

Commands run:

- `npm run typecheck` - passed.
- `npm run build` - passed.
- `npm run smoke` - passed.

Smoke note: page smoke was skipped because `APP_URL` was not set; the data smoke suite completed successfully.
