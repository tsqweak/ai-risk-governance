# Feature Registry

Purpose: Track what actually exists in the AI-Risk-Governance platform.

The roadmap tracks phases. The backlog tracks future work. The Feature Registry tracks implemented capabilities, their maturity, dependencies, and remaining gaps.

## Summary

Feature counts by status:

- Complete: 10
- Operational: 2
- MVP: 15
- Partial: 1
- Planned: 5
- Deprecated: 0

Completed features:

- AI System Registry
- Regulatory Mapping
- Monitoring Engine
- Findings
- Evidence Governance
- AI Governance
- Agentic Governance
- Lifecycle Governance
- AI Risk Framework
- Governance Engineering

Operational features:

- GitHub Connector
- Logs Connector

Partial features:

- Portainer Connector

Planned features:

- Supabase Connector
- MCP Connector
- Notion Governance Connector
- Secrets Metadata Connector
- UX Refactor 2 - Full Site IA Redesign

Current platform maturity:

Level 3 - MVP, trending toward Level 4 - Operational.

The platform has a strong governed data model, seeded workflows, dashboards, traceability, evidence objects, AI governance, agentic governance, lifecycle governance, risk management, and governance engineering. GitHub evidence artifact collection and assurance are now operational against the real Travel Brain repository. Logs runtime evidence is operational for the Travel Brain reference scope with inspectable sanitized evidence artifacts. Portainer remains metadata-only, while Supabase, MCP, Notion, and Secrets connectors remain planned.

Recommended next feature:

Portainer Connector artifact collection, after Logs runtime evidence is validated with Travel Brain.

## Current Focus

Phase: Phase 9D

Feature: Portainer Connector

Target: Runtime deployment evidence

Objective: Move Portainer from metadata-only source registration to collected deployment and container runtime evidence artifacts.

Explanation examples:

- Container metadata to runtime evidence
- Deployment metadata to production approval support
- Runtime health to operational resilience assurance
- Deployment drift to control-owner review

Why this is current focus:

GitHub now proves design intent, and Logs now prove operational reality through metadata-only runtime evidence. Portainer is the next Tier 1 connector needed to prove deployed-state reality for Travel Brain.

## Next Focus

After Phase 9C, the connector sequence should be:

1. Portainer Artifact Collection

Purpose: Collect container metadata, deployment metadata, runtime metadata, and runtime evidence snapshots.

2. Supabase Connector

Purpose: Collect schema, RLS policy, data inventory, query log, and privacy-control evidence.

3. MCP Connector

Purpose: Collect tool inventory, permissions, execution activity, and delegated authority evidence.

4. Notion Governance Connector

Purpose: Collect governance decisions, approval records, review notes, and committee evidence.

5. Secrets Metadata Connector

Purpose: Collect secret inventory metadata, ownership, rotation, and access policy evidence without collecting secret values.

These should follow GitHub and Logs because GitHub establishes the design-artifact pattern, while Logs establishes the runtime-evidence pattern for operational reality.

UX Refactor 2 should follow completion of the major evidence domains. The platform should not redesign the full site around GitHub-only evidence; it should redesign around complete evidence workflows spanning GitHub, Logs, Portainer, Supabase, MCP, Notion, and Secrets.

## Dependency Guidance

Each feature includes a `Dependencies` field listing prerequisite features and prerequisite capabilities. Dependencies are intentionally practical: they identify what must exist for the feature to operate or mature, not every related concept in the platform.

## Status Definitions

- Planned: Defined but not implemented.
- Operational: Implemented with real operating data and traceable workflow behavior for the current reference scope.
- MVP: Implemented enough to demonstrate the intended operating model.
- Partial: Implemented in part, but important behavior is missing.
- Complete: Implemented for the current demo/product baseline.
- Deprecated: Superseded or no longer part of the active platform direction.

## Maturity Definitions

- Level 1 - Concept
- Level 2 - Prototype
- Level 3 - MVP
- Level 4 - Operational
- Level 5 - Production Ready

## Connector Roadmap

Phase 9 connector maturity is measured by whether each evidence domain supports collection, validation, assurance, and traceability. GitHub is the operating reference pattern, but Phase 9 is not complete until the major Travel Brain evidence domains reach the same governance loop.

### GitHub Connector

Purpose: Repository evidence and governance artifact assurance.

Evidence Types: `AI Governance.yaml`, prompt files, policy files, workflow files, commit SHA, file hash, source URL, artifact provenance, assurance rules.

Current Status: Operational against the real Travel Brain repository.

Target Maturity: Level 4 - Operational.

### Evidence Traceability

Purpose: Bidirectional navigation and reporting across controls, evidence, risks, findings, exceptions, and regulations.

Evidence Types: Control-to-evidence links, evidence-to-control links, regulation-to-requirement-to-control-to-evidence paths, evidence-to-risk/finding/exception paths.

Current Status: Operational.

Target Maturity: Level 4 - Operational.

### Logs Connector

Purpose: Execution evidence and monitoring assurance.

Evidence Types: Execution logs, monitoring results, control results, correlation IDs, runtime events, control-test output.

Current Status: MVP.

Target Maturity: Level 4 - Operational.

### Portainer Connector

Purpose: Runtime deployment evidence and container assurance.

Evidence Types: Container metadata, deployment metadata, runtime metadata, image provenance, service health, restart history, deployment drift.

Current Status: Planned.

Target Maturity: Level 4 - Operational.

### Supabase Connector

Purpose: Database, access, privacy, and data-control assurance.

Evidence Types: Schema metadata, RLS policies, data inventory, query/audit logs, access controls, retention evidence, privacy control evidence.

Current Status: Planned.

Target Maturity: Level 4 - Operational.

### MCP Connector

Purpose: Agentic tool governance, delegated authority, and execution assurance.

Evidence Types: MCP server inventory, tool registry, tool permissions, tool execution activity, delegated authority checks, denied-action evidence.

Current Status: Planned.

Target Maturity: Level 4 - Operational.

### Notion Governance Connector

Purpose: Human-governed evidence for decisions, approvals, reviews, and committee records.

Evidence Types: Governance decisions, approval records, review notes, committee decisions, exception approvals, production readiness notes.

Current Status: Planned.

Target Maturity: Level 4 - Operational.

### Secrets Metadata Connector

Purpose: Secrets governance without collecting or exposing secret values.

Evidence Types: Secret inventory metadata, owner, storage location, access policy, rotation records, last rotated date, plaintext prohibition evidence.

Current Status: Planned.

Target Maturity: Level 4 - Operational.

### Phase 9 Completion Criteria

Phase 9 is not complete until GitHub, Logs, Portainer, Supabase, MCP, Notion, and Secrets support:

- Collection
- Validation
- Assurance
- Traceability

## Features

### AI System Registry

Feature Name: AI System Registry

Phase: Phase 1

Status: Complete

Maturity: Level 4 - Operational

Description: Registry for governed AI systems with ownership, lifecycle, environment, risk tier, jurisdictions, components, controls, evidence, and audit-oriented context. Travel Brain, Legacy Branch Assistant, and Autonomous Payment Agent are seeded as reference systems.

Dependencies: Prisma data model, seeded AI systems, AI system workspace, risk assessment, controls, evidence, monitoring.

Future Work: Scale to real enterprise inventories, add richer owner validation, import from source systems, and support production-grade portfolio search and filtering.

### Regulatory Mapping

Feature Name: Regulatory Mapping

Phase: Phase 2

Status: Complete

Maturity: Level 4 - Operational

Description: Maps regulations to requirements, controls, evidence expectations, and AI systems across financial-services jurisdictions.

Dependencies: Regulation, requirement, regulatory control, AI system mapping, evidence requirements, traceability views.

Future Work: Add richer remediation workflows, versioned regulation libraries, and regulator-specific export packages.

### Monitoring Engine

Feature Name: Monitoring Engine

Phase: Phase 3A and Phase 3B

Status: Complete

Maturity: Level 4 - Operational

Description: Continuous control monitoring model with control tests, test runs, results, findings generation, control health dashboards, and system monitoring views.

Dependencies: Control tests, test runs, findings, exceptions, evidence health, monitoring-engine package.

Future Work: Add scheduled execution, warning-generating test cases, control test scheduling, and production monitoring integrations.

### Findings

Feature Name: Findings

Phase: Phase 3A

Status: Complete

Maturity: Level 4 - Operational

Description: Findings are generated from failed or blocked monitoring conditions and linked to AI systems, controls, tests, risks, and exceptions.

Dependencies: Monitoring engine, control tests, AI systems, exceptions, risk links.

Future Work: Add aging, SLA tracking, remediation workflows, and owner notifications.

### Exceptions

Feature Name: Exceptions

Phase: Phase 3A

Status: MVP

Maturity: Level 3 - MVP

Description: Exceptions represent accepted control gaps or approved deviations linked to findings and expiration dates.

Dependencies: Findings, controls, exception dashboard, seeded exception records.

Future Work: Add expiration monitoring, renewal workflow, compensating controls, and approval routing.

### Evidence Governance

Feature Name: Evidence Governance

Phase: Phase 4

Status: Complete

Maturity: Level 4 - Operational

Description: Evidence objects, evidence requirements, evidence health, validation status, expiration, traceability, and linked governance records.

Dependencies: Evidence objects, evidence requirements, evidence health, controls, regulations, risks, audit packages.

Future Work: Add automated source collection, provenance verification, freshness monitoring across real sources, and deeper auditor workpapers.

### Executive Dashboard

Feature Name: Executive Dashboard

Phase: Phase 5

Status: MVP

Maturity: Level 3 - MVP

Description: Executive command-center views for compliance posture, governance coverage, portfolio health, material gaps, board reporting, and decisions required.

Dependencies: AI systems, regulatory coverage, evidence health, findings, risk dashboards, executive routes.

Future Work: Add dynamic charts, historical trends, executive PDF export, and board-ready report packages.

### AI Governance

Feature Name: AI Governance

Phase: Phase 6A

Status: Complete

Maturity: Level 4 - Operational

Description: AI-specific governance model for models, prompts, prompt versions, agents, delegated authority, tool permissions, human oversight, and AI risk domains.

Dependencies: AI models, prompt assets, agents, authority records, tool permissions, human oversight records, AI governance controls.

Future Work: Add prompt change approval workflow, model validation detail page, authority change approval, and AI risk domain testing evidence.

### Agentic Governance

Feature Name: Agentic Governance

Phase: Phase 6B

Status: Complete

Maturity: Level 4 - Operational

Description: Agentic governance for governed tools, permitted actions, delegated authority, approval workflows, execution logs, kill switches, and agentic findings.

Dependencies: Agents, governed tools, agent actions, execution logs, kill switch records, delegated authority, agentic controls.

Future Work: Add live action review, tool permission review dates, agent lifecycle workflows, and richer runtime enforcement evidence.

### Lifecycle Governance

Feature Name: Lifecycle Governance

Phase: Phase 6C

Status: Complete

Maturity: Level 4 - Operational

Description: AI lifecycle governance across proposed, development, testing, pilot, production, and retired stages with stage gates, approvals, controls, and findings.

Dependencies: AI lifecycle records, lifecycle approvals, lifecycle controls, monitoring findings, AI system workspace.

Future Work: Add production-grade intake, stage-gate workflow routing, approval notifications, and retirement evidence packages.

### AI Risk Framework

Feature Name: AI Risk Framework

Phase: Phase 6D

Status: Complete

Maturity: Level 4 - Operational

Description: Formal AI risk register with categories, inherent risk, residual risk, treatment, acceptance, links to controls, evidence, findings, and AI systems.

Dependencies: AI risks, risk categories, AI systems, controls, evidence links, findings links.

Future Work: Add richer risk review cadence, risk acceptance expiration monitoring, and analytics across risk trends.

### Governance Engineering

Feature Name: Governance Engineering

Phase: Phase 6E

Status: Complete

Maturity: Level 4 - Operational

Description: Connects controls to technical implementations, implementation evidence, monitoring, and validation status.

Dependencies: ControlImplementation, ImplementationEvidence, controls, AI systems, findings, governance engineering dashboard.

Future Work: Add real repository/code references, implementation drift checks, runtime monitoring enforcement, and deeper control-to-code validation.

### Evidence & Assurance Hub

Feature Name: Evidence & Assurance Hub

Phase: UX Refactor 1

Status: MVP

Maturity: Level 3 - MVP

Description: Canonical proof-layer hub at `/evidence-assurance` that consolidates evidence repository, evidence health, artifacts, snapshots, drift, evidence sources, assurance, audit packages, and traceability into one secondary navigation experience. Existing detailed pages remain available as drill-downs, but Evidence & Assurance becomes the starting point for proof workflows.

Dependencies: Evidence Repository, Evidence Health, Governance Operations Dashboard, EvidenceArtifact model, EvidenceSnapshot model, AssuranceRule model, AssuranceExplanation model, Evidence Source Registry, Audit Packages, Control Evidence Traceability.

Consolidation Decisions: Governance Operations moved out of global sidebar and under Evidence & Assurance as a proof-operations detail view. Evidence Repository and Evidence Health were removed as separate global sidebar links and are now secondary Evidence & Assurance routes. Artifact, snapshot, drift, assurance, source, package, and traceability workflows are grouped under the same proof-layer navigation.

Future Work: Add active secondary-nav state, route redirects from legacy evidence surfaces, dedicated evidence object/package detail pages under the hub, shared reusable assurance explanation components, and role-specific auditor/control-owner queues inside Evidence & Assurance.

### UX Refactor 2 - Full Site IA Redesign

Feature Name: UX Refactor 2 - Full Site IA Redesign

Phase: Future Initiative

Status: Planned

Maturity: Level 1 - Concept

Priority: High

Description: Full-site information architecture redesign based on `docs/UX_ARCHITECTURE_REVIEW.md`. UX Refactor 2 will simplify navigation, remove duplication, consolidate workflows, reduce page sprawl, improve auditor, executive, control-owner, and system-owner workflows, implement hub-based architecture, and reduce global sidebar complexity.

Dependencies: Logs Connector, Portainer Connector, Supabase Connector, MCP Connector, Notion Connector, Secrets Connector.

Decision Rationale: UX Refactor 1 improved the proof layer with the Evidence & Assurance Hub, but the full site should not be redesigned around GitHub-only evidence. Complete major evidence domains first, then redesign around real workflows and real evidence across the governed AI system.

Future Work: Convert the UX architecture review into implementation phases, define canonical hubs, map legacy routes to retained or redirected destinations, create role-specific journey acceptance tests, and validate the redesigned navigation with Travel Brain once all major evidence domains are represented.

### Evidence Repository

Feature Name: Evidence Repository

Phase: Phase 7

Status: MVP

Maturity: Level 3 - MVP

Description: Enterprise evidence repository, evidence viewer, evidence health dashboard, traceability, downloads, and evidence package support.

Dependencies: Evidence objects, evidence health, audit packages, evidence download route, AI system workspace evidence tab.

Future Work: Add richer search and filtering, reviewer queue, real file storage, PDF export, and automated evidence source collection.

### Auditor Workspace

Feature Name: Auditor Workspace

Phase: Phase 5 and Phase 7

Status: MVP

Maturity: Level 3 - MVP

Description: Auditor-oriented workspace for traceability, evidence review, control testing, findings, exceptions, and audit packages.

Dependencies: Evidence repository, traceability, audit packages, controls, findings, exceptions, regulations.

Future Work: Add audit workpapers, sampling workflow, evidence review queue, audit package generation workflow, and audit-ready exports.

### Repository Discovery

Feature Name: Repository Discovery

Phase: Phase 8

Status: MVP

Maturity: Level 3 - MVP

Description: Repository onboarding profiles for GitHub and local repositories with suggested system type, AI components, evidence sources, controls, risks, jurisdictions, and human review status.

Dependencies: RepositoryDiscovery, RepositoryComponent, RepositoryEvidenceSource, GovernanceManifest, onboarding routes.

Future Work: Add live GitHub/local scanning, review workflow persistence, approval activation, and profile-to-system creation.

### AI Governance Manifest

Feature Name: AI Governance Manifest

Phase: Phase 8.5 and Phase 8.5.1

Status: MVP

Maturity: Level 3 - MVP

Description: `AI Governance.yaml` standard and registry for declaring ownership, AI characteristics, assets, evidence sources, risk profile, regulatory scope, and data context. Manifest v2 expands from repository-first to full AI system asset inventory.

Dependencies: GovernanceManifest, repository discovery, manifest registry, manifest standard documentation, Travel Brain pilot.

Future Work: Add schema validation engine, manifest drift monitoring, live manifest parsing, and approval workflow for manifest changes.

### Travel Brain Pilot

Feature Name: Travel Brain Pilot

Phase: Phase 8.6

Status: MVP

Maturity: Level 3 - MVP

Description: Pilot workspace and assessment for validating Travel Brain against AI Governance Manifest v2, asset inventory, evidence source discovery, automation readiness, and Phase 9 connector priorities.

Dependencies: Travel Brain seed data, GovernanceManifest, repository discovery, pilot assessment document, onboarding route.

Future Work: Convert pilot findings into live onboarding workflow rules, manifest v2 validation, and connector readiness checks.

### Asset Inventory

Feature Name: Asset Inventory

Phase: Phase 9

Status: MVP

Maturity: Level 3 - MVP

Description: Metadata model for governed AI system assets. Phase 9 MVP includes Tier 1 Travel Brain assets: GitHub, Logs, and Portainer.

Dependencies: Asset model, AI systems, seeded Travel Brain assets, Governance Operations dashboard.

Future Work: Add Supabase, MCP, Notion, Secrets, external APIs, asset criticality workflow, asset owner review, and asset drift monitoring.

### Evidence Source Registry

Feature Name: Evidence Source Registry

Phase: Phase 9

Status: MVP

Maturity: Level 3 - MVP

Description: Registry for evidence sources attached to assets with source type, collection method, validation method, automation level, collection status, freshness, connector health, and governance value.

Dependencies: EvidenceSource model, Asset model, governance operations data helper, seeded Travel Brain evidence sources.

Future Work: Add live source discovery, evidence object creation, source-to-control mapping, validation history, and freshness schedules.

### GitHub Connector

Feature Name: GitHub Connector

Phase: Phase 9

Status: Operational

Maturity: Level 4 - Operational

Description: Real GitHub evidence artifact collection for the Travel Brain reference implementation. The connector uses a repository connection and configurable discovery rules to collect `AI Governance.yaml`, prompt files, policy files, and workflow files from the repository mirror, storing artifact content, path, hash, version, source URL, collection date, validation status, and drift baseline events.

Dependencies: Asset model, EvidenceSource model, EvidenceArtifact model, RepositoryConnection model, ArtifactDriftEvent model, Travel Brain GitHub asset, configurable discovery rules, Governance Operations dashboard, Evidence Artifact Viewer.

Future Work: Build authenticated GitHub API collection, scheduled scans, branch selection controls, commit and review provenance, manifest parsing, workflow run collection, test artifact collection, comparative drift history, and production error handling.

### Logs Connector

Feature Name: Logs Connector

Phase: Phase 9C and Phase 9C.1

Status: Operational

Maturity: Level 4 - Operational

Description: Runtime evidence connector for Travel Brain operational reality. Phase 9C.1 upgrades runtime metadata into inspectable sanitized runtime evidence artifacts. The connector shows execution, monitoring, control result, and audit event proof without collecting secrets, tokens, credentials, customer content, personal data, or sensitive payloads.

Dependencies: Asset model, EvidenceSource model, LogSource model, RuntimeEvidenceArtifact model, sanitized evidence fields, Travel Brain Logs asset, ExecutionLog records, TestRun monitoring records, AuditEvent records, monitoring engine, Evidence & Assurance Hub, Governance Operations dashboard, Runtime Evidence Viewer.

Future Work: Connect external Travel Brain log files or endpoints, add source authentication, privacy filtering, scheduled collection, correlation ID validation against external runtime logs, payload redaction controls, log freshness findings, immutable runtime evidence snapshots, and reviewer attestations.

### Portainer Connector

Feature Name: Portainer Connector

Phase: Phase 9

Status: Partial

Maturity: Level 2 - Prototype

Description: Metadata-only connector design for container metadata, deployment metadata, and runtime metadata.

Dependencies: Asset model, EvidenceSource model, Travel Brain Portainer asset, Governance Operations dashboard.

Future Work: Build Portainer API integration, deployment provenance, container configuration snapshots, runtime health checks, and drift detection.

### Governance Operations Dashboard

Feature Name: Governance Operations Dashboard

Phase: Phase 9

Status: MVP

Maturity: Level 3 - MVP

Description: Dashboard showing assets, evidence sources, validation status, freshness status, connector health, and assurance scores for Travel Brain metadata-only Tier 1 operations.

Dependencies: Asset model, EvidenceSource model, assurance score calculation, sidebar navigation, seeded Travel Brain assets.

Future Work: Add live connector health, source error states, freshness schedules, asset drift, manifest drift, and drill-downs from assurance score to evidence objects.

### Evidence Traceability

Feature Name: Evidence Traceability

Phase: Phase 9B

Status: MVP

Maturity: Level 3 - MVP

Description: Bidirectional traceability across controls and evidence artifacts. Control pages show required evidence, present evidence, missing evidence, assurance score, artifact links, evidence sources, assets, AI systems, regulatory context, findings, and exceptions. Artifact pages show reverse artifact-to-control-to-regulatory context.

Dependencies: AssuranceRule model, EvidenceArtifact model, EvidenceSource model, Asset model, AI System Registry, Control Library, Governance Operations Dashboard, Regulatory Mapping.

Future Work: Add persistent traceability graph records, richer regulation-to-requirement-to-internal-control mapping, traceability exports, auditor packages by control, and remediation findings for missing control evidence.

### Explainable Assurance

Feature Name: Explainable Assurance

Phase: Phase 9.5

Status: MVP

Maturity: Level 3 - MVP

Description: Assurance results now explain why a Pass, Warning, Fail, or assurance score occurred. Control pages, evidence artifact pages, and Governance Operations expose the reason, supporting evidence, supporting artifacts, validation checks, supporting controls, missing requirements, failure conditions, and remediation guidance for warning or failure outcomes.

Dependencies: AssuranceRule model, AssuranceExplanation model, GovernanceStory model, EvidenceArtifact model, EvidenceSource model, Control Evidence Traceability, Governance Operations Dashboard, Travel Brain GitHub artifacts.

Future Work: Add reusable explanation components across every platform status badge, persist score-level explanation history, add reviewer attestations, create executive-friendly explanation summaries, generate findings from failed explanations, and export explanations into auditor evidence packages.

### Verifiable Evidence

Feature Name: Verifiable Evidence

Phase: Phase 9.6

Status: MVP

Maturity: Level 3 - MVP

Description: Evidence artifacts now preserve collected snapshots and expose independently inspectable proof. Artifact pages show content, commit SHA, artifact hash, collection timestamp, source URL, snapshot details, evidence chain, and links to a drift comparison viewer. The drift viewer compares the preserved snapshot against the current repository source and shows hash-level and line-level comparison results.

Dependencies: EvidenceArtifact model, EvidenceSnapshot model, RepositoryConnection model, GitHub Connector, AssuranceRule model, AssuranceExplanation model, Evidence Artifact Viewer, Control Evidence Traceability.

Future Work: Add signed evidence snapshots, downloadable verification bundles, immutable snapshot storage, reviewer attestations, scheduled drift scans, automated drift findings, and exportable auditor verification reports.

### Evidence Automation

Feature Name: Evidence Automation

Phase: Phase 9

Status: MVP

Maturity: Level 3 - MVP

Description: Evidence sources, collected GitHub artifacts, validation states, provenance, and content-based assurance rules are modeled. The platform now evaluates whether artifacts support governance controls, not only whether files exist.

Dependencies: Asset Inventory, Evidence Source Registry, GitHub Connector, EvidenceArtifact model, AssuranceRule model, Evidence Artifact Viewer, Governance Operations Dashboard.

Future Work: Expand assurance rules across Portainer and remaining connectors, add scheduled evidence collection, evidence object creation, reviewer workflow, validation history, source freshness scheduling, and remediation findings from failed assurance checks.
