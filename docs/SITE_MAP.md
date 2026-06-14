# Phase 6F Site Map Blueprint

Purpose: define the target navigation and information architecture for the Phase 6F UX refactor.

This blueprint assumes the platform has completed Phase 1 through Phase 6E and is now ready to move from capability-by-capability pages into a coherent AI Governance Command Center.

## Design Principles

- DP-01 Not a Generic AI Dashboard: the product should feel like a governance operating system, not a metrics landing page.
- DP-02 Multi-Dimensional Navigation: users need Executive, Portfolio, and Governance lenses.
- DP-03 Portfolio Is The Core Object: the portfolio is the primary surface for understanding AI risk, compliance, governance maturity, evidence posture, and system health.
- DP-04 AI Systems Have Unified Workspaces: each AI system should have one workspace with consistent sub-navigation.
- DP-05 Evidence Must Be Discoverable: users should be able to find evidence from any regulation, control, risk, finding, implementation, or system context.
- DP-06 Tell A Story: navigation should teach the progression from traditional governance to AI governance to agentic AI governance.
- DP-07 Executive-Grade UX: the experience should be calm, structured, board-ready, and suitable for senior risk and technology leaders.
- DP-08 Executive Messaging: primary views should answer what matters, why it matters, what is exposed, and what needs a decision.

Priority order:

```text
Compliance -> Governance -> Risk
```

## Full Navigation Hierarchy

```text
AI Governance Command Center
  Executive
    Executive Overview
    Board Report
    Portfolio Health
    Material Gaps
    Decisions Required

  Portfolio
    AI Systems
    Risk Heatmap
    Regulatory Coverage
    Control Health
    Evidence Health
    Findings
    Exceptions

  Governance
    Governance Framework
    AI Governance
    Agentic Governance
    AI Lifecycle
    AI Risk
    Governance Engineering
    Controls
    Monitoring

  Governance Framework
    Governance Philosophy
    Regulatory Scope
    AI Risk Model
    Human Oversight
    Delegated Authority
    Evidence Governance
    Continuous Monitoring

  Auditor Workspace
    Traceability
    Evidence Library
    Control Testing
    Findings
    Exceptions
    Audit Packages

  Governance Committee
    Committee Dashboard
    Approval Queue
    Production Readiness
    Risk Acceptances
    Authority Changes
    Lifecycle Decisions

  Administration
    Onboarding
    System Intake
    Owner Management
    Framework Configuration
    Control Library Management
    Evidence Type Management
```

## AI System Workspace

Portfolio contains AI Systems. Each AI system should open into a unified workspace instead of sending users across disconnected feature pages.

```text
AI System Workspace
  Overview
  Risk
  Regulations
  Controls
  Evidence
  Monitoring
  Lifecycle
  AI Governance
  Agentic Governance
  Governance Engineering
  Audit Trail
```

### Overview

Purpose: answer what the system is, who owns it, where it operates, how risky it is, and what needs attention.

Primary content:

- Business purpose
- Lifecycle stage
- Risk tier
- Jurisdictions
- Accountable owners
- Executive sponsor
- Open findings
- Evidence posture
- Control health
- Current decisions or blockers

### Risk

Purpose: show the formal AI risk register and inherent/residual risk posture.

Primary content:

- Risk register
- Risk categories
- Inherent vs residual ratings
- Treatment plans
- Risk acceptances
- Linked controls
- Linked evidence
- Linked findings

### Regulations

Purpose: show how regulatory expectations apply to the system.

Primary content:

- Applicable jurisdictions
- Regulations
- Requirements
- Regulatory controls
- Coverage gaps
- Evidence expectations

### Controls

Purpose: show control design and operating status.

Primary content:

- System controls
- Control owners
- Audit status
- Testing frequency
- Linked regulations
- Linked evidence
- Linked monitoring tests

### Evidence

Purpose: make proof discoverable from the system context.

Primary content:

- Evidence objects
- Evidence requirements
- Evidence health
- Review dates
- Expiration dates
- Owners
- Linked controls
- Linked regulations
- Linked risks
- Linked implementations

### Monitoring

Purpose: show continuous assurance.

Primary content:

- Control tests
- Test runs
- Pass/warning/fail status
- Findings
- Exceptions
- Monitoring explanations

### Lifecycle

Purpose: show stage-gate governance from intake through retirement.

Primary content:

- Lifecycle history
- Stage owner
- Stage entry/exit dates
- Gate approvals
- Gate controls
- Lifecycle findings
- Lifecycle evidence

### AI Governance

Purpose: show AI-specific governance assets.

Primary content:

- Models
- Prompts
- Agents
- Tool permissions
- Delegated authority
- Human oversight
- AI risk domains

### Agentic Governance

Purpose: show authority, tools, actions, approvals, and logs for agentic systems.

Primary content:

- Agentic level
- Permitted actions
- Governed tools
- Approval workflows
- Execution logs
- Kill switch
- Agentic risk domains

### Governance Engineering

Purpose: connect governance controls to technical implementation.

Primary content:

```text
Control -> Implementation -> Evidence -> Monitoring -> Status
```

Primary records:

- Control implementations
- Implementation type
- Implementation location
- Validation method
- Implementation evidence
- Governance engineering findings

### Audit Trail

Purpose: show system history and accountability.

Primary content:

- Registration events
- Risk classification changes
- Approval events
- Evidence review events
- Control exceptions
- Monitoring events

## Portfolio Design

The portfolio is the core object and should become the primary working surface for most users.

### Portfolio Summary

Primary questions:

- How many AI systems are in the portfolio?
- Which systems create the highest regulatory, governance, and risk exposure?
- Which systems are blocked?
- Which systems need executive or committee decisions?
- Which evidence gaps threaten audit readiness?

### Portfolio Views

Recommended views:

- By lifecycle stage
- By risk tier
- By jurisdiction
- By business owner
- By control health
- By evidence health
- By open findings
- By agentic authority level
- By production readiness

### Portfolio Object Model

```text
Portfolio
  -> AI Systems
  -> Regulations
  -> Controls
  -> Evidence
  -> Findings
  -> Exceptions
  -> Risks
  -> Lifecycle Gates
  -> Implementations
```

## User Journeys

### Executive Journey

Goal: understand portfolio health and decisions required.

Path:

```text
Executive -> Portfolio Health -> Material Gaps -> System Workspace -> Decision / Follow-up
```

Key questions:

- What is the state of the AI portfolio?
- What requires executive attention?
- Which systems are high risk or production blocked?
- Which regulatory gaps or evidence gaps matter most?
- Which risk acceptances are expiring?

### Compliance Journey

Goal: verify regulatory coverage and evidence posture.

Path:

```text
Portfolio -> Regulatory Coverage -> Regulation Detail -> AI System Workspace -> Evidence
```

Key questions:

- Which regulations apply?
- Which requirements are mapped?
- Which controls support those requirements?
- Which evidence proves the controls operate?
- Where are the gaps?

### Governance Committee Journey

Goal: make stage-gate, authority, risk, and production decisions.

Path:

```text
Governance Committee -> Approval Queue -> AI System Workspace -> Lifecycle / Risk / Authority -> Decision
```

Key questions:

- Is this system ready for pilot or production?
- Are residual risks accepted?
- Are controls implemented and evidenced?
- Is delegated authority appropriate?
- Are agentic controls complete?

### Internal Audit Journey

Goal: test traceability and audit readiness.

Path:

```text
Auditor Workspace -> Traceability -> Control -> Evidence -> Finding / Exception
```

Key questions:

- Can every governance claim be traced to evidence?
- Are controls mapped to regulations and systems?
- Are evidence objects current and valid?
- Are findings remediated or accepted?
- Are exceptions approved and unexpired?

### IT Risk Journey

Goal: manage control health, findings, exceptions, and risk posture.

Path:

```text
Portfolio -> Risk Heatmap / Control Health -> AI System Workspace -> Risk / Monitoring / Controls
```

Key questions:

- Which controls are failing?
- Which findings are open?
- Which systems are overdue for review?
- Which residual risks remain high?
- Which exceptions are nearing expiration?

### Engineering Journey

Goal: prove technical implementation of governance requirements.

Path:

```text
Governance -> Governance Engineering -> AI System Workspace -> Implementation Evidence
```

Key questions:

- What implements this control?
- Where is the implementation located?
- What evidence proves it exists?
- How is it monitored?
- What is the validation status?

## Persona Mappings

| Persona | Primary Lens | Primary Areas | Success Outcome |
| --- | --- | --- | --- |
| CIO / CRO Leadership | Executive | Executive, Portfolio, Board Report | Understand material AI governance exposure and decisions required. |
| AI Governance Committee | Governance | Governance Committee, Lifecycle, AI Governance, Agentic Governance, AI Risk | Approve or block systems based on evidence-backed readiness. |
| Compliance | Governance / Portfolio | Regulatory Coverage, Regulations, Traceability, Evidence | Demonstrate obligation-to-control-to-evidence coverage. |
| Internal Audit | Auditor | Auditor Workspace, Traceability, Evidence, Findings, Exceptions | Test audit readiness and evidence quality. |
| IT Risk | Portfolio / Governance | Control Health, Findings, Exceptions, Risk Heatmap, Monitoring | Manage risk and control outcomes across the portfolio. |
| Engineering / Technology Owner | Governance | Governance Engineering, Controls, Monitoring, Evidence | Show how controls are implemented in systems and runtime. |
| Business Owner | Portfolio | System Overview, Risk, Lifecycle, Evidence | Understand accountability, approvals, and operating obligations. |
| Regulator | Auditor / Executive | Traceability, Evidence, Regulatory Coverage, Executive Summary | Follow explainable governance from expectation to proof. |

## Target Navigation Model

Use primary navigation for major lenses and secondary navigation for workspace tabs.

Primary navigation:

```text
Executive
Portfolio
Governance
Auditor Workspace
Governance Committee
Administration
```

Governance secondary navigation:

```text
Framework
AI Governance
Agentic Governance
Lifecycle
AI Risk
Governance Engineering
Controls
Monitoring
```

AI System workspace secondary navigation:

```text
Overview
Risk
Regulations
Controls
Evidence
Monitoring
Lifecycle
AI Governance
Agentic Governance
Governance Engineering
Audit Trail
```

