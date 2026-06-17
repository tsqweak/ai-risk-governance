import {
  AuditStatus,
  ComponentType,
  DataClassification,
  EvidenceHealthValue,
  EvidenceObjectStatus,
  EvidenceValidationValue,
  FindingSeverity,
  FindingStatus,
  ModelValidationStatus,
  PromptApprovalStatus,
  PrismaClient,
  RiskLevel,
  TestResult
} from "@prisma/client";

export const controlTestDefinitions = [
  {
    testId: "CCM-001",
    title: "Business Owner Assigned",
    description: "Confirms every AI system has an accountable business owner.",
    traditionalGovernanceConcept: "Business ownership and process accountability.",
    aiGovernanceInterpretation: "The business owner is accountable for the purpose, customer outcome, and acceptable use of the AI system.",
    whyItMatters: "Without a business owner, AI can become a technology artifact with no accountable decision-maker for outcomes.",
    severityIfFailed: FindingSeverity.HIGH
  },
  {
    testId: "CCM-002",
    title: "Technology Owner Assigned",
    description: "Confirms every AI system has a named technology owner.",
    traditionalGovernanceConcept: "Technology service ownership.",
    aiGovernanceInterpretation: "The technology owner is accountable for system design, deployment, reliability, and operational support.",
    whyItMatters: "AI controls fail operationally when no one owns architecture, release, monitoring, and incident response.",
    severityIfFailed: FindingSeverity.HIGH
  },
  {
    testId: "CCM-003",
    title: "Risk Owner Assigned",
    description: "Confirms every AI system has a risk owner.",
    traditionalGovernanceConcept: "Second-line risk ownership and challenge.",
    aiGovernanceInterpretation: "The risk owner oversees risk tiering, control expectations, exceptions, and regulatory posture.",
    whyItMatters: "A risk owner keeps AI risk decisions visible to governance, audit, and regulators.",
    severityIfFailed: FindingSeverity.HIGH
  },
  {
    testId: "CCM-004",
    title: "Risk Assessment Exists",
    description: "Confirms a multi-dimensional risk assessment exists.",
    traditionalGovernanceConcept: "Risk assessment and inherent risk classification.",
    aiGovernanceInterpretation: "AI systems need dimensional risk scoring across privacy, autonomy, regulation, operations, explainability, and customer impact.",
    whyItMatters: "Without risk tiering, review depth and evidence expectations are arbitrary.",
    severityIfFailed: FindingSeverity.HIGH
  },
  {
    testId: "CCM-005",
    title: "Review Current",
    description: "Confirms the next review date has not passed.",
    traditionalGovernanceConcept: "Periodic control and risk review.",
    aiGovernanceInterpretation: "AI systems need current review because data, prompts, vendors, model behavior, and regulatory expectations change.",
    whyItMatters: "Stale reviews can hide drift, control gaps, and outdated risk acceptance.",
    severityIfFailed: FindingSeverity.MEDIUM
  },
  {
    testId: "CCM-006",
    title: "Regulatory Mapping Exists",
    description: "Confirms the AI system is linked to regulation-specific controls.",
    traditionalGovernanceConcept: "Obligation-to-control mapping.",
    aiGovernanceInterpretation: "Regulatory expectations should trace to concrete AI controls and mapped systems.",
    whyItMatters: "Regulators and auditors need proof that obligations are not merely documented but applied to systems.",
    severityIfFailed: FindingSeverity.HIGH
  },
  {
    testId: "CCM-007",
    title: "Evidence Exists",
    description: "Confirms evidence records exist for the AI system.",
    traditionalGovernanceConcept: "Control evidence retention.",
    aiGovernanceInterpretation: "AI governance evidence includes approvals, model assessments, data inventories, oversight procedures, monitoring outputs, and access reviews.",
    whyItMatters: "A control without evidence is difficult to defend in audit or examination.",
    severityIfFailed: FindingSeverity.MEDIUM
  },
  {
    testId: "CCM-008",
    title: "Human Oversight Defined",
    description: "Confirms human oversight controls are mapped and not blocked.",
    traditionalGovernanceConcept: "Manual review, escalation, and compensating controls.",
    aiGovernanceInterpretation: "AI systems need defined human review, escalation, and intervention points, especially for customer-facing or autonomous use.",
    whyItMatters: "Human oversight helps prevent unmanaged customer harm and supports accountability.",
    severityIfFailed: FindingSeverity.HIGH
  },
  {
    testId: "CCM-009",
    title: "Data Classification Assigned",
    description: "Confirms a data classification is assigned.",
    traditionalGovernanceConcept: "Information classification and data handling.",
    aiGovernanceInterpretation: "AI systems need clear data sensitivity so privacy, access, retention, and model governance controls scale with risk.",
    whyItMatters: "Unknown data sensitivity creates blind spots in privacy and security control design.",
    severityIfFailed: FindingSeverity.MEDIUM
  },
  {
    testId: "CCM-010",
    title: "Vendor Inventory Exists",
    description: "Confirms third-party-dependent AI systems include vendor components.",
    traditionalGovernanceConcept: "Third-party and outsourcing inventory.",
    aiGovernanceInterpretation: "AI systems using external providers need vendor inventory, due diligence, contract coverage, and exit planning.",
    whyItMatters: "Uninventoried vendors can create data, resilience, concentration, and compliance risk.",
    severityIfFailed: FindingSeverity.MEDIUM
  },
  {
    testId: "CCM-011",
    title: "AI Governance Profile Complete",
    description: "Confirms AI-specific governance records exist for models, prompts, agents, authority, tools, oversight, and AI risk domains.",
    traditionalGovernanceConcept: "Application configuration, access rights, delegated authority, and operational ownership.",
    aiGovernanceInterpretation: "AI systems need explicit governance over models, prompts, agents, tool permissions, autonomy boundaries, and human oversight.",
    whyItMatters: "AI governance breaks down when the bank knows the application but not the AI-specific assets and authorities inside it.",
    severityIfFailed: FindingSeverity.HIGH
  },
  {
    testId: "CCM-012",
    title: "Agentic Governance Controls Complete",
    description: "Confirms agentic AI systems have governed tools, action registry, approval workflows, execution logging, kill switch readiness, and agentic risk domains.",
    traditionalGovernanceConcept: "Access governance, delegated authority, approval evidence, activity logging, and operational resilience.",
    aiGovernanceInterpretation: "Agentic AI needs control over what actions can be taken, which tools can be used, who approves high-impact actions, and how execution is logged.",
    whyItMatters: "Autonomous or semi-autonomous agents can create real customer, financial, recordkeeping, and operational impact if authority and tool use are not bounded.",
    severityIfFailed: FindingSeverity.HIGH
  },
  {
    testId: "CCM-013",
    title: "AI Lifecycle Stage Gates Complete",
    description: "Confirms AI lifecycle stage approvals, gate controls, production authorization, and review currency are complete.",
    traditionalGovernanceConcept: "Project lifecycle governance, stage gates, release approval, and periodic review.",
    aiGovernanceInterpretation: "AI systems need governed movement from intake through development, testing, pilot, production, and retirement with evidence-backed approvals at each gate.",
    whyItMatters: "Lifecycle gaps can allow unapproved AI systems to advance to production, operate with stale reviews, or retire without preserving evidence and accountability.",
    severityIfFailed: FindingSeverity.HIGH
  },
  {
    testId: "CCM-014",
    title: "Governance Engineering Implemented",
    description: "Confirms governance controls are mapped to technical implementations, implementation evidence, monitoring methods, and validation status.",
    traditionalGovernanceConcept: "Control implementation traceability and operating effectiveness.",
    aiGovernanceInterpretation: "AI controls need demonstrable technical implementation such as policy engines, approval gates, logging, access enforcement, monitoring, and kill switches.",
    whyItMatters: "A control objective is not enough for audit or supervision unless the platform can show how the control is implemented, evidenced, monitored, and validated.",
    severityIfFailed: FindingSeverity.HIGH
  }
] as const;

type TestDefinition = (typeof controlTestDefinitions)[number];

export async function seedControlTests(prisma: PrismaClient) {
  for (const definition of controlTestDefinitions) {
    await prisma.controlTest.upsert({
      where: { testId: definition.testId },
      update: { ...definition, enabled: true },
      create: { ...definition, enabled: true }
    });
  }
}

export async function runMonitoring(prisma: PrismaClient, executionDate = new Date()) {
  const tests = await prisma.controlTest.findMany({
    where: { enabled: true },
    orderBy: { testId: "asc" }
  });
  const systems = await prisma.aiSystem.findMany({
    include: {
      assessment: true,
      evidenceItems: true,
      evidenceObjects: { include: { requirementLinks: true } },
      evidenceHealth: { include: { evidenceRequirement: true } },
      systemControls: { include: { control: true } },
      regulatoryControls: true,
      components: true,
      aiModels: true,
      promptAssets: true,
      agents: true,
      authorityAssignment: { include: { delegatedAuthority: true } },
      toolPermissions: true,
      humanOversight: true,
      governedTools: true,
      agentActions: true,
      executionLogs: { include: { action: true, approvalWorkflow: true } },
      killSwitch: true,
      lifecycleRecords: true,
      lifecycleApprovals: true,
      controlImplementations: {
        include: {
          primaryControl: true,
          controlLinks: { include: { control: true } },
          evidence: true
        }
      }
    },
    orderBy: { name: "asc" }
  });

  const createdRuns = [];
  const generatedFindings = [];

  for (const system of systems) {
    for (const test of tests) {
      const evaluation = evaluate(test.testId, system, executionDate);
      const run = await prisma.testRun.create({
        data: {
          controlTestId: test.id,
          aiSystemId: system.id,
          executionDate,
          result: evaluation.result,
          resultDetails: evaluation.resultDetails,
          evidenceReference: evaluation.evidenceReference
        }
      });
      createdRuns.push(run);

      if (evaluation.result === TestResult.FAIL) {
        const finding = await prisma.finding.create({
          data: {
            findingId: `${test.testId}-${system.slug}-${executionDate.toISOString().slice(0, 10)}`,
            aiSystemId: system.id,
            controlTestId: test.id,
            title: `${test.title} failed for ${system.name}`,
            description: evaluation.resultDetails,
            severity: evaluation.severity ?? test.severityIfFailed,
            status: FindingStatus.OPEN,
            createdDate: executionDate,
            remediationTargetDate: addDays(executionDate, remediationDays(test.severityIfFailed)),
            owner: system.riskOwner || system.businessOwner || "Unassigned"
          }
        });
        generatedFindings.push(finding);
      }
    }
  }

  return { createdRuns, generatedFindings };
}

export async function calculateEvidenceHealth(prisma: PrismaClient, calculatedAt = new Date()) {
  await prisma.evidenceHealth.deleteMany();

  const [systems, requirements] = await Promise.all([
    prisma.aiSystem.findMany({
      include: {
        evidenceObjects: {
          include: { requirementLinks: true }
        },
        regulatoryControls: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.evidenceRequirement.findMany({ orderBy: { requirementId: "asc" } })
  ]);

  const records = [];
  for (const system of systems) {
    const applicableRequirements = requirements.filter((requirement) =>
      system.regulatoryControls.some((mapping) => mapping.regulatoryControlId === requirement.regulatoryControlId)
    );

    for (const requirement of applicableRequirements) {
      const evidence = system.evidenceObjects.filter((object) =>
        object.requirementLinks.some((link) => link.evidenceRequirementId === requirement.id)
      );
      const evaluation = evaluateEvidenceRequirement(evidence, calculatedAt);
      records.push(await prisma.evidenceHealth.create({
        data: {
          aiSystemId: system.id,
          evidenceRequirementId: requirement.id,
          health: evaluation.health,
          validation: evaluation.validation,
          rationale: evaluation.rationale,
          calculatedAt
        }
      }));
    }
  }
  return records;
}

function evaluate(testId: string, system: MonitoringSystem, executionDate: Date) {
  switch (testId) {
    case "CCM-001":
      return hasText(system.businessOwner, "Business owner assigned.", "Business owner is missing.", "businessOwner");
    case "CCM-002":
      return hasText(system.technologyOwner, "Technology owner assigned.", "Technology owner is missing.", "technologyOwner");
    case "CCM-003":
      return hasText(system.riskOwner, "Risk owner assigned.", "Risk owner is missing.", "riskOwner");
    case "CCM-004":
      return system.assessment
        ? pass("Risk assessment exists.", `riskAssessment:${system.assessment.id}`)
        : fail("No risk assessment is linked to this AI system.", "riskAssessment:none");
    case "CCM-005":
      return system.nextReviewDate >= executionDate
        ? pass(`Next review is current: ${system.nextReviewDate.toISOString().slice(0, 10)}.`, `nextReviewDate:${system.nextReviewDate.toISOString()}`)
        : fail(`Next review date is overdue: ${system.nextReviewDate.toISOString().slice(0, 10)}.`, `nextReviewDate:${system.nextReviewDate.toISOString()}`);
    case "CCM-006":
      return system.regulatoryControls.length > 0
        ? pass(`${system.regulatoryControls.length} regulatory control mappings exist.`, `regulatoryMappings:${system.regulatoryControls.length}`)
        : fail("No regulation-specific controls are mapped to this AI system.", "regulatoryMappings:0");
    case "CCM-007":
      return evaluateEvidenceHealth(system);
    case "CCM-008": {
      const oversight = system.systemControls.filter((mapping) => mapping.control.category === "HUMAN_OVERSIGHT");
      if (oversight.some((mapping) => mapping.auditStatus === AuditStatus.ON_TRACK)) {
        return pass("Human oversight control is mapped and on track.", "controlCategory:HUMAN_OVERSIGHT");
      }
      return fail("No on-track human oversight control is mapped.", "controlCategory:HUMAN_OVERSIGHT");
    }
    case "CCM-009":
      return system.dataClassification && system.dataClassification !== DataClassification.PUBLIC
        ? pass(`Data classification assigned: ${system.dataClassification}.`, `dataClassification:${system.dataClassification}`)
        : warning(`Data classification is ${system.dataClassification}; confirm this is appropriate for AI use.`, `dataClassification:${system.dataClassification}`);
    case "CCM-010": {
      if (!system.externalThirdPartyDependency) {
        return pass("No external third-party dependency declared.", "thirdPartyDependency:false");
      }
      const vendors = system.components.filter((component) => component.type === ComponentType.VENDOR);
      return vendors.length > 0
        ? pass(`${vendors.length} vendor component records exist.`, `vendors:${vendors.length}`)
        : fail("External third-party dependency is declared but no vendor component exists.", "vendors:0");
    }
    case "CCM-011":
      return evaluateAiGovernanceProfile(system);
    case "CCM-012":
      return evaluateAgenticGovernance(system, executionDate);
    case "CCM-013":
      return evaluateLifecycleGovernance(system, executionDate);
    case "CCM-014":
      return evaluateGovernanceEngineering(system);
    default:
      return warning(`No executable check is implemented for ${testId}.`, `test:${testId}`);
  }
}

const governanceEngineeringRequiredControls = new Set([
  "AI-GOV-002",
  "AI-GOV-004",
  "AI-GOV-006",
  "AI-GOV-007",
  "AI-AGENT-002",
  "AI-AGENT-003",
  "AI-AGENT-006",
  "AI-AGENT-007",
  "AI-AGENT-009",
  "AI-LC-006"
]);

function evaluateGovernanceEngineering(system: MonitoringSystem) {
  const gaps: string[] = [];
  const severityCandidates: FindingSeverity[] = [];
  const implementationsByControl = new Map<string, typeof system.controlImplementations>();

  for (const implementation of system.controlImplementations) {
    for (const code of new Set([
      implementation.primaryControl.code,
      ...implementation.controlLinks.map((link) => link.control.code)
    ])) {
      implementationsByControl.set(code, [...(implementationsByControl.get(code) ?? []), implementation]);
    }
  }

  const highestAgenticLevel = Math.max(0, ...system.agents.map((agent) => agent.agenticLevel));
  const requiredMappings = system.systemControls.filter((mapping) =>
    isGovernanceEngineeringRequired(mapping.control.code, system.lifecycleStatus, highestAgenticLevel)
  );

  for (const mapping of requiredMappings) {
    const implementations = implementationsByControl.get(mapping.control.code) ?? [];
    if (implementations.length === 0) {
      gaps.push(`control has no implementation: ${mapping.control.code}`);
      severityCandidates.push(severityForControl(mapping.control.code, mapping.control.category));
    }
  }

  for (const implementation of system.controlImplementations) {
    if (implementation.status !== "VALIDATED") {
      gaps.push(`implementation not validated: ${implementation.implementationId}`);
      severityCandidates.push(severityForControl(implementation.primaryControl.code, implementation.primaryControl.category));
    }
    if (implementation.evidence.length === 0) {
      gaps.push(`required evidence missing: ${implementation.implementationId}`);
      severityCandidates.push(severityForControl(implementation.primaryControl.code, implementation.primaryControl.category));
    }
    if (implementation.implementationType === "Runtime Control" && !isRuntimeControlMonitored(implementation)) {
      gaps.push(`runtime control not monitored: ${implementation.implementationId}`);
      severityCandidates.push(severityForControl(implementation.primaryControl.code, implementation.primaryControl.category));
    }
  }

  if (gaps.length === 0) {
    return pass(
      `Governance engineering traceability is complete: ${system.controlImplementations.length} implementation(s) connect controls to evidence, monitoring, validation, and status.`,
      `governanceEngineering:${system.slug}`
    );
  }

  return fail(
    `Governance engineering gaps: ${gaps.join("; ")}.`,
    `governanceEngineeringGaps:${gaps.join("|")}`,
    highestFindingSeverity(severityCandidates)
  );
}

function isGovernanceEngineeringRequired(code: string, lifecycleStatus: string, highestAgenticLevel: number) {
  if (!governanceEngineeringRequiredControls.has(code)) return false;
  if ((code === "AI-AGENT-007" || code === "AI-AGENT-009") && highestAgenticLevel < 3) return false;
  if (code === "AI-LC-006" && lifecycleStatus !== "PRODUCTION" && highestAgenticLevel < 3) return false;
  return true;
}

function isRuntimeControlMonitored(implementation: MonitoringSystem["controlImplementations"][number]) {
  const evidenceTypes = implementation.evidence.map((evidence) => evidence.evidenceType);
  return implementation.validationMethod.includes("CCM-") ||
    evidenceTypes.includes("Control Test") ||
    evidenceTypes.includes("Monitoring Report");
}

function severityForControl(code: string, category: string) {
  if (code === "AI-AGENT-007" || code === "AI-LC-006" || code === "AI-AGENT-009") return FindingSeverity.CRITICAL;
  if (code.startsWith("AI-AGENT-") || category === "SECURITY" || category === "HUMAN_OVERSIGHT") return FindingSeverity.HIGH;
  if (code.startsWith("AI-GOV-") || code.startsWith("AI-LC-")) return FindingSeverity.MEDIUM;
  return FindingSeverity.LOW;
}

function highestFindingSeverity(severities: FindingSeverity[]) {
  const order = [FindingSeverity.CRITICAL, FindingSeverity.HIGH, FindingSeverity.MEDIUM, FindingSeverity.LOW, FindingSeverity.INFORMATIONAL];
  return order.find((severity) => severities.includes(severity)) ?? FindingSeverity.HIGH;
}

const lifecycleStageOrder = ["PROPOSED", "DEVELOPMENT", "TESTING", "PILOT", "PRODUCTION", "RETIRED"] as const;

const requiredApprovalsByStage: Record<string, string[]> = {
  PROPOSED: ["AI Intake"],
  DEVELOPMENT: ["AI Intake", "Risk Assessment", "Regulatory Mapping"],
  TESTING: ["AI Intake", "Risk Assessment", "Regulatory Mapping", "Evidence Completeness", "Validation"],
  PILOT: ["AI Intake", "Risk Assessment", "Regulatory Mapping", "Evidence Completeness", "Validation", "Pilot Approval"],
  PRODUCTION: ["AI Intake", "Risk Assessment", "Regulatory Mapping", "Evidence Completeness", "Validation", "Production Approval"],
  RETIRED: ["AI Intake", "Retirement Approval"]
};

const requiredGateControlsByStage: Record<string, string[]> = {
  PROPOSED: ["AI-LC-001"],
  DEVELOPMENT: ["AI-LC-001", "AI-LC-002", "AI-LC-003"],
  TESTING: ["AI-LC-001", "AI-LC-002", "AI-LC-003", "AI-LC-004", "AI-LC-005"],
  PILOT: ["AI-LC-001", "AI-LC-002", "AI-LC-003", "AI-LC-004", "AI-LC-005"],
  PRODUCTION: ["AI-LC-001", "AI-LC-002", "AI-LC-003", "AI-LC-004", "AI-LC-005", "AI-LC-006"],
  RETIRED: ["AI-LC-007"]
};

function evaluateLifecycleGovernance(system: MonitoringSystem, executionDate: Date) {
  const gaps: string[] = [];
  const stage = system.lifecycleStatus;
  const approvedTypes = new Set(
    system.lifecycleApprovals
      .filter((approval) => approval.status === "APPROVED")
      .map((approval) => approval.approvalType)
  );
  const currentStageRecord = system.lifecycleRecords
    .filter((record) => record.lifecycleStage === stage)
    .sort((a, b) => b.stageEntryDate.getTime() - a.stageEntryDate.getTime())[0];

  if (!currentStageRecord) {
    gaps.push(`current lifecycle record missing for ${stage}`);
  }

  for (const approvalType of requiredApprovalsByStage[stage] ?? []) {
    if (!approvedTypes.has(approvalType)) gaps.push(`required approval missing: ${approvalType}`);
  }

  const controlsByCode = new Map(system.systemControls.map((mapping) => [mapping.control.code, mapping]));
  for (const code of requiredGateControlsByStage[stage] ?? []) {
    const mapping = controlsByCode.get(code);
    if (!mapping) {
      gaps.push(`stage gate control missing: ${code}`);
    } else if (mapping.auditStatus !== AuditStatus.ON_TRACK) {
      gaps.push(`stage gate incomplete: ${code} is ${mapping.auditStatus}`);
    }
  }

  if (stage === "PRODUCTION" && !approvedTypes.has("Production Approval")) {
    gaps.push("production system lacks approval");
  }

  if (system.nextReviewDate < executionDate) {
    gaps.push(`review overdue: ${system.nextReviewDate.toISOString().slice(0, 10)}`);
  }

  const highestRecordedStage = system.lifecycleRecords.reduce((highest, record) => {
    const index = lifecycleStageOrder.indexOf(record.lifecycleStage);
    return Math.max(highest, index);
  }, -1);
  const currentStageIndex = lifecycleStageOrder.indexOf(stage);
  if (highestRecordedStage > -1 && currentStageIndex > -1 && highestRecordedStage < currentStageIndex) {
    gaps.push(`lifecycle history does not reach current stage ${stage}`);
  }

  if (gaps.length === 0) {
    return pass(
      `Lifecycle governance is complete for ${stage}: required approvals, stage gate controls, lifecycle history, and review currency are recorded.`,
      `lifecycleGovernance:${system.slug}:${stage}`
    );
  }

  return fail(`Lifecycle governance gaps for ${stage}: ${gaps.join("; ")}.`, `lifecycleGovernanceGaps:${gaps.join("|")}`);
}

function evaluateAgenticGovernance(system: MonitoringSystem, executionDate: Date) {
  const missing: string[] = [];
  const highestAgenticLevel = Math.max(0, ...system.agents.map((agent) => agent.agenticLevel));
  if (system.agents.length === 0) return fail("No agent is registered for agentic governance evaluation.", "agents:0");
  if (system.governedTools.length === 0) missing.push("governed tool inventory");
  if (system.agentActions.length === 0) missing.push("agent action registry");
  if (system.executionLogs.length === 0) missing.push("execution logging");
  if (!system.assessment?.uncontrolledAgentActions || !system.assessment.delegatedAuthorityRisk || !system.assessment.toolAbuseRisk) {
    missing.push("agentic risk domains");
  }

  const highImpactActions = system.agentActions.filter((action) =>
    action.riskLevel === RiskLevel.HIGH || action.riskLevel === RiskLevel.CRITICAL
  );
  if (highestAgenticLevel >= 3) {
    if (!system.killSwitch) {
      missing.push("kill switch");
    } else {
      const testedRecently = system.killSwitch.lastTested
        ? daysBetween(system.killSwitch.lastTested, executionDate) <= 90
        : false;
      if (!system.killSwitch.enabled || system.killSwitch.status !== "READY" || !testedRecently) {
        missing.push("tested ready kill switch");
      }
    }
    if (highImpactActions.some((action) => action.approvalRequirement === "NONE")) {
      missing.push("approval workflow for high-impact actions");
    }
    const highImpactLogs = system.executionLogs.filter((log) =>
      log.action.riskLevel === RiskLevel.HIGH || log.action.riskLevel === RiskLevel.CRITICAL
    );
    if (highImpactLogs.length === 0) missing.push("high-impact execution logs");
    if (highImpactLogs.some((log) => !log.approvalReference || !log.approvalWorkflow)) {
      missing.push("approval references in execution logs");
    }
  }

  if (missing.length === 0) {
    return pass(
      `Agentic governance controls are complete for Level ${highestAgenticLevel}: actions, tools, logs, approvals, kill switch expectations, and risk domains are recorded.`,
      `agenticGovernance:${system.slug}`
    );
  }

  return fail(`Agentic governance controls are incomplete. Missing or weak: ${missing.join(", ")}.`, `agenticGovernanceMissing:${missing.join("|")}`);
}

function evaluateAiGovernanceProfile(system: MonitoringSystem) {
  const missing: string[] = [];
  if (system.aiModels.length === 0) missing.push("model inventory");
  if (!system.aiModels.some((model) => model.validationStatus === ModelValidationStatus.APPROVED)) missing.push("approved model validation");
  if (system.promptAssets.length === 0) missing.push("prompt registry");
  if (!system.promptAssets.some((prompt) => prompt.approvalStatus === PromptApprovalStatus.APPROVED)) missing.push("approved prompt");
  if (system.agents.length === 0) missing.push("agent registry");
  if (!system.agents.some((agent) => agent.agenticLevel >= 0)) missing.push("agentic level");
  if (!system.authorityAssignment) missing.push("delegated authority");
  if (system.toolPermissions.length === 0) missing.push("tool permissions");
  if (!system.humanOversight || !system.humanOversight.oversightRequired) missing.push("human oversight");
  if (!system.assessment?.hallucinationRisk || !system.assessment.promptInjectionRisk || !system.assessment.modelDriftRisk) {
    missing.push("AI-specific risk domains");
  }

  if (missing.length === 0) {
    return pass(
      "AI governance profile is complete: model, prompt, agent, authority, tools, oversight, and AI risk domains are recorded.",
      `aiGovernanceProfile:${system.slug}`
    );
  }

  return fail(`AI governance profile is incomplete. Missing: ${missing.join(", ")}.`, `aiGovernanceMissing:${missing.join("|")}`);
}

function evaluateEvidenceHealth(system: MonitoringSystem) {
  if (system.evidenceHealth.length === 0) {
    return fail("No evidence health records exist for applicable evidence requirements.", "evidenceHealth:0");
  }
  const failing = system.evidenceHealth.filter((record) =>
    record.health === EvidenceHealthValue.MISSING ||
    record.health === EvidenceHealthValue.EXPIRED ||
    record.validation === EvidenceValidationValue.INVALID ||
    record.validation === EvidenceValidationValue.EXPIRED ||
    record.validation === EvidenceValidationValue.MISSING
  );
  if (failing.length > 0) {
    const summary = failing
      .map((record) => `${record.evidenceRequirement.requirementId}: ${record.validation.toLowerCase()}`)
      .join("; ");
    return fail(`Evidence validation failed for ${failing.length} required evidence item(s): ${summary}.`, `evidenceHealthFailures:${failing.length}`);
  }
  const expiring = system.evidenceHealth.filter((record) => record.health === EvidenceHealthValue.EXPIRING_SOON);
  if (expiring.length > 0) {
    return warning(`${expiring.length} evidence requirement(s) are expiring soon.`, `evidenceExpiringSoon:${expiring.length}`);
  }
  return pass(`${system.evidenceHealth.length} evidence requirements are current and valid.`, `evidenceHealth:${system.evidenceHealth.length}`);
}

function evaluateEvidenceRequirement(
  evidence: Array<{ status: EvidenceObjectStatus; expirationDate: Date; evidenceId: string }>,
  now: Date
) {
  if (evidence.length === 0) {
    return {
      health: EvidenceHealthValue.MISSING,
      validation: EvidenceValidationValue.MISSING,
      rationale: "No evidence object is linked to this mandatory evidence requirement."
    };
  }

  const approved = evidence.filter((object) => object.status === EvidenceObjectStatus.APPROVED);
  if (approved.length === 0) {
    return {
      health: EvidenceHealthValue.MISSING,
      validation: EvidenceValidationValue.INVALID,
      rationale: "Evidence exists but no linked evidence object is approved."
    };
  }

  const current = approved.filter((object) => object.expirationDate >= now);
  if (current.length === 0) {
    return {
      health: EvidenceHealthValue.EXPIRED,
      validation: EvidenceValidationValue.EXPIRED,
      rationale: "Linked evidence is approved but expired."
    };
  }

  const expiringSoon = current.some((object) => daysBetween(now, object.expirationDate) <= 30);
  return {
    health: expiringSoon ? EvidenceHealthValue.EXPIRING_SOON : EvidenceHealthValue.CURRENT,
    validation: EvidenceValidationValue.VALID,
    rationale: expiringSoon
      ? "Approved evidence is valid but expires within 30 days."
      : "Approved evidence is valid and current."
  };
}

function daysBetween(start: Date, end: Date) {
  return Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

function hasText(value: string, ok: string, bad: string, evidence: string) {
  return value.trim().length > 0 ? pass(ok, evidence) : fail(bad, evidence);
}

function pass(resultDetails: string, evidenceReference: string) {
  return { result: TestResult.PASS, resultDetails, evidenceReference };
}

function warning(resultDetails: string, evidenceReference: string) {
  return { result: TestResult.WARNING, resultDetails, evidenceReference };
}

function fail(resultDetails: string, evidenceReference: string, severity?: FindingSeverity) {
  return { result: TestResult.FAIL, resultDetails, evidenceReference, severity };
}

function remediationDays(severity: FindingSeverity) {
  if (severity === FindingSeverity.CRITICAL) return 7;
  if (severity === FindingSeverity.HIGH) return 30;
  if (severity === FindingSeverity.MEDIUM) return 60;
  return 90;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

type MonitoringSystem = Awaited<ReturnType<typeof getMonitoringSystemType>>[number];

async function getMonitoringSystemType(prisma: PrismaClient) {
  return prisma.aiSystem.findMany({
    include: {
      assessment: true,
      evidenceItems: true,
      evidenceObjects: { include: { requirementLinks: true } },
      evidenceHealth: { include: { evidenceRequirement: true } },
      systemControls: { include: { control: true } },
      regulatoryControls: true,
      components: true,
      aiModels: true,
      promptAssets: true,
      agents: true,
      authorityAssignment: { include: { delegatedAuthority: true } },
      toolPermissions: true,
      humanOversight: true,
      governedTools: true,
      agentActions: true,
      executionLogs: { include: { action: true, approvalWorkflow: true } },
      killSwitch: true,
      lifecycleRecords: true,
      lifecycleApprovals: true,
      controlImplementations: {
        include: {
          primaryControl: true,
          controlLinks: { include: { control: true } },
          evidence: true
        }
      }
    }
  });
}
