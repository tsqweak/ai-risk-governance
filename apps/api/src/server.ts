import cors from "cors";
import express from "express";
import { z } from "zod";
import { prisma } from "@airg/db";
import { classifyRisk } from "@airg/risk-engine";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-risk-governance-api" });
});

async function listSystems() {
  return prisma.aiSystem.findMany({
    include: {
      assessment: true,
      evidenceItems: true,
      systemControls: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

async function getSystem(slug: string) {
  return prisma.aiSystem.findUnique({
    where: { slug },
    include: {
      assessment: true,
      components: true,
      evidenceItems: { orderBy: { dueDate: "asc" } },
      auditEvents: { orderBy: { createdAt: "desc" } },
      systemControls: {
        include: {
          control: {
            include: { regulatoryMappings: true }
          }
        }
      }
    }
  });
}

function calculateCoverage(
  requirements: Array<{
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

  return { totalRequirements, coveredRequirements, uncoveredRequirements, coveragePercentage };
}

app.get("/systems", async (_req, res) => {
  res.json(await listSystems());
});

app.get("/projects", async (_req, res) => {
  res.json(await listSystems());
});

app.get("/systems/:slug", async (req, res) => {
  const system = await getSystem(req.params.slug);
  if (!system) {
    res.status(404).json({ error: "AI system not found" });
    return;
  }

  res.json(system);
});

app.get("/projects/:slug", async (req, res) => {
  const system = await getSystem(req.params.slug);
  if (!system) {
    res.status(404).json({ error: "AI system not found" });
    return;
  }

  res.json(system);
});

app.get("/personas", async (_req, res) => {
  res.json(await prisma.persona.findMany({ orderBy: { name: "asc" } }));
});

app.get("/regulations", async (_req, res) => {
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
    },
    orderBy: [{ jurisdiction: "asc" }, { name: "asc" }]
  });

  res.json(regulations.map((regulation) => ({ ...regulation, coverage: calculateCoverage(regulation.requirements) })));
});

app.get("/regulations/:slug", async (req, res) => {
  const regulation = await prisma.regulation.findUnique({
    where: { slug: req.params.slug },
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
      },
      controls: {
        include: {
          aiSystemMappings: { include: { aiSystem: true } },
          evidenceItems: true
        }
      }
    }
  });

  if (!regulation) {
    res.status(404).json({ error: "Regulation not found" });
    return;
  }

  res.json({ ...regulation, coverage: calculateCoverage(regulation.requirements) });
});

app.get("/traceability", async (_req, res) => {
  res.json(await prisma.regulation.findMany({
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
    },
    orderBy: [{ jurisdiction: "asc" }, { name: "asc" }]
}));
});

app.get("/control-tests", async (_req, res) => {
  res.json(await prisma.controlTest.findMany({ orderBy: { testId: "asc" } }));
});

app.get("/test-runs", async (_req, res) => {
  res.json(await prisma.testRun.findMany({
    include: { controlTest: true, aiSystem: true },
    orderBy: [{ executionDate: "desc" }, { result: "asc" }]
  }));
});

app.get("/findings", async (_req, res) => {
  res.json(await prisma.finding.findMany({
    include: { aiSystem: true, controlTest: true, exceptions: true },
    orderBy: [{ status: "asc" }, { severity: "asc" }, { createdDate: "desc" }]
  }));
});

app.get("/exceptions", async (_req, res) => {
  res.json(await prisma.exception.findMany({
    include: { finding: { include: { aiSystem: true, controlTest: true } } },
    orderBy: { expirationDate: "asc" }
  }));
});

app.get("/controls", async (_req, res) => {
  const controls = await prisma.control.findMany({
    include: { regulatoryMappings: true },
    orderBy: [{ category: "asc" }, { code: "asc" }]
  });

  res.json(controls);
});

app.get("/regulatory-mappings", async (_req, res) => {
  const mappings = await prisma.regulatoryMapping.findMany({
    include: { control: true },
    orderBy: [{ framework: "asc" }, { citation: "asc" }]
  });

  res.json(mappings);
});

app.get("/evidence", async (_req, res) => {
  const evidence = await prisma.evidenceItem.findMany({
    include: { aiSystem: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }]
  });

  res.json(evidence);
});

const classifySchema = z.object({
  customerFacing: z.boolean(),
  internalUserFacing: z.boolean(),
  personalData: z.boolean(),
  materialBusinessProcess: z.boolean(),
  regulatedActivity: z.boolean(),
  autonomousAction: z.boolean(),
  financialTransaction: z.boolean(),
  externalThirdPartyDependency: z.boolean(),
  dataClassification: z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]),
  recommendationOnly: z.boolean().optional()
});

app.post("/risk-classification", (req, res) => {
  const input = classifySchema.parse(req.body);
  res.json(classifyRisk(input));
});

app.listen(port, () => {
  console.log(`AI Risk Governance API listening on http://localhost:${port}`);
});
