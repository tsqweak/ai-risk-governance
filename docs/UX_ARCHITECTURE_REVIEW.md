# AI Governance UX Architecture Review

Purpose: review the current AI-Risk-Governance application architecture and recommend a clearer information architecture, navigation architecture, page hierarchy, and dashboard hierarchy.

Scope: documentation-only review. This document does not implement changes.

## Executive Summary

The application has evolved into a rich AI governance platform with registry, compliance, monitoring, evidence, AI governance, agentic governance, lifecycle, risk, governance engineering, repository discovery, evidence automation, assurance, and verifiable evidence capabilities.

The core product direction is strong. The main UX problem is not missing capability. The problem is organizational overload.

The current experience exposes too many implementation-phase pages at the same navigation level. It mixes executive lenses, operational workbenches, portfolio objects, persona workspaces, educational content, evidence operations, and technical governance tools in one sidebar. This makes the product feel broader than it is controlled, even though the underlying governance model is coherent.

Recommended architectural move:

```text
AI Governance Command Center
  -> Portfolio
  -> AI System Workspace
  -> Governance Operations
  -> Evidence & Assurance
  -> Auditor Workspace
  -> Committee Decisions
  -> Administration
```

The product should stop presenting every capability as a top-level destination. Top-level navigation should represent user intent. Specialist pages should become drill-downs from the correct workflow.

## Current Strengths

- AI System Workspace is the strongest organizing pattern. It gives each system a persistent context header and tabbed subviews.
- Evidence artifacts are now independently inspectable with content, snapshots, hashes, commit SHA, collection timestamp, provenance, and drift comparison.
- Control pages have become strong auditor and control-owner surfaces because they connect governance story, assurance explanation, artifacts, validation, traceability, findings, and exceptions.
- Governance Operations clearly demonstrates the emerging operating model: assets, evidence sources, artifacts, assurance rules, warnings, drift, and connector health.
- Auditor traceability exists in multiple forms: regulation-led, finding-led, control-led, evidence-led, and artifact-led.
- The platform has the right conceptual progression: compliance, governance, risk, evidence, assurance, operations.

## Primary UX Problems

### 1. Navigation Overload

The sidebar currently contains four groups:

- Command Center
- Persona Workspaces
- Portfolio Objects
- Operational Views

This is directionally useful, but the fourth group has become a catch-all. It includes compliance, risk, monitoring, evidence repository, evidence health, AI manifest, operations, engineering, and walkthroughs. These are not equal-level destinations.

Current overload symptoms:

- Too many top-level choices.
- Similar concepts appear in multiple places.
- Demo/pilot pages sit next to production governance surfaces.
- Technical implementation views compete with executive and auditor surfaces.
- The user must already understand the product to know where to go.

Recommended fix:

- Keep top-level navigation small.
- Make operational subareas accessible through workflow hubs.
- Move demo/pilot and manifest education under Administration or Onboarding.
- Move evidence health, evidence repository, artifacts, snapshots, and drift under Evidence & Assurance.

### 2. Duplicate Information

Several concepts are repeated across different pages without a clear canonical source.

Duplication examples:

- Executive, Portfolio, Board Report, Risk Heatmap, Regulatory Coverage, and Control Health all summarize portfolio health.
- Auditor and Auditor Workspace both present findings, exceptions, evidence gaps, failed tests, and trace paths.
- Evidence Repository, Evidence Health, system Evidence tabs, artifact pages, and Auditor Workspace all expose evidence posture.
- Monitoring, Control Health, system Monitoring tabs, and control pages all expose test/run/finding state.
- AI Governance and system AI Governance tabs overlap.
- Governance Engineering and system Governance Engineering tabs overlap.
- Governance Operations overlaps with Evidence Repository, Evidence Health, artifact viewer, and traceability.

Duplication is not inherently bad, but each duplicate needs a distinct job:

- Executive view: decision summary.
- Portfolio view: cross-system comparison.
- System workspace: system-specific operating view.
- Auditor view: traceability and proof.
- Operations view: connector, source, artifact, drift, and assurance mechanics.

### 3. Misplaced Information

Some information is currently available but located in places that do not match the user's mental model.

Misplaced information examples:

- Travel Brain Pilot is in Persona Workspaces, but it is an onboarding validation/pilot artifact. It belongs under Administration -> Onboarding -> Pilot Assessments.
- AI Manifest is in Operational Views, but it is primarily an onboarding standard and evidence source declaration. It belongs under Administration -> Standards or Onboarding -> Manifest Registry.
- Governance Operations is under Operational Views, but it is a major platform operating layer. It deserves its own hub or should sit under Evidence & Assurance.
- Walkthroughs are top-level operational views, but they are demo/navigation aids. They should be secondary support content, not operational navigation.
- Regulatory Coverage appears as an operational page, but compliance is the approved first priority. It should be visible under Executive, Portfolio, Governance, and Auditor contexts with different levels of detail.

### 4. Page Hierarchy Is Capability-First

Many pages map to build phases:

- AI Governance
- Agentic Governance
- AI Lifecycle
- AI Risk
- Governance Engineering
- Governance Operations
- Evidence Artifacts
- Governance Manifest

These are valid capabilities, but users do not usually start with a phase name. They start with a question:

- Are we compliant?
- Which systems need attention?
- What evidence proves this control?
- What approvals are pending?
- What changed?
- What do I need to review?

The hierarchy should prioritize questions and workflows, with capabilities available as drill-downs.

## Persona Workflow Problems

## Auditor Workflow Problems

Auditor workflow is powerful but spread across too many destinations.

Current auditor entry points:

- Auditor
- Auditor Workspace
- Traceability
- Evidence Repository
- Evidence Health
- Audit Packages
- Control Health
- Controls
- Evidence Artifact Viewer
- Drift Viewer
- Regulation Detail
- System Evidence Tab

Problem:

Auditors can verify almost everything, but they may not know which page is the official audit starting point.

Recommended auditor workflow:

```text
Auditor Workspace
  -> Audit Scope
  -> Traceability
  -> Control Review
  -> Evidence Review
  -> Artifact Verification
  -> Findings / Exceptions
  -> Audit Package
```

Auditor pages should be organized around audit tasks, not product capabilities.

Recommended auditor hierarchy:

- Audit Dashboard: scope, high-risk systems, evidence gaps, failed checks, expiring evidence.
- Traceability: regulation -> requirement -> control -> evidence -> artifact.
- Control Review: control-owner, status, required evidence, assurance explanation, findings.
- Evidence Review: evidence repository, evidence health, artifact viewer, snapshot, drift.
- Audit Packages: generated packages, scope, included evidence, export readiness.

## Executive Workflow Problems

Executive pages are directionally right but split across multiple surfaces.

Current executive entry points:

- Executive
- Board Report
- Portfolio
- Risk Heatmap
- Regulatory Coverage
- Control Health
- Governance Committee

Problem:

Executives need a concise answer to:

```text
Are we compliant?
Is governance under control?
What AI risks require a decision?
```

The current experience gives several valid dashboards but does not define which one is the executive home, which one is board reporting, and which ones are supporting operational drill-downs.

Recommended executive workflow:

```text
Executive
  -> Compliance posture
  -> Governance health
  -> Material risks
  -> Decisions required
  -> Board report
```

Executive pages should avoid operational labels such as connector health, source registry, artifact drift, or evidence source mechanics unless they are summarized as assurance risk.

Recommended executive hierarchy:

- Executive Overview: compliance, governance, risk, decisions.
- Board Report: static, board-ready narrative.
- Material Gaps: top regulatory, evidence, assurance, and control gaps.
- Decisions Required: approvals, risk acceptances, authority changes, production readiness.
- Portfolio Health: cross-system comparison.

## Control-Owner Workflow Problems

Control-owner workflow has improved significantly through `/controls/[controlId]`, but the ownership path is not surfaced strongly enough.

Current control-owner entry points:

- Controls
- Control detail
- System Controls tab
- Control Health
- Monitoring
- Governance Operations
- Evidence Artifact Viewer

Problems:

- Control owners do not have a dedicated "My Controls" or "Control Owner Workspace" concept.
- System controls show evidence objects but not always artifact-backed assurance or drift state.
- Control Health is a monitoring dashboard, not a control-owner action queue.
- Control detail pages are strong, but users must know the control ID or discover it from another page.

Recommended control-owner workflow:

```text
Control Owner Workspace
  -> My Controls
  -> Control Assurance
  -> Evidence Required
  -> Evidence Present
  -> Validation Results
  -> Findings / Exceptions
  -> Remediation Actions
```

Control-owner pages should prioritize:

- Which controls I own.
- Which systems they apply to.
- Which evidence is missing or stale.
- Which validation checks failed or warned.
- What action is required.

## Proposed Information Architecture

## Top-Level Product Areas

Recommended top-level areas:

```text
AI Governance Command Center
  Executive
  Portfolio
  Governance
  Evidence & Assurance
  Auditor Workspace
  Committee
  Administration
```

Rationale:

- Executive answers leadership questions.
- Portfolio is the core business object.
- Governance contains operating disciplines.
- Evidence & Assurance becomes a first-class proof layer.
- Auditor Workspace has a clean audit workflow.
- Committee focuses on decisions.
- Administration contains onboarding, standards, libraries, and configuration.

## Area Responsibilities

### Executive

Purpose: senior leadership and board-ready governance posture.

Primary questions:

- Are we compliant?
- Is governance operating?
- What risks require attention?
- What decisions are needed?

Pages:

- Executive Overview
- Board Report
- Material Gaps
- Decisions Required
- Portfolio Health

### Portfolio

Purpose: cross-system AI governance management.

Primary questions:

- Which systems exist?
- Which systems are high risk?
- Which systems have evidence or control gaps?
- How does one system compare to another?

Pages:

- AI Systems
- Portfolio Health
- Risk Heatmap
- Regulatory Coverage
- Control Health
- Evidence Health
- Findings
- Exceptions

### Governance

Purpose: cross-system governance operation by discipline.

Primary questions:

- Are controls designed and operating?
- Is lifecycle governance complete?
- Are risks assessed and treated?
- Are AI and agentic controls in place?
- Are implementations mapped?

Pages:

- Controls
- Regulatory Compliance
- Risk Management
- Monitoring
- Lifecycle Governance
- AI Governance
- Agentic Governance
- Governance Engineering

### Evidence & Assurance

Purpose: proof, evidence operations, and verifiable assurance.

Primary questions:

- What proof exists?
- Is the proof valid?
- What source produced it?
- Can the artifact be independently inspected?
- Has the source drifted?
- Which controls depend on it?

Pages:

- Evidence Repository
- Evidence Health
- Evidence Artifacts
- Evidence Snapshots
- Drift Detection
- Assurance Explanations
- Governance Operations
- Evidence Source Registry
- Audit Packages

### Auditor Workspace

Purpose: audit execution and regulator support.

Primary questions:

- What is in scope?
- What is the traceability path?
- What evidence supports each control?
- What gaps, findings, and exceptions exist?
- Can the audit package be generated?

Pages:

- Audit Dashboard
- Scope Selection
- Traceability
- Control Review
- Evidence Review
- Findings
- Exceptions
- Audit Packages

### Committee

Purpose: governance decisions and escalations.

Primary questions:

- What requires approval?
- What systems are production-ready?
- What risk acceptances are pending or expiring?
- What authority changes need decision?
- Which lifecycle gates are blocked?

Pages:

- Committee Dashboard
- Approval Queue
- Production Readiness
- Risk Acceptances
- Authority Changes
- Lifecycle Decisions
- Escalations

### Administration

Purpose: setup, onboarding, standards, and libraries.

Primary questions:

- How do systems enter governance?
- What standards apply?
- Who owns what?
- What libraries configure the platform?

Pages:

- Onboarding
- Repository Discovery
- Manifest Registry
- Travel Brain Pilot Assessments
- Owner Management
- Control Library
- Regulatory Library
- Framework Configuration

## Proposed Navigation Architecture

## Primary Sidebar

Keep the persistent sidebar, but reduce it to intent-based hubs:

```text
Command Center
  Executive
  Portfolio
  Governance
  Evidence & Assurance

Workspaces
  Auditor Workspace
  Committee
  Administration

AI Systems
  AI Systems
  Travel Brain
  Autonomous Payment Agent
```

Do not include all specialist pages in the persistent sidebar.

## Secondary Navigation

Each hub should have its own internal navigation.

Example: Evidence & Assurance secondary nav:

```text
Overview
Repository
Health
Artifacts
Snapshots
Drift
Sources
Packages
```

Example: Governance secondary nav:

```text
Overview
Controls
Compliance
Monitoring
Lifecycle
Risk
AI Governance
Agentic Governance
Engineering
```

Example: Auditor secondary nav:

```text
Dashboard
Scope
Traceability
Controls
Evidence
Findings
Exceptions
Packages
```

## Contextual Navigation Rules

- Global navigation should answer "Where am I working?"
- Secondary navigation should answer "What workflow am I in?"
- Page actions should answer "What can I do next?"
- Object links should answer "What supports this claim?"

## Proposed Page Hierarchy

## Level 1: Hubs

Hubs summarize a domain and direct users into workflows.

Examples:

- Executive Overview
- Portfolio Overview
- Governance Overview
- Evidence & Assurance Overview
- Auditor Workspace
- Committee Dashboard
- Administration

## Level 2: Worklists and Workbenches

Worklists show action queues and cross-system operating views.

Examples:

- Material Gaps
- Evidence Review Queue
- Warning and Failure Workbench
- Approval Queue
- Control Owner Queue
- Findings Register
- Exceptions Register

## Level 3: Object Detail Pages

Object detail pages should be canonical.

Canonical objects:

- AI System
- Control
- Regulation
- Requirement
- Risk
- Evidence Object
- Evidence Artifact
- Evidence Snapshot
- Finding
- Exception
- Approval
- Asset
- Evidence Source
- Implementation

## Level 4: Verification and Drill-Down Pages

These are deep proof pages.

Examples:

- Artifact Drift Viewer
- Evidence Download
- Snapshot Comparison
- Assurance Explanation
- Audit Package Detail

## Proposed Dashboard Hierarchy

## Tier 1: Executive Dashboard

Audience: CIO, CRO, board, risk committee.

Purpose: decision support.

Content:

- Compliance posture.
- Governance health.
- Material gaps.
- Risk exposure.
- Decisions required.
- Board report link.

Avoid:

- Raw source registries.
- Long evidence tables.
- Connector implementation detail.

## Tier 2: Portfolio Dashboard

Audience: AI Governance Working Group, IT Risk, Compliance.

Purpose: cross-system management.

Content:

- AI systems by lifecycle, risk, jurisdiction, business owner.
- Control and evidence health by system.
- Findings and exceptions by system.
- Regulatory coverage by system.
- Trend placeholders.

Avoid:

- Deep artifact content.
- Duplicating the Executive Overview.

## Tier 3: Domain Dashboards

Audience: operational governance teams.

Purpose: manage a governance discipline.

Domain dashboards:

- Regulatory Compliance
- Risk Management
- Control Monitoring
- Evidence & Assurance
- Lifecycle Governance
- Governance Engineering
- AI Governance
- Agentic Governance

Each domain dashboard should include:

- Domain KPI strip.
- Work queue.
- Gaps requiring action.
- Top affected systems.
- Links to canonical objects.

## Tier 4: Object Workspaces

Audience: system owners, control owners, auditors, engineers.

Purpose: understand and act on a specific object.

Primary object workspace:

- AI System Workspace

Secondary object pages:

- Control detail.
- Evidence artifact.
- Evidence snapshot.
- Regulation detail.
- Risk detail.
- Finding detail.
- Exception detail.

## Recommended Consolidations

## Consolidate Auditor and Auditor Workspace

Current:

- `/auditor`
- `/auditor-workspace`

Recommendation:

- Keep `/auditor-workspace` as the canonical auditor landing page.
- Move `/auditor` content into an "Audit Dashboard" tab or redirect.

## Consolidate Evidence Surfaces Under Evidence & Assurance

Current:

- `/evidence`
- `/evidence-repository`
- `/evidence-health`
- `/evidence-artifacts/[id]`
- `/evidence-artifacts/[id]/drift`
- `/audit-packages`
- Evidence sections inside Auditor Workspace, System Workspace, Governance Operations.

Recommendation:

- Create Evidence & Assurance hub.
- Make Evidence Repository, Health, Artifacts, Snapshots, Drift, Sources, and Packages secondary nav items.
- Keep system-specific evidence inside AI System Workspace but make it a scoped view of the canonical evidence model.

## Consolidate Portfolio Entry Points

Current:

- `/`
- `/portfolio`
- `/portfolio/ai-systems`
- `/risk-heatmap`
- `/regulatory-coverage`
- `/control-health`

Recommendation:

- Make `/portfolio` the portfolio hub.
- Make `/` either redirect to `/portfolio/ai-systems` or the Command Center home.
- Place risk heatmap, regulatory coverage, control health, evidence health, findings, and exceptions under Portfolio secondary navigation.

## Make Governance Operations a Proof Layer

Current:

- Governance Operations sits in Operational Views.

Recommendation:

- Place Governance Operations under Evidence & Assurance or make it a subarea called "Operations".
- Executive users should see only summarized assurance risk, not the full connector mechanics.
- Auditors should enter it through evidence source or artifact verification paths.

## Move Pilot and Standards Under Administration

Current:

- Travel Brain Pilot is visible in Persona Workspaces.
- AI Manifest is visible in Operational Views.

Recommendation:

- Move both under Administration -> Onboarding and Standards.
- Keep links from Governance Operations only when relevant to evidence source configuration.

## Recommended Future Navigation Tree

```text
AI Governance Command Center

Executive
  Overview
  Board Report
  Material Gaps
  Decisions Required
  Portfolio Health

Portfolio
  AI Systems
  Portfolio Health
  Risk Heatmap
  Regulatory Coverage
  Control Health
  Evidence Health
  Findings
  Exceptions

Governance
  Overview
  Controls
  Regulatory Compliance
  Risk Management
  Monitoring
  Lifecycle
  AI Governance
  Agentic Governance
  Governance Engineering

Evidence & Assurance
  Overview
  Evidence Repository
  Evidence Health
  Evidence Artifacts
  Evidence Snapshots
  Drift Detection
  Evidence Source Registry
  Governance Operations
  Audit Packages

Auditor Workspace
  Audit Dashboard
  Scope
  Traceability
  Control Review
  Evidence Review
  Findings
  Exceptions
  Audit Packages

Committee
  Dashboard
  Approval Queue
  Production Readiness
  Risk Acceptances
  Authority Changes
  Lifecycle Decisions
  Escalations

Administration
  Onboarding
  Repository Discovery
  Manifest Registry
  Pilot Assessments
  Owner Management
  Control Library
  Regulatory Library
  Framework Configuration
```

## Recommended Implementation Sequence

### Step 1: Define Canonical Destinations

Mark each route as one of:

- Hub
- Worklist
- Canonical object
- Drill-down
- Educational
- Demo/pilot
- Deprecated/redirect

### Step 2: Reduce Sidebar

Remove specialist pages from persistent sidebar.

Sidebar should contain only:

- Executive
- Portfolio
- Governance
- Evidence & Assurance
- Auditor Workspace
- Committee
- Administration
- AI Systems
- Key system shortcuts

### Step 3: Add Hub Secondary Navigation

Create local secondary nav for each hub.

This avoids forcing every page into the global sidebar.

### Step 4: Normalize Page Titles and Jobs

Every page should have one clear job:

- Dashboard
- Work queue
- Object detail
- Verification
- Education

Avoid pages that are simultaneously dashboard, tutorial, registry, and workbench.

### Step 5: Create Workflow-Specific Landing Pages

Add or clarify:

- Evidence & Assurance Overview
- Control Owner Workspace
- Auditor Scope Page
- Committee Approval Queue
- Portfolio AI Systems Page

### Step 6: Add Redirects

Use redirects only after canonical destinations are clear.

Likely redirects:

- `/auditor` -> `/auditor-workspace`
- `/evidence` -> `/evidence-repository` or `/evidence-assurance`
- `/regulatory-mapping` -> `/governance/regulatory-compliance`
- `/projects/travel-brain` -> `/systems/travel-brain`

## Page-Level Recommendations

## Executive

Keep high-level KPIs but reorder by priority:

1. Compliance posture.
2. Governance health.
3. Material risk.
4. Decisions required.

Reduce duplicate maturity cards unless tied to executive action.

## Portfolio

Make Portfolio the primary cross-system working surface.

Add:

- AI systems table.
- Filters by lifecycle, owner, risk tier, jurisdiction, evidence health.
- Columns for compliance, governance, risk, evidence, findings.

Move risk heatmap and regulatory coverage under Portfolio secondary nav.

## Governance

Keep Governance as an operating discipline hub.

Add grouped sections:

- Compliance.
- Controls.
- Monitoring.
- Lifecycle.
- Risk.
- AI/Agentic Governance.
- Engineering.

Avoid listing unrelated operational cards without queue status.

## Evidence & Assurance

Create as a new hub.

First page should answer:

- What evidence exists?
- What evidence is stale, missing, invalid, or drifting?
- What assurance rules are warning/failing?
- Which controls are impacted?
- Which evidence can auditors independently verify?

## Auditor Workspace

Make it the canonical audit entry.

Replace generic quick links with workflow stages:

```text
Scope -> Traceability -> Controls -> Evidence -> Verification -> Findings -> Package
```

## Committee

Move from passive dashboard to decision queue.

Add:

- Approval queue.
- Risk acceptances pending decision.
- Production readiness decisions.
- Authority changes.
- Lifecycle stage gate decisions.

## Control Detail

Strong page. Keep it canonical.

Improve discoverability through:

- Control Owner Workspace.
- Links from system controls.
- Links from monitoring failures.
- Links from evidence artifacts.

## System Workspace

Strong page. Keep it central.

Improve:

- Split 11 tabs into grouped tabs or overflow.
- Add "Action Required" as a first-class tab or panel.
- Make Evidence & Assurance artifacts available from the Evidence tab, not only evidence objects.

## UX Risk Register

| Risk | Impact | Recommendation |
|---|---|---|
| Sidebar overload | Users cannot tell where to begin | Reduce global nav to hubs |
| Duplicate dashboards | Conflicting sense of source of truth | Assign each dashboard a unique job |
| Evidence split across object types | Auditors may miss verifiable artifacts | Create Evidence & Assurance hub |
| Control-owner path not explicit | Owners may not find their action queue | Add Control Owner Workspace |
| Demo/pilot pages mixed with operations | Product feels less enterprise-ready | Move pilot content under Administration |
| Technical operations exposed to executives | Executive story becomes too detailed | Summarize operations as assurance risk |
| Too many system workspace tabs | Horizontal tab overload | Group tabs or add sectioned secondary nav |

## Target User Journeys

## Executive Journey

```text
Executive Overview
  -> Material Gaps
  -> Decisions Required
  -> Board Report
```

Goal: leave with confidence that compliance, governance, and risk are understood.

## Auditor Journey

```text
Auditor Workspace
  -> Scope
  -> Traceability
  -> Control
  -> Evidence Artifact
  -> Snapshot / Drift
  -> Finding / Exception
  -> Audit Package
```

Goal: independently verify claims.

## Control Owner Journey

```text
Control Owner Workspace
  -> My Controls
  -> Control Detail
  -> Assurance Explanation
  -> Missing Evidence / Warning
  -> Artifact / Source / Drift
  -> Remediation
```

Goal: know what must be fixed and why.

## AI System Owner Journey

```text
Portfolio
  -> AI System
  -> Overview
  -> Action Required
  -> Controls / Evidence / Monitoring
  -> Findings / Exceptions
```

Goal: understand system posture and take ownership.

## Governance Operations Journey

```text
Evidence & Assurance
  -> Sources
  -> Artifacts
  -> Assurance Rules
  -> Warnings / Failures
  -> Drift
```

Goal: operate evidence collection and assurance.

## Conclusion

The application has reached a point where its underlying governance model is stronger than its navigation model. The next UX architecture refactor should not add more pages first. It should define canonical destinations, reduce the global sidebar, introduce Evidence & Assurance as a first-class hub, and turn role-specific work into clear workflows.

The best next UX move is:

```text
Fewer global choices.
Stronger hubs.
Canonical object pages.
Workflow-specific drill-downs.
```

That will make the platform feel less like a collection of phase deliverables and more like a bank-grade AI Governance Command Center.
