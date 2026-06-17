import { prisma } from "@airg/db";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function assertPageLoads(baseUrl: string, path: string) {
  const response = await fetch(`${baseUrl}${path}`);
  assert(response.ok, `${path} did not load: ${response.status}`);
  console.log(`ok page ${path}`);
}

async function main() {
  const platformReviewReportPath = join(process.cwd(), "docs", "PLATFORM_REVIEW_REPORT.md");
  const platformReviewPackagePath = join(process.cwd(), "docs", "PLATFORM_REVIEW_PACKAGE.md");
  const featureRegistryPath = join(process.cwd(), "docs", "FEATURE_REGISTRY.md");
  assert(existsSync(platformReviewReportPath), "Platform Review report should exist");
  assert(existsSync(platformReviewPackagePath), "Platform Review package should exist");
  assert(existsSync(join(process.cwd(), "apps/web/app/platform-review/page.tsx")), "Platform Review workspace route should exist");
  assert(existsSync(join(process.cwd(), "apps/web/app/platform-review/package/page.tsx")), "Platform Review package route should exist");
  assert(existsSync(join(process.cwd(), "apps/web/app/platform-review/export/page.tsx")), "Platform Review export route should exist");
  assert(readFileSync(platformReviewReportPath, "utf8").includes("Platform Review Agent"), "Platform Review report should describe the review agent");
  const platformReviewPackage = readFileSync(platformReviewPackagePath, "utf8");
  const featureRegistry = readFileSync(featureRegistryPath, "utf8");
  assert(platformReviewPackage.includes("Connector Inventory"), "Platform Review package should include connector inventory");
  assert(platformReviewPackage.includes("Connector Consistency Review"), "Platform Review package should include connector consistency review");
  assert(platformReviewPackage.includes("Screenshot Manifest"), "Platform Review package should include screenshot manifest");
  assert(platformReviewPackage.includes("Future ZIP Packaging Design"), "Platform Review package should include future ZIP packaging design");
  assert(featureRegistry.includes("Feature Name: Platform Review Agent"), "Feature Registry should include Platform Review Agent");
  assert(featureRegistry.includes("Status: Operational"), "Feature Registry should mark at least one feature operational");

  const travelBrain = await prisma.aiSystem.findUnique({
    where: { slug: "travel-brain" },
    include: {
      assessment: true,
      aiModels: true,
      promptAssets: { include: { versions: true } },
      agents: true,
      authorityAssignment: { include: { delegatedAuthority: true } },
      toolPermissions: true,
      humanOversight: true,
      governedTools: true,
      agentActions: true,
      executionLogs: true,
      killSwitch: true,
      lifecycleRecords: true,
      lifecycleApprovals: true,
      systemControls: { include: { control: true } },
      aiRisks: {
        include: {
          controlLinks: true,
          evidenceLinks: true,
          findingLinks: true
        }
      },
      controlImplementations: {
        include: {
          evidence: true,
          controlLinks: { include: { control: true } }
        }
      },
      auditPackages: true
    }
  });

  assert(travelBrain, "Travel Brain AI system should exist");
  assert(travelBrain.riskOwner === "Russell", "Travel Brain should have Russell as risk owner");
  assert(travelBrain.assessment, "Travel Brain should have a risk assessment");
  assert(travelBrain.assessment?.customerImpact, "Travel Brain should have customer impact score");
  assert(travelBrain.assessment?.financialImpact, "Travel Brain should have financial impact score");
  assert(travelBrain.assessment?.privacyImpact, "Travel Brain should have privacy impact score");
  assert(travelBrain.assessment?.overallRiskTier === "MEDIUM", "Travel Brain overall risk should be Medium");
  assert(travelBrain.assessment?.hallucinationRisk, "Travel Brain should have hallucination risk score");
  assert(travelBrain.assessment?.promptInjectionRisk, "Travel Brain should have prompt injection risk score");

  const travelBrainDiscovery = await prisma.repositoryDiscovery.findFirst({
    where: { name: "travel-brain" },
    include: { components: true, evidenceSources: true, governanceManifest: true, onboardingFindings: true }
  });
  assert(travelBrainDiscovery, "Travel Brain repository discovery should exist");
  assert(travelBrainDiscovery.reviewStatus === "SUGGESTED", "Travel Brain discovery should be suggested");
  assert(travelBrainDiscovery.suggestedSystemType === "Assistant", "Travel Brain discovery should suggest Assistant system type");
  assert(travelBrainDiscovery.components.length >= 6, "Travel Brain discovery should detect AI components");
  assert(travelBrainDiscovery.evidenceSources.length >= 7, "Travel Brain discovery should detect evidence sources");
  assert(travelBrainDiscovery.governanceManifest, "Travel Brain governance manifest should exist");
  assert(travelBrainDiscovery.governanceManifest?.validationStatus === "VALID", "Travel Brain governance manifest should validate");
  assert(travelBrainDiscovery.governanceManifest?.fileName === "AI Governance.yaml", "Travel Brain manifest should use AI Governance.yaml");
  assert(travelBrainDiscovery.governanceManifest?.manifestYaml.includes("evidence_sources:"), "Travel Brain manifest should declare evidence sources");

  const travelBrainAssets = await prisma.asset.findMany({
    where: { aiSystemId: travelBrain.id },
    include: { evidenceSources: true },
    orderBy: { assetType: "asc" }
  });
  assert(travelBrainAssets.length >= 7, "Travel Brain connector assets should exist");
  assert(travelBrainAssets.some((asset) => asset.assetType === "GITHUB"), "Travel Brain GitHub asset should exist");
  assert(travelBrainAssets.some((asset) => asset.assetType === "LOGS"), "Travel Brain Logs asset should exist");
  assert(travelBrainAssets.some((asset) => asset.assetType === "PORTAINER"), "Travel Brain Portainer asset should exist");
  assert(travelBrainAssets.some((asset) => asset.assetType === "SUPABASE"), "Travel Brain Supabase asset should exist");
  assert(travelBrainAssets.some((asset) => asset.assetType === "MCP"), "Travel Brain MCP asset should exist");
  assert(travelBrainAssets.some((asset) => asset.assetType === "NOTION"), "Travel Brain Notion asset should exist");
  assert(travelBrainAssets.some((asset) => asset.assetType === "SECRETS"), "Travel Brain Secrets asset should exist");
  assert(travelBrainAssets.every((asset) => asset.evidenceSources.length > 0), "Travel Brain assets should have evidence sources");
  const travelBrainEvidenceSources = travelBrainAssets.flatMap((asset) => asset.evidenceSources);
  const evidenceSourceById = new Map(travelBrainEvidenceSources.map((source) => [source.sourceId, source]));
  assert(travelBrainEvidenceSources.length >= 30, "Travel Brain evidence source registry should load");
  assert(travelBrainEvidenceSources.some((source) => source.collectionStatus === "VALIDATED"), "Evidence validation status should exist");
  assert(travelBrainEvidenceSources.some((source) => source.freshnessStatus === "CURRENT"), "Evidence freshness status should exist");
  const travelBrainLogSources = await prisma.logSource.findMany({
    where: { aiSystemId: travelBrain.id },
    include: { runtimeArtifacts: true },
    orderBy: { logSourceId: "asc" }
  });
  const travelBrainRuntimeArtifacts = travelBrainLogSources.flatMap((source) => source.runtimeArtifacts.map((artifact) => ({ ...artifact, logSource: source })));
  assert(travelBrainLogSources.length >= 4, "Travel Brain log sources should exist");
  assert(travelBrainLogSources.some((source) => source.type === "EXECUTION_LOG" && source.status === "CONNECTED"), "Travel Brain execution log source should connect");
  assert(travelBrainLogSources.some((source) => source.type === "MONITORING_RESULT" && source.status === "CONNECTED"), "Travel Brain monitoring result source should connect");
  assert(travelBrainLogSources.some((source) => source.type === "CONTROL_RESULT" && source.status === "CONNECTED"), "Travel Brain control result source should connect");
  assert(travelBrainRuntimeArtifacts.length >= 5, "Travel Brain runtime evidence artifacts should exist");
  assert(travelBrainRuntimeArtifacts.every((artifact) => artifact.hash.length === 64), "Runtime evidence artifacts should have metadata hashes");
  assert(travelBrainRuntimeArtifacts.every((artifact) => artifact.correlationId), "Runtime evidence artifacts should have correlation IDs");
  assert(travelBrainRuntimeArtifacts.every((artifact) => artifact.sanitizedEvidence.includes("privacyBoundary")), "Runtime evidence should display sanitized evidence boundaries");
  assert(travelBrainRuntimeArtifacts.every((artifact) => artifact.evidenceSummary.length > 0), "Runtime evidence should include evidence summaries");
  assert(travelBrainRuntimeArtifacts.every((artifact) => artifact.collectionReason.length > 0), "Runtime evidence should explain collection reasons");
  assert(travelBrainRuntimeArtifacts.every((artifact) => artifact.retentionPolicy.length > 0 && artifact.retentionValid), "Runtime evidence should include valid retention policy");
  assert(travelBrainRuntimeArtifacts.every((artifact) => artifact.collectionCurrent), "Runtime evidence collection should be current");
  assert(travelBrainRuntimeArtifacts.some((artifact) => artifact.evidenceType === "EXECUTION" && artifact.sanitizedEvidence.includes("toolUsed")), "Execution runtime evidence should show sanitized tool metadata");
  assert(travelBrainRuntimeArtifacts.some((artifact) => artifact.evidenceType === "MONITORING" && artifact.sanitizedEvidence.includes("controlTestsReviewed")), "Monitoring runtime evidence should show sanitized monitoring metadata");
  assert(travelBrainRuntimeArtifacts.some((artifact) => artifact.evidenceType === "CONTROL_RESULT" && artifact.sanitizedEvidence.includes("controlResultCount")), "Control result runtime evidence should show sanitized control metadata");
  assert(travelBrainRuntimeArtifacts.some((artifact) => artifact.evidenceType === "AUDIT_EVENT" && artifact.sanitizedEvidence.includes("actor")), "Audit runtime evidence should show sanitized governance actor metadata");
  assert(travelBrainRuntimeArtifacts.some((artifact) => artifact.relatedControlId === "AI-GOV-010"), "Runtime monitoring evidence should support AI-GOV-010");
  assert(travelBrainRuntimeArtifacts.some((artifact) => artifact.relatedControlId === "AUD-001"), "Runtime audit/control evidence should support AUD-001");
  assert(travelBrainRuntimeArtifacts.some((artifact) => artifact.relatedControlId === "AI-AGENT-006"), "Runtime execution evidence should support AI-AGENT-006");
  const travelBrainPortainerConnections = await prisma.portainerConnection.findMany({
    where: { aiSystemId: travelBrain.id },
    include: {
      deploymentArtifacts: { include: { driftEvents: true, evidenceSource: true } },
      driftEvents: true
    },
    orderBy: { connectionId: "asc" }
  });
  const travelBrainDeploymentArtifacts = travelBrainPortainerConnections.flatMap((connection) =>
    connection.deploymentArtifacts.map((artifact) => ({ ...artifact, portainerConnection: connection }))
  );
  assert(travelBrainPortainerConnections.length >= 1, "Travel Brain Portainer connection should exist");
  assert(travelBrainPortainerConnections.some((connection) => connection.connectionId === "PORT-TB-CONN-001"), "Travel Brain Portainer connection should load");
  assert(travelBrainDeploymentArtifacts.length >= 1, "Travel Brain deployment evidence artifact should exist");
  assert(travelBrainDeploymentArtifacts.every((artifact) => artifact.hash.length === 64), "Deployment evidence artifacts should have hashes");
  assert(travelBrainDeploymentArtifacts.some((artifact) => artifact.runtimeConfiguration.includes("fieldsProhibitedFromCollection")), "Deployment runtime evidence should document prohibited collection fields");
  assert(travelBrainDeploymentArtifacts.some((artifact) => artifact.runtimeConfiguration.includes("privacyBoundary")), "Deployment runtime evidence should preserve privacy boundary");
  assert(travelBrainDeploymentArtifacts.some((artifact) => artifact.relatedControlsJson.includes("AI-LC-006")), "Deployment evidence should support production approval traceability");
  assert(travelBrainDeploymentArtifacts.some((artifact) => artifact.relatedControlsJson.includes("AI-GOV-010")), "Deployment evidence should support runtime monitoring traceability");
  assert(travelBrainDeploymentArtifacts.some((artifact) => artifact.relatedControlsJson.includes("OPS-001")), "Deployment evidence should support operational resilience traceability");
  const connectedPortainer = travelBrainPortainerConnections.some((connection) => connection.status === "CONNECTED");
  const realDeploymentArtifacts = travelBrainDeploymentArtifacts.filter((artifact) => artifact.validationStatus === "VALID" && artifact.artifactId !== "DEP-TB-PORT-GAP-001");
  if (connectedPortainer) {
    assert(realDeploymentArtifacts.length >= 1, "Connected Portainer should collect real deployment evidence");
    assert(realDeploymentArtifacts.some((artifact) => artifact.containerName === "travel-brain-web"), "Travel Brain web container should be collected from Portainer");
    assert(realDeploymentArtifacts.every((artifact) => artifact.deploymentTimestamp), "Real deployment evidence should include deployment timestamp");
    assert(realDeploymentArtifacts.every((artifact) => artifact.imageName !== "not-collected" && artifact.imageTag !== "not-collected"), "Real deployment evidence should include image name and tag");
    assert(realDeploymentArtifacts.some((artifact) => artifact.loggingEnabled === true), "Real deployment evidence should verify logging is enabled");
    assert(realDeploymentArtifacts.some((artifact) => artifact.runtimeConfiguration.includes("Portainer Deployment Evidence")), "Real deployment evidence should include safe runtime evidence");
    assert(realDeploymentArtifacts.some((artifact) => artifact.driftEvents.some((event) => event.eventType === "BASELINE_RECORDED")), "Real deployment evidence should record a deployment baseline");
    assert(!realDeploymentArtifacts.some((artifact) => artifact.runtimeConfiguration.includes("PORTAINER_TOKEN")), "Runtime evidence must not store Portainer tokens");
    assert(["SRC-TB-PORT-CONTAINER", "SRC-TB-PORT-DEPLOYMENT", "SRC-TB-PORT-RUNTIME"].every((sourceId) => evidenceSourceById.get(sourceId)?.collectionStatus === "VALIDATED" && evidenceSourceById.get(sourceId)?.freshnessStatus === "CURRENT" && evidenceSourceById.get(sourceId)?.connectorHealth === "ON_TRACK"), "Connected Portainer sources should be validated/current/on-track");
  } else {
    assert(travelBrainPortainerConnections.some((connection) => connection.status === "DISCONNECTED" || connection.status === "ERROR"), "Travel Brain Portainer connection should show explicit missing endpoint or collection error");
    assert(travelBrainDeploymentArtifacts.some((artifact) => artifact.artifactId === "DEP-TB-PORT-GAP-001"), "Travel Brain deployment gap artifact should exist when collection fails");
    assert(travelBrainDeploymentArtifacts.some((artifact) => artifact.validationStatus === "MISSING"), "Deployment evidence should report missing Portainer collection truthfully");
    assert(travelBrainDeploymentArtifacts.some((artifact) => artifact.driftEvents.some((event) => event.eventType === "SOURCE_UNAVAILABLE")), "Deployment drift should record source unavailable state");
    assert(["SRC-TB-PORT-CONTAINER", "SRC-TB-PORT-DEPLOYMENT", "SRC-TB-PORT-RUNTIME"].every((sourceId) => evidenceSourceById.get(sourceId)?.collectionStatus === "MISSING" && evidenceSourceById.get(sourceId)?.connectorHealth === "BLOCKED"), "Unavailable Portainer sources should remain explicit missing/blocked warnings");
  }
  const deploymentEvidencePageId = realDeploymentArtifacts[0]?.artifactId ?? "DEP-TB-PORT-GAP-001";
  const travelBrainSupabaseConnections = await prisma.supabaseConnection.findMany({
    where: { aiSystemId: travelBrain.id },
    include: {
      evidenceArtifacts: { include: { evidenceSource: true, controlValidations: true } },
      snapshots: true,
      driftEvents: true,
      controlValidations: true
    },
    orderBy: { connectionId: "asc" }
  });
  const travelBrainSupabaseArtifacts = travelBrainSupabaseConnections.flatMap((connection) =>
    connection.evidenceArtifacts.map((artifact) => ({ ...artifact, supabaseConnection: connection }))
  );
  const travelBrainSupabaseSnapshots = travelBrainSupabaseConnections.flatMap((connection) => connection.snapshots);
  const travelBrainSupabaseDriftEvents = travelBrainSupabaseConnections.flatMap((connection) => connection.driftEvents);
  const travelBrainSupabaseControlValidations = travelBrainSupabaseConnections.flatMap((connection) => connection.controlValidations);
  const travelBrainSupabaseFindings = (await prisma.finding.findMany({
    where: { aiSystemId: travelBrain.id },
    include: { controlTest: true }
  })).filter((finding) => finding.controlTest.testId.startsWith("SUPA-"));
  assert(travelBrainSupabaseConnections.length >= 1, "Travel Brain Supabase connection should exist");
  assert(travelBrainSupabaseConnections.some((connection) => connection.connectionId === "SUPA-TB-CONN-001"), "Travel Brain Supabase connection should load");
  assert(travelBrainSupabaseArtifacts.length >= 4, "Travel Brain Supabase evidence artifacts should exist");
  assert(travelBrainSupabaseArtifacts.some((artifact) => artifact.evidenceType === "SCHEMA"), "Supabase schema evidence artifact should exist");
  assert(travelBrainSupabaseArtifacts.some((artifact) => artifact.evidenceType === "DATA_INVENTORY"), "Supabase data inventory evidence artifact should exist");
  assert(travelBrainSupabaseArtifacts.some((artifact) => artifact.evidenceType === "POLICY"), "Supabase policy evidence artifact should exist");
  assert(travelBrainSupabaseArtifacts.some((artifact) => artifact.evidenceType === "ACCESS_CONTROL"), "Supabase access control evidence artifact should exist");
  assert(travelBrainSupabaseArtifacts.every((artifact) => artifact.hash.length === 64), "Supabase evidence artifacts should have hashes");
  assert(travelBrainSupabaseArtifacts.every((artifact) =>
    artifact.relatedControlsJson.includes("PRI-001")
    || artifact.relatedControlsJson.includes("SEC-001")
    || artifact.relatedControlsJson.includes("GOV-001")
    || artifact.relatedControlsJson.includes("AUD-001")
  ), "Supabase evidence should support data-governance controls");
  assert(!travelBrainSupabaseArtifacts.some((artifact) =>
    artifact.schemaInventory.includes("SUPABASE_SERVICE_ROLE_KEY")
    || artifact.databaseRoles.includes("SUPABASE_SERVICE_ROLE_KEY")
    || artifact.schemaInventory.includes("SUPABASE_ACCESS_TOKEN")
    || artifact.databaseRoles.includes("SUPABASE_ACCESS_TOKEN")
  ), "Supabase evidence must not store Supabase secrets");
  const connectedSupabase = travelBrainSupabaseConnections.some((connection) => connection.status === "CONNECTED");
  const realSupabaseArtifacts = travelBrainSupabaseArtifacts.filter((artifact) => artifact.validationStatus === "VALID");
  if (connectedSupabase) {
    assert(realSupabaseArtifacts.length >= 2, "Connected Supabase should collect real data-governance evidence");
    assert(realSupabaseArtifacts.some((artifact) => artifact.source.includes("postgres") || artifact.source.includes("supabase") || artifact.source.includes("pooler")), "Real Supabase evidence should show sanitized source provenance");
    assert(realSupabaseArtifacts.some((artifact) => artifact.schemaInventory.includes("schema")), "Real Supabase evidence should include schema metadata");
    assert(realSupabaseArtifacts.some((artifact) => artifact.tableInventory.includes("table")), "Real Supabase evidence should include table metadata");
    assert(realSupabaseArtifacts.some((artifact) => artifact.schemaInventory.includes("databaseVersion")), "Real Supabase evidence should include database version metadata");
    assert(travelBrainSupabaseArtifacts.some((artifact) => artifact.auditCapability.includes("extensions")), "Supabase evidence should include extension inventory metadata");
    assert(travelBrainSupabaseSnapshots.length >= 1, "Connected Supabase should retain at least one evidence snapshot");
    assert(travelBrainSupabaseSnapshots.every((snapshot) => snapshot.hash.length === 64), "Supabase snapshots should have hashes");
    assert(travelBrainSupabaseDriftEvents.some((event) => event.eventType === "BASELINE_RECORDED"), "Connected Supabase should record a drift baseline");
    assert(travelBrainSupabaseControlValidations.length >= 5, "Connected Supabase should create control validation results");
    assert(["PRI-001", "SEC-001", "AUD-001", "AI-GOV-010", "OPS-001"].every((controlId) =>
      travelBrainSupabaseControlValidations.some((validation) => validation.controlId === controlId)
    ), "Supabase control validations should map to required controls");
    const warningOrFailureSupabaseValidation = travelBrainSupabaseControlValidations.some((validation) => validation.result !== "PASS");
    if (warningOrFailureSupabaseValidation) {
      assert(travelBrainSupabaseFindings.length >= 1, "Supabase warning/failure validations should generate findings");
      assert(["SRC-TB-SUPABASE-RLS", "SRC-TB-SUPABASE-ACCESS"].some((sourceId) => evidenceSourceById.get(sourceId)?.collectionStatus === "COLLECTED" && evidenceSourceById.get(sourceId)?.connectorHealth === "NEEDS_ATTENTION"), "Supabase validation warnings should remain collected/current source issues");
    }
  } else {
    assert(travelBrainSupabaseConnections.some((connection) => connection.status === "DISCONNECTED" || connection.status === "ERROR"), "Travel Brain Supabase connection should show explicit missing source or collection error");
    assert(travelBrainSupabaseArtifacts.every((artifact) => artifact.validationStatus === "MISSING"), "Supabase evidence should report missing collection truthfully when access is unavailable");
    assert(travelBrainSupabaseArtifacts.some((artifact) =>
      artifact.sourceGap.includes("SUPABASE_DB_URL")
      || artifact.sourceGap.includes("SUPABASE_DATABASE_URL")
      || artifact.sourceGap.includes("collection failed")
      || artifact.sourceGap.includes("source could not be collected")
    ), "Supabase gap should identify missing or unavailable read-only configuration");
    assert(travelBrainSupabaseArtifacts.some((artifact) => artifact.tableInventory.includes("fieldsProhibitedFromCollection")), "Supabase gap should document prohibited collection fields");
    assert(travelBrainSupabaseDriftEvents.some((event) => event.eventType === "SOURCE_UNAVAILABLE"), "Supabase source gap should record source-unavailable drift");
  }
  const supabaseEvidencePageId = realSupabaseArtifacts[0]?.artifactId ?? "DATA-TB-SUPA-SCHEMA-001";
  const travelBrainMcpConnections = await prisma.mcpConnection.findMany({
    where: { aiSystemId: travelBrain.id },
    include: {
      evidenceArtifacts: { include: { evidenceSource: true } }
    },
    orderBy: { connectionId: "asc" }
  });
  const travelBrainMcpArtifacts = travelBrainMcpConnections.flatMap((connection) =>
    connection.evidenceArtifacts.map((artifact) => ({ ...artifact, mcpConnection: connection }))
  );
  assert(travelBrainMcpConnections.length >= 1, "Travel Brain MCP connection should exist");
  assert(travelBrainMcpConnections.some((connection) => connection.connectionId === "MCP-TB-CONN-001"), "Travel Brain MCP connection should load");
  assert(travelBrainMcpArtifacts.length >= 4, "Travel Brain MCP evidence artifacts should exist");
  assert(travelBrainMcpArtifacts.some((artifact) => artifact.evidenceType === "TOOL_REGISTRY"), "MCP tool registry evidence artifact should exist");
  assert(travelBrainMcpArtifacts.some((artifact) => artifact.evidenceType === "TOOL_PERMISSIONS"), "MCP tool permissions evidence artifact should exist");
  assert(travelBrainMcpArtifacts.some((artifact) => artifact.evidenceType === "AUTHORITY_REGISTRY"), "MCP authority registry evidence artifact should exist");
  assert(travelBrainMcpArtifacts.some((artifact) => artifact.evidenceType === "CAPABILITY_INVENTORY"), "MCP capability inventory evidence artifact should exist");
  assert(travelBrainMcpArtifacts.every((artifact) => artifact.hash.length === 64), "MCP evidence artifacts should have hashes");
  assert(travelBrainMcpArtifacts.some((artifact) => artifact.toolInventory.includes("list_trips")), "MCP tool inventory should include real Travel Brain tools");
  assert(travelBrainMcpArtifacts.some((artifact) => artifact.toolInventory.includes("get_travel_brain_tool_catalog")), "MCP tool inventory should include the tool catalog");
  assert(travelBrainMcpArtifacts.every((artifact) => artifact.serverInventory.includes("privacyBoundary")), "MCP evidence should document the privacy boundary");
  assert(travelBrainMcpArtifacts.every((artifact) =>
    artifact.relatedControlsJson.includes("AI-GOV-006")
    || artifact.relatedControlsJson.includes("AI-GOV-010")
    || artifact.relatedControlsJson.includes("AI-AGENT-001")
    || artifact.relatedControlsJson.includes("AUD-001")
  ), "MCP evidence should support agentic-governance controls");
  assert(!travelBrainMcpArtifacts.some((artifact) =>
    artifact.toolInventory.includes("SUPABASE_SERVICE_ROLE_KEY")
    || artifact.serverInventory.includes("SUPABASE_SERVICE_ROLE_KEY")
    || artifact.toolInventory.includes("PORTAINER_TOKEN")
    || artifact.toolInventory.includes("customer content")
  ), "MCP evidence must not store secrets, credentials, or customer content");
  const connectedMcp = travelBrainMcpConnections.some((connection) => connection.status === "CONNECTED");
  const realMcpArtifacts = travelBrainMcpArtifacts.filter((artifact) => artifact.validationStatus === "VALID");
  if (connectedMcp) {
    assert(realMcpArtifacts.length >= 2, "Connected MCP should collect real governance metadata evidence");
    assert(realMcpArtifacts.some((artifact) => artifact.source.includes("Travel Brain")), "Real MCP evidence should show Travel Brain source provenance");
    assert(realMcpArtifacts.some((artifact) => artifact.capabilityInventory.includes("Trip Planning")), "MCP capability inventory should include real capability domains");
    assert(travelBrainMcpArtifacts.some((artifact) => artifact.authorityClassifications.includes("Approval Required")), "MCP authority evidence should include approval-required classifications");
    assert(["SRC-TB-MCP-PERMISSIONS", "SRC-TB-MCP-AUTHORITY"].every((sourceId) => evidenceSourceById.get(sourceId)?.collectionStatus !== "MISSING"), "MCP permission and authority sources should be collected when MCP metadata is connected");
  } else {
    assert(travelBrainMcpConnections.some((connection) => connection.status === "DISCONNECTED" || connection.status === "ERROR"), "Travel Brain MCP connection should show explicit missing source or collection error");
    assert(travelBrainMcpArtifacts.every((artifact) => artifact.validationStatus === "MISSING"), "MCP evidence should report missing collection truthfully when access is unavailable");
    assert(travelBrainMcpArtifacts.some((artifact) => artifact.serverInventory.includes("fieldsProhibitedFromCollection")), "MCP gap should document prohibited collection fields");
  }
  const mcpEvidencePageId = realMcpArtifacts[0]?.artifactId ?? "MCP-TB-TOOLS-001";
  const travelBrainNotionConnections = await prisma.notionConnection.findMany({
    where: { aiSystemId: travelBrain.id },
    include: {
      evidenceArtifacts: { include: { evidenceSource: true } }
    },
    orderBy: { connectionId: "asc" }
  });
  const travelBrainNotionArtifacts = travelBrainNotionConnections.flatMap((connection) =>
    connection.evidenceArtifacts.map((artifact) => ({ ...artifact, notionConnection: connection }))
  );
  assert(travelBrainNotionConnections.length >= 1, "Travel Brain Notion connection should exist");
  assert(travelBrainNotionConnections.some((connection) => connection.connectionId === "NOTION-TB-CONN-001"), "Travel Brain Notion connection should load");
  assert(travelBrainNotionArtifacts.length >= 5, "Travel Brain Notion governance evidence artifacts should exist");
  assert(travelBrainNotionArtifacts.some((artifact) => artifact.evidenceType === "APPROVAL_EVIDENCE"), "Notion approval evidence artifact should exist");
  assert(travelBrainNotionArtifacts.some((artifact) => artifact.evidenceType === "REVIEW_EVIDENCE"), "Notion review evidence artifact should exist");
  assert(travelBrainNotionArtifacts.some((artifact) => artifact.evidenceType === "COMMITTEE_EVIDENCE"), "Notion committee evidence artifact should exist");
  assert(travelBrainNotionArtifacts.some((artifact) => artifact.evidenceType === "GOVERNANCE_DOCUMENTATION_EVIDENCE"), "Notion governance documentation evidence artifact should exist");
  assert(travelBrainNotionArtifacts.some((artifact) => artifact.evidenceType === "OWNERSHIP_EVIDENCE"), "Notion ownership evidence artifact should exist");
  assert(travelBrainNotionArtifacts.every((artifact) => artifact.hash.length === 64), "Notion evidence artifacts should have hashes");
  assert(travelBrainNotionArtifacts.every((artifact) =>
    artifact.relatedControlsJson.includes("GOV-001")
    || artifact.relatedControlsJson.includes("AUD-001")
    || artifact.relatedControlsJson.includes("AI-GOV-001")
    || artifact.relatedControlsJson.includes("AI-GOV-006")
    || artifact.relatedControlsJson.includes("AI-LC-006")
  ), "Notion evidence should support governance controls");
  assert(!travelBrainNotionArtifacts.some((artifact) =>
    artifact.governancePages.includes("Bearer ")
    || artifact.governanceDatabases.includes("Bearer ")
    || artifact.approvalRecords.includes("Bearer ")
    || artifact.reviewRecords.includes("Bearer ")
  ), "Notion evidence must not store Notion bearer tokens");
  const connectedNotion = travelBrainNotionConnections.some((connection) => connection.status === "CONNECTED");
  const realNotionArtifacts = travelBrainNotionArtifacts.filter((artifact) => artifact.validationStatus === "VALID");
  if (connectedNotion) {
    assert(realNotionArtifacts.length >= 1, "Connected Notion should collect real governance metadata evidence");
    assert(realNotionArtifacts.some((artifact) => artifact.source.includes("Notion")), "Real Notion evidence should show Notion source provenance");
    assert(realNotionArtifacts.some((artifact) => artifact.governancePages.includes("Travel Brain") || artifact.approvalRecords.includes("Travel Brain") || artifact.ownershipRecords.includes("Travel Brain")), "Real Notion evidence should be scoped to Travel Brain");
  } else {
    assert(travelBrainNotionConnections.some((connection) => connection.status === "DISCONNECTED" || connection.status === "ERROR"), "Travel Brain Notion connection should show explicit missing source or collection error");
    assert(travelBrainNotionArtifacts.every((artifact) => artifact.validationStatus === "MISSING"), "Notion evidence should report missing collection truthfully when access is unavailable");
    assert(["SRC-TB-NOTION-PAGES", "SRC-TB-NOTION-DATABASES", "SRC-TB-NOTION-APPROVALS", "SRC-TB-NOTION-REVIEWS", "SRC-TB-NOTION-COMMITTEE", "SRC-TB-NOTION-OWNERSHIP"].every((sourceId) => evidenceSourceById.get(sourceId)?.connectorHealth === "NEEDS_ATTENTION"), "Unavailable Notion governance content should be marked needs-attention rather than connector-blocked");
    assert(travelBrainNotionArtifacts.some((artifact) => artifact.governancePages.includes("fieldsProhibitedFromCollection")), "Notion gap should document prohibited collection fields");
    assert(travelBrainNotionArtifacts.some((artifact) =>
      artifact.sourceGap.includes("TRAVEL_BRAIN_NOTION")
      || artifact.sourceGap.includes("NOTION_TOKEN")
      || artifact.sourceGap.includes("source was not available")
      || artifact.sourceGap.includes("path.page_id")
    ), "Notion gap should identify missing or invalid scoped configuration");
  }
  const notionEvidencePageId = realNotionArtifacts[0]?.artifactId ?? "NOTION-TB-APPROVAL-001";
  const travelBrainSecretsConnections = await prisma.secretsConnection.findMany({
    where: { aiSystemId: travelBrain.id },
    include: {
      evidenceArtifacts: { include: { evidenceSource: true } }
    },
    orderBy: { connectionId: "asc" }
  });
  const travelBrainSecretArtifacts = travelBrainSecretsConnections.flatMap((connection) =>
    connection.evidenceArtifacts.map((artifact) => ({ ...artifact, secretsConnection: connection }))
  );
  assert(travelBrainSecretsConnections.length >= 5, "Travel Brain Secrets connections should exist");
  assert(travelBrainSecretsConnections.some((connection) => connection.sourceSystem === "ENVIRONMENT_VARIABLES"), "Environment variable secrets metadata source should exist");
  assert(travelBrainSecretsConnections.some((connection) => connection.sourceSystem === "GITHUB_SECRETS"), "GitHub secrets metadata source should exist");
  assert(travelBrainSecretsConnections.some((connection) => connection.sourceSystem === "SUPABASE_SECRETS"), "Supabase secrets metadata source should exist");
  assert(travelBrainSecretsConnections.some((connection) => connection.sourceSystem === "PORTAINER_SECRETS"), "Portainer secrets metadata source should exist");
  assert(travelBrainSecretsConnections.some((connection) => connection.sourceSystem === "LOCAL_SECRET_STORES"), "Local secret-store metadata source should exist");
  assert(travelBrainSecretArtifacts.length >= 4, "Travel Brain secret metadata evidence artifacts should exist");
  assert(travelBrainSecretArtifacts.some((artifact) => artifact.evidenceType === "SECRET_INVENTORY"), "Secret inventory evidence artifact should exist");
  assert(travelBrainSecretArtifacts.some((artifact) => artifact.evidenceType === "ROTATION_EVIDENCE"), "Secret rotation evidence artifact should exist");
  assert(travelBrainSecretArtifacts.some((artifact) => artifact.evidenceType === "OWNERSHIP_EVIDENCE"), "Secret ownership evidence artifact should exist");
  assert(travelBrainSecretArtifacts.some((artifact) => artifact.evidenceType === "USAGE_MAPPING"), "Secret usage mapping evidence artifact should exist");
  assert(travelBrainSecretArtifacts.every((artifact) => artifact.hash.length === 64), "Secret metadata evidence artifacts should have metadata hashes");
  assert(travelBrainSecretArtifacts.every((artifact) => artifact.plaintextProhibition.includes("fieldsProhibitedFromCollection")), "Secret evidence should document prohibited collection fields");
  assert(travelBrainSecretArtifacts.every((artifact) =>
    artifact.relatedControlsJson.includes("SEC-001")
    || artifact.relatedControlsJson.includes("AUD-001")
    || artifact.relatedControlsJson.includes("OPS-001")
    || artifact.relatedControlsJson.includes("AI-GOV-010")
  ), "Secret evidence should support security, audit, operations, or AI-governance controls");
  assert(!travelBrainSecretArtifacts.some((artifact) =>
    artifact.secretInventory.includes("sk-")
    || artifact.secretInventory.includes("Bearer ")
    || artifact.rotationEvidence.includes("Bearer ")
    || artifact.usageMapping.includes("postgres://")
    || artifact.usageMapping.includes("postgresql://")
    || artifact.ownershipEvidence.includes("-----BEGIN")
  ), "Secret evidence must not store secret values, bearer tokens, connection strings, or private key material");
  assert(travelBrainSecretArtifacts.some((artifact) => artifact.warningReason.length > 0), "Secret evidence should preserve governance warning explanations");
  assert(["SRC-TB-SECRETS-ROTATION", "SRC-TB-SECRETS-OWNERSHIP"].every((sourceId) => evidenceSourceById.get(sourceId)?.collectionStatus !== "MISSING" && evidenceSourceById.get(sourceId)?.freshnessStatus === "CURRENT"), "Secrets rotation and ownership warnings should be collected/current metadata issues");
  const secretEvidencePageId = travelBrainSecretArtifacts[0]?.artifactId ?? "SEC-TB-SECRETS-INVENTORY-001";
  const travelBrainDiscoveryRuns = await prisma.assetDiscoveryRun.findMany({
    where: { aiSystemId: travelBrain.id },
    include: {
      sources: true,
      findings: {
        include: {
          discoverySource: true,
          asset: true
        }
      }
    },
    orderBy: { completedAt: "desc" }
  });
  const latestDiscoveryRun = travelBrainDiscoveryRuns[0];
  assert(latestDiscoveryRun, "Travel Brain asset discovery run should exist");
  assert(latestDiscoveryRun.sources.length >= 10, "Asset discovery should inspect multiple source types");
  assert(latestDiscoveryRun.findings.length >= 8, "Asset discovery should create findings");
  assert(latestDiscoveryRun.findings.some((finding) => finding.disposition === "KNOWN_ASSET"), "Asset discovery should identify known assets");
  assert(latestDiscoveryRun.findings.some((finding) => finding.disposition === "UNTRACKED_ASSET"), "Asset discovery should identify untracked assets");
  assert(latestDiscoveryRun.findings.some((finding) => finding.disposition === "UNKNOWN_ASSET"), "Asset discovery should identify unknown assets");
  assert(latestDiscoveryRun.findings.some((finding) => finding.disposition === "MISSING_ASSET" || finding.disposition === "ORPHANED_ASSET"), "Asset discovery should identify missing or orphaned assets");
  assert(latestDiscoveryRun.findings.some((finding) => finding.findingType === "UNDECLARED_ASSET_FOUND"), "Asset discovery should generate undeclared asset findings");
  assert(latestDiscoveryRun.findings.some((finding) => finding.findingType === "UNKNOWN_INTEGRATION_FOUND"), "Asset discovery should generate unknown integration findings");
  assert(latestDiscoveryRun.findings.some((finding) => finding.findingType === "MISSING_EVIDENCE_SOURCE"), "Asset discovery should generate missing evidence source findings");
  assert(latestDiscoveryRun.findings.every((finding) => finding.sourceLabel && finding.evidence && finding.reason && finding.confidence > 0), "Discovery findings should be explainable");
  assert(latestDiscoveryRun.findings.every((finding) => finding.sourceFile && finding.sourceAsset && finding.discoveryRule), "Discovery findings should include source file, source asset, and discovery rule");
  assert(latestDiscoveryRun.findings.every((finding) => finding.confidenceLevel && finding.validationStatus && finding.validationExplanation), "Discovery findings should include confidence level and validation explanation");
  assert(latestDiscoveryRun.findings.some((finding) => finding.validationStatus === "VALID"), "Discovery validation should include valid findings");
  assert(latestDiscoveryRun.findings.some((finding) => finding.validationStatus === "WARNING"), "Discovery validation should include warning findings");
  assert(latestDiscoveryRun.findings.some((finding) => finding.validationStatus === "INVALID"), "Discovery validation should identify invalid findings");
  assert(latestDiscoveryRun.findings.some((finding) => finding.assetName === "Booking API" && finding.validationStatus === "INVALID" && !finding.discovered), "Denied-only Booking API should be invalid rather than trusted as a discovered asset");
  assert(latestDiscoveryRun.findings.some((finding) => finding.assetName === "Local Secret Stores" && finding.validationStatus === "INVALID" && !finding.orphaned), "Disconnected local secret-store support should be invalid rather than trusted as an orphaned asset");
  const validatedDiscoveryFindings = latestDiscoveryRun.findings.filter((finding) => finding.validationStatus !== "INVALID");
  assert(latestDiscoveryRun.unknownAssetCount === validatedDiscoveryFindings.filter((finding) => finding.disposition === "UNKNOWN_ASSET").length, "Unknown asset count should exclude invalid discovery findings");
  assert(latestDiscoveryRun.orphanedAssetCount === validatedDiscoveryFindings.filter((finding) => finding.disposition === "ORPHANED_ASSET").length, "Orphaned asset count should exclude invalid discovery findings");
  assert(latestDiscoveryRun.findings.some((finding) => finding.assetName === "Supabase - Travel Brain" && !finding.declared && finding.tracked), "Discovery should find tracked assets missing from AI Governance.yaml");
  assert(latestDiscoveryRun.findings.some((finding) => finding.assetType === "EXTERNAL_API" && !finding.tracked && finding.validationStatus !== "INVALID"), "Discovery should find validated untracked external API integrations");
  assert(latestDiscoveryRun.inventoryCompleteness > 0, "Asset discovery should calculate inventory completeness");
  const travelBrainArtifacts = await prisma.evidenceArtifact.findMany({
    include: {
      assuranceRules: { include: { explanation: true } },
      snapshots: true,
      source: { include: { asset: { include: { aiSystem: true } } } }
    }
  });
  assert(travelBrainArtifacts.some((artifact) => artifact.artifactId === "ART-TB-GH-MANIFEST-001" && artifact.content.includes("system:")), "Travel Brain manifest artifact should exist");
  assert(travelBrainArtifacts.some((artifact) => artifact.artifactId === "ART-TB-GH-PROMPT-001" && artifact.content.includes("Travel Brain")), "Travel Brain prompt artifact should exist");
  assert(travelBrainArtifacts.some((artifact) => artifact.artifactId === "ART-TB-GH-POLICY-001" && (artifact.content.includes("approved_tools") || artifact.content.includes("approved_read_only_tools"))), "Travel Brain policy artifact should exist");
  assert(travelBrainArtifacts.some((artifact) => artifact.artifactId === "ART-TB-GH-WORKFLOW-001" && artifact.content.includes("control-tests")), "Travel Brain workflow artifact should exist");
  assert(travelBrainArtifacts.every((artifact) => artifact.validationStatus === "VALID"), "GitHub artifacts should validate");
  assert(travelBrainArtifacts.every((artifact) => artifact.artifactHash.length === 64), "GitHub artifacts should have SHA-256 hashes");
  assert(travelBrainArtifacts.every((artifact) => artifact.commitSha.length >= 12), "GitHub artifacts should have commit SHAs");
  assert(travelBrainArtifacts.every((artifact) => artifact.sourceUrl.includes("github.com/")), "GitHub artifacts should have source URLs");
  assert(travelBrainArtifacts.every((artifact) => artifact.sourceUrl.includes(`/blob/`) && decodeURI(artifact.sourceUrl).endsWith(artifact.path)), "GitHub artifacts should have path-level provenance");
  assert(travelBrainArtifacts.every((artifact) => artifact.repositoryConnectionId), "GitHub artifacts should link to repository connection");
  assert(travelBrainArtifacts.every((artifact) => artifact.snapshots.length > 0), "GitHub artifacts should preserve evidence snapshots");
  assert(travelBrainArtifacts.every((artifact) => artifact.snapshots.some((snapshot) => snapshot.artifactHash === artifact.artifactHash && snapshot.commitSha === artifact.commitSha)), "Evidence snapshots should preserve collected hash and commit SHA");
  assert(travelBrainArtifacts.every((artifact) => artifact.assuranceRules.length > 0), "GitHub artifacts should have assurance rules");
  assert(travelBrainArtifacts.some((artifact) => artifact.artifactType === "MANIFEST" && artifact.assuranceRules.some((rule) => rule.controlId === "AI-GOV-001" && rule.status === "PASS")), "Manifest assurance should support AI-GOV-001");
  assert(travelBrainArtifacts.some((artifact) => artifact.artifactType === "PROMPT" && artifact.assuranceRules.some((rule) => rule.controlId === "AI-GOV-004" && rule.status === "PASS")), "Prompt assurance should support AI-GOV-004");
  assert(travelBrainArtifacts.some((artifact) => artifact.artifactType === "POLICY" && artifact.assuranceRules.some((rule) => rule.controlId === "AI-GOV-006" && rule.status === "PASS")), "Policy assurance should support AI-GOV-006");
  assert(travelBrainArtifacts.some((artifact) => artifact.artifactType === "WORKFLOW" && artifact.assuranceRules.some((rule) => rule.controlId === "AUD-001" && rule.status === "PASS")), "Workflow assurance should support AUD-001");
  assert(travelBrainArtifacts.every((artifact) => artifact.assuranceRules.every((rule) => rule.explanation)), "Assurance rules should have explanations");
  assert(travelBrainArtifacts.some((artifact) => artifact.assuranceRules.some((rule) => rule.status === "PASS" && rule.explanation?.reason)), "Pass explanations should exist");
  assert(travelBrainArtifacts.some((artifact) => artifact.assuranceRules.some((rule) => rule.status === "WARNING" && rule.explanation?.missingRequirements)), "Warning explanations should exist");
  const travelBrainRepositoryConnection = await prisma.repositoryConnection.findUnique({
    where: { repositoryId: "REPO-TB-GITHUB-001" },
    include: { driftEvents: true }
  });
  assert(travelBrainRepositoryConnection, "Travel Brain repository connection should exist");
  assert(travelBrainRepositoryConnection.status === "CONNECTED", "Travel Brain repository should be connected");
  assert(travelBrainRepositoryConnection.repositoryUrl.includes("github.com/"), "Travel Brain repository should use GitHub provenance");
  assert(travelBrainRepositoryConnection.driftEvents.length >= 4, "GitHub artifact drift events should record baseline collection");
  const promptControl = await prisma.control.findUnique({ where: { code: "AI-GOV-003" } });
  assert(promptControl, "AI-GOV-003 control should exist for traceability");
  const governanceStories = await prisma.governanceStory.findMany({ include: { control: true } });
  assert(governanceStories.some((story) => story.control.code === "AI-GOV-003" && story.failureScenario.includes("prompt")), "AI-GOV-003 governance story should exist");
  assert(governanceStories.some((story) => story.control.code === "AI-GOV-006" && story.failureScenario.includes("tool")), "AI-GOV-006 governance story should exist");
  assert(governanceStories.some((story) => story.control.code === "AUD-001" && story.monitoringNarrative.includes("workflow")), "AUD-001 governance story should exist");
  const promptControlRules = await prisma.assuranceRule.findMany({
    where: { controlId: "AI-GOV-003" },
    include: { evidenceArtifact: true }
  });
  assert(promptControlRules.some((rule) => rule.evidenceArtifact.artifactId === "ART-TB-GH-PROMPT-001"), "Controls should link to evidence artifacts");
  const promptArtifact = travelBrainArtifacts.find((artifact) => artifact.artifactId === "ART-TB-GH-PROMPT-001");
  assert(promptArtifact?.assuranceRules.some((rule) => rule.controlId === "AI-GOV-003"), "Artifacts should link back to controls");
  const assuranceScore = Math.round((
    (travelBrainEvidenceSources.filter((source) => source.collectionStatus !== "MISSING").length / travelBrainEvidenceSources.length) * 100 +
    (travelBrainEvidenceSources.filter((source) => source.freshnessStatus === "CURRENT").length / travelBrainEvidenceSources.length) * 100 +
    (travelBrainEvidenceSources.filter((source) => source.collectionStatus === "VALIDATED").length / travelBrainEvidenceSources.length) * 100 +
    (travelBrainEvidenceSources.filter((source) => source.connectorHealth === "ON_TRACK").length / travelBrainEvidenceSources.length) * 100
  ) / 4);
  assert(assuranceScore > 0, "Travel Brain assurance score should calculate");

  const manifestFinding = await prisma.repositoryOnboardingFinding.findFirst({
    where: { findingId: "AI-GOV-MANIFEST-001" },
    include: { repositoryDiscovery: true }
  });
  assert(manifestFinding, "Missing manifest onboarding finding should exist");
  assert(manifestFinding.repositoryDiscovery.name === "legacy-branch-assistant", "Missing manifest finding should link to legacy branch assistant discovery");

  console.log("ok data Travel Brain exists");
  console.log("ok data Platform Review report exists");
  console.log("ok data Platform Review package exists");
  console.log("ok data Platform Review workspace exists");
  console.log("ok data Platform Review feature registry entry exists");
  console.log("ok data risk owner is Russell");
  console.log("ok data multi-dimensional risk scores exist");
  console.log("ok data overall risk is Medium");
  console.log("ok data Travel Brain repository discovery profile exists");
  console.log("ok data repository evidence sources generate");
  console.log("ok data Travel Brain governance manifest exists");
  console.log("ok data manifest validation works");
  console.log("ok data missing manifest finding generates");
  console.log("ok data Travel Brain asset inventory exists");
  console.log("ok data evidence source registry exists");
  console.log("ok data evidence validation status exists");
  console.log("ok data evidence freshness status exists");
  console.log("ok data Travel Brain log sources exist");
  console.log("ok data runtime evidence artifacts exist");
  console.log("ok data sanitized runtime evidence displays");
  console.log("ok data runtime evidence retention and collection health exists");
  console.log("ok data runtime evidence control mappings exist");
  console.log("ok data Travel Brain Portainer connection exists");
  console.log(connectedPortainer ? "ok data real Portainer deployment evidence exists" : "ok data deployment evidence gap artifact exists");
  console.log("ok data deployment evidence privacy boundary exists");
  console.log("ok data deployment evidence control mappings exist");
  console.log(connectedPortainer ? "ok data deployment drift baseline exists" : "ok data deployment drift source gap exists");
  console.log("ok data Travel Brain Supabase connection exists");
  console.log(connectedSupabase ? "ok data real Supabase data-governance evidence exists" : "ok data Supabase instrumentation gap artifacts exist");
  console.log("ok data Supabase evidence control mappings exist");
  console.log("ok data Supabase snapshots, drift, and control validations exist");
  console.log("ok data Travel Brain MCP connection exists");
  console.log(connectedMcp ? "ok data real MCP governance evidence exists" : "ok data MCP instrumentation gap artifacts exist");
  console.log("ok data MCP evidence control mappings exist");
  console.log("ok data Travel Brain Notion connection exists");
  console.log(connectedNotion ? "ok data real Notion governance evidence exists" : "ok data Notion instrumentation gap artifacts exist");
  console.log("ok data Notion evidence control mappings exist");
  console.log("ok data Travel Brain Secrets connections exist");
  console.log("ok data Secrets metadata evidence artifacts exist");
  console.log("ok data Secrets evidence control mappings exist");
  console.log("ok data Secrets evidence privacy boundary exists");
  console.log("ok data Travel Brain asset discovery run exists");
  console.log("ok data Asset Discovery sources exist");
  console.log("ok data Asset Discovery findings exist");
  console.log("ok data Asset Discovery validates finding evidence");
  console.log("ok data Asset Discovery identifies forgotten assets");
  console.log("ok data GitHub evidence artifacts exist");
  console.log("ok data GitHub artifact validation works");
  console.log("ok data evidence snapshots exist");
  console.log("ok data evidence artifact assurance works");
  console.log("ok data assurance explanations exist");
  console.log("ok data warning explanations exist");
  console.log("ok data Travel Brain repository connected");
  console.log("ok data GitHub artifact provenance exists");
  console.log("ok data GitHub drift events exist");
  console.log("ok data control evidence traceability works");
  console.log("ok data governance stories exist");
  console.log("ok data assurance score calculates");

  const regulations = await prisma.regulation.findMany({
    include: {
      requirements: {
        include: {
          controlMappings: {
            include: {
              regulatoryControl: {
                include: { aiSystemMappings: true }
              }
            }
          }
        }
      },
      controls: true
    }
  });
  assert(regulations.length >= 7, "Regulations should load");
  assert(regulations.every((regulation) => regulation.requirements.length > 0), "Requirements should load");
  assert(regulations.every((regulation) => regulation.controls.length > 0), "Controls should load");

  const travelBrainMappings = await prisma.aiSystemRegulatoryControl.findMany({
    where: { aiSystemId: travelBrain.id },
    include: { regulatoryControl: { include: { regulation: true } } }
  });
  assert(travelBrainMappings.length > 0, "Travel Brain regulatory mappings should exist");

  const coverage = regulations.map((regulation) => {
    const totalRequirements = regulation.requirements.length;
    const coveredRequirements = regulation.requirements.filter((requirement) =>
      requirement.controlMappings.some((mapping) => mapping.regulatoryControl.aiSystemMappings.length > 0)
    ).length;
    return {
      name: regulation.name,
      totalRequirements,
      coveredRequirements,
      coveragePercentage: Math.round((coveredRequirements / totalRequirements) * 100)
    };
  });

  assert(coverage.every((item) => item.totalRequirements > 0), "Coverage engine should calculate totals");
  assert(coverage.some((item) => item.coveredRequirements > 0), "Coverage engine should calculate covered requirements");

  const traceability = await prisma.regulation.findFirst({
    where: { slug: "osfi-e-23" },
    include: {
      requirements: {
        include: {
          controlMappings: {
            include: {
              regulatoryControl: {
                include: {
                  aiSystemMappings: { include: { aiSystem: true } },
                  evidenceItems: true
                }
              }
            }
          }
        }
      }
    }
  });
  assert(traceability?.requirements.some((requirement) =>
    requirement.controlMappings.some((mapping) =>
      mapping.regulatoryControl.aiSystemMappings.some((systemMapping) => systemMapping.aiSystem.slug === "travel-brain")
    )
  ), "Auditor traceability should connect regulation to Travel Brain");

  console.log("ok data regulations load");
  console.log("ok data requirements load");
  console.log("ok data controls load");
  console.log("ok data Travel Brain regulatory mappings exist");
  console.log("ok data coverage engine works");
  console.log("ok data auditor traceability works");

  const controlTests = await prisma.controlTest.findMany();
  assert(controlTests.length >= 10, "Control tests should load");

  const travelBrainRuns = await prisma.testRun.findMany({
    where: { aiSystemId: travelBrain.id },
    include: { controlTest: true }
  });
  assert(travelBrainRuns.length >= 10, "Monitoring tests should execute for Travel Brain");
  assert(travelBrainRuns.every((run) => run.result === "PASS"), "Travel Brain should pass core controls");

  const findings = await prisma.finding.findMany({ include: { aiSystem: true, controlTest: true } });
  assert(findings.length > 0, "Findings should generate when tests fail");

  const exceptions = await prisma.exception.findMany({ include: { finding: true } });
  assert(exceptions.length > 0, "Exceptions should load");

  console.log("ok data control tests load");
  console.log("ok data monitoring tests execute");
  console.log("ok data findings generate");
  console.log("ok data exceptions load");
  console.log("ok data Travel Brain passes core controls");

  const evidenceObjects = await prisma.evidenceObject.findMany({ include: { aiSystem: true } });
  assert(evidenceObjects.length > 0, "Evidence objects should load");

  const evidenceHealth = await prisma.evidenceHealth.findMany({
    include: { aiSystem: true, evidenceRequirement: true }
  });
  assert(evidenceHealth.length > 0, "Evidence health should calculate");
  assert(
    evidenceHealth
      .filter((record) => record.aiSystem.slug === "travel-brain")
      .every((record) => record.health === "CURRENT" && record.validation === "VALID"),
    "Travel Brain evidence should be current and valid"
  );
  assert(
    evidenceHealth.some((record) => record.aiSystem.slug === "legacy-branch-assistant" && record.health === "MISSING"),
    "Legacy Branch Assistant should have missing evidence"
  );
  assert(
    evidenceHealth.some((record) => record.aiSystem.slug === "legacy-branch-assistant" && record.health === "EXPIRED"),
    "Legacy Branch Assistant should have expired evidence"
  );
  assert(
    findings.some((finding) => finding.aiSystem.slug === "legacy-branch-assistant" && finding.controlTest.testId === "CCM-007"),
    "Legacy evidence findings should exist"
  );

  console.log("ok data evidence loads");
  console.log("ok data evidence health works");
  console.log("ok data Travel Brain evidence is current");
  console.log("ok data Legacy evidence findings exist");

  assert(travelBrain.aiModels.some((model) => model.name === "GPT-5" && model.validationStatus === "APPROVED"), "Travel Brain model inventory should include approved GPT-5");
  assert(travelBrain.agents.some((agent) => agent.agenticLevel === 1), "Travel Brain agent registry should include Level 1 agent");
  assert(travelBrain.promptAssets.some((prompt) => prompt.approvalStatus === "APPROVED" && prompt.versions.length > 0), "Travel Brain prompt registry should include approved prompt history");
  assert(travelBrain.toolPermissions.length >= 4, "Travel Brain tool permissions should exist");
  assert(travelBrain.authorityAssignment?.delegatedAuthority.authorityLevel === 1, "Travel Brain delegated authority should be Level 1");
  assert(travelBrain.humanOversight?.oversightRequired, "Travel Brain human oversight should be defined");
  assert(travelBrain.lifecycleStatus === "PRODUCTION", "Travel Brain should be in Production lifecycle stage");
  assert(travelBrain.lifecycleRecords.some((record) => record.lifecycleStage === "PRODUCTION"), "Travel Brain lifecycle history should include Production");
  assert(travelBrain.lifecycleApprovals.some((approval) => approval.approvalType === "Production Approval" && approval.status === "APPROVED"), "Travel Brain production approval should exist");
  assert(travelBrain.systemControls.some((mapping) => mapping.control.code === "AI-LC-006" && mapping.auditStatus === "ON_TRACK"), "Travel Brain production lifecycle gate should be on track");
  assert(travelBrain.aiRisks.length >= 3, "Travel Brain AI risks should exist");
  assert(travelBrain.aiRisks.some((risk) => risk.title === "Hallucinated Recommendation"), "Travel Brain hallucination risk should exist");
  assert(travelBrain.aiRisks.some((risk) => risk.title === "Privacy Exposure" && risk.status === "ACCEPTED" && risk.acceptanceApprover === "David Kim"), "Travel Brain accepted privacy risk should exist");
  assert(travelBrain.aiRisks.every((risk) => risk.controlLinks.length > 0), "Travel Brain risks should link to controls");
  assert(travelBrain.controlImplementations.length >= 6, "Travel Brain control implementations should exist");
  assert(travelBrain.controlImplementations.some((implementation) => implementation.title === "Prompt Registry"), "Travel Brain Prompt Registry implementation should exist");
  assert(travelBrain.controlImplementations.some((implementation) => implementation.title === "Agent Tool Policy"), "Travel Brain Agent Tool Policy implementation should exist");
  assert(travelBrain.controlImplementations.every((implementation) => implementation.evidence.length > 0), "Travel Brain implementation evidence should exist");
  assert(travelBrain.auditPackages.some((auditPackage) => auditPackage.packageId === "AUDPKG-TB-2026-001"), "Travel Brain audit package should exist");

  const aiControls = await prisma.control.findMany({ where: { code: { startsWith: "AI-GOV-" } } });
  assert(aiControls.length >= 10, "AI governance controls should exist");
  assert(
    findings.some((finding) => finding.aiSystem.slug === "legacy-branch-assistant" && finding.controlTest.testId === "CCM-011"),
    "Legacy AI governance findings should exist"
  );

  console.log("ok data AI Governance dashboard data exists");
  console.log("ok data Travel Brain AI governance profile exists");
  console.log("ok data model inventory exists");
  console.log("ok data agent registry exists");
  console.log("ok data prompt registry exists");
  console.log("ok data tool permissions exist");
  console.log("ok data delegated authority exists");
  console.log("ok data AI controls exist");
  console.log("ok data Legacy AI governance findings exist");
  console.log("ok data Travel Brain lifecycle profile exists");
  console.log("ok data Travel Brain risk register exists");
  console.log("ok data Travel Brain governance engineering mappings exist");

  assert(travelBrain.agents.some((agent) => agent.agenticLevel === 1), "Travel Brain should be Agentic Level 1");
  assert(travelBrain.agentActions.some((action) => action.name === "Recommend Excursion"), "Travel Brain should have Recommend Excursion action");
  assert(travelBrain.agentActions.some((action) => action.name === "Draft Packing List"), "Travel Brain should have Draft Packing List action");
  assert(travelBrain.governedTools.length >= 2, "Travel Brain governed tool registry should exist");
  assert(travelBrain.executionLogs.length >= 2, "Travel Brain execution logging should exist");

  const paymentAgent = await prisma.aiSystem.findUnique({
    where: { slug: "autonomous-payment-agent" },
    include: {
      assessment: true,
      agents: true,
      governedTools: true,
      agentActions: true,
      executionLogs: true,
      killSwitch: true,
      authorityAssignment: { include: { delegatedAuthority: true } },
      lifecycleRecords: true,
      lifecycleApprovals: true,
      systemControls: { include: { control: true } },
      aiRisks: {
        include: {
          controlLinks: true,
          findingLinks: true
        }
      },
      controlImplementations: {
        include: {
          evidence: true,
          controlLinks: { include: { control: true } }
        }
      },
      evidenceObjects: true,
      auditPackages: true
    }
  });
  assert(paymentAgent, "Autonomous Payment Agent should exist");
  assert(paymentAgent.lifecycleStatus === "PILOT", "Autonomous Payment Agent should be in Pilot lifecycle stage");
  assert(paymentAgent.assessment?.overallRiskTier === "CRITICAL", "Autonomous Payment Agent should be Critical risk");
  assert(paymentAgent.agents.some((agent) => agent.agenticLevel === 4), "Autonomous Payment Agent should be Agentic Level 4");
  assert(paymentAgent.governedTools.some((tool) => tool.name === "Payment API"), "Payment tool registry should include Payment API");
  assert(paymentAgent.agentActions.some((action) => action.name === "Execute Transactions"), "Payment agent action registry should include Execute Transactions");
  assert(paymentAgent.executionLogs.length > 0, "Payment agent execution logging should exist");
  assert(paymentAgent.killSwitch, "Payment agent kill switch should exist");
  assert(paymentAgent.lifecycleRecords.some((record) => record.lifecycleStage === "PILOT"), "Payment agent lifecycle history should include Pilot");
  assert(paymentAgent.lifecycleApprovals.some((approval) => approval.approvalType === "Pilot Approval" && approval.status === "APPROVED"), "Payment agent pilot approval should exist");
  assert(paymentAgent.systemControls.some((mapping) => mapping.control.code === "AI-LC-006" && mapping.auditStatus === "BLOCKED"), "Payment agent production lifecycle gate should be blocked");
  assert(paymentAgent.aiRisks.length >= 3, "Autonomous Payment Agent AI risks should exist");
  assert(paymentAgent.aiRisks.some((risk) => risk.title === "Unauthorized Transaction"), "Payment unauthorized transaction risk should exist");
  assert(paymentAgent.aiRisks.some((risk) => risk.title === "Approval Bypass"), "Payment approval bypass risk should exist");
  assert(paymentAgent.aiRisks.some((risk) => risk.title === "Runaway Automation"), "Payment runaway automation risk should exist");
  assert(paymentAgent.aiRisks.some((risk) => risk.findingLinks.length > 0), "Payment risks should link to findings");
  assert(paymentAgent.controlImplementations.length >= 5, "Autonomous Payment Agent control implementations should exist");
  assert(paymentAgent.controlImplementations.some((implementation) => implementation.title === "Transaction Limits"), "Payment Transaction Limits implementation should exist");
  assert(paymentAgent.controlImplementations.some((implementation) => implementation.title === "Dual Approval Workflow"), "Payment Dual Approval Workflow implementation should exist");
  assert(paymentAgent.controlImplementations.some((implementation) => implementation.title === "Kill Switch"), "Payment Kill Switch implementation should exist");
  assert(paymentAgent.controlImplementations.some((implementation) => implementation.evidence.length > 0), "Payment implementation evidence should exist");
  assert(paymentAgent.evidenceObjects.some((evidence) => evidence.evidenceId === "EV-APA-APPROVAL-001"), "Payment approval workflow evidence should exist");
  assert(paymentAgent.evidenceObjects.some((evidence) => evidence.evidenceId === "EV-APA-KILL-001"), "Payment kill switch evidence should exist");
  assert(paymentAgent.evidenceObjects.some((evidence) => evidence.evidenceId === "EV-APA-LIMITS-001"), "Payment transaction limit evidence should exist");
  assert(paymentAgent.auditPackages.some((auditPackage) => auditPackage.packageId === "AUDPKG-APA-PILOT-2026-001"), "Payment audit package should exist");

  const agenticControls = await prisma.control.findMany({ where: { code: { startsWith: "AI-AGENT-" } } });
  assert(agenticControls.length >= 10, "Agentic controls should exist");
  const lifecycleControls = await prisma.control.findMany({ where: { code: { startsWith: "AI-LC-" } } });
  assert(lifecycleControls.length === 7, "Lifecycle controls should exist");

  const legacyLifecycle = await prisma.aiSystem.findUnique({
    where: { slug: "legacy-branch-assistant" },
    include: {
      lifecycleRecords: true,
      lifecycleApprovals: true,
      systemControls: { include: { control: true } }
    }
  });
  assert(legacyLifecycle, "Legacy Branch Assistant should exist");
  assert(legacyLifecycle.lifecycleStatus === "TESTING", "Legacy Branch Assistant should be in Testing lifecycle stage");
  assert(legacyLifecycle.lifecycleRecords.some((record) => record.lifecycleStage === "TESTING"), "Legacy lifecycle history should include Testing");
  assert(legacyLifecycle.lifecycleApprovals.some((approval) => approval.approvalType === "Evidence Completeness" && approval.status === "PENDING"), "Legacy pending evidence approval should exist");
  assert(legacyLifecycle.systemControls.some((mapping) => mapping.control.code === "AI-LC-004" && mapping.auditStatus === "BLOCKED"), "Legacy evidence lifecycle gate should be blocked");
  assert(
    findings.some((finding) => finding.aiSystem.slug === "legacy-branch-assistant" && finding.controlTest.testId === "CCM-013"),
    "Legacy lifecycle findings should exist"
  );
  assert(
    findings.some((finding) => finding.controlTest.testId === "CCM-014"),
    "Governance engineering findings should exist"
  );
  assert(
    findings.some((finding) => finding.aiSystem.slug === "autonomous-payment-agent" && finding.controlTest.testId === "CCM-012"),
    "Autonomous Payment Agent agentic findings should exist"
  );

  console.log("ok data Agentic Governance dashboard data exists");
  console.log("ok data Travel Brain agentic profile exists");
  console.log("ok data Autonomous Payment Agent exists");
  console.log("ok data tool registry exists");
  console.log("ok data execution logging exists");
  console.log("ok data kill switch exists");
  console.log("ok data agentic controls exist");
  console.log("ok data Autonomous Payment Agent findings exist");
  console.log("ok data lifecycle controls exist");
  console.log("ok data lifecycle approvals exist");
  console.log("ok data lifecycle stage gates exist");
  console.log("ok data lifecycle findings generate");
  console.log("ok data Autonomous Payment Agent risk register exists");
  console.log("ok data risk acceptance works");
  console.log("ok data Autonomous Payment Agent governance engineering mappings exist");
  console.log("ok data implementation evidence exists");
  console.log("ok data governance engineering findings generate");
  console.log("ok data evidence packages generate");
  console.log("ok data Autonomous Payment Agent evidence exists");

  const auditPackages = await prisma.auditPackage.findMany({ include: { evidenceLinks: true } });
  assert(auditPackages.length >= 3, "Audit packages should generate");
  assert(auditPackages.every((auditPackage) => auditPackage.evidenceLinks.length > 0), "Audit packages should include evidence");

  const repositoryEvidence = await prisma.evidenceObject.findMany({
    include: {
      aiSystem: true,
      requirementLinks: true,
      aiRiskLinks: true,
      auditPackageLinks: true
    }
  });
  assert(repositoryEvidence.some((evidence) => evidence.evidenceId === "EV-TB-RISK-001" && evidence.requirementLinks.length > 0), "Evidence traceability should link Travel Brain risk assessment to requirements");
  assert(repositoryEvidence.some((evidence) => evidence.evidenceId === "EV-APA-APPROVAL-001" && evidence.aiRiskLinks.length > 0), "Evidence traceability should link payment approval evidence to risks");
  assert(repositoryEvidence.some((evidence) => evidence.auditPackageLinks.length > 0), "Evidence should link to audit packages");

  console.log("ok data audit packages include evidence");
  console.log("ok data evidence traceability works");

  const baseUrl = process.env.APP_URL;
  if (baseUrl) {
    await assertPageLoads(baseUrl, "/");
    await assertPageLoads(baseUrl, "/systems/travel-brain");
    await assertPageLoads(baseUrl, "/onboarding");
    await assertPageLoads(baseUrl, "/platform-review");
    await assertPageLoads(baseUrl, "/platform-review/package");
    await assertPageLoads(baseUrl, "/platform-review/export");
    await assertPageLoads(baseUrl, "/onboarding/repositories");
    await assertPageLoads(baseUrl, "/onboarding/travel-brain-pilot");
    const discovery = await prisma.repositoryDiscovery.findFirst({ where: { name: "travel-brain" } });
    assert(discovery, "Travel Brain discovery should exist for route smoke");
    await assertPageLoads(baseUrl, `/onboarding/repositories/${discovery.id}`);
    await assertPageLoads(baseUrl, "/regulatory");
    await assertPageLoads(baseUrl, "/regulatory/osfi-e-23");
    await assertPageLoads(baseUrl, "/traceability");
    await assertPageLoads(baseUrl, "/monitoring");
    await assertPageLoads(baseUrl, "/control-health");
    await assertPageLoads(baseUrl, "/controls");
    await assertPageLoads(baseUrl, "/controls/AI-GOV-003");
    await assertPageLoads(baseUrl, "/controls/AI-GOV-006");
    await assertPageLoads(baseUrl, "/controls/AI-GOV-010");
    await assertPageLoads(baseUrl, "/controls/AI-LC-006");
    await assertPageLoads(baseUrl, "/controls/OPS-001");
    await assertPageLoads(baseUrl, "/controls/PRI-001");
    await assertPageLoads(baseUrl, "/controls/SEC-001");
    await assertPageLoads(baseUrl, "/controls/AI-AGENT-006");
    await assertPageLoads(baseUrl, "/controls/AUD-001");
    await assertPageLoads(baseUrl, "/findings");
    await assertPageLoads(baseUrl, "/exceptions");
    await assertPageLoads(baseUrl, "/risk-heatmap");
    await assertPageLoads(baseUrl, "/systems/travel-brain/monitoring");
    await assertPageLoads(baseUrl, "/evidence");
    await assertPageLoads(baseUrl, "/evidence-repository");
    await assertPageLoads(baseUrl, "/evidence-repository?q=Travel%20Brain");
    await assertPageLoads(baseUrl, "/evidence-health");
    await assertPageLoads(baseUrl, "/evidence-assurance");
    await assertPageLoads(baseUrl, "/evidence-assurance/repository");
    await assertPageLoads(baseUrl, "/evidence-assurance/health");
    await assertPageLoads(baseUrl, "/evidence-assurance/artifacts");
    await assertPageLoads(baseUrl, "/evidence-assurance/runtime");
    await assertPageLoads(baseUrl, "/evidence-assurance/deployments");
    await assertPageLoads(baseUrl, "/evidence-assurance/data-governance");
    await assertPageLoads(baseUrl, "/evidence-assurance/mcp-governance");
    await assertPageLoads(baseUrl, "/evidence-assurance/governance-evidence");
    await assertPageLoads(baseUrl, "/evidence-assurance/secrets-governance");
    await assertPageLoads(baseUrl, "/evidence-assurance/asset-discovery");
    await assertPageLoads(baseUrl, "/evidence-assurance/snapshots");
    await assertPageLoads(baseUrl, "/evidence-assurance/drift");
    await assertPageLoads(baseUrl, "/evidence-assurance/sources");
    await assertPageLoads(baseUrl, "/evidence-assurance/assurance");
    await assertPageLoads(baseUrl, "/evidence-assurance/packages");
    await assertPageLoads(baseUrl, "/evidence-assurance/traceability");
    await assertPageLoads(baseUrl, "/audit-packages");
    await assertPageLoads(baseUrl, "/evidence/EV-TB-RISK-001");
    await assertPageLoads(baseUrl, "/evidence/EV-TB-RISK-001/download?format=markdown");
    await assertPageLoads(baseUrl, "/evidence/EV-TB-RISK-001/download?format=json");
    await assertPageLoads(baseUrl, "/evidence/EV-TB-RISK-001/download?format=text");
    await assertPageLoads(baseUrl, "/executive");
    await assertPageLoads(baseUrl, "/executive/board-report");
    await assertPageLoads(baseUrl, "/portfolio");
    await assertPageLoads(baseUrl, "/portfolio/ai-systems");
    await assertPageLoads(baseUrl, "/governance");
    await assertPageLoads(baseUrl, "/governance-manifest");
    await assertPageLoads(baseUrl, "/governance-manifest/registry");
    await assertPageLoads(baseUrl, "/governance-operations");
    await assertPageLoads(baseUrl, "/evidence-artifacts/ART-TB-GH-MANIFEST-001");
    await assertPageLoads(baseUrl, "/evidence-artifacts/ART-TB-GH-PROMPT-001");
    await assertPageLoads(baseUrl, "/evidence-artifacts/ART-TB-GH-POLICY-001");
    await assertPageLoads(baseUrl, "/evidence-artifacts/ART-TB-GH-WORKFLOW-001");
    await assertPageLoads(baseUrl, "/evidence-artifacts/ART-TB-GH-WORKFLOW-001/drift");
    await assertPageLoads(baseUrl, "/runtime-evidence/RTE-TB-EXEC-001");
    await assertPageLoads(baseUrl, "/runtime-evidence/RTE-TB-MONITORING-001");
    await assertPageLoads(baseUrl, "/runtime-evidence/RTE-TB-CONTROL-001");
    await assertPageLoads(baseUrl, `/deployment-evidence/${deploymentEvidencePageId}`);
    await assertPageLoads(baseUrl, `/supabase-evidence/${supabaseEvidencePageId}`);
    await assertPageLoads(baseUrl, `/mcp-evidence/${mcpEvidencePageId}`);
    await assertPageLoads(baseUrl, `/notion-evidence/${notionEvidencePageId}`);
    await assertPageLoads(baseUrl, `/secret-evidence/${secretEvidencePageId}`);
    await assertPageLoads(baseUrl, "/governance-framework");
    await assertPageLoads(baseUrl, "/auditor");
    await assertPageLoads(baseUrl, "/auditor-workspace");
    await assertPageLoads(baseUrl, "/auditor-workspace/traceability");
    await assertPageLoads(baseUrl, "/governance-committee");
    await assertPageLoads(baseUrl, "/administration");
    await assertPageLoads(baseUrl, "/walkthroughs");
    await assertPageLoads(baseUrl, "/reports/executive");
    await assertPageLoads(baseUrl, "/regulatory-coverage");
    await assertPageLoads(baseUrl, "/ai-governance");
    await assertPageLoads(baseUrl, "/systems/autonomous-payment-agent");
    await assertPageLoads(baseUrl, "/systems/travel-brain/regulations");
    await assertPageLoads(baseUrl, "/systems/travel-brain/controls");
    await assertPageLoads(baseUrl, "/systems/autonomous-payment-agent/controls");
    await assertPageLoads(baseUrl, "/systems/travel-brain/evidence");
    await assertPageLoads(baseUrl, "/systems/travel-brain/ai-governance");
    await assertPageLoads(baseUrl, "/agentic-governance");
    await assertPageLoads(baseUrl, "/systems/travel-brain/agentic-governance");
    await assertPageLoads(baseUrl, "/systems/autonomous-payment-agent/agentic-governance");
    await assertPageLoads(baseUrl, "/ai-lifecycle");
    await assertPageLoads(baseUrl, "/systems/travel-brain/lifecycle");
    await assertPageLoads(baseUrl, "/systems/legacy-branch-assistant/lifecycle");
    await assertPageLoads(baseUrl, "/systems/autonomous-payment-agent/lifecycle");
    await assertPageLoads(baseUrl, "/ai-risk");
    await assertPageLoads(baseUrl, "/systems/travel-brain/risk");
    await assertPageLoads(baseUrl, "/systems/autonomous-payment-agent/risk");
    await assertPageLoads(baseUrl, "/governance-engineering");
    await assertPageLoads(baseUrl, "/systems/travel-brain/governance-engineering");
    await assertPageLoads(baseUrl, "/systems/autonomous-payment-agent/governance-engineering");
    await assertPageLoads(baseUrl, "/systems/travel-brain/audit-trail");
    await assertPageLoads(baseUrl, "/systems/autonomous-payment-agent/audit-trail");
  } else {
    console.log("skip pages APP_URL not set");
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
