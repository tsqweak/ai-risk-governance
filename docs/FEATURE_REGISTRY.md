# Feature Registry

Purpose: Track what actually exists in the AI-Risk-Governance platform.

The roadmap tracks phases. The backlog tracks future work. The Feature Registry tracks implemented capabilities, their maturity, dependencies, and remaining gaps.

## Summary

Feature counts by status:

- Complete: 10
- Operational: 4
- MVP: 18
- Partial: 1
- Not Started: 0
- Planned: 2
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
- Supabase Connector
- Platform Review Agent

Partial features:

- Notion Governance Connector

Planned features:

- UX Refactor 2 - Full Site IA Redesign
- Skill Governance

Not started features:

- None for the major Phase 9 connector and discovery sequence.

Current platform maturity:

Level 3+ - MVP, trending toward Level 4 - Operational.

The platform has a strong governed data model, seeded workflows, dashboards, traceability, evidence objects, AI governance, agentic governance, lifecycle governance, risk management, governance engineering, and operational internal platform review. GitHub evidence artifact collection and assurance are now operational against the real Travel Brain repository. Logs runtime evidence is operational for the Travel Brain reference scope with inspectable sanitized evidence artifacts. Portainer is MVP for the Travel Brain reference scope: the connector supports read-only deployed-state collection, validated deployment artifacts, assurance, traceability, and drift baseline recording when a read-only endpoint is available, and creates explicit gap evidence when the source is unavailable. Supabase is now operational for the Travel Brain reference scope through real read-only metadata collection, retained snapshots, drift detection, control validation, generated findings, assurance, and traceability. MCP is now MVP for the Travel Brain reference scope through real source-derived server inventory, tool registry, tool permissions, authority classification, capability inventory, assurance, and traceability. Notion is now Partial because the connector model, evidence sources, gap artifacts, assurance, and traceability exist, but scoped Travel Brain governance content has not been made available to the integration. Secrets is now MVP because real Travel Brain metadata-only secret inventory, rotation, ownership, usage mapping, and plaintext-prohibition evidence is collected without reading, storing, displaying, logging, hashing, exporting, or persisting secret values. Asset Discovery is now MVP because Travel Brain discovery compares manifest declarations against repository, workflow, configuration, documentation, connector metadata, runtime metadata, and secrets metadata, then validates each finding with source file, source asset, evidence, discovery rule, confidence level, and validation status before using it in inventory counts. Skill Governance is also planned as a later capability because Skills are increasingly becoming AI versions of human SOPs, workflows, playbooks, and procedures.

Recommended next feature:

Begin connector consistency cleanup. Normalize connector and discovery behavior
across GitHub, Logs, Portainer, Supabase, MCP, Notion, Secrets, and Asset
Discovery before UX Refactor 2.

## Current Focus

Phase: Post-9X

Feature: Connector consistency cleanup

Target: Consistent connector and discovery operating model

Objective: Normalize collection, validation, assurance, freshness, drift,
traceability, gap artifacts, source issues, reviewer follow-up, and discovery
signals across the major evidence domains.

Explanation examples:

- Connector status to consistent maturity language
- Source health to consistent warning behavior
- Gap artifacts to consistent reviewer actions
- Discovery findings to governed inventory updates
- Traceability to consistent control and evidence paths

Why this is current focus:

GitHub proves design intent, Logs prove operational activity, Portainer proves
deployed-state reality, Supabase proves data-governance reality, MCP proves
actual agent capability, Notion makes human-governance source gaps explicit,
Secrets proves governed metadata without collecting secret values, and Asset
Discovery now finds forgotten assets. The next operating-model gap is consistency
across connector and discovery behaviors.

## Next Focus

After connector consistency cleanup, the roadmap sequence should be:

1. UX Refactor 2 - Full Site IA Redesign
2. Phase 10 - Portfolio Analytics & Trends

Purpose: Use discovery to find assets humans forget, then normalize connector
behavior across evidence domains, redesign the UX around mature proof workflows,
and add executive-grade analytics and trends.

Secrets follows GitHub, Logs, Portainer, Supabase, MCP, and Notion because those
domains establish design intent, runtime activity, deployed state, data
governance, actual agent capability, and human governance evidence or explicit
human-governance source gaps.

UX Refactor 2 should follow completion of the major evidence domains, Asset
Discovery Engine, and connector consistency cleanup. The platform should
redesign around complete evidence workflows spanning GitHub, Logs, Portainer,
Supabase, MCP, Notion, Secrets, and discovered assets.

Skill Governance should follow connector completion and UX Refactor 2. It should govern Skills as first-class assets only after the platform has stable evidence workflows and a simplified information architecture.

## Dependency Guidance

Each feature includes a `Dependencies` field listing prerequisite features and prerequisite capabilities. Dependencies are intentionally practical: they identify what must exist for the feature to operate or mature, not every related concept in the platform.

## Status Definitions

- Planned: Defined but not implemented.
- Not Started: Approved as the next implementation target, but not yet built.
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

Current Status: Operational.

Target Maturity: Level 4 - Operational.

### Portainer Connector

Purpose: Runtime deployment evidence and container assurance.

Evidence Types: Container metadata, deployment metadata, runtime metadata, image provenance, service health, restart history, deployment drift.

Current Status: MVP. Read-only Portainer API collection works for the Travel Brain reference scope when `PORTAINER_ENDPOINT` and `PORTAINER_TOKEN` are available. The connector collects safe deployed-state evidence for `travel-brain-web`, including container name, image name, image tag, deployment timestamp, health status, restart count, logging status, source endpoint, evidence hash, validation, assurance, traceability, and a deployment drift baseline. When the source is unavailable, it creates explicit gap evidence instead of implying deployed-state proof. It deliberately excludes command payloads, environment variable values, secrets, tokens, credentials, mount details, customer content, and sensitive payloads.

Target Maturity: Level 4 - Operational.

### Supabase Connector

Purpose: Database, access, privacy, and data-control assurance.

Evidence Types: Schema metadata, RLS policies, data inventory, query/audit logs, access controls, retention evidence, privacy control evidence.

Current Status: Operational. The connector collects real Travel Brain Supabase metadata through a read-only Postgres connection and stores inspectable data-governance evidence artifacts, historical snapshots, drift events, control validation results, and generated findings for warning/failure conditions. It covers schema inventory, table inventory, column inventory, RLS status, policy inventory, role inventory, extension inventory, and database version while excluding row data, customer content, secrets, credentials, tokens, API keys, and sensitive payloads.

Target Maturity: Level 4 - Operational.

### MCP Connector

Purpose: Agentic tool governance, delegated authority, and execution assurance.

Evidence Types: MCP server inventory, tool registry, tool permissions, authority registry, capability inventory, delegated authority checks, denied-action evidence.

Current Status: MVP. The connector collects real Travel Brain MCP metadata from the actual MCP implementation and governance policy sources. It stores inspectable server inventory, tool inventory, tool categories, declared permissions, authority classifications, capability inventory, collection timestamp, version, hash, validation, assurance, and control traceability. It deliberately excludes prompts, customer content, tool inputs, tool outputs, secrets, credentials, and sensitive payloads. It remains below Operational because live scheduled collection, endpoint-level metadata validation, and policy remediation for unclassified write-capable tools remain future work.

Target Maturity: Level 4 - Operational.

### Notion Governance Connector

Purpose: Human-governed evidence for decisions, approvals, reviews, and committee records.

Evidence Types: Governance documentation inventory, approval records, review records, committee decisions, ownership records, exception approvals, production readiness notes.

Current Status: Partial. The platform now includes the Notion connection model, Travel Brain Notion asset, evidence source registry entries, Notion evidence artifact model, Evidence & Assurance integration, control traceability, explainable assurance, and explicit gap artifacts. Real Notion governance metadata has not been collected because scoped Travel Brain governance content has not been shared with the integration in this environment.

Target Maturity: Level 4 - Operational.

### Secrets Metadata Connector

Purpose: Secrets governance without collecting or exposing secret values.

Evidence Types: Secret inventory metadata, owner, source system, environment, usage mapping, rotation policy, last rotated date metadata, and plaintext prohibition evidence.

Current Status: MVP. The platform collects real Travel Brain secrets metadata from safe source names and declared metadata records across Environment Variables, GitHub Secrets, Supabase Secrets, Portainer Secrets, and Local Secret Stores. It creates Secret Inventory, Rotation Evidence, Ownership Evidence, and Usage Mapping artifacts with collection timestamp, source, validation status, evidence hash, assurance explanation, warning detail, and control traceability. Secret values, tokens, passwords, API key values, certificates, private keys, and connection strings are never read, stored, displayed, logged, hashed, exported, or persisted.

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

Dependencies: Logs Connector, Portainer Connector, Supabase Connector, MCP Connector, Notion Connector, Secrets Connector, Asset Discovery Engine, connector consistency cleanup.

Decision Rationale: UX Refactor 1 improved the proof layer with the Evidence & Assurance Hub, but the full site should not be redesigned around GitHub-only evidence. Complete major evidence domains, run Asset Discovery, normalize connector behavior, then redesign around real workflows and real evidence across the governed AI system.

Future Work: Convert the UX architecture review into implementation phases, define canonical hubs, map legacy routes to retained or redirected destinations, create role-specific journey acceptance tests, and validate the redesigned navigation with Travel Brain once all major evidence domains, discovered assets, and connector patterns are represented.

### Skill Governance

Feature Name: Skill Governance

Phase: Future Phase

Status: Planned

Maturity: Level 1 - Concept

Description: Planned governance capability for AI Skills as first-class assets. Skills are increasingly replacing human SOPs, workflows, playbooks, and procedures. Because Skills may make decisions, execute workflows, influence business outcomes, and encode authority, they should eventually be governed alongside agents, tools, prompts, and models.

Dependencies: AI System Registry, AI Governance, Agentic Governance, Evidence & Assurance Hub, Control Evidence Traceability, connector evidence domains, UX Refactor 2, governance approval workflow, audit trail, usage evidence model.

Governance Principles: Skills require explicit ownership, approvals, reviews, evidence, traceability, version history, authority classification, lifecycle governance, and human accountability. Skill governance should preserve the chain from human procedure to AI Skill to evidence to assurance to governance.

Future Evidence Sources: Skill definition, Skill prompt, Skill workflow, Skill owner, Skill approvals, Skill reviews, Skill usage metadata, and Skill version history.

Future Work: Create a Skill registry, define Skill ownership and lifecycle states, map Skills to controls and risks, capture Skill prompts and workflows, track approvals and reviews, collect Skill usage evidence, classify Skill authority, and add Skill assurance once evidence sources exist.

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

Description: Metadata model for governed AI system assets. Phase 9 MVP includes Travel Brain assets across GitHub, Logs, Portainer, Supabase, MCP, Notion, and the planned Secrets domain.

Dependencies: Asset model, AI systems, seeded Travel Brain assets, Governance Operations dashboard.

Future Work: Add Secrets metadata, external APIs, asset discovery, asset criticality workflow, asset owner review, and asset drift monitoring.

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

Status: MVP

Maturity: Level 3 - MVP

Description: Read-only Portainer evidence domain for deployed-state reality. The platform models Portainer connections, real deployment evidence artifacts, deployment drift events, Evidence & Assurance deployment views, a deployment evidence viewer, control traceability, and explainable assurance. Travel Brain now collects real `travel-brain-web` deployment evidence from Portainer without storing command payloads, environment variable values, secrets, tokens, credentials, mount details, customer content, or sensitive payloads.

Dependencies: Asset model, EvidenceSource model, PortainerConnection model, DeploymentEvidenceArtifact model, DeploymentDriftEvent model, Travel Brain Portainer asset, Evidence & Assurance Hub, Governance Operations dashboard, Control Evidence Traceability.

Future Work: Add scheduled collection, historical drift comparison against the last collected baseline, multi-container and multi-environment selection, image approval linkage, runtime health checks, deployment freshness findings, production error handling, and reviewer attestations for deployment evidence changes.

### Supabase Connector

Feature Name: Supabase Connector

Phase: Phase 9E

Status: Operational

Maturity: Level 4 - Operational

Description: Read-only Supabase evidence domain for data-governance reality. The platform now collects real Travel Brain Supabase metadata from `TRAVEL_BRAIN_SUPABASE_DB_URL`, retains historical snapshots, detects schema/table/column/RLS/policy/role/extension drift, validates data-governance controls, and generates findings when warning/failure conditions are present. Evidence & Assurance data-governance views, a Supabase evidence viewer, data-governance assurance, and control traceability are available without collecting row data, customer content, secrets, credentials, tokens, API keys, or sensitive payloads.

Dependencies: Asset model, EvidenceSource model, SupabaseConnection model, SupabaseEvidenceArtifact model, SupabaseEvidenceSnapshot model, SupabaseDriftEvent model, SupabaseControlValidation model, read-only Postgres metadata access, Travel Brain Supabase asset, Evidence & Assurance Hub, Governance Operations dashboard, Control Evidence Traceability, Findings.

Future Work: Add scheduled collection, reviewer attestations, remediation workflow for generated findings, richer query/audit log evidence, approved baseline management, and production-grade retention policy for Supabase evidence snapshots.

### MCP Connector

Feature Name: MCP Connector

Phase: Phase 9F

Status: MVP

Maturity: Level 3 - MVP

Description: Evidence domain for actual agent capability. The connector collects real Travel Brain MCP metadata from the actual MCP implementation and governance policy sources, producing inspectable evidence artifacts for server inventory, tool registry, tool permissions, authority registry, and capability inventory. It preserves collection timestamp, source, version, hash, validation, assurance, and control traceability without collecting prompts, customer content, tool inputs, tool outputs, secrets, credentials, or sensitive payloads.

Dependencies: Asset Inventory, Evidence Source Registry, Agentic Governance, Tool Permissions, Delegated Authority Framework, Evidence & Assurance Hub, Control Evidence Traceability, MCP evidence artifact model.

Future Work: Review unclassified write-capable MCP tools, update `governance/tool-policy.yaml`, add live endpoint-level metadata validation where safe, add scheduled freshness collection, add MCP drift detection, and mature the connector toward Operational after repeated successful collections and reviewer attestations.

### Notion Governance Connector

Feature Name: Notion Governance Connector

Phase: Phase 9G

Status: Partial

Maturity: Level 2 - Prototype

Description: Partial human-governance evidence domain for governance decisions, review notes, approval records, committee decisions, ownership evidence, production readiness evidence, and other reviewer-owned governance artifacts. The connector supports scoped Notion metadata collection when configured, but the current Travel Brain run creates explicit gap artifacts because no scoped Notion token, database ID, or page ID is available.

Dependencies: Asset Inventory, Evidence Source Registry, Evidence Repository, Auditor Workspace, Governance Committee workflows, Evidence & Assurance Hub, Control Evidence Traceability, scoped Notion integration token, shared Travel Brain Notion governance page or database.

Future Work: Configure scoped Travel Brain Notion access, collect real page/database metadata, validate approval/review/committee/ownership fields, preserve reviewer and approver context, add scheduled freshness collection, add Notion governance drift review, and move the connector to MVP only after real governance metadata is collected.

### Secrets Metadata Connector

Feature Name: Secrets Metadata Connector

Phase: Phase 9H

Status: MVP

Maturity: Level 3 - MVP

Description: Metadata-only secrets governance evidence domain. The connector collects Travel Brain secret identifiers, source systems, environment, owners, rotation metadata, usage mappings, associated AI system, collection timestamp, source, validation status, evidence hash, assurance explanation, warning detail, and control traceability while strictly prohibiting secret values, tokens, passwords, API key values, certificates, private keys, and connection strings.

Dependencies: Asset Inventory, Evidence Source Registry, Secrets governance policy, Evidence & Assurance Hub, Control Evidence Traceability, security review guardrails.

Future Work: Replace declared metadata fallbacks with scheduled read-only metadata collection where source APIs expose safe names, improve owner and rotation metadata completeness, resolve stale or unknown rotation warnings, add connector consistency cleanup, and move the connector toward Operational only after metadata collection is scheduled and reviewed.

### Asset Discovery Engine

Feature Name: Asset Discovery Engine

Phase: Phase 9X

Status: MVP

Maturity: Level 3 - MVP

Description: Governed discovery capability for finding AI-system assets humans
may forget to declare. The engine creates Travel Brain discovery runs, sources,
and findings by comparing `AI Governance.yaml` against repository files, GitHub
workflows, configuration files, documentation, Portainer metadata, Supabase
metadata, MCP metadata, Notion references, environment variable names, and
Secrets metadata. It classifies known, unknown, untracked, orphaned, and missing
assets with source, source file, source asset, evidence, discovery rule, reason,
confidence score, confidence level, validation status, status, and recommended
action. Invalid findings remain visible for review but are excluded from
inventory completeness and known-vs-discovered counts.

Dependencies: Asset Inventory, Evidence Source Registry, AI Governance Manifest,
GitHub Connector, Logs Connector, Portainer Connector, Supabase Connector, MCP
Connector, Notion Governance Connector, Secrets Metadata Connector, control
traceability, reviewer workflow.

Future Work: Add scheduled discovery runs, reviewer assignment, inventory update
workflow, richer source adapters, discovered asset criticality workflow,
historical discovery drift, automated recommendations for evidence source
creation, and reviewer adjudication for warning-level findings.

### Governance Operations Dashboard

Feature Name: Governance Operations Dashboard

Phase: Phase 9

Status: MVP

Maturity: Level 3 - MVP

Description: Dashboard showing assets, evidence sources, validation status, freshness status, connector health, assurance scores, GitHub artifacts, runtime evidence, deployment evidence, and Supabase data-governance evidence or gaps for Travel Brain operations.

Dependencies: Asset model, EvidenceSource model, assurance score calculation, sidebar navigation, seeded Travel Brain assets.

Future Work: Add live connector health, source error states, freshness schedules, asset drift, manifest drift, and drill-downs from assurance score to evidence objects.

### Platform Review Agent

Feature Name: Platform Review Agent

Phase: Phase 9D.5

Status: Operational

Maturity: Level 4 - Operational

Description: Internal self-assessment and review-package workspace at `/platform-review`, `/platform-review/package`, and `/platform-review/export` that inventories routes, feature maturity, navigation structure, duplicate destinations, evidence maturity, connector status, governance status, screenshot planning, architecture drift, open issues, and ChatGPT-ready review-package content. It reads the current app route tree, current navigation models, `FEATURE_REGISTRY.md`, Evidence & Assurance operating data, `PROJECT_OPERATING_MODEL.md`, and `UX_ARCHITECTURE_REVIEW.md`, and maintains `docs/PLATFORM_REVIEW_PACKAGE.md` as the canonical single-file review artifact.

Dependencies: App route tree, shared sidebar navigation model, Evidence & Assurance secondary navigation model, Feature Registry documentation, Governance Operations data helper, Evidence Source Registry, EvidenceArtifact, RuntimeEvidenceArtifact, DeploymentEvidenceArtifact, EvidenceHealth, findings, exceptions, Project Operating Model, UX Architecture Review, Platform Review Package document.

Future Work: Add automated screenshot capture, `platform-review.zip` generation, scheduled review runs, route ownership metadata, richer duplicate workflow detection, feature-to-route mapping, source-code drift checks, and issue history.

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
