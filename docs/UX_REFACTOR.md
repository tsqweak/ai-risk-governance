# Phase 6F UX Refactor Blueprint

Purpose: define the UX and information architecture refactor plan for Phase 6F.

The platform has grown from an AI system registry into a broad AI governance operating model. Phase 6F should unify the experience so users can move through the product by governance story, not by implementation phase.

## Current UX Problems

### Capability Pages Reflect Build Sequence

The current navigation exposes many pages that map to project phases: AI governance, agentic governance, lifecycle, AI risk, governance engineering, monitoring, evidence, controls, regulatory coverage, and executive reporting.

This is useful for development validation, but it makes the user assemble the story manually.

Target improvement:

- Group pages by user lens.
- Make Portfolio and AI System Workspace the main organizing concepts.
- Preserve specialist pages, but make them subordinate to the governance story.

### AI System Context Is Fragmented

Users can inspect a system through separate pages for monitoring, AI governance, agentic governance, lifecycle, risk, and governance engineering.

Target improvement:

- Create a unified AI System Workspace.
- Use consistent workspace tabs.
- Keep system identity, risk tier, lifecycle stage, owner, evidence health, and findings visible across tabs.

### Evidence Is Present But Not Always Discoverable

Evidence exists as objects, requirements, health records, and implementation evidence. It can be found from evidence pages, regulatory pages, lifecycle pages, risk pages, and governance engineering pages, but the discovery model is not yet unified.

Target improvement:

- Make evidence a universal linked object.
- Provide evidence drawers or panels from risks, controls, regulations, findings, lifecycle gates, and implementations.
- Add evidence health indicators wherever evidence is referenced.

### Executive Story Is Split Across Views

Executive, portfolio, risk heatmap, regulatory coverage, governance committee, and board report pages each tell part of the story.

Target improvement:

- Create a single Executive lens that begins with the AI Governance Command Center.
- Organize executive content around portfolio health, material gaps, decisions required, and board-ready reporting.

### Compliance, Governance, And Risk Are Not Prioritized Enough

The platform has many valid dimensions, but the approved priority is:

```text
Compliance -> Governance -> Risk
```

Target improvement:

- Lead with regulatory coverage and audit readiness.
- Use governance maturity and lifecycle readiness as the second layer.
- Use AI risk and residual exposure as the third layer.

## Design Goals

- Make the product feel like an AI Governance Command Center, not a generic AI dashboard.
- Make Portfolio the core object and AI Systems the primary working objects.
- Give executives a calm, decision-oriented experience.
- Give auditors direct traceability from regulation to control to evidence.
- Give governance committees clear approval and readiness workflows.
- Give engineering teams a concrete control implementation view.
- Teach the progression from traditional governance to AI governance to agentic AI governance.
- Preserve explainability: every status should answer why it matters and what evidence supports it.

## Navigation Redesign

### Current Pattern

The current pattern is a broad sidebar of pages:

```text
Executive
Portfolio
AI Governance
Agentic Governance
AI Lifecycle
AI Risk
Governance Engineering
AI Systems
Travel Brain
Onboarding
Controls
Regulatory
Coverage
Traceability
Monitoring
Control Health
Findings
Exceptions
Risk Heatmap
Committee
Evidence
Auditor
```

### Target Pattern

Replace the flat navigation with lens-based navigation:

```text
AI Governance Command Center
  Executive
  Portfolio
  Governance
  Auditor Workspace
  Governance Committee
  Administration
```

### Navigation Lenses

Executive lens:

- Executive Overview
- Board Report
- Portfolio Health
- Material Gaps
- Decisions Required

Portfolio lens:

- AI Systems
- Risk Heatmap
- Regulatory Coverage
- Control Health
- Evidence Health
- Findings
- Exceptions

Governance lens:

- Governance Framework
- AI Governance
- Agentic Governance
- AI Lifecycle
- AI Risk
- Governance Engineering
- Controls
- Monitoring

Auditor Workspace:

- Traceability
- Evidence Library
- Control Testing
- Findings
- Exceptions
- Audit Packages

Governance Committee:

- Approval Queue
- Production Readiness
- Risk Acceptances
- Authority Changes
- Lifecycle Decisions

Administration:

- Onboarding
- System Intake
- Owner Management
- Framework Configuration
- Control Library Management

## Evidence Discoverability Strategy

Evidence should be discoverable from every governance object.

### Evidence Entry Points

- Regulation detail pages should show required evidence and linked evidence objects.
- Control pages should show evidence requirements, evidence status, and recent evidence.
- AI System Workspace should include an Evidence tab.
- Risk records should show linked evidence and acceptance evidence.
- Lifecycle gates should show gate evidence and approval evidence.
- Governance engineering implementations should show implementation evidence.
- Findings should show evidence gaps and remediation evidence.
- Auditor Workspace should provide cross-system evidence search and filtering.

### Evidence Display Standards

Every evidence reference should show:

- Evidence ID
- Title
- Evidence type
- Owner
- Status
- Validation status
- Expiration date
- Linked controls
- Linked regulations
- Linked AI systems
- Source location

### Evidence Health Signals

Use consistent evidence health language:

- Current
- Expiring Soon
- Expired
- Missing
- Invalid

Avoid showing evidence as a passive attachment. Treat it as proof of governance operation.

## Auditor Workflow

Auditors need direct traceability and minimal storytelling overhead.

Recommended workflow:

```text
Auditor Workspace
  -> Select regulation or control
  -> View mapped AI systems
  -> Inspect required evidence
  -> Review evidence health
  -> Inspect monitoring results
  -> Open findings or exceptions
  -> Export audit package
```

Auditor screens should prioritize:

- Traceability path
- Evidence completeness
- Evidence validity
- Control status
- Findings
- Exceptions
- Review history

Auditor language should be plain and evidentiary:

- "Mapped"
- "Evidence Required"
- "Evidence Current"
- "Missing Evidence"
- "Finding Open"
- "Exception Accepted"

## Executive Workflow

Executives need portfolio-level signal, not object-level clutter.

Recommended workflow:

```text
Executive
  -> Portfolio Health
  -> Material Gaps
  -> Decisions Required
  -> System Detail When Needed
  -> Board Report
```

Executive screens should answer:

- Is the AI portfolio under control?
- Which systems are high-risk or blocked?
- Which compliance gaps matter?
- Which governance approvals are pending?
- Which risk acceptances need renewal?
- Which agentic systems have material authority?
- What decisions are needed this month?

Executive messaging standard:

```text
What changed?
Why does it matter?
What is the exposure?
What decision is needed?
Who owns it?
By when?
```

## Governance Workflow

Governance teams need lifecycle, risk, control, authority, and implementation readiness.

Recommended workflow:

```text
Governance
  -> AI System Workspace
  -> Lifecycle / Risk / AI Governance / Agentic Governance
  -> Governance Engineering
  -> Approval or Remediation Decision
```

Governance screens should highlight:

- Lifecycle stage
- Stage-gate readiness
- Risk assessment
- Residual risk
- Risk acceptance
- Control health
- Evidence health
- Authority level
- Tool permissions
- Runtime controls
- Governance engineering status

## Guided Walkthrough Concept

The platform should include a guided walkthrough that teaches the governance story.

Recommended walkthrough:

```text
1. Start with the AI portfolio.
2. Open a production AI system.
3. Review regulatory coverage.
4. Inspect control health.
5. Open evidence supporting a control.
6. Review monitoring results.
7. Inspect AI-specific governance assets.
8. Inspect agentic authority and tool permissions.
9. Review lifecycle stage gates.
10. Review AI risks and residual risk treatment.
11. Review governance engineering implementation.
12. End with auditor traceability and executive summary.
```

Teaching objective:

```text
Traditional Governance
  -> AI Governance
  -> Agentic AI Governance
  -> Governance Engineering
  -> Continuous Assurance
```

The walkthrough should use Travel Brain as the clean production example and Autonomous Payment Agent as the high-risk agentic pilot example.

## Visual Hierarchy Recommendations

### Page-Level Hierarchy

Every primary page should have:

- One clear title
- One executive summary paragraph
- Four to six KPIs maximum
- Primary status band or decision summary
- Supporting sections in priority order

### Status Hierarchy

Use status consistently:

- Green: current, validated, approved, on track
- Amber: pending, needs attention, expiring, in treatment
- Red: blocked, failed, missing, expired, critical
- Slate: retired, not started, archived

### Information Density

Executive pages should be concise and decision-oriented.

Auditor and governance pages can be denser, but should still use clear grouping:

- Summary
- Traceability
- Evidence
- Findings
- Actions

### AI System Header

Every AI System Workspace tab should keep a compact persistent context header:

- System name
- Lifecycle stage
- Risk tier
- Owner
- Jurisdictions
- Evidence health
- Open findings
- Authority level

## Dashboard Standards

Dashboard pages should follow a consistent structure:

```text
Header
  Title
  Executive summary

KPI Row
  4-6 metrics

Primary Worklist
  Highest-priority risks, gaps, approvals, or findings

Portfolio / System Breakdown
  By status, stage, risk, jurisdiction, owner, or control domain

Educational Layer
  Explanation of the governance concept
```

Recommended KPI rules:

- Use counts for work queues.
- Use percentages for coverage and maturity.
- Use risk labels for severity.
- Always make a KPI drillable.
- Avoid vanity metrics.

## Component Standards

Recommended reusable components:

- PageHeader
- ContextHeader
- KpiStrip
- StatusBadge
- RiskBadge
- EvidenceBadge
- TraceabilityPath
- Worklist
- GovernanceTable
- EvidencePanel
- FindingPanel
- ApprovalPanel
- EducationalPanel
- EmptyState
- DecisionBanner

Component behavior:

- Tables should support filtering and grouped sections.
- Evidence links should open a consistent evidence detail surface.
- Status badges should use shared labels and colors.
- Traceability paths should use the same visual pattern everywhere.
- Educational panels should be available but not dominate operational pages.

## Future UX Improvements

### Search

Add global search across:

- AI systems
- Regulations
- Controls
- Evidence
- Findings
- Risks
- Implementations
- Approvals

### Cross-System Filtering

Add portfolio filters:

- Jurisdiction
- Lifecycle stage
- Risk tier
- Owner
- Business line
- Control domain
- Evidence health
- Finding severity
- Agentic level

### Evidence Packages

Create exportable evidence packages for:

- Specific regulation
- Specific AI system
- Specific control
- Audit period
- Governance committee meeting

### Decision Queues

Create decision queues for:

- Production approvals
- Risk acceptances
- Authority changes
- Exceptions
- Evidence expirations
- Findings remediation

### Guided Mode

Add a guided mode for demos, auditors, regulators, and new users.

Guided mode should:

- Explain the governance story.
- Highlight what to inspect next.
- Use Travel Brain and Autonomous Payment Agent as examples.
- End with traceability and evidence.

### Executive Narrative Mode

Add an executive narrative mode that turns portfolio state into a board-ready story:

```text
Portfolio posture
Material systems
Compliance gaps
Governance blockers
Residual risks
Decisions required
Next actions
```

## Recommendations Before Implementation

- Confirm the primary navigation labels before code changes.
- Define the AI System Workspace tab order and keep it stable.
- Decide whether Evidence is a global top-level area, a Portfolio sub-area, or both.
- Create a shared page header and AI system context header before moving pages.
- Define shared status vocabulary across controls, evidence, risks, lifecycle, findings, and implementations.
- Choose the first guided walkthrough path and script it before building guided UI.
- Prioritize Compliance first in information ordering, then Governance, then Risk.
- Preserve existing routes with redirects or aliases during refactor to avoid breaking smoke tests and demos.
