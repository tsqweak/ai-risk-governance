import {
  ApprovalLevel,
  AuditStatus,
  ComponentType,
  ControlCategory,
  DataClassification,
  EvidenceObjectStatus,
  EvidenceStatus,
  FindingStatus,
  LifecycleStatus,
  ModelValidationStatus,
  PermissionType,
  PromptApprovalStatus,
  PrismaClient,
  RiskLevel,
  SystemEnvironment
} from "@prisma/client";
import { classifyRisk } from "@airg/risk-engine";
import { calculateEvidenceHealth, runMonitoring, seedControlTests } from "@airg/monitoring-engine";

const prisma = new PrismaClient();

const controls = [
  ["GOV-001", "AI governance approval", ControlCategory.GOVERNANCE, "Document business purpose, accountable owner, committee approval, and acceptable-use constraints.", "AI Governance Lead", "Quarterly"],
  ["MRM-001", "Model risk assessment", ControlCategory.MODEL_RISK, "Assess model limitations, validation approach, monitoring metrics, and residual risk.", "Model Risk Manager", "Quarterly"],
  ["PRI-001", "Personal data minimization", ControlCategory.PRIVACY, "Confirm personal data is limited to approved travel personalization attributes and retained according to policy.", "Privacy Officer", "Semiannual"],
  ["SEC-001", "Secure system access", ControlCategory.SECURITY, "Enforce role-based access, logging, vulnerability management, and secure deployment controls.", "Security Lead", "Monthly"],
  ["TPR-001", "Third party provider review", ControlCategory.THIRD_PARTY_RISK, "Review AI, cloud, and data processors for contractual, operational, and compliance obligations.", "Vendor Risk Manager", "Annual"],
  ["EXP-001", "User-facing recommendation explanation", ControlCategory.EXPLAINABILITY, "Provide clear explanations for travel recommendations and meaningful escalation paths.", "Product Owner", "Quarterly"],
  ["AUD-001", "Audit trail completeness", ControlCategory.AUDITABILITY, "Retain decision logs, assessment history, control evidence, and reviewer attestations.", "Audit Liaison", "Monthly"],
  ["HUM-001", "Human oversight and escalation", ControlCategory.HUMAN_OVERSIGHT, "Define human review points for complaints, adverse outcomes, and policy exceptions.", "Operations Lead", "Quarterly"],
  ["OPS-001", "Operational resilience testing", ControlCategory.OPERATIONAL_RESILIENCE, "Test incident response, rollback, availability, dependency failure, and monitoring procedures.", "Resilience Lead", "Semiannual"],
  ["AI-GOV-001", "Model inventory maintained", ControlCategory.MODEL_RISK, "Maintain a registered inventory of AI models, providers, versions, owners, validation status, and lifecycle state.", "Model Risk Manager", "Monthly"],
  ["AI-GOV-002", "Prompt owner assigned", ControlCategory.GOVERNANCE, "Assign accountable ownership for production prompts and prompt lifecycle decisions.", "AI Governance Lead", "Monthly"],
  ["AI-GOV-003", "Prompt approved", ControlCategory.GOVERNANCE, "Approve prompts before production use and retain version history.", "AI Governance Lead", "Monthly"],
  ["AI-GOV-004", "Human oversight defined", ControlCategory.HUMAN_OVERSIGHT, "Define human review, intervention, and escalation points for AI outputs.", "Operations Lead", "Quarterly"],
  ["AI-GOV-005", "Delegated authority assigned", ControlCategory.GOVERNANCE, "Assign a bounded authority level that states what the AI system can and cannot do.", "Risk Owner", "Quarterly"],
  ["AI-GOV-006", "Tool permissions approved", ControlCategory.SECURITY, "Approve AI tool permissions and explicitly deny prohibited write, execute, or administrative actions.", "Security Lead", "Monthly"],
  ["AI-GOV-007", "Model validation current", ControlCategory.MODEL_RISK, "Confirm AI model validation is approved and current for production use.", "Model Risk Manager", "Quarterly"],
  ["AI-GOV-008", "Agent registered", ControlCategory.GOVERNANCE, "Register AI agents with purpose, owner, risk level, lifecycle, and linked AI system.", "AI Governance Lead", "Monthly"],
  ["AI-GOV-009", "Agentic level assigned", ControlCategory.HUMAN_OVERSIGHT, "Assign an agentic level from informational through autonomous execution.", "Risk Owner", "Quarterly"],
  ["AI-GOV-010", "AI risk domains assessed", ControlCategory.MODEL_RISK, "Assess hallucination, prompt injection, drift, tool misuse, autonomy, and explainability risk domains.", "Model Risk Manager", "Quarterly"],
  ["AI-AGENT-001", "Agentic tool inventory maintained", ControlCategory.GOVERNANCE, "Maintain a governed inventory of tools available to agents, including owner, review date, permission type, and risk level.", "AI Governance Lead", "Monthly"],
  ["AI-AGENT-002", "Agent tool permissions enforced", ControlCategory.SECURITY, "Confirm tool access is approved and aligned to delegated authority.", "Security Lead", "Monthly"],
  ["AI-AGENT-003", "Delegated authority enforced", ControlCategory.GOVERNANCE, "Confirm agent actions do not exceed assigned delegated authority.", "Risk Owner", "Monthly"],
  ["AI-AGENT-004", "Agent action registry maintained", ControlCategory.AUDITABILITY, "Register permitted agent actions, risk levels, and approval requirements.", "AI Governance Lead", "Monthly"],
  ["AI-AGENT-005", "Approval workflow assigned", ControlCategory.HUMAN_OVERSIGHT, "Assign approval workflows for draft, execution, financial, and record-modifying actions.", "Operations Lead", "Monthly"],
  ["AI-AGENT-006", "Execution logging enabled", ControlCategory.AUDITABILITY, "Log agent, tool, action, outcome, timestamp, initiator, and approval reference for executions.", "Audit Liaison", "Monthly"],
  ["AI-AGENT-007", "Autonomous action kill switch tested", ControlCategory.OPERATIONAL_RESILIENCE, "Maintain and periodically test a kill switch for autonomous or high-impact agentic systems.", "Resilience Lead", "Monthly"],
  ["AI-AGENT-008", "Agentic risk assessment current", ControlCategory.MODEL_RISK, "Assess uncontrolled actions, delegated authority, tool abuse, approval bypass, and runaway automation risk.", "Model Risk Manager", "Quarterly"],
  ["AI-AGENT-009", "Autonomous action approvals evidenced", ControlCategory.HUMAN_OVERSIGHT, "Retain approval evidence for autonomous, financial, or record-modifying actions.", "Risk Owner", "Monthly"],
  ["AI-AGENT-010", "Agentic incident response defined", ControlCategory.OPERATIONAL_RESILIENCE, "Define escalation, rollback, suspension, and incident response for agentic automation.", "Resilience Lead", "Quarterly"]
] as const;

const evidenceTypes = [
  "AI Risk Assessment",
  "Model Validation Report",
  "Architecture Diagram",
  "Data Inventory",
  "Privacy Impact Assessment",
  "Threat Assessment",
  "Vendor Assessment",
  "Approval Record",
  "Human Oversight Procedure",
  "Monitoring Report",
  "Control Testing Report",
  "Regulatory Mapping Record"
] as const;

const mappings: Record<string, Array<[string, string, string]>> = {
  "GOV-001": [["NIST AI RMF", "Govern organizational AI risk roles and accountability.", "GOVERN-1"], ["EU AI Act", "Maintain governance and risk management processes for deployed AI systems.", "Article 9"]],
  "MRM-001": [["Federal Reserve SR 11-7", "Validate model use, limitations, and ongoing performance.", "SR 11-7"], ["NIST AI RMF", "Measure and manage model risk over the lifecycle.", "MEASURE-2"]],
  "PRI-001": [["GLBA", "Protect nonpublic personal information.", "Safeguards Rule"], ["EU AI Act", "Ensure data governance and relevance for AI system use.", "Article 10"]],
  "SEC-001": [["FFIEC", "Apply security controls and technology risk management.", "Architecture, Infrastructure, and Operations"], ["NIST AI RMF", "Manage security and resilience risks.", "MANAGE-4"]],
  "TPR-001": [["OCC Third Party Risk", "Manage third party relationships across lifecycle.", "Bulletin 2023-17"], ["FFIEC", "Perform vendor due diligence and monitoring.", "Outsourcing Technology Services"]],
  "EXP-001": [["NIST AI RMF", "Provide understandable AI outputs and context.", "MAP-3"], ["EU AI Act", "Support transparency and user information obligations.", "Article 13"]],
  "AUD-001": [["EU AI Act", "Enable logging and recordkeeping.", "Article 12"], ["NIST AI RMF", "Document traceability and risk decisions.", "GOVERN-6"]],
  "HUM-001": [["EU AI Act", "Enable appropriate human oversight.", "Article 14"], ["NIST AI RMF", "Manage human-AI configuration and fallback.", "MANAGE-2"]],
  "OPS-001": [["FFIEC", "Test resilience, continuity, and incident practices.", "Business Continuity Management"], ["NIST AI RMF", "Monitor, respond, and recover from AI incidents.", "MANAGE-4"]],
  "AI-GOV-001": [["OSFI E-23", "Maintain AI and model inventory completeness.", "Inventory"], ["EU AI Act", "Maintain technical documentation and system records.", "Article 11"]],
  "AI-GOV-002": [["NIST AI RMF", "Assign accountability for AI artifacts.", "GOVERN-1"]],
  "AI-GOV-003": [["NIST AI RMF", "Control AI configuration and change.", "GOVERN-6"]],
  "AI-GOV-004": [["EU AI Act", "Enable human oversight.", "Article 14"]],
  "AI-GOV-005": [["NIST AI RMF", "Manage human-AI configuration and delegated decision rights.", "MANAGE-2"]],
  "AI-GOV-006": [["FFIEC", "Control privileged access and system permissions.", "Access and Identity Management"]],
  "AI-GOV-007": [["Federal Reserve SR 11-7", "Validate model use, limits, and performance.", "Validation"]],
  "AI-GOV-008": [["NIST AI RMF", "Inventory AI system components and automation.", "MAP-1"]],
  "AI-GOV-009": [["EU AI Act", "Align autonomy with oversight and risk controls.", "Article 14"]],
  "AI-GOV-010": [["NIST AI RMF", "Measure and manage AI-specific risks.", "MEASURE-2"]],
  "AI-AGENT-001": [["NIST AI RMF", "Inventory agent tools and permissions.", "MAP-1"]],
  "AI-AGENT-002": [["FFIEC", "Enforce access permissions and entitlement review.", "Access and Identity Management"]],
  "AI-AGENT-003": [["EU AI Act", "Align autonomy with human oversight.", "Article 14"]],
  "AI-AGENT-004": [["NIST AI RMF", "Document AI system actions and automation scope.", "GOVERN-6"]],
  "AI-AGENT-005": [["OSFI E-23", "Define approval and oversight over high-risk model use.", "Governance"]],
  "AI-AGENT-006": [["EU AI Act", "Maintain logging and recordkeeping.", "Article 12"]],
  "AI-AGENT-007": [["FFIEC", "Maintain operational resilience and emergency response controls.", "Business Continuity Management"]],
  "AI-AGENT-008": [["NIST AI RMF", "Measure agentic AI risks.", "MEASURE-2"]],
  "AI-AGENT-009": [["OCC", "Evidence approval for high-impact model-enabled actions.", "Model Risk Management"]],
  "AI-AGENT-010": [["FCA", "Maintain operational resilience response and escalation.", "Operational Resilience"]]
};

type RequirementSeed = {
  referenceId: string;
  title: string;
  description: string;
  rationale: string;
  evidenceExamples: string[];
};

type RegulatoryControlSeed = {
  controlId: string;
  title: string;
  objective: string;
  testingApproach: string;
  evidenceRequired: string[];
  requirementRefs: string[];
  mapTravelBrain?: boolean;
};

const regulatoryLibrary: Array<{
  slug: string;
  name: string;
  jurisdiction: string;
  regulator: string;
  description: string;
  whyItMatters: string;
  audience: string;
  status: string;
  effectiveDate: string;
  requirements: RequirementSeed[];
  controls: RegulatoryControlSeed[];
}> = [
  {
    slug: "osfi-e-23",
    name: "OSFI E-23",
    jurisdiction: "Canada",
    regulator: "Office of the Superintendent of Financial Institutions",
    description: "Canadian model risk management expectations for federally regulated financial institutions, including inventory, validation, monitoring, governance, and model lifecycle controls.",
    whyItMatters: "OSFI E-23 matters because it makes model and AI risk management a supervisory expectation tied to governance, accountability, and demonstrable control evidence.",
    audience: "IT Risk, Model Risk, Compliance, Internal Audit, AI Governance Committee, Executives",
    status: "Final guideline",
    effectiveDate: "2025-07-01",
    requirements: [
      req("OSFI-REQ-INV", "Inventory", "Maintain a complete model and AI system inventory.", "A complete inventory is the starting point for risk tiering, oversight, and supervisory traceability.", ["AI system registry export", "owner attestation", "change log"]),
      req("OSFI-REQ-GOV", "Governance", "Assign accountable owners and governance committee oversight.", "Ownership prevents unmanaged AI use and enables escalation.", ["committee minutes", "RACI", "risk acceptance record"]),
      req("OSFI-REQ-VAL", "Validation", "Validate design, assumptions, limitations, and performance.", "Validation gives independent challenge before and after use.", ["validation memo", "test results", "limitation register"]),
      req("OSFI-REQ-MON", "Monitoring", "Monitor performance, drift, issues, and control health.", "Ongoing monitoring ensures risk remains inside appetite.", ["KRI dashboard", "drift report", "incident log"])
    ],
    controls: [
      ctrl("OSFI-INV-001", "AI inventory completeness review", "Confirm all AI systems are registered with lifecycle, ownership, risk, and review dates.", "Sample inventory records and reconcile to technology intake and production deployment sources.", ["registry extract", "production reconciliation", "owner attestation"], ["OSFI-REQ-INV"], true),
      ctrl("OSFI-GOV-001", "AI governance approval", "Confirm AI systems have business, technology, risk, and executive accountability.", "Inspect committee approval and ownership attestations.", ["committee minutes", "RACI", "approval record"], ["OSFI-REQ-GOV"], true),
      ctrl("OSFI-MON-001", "AI monitoring cadence", "Confirm ongoing monitoring is defined and operating.", "Review monitoring dashboard, thresholds, exceptions, and issue closure.", ["monitoring dashboard", "KRI thresholds", "issue log"], ["OSFI-REQ-MON"], true)
    ]
  },
  reg("occ-ai-model-risk", "OCC AI & Model Risk Expectations", "US", "Office of the Comptroller of the Currency", [
    req("OCC-REQ-GOV", "Governance", "Board and senior management oversight of AI and model risk.", "Bank management must understand and control material AI risks.", ["board reporting", "policy exception log"]),
    req("OCC-REQ-VAL", "Validation", "Independent validation of models and AI-enabled decision logic.", "Independent challenge reduces unmanaged model error and bias.", ["validation report", "challenge evidence"]),
    req("OCC-REQ-TPR", "Third Party Risk", "Manage vendor and outsourced AI dependencies.", "AI dependencies can create operational, data, and compliance risk.", ["vendor due diligence", "contract clauses"]),
    req("OCC-REQ-DOC", "Technical Documentation", "Maintain documentation sufficient for review and audit.", "Documentation makes decisions explainable and repeatable.", ["architecture diagram", "model card"])
  ], [
    ctrl("OCC-GOV-001", "Senior management AI oversight", "Evidence management oversight of material AI risk.", "Review governance forums, escalations, and risk acceptance.", ["risk committee packet", "AI inventory report"], ["OCC-REQ-GOV"], true),
    ctrl("OCC-VAL-001", "Independent model validation", "Validate AI system assumptions, limitations, and outcomes.", "Inspect validation scope, findings, and remediation.", ["validation report", "remediation tracker"], ["OCC-REQ-VAL"], false),
    ctrl("OCC-TPR-001", "AI vendor due diligence", "Review third-party AI and data dependencies.", "Inspect vendor reviews, contracts, and monitoring.", ["vendor risk assessment", "contract review"], ["OCC-REQ-TPR"], true)
  ]),
  reg("fed-ai-model-risk", "Federal Reserve AI & Model Risk Expectations", "US", "Federal Reserve", [
    req("FED-REQ-VAL", "Validation", "Apply effective challenge to model design, implementation, and use.", "Federal Reserve model risk expectations rely on effective challenge.", ["validation memo", "independent review"]),
    req("FED-REQ-MON", "Monitoring", "Monitor performance and stability over time.", "Models can degrade as data, customers, and markets change.", ["performance dashboard", "drift analysis"]),
    req("FED-REQ-DATA", "Data Governance", "Assess data quality, lineage, and appropriateness.", "Poor data governance creates unreliable model outcomes.", ["data lineage", "quality checks"]),
    req("FED-REQ-DOC", "Technical Documentation", "Document model use, assumptions, and limitations.", "Documentation supports auditability and supervisory review.", ["model card", "limitations register"])
  ], [
    ctrl("FED-VAL-001", "Effective challenge record", "Document independent review and challenge.", "Inspect reviewer independence and challenge disposition.", ["challenge log", "validation sign-off"], ["FED-REQ-VAL"], false),
    ctrl("FED-MON-001", "Performance monitoring", "Monitor model quality and stability.", "Review dashboards and thresholds for ongoing performance.", ["monitoring dashboard", "threshold exceptions"], ["FED-REQ-MON"], true),
    ctrl("FED-DATA-001", "Data lineage and quality", "Document input data lineage and quality controls.", "Sample data lineage, quality checks, and approvals.", ["data lineage", "quality results"], ["FED-REQ-DATA"], true)
  ]),
  reg("fdic-ai-model-risk", "FDIC AI & Model Risk Expectations", "US", "Federal Deposit Insurance Corporation", [
    req("FDIC-REQ-GOV", "Governance", "Govern AI use with clear accountability and policy coverage.", "FDIC-supervised institutions need demonstrable risk governance.", ["policy", "approval minutes"]),
    req("FDIC-REQ-MON", "Monitoring", "Monitor customer and operational impacts.", "Ongoing use must remain consistent with policy and risk appetite.", ["impact monitoring", "issue log"]),
    req("FDIC-REQ-HO", "Human Oversight", "Maintain human review for consequential AI use.", "Human oversight reduces unmanaged customer harm.", ["escalation procedure", "review samples"]),
    req("FDIC-REQ-EV", "Evidence", "Retain evidence supporting control operation.", "Audit and exam teams need traceable evidence.", ["evidence register", "attestations"])
  ], [
    ctrl("FDIC-GOV-001", "Policy coverage confirmation", "Confirm AI use is covered by approved policy.", "Inspect policy mapping and exceptions.", ["policy mapping", "exception log"], ["FDIC-REQ-GOV"], true),
    ctrl("FDIC-HO-001", "Human escalation workflow", "Confirm humans can review complaints and exceptions.", "Walk through escalation samples.", ["workflow", "case samples"], ["FDIC-REQ-HO"], true),
    ctrl("FDIC-EV-001", "Evidence retention review", "Confirm evidence is complete and retained.", "Sample evidence against mapped controls.", ["evidence register", "retention proof"], ["FDIC-REQ-EV"], true)
  ]),
  reg("fca-ai-operational-resilience", "FCA AI & Operational Resilience Expectations", "UK", "Financial Conduct Authority", [
    req("FCA-REQ-GOV", "Governance", "Demonstrate accountability for AI-enabled services.", "Accountability supports consumer protection and senior management oversight.", ["SMF accountability", "committee minutes"]),
    req("FCA-REQ-OR", "Operational Resilience", "Assess important business service dependency and resilience.", "AI failures can affect important business services.", ["impact tolerance", "resilience test"]),
    req("FCA-REQ-MON", "Monitoring", "Monitor consumer outcome and operational indicators.", "Consumer Duty expectations require ongoing outcome awareness.", ["outcome dashboard", "complaints analysis"]),
    req("FCA-REQ-TPR", "Third Party Risk", "Manage outsourced AI and technology dependencies.", "Third parties can affect resilience and consumer outcomes.", ["outsourcing register", "vendor test"])
  ], [
    ctrl("FCA-GOV-001", "AI accountability statement", "Confirm named accountable owners and governance forums.", "Review accountability records and governance minutes.", ["accountability statement", "governance minutes"], ["FCA-REQ-GOV"], true),
    ctrl("FCA-OR-001", "Operational resilience scenario test", "Test AI dependency failure and recovery.", "Inspect scenario test results and remediation.", ["scenario test", "recovery plan"], ["FCA-REQ-OR"], false),
    ctrl("FCA-MON-001", "Customer outcome monitoring", "Monitor customer-facing AI outcomes and complaints.", "Review outcome metrics and complaint trends.", ["outcome dashboard", "complaint report"], ["FCA-REQ-MON"], true)
  ]),
  reg("eu-ai-act", "EU AI Act", "EU", "European Union", [
    req("EUAI-REQ-RM", "Risk Management", "Maintain a lifecycle risk management system for AI.", "EU AI Act obligations require systematic risk identification and mitigation.", ["risk file", "control assessment"]),
    req("EUAI-REQ-HO", "Human Oversight", "Enable effective human oversight of AI systems.", "Human oversight is central to preventing or minimizing harm.", ["oversight procedure", "review logs"]),
    req("EUAI-REQ-DOC", "Technical Documentation", "Maintain technical documentation and system instructions.", "Documentation supports conformity, transparency, and regulator review.", ["technical file", "instructions for use"]),
    req("EUAI-REQ-DATA", "Data Governance", "Ensure relevant and appropriate training, validation, and input data controls.", "Data quality and governance affect AI reliability and fairness.", ["data governance record", "quality tests"])
  ], [
    ctrl("EUAI-RM-001", "AI risk management file", "Maintain risk assessment, mitigations, and residual risk decisions.", "Review risk file completeness and approval.", ["risk management file", "residual risk acceptance"], ["EUAI-REQ-RM"], true),
    ctrl("EUAI-HO-001", "Human oversight procedure", "Define human review, escalation, and intervention points.", "Test oversight workflow and escalation records.", ["oversight procedure", "case review"], ["EUAI-REQ-HO"], true),
    ctrl("EUAI-DOC-001", "Technical documentation package", "Maintain system design, data, performance, and instructions documentation.", "Inspect technical file and version history.", ["technical file", "model card", "change log"], ["EUAI-REQ-DOC"], false)
  ]),
  reg("japan-fsa-ai-supervisory", "Japan FSA AI Supervisory Expectations", "Japan", "Financial Services Agency", [
    req("JFSA-REQ-GOV", "Governance", "Establish accountable AI governance and risk management.", "Supervisory review expects clear accountability for technology-enabled risk.", ["governance policy", "owner record"]),
    req("JFSA-REQ-DATA", "Data Governance", "Protect customer data and assess data appropriateness.", "Data governance supports trust, privacy, and model reliability.", ["data inventory", "access review"]),
    req("JFSA-REQ-MON", "Monitoring", "Monitor AI performance, incidents, and customer impacts.", "Monitoring helps identify deterioration and customer harm.", ["monitoring report", "incident log"]),
    req("JFSA-REQ-DOC", "Technical Documentation", "Maintain documentation for oversight and audit.", "Documentation helps supervisors understand the AI system and controls.", ["architecture documentation", "audit trail"])
  ], [
    ctrl("JFSA-GOV-001", "AI governance accountability", "Confirm accountable AI owners and committee oversight.", "Inspect ownership and governance records.", ["owner attestation", "committee minutes"], ["JFSA-REQ-GOV"], true),
    ctrl("JFSA-DATA-001", "Customer data control review", "Confirm data use, access, and retention controls.", "Sample data inventories and access reviews.", ["data inventory", "access review"], ["JFSA-REQ-DATA"], true),
    ctrl("JFSA-MON-001", "AI incident and performance monitoring", "Monitor incidents and performance indicators.", "Review issue logs and monitoring reports.", ["monitoring report", "incident log"], ["JFSA-REQ-MON"], true)
  ])
];

function req(referenceId: string, title: string, description: string, rationale: string, evidenceExamples: string[]): RequirementSeed {
  return { referenceId, title, description, rationale, evidenceExamples };
}

function ctrl(
  controlId: string,
  title: string,
  objective: string,
  testingApproach: string,
  evidenceRequired: string[],
  requirementRefs: string[],
  mapTravelBrain = false
): RegulatoryControlSeed {
  return { controlId, title, objective, testingApproach, evidenceRequired, requirementRefs, mapTravelBrain };
}

function reg(
  slug: string,
  name: string,
  jurisdiction: string,
  regulator: string,
  requirements: RequirementSeed[],
  controls: RegulatoryControlSeed[]
) {
  return {
    slug,
    name,
    jurisdiction,
    regulator,
    description: `${name} describes supervisory expectations relevant to AI governance, model risk management, operational resilience, oversight, documentation, and traceable control evidence.`,
    whyItMatters: `${name} matters because regulators, auditors, and executives need evidence that AI systems are inventoried, controlled, monitored, and explainable.`,
    audience: "IT Risk, Compliance, Internal Audit, AI Governance Committee, Business Owners, Technology Owners, Executives",
    status: "Supervisory expectations",
    effectiveDate: "2026-01-01",
    requirements,
    controls
  };
}

async function main() {
  await prisma.exception.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.testRun.deleteMany();
  await prisma.controlTest.deleteMany();
  await prisma.evidenceHealth.deleteMany();
  await prisma.evidenceObjectRequirement.deleteMany();
  await prisma.evidenceObject.deleteMany();
  await prisma.evidenceRequirement.deleteMany();
  await prisma.evidenceType.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.evidenceItem.deleteMany();
  await prisma.aiSystemRegulatoryControl.deleteMany();
  await prisma.requirementControl.deleteMany();
  await prisma.regulatoryControl.deleteMany();
  await prisma.regulatoryRequirement.deleteMany();
  await prisma.regulation.deleteMany();
  await prisma.systemControl.deleteMany();
  await prisma.regulatoryMapping.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.executionLog.deleteMany();
  await prisma.killSwitch.deleteMany();
  await prisma.agentAction.deleteMany();
  await prisma.governedTool.deleteMany();
  await prisma.approvalWorkflow.deleteMany();
  await prisma.promptVersion.deleteMany();
  await prisma.promptAsset.deleteMany();
  await prisma.aiModel.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.aiSystemAuthority.deleteMany();
  await prisma.delegatedAuthority.deleteMany();
  await prisma.toolPermission.deleteMany();
  await prisma.humanOversight.deleteMany();
  await prisma.aiSystemComponent.deleteMany();
  await prisma.control.deleteMany();
  await prisma.aiSystem.deleteMany();
  await prisma.persona.deleteMany();

  await prisma.persona.createMany({
    data: [
      { name: "Russell", title: "VP, IT Risk & Regulatory", role: "Risk Owner / Portfolio Oversight", description: "Owns portfolio-level technology and regulatory risk oversight for AI systems." },
      { name: "Sarah Chen", title: "Business Owner", role: "Business Owner", description: "Accountable for business value, customer outcomes, and appropriate system use." },
      { name: "Michael Thompson", title: "Technology Owner", role: "Technology Owner", description: "Owns technical design, delivery, resilience, and operational support." },
      { name: "Jennifer Patel", title: "Internal Audit", role: "Internal Audit", description: "Reviews control design, evidence quality, and audit readiness." },
      { name: "David Kim", title: "AI Governance Committee Chair", role: "Executive Sponsor", description: "Chairs governance escalation and approves material AI risk decisions." }
    ]
  });
  await seedControlTests(prisma);
  await prisma.evidenceType.createMany({
    data: evidenceTypes.map((name) => ({
      name,
      description: `${name} evidence used to demonstrate AI governance control design, operation, review, and auditability.`
    }))
  });

  const authorityByLevel = new Map<number, { id: string }>();
  for (const authority of [
    {
      authorityLevel: 0,
      authorityDescription: "Informational only. The AI system may summarize or retrieve information but does not recommend a course of action.",
      approvalRequired: false,
      maximumImpact: "No customer or operational action.",
      escalationPath: "Business owner confirms content boundaries."
    },
    {
      authorityLevel: 1,
      authorityDescription: "Recommend only. The AI system may recommend options but cannot draft binding communications or execute actions.",
      approvalRequired: false,
      maximumImpact: "Customer or employee receives a recommendation that remains optional.",
      escalationPath: "Business owner to Risk Owner to AI Governance Committee Chair."
    },
    {
      authorityLevel: 2,
      authorityDescription: "Draft. The AI system may draft content or workflow outputs for human review before use.",
      approvalRequired: true,
      maximumImpact: "Human-reviewed draft output may influence a customer, employee, or process.",
      escalationPath: "Technology Owner and Risk Owner approve production boundaries."
    },
    {
      authorityLevel: 3,
      authorityDescription: "Execute with approval. The AI system may prepare actions that a human must approve before execution.",
      approvalRequired: true,
      maximumImpact: "Approved execution may affect accounts, cases, servicing, or operational workflows.",
      escalationPath: "AI Governance Committee approval and executive sponsor attestation."
    },
    {
      authorityLevel: 4,
      authorityDescription: "Execute autonomously. The AI system may execute actions within pre-approved policy and technical guardrails.",
      approvalRequired: true,
      maximumImpact: "Autonomous execution may create financial, customer, operational, or regulatory impact.",
      escalationPath: "Executive risk acceptance, model risk validation, and committee approval required."
    }
  ]) {
    const created = await prisma.delegatedAuthority.create({ data: authority });
    authorityByLevel.set(created.authorityLevel, created);
  }

  const approvalWorkflows = new Map<string, { id: string }>();
  for (const workflow of [
    {
      workflowId: "AWF-NONE-001",
      name: "No Approval Required",
      approvalLevel: ApprovalLevel.NONE,
      approverRole: "System policy",
      escalationPath: "Business owner review if thresholds change."
    },
    {
      workflowId: "AWF-SINGLE-001",
      name: "Single Business Approval",
      approvalLevel: ApprovalLevel.SINGLE_APPROVAL,
      approverRole: "Business Owner",
      escalationPath: "Business Owner -> Risk Owner."
    },
    {
      workflowId: "AWF-DUAL-001",
      name: "Dual Risk and Business Approval",
      approvalLevel: ApprovalLevel.DUAL_APPROVAL,
      approverRole: "Business Owner and Risk Owner",
      escalationPath: "Business Owner -> Risk Owner -> Executive Sponsor."
    },
    {
      workflowId: "AWF-COMMITTEE-001",
      name: "AI Governance Committee Approval",
      approvalLevel: ApprovalLevel.COMMITTEE_APPROVAL,
      approverRole: "AI Governance Committee",
      escalationPath: "Risk Owner -> AI Governance Committee Chair -> Executive Risk Committee."
    }
  ]) {
    const created = await prisma.approvalWorkflow.create({ data: workflow });
    approvalWorkflows.set(created.workflowId, created);
  }

  const createdControls = new Map<string, { id: string }>();
  for (const [code, title, category, description, ownerRole, testingFrequency] of controls) {
    const control = await prisma.control.create({ data: { code, title, category, description, ownerRole, testingFrequency } });
    createdControls.set(code, control);
    for (const [framework, obligation, citation] of mappings[code]) {
      await prisma.regulatoryMapping.create({ data: { framework, obligation, citation, controlId: control.id } });
    }
  }

  const regulatoryControlsByCode = new Map<string, { id: string; mapTravelBrain?: boolean }>();
  for (const regulationSeed of regulatoryLibrary) {
    const regulation = await prisma.regulation.create({
      data: {
        slug: regulationSeed.slug,
        name: regulationSeed.name,
        jurisdiction: regulationSeed.jurisdiction,
        regulator: regulationSeed.regulator,
        description: regulationSeed.description,
        whyItMatters: regulationSeed.whyItMatters,
        audience: regulationSeed.audience,
        status: regulationSeed.status,
        effectiveDate: new Date(`${regulationSeed.effectiveDate}T00:00:00.000Z`)
      }
    });

    const requirementsByRef = new Map<string, { id: string }>();
    for (const requirementSeed of regulationSeed.requirements) {
      const requirement = await prisma.regulatoryRequirement.create({
        data: {
          regulationId: regulation.id,
          referenceId: requirementSeed.referenceId,
          title: requirementSeed.title,
          description: requirementSeed.description,
          rationale: requirementSeed.rationale,
          evidenceExamples: JSON.stringify(requirementSeed.evidenceExamples)
        }
      });
      requirementsByRef.set(requirementSeed.referenceId, requirement);
    }

    for (const controlSeed of regulationSeed.controls) {
      const regulatoryControl = await prisma.regulatoryControl.create({
        data: {
          regulationId: regulation.id,
          controlId: controlSeed.controlId,
          title: controlSeed.title,
          objective: controlSeed.objective,
          testingApproach: controlSeed.testingApproach,
          evidenceRequired: JSON.stringify(controlSeed.evidenceRequired)
        }
      });
      regulatoryControlsByCode.set(controlSeed.controlId, { id: regulatoryControl.id, mapTravelBrain: controlSeed.mapTravelBrain });

      for (const referenceId of controlSeed.requirementRefs) {
        const requirement = requirementsByRef.get(referenceId);
        if (requirement) {
          await prisma.requirementControl.create({
            data: { requirementId: requirement.id, regulatoryControlId: regulatoryControl.id }
          });
        }
      }
    }
  }

  const evidenceRequirementsByControl = new Map<string, { id: string }[]>();
  const addEvidenceRequirement = async (controlId: string, evidenceType: string, rationale: string) => {
    const regulatoryControl = regulatoryControlsByCode.get(controlId);
    if (!regulatoryControl) return;
    const requirement = await prisma.evidenceRequirement.create({
      data: {
        requirementId: `ER-${controlId}-${evidenceType.toUpperCase().replaceAll(" ", "-")}`,
        controlId,
        regulatoryControlId: regulatoryControl.id,
        evidenceType,
        mandatory: true,
        rationale
      }
    });
    evidenceRequirementsByControl.set(controlId, [...(evidenceRequirementsByControl.get(controlId) ?? []), requirement]);
  };

  await addEvidenceRequirement("OSFI-INV-001", "Regulatory Mapping Record", "Inventory controls require evidence that the system is recorded and mapped to applicable regulatory expectations.");
  await addEvidenceRequirement("OSFI-GOV-001", "Approval Record", "Governance controls require evidence of committee approval, accountable ownership, and risk acceptance.");
  await addEvidenceRequirement("OSFI-MON-001", "Monitoring Report", "Monitoring controls require evidence that thresholds, indicators, and issues are reviewed.");
  await addEvidenceRequirement("FED-DATA-001", "Data Inventory", "Data governance controls require approved data lineage, data inventory, and quality evidence.");
  await addEvidenceRequirement("FED-MON-001", "AI Risk Assessment", "Monitoring and model risk controls require a current AI risk assessment and monitoring rationale.");
  await addEvidenceRequirement("EUAI-HO-001", "Human Oversight Procedure", "Human oversight controls require documented intervention, escalation, and review procedures.");
  await addEvidenceRequirement("EUAI-RM-001", "AI Risk Assessment", "AI risk management controls require a current risk assessment and residual risk decision.");
  await addEvidenceRequirement("FCA-MON-001", "Monitoring Report", "Customer outcome monitoring controls require recurring monitoring evidence.");
  await addEvidenceRequirement("JFSA-DATA-001", "Data Inventory", "Customer data controls require evidence of approved data handling and access.");
  await addEvidenceRequirement("OCC-TPR-001", "Vendor Assessment", "Third-party controls require vendor assessment evidence when external dependencies exist.");

  const today = new Date("2026-06-13T12:00:00.000Z");
  const daysFromToday = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

  const risk = classifyRisk({
    customerFacing: true,
    internalUserFacing: true,
    personalData: true,
    materialBusinessProcess: false,
    regulatedActivity: false,
    autonomousAction: false,
    financialTransaction: false,
    externalThirdPartyDependency: true,
    dataClassification: "CONFIDENTIAL",
    recommendationOnly: true
  });

  const system = await prisma.aiSystem.create({
    data: {
      slug: "travel-brain",
      name: "Travel Brain",
      description: "Travel Brain recommends destinations, itineraries, and card-linked travel offers to retail banking customers without taking autonomous actions.",
      businessPurpose: "Increase customer engagement with travel benefits and help customers discover relevant travel options while preserving human accountability for decisions.",
      lifecycleStatus: LifecycleStatus.PRODUCTION,
      environment: SystemEnvironment.PRODUCTION,
      businessOwner: "Sarah Chen",
      technologyOwner: "Michael Thompson",
      riskOwner: "Russell",
      executiveSponsor: "David Kim",
      customerFacing: true,
      internalUserFacing: true,
      personalData: true,
      materialBusinessProcess: false,
      regulatedActivity: false,
      autonomousAction: false,
      financialTransaction: false,
      externalThirdPartyDependency: true,
      dataClassification: DataClassification.CONFIDENTIAL,
      jurisdictionsJson: JSON.stringify(["Canada", "US", "UK", "EU", "Japan"]),
      useCaseType: "Recommendation-only",
      createdAt: daysFromToday(-180),
      lastReviewDate: daysFromToday(-22),
      nextReviewDate: daysFromToday(68)
    }
  });

  await prisma.riskAssessment.create({
    data: {
      aiSystemId: system.id,
      score: risk.score,
      customerImpact: RiskLevel.MEDIUM,
      financialImpact: RiskLevel.LOW,
      privacyImpact: RiskLevel.MEDIUM,
      operationalImpact: RiskLevel.LOW,
      regulatoryImpact: RiskLevel.MEDIUM,
      autonomyLevel: RiskLevel.LOW,
      thirdPartyDependency: RiskLevel.MEDIUM,
      dataSensitivity: RiskLevel.MEDIUM,
      explainabilityNeed: RiskLevel.MEDIUM,
      hallucinationRisk: RiskLevel.MEDIUM,
      promptInjectionRisk: RiskLevel.MEDIUM,
      modelDriftRisk: RiskLevel.LOW,
      toolMisuseRisk: RiskLevel.LOW,
      autonomyRisk: RiskLevel.LOW,
      explainabilityRisk: RiskLevel.MEDIUM,
      uncontrolledAgentActions: RiskLevel.LOW,
      delegatedAuthorityRisk: RiskLevel.LOW,
      toolAbuseRisk: RiskLevel.LOW,
      approvalBypassRisk: RiskLevel.LOW,
      runawayAutomationRisk: RiskLevel.LOW,
      overallRiskTier: RiskLevel.MEDIUM,
      rationale: risk.rationale,
      factorsJson: JSON.stringify({
        ...risk.dimensions,
        hallucinationRisk: "MEDIUM",
        promptInjectionRisk: "MEDIUM",
        modelDriftRisk: "LOW",
        toolMisuseRisk: "LOW",
        autonomyRisk: "LOW",
        explainabilityRisk: "MEDIUM",
        uncontrolledAgentActions: "LOW",
        delegatedAuthorityRisk: "LOW",
        toolAbuseRisk: "LOW",
        approvalBypassRisk: "LOW",
        runawayAutomationRisk: "LOW",
        recommendationOnly: true,
        jurisdictions: ["Canada", "US", "UK", "EU", "Japan"]
      })
    }
  });

  await prisma.aiSystemComponent.createMany({
    data: [
      { aiSystemId: system.id, type: ComponentType.MODEL, name: "Travel preference ranking model", provider: "Internal ML Platform", description: "Ranks destination and itinerary recommendations using customer preferences and travel history.", criticality: RiskLevel.MEDIUM },
      { aiSystemId: system.id, type: ComponentType.PROMPT, name: "Itinerary explanation prompt", provider: "Internal Prompt Registry", description: "Generates short natural-language explanations for why a recommendation appears.", criticality: RiskLevel.MEDIUM },
      { aiSystemId: system.id, type: ComponentType.API, name: "Offers personalization API", provider: "Digital Banking Platform", description: "Returns eligible travel offers and loyalty-card benefits.", criticality: RiskLevel.MEDIUM },
      { aiSystemId: system.id, type: ComponentType.DATA_SOURCE, name: "Travel preferences and loyalty profile", provider: "Customer Data Platform", description: "Approved customer travel attributes, preference signals, and loyalty profile data.", criticality: RiskLevel.MEDIUM },
      { aiSystemId: system.id, type: ComponentType.VENDOR, name: "Destination content provider", provider: "External Travel Data Vendor", description: "Supplies destination metadata and travel content used to enrich recommendations.", criticality: RiskLevel.MEDIUM }
    ]
  });

  await prisma.aiModel.create({
    data: {
      modelId: "MODEL-TB-GPT5-001",
      aiSystemId: system.id,
      name: "GPT-5",
      provider: "OpenAI",
      version: "5",
      modelType: "Frontier large language model",
      purpose: "Travel recommendations and planning",
      fallbackModel: "Rules-based destination content fallback",
      validationStatus: ModelValidationStatus.APPROVED,
      validationDate: daysFromToday(-15),
      owner: "Michael Thompson",
      lifecycleStatus: LifecycleStatus.PRODUCTION
    }
  });

  const planningPrompt = await prisma.promptAsset.create({
    data: {
      promptId: "PROMPT-TB-PLAN-001",
      aiSystemId: system.id,
      name: "Travel Planning Prompt",
      description: "Production prompt that constrains Travel Brain to personalized travel recommendations, customer-friendly explanations, and non-execution guidance.",
      version: "1.0",
      owner: "Sarah Chen",
      approvalStatus: PromptApprovalStatus.APPROVED,
      approvedBy: "David Kim",
      approvalDate: daysFromToday(-12),
      lastModified: daysFromToday(-12)
    }
  });
  await prisma.promptVersion.createMany({
    data: [
      {
        promptAssetId: planningPrompt.id,
        version: "0.9",
        changeSummary: "Draft prompt added recommendation-only guardrails and escalation language.",
        modifiedBy: "Sarah Chen",
        modifiedAt: daysFromToday(-24)
      },
      {
        promptAssetId: planningPrompt.id,
        version: "1.0",
        changeSummary: "Approved production version with privacy, customer-facing explanation, and no-booking constraints.",
        modifiedBy: "David Kim",
        modifiedAt: daysFromToday(-12)
      }
    ]
  });

  const travelAgent = await prisma.agent.create({
    data: {
      agentId: "AGENT-TB-TRAVEL-001",
      aiSystemId: system.id,
      name: "Travel Planning Agent",
      description: "Recommendation-only agent that uses approved travel context to suggest destinations, itineraries, and benefit-aware options.",
      owner: "Sarah Chen",
      purpose: "Recommend travel options without booking, transacting, or changing customer records.",
      riskLevel: RiskLevel.MEDIUM,
      lifecycleStatus: LifecycleStatus.PRODUCTION,
      agenticLevel: 1,
      agenticLevelName: "Recommend"
    }
  });

  await prisma.aiSystemAuthority.create({
    data: {
      aiSystemId: system.id,
      delegatedAuthorityId: authorityByLevel.get(1)!.id,
      notes: "Authority Level 1: Recommend Only. Travel Brain has no execution authority and cannot book travel, write to calendars, or initiate transactions."
    }
  });

  await prisma.toolPermission.createMany({
    data: [
      {
        aiSystemId: system.id,
        toolName: "Weather API",
        permissionType: PermissionType.READ,
        approved: true,
        owner: "Michael Thompson",
        rationale: "Read-only weather context is approved to improve recommendation relevance."
      },
      {
        aiSystemId: system.id,
        toolName: "Excursion API",
        permissionType: PermissionType.READ,
        approved: true,
        owner: "Michael Thompson",
        rationale: "Read-only excursion metadata is approved for itinerary suggestions."
      },
      {
        aiSystemId: system.id,
        toolName: "Booking API",
        permissionType: PermissionType.EXECUTE,
        approved: false,
        owner: "Russell",
        rationale: "Execution authority is not approved because Travel Brain is recommendation-only."
      },
      {
        aiSystemId: system.id,
        toolName: "Calendar Write",
        permissionType: PermissionType.WRITE,
        approved: false,
        owner: "Russell",
        rationale: "Write access is not approved for a customer-facing recommendation system."
      }
    ]
  });

  await prisma.humanOversight.create({
    data: {
      aiSystemId: system.id,
      oversightRequired: true,
      oversightType: "Recommendation Review",
      reviewPoint: "Review escalated customer concerns, policy exceptions, unusual recommendations, and any proposed authority expansion.",
      escalationPath: "Sarah Chen -> Russell -> David Kim / AI Governance Committee",
      owner: "Sarah Chen"
    }
  });

  const travelRecommendAction = await prisma.agentAction.create({
    data: {
      actionId: "ACT-TB-RECOMMEND-EXCURSION",
      aiSystemId: system.id,
      name: "Recommend Excursion",
      description: "Recommend excursions based on customer travel preferences, destination, and approved content sources.",
      riskLevel: RiskLevel.MEDIUM,
      approvalRequirement: ApprovalLevel.NONE
    }
  });
  const travelDraftAction = await prisma.agentAction.create({
    data: {
      actionId: "ACT-TB-DRAFT-PACKING-LIST",
      aiSystemId: system.id,
      name: "Draft Packing List",
      description: "Draft a non-binding packing list that the customer can edit or ignore.",
      riskLevel: RiskLevel.LOW,
      approvalRequirement: ApprovalLevel.NONE
    }
  });
  const travelWeatherTool = await prisma.governedTool.create({
    data: {
      toolId: "TOOL-TB-WEATHER",
      aiSystemId: system.id,
      name: "Weather API",
      description: "Read-only weather context for destination recommendations.",
      riskLevel: RiskLevel.LOW,
      permissionType: PermissionType.READ,
      owner: "Michael Thompson",
      reviewDate: daysFromToday(-10),
      nextReviewDate: daysFromToday(80)
    }
  });
  const travelExcursionTool = await prisma.governedTool.create({
    data: {
      toolId: "TOOL-TB-EXCURSION",
      aiSystemId: system.id,
      name: "Excursion API",
      description: "Read-only excursion content source used for recommendation context.",
      riskLevel: RiskLevel.MEDIUM,
      permissionType: PermissionType.READ,
      owner: "Michael Thompson",
      reviewDate: daysFromToday(-10),
      nextReviewDate: daysFromToday(80)
    }
  });
  await prisma.executionLog.createMany({
    data: [
      {
        executionId: "EXEC-TB-001",
        aiSystemId: system.id,
        agentId: travelAgent.id,
        toolId: travelWeatherTool.id,
        actionId: travelRecommendAction.id,
        outcome: "Recommendation generated; no booking or transaction performed.",
        timestamp: daysFromToday(-2),
        initiatedBy: "Customer session",
        approvalReference: null
      },
      {
        executionId: "EXEC-TB-002",
        aiSystemId: system.id,
        agentId: travelAgent.id,
        toolId: travelExcursionTool.id,
        actionId: travelDraftAction.id,
        outcome: "Draft packing list generated for customer review.",
        timestamp: daysFromToday(-1),
        initiatedBy: "Customer session",
        approvalReference: null
      }
    ]
  });

  for (const [code] of controls) {
    await prisma.systemControl.create({
      data: {
        aiSystemId: system.id,
        controlId: createdControls.get(code)!.id,
        auditStatus: code === "PRI-001" || code === "EXP-001" ? AuditStatus.NEEDS_ATTENTION : AuditStatus.ON_TRACK,
        notes:
          code === "PRI-001"
            ? "Data minimization evidence is collected; retention approval needs final privacy sign-off."
            : code === "EXP-001"
              ? "Recommendation explanation copy is drafted and awaiting product/legal approval."
              : "Control evidence is available and operating as expected for the MVP audit window."
      }
    });
  }

  for (const [, regulatoryControl] of regulatoryControlsByCode) {
    if (!regulatoryControl.mapTravelBrain) continue;
    await prisma.aiSystemRegulatoryControl.create({
      data: {
        aiSystemId: system.id,
        regulatoryControlId: regulatoryControl.id,
        auditStatus: AuditStatus.ON_TRACK,
        notes: "Travel Brain mapping seeded for Phase 2 regulatory traceability. Evidence is sampled where available and gaps remain visible at the requirement level."
      }
    });
  }

  await prisma.evidenceItem.createMany({
    data: [
      { aiSystemId: system.id, regulatoryControlId: regulatoryControlsByCode.get("OSFI-GOV-001")?.id, title: "AI governance committee approval", controlCode: "GOV-001", status: EvidenceStatus.REVIEWED, owner: "David Kim", dueDate: daysFromToday(30), lastReviewedAt: daysFromToday(-9), location: "governance/travel-brain-approval.pdf" },
      { aiSystemId: system.id, regulatoryControlId: regulatoryControlsByCode.get("FED-MON-001")?.id, title: "Model risk assessment memo", controlCode: "MRM-001", status: EvidenceStatus.COLLECTED, owner: "Michael Thompson", dueDate: daysFromToday(14), location: "model-risk/travel-brain-assessment.md" },
      { aiSystemId: system.id, regulatoryControlId: regulatoryControlsByCode.get("JFSA-DATA-001")?.id, title: "Personal data inventory and retention approval", controlCode: "PRI-001", status: EvidenceStatus.REQUESTED, owner: "Sarah Chen", dueDate: daysFromToday(7), location: "privacy/data-inventory.xlsx" },
      { aiSystemId: system.id, regulatoryControlId: regulatoryControlsByCode.get("FDIC-EV-001")?.id, title: "Access review export", controlCode: "SEC-001", status: EvidenceStatus.REVIEWED, owner: "Michael Thompson", dueDate: daysFromToday(45), lastReviewedAt: daysFromToday(-4), location: "security/access-review.csv" },
      { aiSystemId: system.id, regulatoryControlId: regulatoryControlsByCode.get("EUAI-HO-001")?.id, title: "User recommendation explanation approval", controlCode: "EXP-001", status: EvidenceStatus.COLLECTED, owner: "Sarah Chen", dueDate: daysFromToday(10), location: "product/explainability-copy.docx" },
      { aiSystemId: system.id, regulatoryControlId: regulatoryControlsByCode.get("FCA-OR-001")?.id, title: "Incident response tabletop notes", controlCode: "OPS-001", status: EvidenceStatus.NOT_STARTED, owner: "Michael Thompson", dueDate: daysFromToday(21), location: "resilience/tabletop-notes.md" }
    ]
  });

  const createEvidenceObject = async (input: {
    evidenceId: string;
    aiSystemId: string;
    title: string;
    description: string;
    evidenceType: string;
    version: string;
    status: EvidenceObjectStatus;
    owner: string;
    reviewer: string;
    source: string;
    approvalDate?: Date;
    expirationDate: Date;
    requirementControlIds: string[];
  }) => {
    const object = await prisma.evidenceObject.create({
      data: {
        evidenceId: input.evidenceId,
        aiSystemId: input.aiSystemId,
        title: input.title,
        description: input.description,
        evidenceType: input.evidenceType,
        version: input.version,
        status: input.status,
        owner: input.owner,
        reviewer: input.reviewer,
        source: input.source,
        approvalDate: input.approvalDate,
        expirationDate: input.expirationDate,
        createdDate: daysFromToday(-20),
        lastUpdated: daysFromToday(-5)
      }
    });
    for (const controlId of input.requirementControlIds) {
      for (const requirement of evidenceRequirementsByControl.get(controlId) ?? []) {
        if ((await prisma.evidenceRequirement.findUnique({ where: { id: requirement.id } }))?.evidenceType === input.evidenceType) {
          await prisma.evidenceObjectRequirement.create({
            data: { evidenceObjectId: object.id, evidenceRequirementId: requirement.id }
          });
        }
      }
    }
    return object;
  };

  await createEvidenceObject({
    evidenceId: "EV-TB-RISK-001",
    aiSystemId: system.id,
    title: "Travel Brain AI Risk Assessment",
    description: "Approved multi-dimensional risk assessment for Travel Brain production use.",
    evidenceType: "AI Risk Assessment",
    version: "1.0",
    status: EvidenceObjectStatus.APPROVED,
    owner: "Russell",
    reviewer: "Jennifer Patel",
    source: "model-risk/travel-brain-risk-assessment.pdf",
    approvalDate: daysFromToday(-18),
    expirationDate: daysFromToday(180),
    requirementControlIds: ["FED-MON-001", "EUAI-RM-001"]
  });
  await createEvidenceObject({
    evidenceId: "EV-TB-ARCH-001",
    aiSystemId: system.id,
    title: "Travel Brain Architecture Diagram",
    description: "System architecture showing model, prompt, API, data source, and vendor dependency.",
    evidenceType: "Architecture Diagram",
    version: "1.2",
    status: EvidenceObjectStatus.APPROVED,
    owner: "Michael Thompson",
    reviewer: "Jennifer Patel",
    source: "architecture/travel-brain-architecture.png",
    approvalDate: daysFromToday(-16),
    expirationDate: daysFromToday(220),
    requirementControlIds: []
  });
  await createEvidenceObject({
    evidenceId: "EV-TB-DATA-001",
    aiSystemId: system.id,
    title: "Travel Brain Data Inventory",
    description: "Approved inventory of personal travel data, loyalty attributes, and approved data retention.",
    evidenceType: "Data Inventory",
    version: "1.1",
    status: EvidenceObjectStatus.APPROVED,
    owner: "Sarah Chen",
    reviewer: "Jennifer Patel",
    source: "privacy/travel-brain-data-inventory.xlsx",
    approvalDate: daysFromToday(-12),
    expirationDate: daysFromToday(160),
    requirementControlIds: ["FED-DATA-001", "JFSA-DATA-001"]
  });
  await createEvidenceObject({
    evidenceId: "EV-TB-HO-001",
    aiSystemId: system.id,
    title: "Travel Brain Human Oversight Procedure",
    description: "Procedure for customer complaints, recommendation review, escalation, and manual intervention.",
    evidenceType: "Human Oversight Procedure",
    version: "1.0",
    status: EvidenceObjectStatus.APPROVED,
    owner: "Sarah Chen",
    reviewer: "David Kim",
    source: "oversight/travel-brain-human-oversight.md",
    approvalDate: daysFromToday(-10),
    expirationDate: daysFromToday(200),
    requirementControlIds: ["EUAI-HO-001"]
  });
  await createEvidenceObject({
    evidenceId: "EV-TB-APP-001",
    aiSystemId: system.id,
    title: "Travel Brain Approval Record",
    description: "AI Governance Committee approval and production authorization record.",
    evidenceType: "Approval Record",
    version: "1.0",
    status: EvidenceObjectStatus.APPROVED,
    owner: "David Kim",
    reviewer: "Jennifer Patel",
    source: "governance/travel-brain-approval.pdf",
    approvalDate: daysFromToday(-20),
    expirationDate: daysFromToday(240),
    requirementControlIds: ["OSFI-GOV-001"]
  });
  await createEvidenceObject({
    evidenceId: "EV-TB-MON-001",
    aiSystemId: system.id,
    title: "Travel Brain Monitoring Report",
    description: "Monthly control and performance monitoring report for Travel Brain.",
    evidenceType: "Monitoring Report",
    version: "2026.06",
    status: EvidenceObjectStatus.APPROVED,
    owner: "Michael Thompson",
    reviewer: "Russell",
    source: "monitoring/travel-brain-june-report.pdf",
    approvalDate: daysFromToday(-3),
    expirationDate: daysFromToday(75),
    requirementControlIds: ["OSFI-MON-001", "FCA-MON-001"]
  });
  await createEvidenceObject({
    evidenceId: "EV-TB-REGMAP-001",
    aiSystemId: system.id,
    title: "Travel Brain Regulatory Mapping Record",
    description: "Traceability record linking Travel Brain to applicable regulatory controls and requirements.",
    evidenceType: "Regulatory Mapping Record",
    version: "1.0",
    status: EvidenceObjectStatus.APPROVED,
    owner: "Russell",
    reviewer: "Jennifer Patel",
    source: "regulatory/travel-brain-mapping-record.xlsx",
    approvalDate: daysFromToday(-8),
    expirationDate: daysFromToday(180),
    requirementControlIds: ["OSFI-INV-001"]
  });
  await createEvidenceObject({
    evidenceId: "EV-TB-VENDOR-001",
    aiSystemId: system.id,
    title: "Travel Brain Vendor Assessment",
    description: "Assessment of external destination content provider dependency and monitoring obligations.",
    evidenceType: "Vendor Assessment",
    version: "1.0",
    status: EvidenceObjectStatus.APPROVED,
    owner: "Michael Thompson",
    reviewer: "Russell",
    source: "third-party/travel-brain-vendor-assessment.pdf",
    approvalDate: daysFromToday(-14),
    expirationDate: daysFromToday(150),
    requirementControlIds: ["OCC-TPR-001"]
  });

  await prisma.auditEvent.createMany({
    data: [
      { aiSystemId: system.id, eventType: "AI system registered", summary: "Travel Brain onboarded to the AI System Registry with executive sponsorship and named risk ownership.", actor: "Russell" },
      { aiSystemId: system.id, eventType: "Risk classification", summary: "Travel Brain classified as medium risk across customer, privacy, third-party, data sensitivity, and explainability dimensions.", actor: "Risk engine" },
      { aiSystemId: system.id, eventType: "Evidence review", summary: "Governance approval and access review evidence marked reviewed.", actor: "Jennifer Patel" },
      { aiSystemId: system.id, eventType: "Control exception", summary: "Privacy retention approval and explainability copy require follow-up.", actor: "Russell" }
    ]
  });

  const paymentSystem = await prisma.aiSystem.create({
    data: {
      slug: "autonomous-payment-agent",
      name: "Autonomous Payment Agent",
      description: "Level 4 agentic AI case study that can execute payment transactions through approved payment APIs subject to approval workflow and emergency stop controls.",
      businessPurpose: "Automate low-value payment exception handling while demonstrating governance requirements for autonomous financial actions.",
      lifecycleStatus: LifecycleStatus.TESTING,
      environment: SystemEnvironment.NON_PRODUCTION,
      businessOwner: "Sarah Chen",
      technologyOwner: "Michael Thompson",
      riskOwner: "Russell",
      executiveSponsor: "David Kim",
      customerFacing: false,
      internalUserFacing: true,
      personalData: true,
      materialBusinessProcess: true,
      regulatedActivity: true,
      autonomousAction: true,
      financialTransaction: true,
      externalThirdPartyDependency: true,
      dataClassification: DataClassification.RESTRICTED,
      jurisdictionsJson: JSON.stringify(["Canada", "US"]),
      useCaseType: "Autonomous payment execution",
      createdAt: daysFromToday(-45),
      lastReviewDate: daysFromToday(-20),
      nextReviewDate: daysFromToday(25)
    }
  });

  await prisma.riskAssessment.create({
    data: {
      aiSystemId: paymentSystem.id,
      score: 92,
      customerImpact: RiskLevel.HIGH,
      financialImpact: RiskLevel.CRITICAL,
      privacyImpact: RiskLevel.HIGH,
      operationalImpact: RiskLevel.HIGH,
      regulatoryImpact: RiskLevel.CRITICAL,
      autonomyLevel: RiskLevel.CRITICAL,
      thirdPartyDependency: RiskLevel.HIGH,
      dataSensitivity: RiskLevel.CRITICAL,
      explainabilityNeed: RiskLevel.HIGH,
      hallucinationRisk: RiskLevel.HIGH,
      promptInjectionRisk: RiskLevel.HIGH,
      modelDriftRisk: RiskLevel.MEDIUM,
      toolMisuseRisk: RiskLevel.CRITICAL,
      autonomyRisk: RiskLevel.CRITICAL,
      explainabilityRisk: RiskLevel.HIGH,
      uncontrolledAgentActions: RiskLevel.CRITICAL,
      delegatedAuthorityRisk: RiskLevel.CRITICAL,
      toolAbuseRisk: RiskLevel.CRITICAL,
      approvalBypassRisk: RiskLevel.HIGH,
      runawayAutomationRisk: RiskLevel.CRITICAL,
      overallRiskTier: RiskLevel.CRITICAL,
      rationale: "Critical risk because the system can execute payment transactions, uses restricted data, performs regulated activity, and depends on payment APIs.",
      factorsJson: JSON.stringify({
        autonomousAction: true,
        financialTransaction: true,
        agenticLevel: 4,
        paymentApis: true,
        approvalRequired: true,
        killSwitchStatus: "NOT_TESTED"
      })
    }
  });

  await prisma.aiSystemComponent.createMany({
    data: [
      { aiSystemId: paymentSystem.id, type: ComponentType.AGENT, name: "Payment Execution Agent", provider: "Internal Agent Runtime", description: "Executes approved low-value payment exception transactions.", criticality: RiskLevel.CRITICAL },
      { aiSystemId: paymentSystem.id, type: ComponentType.API, name: "Payment API", provider: "Core Payments Platform", description: "Executes approved payment transactions.", criticality: RiskLevel.CRITICAL },
      { aiSystemId: paymentSystem.id, type: ComponentType.VENDOR, name: "Payment fraud signal provider", provider: "External Risk Data Vendor", description: "Provides read-only payment fraud risk indicators.", criticality: RiskLevel.HIGH }
    ]
  });

  await prisma.aiModel.create({
    data: {
      modelId: "MODEL-APA-DECISION-001",
      aiSystemId: paymentSystem.id,
      name: "Payment Policy Reasoning Model",
      provider: "Internal AI Platform",
      version: "0.8",
      modelType: "Agentic decision model",
      purpose: "Determine whether a payment exception qualifies for automated execution.",
      fallbackModel: "Manual payment operations queue",
      validationStatus: ModelValidationStatus.APPROVED,
      validationDate: daysFromToday(-18),
      owner: "Michael Thompson",
      lifecycleStatus: LifecycleStatus.TESTING
    }
  });

  const paymentPrompt = await prisma.promptAsset.create({
    data: {
      promptId: "PROMPT-APA-PAYMENT-001",
      aiSystemId: paymentSystem.id,
      name: "Payment Execution Policy Prompt",
      description: "Constrains the agent to approved payment exception criteria, approval checks, fraud checks, and execution logging requirements.",
      version: "0.8",
      owner: "Michael Thompson",
      approvalStatus: PromptApprovalStatus.APPROVED,
      approvedBy: "David Kim",
      approvalDate: daysFromToday(-12),
      lastModified: daysFromToday(-12)
    }
  });
  await prisma.promptVersion.create({
    data: {
      promptAssetId: paymentPrompt.id,
      version: "0.8",
      changeSummary: "Approved pilot prompt for non-production autonomous payment execution testing.",
      modifiedBy: "David Kim",
      modifiedAt: daysFromToday(-12)
    }
  });

  const paymentAgent = await prisma.agent.create({
    data: {
      agentId: "AGENT-APA-PAYMENT-001",
      aiSystemId: paymentSystem.id,
      name: "Autonomous Payment Agent",
      description: "Level 4 agent that can execute approved payment transactions through payment APIs.",
      owner: "Michael Thompson",
      purpose: "Execute approved payment exception transactions with approval evidence, logging, and emergency stop controls.",
      riskLevel: RiskLevel.CRITICAL,
      lifecycleStatus: LifecycleStatus.TESTING,
      agenticLevel: 4,
      agenticLevelName: "Execute Autonomously"
    }
  });

  await prisma.aiSystemAuthority.create({
    data: {
      aiSystemId: paymentSystem.id,
      delegatedAuthorityId: authorityByLevel.get(4)!.id,
      notes: "Authority Level 4 pilot: autonomous execution is limited to non-production payment exception testing and requires approval evidence before production."
    }
  });

  await prisma.humanOversight.create({
    data: {
      aiSystemId: paymentSystem.id,
      oversightRequired: true,
      oversightType: "Pre-execution approval and post-execution review",
      reviewPoint: "Dual approval before high-impact execution and daily review of execution logs.",
      escalationPath: "Payment Operations -> Russell -> David Kim / AI Governance Committee",
      owner: "Russell"
    }
  });

  await prisma.toolPermission.createMany({
    data: [
      { aiSystemId: paymentSystem.id, toolName: "Payment API", permissionType: PermissionType.EXECUTE, approved: true, owner: "Michael Thompson", rationale: "Approved for non-production execution testing with approval workflow and logging." },
      { aiSystemId: paymentSystem.id, toolName: "Fraud Signal API", permissionType: PermissionType.READ, approved: true, owner: "Michael Thompson", rationale: "Read-only fraud signal context supports payment exception decisions." },
      { aiSystemId: paymentSystem.id, toolName: "Customer Record API", permissionType: PermissionType.WRITE, approved: false, owner: "Russell", rationale: "Record modification remains prohibited until governance committee approval." }
    ]
  });

  const paymentApiTool = await prisma.governedTool.create({
    data: {
      toolId: "TOOL-APA-PAYMENT-API",
      aiSystemId: paymentSystem.id,
      name: "Payment API",
      description: "Execute approved low-value payment exception transactions.",
      riskLevel: RiskLevel.CRITICAL,
      permissionType: PermissionType.EXECUTE,
      owner: "Michael Thompson",
      reviewDate: daysFromToday(-18),
      nextReviewDate: daysFromToday(12)
    }
  });
  const fraudTool = await prisma.governedTool.create({
    data: {
      toolId: "TOOL-APA-FRAUD-SIGNAL",
      aiSystemId: paymentSystem.id,
      name: "Fraud Signal API",
      description: "Read payment fraud risk indicators before execution.",
      riskLevel: RiskLevel.HIGH,
      permissionType: PermissionType.READ,
      owner: "Michael Thompson",
      reviewDate: daysFromToday(-18),
      nextReviewDate: daysFromToday(12)
    }
  });

  const executePaymentAction = await prisma.agentAction.create({
    data: {
      actionId: "ACT-APA-EXECUTE-TRANSACTION",
      aiSystemId: paymentSystem.id,
      name: "Execute Transactions",
      description: "Execute an approved payment transaction through the payment API.",
      riskLevel: RiskLevel.CRITICAL,
      approvalRequirement: ApprovalLevel.DUAL_APPROVAL
    }
  });
  const spendMoneyAction = await prisma.agentAction.create({
    data: {
      actionId: "ACT-APA-SPEND-MONEY",
      aiSystemId: paymentSystem.id,
      name: "Spend Money",
      description: "Release funds as part of payment exception settlement.",
      riskLevel: RiskLevel.CRITICAL,
      approvalRequirement: ApprovalLevel.COMMITTEE_APPROVAL
    }
  });

  await prisma.killSwitch.create({
    data: {
      aiSystemId: paymentSystem.id,
      enabled: true,
      owner: "Michael Thompson",
      lastTested: null,
      status: "NOT_TESTED"
    }
  });

  await prisma.executionLog.createMany({
    data: [
      {
        executionId: "EXEC-APA-001",
        aiSystemId: paymentSystem.id,
        agentId: paymentAgent.id,
        toolId: fraudTool.id,
        actionId: executePaymentAction.id,
        approvalWorkflowId: approvalWorkflows.get("AWF-DUAL-001")!.id,
        outcome: "Fraud signal checked; execution allowed in non-production test.",
        timestamp: daysFromToday(-3),
        initiatedBy: "Payment operations pilot",
        approvalReference: "APR-APA-2026-001"
      },
      {
        executionId: "EXEC-APA-002",
        aiSystemId: paymentSystem.id,
        agentId: paymentAgent.id,
        toolId: paymentApiTool.id,
        actionId: spendMoneyAction.id,
        approvalWorkflowId: approvalWorkflows.get("AWF-COMMITTEE-001")!.id,
        outcome: "Non-production payment execution simulated and logged.",
        timestamp: daysFromToday(-2),
        initiatedBy: "Payment operations pilot",
        approvalReference: "APR-APA-2026-002"
      }
    ]
  });

  for (const [code] of controls.filter(([code]) => code.startsWith("AI-AGENT-") || code === "HUM-001" || code === "AUD-001" || code === "OPS-001")) {
    await prisma.systemControl.create({
      data: {
        aiSystemId: paymentSystem.id,
        controlId: createdControls.get(code)!.id,
        auditStatus: code === "AI-AGENT-007" ? AuditStatus.BLOCKED : code === "AI-AGENT-009" ? AuditStatus.NEEDS_ATTENTION : AuditStatus.ON_TRACK,
        notes:
          code === "AI-AGENT-007"
            ? "Kill switch exists but has not been tested; production execution is blocked."
            : code === "AI-AGENT-009"
              ? "Approval evidence exists for pilot runs; production evidence standard is not finalized."
              : "Agentic control is seeded for the autonomous payment pilot."
      }
    });
  }

  await prisma.auditEvent.createMany({
    data: [
      { aiSystemId: paymentSystem.id, eventType: "Agentic AI system registered", summary: "Autonomous Payment Agent added as Level 4 autonomous execution case study.", actor: "Russell" },
      { aiSystemId: paymentSystem.id, eventType: "Kill switch gap identified", summary: "Emergency stop control exists but test evidence is missing, blocking production readiness.", actor: "Monitoring engine" }
    ]
  });

  const legacySystem = await prisma.aiSystem.create({
    data: {
      slug: "legacy-branch-assistant",
      name: "Legacy Branch Assistant",
      description: "A branch pilot assistant used for internal FAQ responses. It is intentionally incomplete in the seed to demonstrate continuous monitoring findings.",
      businessPurpose: "Support branch employees with policy and product lookup during a pilot.",
      lifecycleStatus: LifecycleStatus.TESTING,
      environment: SystemEnvironment.NON_PRODUCTION,
      businessOwner: "Sarah Chen",
      technologyOwner: "Michael Thompson",
      riskOwner: "",
      executiveSponsor: "David Kim",
      customerFacing: false,
      internalUserFacing: true,
      personalData: false,
      materialBusinessProcess: false,
      regulatedActivity: false,
      autonomousAction: false,
      financialTransaction: false,
      externalThirdPartyDependency: true,
      dataClassification: DataClassification.INTERNAL,
      jurisdictionsJson: JSON.stringify(["Canada"]),
      useCaseType: "Internal assistant pilot",
      createdAt: daysFromToday(-90),
      lastReviewDate: daysFromToday(-75),
      nextReviewDate: daysFromToday(-10)
    }
  });

  await prisma.aiSystemComponent.createMany({
    data: [
      {
        aiSystemId: legacySystem.id,
        type: ComponentType.PROMPT,
        name: "Branch policy FAQ prompt",
        provider: "Internal Prompt Registry",
        description: "Prompt used to summarize branch policy snippets for employees.",
        criticality: RiskLevel.LOW
      }
    ]
  });

  for (const controlId of ["OSFI-MON-001", "EUAI-HO-001"]) {
    const regulatoryControl = regulatoryControlsByCode.get(controlId);
    if (regulatoryControl) {
      await prisma.aiSystemRegulatoryControl.create({
        data: {
          aiSystemId: legacySystem.id,
          regulatoryControlId: regulatoryControl.id,
          auditStatus: AuditStatus.NEEDS_ATTENTION,
          notes: "Mapped for Phase 4 audit finding case study to demonstrate evidence governance gaps."
        }
      });
    }
  }

  await createEvidenceObject({
    evidenceId: "EV-LBA-MON-OLD-001",
    aiSystemId: legacySystem.id,
    title: "Legacy Branch Assistant Monitoring Report",
    description: "Expired pilot monitoring report retained as a case-study artifact.",
    evidenceType: "Monitoring Report",
    version: "0.3",
    status: EvidenceObjectStatus.APPROVED,
    owner: "Michael Thompson",
    reviewer: "Jennifer Patel",
    source: "monitoring/legacy-branch-assistant-old-report.pdf",
    approvalDate: daysFromToday(-120),
    expirationDate: daysFromToday(-15),
    requirementControlIds: ["OSFI-MON-001"]
  });

  const monitoringDate = daysFromToday(0);
  await calculateEvidenceHealth(prisma, monitoringDate);
  const monitoring = await runMonitoring(prisma, monitoringDate);
  const acceptedFinding = monitoring.generatedFindings.find((finding) =>
    finding.findingId.includes("CCM-007-legacy-branch-assistant")
  );

  if (acceptedFinding) {
    await prisma.finding.update({
      where: { id: acceptedFinding.id },
      data: { status: FindingStatus.ACCEPTED }
    });
    await prisma.exception.create({
      data: {
        exceptionId: "EXC-LEGACY-EVIDENCE-001",
        findingId: acceptedFinding.id,
        rationale:
          "Temporary acceptance for the non-production pilot while the branch team refreshes monitoring evidence and drafts the missing human oversight procedure. The pilot cannot move to production until evidence health is current.",
        approvedBy: "David Kim",
        approvalDate: monitoringDate,
        expirationDate: daysFromToday(30)
      }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
