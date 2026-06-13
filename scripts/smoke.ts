import { prisma } from "@airg/db";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function assertPageLoads(baseUrl: string, path: string) {
  const response = await fetch(`${baseUrl}${path}`);
  assert(response.ok, `${path} did not load: ${response.status}`);
  console.log(`ok page ${path}`);
}

async function main() {
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
      killSwitch: true
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

  console.log("ok data Travel Brain exists");
  console.log("ok data risk owner is Russell");
  console.log("ok data multi-dimensional risk scores exist");
  console.log("ok data overall risk is Medium");

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
      authorityAssignment: { include: { delegatedAuthority: true } }
    }
  });
  assert(paymentAgent, "Autonomous Payment Agent should exist");
  assert(paymentAgent.assessment?.overallRiskTier === "CRITICAL", "Autonomous Payment Agent should be Critical risk");
  assert(paymentAgent.agents.some((agent) => agent.agenticLevel === 4), "Autonomous Payment Agent should be Agentic Level 4");
  assert(paymentAgent.governedTools.some((tool) => tool.name === "Payment API"), "Payment tool registry should include Payment API");
  assert(paymentAgent.agentActions.some((action) => action.name === "Execute Transactions"), "Payment agent action registry should include Execute Transactions");
  assert(paymentAgent.executionLogs.length > 0, "Payment agent execution logging should exist");
  assert(paymentAgent.killSwitch, "Payment agent kill switch should exist");

  const agenticControls = await prisma.control.findMany({ where: { code: { startsWith: "AI-AGENT-" } } });
  assert(agenticControls.length >= 10, "Agentic controls should exist");
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

  const baseUrl = process.env.APP_URL;
  if (baseUrl) {
    await assertPageLoads(baseUrl, "/");
    await assertPageLoads(baseUrl, "/systems/travel-brain");
    await assertPageLoads(baseUrl, "/onboarding");
    await assertPageLoads(baseUrl, "/regulatory");
    await assertPageLoads(baseUrl, "/regulatory/osfi-e-23");
    await assertPageLoads(baseUrl, "/traceability");
    await assertPageLoads(baseUrl, "/monitoring");
    await assertPageLoads(baseUrl, "/control-health");
    await assertPageLoads(baseUrl, "/findings");
    await assertPageLoads(baseUrl, "/exceptions");
    await assertPageLoads(baseUrl, "/risk-heatmap");
    await assertPageLoads(baseUrl, "/systems/travel-brain/monitoring");
    await assertPageLoads(baseUrl, "/evidence");
    await assertPageLoads(baseUrl, "/evidence/EV-TB-RISK-001");
    await assertPageLoads(baseUrl, "/executive");
    await assertPageLoads(baseUrl, "/portfolio");
    await assertPageLoads(baseUrl, "/auditor");
    await assertPageLoads(baseUrl, "/governance-committee");
    await assertPageLoads(baseUrl, "/reports/executive");
    await assertPageLoads(baseUrl, "/regulatory-coverage");
    await assertPageLoads(baseUrl, "/ai-governance");
    await assertPageLoads(baseUrl, "/systems/travel-brain/ai-governance");
    await assertPageLoads(baseUrl, "/agentic-governance");
    await assertPageLoads(baseUrl, "/systems/travel-brain/agentic-governance");
    await assertPageLoads(baseUrl, "/systems/autonomous-payment-agent/agentic-governance");
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
