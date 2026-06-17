import { createHash } from "node:crypto";
import { prisma } from "@airg/db";

export async function getAiSystems() {
  return prisma.aiSystem.findMany({
    include: {
      assessment: true,
      evidenceItems: true,
      systemControls: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getRepositoryDiscoveries() {
  return prisma.repositoryDiscovery.findMany({
    include: {
      components: { orderBy: [{ componentType: "asc" }, { name: "asc" }] },
      evidenceSources: { orderBy: [{ sourceType: "asc" }, { title: "asc" }] },
      governanceManifest: true,
      onboardingFindings: true
    },
    orderBy: [{ reviewStatus: "asc" }, { updatedAt: "desc" }]
  });
}

export async function getRepositoryDiscovery(id: string) {
  return prisma.repositoryDiscovery.findUnique({
    where: { id },
    include: {
      components: { orderBy: [{ componentType: "asc" }, { name: "asc" }] },
      evidenceSources: { orderBy: [{ sourceType: "asc" }, { title: "asc" }] },
      governanceManifest: true,
      onboardingFindings: true
    }
  });
}

export async function getGitHubRepositoryDiscoveries() {
  return prisma.gitHubRepositoryDiscovery.findMany({
    include: { selectedForAiSystem: true },
    orderBy: [{ selectedForAiSystemId: "desc" }, { fullName: "asc" }]
  });
}

export async function getGovernanceManifestRegistry() {
  const repositories = await getRepositoryDiscoveries();
  const manifests = await prisma.governanceManifest.findMany({
    include: { repositoryDiscovery: true },
    orderBy: [{ validationStatus: "asc" }, { updatedAt: "desc" }]
  });

  return {
    repositories,
    manifests,
    missingManifestFindings: repositories.flatMap((repository) => repository.onboardingFindings.filter((finding) => finding.findingId === "AI-GOV-MANIFEST-001"))
  };
}

const travelBrainPilotAssets = [
  {
    category: "Repositories",
    declaredAssets: ["GitHub - Travel Brain", "Local Repository - Travel Brain"],
    discoveryStatus: "DISCOVERABLE",
    evidencePotential: "HIGH",
    rationale: "Repository discovery can inspect prompts, source code, policy files, workflows, tests, and configuration history."
  },
  {
    category: "Databases",
    declaredAssets: ["Supabase - Travel Brain"],
    discoveryStatus: "PARTIALLY_DISCOVERABLE",
    evidencePotential: "HIGH",
    rationale: "Schema, RLS policies, query logs, and data inventory can be collected with a connector, but classification and retention require owner validation."
  },
  {
    category: "Containers",
    declaredAssets: ["Portainer - travel-brain-web"],
    discoveryStatus: "PARTIALLY_DISCOVERABLE",
    evidencePotential: "HIGH",
    rationale: "Container configuration and runtime logs are collectible, while release approval and deployment intent require governance review."
  },
  {
    category: "Documentation",
    declaredAssets: ["Notion - Travel Brain Governance Workspace"],
    discoveryStatus: "MANUAL",
    evidencePotential: "MEDIUM",
    rationale: "Governance records, committee notes, and approvals are high-value evidence, but access and interpretation are human-governance dependent."
  },
  {
    category: "MCP Servers",
    declaredAssets: ["Travel Brain MCP Server"],
    discoveryStatus: "PARTIALLY_DISCOVERABLE",
    evidencePotential: "HIGH",
    rationale: "Server configuration and tool registry are discoverable, but tool purpose, authority, and approval scope require governance review."
  },
  {
    category: "External Services",
    declaredAssets: ["OpenAI API", "Weather Provider API", "Destination Content API"],
    discoveryStatus: "PARTIALLY_DISCOVERABLE",
    evidencePotential: "MEDIUM",
    rationale: "Configuration and usage can be collected, but vendor risk, contractual terms, and data use need business and risk validation."
  },
  {
    category: "Secrets",
    declaredAssets: ["OPENAI_API_KEY", "SUPABASE_SERVICE_ROLE_KEY", "WEATHER_API_TOKEN"],
    discoveryStatus: "PARTIALLY_DISCOVERABLE",
    evidencePotential: "MEDIUM",
    rationale: "Secret names, locations, access policy, and rotation records can be validated without exposing secret values."
  },
  {
    category: "Logs",
    declaredAssets: ["Recommendation Activity Logs", "Monitoring Results", "Supabase Query Logs"],
    discoveryStatus: "DISCOVERABLE",
    evidencePotential: "HIGH",
    rationale: "Runtime, monitoring, and query logs are primary evidence for continuous assurance, incident review, and audit sampling."
  }
];

const travelBrainPilotEvidenceSources = [
  {
    asset: "GitHub - Travel Brain",
    sources: ["prompts/travel-planner.md", "governance/tool-policy.yaml", ".github/workflows/control-tests.yaml"],
    collectionMethod: "Repository connector collects files, commit metadata, owners, and review history.",
    validationMethod: "Validate required files, ownership, approval references, version history, and control mapping.",
    automationPotential: "HIGH"
  },
  {
    asset: "Local Repository - Travel Brain",
    sources: ["implementation notes", "local configuration", "developer runbooks"],
    collectionMethod: "Local repository scan during onboarding with reviewer confirmation.",
    validationMethod: "Compare local files to canonical repository and flag undocumented local-only governance artifacts.",
    automationPotential: "MEDIUM"
  },
  {
    asset: "Supabase - Travel Brain",
    sources: ["schema", "RLS policies", "query logs", "data inventory"],
    collectionMethod: "Supabase connector or exported evidence bundle.",
    validationMethod: "Validate schema ownership, RLS coverage, retention policy, and access logs against privacy controls.",
    automationPotential: "MEDIUM"
  },
  {
    asset: "Portainer - travel-brain-web",
    sources: ["container configuration", "deployment history", "runtime logs"],
    collectionMethod: "Portainer connector exports deployment metadata and log references.",
    validationMethod: "Validate image provenance, runtime configuration, logging coverage, and production approval linkage.",
    automationPotential: "HIGH"
  },
  {
    asset: "Notion - Travel Brain Governance Workspace",
    sources: ["production approval", "human oversight procedure", "committee decisions"],
    collectionMethod: "Governed document export or Notion connector with scoped permissions.",
    validationMethod: "Validate approver authority, approval date, scope, review cadence, and unresolved blockers.",
    automationPotential: "LOW"
  },
  {
    asset: "Travel Brain MCP Server",
    sources: ["server configuration", "tool registry", "tool execution logs"],
    collectionMethod: "MCP registry inspection plus runtime tool-call log ingestion.",
    validationMethod: "Validate tools against approved permissions, authority level, and denied action list.",
    automationPotential: "MEDIUM"
  },
  {
    asset: "External APIs",
    sources: ["API configuration", "vendor records", "access logs"],
    collectionMethod: "Configuration scan and vendor record collection.",
    validationMethod: "Validate approved vendor, purpose, data-sharing limits, and access control evidence.",
    automationPotential: "MEDIUM"
  },
  {
    asset: "Secrets",
    sources: ["secret inventory", "rotation records", "access policy"],
    collectionMethod: "Secret manager metadata collection without collecting secret values.",
    validationMethod: "Validate rotation policy, access scope, owner, and plaintext prohibition.",
    automationPotential: "MEDIUM"
  },
  {
    asset: "Logs",
    sources: ["recommendation logs", "monitoring output", "query logs"],
    collectionMethod: "Log connector or scheduled evidence snapshot.",
    validationMethod: "Validate completeness, retention, correlation IDs, and absence of prohibited tool execution.",
    automationPotential: "HIGH"
  }
];

export async function getTravelBrainPilotAssessment() {
  const [system, repository] = await Promise.all([
    prisma.aiSystem.findUnique({
      where: { slug: "travel-brain" },
      include: {
        assessment: true,
        evidenceObjects: true,
        evidenceHealth: true,
        systemControls: { include: { control: true } },
        controlImplementations: { include: { evidence: true } }
      }
    }),
    prisma.repositoryDiscovery.findFirst({
      where: { name: "travel-brain" },
      include: {
        components: { orderBy: [{ componentType: "asc" }, { name: "asc" }] },
        evidenceSources: { orderBy: [{ sourceType: "asc" }, { title: "asc" }] },
        governanceManifest: true,
        onboardingFindings: true
      }
    })
  ]);

  const manifestMessages = repository?.governanceManifest
    ? JSON.parse(repository.governanceManifest.validationMessagesJson) as string[]
    : ["AI Governance.yaml not found."];

  const v2RequiredAssetSections = ["repositories", "databases", "containers", "documentation", "mcp_servers", "external_services", "secrets", "logs"];
  const manifestYaml = repository?.governanceManifest?.manifestYaml ?? "";
  const missingV2AssetSections = v2RequiredAssetSections.filter((section) => !manifestYaml.includes(`${section}:`));

  const highAutomation = travelBrainPilotEvidenceSources.filter((source) => source.automationPotential === "HIGH").length;
  const mediumAutomation = travelBrainPilotEvidenceSources.filter((source) => source.automationPotential === "MEDIUM").length;
  const lowAutomation = travelBrainPilotEvidenceSources.filter((source) => source.automationPotential === "LOW").length;
  const totalSources = Math.max(travelBrainPilotEvidenceSources.length, 1);

  return {
    system,
    repository,
    manifest: repository?.governanceManifest ?? null,
    manifestMessages,
    missingFields: missingV2AssetSections.map((section) => `assets.${section}`),
    assets: travelBrainPilotAssets,
    evidenceSources: travelBrainPilotEvidenceSources,
    discoveryAssessment: {
      discoverable: travelBrainPilotAssets.filter((asset) => asset.discoveryStatus === "DISCOVERABLE"),
      partiallyDiscoverable: travelBrainPilotAssets.filter((asset) => asset.discoveryStatus === "PARTIALLY_DISCOVERABLE"),
      manual: travelBrainPilotAssets.filter((asset) => asset.discoveryStatus === "MANUAL")
    },
    automationAssessment: {
      automatedEvidencePct: Math.round((highAutomation / totalSources) * 100),
      derivedEvidencePct: Math.round((mediumAutomation / totalSources) * 100),
      humanGovernanceEvidencePct: Math.round((lowAutomation / totalSources) * 100),
      rationale: "Repository, runtime, monitoring, and log evidence should become highly automated. Database, MCP, external service, and secrets evidence can be partially automated but still needs reviewer validation. Approvals and committee records remain human governance evidence."
    },
    readiness: {
      manifestQuality: missingV2AssetSections.length === 0 ? 95 : 82,
      assetCoverage: 78,
      evidenceCoverage: 84,
      automationReadiness: 72,
      governanceReadiness: 80
    }
  };
}

export async function getGovernanceOperationsDashboard() {
  const systems = await prisma.aiSystem.findMany({
    include: {
      repositoryConnections: {
        include: { driftEvents: { orderBy: { detectedAt: "desc" } } },
        orderBy: { lastScan: "desc" }
      },
      logSources: {
        include: {
          evidenceSource: { include: { asset: true } },
          runtimeArtifacts: { orderBy: { eventTimestamp: "desc" } }
        },
        orderBy: [{ type: "asc" }, { logSourceId: "asc" }]
      },
      portainerConnections: {
        include: {
          deploymentArtifacts: {
            include: {
              evidenceSource: { include: { asset: { include: { aiSystem: true } } } },
              driftEvents: { orderBy: { detectedAt: "desc" } }
            },
            orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
          },
          driftEvents: { orderBy: { detectedAt: "desc" } }
        },
        orderBy: [{ status: "asc" }, { connectionId: "asc" }]
      },
      supabaseConnections: {
        include: {
          evidenceArtifacts: {
            include: {
              evidenceSource: { include: { asset: { include: { aiSystem: true } } } },
              controlValidations: { orderBy: [{ result: "asc" }, { controlId: "asc" }] }
            },
            orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
          },
          snapshots: { orderBy: { collectionTimestamp: "desc" } },
          driftEvents: { orderBy: { detectedAt: "desc" } },
          controlValidations: { orderBy: [{ result: "asc" }, { controlId: "asc" }] }
        },
        orderBy: [{ status: "asc" }, { connectionId: "asc" }]
      },
      mcpConnections: {
        include: {
          evidenceArtifacts: {
            include: {
              evidenceSource: { include: { asset: { include: { aiSystem: true } } } }
            },
            orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
          }
        },
        orderBy: [{ status: "asc" }, { connectionId: "asc" }]
      },
      notionConnections: {
        include: {
          evidenceArtifacts: {
            include: {
              evidenceSource: { include: { asset: { include: { aiSystem: true } } } }
            },
            orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
          }
        },
        orderBy: [{ status: "asc" }, { connectionId: "asc" }]
      },
      secretsConnections: {
        include: {
          evidenceArtifacts: {
            include: {
              evidenceSource: { include: { asset: { include: { aiSystem: true } } } }
            },
            orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
          }
        },
        orderBy: [{ status: "asc" }, { connectionId: "asc" }]
      },
      assetDiscoveryRuns: {
        include: {
          sources: { orderBy: [{ sourceType: "asc" }, { sourceId: "asc" }] },
          findings: {
            include: {
              discoverySource: true,
              asset: { include: { aiSystem: true } }
            },
            orderBy: [{ status: "asc" }, { severity: "desc" }, { findingId: "asc" }]
          }
        },
        orderBy: { completedAt: "desc" }
      },
      assets: {
        include: {
          evidenceSources: {
            include: {
              artifacts: { include: { snapshots: { orderBy: { collectedAt: "desc" } }, assuranceRules: { include: { explanation: true }, orderBy: [{ status: "asc" }, { controlId: "asc" }] } }, orderBy: [{ artifactType: "asc" }, { name: "asc" }] },
              deploymentArtifacts: { include: { driftEvents: { orderBy: { detectedAt: "desc" } } }, orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }] },
              supabaseArtifacts: { include: { controlValidations: { orderBy: [{ result: "asc" }, { controlId: "asc" }] } }, orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }] },
              mcpArtifacts: { orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }] },
              notionArtifacts: { orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }] },
              secretArtifacts: { orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }] }
            },
            orderBy: [{ sourceType: "asc" }, { sourceId: "asc" }]
          }
        },
        orderBy: [{ assetType: "asc" }, { name: "asc" }]
      }
    },
    orderBy: { name: "asc" }
  });

  const assets = systems.flatMap((system) => system.assets.map((asset) => ({ ...asset, aiSystem: system })));
  const evidenceSources = assets.flatMap((asset) => asset.evidenceSources.map((source) => ({ ...source, asset, aiSystem: asset.aiSystem })));
  const artifacts = evidenceSources.flatMap((source) => source.artifacts.map((artifact) => ({ ...artifact, source, asset: source.asset, aiSystem: source.aiSystem })));
  const assuranceRules = artifacts.flatMap((artifact) => artifact.assuranceRules.map((rule) => ({ ...rule, artifact, source: artifact.source, asset: artifact.asset, aiSystem: artifact.aiSystem })));
  const logSources = systems.flatMap((system) => system.logSources.map((source) => ({ ...source, aiSystem: system })));
  const runtimeEvidenceArtifacts = logSources.flatMap((source) => source.runtimeArtifacts.map((artifact) => ({ ...artifact, logSource: source, aiSystem: source.aiSystem })));
  const portainerConnections = systems.flatMap((system) => system.portainerConnections.map((connection) => ({ ...connection, aiSystem: system })));
  const deploymentEvidenceArtifacts = portainerConnections.flatMap((connection) => connection.deploymentArtifacts.map((artifact) => ({ ...artifact, portainerConnection: connection, aiSystem: connection.aiSystem })));
  const deploymentDriftEvents = portainerConnections.flatMap((connection) => connection.driftEvents.map((event) => ({ ...event, portainerConnection: connection, aiSystem: connection.aiSystem })));
  const supabaseConnections = systems.flatMap((system) => system.supabaseConnections.map((connection) => ({ ...connection, aiSystem: system })));
  const supabaseEvidenceArtifacts = supabaseConnections.flatMap((connection) => connection.evidenceArtifacts.map((artifact) => ({ ...artifact, supabaseConnection: connection, aiSystem: connection.aiSystem })));
  const supabaseEvidenceSnapshots = supabaseConnections.flatMap((connection) => connection.snapshots.map((snapshot) => ({ ...snapshot, supabaseConnection: connection, aiSystem: connection.aiSystem })));
  const supabaseDriftEvents = supabaseConnections.flatMap((connection) => connection.driftEvents.map((event) => ({ ...event, supabaseConnection: connection, aiSystem: connection.aiSystem })));
  const supabaseControlValidations = supabaseConnections.flatMap((connection) => connection.controlValidations.map((validation) => ({ ...validation, supabaseConnection: connection, aiSystem: connection.aiSystem })));
  const mcpConnections = systems.flatMap((system) => system.mcpConnections.map((connection) => ({ ...connection, aiSystem: system })));
  const mcpEvidenceArtifacts = mcpConnections.flatMap((connection) => connection.evidenceArtifacts.map((artifact) => ({ ...artifact, mcpConnection: connection, aiSystem: connection.aiSystem })));
  const notionConnections = systems.flatMap((system) => system.notionConnections.map((connection) => ({ ...connection, aiSystem: system })));
  const notionEvidenceArtifacts = notionConnections.flatMap((connection) => connection.evidenceArtifacts.map((artifact) => ({ ...artifact, notionConnection: connection, aiSystem: connection.aiSystem })));
  const secretsConnections = systems.flatMap((system) => system.secretsConnections.map((connection) => ({ ...connection, aiSystem: system })));
  const secretEvidenceArtifacts = secretsConnections.flatMap((connection) => connection.evidenceArtifacts.map((artifact) => ({ ...artifact, secretsConnection: connection, aiSystem: connection.aiSystem })));
  const assetDiscoveryRuns = systems.flatMap((system) => system.assetDiscoveryRuns.map((run) => ({ ...run, aiSystem: system })));
  const assetDiscoverySources = assetDiscoveryRuns.flatMap((run) => run.sources.map((source) => ({ ...source, run, aiSystem: run.aiSystem })));
  const assetDiscoveryFindings = assetDiscoveryRuns.flatMap((run) => run.findings.map((finding) => ({ ...finding, run, aiSystem: run.aiSystem })));
  const validatedAssetDiscoveryFindings = assetDiscoveryFindings.filter((finding) => finding.validationStatus !== "INVALID");
  const traceableControlIds = new Set(assuranceRules.map((rule) => rule.controlId));
  for (const artifact of runtimeEvidenceArtifacts) traceableControlIds.add(artifact.relatedControlId);
  for (const artifact of deploymentEvidenceArtifacts) {
    for (const controlId of parseRelatedControls(artifact.relatedControlsJson)) traceableControlIds.add(controlId);
  }
  for (const artifact of supabaseEvidenceArtifacts) {
    for (const controlId of parseRelatedControls(artifact.relatedControlsJson)) traceableControlIds.add(controlId);
  }
  for (const artifact of mcpEvidenceArtifacts) {
    for (const controlId of parseRelatedControls(artifact.relatedControlsJson)) traceableControlIds.add(controlId);
  }
  for (const artifact of notionEvidenceArtifacts) {
    for (const controlId of parseRelatedControls(artifact.relatedControlsJson)) traceableControlIds.add(controlId);
  }
  for (const artifact of secretEvidenceArtifacts) {
    for (const controlId of parseRelatedControls(artifact.relatedControlsJson)) traceableControlIds.add(controlId);
  }
  const requiredTraceabilityControls = ["AI-GOV-001", "AI-GOV-002", "AI-GOV-003", "AI-GOV-004", "AI-GOV-005", "AI-GOV-006", "AI-GOV-010", "AI-AGENT-001", "AI-AGENT-006", "AI-LC-001", "AI-LC-004", "AI-LC-006", "OPS-001", "AUD-001", "GOV-001", "PRI-001", "SEC-001"];
  const missingTraceabilityControls = requiredTraceabilityControls.filter((controlId) => !traceableControlIds.has(controlId));
  const assuranceRows = systems
    .filter((system) => system.assets.length > 0)
    .map((system) => {
      const sources = system.assets.flatMap((asset) => asset.evidenceSources);
      return {
        system,
        evidenceCoverage: percentage(sources.filter((source) => source.collectionStatus !== "MISSING").length, sources.length),
        evidenceFreshness: percentage(sources.filter((source) => source.freshnessStatus === "CURRENT").length, sources.length),
        validationHealth: percentage(sources.filter((source) => source.collectionStatus === "VALIDATED").length, sources.length),
        connectorHealth: percentage(sources.filter((source) => source.connectorHealth === "ON_TRACK").length, sources.length),
        assuranceScore: 0
      };
    })
    .map((row) => ({
      ...row,
      assuranceScore: Math.round((row.evidenceCoverage + row.evidenceFreshness + row.validationHealth + row.connectorHealth) / 4)
    }));
  const runtimeAssuranceRows = systems
    .filter((system) => system.logSources.length > 0)
    .map((system) => {
      const sources = logSources.filter((source) => source.aiSystem.id === system.id);
      const runtimeArtifacts = runtimeEvidenceArtifacts.filter((artifact) => artifact.aiSystem.id === system.id);
      const hasType = (type: string) => sources.some((source) => source.type === type && source.status === "CONNECTED" && source.runtimeArtifacts.length > 0);
      const checks = [
        { label: "Execution Event Demonstrates Control Operation", status: hasType("EXECUTION_LOG") ? "PASS" : "WARNING" },
        { label: "Monitoring Event Demonstrates Control Execution", status: hasType("MONITORING_RESULT") ? "PASS" : "WARNING" },
        { label: "Control Result Demonstrates Monitoring Execution", status: hasType("CONTROL_RESULT") ? "PASS" : "WARNING" },
        { label: "Sanitized Evidence Present", status: runtimeArtifacts.every((artifact) => Boolean(artifact.sanitizedEvidence)) && runtimeArtifacts.length > 0 ? "PASS" : "WARNING" },
        { label: "Retention Valid", status: runtimeArtifacts.every((artifact) => artifact.retentionValid) && sources.every((source) => Boolean(source.retentionPeriod)) ? "PASS" : "WARNING" },
        { label: "Collection Current", status: runtimeArtifacts.every((artifact) => artifact.collectionCurrent) && sources.every((source) => source.lastCollected) ? "PASS" : "WARNING" }
      ];
      return {
        system,
        sources,
        runtimeArtifacts,
        checks,
        assuranceScore: percentage(checks.filter((check) => check.status === "PASS").length, checks.length)
      };
    });
  const deploymentAssuranceRows = systems
    .filter((system) => system.portainerConnections.length > 0)
    .map((system) => {
      const connections = portainerConnections.filter((connection) => connection.aiSystem.id === system.id);
      const deploymentArtifacts = deploymentEvidenceArtifacts.filter((artifact) => artifact.aiSystem.id === system.id);
      const driftEvents = deploymentDriftEvents.filter((event) => event.aiSystem.id === system.id);
      const checks = [
        { label: "Portainer Source Connected", status: connections.some((connection) => connection.status === "CONNECTED") ? "PASS" : "WARNING" },
        { label: "Deployment Evidence Collected", status: deploymentArtifacts.some((artifact) => artifact.validationStatus === "VALID") ? "PASS" : "WARNING" },
        { label: "Runtime Configuration Boundary Preserved", status: deploymentArtifacts.every((artifact) => artifact.runtimeConfiguration.includes("fieldsProhibitedFromCollection")) && deploymentArtifacts.length > 0 ? "PASS" : "WARNING" },
        { label: "Logging Status Verified", status: deploymentArtifacts.some((artifact) => artifact.loggingEnabled === true) ? "PASS" : "WARNING" },
        { label: "Deployment Drift Review Available", status: driftEvents.length > 0 ? "PASS" : "WARNING" }
      ];
      return {
        system,
        connections,
        deploymentArtifacts,
        driftEvents,
        checks,
        assuranceScore: percentage(checks.filter((check) => check.status === "PASS").length, checks.length)
      };
    });
  const supabaseAssuranceRows = systems
    .filter((system) => system.supabaseConnections.length > 0)
    .map((system) => {
      const connections = supabaseConnections.filter((connection) => connection.aiSystem.id === system.id);
      const supabaseArtifacts = supabaseEvidenceArtifacts.filter((artifact) => artifact.aiSystem.id === system.id);
      const snapshots = supabaseEvidenceSnapshots.filter((snapshot) => snapshot.aiSystem.id === system.id);
      const driftEvents = supabaseDriftEvents.filter((event) => event.aiSystem.id === system.id);
      const controlValidations = supabaseControlValidations.filter((validation) => validation.aiSystem.id === system.id);
      const checks = [
        { label: "Supabase Source Connected", status: connections.some((connection) => connection.status === "CONNECTED") ? "PASS" : "WARNING" },
        { label: "Schema Evidence Collected", status: supabaseArtifacts.some((artifact) => artifact.evidenceType === "SCHEMA" && artifact.validationStatus === "VALID") ? "PASS" : "WARNING" },
        { label: "Data Inventory Evidence Collected", status: supabaseArtifacts.some((artifact) => artifact.evidenceType === "DATA_INVENTORY" && artifact.validationStatus === "VALID") ? "PASS" : "WARNING" },
        { label: "RLS Policy Assurance Available", status: supabaseArtifacts.some((artifact) => artifact.evidenceType === "POLICY" && artifact.validationStatus === "VALID") ? "PASS" : "WARNING" },
        { label: "Access Metadata Reviewable", status: supabaseArtifacts.some((artifact) => artifact.evidenceType === "ACCESS_CONTROL" && artifact.validationStatus === "VALID") ? "PASS" : "WARNING" },
        { label: "Historical Snapshot Retained", status: snapshots.length > 0 ? "PASS" : "WARNING" },
        { label: "Drift Review Available", status: driftEvents.length > 0 ? "PASS" : "WARNING" },
        { label: "Control Validation Available", status: controlValidations.length > 0 ? "PASS" : "WARNING" }
      ];
      return {
        system,
        connections,
        supabaseArtifacts,
        snapshots,
        driftEvents,
        controlValidations,
        checks,
        assuranceScore: percentage(checks.filter((check) => check.status === "PASS").length, checks.length)
      };
    });
  const mcpAssuranceRows = systems
    .filter((system) => system.mcpConnections.length > 0)
    .map((system) => {
      const connections = mcpConnections.filter((connection) => connection.aiSystem.id === system.id);
      const mcpArtifacts = mcpEvidenceArtifacts.filter((artifact) => artifact.aiSystem.id === system.id);
      const checks = [
        { label: "MCP Source Connected", status: connections.some((connection) => connection.status === "CONNECTED") ? "PASS" : "WARNING" },
        { label: "Tool Registry Collected", status: mcpArtifacts.some((artifact) => artifact.evidenceType === "TOOL_REGISTRY" && artifact.validationStatus === "VALID") ? "PASS" : "WARNING" },
        { label: "Tool Permissions Reviewable", status: mcpArtifacts.some((artifact) => artifact.evidenceType === "TOOL_PERMISSIONS" && artifact.evidenceHealth !== "MISSING") ? "PASS" : "WARNING" },
        { label: "Authority Classification Available", status: mcpArtifacts.some((artifact) => artifact.evidenceType === "AUTHORITY_REGISTRY" && artifact.evidenceHealth !== "MISSING") ? "PASS" : "WARNING" },
        { label: "Capability Inventory Collected", status: mcpArtifacts.some((artifact) => artifact.evidenceType === "CAPABILITY_INVENTORY" && artifact.validationStatus === "VALID") ? "PASS" : "WARNING" }
      ];
      return {
        system,
        connections,
        mcpArtifacts,
        checks,
        assuranceScore: percentage(checks.filter((check) => check.status === "PASS").length, checks.length)
      };
    });
  const notionAssuranceRows = systems
    .filter((system) => system.notionConnections.length > 0)
    .map((system) => {
      const connections = notionConnections.filter((connection) => connection.aiSystem.id === system.id);
      const notionArtifacts = notionEvidenceArtifacts.filter((artifact) => artifact.aiSystem.id === system.id);
      const checks = [
        { label: "Notion Source Connected", status: connections.some((connection) => connection.status === "CONNECTED") ? "PASS" : "WARNING" },
        { label: "Governance Documentation Inventory Visible", status: notionArtifacts.some((artifact) => artifact.evidenceType === "GOVERNANCE_DOCUMENTATION_EVIDENCE" && artifact.evidenceHealth !== "MISSING") ? "PASS" : "WARNING" },
        { label: "Approval Evidence Reviewable", status: notionArtifacts.some((artifact) => artifact.evidenceType === "APPROVAL_EVIDENCE" && artifact.evidenceHealth !== "MISSING") ? "PASS" : "WARNING" },
        { label: "Review Evidence Reviewable", status: notionArtifacts.some((artifact) => artifact.evidenceType === "REVIEW_EVIDENCE" && artifact.evidenceHealth !== "MISSING") ? "PASS" : "WARNING" },
        { label: "Ownership Accountability Visible", status: notionArtifacts.some((artifact) => artifact.evidenceType === "OWNERSHIP_EVIDENCE" && artifact.evidenceHealth !== "MISSING") ? "PASS" : "WARNING" }
      ];
      return {
        system,
        connections,
        notionArtifacts,
        checks,
        assuranceScore: percentage(checks.filter((check) => check.status === "PASS").length, checks.length)
      };
    });
  const secretsAssuranceRows = systems
    .filter((system) => system.secretsConnections.length > 0)
    .map((system) => {
      const connections = secretsConnections.filter((connection) => connection.aiSystem.id === system.id);
      const secretArtifacts = secretEvidenceArtifacts.filter((artifact) => artifact.aiSystem.id === system.id);
      const checks = [
        { label: "Secrets Source Connected", status: connections.some((connection) => connection.status === "CONNECTED") ? "PASS" : "WARNING" },
        { label: "Secret Inventory Collected", status: secretArtifacts.some((artifact) => artifact.evidenceType === "SECRET_INVENTORY" && artifact.validationStatus === "VALID") ? "PASS" : "WARNING" },
        { label: "Rotation Evidence Reviewable", status: secretArtifacts.some((artifact) => artifact.evidenceType === "ROTATION_EVIDENCE" && artifact.evidenceHealth !== "MISSING") ? "PASS" : "WARNING" },
        { label: "Ownership Evidence Reviewable", status: secretArtifacts.some((artifact) => artifact.evidenceType === "OWNERSHIP_EVIDENCE" && artifact.evidenceHealth !== "MISSING") ? "PASS" : "WARNING" },
        { label: "Usage Mapping Collected", status: secretArtifacts.some((artifact) => artifact.evidenceType === "USAGE_MAPPING" && artifact.validationStatus === "VALID") ? "PASS" : "WARNING" },
        { label: "Plaintext Prohibition Preserved", status: secretArtifacts.every((artifact) => artifact.plaintextProhibition.includes("secret values")) && secretArtifacts.length > 0 ? "PASS" : "WARNING" }
      ];
      return {
        system,
        connections,
        secretArtifacts,
        checks,
        assuranceScore: percentage(checks.filter((check) => check.status === "PASS").length, checks.length)
      };
    });
  const traceableEvidenceCount = artifacts.length + runtimeEvidenceArtifacts.length + deploymentEvidenceArtifacts.length + supabaseEvidenceArtifacts.length + mcpEvidenceArtifacts.length + notionEvidenceArtifacts.length + secretEvidenceArtifacts.length;

  return {
    systems,
    assets,
    evidenceSources,
    artifacts,
    assuranceRules,
    logSources,
    runtimeEvidenceArtifacts,
    runtimeAssuranceRows,
    portainerConnections,
    deploymentEvidenceArtifacts,
    deploymentDriftEvents,
    deploymentAssuranceRows,
    supabaseConnections,
    supabaseEvidenceArtifacts,
    supabaseEvidenceSnapshots,
    supabaseDriftEvents,
    supabaseControlValidations,
    supabaseAssuranceRows,
    mcpConnections,
    mcpEvidenceArtifacts,
    mcpAssuranceRows,
    notionConnections,
    notionEvidenceArtifacts,
    notionAssuranceRows,
    secretsConnections,
    secretEvidenceArtifacts,
    secretsAssuranceRows,
    assetDiscoveryRuns,
    assetDiscoverySources,
    assetDiscoveryFindings,
    repositoryConnections: systems.flatMap((system) => system.repositoryConnections.map((connection) => ({ ...connection, aiSystem: system }))),
    driftEvents: systems.flatMap((system) => system.repositoryConnections.flatMap((connection) => connection.driftEvents.map((event) => ({ ...event, repositoryConnection: connection, aiSystem: system })))),
    assuranceRows,
    kpis: {
      assets: assets.length,
      evidenceSources: evidenceSources.length,
      artifacts: artifacts.length,
      logSources: logSources.length,
      runtimeEvidence: runtimeEvidenceArtifacts.length,
      portainerConnections: portainerConnections.length,
      deploymentEvidence: deploymentEvidenceArtifacts.length,
      deploymentDrift: deploymentDriftEvents.length,
      supabaseConnections: supabaseConnections.length,
      supabaseEvidence: supabaseEvidenceArtifacts.length,
      supabaseSnapshots: supabaseEvidenceSnapshots.length,
      supabaseDrift: supabaseDriftEvents.length,
      supabaseControlValidations: supabaseControlValidations.length,
      mcpConnections: mcpConnections.length,
      mcpEvidence: mcpEvidenceArtifacts.length,
      notionConnections: notionConnections.length,
      notionEvidence: notionEvidenceArtifacts.length,
      secretsConnections: secretsConnections.length,
      secretEvidence: secretEvidenceArtifacts.length,
      assetDiscoveryRuns: assetDiscoveryRuns.length,
      assetDiscoverySources: assetDiscoverySources.length,
      assetDiscoveryFindings: assetDiscoveryFindings.length,
      unknownAssets: validatedAssetDiscoveryFindings.filter((finding) => finding.disposition === "UNKNOWN_ASSET").length,
      untrackedAssets: validatedAssetDiscoveryFindings.filter((finding) => finding.disposition === "UNTRACKED_ASSET").length,
      orphanedAssets: validatedAssetDiscoveryFindings.filter((finding) => finding.disposition === "ORPHANED_ASSET").length,
      missingAssets: validatedAssetDiscoveryFindings.filter((finding) => finding.disposition === "MISSING_ASSET").length,
      openDiscoveryFindings: validatedAssetDiscoveryFindings.filter((finding) => finding.status === "OPEN" || finding.status === "REVIEW_REQUIRED").length,
      connectedPortainerConnections: portainerConnections.filter((connection) => connection.status === "CONNECTED").length,
      validDeploymentEvidence: deploymentEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID").length,
      connectedSupabaseConnections: supabaseConnections.filter((connection) => connection.status === "CONNECTED").length,
      validSupabaseEvidence: supabaseEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID").length,
      passingSupabaseControlValidations: supabaseControlValidations.filter((validation) => validation.result === "PASS").length,
      connectedMcpConnections: mcpConnections.filter((connection) => connection.status === "CONNECTED").length,
      validMcpEvidence: mcpEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID").length,
      connectedNotionConnections: notionConnections.filter((connection) => connection.status === "CONNECTED").length,
      validNotionEvidence: notionEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID").length,
      connectedSecretsConnections: secretsConnections.filter((connection) => connection.status === "CONNECTED").length,
      validSecretEvidence: secretEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID").length,
      connectedLogSources: logSources.filter((source) => source.status === "CONNECTED").length,
      runtimeEvidencePresent: runtimeEvidenceArtifacts.filter((artifact) => artifact.evidenceHealth === "PRESENT").length,
      runtimeEvidenceMissing: runtimeEvidenceArtifacts.filter((artifact) => artifact.evidenceHealth === "MISSING").length,
      runtimeEvidenceStale: runtimeEvidenceArtifacts.filter((artifact) => artifact.evidenceHealth === "STALE").length,
      runtimeRetentionValid: runtimeEvidenceArtifacts.filter((artifact) => artifact.retentionValid).length,
      runtimeCollectionCurrent: runtimeEvidenceArtifacts.filter((artifact) => artifact.collectionCurrent).length,
      passingAssuranceRules: assuranceRules.filter((rule) => rule.status === "PASS").length,
      assuranceRules: assuranceRules.length,
      traceableControls: traceableControlIds.size,
      controlCoverage: percentage(traceableControlIds.size, requiredTraceabilityControls.length),
      evidenceCoverage: percentage(traceableEvidenceCount, traceableEvidenceCount + missingTraceabilityControls.length),
      missingEvidence: missingTraceabilityControls.length,
      validatedSources: evidenceSources.filter((source) => source.collectionStatus === "VALIDATED").length,
      currentSources: evidenceSources.filter((source) => source.freshnessStatus === "CURRENT").length,
      averageAssurance: percentage(assuranceRows.reduce((total, row) => total + row.assuranceScore, 0), assuranceRows.length * 100)
    },
    byAssetType: countBy(assets, "assetType"),
    byValidationStatus: countBy(evidenceSources, "collectionStatus"),
    byFreshness: countBy(evidenceSources, "freshnessStatus"),
    byConnectorHealth: countBy(evidenceSources, "connectorHealth"),
    byLogSourceStatus: countBy(logSources, "status"),
    byRuntimeValidation: countBy(runtimeEvidenceArtifacts, "validationStatus"),
    byDeploymentValidation: countBy(deploymentEvidenceArtifacts, "validationStatus"),
    byDeploymentHealth: countBy(deploymentEvidenceArtifacts, "evidenceHealth"),
    bySupabaseValidation: countBy(supabaseEvidenceArtifacts, "validationStatus"),
    bySupabaseHealth: countBy(supabaseEvidenceArtifacts, "evidenceHealth"),
    bySupabaseDriftStatus: countBy(supabaseDriftEvents, "status"),
    bySupabaseControlValidation: countBy(supabaseControlValidations, "result"),
    byMcpValidation: countBy(mcpEvidenceArtifacts, "validationStatus"),
    byMcpHealth: countBy(mcpEvidenceArtifacts, "evidenceHealth"),
    byNotionValidation: countBy(notionEvidenceArtifacts, "validationStatus"),
    byNotionHealth: countBy(notionEvidenceArtifacts, "evidenceHealth"),
    bySecretValidation: countBy(secretEvidenceArtifacts, "validationStatus"),
    bySecretHealth: countBy(secretEvidenceArtifacts, "evidenceHealth"),
    byDiscoveryDisposition: countBy(assetDiscoveryFindings, "disposition"),
    byDiscoveryFindingType: countBy(assetDiscoveryFindings, "findingType"),
    byDiscoveryStatus: countBy(assetDiscoveryFindings, "status"),
    missingTraceabilityControls
  };
}

export async function getAssetDiscoveryRun(runId: string) {
  return prisma.assetDiscoveryRun.findUnique({
    where: { runId },
    include: {
      aiSystem: true,
      sources: { orderBy: [{ sourceType: "asc" }, { sourceId: "asc" }] },
      findings: {
        include: {
          discoverySource: true,
          asset: { include: { aiSystem: true, evidenceSources: true } }
        },
        orderBy: [{ status: "asc" }, { severity: "desc" }, { findingId: "asc" }]
      }
    }
  });
}

export async function getRuntimeEvidenceArtifact(artifactId: string) {
  const artifact = await prisma.runtimeEvidenceArtifact.findUnique({
    where: { artifactId },
    include: {
      logSource: {
        include: {
          aiSystem: true,
          evidenceSource: { include: { asset: true } }
        }
      }
    }
  });
  if (!artifact) return null;

  const control = await prisma.control.findUnique({
    where: { code: artifact.relatedControlId },
    include: { regulatoryMappings: true, governanceStory: true }
  });

  return { ...artifact, control };
}

export async function getDeploymentEvidenceArtifact(artifactId: string) {
  const artifact = await prisma.deploymentEvidenceArtifact.findUnique({
    where: { artifactId },
    include: {
      portainerConnection: { include: { aiSystem: true } },
      evidenceSource: { include: { asset: { include: { aiSystem: true } } } },
      driftEvents: { orderBy: { detectedAt: "desc" } }
    }
  });
  if (!artifact) return null;

  const relatedControlIds = parseRelatedControls(artifact.relatedControlsJson);
  const controls = await prisma.control.findMany({
    where: { code: { in: relatedControlIds } },
    include: { regulatoryMappings: true, governanceStory: true },
    orderBy: { code: "asc" }
  });

  return { ...artifact, controls, relatedControlIds };
}

export async function getSupabaseEvidenceArtifact(artifactId: string) {
  const artifact = await prisma.supabaseEvidenceArtifact.findUnique({
    where: { artifactId },
    include: {
      supabaseConnection: {
        include: {
          aiSystem: true,
          snapshots: { orderBy: { collectionTimestamp: "desc" } },
          driftEvents: { orderBy: { detectedAt: "desc" } },
          controlValidations: { orderBy: [{ result: "asc" }, { controlId: "asc" }] }
        }
      },
      evidenceSource: { include: { asset: { include: { aiSystem: true } } } },
      controlValidations: { orderBy: [{ result: "asc" }, { controlId: "asc" }] }
    }
  });
  if (!artifact) return null;

  const relatedControlIds = parseRelatedControls(artifact.relatedControlsJson);
  const controls = await prisma.control.findMany({
    where: { code: { in: relatedControlIds } },
    include: { regulatoryMappings: true, governanceStory: true },
    orderBy: { code: "asc" }
  });

  return { ...artifact, controls, relatedControlIds };
}

export async function getMcpEvidenceArtifact(artifactId: string) {
  const artifact = await prisma.mcpEvidenceArtifact.findUnique({
    where: { artifactId },
    include: {
      mcpConnection: { include: { aiSystem: true } },
      evidenceSource: { include: { asset: { include: { aiSystem: true } } } }
    }
  });
  if (!artifact) return null;

  const relatedControlIds = parseRelatedControls(artifact.relatedControlsJson);
  const controls = await prisma.control.findMany({
    where: { code: { in: relatedControlIds } },
    include: { regulatoryMappings: true, governanceStory: true },
    orderBy: { code: "asc" }
  });

  return { ...artifact, controls, relatedControlIds };
}

export async function getNotionEvidenceArtifact(artifactId: string) {
  const artifact = await prisma.notionEvidenceArtifact.findUnique({
    where: { artifactId },
    include: {
      notionConnection: { include: { aiSystem: true } },
      evidenceSource: { include: { asset: { include: { aiSystem: true } } } }
    }
  });
  if (!artifact) return null;

  const relatedControlIds = parseRelatedControls(artifact.relatedControlsJson);
  const controls = await prisma.control.findMany({
    where: { code: { in: relatedControlIds } },
    include: { regulatoryMappings: true, governanceStory: true },
    orderBy: { code: "asc" }
  });

  return { ...artifact, controls, relatedControlIds };
}

export async function getSecretEvidenceArtifact(artifactId: string) {
  const artifact = await prisma.secretEvidenceArtifact.findUnique({
    where: { artifactId },
    include: {
      secretsConnection: { include: { aiSystem: true } },
      evidenceSource: { include: { asset: { include: { aiSystem: true } } } }
    }
  });
  if (!artifact) return null;

  const relatedControlIds = parseRelatedControls(artifact.relatedControlsJson);
  const controls = await prisma.control.findMany({
    where: { code: { in: relatedControlIds } },
    include: { regulatoryMappings: true, governanceStory: true },
    orderBy: { code: "asc" }
  });

  return { ...artifact, controls, relatedControlIds };
}

export async function getEvidenceArtifact(artifactId: string) {
  const artifact = await prisma.evidenceArtifact.findUnique({
    where: { artifactId },
    include: {
      repositoryConnection: {
        include: { driftEvents: { orderBy: { detectedAt: "desc" } } }
      },
      snapshots: { orderBy: { collectedAt: "desc" } },
      assuranceRules: { include: { explanation: true }, orderBy: [{ status: "asc" }, { severity: "asc" }, { controlId: "asc" }] },
      source: {
        include: {
          asset: {
            include: {
              aiSystem: {
                include: {
                  systemControls: { include: { control: true }, orderBy: { control: { code: "asc" } } },
                  evidenceObjects: { orderBy: { evidenceId: "asc" } }
                }
              }
            }
          },
          artifacts: { orderBy: [{ artifactType: "asc" }, { name: "asc" }] }
        }
      }
    }
  });

  if (!artifact) return null;

  const controlIds = [...new Set(artifact.assuranceRules.map((rule) => rule.controlId))];
  const traceControls = await prisma.control.findMany({
    where: { code: { in: controlIds } },
    include: { regulatoryMappings: true, governanceStory: true },
    orderBy: { code: "asc" }
  });

  return { ...artifact, traceControls };
}

export async function getEvidenceArtifactDriftComparison(artifactId: string) {
  const artifact = await getEvidenceArtifact(artifactId);
  if (!artifact) return null;

  const snapshot = artifact.snapshots[0] ?? {
    snapshotId: `SNAP-${artifact.artifactId}-LEGACY`,
    content: artifact.content,
    artifactHash: artifact.artifactHash,
    commitSha: artifact.commitSha,
    version: artifact.version,
    sourceUrl: artifact.sourceUrl,
    collectionMethod: "Legacy artifact record",
    collectedAt: artifact.lastCollected
  };
  const current = await fetchCurrentRepositoryArtifact({
    repositoryUrl: artifact.repositoryConnection?.repositoryUrl,
    branch: artifact.repositoryConnection?.branch,
    path: artifact.path
  });
  const comparisonStatus = current.available
    ? current.artifactHash === snapshot.artifactHash ? "MATCH" : "DRIFT"
    : "UNAVAILABLE";

  return {
    artifact,
    snapshot,
    current,
    comparisonStatus,
    changedLines: current.available ? compareText(snapshot.content, current.content) : []
  };
}

export async function getAiSystem(slug: string) {
  return prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      components: { orderBy: [{ type: "asc" }, { name: "asc" }] },
      evidenceItems: { orderBy: { dueDate: "asc" } },
      evidenceObjects: {
        include: {
          requirementLinks: { include: { evidenceRequirement: { include: { regulatoryControl: { include: { regulation: true } } } } } },
          auditPackageLinks: { include: { auditPackage: true } }
        },
        orderBy: { expirationDate: "asc" }
      },
      evidenceHealth: { include: { evidenceRequirement: { include: { regulatoryControl: { include: { regulation: true } } } } }, orderBy: { calculatedAt: "desc" } },
      auditEvents: { orderBy: { createdAt: "desc" } },
      systemControls: {
        include: {
          control: {
            include: { regulatoryMappings: true }
          }
        },
        orderBy: { control: { code: "asc" } }
      }
    }
  });
}

export async function getAiSystemWorkspace(slug: string) {
  const system = await prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      evidenceItems: { orderBy: { dueDate: "asc" } },
      evidenceObjects: {
        include: {
          requirementLinks: { include: { evidenceRequirement: { include: { regulatoryControl: { include: { regulation: true } } } } } },
          auditPackageLinks: { include: { auditPackage: true } }
        },
        orderBy: { expirationDate: "asc" }
      },
      evidenceHealth: { include: { evidenceRequirement: { include: { regulatoryControl: { include: { regulation: true } } } } }, orderBy: { calculatedAt: "desc" } },
      systemControls: { include: { control: true }, orderBy: { control: { code: "asc" } } },
      regulatoryControls: { include: { regulatoryControl: { include: { regulation: true } } } },
      testRuns: { include: { controlTest: true }, orderBy: { executionDate: "desc" } },
      findings: { include: { controlTest: true, exceptions: true }, orderBy: [{ status: "asc" }, { severity: "asc" }] },
      aiRisks: { include: { controlLinks: { include: { control: true } }, evidenceLinks: { include: { evidenceObject: true } } } },
      aiModels: true,
      promptAssets: true,
      agents: true,
      authorityAssignment: { include: { delegatedAuthority: true } },
      lifecycleRecords: { orderBy: { stageEntryDate: "asc" } },
      lifecycleApprovals: true,
      controlImplementations: { include: { primaryControl: true, controlLinks: { include: { control: true } }, evidence: true } },
      auditPackages: { include: { evidenceLinks: { include: { evidenceObject: true } } }, orderBy: { generatedDate: "desc" } },
      auditEvents: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!system) return null;
  const openFindings = system.findings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS");
  const currentEvidence = system.evidenceHealth.filter((record) => record.health === "CURRENT" && record.validation === "VALID").length;
  const evidenceHealthPct = Math.round((currentEvidence / Math.max(system.evidenceHealth.length, 1)) * 100);
  const regulatoryExposure = new Set(system.regulatoryControls.map((mapping) => mapping.regulatoryControl.regulation.jurisdiction)).size;
  const passRuns = system.testRuns.filter((run) => run.result === "PASS").length;
  const monitoringPassRate = Math.round((passRuns / Math.max(system.testRuns.length, 1)) * 100);

  return {
    ...system,
    workspaceMetrics: {
      openFindings: openFindings.length,
      evidenceHealthPct,
      regulatoryExposure,
      monitoringPassRate,
      controls: system.systemControls.length,
      risks: system.aiRisks.length,
      implementations: system.controlImplementations.length
    }
  };
}

export async function getControls() {
  return prisma.control.findMany({
    include: { regulatoryMappings: true },
    orderBy: [{ category: "asc" }, { code: "asc" }]
  });
}

export async function getControlTraceability(controlId: string) {
  const normalizedControlId = decodeURIComponent(controlId).toUpperCase();
  const [control, assuranceRules, runtimeEvidenceArtifacts, deploymentEvidenceArtifacts, supabaseEvidenceArtifacts, mcpEvidenceArtifacts, notionEvidenceArtifacts, secretEvidenceArtifacts, findings] = await Promise.all([
    prisma.control.findUnique({
      where: { code: normalizedControlId },
      include: {
        governanceStory: true,
        regulatoryMappings: true,
        systemControls: { include: { aiSystem: true }, orderBy: { aiSystem: { name: "asc" } } },
        implementationLinks: { include: { controlImplementation: { include: { evidence: true, aiSystem: true } } } },
        primaryImplementations: { include: { evidence: true, aiSystem: true } },
        aiRiskLinks: { include: { aiRisk: { include: { aiSystem: true } } } }
      }
    }),
    prisma.assuranceRule.findMany({
      where: { controlId: normalizedControlId },
      include: {
        explanation: true,
        evidenceArtifact: {
          include: {
            source: {
              include: {
                asset: {
                  include: { aiSystem: true }
                }
              }
            },
            repositoryConnection: true
          }
        }
      },
      orderBy: [{ status: "asc" }, { artifactType: "asc" }, { validationRule: "asc" }]
    }),
    prisma.runtimeEvidenceArtifact.findMany({
      where: { relatedControlId: normalizedControlId },
      include: {
        logSource: {
          include: {
            aiSystem: true,
            evidenceSource: { include: { asset: true } }
          }
        }
      },
      orderBy: [{ validationStatus: "asc" }, { eventTimestamp: "desc" }]
    }),
    prisma.deploymentEvidenceArtifact.findMany({
      where: { relatedControlsJson: { contains: normalizedControlId } },
      include: {
        portainerConnection: { include: { aiSystem: true } },
        evidenceSource: { include: { asset: { include: { aiSystem: true } } } },
        driftEvents: { orderBy: { detectedAt: "desc" } }
      },
      orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
    }),
    prisma.supabaseEvidenceArtifact.findMany({
      where: { relatedControlsJson: { contains: normalizedControlId } },
      include: {
        supabaseConnection: { include: { aiSystem: true } },
        evidenceSource: { include: { asset: { include: { aiSystem: true } } } },
        controlValidations: { where: { controlId: normalizedControlId }, orderBy: [{ result: "asc" }, { controlId: "asc" }] }
      },
      orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
    }),
    prisma.mcpEvidenceArtifact.findMany({
      where: { relatedControlsJson: { contains: normalizedControlId } },
      include: {
        mcpConnection: { include: { aiSystem: true } },
        evidenceSource: { include: { asset: { include: { aiSystem: true } } } }
      },
      orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
    }),
    prisma.notionEvidenceArtifact.findMany({
      where: { relatedControlsJson: { contains: normalizedControlId } },
      include: {
        notionConnection: { include: { aiSystem: true } },
        evidenceSource: { include: { asset: { include: { aiSystem: true } } } }
      },
      orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
    }),
    prisma.secretEvidenceArtifact.findMany({
      where: { relatedControlsJson: { contains: normalizedControlId } },
      include: {
        secretsConnection: { include: { aiSystem: true } },
        evidenceSource: { include: { asset: { include: { aiSystem: true } } } }
      },
      orderBy: [{ validationStatus: "asc" }, { collectionTimestamp: "desc" }]
    }),
    prisma.finding.findMany({
      include: { aiSystem: true, controlTest: true, exceptions: true },
      orderBy: [{ status: "asc" }, { severity: "asc" }]
    })
  ]);

  if (!control) return null;

  const artifactsById = new Map(assuranceRules.map((rule) => [rule.evidenceArtifact.id, rule.evidenceArtifact]));
  const evidenceArtifacts = [...artifactsById.values()].sort((a, b) => a.artifactType.localeCompare(b.artifactType) || a.name.localeCompare(b.name));
  const deploymentEvidenceSources = deploymentEvidenceArtifacts.flatMap((artifact) => artifact.evidenceSource ? [artifact.evidenceSource] : []);
  const supabaseEvidenceSources = supabaseEvidenceArtifacts.flatMap((artifact) => artifact.evidenceSource ? [artifact.evidenceSource] : []);
  const mcpEvidenceSources = mcpEvidenceArtifacts.flatMap((artifact) => artifact.evidenceSource ? [artifact.evidenceSource] : []);
  const notionEvidenceSources = notionEvidenceArtifacts.flatMap((artifact) => artifact.evidenceSource ? [artifact.evidenceSource] : []);
  const secretEvidenceSources = secretEvidenceArtifacts.flatMap((artifact) => artifact.evidenceSource ? [artifact.evidenceSource] : []);
  const evidenceSources = [...new Map([...evidenceArtifacts.map((artifact) => artifact.source), ...deploymentEvidenceSources, ...supabaseEvidenceSources, ...mcpEvidenceSources, ...notionEvidenceSources, ...secretEvidenceSources].map((source) => [source.id, source])).values()]
    .sort((a, b) => a.sourceId.localeCompare(b.sourceId));
  const assets = [...new Map(evidenceSources.map((source) => [source.asset.id, source.asset])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
  const artifactSystems = assets.map((asset) => asset.aiSystem);
  const runtimeSystems = runtimeEvidenceArtifacts.map((artifact) => artifact.logSource.aiSystem);
  const deploymentSystems = deploymentEvidenceArtifacts.map((artifact) => artifact.portainerConnection.aiSystem);
  const supabaseSystems = supabaseEvidenceArtifacts.map((artifact) => artifact.supabaseConnection.aiSystem);
  const mcpSystems = mcpEvidenceArtifacts.map((artifact) => artifact.mcpConnection.aiSystem);
  const notionSystems = notionEvidenceArtifacts.map((artifact) => artifact.notionConnection.aiSystem);
  const secretSystems = secretEvidenceArtifacts.map((artifact) => artifact.secretsConnection.aiSystem);
  const systems = [...new Map([...artifactSystems, ...runtimeSystems, ...deploymentSystems, ...supabaseSystems, ...mcpSystems, ...notionSystems, ...secretSystems].map((system) => [system.id, system])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
  const evidenceRequired = evidenceTypesForControl(control.code);
  const deploymentEvidenceRequired = deploymentEvidenceTypesForControl(control.code);
  const supabaseEvidenceRequired = supabaseEvidenceTypesForControl(control.code);
  const mcpEvidenceRequired = mcpEvidenceTypesForControl(control.code);
  const notionEvidenceRequired = notionEvidenceTypesForControl(control.code);
  const secretEvidenceRequired = secretEvidenceTypesForControl(control.code);
  const presentTypes = new Set(evidenceArtifacts.map((artifact) => artifact.artifactType));
  const evidencePresent = evidenceRequired.filter((required) => presentTypes.has(required.artifactType));
  const evidenceMissing = evidenceRequired.filter((required) => !presentTypes.has(required.artifactType));
  const validDeploymentEvidence = deploymentEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID");
  const deploymentEvidencePresent = deploymentEvidenceRequired.length > 0 && validDeploymentEvidence.length > 0 ? deploymentEvidenceRequired : [];
  const deploymentEvidenceMissing = deploymentEvidenceRequired.length > 0 && validDeploymentEvidence.length === 0 ? deploymentEvidenceRequired : [];
  const validSupabaseEvidence = supabaseEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID");
  const supabaseControlValidations = supabaseEvidenceArtifacts.flatMap((artifact) => artifact.controlValidations);
  const presentSupabaseTypes = new Set(validSupabaseEvidence.map((artifact) => artifact.evidenceType));
  const supabaseEvidencePresent = supabaseEvidenceRequired.filter((required) => presentSupabaseTypes.has(required.evidenceType));
  const supabaseEvidenceMissing = supabaseEvidenceRequired.filter((required) => !presentSupabaseTypes.has(required.evidenceType));
  const validMcpEvidence = mcpEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID");
  const presentMcpTypes = new Set(validMcpEvidence.map((artifact) => artifact.evidenceType));
  const mcpEvidencePresent = mcpEvidenceRequired.filter((required) => presentMcpTypes.has(required.evidenceType));
  const mcpEvidenceMissing = mcpEvidenceRequired.filter((required) => !presentMcpTypes.has(required.evidenceType));
  const validNotionEvidence = notionEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID");
  const presentNotionTypes = new Set(validNotionEvidence.map((artifact) => artifact.evidenceType));
  const notionEvidencePresent = notionEvidenceRequired.filter((required) => presentNotionTypes.has(required.evidenceType));
  const notionEvidenceMissing = notionEvidenceRequired.filter((required) => !presentNotionTypes.has(required.evidenceType));
  const validSecretEvidence = secretEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID");
  const presentSecretTypes = new Set(validSecretEvidence.map((artifact) => artifact.evidenceType));
  const secretEvidencePresent = secretEvidenceRequired.filter((required) => presentSecretTypes.has(required.evidenceType));
  const secretEvidenceMissing = secretEvidenceRequired.filter((required) => !presentSecretTypes.has(required.evidenceType));
  const passCount = assuranceRules.filter((rule) => rule.status === "PASS").length;
  const deploymentPassCount = deploymentEvidenceArtifacts.filter((artifact) => artifact.validationStatus === "VALID").length;
  const supabasePassCount = supabaseEvidencePresent.length;
  const mcpPassCount = mcpEvidencePresent.length;
  const notionPassCount = notionEvidencePresent.length;
  const secretPassCount = secretEvidencePresent.length;
  const assuranceScoreDenominator = assuranceRules.length + deploymentEvidenceRequired.length + supabaseEvidenceRequired.length + mcpEvidenceRequired.length + notionEvidenceRequired.length + secretEvidenceRequired.length;
  const assuranceScore = assuranceScoreDenominator > 0 ? Math.round(((passCount + deploymentPassCount + supabasePassCount + mcpPassCount + notionPassCount + secretPassCount) / assuranceScoreDenominator) * 100) : 0;
  const controlFindings = findings.filter((finding) =>
    finding.controlTest.traditionalGovernanceConcept.toLowerCase().includes(control.title.toLowerCase())
    || finding.controlTest.aiGovernanceInterpretation.toLowerCase().includes(control.code.toLowerCase())
    || finding.controlTest.description.toLowerCase().includes(control.code.toLowerCase())
  );

  return {
    control,
    assuranceRules,
    runtimeEvidenceArtifacts,
    deploymentEvidenceArtifacts,
    supabaseEvidenceArtifacts,
    supabaseControlValidations,
    mcpEvidenceArtifacts,
    notionEvidenceArtifacts,
    secretEvidenceArtifacts,
    evidenceArtifacts,
    evidenceSources,
    assets,
    systems,
    evidenceRequired,
    deploymentEvidenceRequired,
    supabaseEvidenceRequired,
    mcpEvidenceRequired,
    notionEvidenceRequired,
    secretEvidenceRequired,
    evidencePresent,
    deploymentEvidencePresent,
    supabaseEvidencePresent,
    mcpEvidencePresent,
    notionEvidencePresent,
    secretEvidencePresent,
    evidenceMissing,
    deploymentEvidenceMissing,
    supabaseEvidenceMissing,
    mcpEvidenceMissing,
    notionEvidenceMissing,
    secretEvidenceMissing,
    assuranceScore,
    findings: controlFindings,
    exceptions: controlFindings.flatMap((finding) => finding.exceptions)
  };
}

export async function getMappings() {
  return prisma.regulatoryMapping.findMany({
    include: { control: true },
    orderBy: [{ framework: "asc" }, { citation: "asc" }]
  });
}

export async function getEvidence() {
  const [objects, health, packages] = await Promise.all([
    prisma.evidenceObject.findMany({
      include: {
        aiSystem: true,
        requirementLinks: {
          include: {
            evidenceRequirement: {
              include: {
                regulatoryControl: { include: { regulation: true } }
              }
            }
          }
        }
      },
      orderBy: [{ status: "asc" }, { expirationDate: "asc" }]
    }),
    prisma.evidenceHealth.findMany({
      include: {
        aiSystem: true,
        evidenceRequirement: {
          include: { regulatoryControl: { include: { regulation: true } } }
        }
      },
      orderBy: [{ health: "asc" }, { calculatedAt: "desc" }]
    }),
    prisma.auditPackage.findMany({
      include: {
        aiSystem: true,
        evidenceLinks: { include: { evidenceObject: { include: { aiSystem: true } } } }
      },
      orderBy: { generatedDate: "desc" }
    })
  ]);

  return { objects, health, packages };
}

export async function getEvidenceObject(evidenceId: string) {
  return prisma.evidenceObject.findUnique({
    where: { evidenceId },
    include: {
      aiSystem: {
        include: {
          findings: { include: { exceptions: true, controlTest: true }, orderBy: { createdDate: "desc" } },
          controlImplementations: { include: { primaryControl: true, evidence: true } },
          auditEvents: { orderBy: { createdAt: "desc" } }
        }
      },
      requirementLinks: {
        include: {
          evidenceRequirement: {
            include: {
              regulatoryControl: {
                include: {
                  regulation: true,
                  requirementMappings: { include: { requirement: true } }
                }
              }
            }
          }
        }
      },
      aiRiskLinks: {
        include: {
          aiRisk: {
            include: {
              findingLinks: { include: { finding: { include: { exceptions: true, controlTest: true } } } },
              controlLinks: { include: { control: true } }
            }
          }
        }
      },
      auditPackageLinks: { include: { auditPackage: true } }
    }
  });
}

export async function getEvidenceRepository() {
  const [objects, health, packages, systems, regulations] = await Promise.all([
    prisma.evidenceObject.findMany({
      include: {
        aiSystem: true,
        aiRiskLinks: { include: { aiRisk: true } },
        auditPackageLinks: { include: { auditPackage: true } },
        requirementLinks: {
          include: {
            evidenceRequirement: {
              include: {
                regulatoryControl: {
                  include: {
                    regulation: true,
                    requirementMappings: { include: { requirement: true } }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [{ status: "asc" }, { expirationDate: "asc" }]
    }),
    prisma.evidenceHealth.findMany({
      include: {
        aiSystem: true,
        evidenceRequirement: {
          include: {
            regulatoryControl: {
              include: {
                regulation: true,
                requirementMappings: { include: { requirement: true } }
              }
            }
          }
        }
      },
      orderBy: [{ health: "asc" }, { calculatedAt: "desc" }]
    }),
    prisma.auditPackage.findMany({
      include: {
        aiSystem: true,
        evidenceLinks: { include: { evidenceObject: { include: { aiSystem: true } } } }
      },
      orderBy: { generatedDate: "desc" }
    }),
    prisma.aiSystem.findMany({ orderBy: { name: "asc" } }),
    prisma.regulation.findMany({ orderBy: [{ jurisdiction: "asc" }, { name: "asc" }] })
  ]);

  return { objects, health, packages, systems, regulations };
}

export async function getEvidenceHealthDashboard() {
  const repository = await getEvidenceRepository();
  const trendRows = repository.systems.map((system) => {
    const records = repository.health.filter((record) => record.aiSystemId === system.id);
    return {
      system,
      current: records.filter((record) => record.health === "CURRENT").length,
      expiringSoon: records.filter((record) => record.health === "EXPIRING_SOON").length,
      expired: records.filter((record) => record.health === "EXPIRED").length,
      missing: records.filter((record) => record.health === "MISSING").length,
      invalid: records.filter((record) => record.validation === "INVALID").length,
      total: records.length
    };
  });

  return { ...repository, trendRows };
}

export async function getAuditPackages() {
  return prisma.auditPackage.findMany({
    include: {
      aiSystem: true,
      evidenceLinks: {
        include: {
          evidenceObject: {
            include: {
              aiSystem: true,
              requirementLinks: { include: { evidenceRequirement: { include: { regulatoryControl: { include: { regulation: true } } } } } }
            }
          }
        }
      }
    },
    orderBy: { generatedDate: "desc" }
  });
}

export async function getPersonas() {
  return prisma.persona.findMany({ orderBy: { name: "asc" } });
}

export async function getRegulationsWithCoverage() {
  const regulations = await prisma.regulation.findMany({
    include: {
      requirements: {
        include: {
          controlMappings: {
            include: {
              regulatoryControl: {
                include: {
                  aiSystemMappings: { include: { aiSystem: true } }
                }
              }
            }
          }
        }
      },
      controls: {
        include: {
          aiSystemMappings: true
        }
      }
    },
    orderBy: [{ jurisdiction: "asc" }, { name: "asc" }]
  });

  return regulations.map((regulation) => ({
    ...regulation,
    coverage: calculateCoverage(regulation.requirements)
  }));
}

export async function getRegulation(slug: string) {
  const regulation = await prisma.regulation.findUnique({
    where: { slug },
    include: {
      requirements: {
        include: {
          controlMappings: {
            include: {
              regulatoryControl: {
                include: {
                  aiSystemMappings: { include: { aiSystem: true } },
                  evidenceItems: true,
                  evidenceRequirements: {
                    include: {
                      evidenceLinks: { include: { evidenceObject: { include: { aiSystem: true, auditPackageLinks: { include: { auditPackage: true } } } } } },
                      healthRecords: { include: { aiSystem: true } }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { referenceId: "asc" }
      },
      controls: {
        include: {
          requirementMappings: { include: { requirement: true } },
          aiSystemMappings: { include: { aiSystem: true } },
          evidenceItems: true
        },
        orderBy: { controlId: "asc" }
      }
    }
  });

  if (!regulation) return null;
  const artifactTraceability = await prisma.control.findMany({
    where: {
      regulatoryMappings: {
        some: {
          framework: regulation.name
        }
      }
    },
    include: {
      regulatoryMappings: true
    },
    orderBy: { code: "asc" }
  });
  const artifactRules = await prisma.assuranceRule.findMany({
    where: { controlId: { in: artifactTraceability.map((control) => control.code) } },
    include: {
      evidenceArtifact: {
        include: {
          source: { include: { asset: { include: { aiSystem: true } } } }
        }
      }
    },
    orderBy: [{ controlId: "asc" }, { artifactType: "asc" }]
  });

  return { ...regulation, coverage: calculateCoverage(regulation.requirements), artifactTraceability, artifactRules };
}

export async function getTraceability() {
  return prisma.regulation.findMany({
    include: {
      requirements: {
        include: {
          controlMappings: {
            include: {
              regulatoryControl: {
                include: {
                  aiSystemMappings: { include: { aiSystem: true } },
                  evidenceItems: true,
                  evidenceRequirements: {
                    include: {
                      evidenceLinks: { include: { evidenceObject: { include: { aiSystem: true, auditPackageLinks: { include: { auditPackage: true } } } } } },
                      healthRecords: { include: { aiSystem: true } }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { referenceId: "asc" }
      }
    },
    orderBy: [{ jurisdiction: "asc" }, { name: "asc" }]
  });
}

export function calculateCoverage(
  requirements: Array<{
    id: string;
    controlMappings: Array<{
      regulatoryControl: {
        aiSystemMappings: unknown[];
      };
    }>;
  }>
) {
  const totalRequirements = requirements.length;
  const coveredRequirements = requirements.filter((requirement) =>
    requirement.controlMappings.some((mapping) => mapping.regulatoryControl.aiSystemMappings.length > 0)
  ).length;
  const uncoveredRequirements = totalRequirements - coveredRequirements;
  const coveragePercentage =
    totalRequirements === 0 ? 0 : Math.round((coveredRequirements / totalRequirements) * 100);

  return {
    totalRequirements,
    coveredRequirements,
    uncoveredRequirements,
    coveragePercentage
  };
}

export async function getMonitoringDashboard() {
  const [controlTests, testRuns, findings, exceptions] = await Promise.all([
    prisma.controlTest.findMany({ orderBy: { testId: "asc" } }),
    prisma.testRun.findMany({
      include: { controlTest: true, aiSystem: true },
      orderBy: [{ executionDate: "desc" }, { result: "asc" }]
    }),
    prisma.finding.findMany({
      include: { aiSystem: true, controlTest: true, exceptions: true },
      orderBy: [{ status: "asc" }, { severity: "asc" }, { createdDate: "desc" }]
    }),
    prisma.exception.findMany({
      include: { finding: { include: { aiSystem: true, controlTest: true } } },
      orderBy: { expirationDate: "asc" }
    })
  ]);

  return { controlTests, testRuns, findings, exceptions };
}

export async function getControlHealthDashboard() {
  const [systems, controls, testRuns] = await Promise.all([
    prisma.aiSystem.findMany({
      include: {
        testRuns: { include: { controlTest: true }, orderBy: { executionDate: "desc" } },
        systemControls: { include: { control: true } }
      },
      orderBy: { name: "asc" }
    }),
    prisma.controlTest.findMany({ orderBy: { testId: "asc" } }),
    prisma.testRun.findMany({
      include: { controlTest: true, aiSystem: true },
      orderBy: [{ executionDate: "desc" }, { result: "asc" }]
    })
  ]);

  return {
    systems,
    controls,
    testRuns,
    totals: countBy(testRuns, "result"),
    controlsByDomain: controlsByDomain(systems)
  };
}

export async function getFindingsDashboard() {
  const [findings, regulations] = await Promise.all([
    prisma.finding.findMany({
      include: { aiSystem: true, controlTest: true, exceptions: true },
      orderBy: [{ createdDate: "asc" }]
    }),
    prisma.regulation.findMany({
      include: { requirements: true },
      orderBy: [{ jurisdiction: "asc" }, { name: "asc" }]
    })
  ]);

  return {
    findings,
    bySeverity: countBy(findings, "severity"),
    bySystem: countBy(findings.map((finding) => ({ system: finding.aiSystem.name })), "system"),
    byRegulation: findingsByRegulation(findings, regulations),
    trend: findingsTrend(findings)
  };
}

export async function getExceptionsDashboard() {
  const exceptions = await prisma.exception.findMany({
    include: { finding: { include: { aiSystem: true, controlTest: true } } },
    orderBy: { expirationDate: "asc" }
  });
  const now = new Date();

  return exceptions.map((exception) => {
    const daysRemaining = Math.ceil((exception.expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return {
      ...exception,
      daysRemaining,
      expirationBand: daysRemaining < 0 ? "EXPIRED" : daysRemaining <= 30 ? "EXPIRING" : "ACTIVE"
    };
  });
}

export async function getAiSystemMonitoring(slug: string) {
  const system = await prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      evidenceItems: true,
      evidenceObjects: true,
      evidenceHealth: { include: { evidenceRequirement: true } },
      testRuns: { include: { controlTest: true }, orderBy: { executionDate: "desc" } },
      findings: { include: { controlTest: true, exceptions: true }, orderBy: [{ status: "asc" }, { severity: "asc" }] }
    }
  });

  if (!system) return null;
  return {
    ...system,
    controlHealth: countBy(system.testRuns, "result"),
    evidenceStatus: countBy(system.evidenceHealth, "health")
  };
}

export async function getAiGovernanceDashboard() {
  const [systems, aiControls, authorities, findings] = await Promise.all([
    prisma.aiSystem.findMany({
      include: {
        assessment: true,
        aiModels: true,
        promptAssets: { include: { versions: { orderBy: { modifiedAt: "desc" } } } },
        agents: true,
        authorityAssignment: { include: { delegatedAuthority: true } },
        toolPermissions: true,
        humanOversight: true,
        systemControls: { include: { control: true } }
      },
      orderBy: { name: "asc" }
    }),
    prisma.control.findMany({
      where: { code: { startsWith: "AI-GOV-" } },
      include: { systemControls: { include: { aiSystem: true } } },
      orderBy: { code: "asc" }
    }),
    prisma.delegatedAuthority.findMany({ orderBy: { authorityLevel: "asc" } }),
    prisma.finding.findMany({
      include: { aiSystem: true, controlTest: true },
      orderBy: [{ severity: "asc" }, { createdDate: "desc" }]
    })
  ]);

  const models = systems.flatMap((system) => system.aiModels.map((model) => ({ ...model, aiSystem: system })));
  const prompts = systems.flatMap((system) => system.promptAssets.map((prompt) => ({ ...prompt, aiSystem: system })));
  const agents = systems.flatMap((system) => system.agents.map((agent) => ({ ...agent, aiSystem: system })));
  const permissions = systems.flatMap((system) => system.toolPermissions.map((permission) => ({ ...permission, aiSystem: system })));
  const oversight = systems.flatMap((system) => system.humanOversight ? [{ ...system.humanOversight, aiSystem: system }] : []);
  const approvedPrompts = prompts.filter((prompt) => prompt.approvalStatus === "APPROVED").length;
  const validatedModels = models.filter((model) => model.validationStatus === "APPROVED").length;
  const approvedPermissions = permissions.filter((permission) => permission.approved).length;
  const aiGovernanceFindings = findings.filter((finding) => finding.controlTest.testId === "CCM-011");

  return {
    systems,
    models,
    prompts,
    agents,
    permissions,
    oversight,
    authorities,
    aiControls,
    findings: aiGovernanceFindings,
    kpis: {
      models: models.length,
      approvedPrompts,
      agents: agents.length,
      authorityAssignments: systems.filter((system) => system.authorityAssignment).length,
      approvedPermissions,
      oversightDefined: oversight.length,
      aiControls: aiControls.length,
      openAiFindings: aiGovernanceFindings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS").length
    }
  };
}

export async function getAiSystemAiGovernance(slug: string) {
  const system = await prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      aiModels: { orderBy: { modelId: "asc" } },
      promptAssets: { include: { versions: { orderBy: { modifiedAt: "desc" } } }, orderBy: { promptId: "asc" } },
      agents: { orderBy: { agentId: "asc" } },
      authorityAssignment: { include: { delegatedAuthority: true } },
      toolPermissions: { orderBy: [{ approved: "desc" }, { toolName: "asc" }] },
      humanOversight: true,
      evidenceObjects: { orderBy: { expirationDate: "asc" } },
      assets: {
        include: {
          evidenceSources: {
            include: { artifacts: { orderBy: [{ artifactType: "asc" }, { name: "asc" }] } }
          }
        }
      },
      testRuns: { include: { controlTest: true }, orderBy: { executionDate: "desc" } },
      lifecycleApprovals: true,
      systemControls: {
        where: { control: { code: { startsWith: "AI-GOV-" } } },
        include: { control: true },
        orderBy: { control: { code: "asc" } }
      },
      findings: { include: { controlTest: true, exceptions: true }, orderBy: [{ status: "asc" }, { severity: "asc" }] }
    }
  });

  if (!system) return null;
  const aiRiskDomains = system.assessment
    ? [
        ["Hallucination Risk", system.assessment.hallucinationRisk],
        ["Prompt Injection Risk", system.assessment.promptInjectionRisk],
        ["Model Drift Risk", system.assessment.modelDriftRisk],
        ["Tool Misuse Risk", system.assessment.toolMisuseRisk],
        ["Autonomy Risk", system.assessment.autonomyRisk],
        ["Explainability Risk", system.assessment.explainabilityRisk]
      ]
    : [];

  return {
    ...system,
    aiRiskDomains,
    aiGovernanceFindings: system.findings.filter((finding) => finding.controlTest.testId === "CCM-011"),
    promptArtifacts: system.assets.flatMap((asset) => asset.evidenceSources.flatMap((source) => source.artifacts.filter((artifact) => artifact.artifactType === "PROMPT"))),
    manifestArtifacts: system.assets.flatMap((asset) => asset.evidenceSources.flatMap((source) => source.artifacts.filter((artifact) => artifact.artifactType === "MANIFEST")))
  };
}

export async function getAgenticGovernanceDashboard() {
  const [systems, controls, workflows, findings] = await Promise.all([
    prisma.aiSystem.findMany({
      include: {
        assessment: true,
        agents: true,
        authorityAssignment: { include: { delegatedAuthority: true } },
        governedTools: true,
        agentActions: true,
        executionLogs: { include: { agent: true, tool: true, action: true, approvalWorkflow: true } },
        killSwitch: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.control.findMany({
      where: { code: { startsWith: "AI-AGENT-" } },
      orderBy: { code: "asc" }
    }),
    prisma.approvalWorkflow.findMany({ orderBy: { approvalLevel: "asc" } }),
    prisma.finding.findMany({
      where: { controlTest: { testId: "CCM-012" } },
      include: { aiSystem: true, controlTest: true },
      orderBy: [{ severity: "asc" }, { createdDate: "desc" }]
    })
  ]);

  const agents = systems.flatMap((system) => system.agents.map((agent) => ({ ...agent, aiSystem: system })));
  const actions = systems.flatMap((system) => system.agentActions.map((action) => ({ ...action, aiSystem: system })));
  const tools = systems.flatMap((system) => system.governedTools.map((tool) => ({ ...tool, aiSystem: system })));
  const logs = systems.flatMap((system) => system.executionLogs.map((log) => ({ ...log, aiSystem: system })));
  const killSwitches = systems.flatMap((system) => system.killSwitch ? [{ ...system.killSwitch, aiSystem: system }] : []);

  return {
    systems,
    agents,
    actions,
    tools,
    workflows,
    logs,
    killSwitches,
    controls,
    findings,
    kpis: {
      agents: agents.length,
      actions: actions.length,
      tools: tools.length,
      workflows: workflows.length,
      logs: logs.length,
      killSwitches: killSwitches.length,
      autonomousSystems: systems.filter((system) => system.agents.some((agent) => agent.agenticLevel >= 4)).length,
      openFindings: findings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS").length
    }
  };
}

export async function getAiSystemAgenticGovernance(slug: string) {
  const system = await prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      agents: true,
      authorityAssignment: { include: { delegatedAuthority: true } },
      governedTools: { orderBy: { nextReviewDate: "asc" } },
      agentActions: { orderBy: { riskLevel: "desc" } },
      executionLogs: {
        include: { agent: true, tool: true, action: true, approvalWorkflow: true },
        orderBy: { timestamp: "desc" }
      },
      killSwitch: true,
      evidenceObjects: { orderBy: { expirationDate: "asc" } },
      testRuns: { include: { controlTest: true }, orderBy: { executionDate: "desc" } },
      lifecycleApprovals: true,
      systemControls: {
        where: { control: { code: { startsWith: "AI-AGENT-" } } },
        include: { control: true },
        orderBy: { control: { code: "asc" } }
      },
      findings: { include: { controlTest: true, exceptions: true }, orderBy: [{ status: "asc" }, { severity: "asc" }] }
    }
  });

  if (!system) return null;
  const agenticRiskDomains = system.assessment
    ? [
        ["Uncontrolled Agent Actions", system.assessment.uncontrolledAgentActions],
        ["Delegated Authority Risk", system.assessment.delegatedAuthorityRisk],
        ["Tool Abuse Risk", system.assessment.toolAbuseRisk],
        ["Approval Bypass Risk", system.assessment.approvalBypassRisk],
        ["Runaway Automation Risk", system.assessment.runawayAutomationRisk]
      ]
    : [];

  return {
    ...system,
    agenticRiskDomains,
    agenticFindings: system.findings.filter((finding) => finding.controlTest.testId === "CCM-012")
  };
}

export async function getAiLifecycleDashboard() {
  const systems = await prisma.aiSystem.findMany({
    include: {
      assessment: true,
      lifecycleRecords: { orderBy: { stageEntryDate: "asc" } },
      lifecycleApprovals: { orderBy: [{ status: "asc" }, { approvalDate: "desc" }] },
      systemControls: {
        where: { control: { code: { startsWith: "AI-LC-" } } },
        include: { control: true },
        orderBy: { control: { code: "asc" } }
      },
      findings: {
        where: { controlTest: { testId: "CCM-013" } },
        include: { controlTest: true },
        orderBy: [{ status: "asc" }, { severity: "asc" }]
      }
    },
    orderBy: [{ lifecycleStatus: "asc" }, { name: "asc" }]
  });

  const approvals = systems.flatMap((system) =>
    system.lifecycleApprovals.map((approval) => ({ ...approval, aiSystem: system }))
  );
  const pendingApprovals = approvals.filter((approval) => approval.status === "PENDING");
  const blockedSystems = systems.filter((system) =>
    system.systemControls.some((mapping) => mapping.auditStatus === "BLOCKED") ||
    system.findings.some((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS")
  );

  return {
    systems,
    approvals,
    pendingApprovals,
    blockedSystems,
    productionSystems: systems.filter((system) => system.lifecycleStatus === "PRODUCTION"),
    retiredSystems: systems.filter((system) => system.lifecycleStatus === "RETIRED"),
    byStage: countBy(systems, "lifecycleStatus"),
    lifecycleControls: systems.flatMap((system) => system.systemControls.map((mapping) => ({ ...mapping, aiSystem: system }))),
    findings: systems.flatMap((system) => system.findings.map((finding) => ({ ...finding, aiSystem: system }))),
    kpis: {
      systems: systems.length,
      pendingApprovals: pendingApprovals.length,
      blockedSystems: blockedSystems.length,
      productionSystems: systems.filter((system) => system.lifecycleStatus === "PRODUCTION").length,
      retiredSystems: systems.filter((system) => system.lifecycleStatus === "RETIRED").length
    }
  };
}

export async function getAiSystemLifecycle(slug: string) {
  const system = await prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      lifecycleRecords: { orderBy: { stageEntryDate: "asc" } },
      lifecycleApprovals: { orderBy: [{ status: "asc" }, { approvalDate: "desc" }] },
      systemControls: {
        where: { control: { code: { startsWith: "AI-LC-" } } },
        include: { control: true },
        orderBy: { control: { code: "asc" } }
      },
      findings: {
        where: { controlTest: { testId: "CCM-013" } },
        include: { controlTest: true, exceptions: true },
        orderBy: [{ status: "asc" }, { severity: "asc" }]
      },
      evidenceObjects: {
        orderBy: [{ status: "asc" }, { expirationDate: "asc" }]
      },
      evidenceItems: {
        orderBy: { dueDate: "asc" }
      }
    }
  });

  return system;
}

export async function getAiRiskDashboard() {
  const risks = await prisma.aiRisk.findMany({
    include: {
      aiSystem: true,
      controlLinks: { include: { control: true } },
      evidenceLinks: { include: { evidenceObject: true } },
      findingLinks: { include: { finding: { include: { controlTest: true } } } }
    },
    orderBy: [{ status: "asc" }, { residualRating: "desc" }, { reviewDate: "asc" }]
  });

  const openRisks = risks.filter((risk) => risk.status === "OPEN" || risk.status === "IN_TREATMENT");
  const acceptedRisks = risks.filter((risk) => risk.status === "ACCEPTED");

  return {
    risks,
    openRisks,
    acceptedRisks,
    byCategory: countBy(risks, "category"),
    byTreatment: countBy(risks, "treatment"),
    byResidual: countBy(risks, "residualRating"),
    kpis: {
      totalRisks: risks.length,
      openRisks: openRisks.length,
      acceptedRisks: acceptedRisks.length,
      criticalResidual: risks.filter((risk) => risk.residualRating === "CRITICAL").length,
      highResidual: risks.filter((risk) => risk.residualRating === "HIGH").length
    }
  };
}

export async function getAiSystemRisk(slug: string) {
  return prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      aiRisks: {
        include: {
          controlLinks: { include: { control: true } },
          evidenceLinks: { include: { evidenceObject: true } },
          findingLinks: { include: { finding: { include: { controlTest: true } } } }
        },
        orderBy: [{ status: "asc" }, { residualRating: "desc" }, { reviewDate: "asc" }]
      }
    }
  });
}

export async function getGovernanceEngineeringDashboard() {
  const [controls, implementations, findings] = await Promise.all([
    prisma.control.findMany({
      include: {
        primaryImplementations: true,
        implementationLinks: { include: { controlImplementation: true } }
      },
      orderBy: { code: "asc" }
    }),
    prisma.controlImplementation.findMany({
      include: {
        aiSystem: true,
        primaryControl: true,
        controlLinks: { include: { control: true } },
        evidence: true
      },
      orderBy: [{ status: "asc" }, { implementationType: "asc" }, { title: "asc" }]
    }),
    prisma.finding.findMany({
      where: { controlTest: { testId: "CCM-014" } },
      include: { aiSystem: true, controlTest: true },
      orderBy: [{ severity: "asc" }, { createdDate: "desc" }]
    })
  ]);

  const implementedControlIds = new Set(
    implementations.flatMap((implementation) => [
      implementation.controlId,
      ...implementation.controlLinks.map((link) => link.controlId)
    ])
  );
  const missingImplementations = controls.filter((control) =>
    isEngineeringControl(control.code) && !implementedControlIds.has(control.id)
  );
  const runtimeControls = implementations.filter((implementation) => implementation.implementationType === "Runtime Control");

  return {
    controls,
    implementations,
    findings,
    missingImplementations,
    runtimeControls,
    byType: countBy(implementations, "implementationType"),
    byStatus: countBy(implementations, "status"),
    kpis: {
      controlsImplemented: implementedControlIds.size,
      controlsMissingImplementations: missingImplementations.length,
      validatedImplementations: implementations.filter((implementation) => implementation.status === "VALIDATED").length,
      runtimeControls: runtimeControls.length
    }
  };
}

export async function getAiSystemGovernanceEngineering(slug: string) {
  return prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      systemControls: {
        include: { control: true },
        orderBy: { control: { code: "asc" } }
      },
      controlImplementations: {
        include: {
          primaryControl: true,
          controlLinks: { include: { control: true } },
          evidence: true
        },
        orderBy: [{ status: "asc" }, { implementationType: "asc" }, { title: "asc" }]
      },
      testRuns: {
        where: { controlTest: { testId: "CCM-014" } },
        include: { controlTest: true },
        orderBy: { executionDate: "desc" }
      },
      findings: {
        where: { controlTest: { testId: "CCM-014" } },
        include: { controlTest: true, exceptions: true },
        orderBy: [{ status: "asc" }, { severity: "asc" }]
      }
    }
  });
}

export async function getRiskHeatmap() {
  const systems = await prisma.aiSystem.findMany({
    include: {
      assessment: true,
      findings: true,
      regulatoryControls: { include: { regulatoryControl: { include: { regulation: true } } } },
      evidenceHealth: true,
      testRuns: true,
      systemControls: true
    },
    orderBy: { name: "asc" }
  });

  return systems.map((system) => ({
    ...system,
    highestFindingSeverity: highestSeverity(system.findings.map((finding) => finding.severity)),
    openFindingCount: system.findings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS").length,
    regulatoryExposure: new Set(system.regulatoryControls.map((mapping) => mapping.regulatoryControl.regulation.jurisdiction)).size,
    maturity: calculateMaturity(system)
  }));
}

function isEngineeringControl(code: string) {
  return code.startsWith("AI-GOV-") || code.startsWith("AI-AGENT-") || code.startsWith("AI-LC-");
}

export async function getExecutiveCommandCenter() {
  const [systems, regulations, findings, exceptions, evidenceHealth, testRuns] = await Promise.all([
    prisma.aiSystem.findMany({
      include: {
        assessment: true,
        systemControls: true,
        regulatoryControls: { include: { regulatoryControl: { include: { regulation: true } } } },
        evidenceHealth: true,
        testRuns: true,
        findings: { include: { exceptions: true } },
        evidenceObjects: true
      },
      orderBy: { name: "asc" }
    }),
    getRegulationsWithCoverage(),
    prisma.finding.findMany({ include: { aiSystem: true, controlTest: true, exceptions: true } }),
    prisma.exception.findMany({ include: { finding: { include: { aiSystem: true } } }, orderBy: { expirationDate: "asc" } }),
    prisma.evidenceHealth.findMany({ include: { aiSystem: true, evidenceRequirement: { include: { regulatoryControl: { include: { regulation: true } } } } } }),
    prisma.testRun.findMany({ include: { aiSystem: true, controlTest: true }, orderBy: { executionDate: "desc" } })
  ]);

  const maturity = systems.map((system) => ({ system, maturity: calculateMaturity(system) }));
  const openFindings = findings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS");
  const criticalFindings = findings.filter((finding) => finding.severity === "CRITICAL");
  const highRiskSystems = systems.filter((system) => system.assessment?.overallRiskTier === "HIGH" || system.assessment?.overallRiskTier === "CRITICAL");
  const activeExceptions = exceptions.filter((exception) => exception.expirationDate >= new Date());
  const regulatoryCoverage = Math.round(regulations.reduce((sum, regulation) => sum + regulation.coverage.coveragePercentage, 0) / Math.max(regulations.length, 1));
  const currentEvidence = evidenceHealth.filter((record) => record.health === "CURRENT").length;
  const evidenceHealthPct = Math.round((currentEvidence / Math.max(evidenceHealth.length, 1)) * 100);

  return {
    systems,
    regulations,
    findings,
    openFindings,
    criticalFindings,
    exceptions,
    activeExceptions,
    evidenceHealth,
    testRuns,
    maturity,
    kpis: {
      totalSystems: systems.length,
      highRiskSystems: highRiskSystems.length,
      criticalFindings: criticalFindings.length,
      openFindings: openFindings.length,
      activeExceptions: activeExceptions.length,
      evidenceHealthPct,
      regulatoryCoverage
    },
    byRiskTier: countBy(systems.map((system) => ({ tier: system.assessment?.overallRiskTier ?? "UNASSESSED" })), "tier"),
    byLifecycle: countBy(systems, "lifecycleStatus"),
    findingsBySystem: countBy(findings.map((finding) => ({ system: finding.aiSystem.name })), "system"),
    evidenceByRegulation: evidenceHealthByRegulation(evidenceHealth),
    coverageByJurisdiction: coverageByJurisdiction(regulations)
  };
}

export function calculateMaturity(system: {
  systemControls: unknown[];
  evidenceHealth: Array<{ health: string; validation: string }>;
  testRuns: Array<{ result: string }>;
  findings: Array<{ status: string; severity: string; exceptions?: unknown[] }>;
  regulatoryControls?: unknown[];
}) {
  const controlScore = Math.min(20, system.systemControls.length >= 8 ? 20 : system.systemControls.length * 2);
  const evidenceCurrent = system.evidenceHealth.filter((record) => record.health === "CURRENT" && record.validation === "VALID").length;
  const evidenceScore = system.evidenceHealth.length === 0 ? 0 : Math.round((evidenceCurrent / system.evidenceHealth.length) * 20);
  const passRuns = system.testRuns.filter((run) => run.result === "PASS").length;
  const monitoringScore = system.testRuns.length === 0 ? 0 : Math.round((passRuns / system.testRuns.length) * 20);
  const openFindings = system.findings.filter((finding) => finding.status === "OPEN" || finding.status === "IN_PROGRESS");
  const findingPenalty = Math.min(20, openFindings.reduce((sum, finding) => sum + (finding.severity === "CRITICAL" ? 10 : finding.severity === "HIGH" ? 7 : finding.severity === "MEDIUM" ? 4 : 2), 0));
  const findingScore = Math.max(0, 20 - findingPenalty);
  const exceptionCount = system.findings.flatMap((finding) => finding.exceptions ?? []).length;
  const exceptionScore = Math.max(0, 20 - exceptionCount * 8);
  const score = Math.max(0, Math.min(100, controlScore + evidenceScore + monitoringScore + findingScore + exceptionScore));
  const level = score >= 85 ? "Level 5: Optimized" : score >= 70 ? "Level 4: Monitored" : score >= 50 ? "Level 3: Defined" : score >= 30 ? "Level 2: Managed" : "Level 1: Ad Hoc";

  return { score, level, controlScore, evidenceScore, monitoringScore, findingScore, exceptionScore };
}

export async function getAuditorTraceabilityEnhanced() {
  const [findings, regulations] = await Promise.all([
    prisma.finding.findMany({
      include: { aiSystem: true, controlTest: true, exceptions: true },
      orderBy: [{ severity: "asc" }, { createdDate: "desc" }]
    }),
    prisma.regulation.findMany({
      include: {
        requirements: {
          include: {
            controlMappings: {
              include: {
                regulatoryControl: {
                  include: {
                    aiSystemMappings: { include: { aiSystem: true } },
                    evidenceItems: true,
                    evidenceRequirements: {
                      include: {
                        evidenceLinks: { include: { evidenceObject: { include: { aiSystem: true } } } },
                        healthRecords: { include: { aiSystem: true } }
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { referenceId: "asc" }
        }
      },
      orderBy: [{ jurisdiction: "asc" }, { name: "asc" }]
    })
  ]);

  return { findings, regulations };
}

function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = String(item[key] ?? "UNKNOWN");
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function percentage(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

type CurrentArtifactResult =
  | {
      available: true;
      content: string;
      artifactHash: string;
      commitSha: string;
      sourceUrl: string;
      fetchedAt: Date;
    }
  | {
      available: false;
      reason: string;
      fetchedAt: Date;
    };

async function fetchCurrentRepositoryArtifact({ repositoryUrl, branch, path }: { repositoryUrl?: string | null; branch?: string | null; path: string }): Promise<CurrentArtifactResult> {
  const parsed = parseGitHubRepositoryUrl(repositoryUrl);
  if (!parsed) {
    return { available: false, reason: "Artifact is not linked to a parseable GitHub repository URL.", fetchedAt: new Date() };
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai-risk-governance",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const ref = branch || "main";
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const contentUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;

  try {
    const response = await fetch(contentUrl, { headers, cache: "no-store" });
    if (!response.ok) {
      return { available: false, reason: `GitHub returned ${response.status} while reading current source.`, fetchedAt: new Date() };
    }

    const payload = await response.json() as { content?: string; encoding?: string; html_url?: string; sha?: string };
    if (!payload.content || payload.encoding !== "base64") {
      return { available: false, reason: "GitHub did not return base64 file content for the current source.", fetchedAt: new Date() };
    }

    const content = Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString("utf8");
    const commitSha = await fetchLatestCommitSha(parsed.owner, parsed.repo, ref, path, headers) ?? payload.sha ?? "unknown";

    return {
      available: true,
      content,
      artifactHash: createHash("sha256").update(content).digest("hex"),
      commitSha,
      sourceUrl: payload.html_url ?? contentUrl,
      fetchedAt: new Date()
    };
  } catch (error) {
    return {
      available: false,
      reason: error instanceof Error ? error.message : "Unable to fetch current source.",
      fetchedAt: new Date()
    };
  }
}

async function fetchLatestCommitSha(owner: string, repo: string, branch: string, path: string, headers: Record<string, string>) {
  const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&path=${encodeURIComponent(path)}&per_page=1`;
  const response = await fetch(commitsUrl, { headers, cache: "no-store" });
  if (!response.ok) return null;
  const commits = await response.json() as Array<{ sha?: string }>;
  return commits[0]?.sha ?? null;
}

function parseGitHubRepositoryUrl(repositoryUrl?: string | null) {
  if (!repositoryUrl) return null;
  const match = repositoryUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, "")
  };
}

function compareText(collected: string, current: string) {
  const collectedLines = collected.split(/\r?\n/);
  const currentLines = current.split(/\r?\n/);
  const lineCount = Math.max(collectedLines.length, currentLines.length);
  const changes: Array<{ line: number; collected: string; current: string; status: "DIFFERENT" }> = [];

  for (let index = 0; index < lineCount; index += 1) {
    const collectedLine = collectedLines[index] ?? "";
    const currentLine = currentLines[index] ?? "";
    if (collectedLine !== currentLine) {
      changes.push({ line: index + 1, collected: collectedLine, current: currentLine, status: "DIFFERENT" });
    }
    if (changes.length >= 40) break;
  }

  return changes;
}

function evidenceTypesForControl(controlCode: string) {
  const map: Record<string, Array<{ artifactType: "MANIFEST" | "PROMPT" | "POLICY" | "WORKFLOW"; label: string }>> = {
    "AI-GOV-001": [{ artifactType: "MANIFEST", label: "AI Governance Manifest" }],
    "AI-GOV-002": [{ artifactType: "PROMPT", label: "Prompt owner evidence" }],
    "AI-GOV-003": [{ artifactType: "PROMPT", label: "Approved prompt and version evidence" }],
    "AI-GOV-004": [{ artifactType: "PROMPT", label: "Human oversight language" }, { artifactType: "POLICY", label: "Human review policy" }],
    "AI-GOV-005": [{ artifactType: "POLICY", label: "Authority limits policy" }],
    "AI-GOV-006": [{ artifactType: "POLICY", label: "Tool permission policy" }, { artifactType: "PROMPT", label: "Prohibited action boundaries" }],
    "AI-GOV-010": [{ artifactType: "MANIFEST", label: "AI risk section" }],
    "AI-LC-001": [{ artifactType: "MANIFEST", label: "Lifecycle stage declaration" }],
    "AI-LC-004": [{ artifactType: "MANIFEST", label: "Evidence source declaration" }, { artifactType: "WORKFLOW", label: "Workflow evidence gate" }],
    "AUD-001": [{ artifactType: "WORKFLOW", label: "Control test workflow" }],
    "GOV-001": [{ artifactType: "MANIFEST", label: "Governance scope and regulatory declaration" }]
  };

  return map[controlCode] ?? [];
}

function deploymentEvidenceTypesForControl(controlCode: string) {
  const map: Record<string, Array<{ evidenceType: "DEPLOYMENT"; label: string }>> = {
    "AI-LC-006": [{ evidenceType: "DEPLOYMENT", label: "Production deployment evidence" }],
    "AI-GOV-010": [{ evidenceType: "DEPLOYMENT", label: "Runtime monitoring and health evidence" }],
    "OPS-001": [{ evidenceType: "DEPLOYMENT", label: "Operational resilience runtime evidence" }],
    "AUD-001": [{ evidenceType: "DEPLOYMENT", label: "Deployment provenance and audit evidence" }]
  };

  return map[controlCode] ?? [];
}

function supabaseEvidenceTypesForControl(controlCode: string) {
  const map: Record<string, Array<{ evidenceType: "SCHEMA" | "POLICY" | "ACCESS_CONTROL" | "DATA_INVENTORY"; label: string }>> = {
    "GOV-001": [{ evidenceType: "SCHEMA", label: "Database schema boundary evidence" }],
    "PRI-001": [
      { evidenceType: "DATA_INVENTORY", label: "Data inventory evidence" },
      { evidenceType: "POLICY", label: "RLS policy evidence" }
    ],
    "SEC-001": [
      { evidenceType: "POLICY", label: "RLS policy enforcement evidence" },
      { evidenceType: "ACCESS_CONTROL", label: "Database role inventory evidence" }
    ],
    "AI-GOV-010": [
      { evidenceType: "SCHEMA", label: "Data-layer risk boundary evidence" },
      { evidenceType: "DATA_INVENTORY", label: "Data inventory for AI risk assessment" }
    ],
    "AUD-001": [
      { evidenceType: "POLICY", label: "Policy inventory audit evidence" },
      { evidenceType: "ACCESS_CONTROL", label: "Access and audit capability evidence" }
    ],
    "OPS-001": [{ evidenceType: "ACCESS_CONTROL", label: "Database operational access evidence" }]
  };

  return map[controlCode] ?? [];
}

function mcpEvidenceTypesForControl(controlCode: string) {
  const map: Record<string, Array<{ evidenceType: "TOOL_REGISTRY" | "TOOL_PERMISSIONS" | "AUTHORITY_REGISTRY" | "CAPABILITY_INVENTORY"; label: string }>> = {
    "AI-GOV-006": [
      { evidenceType: "TOOL_PERMISSIONS", label: "MCP tool permission evidence" },
      { evidenceType: "AUTHORITY_REGISTRY", label: "MCP authority classification evidence" }
    ],
    "AI-GOV-010": [{ evidenceType: "CAPABILITY_INVENTORY", label: "MCP capability inventory for monitoring and AI risk review" }],
    "AI-AGENT-001": [
      { evidenceType: "TOOL_REGISTRY", label: "MCP tool registry evidence" },
      { evidenceType: "CAPABILITY_INVENTORY", label: "MCP capability inventory evidence" }
    ],
    "AI-AGENT-006": [
      { evidenceType: "TOOL_PERMISSIONS", label: "MCP tool permission boundary evidence" },
      { evidenceType: "AUTHORITY_REGISTRY", label: "MCP authority registry evidence" }
    ],
    "AUD-001": [
      { evidenceType: "TOOL_REGISTRY", label: "MCP tool registry audit evidence" },
      { evidenceType: "CAPABILITY_INVENTORY", label: "MCP capability audit evidence" }
    ]
  };

  return map[controlCode] ?? [];
}

function notionEvidenceTypesForControl(controlCode: string) {
  const map: Record<string, Array<{ evidenceType: "APPROVAL_EVIDENCE" | "REVIEW_EVIDENCE" | "COMMITTEE_EVIDENCE" | "GOVERNANCE_DOCUMENTATION_EVIDENCE" | "OWNERSHIP_EVIDENCE"; label: string }>> = {
    "AI-GOV-001": [
      { evidenceType: "GOVERNANCE_DOCUMENTATION_EVIDENCE", label: "Governance documentation evidence" },
      { evidenceType: "OWNERSHIP_EVIDENCE", label: "Human accountability evidence" }
    ],
    "AI-GOV-002": [{ evidenceType: "OWNERSHIP_EVIDENCE", label: "Prompt and governance owner evidence" }],
    "AI-GOV-004": [{ evidenceType: "REVIEW_EVIDENCE", label: "Human oversight review evidence" }],
    "AI-GOV-006": [
      { evidenceType: "APPROVAL_EVIDENCE", label: "Tool permission approval evidence" },
      { evidenceType: "REVIEW_EVIDENCE", label: "Tool permission review evidence" }
    ],
    "AI-GOV-010": [{ evidenceType: "REVIEW_EVIDENCE", label: "Governance monitoring review evidence" }],
    "AI-LC-006": [
      { evidenceType: "APPROVAL_EVIDENCE", label: "Production approval evidence" },
      { evidenceType: "COMMITTEE_EVIDENCE", label: "Production readiness committee evidence" }
    ],
    "GOV-001": [
      { evidenceType: "GOVERNANCE_DOCUMENTATION_EVIDENCE", label: "Governance documentation inventory" },
      { evidenceType: "COMMITTEE_EVIDENCE", label: "Governance committee decision evidence" },
      { evidenceType: "OWNERSHIP_EVIDENCE", label: "Accountability and ownership evidence" }
    ],
    "AUD-001": [
      { evidenceType: "APPROVAL_EVIDENCE", label: "Approval audit evidence" },
      { evidenceType: "REVIEW_EVIDENCE", label: "Review audit evidence" },
      { evidenceType: "COMMITTEE_EVIDENCE", label: "Committee audit evidence" }
    ]
  };

  return map[controlCode] ?? [];
}

function secretEvidenceTypesForControl(controlCode: string) {
  const map: Record<string, Array<{ evidenceType: "SECRET_INVENTORY" | "ROTATION_EVIDENCE" | "OWNERSHIP_EVIDENCE" | "USAGE_MAPPING"; label: string }>> = {
    "SEC-001": [
      { evidenceType: "SECRET_INVENTORY", label: "Secret inventory metadata" },
      { evidenceType: "ROTATION_EVIDENCE", label: "Secret rotation metadata" },
      { evidenceType: "OWNERSHIP_EVIDENCE", label: "Secret ownership metadata" }
    ],
    "AUD-001": [
      { evidenceType: "SECRET_INVENTORY", label: "Secret inventory audit evidence" },
      { evidenceType: "USAGE_MAPPING", label: "Secret usage mapping audit evidence" }
    ],
    "OPS-001": [
      { evidenceType: "ROTATION_EVIDENCE", label: "Rotation evidence for operational resilience" },
      { evidenceType: "USAGE_MAPPING", label: "Operational dependency mapping for secrets" }
    ],
    "AI-GOV-010": [
      { evidenceType: "SECRET_INVENTORY", label: "Secret metadata for AI risk-domain review" },
      { evidenceType: "USAGE_MAPPING", label: "Secret usage mapping for AI-system boundary review" }
    ],
    "AI-GOV-006": [
      { evidenceType: "SECRET_INVENTORY", label: "Secret-backed tool access metadata" },
      { evidenceType: "OWNERSHIP_EVIDENCE", label: "Accountability for secret-backed access" }
    ]
  };

  return map[controlCode] ?? [];
}

function parseRelatedControls(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function controlsByDomain(
  systems: Array<{
    systemControls: Array<{ control: { category: string } }>;
  }>
) {
  return systems
    .flatMap((system) => system.systemControls)
    .reduce<Record<string, number>>((counts, mapping) => {
      counts[mapping.control.category] = (counts[mapping.control.category] ?? 0) + 1;
      return counts;
    }, {});
}

function findingsTrend(findings: Array<{ createdDate: Date }>) {
  return findings.reduce<Record<string, number>>((trend, finding) => {
    const label = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(finding.createdDate);
    trend[label] = (trend[label] ?? 0) + 1;
    return trend;
  }, {});
}

function findingsByRegulation(
  findings: Array<{ controlTest: { testId: string } }>,
  regulations: Array<{ name: string; requirements: Array<{ title: string }> }>
) {
  const counts: Record<string, number> = {};
  for (const finding of findings) {
    const themes = themesForTest(finding.controlTest.testId);
    const impacted = regulations.filter((regulation) =>
      regulation.requirements.some((requirement) =>
        themes.some((theme) => requirement.title.toLowerCase().includes(theme))
      )
    );
    for (const regulation of impacted.length > 0 ? impacted : [{ name: "Cross-regulatory" }]) {
      counts[regulation.name] = (counts[regulation.name] ?? 0) + 1;
    }
  }
  return counts;
}

function themesForTest(testId: string) {
  const map: Record<string, string[]> = {
    "CCM-001": ["governance"],
    "CCM-002": ["governance", "technical documentation"],
    "CCM-003": ["governance"],
    "CCM-004": ["validation", "risk management"],
    "CCM-005": ["monitoring"],
    "CCM-006": ["inventory", "governance"],
    "CCM-007": ["evidence", "technical documentation"],
    "CCM-008": ["human oversight"],
    "CCM-009": ["data governance"],
    "CCM-010": ["third party risk"]
  };
  return map[testId] ?? ["governance"];
}

function highestSeverity(severities: string[]) {
  const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"];
  return order.find((severity) => severities.includes(severity)) ?? "NONE";
}

function evidenceHealthByRegulation(
  evidenceHealth: Array<{
    health: string;
    evidenceRequirement: { regulatoryControl: { regulation: { name: string } } | null };
  }>
) {
  return evidenceHealth.reduce<Record<string, { current: number; gaps: number; total: number }>>((summary, record) => {
    const name = record.evidenceRequirement.regulatoryControl?.regulation.name ?? "Unmapped";
    const row = summary[name] ?? { current: 0, gaps: 0, total: 0 };
    row.total += 1;
    if (record.health === "CURRENT") row.current += 1;
    if (record.health === "MISSING" || record.health === "EXPIRED") row.gaps += 1;
    summary[name] = row;
    return summary;
  }, {});
}

function coverageByJurisdiction(
  regulations: Array<{ jurisdiction: string; coverage: { coveragePercentage: number; uncoveredRequirements: number } }>
) {
  return regulations.reduce<Record<string, { coverage: number; gaps: number; count: number }>>((summary, regulation) => {
    const row = summary[regulation.jurisdiction] ?? { coverage: 0, gaps: 0, count: 0 };
    row.coverage += regulation.coverage.coveragePercentage;
    row.gaps += regulation.coverage.uncoveredRequirements;
    row.count += 1;
    summary[regulation.jurisdiction] = row;
    return summary;
  }, {});
}
