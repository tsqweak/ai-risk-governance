# Platform Review Package

Purpose: single-file platform review artifact for ChatGPT, CIO, CRO, Internal Audit, and Risk Committee review.

Generated: 2026-06-16T01:44:32.113Z

## Package Contents
- Platform Review Report
- Route Inventory
- Feature Inventory
- Evidence Inventory
- Connector Inventory
- Open Issues
- Architecture Drift Review
- Navigation Inventory
- Screenshot Manifest
- Current State Summary
- Supabase Status
- MCP Status
- Notion Status
- Secrets Status
- Asset Discovery Status
- Connector Consistency Review
- Discovery Validation Summary
- Discovery Confidence
- Validated Findings
- Invalid Findings
- Discovery Findings
- Inventory Completeness
- Known vs Discovered Assets
- Governance Status Report
- Future ZIP Packaging Design

## Current State Summary
Platform maturity: Level 3+ MVP, approaching Level 4 Operational for the Travel Brain evidence operations reference scope.

Current focus: Post-9X - Connector consistency cleanup

Next recommended work: Move to connector consistency cleanup, then UX Refactor 2 and Phase 10 Analytics & Trends.

### Major Strengths
- Evidence & Assurance is the canonical proof layer.
- GitHub evidence collection supports real artifacts, snapshots, commit SHA, artifact hash, provenance, assurance, and traceability.
- Logs evidence provides inspectable sanitized runtime proof without collecting customer content or sensitive payloads.
- Portainer is healthy by local validation, and the platform preserves explicit gap evidence when the Codex runtime cannot reach the private LAN endpoint.
- Supabase evidence now proves data-governance reality with real metadata, historical snapshots, drift review, control validation, and generated findings.
- MCP evidence now proves actual agent capability through server, tool, permission, authority, and capability metadata.
- Notion connector-ready evidence now makes human-governance source gaps explicit instead of inventing approval or committee records.
- Secrets metadata evidence now proves inventory, rotation, ownership, usage mapping, and plaintext-prohibition boundaries without collecting secret values.
- Asset Discovery now compares declared Travel Brain assets against repository, workflow, connector, documentation, runtime, and metadata signals to find forgotten assets.
- Control detail pages now connect governance story, evidence, validation, assurance, failure scenario, owner, and traceability.
- Platform Review centralizes route, feature, evidence, navigation, drift, and open-issue review.

### Major Weaknesses
- Global navigation still exposes more destinations than the long-term hub architecture recommends.
- Legacy and review-candidate routes remain visible for compatibility.
- Current Portainer run has source-gap evidence only because Codex cannot reach the private LAN endpoint; this is a Private Infrastructure Access Limitation, not a Portainer outage.
- Supabase evidence is operational, though generated RLS or privileged-role findings may remain open until reviewed.
- MCP evidence includes real metadata but has tool-permission and authority classification warnings for policy review.
- Notion human-governance evidence is connector-ready, but scoped governance content is unavailable until a shared Travel Brain source is configured.
- Secrets metadata evidence is MVP and intentionally warning-heavy where rotation metadata or ownership is unknown.
- Asset Discovery is MVP and now validates findings before inventory counts; denied-only or unsupported inferences remain visible as invalid findings instead of trusted assets.
- The review package does not yet capture real screenshots or produce a ZIP bundle.
- Historical platform review runs are not yet persisted.

### Top Risks
- 10 open platform review issue(s) require follow-up.
- 15 open finding(s) remain across the governed portfolio.
- 10 validated or warning-level asset discovery finding(s) need inventory review.
- No major connector evidence domain remains planned; current risk shifts to MVP maturation, source warnings, and discovery coverage.
- 17 evidence source issue(s) remain visible.

### Top Technical Debt
- Route ownership metadata is inferred from paths rather than explicitly declared.
- Feature maturity parsing depends on Feature Registry markdown structure.
- Automated screenshot capture and downloadable ZIP packaging are designed but not implemented.
- Review history is not persisted, so drift over time is not yet measurable.

### Top UX Issues
- Global sidebar remains above the recommended hub count.
- Evidence workflows still have legacy direct routes outside Evidence & Assurance.
- Auditor and Auditor Workspace surfaces need final consolidation.
- Governance Operations is still reachable as a standalone route while also belonging to Evidence & Assurance.
- Travel Brain Pilot and AI Manifest still need final placement under Administration/onboarding.

## Supabase Status
| Item | Status |
| --- | --- |
| Connector status | Operational |
| Connector maturity | Level 4 - Operational |
| Governance metadata collection | Collected from real read-only Supabase/Postgres metadata |
| Evidence artifacts | 4 |
| Valid evidence artifacts | 2 |
| Historical snapshots | 2 |
| Drift events | 8 |
| Control validations | 5 |
| Source issues | 2 |
| Schema inventory | Collected |
| Table inventory | Collected |
| RLS status | Collected with review warnings |
| Policy inventory | Collected with review warnings |
| Role inventory | Collected with review warnings |
| Extension inventory | Collected |
| Database version | Collected |
| Privacy boundary | No row data, customer content, secrets, credentials, tokens, API keys, or sensitive payloads collected |
| Recommended action | Review any generated Supabase findings and continue scheduled data-governance collection |

## MCP Status
| Item | Status |
| --- | --- |
| Connector status | MVP |
| Connector maturity | Level 3 - MVP |
| Governance metadata collection | Collected from real Travel Brain MCP source metadata |
| Evidence artifacts | 4 |
| Valid evidence artifacts | 2 |
| Source issues | 2 |
| Server inventory | Collected |
| Tool registry | Collected |
| Tool permissions | Collected with review warnings |
| Authority registry | Collected with review warnings |
| Capability inventory | Collected |
| Privacy boundary | No prompts, customer content, tool inputs, tool outputs, secrets, credentials, or sensitive payloads collected |
| Recommended action | Review unclassified write-capable MCP tools and update governance/tool-policy.yaml before moving MCP toward Operational |

## Notion Status
| Item | Status |
| --- | --- |
| Connector status | Partial |
| Connector maturity | Level 2 - Prototype |
| Governance metadata collection | Connector-ready; scoped Travel Brain governance content unavailable; explicit gap artifacts created |
| Evidence artifacts | 5 |
| Valid evidence artifacts | 0 |
| Source issues | 6 |
| Governance pages | Not collected |
| Governance databases | Not collected |
| Approval records | Not collected |
| Review records | Not collected |
| Committee records | Not collected |
| Ownership records | Not collected |
| Privacy boundary | No personal notes, unrelated workspace content, customer content, secrets, credentials, or unnecessary page body content collected |
| Recommended action | Share a scoped Travel Brain Notion page or database with the integration and configure the token/source ID, then rerun collection |

## Secrets Status
| Item | Status |
| --- | --- |
| Connector status | MVP |
| Connector maturity | Level 3 - MVP |
| Governance metadata collection | Collected from metadata-only Travel Brain secret source names and declared secret records |
| Evidence artifacts | 4 |
| Valid evidence artifacts | 2 |
| Source issues | 2 |
| Secret inventory | Collected |
| Rotation evidence | Collected with review warnings |
| Ownership evidence | Collected with review warnings |
| Usage mapping | Collected |
| Supported sources | Environment Variables, GitHub Secrets, Supabase Secrets, Portainer Secrets, Local Secret Stores |
| Privacy boundary | No secret values, tokens, passwords, API key values, certificates, private keys, connection strings, customer content, or sensitive payloads collected, stored, displayed, logged, hashed, exported, or persisted |
| Recommended action | Resolve stale rotation metadata, unknown rotation metadata, disconnected source metadata, and missing ownership warnings before moving Secrets toward Operational |

## Connector Consistency Review
| Connector | Reviewed Warning Sources | Cleanup Decision | Rationale |
| --- | --- | --- | --- |
| GitHub | SRC-TB-GH-REVIEWS; SRC-TB-GH-WORKFLOWS | Warnings retained | Review metadata remains stale and workflow monitoring linkage remains a real assurance warning; repository artifacts themselves are valid and current. |
| Logs | Runtime log sources | No warnings retained | Execution, monitoring, control-result, and audit-event metadata are validated/current/on-track. |
| Portainer | SRC-TB-PORT-CONTAINER; SRC-TB-PORT-DEPLOYMENT; SRC-TB-PORT-RUNTIME | Warnings retained as Private Infrastructure Access Limitation | Local validation confirms Portainer is healthy at the private LAN endpoint, but Codex runtime cannot reach that endpoint. Use the Portainer Evidence Export Pattern for governance collection instead of classifying this as a Portainer outage. |
| Supabase | SRC-TB-SUPABASE-ACCESS; SRC-TB-SUPABASE-RLS | Warnings retained | Real metadata was collected, but RLS policy and privileged-role validation generated review warnings. |
| MCP | SRC-TB-MCP-AUTHORITY; SRC-TB-MCP-PERMISSIONS | Warnings retained | Real MCP metadata was collected, but write-capable tools still need explicit policy and authority classification. |
| Secrets | SRC-TB-SECRETS-OWNERSHIP; SRC-TB-SECRETS-ROTATION | Warnings retained | Metadata-only evidence is collected, but stale or unknown rotation metadata and missing ownership metadata remain real governance warnings. |
| Notion | SRC-TB-NOTION-* | Warnings retained with wording cleanup | Connector model and gap artifacts work; scoped Travel Brain governance content is unavailable, so warnings now describe a governed content-source gap rather than a connector failure. |

## Asset Discovery Status
| Item | Status |
| --- | --- |
| Engine status | MVP |
| Engine maturity | Level 3 - MVP |
| Latest run | DISC-TB-2026-06-15-001 |
| Discovery sources | 13 |
| Discovery findings | 14 |
| Valid findings | 7 |
| Warning findings | 5 |
| Invalid findings | 2 |
| Open/review findings | 10 |
| Inventory completeness | 17% |
| Known assets | 2 |
| Discovered assets | 9 |
| Unknown assets | 3 |
| Untracked assets | 4 |
| Orphaned assets | 0 |
| Missing assets | 3 |
| Discovery boundary | Compares manifest declarations against repository, workflow, configuration, documentation, connector metadata, runtime metadata, and secrets metadata without requiring AI Governance.yaml to be complete |
| Recommended action | Review untracked Supabase, MCP, Secrets, external APIs, workflow monitoring, and source-gap findings before connector consistency cleanup. |

## Discovery Validation Summary
| Metric | Value |
| --- | --- |
| Valid findings | 7 |
| Warning findings | 5 |
| Invalid findings | 2 |
| Validation basis | Findings are counted in inventory completeness only when validation status is VALID or WARNING. INVALID findings remain visible for review but are excluded from inventory counts. |
| Primary cleanup result | Denied-tool-only and disconnected conceptual source findings are downgraded to INVALID instead of trusted as discovered assets. |

## Discovery Confidence
| Level | Count | Definition |
| --- | --- | --- |
| High | 7 | Direct configuration, manifest, workflow, or connector evidence. |
| Medium | 5 | Multiple indirect references or source-gap evidence that still needs reviewer confirmation. |
| Low | 2 | Weak inference, denied-only reference, or disconnected conceptual source. |

## Validated Findings
| Finding | Validation | Confidence | Asset | Source File | Source Asset | Rule | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DISC-TB-MISSING-NOTION-001 | WARNING | MEDIUM/68% | Notion - Travel Brain Governance Workspace | Notion connector gap artifacts | Notion - Travel Brain Governance Workspace | Create a warning when an expected evidence source is absent or inaccessible. | Notion connection and evidence gap artifacts exist, but scoped Notion source metadata is not available. |
| DISC-TB-MISSING-PORTAINER-001 | WARNING | MEDIUM/70% | Portainer - travel-brain-web | Portainer connector metadata | Portainer - travel-brain-web | Create a finding when source evidence indicates an asset outside the declared inventory. | Portainer connector exists, but this run has only a deployment gap artifact and no real container metadata. |
| DISC-TB-KNOWN-GITHUB-001 | VALID | HIGH/95% | GitHub - Travel Brain | reference-repositories/travel-brain | GitHub - Travel Brain | Compare discovered connector/repository evidence against AI Governance.yaml declarations. | Manifest declares GitHub - Travel Brain; repository connection REPO-TB-GITHUB-001 is present. |
| DISC-TB-KNOWN-LOGS-001 | VALID | HIGH/92% | Recommendation Activity Logs | reference-repositories/travel-brain/AI Governance.yaml | AI Governance.yaml | Compare discovered connector/repository evidence against AI Governance.yaml declarations. | Manifest declares Recommendation Activity Logs; 4 log source(s) and 5 runtime evidence artifact(s) exist. |
| DISC-TB-UNDECLARED-MCP-001 | VALID | HIGH/96% | Travel Brain MCP Server | MCP connector metadata | Travel Brain MCP Server | Compare discovered connector/repository evidence against AI Governance.yaml declarations. | 1 MCP connection(s) and 4 MCP artifact(s) exist, but AI Governance.yaml does not declare MCP servers. |
| DISC-TB-UNDECLARED-SECRETS-001 | WARNING | MEDIUM/94% | Travel Brain Secrets Sources | Secrets metadata connector artifacts | Travel Brain Secrets Sources | Compare discovered connector/repository evidence against AI Governance.yaml declarations. | 7 secret metadata record(s) exist across 5 source system connection(s); AI Governance.yaml does not declare secrets. |
| DISC-TB-UNDECLARED-SUPABASE-001 | VALID | HIGH/96% | Supabase - Travel Brain | Supabase connector metadata | Supabase - Travel Brain | Compare discovered connector/repository evidence against AI Governance.yaml declarations. | 1 Supabase connection(s) and 4 Supabase evidence artifact(s) exist, but AI Governance.yaml does not declare a databases section. |
| DISC-TB-UNKNOWN-API-001 | VALID | HIGH/88% | Weather API | reference-repositories/travel-brain/governance/tool-policy.yaml | Weather API | Create an unknown integration finding when an API name appears in approved tool policy or metadata-backed usage mapping but not in AI Governance.yaml external services. | Weather API appears in tool policy or secrets usage mapping but is not declared as an external service in AI Governance.yaml. |
| DISC-TB-UNKNOWN-API-002 | VALID | HIGH/88% | Destination Content API | reference-repositories/travel-brain/governance/tool-policy.yaml | Destination Content API | Create an unknown integration finding when an API name appears in approved tool policy or metadata-backed usage mapping but not in AI Governance.yaml external services. | Destination Content API appears in tool policy or secrets usage mapping but is not declared as an external service in AI Governance.yaml. |
| DISC-TB-UNKNOWN-API-004 | WARNING | MEDIUM/72% | OpenAI API | reference-repositories/travel-brain/governance/tool-policy.yaml | OpenAI API | Create an unknown integration finding when an API name appears in approved tool policy or metadata-backed usage mapping but not in AI Governance.yaml external services. | OpenAI API appears in tool policy or secrets usage mapping but is not declared as an external service in AI Governance.yaml. |
| DISC-TB-GAP-DOCKER-FILES-001 | WARNING | MEDIUM/70% | Container build/runtime configuration files | reference-repositories/travel-brain/Dockerfile | Container build/runtime configuration files | Create a warning when an expected evidence source is absent or inaccessible. | No Dockerfile or docker-compose.yml was found in the Travel Brain reference repository. |
| DISC-TB-UNTRACKED-WORKFLOW-001 | VALID | HIGH/90% | GitHub Actions governance monitoring workflow | reference-repositories/travel-brain/.github/workflows/control-tests.yaml | GitHub Actions workflow | Create a finding when an operational dependency appears in workflow/configuration but is not represented as an asset. | Workflow runs `npm run governance:monitoring:export`, but no monitoring system asset is declared. |

## Invalid Findings
| Finding | Asset | Source File | Evidence | Invalid Reason |
| --- | --- | --- | --- | --- |
| DISC-TB-ORPHAN-LOCAL-SECRETS-001 | Local Secret Stores | Secrets metadata connector artifacts | Local Secret Stores source exists in supported source list but is disconnected in this discovery run. | Conceptual supported source with disconnected status is seed/configuration scope, not discovered asset evidence. |
| DISC-TB-UNKNOWN-API-003 | Booking API | reference-repositories/travel-brain/governance/tool-policy.yaml | Booking API appears in tool policy or secrets usage mapping but is not declared as an external service in AI Governance.yaml. | Denied tool references are not evidence of an active integration. |

## Discovery Findings
| Finding | Type | Disposition | Validation | Asset | Source | Confidence | Status | Recommended Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DISC-TB-MISSING-NOTION-001 | MISSING_EVIDENCE_SOURCE | MISSING_ASSET | WARNING | Notion - Travel Brain Governance Workspace | Notion connector gap artifacts | MEDIUM/68% | OPEN | Configure scoped Travel Brain Notion access or record the governed documentation source another way. |
| DISC-TB-MISSING-PORTAINER-001 | DECLARED_ASSET_MISSING | MISSING_ASSET | WARNING | Portainer - travel-brain-web | Portainer connector metadata | MEDIUM/70% | OPEN | Reconnect Portainer metadata collection and add container declaration to AI Governance.yaml. |
| DISC-TB-KNOWN-GITHUB-001 | UNDECLARED_ASSET_FOUND | KNOWN_ASSET | VALID | GitHub - Travel Brain | Repository connection and AI Governance.yaml | HIGH/95% | RESOLVED | No action required beyond scheduled connector collection. |
| DISC-TB-KNOWN-LOGS-001 | UNDECLARED_ASSET_FOUND | KNOWN_ASSET | VALID | Recommendation Activity Logs | AI Governance.yaml and runtime log sources | HIGH/92% | RESOLVED | Keep log retention and runtime evidence collection current. |
| DISC-TB-UNDECLARED-MCP-001 | UNDECLARED_ASSET_FOUND | UNTRACKED_ASSET | VALID | Travel Brain MCP Server | MCP governance metadata | HIGH/96% | REVIEW_REQUIRED | Declare MCP servers and map tool permissions, authority, and capability evidence to the manifest. |
| DISC-TB-UNDECLARED-SECRETS-001 | UNDECLARED_ASSET_FOUND | UNTRACKED_ASSET | WARNING | Travel Brain Secrets Sources | Secrets metadata connector | MEDIUM/94% | REVIEW_REQUIRED | Add metadata-only secrets source declarations and owner/rotation expectations to AI Governance.yaml. |
| DISC-TB-UNDECLARED-SUPABASE-001 | UNDECLARED_ASSET_FOUND | UNTRACKED_ASSET | VALID | Supabase - Travel Brain | Supabase connector metadata | HIGH/96% | REVIEW_REQUIRED | Add a databases section to AI Governance.yaml and confirm owner, retention, privacy, and RLS evidence requirements. |
| DISC-TB-UNKNOWN-API-001 | UNKNOWN_INTEGRATION_FOUND | UNKNOWN_ASSET | VALID | Weather API | Tool policy and secrets usage metadata | HIGH/88% | REVIEW_REQUIRED | Confirm whether this integration should be governed as an external service and add vendor/data-use evidence sources. |
| DISC-TB-UNKNOWN-API-002 | UNKNOWN_INTEGRATION_FOUND | UNKNOWN_ASSET | VALID | Destination Content API | Tool policy and secrets usage metadata | HIGH/88% | REVIEW_REQUIRED | Confirm whether this integration should be governed as an external service and add vendor/data-use evidence sources. |
| DISC-TB-UNKNOWN-API-004 | UNKNOWN_INTEGRATION_FOUND | UNKNOWN_ASSET | WARNING | OpenAI API | Tool policy and secrets usage metadata | MEDIUM/72% | REVIEW_REQUIRED | Confirm whether this integration should be governed as an external service and add vendor/data-use evidence sources. |
| DISC-TB-GAP-DOCKER-FILES-001 | MISSING_EVIDENCE_SOURCE | MISSING_ASSET | WARNING | Container build/runtime configuration files | Dockerfile and Docker Compose scan | MEDIUM/70% | REVIEW_REQUIRED | Add runtime configuration evidence source or document why deployment configuration is managed outside the repository. |
| DISC-TB-ORPHAN-LOCAL-SECRETS-001 | ORPHANED_ASSET | ORPHANED_ASSET | INVALID | Local Secret Stores | Secrets metadata source status | LOW/30% | REVIEW_REQUIRED | Confirm whether local secret stores are in scope; disable the source or add safe metadata collection. |
| DISC-TB-UNKNOWN-API-003 | UNKNOWN_INTEGRATION_FOUND | UNKNOWN_ASSET | INVALID | Booking API | Tool policy and secrets usage metadata | LOW/35% | REVIEW_REQUIRED | Keep the denied-tool boundary as policy evidence, but do not add Booking API to discovered asset inventory unless runtime or configuration evidence appears. |
| DISC-TB-UNTRACKED-WORKFLOW-001 | UNTRACKED_DEPENDENCY | UNTRACKED_ASSET | VALID | GitHub Actions governance monitoring workflow | GitHub workflow file | HIGH/90% | REVIEW_REQUIRED | Decide whether governance monitoring should be represented as a monitoring-system asset or evidence source. |

## Inventory Completeness
| Metric | Value |
| --- | --- |
| Validated declared findings | 3 |
| Validated discovered findings | 9 |
| Validated tracked findings | 7 |
| Untracked findings | 4 |
| Unknown findings | 3 |
| Missing findings | 3 |
| Orphaned findings | 0 |
| Open or review findings | 10 |
| Inventory completeness | 17% |

## Known vs Discovered Assets
| Asset | Type | Declared | Discovered | Tracked | Disposition | Validation | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Notion - Travel Brain Governance Workspace | DOCUMENTATION | No | No | Yes | MISSING_ASSET | WARNING | Notion connection and evidence gap artifacts exist, but scoped Notion source metadata is not available. |
| Portainer - travel-brain-web | CONTAINER | No | No | Yes | MISSING_ASSET | WARNING | Portainer connector exists, but this run has only a deployment gap artifact and no real container metadata. |
| GitHub - Travel Brain | REPOSITORY | Yes | Yes | Yes | KNOWN_ASSET | VALID | Manifest declares GitHub - Travel Brain; repository connection REPO-TB-GITHUB-001 is present. |
| Recommendation Activity Logs | LOG_SOURCE | Yes | Yes | Yes | KNOWN_ASSET | VALID | Manifest declares Recommendation Activity Logs; 4 log source(s) and 5 runtime evidence artifact(s) exist. |
| Travel Brain MCP Server | MCP_SERVER | No | Yes | Yes | UNTRACKED_ASSET | VALID | 1 MCP connection(s) and 4 MCP artifact(s) exist, but AI Governance.yaml does not declare MCP servers. |
| Travel Brain Secrets Sources | SECRETS_SOURCE | No | Yes | Yes | UNTRACKED_ASSET | WARNING | 7 secret metadata record(s) exist across 5 source system connection(s); AI Governance.yaml does not declare secrets. |
| Supabase - Travel Brain | DATABASE | No | Yes | Yes | UNTRACKED_ASSET | VALID | 1 Supabase connection(s) and 4 Supabase evidence artifact(s) exist, but AI Governance.yaml does not declare a databases section. |
| Weather API | EXTERNAL_API | No | Yes | No | UNKNOWN_ASSET | VALID | Weather API appears in tool policy or secrets usage mapping but is not declared as an external service in AI Governance.yaml. |
| Destination Content API | EXTERNAL_API | No | Yes | No | UNKNOWN_ASSET | VALID | Destination Content API appears in tool policy or secrets usage mapping but is not declared as an external service in AI Governance.yaml. |
| OpenAI API | EXTERNAL_API | No | Yes | No | UNKNOWN_ASSET | WARNING | OpenAI API appears in tool policy or secrets usage mapping but is not declared as an external service in AI Governance.yaml. |
| Container build/runtime configuration files | CONFIGURATION | No | No | No | MISSING_ASSET | WARNING | No Dockerfile or docker-compose.yml was found in the Travel Brain reference repository. |
| GitHub Actions governance monitoring workflow | MONITORING_SYSTEM | Yes | Yes | No | UNTRACKED_ASSET | VALID | Workflow runs `npm run governance:monitoring:export`, but no monitoring system asset is declared. |

## Route Inventory
| Route | Type | Category | Status |
| --- | --- | --- | --- |
| / | Hub | Hub | ACTIVE |
| /administration | Hub | Hub | ACTIVE |
| /agentic-governance | Workbench | Operational | ACTIVE |
| /ai-governance | Workbench | Operational | ACTIVE |
| /ai-lifecycle | Workbench | Operational | ACTIVE |
| /ai-risk | Dashboard | Dashboard | ACTIVE |
| /audit-packages | Evidence Workbench | Evidence | REVIEW |
| /auditor | Workbench | Operational | REVIEW |
| /auditor-workspace | Workbench | Operational | ACTIVE |
| /control-health | Dashboard | Dashboard | REVIEW |
| /controls | Workbench | Operational | ACTIVE |
| /controls/[controlId] | Object Detail | Object Detail | ACTIVE |
| /deployment-evidence/[id] | Object Detail | Evidence | ACTIVE |
| /evidence | Evidence Workbench | Evidence | REVIEW |
| /evidence-artifacts/[id] | Object Detail | Evidence | ACTIVE |
| /evidence-artifacts/[id]/drift | Object Detail | Evidence | ACTIVE |
| /evidence-assurance | Hub | Hub | ACTIVE |
| /evidence-assurance/artifacts | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/asset-discovery | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/assurance | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/data-governance | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/deployments | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/drift | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/governance-evidence | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/health | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/mcp-governance | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/packages | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/repository | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/runtime | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/secrets-governance | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/snapshots | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/sources | Evidence Workbench | Evidence | ACTIVE |
| /evidence-assurance/traceability | Evidence Workbench | Evidence | ACTIVE |
| /evidence-health | Evidence Workbench | Evidence | REVIEW |
| /evidence-repository | Evidence Workbench | Evidence | REVIEW |
| /evidence/[evidenceId] | Object Detail | Evidence | ACTIVE |
| /evidence/[evidenceId]/download | Route Handler | Evidence | ACTIVE |
| /exceptions | Workbench | Operational | ACTIVE |
| /executive | Hub | Hub | ACTIVE |
| /findings | Workbench | Operational | ACTIVE |
| /governance | Hub | Hub | ACTIVE |
| /governance-committee | Workbench | Operational | ACTIVE |
| /governance-engineering | Workbench | Operational | ACTIVE |
| /governance-framework | Workbench | Operational | ACTIVE |
| /governance-manifest | Workbench | Operational | ACTIVE |
| /governance-manifest/registry | Workbench | Operational | ACTIVE |
| /governance-operations | Workbench | Operational | REVIEW |
| /mcp-evidence/[id] | Object Detail | Evidence | ACTIVE |
| /monitoring | Dashboard | Dashboard | ACTIVE |
| /notion-evidence/[id] | Object Detail | Evidence | ACTIVE |
| /onboarding | Administration | Administration | ACTIVE |
| /onboarding/repositories | Administration | Administration | ACTIVE |
| /onboarding/repositories/[id] | Object Detail | Object Detail | ACTIVE |
| /onboarding/travel-brain-pilot | Pilot | Administration | ACTIVE |
| /platform-review | Workbench | Operational | ACTIVE |
| /platform-review/export | Workbench | Operational | ACTIVE |
| /platform-review/package | Workbench | Operational | ACTIVE |
| /portfolio | Hub | Hub | ACTIVE |
| /projects/travel-brain | Legacy Route | Deprecated | DEPRECATED |
| /regulatory | Workbench | Operational | ACTIVE |
| /regulatory-coverage | Dashboard | Dashboard | REVIEW |
| /regulatory-mapping | Legacy Route | Deprecated | DEPRECATED |
| /regulatory/[slug] | Object Detail | Object Detail | ACTIVE |
| /reports/executive | Workbench | Operational | ACTIVE |
| /risk-heatmap | Dashboard | Dashboard | REVIEW |
| /runtime-evidence/[id] | Object Detail | Evidence | ACTIVE |
| /secret-evidence/[id] | Object Detail | Evidence | ACTIVE |
| /supabase-evidence/[id] | Object Detail | Evidence | ACTIVE |
| /systems/[slug] | AI System Workspace | Workspace | ACTIVE |
| /systems/[slug]/agentic-governance | Workspace Tab | Workspace | ACTIVE |
| /systems/[slug]/ai-governance | Workspace Tab | Workspace | ACTIVE |
| /systems/[slug]/audit-trail | Workspace Tab | Workspace | ACTIVE |
| /systems/[slug]/controls | Workspace Tab | Workspace | ACTIVE |
| /systems/[slug]/evidence | Workspace Tab | Workspace | ACTIVE |
| /systems/[slug]/governance-engineering | Workspace Tab | Workspace | ACTIVE |
| /systems/[slug]/lifecycle | Workspace Tab | Workspace | ACTIVE |
| /systems/[slug]/monitoring | Workspace Tab | Workspace | ACTIVE |
| /systems/[slug]/regulations | Workspace Tab | Workspace | ACTIVE |
| /systems/[slug]/risk | Workspace Tab | Workspace | ACTIVE |
| /traceability | Workbench | Operational | REVIEW |
| /walkthroughs | Workbench | Operational | REVIEW |

### Route Counts By Status
| Status | Count |
| --- | --- |
| ACTIVE | 68 |
| REVIEW | 11 |
| DEPRECATED | 2 |

### Route Counts By Category
| Category | Count |
| --- | --- |
| Hub | 6 |
| Operational | 21 |
| Dashboard | 5 |
| Evidence | 30 |
| Object Detail | 3 |
| Administration | 3 |
| Deprecated | 2 |
| Workspace | 11 |

## Feature Inventory
### Feature Counts By Status
| Status | Count |
| --- | --- |
| Complete | 10 |
| MVP | 19 |
| Planned | 2 |
| Operational | 4 |
| Partial | 1 |

| Feature | Phase | Status | Maturity | Dependencies |
| --- | --- | --- | --- | --- |
| AI System Registry | Phase 1 | Complete | Level 4 - Operational | Prisma data model, seeded AI systems, AI system workspace, risk assessment, controls, evidence, monitoring. |
| Regulatory Mapping | Phase 2 | Complete | Level 4 - Operational | Regulation, requirement, regulatory control, AI system mapping, evidence requirements, traceability views. |
| Monitoring Engine | Phase 3A and Phase 3B | Complete | Level 4 - Operational | Control tests, test runs, findings, exceptions, evidence health, monitoring-engine package. |
| Findings | Phase 3A | Complete | Level 4 - Operational | Monitoring engine, control tests, AI systems, exceptions, risk links. |
| Exceptions | Phase 3A | MVP | Level 3 - MVP | Findings, controls, exception dashboard, seeded exception records. |
| Evidence Governance | Phase 4 | Complete | Level 4 - Operational | Evidence objects, evidence requirements, evidence health, controls, regulations, risks, audit packages. |
| Executive Dashboard | Phase 5 | MVP | Level 3 - MVP | AI systems, regulatory coverage, evidence health, findings, risk dashboards, executive routes. |
| AI Governance | Phase 6A | Complete | Level 4 - Operational | AI models, prompt assets, agents, authority records, tool permissions, human oversight records, AI governance controls. |
| Agentic Governance | Phase 6B | Complete | Level 4 - Operational | Agents, governed tools, agent actions, execution logs, kill switch records, delegated authority, agentic controls. |
| Lifecycle Governance | Phase 6C | Complete | Level 4 - Operational | AI lifecycle records, lifecycle approvals, lifecycle controls, monitoring findings, AI system workspace. |
| AI Risk Framework | Phase 6D | Complete | Level 4 - Operational | AI risks, risk categories, AI systems, controls, evidence links, findings links. |
| Governance Engineering | Phase 6E | Complete | Level 4 - Operational | ControlImplementation, ImplementationEvidence, controls, AI systems, findings, governance engineering dashboard. |
| Evidence & Assurance Hub | UX Refactor 1 | MVP | Level 3 - MVP | Evidence Repository, Evidence Health, Governance Operations Dashboard, EvidenceArtifact model, EvidenceSnapshot model, AssuranceRule model, AssuranceExplanation model, Evidence Source Registry, Audit Packages, Control Evidence Traceability. |
| UX Refactor 2 - Full Site IA Redesign | Future Initiative | Planned | Level 1 - Concept | Logs Connector, Portainer Connector, Supabase Connector, MCP Connector, Notion Connector, Secrets Connector, Asset Discovery Engine, connector consistency cleanup. |
| Skill Governance | Future Phase | Planned | Level 1 - Concept | AI System Registry, AI Governance, Agentic Governance, Evidence & Assurance Hub, Control Evidence Traceability, connector evidence domains, UX Refactor 2, governance approval workflow, audit trail, usage evidence model. |
| Evidence Repository | Phase 7 | MVP | Level 3 - MVP | Evidence objects, evidence health, audit packages, evidence download route, AI system workspace evidence tab. |
| Auditor Workspace | Phase 5 and Phase 7 | MVP | Level 3 - MVP | Evidence repository, traceability, audit packages, controls, findings, exceptions, regulations. |
| Repository Discovery | Phase 8 | MVP | Level 3 - MVP | RepositoryDiscovery, RepositoryComponent, RepositoryEvidenceSource, GovernanceManifest, onboarding routes. |
| AI Governance Manifest | Phase 8.5 and Phase 8.5.1 | MVP | Level 3 - MVP | GovernanceManifest, repository discovery, manifest registry, manifest standard documentation, Travel Brain pilot. |
| Travel Brain Pilot | Phase 8.6 | MVP | Level 3 - MVP | Travel Brain seed data, GovernanceManifest, repository discovery, pilot assessment document, onboarding route. |
| Asset Inventory | Phase 9 | MVP | Level 3 - MVP | Asset model, AI systems, seeded Travel Brain assets, Governance Operations dashboard. |
| Evidence Source Registry | Phase 9 | MVP | Level 3 - MVP | EvidenceSource model, Asset model, governance operations data helper, seeded Travel Brain evidence sources. |
| GitHub Connector | Phase 9 | Operational | Level 4 - Operational | Asset model, EvidenceSource model, EvidenceArtifact model, RepositoryConnection model, ArtifactDriftEvent model, Travel Brain GitHub asset, configurable discovery rules, Governance Operations dashboard, Evidence Artifact Viewer. |
| Logs Connector | Phase 9C and Phase 9C.1 | Operational | Level 4 - Operational | Asset model, EvidenceSource model, LogSource model, RuntimeEvidenceArtifact model, sanitized evidence fields, Travel Brain Logs asset, ExecutionLog records, TestRun monitoring records, AuditEvent records, monitoring engine, Evidence & Assurance Hub, Governance Operations dashboard, Runtime Evidence Viewer. |
| Portainer Connector | Phase 9 | MVP | Level 3 - MVP | Asset model, EvidenceSource model, PortainerConnection model, DeploymentEvidenceArtifact model, DeploymentDriftEvent model, Travel Brain Portainer asset, Evidence & Assurance Hub, Governance Operations dashboard, Control Evidence Traceability. |
| Supabase Connector | Phase 9E | Operational | Level 4 - Operational | Asset model, EvidenceSource model, SupabaseConnection model, SupabaseEvidenceArtifact model, SupabaseEvidenceSnapshot model, SupabaseDriftEvent model, SupabaseControlValidation model, read-only Postgres metadata access, Travel Brain Supabase asset, Evidence & Assurance Hub, Governance Operations dashboard, Control Evidence Traceability, Findings. |
| MCP Connector | Phase 9F | MVP | Level 3 - MVP | Asset Inventory, Evidence Source Registry, Agentic Governance, Tool Permissions, Delegated Authority Framework, Evidence & Assurance Hub, Control Evidence Traceability, MCP evidence artifact model. |
| Notion Governance Connector | Phase 9G | Partial | Level 2 - Prototype | Asset Inventory, Evidence Source Registry, Evidence Repository, Auditor Workspace, Governance Committee workflows, Evidence & Assurance Hub, Control Evidence Traceability, scoped Notion integration token, shared Travel Brain Notion governance page or database. |
| Secrets Metadata Connector | Phase 9H | MVP | Level 3 - MVP | Asset Inventory, Evidence Source Registry, Secrets governance policy, Evidence & Assurance Hub, Control Evidence Traceability, security review guardrails. |
| Asset Discovery Engine | Phase 9X | MVP | Level 3 - MVP | Asset Inventory, Evidence Source Registry, AI Governance Manifest, |
| Governance Operations Dashboard | Phase 9 | MVP | Level 3 - MVP | Asset model, EvidenceSource model, assurance score calculation, sidebar navigation, seeded Travel Brain assets. |
| Platform Review Agent | Phase 9D.5 | Operational | Level 4 - Operational | App route tree, shared sidebar navigation model, Evidence & Assurance secondary navigation model, Feature Registry documentation, Governance Operations data helper, Evidence Source Registry, EvidenceArtifact, RuntimeEvidenceArtifact, DeploymentEvidenceArtifact, EvidenceHealth, findings, exceptions, Project Operating Model, UX Architecture Review, Platform Review Package document. |
| Evidence Traceability | Phase 9B | MVP | Level 3 - MVP | AssuranceRule model, EvidenceArtifact model, EvidenceSource model, Asset model, AI System Registry, Control Library, Governance Operations Dashboard, Regulatory Mapping. |
| Explainable Assurance | Phase 9.5 | MVP | Level 3 - MVP | AssuranceRule model, AssuranceExplanation model, GovernanceStory model, EvidenceArtifact model, EvidenceSource model, Control Evidence Traceability, Governance Operations Dashboard, Travel Brain GitHub artifacts. |
| Verifiable Evidence | Phase 9.6 | MVP | Level 3 - MVP | EvidenceArtifact model, EvidenceSnapshot model, RepositoryConnection model, GitHub Connector, AssuranceRule model, AssuranceExplanation model, Evidence Artifact Viewer, Control Evidence Traceability. |
| Evidence Automation | Phase 9 | MVP | Level 3 - MVP | Asset Inventory, Evidence Source Registry, GitHub Connector, EvidenceArtifact model, AssuranceRule model, Evidence Artifact Viewer, Governance Operations Dashboard. |

## Evidence Inventory
| Metric | Value |
| --- | --- |
| evidenceSources | 31 |
| sourceIssues | 17 |
| artifacts | 4 |
| snapshots | 4 |
| runtimeEvidence | 5 |
| deploymentEvidence | 1 |
| validDeploymentEvidence | 0 |
| supabaseEvidence | 4 |
| validSupabaseEvidence | 2 |
| supabaseSnapshots | 2 |
| supabaseDrift | 8 |
| supabaseControlValidations | 5 |
| mcpEvidence | 4 |
| validMcpEvidence | 2 |
| notionEvidence | 5 |
| validNotionEvidence | 0 |
| secretEvidence | 4 |
| validSecretEvidence | 2 |
| assetDiscoveryRuns | 1 |
| assetDiscoverySources | 13 |
| assetDiscoveryFindings | 14 |
| unknownAssets | 3 |
| untrackedAssets | 4 |
| orphanedAssets | 0 |
| missingAssets | 3 |
| openDiscoveryFindings | 10 |
| validDiscoveryFindings | 7 |
| warningDiscoveryFindings | 5 |
| invalidDiscoveryFindings | 2 |
| highConfidenceDiscoveryFindings | 7 |
| mediumConfidenceDiscoveryFindings | 5 |
| lowConfidenceDiscoveryFindings | 2 |
| evidenceObjects | 12 |
| evidenceHealthIssues | 2 |
| controlCoverage | 100 |
| evidenceCoverage | 100 |

### Evidence Source Issues
| Source | Asset | Collection | Freshness | Connector | Rationale |
| --- | --- | --- | --- | --- | --- |
| SRC-TB-GH-REVIEWS | GITHUB | COLLECTED | STALE | NEEDS_ATTENTION | review metadata is collected but stale and needs updated approval/change-review evidence |
| SRC-TB-GH-WORKFLOWS | GITHUB | COLLECTED | CURRENT | NEEDS_ATTENTION | workflow artifact is current, but monitoring-result linkage remains a review warning |
| SRC-TB-MCP-AUTHORITY | MCP | COLLECTED | CURRENT | NEEDS_ATTENTION | real MCP authority metadata was collected, but write-capable tools need explicit authority classification |
| SRC-TB-MCP-PERMISSIONS | MCP | COLLECTED | CURRENT | NEEDS_ATTENTION | real MCP tool metadata was collected, but write-capable tools need explicit policy classification |
| SRC-TB-NOTION-APPROVALS | NOTION | MISSING | MISSING | NEEDS_ATTENTION | connector is ready, but scoped approval records are unavailable |
| SRC-TB-NOTION-COMMITTEE | NOTION | MISSING | MISSING | NEEDS_ATTENTION | connector is ready, but scoped committee records are unavailable |
| SRC-TB-NOTION-DATABASES | NOTION | MISSING | MISSING | NEEDS_ATTENTION | connector is ready, but scoped Travel Brain governance databases are unavailable |
| SRC-TB-NOTION-PAGES | NOTION | MISSING | MISSING | NEEDS_ATTENTION | connector is ready, but scoped Travel Brain governance pages are unavailable |
| SRC-TB-NOTION-OWNERSHIP | NOTION | MISSING | MISSING | NEEDS_ATTENTION | connector is ready, but scoped ownership records are unavailable |
| SRC-TB-NOTION-REVIEWS | NOTION | MISSING | MISSING | NEEDS_ATTENTION | connector is ready, but scoped review records are unavailable |
| SRC-TB-PORT-CONTAINER | PORTAINER | MISSING | MISSING | BLOCKED | Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for container metadata |
| SRC-TB-PORT-DEPLOYMENT | PORTAINER | MISSING | MISSING | BLOCKED | Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for deployment metadata |
| SRC-TB-PORT-RUNTIME | PORTAINER | MISSING | MISSING | BLOCKED | Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for runtime health metadata |
| SRC-TB-SECRETS-OWNERSHIP | SECRETS | COLLECTED | CURRENT | NEEDS_ATTENTION | metadata-only collection found missing ownership metadata |
| SRC-TB-SECRETS-ROTATION | SECRETS | COLLECTED | CURRENT | NEEDS_ATTENTION | metadata-only collection found unknown or stale rotation metadata |
| SRC-TB-SUPABASE-ACCESS | SUPABASE | COLLECTED | CURRENT | NEEDS_ATTENTION | real role metadata was collected and generated a privileged-role review warning |
| SRC-TB-SUPABASE-RLS | SUPABASE | COLLECTED | CURRENT | NEEDS_ATTENTION | real RLS metadata was collected and generated a policy review warning |

## Connector Inventory
| Connector | Status | Maturity | Evidence Quality | Assurance Quality | Traceability Quality | Open Gaps |
| --- | --- | --- | --- | --- | --- | --- |
| GitHub | Operational | Level 4 - Operational | 4 collected GitHub artifact(s) with 4 preserved snapshot(s). | Explainable assurance is available. 3 warning item(s) remain. | High. Artifacts link to sources, controls, assets, AI system context, collection, version, and provenance. | SRC-TB-GH-REVIEWS: COLLECTED/STALE/NEEDS_ATTENTION - review metadata is collected but stale and needs updated approval/change-review evidence; SRC-TB-GH-WORKFLOWS: COLLECTED/CURRENT/NEEDS_ATTENTION - workflow artifact is current, but monitoring-result linkage remains a review warning; Workflow assurance has a monitoring-reference warning. |
| Logs | Operational | Level 4 - Operational | 5 sanitized runtime evidence artifact(s) are available. | High for the Travel Brain reference scope. Runtime evidence explains why it was collected, which control depends on it, and what would fail if it disappeared. | High. Runtime evidence links to controls such as AI-AGENT-006, AI-GOV-010, and AUD-001. | None |
| Portainer | MVP | Level 3 - MVP | 1 Portainer gap artifact(s) are available; current Codex run could not reach the private LAN endpoint even though local validation shows Portainer is healthy. | Warning. Connector logic exists, but Codex runtime access to private infrastructure is limited, so assurance should use the Portainer Evidence Export Pattern until direct runtime access is available. | Partial. Gap evidence remains traceable to AI-LC-006, AI-GOV-010, OPS-001, and AUD-001; exported Portainer evidence should be attached to prove deployed-state reality. | SRC-TB-PORT-CONTAINER: MISSING/MISSING/BLOCKED - Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for container metadata; SRC-TB-PORT-DEPLOYMENT: MISSING/MISSING/BLOCKED - Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for deployment metadata; SRC-TB-PORT-RUNTIME: MISSING/MISSING/BLOCKED - Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for runtime health metadata |
| Supabase | Operational | Level 4 - Operational | 2 valid Supabase data-governance evidence artifact(s), 2 snapshot(s), and 8 drift event(s) are available for Travel Brain. | High for the reference scope. Real metadata collection is inspectable and explainable with retained snapshots, drift records, control validation, and generated findings for warning/failure conditions. | High. Supabase evidence links to GOV-001, PRI-001, SEC-001, AI-GOV-010, AUD-001, and OPS-001. | SRC-TB-SUPABASE-ACCESS: COLLECTED/CURRENT/NEEDS_ATTENTION - real role metadata was collected and generated a privileged-role review warning; SRC-TB-SUPABASE-RLS: COLLECTED/CURRENT/NEEDS_ATTENTION - real RLS metadata was collected and generated a policy review warning |
| MCP | MVP | Level 3 - MVP | 2 valid MCP governance evidence artifact(s) are available for Travel Brain. | Medium-high. MCP metadata is inspectable and explainable, with tool-permission and authority classification warnings preserved as assurance signals. | High. MCP evidence links to AI-GOV-006, AI-GOV-010, AI-AGENT-001, AI-AGENT-006, and AUD-001. | SRC-TB-MCP-AUTHORITY: COLLECTED/CURRENT/NEEDS_ATTENTION - real MCP authority metadata was collected, but write-capable tools need explicit authority classification; SRC-TB-MCP-PERMISSIONS: COLLECTED/CURRENT/NEEDS_ATTENTION - real MCP tool metadata was collected, but write-capable tools need explicit policy classification |
| Notion | Partial | Level 2 - Prototype | 5 Notion governance evidence artifact(s) or explicit gap artifact(s) are available for Travel Brain. | Partial. Connector-ready gap artifacts explain that human-governance records cannot be proven until scoped Travel Brain content is shared with the integration. | Partial. Notion evidence artifacts link to controls and source records, but real approval/review traceability requires scoped Notion access. | SRC-TB-NOTION-APPROVALS: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped approval records are unavailable; SRC-TB-NOTION-COMMITTEE: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped committee records are unavailable; SRC-TB-NOTION-DATABASES: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped Travel Brain governance databases are unavailable; SRC-TB-NOTION-PAGES: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped Travel Brain governance pages are unavailable; SRC-TB-NOTION-OWNERSHIP: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped ownership records are unavailable; SRC-TB-NOTION-REVIEWS: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped review records are unavailable |
| Secrets | MVP | Level 3 - MVP | 2 valid metadata-only secrets evidence artifact(s) are available for Travel Brain. | Medium-high. Secrets evidence is inspectable and explainable, with warnings preserved when rotation metadata or ownership is unknown. | High. Secrets evidence links to SEC-001, AUD-001, OPS-001, and AI-GOV-010 without storing secret material. | SRC-TB-SECRETS-OWNERSHIP: COLLECTED/CURRENT/NEEDS_ATTENTION - metadata-only collection found missing ownership metadata; SRC-TB-SECRETS-ROTATION: COLLECTED/CURRENT/NEEDS_ATTENTION - metadata-only collection found unknown or stale rotation metadata |

## Governance Status Report
| Area | Status | Summary | Gaps |
| --- | --- | --- | --- |
| Controls | PASS | 100% control coverage across artifact, runtime, deployment, and data-governance evidence paths. | None |
| Evidence | WARNING | 12 evidence health record(s), with 2 issue(s). | Evidence health issues remain visible for follow-up. |
| Artifacts | PASS | 4 GitHub artifact(s), 5 runtime artifact(s), 1 deployment artifact(s), 4 Supabase data-governance artifact(s), 4 MCP governance artifact(s), 5 Notion human-governance artifact(s), and 4 secrets metadata artifact(s). | None |
| Assurance | WARNING | Assurance explanations exist for artifact-backed controls, runtime/deployment evidence, Supabase data-governance evidence, MCP governance evidence, Notion human-governance evidence or source gaps, and Secrets metadata evidence. | At least one assurance warning remains. |
| Traceability | PASS | Control, evidence, source, collection, and version paths are available for the primary Travel Brain proof chain across GitHub, logs, Portainer, Supabase, MCP, Notion, and Secrets. | None |
| Runtime Evidence | PASS | 5 sanitized runtime evidence artifact(s) are inspectable. | None |
| Deployment Evidence | WARNING | 1 Portainer gap artifact(s) are inspectable. Local validation shows Portainer is healthy; Codex cannot reach the private LAN endpoint, so this is a Private Infrastructure Access Limitation. | SRC-TB-PORT-CONTAINER: MISSING/MISSING/BLOCKED - Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for container metadata; SRC-TB-PORT-DEPLOYMENT: MISSING/MISSING/BLOCKED - Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for deployment metadata; SRC-TB-PORT-RUNTIME: MISSING/MISSING/BLOCKED - Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for runtime health metadata |
| Data Governance Evidence | PASS | 2 valid Supabase metadata evidence artifact(s) are inspectable. | SRC-TB-SUPABASE-ACCESS: COLLECTED/CURRENT/NEEDS_ATTENTION - real role metadata was collected and generated a privileged-role review warning; SRC-TB-SUPABASE-RLS: COLLECTED/CURRENT/NEEDS_ATTENTION - real RLS metadata was collected and generated a policy review warning |
| MCP Governance Evidence | PASS | 2 valid MCP metadata evidence artifact(s) are inspectable. | SRC-TB-MCP-AUTHORITY: COLLECTED/CURRENT/NEEDS_ATTENTION - real MCP authority metadata was collected, but write-capable tools need explicit authority classification; SRC-TB-MCP-PERMISSIONS: COLLECTED/CURRENT/NEEDS_ATTENTION - real MCP tool metadata was collected, but write-capable tools need explicit policy classification |
| Human Governance Evidence | WARNING | 5 Notion governance evidence artifact(s) or gap artifact(s) are inspectable. | SRC-TB-NOTION-APPROVALS: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped approval records are unavailable; SRC-TB-NOTION-COMMITTEE: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped committee records are unavailable; SRC-TB-NOTION-DATABASES: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped Travel Brain governance databases are unavailable; SRC-TB-NOTION-PAGES: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped Travel Brain governance pages are unavailable; SRC-TB-NOTION-OWNERSHIP: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped ownership records are unavailable; SRC-TB-NOTION-REVIEWS: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped review records are unavailable |
| Secrets Governance Evidence | PASS | 2 valid metadata-only secrets governance evidence artifact(s) are inspectable. | SRC-TB-SECRETS-OWNERSHIP: COLLECTED/CURRENT/NEEDS_ATTENTION - metadata-only collection found missing ownership metadata; SRC-TB-SECRETS-ROTATION: COLLECTED/CURRENT/NEEDS_ATTENTION - metadata-only collection found unknown or stale rotation metadata |
| Asset Discovery | PASS | 1 discovery run(s), 13 source(s), and 14 finding(s): 7 valid, 5 warning, and 2 invalid. | DISC-TB-MISSING-NOTION-001: WARNING/MISSING_ASSET/Notion - Travel Brain Governance Workspace; DISC-TB-MISSING-PORTAINER-001: WARNING/MISSING_ASSET/Portainer - travel-brain-web; DISC-TB-UNDECLARED-MCP-001: VALID/UNTRACKED_ASSET/Travel Brain MCP Server; DISC-TB-UNDECLARED-SECRETS-001: WARNING/UNTRACKED_ASSET/Travel Brain Secrets Sources; DISC-TB-UNDECLARED-SUPABASE-001: VALID/UNTRACKED_ASSET/Supabase - Travel Brain; DISC-TB-UNKNOWN-API-001: VALID/UNKNOWN_ASSET/Weather API; DISC-TB-UNKNOWN-API-002: VALID/UNKNOWN_ASSET/Destination Content API; DISC-TB-UNKNOWN-API-004: WARNING/UNKNOWN_ASSET/OpenAI API; DISC-TB-GAP-DOCKER-FILES-001: WARNING/MISSING_ASSET/Container build/runtime configuration files; DISC-TB-UNTRACKED-WORKFLOW-001: VALID/UNTRACKED_ASSET/GitHub Actions governance monitoring workflow |
| Connector Health | WARNING | 31 evidence source(s), with 17 source issue(s). | SRC-TB-GH-REVIEWS: COLLECTED/STALE/NEEDS_ATTENTION - review metadata is collected but stale and needs updated approval/change-review evidence; SRC-TB-GH-WORKFLOWS: COLLECTED/CURRENT/NEEDS_ATTENTION - workflow artifact is current, but monitoring-result linkage remains a review warning; SRC-TB-MCP-AUTHORITY: COLLECTED/CURRENT/NEEDS_ATTENTION - real MCP authority metadata was collected, but write-capable tools need explicit authority classification; SRC-TB-MCP-PERMISSIONS: COLLECTED/CURRENT/NEEDS_ATTENTION - real MCP tool metadata was collected, but write-capable tools need explicit policy classification; SRC-TB-NOTION-APPROVALS: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped approval records are unavailable; SRC-TB-NOTION-COMMITTEE: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped committee records are unavailable; SRC-TB-NOTION-DATABASES: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped Travel Brain governance databases are unavailable; SRC-TB-NOTION-PAGES: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped Travel Brain governance pages are unavailable; SRC-TB-NOTION-OWNERSHIP: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped ownership records are unavailable; SRC-TB-NOTION-REVIEWS: MISSING/MISSING/NEEDS_ATTENTION - connector is ready, but scoped review records are unavailable; SRC-TB-PORT-CONTAINER: MISSING/MISSING/BLOCKED - Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for container metadata; SRC-TB-PORT-DEPLOYMENT: MISSING/MISSING/BLOCKED - Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for deployment metadata; SRC-TB-PORT-RUNTIME: MISSING/MISSING/BLOCKED - Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for runtime health metadata; SRC-TB-SECRETS-OWNERSHIP: COLLECTED/CURRENT/NEEDS_ATTENTION - metadata-only collection found missing ownership metadata; SRC-TB-SECRETS-ROTATION: COLLECTED/CURRENT/NEEDS_ATTENTION - metadata-only collection found unknown or stale rotation metadata; SRC-TB-SUPABASE-ACCESS: COLLECTED/CURRENT/NEEDS_ATTENTION - real role metadata was collected and generated a privileged-role review warning; SRC-TB-SUPABASE-RLS: COLLECTED/CURRENT/NEEDS_ATTENTION - real RLS metadata was collected and generated a policy review warning |
| Open Findings | WARNING | 15 open finding(s) remain across the portfolio. | Open findings should remain visible in the review package for risk and audit follow-up. |
| Open Exceptions | WARNING | 1 active exception(s) remain across the portfolio. | Active exceptions should be reviewed for expiry and compensating control context. |

## Navigation Inventory
### Sidebar Structure
| Group | Item | Route |
| --- | --- | --- |
| Command Center | Executive | /executive |
| Command Center | Portfolio | /portfolio |
| Command Center | Governance | /governance |
| Command Center | Evidence & Assurance | /evidence-assurance |
| Command Center | Framework | /governance-framework |
| Persona Workspaces | Auditor Workspace | /auditor-workspace |
| Persona Workspaces | Committee | /governance-committee |
| Persona Workspaces | Administration | /administration |
| Persona Workspaces | Travel Brain Pilot | /onboarding/travel-brain-pilot |
| Portfolio Objects | AI Systems | / |
| Portfolio Objects | Travel Brain | /systems/travel-brain |
| Portfolio Objects | Payment Agent | /systems/autonomous-payment-agent |
| Operational Views | Compliance | /regulatory-coverage |
| Operational Views | Risk Management | /ai-risk |
| Operational Views | Control Monitoring | /monitoring |
| Operational Views | AI Manifest | /governance-manifest |
| Operational Views | Engineering | /governance-engineering |
| Operational Views | Walkthroughs | /walkthroughs |

### Evidence & Assurance Secondary Navigation
| Label | Route |
| --- | --- |
| Overview | /evidence-assurance |
| Repository | /evidence-assurance/repository |
| Health | /evidence-assurance/health |
| Artifacts | /evidence-assurance/artifacts |
| Runtime | /evidence-assurance/runtime |
| Deployments | /evidence-assurance/deployments |
| Data Governance | /evidence-assurance/data-governance |
| MCP Governance | /evidence-assurance/mcp-governance |
| Governance Evidence | /evidence-assurance/governance-evidence |
| Secrets Governance | /evidence-assurance/secrets-governance |
| Asset Discovery | /evidence-assurance/asset-discovery |
| Snapshots | /evidence-assurance/snapshots |
| Drift | /evidence-assurance/drift |
| Sources | /evidence-assurance/sources |
| Assurance | /evidence-assurance/assurance |
| Packages | /evidence-assurance/packages |
| Traceability | /evidence-assurance/traceability |

### Duplicate Destinations
| Topic | Routes |
| --- | --- |
| Evidence | /audit-packages, /deployment-evidence/[id], /evidence, /evidence-artifacts/[id], /evidence-artifacts/[id]/drift, /evidence-assurance, /evidence-assurance/artifacts, /evidence-assurance/asset-discovery, /evidence-assurance/assurance, /evidence-assurance/data-governance, /evidence-assurance/deployments, /evidence-assurance/drift, /evidence-assurance/governance-evidence, /evidence-assurance/health, /evidence-assurance/mcp-governance, /evidence-assurance/packages, /evidence-assurance/repository, /evidence-assurance/runtime, /evidence-assurance/secrets-governance, /evidence-assurance/snapshots, /evidence-assurance/sources, /evidence-assurance/traceability, /evidence-health, /evidence-repository, /evidence/[evidenceId], /evidence/[evidenceId]/download, /runtime-evidence/[id] |
| Auditor | /auditor, /auditor-workspace |
| Portfolio Health | /control-health, /portfolio, /regulatory-coverage, /risk-heatmap |
| Governance Discipline | /agentic-governance, /ai-governance, /ai-lifecycle, /ai-risk, /governance-engineering |

## Architecture Drift Review
| Review Item | Status | Detail |
| --- | --- | --- |
| Global sidebar remains above target size | WARNING | 8 global sidebar items are outside the long-term hub recommendation from the UX architecture review. |
| Duplicate workflow surfaces remain visible | WARNING | 4 duplicate destination groups need future UX Refactor 2 decisions. |
| Legacy route candidates remain | WARNING | 2 routes are marked as deprecated candidates. |
| Major evidence domains remain planned or partial | WARNING | UX Refactor 2 should wait until partial evidence domains mature, Asset Discovery runs, connector consistency cleanup is complete, and connector warning conditions are reviewed. |
| Operating model alignment | PASS | The current review compares routes and navigation against the operating model and UX architecture review. |

## Open Issues
| Category | Severity | Issue | Detail | Review Path |
| --- | --- | --- | --- | --- |
| Evidence | WARNING | Evidence sources need review | 17 evidence sources are missing, stale, or off-track. | /platform-review#evidence |
| Assurance | WARNING | Assurance warnings exist | 1 assurance checks are warning or failing. | /evidence-assurance/assurance |
| Navigation | WARNING | Routes need IA review | 11 routes are active but flagged for future consolidation or ownership review. | /platform-review#routes |
| Navigation | WARNING | Deprecated route candidates remain | 2 legacy routes remain in the application tree. | /platform-review#routes |
| Evidence | WARNING | Evidence health issues remain | 2 evidence health records are not current and valid. | /evidence-assurance/health |
| Findings | WARNING | Open findings remain | 15 open findings remain across the portfolio. | /findings |
| Architecture Drift | WARNING | Global sidebar remains above target size | 8 global sidebar items are outside the long-term hub recommendation from the UX architecture review. | /platform-review#drift |
| Architecture Drift | WARNING | Duplicate workflow surfaces remain visible | 4 duplicate destination groups need future UX Refactor 2 decisions. | /platform-review#drift |
| Architecture Drift | WARNING | Legacy route candidates remain | 2 routes are marked as deprecated candidates. | /platform-review#drift |
| Architecture Drift | WARNING | Major evidence domains remain planned or partial | UX Refactor 2 should wait until partial evidence domains mature, Asset Discovery runs, connector consistency cleanup is complete, and connector warning conditions are reviewed. | /platform-review#drift |

## Screenshot Manifest
This is a screenshot plan only. Actual screenshot capture is intentionally future work.

| Route | Page Title | Category | Importance |
| --- | --- | --- | --- |
| /executive | Executive Overview | Executive | Critical |
| /portfolio | Portfolio | Portfolio | Critical |
| /governance | Governance | Governance | High |
| /evidence-assurance | Evidence & Assurance Hub | Evidence & Assurance | Critical |
| /evidence-assurance/artifacts | Evidence Artifacts | Evidence & Assurance | High |
| /evidence-assurance/runtime | Runtime Evidence | Connector | High |
| /evidence-assurance/deployments | Deployment Evidence | Connector | High |
| /evidence-assurance/governance-evidence | Governance Evidence | Connector | High |
| /evidence-assurance/secrets-governance | Secrets Governance | Connector | High |
| /evidence-assurance/asset-discovery | Asset Discovery | Evidence & Assurance | High |
| /evidence-assurance/traceability | Evidence Traceability | Evidence & Assurance | High |
| /auditor-workspace | Auditor Workspace | Auditor | High |
| /administration | Administration | Administration | Medium |
| /systems/travel-brain | Travel Brain Workspace | System Workspace | Critical |
| /systems/travel-brain/evidence | Travel Brain Evidence | System Workspace | High |
| /controls/AI-GOV-006 | Tool Permission Control | Control Detail | Critical |
| /evidence-artifacts/ART-TB-GH-MANIFEST-001 | Travel Brain Manifest Artifact | Artifact Detail | Critical |
| /runtime-evidence/RTE-TB-EXEC-001 | Travel Brain Runtime Evidence | Artifact Detail | High |
| /deployment-evidence/DEP-TB-PORT-001 | Travel Brain Deployment Evidence | Artifact Detail | High |
| /notion-evidence/NOTION-TB-APPROVAL-001 | Travel Brain Notion Approval Evidence | Artifact Detail | High |
| /secret-evidence/SEC-TB-SECRETS-INVENTORY-001 | Travel Brain Secret Inventory Evidence | Artifact Detail | High |
| /platform-review | Platform Review Workspace | Review | Critical |
| /platform-review/package | Platform Review Package | Review | High |
| /platform-review/export | Platform Review Export | Review | Critical |

## Future ZIP Packaging Design
- Create a server-side package builder that emits Markdown, JSON inventories, and screenshot manifest from one shared data contract.
- Add an authenticated screenshot runner that reads the screenshot manifest and captures desktop/mobile PNGs for each important route.
- Create `platform-review.zip` with `/reports/PLATFORM_REVIEW_PACKAGE.md`, `/inventories/*.json`, `/screenshots/*.png`, and `/metadata/package-manifest.json`.
- Keep package contents read-only and sanitized. Do not include secrets, tokens, credentials, customer content, or sensitive payloads.
- Optimize the Markdown artifact for direct upload into ChatGPT as a single context-transfer file.

## Upload Guidance
Use this Markdown file as the single ChatGPT review artifact. It is intentionally self-contained and avoids requiring manual screenshot/PDF context transfer.