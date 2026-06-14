# Travel Brain Asset Connector Assessment

Phase: 8.7 - Travel Brain Asset Connector Assessment
Reference AI system: Travel Brain
Purpose: Assess which Travel Brain assets can be connected, which evidence can be collected, which evidence is valuable, which evidence should remain human-governed, and which connectors should be built in Phase 9.

## Executive Summary

Travel Brain confirms that AI governance automation should not begin with a generic connector catalog. It should begin with the governed AI system boundary.

The operating model is:

```text
Travel Brain
-> Assets
-> Evidence Sources
-> Evidence Collection
-> Validation
-> Governance Platform
```

Travel Brain assets are not equally connectable. GitHub, logs, monitoring outputs, and Portainer have high automation potential. Supabase, MCP servers, secrets, and external APIs are partially connectable and valuable, but require careful validation and access boundaries. Notion and formal approvals are valuable, but some of their evidence should remain human-governed because they represent accountable judgment rather than technical state.

The most important Phase 9 lesson is this:

```text
Connectors collect proof.
Governance decides what the proof means.
```

## Rating Model

Ratings use `Low`, `Medium`, and `High`.

- Connectable: How feasible it is to connect the platform to the asset.
- Discovery Complexity: How difficult it is to discover and normalize the asset and its evidence.
- Governance Value: How important the asset is to governance decisions.
- Evidence Value: How useful the asset evidence is for control, audit, assurance, or monitoring.
- Automation Potential: How much collection and validation can be automated.

Connector feasibility uses:

- Fully Connectable: A connector can collect useful evidence with low manual dependency.
- Partially Connectable: A connector can collect metadata or source evidence, but review and interpretation remain important.
- Human Only: Evidence is primarily accountable human judgment or formal decision evidence.

## Asset Connector Assessment Matrix

| Asset | Connectable | Discovery Complexity | Governance Value | Evidence Value | Automation Potential | Feasibility |
| --- | --- | --- | --- | --- | --- | --- |
| GitHub | High | Medium | High | High | High | Fully Connectable |
| Local Repository | Medium | Medium | Medium | Medium | Medium | Partially Connectable |
| Supabase | Medium | Medium | High | High | Medium | Partially Connectable |
| Portainer | Medium | Medium | High | High | High | Fully Connectable |
| Notion | Medium | High | High | High | Low | Partially Connectable |
| MCP Servers | Medium | High | High | High | Medium | Partially Connectable |
| External APIs | Medium | Medium | Medium | Medium | Medium | Partially Connectable |
| Secrets | Medium | High | High | Medium | Medium | Partially Connectable |
| Logs | High | Medium | High | High | High | Fully Connectable |

## Asset Analysis

### GitHub

Purpose:

GitHub is the canonical source for Travel Brain source code, prompts, policies, workflows, tests, configuration, and version history.

Governance value:

High. GitHub can show what changed, who changed it, which files define AI behavior, and whether governance artifacts exist in the repository.

Potential evidence:

- Prompt files.
- Prompt change history.
- Governance policies.
- Tool permission policy.
- Workflow definitions.
- Control tests.
- Pull requests and reviews.
- CODEOWNERS or ownership files.
- Model configuration.

Potential controls:

- Prompt version history retained.
- Prompt owner assigned.
- Tool permissions approved.
- Control test execution.
- Evidence source declared.
- Governance manifest present.

Potential risks:

- Unapproved prompt changes.
- Missing policy files.
- Governance manifest drift.
- Weak review controls.
- Local-only changes outside the canonical repository.

Connector feasibility:

Fully Connectable. GitHub APIs can collect repository metadata, file contents, pull requests, commit history, reviews, workflows, and code-owner metadata.

Phase 9 assessment:

GitHub should be a Tier 1 connector. It is the highest-value starting point because it provides prompt, policy, workflow, test, and manifest evidence.

### Local Repository

Purpose:

The local repository may contain development configuration, implementation notes, local runbooks, local manifests, or work-in-progress evidence not yet pushed to GitHub.

Governance value:

Medium. Local evidence can explain development context, but it should not become the long-term canonical evidence store unless explicitly governed.

Potential evidence:

- Local `AI Governance.yaml`.
- Local configuration.
- Developer runbooks.
- Implementation notes.
- Test output.
- Local evidence bundles.

Potential controls:

- Existing project onboarding.
- Governance manifest validation.
- Implementation traceability.
- Local evidence handoff.

Potential risks:

- Local-only governance artifacts.
- Drift between local and GitHub.
- Evidence not retained centrally.
- Inconsistent developer environments.

Connector feasibility:

Partially Connectable. Local scans are feasible during onboarding, but they are not reliable for continuous enterprise governance unless tied to a managed agent or explicit upload workflow.

Phase 9 assessment:

Local repository scanning should support onboarding and discovery, but should not be the first continuous connector.

### Supabase

Purpose:

Supabase represents the Travel Brain data store and can provide schema, data classification, row-level security, access, query, and retention evidence.

Governance value:

High. Supabase evidence supports privacy, access control, data retention, operational monitoring, and AI data governance.

Potential evidence:

- Database schema.
- Row-level security policies.
- Access roles.
- Query logs.
- Data inventory.
- Table-level classification.
- Backup and retention configuration.

Potential controls:

- Privacy controls.
- Data classification.
- Access control.
- Retention controls.
- Operational monitoring.
- Evidence completeness.

Potential risks:

- Personal data exposure.
- Overbroad service-role access.
- Missing RLS policy.
- Unreviewed schema changes.
- Retention gaps.

Connector feasibility:

Partially Connectable. Schema, roles, policy metadata, and logs can be collected, but data classification and acceptable use require governance review.

Phase 9 assessment:

Supabase should be a Tier 2 connector after GitHub/logging foundations are in place. It has high governance value but requires more careful access design.

### Portainer

Purpose:

Portainer represents Travel Brain runtime deployment and container operations.

Governance value:

High. Runtime evidence confirms what is actually deployed, how it is configured, and whether operational logging and deployment controls exist.

Potential evidence:

- Container configuration.
- Image and tag.
- Deployment history.
- Environment metadata.
- Runtime logs.
- Health checks.
- Restart history.
- Network exposure.

Potential controls:

- Production deployment approval.
- Runtime logging enabled.
- Configuration management.
- Operational resilience.
- Kill switch or disablement procedure.
- Evidence freshness monitoring.

Potential risks:

- Unapproved production image.
- Missing runtime logs.
- Configuration drift.
- Exposed service.
- Deployment without approval.

Connector feasibility:

Fully Connectable. Portainer metadata and logs can be collected through API integration or exported evidence bundles.

Phase 9 assessment:

Portainer should be a Tier 1 connector. It connects governance to runtime reality, which is critical for assurance.

### Notion

Purpose:

Notion is the likely human governance workspace for Travel Brain procedures, approvals, committee notes, production decisions, and oversight records.

Governance value:

High. Notion contains evidence that technical systems cannot produce: intent, accountability, decision context, and approval rationale.

Potential evidence:

- Production approval.
- Human oversight procedure.
- Governance committee notes.
- Risk acceptance rationale.
- Review minutes.
- Action items.
- Owner attestations.

Potential controls:

- Human oversight defined.
- Production approval granted.
- Risk acceptance approved.
- Governance review complete.
- Committee decisions retained.

Potential risks:

- Informal or inconsistent approval records.
- Missing approver authority.
- Stale procedures.
- Incomplete decision rationale.
- Poor traceability to controls and evidence.

Connector feasibility:

Partially Connectable. A Notion connector can collect pages, metadata, and linked records, but the meaning and sufficiency of human governance evidence requires review.

Phase 9 assessment:

Notion should be a Tier 2 connector. It is valuable, but the platform should first define evidence object and validation rules for human governance records.

### MCP Servers

Purpose:

MCP servers expose tool surfaces used by AI agents or assistants. For Travel Brain, MCP evidence can support tool inventory, tool permissions, permitted action boundaries, and execution monitoring.

Governance value:

High. MCP servers define what an AI system can reach and what actions it may initiate.

Potential evidence:

- MCP server inventory.
- Tool list.
- Tool descriptions.
- Permission scope.
- Server configuration.
- Tool execution logs.
- Denied tool list.

Potential controls:

- Tool permissions approved.
- Agent registered.
- Delegated authority assigned.
- Prohibited actions defined.
- Execution logging enabled.
- Runtime review performed.

Potential risks:

- Tool surface drift.
- Unapproved tool exposure.
- Excessive authority.
- Missing execution logs.
- Weak tool permission review.

Connector feasibility:

Partially Connectable. Tool inventory and configuration can be inspected, but authority mapping and acceptable-use review require governance context.

Phase 9 assessment:

MCP should be a Tier 2 connector for Travel Brain and a Tier 1 connector for higher-autonomy agentic systems.

### External APIs

Purpose:

External APIs provide model, weather, destination content, or other third-party capabilities that Travel Brain uses to generate recommendations.

Governance value:

Medium. External APIs matter for vendor, data-sharing, reliability, explainability, and tool-governance review.

Potential evidence:

- API configuration.
- Vendor record.
- Data-sharing purpose.
- Access logs.
- Rate limit configuration.
- Terms or risk review.
- Approved use cases.

Potential controls:

- Third-party risk review.
- Tool permissions approved.
- Data sharing approved.
- Access control.
- Operational resilience.

Potential risks:

- Unapproved vendor use.
- Customer data sent to external service.
- API outage.
- Model or content drift.
- Unclear contractual controls.

Connector feasibility:

Partially Connectable. Configuration and access logs can be collected, but vendor governance and data-sharing approval require human review.

Phase 9 assessment:

External APIs should be Tier 3 initially unless a specific API is material to risk or regulatory compliance.

### Secrets

Purpose:

Secrets support access to model providers, Supabase, external APIs, and runtime services.

Governance value:

High. Secrets evidence supports access control, rotation, least privilege, production readiness, and operational security.

Potential evidence:

- Secret inventory.
- Secret owner.
- Scope.
- Rotation date.
- Access policy.
- Storage location.
- Plaintext prohibition.
- Break-glass access record.

Potential controls:

- Secrets management.
- Access control.
- Tool access control.
- Production approval.
- Operational resilience.

Potential risks:

- Exposed credentials.
- Long-lived keys.
- Overbroad service-role access.
- Missing rotation.
- Unclear ownership.

Connector feasibility:

Partially Connectable. Metadata can be collected without exposing values. Actual secret values should never be collected by the governance platform.

Phase 9 assessment:

Secrets should be Tier 2. Build metadata-only collection after the evidence source registry defines safe collection boundaries.

### Logs

Purpose:

Logs provide runtime and monitoring evidence for how Travel Brain behaves after deployment.

Governance value:

High. Logs support assurance, monitoring, incident review, tool-use review, and audit sampling.

Potential evidence:

- Recommendation activity.
- Tool calls.
- Monitoring results.
- Control test output.
- Query logs.
- Error logs.
- Escalation events.
- Policy violations.

Potential controls:

- Continuous control monitoring.
- Execution logging enabled.
- Human oversight evidence retained.
- Tool permissions enforced.
- Evidence freshness monitoring.
- Runtime review performed.

Potential risks:

- Missing logs.
- Incomplete correlation IDs.
- Sensitive data in logs.
- Log retention gaps.
- Unmonitored policy violations.

Connector feasibility:

Fully Connectable. Log sources can be ingested or snapshotted, but privacy filtering and retention validation are required.

Phase 9 assessment:

Logs should be a Tier 1 connector because they provide continuous assurance and runtime proof.

## Evidence Opportunities

| Asset | Evidence Sources | Evidence Value | Notes |
| --- | --- | --- | --- |
| GitHub | Prompts, policies, workflows, tests, pull requests, reviews, manifest | High | Best source for build-time governance evidence. |
| Local Repository | Local manifest, runbooks, local config, test output | Medium | Useful for onboarding, less suitable as canonical evidence. |
| Supabase | Schema, RLS policies, access roles, audit logs, data inventory | High | Strong source for privacy and data controls. |
| Portainer | Runtime logs, deployment history, image tags, container config | High | Links governance to deployed reality. |
| Notion | Approvals, governance records, procedures, committee decisions | High | High value but human-governed. |
| MCP Servers | Tool inventory, permissions, server config, tool logs | High | Critical for agentic governance and tool authority. |
| External APIs | API configs, vendor records, access logs, service dependencies | Medium | Useful for third-party and tool governance. |
| Secrets | Secret inventory, rotation records, access policy | Medium | Metadata-only collection; never collect secret values. |
| Logs | Execution activity, monitoring results, errors, policy violations | High | Core source for continuous assurance. |

## Connector Feasibility

### Fully Connectable

- GitHub
- Portainer
- Logs

Rationale:

These sources can provide high-value evidence through APIs, exports, or log ingestion. They produce source evidence and metadata that can be validated without requiring the platform to make governance decisions.

### Partially Connectable

- Local Repository
- Supabase
- Notion
- MCP Servers
- External APIs
- Secrets

Rationale:

These sources can provide useful metadata and evidence, but the platform must preserve human review for data classification, vendor risk, approval meaning, tool authority, and safe handling of sensitive configuration.

### Human Only

No Travel Brain asset is entirely human-only, but several evidence types within assets are human-only:

- Risk acceptance.
- Production approval.
- Exception approval.
- Committee decisions.
- Oversight sign-off.
- Vendor risk interpretation.

Rationale:

The platform can collect, store, route, and validate the presence of these records. It should not automate the accountability decision itself.

## Governance Automation Assessment

Estimated automation contribution by source:

| Source | Estimated Automatable Evidence Contribution | Rationale |
| --- | --- | --- |
| GitHub | 25% | Prompts, policies, workflows, manifest, reviews, tests, and version history are highly collectible. |
| Supabase | 10% | Schema, RLS, and logs are collectible, but classification and privacy interpretation need review. |
| Portainer | 15% | Deployment, runtime configuration, image, and logs are strong runtime evidence. |
| Notion | 8% | Pages and metadata can be collected, but approvals and decisions remain human-governed. |
| MCP Servers | 10% | Tool inventory and server configuration are collectible; authority interpretation needs review. |
| Secrets | 7% | Metadata and rotation records can be collected safely, but values must remain out of scope. |
| Logs | 25% | Execution and monitoring logs are high-value continuous assurance evidence. |

High-value automation opportunities:

- GitHub manifest, prompt, policy, workflow, test, and review collection.
- Runtime and monitoring log collection.
- Portainer deployment and container configuration collection.
- MCP tool inventory and permission drift detection.
- Supabase schema and RLS evidence collection.
- Secret metadata and rotation evidence collection.

## Human Governance Boundaries

The following evidence should remain human-governed:

### Risk Acceptance

Risk acceptance requires accountable judgment by an authorized risk owner or executive. Automation can validate that acceptance exists, has rationale, has an owner, has an expiration date, and is linked to risk. It should not decide whether the residual risk is acceptable.

### Production Approval

Production approval confirms that business, technology, risk, compliance, and governance stakeholders accept readiness. Automation can assemble evidence and detect missing prerequisites, but final approval must remain accountable.

### Exception Approval

Exceptions are deliberate tolerance of a control gap. Automation can track expiration, owner, compensating control, and evidence. It should not grant the exception.

### Committee Decisions

Committee decisions reflect governance accountability, escalation, tradeoff acceptance, and enterprise context. Automation can capture minutes and action items, but the decision itself remains human.

### Vendor Risk Interpretation

External API and model-provider evidence can be collected, but vendor acceptability, contractual sufficiency, and data-sharing risk require governance review.

## Phase 9 Connector Priorities

### Tier 1 - Highest Governance Value

1. GitHub Connector

Purpose:

Collect manifest, prompts, policies, workflows, tests, pull requests, reviews, and version history.

Why Tier 1:

It provides the strongest build-time governance evidence and validates manifest-first onboarding.

2. Logs Connector

Purpose:

Collect execution activity, monitoring results, tool calls, errors, and policy events.

Why Tier 1:

It provides continuous assurance and answers whether controls continue to operate.

3. Portainer Connector

Purpose:

Collect runtime configuration, deployment history, image metadata, health status, and container logs.

Why Tier 1:

It connects governance to deployed reality.

### Tier 2 - Useful But Not First

1. Supabase Connector

Purpose:

Collect schema, RLS policies, access roles, audit logs, and data inventory evidence.

Why Tier 2:

High value for privacy and data controls, but requires careful permissioning and data classification logic.

2. MCP Server Connector

Purpose:

Collect tool inventory, server configuration, and tool execution records.

Why Tier 2:

Important for Travel Brain and critical for higher-autonomy systems, but needs a stable control model for tool authority.

3. Secrets Metadata Connector

Purpose:

Collect metadata about secrets, owners, scopes, access policy, and rotation without collecting secret values.

Why Tier 2:

High governance value, but must be designed with strict boundaries.

4. Notion Governance Records Connector

Purpose:

Collect approval records, procedures, committee decisions, and oversight documentation.

Why Tier 2:

High evidence value, but depends on evidence templates and human governance validation.

### Tier 3 - Future Enhancements

1. External API Connector

Purpose:

Collect API configuration, vendor metadata, access logs, and dependency evidence.

Why Tier 3:

Useful for third-party governance, but less foundational than GitHub, runtime, logs, data, and MCP evidence.

2. Local Repository Scanner

Purpose:

Support onboarding scans for local repositories and local evidence bundles.

Why Tier 3:

Useful during early onboarding, but less reliable for continuous enterprise governance.

## Travel Brain Governance Operations Vision

Once connectors exist, governance would operate as a continuous assurance loop.

1. Travel Brain declares `AI Governance.yaml`.
2. The platform creates or updates the AI system asset inventory.
3. Connectors discover assets and compare discovered state to declared state.
4. Evidence sources are registered for each asset.
5. Evidence is collected from source systems.
6. Evidence is validated for freshness, ownership, completeness, approval linkage, and control mapping.
7. Evidence objects are linked to controls, risks, regulations, findings, exceptions, lifecycle gates, and governance engineering implementations.
8. Monitoring detects missing, stale, invalid, or drifted evidence.
9. Governance owners review exceptions, approvals, risk acceptances, and committee decisions.
10. The platform reports assurance rather than simple status.

The future operating question becomes:

```text
Show me the proof.
Where did it come from?
Who reviewed it?
Is it still valid?
What changed?
```

## Architecture Diagram

```text
                         Travel Brain
                              |
                              v
                  AI Governance.yaml Manifest
                              |
                              v
                    AI System Asset Inventory
                              |
        ------------------------------------------------
        |        |        |        |       |      |     |
        v        v        v        v       v      v     v
     GitHub  Supabase Portainer  Notion   MCP  Secrets Logs
        |        |        |        |       |      |     |
        v        v        v        v       v      v     v
   prompts   schema   runtime   approvals tools metadata execution
   policies  RLS      deploys   records   perms rotation monitoring
   workflows audit    logs      decisions logs  access  results
   tests     logs
        |        |        |        |       |      |     |
        ------------------------------------------------
                              |
                              v
                    Future Asset Connectors
                              |
                              v
                    Evidence Source Registry
                              |
                              v
                    Evidence Collection Engine
                              |
                              v
                    Evidence Validation Engine
                              |
                              v
                  AI Governance Platform
                              |
                              v
        Controls -> Risks -> Regulations -> Findings -> Exceptions
                              |
                              v
                      Assurance Reporting
```

## Architecture Implications

### Asset-first architecture

Phase 9 should model assets before connectors. Connectors should attach to asset records and produce evidence source records.

### Evidence source registry before collection

Collection should not be ad hoc. Each evidence source should have:

- Source asset.
- Evidence type.
- Owner.
- Collection method.
- Validation method.
- Automation level.
- Freshness requirement.
- Linked controls.

### Validation before assurance scoring

Collected evidence is not automatically valid evidence. Validation should check:

- Source authenticity.
- Completeness.
- Required fields.
- Owner or reviewer.
- Approval linkage.
- Expiration.
- Drift from manifest.
- Control mapping.

### Human governance remains explicit

The platform should distinguish:

- System-generated evidence.
- Derived evidence.
- Human governance evidence.

This keeps automation useful without pretending governance judgment can be automated away.

## Final Recommendation

Phase 9 should begin with:

1. AI System Asset Inventory.
2. Evidence Source Registry.
3. GitHub Connector.
4. Logs Connector.
5. Portainer Connector.
6. Evidence Validation Engine.
7. Evidence Freshness Monitoring.
8. Assurance Scoring.

Supabase, MCP server, secrets metadata, and Notion connectors should follow once the evidence source registry and validation rules are stable.
