# Auditor Workspace Experience Foundation

Status: Fresh foundation implemented on `codex/fresh-governance-work-experience`.

Purpose: create the first Auditor Workspace product-experience foundation from `docs/PRODUCT_EXPERIENCE_BLUEPRINT.md` without redesigning the whole application or adding new governance capabilities.

## Product Decision

Auditor Workspace is built around the dominant object:

```text
Control Proof File
```

Primary question:

```text
Prove this control.
```

The approved flow is:

```text
Audit Scope
  -> Prove a Control
  -> Required Evidence
  -> Available Evidence
  -> Artifact Verification
  -> Assurance Judgment
  -> Exceptions
  -> Audit Package
```

This differs from Governance Work:

- Governance Work is an operational case-management workspace for answering `What needs governance attention today?`
- Auditor Workspace is an audit workpaper/proof workspace for answering `Can this control be defended for this audit scope?`
- Findings, source issues, and evidence gaps appear only as proof blockers, not as the primary object.

## Implemented Foundation

The `/auditor-workspace` route now uses a route-level enterprise audit shell with:

- Top enterprise app bar tuned to `AI Governance Audit Workspace`.
- Compact breadcrumb: `Auditor Workspace / Prove a Control`.
- Subtle `Reference audit scope` label.
- Left audit scope/control rail.
- Central guided `Control Proof File` flow.
- Right proof summary rail.
- Artifact verification panel only after an evidence artifact is selected.

The first screen prioritizes:

- active audit scope;
- scoped controls;
- selected reference scenario;
- current proof step;
- the next action required to continue.

The guided flow intentionally sequences attention:

```text
Scope
  -> Control
  -> Evidence
  -> Verify
  -> Package
```

At any moment, the auditor sees one primary proof task:

- `Scope`: confirm the reference audit scope and select the Travel Brain control.
- `Control`: review the objective and test expectation.
- `Evidence`: compare required evidence against available proof and missing evidence.
- `Verify`: inspect one selected artifact and decide sufficiency.
- `Package`: add proof to the package or mark a blocker/exception.

Artifact verification and package decision detail are hidden until the auditor reaches those steps.

Evidence rows must deep-link to the real evidence artifact or source whenever available. The Auditor Workspace should not treat evidence as static matrix text. Exact artifact routes are preferred over broad dashboard links. If only a source record exists, the row should identify it as source-only and link to the evidence source record. If no artifact or source route exists, the row must say `Evidence record unavailable` instead of pretending the evidence can be opened.

Metadata is not evidence. Auditor proof files distinguish inspectable evidence artifacts, human governance records, source metadata, missing evidence, and gap artifacts. Only inspectable evidence artifacts and valid human governance records can count as available proof. Source metadata can support context and traceability, but it must not be counted as sufficient audit proof. Gap artifacts can explain why proof is unavailable, but they do not prove the control.

## Data Provenance

Auditor Workspace currently uses database-backed reference/audit records.

The proof files are prepared from existing platform data:

- `getControlTraceability(controlId)`;
- `getAuditPackages()`;
- stored controls;
- stored assurance rules;
- stored evidence artifacts;
- connector/reference evidence records;
- findings and exceptions associated with controls;
- audit package records.

This is not a live real audit engagement and does not yet represent Russell's complete real project portfolio.

The workflow is designed as a real product workflow, not a throwaway demo. The current reference scenario uses Travel Brain because the database already contains the strongest end-to-end AI governance proof story for that system. The default proof target is:

```text
Prove Travel Brain tool permissions are approved
```

This target is backed where possible by current reference records, including GitHub policy evidence, MCP tool-permission evidence, connector/source health, validation status, evidence artifacts, assurance scoring, package context, and explicit source limitations or missing evidence.

The current default Travel Brain control is intentionally partially supported. It demonstrates honest audit blocking, not a successful proof: policy evidence exists, but approval/review/access-accountability proof is missing, metadata-only, or represented by gap artifacts. The Control Proof File must conclude `Not audit-ready` until missing proof is supplied or an exception is approved.

Real audit engagement onboarding and live portfolio ingestion remain future work. Future implementation should connect this experience to real onboarded systems through the existing manifest, discovery, evidence-source, traceability, and audit package operating model.

## Action Model

The proof file shows one primary state-based action:

- Missing evidence: `Request Evidence`
- Evidence available but unverified: `Verify Artifact`
- Evidence insufficient: `Raise Exception`
- Evidence sufficient but not packaged: `Add to Audit Package`
- Package-ready: `Mark Control Ready`

Secondary actions are intentionally limited:

- `Review Traceability`
- `Assign Reviewer`

Additional actions remain hidden behind overflow until workflow execution is implemented.

Primary actions are interactive at MVP level. Auditor actions should not silently do nothing. In this foundation:

- `Open Evidence` navigates to the exact evidence artifact/source route when available.
- `Verify Artifact` opens the artifact verification step for the selected evidence row.
- `Request Evidence` opens a draft evidence request drawer with audit scope, control context, missing requirement, likely owner, impacted AI system, due timing, reason, package/control context, and optional note.
- `Create Evidence Request` queues the request in-page only and clearly states that workflow persistence is not implemented in this foundation.

Backend workflow persistence, durable assignments, notifications, approval routing, and request lifecycle transitions remain future work.

## Remaining Weaknesses

- The route uses reference audit scope data rather than a real engagement scope.
- Real project portfolio data is not yet connected; this remains a reference audit scope.
- Control selection is client-side within prepared proof files; it does not yet persist reviewer decisions.
- Primary and secondary actions are MVP interactions; they do not yet execute durable audit workflow transitions.
- The default Travel Brain scenario is selected from current database-backed records, but it should eventually be selected by real audit scope, system, and control assignment rather than a route-level preference order.
- Artifact verification uses available stored artifact metadata; not every artifact type has identical hash, snapshot, or drift fields.
- Package lifecycle is displayed from reference package context and does not yet update from auditor actions.
- The route-level prototype visually replaces the app shell, but the global app shell still exists behind it in the DOM.
- The default Travel Brain control is preselected to support the demo scenario, so the Scope step is guided rather than an empty unselected state.

## Success Criteria

An auditor should be able to open `/auditor-workspace` and, in 3-5 clicks:

- select or inspect the active audit scope;
- select a control;
- understand what must be proven;
- compare required, available, and missing evidence;
- inspect artifact provenance and verification status;
- understand assurance judgment and package readiness;
- request evidence, verify an artifact, raise an exception, or add proof to an audit package without browsing broad dashboards.
