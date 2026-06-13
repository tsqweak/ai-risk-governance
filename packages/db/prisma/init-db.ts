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
  `);

  await db.close();
  console.log(`SQLite AI System Registry initialized at ${dbPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
