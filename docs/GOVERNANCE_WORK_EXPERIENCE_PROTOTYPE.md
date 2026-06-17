# Governance Work Experience Prototype

Status: Implemented.

Scope: focused Governance Work workspace implementation only. This did not redesign the full application, global navigation, all workspaces, or UX Refactor 2C.

## Workspace Implementation

Implemented a focused Governance Work experience at `/governance`.

The workspace now answers:

> What needs governance attention today?

The implemented structure is:

```text
Filters / Queue Scope
  -> Priority Queue
  -> Selected Item
  -> Proof Chain
  -> Workflow State
  -> Task-Specific Actions
```

The page uses real platform data where available:

- findings;
- evidence gaps;
- source issues;
- discovery findings;
- exceptions;
- risk acceptances;
- review tasks;
- failed validations.

Each priority queue row shows:

- issue type;
- issue;
- impacted AI system;
- owner;
- due date;
- severity;
- status.

The selected item panel shows:

- why this exists;
- evidence used;
- impact;
- owner;
- due date;
- recommended action;
- next step.

The selected item also includes the shared proof chain:

```text
Control -> Evidence Requirement -> Evidence Source -> Evidence Artifact -> Assurance -> Traceability -> Package
```

The workflow state model is visible:

```text
New -> In Review -> Waiting on Evidence -> Remediation Planned -> Exception Requested -> Accepted Risk -> Resolved -> Closed
```

## User Journey

1. User opens Governance Work.
2. User sees a clear question: "What needs governance attention today?"
3. User chooses a scope such as My Work, Audit Blockers, High Severity, Discovery, or Committee Ready.
4. User selects a queue item without leaving the page.
5. The selected item panel explains why the issue exists, what evidence supports it, what impact it has, and what action to take.
6. User reviews the proof chain and workflow state.
7. User chooses a task-specific action such as Remediate Control, Request Evidence, Review Exception, Accept Risk, Escalate, Verify Evidence, or Review Finding.

## Usability Assessment

### 1. What is the first thing a user notices?

The user first notices the workspace question and the queue scope controls. On desktop, the priority queue and selected item are visible together, which makes the page feel like an operating workbench rather than a dashboard.

### 2. Can a user understand what to do next?

Yes. The selected item panel shows recommended action and next step in plain operational language. The queue also exposes owner, due date, severity, and status, so work feels assigned and time-bound.

### 3. Can a user reach evidence?

Yes. The selected item includes evidence used and a proof chain linking the issue to control, evidence requirement, evidence source, artifact, assurance, traceability, and package readiness. The exact-object link remains available for deeper review.

### 4. Does the workspace feel meaningfully different from the current product?

Yes. The previous Governance page felt like a hub of governance destinations plus action-required summaries. The prototype feels more like daily governance operations: choose scope, inspect work, understand proof, and act without losing context.

### 5. What still feels confusing?

Some queue items have stronger proof data than others. Review tasks from the lightweight executive data source do not currently include requirement links or audit package links, so those items are explicitly shown as unmapped or needs review instead of pretending stronger traceability exists.

The secondary navigation remains above the prototype because global navigation and route ownership were out of scope. It is useful for continuity, but it competes with the focused workbench.

## Self-Review Findings

During browser validation, the first implementation showed the selected item below the first desktop viewport. That weakened the first-30-second experience, so the composition was changed to show the queue and selected item side by side on desktop.

Mobile validation showed the selected item below a long queue. The responsive order was changed so mobile shows the selected item before the long queue, preserving context before scrolling.

The Discovery scope initially fell back to the full queue because priority slicing removed discovery items. The queue limit was removed so each scope can show its real items.

## Remaining Problems

- Queue action buttons are prototype actions; they do not yet execute full remediation, exception, or risk-acceptance workflows.
- The selected item panel can become text-heavy for complex findings.
- Some source issue and review task proof chains depend on available metadata rather than full artifact-level proof.
- The supporting secondary navigation still makes the page feel partly like the old architecture.
- The proof chain is useful, but the visual density should be refined in a design pass.

## Recommendations

1. Keep this workbench pattern as the direction for Governance Work.
2. Add real workflow transitions for the action buttons in a later sprint.
3. Add saved role-based queue scopes for governance analyst, control owner, and committee reviewer.
4. Enrich review-task data with evidence requirement and package links.
5. Consider collapsing secondary navigation on this workspace so operational work remains visually dominant.
6. Apply the selected-item workbench pattern to Control Owner Queue and Findings only after validating this page with a human user.

## Validation Results

Commands:

- `npm run typecheck` - passed.
- `npm run build` - passed.
- `npm run smoke` - passed.

Browser validation:

- `/governance` rendered successfully on the dev server.
- Scope filters updated the queue in place.
- Discovery scope showed discovery findings after queue-scope fix.
- Selected item updated without navigation.
- Proof chain appeared for selected items.
- Workflow state appeared for selected items.
- Desktop screenshot confirmed queue and selected item are visible together above the fold.
- Mobile check confirmed selected item appears before the long queue.

Note: Browser console logs retained a stale Next.js chunk error from before the dev server restart. After restart, terminal logs showed successful `/governance` responses and no new server error during validation.
