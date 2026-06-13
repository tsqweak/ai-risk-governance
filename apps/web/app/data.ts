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

export async function getAiSystem(slug: string) {
  return prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      components: { orderBy: [{ type: "asc" }, { name: "asc" }] },
      evidenceItems: { orderBy: { dueDate: "asc" } },
      evidenceObjects: { orderBy: { expirationDate: "asc" } },
      evidenceHealth: { include: { evidenceRequirement: true }, orderBy: { calculatedAt: "desc" } },
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

export async function getControls() {
  return prisma.control.findMany({
    include: { regulatoryMappings: true },
    orderBy: [{ category: "asc" }, { code: "asc" }]
  });
}

export async function getMappings() {
  return prisma.regulatoryMapping.findMany({
    include: { control: true },
    orderBy: [{ framework: "asc" }, { citation: "asc" }]
  });
}

export async function getEvidence() {
  const [objects, health] = await Promise.all([
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
    })
  ]);

  return { objects, health };
}

export async function getEvidenceObject(evidenceId: string) {
  return prisma.evidenceObject.findUnique({
    where: { evidenceId },
    include: {
      aiSystem: true,
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
    }
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
  return { ...regulation, coverage: calculateCoverage(regulation.requirements) };
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
    aiGovernanceFindings: system.findings.filter((finding) => finding.controlTest.testId === "CCM-011")
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
