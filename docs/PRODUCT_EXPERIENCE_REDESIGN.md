# Product Experience Redesign

Status: Product experience design only.

This document does not implement UI, change routes, redesign individual pages, or create components. It redesigns the target product experience from first principles using the current platform capabilities as available building blocks.

## Executive Summary

The platform has strong AI governance capabilities but currently asks users to understand the system before they can use it. The redesigned experience should invert that relationship: users should enter through a question, complete a workflow, and learn the governance model progressively.

The product should become three things at once:

1. A governance operating system for daily work.
2. An assurance system for auditors and executives.
3. A learning system that teaches AI governance through real evidence.

The recommended experience is not a larger navigation tree. It is a set of persona-centered workspaces, each organized around a few durable jobs:

- What should I care about?
- What requires my attention?
- Prove this control.
- Is this AI system healthy?
- What did we forget?
- Can we defend this to audit or regulators?

## Research Reference Patterns

The reference products suggest patterns, not templates to copy.

AuditBoard emphasizes connected risk and purpose-built stakeholder workflows. Useful pattern: stakeholder input should be accelerated through clear task ownership and risk/control/evidence relationships.

Archer emphasizes integrated risk management, decision support, and lineage from regulation to control to evidence. Useful pattern: governance objects need lineage and accountability, not just dashboards.

ServiceNow GRC / IRM emphasizes unified risk data, workflow automation, visibility, and remediation. Useful pattern: issues should move through operational workflow states.

Workiva emphasizes connected data, traceability, collaboration, auditability, and defensible reporting. Useful pattern: evidence and reporting should share one trusted data foundation.

Atlassian emphasizes work organized around shared plans, issues, and team alignment. Useful pattern: complex work becomes usable when it has ownership, status, priority, and next action.

Linear emphasizes speed, focus, low-noise issue queues, and opinionated workflows. Useful pattern: users should see the work that matters now, not every possible object.

Datadog emphasizes health, monitoring, incident response, and workflows from signal to action. Useful pattern: observability only becomes useful when it leads to triage, diagnosis, and remediation.

## Core Product Thesis

AI governance is not a dashboard category. It is an operating model.

The product experience should teach and operate this model:

AI System -> Assets -> Evidence Sources -> Evidence Artifacts -> Assurance -> Controls -> Risks -> Decisions

Every screen should support at least one of these outcomes:

- Decide.
- Review.
- Prove.
- Remediate.
- Monitor.
- Learn.

If a screen only displays state and does not help a user act, it should be redesigned.

## Major Usability Problems

1. The product currently exposes too much of the object graph too early.
2. Technical evidence concepts appear before users understand why they matter.
3. Workflows often start clearly but end in broad dashboards.
4. Findings, evidence gaps, source issues, and failed validations are related but feel like separate worlds.
5. Educational content is valuable but competes with operational work.
6. Executives see operational noise mixed with material decisions.
7. Auditors can find proof, but the path is not guided enough.
8. Control owners see issues but not always the exact action, due date, or resolution path.
9. System owners must synthesize health from many tabs.
10. Demo narratives require a presenter to explain the product instead of the product explaining itself.

## Major Design Principles

### 1. Start With The User Question

Navigation should be organized around jobs, not data categories.

Examples:

- Executive: What should I care about?
- Auditor: Prove this control.
- Control Owner: What requires my attention today?
- System Owner: Is my AI system healthy?
- Governance Analyst: Where are the governance issues?

### 2. Separate Signal From Inventory

A user should see the work that matters before seeing all objects.

Action queues, decisions, health summaries, and exceptions come before full catalogs.

### 3. Make Every Object Actionable

Findings, controls, evidence, assets, systems, risks, and exceptions should each answer:

- Why does this exist?
- Who owns it?
- What evidence supports it?
- What is the impact?
- What action is available?
- What happens next?

### 4. Preserve Lineage Everywhere

Users should never lose the chain:

Regulation -> Control -> Evidence Requirement -> Source -> Artifact -> Assurance -> Finding -> Decision

### 5. Teach In Layers

Education should not be removed. It should be layered so users can operate first, understand second, and learn deeply third.

### 6. Design For Demos And Daily Work

The product must work in two modes:

- Demo mode: a crisp story in 5 to 10 minutes.
- Operating mode: repeatable work queues and evidence review.

### 7. Fewer Places, Stronger Workflows

The ideal experience should have fewer primary destinations than the current route inventory. Depth should live inside object workspaces and guided workflows.

## Ideal Workspace Model

### 1. Executive Command Center

Purpose: executive awareness and decisions.

Primary question: What should I care about?

Primary users: CIO, CRO, Risk Committee, executives.

Core surfaces:

- Material decisions.
- Material risks.
- Material exceptions.
- Portfolio assurance score.
- Systems outside appetite.
- Audit readiness.
- Board report.

Design rule: executives should not see operational noise unless it has material impact.

Output:

- Decision record.
- Risk acceptance.
- Escalation.
- Board-ready report.

### 2. Governance Operations Center

Purpose: daily governance work.

Primary question: What needs governance attention?

Primary users: governance team, control owners, compliance, risk.

Core surfaces:

- Control Owner Queue.
- Findings queue.
- Evidence gap queue.
- Review queue.
- Exceptions and risk acceptances.
- Governance calendar.
- Discovery gaps.

Design rule: this is the operational cockpit. It should feel closer to Linear, Jira, or ServiceNow work queues than a dashboard wall.

Output:

- Remediated finding.
- Requested evidence.
- Reviewed exception.
- Assigned owner.
- Committee escalation.

### 3. Evidence & Assurance Center

Purpose: proof.

Primary question: Can we prove it?

Primary users: auditors, evidence owners, governance operators.

Core surfaces:

- Evidence repository.
- Evidence source registry.
- Artifact verification.
- Assurance explanations.
- Traceability.
- Audit packages.
- Evidence health.

Design rule: every evidence object must lead to source, artifact, assurance, traceability, and package readiness.

Output:

- Verified artifact.
- Evidence package.
- Assurance result.
- Traceability chain.

### 4. Auditor Workspace

Purpose: audit execution.

Primary question: Prove this control.

Primary users: internal audit, external audit, regulators, assurance teams.

Core surfaces:

- Audit scope.
- Prove a control.
- Evidence review.
- Artifact verification.
- Exceptions review.
- Audit package builder.

Design rule: auditors should not browse the platform. They should follow proof paths.

Output:

- Control proof.
- Evidence exception.
- Audit package.
- Regulator-ready artifact set.

### 5. AI System Workspace

Purpose: governed system operation.

Primary question: Is this AI system healthy?

Primary users: system owner, business owner, risk owner, governance reviewer.

Core surfaces:

- System health summary.
- System action required.
- Controls.
- Evidence.
- Monitoring.
- Risk.
- Lifecycle.
- AI governance.
- Agentic governance.
- Audit trail.

Design rule: system owners should see health, blockers, and next actions before they see object tabs.

Output:

- System review.
- Evidence refresh.
- Risk treatment.
- Control remediation.
- Governance approval.

### 6. Discovery & Onboarding Studio

Purpose: find and onboard governed AI systems and forgotten assets.

Primary question: What did we forget?

Primary users: governance analysts, platform owners, system owners.

Core surfaces:

- New AI system intake.
- Manifest review.
- Asset discovery findings.
- Unknown integrations.
- Evidence source setup.
- Connector readiness.

Design rule: discovery should be framed as governance completeness, not technical scanning.

Output:

- Updated inventory.
- Accepted or rejected discovery finding.
- Onboarding package.
- Evidence source request.

### 7. Administration & Standards

Purpose: configure the operating model.

Primary question: How is governance defined?

Primary users: platform administrators, governance leads.

Core surfaces:

- Standards library.
- Control library.
- Regulatory library.
- Role and ownership model.
- Connector configuration.
- Platform review.

Design rule: administration should not be a dumping ground for daily work.

Output:

- Updated standard.
- Updated control library.
- Configured source.
- Platform review package.

## Recommended Final Navigation

If starting today with all functionality available, build this navigation:

1. Command Center
2. Governance Work
3. AI Systems
4. Evidence & Assurance
5. Auditor Workspace
6. Discovery & Onboarding
7. Standards & Administration

### Why This Differs From The Current Navigation

Executive and Portfolio should merge into Command Center because executives and portfolio managers both need summarized posture, material risk, and cross-system comparison. The distinction can exist inside the workspace.

Governance should become Governance Work because the value is not the noun "governance"; it is the operational queue of findings, controls, reviews, exceptions, and evidence gaps.

Evidence & Assurance remains because proof is a core product promise.

Auditor Workspace remains because audit execution is a distinct persona journey.

AI Systems remains because AI systems are the governed object.

Discovery & Onboarding should become a first-class experience because "what did we forget?" is a core differentiator.

Administration should be renamed Standards & Administration to clarify that it owns configuration and libraries, not daily work.

## Persona Journeys

### Executive

Goal: What should I care about?

Starting point: Command Center.

Workflow:

1. Review material posture.
2. Review systems outside risk appetite.
3. Review material findings and exceptions.
4. Review decisions required.
5. Open board report or drill into proof only when needed.

Decisions:

- Accept risk?
- Escalate?
- Approve exception?
- Ask for audit proof?
- Defer pending remediation?

Outputs:

- Board-ready report.
- Decision record.
- Escalation.
- Risk acceptance or rejection.

Frustrations to eliminate:

- Operational noise.
- Control jargon without business impact.
- Evidence mechanics before executive relevance.

Success criteria:

- Executive understands posture in under 60 seconds.
- Executive sees no more than 3 to 5 material decisions.
- Every item explains business impact.

### Auditor

Goal: Prove this control.

Starting point: Auditor Workspace.

Workflow:

1. Confirm audit scope.
2. Select control.
3. Review required evidence.
4. Review available evidence.
5. Identify missing evidence.
6. Verify artifact provenance.
7. Review assurance result.
8. Follow traceability.
9. Add to audit package.

Decisions:

- Is evidence sufficient?
- Is evidence current?
- Is artifact provenance defensible?
- Is an exception required?
- Is the control package ready?

Outputs:

- Control proof.
- Evidence exception.
- Audit package.
- Verification notes.

Frustrations to eliminate:

- Being dropped into a full control catalog.
- Traceability pages that are finding-led when the task is control-led.
- Evidence references without direct artifact access.

Success criteria:

- Auditor can prove a known control in 3 to 5 clicks.
- Every proof path includes source, artifact, assurance, and traceability.
- Package readiness is explicit.

### Control Owner

Goal: What requires my attention today?

Starting point: Governance Work.

Workflow:

1. Open My Queue.
2. Sort by severity, due date, and control.
3. Review issue impact.
4. Open exact evidence/finding/test.
5. Remediate, request evidence, accept risk, or escalate.
6. Track status to closure.

Decisions:

- Can I fix this?
- Do I need evidence from another owner?
- Is risk acceptance appropriate?
- Is this overdue?

Outputs:

- Remediation update.
- Evidence request.
- Exception request.
- Closed finding.

Frustrations to eliminate:

- Generic "Open" links.
- Broad dashboards.
- No due date.
- No recommended action.

Success criteria:

- Control owner can identify today's work immediately.
- Each queue item has owner, due date, severity, action, and next step.
- No item lands on a broad dashboard.

### System Owner

Goal: Understand the health of my AI system.

Starting point: AI Systems -> AI System Workspace.

Workflow:

1. Open system.
2. Review health summary.
3. Review action required.
4. Check blockers to governance and audit.
5. Review controls, evidence, monitoring, risk, and lifecycle.
6. Complete review or assign remediation.

Decisions:

- Is the system inside risk appetite?
- Is audit blocked?
- Is evidence stale or missing?
- Is lifecycle status accurate?
- Are agentic controls sufficient?

Outputs:

- System review.
- Evidence refresh.
- Remediation assignment.
- Lifecycle decision.

Frustrations to eliminate:

- Synthesizing posture from many tabs.
- No "what changed" summary.
- No clear owner-specific action queue.

Success criteria:

- System owner understands system health in under 90 seconds.
- Blocking governance and audit issues are explicit.
- Each issue has an action and exact target.

### Governance Analyst

Goal: Understand governance posture and identify issues.

Starting point: Governance Work.

Workflow:

1. Review governance posture.
2. Triage findings and evidence gaps.
3. Review discovery gaps.
4. Inspect control health.
5. Escalate material issues.
6. Prepare committee packet or remediation plan.

Decisions:

- What is systemic vs isolated?
- Which issues affect regulatory coverage?
- Which systems need owner review?
- Which items need committee escalation?

Outputs:

- Remediation plan.
- Committee packet.
- Updated inventory.
- Governance posture report.

Frustrations to eliminate:

- Duplicated operational pages.
- Unclear ownership between governance, evidence, and monitoring.
- No roll-up from findings to governance themes.

Success criteria:

- Analyst can identify top governance issues in one workspace.
- Findings, evidence gaps, source issues, and discovery findings are part of one work model.
- Escalation path is clear.

## Experience Map

| Stage | User Question | Product Response | Output |
| --- | --- | --- | --- |
| Orient | Where do I start? | Persona workspace and role-specific entry point | User knows first action |
| Triage | What matters now? | Prioritized work queue and materiality summary | User selects action |
| Investigate | Why does this exist? | Object page with reason, evidence, impact, owner | User understands issue |
| Prove | Can we defend this? | Evidence chain, artifact, assurance, traceability | Proof path |
| Act | What should I do? | Remediate, request evidence, review exception, accept risk | Workflow movement |
| Report | What do I show others? | Audit package, board report, committee packet | Shareable artifact |
| Learn | What does this mean? | Contextual guidance and deep learning | User builds governance fluency |

## Learning Experience

The platform should remain educational, but education should be layered.

### Layer 1: Operational Experience

Purpose: let users do the work.

Content style:

- Short labels.
- Action verbs.
- Status, owner, due date.
- Next step.

Examples:

- Review Finding.
- Verify Artifact.
- Request Evidence.
- Accept Risk.
- Add to Audit Package.

### Layer 2: Contextual Guidance

Purpose: explain the current workflow without interrupting it.

Content style:

- "Why you are here."
- "What this proves."
- "What fails if this is missing."
- "What to do next."

Examples:

- A control page explains why the control matters and what evidence proves it.
- A finding explains impact, evidence used, owner, and recommended action.

### Layer 3: Deep Learning

Purpose: teach AI governance concepts.

Content style:

- Expandable explainers.
- Field guides.
- Governance lessons.
- "Traditional governance -> AI governance -> agentic AI governance."

Examples:

- What is an AI system?
- Why metadata is not evidence.
- Why assurance is not the same as evidence.
- How agentic authority changes control design.

## Demo Experience

### Executive Demo: 5 Minutes

Narrative: "Here is your AI governance posture and the decisions you need to make."

Flow:

1. Open Command Center.
2. Show portfolio posture.
3. Show one material risk.
4. Show one material exception.
5. Open Board Report.

Prospect takeaway:

The platform turns AI governance into executive decision support.

### Auditor Demo: 5 Minutes

Narrative: "Pick a control and prove it."

Flow:

1. Open Auditor Workspace.
2. Select AI-GOV-003.
3. Review required evidence.
4. Open evidence artifact.
5. Verify snapshot, hash, source, assurance, and drift.
6. Add to audit package.

Prospect takeaway:

The platform turns governance claims into defensible proof.

### Governance Demo: 5 Minutes

Narrative: "Here is what requires governance attention today."

Flow:

1. Open Governance Work.
2. Review Control Owner Queue.
3. Open a finding.
4. Show evidence used and recommended action.
5. Escalate to committee or remediation.

Prospect takeaway:

The platform turns governance into daily work, not periodic documentation.

### Travel Brain Demo: 5 Minutes

Narrative: "An AI system is larger than a repository."

Flow:

1. Open Travel Brain AI System Workspace.
2. Show system health summary.
3. Show assets and evidence sources.
4. Open Supabase, MCP, Secrets, and GitHub evidence.
5. Show discovery finding for an undeclared asset.

Prospect takeaway:

The platform discovers and governs the real AI system, including assets humans forget.

### Prospect Demo: 10 Minutes

Narrative: "This is how AI governance operates from executive decision to audit proof."

Flow:

1. Command Center: material posture.
2. Governance Work: action queue.
3. AI System Workspace: Travel Brain health.
4. Evidence & Assurance: artifact proof.
5. Auditor Workspace: prove a control.
6. Discovery & Onboarding: forgotten assets.

Prospect takeaway:

The platform teaches, demonstrates, and operates AI governance end to end.

## Object Model Experience

The product should make objects feel consistent.

Every primary object should have:

- Summary.
- Why it matters.
- Owner.
- Status.
- Evidence.
- Traceability.
- Action required.
- History.

Primary objects:

- AI System.
- Control.
- Evidence.
- Evidence Source.
- Evidence Artifact.
- Finding.
- Exception.
- Risk.
- Asset.
- Connector.
- Audit Package.
- Decision.

## Recommended Redesign

If starting today with all existing functionality available, build this product experience:

### Home Experience

The first screen should ask, "What are you here to do?"

Persona entry cards:

- Executive: Review AI governance posture.
- Auditor: Prove a control.
- Control Owner: Work my queue.
- System Owner: Review my AI system.
- Governance Analyst: Triage governance issues.
- Platform Owner: Review discovery and sources.

After role selection, the product should remember the user's default workspace.

### Command Center

Merge executive and portfolio experience into a leadership command center.

Show:

- Material decisions.
- Portfolio posture.
- Systems outside appetite.
- Audit readiness.
- Material exceptions.
- Board report.

### Governance Work

Create a single operational queue for:

- Findings.
- Evidence gaps.
- Source issues.
- Failed validations.
- Discovery findings.
- Review tasks.
- Exceptions.
- Risk acceptances.

Use one action model:

Open -> In Review -> Waiting on Evidence -> Remediation Planned -> Accepted Risk -> Resolved -> Closed

### AI System Workspace

Make the system overview the main object page.

Top sections:

- Health summary.
- Action required.
- What changed.
- Blocking governance.
- Blocking audit.
- Evidence readiness.

Tabs should support deeper inspection, not initial understanding.

### Evidence & Assurance

Reframe as the proof layer.

Top workflows:

- Find evidence.
- Verify artifact.
- Review assurance.
- Trace control.
- Build package.

Every evidence object should lead to source, artifact, assurance, traceability, and package readiness.

### Auditor Workspace

Design around one primary flow:

Scope -> Select Control -> Required Evidence -> Available Evidence -> Missing Evidence -> Assurance -> Traceability -> Package

Auditors should not start in dashboards.

### Discovery & Onboarding

Make "What did we forget?" a flagship experience.

Top workflows:

- Review new discovery findings.
- Compare declared vs discovered assets.
- Accept asset into inventory.
- Reject unsupported inference.
- Request evidence source.
- Update onboarding package.

### Standards & Administration

Keep standards separate from daily work.

Own:

- Control library.
- Regulatory library.
- Manifest standard.
- Role model.
- Connector configuration.
- Platform review.

## Final Recommendation

If starting today with all existing functionality available, I would build a role-first AI Governance Operating System with seven primary destinations:

1. Command Center
2. Governance Work
3. AI Systems
4. Evidence & Assurance
5. Auditor Workspace
6. Discovery & Onboarding
7. Standards & Administration

The product should not lead with dashboards. It should lead with work.

The strongest differentiator is not that the platform stores AI governance data. It is that it can connect real AI system assets to evidence, assurance, controls, risks, findings, and decisions while teaching users why each step matters.

The target experience should feel like:

- AuditBoard for stakeholder-friendly GRC workflow.
- Archer for lineage and risk/control/evidence relationships.
- ServiceNow for operational queues and remediation workflow.
- Workiva for auditability and connected reporting.
- Linear for focused action queues.
- Datadog for signal-to-action operational clarity.

But the product should ultimately become its own category:

AI Governance Operations.

## Sources Reviewed

- AuditBoard connected risk and compliance materials: https://auditboard.com/solutions/compliance
- Archer integrated risk management and lineage positioning: https://www.archerirm.com/
- ServiceNow Governance, Risk, and Compliance overview: https://www.servicenow.com/products/governance-risk-and-compliance.html
- Workiva platform overview: https://www.workiva.com/platform
- Atlassian product and roadmap workflow references: https://www.atlassian.com/software/jira/product-discovery
- Linear product workflow positioning: https://linear.app/
- Datadog incident response and dashboard workflow references: https://www.datadoghq.com/product/incident-response/ and https://docs.datadoghq.com/dashboards/
