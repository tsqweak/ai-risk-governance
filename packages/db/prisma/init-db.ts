import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbPath = join(process.cwd(), "prisma", "dev.db");

async function main() {
  await mkdir(dirname(dbPath), { recursive: true });
  await rm(dbPath, { force: true });

  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.exec("PRAGMA foreign_keys = ON;");

  await db.exec(`
    CREATE TABLE Persona (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      role TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE RepositoryDiscovery (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      repositoryType TEXT NOT NULL,
      reviewStatus TEXT NOT NULL,
      suggestedSystemType TEXT NOT NULL,
      suggestedAgenticLevel INTEGER NOT NULL,
      suggestedAuthorityLevel INTEGER NOT NULL,
      suggestedLifecycleStage TEXT NOT NULL,
      suggestedJurisdictionsJson TEXT NOT NULL,
      suggestedRiskDomainsJson TEXT NOT NULL,
      suggestedControlsJson TEXT NOT NULL,
      suggestedRisksJson TEXT NOT NULL,
      rationale TEXT NOT NULL,
      reviewer TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE RepositoryComponent (
      id TEXT PRIMARY KEY NOT NULL,
      repositoryDiscoveryId TEXT NOT NULL,
      componentType TEXT NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      rationale TEXT NOT NULL,
      CONSTRAINT RepositoryComponent_repositoryDiscoveryId_fkey FOREIGN KEY (repositoryDiscoveryId) REFERENCES RepositoryDiscovery (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE RepositoryEvidenceSource (
      id TEXT PRIMARY KEY NOT NULL,
      repositoryDiscoveryId TEXT NOT NULL,
      sourceType TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      collectionMethod TEXT NOT NULL,
      validationMethod TEXT NOT NULL,
      automationLevel TEXT NOT NULL,
      rationale TEXT NOT NULL,
      CONSTRAINT RepositoryEvidenceSource_repositoryDiscoveryId_fkey FOREIGN KEY (repositoryDiscoveryId) REFERENCES RepositoryDiscovery (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE GovernanceManifest (
      id TEXT PRIMARY KEY NOT NULL,
      manifestId TEXT NOT NULL UNIQUE,
      repositoryDiscoveryId TEXT NOT NULL UNIQUE,
      fileName TEXT NOT NULL,
      location TEXT NOT NULL,
      validationStatus TEXT NOT NULL,
      systemName TEXT NOT NULL,
      businessOwner TEXT NOT NULL,
      riskOwner TEXT NOT NULL,
      lifecycleStage TEXT NOT NULL,
      aiType TEXT NOT NULL,
      riskTier TEXT NOT NULL,
      evidenceSourceCount INTEGER NOT NULL,
      manifestYaml TEXT NOT NULL,
      validationMessagesJson TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT GovernanceManifest_repositoryDiscoveryId_fkey FOREIGN KEY (repositoryDiscoveryId) REFERENCES RepositoryDiscovery (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE RepositoryOnboardingFinding (
      id TEXT PRIMARY KEY NOT NULL,
      findingId TEXT NOT NULL,
      repositoryDiscoveryId TEXT NOT NULL,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      rationale TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT RepositoryOnboardingFinding_repositoryDiscoveryId_fkey FOREIGN KEY (repositoryDiscoveryId) REFERENCES RepositoryDiscovery (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX RepositoryOnboardingFinding_findingId_idx ON RepositoryOnboardingFinding(findingId);

    CREATE TABLE AiSystem (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      businessPurpose TEXT NOT NULL,
      lifecycleStatus TEXT NOT NULL,
      environment TEXT NOT NULL,
      businessOwner TEXT NOT NULL,
      technologyOwner TEXT NOT NULL,
      riskOwner TEXT NOT NULL,
      executiveSponsor TEXT NOT NULL,
      customerFacing BOOLEAN NOT NULL,
      internalUserFacing BOOLEAN NOT NULL,
      personalData BOOLEAN NOT NULL,
      materialBusinessProcess BOOLEAN NOT NULL,
      regulatedActivity BOOLEAN NOT NULL,
      autonomousAction BOOLEAN NOT NULL,
      financialTransaction BOOLEAN NOT NULL,
      externalThirdPartyDependency BOOLEAN NOT NULL,
      dataClassification TEXT NOT NULL,
      jurisdictionsJson TEXT NOT NULL,
      useCaseType TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      lastReviewDate DATETIME NOT NULL,
      nextReviewDate DATETIME NOT NULL
    );

    CREATE TABLE Asset (
      id TEXT PRIMARY KEY NOT NULL,
      assetId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      assetType TEXT NOT NULL,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      criticality TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT Asset_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX Asset_aiSystemId_idx ON Asset(aiSystemId);

    CREATE TABLE GitHubRepositoryDiscovery (
      id TEXT PRIMARY KEY NOT NULL,
      repositoryId TEXT NOT NULL UNIQUE,
      owner TEXT NOT NULL,
      name TEXT NOT NULL,
      fullName TEXT NOT NULL,
      repositoryUrl TEXT NOT NULL,
      defaultBranch TEXT NOT NULL,
      description TEXT NOT NULL,
      isPrivate BOOLEAN NOT NULL,
      isArchived BOOLEAN NOT NULL,
      lastPushedAt DATETIME,
      discoveredAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      selectedForAiSystemId TEXT,
      CONSTRAINT GitHubRepositoryDiscovery_selectedForAiSystemId_fkey FOREIGN KEY (selectedForAiSystemId) REFERENCES AiSystem (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX GitHubRepositoryDiscovery_owner_idx ON GitHubRepositoryDiscovery(owner);
    CREATE INDEX GitHubRepositoryDiscovery_selectedForAiSystemId_idx ON GitHubRepositoryDiscovery(selectedForAiSystemId);

    CREATE TABLE RepositoryConnection (
      id TEXT PRIMARY KEY NOT NULL,
      repositoryId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      repositoryUrl TEXT NOT NULL,
      branch TEXT NOT NULL,
      status TEXT NOT NULL,
      lastScan DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT RepositoryConnection_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX RepositoryConnection_aiSystemId_idx ON RepositoryConnection(aiSystemId);

    CREATE TABLE AssetDiscoveryRun (
      id TEXT PRIMARY KEY NOT NULL,
      runId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      status TEXT NOT NULL,
      startedAt DATETIME NOT NULL,
      completedAt DATETIME NOT NULL,
      knownAssetCount INTEGER NOT NULL,
      discoveredAssetCount INTEGER NOT NULL,
      unknownAssetCount INTEGER NOT NULL,
      untrackedAssetCount INTEGER NOT NULL,
      orphanedAssetCount INTEGER NOT NULL,
      missingAssetCount INTEGER NOT NULL,
      inventoryCompleteness INTEGER NOT NULL,
      summary TEXT NOT NULL,
      comparisonSummary TEXT NOT NULL,
      recommendedAction TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT AssetDiscoveryRun_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX AssetDiscoveryRun_aiSystemId_idx ON AssetDiscoveryRun(aiSystemId);
    CREATE INDEX AssetDiscoveryRun_status_idx ON AssetDiscoveryRun(status);

    CREATE TABLE AssetDiscoverySource (
      id TEXT PRIMARY KEY NOT NULL,
      sourceId TEXT NOT NULL UNIQUE,
      runId TEXT NOT NULL,
      sourceType TEXT NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      inspectedAt DATETIME NOT NULL,
      inspectionMethod TEXT NOT NULL,
      evidenceSummary TEXT NOT NULL,
      discoveredAssetCount INTEGER NOT NULL,
      expectedAssetCount INTEGER NOT NULL,
      unknownAssetCount INTEGER NOT NULL,
      missingAssetCount INTEGER NOT NULL,
      confidence INTEGER NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT AssetDiscoverySource_runId_fkey FOREIGN KEY (runId) REFERENCES AssetDiscoveryRun (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX AssetDiscoverySource_runId_idx ON AssetDiscoverySource(runId);
    CREATE INDEX AssetDiscoverySource_sourceType_idx ON AssetDiscoverySource(sourceType);

    CREATE TABLE AssetDiscoveryFinding (
      id TEXT PRIMARY KEY NOT NULL,
      findingId TEXT NOT NULL UNIQUE,
      runId TEXT NOT NULL,
      sourceId TEXT,
      assetId TEXT,
      findingType TEXT NOT NULL,
      disposition TEXT NOT NULL,
      assetType TEXT NOT NULL,
      assetName TEXT NOT NULL,
      declared BOOLEAN NOT NULL,
      discovered BOOLEAN NOT NULL,
      tracked BOOLEAN NOT NULL,
      orphaned BOOLEAN NOT NULL,
      evidenceSourceMissing BOOLEAN NOT NULL,
      sourceLabel TEXT NOT NULL,
      sourceFile TEXT NOT NULL,
      sourceAsset TEXT NOT NULL,
      evidence TEXT NOT NULL,
      discoveryRule TEXT NOT NULL,
      reason TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      confidenceLevel TEXT NOT NULL,
      validationStatus TEXT NOT NULL,
      validationExplanation TEXT NOT NULL,
      invalidReason TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      recommendedAction TEXT NOT NULL,
      relatedControlsJson TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT AssetDiscoveryFinding_runId_fkey FOREIGN KEY (runId) REFERENCES AssetDiscoveryRun (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT AssetDiscoveryFinding_sourceId_fkey FOREIGN KEY (sourceId) REFERENCES AssetDiscoverySource (id) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT AssetDiscoveryFinding_assetId_fkey FOREIGN KEY (assetId) REFERENCES Asset (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX AssetDiscoveryFinding_runId_idx ON AssetDiscoveryFinding(runId);
    CREATE INDEX AssetDiscoveryFinding_sourceId_idx ON AssetDiscoveryFinding(sourceId);
    CREATE INDEX AssetDiscoveryFinding_assetId_idx ON AssetDiscoveryFinding(assetId);
    CREATE INDEX AssetDiscoveryFinding_findingType_idx ON AssetDiscoveryFinding(findingType);
    CREATE INDEX AssetDiscoveryFinding_disposition_idx ON AssetDiscoveryFinding(disposition);
    CREATE INDEX AssetDiscoveryFinding_status_idx ON AssetDiscoveryFinding(status);

    CREATE TABLE EvidenceSource (
      id TEXT PRIMARY KEY NOT NULL,
      sourceId TEXT NOT NULL UNIQUE,
      assetId TEXT NOT NULL,
      sourceType TEXT NOT NULL,
      collectionMethod TEXT NOT NULL,
      validationMethod TEXT NOT NULL,
      automationLevel TEXT NOT NULL,
      collectionStatus TEXT NOT NULL,
      lastCollectedAt DATETIME,
      lastValidatedAt DATETIME,
      freshnessStatus TEXT NOT NULL,
      connectorHealth TEXT NOT NULL,
      evidenceLocation TEXT NOT NULL,
      governanceValue TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT EvidenceSource_assetId_fkey FOREIGN KEY (assetId) REFERENCES Asset (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX EvidenceSource_assetId_idx ON EvidenceSource(assetId);

    CREATE TABLE LogSource (
      id TEXT PRIMARY KEY NOT NULL,
      logSourceId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      evidenceSourceId TEXT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      retentionPeriod TEXT NOT NULL,
      lastCollected DATETIME,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT LogSource_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT LogSource_evidenceSourceId_fkey FOREIGN KEY (evidenceSourceId) REFERENCES EvidenceSource (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX LogSource_aiSystemId_idx ON LogSource(aiSystemId);
    CREATE INDEX LogSource_evidenceSourceId_idx ON LogSource(evidenceSourceId);
    CREATE INDEX LogSource_type_idx ON LogSource(type);
    CREATE INDEX LogSource_status_idx ON LogSource(status);

    CREATE TABLE RuntimeEvidenceArtifact (
      id TEXT PRIMARY KEY NOT NULL,
      artifactId TEXT NOT NULL UNIQUE,
      logSourceId TEXT NOT NULL,
      eventType TEXT NOT NULL,
      evidenceType TEXT NOT NULL,
      eventTimestamp DATETIME NOT NULL,
      correlationId TEXT NOT NULL,
      hash TEXT NOT NULL,
      validationStatus TEXT NOT NULL,
      collectionDate DATETIME NOT NULL,
      sourceRecordId TEXT NOT NULL,
      relatedControlId TEXT NOT NULL,
      sanitizedEvidence TEXT NOT NULL,
      evidenceSummary TEXT NOT NULL,
      collectionReason TEXT NOT NULL,
      retentionPolicy TEXT NOT NULL,
      evidenceHealth TEXT NOT NULL,
      retentionValid BOOLEAN NOT NULL,
      collectionCurrent BOOLEAN NOT NULL,
      collectionRationale TEXT NOT NULL,
      assuranceSummary TEXT NOT NULL,
      failureCondition TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT RuntimeEvidenceArtifact_logSourceId_fkey FOREIGN KEY (logSourceId) REFERENCES LogSource (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX RuntimeEvidenceArtifact_logSourceId_idx ON RuntimeEvidenceArtifact(logSourceId);
    CREATE INDEX RuntimeEvidenceArtifact_relatedControlId_idx ON RuntimeEvidenceArtifact(relatedControlId);
    CREATE INDEX RuntimeEvidenceArtifact_validationStatus_idx ON RuntimeEvidenceArtifact(validationStatus);

    CREATE TABLE PortainerConnection (
      id TEXT PRIMARY KEY NOT NULL,
      connectionId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      environment TEXT NOT NULL,
      status TEXT NOT NULL,
      lastScan DATETIME,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT PortainerConnection_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX PortainerConnection_aiSystemId_idx ON PortainerConnection(aiSystemId);
    CREATE INDEX PortainerConnection_status_idx ON PortainerConnection(status);

    CREATE TABLE DeploymentEvidenceArtifact (
      id TEXT PRIMARY KEY NOT NULL,
      artifactId TEXT NOT NULL UNIQUE,
      portainerConnectionId TEXT NOT NULL,
      evidenceSourceId TEXT,
      deploymentId TEXT NOT NULL,
      containerName TEXT NOT NULL,
      imageName TEXT NOT NULL,
      imageTag TEXT NOT NULL,
      deploymentTimestamp DATETIME,
      collectionTimestamp DATETIME NOT NULL,
      hash TEXT NOT NULL,
      validationStatus TEXT NOT NULL,
      restartCount INTEGER,
      healthStatus TEXT NOT NULL,
      loggingEnabled BOOLEAN,
      runtimeConfiguration TEXT NOT NULL,
      collectionMethod TEXT NOT NULL,
      provenance TEXT NOT NULL,
      relatedControlsJson TEXT NOT NULL,
      evidenceSummary TEXT NOT NULL,
      collectionReason TEXT NOT NULL,
      assuranceSummary TEXT NOT NULL,
      failureCondition TEXT NOT NULL,
      sourceGap TEXT NOT NULL,
      evidenceHealth TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT DeploymentEvidenceArtifact_portainerConnectionId_fkey FOREIGN KEY (portainerConnectionId) REFERENCES PortainerConnection (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT DeploymentEvidenceArtifact_evidenceSourceId_fkey FOREIGN KEY (evidenceSourceId) REFERENCES EvidenceSource (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX DeploymentEvidenceArtifact_portainerConnectionId_idx ON DeploymentEvidenceArtifact(portainerConnectionId);
    CREATE INDEX DeploymentEvidenceArtifact_evidenceSourceId_idx ON DeploymentEvidenceArtifact(evidenceSourceId);
    CREATE INDEX DeploymentEvidenceArtifact_validationStatus_idx ON DeploymentEvidenceArtifact(validationStatus);
    CREATE INDEX DeploymentEvidenceArtifact_evidenceHealth_idx ON DeploymentEvidenceArtifact(evidenceHealth);

    CREATE TABLE SupabaseConnection (
      id TEXT PRIMARY KEY NOT NULL,
      connectionId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      projectId TEXT NOT NULL,
      environment TEXT NOT NULL,
      status TEXT NOT NULL,
      lastScan DATETIME,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT SupabaseConnection_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX SupabaseConnection_aiSystemId_idx ON SupabaseConnection(aiSystemId);
    CREATE INDEX SupabaseConnection_status_idx ON SupabaseConnection(status);

    CREATE TABLE SupabaseEvidenceArtifact (
      id TEXT PRIMARY KEY NOT NULL,
      artifactId TEXT NOT NULL UNIQUE,
      supabaseConnectionId TEXT NOT NULL,
      evidenceSourceId TEXT,
      evidenceType TEXT NOT NULL,
      title TEXT NOT NULL,
      collectionTimestamp DATETIME NOT NULL,
      source TEXT NOT NULL,
      hash TEXT NOT NULL,
      validationStatus TEXT NOT NULL,
      evidenceHealth TEXT NOT NULL,
      schemaInventory TEXT NOT NULL,
      tableInventory TEXT NOT NULL,
      rlsStatus TEXT NOT NULL,
      enabledPolicies TEXT NOT NULL,
      databaseRoles TEXT NOT NULL,
      auditCapability TEXT NOT NULL,
      collectionMethod TEXT NOT NULL,
      provenance TEXT NOT NULL,
      relatedControlsJson TEXT NOT NULL,
      evidenceSummary TEXT NOT NULL,
      collectionReason TEXT NOT NULL,
      assuranceSummary TEXT NOT NULL,
      failureCondition TEXT NOT NULL,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT SupabaseEvidenceArtifact_supabaseConnectionId_fkey FOREIGN KEY (supabaseConnectionId) REFERENCES SupabaseConnection (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT SupabaseEvidenceArtifact_evidenceSourceId_fkey FOREIGN KEY (evidenceSourceId) REFERENCES EvidenceSource (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX SupabaseEvidenceArtifact_supabaseConnectionId_idx ON SupabaseEvidenceArtifact(supabaseConnectionId);
    CREATE INDEX SupabaseEvidenceArtifact_evidenceSourceId_idx ON SupabaseEvidenceArtifact(evidenceSourceId);
    CREATE INDEX SupabaseEvidenceArtifact_validationStatus_idx ON SupabaseEvidenceArtifact(validationStatus);
    CREATE INDEX SupabaseEvidenceArtifact_evidenceHealth_idx ON SupabaseEvidenceArtifact(evidenceHealth);

    CREATE TABLE SupabaseEvidenceSnapshot (
      id TEXT PRIMARY KEY NOT NULL,
      snapshotId TEXT NOT NULL UNIQUE,
      supabaseConnectionId TEXT NOT NULL,
      collectionTimestamp DATETIME NOT NULL,
      databaseVersion TEXT NOT NULL,
      hash TEXT NOT NULL,
      schemaInventory TEXT NOT NULL,
      tableInventory TEXT NOT NULL,
      rlsInventory TEXT NOT NULL,
      policyInventory TEXT NOT NULL,
      roleInventory TEXT NOT NULL,
      extensionInventory TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT SupabaseEvidenceSnapshot_supabaseConnectionId_fkey FOREIGN KEY (supabaseConnectionId) REFERENCES SupabaseConnection (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX SupabaseEvidenceSnapshot_supabaseConnectionId_idx ON SupabaseEvidenceSnapshot(supabaseConnectionId);
    CREATE INDEX SupabaseEvidenceSnapshot_collectionTimestamp_idx ON SupabaseEvidenceSnapshot(collectionTimestamp);
    CREATE INDEX SupabaseEvidenceSnapshot_hash_idx ON SupabaseEvidenceSnapshot(hash);

    CREATE TABLE SupabaseDriftEvent (
      id TEXT PRIMARY KEY NOT NULL,
      driftId TEXT NOT NULL UNIQUE,
      supabaseConnectionId TEXT NOT NULL,
      previousSnapshotId TEXT NOT NULL,
      currentSnapshotId TEXT NOT NULL,
      eventType TEXT NOT NULL,
      previousValue TEXT NOT NULL,
      currentValue TEXT NOT NULL,
      detectedAt DATETIME NOT NULL,
      changeSummary TEXT NOT NULL,
      status TEXT NOT NULL,
      controlImpact TEXT NOT NULL,
      recommendedAction TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT SupabaseDriftEvent_supabaseConnectionId_fkey FOREIGN KEY (supabaseConnectionId) REFERENCES SupabaseConnection (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX SupabaseDriftEvent_supabaseConnectionId_idx ON SupabaseDriftEvent(supabaseConnectionId);
    CREATE INDEX SupabaseDriftEvent_eventType_idx ON SupabaseDriftEvent(eventType);
    CREATE INDEX SupabaseDriftEvent_status_idx ON SupabaseDriftEvent(status);

    CREATE TABLE SupabaseControlValidation (
      id TEXT PRIMARY KEY NOT NULL,
      validationId TEXT NOT NULL UNIQUE,
      supabaseConnectionId TEXT NOT NULL,
      supabaseEvidenceArtifactId TEXT,
      controlId TEXT NOT NULL,
      result TEXT NOT NULL,
      evidenceUsed TEXT NOT NULL,
      validationChecks TEXT NOT NULL,
      changeDetected TEXT NOT NULL,
      controlImpact TEXT NOT NULL,
      recommendedAction TEXT NOT NULL,
      failureConditions TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT SupabaseControlValidation_supabaseConnectionId_fkey FOREIGN KEY (supabaseConnectionId) REFERENCES SupabaseConnection (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT SupabaseControlValidation_supabaseEvidenceArtifactId_fkey FOREIGN KEY (supabaseEvidenceArtifactId) REFERENCES SupabaseEvidenceArtifact (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX SupabaseControlValidation_supabaseConnectionId_idx ON SupabaseControlValidation(supabaseConnectionId);
    CREATE INDEX SupabaseControlValidation_supabaseEvidenceArtifactId_idx ON SupabaseControlValidation(supabaseEvidenceArtifactId);
    CREATE INDEX SupabaseControlValidation_controlId_idx ON SupabaseControlValidation(controlId);
    CREATE INDEX SupabaseControlValidation_result_idx ON SupabaseControlValidation(result);

    CREATE TABLE McpConnection (
      id TEXT PRIMARY KEY NOT NULL,
      connectionId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      serverName TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      status TEXT NOT NULL,
      lastScan DATETIME,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT McpConnection_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX McpConnection_aiSystemId_idx ON McpConnection(aiSystemId);
    CREATE INDEX McpConnection_status_idx ON McpConnection(status);

    CREATE TABLE McpEvidenceArtifact (
      id TEXT PRIMARY KEY NOT NULL,
      artifactId TEXT NOT NULL UNIQUE,
      mcpConnectionId TEXT NOT NULL,
      evidenceSourceId TEXT,
      evidenceType TEXT NOT NULL,
      title TEXT NOT NULL,
      collectionTimestamp DATETIME NOT NULL,
      source TEXT NOT NULL,
      version TEXT NOT NULL,
      hash TEXT NOT NULL,
      validationStatus TEXT NOT NULL,
      evidenceHealth TEXT NOT NULL,
      serverInventory TEXT NOT NULL,
      toolInventory TEXT NOT NULL,
      toolCategories TEXT NOT NULL,
      declaredPermissions TEXT NOT NULL,
      authorityClassifications TEXT NOT NULL,
      capabilityInventory TEXT NOT NULL,
      collectionMethod TEXT NOT NULL,
      provenance TEXT NOT NULL,
      relatedControlsJson TEXT NOT NULL,
      evidenceSummary TEXT NOT NULL,
      collectionReason TEXT NOT NULL,
      assuranceSummary TEXT NOT NULL,
      failureCondition TEXT NOT NULL,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT McpEvidenceArtifact_mcpConnectionId_fkey FOREIGN KEY (mcpConnectionId) REFERENCES McpConnection (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT McpEvidenceArtifact_evidenceSourceId_fkey FOREIGN KEY (evidenceSourceId) REFERENCES EvidenceSource (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX McpEvidenceArtifact_mcpConnectionId_idx ON McpEvidenceArtifact(mcpConnectionId);
    CREATE INDEX McpEvidenceArtifact_evidenceSourceId_idx ON McpEvidenceArtifact(evidenceSourceId);
    CREATE INDEX McpEvidenceArtifact_validationStatus_idx ON McpEvidenceArtifact(validationStatus);
    CREATE INDEX McpEvidenceArtifact_evidenceHealth_idx ON McpEvidenceArtifact(evidenceHealth);

    CREATE TABLE NotionConnection (
      id TEXT PRIMARY KEY NOT NULL,
      connectionId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      workspaceName TEXT NOT NULL,
      status TEXT NOT NULL,
      lastScan DATETIME,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT NotionConnection_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX NotionConnection_aiSystemId_idx ON NotionConnection(aiSystemId);
    CREATE INDEX NotionConnection_status_idx ON NotionConnection(status);

    CREATE TABLE NotionEvidenceArtifact (
      id TEXT PRIMARY KEY NOT NULL,
      artifactId TEXT NOT NULL UNIQUE,
      notionConnectionId TEXT NOT NULL,
      evidenceSourceId TEXT,
      evidenceType TEXT NOT NULL,
      title TEXT NOT NULL,
      source TEXT NOT NULL,
      collectionTimestamp DATETIME NOT NULL,
      lastModified DATETIME,
      hash TEXT NOT NULL,
      validationStatus TEXT NOT NULL,
      evidenceHealth TEXT NOT NULL,
      governancePages TEXT NOT NULL,
      governanceDatabases TEXT NOT NULL,
      approvalRecords TEXT NOT NULL,
      reviewRecords TEXT NOT NULL,
      committeeRecords TEXT NOT NULL,
      ownershipRecords TEXT NOT NULL,
      governanceDocumentation TEXT NOT NULL,
      collectionMethod TEXT NOT NULL,
      provenance TEXT NOT NULL,
      relatedControlsJson TEXT NOT NULL,
      evidenceSummary TEXT NOT NULL,
      collectionReason TEXT NOT NULL,
      assuranceSummary TEXT NOT NULL,
      failureCondition TEXT NOT NULL,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT NotionEvidenceArtifact_notionConnectionId_fkey FOREIGN KEY (notionConnectionId) REFERENCES NotionConnection (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT NotionEvidenceArtifact_evidenceSourceId_fkey FOREIGN KEY (evidenceSourceId) REFERENCES EvidenceSource (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX NotionEvidenceArtifact_notionConnectionId_idx ON NotionEvidenceArtifact(notionConnectionId);
    CREATE INDEX NotionEvidenceArtifact_evidenceSourceId_idx ON NotionEvidenceArtifact(evidenceSourceId);
    CREATE INDEX NotionEvidenceArtifact_validationStatus_idx ON NotionEvidenceArtifact(validationStatus);
    CREATE INDEX NotionEvidenceArtifact_evidenceHealth_idx ON NotionEvidenceArtifact(evidenceHealth);

    CREATE TABLE SecretsConnection (
      id TEXT PRIMARY KEY NOT NULL,
      connectionId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      sourceSystem TEXT NOT NULL,
      status TEXT NOT NULL,
      lastScan DATETIME,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT SecretsConnection_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX SecretsConnection_aiSystemId_idx ON SecretsConnection(aiSystemId);
    CREATE INDEX SecretsConnection_sourceSystem_idx ON SecretsConnection(sourceSystem);
    CREATE INDEX SecretsConnection_status_idx ON SecretsConnection(status);

    CREATE TABLE SecretEvidenceArtifact (
      id TEXT PRIMARY KEY NOT NULL,
      artifactId TEXT NOT NULL UNIQUE,
      secretsConnectionId TEXT NOT NULL,
      evidenceSourceId TEXT,
      evidenceType TEXT NOT NULL,
      title TEXT NOT NULL,
      source TEXT NOT NULL,
      environment TEXT NOT NULL,
      collectionTimestamp DATETIME NOT NULL,
      hash TEXT NOT NULL,
      validationStatus TEXT NOT NULL,
      evidenceHealth TEXT NOT NULL,
      secretInventory TEXT NOT NULL,
      rotationEvidence TEXT NOT NULL,
      ownershipEvidence TEXT NOT NULL,
      usageMapping TEXT NOT NULL,
      plaintextProhibition TEXT NOT NULL,
      collectionMethod TEXT NOT NULL,
      provenance TEXT NOT NULL,
      relatedControlsJson TEXT NOT NULL,
      evidenceSummary TEXT NOT NULL,
      collectionReason TEXT NOT NULL,
      assuranceSummary TEXT NOT NULL,
      failureCondition TEXT NOT NULL,
      warningReason TEXT NOT NULL,
      evidenceUsed TEXT NOT NULL,
      controlImpact TEXT NOT NULL,
      recommendedAction TEXT NOT NULL,
      sourceGap TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT SecretEvidenceArtifact_secretsConnectionId_fkey FOREIGN KEY (secretsConnectionId) REFERENCES SecretsConnection (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT SecretEvidenceArtifact_evidenceSourceId_fkey FOREIGN KEY (evidenceSourceId) REFERENCES EvidenceSource (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX SecretEvidenceArtifact_secretsConnectionId_idx ON SecretEvidenceArtifact(secretsConnectionId);
    CREATE INDEX SecretEvidenceArtifact_evidenceSourceId_idx ON SecretEvidenceArtifact(evidenceSourceId);
    CREATE INDEX SecretEvidenceArtifact_validationStatus_idx ON SecretEvidenceArtifact(validationStatus);
    CREATE INDEX SecretEvidenceArtifact_evidenceHealth_idx ON SecretEvidenceArtifact(evidenceHealth);

    CREATE TABLE EvidenceArtifact (
      id TEXT PRIMARY KEY NOT NULL,
      artifactId TEXT NOT NULL UNIQUE,
      sourceId TEXT NOT NULL,
      artifactType TEXT NOT NULL,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      content TEXT NOT NULL,
      version TEXT NOT NULL,
      artifactHash TEXT NOT NULL,
      commitSha TEXT NOT NULL,
      sourceUrl TEXT NOT NULL,
      repositoryConnectionId TEXT,
      lastCollected DATETIME NOT NULL,
      validationStatus TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT EvidenceArtifact_sourceId_fkey FOREIGN KEY (sourceId) REFERENCES EvidenceSource (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT EvidenceArtifact_repositoryConnectionId_fkey FOREIGN KEY (repositoryConnectionId) REFERENCES RepositoryConnection (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE INDEX EvidenceArtifact_sourceId_idx ON EvidenceArtifact(sourceId);
    CREATE INDEX EvidenceArtifact_repositoryConnectionId_idx ON EvidenceArtifact(repositoryConnectionId);

    CREATE TABLE EvidenceSnapshot (
      id TEXT PRIMARY KEY NOT NULL,
      snapshotId TEXT NOT NULL UNIQUE,
      evidenceArtifactId TEXT NOT NULL,
      content TEXT NOT NULL,
      artifactHash TEXT NOT NULL,
      commitSha TEXT NOT NULL,
      version TEXT NOT NULL,
      sourceUrl TEXT NOT NULL,
      collectionMethod TEXT NOT NULL,
      collectedAt DATETIME NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT EvidenceSnapshot_evidenceArtifactId_fkey FOREIGN KEY (evidenceArtifactId) REFERENCES EvidenceArtifact (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX EvidenceSnapshot_evidenceArtifactId_idx ON EvidenceSnapshot(evidenceArtifactId);

    CREATE TABLE AssuranceRule (
      id TEXT PRIMARY KEY NOT NULL,
      ruleId TEXT NOT NULL UNIQUE,
      evidenceArtifactId TEXT NOT NULL,
      artifactType TEXT NOT NULL,
      controlId TEXT NOT NULL,
      validationRule TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      resultSummary TEXT NOT NULL,
      missingElement TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT AssuranceRule_evidenceArtifactId_fkey FOREIGN KEY (evidenceArtifactId) REFERENCES EvidenceArtifact (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX AssuranceRule_evidenceArtifactId_idx ON AssuranceRule(evidenceArtifactId);
    CREATE INDEX AssuranceRule_controlId_idx ON AssuranceRule(controlId);
    CREATE INDEX AssuranceRule_status_idx ON AssuranceRule(status);

    CREATE TABLE AssuranceExplanation (
      id TEXT PRIMARY KEY NOT NULL,
      assuranceRuleId TEXT NOT NULL UNIQUE,
      result TEXT NOT NULL,
      reason TEXT NOT NULL,
      supportingEvidence TEXT NOT NULL,
      supportingArtifacts TEXT NOT NULL,
      validationChecks TEXT NOT NULL,
      supportingControls TEXT NOT NULL,
      missingRequirements TEXT NOT NULL,
      failureConditions TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT AssuranceExplanation_assuranceRuleId_fkey FOREIGN KEY (assuranceRuleId) REFERENCES AssuranceRule (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE GovernanceStory (
      id TEXT PRIMARY KEY NOT NULL,
      controlId TEXT NOT NULL UNIQUE,
      riskStatement TEXT NOT NULL,
      controlObjective TEXT NOT NULL,
      evidenceNarrative TEXT NOT NULL,
      validationNarrative TEXT NOT NULL,
      monitoringNarrative TEXT NOT NULL,
      failureScenario TEXT NOT NULL,
      ownerNarrative TEXT NOT NULL,
      executiveSummary TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT GovernanceStory_controlId_fkey FOREIGN KEY (controlId) REFERENCES Control (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE ArtifactDriftEvent (
      id TEXT PRIMARY KEY NOT NULL,
      driftId TEXT NOT NULL UNIQUE,
      repositoryConnectionId TEXT NOT NULL,
      artifactId TEXT NOT NULL,
      artifactType TEXT NOT NULL,
      eventType TEXT NOT NULL,
      path TEXT NOT NULL,
      previousHash TEXT NOT NULL,
      currentHash TEXT NOT NULL,
      detectedAt DATETIME NOT NULL,
      summary TEXT NOT NULL,
      CONSTRAINT ArtifactDriftEvent_repositoryConnectionId_fkey FOREIGN KEY (repositoryConnectionId) REFERENCES RepositoryConnection (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX ArtifactDriftEvent_repositoryConnectionId_idx ON ArtifactDriftEvent(repositoryConnectionId);

    CREATE TABLE DeploymentDriftEvent (
      id TEXT PRIMARY KEY NOT NULL,
      driftId TEXT NOT NULL UNIQUE,
      portainerConnectionId TEXT NOT NULL,
      deploymentEvidenceArtifactId TEXT NOT NULL,
      eventType TEXT NOT NULL,
      previousValue TEXT NOT NULL,
      currentValue TEXT NOT NULL,
      detectedAt DATETIME NOT NULL,
      summary TEXT NOT NULL,
      status TEXT NOT NULL,
      CONSTRAINT DeploymentDriftEvent_portainerConnectionId_fkey FOREIGN KEY (portainerConnectionId) REFERENCES PortainerConnection (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT DeploymentDriftEvent_deploymentEvidenceArtifactId_fkey FOREIGN KEY (deploymentEvidenceArtifactId) REFERENCES DeploymentEvidenceArtifact (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX DeploymentDriftEvent_portainerConnectionId_idx ON DeploymentDriftEvent(portainerConnectionId);
    CREATE INDEX DeploymentDriftEvent_deploymentEvidenceArtifactId_idx ON DeploymentDriftEvent(deploymentEvidenceArtifactId);
    CREATE INDEX DeploymentDriftEvent_eventType_idx ON DeploymentDriftEvent(eventType);

    CREATE TABLE RiskAssessment (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL UNIQUE,
      score INTEGER NOT NULL,
      customerImpact TEXT NOT NULL,
      financialImpact TEXT NOT NULL,
      privacyImpact TEXT NOT NULL,
      operationalImpact TEXT NOT NULL,
      regulatoryImpact TEXT NOT NULL,
      autonomyLevel TEXT NOT NULL,
      thirdPartyDependency TEXT NOT NULL,
      dataSensitivity TEXT NOT NULL,
      explainabilityNeed TEXT NOT NULL,
      hallucinationRisk TEXT NOT NULL,
      promptInjectionRisk TEXT NOT NULL,
      modelDriftRisk TEXT NOT NULL,
      toolMisuseRisk TEXT NOT NULL,
      autonomyRisk TEXT NOT NULL,
      explainabilityRisk TEXT NOT NULL,
      uncontrolledAgentActions TEXT NOT NULL,
      delegatedAuthorityRisk TEXT NOT NULL,
      toolAbuseRisk TEXT NOT NULL,
      approvalBypassRisk TEXT NOT NULL,
      runawayAutomationRisk TEXT NOT NULL,
      overallRiskTier TEXT NOT NULL,
      rationale TEXT NOT NULL,
      factorsJson TEXT NOT NULL,
      assessedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT RiskAssessment_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE AiRisk (
      id TEXT PRIMARY KEY NOT NULL,
      riskId TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      aiSystemId TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL,
      createdDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewDate DATETIME NOT NULL,
      inherentLikelihood TEXT NOT NULL,
      inherentImpact TEXT NOT NULL,
      inherentRating TEXT NOT NULL,
      residualLikelihood TEXT NOT NULL,
      residualImpact TEXT NOT NULL,
      residualRating TEXT NOT NULL,
      treatment TEXT NOT NULL,
      treatmentPlan TEXT NOT NULL,
      residualRiskLogic TEXT NOT NULL,
      acceptanceApprover TEXT,
      acceptanceApprovalDate DATETIME,
      acceptanceExpirationDate DATETIME,
      acceptanceRationale TEXT,
      CONSTRAINT AiRisk_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE AiLifecycle (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL,
      lifecycleStage TEXT NOT NULL,
      stageOwner TEXT NOT NULL,
      stageEntryDate DATETIME NOT NULL,
      stageExitDate DATETIME,
      approvalStatus TEXT NOT NULL,
      notes TEXT NOT NULL,
      CONSTRAINT AiLifecycle_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX AiLifecycle_aiSystemId_lifecycleStage_stageEntryDate_key ON AiLifecycle(aiSystemId, lifecycleStage, stageEntryDate);

    CREATE TABLE AiLifecycleApproval (
      id TEXT PRIMARY KEY NOT NULL,
      approvalId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      approvalType TEXT NOT NULL,
      approver TEXT NOT NULL,
      status TEXT NOT NULL,
      approvalDate DATETIME,
      comments TEXT NOT NULL,
      CONSTRAINT AiLifecycleApproval_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE AiModel (
      id TEXT PRIMARY KEY NOT NULL,
      modelId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      version TEXT NOT NULL,
      modelType TEXT NOT NULL,
      purpose TEXT NOT NULL,
      fallbackModel TEXT,
      validationStatus TEXT NOT NULL,
      validationDate DATETIME,
      owner TEXT NOT NULL,
      lifecycleStatus TEXT NOT NULL,
      CONSTRAINT AiModel_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE PromptAsset (
      id TEXT PRIMARY KEY NOT NULL,
      promptId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      version TEXT NOT NULL,
      owner TEXT NOT NULL,
      approvalStatus TEXT NOT NULL,
      approvedBy TEXT,
      approvalDate DATETIME,
      lastModified DATETIME NOT NULL,
      CONSTRAINT PromptAsset_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE PromptVersion (
      id TEXT PRIMARY KEY NOT NULL,
      promptAssetId TEXT NOT NULL,
      version TEXT NOT NULL,
      changeSummary TEXT NOT NULL,
      modifiedBy TEXT NOT NULL,
      modifiedAt DATETIME NOT NULL,
      CONSTRAINT PromptVersion_promptAssetId_fkey FOREIGN KEY (promptAssetId) REFERENCES PromptAsset (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE Agent (
      id TEXT PRIMARY KEY NOT NULL,
      agentId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      owner TEXT NOT NULL,
      purpose TEXT NOT NULL,
      riskLevel TEXT NOT NULL,
      lifecycleStatus TEXT NOT NULL,
      agenticLevel INTEGER NOT NULL,
      agenticLevelName TEXT NOT NULL,
      CONSTRAINT Agent_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE DelegatedAuthority (
      id TEXT PRIMARY KEY NOT NULL,
      authorityLevel INTEGER NOT NULL UNIQUE,
      authorityDescription TEXT NOT NULL,
      approvalRequired BOOLEAN NOT NULL,
      maximumImpact TEXT NOT NULL,
      escalationPath TEXT NOT NULL
    );

    CREATE TABLE AiSystemAuthority (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL UNIQUE,
      delegatedAuthorityId TEXT NOT NULL,
      notes TEXT NOT NULL,
      CONSTRAINT AiSystemAuthority_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT AiSystemAuthority_delegatedAuthorityId_fkey FOREIGN KEY (delegatedAuthorityId) REFERENCES DelegatedAuthority (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE ToolPermission (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL,
      toolName TEXT NOT NULL,
      permissionType TEXT NOT NULL,
      approved BOOLEAN NOT NULL,
      owner TEXT NOT NULL,
      rationale TEXT NOT NULL,
      CONSTRAINT ToolPermission_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE HumanOversight (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL UNIQUE,
      oversightRequired BOOLEAN NOT NULL,
      oversightType TEXT NOT NULL,
      reviewPoint TEXT NOT NULL,
      escalationPath TEXT NOT NULL,
      owner TEXT NOT NULL,
      CONSTRAINT HumanOversight_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE GovernedTool (
      id TEXT PRIMARY KEY NOT NULL,
      toolId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      riskLevel TEXT NOT NULL,
      permissionType TEXT NOT NULL,
      owner TEXT NOT NULL,
      reviewDate DATETIME NOT NULL,
      nextReviewDate DATETIME NOT NULL,
      CONSTRAINT GovernedTool_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE AgentAction (
      id TEXT PRIMARY KEY NOT NULL,
      actionId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      riskLevel TEXT NOT NULL,
      approvalRequirement TEXT NOT NULL,
      CONSTRAINT AgentAction_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE ApprovalWorkflow (
      id TEXT PRIMARY KEY NOT NULL,
      workflowId TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      approvalLevel TEXT NOT NULL,
      approverRole TEXT NOT NULL,
      escalationPath TEXT NOT NULL
    );

    CREATE TABLE ExecutionLog (
      id TEXT PRIMARY KEY NOT NULL,
      executionId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      agentId TEXT NOT NULL,
      toolId TEXT NOT NULL,
      actionId TEXT NOT NULL,
      approvalWorkflowId TEXT,
      outcome TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      initiatedBy TEXT NOT NULL,
      approvalReference TEXT,
      CONSTRAINT ExecutionLog_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT ExecutionLog_agentId_fkey FOREIGN KEY (agentId) REFERENCES Agent (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT ExecutionLog_toolId_fkey FOREIGN KEY (toolId) REFERENCES GovernedTool (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT ExecutionLog_actionId_fkey FOREIGN KEY (actionId) REFERENCES AgentAction (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT ExecutionLog_approvalWorkflowId_fkey FOREIGN KEY (approvalWorkflowId) REFERENCES ApprovalWorkflow (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE KillSwitch (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL UNIQUE,
      enabled BOOLEAN NOT NULL,
      owner TEXT NOT NULL,
      lastTested DATETIME,
      status TEXT NOT NULL,
      CONSTRAINT KillSwitch_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE AiSystemComponent (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      description TEXT NOT NULL,
      criticality TEXT NOT NULL,
      CONSTRAINT AiSystemComponent_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE Control (
      id TEXT PRIMARY KEY NOT NULL,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      ownerRole TEXT NOT NULL,
      testingFrequency TEXT NOT NULL
    );

    CREATE TABLE AiRiskControl (
      id TEXT PRIMARY KEY NOT NULL,
      aiRiskId TEXT NOT NULL,
      controlId TEXT NOT NULL,
      CONSTRAINT AiRiskControl_aiRiskId_fkey FOREIGN KEY (aiRiskId) REFERENCES AiRisk (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT AiRiskControl_controlId_fkey FOREIGN KEY (controlId) REFERENCES Control (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX AiRiskControl_aiRiskId_controlId_key ON AiRiskControl(aiRiskId, controlId);

    CREATE TABLE Regulation (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      regulator TEXT NOT NULL,
      description TEXT NOT NULL,
      whyItMatters TEXT NOT NULL,
      audience TEXT NOT NULL,
      status TEXT NOT NULL,
      effectiveDate DATETIME NOT NULL
    );

    CREATE TABLE RegulatoryRequirement (
      id TEXT PRIMARY KEY NOT NULL,
      regulationId TEXT NOT NULL,
      referenceId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      rationale TEXT NOT NULL,
      evidenceExamples TEXT NOT NULL,
      CONSTRAINT RegulatoryRequirement_regulationId_fkey FOREIGN KEY (regulationId) REFERENCES Regulation (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX RegulatoryRequirement_regulationId_referenceId_key ON RegulatoryRequirement(regulationId, referenceId);

    CREATE TABLE RegulatoryControl (
      id TEXT PRIMARY KEY NOT NULL,
      regulationId TEXT NOT NULL,
      controlId TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      objective TEXT NOT NULL,
      testingApproach TEXT NOT NULL,
      evidenceRequired TEXT NOT NULL,
      CONSTRAINT RegulatoryControl_regulationId_fkey FOREIGN KEY (regulationId) REFERENCES Regulation (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE RequirementControl (
      id TEXT PRIMARY KEY NOT NULL,
      requirementId TEXT NOT NULL,
      regulatoryControlId TEXT NOT NULL,
      CONSTRAINT RequirementControl_requirementId_fkey FOREIGN KEY (requirementId) REFERENCES RegulatoryRequirement (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT RequirementControl_regulatoryControlId_fkey FOREIGN KEY (regulatoryControlId) REFERENCES RegulatoryControl (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX RequirementControl_requirementId_regulatoryControlId_key ON RequirementControl(requirementId, regulatoryControlId);

    CREATE TABLE AiSystemRegulatoryControl (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL,
      regulatoryControlId TEXT NOT NULL,
      auditStatus TEXT NOT NULL,
      notes TEXT NOT NULL,
      CONSTRAINT AiSystemRegulatoryControl_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT AiSystemRegulatoryControl_regulatoryControlId_fkey FOREIGN KEY (regulatoryControlId) REFERENCES RegulatoryControl (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX AiSystemRegulatoryControl_aiSystemId_regulatoryControlId_key ON AiSystemRegulatoryControl(aiSystemId, regulatoryControlId);

    CREATE TABLE RegulatoryMapping (
      id TEXT PRIMARY KEY NOT NULL,
      framework TEXT NOT NULL,
      obligation TEXT NOT NULL,
      citation TEXT NOT NULL,
      controlId TEXT NOT NULL,
      CONSTRAINT RegulatoryMapping_controlId_fkey FOREIGN KEY (controlId) REFERENCES Control (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE SystemControl (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL,
      controlId TEXT NOT NULL,
      auditStatus TEXT NOT NULL,
      notes TEXT NOT NULL,
      CONSTRAINT SystemControl_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT SystemControl_controlId_fkey FOREIGN KEY (controlId) REFERENCES Control (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX SystemControl_aiSystemId_controlId_key ON SystemControl(aiSystemId, controlId);

    CREATE TABLE EvidenceItem (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL,
      regulatoryControlId TEXT,
      title TEXT NOT NULL,
      controlCode TEXT NOT NULL,
      status TEXT NOT NULL,
      owner TEXT NOT NULL,
      dueDate DATETIME NOT NULL,
      lastReviewedAt DATETIME,
      location TEXT NOT NULL,
      CONSTRAINT EvidenceItem_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT EvidenceItem_regulatoryControlId_fkey FOREIGN KEY (regulatoryControlId) REFERENCES RegulatoryControl (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE EvidenceType (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL
    );

    CREATE TABLE EvidenceRequirement (
      id TEXT PRIMARY KEY NOT NULL,
      requirementId TEXT NOT NULL UNIQUE,
      controlId TEXT NOT NULL,
      regulatoryControlId TEXT,
      evidenceType TEXT NOT NULL,
      mandatory BOOLEAN NOT NULL,
      rationale TEXT NOT NULL,
      CONSTRAINT EvidenceRequirement_regulatoryControlId_fkey FOREIGN KEY (regulatoryControlId) REFERENCES RegulatoryControl (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE EvidenceObject (
      id TEXT PRIMARY KEY NOT NULL,
      evidenceId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      evidenceType TEXT NOT NULL,
      version TEXT NOT NULL,
      status TEXT NOT NULL,
      owner TEXT NOT NULL,
      reviewer TEXT NOT NULL,
      source TEXT NOT NULL,
      approvalDate DATETIME,
      expirationDate DATETIME NOT NULL,
      createdDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      lastUpdated DATETIME NOT NULL,
      CONSTRAINT EvidenceObject_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE EvidenceObjectRequirement (
      id TEXT PRIMARY KEY NOT NULL,
      evidenceObjectId TEXT NOT NULL,
      evidenceRequirementId TEXT NOT NULL,
      CONSTRAINT EvidenceObjectRequirement_evidenceObjectId_fkey FOREIGN KEY (evidenceObjectId) REFERENCES EvidenceObject (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT EvidenceObjectRequirement_evidenceRequirementId_fkey FOREIGN KEY (evidenceRequirementId) REFERENCES EvidenceRequirement (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX EvidenceObjectRequirement_evidenceObjectId_evidenceRequirementId_key ON EvidenceObjectRequirement(evidenceObjectId, evidenceRequirementId);

    CREATE TABLE AiRiskEvidence (
      id TEXT PRIMARY KEY NOT NULL,
      aiRiskId TEXT NOT NULL,
      evidenceObjectId TEXT NOT NULL,
      CONSTRAINT AiRiskEvidence_aiRiskId_fkey FOREIGN KEY (aiRiskId) REFERENCES AiRisk (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT AiRiskEvidence_evidenceObjectId_fkey FOREIGN KEY (evidenceObjectId) REFERENCES EvidenceObject (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX AiRiskEvidence_aiRiskId_evidenceObjectId_key ON AiRiskEvidence(aiRiskId, evidenceObjectId);

    CREATE TABLE EvidenceHealth (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL,
      evidenceRequirementId TEXT NOT NULL,
      health TEXT NOT NULL,
      validation TEXT NOT NULL,
      rationale TEXT NOT NULL,
      calculatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT EvidenceHealth_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT EvidenceHealth_evidenceRequirementId_fkey FOREIGN KEY (evidenceRequirementId) REFERENCES EvidenceRequirement (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX EvidenceHealth_aiSystemId_evidenceRequirementId_key ON EvidenceHealth(aiSystemId, evidenceRequirementId);

    CREATE TABLE AuditPackage (
      id TEXT PRIMARY KEY NOT NULL,
      packageId TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      scope TEXT NOT NULL,
      packageType TEXT NOT NULL,
      owner TEXT NOT NULL,
      aiSystemId TEXT,
      generatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT AuditPackage_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE AuditPackageEvidence (
      id TEXT PRIMARY KEY NOT NULL,
      auditPackageId TEXT NOT NULL,
      evidenceObjectId TEXT NOT NULL,
      CONSTRAINT AuditPackageEvidence_auditPackageId_fkey FOREIGN KEY (auditPackageId) REFERENCES AuditPackage (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT AuditPackageEvidence_evidenceObjectId_fkey FOREIGN KEY (evidenceObjectId) REFERENCES EvidenceObject (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX AuditPackageEvidence_auditPackageId_evidenceObjectId_key ON AuditPackageEvidence(auditPackageId, evidenceObjectId);

    CREATE TABLE AuditEvent (
      id TEXT PRIMARY KEY NOT NULL,
      aiSystemId TEXT NOT NULL,
      eventType TEXT NOT NULL,
      summary TEXT NOT NULL,
      actor TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT AuditEvent_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE ControlTest (
      id TEXT PRIMARY KEY NOT NULL,
      testId TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      traditionalGovernanceConcept TEXT NOT NULL,
      aiGovernanceInterpretation TEXT NOT NULL,
      whyItMatters TEXT NOT NULL,
      severityIfFailed TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE TestRun (
      id TEXT PRIMARY KEY NOT NULL,
      controlTestId TEXT NOT NULL,
      aiSystemId TEXT NOT NULL,
      executionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      result TEXT NOT NULL,
      resultDetails TEXT NOT NULL,
      evidenceReference TEXT NOT NULL,
      CONSTRAINT TestRun_controlTestId_fkey FOREIGN KEY (controlTestId) REFERENCES ControlTest (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT TestRun_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE Finding (
      id TEXT PRIMARY KEY NOT NULL,
      findingId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      controlTestId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      createdDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      remediationTargetDate DATETIME NOT NULL,
      owner TEXT NOT NULL,
      CONSTRAINT Finding_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT Finding_controlTestId_fkey FOREIGN KEY (controlTestId) REFERENCES ControlTest (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE Exception (
      id TEXT PRIMARY KEY NOT NULL,
      exceptionId TEXT NOT NULL UNIQUE,
      findingId TEXT NOT NULL,
      rationale TEXT NOT NULL,
      approvedBy TEXT NOT NULL,
      approvalDate DATETIME NOT NULL,
      expirationDate DATETIME NOT NULL,
      CONSTRAINT Exception_findingId_fkey FOREIGN KEY (findingId) REFERENCES Finding (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE AiRiskFinding (
      id TEXT PRIMARY KEY NOT NULL,
      aiRiskId TEXT NOT NULL,
      findingId TEXT NOT NULL,
      CONSTRAINT AiRiskFinding_aiRiskId_fkey FOREIGN KEY (aiRiskId) REFERENCES AiRisk (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT AiRiskFinding_findingId_fkey FOREIGN KEY (findingId) REFERENCES Finding (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX AiRiskFinding_aiRiskId_findingId_key ON AiRiskFinding(aiRiskId, findingId);

    CREATE TABLE ControlImplementation (
      id TEXT PRIMARY KEY NOT NULL,
      implementationId TEXT NOT NULL UNIQUE,
      aiSystemId TEXT NOT NULL,
      controlId TEXT NOT NULL,
      implementationType TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      owner TEXT NOT NULL,
      implementationLocation TEXT NOT NULL,
      validationMethod TEXT NOT NULL,
      status TEXT NOT NULL,
      CONSTRAINT ControlImplementation_aiSystemId_fkey FOREIGN KEY (aiSystemId) REFERENCES AiSystem (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT ControlImplementation_controlId_fkey FOREIGN KEY (controlId) REFERENCES Control (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE ControlImplementationControl (
      id TEXT PRIMARY KEY NOT NULL,
      controlImplementationId TEXT NOT NULL,
      controlId TEXT NOT NULL,
      CONSTRAINT ControlImplementationControl_controlImplementationId_fkey FOREIGN KEY (controlImplementationId) REFERENCES ControlImplementation (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT ControlImplementationControl_controlId_fkey FOREIGN KEY (controlId) REFERENCES Control (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX ControlImplementationControl_controlImplementationId_controlId_key ON ControlImplementationControl(controlImplementationId, controlId);

    CREATE TABLE ImplementationEvidence (
      id TEXT PRIMARY KEY NOT NULL,
      evidenceId TEXT NOT NULL UNIQUE,
      implementationId TEXT NOT NULL,
      evidenceType TEXT NOT NULL,
      location TEXT NOT NULL,
      owner TEXT NOT NULL,
      validationDate DATETIME,
      CONSTRAINT ImplementationEvidence_implementationId_fkey FOREIGN KEY (implementationId) REFERENCES ControlImplementation (id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await db.close();
  console.log(`SQLite AI System Registry initialized at ${dbPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
