# AI Governance Manifest Standard

Standard name: `AI Governance.yaml`
Version: v2
Purpose: AI system asset inventory and governance declaration
Phase: 8.5.1 - AI Governance Manifest v2

## Purpose

`AI Governance.yaml` is a human-readable and machine-readable governance manifest for AI systems.

Version 1 established repository-first governance profiling. Version 2 expands the manifest into a full AI system asset inventory. This matters because an AI system is larger than a repository. Travel Brain, for example, may include GitHub, a local repository, Supabase, Portainer, Notion, APIs, MCP servers, secrets, logs, prompts, policies, and runtime infrastructure.

Every AI system should declare its ownership, purpose, AI characteristics, assets, evidence sources, risk profile, regulatory scope, and data context. The manifest should make the governed boundary visible before onboarding, audit review, or evidence automation begins.

The manifest becomes the foundation for:

- AI system asset discovery
- Repository discovery
- Governance profiling
- Evidence source discovery
- Human review
- Auditor traceability
- Future governance automation

The enterprise story is:

```text
No manifest.
No onboarding.
No governance.
```

This does not mean the manifest makes final governance decisions. It means the AI system must provide enough declared context for governance teams to review the full system boundary.

## Governance Story

The manifest changes onboarding from a repository-centered model to a system-centered model.

```text
AI System
-> Assets
-> Evidence Sources
-> Governance
```

The repository is one asset. It is not the whole AI system.

This model helps governance teams answer:

- What assets make up the AI system?
- Which assets produce evidence?
- Which evidence supports governance controls?
- Which assets are not yet covered by evidence collection?
- Which risks are created by external services, databases, secrets, logs, or runtime infrastructure?

## Why It Exists

Traditional governance starts with an application inventory. AI governance needs a richer operating picture. It must know whether the AI system includes models, prompts, agents, tools, data stores, repositories, containers, external services, MCP servers, secrets, approval workflows, runtime logs, monitoring outputs, and human governance records.

```text
Traditional: Application Inventory
AI Governance: AI Governance Manifest
```

The manifest gives developers, risk teams, audit, compliance, and governance committees a shared source of truth for the complete AI system.

## Required Sections

`AI Governance.yaml` must include the following top-level sections:

- `system`
- `owners`
- `ai`
- `assets`
- `evidence_sources`
- `regulatory_scope`
- `data`
- `risk`

The `assets` section must include these asset categories, even when a category is empty:

- `repositories`
- `databases`
- `containers`
- `documentation`
- `mcp_servers`
- `external_services`
- `secrets`
- `logs`

AI-specific components such as models, prompts, agents, and tools should either be declared as governed assets or referenced from the asset that contains or operates them.

## Manifest Schema

```yaml
system:
  name: string
  description: string
  lifecycle_stage: Proposed | Development | Testing | Pilot | Production | Retired
  environment: Sandbox | Non-Production | Production
  business_purpose: string
  system_boundary: string

owners:
  business_owner: string
  technology_owner: string
  risk_owner: string
  executive_sponsor: string

ai:
  type: Agent | Assistant | Research Tool | Web Application | Automation | Second Brain
  agentic_level: number
  authority_level: number
  customer_facing: boolean
  autonomous_action: boolean
  financial_transaction: boolean
  ai_components:
    models:
      - name: string
        provider: string
        version: string
        source_asset: string
    prompts:
      - name: string
        source_asset: string
        location: string
        owner: string
    agents:
      - name: string
        source_asset: string
        purpose: string
    tools:
      - name: string
        permission: Read | Write | Execute | Administrative
        source_asset: string

assets:
  repositories:
    - name: string
      repository_type: GitHub | Local | GitLab | Bitbucket | Other
      location: string
      owner: string
      contains:
        - Source Code | Prompts | Policies | Tests | Workflows | Configuration
  databases:
    - name: string
      platform: Supabase | Postgres | MySQL | Snowflake | BigQuery | Other
      environment: Sandbox | Non-Production | Production
      classification: Public | Internal | Confidential | Restricted
      owner: string
  containers:
    - name: string
      platform: Portainer | Docker | Kubernetes | ECS | Cloud Run | Other
      environment: Sandbox | Non-Production | Production
      image: string
      owner: string
  documentation:
    - name: string
      platform: Notion | Confluence | SharePoint | Google Drive | Markdown | Other
      location: string
      owner: string
      purpose: string
  mcp_servers:
    - name: string
      transport: stdio | http | sse | other
      location: string
      owner: string
      tools:
        - string
  external_services:
    - name: string
      vendor: string
      service_type: Model Provider | API | SaaS | Data Provider | Monitoring | Other
      owner: string
      purpose: string
  secrets:
    - name: string
      provider: Vault | AWS Secrets Manager | Doppler | 1Password | Environment | Other
      scope: string
      owner: string
      rotation_policy: string
      plaintext_allowed: false
  logs:
    - name: string
      source_asset: string
      location: string
      retention: string
      owner: string

evidence_sources:
  prompts:
    - asset: string
      location: string
  policies:
    - asset: string
      location: string
  logs:
    - asset: string
      location: string
  monitoring:
    - asset: string
      location: string
  approvals:
    - asset: string
      location: string
  workflows:
    - asset: string
      location: string
  configurations:
    - asset: string
      location: string

regulatory_scope:
  jurisdictions:
    - string
  regulations:
    - string

data:
  personal_data: boolean
  sensitive_data: boolean
  classification: Public | Internal | Confidential | Restricted
  retention: string

risk:
  tier: Low | Medium | High | Critical
  domains:
    - string
  known_risks:
    - string
```

## Asset Inventory Model

The asset inventory defines the governed boundary of the AI system.

| Asset Category | Governance Purpose | Evidence Examples |
| --- | --- | --- |
| `repositories` | Identify source code, prompts, policies, tests, workflows, and configuration that support the AI system. | Prompt files, policy files, workflow definitions, code owners, tests |
| `databases` | Identify data stores, schemas, data controls, classifications, and retention obligations. | Schemas, RLS policies, data inventories, access logs |
| `containers` | Identify deployed runtime components and runtime control surfaces. | Container configuration, deployment history, runtime logs |
| `documentation` | Identify human governance records and operating procedures. | Notion pages, approvals, committee notes, oversight procedures |
| `mcp_servers` | Identify agent tool surfaces exposed through MCP. | MCP server configuration, tool registry, tool execution logs |
| `external_services` | Identify third-party APIs, model providers, SaaS services, and data providers. | Vendor records, API configurations, service logs, access policies |
| `secrets` | Identify credentials and sensitive configuration required by the AI system. | Secret inventory, rotation records, access policies |
| `logs` | Identify operational, monitoring, audit, and runtime activity records. | Execution logs, monitoring results, exception logs, audit events |

## Evidence Source Integration

Asset inventory connects the AI system to evidence collection.

```text
Asset
-> Evidence Sources
-> Evidence Objects
-> Controls
-> Monitoring
-> Assurance
```

| Asset | Evidence Sources | Governance Use |
| --- | --- | --- |
| GitHub repository | Prompts, policies, model configuration, tests, workflow definitions | Prompt governance, control implementation, evidence provenance |
| Local repository | Development configuration, local documentation, implementation references | Onboarding review, implementation traceability |
| Supabase | Schema, RLS policies, data inventory, query logs | Data controls, privacy controls, retention evidence |
| Portainer | Container configuration, deployment history, runtime logs | Runtime governance, operational resilience, monitoring |
| Notion | Governance documentation, approvals, committee decisions | Human governance evidence and audit trail |
| External APIs | API configuration, vendor documentation, access logs | Tool governance, vendor risk, regulatory mapping |
| MCP servers | Tool registry, server configuration, execution logs | Agentic governance and tool permission assurance |
| Secrets | Secret inventory, rotation logs, access policy | Access control, secrets management, security evidence |
| Logs | Execution records, monitoring outputs, incident records | Continuous monitoring, findings, audit sampling |

## Manifest Validation Rules

### Required Fields

A manifest is invalid if any of the following are missing:

- `system.name`
- `owners.business_owner`
- `owners.risk_owner`
- `system.lifecycle_stage`
- `ai.type`
- `assets.repositories`
- `assets.databases`
- `assets.containers`
- `assets.documentation`
- `assets.mcp_servers`
- `assets.external_services`
- `assets.secrets`
- `assets.logs`
- At least one `evidence_sources` entry

### Validation Status

#### Valid

All required fields are present, required asset categories are declared, evidence sources are declared, owners are identified, lifecycle stage is declared, and the file can support AI system onboarding review.

#### Warning

Required fields are present, but the manifest has governance quality concerns.

Examples:

- Evidence sources exist but no approval sources are declared.
- Asset categories are present but several are empty without rationale.
- Risk domains are generic.
- Asset owners are incomplete.
- Lifecycle stage is not aligned to evidence.
- External services are declared without vendor or access evidence.
- Secrets are declared without rotation evidence.

#### Invalid

Required fields are missing or the manifest cannot support governance review.

Examples:

- Missing system name.
- Missing business owner or risk owner.
- Missing lifecycle stage.
- Missing AI type.
- Missing required asset category.
- No evidence sources declared.

## Travel Brain Example

```yaml
system:
  name: Travel Brain
  description: AI travel recommendation assistant for customer travel planning.
  lifecycle_stage: Production
  environment: Production
  business_purpose: Provide governed travel recommendations and planning support.
  system_boundary: GitHub repository, local development repository, Supabase data store, Portainer runtime, Notion governance workspace, external travel APIs, MCP servers, secrets, and operational logs.

owners:
  business_owner: Sarah Chen
  technology_owner: Michael Thompson
  risk_owner: Russell
  executive_sponsor: David Kim

ai:
  type: Assistant
  agentic_level: 1
  authority_level: 1
  customer_facing: true
  autonomous_action: false
  financial_transaction: false
  ai_components:
    models:
      - name: GPT-5 recommendation model
        provider: OpenAI
        version: GPT-5
        source_asset: GitHub - Travel Brain
    prompts:
      - name: Travel planning prompt
        source_asset: GitHub - Travel Brain
        location: prompts/travel-planner.md
        owner: Sarah Chen
    agents:
      - name: Travel Brain assistant
        source_asset: GitHub - Travel Brain
        purpose: Coordinate prompt, model, and read-only travel tools.
    tools:
      - name: Weather API
        permission: Read
        source_asset: External API - Weather Provider
      - name: Destination Content API
        permission: Read
        source_asset: External API - Destination Content Provider

assets:
  repositories:
    - name: GitHub - Travel Brain
      repository_type: GitHub
      location: https://github.com/example-bank/travel-brain
      owner: Michael Thompson
      contains:
        - Source Code
        - Prompts
        - Policies
        - Tests
        - Workflows
        - Configuration
    - name: Local Repository - Travel Brain
      repository_type: Local
      location: /Users/russell/Projects/travel-brain
      owner: Russell
      contains:
        - Source Code
        - Local Configuration
        - Implementation Notes
  databases:
    - name: Supabase - Travel Brain
      platform: Supabase
      environment: Production
      classification: Confidential
      owner: Michael Thompson
  containers:
    - name: Portainer - travel-brain-web
      platform: Portainer
      environment: Production
      image: registry.example-bank.com/travel-brain/web:2026.06
      owner: Michael Thompson
  documentation:
    - name: Notion - Travel Brain Governance Workspace
      platform: Notion
      location: https://notion.example-bank.com/travel-brain-governance
      owner: Sarah Chen
      purpose: Human oversight procedures, production approval records, committee decisions, and governance operating documentation.
  mcp_servers:
    - name: Travel Brain MCP Server
      transport: stdio
      location: mcp/travel-brain-server
      owner: Michael Thompson
      tools:
        - destination_search
        - itinerary_lookup
        - policy_check
  external_services:
    - name: External API - Weather Provider
      vendor: Example Weather Co.
      service_type: API
      owner: Michael Thompson
      purpose: Retrieve destination weather context for recommendations.
    - name: External API - Destination Content Provider
      vendor: Example Travel Content Co.
      service_type: Data Provider
      owner: Sarah Chen
      purpose: Retrieve destination descriptions and travel content.
    - name: OpenAI API
      vendor: OpenAI
      service_type: Model Provider
      owner: Michael Thompson
      purpose: Generate travel planning responses.
  secrets:
    - name: OPENAI_API_KEY
      provider: 1Password
      scope: Travel Brain production model access
      owner: Michael Thompson
      rotation_policy: Quarterly rotation and immediate rotation on suspected exposure.
      plaintext_allowed: false
    - name: SUPABASE_SERVICE_ROLE_KEY
      provider: 1Password
      scope: Travel Brain production database access
      owner: Michael Thompson
      rotation_policy: Quarterly rotation with access review.
      plaintext_allowed: false
    - name: WEATHER_API_TOKEN
      provider: 1Password
      scope: Weather provider API access
      owner: Michael Thompson
      rotation_policy: Annual rotation or vendor-triggered rotation.
      plaintext_allowed: false
  logs:
    - name: Recommendation Activity Logs
      source_asset: Portainer - travel-brain-web
      location: logs/recommendations/*.jsonl
      retention: 18 months
      owner: Michael Thompson
    - name: Monitoring Results
      source_asset: GitHub - Travel Brain
      location: monitoring/travel-brain-control-health.json
      retention: 18 months
      owner: Russell
    - name: Supabase Query Logs
      source_asset: Supabase - Travel Brain
      location: supabase/logs/query
      retention: 12 months
      owner: Michael Thompson

evidence_sources:
  prompts:
    - asset: GitHub - Travel Brain
      location: prompts/travel-planner.md
  policies:
    - asset: GitHub - Travel Brain
      location: governance/tool-policy.yaml
    - asset: GitHub - Travel Brain
      location: governance/human-oversight.md
  logs:
    - asset: Portainer - travel-brain-web
      location: logs/recommendations/*.jsonl
    - asset: Supabase - Travel Brain
      location: supabase/logs/query
  monitoring:
    - asset: GitHub - Travel Brain
      location: monitoring/travel-brain-control-health.json
  approvals:
    - asset: Notion - Travel Brain Governance Workspace
      location: Production Approval Record
  workflows:
    - asset: GitHub - Travel Brain
      location: .github/workflows/control-tests.yaml
  configurations:
    - asset: Portainer - travel-brain-web
      location: container configuration
    - asset: Supabase - Travel Brain
      location: schema and RLS policies

regulatory_scope:
  jurisdictions:
    - Canada
    - United States
    - United Kingdom
    - European Union
    - Japan
  regulations:
    - OSFI E-23
    - OCC/Fed/FDIC Model Risk and Operational Resilience
    - FCA Operational Resilience
    - EU AI Act
    - Japan FSA AI Supervisory Expectations

data:
  personal_data: true
  sensitive_data: false
  classification: Confidential
  retention: Governed by travel preference retention policy.

risk:
  tier: Medium
  domains:
    - Hallucination Risk
    - Privacy Risk
    - Explainability Risk
    - Third-Party Risk
    - Tool Misuse Risk
  known_risks:
    - Hallucinated Recommendation
    - Privacy Exposure
    - Incorrect Travel Guidance
```

## Autonomous Payment Agent Example

```yaml
system:
  name: Autonomous Payment Agent
  description: Agentic AI pilot for controlled payment exception handling.
  lifecycle_stage: Pilot
  environment: Non-Production
  business_purpose: Test approval-gated autonomous payment exception workflows.
  system_boundary: Source repository, non-production data store, approval workflow, payment API sandbox, runtime logs, MCP tool server, and secrets.

owners:
  business_owner: Sarah Chen
  technology_owner: Michael Thompson
  risk_owner: Russell
  executive_sponsor: David Kim

ai:
  type: Agent
  agentic_level: 4
  authority_level: 4
  customer_facing: false
  autonomous_action: true
  financial_transaction: true
  ai_components:
    models:
      - name: Payment exception reasoning model
        provider: OpenAI
        version: GPT-5
        source_asset: GitHub - Autonomous Payment Agent
    agents:
      - name: Autonomous Payment Agent
        source_asset: GitHub - Autonomous Payment Agent
        purpose: Execute approved non-production payment exception scenarios.
    tools:
      - name: Payment API
        permission: Execute
        source_asset: External API - Payment Sandbox
      - name: Fraud Signal API
        permission: Read
        source_asset: External API - Fraud Signals

assets:
  repositories:
    - name: GitHub - Autonomous Payment Agent
      repository_type: GitHub
      location: https://github.com/example-bank/autonomous-payment-agent
      owner: Michael Thompson
      contains:
        - Source Code
        - Policies
        - Workflows
        - Configuration
  databases:
    - name: Payment Agent Pilot Store
      platform: Postgres
      environment: Non-Production
      classification: Restricted
      owner: Michael Thompson
  containers:
    - name: Payment Agent Runtime
      platform: Docker
      environment: Non-Production
      image: registry.example-bank.com/payment-agent/pilot:2026.06
      owner: Michael Thompson
  documentation:
    - name: Payment Agent Pilot Governance Record
      platform: Notion
      location: https://notion.example-bank.com/payment-agent-pilot
      owner: Sarah Chen
      purpose: Pilot approval, risk acceptance, transaction limit review, and dual approval decisions.
  mcp_servers:
    - name: Payment Agent MCP Server
      transport: stdio
      location: mcp/payment-agent-server
      owner: Michael Thompson
      tools:
        - payment_lookup
        - exception_classification
        - approval_status_check
  external_services:
    - name: External API - Payment Sandbox
      vendor: Example Payments Platform
      service_type: API
      owner: Michael Thompson
      purpose: Execute non-production payment exception simulations.
    - name: External API - Fraud Signals
      vendor: Example Fraud Signals Co.
      service_type: API
      owner: Michael Thompson
      purpose: Retrieve fraud context for exception handling.
  secrets:
    - name: PAYMENT_SANDBOX_TOKEN
      provider: 1Password
      scope: Payment sandbox API access
      owner: Michael Thompson
      rotation_policy: Monthly rotation during pilot.
      plaintext_allowed: false
  logs:
    - name: Payment Agent Execution Logs
      source_asset: Payment Agent Runtime
      location: logs/payment-agent/execution/*.jsonl
      retention: 18 months
      owner: Michael Thompson

evidence_sources:
  policies:
    - asset: GitHub - Autonomous Payment Agent
      location: agent-policy/payment-agent/tool-policy.yaml
    - asset: GitHub - Autonomous Payment Agent
      location: agent-policy/payment-agent/transaction-limits.yaml
  logs:
    - asset: Payment Agent Runtime
      location: logs/payment-agent/execution/*.jsonl
  monitoring:
    - asset: GitHub - Autonomous Payment Agent
      location: monitoring/payment-agent-control-health.json
  approvals:
    - asset: Payment Agent Pilot Governance Record
      location: Pilot Approval
    - asset: Payment Agent Pilot Governance Record
      location: Dual Approval Workflow Review
  workflows:
    - asset: GitHub - Autonomous Payment Agent
      location: workflows/payment-dual-approval.yaml

regulatory_scope:
  jurisdictions:
    - Canada
    - United States
  regulations:
    - OSFI E-23
    - OCC/Fed/FDIC Operational Resilience

data:
  personal_data: true
  sensitive_data: true
  classification: Restricted
  retention: Pilot data retained only for governance review and audit sampling.

risk:
  tier: Critical
  domains:
    - Tool Misuse Risk
    - Autonomy Risk
    - Approval Bypass Risk
    - Runaway Automation Risk
    - Operational Impact
  known_risks:
    - Unauthorized Transaction
    - Approval Bypass
    - Runaway Automation
```

## How The Manifest Supports Governance

The manifest supports governance by making core AI system facts explicit before onboarding review:

- It declares the system and owners.
- It defines the full AI system asset boundary.
- It identifies AI-specific components.
- It connects assets to evidence sources.
- It provides risk and regulatory context.
- It lets discovery compare declared assets with detected assets.
- It gives audit a starting point for traceability.

## How The Manifest Supports Audit

Auditors can use `AI Governance.yaml` to understand:

- Who owns the AI system.
- What the AI system is intended to do.
- Which assets make up the AI system.
- Which assets require governance.
- Which evidence sources should exist.
- Which controls should be sampled.
- Whether declared evidence aligns with the governed system boundary.

## How The Manifest Supports Onboarding

Repository onboarding should check for `AI Governance.yaml`.

If present:

- Parse the manifest.
- Validate required sections.
- Build the AI system asset inventory.
- Use manifest values to seed suggested governance profile fields.
- Use manifest assets to seed evidence source discovery.
- Use manifest evidence sources to create evidence source records.
- Route the result for human review.

If absent:

- Generate onboarding finding `AI-GOV-MANIFEST-001`.
- Mark the repository or system as incomplete for governance onboarding.
- Prevent approval until ownership, lifecycle, AI type, risk scope, asset inventory, and evidence sources are declared.

## Future Automation

Future platform automation can use `AI Governance.yaml` to operationalize governance without making final governance decisions automatically.

### Asset Discovery

The platform can compare declared assets against discovered assets from GitHub, local repositories, Supabase, Portainer, Notion, MCP registries, external service configuration, secret managers, and log sources.

### Evidence Collection

The platform can collect or link evidence from:

- Git repositories
- Prompt repositories
- Policy files
- Supabase schemas and access policies
- Portainer container configuration
- Notion governance records
- MCP server configuration
- Runtime logs
- Monitoring outputs
- Approval workflows
- Secret rotation records

### Governance Automation

The platform can use the manifest to:

- Pre-populate onboarding forms.
- Generate suggested controls.
- Generate suggested risks.
- Generate evidence source records.
- Detect missing evidence sources.
- Detect undeclared assets.
- Monitor manifest drift over time.
- Create audit packages with manifest provenance.
- Trigger evidence freshness checks.

### Repository Onboarding

Repository onboarding remains important, but it becomes part of a larger AI system onboarding process. A repository may contain code and prompts, but it may not contain the database, runtime, documentation, secrets, logs, or approval records that make the system governable.

### Evidence Source Discovery

Evidence source discovery should begin with the asset inventory:

```text
Declared Asset
-> Expected Evidence Source
-> Collected Evidence Object
-> Control Assurance
```

The manifest is not a replacement for governance review. It is the AI-system-native starting point for governance by design.
