# AI Risk Governance Architecture

Current release: v0.6.0
Documentation baseline: v0.6.1

## Platform Architecture

AI Risk Governance is a TypeScript monorepo with a Next.js web application, Node/TypeScript API surface, SQLite database, Prisma ORM, Tailwind CSS, a shared risk engine, and a monitoring engine.

```text
apps/
  web/                    Governance user experience
  api/                    API service
packages/
  db/                     Prisma schema, migrations, seed data
  risk-engine/            Multi-dimensional AI risk classification
  monitoring-engine/      Continuous control tests and findings
```

The platform is organized around a governance system of record:

- AI systems are the central governed entities.
- Regulatory obligations are decomposed into requirements and controls.
- Controls require evidence and are tested through monitoring.
- Findings and exceptions represent control outcomes.
- Executive, auditor, regulatory, and governance committee views consume the same underlying records.

## Governance Flow

The core governance flow is:

```text
AI System
  -> Risk Assessment
  -> Regulatory Applicability
  -> Requirements
  -> Controls
  -> Evidence Requirements
  -> Evidence Objects
  -> Monitoring Tests
  -> Findings / Exceptions
  -> Executive and Auditor Reporting
```

This flow intentionally mirrors traditional governance. The platform then extends it with AI-specific objects:

```text
Model
Prompt
Agent
Tool Permission
Delegated Authority
Human Oversight
AI Risk Domain
Agent Action
```

These records make it possible to ask not only whether a system is governed, but whether the model, prompt, agent, tool, authority, and oversight design are governed.

## Regulatory Mapping Architecture

The regulatory mapping architecture connects jurisdictional expectations to operational controls and evidence.

```text
Regulation
  -> Requirement
  -> Regulatory Control
  -> Evidence Requirement
  -> Evidence Object
  -> AI System
```

Supported regulatory scope includes OSFI, OCC/Fed/FDIC-style US banking expectations, FCA operational resilience and consumer-outcome expectations, EU AI Act obligations, Japan FSA expectations, NIST AI RMF, GLBA, FFIEC, and third-party risk expectations.

Key architecture patterns:

- Regulations define the supervisory or standards context.
- Requirements translate regulatory text into governance obligations.
- Controls define testable procedures and ownership.
- Evidence requirements define what auditors and regulators expect to see.
- System mappings connect obligations to the AI systems that create or inherit the risk.
- Coverage views show gaps, mapped controls, evidence health, and audit readiness.

## Monitoring Architecture

The monitoring engine evaluates governance conditions against AI system records, controls, evidence, findings, and exceptions.

```text
Control Test Definition
  -> Test Execution
  -> Test Run Result
  -> Pass / Warning / Fail
  -> Finding Generation
  -> Exception Handling
  -> Dashboard Reporting
```

Monitoring currently supports checks for inventory completeness, ownership, review currency, evidence posture, AI governance completeness, and agentic governance completeness.

Monitoring outputs are used by:

- Control health dashboard
- Findings dashboard
- Exceptions dashboard
- Risk heatmap
- AI-system monitoring detail pages
- Executive and governance committee views
- Auditor workspace

The monitoring architecture is designed to preserve both the control outcome and the educational interpretation. Each test can explain the traditional governance concept, the AI governance interpretation, and why the control matters.

## Evidence Architecture

Evidence is a first-class governance object rather than an attachment afterthought.

```text
Evidence Requirement
  -> Evidence Object
  -> Owner
  -> Status
  -> Due Date
  -> Review / Validation
  -> Expiration
  -> Linked Controls
  -> Linked Regulations
  -> Linked AI Systems
```

Evidence architecture goals:

- Show whether required evidence exists.
- Identify who owns the evidence.
- Track review and validation status.
- Detect stale, missing, incomplete, or expired evidence.
- Link evidence to controls, regulatory requirements, and AI systems.
- Support auditor and regulator traceability from claim to proof.

## AI Governance Architecture

AI governance extends the traditional control model with AI-specific assets and risk domains.

```text
AI System
  -> AI Models
  -> Prompt Assets and Versions
  -> Agents
  -> Delegated Authority
  -> Tool Permissions
  -> Human Oversight
  -> AI Risk Domain Assessment
```

The architecture supports governance over:

- Model validation status, limitations, ownership, and lifecycle.
- Prompt ownership, approval status, version history, and guardrails.
- Agent purpose, owner, lifecycle, and agentic level.
- Tool permissions for read, write, execute, administrative, or denied capabilities.
- Delegated authority levels that define what the AI system can and cannot do.
- Human oversight procedures, escalation paths, review points, and accountable roles.
- AI risk domains such as hallucination, prompt injection, drift, tool misuse, autonomy, explainability, and operational resilience.

## Agentic Governance Architecture

Agentic governance focuses on AI systems that can use tools, draft actions, request approvals, or execute actions.

```text
Agent
  -> Delegated Authority Level
  -> Permitted Actions
  -> Governed Tools
  -> Approval Requirements
  -> Execution Logs
  -> Human Oversight
  -> Kill Switch / Suspension
  -> Findings and Exceptions
```

Agentic architecture principles:

- Autonomy must be explicit and bounded.
- Authority must be tied to permitted action types, not generic system access.
- Tool permissions must distinguish reading data from writing records or executing transactions.
- Higher-impact actions require approval, escalation, or prohibition.
- Execution logs must show who or what acted, what tool was used, what happened, when it happened, and whether approval was required.
- Human oversight must be designed before production use, not added only after incidents.

## Reporting Architecture

Reporting views are layered for different audiences while using the same governance records.

- IT Risk sees systems, controls, findings, exceptions, risk tiers, and monitoring posture.
- Internal Audit sees traceability, control status, evidence, and audit readiness.
- Compliance sees regulatory coverage, jurisdiction mappings, and gaps.
- AI Governance Committees see approval posture, AI risk domains, authority, oversight, and escalation.
- CIO/CRO leadership sees portfolio health, material gaps, trends, and board-ready summaries.
- Regulators see explainable mappings from supervisory expectations to controls, evidence, and accountable owners.
