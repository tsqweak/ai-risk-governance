# Travel Brain Pilot Assessment

Phase: 8.6 - Travel Brain Governance Manifest Pilot
Pilot system: Travel Brain
Purpose: Validate `AI Governance.yaml`, the Asset Inventory Model, the Evidence Source Framework, and the Discovery Model before building Governance Operations and Evidence Automation.

## Executive Summary

Travel Brain is a strong first onboarding pilot because it is simple enough to be reviewable and realistic enough to expose the limits of repository-only governance. The pilot confirms the central lesson from the Evidence Source Framework and AI Governance Manifest v2:

```text
AI System -> Assets -> Evidence Sources -> Governance
```

Travel Brain is not only a GitHub repository. It includes repositories, Supabase, Portainer, Notion, external APIs, MCP server surfaces, secrets, and logs. Evidence originates from these assets. The platform therefore needs an asset-aware onboarding model before it builds automated evidence collection.

## Findings

### Finding 1 - Manifest-first onboarding is viable

`AI Governance.yaml` provides a practical onboarding starting point. It gives reviewers a declared system name, owners, AI type, lifecycle stage, risk tier, jurisdictions, and evidence sources.

Assessment:

- Current manifest status: Valid for repository discovery.
- Governance readiness: Strong enough for pilot onboarding.
- Gap: Manifest v2 should add explicit asset categories for repositories, databases, containers, documentation, MCP servers, external services, secrets, and logs.

### Finding 2 - Repository discovery is necessary but insufficient

Repository discovery detects prompts, code, policy files, workflow definitions, and monitoring outputs. That is valuable, but Travel Brain governance also depends on assets outside the repository.

Examples:

- Supabase produces schema, access, data inventory, and query evidence.
- Portainer produces runtime configuration, deployment, and log evidence.
- Notion produces human governance and approval evidence.
- MCP servers produce tool registry and tool execution evidence.
- Secrets managers produce access and rotation evidence.

### Finding 3 - Evidence source inventory should be asset-driven

Evidence should not be treated as an attachment or static document. Evidence should be traced to its source asset, collection method, validation method, and automation potential.

This supports the assurance question:

```text
How do we know this is true?
```

### Finding 4 - Discovery validates rather than replaces governance

Discovery can identify likely assets and evidence sources, but it cannot approve lifecycle status, risk acceptance, production readiness, vendor exposure, or delegated authority. The pilot confirms that discovery should generate suggested profiles for human review.

## Asset Inventory

| Asset Category | Travel Brain Assets | Discovery Status | Evidence Potential |
| --- | --- | --- | --- |
| Repositories | GitHub - Travel Brain; Local Repository - Travel Brain | Discoverable | High |
| Databases | Supabase - Travel Brain | Partially Discoverable | High |
| Containers | Portainer - travel-brain-web | Partially Discoverable | High |
| Documentation | Notion - Travel Brain Governance Workspace | Manual | Medium |
| MCP Servers | Travel Brain MCP Server | Partially Discoverable | High |
| External Services | OpenAI API; Weather Provider API; Destination Content API | Partially Discoverable | Medium |
| Secrets | OPENAI_API_KEY; SUPABASE_SERVICE_ROLE_KEY; WEATHER_API_TOKEN | Partially Discoverable | Medium |
| Logs | Recommendation Activity Logs; Monitoring Results; Supabase Query Logs | Discoverable | High |

## Evidence Sources

| Asset | Evidence Sources | Collection Method | Validation Method | Automation Potential |
| --- | --- | --- | --- | --- |
| GitHub - Travel Brain | Prompts, policies, workflows, model configuration | Repository connector | Validate file presence, owners, review history, control mapping | High |
| Local Repository - Travel Brain | Local configuration, implementation notes, runbooks | Local repository scan | Compare to canonical repository and flag local-only governance artifacts | Medium |
| Supabase - Travel Brain | Schema, RLS policies, query logs, data inventory | Supabase connector or export bundle | Validate privacy controls, retention, access scope, and policy coverage | Medium |
| Portainer - travel-brain-web | Container configuration, deployment history, runtime logs | Portainer connector | Validate image provenance, runtime logging, and approval linkage | High |
| Notion Governance Workspace | Human oversight, approvals, committee decisions | Governed document export or Notion connector | Validate approver authority, scope, date, cadence, and blockers | Low |
| Travel Brain MCP Server | Tool registry, server configuration, tool execution logs | MCP registry and runtime log collection | Validate tools against approved permissions and authority level | Medium |
| External APIs | API configuration, vendor records, access logs | Configuration scan and vendor evidence collection | Validate approved vendor, purpose, data sharing, and access control | Medium |
| Secrets | Secret inventory, access policy, rotation records | Secret manager metadata collection | Validate rotation policy, owner, scope, and plaintext prohibition | Medium |
| Logs | Recommendation logs, monitoring output, query logs | Log connector or scheduled evidence snapshot | Validate completeness, retention, correlation IDs, and prohibited-action checks | High |

## Automation Assessment

Estimated evidence mix for Travel Brain:

- Automatically collected evidence: 44%
- Derived evidence: 45%
- Human governance evidence: 11%

Rationale:

Repository files, runtime logs, monitoring outputs, and container metadata are strong candidates for automated collection. Database, MCP, external service, and secret evidence can be partially automated, but still need reviewer validation for classification, purpose, authority, and governance interpretation. Production approval, human oversight, and committee decisions remain human governance evidence.

## Governance Readiness

| Dimension | Assessment |
| --- | --- |
| Manifest Quality | Strong for v1; requires v2 asset inventory expansion |
| Asset Coverage | Good pilot coverage across repository, runtime, data, documentation, services, secrets, and logs |
| Evidence Coverage | Strong evidence potential with clear collection and validation paths |
| Automation Readiness | Medium-high, with GitHub, logs, monitoring, and Portainer as first connector candidates |
| Governance Readiness | Strong enough for pilot onboarding and Phase 9 design input |

## Automation Opportunities

High-priority automation opportunities:

- GitHub connector for prompts, policies, workflow definitions, tests, and commit history.
- Portainer connector for container configuration, deployment metadata, and runtime logs.
- Monitoring evidence ingestion for control results and evidence health.
- Log evidence collection for recommendation activity, control monitoring, and runtime assurance.

Medium-priority automation opportunities:

- Supabase connector for schema, RLS policy, query logs, and data inventory evidence.
- MCP server inspection for tool registry, server configuration, and tool execution records.
- Secret manager metadata collection for secret inventory, access policy, and rotation records.
- External API configuration collection for vendor and tool governance evidence.

Low-automation governance evidence:

- Production approval.
- Risk acceptance.
- Governance committee decisions.
- Human oversight sign-off.
- Vendor risk interpretation.

## Phase 9 Recommendations

### 1. Build AI System Asset Inventory first

Phase 9 should begin with an explicit asset inventory model. Evidence automation should not start from loose connectors. It should start from governed assets.

### 2. Create an Evidence Source Registry

Each asset should declare evidence sources, collection method, validation method, owner, freshness expectation, and automation level.

### 3. Prioritize high-yield connectors

Start with connectors that produce clear evidence quickly:

- GitHub
- Portainer
- Monitoring outputs
- Runtime logs

Then expand to:

- Supabase
- MCP servers
- Secret manager metadata
- Notion governance records
- External service configuration

### 4. Add evidence validation before broad automation

Collection without validation creates noise. Phase 9 should validate evidence freshness, owner, source, completeness, approval linkage, and control mapping.

### 5. Preserve human governance decisions

Automation should support governance review. It should not make final decisions about production approval, risk acceptance, authority changes, or committee approvals.

## Pilot Conclusion

The Travel Brain pilot validates the new operating model:

```text
Manifest First
Discovery Validates
Evidence Driven
Enterprise Scalable
```

The pilot should proceed into Phase 9 design with a clear sequence:

```text
AI System Asset Inventory
-> Evidence Source Registry
-> Evidence Collection Engine
-> Evidence Validation Engine
-> Evidence Freshness Monitoring
-> Assurance Scoring
```
