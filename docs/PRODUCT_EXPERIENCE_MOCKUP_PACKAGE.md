# Product Experience Mockup Package

Status: Experience visualization only.

Scope: no code changes, no React components, no route changes, no navigation updates, no UI assets. This package visualizes the approved Product Experience Blueprint through ASCII wireframes, layout diagrams, attention flow, and first-screen composition.

## Mockup Principles

The product should feel like an AI Governance Operations workbench, not a dashboard collection.

The visual language should be:

- dense but readable;
- restrained and institutional;
- evidence-backed;
- queue-oriented;
- traceability-forward;
- decision-supportive;
- audit-ready.

The first screen should never rely on a hero banner, decorative gradient, oversized KPI wall, or vague AI language. It should look like a serious operating surface where humans make accountable governance decisions.

Common screen composition:

```text
+--------------------------------------------------------------------------------+
| Workspace identity / scope / freshness / owner context                          |
+--------------------------------------------------------------------------------+
| Primary work surface: decisions, queue, proof path, health, or review flow       |
|                                                                                |
| Secondary support: readiness, evidence confidence, blockers, package status      |
+--------------------------------------------------------------------------------+
| Evidence chain / audit trail / contextual guidance                              |
+--------------------------------------------------------------------------------+
```

## Workspace 1: Command Center

Primary question: What should I care about?

### Above-The-Fold Experience

The executive first sees decisions, not analytics. The page is composed like a board briefing console: current reporting period, freshness, material decisions, risk appetite exceptions, audit readiness, and board package status.

```text
+--------------------------------------------------------------------------------+
| COMMAND CENTER                                      As of Jun 16, 2026  01:44   |
| Portfolio scope: Travel Brain + governed AI systems     Evidence: 84% current  |
+--------------------------------------------------------------------------------+
| DECISION REQUIRED                                  | BOARD / AUDIT READINESS    |
|                                                    |                            |
| [HIGH] Approve exception for MCP authority review  | Audit package: BLOCKED     |
|       Impact: Agent tool authority classification  | Blockers: 3 evidence gaps  |
|       Owner: AI Governance Lead   Due: Jun 21      | Last reviewed: Jun 16      |
|       Evidence confidence: MEDIUM                  | Action: Review Package     |
|       Action: Review Decision                      |                            |
|                                                    | Board report: DRAFT        |
| [MED] Accept Portainer access limitation pattern   | Material decisions: 2      |
|       Impact: Private infrastructure proof         | Action: Export Board Draft |
|       Evidence confidence: HIGH                    |                            |
+--------------------------------------------------------------------------------+
| OUTSIDE RISK APPETITE                              | MATERIAL EXCEPTIONS        |
| Travel Brain MCP permissions need classification   | Secrets rotation unknown   |
| Supabase privileged role warning needs review      | Notion source unavailable  |
+--------------------------------------------------------------------------------+
| Proof drawer preview: Decision -> Evidence Confidence -> Owner Recommendation   |
+--------------------------------------------------------------------------------+
```

### Information Hierarchy

1. Decision Required.
2. Audit and board readiness.
3. Outside risk appetite.
4. Material exceptions.
5. Evidence confidence.
6. Owner recommendation and decision record.

### Decision Workflow

```text
Signal
  -> Business Impact
  -> Evidence Confidence
  -> Owner Recommendation
  -> Executive Decision
  -> Audit Trail
```

### First 30 Seconds

An executive understands:

- which decisions require leadership;
- what is blocking board or audit readiness;
- whether evidence behind the posture is fresh;
- who owns the issue;
- what happens next.

### Why It Feels Credible

It avoids operational noise. It does not show every finding or connector warning. It shows only material decisions, named owners, due dates, evidence confidence, and board/audit consequences.

### Above vs Below Fold

Above the fold:

- reporting scope and freshness;
- decision-required queue;
- board/audit readiness;
- material exceptions;
- evidence confidence preview.

Below the fold:

- portfolio posture tables;
- detailed risk appetite history;
- decision audit trail;
- board package export history;
- evidence chain drilldowns.

## Workspace 2: Governance Work

Primary question: What needs governance attention today?

### Above-The-Fold Experience

The governance analyst sees an operating queue, not a dashboard. The central surface is a prioritized table with issue type, impact, owner, due date, evidence used, recommended action, status, and next step.

```text
+--------------------------------------------------------------------------------+
| GOVERNANCE WORK                                      Team Queue / My Work       |
| Filter: My Work | Audit Blockers | High Severity | Discovery | Committee Ready  |
+--------------------------------------------------------------------------------+
| PRIORITY QUEUE                                                                  |
| Type              Issue                         Owner       Due       Next       |
|--------------------------------------------------------------------------------|
| Failed Validation AI-GOV-006 MCP authority      R. Jones    Today     Remediate  |
| Evidence Gap      Secrets rotation unknown      Sec Owner   Jun 20    Request    |
| Source Issue      Portainer LAN access limit    Ops Owner   Jun 21    Review     |
| Discovery Finding Weather API undeclared        Sys Owner   Jun 24    Classify   |
| Exception         Notion governance source gap   Gov Lead    Jun 28    Escalate   |
+--------------------------------------------------------------------------------+
| SELECTED ITEM: AI-GOV-006 MCP authority classification                           |
| Why: Write-capable tools lack explicit authority classification.                 |
| Evidence used: MCP tool registry, permission metadata, governance/tool-policy     |
| Impact: Agentic governance control cannot be package-ready.                      |
| Recommended action: Classify authority or request exception.                     |
+--------------------------------------------------------------------------------+
| Remediation State: New -> In Review -> Waiting on Evidence -> Remediation -> Done|
+--------------------------------------------------------------------------------+
```

### Queue Layout

The queue should behave like a workbench:

- left/top filters for work ownership and severity;
- main queue for triage;
- selected-item panel for explanation;
- action strip for remediation, evidence request, escalation, exception, or risk acceptance.

### Remediation Flow

```text
Open queue item
  -> Understand why it exists
  -> Inspect evidence used
  -> Choose action
  -> Assign owner / due date
  -> Attach evidence or decision
  -> Verify
  -> Close with audit trail
```

### Escalation Flow

```text
Finding
  -> Impact Assessment
  -> Owner Response
  -> Exception or Risk Acceptance
  -> Committee Review
  -> Executive Decision
```

### First Action

A governance analyst should immediately click the highest-priority row, read why it exists, and take one of the visible actions: Remediate Control, Request Evidence, Review Exception, Accept Risk, or Escalate.

### Why It Feels Operational

It looks like a queue of owned work with status and next action. It does not ask users to infer work from charts.

### Above vs Below Fold

Above the fold:

- queue filters;
- highest-priority items;
- selected item explanation;
- remediation state;
- primary actions.

Below the fold:

- full queue history;
- committee packet builder;
- remediation audit trail;
- team workload;
- aging and SLA analysis.

## Workspace 3: AI System Workspace

Primary question: Is this AI system healthy?

### Above-The-Fold Experience

The system owner sees one governed object, not a portal. The screen opens with system identity, health verdict, what changed, action required, and governance/audit readiness.

```text
+--------------------------------------------------------------------------------+
| AI SYSTEM: Travel Brain                           Risk Tier: Medium  Production |
| Owner: Travel Product / AI Governance             Last review: Jun 16, 2026     |
+--------------------------------------------------------------------------------+
| HEALTH VERDICT: DEGRADED, AUDIT BLOCKED BY EVIDENCE                             |
+--------------------------------------------------------------------------------+
| WHAT CHANGED                         | ACTION REQUIRED                          |
| - Supabase evidence refreshed        | [HIGH] Review MCP authority finding      |
| - Secrets metadata collected         | [HIGH] Request secrets rotation evidence |
| - Portainer limitation confirmed     | [MED] Classify Weather API discovery     |
+--------------------------------------------------------------------------------+
| GOVERNANCE READINESS                 | EVIDENCE READINESS       | AUDIT READINESS|
| Controls: 14 / 17 operating          | Current: 84%             | Blocked        |
| Failed validations: 2                | Missing/stale: 5         | Package gaps: 3|
| Exceptions: 2                        | Source warnings: 6       | Ready controls:|
| Action: Review Controls              | Action: Review Evidence   | 11 / 17        |
+--------------------------------------------------------------------------------+
| Proof path preview: System -> Controls -> Evidence -> Assurance -> Audit Package |
+--------------------------------------------------------------------------------+
```

### Health Summary

The health summary combines:

- lifecycle;
- risk tier;
- assurance confidence;
- failed controls;
- missing or stale evidence;
- open findings;
- exceptions;
- source warnings;
- next review.

### System Owner Understanding In Under 90 Seconds

The system owner understands:

- the system is not fully healthy;
- audit is blocked by evidence;
- governance is blocked by MCP authority and secrets rotation;
- the top three actions are visible;
- evidence and control proof are one click away.

### Above vs Below Fold

Above the fold:

- system identity and ownership;
- health verdict;
- what changed;
- action required;
- governance readiness;
- evidence readiness;
- audit readiness.

Below the fold:

- control catalog for the system;
- evidence objects;
- monitoring runs;
- risk register;
- lifecycle history;
- audit trail.

## Workspace 4: Evidence & Assurance

Primary question: Can we prove it?

### Above-The-Fold Experience

Evidence & Assurance should feel like a proof workbench. The first screen gives users a search/lookup command surface and then immediately shows verification work, source health, traceability gaps, and package readiness.

```text
+--------------------------------------------------------------------------------+
| EVIDENCE & ASSURANCE                                      Proof Workbench        |
| Search: [ control / AI system / artifact / source / regulation / package     ]  |
+--------------------------------------------------------------------------------+
| PROOF PATH                                                                       |
| Control -> Requirement -> Source -> Artifact -> Assurance -> Traceability -> Pkg |
+--------------------------------------------------------------------------------+
| VERIFICATION QUEUE                  | SOURCE HEALTH                             |
| [WARN] AI-GOV-006 tool policy       | GitHub: current / valid                   |
| [WARN] Secrets rotation evidence    | Supabase: operational / warnings          |
| [BLOCK] Notion governance source    | Portainer: private infra limitation       |
| [DRIFT] Workflow artifact changed   | MCP: MVP / permission warnings            |
+--------------------------------------------------------------------------------+
| SELECTED PROOF: AI-GOV-006                                                    |
| What it proves: MCP tool authority is reviewed and bounded.                    |
| Source: MCP metadata + governance/tool-policy.yaml                             |
| Trust basis: collected metadata, hash, validation checks, control mapping       |
| Package-ready: NO - authority classification warning remains                   |
+--------------------------------------------------------------------------------+
```

### Evidence Discovery

Users can start from:

- control;
- AI system;
- evidence source;
- artifact;
- regulation;
- audit package.

Search results should show proof chains, not isolated records.

### Verification Flow

```text
Find proof question
  -> Select control or artifact
  -> Inspect source and collection metadata
  -> Verify artifact / hash / snapshot
  -> Review assurance
  -> Follow traceability
  -> Add to package or request remediation
```

### Traceability Flow

```text
Control -> Evidence
Evidence -> Control
Artifact -> Source -> Asset -> AI System
Finding -> Evidence Used -> Control Impact
Package -> Included Evidence -> Artifact Verification
```

### How Users Avoid Getting Lost

The proof path remains visible. The selected proof panel always states:

- what this proves;
- where it came from;
- why to trust it;
- what control it supports;
- whether it is package-ready.

### Above vs Below Fold

Above the fold:

- search/lookup;
- proof path;
- verification queue;
- source health;
- selected proof explanation.

Below the fold:

- full artifact tables;
- source registry;
- drift history;
- assurance explanations;
- package builder;
- domain-specific evidence sections.

## Workspace 5: Auditor Workspace

Primary question: Prove this control.

### Above-The-Fold Experience

Auditor Workspace should open as an audit execution surface. The auditor should not begin with a catalog. They begin with scope, a control proof input, and package readiness.

```text
+--------------------------------------------------------------------------------+
| AUDITOR WORKSPACE                                  Scope: Travel Brain FY26     |
| Package: Draft                Evidence complete: 71%      Exceptions: 2         |
+--------------------------------------------------------------------------------+
| PROVE A CONTROL                                                                |
| [ Search or select control: AI-GOV-006                                      ]   |
|                                                                                |
| Step 1 Scope -> Step 2 Control -> Step 3 Required Evidence -> Step 4 Verify     |
+--------------------------------------------------------------------------------+
| CONTROL PROOF: AI-GOV-006 Tool permissions approved                             |
| Required Evidence        Available Evidence          Missing Evidence           |
| - Tool policy            - governance/tool-policy    - Authority classification |
| - MCP tool registry      - MCP metadata artifact     - Owner sign-off           |
| - Approval record        - Notion gap artifact       - Committee approval       |
+--------------------------------------------------------------------------------+
| Assurance: WARNING        Traceability: PRESENT        Package-ready: NO        |
| Actions: Verify Artifact | Request Evidence | Raise Exception | Add To Package  |
+--------------------------------------------------------------------------------+
```

### 3-5 Click Control Proof

The auditor path:

1. Select active audit scope.
2. Search or select a control.
3. Review required, available, and missing evidence.
4. Verify artifact sufficiency.
5. Add to package or raise exception.

### Audit Package Flow

```text
Draft
  -> Scope Confirmed
  -> Evidence Complete
  -> Exceptions Reviewed
  -> Ready for Export
  -> Archived
```

### Above vs Below Fold

Above the fold:

- active audit scope;
- package readiness;
- prove-a-control input;
- required/available/missing evidence;
- assurance and package status;
- primary audit actions.

Below the fold:

- evidence request history;
- artifact verification queue;
- exception review;
- package contents;
- export audit trail.

## Workspace 6: Discovery & Onboarding

Primary question: What did we forget?

### Above-The-Fold Experience

Discovery & Onboarding should feel like a governed reconciliation surface. It compares declared governance to discovered reality and asks humans to resolve gaps.

```text
+--------------------------------------------------------------------------------+
| DISCOVERY & ONBOARDING                             Travel Brain Discovery Run   |
| Inventory completeness: 17%       Valid findings: 7   Warnings: 5   Invalid: 2 |
+--------------------------------------------------------------------------------+
| DECLARED VS DISCOVERED                                                        |
| Declared assets: 2       Discovered assets: 9       Untracked: 4       Missing:3|
+--------------------------------------------------------------------------------+
| DISCOVERY REVIEW QUEUE                                                         |
| Asset / Signal              Source Evidence              Confidence   Action    |
|--------------------------------------------------------------------------------|
| Travel Brain MCP Server     MCP connector metadata        HIGH 96%     Classify |
| Supabase - Travel Brain     Supabase connector metadata   HIGH 96%     Add      |
| Secrets Sources             Secrets metadata artifacts    MED 94%      Review   |
| Weather API                 governance/tool-policy.yaml   HIGH 88%     Add API  |
| Notion Governance Source    Notion gap artifacts          MED 68%      Resolve  |
+--------------------------------------------------------------------------------+
| SELECTED FINDING: Weather API                                                   |
| Why discovered: Appears in approved tool policy but not declared as external API |
| Evidence: governance/tool-policy.yaml + secrets usage mapping                   |
| Recommended inventory action: Add external API or mark invalid with rationale   |
+--------------------------------------------------------------------------------+
```

### Discovery Review

Each finding shows:

- source;
- source file or system;
- source asset;
- evidence;
- discovery rule;
- confidence;
- validation status;
- recommended inventory action.

### Inventory Completion Flow

```text
Manifest
  -> Discover assets
  -> Compare declared vs discovered
  -> Resolve gaps
  -> Assign owners
  -> Configure evidence sources
  -> Generate onboarding package
  -> Submit governance review
```

### Why It Is Differentiated

Traditional GRC assumes humans declare the inventory correctly. This workspace challenges the inventory with real signals from repositories, workflows, connectors, runtime metadata, secrets metadata, documentation, and source gaps.

### Above vs Below Fold

Above the fold:

- discovery run scope;
- inventory completeness;
- declared vs discovered comparison;
- review queue;
- selected finding explanation.

Below the fold:

- all discovery sources;
- invalid findings;
- source evidence details;
- onboarding package;
- manifest completeness;
- owner assignment.

## Cross-Workspace Review

| Workspace | Visual Hierarchy | Primary Focus | Secondary Focus | Action Area | Evidence Area | Educational Area |
| --- | --- | --- | --- | --- | --- | --- |
| Command Center | Decision first, readiness second, proof drawer third | Material executive decisions | Board and audit readiness | Review Decision, Request Proof, Send to Committee | Evidence confidence and proof drawer | Brief definitions of materiality and evidence confidence |
| Governance Work | Queue first, selected item second, state flow third | Owned governance work | Escalations and committee readiness | Remediate, Request Evidence, Review Exception, Accept Risk | Evidence used in selected action item | Inline explanation of why item exists |
| AI System Workspace | Health verdict first, actions second, readiness third | One system's governance health | What changed and blockers | Review Finding, Request Evidence, Complete Review | System proof path preview | Context panels explaining readiness |
| Evidence & Assurance | Search and proof path first, verification second | Find and verify proof | Source health and package status | Verify Artifact, Review Evidence, Add To Package | Full proof chain and selected proof explanation | Explain what evidence proves and does not prove |
| Auditor Workspace | Scope and proof input first, evidence sufficiency second | Prove one control | Package readiness | Verify Evidence, Request Evidence, Raise Exception | Required/available/missing evidence | Minimal guidance on sufficiency |
| Discovery & Onboarding | Declared vs discovered first, review queue second | Identify forgotten assets | Manifest and onboarding readiness | Classify, Add Asset, Mark Invalid, Assign Owner | Source evidence and confidence | Discovery rule explanation |

## Interaction Model

The product should use a consistent interaction grammar:

```text
Queue item selected
  -> Explanation panel updates
  -> Evidence used appears
  -> Proof path appears
  -> Recommended action appears
  -> User takes task-specific action
  -> State and audit trail update
```

For proof workflows:

```text
User asks proof question
  -> Product shows proof path
  -> User selects source or artifact
  -> Product explains trust basis
  -> User verifies or requests remediation
  -> Product marks package readiness
```

For executive workflows:

```text
Material signal appears
  -> Business impact shown
  -> Evidence confidence shown
  -> Owner recommendation shown
  -> Executive decision recorded
```

## Human Experience Review

### CIO

Would it feel credible? Yes.

Why: the CIO sees accountable system ownership, operational health, source limitations, audit readiness, and board-ready decisions. The product looks like it governs real AI systems, not abstract AI policies.

### CRO

Would it feel trustworthy? Yes.

Why: risk appetite, material exceptions, evidence confidence, owner recommendations, and decision trails are visible. The CRO can see whether issues are operational noise or material risk.

### Internal Auditor

Would it feel enterprise-grade? Yes.

Why: the auditor starts with scope and control proof. Required evidence, available evidence, missing evidence, artifact verification, traceability, and package readiness are all visible in one flow.

### Governance Analyst

Would it feel usable? Yes.

Why: the analyst starts in a queue with priority, owner, due date, evidence used, impact, and recommended action. The product tells them what to do next.

### Control Owner

Would it feel actionable? Mostly yes.

Why: control owners can see failed controls, evidence gaps, due dates, and exact actions. It becomes more valuable if future implementation adds role-specific saved views and personal workload filters.

### System Owner

Would it be used weekly? Yes, if the health summary stays concise.

Why: the system owner sees what changed, what blocks governance, what blocks audit, and what action is required. The view is useful for weekly governance review because it focuses on one system.

## Credibility Assessment

This mockup direction would feel:

- credible because conclusions are backed by evidence confidence and proof paths;
- trustworthy because every issue has an owner, impact, source, and next action;
- premium because it avoids novelty design and emphasizes serious workflow composition;
- enterprise-grade because it resembles operational GRC, audit, and evidence systems;
- demo-worthy because each persona has a clear first-screen story.

The product should not feel like a polished marketing surface. It should feel like a controlled operating environment where a regulator, auditor, executive, or system owner can ask a hard question and follow the answer to proof.

## Recommended Refinements Before Implementation

1. Define exact density targets for tables, queues, and proof cards so implementation does not drift into oversized cards.
2. Create a shared selected-item panel pattern for queues.
3. Create a shared proof drawer pattern for executive and governance surfaces.
4. Standardize status language across readiness, assurance, validation, and package readiness.
5. Define role-specific default filters for Governance Work and Auditor Workspace.
6. Decide whether Command Center uses a two-column board composition or a three-zone briefing composition at desktop widths.
7. Ensure mobile layouts preserve workflow order instead of turning everything into disconnected stacked cards.
8. Add a visual rule that educational content is always secondary and never interrupts primary work.

## Final Question

If someone saw only these mockups, would they believe: "This is a serious AI Governance Operations platform"?

Yes, if implementation preserves the composition discipline shown here:

- work first;
- proof always visible;
- decision support over decoration;
- ownership and due dates everywhere;
- no generic dashboard sprawl;
- no AI-themed visual gimmicks;
- no evidence dead ends.

What would still be missing is a fully rendered visual system showing typography scale, table density, color restraint, and exact spacing. That should be handled in the next implementation-design step, but the experience direction is strong enough to proceed.
