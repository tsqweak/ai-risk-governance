import {
  ApprovalLevel,
  AuditStatus,
  AiRiskStatus,
  AssetCriticality,
  AssetDiscoveryAssetType,
  AssetDiscoveryDisposition,
  AssetDiscoveryFindingStatus,
  AssetDiscoveryFindingType,
  AssetDiscoveryConfidenceLevel,
  AssetDiscoveryRunStatus,
  AssetDiscoverySourceType,
  AssetDiscoveryValidationStatus,
  AssetStatus,
  AssetType,
  AutomationLevel,
  AssuranceRuleStatus,
  ArtifactDriftType,
  ComponentType,
  ControlImplementationStatus,
  ControlCategory,
  DataClassification,
  DiscoveredComponentType,
  DiscoveredEvidenceSourceType,
  EvidenceArtifactType,
  EvidenceCollectionStatus,
  EvidenceObjectStatus,
  EvidenceStatus,
  EvidenceSourceType,
  EvidenceValidationValue,
  FreshnessStatus,
  FindingSeverity,
  FindingStatus,
  LifecycleApprovalStatus,
  LifecycleStatus,
  DeploymentDriftType,
  DeploymentEvidenceHealth,
  LogSourceStatus,
  LogSourceType,
  ManifestValidationStatus,
  McpConnectionStatus,
  McpEvidenceHealth,
  McpEvidenceType,
  ModelValidationStatus,
  NotionConnectionStatus,
  NotionEvidenceHealth,
  NotionEvidenceType,
  PermissionType,
  PortainerConnectionStatus,
  PromptApprovalStatus,
  SecretEvidenceHealth,
  SecretEvidenceType,
  SecretSourceSystem,
  SecretsConnectionStatus,
  PrismaClient,
  RepositoryReviewStatus,
  RepositoryConnectionStatus,
  RepositoryType,
  RiskLevel,
  RiskTreatment,
  SupabaseConnectionStatus,
  SupabaseDriftType,
  SupabaseEvidenceHealth,
  SupabaseEvidenceType,
  RuntimeEvidenceHealth,
  RuntimeEvidenceType,
  SystemEnvironment
} from "@prisma/client";
import { classifyRisk } from "@airg/risk-engine";
import { calculateEvidenceHealth, runMonitoring, seedControlTests } from "@airg/monitoring-engine";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { Client } from "pg";

loadLocalEnv();

const prisma = new PrismaClient();

function loadLocalEnv() {
  const candidates = [
    join(process.cwd(), ".env"),
    join(process.cwd(), ".env.local"),
    join(process.cwd(), "..", "..", ".env"),
    join(process.cwd(), "..", "..", ".env.local"),
    join(process.cwd(), "apps", "web", ".env"),
    join(process.cwd(), "apps", "web", ".env.local"),
    join(process.cwd(), "..", "..", "apps", "web", ".env"),
    join(process.cwd(), "..", "..", "apps", "web", ".env.local")
  ];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;
    const contents = readFileSync(filePath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
      const separatorIndex = normalized.indexOf("=");
      if (separatorIndex <= 0) continue;
      const key = normalized.slice(0, separatorIndex).trim();
      if (process.env[key] !== undefined) continue;
      let value = normalized.slice(separatorIndex + 1).trim();
      if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

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
  ["AI-AGENT-010", "Agentic incident response defined", ControlCategory.OPERATIONAL_RESILIENCE, "Define escalation, rollback, suspension, and incident response for agentic automation.", "Resilience Lead", "Quarterly"],
  ["AI-LC-001", "Intake completed", ControlCategory.GOVERNANCE, "Confirm the AI intake record is complete before lifecycle advancement.", "AI Governance Lead", "Per stage gate"],
  ["AI-LC-002", "Risk assessment approved", ControlCategory.MODEL_RISK, "Confirm the multi-dimensional AI risk assessment is approved before development or testing advancement.", "Risk Owner", "Per stage gate"],
  ["AI-LC-003", "Regulatory mapping complete", ControlCategory.GOVERNANCE, "Confirm applicable regulatory obligations are mapped to controls and evidence before testing.", "Compliance Lead", "Per stage gate"],
  ["AI-LC-004", "Evidence complete", ControlCategory.AUDITABILITY, "Confirm required lifecycle, regulatory, and control evidence is complete before pilot or production advancement.", "Audit Liaison", "Per stage gate"],
  ["AI-LC-005", "Validation complete", ControlCategory.MODEL_RISK, "Confirm model, prompt, agentic, resilience, and oversight validation are complete before pilot or production advancement.", "Model Risk Manager", "Per stage gate"],
  ["AI-LC-006", "Production approval granted", ControlCategory.GOVERNANCE, "Confirm AI Governance Committee production approval is granted before production use.", "AI Governance Committee", "Per production release"],
  ["AI-LC-007", "Retirement approved", ControlCategory.GOVERNANCE, "Confirm retirement approval, evidence preservation, access removal, and residual obligation closure.", "AI Governance Committee", "Per retirement"]
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
  "Lifecycle Approval",
  "Stage Gate Record",
  "Human Oversight Procedure",
  "Monitoring Report",
  "Control Testing Report",
  "Regulatory Mapping Record"
] as const;

const aiRiskCategories = [
  "Hallucination Risk",
  "Prompt Injection Risk",
  "Model Drift Risk",
  "Privacy Risk",
  "Bias Risk",
  "Explainability Risk",
  "Autonomy Risk",
  "Tool Misuse Risk"
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
  "AI-AGENT-010": [["FCA", "Maintain operational resilience response and escalation.", "Operational Resilience"]],
  "AI-LC-001": [["OSFI E-23", "Maintain governed model and AI intake before use.", "Inventory"], ["NIST AI RMF", "Identify and govern AI systems across lifecycle.", "GOVERN-1"]],
  "AI-LC-002": [["OSFI E-23", "Approve risk tiering and model risk classification.", "Governance"], ["EU AI Act", "Maintain lifecycle risk management.", "Article 9"]],
  "AI-LC-003": [["OCC", "Map AI use to applicable supervisory obligations.", "Governance"], ["FCA", "Demonstrate accountability for AI-enabled services.", "Governance"]],
  "AI-LC-004": [["FDIC", "Retain evidence supporting control operation.", "Evidence"], ["EU AI Act", "Maintain technical documentation and records.", "Articles 11-12"]],
  "AI-LC-005": [["Federal Reserve SR 11-7", "Validate model use, limits, and performance before deployment.", "Validation"], ["OSFI E-23", "Validate design, assumptions, limitations, and performance.", "Validation"]],
  "AI-LC-006": [["OSFI E-23", "Require governance approval for high-impact production use.", "Governance"], ["OCC", "Evidence senior management oversight of material AI risk.", "Governance"]],
  "AI-LC-007": [["FCA", "Manage operational resilience and safe decommissioning.", "Operational Resilience"], ["NIST AI RMF", "Manage AI system retirement and residual risks.", "MANAGE-4"]]
};

const governanceStories: Record<string, {
  riskStatement: string;
  controlObjective: string;
  evidenceNarrative: string;
  validationNarrative: string;
  monitoringNarrative: string;
  failureScenario: string;
  ownerNarrative: string;
  executiveSummary: string;
}> = {
  "AI-GOV-003": {
    riskStatement: "Travel Brain recommendations could change materially if the production prompt is altered without review, creating inaccurate guidance, privacy leakage, or inconsistent planning behavior.",
    controlObjective: "Ensure the Travel Brain prompt is approved, reviewable, versioned, and bounded before it influences planning recommendations.",
    evidenceNarrative: "The collected `prompts/travel-planner.md` artifact shows the actual Travel Brain prompt content used to govern Marisol's behavior, including source-of-truth instructions, boundaries, approval language, and human confirmation expectations.",
    validationNarrative: "Assurance rules validate that prompt content exists, owner context is present, version or source-of-truth language exists, approval language is present, prohibited actions are bounded, and human escalation language is included.",
    monitoringNarrative: "Governance detects failure through GitHub artifact collection, prompt hash drift, assurance rule failures, stale evidence freshness, and future workflow checks that should flag prompt changes without review.",
    failureScenario: "This control fails if the prompt is changed without review, approval language is removed, prohibited actions are weakened, the prompt source is missing, or a new prompt is introduced outside the governed repository path.",
    ownerNarrative: "The AI Governance Lead owns prompt approval. Russell is the current Travel Brain risk and business owner accountable for reviewing prompt changes before production use.",
    executiveSummary: "This control matters because the prompt shapes Travel Brain behavior. Keeping it reviewed and bounded helps ensure recommendations remain trustworthy."
  },
  "AI-GOV-006": {
    riskStatement: "Travel Brain could misuse tools, access unapproved services, or take actions beyond its intended read-only authority if tool permissions are not explicitly approved and denied actions are not documented.",
    controlObjective: "Ensure Travel Brain tool access is approved, bounded, and aligned to delegated authority before tools are used in planning, retrieval, or publishing workflows.",
    evidenceNarrative: "The collected `governance/tool-policy.yaml` artifact defines approved read-only tools, constraints, denied actions, and human review requirements. The prompt also reinforces prohibited action boundaries.",
    validationNarrative: "Assurance rules validate approved tooling, denied or prohibited actions, authority limits, and human review requirements in the policy artifact, with supplemental prompt checks for prohibited actions.",
    monitoringNarrative: "Governance detects failure through policy artifact collection, policy hash drift, assurance rule failures, stale evidence, and future MCP/tool inventory comparison against the approved policy.",
    failureScenario: "This control fails if an unauthorized tool is added, denied actions are removed, write or administrative authority is granted without approval, or the policy no longer matches the actual MCP/tool runtime.",
    ownerNarrative: "The Security Lead owns tool permission approval. Russell is accountable for ensuring Travel Brain tools remain consistent with approved policy and delegated authority.",
    executiveSummary: "This control matters because tools turn AI recommendations into actions. Approved tool boundaries reduce the chance of unauthorized or unsafe behavior."
  },
  "AUD-001": {
    riskStatement: "Travel Brain governance could become unprovable if control tests, evidence records, and change history are not retained and traceable during audit or incident review.",
    controlObjective: "Ensure Travel Brain maintains a durable audit trail that links governance files, control tests, evidence artifacts, and review activity.",
    evidenceNarrative: "The collected `.github/workflows/control-tests.yaml` artifact shows the governance control testing workflow that checks required governance files and retains a repeatable validation path in GitHub.",
    validationNarrative: "Assurance rules validate that the workflow exists in the expected GitHub Actions location and references governance control tests. Current assurance warns that monitoring/result artifact references are still thin.",
    monitoringNarrative: "Governance detects failure through workflow artifact collection, workflow hash drift, missing workflow checks, failed control tests, and future workflow-run artifact collection.",
    failureScenario: "This control fails if the workflow is removed, required governance file checks are deleted, monitoring outputs are not retained, control-test results are unavailable, or evidence cannot be traced back to source and commit.",
    ownerNarrative: "The Audit Liaison owns audit trail completeness. Russell is accountable for ensuring Travel Brain evidence remains reviewable and reproducible.",
    executiveSummary: "This control matters because governance is only credible when proof can be reproduced. The workflow helps show that required evidence files are checked consistently."
  }
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

async function seedRepositoryDiscovery() {
  const travelBrain = await prisma.repositoryDiscovery.create({
    data: {
      name: "travel-brain",
      description: "Repository discovery profile for the Travel Brain AI travel recommendation assistant.",
      location: "https://github.com/local-reference/travel-brain",
      repositoryType: RepositoryType.GITHUB,
      reviewStatus: RepositoryReviewStatus.SUGGESTED,
      suggestedSystemType: "Assistant",
      suggestedAgenticLevel: 1,
      suggestedAuthorityLevel: 1,
      suggestedLifecycleStage: LifecycleStatus.PRODUCTION,
      suggestedJurisdictionsJson: JSON.stringify(["Canada", "United States", "United Kingdom", "European Union", "Japan"]),
      suggestedRiskDomainsJson: JSON.stringify(["Hallucination Risk", "Privacy Risk", "Explainability Risk", "Third-Party Risk", "Tool Misuse Risk"]),
      suggestedControlsJson: JSON.stringify(["AI-GOV-001", "AI-GOV-002", "AI-GOV-004", "AI-GOV-005", "AI-GOV-006", "AI-GOV-008", "AI-LC-004", "AI-LC-006"]),
      suggestedRisksJson: JSON.stringify(["Hallucinated Recommendation", "Privacy Exposure", "Incorrect Travel Guidance"]),
      rationale: "Repository scan suggests a customer-facing AI assistant with prompt assets, external APIs, configuration files, monitoring outputs, and governance policy artifacts. The profile is suggested only and requires human governance review before activation.",
      reviewer: "Jennifer Patel",
      components: {
        create: [
          { componentType: DiscoveredComponentType.MODEL, name: "GPT-5 recommendation model", location: "config/model.json", rationale: "Model configuration references an OpenAI GPT-5 profile for travel recommendation generation." },
          { componentType: DiscoveredComponentType.PROMPT, name: "Travel planning prompt", location: "prompts/travel-planner.md", rationale: "Prompt file defines recommendation behavior, customer constraints, and escalation language." },
          { componentType: DiscoveredComponentType.AGENT, name: "Travel Brain assistant", location: "src/agents/travelBrainAgent.ts", rationale: "Agent orchestration file coordinates prompt, model, and read-only travel tools." },
          { componentType: DiscoveredComponentType.TOOL, name: "Weather API", location: "src/tools/weather.ts", rationale: "External API tool is called for destination conditions and should be governed as an approved read tool." },
          { componentType: DiscoveredComponentType.TOOL, name: "Excursion API", location: "src/tools/excursions.ts", rationale: "External excursion content provider creates third-party and explainability governance considerations." },
          { componentType: DiscoveredComponentType.EXTERNAL_SERVICE, name: "Destination content provider", location: "config/vendors.yaml", rationale: "Vendor configuration indicates third-party dependency evidence should be collected." },
          { componentType: DiscoveredComponentType.DATABASE, name: "Travel preference cache", location: "prisma/schema.prisma", rationale: "Repository includes structured data storage that should be reviewed for privacy and retention controls." }
        ]
      },
      evidenceSources: {
        create: [
          { sourceType: DiscoveredEvidenceSourceType.PROMPT_FILE, title: "Travel planner prompt", location: "prompts/travel-planner.md", collectionMethod: "Repository scan collects prompt file, owner metadata, and version history.", validationMethod: "Validate prompt owner, approval status, version history, and prohibited-action language.", automationLevel: "High", rationale: "Prompt file is direct evidence for prompt governance and prompt version control." },
          { sourceType: DiscoveredEvidenceSourceType.CONFIGURATION_FILE, title: "Model configuration", location: "config/model.json", collectionMethod: "Repository scan collects model provider, version, purpose, and fallback configuration.", validationMethod: "Validate model version against model registry and validation approval.", automationLevel: "Medium", rationale: "Model config is source evidence, but model validation approval remains a human governance artifact." },
          { sourceType: DiscoveredEvidenceSourceType.POLICY_FILE, title: "Tool permission policy", location: "governance/tool-policy.yaml", collectionMethod: "Policy file collection parses approved and denied tools.", validationMethod: "Validate approved tools against delegated authority level and denied tool rationale.", automationLevel: "High", rationale: "Tool policy is strong source evidence for tool governance and agentic boundaries." },
          { sourceType: DiscoveredEvidenceSourceType.WORKFLOW_DEFINITION, title: "Human oversight workflow", location: "governance/human-oversight.md", collectionMethod: "Governance file collection captures review points and escalation path.", validationMethod: "Validate oversight owner, escalation path, approval record, and review cadence.", automationLevel: "Medium", rationale: "Oversight workflow can be collected automatically but requires human approval." },
          { sourceType: DiscoveredEvidenceSourceType.LOG_SOURCE, title: "Recommendation interaction logs", location: "logs/recommendations/*.jsonl", collectionMethod: "Runtime log ingestion collects interaction IDs, tool calls, and outcomes.", validationMethod: "Validate log completeness, retention window, and absence of prohibited tool execution.", automationLevel: "High", rationale: "Logs are direct runtime evidence for monitoring and audit sampling." },
          { sourceType: DiscoveredEvidenceSourceType.MONITORING_SOURCE, title: "Control monitoring report", location: "monitoring/travel-brain-control-health.json", collectionMethod: "Monitoring job imports latest CCM results.", validationMethod: "Validate test run completeness, result status, linked findings, and evidence references.", automationLevel: "High", rationale: "Monitoring output provides derived evidence that controls continue to operate." },
          { sourceType: DiscoveredEvidenceSourceType.APPROVAL_SOURCE, title: "Production approval record", location: "governance/approvals/production-approval.md", collectionMethod: "Approval workflow or governed document capture.", validationMethod: "Validate approver authority, approval date, scope, and unresolved blockers.", automationLevel: "Low", rationale: "Production approval is a human governance decision and must remain reviewable." }
        ]
      }
    }
  });

  await prisma.governanceManifest.create({
    data: {
      manifestId: "AIGOVMAN-TB-001",
      repositoryDiscoveryId: travelBrain.id,
      fileName: "AI Governance.yaml",
      location: "AI Governance.yaml",
      validationStatus: ManifestValidationStatus.VALID,
      systemName: "Travel Brain",
      businessOwner: "Sarah Chen",
      riskOwner: "Russell",
      lifecycleStage: LifecycleStatus.PRODUCTION,
      aiType: "Assistant",
      riskTier: RiskLevel.MEDIUM,
      evidenceSourceCount: 7,
      validationMessagesJson: JSON.stringify([
        "Required system.name present.",
        "Business owner and risk owner present.",
        "Lifecycle stage is declared.",
        "AI type is declared.",
        "Evidence sources are declared."
      ]),
      manifestYaml: [
        "system:",
        "  name: Travel Brain",
        "  description: AI travel recommendation assistant for customer travel planning.",
        "  lifecycle_stage: Production",
        "  environment: Production",
        "owners:",
        "  business_owner: Sarah Chen",
        "  technology_owner: Michael Thompson",
        "  risk_owner: Russell",
        "  executive_sponsor: David Kim",
        "ai:",
        "  type: Assistant",
        "  agentic_level: 1",
        "  authority_level: 1",
        "  customer_facing: true",
        "assets:",
        "  models:",
        "    - name: GPT-5 recommendation model",
        "      source: config/model.json",
        "  prompts:",
        "    - name: Travel planning prompt",
        "      source: prompts/travel-planner.md",
        "  tools:",
        "    - Weather API",
        "    - Excursion API",
        "evidence_sources:",
        "  prompts:",
        "    - prompts/travel-planner.md",
        "  policies:",
        "    - governance/tool-policy.yaml",
        "    - governance/human-oversight.md",
        "  logs:",
        "    - logs/recommendations/*.jsonl",
        "  monitoring:",
        "    - monitoring/travel-brain-control-health.json",
        "  approvals:",
        "    - governance/approvals/production-approval.md",
        "regulatory_scope:",
        "  jurisdictions:",
        "    - Canada",
        "    - United States",
        "    - United Kingdom",
        "    - European Union",
        "    - Japan",
        "data:",
        "  personal_data: true",
        "  classification: Confidential",
        "risk:",
        "  tier: Medium",
        "  domains:",
        "    - Hallucination Risk",
        "    - Privacy Risk",
        "    - Explainability Risk",
        "    - Third-Party Risk",
        "    - Tool Misuse Risk"
      ].join("\n")
    }
  });

  const legacyDiscovery = await prisma.repositoryDiscovery.create({
    data: {
      name: "legacy-branch-assistant",
      description: "Local repository discovery profile for an internal branch assistant with incomplete governance metadata.",
      location: "/repos/legacy-branch-assistant",
      repositoryType: RepositoryType.LOCAL,
      reviewStatus: RepositoryReviewStatus.SUGGESTED,
      suggestedSystemType: "Assistant",
      suggestedAgenticLevel: 0,
      suggestedAuthorityLevel: 0,
      suggestedLifecycleStage: LifecycleStatus.TESTING,
      suggestedJurisdictionsJson: JSON.stringify(["Canada"]),
      suggestedRiskDomainsJson: JSON.stringify(["Evidence Governance", "Model Validation", "Human Oversight"]),
      suggestedControlsJson: JSON.stringify(["AI-GOV-001", "AI-GOV-004", "AI-LC-004"]),
      suggestedRisksJson: JSON.stringify(["Incomplete Evidence", "Unapproved Oversight"]),
      rationale: "Repository discovery found prompt and configuration artifacts but no AI Governance.yaml manifest. The profile must remain suggested until a reviewer confirms ownership, lifecycle, evidence sources, and risk scope.",
      reviewer: "Jennifer Patel",
      components: {
        create: [
          { componentType: DiscoveredComponentType.PROMPT, name: "Branch FAQ prompt", location: "prompts/branch-faq.md", rationale: "Prompt suggests an AI assistant but owner and approval metadata are not declared in a manifest." },
          { componentType: DiscoveredComponentType.MODEL, name: "Unspecified language model", location: "config/model.json", rationale: "Model configuration exists, but validation and owner declarations are incomplete." }
        ]
      },
      evidenceSources: {
        create: [
          { sourceType: DiscoveredEvidenceSourceType.PROMPT_FILE, title: "Branch FAQ prompt", location: "prompts/branch-faq.md", collectionMethod: "Repository scan", validationMethod: "Requires manifest owner and approval metadata before activation.", automationLevel: "Medium", rationale: "Prompt source exists but governance ownership is incomplete." }
        ]
      }
    }
  });

  await prisma.repositoryOnboardingFinding.create({
    data: {
      findingId: "AI-GOV-MANIFEST-001",
      repositoryDiscoveryId: legacyDiscovery.id,
      title: "AI Governance Manifest Missing",
      severity: FindingSeverity.MEDIUM,
      status: FindingStatus.OPEN,
      rationale: "Repository discovery did not find AI Governance.yaml. No onboarding or active governance profile should be approved until ownership, lifecycle, AI type, risk scope, and evidence sources are declared and reviewed."
    }
  });
}

async function main() {
  const previousPortainerDeployment = await getPreviousTravelBrainPortainerDeployment();
  const previousSupabaseSnapshot = await getPreviousTravelBrainSupabaseSnapshot();

  await prisma.assuranceExplanation.deleteMany();
  await prisma.assuranceRule.deleteMany();
  await prisma.artifactDriftEvent.deleteMany();
  await prisma.evidenceSnapshot.deleteMany();
  await prisma.evidenceArtifact.deleteMany();
  await prisma.repositoryConnection.deleteMany();
  await prisma.deploymentDriftEvent.deleteMany();
  await prisma.deploymentEvidenceArtifact.deleteMany();
  await prisma.portainerConnection.deleteMany();
  await prisma.supabaseControlValidation.deleteMany();
  await prisma.supabaseDriftEvent.deleteMany();
  await prisma.supabaseEvidenceSnapshot.deleteMany();
  await prisma.supabaseEvidenceArtifact.deleteMany();
  await prisma.supabaseConnection.deleteMany();
  await prisma.mcpEvidenceArtifact.deleteMany();
  await prisma.mcpConnection.deleteMany();
  await prisma.notionEvidenceArtifact.deleteMany();
  await prisma.notionConnection.deleteMany();
  await prisma.secretEvidenceArtifact.deleteMany();
  await prisma.secretsConnection.deleteMany();
  await prisma.assetDiscoveryFinding.deleteMany();
  await prisma.assetDiscoverySource.deleteMany();
  await prisma.assetDiscoveryRun.deleteMany();
  await prisma.runtimeEvidenceArtifact.deleteMany();
  await prisma.logSource.deleteMany();
  await prisma.evidenceSource.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.gitHubRepositoryDiscovery.deleteMany();
  await prisma.repositoryOnboardingFinding.deleteMany();
  await prisma.governanceManifest.deleteMany();
  await prisma.repositoryEvidenceSource.deleteMany();
  await prisma.repositoryComponent.deleteMany();
  await prisma.repositoryDiscovery.deleteMany();
  await prisma.exception.deleteMany();
  await prisma.aiRiskFinding.deleteMany();
  await prisma.aiRiskEvidence.deleteMany();
  await prisma.aiRiskControl.deleteMany();
  await prisma.aiRisk.deleteMany();
  await prisma.implementationEvidence.deleteMany();
  await prisma.controlImplementationControl.deleteMany();
  await prisma.controlImplementation.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.testRun.deleteMany();
  await prisma.controlTest.deleteMany();
  await prisma.evidenceHealth.deleteMany();
  await prisma.auditPackageEvidence.deleteMany();
  await prisma.auditPackage.deleteMany();
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
  await prisma.governanceStory.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.aiLifecycleApproval.deleteMany();
  await prisma.aiLifecycle.deleteMany();
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

  await seedRepositoryDiscovery();
  await seedControlTests(prisma);
  await seedSupabaseControlTests();
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
  await seedGovernanceStories(createdControls);

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
  const createLifecycleHistory = async (
    aiSystemId: string,
    stages: Array<{
      lifecycleStage: LifecycleStatus;
      stageOwner: string;
      stageEntryOffset: number;
      stageExitOffset?: number;
      approvalStatus: LifecycleApprovalStatus;
      notes: string;
    }>
  ) => {
    await prisma.aiLifecycle.createMany({
      data: stages.map((stage) => ({
        aiSystemId,
        lifecycleStage: stage.lifecycleStage,
        stageOwner: stage.stageOwner,
        stageEntryDate: daysFromToday(stage.stageEntryOffset),
        stageExitDate: stage.stageExitOffset === undefined ? null : daysFromToday(stage.stageExitOffset),
        approvalStatus: stage.approvalStatus,
        notes: stage.notes
      }))
    });
  };
  const createLifecycleApprovals = async (
    aiSystemId: string,
    approvals: Array<{
      approvalId: string;
      approvalType: string;
      approver: string;
      status: LifecycleApprovalStatus;
      approvalOffset?: number;
      comments: string;
    }>
  ) => {
    await prisma.aiLifecycleApproval.createMany({
      data: approvals.map((approval) => ({
        approvalId: approval.approvalId,
        aiSystemId,
        approvalType: approval.approvalType,
        approver: approval.approver,
        status: approval.status,
        approvalDate: approval.approvalOffset === undefined ? null : daysFromToday(approval.approvalOffset),
        comments: approval.comments
      }))
    });
  };
  const addLifecycleControls = async (
    aiSystemId: string,
    statusByCode: Partial<Record<string, AuditStatus>>
  ) => {
    for (const code of ["AI-LC-001", "AI-LC-002", "AI-LC-003", "AI-LC-004", "AI-LC-005", "AI-LC-006", "AI-LC-007"]) {
      await prisma.systemControl.create({
        data: {
          aiSystemId,
          controlId: createdControls.get(code)!.id,
          auditStatus: statusByCode[code] ?? AuditStatus.ON_TRACK,
          notes:
            statusByCode[code] === AuditStatus.BLOCKED
              ? "Lifecycle gate is blocked pending approval, evidence, validation, or retirement action."
              : statusByCode[code] === AuditStatus.NEEDS_ATTENTION
                ? "Lifecycle gate is partially complete and needs governance follow-up."
                : "Lifecycle gate evidence is available for the current stage."
        }
      });
    }
  };
  const createControlImplementation = async (input: {
    implementationId: string;
    aiSystemId: string;
    primaryControlCode: string;
    controlCodes: string[];
    implementationType: "Governance Control" | "Technical Control" | "Runtime Control" | "Detective Control" | "Preventive Control" | "Compensating Control";
    title: string;
    description: string;
    owner: string;
    implementationLocation: string;
    validationMethod: string;
    status: ControlImplementationStatus;
    evidence: Array<{
      evidenceId: string;
      evidenceType: "Policy File" | "Configuration" | "Architecture Diagram" | "Code Repository" | "Control Test" | "Monitoring Report";
      location: string;
      owner: string;
      validationOffset?: number;
    }>;
  }) => {
    const primaryControl = createdControls.get(input.primaryControlCode);
    if (!primaryControl) throw new Error(`Missing primary control ${input.primaryControlCode}`);
    const implementation = await prisma.controlImplementation.create({
      data: {
        implementationId: input.implementationId,
        aiSystemId: input.aiSystemId,
        controlId: primaryControl.id,
        implementationType: input.implementationType,
        title: input.title,
        description: input.description,
        owner: input.owner,
        implementationLocation: input.implementationLocation,
        validationMethod: input.validationMethod,
        status: input.status
      }
    });

    for (const code of new Set([input.primaryControlCode, ...input.controlCodes])) {
      const control = createdControls.get(code);
      if (control) {
        await prisma.controlImplementationControl.create({
          data: { controlImplementationId: implementation.id, controlId: control.id }
        });
      }
    }

    for (const evidence of input.evidence) {
      await prisma.implementationEvidence.create({
        data: {
          evidenceId: evidence.evidenceId,
          implementationId: implementation.id,
          evidenceType: evidence.evidenceType,
          location: evidence.location,
          owner: evidence.owner,
          validationDate: evidence.validationOffset === undefined ? null : daysFromToday(evidence.validationOffset)
        }
      });
    }
    return implementation;
  };

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

  const seedEvidenceSource = async (
    assetId: string,
    source: {
      sourceId: string;
      sourceType: EvidenceSourceType;
      collectionMethod: string;
      validationMethod: string;
      automationLevel: AutomationLevel;
      collectionStatus: EvidenceCollectionStatus;
      lastCollectedOffset?: number;
      lastValidatedOffset?: number;
      freshnessStatus: FreshnessStatus;
      connectorHealth: AuditStatus;
      evidenceLocation: string;
      governanceValue: string;
    }
  ) => {
    await prisma.evidenceSource.create({
      data: {
        sourceId: source.sourceId,
        assetId,
        sourceType: source.sourceType,
        collectionMethod: source.collectionMethod,
        validationMethod: source.validationMethod,
        automationLevel: source.automationLevel,
        collectionStatus: source.collectionStatus,
        lastCollectedAt: source.lastCollectedOffset === undefined ? null : daysFromToday(source.lastCollectedOffset),
        lastValidatedAt: source.lastValidatedOffset === undefined ? null : daysFromToday(source.lastValidatedOffset),
        freshnessStatus: source.freshnessStatus,
        connectorHealth: source.connectorHealth,
        evidenceLocation: source.evidenceLocation,
        governanceValue: source.governanceValue
      }
    });
  };

  const githubAsset = await prisma.asset.create({
    data: {
      assetId: "AST-TB-GITHUB-001",
      aiSystemId: system.id,
      assetType: AssetType.GITHUB,
      name: "GitHub - Travel Brain",
      owner: "Michael Thompson",
      criticality: AssetCriticality.HIGH,
      status: AssetStatus.ACTIVE,
      description: "Canonical source for Travel Brain source code, AI Governance.yaml, prompts, policies, workflows, tests, and review metadata."
    }
  });

  const logsAsset = await prisma.asset.create({
    data: {
      assetId: "AST-TB-LOGS-001",
      aiSystemId: system.id,
      assetType: AssetType.LOGS,
      name: "Travel Brain Runtime and Monitoring Logs",
      owner: "Michael Thompson",
      criticality: AssetCriticality.HIGH,
      status: AssetStatus.ACTIVE,
      description: "Runtime and monitoring evidence source for recommendation activity, control results, execution logs, and assurance sampling."
    }
  });

  const portainerAsset = await prisma.asset.create({
    data: {
      assetId: "AST-TB-PORTAINER-001",
      aiSystemId: system.id,
      assetType: AssetType.PORTAINER,
      name: "Portainer - travel-brain-web",
      owner: "Michael Thompson",
      criticality: AssetCriticality.HIGH,
      status: AssetStatus.ACTIVE,
      description: "Runtime deployment metadata source for container configuration, image, deployment, and service health evidence."
    }
  });

  const supabaseAsset = await prisma.asset.create({
    data: {
      assetId: "AST-TB-SUPABASE-001",
      aiSystemId: system.id,
      assetType: AssetType.SUPABASE,
      name: "Supabase - Travel Brain",
      owner: "Michael Thompson",
      criticality: AssetCriticality.HIGH,
      status: AssetStatus.ACTIVE,
      description: "Data governance evidence domain for schema inventory, table inventory, row-level security, access metadata, and audit capability."
    }
  });

  const mcpAsset = await prisma.asset.create({
    data: {
      assetId: "AST-TB-MCP-001",
      aiSystemId: system.id,
      assetType: AssetType.MCP,
      name: "MCP - Travel Brain Tool Server",
      owner: "Michael Thompson",
      criticality: AssetCriticality.HIGH,
      status: AssetStatus.ACTIVE,
      description: "Agentic capability evidence domain for MCP server inventory, tool registry, permissions, authority classification, and capability inventory."
    }
  });

  const notionAsset = await prisma.asset.create({
    data: {
      assetId: "AST-TB-NOTION-001",
      aiSystemId: system.id,
      assetType: AssetType.NOTION,
      name: "Notion - Travel Brain Governance Workspace",
      owner: "Sarah Chen",
      criticality: AssetCriticality.HIGH,
      status: AssetStatus.DEGRADED,
      description: "Human governance evidence domain for approval records, review records, committee decisions, ownership accountability, and governance documentation inventory."
    }
  });

  const secretsAsset = await prisma.asset.create({
    data: {
      assetId: "AST-TB-SECRETS-001",
      aiSystemId: system.id,
      assetType: AssetType.SECRETS,
      name: "Secrets Metadata - Travel Brain",
      owner: "Security Lead",
      criticality: AssetCriticality.HIGH,
      status: AssetStatus.DEGRADED,
      description: "Secrets governance evidence domain for secret identifiers, owners, storage locations, rotation policy, usage mapping, and plaintext prohibition evidence. Secret values are never collected."
    }
  });

  await Promise.all([
    seedEvidenceSource(githubAsset.id, {
      sourceId: "SRC-TB-GH-MANIFEST",
      sourceType: EvidenceSourceType.MANIFEST,
      collectionMethod: "GitHub metadata connector reads AI Governance.yaml and file revision metadata.",
      validationMethod: "Validate required manifest fields, v2 asset categories, owner fields, and evidence source declarations.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.VALIDATED,
      lastCollectedOffset: -1,
      lastValidatedOffset: -1,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: AuditStatus.ON_TRACK,
      evidenceLocation: "AI Governance.yaml",
      governanceValue: "Defines the declared Travel Brain system boundary and onboarding profile."
    }),
    seedEvidenceSource(githubAsset.id, {
      sourceId: "SRC-TB-GH-PROMPTS",
      sourceType: EvidenceSourceType.PROMPT_FILE,
      collectionMethod: "GitHub connector collects prompt files and revision metadata.",
      validationMethod: "Validate prompt owner, approval reference, version history, and prohibited-action language.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.VALIDATED,
      lastCollectedOffset: -2,
      lastValidatedOffset: -1,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: AuditStatus.ON_TRACK,
      evidenceLocation: "prompts/travel-planner.md",
      governanceValue: "Supports prompt governance, version control, and hallucination risk review."
    }),
    seedEvidenceSource(githubAsset.id, {
      sourceId: "SRC-TB-GH-POLICIES",
      sourceType: EvidenceSourceType.POLICY_FILE,
      collectionMethod: "GitHub connector collects governance and tool policy files.",
      validationMethod: "Validate approved tools, denied actions, review cadence, and authority alignment.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.VALIDATED,
      lastCollectedOffset: -2,
      lastValidatedOffset: -1,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: AuditStatus.ON_TRACK,
      evidenceLocation: "governance/tool-policy.yaml",
      governanceValue: "Supports tool permissions approved and recommendation-only boundaries."
    }),
    seedEvidenceSource(githubAsset.id, {
      sourceId: "SRC-TB-GH-WORKFLOWS",
      sourceType: EvidenceSourceType.WORKFLOW_FILE,
      collectionMethod: "GitHub connector collects workflow definitions and latest run metadata.",
      validationMethod: "Validate control-test workflow exists, has recent execution metadata, and links to monitoring output.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.COLLECTED,
      lastCollectedOffset: -5,
      lastValidatedOffset: -4,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: AuditStatus.NEEDS_ATTENTION,
      evidenceLocation: ".github/workflows/control-tests.yaml",
      governanceValue: "Supports continuous control monitoring and testing traceability."
    }),
    seedEvidenceSource(githubAsset.id, {
      sourceId: "SRC-TB-GH-REVIEWS",
      sourceType: EvidenceSourceType.REVIEW,
      collectionMethod: "GitHub connector collects pull request review metadata only.",
      validationMethod: "Validate reviewers, approval timestamps, and change linkage to governed prompt or policy files.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.COLLECTED,
      lastCollectedOffset: -8,
      lastValidatedOffset: -6,
      freshnessStatus: FreshnessStatus.STALE,
      connectorHealth: AuditStatus.NEEDS_ATTENTION,
      evidenceLocation: "pull requests and reviews metadata",
      governanceValue: "Supports change approval traceability without replacing human review judgment."
    }),
    seedEvidenceSource(logsAsset.id, {
      sourceId: "SRC-TB-LOG-EXEC",
      sourceType: EvidenceSourceType.EXECUTION_LOG,
      collectionMethod: "Logs connector collects execution log metadata and correlation IDs.",
      validationMethod: "Validate retention, completeness, timestamps, and absence of prohibited tool execution.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.VALIDATED,
      lastCollectedOffset: -1,
      lastValidatedOffset: -1,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: AuditStatus.ON_TRACK,
      evidenceLocation: "logs/recommendations/*.jsonl",
      governanceValue: "Supports execution logging, runtime review, and audit sampling."
    }),
    seedEvidenceSource(logsAsset.id, {
      sourceId: "SRC-TB-LOG-MONITORING",
      sourceType: EvidenceSourceType.MONITORING_RESULT,
      collectionMethod: "Logs connector collects monitoring result metadata and latest CCM result references.",
      validationMethod: "Validate monitor run date, result completeness, linked controls, and finding references.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.VALIDATED,
      lastCollectedOffset: -1,
      lastValidatedOffset: -1,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: AuditStatus.ON_TRACK,
      evidenceLocation: "monitoring/travel-brain-control-health.json",
      governanceValue: "Supports continuous assurance and evidence freshness monitoring."
    }),
    seedEvidenceSource(logsAsset.id, {
      sourceId: "SRC-TB-LOG-CONTROLS",
      sourceType: EvidenceSourceType.CONTROL_RESULT,
      collectionMethod: "Logs connector collects control result metadata from monitoring output.",
      validationMethod: "Validate PASS/WARNING/FAIL values, affected controls, and exception or finding references.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.VALIDATED,
      lastCollectedOffset: -1,
      lastValidatedOffset: -1,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: AuditStatus.ON_TRACK,
      evidenceLocation: "monitoring/control-results/travel-brain.json",
      governanceValue: "Supports assurance scoring and control health reporting."
    }),
    seedEvidenceSource(portainerAsset.id, {
      sourceId: "SRC-TB-PORT-CONTAINER",
      sourceType: EvidenceSourceType.CONTAINER_METADATA,
      collectionMethod: "Portainer connector is configured to collect safe container metadata once a read-only endpoint is available.",
      validationMethod: "Validate container owner, image tag, environment, and logging configuration.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "portainer/travel-brain-web/container",
      governanceValue: "Will support runtime configuration assurance and deployed-state traceability after Portainer instrumentation is available."
    }),
    seedEvidenceSource(portainerAsset.id, {
      sourceId: "SRC-TB-PORT-DEPLOYMENT",
      sourceType: EvidenceSourceType.DEPLOYMENT_METADATA,
      collectionMethod: "Portainer connector is configured to collect deployment metadata, image revision, and approval linkage once a read-only endpoint is available.",
      validationMethod: "Validate latest deployment has an approval reference and matches expected production image.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "portainer/travel-brain-web/deployments",
      governanceValue: "Will support production approval linkage and runtime drift detection after Portainer deployment evidence is collected."
    }),
    seedEvidenceSource(portainerAsset.id, {
      sourceId: "SRC-TB-PORT-RUNTIME",
      sourceType: EvidenceSourceType.RUNTIME_METADATA,
      collectionMethod: "Portainer connector is configured to collect service health, restart count, logging status, and runtime metadata once a read-only endpoint is available.",
      validationMethod: "Validate service is healthy, monitored, and logging is active.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "portainer/travel-brain-web/runtime",
      governanceValue: "Will support operational resilience and runtime evidence freshness after Portainer runtime metadata is collected."
    }),
    seedEvidenceSource(supabaseAsset.id, {
      sourceId: "SRC-TB-SUPABASE-SCHEMA",
      sourceType: EvidenceSourceType.SCHEMA_METADATA,
      collectionMethod: "Supabase connector uses a read-only Postgres connection to collect schema metadata only.",
      validationMethod: "Validate declared schemas can be inventoried without reading table rows or sensitive payloads.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "supabase/information_schema/schemata",
      governanceValue: "Supports data governance reality by proving what database schemas exist for the AI system."
    }),
    seedEvidenceSource(supabaseAsset.id, {
      sourceId: "SRC-TB-SUPABASE-TABLES",
      sourceType: EvidenceSourceType.TABLE_INVENTORY,
      collectionMethod: "Supabase connector collects table and view metadata only; row contents are never queried.",
      validationMethod: "Validate table inventory, object types, and RLS enablement metadata are present.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "supabase/pg_catalog/pg_class",
      governanceValue: "Supports data inventory evidence without collecting customer data."
    }),
    seedEvidenceSource(supabaseAsset.id, {
      sourceId: "SRC-TB-SUPABASE-RLS",
      sourceType: EvidenceSourceType.RLS_POLICY,
      collectionMethod: "Supabase connector collects RLS status and policy metadata only.",
      validationMethod: "Validate policies exist for governed tables and identify tables with disabled RLS for review.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "supabase/pg_catalog/pg_policies",
      governanceValue: "Supports privacy controls, policy enforcement, and evidence that customer data boundaries are governed."
    }),
    seedEvidenceSource(supabaseAsset.id, {
      sourceId: "SRC-TB-SUPABASE-ACCESS",
      sourceType: EvidenceSourceType.ACCESS_CONTROL,
      collectionMethod: "Supabase connector collects database role metadata only; credentials and grants with secrets are not stored.",
      validationMethod: "Validate role inventory is available and privileged roles can be reviewed.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "supabase/pg_catalog/pg_roles",
      governanceValue: "Supports access management, least privilege review, and auditability."
    }),
    seedEvidenceSource(supabaseAsset.id, {
      sourceId: "SRC-TB-SUPABASE-AUDIT",
      sourceType: EvidenceSourceType.AUDIT_CAPABILITY,
      collectionMethod: "Supabase connector collects audit capability metadata such as installed audit-related extensions.",
      validationMethod: "Validate audit capability metadata can support monitoring, retention, and review obligations.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "supabase/pg_catalog/pg_extension",
      governanceValue: "Supports audit trail and monitoring assurance for the data layer."
    }),
    seedEvidenceSource(mcpAsset.id, {
      sourceId: "SRC-TB-MCP-SERVERS",
      sourceType: EvidenceSourceType.MCP_SERVER_INVENTORY,
      collectionMethod: "MCP connector reads the Travel Brain manifest and MCP server implementation metadata.",
      validationMethod: "Validate server name, endpoint, version, and source provenance without calling tools or collecting payloads.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "AI Governance.yaml + travel-brain-mcp/index.mjs",
      governanceValue: "Proves the actual MCP server boundary for Travel Brain agentic capability governance."
    }),
    seedEvidenceSource(mcpAsset.id, {
      sourceId: "SRC-TB-MCP-TOOLS",
      sourceType: EvidenceSourceType.MCP_TOOL_REGISTRY,
      collectionMethod: "MCP connector parses exposed tool names and safe categories from the actual MCP implementation.",
      validationMethod: "Validate tool registry exists and includes required contract tools without storing tool payloads or outputs.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "travel-brain-mcp/index.mjs tool registry",
      governanceValue: "Supports AI-GOV-006 and AI-AGENT-001 by proving which MCP tools are actually exposed."
    }),
    seedEvidenceSource(mcpAsset.id, {
      sourceId: "SRC-TB-MCP-PERMISSIONS",
      sourceType: EvidenceSourceType.MCP_TOOL_PERMISSIONS,
      collectionMethod: "MCP connector reads the Travel Brain tool policy and maps approved, constrained, and denied capabilities.",
      validationMethod: "Validate tool policy can be reconciled to actual exposed tools and denied actions.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "governance/tool-policy.yaml",
      governanceValue: "Supports tool permission approval, denied-action review, and delegated authority governance."
    }),
    seedEvidenceSource(mcpAsset.id, {
      sourceId: "SRC-TB-MCP-AUTHORITY",
      sourceType: EvidenceSourceType.MCP_AUTHORITY_REGISTRY,
      collectionMethod: "MCP connector classifies exposed tools into read-only, write, approval-required, and autonomous authority categories.",
      validationMethod: "Validate write-capable tools are policy-classified and approval-required actions remain explicit.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "MCP tool registry + governance/tool-policy.yaml",
      governanceValue: "Surfaces authority risk for agentic governance and delegated authority controls."
    }),
    seedEvidenceSource(mcpAsset.id, {
      sourceId: "SRC-TB-MCP-CAPABILITIES",
      sourceType: EvidenceSourceType.MCP_CAPABILITY_INVENTORY,
      collectionMethod: "MCP connector summarizes actual capability domains exposed by the MCP server.",
      validationMethod: "Validate capability domains are mapped to controls and privacy boundaries.",
      automationLevel: AutomationLevel.HIGH,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "travel-brain-mcp/index.mjs capability inventory",
      governanceValue: "Supports monitoring, audit sampling, and agentic system boundary review."
    }),
    seedEvidenceSource(notionAsset.id, {
      sourceId: "SRC-TB-NOTION-PAGES",
      sourceType: EvidenceSourceType.NOTION_GOVERNANCE_PAGE,
      collectionMethod: "Notion connector collects governance page metadata and scoped documentation inventory only.",
      validationMethod: "Validate governance pages are scoped to Travel Brain, owned, recently reviewed, and linked to governance controls.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.NEEDS_ATTENTION,
      evidenceLocation: "Travel Brain Notion governance pages",
      governanceValue: "Supports human governance documentation evidence without collecting personal notes or unrelated workspace content."
    }),
    seedEvidenceSource(notionAsset.id, {
      sourceId: "SRC-TB-NOTION-DATABASES",
      sourceType: EvidenceSourceType.NOTION_GOVERNANCE_DATABASE,
      collectionMethod: "Notion connector inventories shared governance databases and safe metadata properties.",
      validationMethod: "Validate database scope, last edited timestamp, reviewer fields, and governance record types.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.NEEDS_ATTENTION,
      evidenceLocation: "Travel Brain Notion governance databases",
      governanceValue: "Supports governance record discovery for approvals, reviews, committee decisions, and ownership accountability."
    }),
    seedEvidenceSource(notionAsset.id, {
      sourceId: "SRC-TB-NOTION-APPROVALS",
      sourceType: EvidenceSourceType.NOTION_APPROVAL_RECORD,
      collectionMethod: "Notion connector collects approval record metadata such as title, status, approver field, date, and source reference.",
      validationMethod: "Validate approval record exists, is scoped to Travel Brain, names an approver, and has a decision date or review status.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.NEEDS_ATTENTION,
      evidenceLocation: "Travel Brain Notion approval records",
      governanceValue: "Supports production approval, tool permission approval, and audit evidence for human decisions."
    }),
    seedEvidenceSource(notionAsset.id, {
      sourceId: "SRC-TB-NOTION-REVIEWS",
      sourceType: EvidenceSourceType.NOTION_REVIEW_RECORD,
      collectionMethod: "Notion connector collects review record metadata and reviewer accountability fields.",
      validationMethod: "Validate review cadence, reviewer identity, review date, and linked AI system scope.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.NEEDS_ATTENTION,
      evidenceLocation: "Travel Brain Notion review records",
      governanceValue: "Supports human oversight, periodic governance review, and control-owner accountability."
    }),
    seedEvidenceSource(notionAsset.id, {
      sourceId: "SRC-TB-NOTION-COMMITTEE",
      sourceType: EvidenceSourceType.NOTION_COMMITTEE_RECORD,
      collectionMethod: "Notion connector collects committee decision metadata and meeting record references.",
      validationMethod: "Validate committee record has decision context, accountable body, meeting date, and Travel Brain scope.",
      automationLevel: AutomationLevel.LOW,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.NEEDS_ATTENTION,
      evidenceLocation: "Travel Brain Notion committee decisions",
      governanceValue: "Supports governance committee oversight evidence while keeping committee judgment human-governed."
    }),
    seedEvidenceSource(notionAsset.id, {
      sourceId: "SRC-TB-NOTION-OWNERSHIP",
      sourceType: EvidenceSourceType.NOTION_OWNERSHIP_RECORD,
      collectionMethod: "Notion connector collects ownership record metadata for business owner, risk owner, technical owner, reviewer, approver, and committee accountability.",
      validationMethod: "Validate ownership fields are present, current, and aligned to the AI System registry.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.NEEDS_ATTENTION,
      evidenceLocation: "Travel Brain Notion ownership records",
      governanceValue: "Supports accountable ownership and human oversight controls."
    }),
    seedEvidenceSource(secretsAsset.id, {
      sourceId: "SRC-TB-SECRETS-INVENTORY",
      sourceType: EvidenceSourceType.SECRET_INVENTORY,
      collectionMethod: "Secrets metadata connector collects secret identifiers, source systems, environments, and associated AI-system mappings only. Secret values are not read, stored, displayed, logged, hashed, exported, or persisted.",
      validationMethod: "Validate declared secret names are represented by safe metadata and mapped to Travel Brain without collecting values.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "environment variable names, GitHub secret names, Supabase secret names, Portainer secret references, local secret-store names",
      governanceValue: "Supports secret inventory, secure access, operational resilience, and auditability without exposing secrets."
    }),
    seedEvidenceSource(secretsAsset.id, {
      sourceId: "SRC-TB-SECRETS-ROTATION",
      sourceType: EvidenceSourceType.SECRET_ROTATION_RECORD,
      collectionMethod: "Secrets metadata connector collects rotation policy and last-rotated metadata where available. Secret material and connection strings are prohibited.",
      validationMethod: "Validate rotation policy, last rotated date, stale or unknown rotation status, and owner follow-up.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "secret rotation metadata",
      governanceValue: "Supports stale-secret warning generation and rotation governance."
    }),
    seedEvidenceSource(secretsAsset.id, {
      sourceId: "SRC-TB-SECRETS-OWNERSHIP",
      sourceType: EvidenceSourceType.SECRET_OWNERSHIP_RECORD,
      collectionMethod: "Secrets metadata connector collects accountable owner metadata only.",
      validationMethod: "Validate each secret metadata record has an owner or an explicit missing-ownership warning.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "secret owner metadata",
      governanceValue: "Supports accountable ownership and control-owner review for secret access."
    }),
    seedEvidenceSource(secretsAsset.id, {
      sourceId: "SRC-TB-SECRETS-USAGE",
      sourceType: EvidenceSourceType.SECRET_USAGE_MAPPING,
      collectionMethod: "Secrets metadata connector collects safe usage mapping to AI system components and source systems only.",
      validationMethod: "Validate every secret identifier maps to a source system, environment, usage category, and associated AI system.",
      automationLevel: AutomationLevel.MEDIUM,
      collectionStatus: EvidenceCollectionStatus.MISSING,
      freshnessStatus: FreshnessStatus.MISSING,
      connectorHealth: AuditStatus.BLOCKED,
      evidenceLocation: "secret usage mapping metadata",
      governanceValue: "Supports traceability from controls to secrets evidence and from secrets evidence back to controls."
    })
  ]);

  await seedTravelBrainGitHubArtifacts(system.id);

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

  for (const [code] of controls.filter(([code]) => !code.startsWith("AI-LC-"))) {
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
  await addLifecycleControls(system.id, {
    "AI-LC-007": AuditStatus.NEEDS_ATTENTION
  });
  await createLifecycleHistory(system.id, [
    {
      lifecycleStage: LifecycleStatus.PROPOSED,
      stageOwner: "Sarah Chen",
      stageEntryOffset: -180,
      stageExitOffset: -150,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Travel Brain intake proposed as a recommendation-only travel engagement use case."
    },
    {
      lifecycleStage: LifecycleStatus.DEVELOPMENT,
      stageOwner: "Michael Thompson",
      stageEntryOffset: -150,
      stageExitOffset: -90,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Development completed with model, prompt, data, and vendor dependencies recorded."
    },
    {
      lifecycleStage: LifecycleStatus.TESTING,
      stageOwner: "Russell",
      stageEntryOffset: -90,
      stageExitOffset: -45,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Testing completed for risk assessment, model validation, evidence, and oversight controls."
    },
    {
      lifecycleStage: LifecycleStatus.PILOT,
      stageOwner: "Sarah Chen",
      stageEntryOffset: -45,
      stageExitOffset: -21,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Pilot approved with recommendation-only constraints and escalation paths."
    },
    {
      lifecycleStage: LifecycleStatus.PRODUCTION,
      stageOwner: "David Kim",
      stageEntryOffset: -21,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Production approved by AI Governance Committee with no autonomous execution authority."
    }
  ]);
  await createLifecycleApprovals(system.id, [
    { approvalId: "LCAPR-TB-INTAKE-001", approvalType: "AI Intake", approver: "Sarah Chen", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -176, comments: "Intake accepted for governed recommendation-only AI system." },
    { approvalId: "LCAPR-TB-RISK-001", approvalType: "Risk Assessment", approver: "Russell", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -89, comments: "Medium risk rating approved with privacy and explainability follow-up." },
    { approvalId: "LCAPR-TB-REG-001", approvalType: "Regulatory Mapping", approver: "Russell", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -42, comments: "Canada, US, UK, EU, and Japan mappings accepted for production baseline." },
    { approvalId: "LCAPR-TB-EVIDENCE-001", approvalType: "Evidence Completeness", approver: "Jennifer Patel", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -20, comments: "Required evidence package complete for production gate." },
    { approvalId: "LCAPR-TB-VALIDATION-001", approvalType: "Validation", approver: "Michael Thompson", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -18, comments: "Model, prompt, oversight, and monitoring validation complete." },
    { approvalId: "LCAPR-TB-PILOT-001", approvalType: "Pilot Approval", approver: "David Kim", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -45, comments: "Pilot approved for customer-facing recommendation-only experience." },
    { approvalId: "LCAPR-TB-PROD-001", approvalType: "Production Approval", approver: "David Kim", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -21, comments: "Production approval granted with bounded Level 1 delegated authority." }
  ]);
  await createControlImplementation({
    implementationId: "GE-TB-PROMPT-REGISTRY-001",
    aiSystemId: system.id,
    primaryControlCode: "AI-GOV-002",
    controlCodes: ["AI-GOV-003"],
    implementationType: "Governance Control",
    title: "Prompt Registry",
    description: "Prompt Version Control catalog implementation that records prompt owner, approved version, change summary, and approval status.",
    owner: "Sarah Chen",
    implementationLocation: "apps/web/app/systems/[slug]/ai-governance",
    validationMethod: "CCM-011 validates approved prompt ownership and prompt version history.",
    status: ControlImplementationStatus.VALIDATED,
    evidence: [
      { evidenceId: "IE-TB-PROMPT-001", evidenceType: "Configuration", location: "PromptAsset PROMPT-TB-PLAN-001", owner: "Sarah Chen", validationOffset: -12 },
      { evidenceId: "IE-TB-PROMPT-002", evidenceType: "Control Test", location: "CCM-011 AI governance profile test", owner: "Russell", validationOffset: 0 }
    ]
  });
  await createControlImplementation({
    implementationId: "GE-TB-TOOL-POLICY-001",
    aiSystemId: system.id,
    primaryControlCode: "AI-GOV-006",
    controlCodes: ["AI-AGENT-002", "AI-AGENT-003"],
    implementationType: "Preventive Control",
    title: "Agent Tool Policy",
    description: "Tool Access Control catalog implementation that approves read-only tools and denies booking, write, and execute permissions.",
    owner: "Michael Thompson",
    implementationLocation: "packages/db/prisma/seed.ts:toolPermission:travel-brain",
    validationMethod: "CCM-011 and CCM-014 verify approved tool permissions and implementation evidence.",
    status: ControlImplementationStatus.VALIDATED,
    evidence: [
      { evidenceId: "IE-TB-TOOL-001", evidenceType: "Policy File", location: "governance/travel-brain-tool-policy.yaml", owner: "Michael Thompson", validationOffset: -10 },
      { evidenceId: "IE-TB-TOOL-002", evidenceType: "Configuration", location: "ToolPermission Weather API / Excursion API / denied Booking API", owner: "Russell", validationOffset: -10 }
    ]
  });
  await createControlImplementation({
    implementationId: "GE-TB-OVERSIGHT-001",
    aiSystemId: system.id,
    primaryControlCode: "AI-GOV-004",
    controlCodes: ["HUM-001"],
    implementationType: "Governance Control",
    title: "Approval Workflow",
    description: "Human Approval Gate catalog implementation for escalated customer concerns, policy exceptions, and proposed authority expansion.",
    owner: "Sarah Chen",
    implementationLocation: "HumanOversight travel-brain",
    validationMethod: "CCM-008 validates human oversight control mapping; CCM-011 validates AI governance oversight record.",
    status: ControlImplementationStatus.VALIDATED,
    evidence: [
      { evidenceId: "IE-TB-HO-001", evidenceType: "Policy File", location: "oversight/travel-brain-human-oversight.md", owner: "Sarah Chen", validationOffset: -10 },
      { evidenceId: "IE-TB-HO-002", evidenceType: "Monitoring Report", location: "monitoring/travel-brain-june-report.pdf", owner: "Michael Thompson", validationOffset: -3 }
    ]
  });
  await createControlImplementation({
    implementationId: "GE-TB-EXEC-LOG-001",
    aiSystemId: system.id,
    primaryControlCode: "AI-AGENT-006",
    controlCodes: ["AUD-001"],
    implementationType: "Detective Control",
    title: "Audit Trail",
    description: "Logging catalog implementation that captures recommendation and draft actions with agent, tool, action, outcome, timestamp, and initiator.",
    owner: "Michael Thompson",
    implementationLocation: "ExecutionLog EXEC-TB-*",
    validationMethod: "CCM-012 validates execution logging exists; CCM-014 validates implementation evidence.",
    status: ControlImplementationStatus.VALIDATED,
    evidence: [
      { evidenceId: "IE-TB-LOG-001", evidenceType: "Configuration", location: "ExecutionLog table records EXEC-TB-001 and EXEC-TB-002", owner: "Michael Thompson", validationOffset: -1 },
      { evidenceId: "IE-TB-LOG-002", evidenceType: "Control Test", location: "CCM-012 agentic governance controls test", owner: "Russell", validationOffset: 0 }
    ]
  });
  await createControlImplementation({
    implementationId: "GE-TB-MODEL-VALIDATION-001",
    aiSystemId: system.id,
    primaryControlCode: "AI-GOV-007",
    controlCodes: ["MRM-001"],
    implementationType: "Governance Control",
    title: "Model Version Control",
    description: "Model Version Control catalog implementation that records model provider, version, owner, validation date, fallback, and lifecycle state.",
    owner: "Michael Thompson",
    implementationLocation: "AiModel MODEL-TB-GPT5-001",
    validationMethod: "CCM-011 validates approved model validation status.",
    status: ControlImplementationStatus.VALIDATED,
    evidence: [
      { evidenceId: "IE-TB-MODEL-001", evidenceType: "Configuration", location: "AiModel MODEL-TB-GPT5-001", owner: "Michael Thompson", validationOffset: -15 },
      { evidenceId: "IE-TB-MODEL-002", evidenceType: "Control Test", location: "CCM-011 AI governance profile test", owner: "Russell", validationOffset: 0 }
    ]
  });
  await createControlImplementation({
    implementationId: "GE-TB-PRODUCTION-GATE-001",
    aiSystemId: system.id,
    primaryControlCode: "AI-LC-006",
    controlCodes: ["GOV-001"],
    implementationType: "Governance Control",
    title: "Lifecycle Approval",
    description: "Lifecycle Approval catalog implementation that records production authorization, committee approver, and production gate evidence.",
    owner: "David Kim",
    implementationLocation: "AiLifecycleApproval LCAPR-TB-PROD-001",
    validationMethod: "CCM-013 validates production approval; CCM-014 validates implementation evidence.",
    status: ControlImplementationStatus.VALIDATED,
    evidence: [
      { evidenceId: "IE-TB-PROD-001", evidenceType: "Policy File", location: "governance/travel-brain-approval.pdf", owner: "David Kim", validationOffset: -21 },
      { evidenceId: "IE-TB-PROD-002", evidenceType: "Control Test", location: "CCM-013 lifecycle stage gate test", owner: "Russell", validationOffset: 0 }
    ]
  });

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
      lifecycleStatus: LifecycleStatus.PILOT,
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
      lifecycleStatus: LifecycleStatus.PILOT
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
      lifecycleStatus: LifecycleStatus.PILOT,
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
  await addLifecycleControls(paymentSystem.id, {
    "AI-LC-006": AuditStatus.BLOCKED,
    "AI-LC-007": AuditStatus.NEEDS_ATTENTION
  });
  await createLifecycleHistory(paymentSystem.id, [
    {
      lifecycleStage: LifecycleStatus.PROPOSED,
      stageOwner: "Sarah Chen",
      stageEntryOffset: -45,
      stageExitOffset: -38,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Autonomous Payment Agent intake proposed as a controlled case study for high-authority agentic AI."
    },
    {
      lifecycleStage: LifecycleStatus.DEVELOPMENT,
      stageOwner: "Michael Thompson",
      stageEntryOffset: -38,
      stageExitOffset: -24,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Development completed for non-production payment exception execution."
    },
    {
      lifecycleStage: LifecycleStatus.TESTING,
      stageOwner: "Russell",
      stageEntryOffset: -24,
      stageExitOffset: -8,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Testing completed with model validation and approval workflow evidence; kill switch test remains a production blocker."
    },
    {
      lifecycleStage: LifecycleStatus.PILOT,
      stageOwner: "David Kim",
      stageEntryOffset: -8,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Pilot approved for non-production execution only. Production release is blocked until emergency stop testing is complete."
    }
  ]);
  await createLifecycleApprovals(paymentSystem.id, [
    { approvalId: "LCAPR-APA-INTAKE-001", approvalType: "AI Intake", approver: "Sarah Chen", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -44, comments: "Intake approved for a tightly controlled agentic AI pilot." },
    { approvalId: "LCAPR-APA-RISK-001", approvalType: "Risk Assessment", approver: "Russell", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -23, comments: "Critical risk rating approved for pilot governance case study." },
    { approvalId: "LCAPR-APA-REG-001", approvalType: "Regulatory Mapping", approver: "Russell", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -22, comments: "Payment execution obligations mapped to model risk, operational resilience, and approval evidence controls." },
    { approvalId: "LCAPR-APA-EVIDENCE-001", approvalType: "Evidence Completeness", approver: "Jennifer Patel", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -10, comments: "Pilot evidence package accepted with production evidence standard still pending." },
    { approvalId: "LCAPR-APA-VALIDATION-001", approvalType: "Validation", approver: "Michael Thompson", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -9, comments: "Pilot validation approved for non-production payment execution simulation." },
    { approvalId: "LCAPR-APA-PILOT-001", approvalType: "Pilot Approval", approver: "David Kim", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -8, comments: "Pilot approval granted with production gate blocked until kill switch test evidence exists." },
    { approvalId: "LCAPR-APA-PROD-001", approvalType: "Production Approval", approver: "David Kim", status: LifecycleApprovalStatus.PENDING, comments: "Pending emergency stop test, production evidence standard, and executive risk acceptance." }
  ]);
  await createControlImplementation({
    implementationId: "GE-APA-TOOL-POLICY-001",
    aiSystemId: paymentSystem.id,
    primaryControlCode: "AI-GOV-006",
    controlCodes: ["AI-AGENT-002"],
    implementationType: "Preventive Control",
    title: "Agent Policy Engine",
    description: "API Access Control and Tool Access Control catalog implementation that restricts payment and fraud API access to approved pilot permissions.",
    owner: "Michael Thompson",
    implementationLocation: "packages/db/prisma/seed.ts:toolPermission:autonomous-payment-agent",
    validationMethod: "CCM-011 validates tool permissions; CCM-014 validates implementation evidence.",
    status: ControlImplementationStatus.VALIDATED,
    evidence: [
      { evidenceId: "IE-APA-TOOL-001", evidenceType: "Configuration", location: "ToolPermission Payment API / Fraud Signal API / denied Customer Record API", owner: "Michael Thompson", validationOffset: -8 }
    ]
  });
  await createControlImplementation({
    implementationId: "GE-APA-TRANSACTION-LIMITS-001",
    aiSystemId: paymentSystem.id,
    primaryControlCode: "AI-AGENT-003",
    controlCodes: ["AI-LC-006"],
    implementationType: "Runtime Control",
    title: "Transaction Limits",
    description: "Execution Limits catalog implementation intended to enforce non-production transaction boundaries before production approval.",
    owner: "Russell",
    implementationLocation: "agent-policy/payment-agent/transaction-limits.yaml",
    validationMethod: "Manual design review pending; runtime monitoring has not been wired to CCM evidence.",
    status: ControlImplementationStatus.IMPLEMENTED,
    evidence: [
      { evidenceId: "IE-APA-LIMITS-001", evidenceType: "Configuration", location: "agent-policy/payment-agent/transaction-limits.yaml", owner: "Russell" }
    ]
  });
  await createControlImplementation({
    implementationId: "GE-APA-DUAL-APPROVAL-001",
    aiSystemId: paymentSystem.id,
    primaryControlCode: "AI-AGENT-009",
    controlCodes: ["AI-AGENT-005"],
    implementationType: "Runtime Control",
    title: "Dual Approval Workflow",
    description: "Human Approval Gate catalog implementation that requires business and risk approval before high-impact payment execution.",
    owner: "David Kim",
    implementationLocation: "ApprovalWorkflow AWF-DUAL-001 and AWF-COMMITTEE-001",
    validationMethod: "Pilot approval references exist; production approval evidence standard is not finalized.",
    status: ControlImplementationStatus.IMPLEMENTED,
    evidence: [
      { evidenceId: "IE-APA-APPROVAL-001", evidenceType: "Configuration", location: "ApprovalWorkflow AWF-DUAL-001", owner: "David Kim", validationOffset: -8 }
    ]
  });
  await createControlImplementation({
    implementationId: "GE-APA-KILL-SWITCH-001",
    aiSystemId: paymentSystem.id,
    primaryControlCode: "AI-AGENT-007",
    controlCodes: ["OPS-001"],
    implementationType: "Runtime Control",
    title: "Kill Switch",
    description: "Kill Switch catalog implementation that can disable autonomous payment execution but has not yet been tested.",
    owner: "Michael Thompson",
    implementationLocation: "KillSwitch autonomous-payment-agent",
    validationMethod: "Emergency stop tabletop and CCM evidence pending.",
    status: ControlImplementationStatus.IMPLEMENTED,
    evidence: [
      { evidenceId: "IE-APA-KILL-001", evidenceType: "Configuration", location: "KillSwitch status NOT_TESTED", owner: "Michael Thompson" }
    ]
  });
  await createControlImplementation({
    implementationId: "GE-APA-EXECUTION-LOGGING-001",
    aiSystemId: paymentSystem.id,
    primaryControlCode: "AI-AGENT-006",
    controlCodes: ["AUD-001"],
    implementationType: "Detective Control",
    title: "Execution Logging",
    description: "Logging and Audit Trail catalog implementation that records payment execution attempts, tool calls, approval references, and outcomes.",
    owner: "Michael Thompson",
    implementationLocation: "ExecutionLog EXEC-APA-*",
    validationMethod: "CCM-012 validates execution logging; CCM-014 validates implementation evidence.",
    status: ControlImplementationStatus.VALIDATED,
    evidence: [
      { evidenceId: "IE-APA-LOG-001", evidenceType: "Monitoring Report", location: "ExecutionLog records EXEC-APA-001 and EXEC-APA-002", owner: "Michael Thompson", validationOffset: -2 },
      { evidenceId: "IE-APA-LOG-002", evidenceType: "Control Test", location: "CCM-012 agentic governance controls test", owner: "Russell", validationOffset: 0 }
    ]
  });

  await createEvidenceObject({
    evidenceId: "EV-APA-APPROVAL-001",
    aiSystemId: paymentSystem.id,
    title: "Autonomous Payment Agent Approval Workflow Evidence",
    description: "Pilot approval workflow evidence showing dual approval routing, approver roles, and production approval blocker.",
    evidenceType: "Approval Record",
    version: "0.9",
    status: EvidenceObjectStatus.SUBMITTED,
    owner: "David Kim",
    reviewer: "Jennifer Patel",
    source: "governance/payment-agent-approval-workflow.md",
    approvalDate: daysFromToday(-8),
    expirationDate: daysFromToday(70),
    requirementControlIds: ["OSFI-GOV-001"]
  });
  await createEvidenceObject({
    evidenceId: "EV-APA-KILL-001",
    aiSystemId: paymentSystem.id,
    title: "Autonomous Payment Agent Kill Switch Evidence",
    description: "Emergency stop configuration evidence retained for pilot; validation remains incomplete until tabletop testing is approved.",
    evidenceType: "Configuration",
    version: "0.7",
    status: EvidenceObjectStatus.SUBMITTED,
    owner: "Michael Thompson",
    reviewer: "Russell",
    source: "controls/payment-agent-kill-switch.json",
    approvalDate: undefined,
    expirationDate: daysFromToday(45),
    requirementControlIds: []
  });
  await createEvidenceObject({
    evidenceId: "EV-APA-LIMITS-001",
    aiSystemId: paymentSystem.id,
    title: "Autonomous Payment Agent Transaction Limit Evidence",
    description: "Transaction limit configuration showing pilot boundaries, non-production limits, retry limits, and approval thresholds.",
    evidenceType: "Configuration",
    version: "0.8",
    status: EvidenceObjectStatus.SUBMITTED,
    owner: "Russell",
    reviewer: "Jennifer Patel",
    source: "agent-policy/payment-agent/transaction-limits.yaml",
    approvalDate: daysFromToday(-6),
    expirationDate: daysFromToday(80),
    requirementControlIds: []
  });

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
  await addLifecycleControls(legacySystem.id, {
    "AI-LC-004": AuditStatus.BLOCKED,
    "AI-LC-005": AuditStatus.BLOCKED,
    "AI-LC-006": AuditStatus.NEEDS_ATTENTION,
    "AI-LC-007": AuditStatus.NEEDS_ATTENTION
  });
  await createLifecycleHistory(legacySystem.id, [
    {
      lifecycleStage: LifecycleStatus.PROPOSED,
      stageOwner: "Sarah Chen",
      stageEntryOffset: -90,
      stageExitOffset: -70,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Legacy Branch Assistant was proposed as an internal branch FAQ pilot."
    },
    {
      lifecycleStage: LifecycleStatus.DEVELOPMENT,
      stageOwner: "Michael Thompson",
      stageEntryOffset: -70,
      stageExitOffset: -40,
      approvalStatus: LifecycleApprovalStatus.APPROVED,
      notes: "Development completed with a draft prompt and limited internal branch scope."
    },
    {
      lifecycleStage: LifecycleStatus.TESTING,
      stageOwner: "Russell",
      stageEntryOffset: -40,
      approvalStatus: LifecycleApprovalStatus.PENDING,
      notes: "Testing is blocked because evidence completeness and validation are not approved."
    }
  ]);
  await createLifecycleApprovals(legacySystem.id, [
    { approvalId: "LCAPR-LBA-INTAKE-001", approvalType: "AI Intake", approver: "Sarah Chen", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -88, comments: "Intake accepted for internal testing only." },
    { approvalId: "LCAPR-LBA-RISK-001", approvalType: "Risk Assessment", approver: "Russell", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -55, comments: "Initial low-risk pilot assessment accepted pending full validation." },
    { approvalId: "LCAPR-LBA-REG-001", approvalType: "Regulatory Mapping", approver: "Russell", status: LifecycleApprovalStatus.APPROVED, approvalOffset: -44, comments: "Mapped to monitoring and human oversight expectations for testing." },
    { approvalId: "LCAPR-LBA-EVIDENCE-001", approvalType: "Evidence Completeness", approver: "Jennifer Patel", status: LifecycleApprovalStatus.PENDING, comments: "Evidence package incomplete; monitoring report is expired and oversight evidence is missing." },
    { approvalId: "LCAPR-LBA-VALIDATION-001", approvalType: "Validation", approver: "Michael Thompson", status: LifecycleApprovalStatus.PENDING, comments: "Validation is not complete for testing exit." }
  ]);

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

  await seedTravelBrainRuntimeEvidence(system.id);
  await seedTravelBrainDeploymentEvidence(system.id, previousPortainerDeployment);
  await seedTravelBrainSupabaseEvidence(system.id, previousSupabaseSnapshot);
  await seedTravelBrainMcpEvidence(system.id);
  await seedTravelBrainNotionEvidence(system.id);
  await seedTravelBrainSecretsEvidence(system.id);
  await seedTravelBrainAssetDiscovery(system.id);

  const assertRiskCategory = (category: typeof aiRiskCategories[number]) => category;
  const createAiRisk = async (input: {
    riskId: string;
    title: string;
    description: string;
    category: typeof aiRiskCategories[number];
    aiSystemId: string;
    owner: string;
    status: AiRiskStatus;
    createdOffset: number;
    reviewOffset: number;
    inherentLikelihood: RiskLevel;
    inherentImpact: RiskLevel;
    residualLikelihood: RiskLevel;
    residualImpact: RiskLevel;
    treatment: RiskTreatment;
    treatmentPlan: string;
    residualRiskLogic: string;
    acceptance?: {
      approver: string;
      approvalOffset: number;
      expirationOffset: number;
      rationale: string;
    };
    controlCodes: string[];
    evidenceIds: string[];
    findingTestIds?: string[];
  }) => {
    const risk = await prisma.aiRisk.create({
      data: {
        riskId: input.riskId,
        title: input.title,
        description: input.description,
        category: assertRiskCategory(input.category),
        aiSystemId: input.aiSystemId,
        owner: input.owner,
        status: input.status,
        createdDate: daysFromToday(input.createdOffset),
        reviewDate: daysFromToday(input.reviewOffset),
        inherentLikelihood: input.inherentLikelihood,
        inherentImpact: input.inherentImpact,
        inherentRating: calculateRiskRating(input.inherentLikelihood, input.inherentImpact),
        residualLikelihood: input.residualLikelihood,
        residualImpact: input.residualImpact,
        residualRating: calculateRiskRating(input.residualLikelihood, input.residualImpact),
        treatment: input.treatment,
        treatmentPlan: input.treatmentPlan,
        residualRiskLogic: input.residualRiskLogic,
        acceptanceApprover: input.acceptance?.approver,
        acceptanceApprovalDate: input.acceptance ? daysFromToday(input.acceptance.approvalOffset) : null,
        acceptanceExpirationDate: input.acceptance ? daysFromToday(input.acceptance.expirationOffset) : null,
        acceptanceRationale: input.acceptance?.rationale
      }
    });

    for (const code of input.controlCodes) {
      const control = createdControls.get(code);
      if (control) {
        await prisma.aiRiskControl.create({ data: { aiRiskId: risk.id, controlId: control.id } });
      }
    }

    for (const evidenceId of input.evidenceIds) {
      const evidence = await prisma.evidenceObject.findUnique({ where: { evidenceId } });
      if (evidence) {
        await prisma.aiRiskEvidence.create({ data: { aiRiskId: risk.id, evidenceObjectId: evidence.id } });
      }
    }

    if (input.findingTestIds?.length) {
      const findingsToLink = await prisma.finding.findMany({
        where: {
          aiSystemId: input.aiSystemId,
          controlTest: { testId: { in: input.findingTestIds } }
        }
      });
      for (const finding of findingsToLink) {
        await prisma.aiRiskFinding.create({ data: { aiRiskId: risk.id, findingId: finding.id } });
      }
    }
  };

  await createAiRisk({
    riskId: "AIRISK-TB-HALLUCINATION-001",
    title: "Hallucinated Recommendation",
    description: "Travel Brain may generate a plausible but inaccurate destination, itinerary, or benefit recommendation.",
    category: "Hallucination Risk",
    aiSystemId: system.id,
    owner: "Sarah Chen",
    status: AiRiskStatus.IN_TREATMENT,
    createdOffset: -30,
    reviewOffset: 60,
    inherentLikelihood: RiskLevel.MEDIUM,
    inherentImpact: RiskLevel.MEDIUM,
    residualLikelihood: RiskLevel.LOW,
    residualImpact: RiskLevel.MEDIUM,
    treatment: RiskTreatment.MITIGATE,
    treatmentPlan: "Maintain recommendation-only authority, require source-grounded explanations, monitor escalations, and review prompt changes.",
    residualRiskLogic: "Controls reduce likelihood through prompt guardrails, approved content sources, oversight escalation, and no booking or transaction authority; impact remains Medium because customer-facing advice can still influence decisions.",
    controlCodes: ["EXP-001", "HUM-001", "AI-GOV-003", "AI-GOV-004"],
    evidenceIds: ["EV-TB-HO-001", "EV-TB-MON-001"]
  });
  await createAiRisk({
    riskId: "AIRISK-TB-PRIVACY-001",
    title: "Privacy Exposure",
    description: "Travel Brain may expose or overuse personal travel preferences, loyalty attributes, or customer profile data.",
    category: "Privacy Risk",
    aiSystemId: system.id,
    owner: "Russell",
    status: AiRiskStatus.ACCEPTED,
    createdOffset: -28,
    reviewOffset: 45,
    inherentLikelihood: RiskLevel.MEDIUM,
    inherentImpact: RiskLevel.HIGH,
    residualLikelihood: RiskLevel.LOW,
    residualImpact: RiskLevel.MEDIUM,
    treatment: RiskTreatment.ACCEPT,
    treatmentPlan: "Accept residual privacy risk for recommendation-only production use while maintaining data minimization and monitoring evidence.",
    residualRiskLogic: "Data inventory, privacy controls, approved evidence, and read-only authority reduce likelihood; residual impact remains Medium because personal data is still processed.",
    acceptance: {
      approver: "David Kim",
      approvalOffset: -18,
      expirationOffset: 90,
      rationale: "Residual privacy risk accepted for bounded recommendation-only use with current data inventory and monitoring evidence."
    },
    controlCodes: ["PRI-001", "AI-LC-004", "AI-GOV-006"],
    evidenceIds: ["EV-TB-DATA-001", "EV-TB-APP-001"]
  });
  await createAiRisk({
    riskId: "AIRISK-TB-GUIDANCE-001",
    title: "Incorrect Travel Guidance",
    description: "Travel Brain may provide outdated or unsuitable travel guidance that customers interpret as bank-approved advice.",
    category: "Explainability Risk",
    aiSystemId: system.id,
    owner: "Sarah Chen",
    status: AiRiskStatus.OPEN,
    createdOffset: -20,
    reviewOffset: 35,
    inherentLikelihood: RiskLevel.MEDIUM,
    inherentImpact: RiskLevel.MEDIUM,
    residualLikelihood: RiskLevel.MEDIUM,
    residualImpact: RiskLevel.LOW,
    treatment: RiskTreatment.MITIGATE,
    treatmentPlan: "Improve explanation copy, monitor customer escalations, and refresh destination content vendor reviews.",
    residualRiskLogic: "Explanation, vendor, and monitoring controls reduce customer impact, but stale external content keeps residual likelihood at Medium.",
    controlCodes: ["EXP-001", "TPR-001", "AI-GOV-010"],
    evidenceIds: ["EV-TB-VENDOR-001", "EV-TB-MON-001"]
  });
  await createAiRisk({
    riskId: "AIRISK-APA-UNAUTH-TXN-001",
    title: "Unauthorized Transaction",
    description: "Autonomous Payment Agent may execute a transaction outside approved policy, value, or customer authorization boundaries.",
    category: "Tool Misuse Risk",
    aiSystemId: paymentSystem.id,
    owner: "Russell",
    status: AiRiskStatus.IN_TREATMENT,
    createdOffset: -12,
    reviewOffset: 18,
    inherentLikelihood: RiskLevel.HIGH,
    inherentImpact: RiskLevel.CRITICAL,
    residualLikelihood: RiskLevel.MEDIUM,
    residualImpact: RiskLevel.HIGH,
    treatment: RiskTreatment.MITIGATE,
    treatmentPlan: "Keep pilot non-production, require dual approvals, enforce payment API guardrails, and block production until kill switch test evidence is approved.",
    residualRiskLogic: "Approval workflow, non-production scope, execution logging, and tool permissions reduce likelihood, but financial transaction capability keeps residual impact High.",
    controlCodes: ["AI-AGENT-002", "AI-AGENT-003", "AI-AGENT-006", "AI-LC-006"],
    evidenceIds: ["EV-APA-LIMITS-001", "EV-APA-APPROVAL-001"],
    findingTestIds: ["CCM-012"]
  });
  await createAiRisk({
    riskId: "AIRISK-APA-APPROVAL-BYPASS-001",
    title: "Approval Bypass",
    description: "Autonomous Payment Agent may execute high-impact actions without required human approval evidence.",
    category: "Autonomy Risk",
    aiSystemId: paymentSystem.id,
    owner: "David Kim",
    status: AiRiskStatus.OPEN,
    createdOffset: -10,
    reviewOffset: 15,
    inherentLikelihood: RiskLevel.HIGH,
    inherentImpact: RiskLevel.CRITICAL,
    residualLikelihood: RiskLevel.MEDIUM,
    residualImpact: RiskLevel.CRITICAL,
    treatment: RiskTreatment.AVOID,
    treatmentPlan: "Avoid production release until approval evidence standards, enforcement checks, and committee sign-off are complete.",
    residualRiskLogic: "Pilot approval workflows reduce likelihood, but missing production approval and emergency stop test leave residual impact Critical.",
    controlCodes: ["AI-AGENT-005", "AI-AGENT-009", "AI-LC-006"],
    evidenceIds: ["EV-APA-APPROVAL-001"],
    findingTestIds: ["CCM-012"]
  });
  await createAiRisk({
    riskId: "AIRISK-APA-RUNAWAY-001",
    title: "Runaway Automation",
    description: "Autonomous Payment Agent may repeatedly execute or retry payment actions without timely interruption.",
    category: "Autonomy Risk",
    aiSystemId: paymentSystem.id,
    owner: "Michael Thompson",
    status: AiRiskStatus.IN_TREATMENT,
    createdOffset: -9,
    reviewOffset: 12,
    inherentLikelihood: RiskLevel.MEDIUM,
    inherentImpact: RiskLevel.CRITICAL,
    residualLikelihood: RiskLevel.MEDIUM,
    residualImpact: RiskLevel.HIGH,
    treatment: RiskTreatment.MITIGATE,
    treatmentPlan: "Complete kill switch test, add retry limits, monitor execution logs daily, and require resilience sign-off before production.",
    residualRiskLogic: "Execution logging and defined kill switch lower operational uncertainty, but the kill switch has not been tested, leaving residual High risk.",
    controlCodes: ["AI-AGENT-007", "AI-AGENT-010", "OPS-001"],
    evidenceIds: ["EV-APA-KILL-001", "EV-APA-LIMITS-001"],
    findingTestIds: ["CCM-012"]
  });

  const createAuditPackage = async (input: {
    packageId: string;
    title: string;
    scope: string;
    packageType: string;
    owner: string;
    aiSystemId?: string;
    evidenceIds: string[];
  }) => {
    const auditPackage = await prisma.auditPackage.create({
      data: {
        packageId: input.packageId,
        title: input.title,
        scope: input.scope,
        packageType: input.packageType,
        owner: input.owner,
        aiSystemId: input.aiSystemId,
        generatedDate: daysFromToday(0)
      }
    });

    for (const evidenceId of input.evidenceIds) {
      const evidence = await prisma.evidenceObject.findUnique({ where: { evidenceId } });
      if (evidence) {
        await prisma.auditPackageEvidence.create({
          data: { auditPackageId: auditPackage.id, evidenceObjectId: evidence.id }
        });
      }
    }
  };

  await createAuditPackage({
    packageId: "AUDPKG-TB-2026-001",
    title: "Travel Brain Audit Package",
    scope: "Production AI system audit package covering risk, regulatory mapping, monitoring, human oversight, approval, and data inventory evidence.",
    packageType: "AI System",
    owner: "Jennifer Patel",
    aiSystemId: system.id,
    evidenceIds: ["EV-TB-RISK-001", "EV-TB-ARCH-001", "EV-TB-DATA-001", "EV-TB-MON-001", "EV-TB-HO-001", "EV-TB-APP-001", "EV-TB-REGMAP-001"]
  });
  await createAuditPackage({
    packageId: "AUDPKG-OSFI-E23-2026-001",
    title: "OSFI E-23 Audit Package",
    scope: "Regulatory evidence package for OSFI E-23 inventory, governance, monitoring, and evidence retention expectations.",
    packageType: "Regulation",
    owner: "Jennifer Patel",
    evidenceIds: ["EV-TB-REGMAP-001", "EV-TB-APP-001", "EV-TB-MON-001", "EV-LBA-MON-OLD-001"]
  });
  await createAuditPackage({
    packageId: "AUDPKG-APA-PILOT-2026-001",
    title: "Autonomous Payment Agent Pilot Evidence Package",
    scope: "Pilot package covering approval workflow, transaction limits, kill switch evidence, and execution logging for agentic AI governance review.",
    packageType: "AI System",
    owner: "Jennifer Patel",
    aiSystemId: paymentSystem.id,
    evidenceIds: ["EV-APA-APPROVAL-001", "EV-APA-KILL-001", "EV-APA-LIMITS-001"]
  });
}

function calculateRiskRating(likelihood: RiskLevel, impact: RiskLevel) {
  const score = {
    [RiskLevel.LOW]: 1,
    [RiskLevel.MEDIUM]: 2,
    [RiskLevel.HIGH]: 3,
    [RiskLevel.CRITICAL]: 4
  }[likelihood] * {
    [RiskLevel.LOW]: 1,
    [RiskLevel.MEDIUM]: 2,
    [RiskLevel.HIGH]: 3,
    [RiskLevel.CRITICAL]: 4
  }[impact];

  if (score >= 12) return RiskLevel.CRITICAL;
  if (score >= 8) return RiskLevel.HIGH;
  if (score >= 4) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

async function listRepositoryFiles(root: string) {
  const files: string[] = [];
  async function walk(directory: string) {
    const entries = await readdir(directory);
    for (const entry of entries) {
      const fullPath = join(directory, entry);
      const entryStat = await stat(fullPath);
      if (entryStat.isDirectory()) {
        await walk(fullPath);
      } else {
        files.push(relative(root, fullPath).replaceAll("\\", "/"));
      }
    }
  }
  await walk(root);
  return files.sort();
}

type GitHubApiRepository = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  description: string | null;
  private: boolean;
  archived: boolean;
  pushed_at: string | null;
  owner: { login: string };
};

type GitHubTreeResponse = {
  tree: Array<{ path: string; type: string; sha: string }>;
};

type GitHubContentResponse = {
  content?: string;
  encoding?: string;
  html_url?: string;
  sha?: string;
};

type GitHubCommitResponse = Array<{ sha: string }>;

type CollectedRepositoryFile = {
  path: string;
  content: string;
  commitSha: string;
  sourceUrl: string;
};

const githubDiscoveryRules = [
  {
    sourceId: "SRC-TB-GH-MANIFEST",
    artifactIdPrefix: "ART-TB-GH-MANIFEST",
    artifactType: EvidenceArtifactType.MANIFEST,
    eventType: ArtifactDriftType.MANIFEST_CHANGED,
    name: "Travel Brain AI Governance.yaml",
    matches: (path: string) => basename(path).toLowerCase() === "ai governance.yaml"
  },
  {
    sourceId: "SRC-TB-GH-PROMPTS",
    artifactIdPrefix: "ART-TB-GH-PROMPT",
    artifactType: EvidenceArtifactType.PROMPT,
    eventType: ArtifactDriftType.PROMPT_CHANGED,
    name: "Travel Brain Prompt",
    matches: (path: string) => path.startsWith("prompts/") && path.endsWith(".md")
  },
  {
    sourceId: "SRC-TB-GH-POLICIES",
    artifactIdPrefix: "ART-TB-GH-POLICY",
    artifactType: EvidenceArtifactType.POLICY,
    eventType: ArtifactDriftType.POLICY_CHANGED,
    name: "Travel Brain Policy",
    matches: (path: string) => path.startsWith("governance/") && (path.endsWith(".yaml") || path.endsWith(".yml") || path.endsWith(".md"))
  },
  {
    sourceId: "SRC-TB-GH-WORKFLOWS",
    artifactIdPrefix: "ART-TB-GH-WORKFLOW",
    artifactType: EvidenceArtifactType.WORKFLOW,
    eventType: ArtifactDriftType.WORKFLOW_CHANGED,
    name: "Travel Brain Workflow",
    matches: (path: string) => path.startsWith(".github/workflows/") && (path.endsWith(".yaml") || path.endsWith(".yml"))
  }
];

async function seedTravelBrainGitHubArtifacts(aiSystemId: string) {
  const githubToken = process.env.GITHUB_TOKEN?.trim();
  const githubOwner = process.env.GITHUB_OWNER?.trim();
  const discoveredRepositories = githubToken && githubOwner ? await discoverGitHubRepositories(githubOwner, githubToken) : [];
  const selectedRepository = selectTravelBrainRepository(discoveredRepositories);

  await Promise.all(discoveredRepositories.map((repository) =>
    prisma.gitHubRepositoryDiscovery.create({
      data: {
        repositoryId: `GH-${repository.id}`,
        owner: repository.owner.login,
        name: repository.name,
        fullName: repository.full_name,
        repositoryUrl: repository.html_url,
        defaultBranch: repository.default_branch,
        description: repository.description ?? "No repository description provided.",
        isPrivate: repository.private,
        isArchived: repository.archived,
        lastPushedAt: repository.pushed_at ? new Date(repository.pushed_at) : null,
        selectedForAiSystemId: selectedRepository?.id === repository.id ? aiSystemId : null
      }
    })
  ));

  const liveCollection = selectedRepository && githubToken
    ? await collectGitHubRepositoryFiles(selectedRepository, githubToken)
    : null;
  const repositoryFiles = liveCollection?.files ?? await collectLocalReferenceRepositoryFiles();
  const repositoryUrl = liveCollection?.repositoryUrl ?? "https://github.com/local-reference/travel-brain";
  const branch = liveCollection?.branch ?? "main";

  const repositoryConnection = await prisma.repositoryConnection.create({
    data: {
      repositoryId: "REPO-TB-GITHUB-001",
      aiSystemId,
      repositoryUrl,
      branch,
      status: RepositoryConnectionStatus.CONNECTED,
      lastScan: new Date()
    }
  });

  const githubSources = await prisma.evidenceSource.findMany({
    where: {
      sourceId: {
        in: githubDiscoveryRules.map((rule) => rule.sourceId)
      }
    }
  });
  const githubSourceBySourceId = new Map(githubSources.map((source) => [source.sourceId, source]));
  const fileByPath = new Map(repositoryFiles.map((file) => [file.path, file]));

  let collectedManifest = false;
  for (const rule of githubDiscoveryRules) {
    const matchingPaths = repositoryFiles.map((file) => file.path).filter(rule.matches).sort();
    const source = githubSourceBySourceId.get(rule.sourceId);
    if (!source) continue;

    for (const [index, artifactPath] of matchingPaths.entries()) {
      const file = fileByPath.get(artifactPath);
      if (!file) continue;
      const artifactHash = createHash("sha256").update(file.content).digest("hex");
      const artifactId = `${rule.artifactIdPrefix}-${String(index + 1).padStart(3, "0")}`;
      const artifactName = matchingPaths.length === 1 ? rule.name : `${rule.name} - ${artifactPath}`;
      const collectedAt = new Date();
      const version = `${branch}@${file.commitSha.slice(0, 12)}`;
      if (rule.artifactType === EvidenceArtifactType.MANIFEST) collectedManifest = true;

      const evidenceArtifact = await prisma.evidenceArtifact.create({
        data: {
          artifactId,
          sourceId: source.id,
          repositoryConnectionId: repositoryConnection.id,
          artifactType: rule.artifactType,
          name: artifactName,
          path: artifactPath,
          content: file.content,
          version,
          artifactHash,
          commitSha: file.commitSha,
          sourceUrl: file.sourceUrl,
          lastCollected: collectedAt,
          validationStatus: EvidenceValidationValue.VALID
        }
      });

      await prisma.evidenceSnapshot.create({
        data: {
          snapshotId: `SNAP-${artifactId}-001`,
          evidenceArtifactId: evidenceArtifact.id,
          content: file.content,
          artifactHash,
          commitSha: file.commitSha,
          version,
          sourceUrl: file.sourceUrl,
          collectionMethod: liveCollection ? "GitHub contents API read-only collection" : "Local reference repository mirror collection",
          collectedAt
        }
      });

      await prisma.artifactDriftEvent.create({
        data: {
          driftId: `DRIFT-${artifactId}`,
          repositoryConnectionId: repositoryConnection.id,
          artifactId,
          artifactType: rule.artifactType,
          eventType: rule.eventType,
          path: artifactPath,
          previousHash: "baseline-pending",
          currentHash: artifactHash,
          detectedAt: new Date(),
          summary: `${artifactName} collected from ${liveCollection ? "GitHub" : "local repository mirror"} baseline. Future scans will compare hashes for drift.`
        }
      });
    }
  }

  if (!collectedManifest) {
    const travelBrainDiscovery = await prisma.repositoryDiscovery.findFirst({ where: { name: "travel-brain" } });
    if (travelBrainDiscovery) {
      await prisma.repositoryOnboardingFinding.create({
        data: {
          findingId: "AI-GOV-MANIFEST-001",
          repositoryDiscoveryId: travelBrainDiscovery.id,
          title: "AI Governance Manifest Missing",
          severity: FindingSeverity.MEDIUM,
          status: FindingStatus.OPEN,
          rationale: "Selected GitHub repository scan did not find AI Governance.yaml. Travel Brain should not complete repository onboarding until ownership, lifecycle, AI type, risk scope, and evidence sources are declared and reviewed."
        }
      });
    }
  }

  await seedArtifactAssuranceRules();
}

function selectTravelBrainRepository(repositories: GitHubApiRepository[]) {
  const normalizedTarget = "travelbrain";
  return repositories.find((repository) => normalizeRepositoryName(repository.name) === normalizedTarget)
    ?? repositories.find((repository) => normalizeRepositoryName(repository.full_name).endsWith(`/${normalizedTarget}`))
    ?? repositories.find((repository) => normalizeRepositoryName(repository.name).includes(normalizedTarget))
    ?? null;
}

function normalizeRepositoryName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9/]/g, "");
}

async function discoverGitHubRepositories(owner: string, token: string) {
  const repositories = new Map<number, GitHubApiRepository>();
  const endpoints = [
    `https://api.github.com/orgs/${encodeURIComponent(owner)}/repos?type=all&sort=pushed&per_page=100`,
    `https://api.github.com/users/${encodeURIComponent(owner)}/repos?type=all&sort=pushed&per_page=100`,
    `https://api.github.com/user/repos?visibility=all&affiliation=owner&sort=pushed&per_page=100`
  ];

  for (const endpoint of endpoints) {
    const result = await githubGet<GitHubApiRepository[]>(endpoint, token);
    if (!result) continue;
    for (const repository of result) {
      if (repository.owner.login.toLowerCase() === owner.toLowerCase()) repositories.set(repository.id, repository);
    }
  }

  return [...repositories.values()].sort((a, b) => a.full_name.localeCompare(b.full_name));
}

async function collectGitHubRepositoryFiles(repository: GitHubApiRepository, token: string) {
  const [owner, repo] = repository.full_name.split("/");
  const branch = repository.default_branch || "main";
  const tree = await githubGet<GitHubTreeResponse>(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`, token);
  if (!tree) return null;

  const candidatePaths = tree.tree
    .filter((item) => item.type === "blob")
    .map((item) => item.path)
    .filter((path) => githubDiscoveryRules.some((rule) => rule.matches(path)))
    .sort();

  const files: CollectedRepositoryFile[] = [];
  for (const path of candidatePaths) {
    const content = await githubGet<GitHubContentResponse>(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(branch)}`, token);
    if (!content?.content || content.encoding !== "base64") continue;
    const commitParams = new URLSearchParams({ sha: branch, path, per_page: "1" });
    const commits = await githubGet<GitHubCommitResponse>(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?${commitParams.toString()}`, token);
    const commitSha = commits?.[0]?.sha ?? content.sha ?? "unknown";
    files.push({
      path,
      content: Buffer.from(content.content.replace(/\n/g, ""), "base64").toString("utf8"),
      commitSha,
      sourceUrl: content.html_url ?? `${repository.html_url}/blob/${branch}/${path}`
    });
  }

  return {
    repositoryUrl: repository.html_url,
    branch,
    files
  };
}

async function collectLocalReferenceRepositoryFiles() {
  const repositoryRoot = join(process.cwd(), "..", "..", "reference-repositories", "travel-brain");
  const paths = await listRepositoryFiles(repositoryRoot);
  const files: CollectedRepositoryFile[] = [];
  for (const path of paths.filter((filePath) => githubDiscoveryRules.some((rule) => rule.matches(filePath)))) {
    const content = await readFile(join(repositoryRoot, path), "utf8");
    const artifactHash = createHash("sha256").update(content).digest("hex");
    files.push({
      path,
      content,
      commitSha: `local-${artifactHash}`,
      sourceUrl: `https://github.com/local-reference/travel-brain/blob/main/${path}`
    });
  }
  return files;
}

async function seedTravelBrainRuntimeEvidence(aiSystemId: string) {
  const [evidenceSources, executionLogs, testRuns, auditEvents] = await Promise.all([
    prisma.evidenceSource.findMany({
      where: { sourceId: { in: ["SRC-TB-LOG-EXEC", "SRC-TB-LOG-MONITORING", "SRC-TB-LOG-CONTROLS"] } }
    }),
    prisma.executionLog.findMany({
      where: { aiSystemId },
      include: { agent: true, tool: true, action: true },
      orderBy: { timestamp: "desc" }
    }),
    prisma.testRun.findMany({
      where: { aiSystemId },
      include: { controlTest: true },
      orderBy: { executionDate: "desc" }
    }),
    prisma.auditEvent.findMany({
      where: { aiSystemId },
      orderBy: { createdAt: "desc" }
    })
  ]);
  const evidenceSourceById = new Map(evidenceSources.map((source) => [source.sourceId, source]));
  const collectionDate = new Date();

  const createLogSource = async (input: {
    logSourceId: string;
    evidenceSourceId?: string;
    name: string;
    location: string;
    type: LogSourceType;
    available: boolean;
    retentionPeriod: string;
    lastCollected?: Date | null;
    sourceGap: string;
  }) => prisma.logSource.create({
    data: {
      logSourceId: input.logSourceId,
      aiSystemId,
      evidenceSourceId: input.evidenceSourceId ? evidenceSourceById.get(input.evidenceSourceId)?.id : undefined,
      name: input.name,
      location: input.location,
      type: input.type,
      status: input.available ? LogSourceStatus.CONNECTED : LogSourceStatus.GAP,
      retentionPeriod: input.retentionPeriod,
      lastCollected: input.lastCollected ?? null,
      sourceGap: input.sourceGap
    }
  });

  const executionSource = await createLogSource({
    logSourceId: "LOGSRC-TB-EXEC",
    evidenceSourceId: "SRC-TB-LOG-EXEC",
    name: "Travel Brain Execution Log Metadata",
    location: "ExecutionLog table; declared external source logs/recommendations/*.jsonl is not connected",
    type: LogSourceType.EXECUTION_LOG,
    available: executionLogs.length > 0,
    retentionPeriod: "365 days metadata retention; payload collection prohibited",
    lastCollected: executionLogs[0]?.timestamp,
    sourceGap: "Runtime execution metadata is available from the platform ExecutionLog table. Travel Brain has not exposed the declared external JSONL log path yet, so Phase 9C does not collect payloads or customer content."
  });

  for (const [index, log] of executionLogs.entries()) {
    await createRuntimeEvidenceArtifact({
      artifactId: `RTE-TB-EXEC-${String(index + 1).padStart(3, "0")}`,
      logSourceId: executionSource.id,
      eventType: LogSourceType.EXECUTION_LOG,
      evidenceType: RuntimeEvidenceType.EXECUTION,
      eventTimestamp: log.timestamp,
      correlationId: log.executionId,
      sourceRecordId: log.executionId,
      relatedControlId: "AI-AGENT-006",
      collectionDate,
      sanitizedEvidence: JSON.stringify({
        evidenceType: "Execution Event",
        timestamp: log.timestamp.toISOString(),
        action: log.action.name,
        toolUsed: log.tool.name,
        result: log.outcome,
        correlationId: log.executionId,
        initiatedByCategory: log.initiatedBy,
        approvalReference: log.approvalReference ?? "Not required for recommendation-only activity",
        privacyBoundary: "No customer prompt, itinerary content, account data, tokens, or payload values collected."
      }, null, 2),
      evidenceSummary: `Execution event demonstrates that ${log.action.name} used ${log.tool.name} and retained correlation metadata without customer content.`,
      collectionReason: "Execution evidence is collected to show runtime control operation for agent execution logging and audit sampling.",
      retentionPolicy: "365 days metadata retention; payload collection prohibited.",
      evidenceHealth: RuntimeEvidenceHealth.PRESENT,
      retentionValid: true,
      collectionCurrent: true,
      collectionRationale: "Collected because AI-AGENT-006 requires execution logging evidence for agent, tool, action, timestamp, initiator, and outcome metadata.",
      assuranceSummary: `${log.executionId} demonstrates control operation: Travel Brain retained action, tool, result, timestamp, and correlation metadata for ${log.action.name}.`,
      failureCondition: "This assurance fails if execution metadata disappears, correlation IDs are missing, timestamps are absent, or Travel Brain runtime activity cannot be sampled without customer payloads."
    });
  }

  const monitoringSource = await createLogSource({
    logSourceId: "LOGSRC-TB-MONITORING",
    evidenceSourceId: "SRC-TB-LOG-MONITORING",
    name: "Travel Brain Monitoring Result Metadata",
    location: "TestRun table; declared external source monitoring/travel-brain-control-health.json is not connected",
    type: LogSourceType.MONITORING_RESULT,
    available: testRuns.length > 0,
    retentionPeriod: "365 days monitoring metadata retention",
    lastCollected: testRuns[0]?.executionDate,
    sourceGap: "Monitoring results are available from the platform TestRun table. Travel Brain has not exposed the declared monitoring JSON source yet, so collection remains metadata-first."
  });
  const monitoringPasses = testRuns.filter((run) => run.result === "PASS").length;
  await createRuntimeEvidenceArtifact({
    artifactId: "RTE-TB-MONITORING-001",
    logSourceId: monitoringSource.id,
    eventType: LogSourceType.MONITORING_RESULT,
    evidenceType: RuntimeEvidenceType.MONITORING,
    eventTimestamp: testRuns[0]?.executionDate ?? collectionDate,
    correlationId: "TB-MONITORING-LATEST",
    sourceRecordId: `${monitoringPasses}/${testRuns.length} monitoring tests passing`,
    relatedControlId: "AI-GOV-010",
    collectionDate,
    sanitizedEvidence: JSON.stringify({
      evidenceType: "Monitoring Event",
      timestamp: (testRuns[0]?.executionDate ?? collectionDate).toISOString(),
      controlTestsReviewed: testRuns.length,
      passingTests: monitoringPasses,
      warningOrFailedTests: testRuns.length - monitoringPasses,
      outcome: monitoringPasses === testRuns.length ? "PASS" : "WARNING",
      correlationId: "TB-MONITORING-LATEST",
      privacyBoundary: "No customer interactions, prompts, or runtime payloads collected."
    }, null, 2),
    evidenceSummary: `Monitoring event demonstrates that ${testRuns.length} Travel Brain control tests executed, with ${monitoringPasses} passing in the latest monitoring cycle.`,
    collectionReason: "Monitoring evidence is collected to show that AI risk-domain monitoring continues after design approval.",
    retentionPolicy: "365 days monitoring metadata retention.",
    evidenceHealth: testRuns.length > 0 ? RuntimeEvidenceHealth.PRESENT : RuntimeEvidenceHealth.MISSING,
    retentionValid: true,
    collectionCurrent: true,
    collectionRationale: "Collected because AI-GOV-010 needs operating evidence that AI risk domains and monitoring controls continue to run after design approval.",
    assuranceSummary: `Monitoring event demonstrates control operation: ${monitoringPasses}/${testRuns.length} Travel Brain control tests passed in the latest monitoring cycle.`,
    failureCondition: "This assurance fails if monitoring stops running, control test timestamps become stale, or monitoring results cannot be linked to AI risk and control coverage."
  });

  const controlSource = await createLogSource({
    logSourceId: "LOGSRC-TB-CONTROLS",
    evidenceSourceId: "SRC-TB-LOG-CONTROLS",
    name: "Travel Brain Control Result Metadata",
    location: "TestRun table; declared external source monitoring/control-results/travel-brain.json is not connected",
    type: LogSourceType.CONTROL_RESULT,
    available: testRuns.length > 0,
    retentionPeriod: "365 days control-result metadata retention",
    lastCollected: testRuns[0]?.executionDate,
    sourceGap: "Control result metadata is available from platform monitoring. Travel Brain has not exposed the declared control-results JSON source yet."
  });
  const warningOrFailedRuns = testRuns.filter((run) => run.result !== "PASS");
  await createRuntimeEvidenceArtifact({
    artifactId: "RTE-TB-CONTROL-001",
    logSourceId: controlSource.id,
    eventType: LogSourceType.CONTROL_RESULT,
    evidenceType: RuntimeEvidenceType.CONTROL_RESULT,
    eventTimestamp: testRuns[0]?.executionDate ?? collectionDate,
    correlationId: "TB-CONTROL-RESULTS-LATEST",
    sourceRecordId: `${testRuns.length} control results; ${warningOrFailedRuns.length} warning/fail`,
    relatedControlId: "AUD-001",
    collectionDate,
    sanitizedEvidence: JSON.stringify({
      evidenceType: "Control Result",
      timestamp: (testRuns[0]?.executionDate ?? collectionDate).toISOString(),
      controlResultCount: testRuns.length,
      passCount: testRuns.filter((run) => run.result === "PASS").length,
      warningCount: testRuns.filter((run) => run.result === "WARNING").length,
      failCount: testRuns.filter((run) => run.result === "FAIL").length,
      outcome: warningOrFailedRuns.length === 0 ? "PASS" : "WARNING",
      correlationId: "TB-CONTROL-RESULTS-LATEST",
      privacyBoundary: "Only aggregated control result metadata collected."
    }, null, 2),
    evidenceSummary: `Control result demonstrates monitoring execution: ${testRuns.length} results were retained with ${warningOrFailedRuns.length} warning or failed outcomes.`,
    collectionReason: "Control result evidence is collected to prove monitoring execution and audit-trail completeness.",
    retentionPolicy: "365 days control-result metadata retention.",
    evidenceHealth: testRuns.length > 0 ? RuntimeEvidenceHealth.PRESENT : RuntimeEvidenceHealth.MISSING,
    retentionValid: true,
    collectionCurrent: true,
    collectionRationale: "Collected because AUD-001 requires audit-ready control result metadata that can be traced to monitoring and evidence review.",
    assuranceSummary: `Control result demonstrates monitoring execution: Travel Brain retained ${testRuns.length} control results for audit review.`,
    failureCondition: "This assurance fails if control results are missing, cannot be tied to monitoring runs, or cannot be reproduced during audit review."
  });

  const auditSource = await createLogSource({
    logSourceId: "LOGSRC-TB-AUDIT",
    name: "Travel Brain Audit Event Metadata",
    location: "AuditEvent table; external audit-event stream not connected",
    type: LogSourceType.AUDIT_EVENT,
    available: auditEvents.length > 0,
    retentionPeriod: "7 years governance event metadata retention",
    lastCollected: auditEvents[0]?.createdAt,
    sourceGap: "Audit events are available as governance metadata inside the platform. Travel Brain does not yet publish a separate audit-event stream."
  });
  if (auditEvents[0]) {
    await createRuntimeEvidenceArtifact({
      artifactId: "RTE-TB-AUDIT-001",
      logSourceId: auditSource.id,
      eventType: LogSourceType.AUDIT_EVENT,
      evidenceType: RuntimeEvidenceType.AUDIT_EVENT,
      eventTimestamp: auditEvents[0].createdAt,
      correlationId: "TB-AUDIT-LATEST",
      sourceRecordId: auditEvents[0].eventType,
      relatedControlId: "AUD-001",
      collectionDate,
      sanitizedEvidence: JSON.stringify({
        evidenceType: "Audit Event",
        timestamp: auditEvents[0].createdAt.toISOString(),
        actor: auditEvents[0].actor,
        action: auditEvents[0].eventType,
        outcome: auditEvents[0].summary,
        correlationId: "TB-AUDIT-LATEST",
        privacyBoundary: "Governance actor/action metadata only. No customer content, secrets, or system payloads collected."
      }, null, 2),
      evidenceSummary: `Audit event demonstrates governance activity by ${auditEvents[0].actor}: ${auditEvents[0].eventType}.`,
      collectionReason: "Audit event evidence is collected to prove governance review activity and audit trail completeness.",
      retentionPolicy: "7 years governance event metadata retention.",
      evidenceHealth: RuntimeEvidenceHealth.PRESENT,
      retentionValid: true,
      collectionCurrent: true,
      collectionRationale: "Collected because AUD-001 needs governance event metadata showing who changed or reviewed governance state and when.",
      assuranceSummary: `Audit event demonstrates governance operation: ${auditEvents[0].actor} performed ${auditEvents[0].eventType}.`,
      failureCondition: "This assurance fails if governance events are not retained, actors are missing, or audit events cannot be tied back to evidence and control activity."
    });
  }
}

async function seedTravelBrainDeploymentEvidence(aiSystemId: string, previousDeployment: PreviousPortainerDeployment | null) {
  const deploymentSource = await prisma.evidenceSource.findUnique({
    where: { sourceId: "SRC-TB-PORT-DEPLOYMENT" }
  });
  const portainerEndpoint = process.env.PORTAINER_ENDPOINT?.trim();
  const portainerToken = process.env.PORTAINER_TOKEN?.trim();
  const collectionTimestamp = new Date();

  if (!portainerEndpoint || !portainerToken) {
    const missing = [
      !portainerEndpoint ? "PORTAINER_ENDPOINT" : null,
      !portainerToken ? "PORTAINER_TOKEN" : null
    ].filter(Boolean).join(" and ");
    await createPortainerGapEvidence({
      aiSystemId,
      deploymentSourceId: deploymentSource?.id,
      portainerEndpoint,
      collectionTimestamp,
      status: PortainerConnectionStatus.DISCONNECTED,
      sourceGap: `${missing} is not configured for the seed process. The platform cannot collect real Travel Brain deployed-state evidence until read-only Portainer API configuration is available.`
    });
    return;
  }

  try {
    const collection = await collectTravelBrainPortainerDeployments(portainerEndpoint, portainerToken);
    if (collection.deployments.length === 0) {
      await createPortainerGapEvidence({
        aiSystemId,
        deploymentSourceId: deploymentSource?.id,
        portainerEndpoint,
        collectionTimestamp,
        status: PortainerConnectionStatus.ERROR,
        sourceGap: "Portainer API access succeeded, but no Travel Brain web container was discovered. No deployed-state evidence was created because the declared runtime asset could not be verified."
      });
      return;
    }

    const sourceStatus = "Real Portainer API collection succeeded. The collector stores only safe deployment fields and excludes command payloads, environment variable values, secrets, tokens, credentials, mounts, and customer content.";
    const connection = await prisma.portainerConnection.create({
      data: {
        connectionId: "PORT-TB-CONN-001",
        aiSystemId,
        endpoint: collection.endpoint,
        environment: collection.environment,
        status: PortainerConnectionStatus.CONNECTED,
        lastScan: collectionTimestamp,
        sourceGap: sourceStatus
      }
    });

    await markTravelBrainPortainerSourcesCollected(collectionTimestamp);

    for (const [index, deployment] of collection.deployments.entries()) {
      const relatedControls = ["AI-LC-006", "AI-GOV-010", "OPS-001", "AUD-001"];
      const runtimeConfiguration = JSON.stringify({
        evidenceType: "Portainer Deployment Evidence",
        sourceAvailable: true,
        endpointName: collection.environment,
        endpointId: deployment.endpointId,
        containerId: deployment.containerId,
        containerName: deployment.containerName,
        containerStatus: deployment.containerStatus,
        imageName: deployment.imageName,
        imageTag: deployment.imageTag,
        stackName: deployment.stackName,
        serviceName: deployment.serviceName,
        deploymentTimestamp: deployment.deploymentTimestamp?.toISOString() ?? null,
        restartCount: deployment.restartCount,
        healthStatus: deployment.healthStatus,
        loggingEnabled: deployment.loggingEnabled,
        logDriver: deployment.logDriver,
        safeLabels: deployment.safeLabels,
        fieldsSafeToCollect: [
          "container name",
          "image name",
          "image tag",
          "container status",
          "health status",
          "restart count",
          "deployment timestamp",
          "stack name",
          "logging enabled"
        ],
        fieldsProhibitedFromCollection: [
          "command payloads",
          "environment variable values",
          "secrets",
          "tokens",
          "credentials",
          "mount contents",
          "customer content",
          "sensitive payloads"
        ],
        privacyBoundary: "Read-only Portainer API collection. Only whitelisted deployed-state metadata is stored; raw container payloads are not persisted.",
        collectionBoundary: "Collected from Portainer Docker proxy list and inspect endpoints with an API key. The API key is never stored."
      }, null, 2);
      const hasCoreEvidence = Boolean(deployment.containerName && deployment.imageName && deployment.imageTag && deployment.deploymentTimestamp);
      const healthLower = deployment.healthStatus.toLowerCase();
      const degraded = healthLower.includes("unhealthy")
        || healthLower.includes("exited")
        || healthLower.includes("dead")
        || healthLower.includes("created")
        || healthLower.includes("starting")
        || deployment.loggingEnabled === false;
      const validationStatus = hasCoreEvidence ? EvidenceValidationValue.VALID : EvidenceValidationValue.MISSING;
      const evidenceHealth = !hasCoreEvidence
        ? DeploymentEvidenceHealth.MISSING
        : degraded
          ? DeploymentEvidenceHealth.DEGRADED
          : DeploymentEvidenceHealth.PRESENT;
      const artifactPayload = {
        deploymentId: deployment.deploymentId,
        containerId: deployment.containerId,
        containerName: deployment.containerName,
        containerStatus: deployment.containerStatus,
        imageName: deployment.imageName,
        imageTag: deployment.imageTag,
        deploymentTimestamp: deployment.deploymentTimestamp?.toISOString() ?? null,
        collectionTimestamp: collectionTimestamp.toISOString(),
        healthStatus: deployment.healthStatus,
        restartCount: deployment.restartCount,
        loggingEnabled: deployment.loggingEnabled,
        logDriver: deployment.logDriver,
        stackName: deployment.stackName,
        relatedControls,
        runtimeConfiguration
      };
      const hash = createHash("sha256").update(JSON.stringify(artifactPayload)).digest("hex");
      const artifact = await prisma.deploymentEvidenceArtifact.create({
        data: {
          artifactId: `DEP-TB-PORT-${String(index + 1).padStart(3, "0")}`,
          portainerConnectionId: connection.id,
          evidenceSourceId: deploymentSource?.id,
          deploymentId: deployment.deploymentId,
          containerName: deployment.containerName,
          imageName: deployment.imageName,
          imageTag: deployment.imageTag,
          deploymentTimestamp: deployment.deploymentTimestamp,
          collectionTimestamp,
          hash,
          validationStatus,
          restartCount: deployment.restartCount,
          healthStatus: deployment.healthStatus,
          loggingEnabled: deployment.loggingEnabled,
          runtimeConfiguration,
          collectionMethod: "Read-only Portainer API collection using the Docker proxy container list and inspect endpoints. Raw command data, environment variable values, secrets, credentials, mount details, tokens, and customer content are excluded.",
          provenance: `${collection.endpoint} · environment ${collection.environment} · container ${deployment.containerId} · collected ${collectionTimestamp.toISOString()}`,
          relatedControlsJson: JSON.stringify(relatedControls),
          evidenceSummary: `Portainer confirms ${deployment.containerName} is deployed as ${deployment.imageName}:${deployment.imageTag} with container status ${deployment.containerStatus}, health ${deployment.healthStatus}, restart count ${deployment.restartCount ?? "not reported"}, and logging ${deployment.loggingEnabled === null ? "not reported" : deployment.loggingEnabled ? "enabled" : "disabled"}.`,
          collectionReason: "Collected to prove Travel Brain deployed-state reality: which container is running, which image version is active, whether runtime health is acceptable, and whether logging evidence is available for governance assurance.",
          assuranceSummary: hasCoreEvidence
            ? `Deployment assurance is supported by real Portainer evidence for ${deployment.containerName}: image ${deployment.imageName}:${deployment.imageTag}, health ${deployment.healthStatus}, and logging ${deployment.loggingEnabled === null ? "not reported" : deployment.loggingEnabled ? "enabled" : "disabled"}.`
            : "Deployment assurance is incomplete because one or more required deployed-state fields were not returned by Portainer.",
          failureCondition: "This assurance fails if the Travel Brain container disappears, the image changes without review, the health status degrades, logging is disabled, or Portainer evidence cannot be collected and traced to production approval controls.",
          sourceGap: sourceStatus,
          evidenceHealth
        }
      });

      await createDeploymentDriftEvents(connection.id, artifact.id, deployment, previousDeployment, collectionTimestamp);
    }
  } catch (error) {
    await createPortainerGapEvidence({
      aiSystemId,
      deploymentSourceId: deploymentSource?.id,
      portainerEndpoint,
      collectionTimestamp,
      status: PortainerConnectionStatus.ERROR,
      sourceGap: `Portainer API collection failed: ${sanitizePortainerError(error)}. No deployed-state evidence was created because the source could not be collected successfully.`
    });
  }
}

type PortainerApiEndpoint = {
  Id: number;
  Name: string;
  Type?: number;
  URL?: string;
  Status?: number;
};

type PortainerApiContainer = {
  Id: string;
  Names?: string[];
  Image?: string;
  ImageID?: string;
  Created?: number;
  State?: string;
  Status?: string;
  Labels?: Record<string, string>;
};

type PortainerContainerInspect = {
  Id?: string;
  Name?: string;
  Created?: string;
  Config?: {
    Image?: string;
    Labels?: Record<string, string>;
  };
  State?: {
    Status?: string;
    Health?: {
      Status?: string;
    };
  };
  RestartCount?: number;
  HostConfig?: {
    LogConfig?: {
      Type?: string;
    };
  };
};

type CollectedPortainerDeployment = {
  endpointId: number;
  deploymentId: string;
  containerId: string;
  containerName: string;
  containerStatus: string;
  imageName: string;
  imageTag: string;
  deploymentTimestamp: Date | null;
  restartCount: number | null;
  healthStatus: string;
  loggingEnabled: boolean | null;
  logDriver: string;
  stackName: string | null;
  serviceName: string | null;
  safeLabels: Record<string, string>;
};

type PreviousPortainerDeployment = {
  containerName: string;
  imageName: string;
  imageTag: string;
  healthStatus: string;
  loggingEnabled: boolean | null;
  hash: string;
  collectionTimestamp: Date;
};

async function getPreviousTravelBrainPortainerDeployment(): Promise<PreviousPortainerDeployment | null> {
  try {
    const artifact = await prisma.deploymentEvidenceArtifact.findFirst({
      where: {
        artifactId: "DEP-TB-PORT-001",
        validationStatus: EvidenceValidationValue.VALID
      },
      orderBy: { collectionTimestamp: "desc" },
      select: {
        containerName: true,
        imageName: true,
        imageTag: true,
        healthStatus: true,
        loggingEnabled: true,
        hash: true,
        collectionTimestamp: true
      }
    });
    return artifact;
  } catch {
    return null;
  }
}

async function collectTravelBrainPortainerDeployments(endpoint: string, token: string) {
  const normalizedEndpoint = endpoint.replace(/\/+$/, "");
  const endpoints = await portainerApiGet<PortainerApiEndpoint[]>(normalizedEndpoint, token, "/api/endpoints");
  const deployments: CollectedPortainerDeployment[] = [];
  let selectedEnvironment = "Production";

  for (const environment of endpoints) {
    const containers = await portainerApiGet<PortainerApiContainer[]>(
      normalizedEndpoint,
      token,
      `/api/endpoints/${environment.Id}/docker/containers/json?all=true`
    );
    const matches = containers.filter(isTravelBrainWebContainer);
    if (matches.length === 0) continue;
    selectedEnvironment = environment.Name || `Environment ${environment.Id}`;

    for (const container of matches) {
      const inspect = await portainerApiGet<PortainerContainerInspect>(
        normalizedEndpoint,
        token,
        `/api/endpoints/${environment.Id}/docker/containers/${encodeURIComponent(container.Id)}/json`
      );
      deployments.push(toCollectedPortainerDeployment(environment.Id, container, inspect));
    }
  }

  return {
    endpoint: normalizedEndpoint,
    environment: selectedEnvironment,
    deployments
  };
}

async function portainerApiGet<T>(baseUrl: string, token: string, path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "X-API-Key": token,
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`Portainer API ${path} returned ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function isTravelBrainWebContainer(container: PortainerApiContainer) {
  const names = (container.Names ?? []).map((name) => name.replace(/^\//, ""));
  const labels = container.Labels ?? {};
  return names.includes("travel-brain-web")
    || labels["com.docker.compose.service"] === "travel-brain-web";
}

function toCollectedPortainerDeployment(endpointId: number, container: PortainerApiContainer, inspect: PortainerContainerInspect): CollectedPortainerDeployment {
  const labels = getSafePortainerLabels(inspect.Config?.Labels ?? container.Labels ?? {});
  const listName = normalizePortainerContainerName(container.Names?.[0]);
  const inspectName = normalizePortainerContainerName(inspect.Name);
  const containerName = listName.includes("travel-brain-web") ? listName : inspectName || listName || "travel-brain-web";
  const imageReference = inspect.Config?.Image ?? container.Image ?? "unknown:unknown";
  const { imageName, imageTag } = parseContainerImage(imageReference);
  const deploymentTimestamp = parsePortainerDate(inspect.Created) ?? (container.Created ? new Date(container.Created * 1000) : null);
  const containerStatus = inspect.State?.Status ?? container.State ?? "unknown";
  const healthStatus = inspect.State?.Health?.Status ?? inferHealthStatus(container.Status, containerStatus);
  const logDriver = inspect.HostConfig?.LogConfig?.Type ?? "unknown";
  const loggingEnabled = logDriver === "unknown" ? null : logDriver.toLowerCase() !== "none";
  const serviceName = labels["com.docker.compose.service"] ?? null;
  const stackName = labels["com.docker.compose.project"] ?? labels["com.docker.stack.namespace"] ?? labels["io.portainer.stack.name"] ?? null;

  return {
    endpointId,
    deploymentId: `TB-PORTAINER-${containerName.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
    containerId: (inspect.Id ?? container.Id).slice(0, 12),
    containerName,
    containerStatus,
    imageName,
    imageTag,
    deploymentTimestamp,
    restartCount: typeof inspect.RestartCount === "number" ? inspect.RestartCount : null,
    healthStatus,
    loggingEnabled,
    logDriver,
    stackName,
    serviceName,
    safeLabels: labels
  };
}

function getSafePortainerLabels(labels: Record<string, string>) {
  const allowedKeys = [
    "com.docker.compose.container-number",
    "com.docker.compose.image",
    "com.docker.compose.project",
    "com.docker.compose.service",
    "com.docker.stack.namespace",
    "io.portainer.stack.name"
  ];
  return Object.fromEntries(allowedKeys.flatMap((key) => labels[key] ? [[key, labels[key]]] : []));
}

function normalizePortainerContainerName(name?: string) {
  return (name ?? "")
    .replace(/^\//, "")
    .replace(/^[a-f0-9]{12,64}_/, "");
}

function parseContainerImage(imageReference: string) {
  const withoutDigest = imageReference.split("@")[0] || imageReference;
  const slashIndex = withoutDigest.lastIndexOf("/");
  const tagIndex = withoutDigest.lastIndexOf(":");
  if (tagIndex > slashIndex) {
    return {
      imageName: withoutDigest.slice(0, tagIndex),
      imageTag: withoutDigest.slice(tagIndex + 1)
    };
  }
  return {
    imageName: withoutDigest,
    imageTag: "not-tagged"
  };
}

function parsePortainerDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function inferHealthStatus(statusText: string | undefined, containerStatus: string) {
  const status = statusText?.toLowerCase() ?? "";
  if (status.includes("unhealthy")) return "unhealthy";
  if (status.includes("healthy")) return "healthy";
  return containerStatus || "unknown";
}

async function markTravelBrainPortainerSourcesCollected(collectionTimestamp: Date) {
  await prisma.evidenceSource.updateMany({
    where: {
      sourceId: {
        in: ["SRC-TB-PORT-CONTAINER", "SRC-TB-PORT-DEPLOYMENT", "SRC-TB-PORT-RUNTIME"]
      }
    },
    data: {
      collectionStatus: EvidenceCollectionStatus.VALIDATED,
      lastCollectedAt: collectionTimestamp,
      lastValidatedAt: collectionTimestamp,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: AuditStatus.ON_TRACK
    }
  });
}

async function createDeploymentDriftEvents(
  portainerConnectionId: string,
  deploymentEvidenceArtifactId: string,
  deployment: CollectedPortainerDeployment,
  previousDeployment: PreviousPortainerDeployment | null,
  collectionTimestamp: Date
) {
  const currentValue = `${deployment.containerName} · ${deployment.imageName}:${deployment.imageTag} · health ${deployment.healthStatus} · logging ${deployment.loggingEnabled === null ? "not reported" : deployment.loggingEnabled ? "enabled" : "disabled"}`;
  const previousValue = previousDeployment
    ? `${previousDeployment.containerName} · ${previousDeployment.imageName}:${previousDeployment.imageTag} · health ${previousDeployment.healthStatus} · logging ${previousDeployment.loggingEnabled === null ? "not reported" : previousDeployment.loggingEnabled ? "enabled" : "disabled"}`
    : "No previous collected deployment baseline";
  let driftRecorded = false;

  if (previousDeployment && (previousDeployment.imageName !== deployment.imageName || previousDeployment.imageTag !== deployment.imageTag)) {
    driftRecorded = true;
    await prisma.deploymentDriftEvent.create({
      data: {
        driftId: `DRIFT-${deployment.deploymentId}-IMAGE`,
        portainerConnectionId,
        deploymentEvidenceArtifactId,
        eventType: DeploymentDriftType.IMAGE_CHANGED,
        previousValue,
        currentValue,
        detectedAt: collectionTimestamp,
        summary: `${deployment.containerName} image changed from ${previousDeployment.imageName}:${previousDeployment.imageTag} to ${deployment.imageName}:${deployment.imageTag}. This is deployment drift for review, not an automatic finding.`,
        status: AssuranceRuleStatus.WARNING
      }
    });
  }

  if (previousDeployment && previousDeployment.containerName !== deployment.containerName) {
    driftRecorded = true;
    await prisma.deploymentDriftEvent.create({
      data: {
        driftId: `DRIFT-${deployment.deploymentId}-CONTAINER`,
        portainerConnectionId,
        deploymentEvidenceArtifactId,
        eventType: DeploymentDriftType.CONTAINER_CHANGED,
        previousValue,
        currentValue,
        detectedAt: collectionTimestamp,
        summary: `Travel Brain deployment container changed from ${previousDeployment.containerName} to ${deployment.containerName}. This is deployment drift for review, not an automatic finding.`,
        status: AssuranceRuleStatus.WARNING
      }
    });
  }

  await prisma.deploymentDriftEvent.create({
    data: {
      driftId: `DRIFT-${deployment.deploymentId}-BASELINE`,
      portainerConnectionId,
      deploymentEvidenceArtifactId,
      eventType: DeploymentDriftType.BASELINE_RECORDED,
      previousValue,
      currentValue,
      detectedAt: collectionTimestamp,
      summary: previousDeployment
        ? driftRecorded
          ? `Portainer deployment baseline updated for ${deployment.containerName} after drift review events were recorded.`
          : `No deployment drift detected for ${deployment.containerName}; current image, container, logging, and health match the previous collected baseline from ${previousDeployment.collectionTimestamp.toISOString()}.`
        : `Initial Portainer deployment baseline recorded for ${deployment.containerName}. Future collections can compare image, container, logging, and health status against this value.`,
      status: AssuranceRuleStatus.PASS
    }
  });

  if (deployment.loggingEnabled === false) {
    await prisma.deploymentDriftEvent.create({
      data: {
        driftId: `DRIFT-${deployment.deploymentId}-LOGGING`,
        portainerConnectionId,
        deploymentEvidenceArtifactId,
        eventType: DeploymentDriftType.LOGGING_DISABLED,
        previousValue: "Logging expected",
        currentValue,
        detectedAt: collectionTimestamp,
        summary: `${deployment.containerName} was collected with logging disabled. This weakens runtime evidence and should be reviewed before relying on deployment assurance.`,
        status: AssuranceRuleStatus.WARNING
      }
    });
  }

  const healthLower = deployment.healthStatus.toLowerCase();
  if (healthLower.includes("unhealthy") || healthLower.includes("exited") || healthLower.includes("dead") || healthLower.includes("created") || healthLower.includes("starting")) {
    await prisma.deploymentDriftEvent.create({
      data: {
        driftId: `DRIFT-${deployment.deploymentId}-HEALTH`,
        portainerConnectionId,
        deploymentEvidenceArtifactId,
        eventType: DeploymentDriftType.HEALTH_STATUS_DEGRADED,
        previousValue: "Healthy or running deployment expected",
        currentValue,
        detectedAt: collectionTimestamp,
        summary: `${deployment.containerName} health status is ${deployment.healthStatus}. This is deployment drift for review, not an automatic finding.`,
        status: AssuranceRuleStatus.WARNING
      }
    });
  }
}

async function createPortainerGapEvidence(input: {
  aiSystemId: string;
  deploymentSourceId?: string;
  portainerEndpoint?: string;
  collectionTimestamp: Date;
  status: PortainerConnectionStatus;
  sourceGap: string;
}) {
  const connection = await prisma.portainerConnection.create({
    data: {
      connectionId: "PORT-TB-CONN-001",
      aiSystemId: input.aiSystemId,
      endpoint: input.portainerEndpoint ?? "not-configured://travel-brain-portainer",
      environment: "Production",
      status: input.status,
      lastScan: null,
      sourceGap: input.sourceGap
    }
  });

  const runtimeConfiguration = JSON.stringify({
    evidenceType: "Deployment Source Gap",
    declaredAsset: "Portainer - travel-brain-web",
    declaredContainerName: "travel-brain-web",
    sourceAvailable: false,
    fieldsSafeToCollect: [
      "container name",
      "image name",
      "image tag",
      "deployment timestamp",
      "restart count",
      "health status",
      "logging enabled"
    ],
    fieldsProhibitedFromCollection: [
      "command payloads",
      "environment variable values",
      "secrets",
      "tokens",
      "credentials",
      "mount contents",
      "customer content",
      "sensitive payloads"
    ],
    privacyBoundary: "Connector-ready gap record only. No runtime payload, secret, token, credential, command, mount detail, or environment variable value collected.",
    instrumentationGap: input.sourceGap
  }, null, 2);
  const relatedControls = ["AI-LC-006", "AI-GOV-010", "OPS-001", "AUD-001"];
  const artifactPayload = {
    deploymentId: "TB-PORTAINER-SOURCE-GAP",
    containerName: "travel-brain-web (declared asset)",
    imageName: "not-collected",
    imageTag: "not-collected",
    deploymentTimestamp: null,
    collectionTimestamp: input.collectionTimestamp.toISOString(),
    validationStatus: EvidenceValidationValue.MISSING,
    relatedControls,
    runtimeConfiguration,
    sourceGap: input.sourceGap
  };
  const hash = createHash("sha256").update(JSON.stringify(artifactPayload)).digest("hex");

  const artifact = await prisma.deploymentEvidenceArtifact.create({
    data: {
      artifactId: "DEP-TB-PORT-GAP-001",
      portainerConnectionId: connection.id,
      evidenceSourceId: input.deploymentSourceId,
      deploymentId: artifactPayload.deploymentId,
      containerName: artifactPayload.containerName,
      imageName: artifactPayload.imageName,
      imageTag: artifactPayload.imageTag,
      deploymentTimestamp: null,
      collectionTimestamp: input.collectionTimestamp,
      hash,
      validationStatus: EvidenceValidationValue.MISSING,
      restartCount: null,
      healthStatus: "UNKNOWN",
      loggingEnabled: null,
      runtimeConfiguration,
      collectionMethod: "Connector-ready Portainer assessment. No live Portainer deployed-state evidence was collected.",
      provenance: input.portainerEndpoint ? `Configured endpoint: ${input.portainerEndpoint}` : "Declared asset from AI Governance.yaml and Travel Brain asset inventory; no live Portainer provenance available.",
      relatedControlsJson: JSON.stringify(relatedControls),
      evidenceSummary: "Portainer deployment evidence is not available. This record preserves the deployment evidence gap instead of inventing a running container state.",
      collectionReason: "Collected to show whether Travel Brain production deployment, container image, runtime health, and logging state can support governance assurance.",
      assuranceSummary: "Assurance warning: deployed-state reality cannot be proven because real Portainer evidence was not collected.",
      failureCondition: "This assurance fails until a read-only Portainer source provides container name, image, image tag, deployment timestamp, restart count, health status, logging status, and safe provenance.",
      sourceGap: input.sourceGap,
      evidenceHealth: DeploymentEvidenceHealth.MISSING
    }
  });

  await prisma.deploymentDriftEvent.create({
    data: {
      driftId: "DRIFT-DEP-TB-PORT-GAP-001",
      portainerConnectionId: connection.id,
      deploymentEvidenceArtifactId: artifact.id,
      eventType: DeploymentDriftType.SOURCE_UNAVAILABLE,
      previousValue: "No deployment baseline",
      currentValue: "Portainer source unavailable",
      detectedAt: input.collectionTimestamp,
      summary: "Deployment drift cannot be evaluated because the Travel Brain Portainer source was not collected. This is a reviewable instrumentation gap, not a generated finding.",
      status: AssuranceRuleStatus.WARNING
    }
  });
}

function sanitizePortainerError(error: unknown) {
  const token = process.env.PORTAINER_TOKEN?.trim();
  const message = error instanceof Error ? error.message : String(error);
  return token ? message.replaceAll(token, "<redacted>") : message;
}

type SupabaseSchemaRow = {
  schema_name: string;
  description: string | null;
};

type SupabaseTableRow = {
  schema_name: string;
  table_name: string;
  object_type: string;
  rls_enabled: boolean;
  rls_forced: boolean;
};

type SupabaseColumnRow = {
  schema_name: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  ordinal_position: number;
};

type SupabasePolicyRow = {
  schema_name: string;
  table_name: string;
  policy_name: string;
  permissive: string;
  roles: string[];
  command: string;
  using_expression_present: boolean;
  check_expression_present: boolean;
};

type SupabaseRoleRow = {
  role_name: string;
  superuser: boolean;
  can_create_db: boolean;
  can_create_role: boolean;
  can_login: boolean;
  replication: boolean;
  bypass_rls: boolean;
};

type SupabaseAuditCapabilityRow = {
  capability: string;
  status: string;
  detail: string;
};

type SupabaseExtensionRow = {
  extension_name: string;
  version: string;
  schema_name: string;
};

type SupabaseMetadataCollection = {
  projectId: string;
  environment: string;
  source: string;
  databaseVersion: string;
  schemas: SupabaseSchemaRow[];
  tables: SupabaseTableRow[];
  columns: SupabaseColumnRow[];
  policies: SupabasePolicyRow[];
  roles: SupabaseRoleRow[];
  extensions: SupabaseExtensionRow[];
  auditCapabilities: SupabaseAuditCapabilityRow[];
  queryWarnings: string[];
};

type SupabaseEvidenceArtifactInput = {
  artifactId: string;
  evidenceSourceId?: string;
  evidenceType: SupabaseEvidenceType;
  title: string;
  validationStatus: EvidenceValidationValue;
  evidenceHealth: SupabaseEvidenceHealth;
  source: string;
  schemaInventory: unknown;
  tableInventory: unknown;
  rlsStatus: unknown;
  enabledPolicies: unknown;
  databaseRoles: unknown;
  auditCapability: unknown;
  collectionMethod: string;
  provenance: string;
  relatedControls: string[];
  evidenceSummary: string;
  collectionReason: string;
  assuranceSummary: string;
  failureCondition: string;
  sourceGap: string;
};

type PreviousSupabaseSnapshot = {
  snapshotId: string;
  collectionTimestamp: Date;
  databaseVersion: string;
  hash: string;
  schemaInventory: string;
  tableInventory: string;
  rlsInventory: string;
  policyInventory: string;
  roleInventory: string;
  extensionInventory: string;
};

async function seedTravelBrainSupabaseEvidence(aiSystemId: string, previousSnapshot: PreviousSupabaseSnapshot | null) {
  const collectionTimestamp = new Date();
  const sourceById = await getTravelBrainSupabaseSourceMap();
  const databaseUrl = getSupabaseDatabaseUrl();
  const projectId = getSupabaseProjectId(databaseUrl);
  const environment = process.env.TRAVEL_BRAIN_SUPABASE_ENVIRONMENT?.trim()
    || process.env.SUPABASE_ENVIRONMENT?.trim()
    || "Production";

  if (!databaseUrl) {
    await createSupabaseGapEvidence({
      aiSystemId,
      sourceById,
      collectionTimestamp,
      projectId,
      environment,
      status: SupabaseConnectionStatus.DISCONNECTED,
      sourceGap: "TRAVEL_BRAIN_SUPABASE_DB_URL, SUPABASE_DB_URL, or SUPABASE_DATABASE_URL is not configured for the seed process. The platform cannot collect real Travel Brain data-governance evidence until a read-only Supabase/Postgres metadata connection is available."
    });
    return;
  }

  try {
    const collection = await collectTravelBrainSupabaseMetadata(databaseUrl, projectId, environment);
    const connection = await prisma.supabaseConnection.create({
      data: {
        connectionId: "SUPA-TB-CONN-001",
        aiSystemId,
        projectId: collection.projectId,
        environment: collection.environment,
        status: SupabaseConnectionStatus.CONNECTED,
        lastScan: collectionTimestamp,
        sourceGap: collection.queryWarnings.length
          ? `Supabase metadata collection succeeded with warnings: ${collection.queryWarnings.join("; ")}`
          : "Real Supabase metadata collection succeeded. The collector stores schema, table, RLS policy, role, and audit capability metadata only; customer rows, payloads, secrets, credentials, and API keys are not queried or stored."
      }
    });

    await markTravelBrainSupabaseSourcesCollected(collectionTimestamp, collection);
    const artifactByType = await createSupabaseArtifactsFromCollection(connection.id, sourceById, collectionTimestamp, collection);
    const previousSnapshotRecord = previousSnapshot
      ? await recreatePreviousSupabaseEvidenceSnapshot(connection.id, previousSnapshot)
      : null;
    const currentSnapshot = await createSupabaseEvidenceSnapshotFromCollection(connection.id, collectionTimestamp, collection);
    const driftEvents = await createSupabaseDriftEvents(
      connection.id,
      previousSnapshotRecord?.snapshotId ?? "No previous Supabase snapshot",
      currentSnapshot.snapshotId,
      previousSnapshot,
      collection,
      collectionTimestamp
    );
    await createSupabaseControlValidations(connection.id, artifactByType, collection, driftEvents, collectionTimestamp);
    await createSupabaseGovernanceFindings(aiSystemId, collectionTimestamp, collection, driftEvents);
  } catch (error) {
    await createSupabaseGapEvidence({
      aiSystemId,
      sourceById,
      collectionTimestamp,
      projectId,
      environment,
      status: SupabaseConnectionStatus.ERROR,
      sourceGap: `Supabase metadata collection failed: ${sanitizeSupabaseError(error)}. No real data-governance evidence was created because the source could not be collected successfully.`
    });
  }
}

async function getTravelBrainSupabaseSourceMap() {
  const sources = await prisma.evidenceSource.findMany({
    where: {
      sourceId: {
        in: [
          "SRC-TB-SUPABASE-SCHEMA",
          "SRC-TB-SUPABASE-TABLES",
          "SRC-TB-SUPABASE-RLS",
          "SRC-TB-SUPABASE-ACCESS",
          "SRC-TB-SUPABASE-AUDIT"
        ]
      }
    }
  });
  return new Map(sources.map((source) => [source.sourceId, source.id]));
}

function getSupabaseDatabaseUrl() {
  return process.env.TRAVEL_BRAIN_SUPABASE_DB_URL?.trim()
    || process.env.SUPABASE_DB_URL?.trim()
    || process.env.SUPABASE_DATABASE_URL?.trim()
    || "";
}

function getSupabaseProjectId(databaseUrl?: string) {
  const configuredProjectId = process.env.TRAVEL_BRAIN_SUPABASE_PROJECT_ID?.trim()
    || process.env.SUPABASE_PROJECT_ID?.trim();
  if (configuredProjectId) return configuredProjectId;
  if (!databaseUrl) return "not-configured";
  try {
    const host = new URL(databaseUrl).hostname;
    if (host.startsWith("db.") && host.endsWith(".supabase.co")) return host.slice(3, -".supabase.co".length);
    if (host.includes("pooler.supabase.com")) return "supabase-pooler";
    return host;
  } catch {
    return "configured-supabase-project";
  }
}

async function seedSupabaseControlTests() {
  const tests = [
    {
      testId: "SUPA-PRI-001",
      title: "Supabase RLS Coverage",
      description: "Validates PRI-001 and SEC-001 using Supabase table, RLS, and policy metadata. Generates findings when governed tables exist without RLS or policy evidence.",
      traditionalGovernanceConcept: "Privacy and data-access control validation.",
      aiGovernanceInterpretation: "PRI-001 and SEC-001 require inspectable data-layer evidence that governed Travel Brain tables are protected by row-level security and policy metadata.",
      whyItMatters: "Data governance cannot rely on declarations if the actual database tables are not protected by RLS or if policy metadata disappears.",
      severityIfFailed: FindingSeverity.HIGH
    },
    {
      testId: "SUPA-SEC-001",
      title: "Supabase Privileged Role Review",
      description: "Validates SEC-001, OPS-001, and AUD-001 using Supabase role metadata. Generates findings when privileged or RLS-bypass roles are added or remain unexplained.",
      traditionalGovernanceConcept: "Privileged access review and segregation of duties.",
      aiGovernanceInterpretation: "SEC-001 and OPS-001 require database access governance evidence showing privileged roles are visible, reviewable, and controlled.",
      whyItMatters: "Unreviewed privileged database roles can bypass data controls and weaken auditability even when application-level governance looks healthy.",
      severityIfFailed: FindingSeverity.HIGH
    },
    {
      testId: "SUPA-AUD-001",
      title: "Supabase Metadata Traceability",
      description: "Validates AUD-001, AI-GOV-010, PRI-001, SEC-001, and OPS-001 using Supabase snapshots, drift records, and data-governance evidence artifacts.",
      traditionalGovernanceConcept: "Audit evidence traceability and retained evidence history.",
      aiGovernanceInterpretation: "AUD-001 and AI-GOV-010 require retained Supabase evidence snapshots, drift review, and control validation from collected metadata.",
      whyItMatters: "Auditors need to see not only the current database posture, but also what changed, what evidence was used, and which controls are impacted.",
      severityIfFailed: FindingSeverity.MEDIUM
    }
  ];

  for (const test of tests) {
    await prisma.controlTest.upsert({
      where: { testId: test.testId },
      update: { ...test, enabled: false },
      create: { ...test, enabled: false }
    });
  }
}

async function getPreviousTravelBrainSupabaseSnapshot(): Promise<PreviousSupabaseSnapshot | null> {
  try {
    const snapshot = await prisma.supabaseEvidenceSnapshot.findFirst({
      where: { snapshotId: "SUPA-TB-SNAPSHOT-CURRENT-001" },
      orderBy: { collectionTimestamp: "desc" },
      select: {
        snapshotId: true,
        collectionTimestamp: true,
        databaseVersion: true,
        hash: true,
        schemaInventory: true,
        tableInventory: true,
        rlsInventory: true,
        policyInventory: true,
        roleInventory: true,
        extensionInventory: true
      }
    });
    if (snapshot) return snapshot;

    const artifacts = await prisma.supabaseEvidenceArtifact.findMany({
      where: { supabaseConnection: { connectionId: "SUPA-TB-CONN-001" } },
      orderBy: { collectionTimestamp: "desc" }
    });
    if (artifacts.length === 0) return null;

    const schema = artifacts.find((artifact) => artifact.evidenceType === SupabaseEvidenceType.SCHEMA);
    const inventory = artifacts.find((artifact) => artifact.evidenceType === SupabaseEvidenceType.DATA_INVENTORY);
    const policy = artifacts.find((artifact) => artifact.evidenceType === SupabaseEvidenceType.POLICY);
    const access = artifacts.find((artifact) => artifact.evidenceType === SupabaseEvidenceType.ACCESS_CONTROL);
    const collectionTimestamp = artifacts[0]?.collectionTimestamp ?? new Date();
    const payload = {
      schemaInventory: schema?.schemaInventory ?? "{}",
      tableInventory: inventory?.tableInventory ?? schema?.tableInventory ?? "{}",
      rlsInventory: policy?.rlsStatus ?? "{}",
      policyInventory: policy?.enabledPolicies ?? "{}",
      roleInventory: access?.databaseRoles ?? "{}",
      extensionInventory: access?.auditCapability ?? schema?.auditCapability ?? "{}"
    };
    const databaseVersion = parseJsonObject<{ databaseVersion?: string }>(schema?.schemaInventory ?? "{}").databaseVersion ?? "previous-artifact-baseline";
    const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    return {
      snapshotId: "SUPA-TB-SNAPSHOT-FROM-ARTIFACTS",
      collectionTimestamp,
      databaseVersion,
      hash,
      ...payload
    };
  } catch {
    return null;
  }
}

async function collectTravelBrainSupabaseMetadata(databaseUrl: string, projectId: string, environment: string): Promise<SupabaseMetadataCollection> {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("sslmode=disable") ? undefined : { rejectUnauthorized: false },
    application_name: "ai-risk-governance-readonly"
  });
  const queryWarnings: string[] = [];

    await client.connect();
  try {
    await client.query("SET statement_timeout = '15000ms'");
    await client.query("SET default_transaction_read_only = on");

    const databaseVersionRows = await safeSupabaseQuery<{ version: string }>(client, queryWarnings, "database version", `
      SELECT version() AS version
    `);
    const databaseVersion = databaseVersionRows[0]?.version ?? "unavailable";

    const schemas = await safeSupabaseQuery<SupabaseSchemaRow>(client, queryWarnings, "schema inventory", `
      SELECT
        n.nspname AS schema_name,
        obj_description(n.oid, 'pg_namespace') AS description
      FROM pg_namespace n
      WHERE n.nspname NOT LIKE 'pg_%'
        AND n.nspname <> 'information_schema'
        AND n.nspname <> 'pg_toast'
      ORDER BY n.nspname
    `);
    const tables = await safeSupabaseQuery<SupabaseTableRow>(client, queryWarnings, "table inventory", `
      SELECT
        n.nspname AS schema_name,
        c.relname AS table_name,
        CASE c.relkind
          WHEN 'r' THEN 'table'
          WHEN 'p' THEN 'partitioned_table'
          WHEN 'v' THEN 'view'
          WHEN 'm' THEN 'materialized_view'
          ELSE c.relkind::text
        END AS object_type,
        c.relrowsecurity AS rls_enabled,
        c.relforcerowsecurity AS rls_forced
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind IN ('r', 'p', 'v', 'm')
        AND n.nspname NOT LIKE 'pg_%'
        AND n.nspname <> 'information_schema'
        AND n.nspname <> 'pg_toast'
      ORDER BY n.nspname, c.relname
    `);
    const columns = await safeSupabaseQuery<SupabaseColumnRow>(client, queryWarnings, "column inventory", `
      SELECT
        table_schema AS schema_name,
        table_name,
        column_name,
        data_type,
        is_nullable,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema NOT LIKE 'pg_%'
        AND table_schema <> 'information_schema'
      ORDER BY table_schema, table_name, ordinal_position
    `);
    const policies = await safeSupabaseQuery<SupabasePolicyRow>(client, queryWarnings, "RLS policy inventory", `
      SELECT
        schemaname AS schema_name,
        tablename AS table_name,
        policyname AS policy_name,
        permissive,
        roles,
        cmd AS command,
        qual IS NOT NULL AS using_expression_present,
        with_check IS NOT NULL AS check_expression_present
      FROM pg_policies
      WHERE schemaname NOT LIKE 'pg_%'
        AND schemaname <> 'information_schema'
      ORDER BY schemaname, tablename, policyname
    `);
    const roles = await safeSupabaseQuery<SupabaseRoleRow>(client, queryWarnings, "database role inventory", `
      SELECT
        rolname AS role_name,
        rolsuper AS superuser,
        rolcreatedb AS can_create_db,
        rolcreaterole AS can_create_role,
        rolcanlogin AS can_login,
        rolreplication AS replication,
        rolbypassrls AS bypass_rls
      FROM pg_roles
      WHERE rolname NOT LIKE 'pg_%'
      ORDER BY rolname
    `);
    const extensions = await safeSupabaseQuery<SupabaseExtensionRow>(client, queryWarnings, "extension inventory", `
      SELECT
        e.extname AS extension_name,
        e.extversion AS version,
        n.nspname AS schema_name
      FROM pg_extension e
      JOIN pg_namespace n ON n.oid = e.extnamespace
      ORDER BY e.extname
    `);
    const auditCapabilities = [
      {
        capability: "pgaudit",
        status: extensions.some((extension) => extension.extension_name === "pgaudit") ? "installed" : "not-detected",
        detail: extensions.find((extension) => extension.extension_name === "pgaudit")?.version ?? "Extension not detected through read-only metadata collection."
      },
      {
        capability: "pg_stat_statements",
        status: extensions.some((extension) => extension.extension_name === "pg_stat_statements") ? "installed" : "not-detected",
        detail: extensions.find((extension) => extension.extension_name === "pg_stat_statements")?.version ?? "Extension not detected through read-only metadata collection."
      }
    ];

    return {
      projectId,
      environment,
      source: sanitizeSupabaseConnectionSource(databaseUrl),
      databaseVersion,
      schemas,
      tables,
      columns,
      policies,
      roles,
      extensions,
      auditCapabilities,
      queryWarnings
    };
  } finally {
    await client.end();
  }
}

async function safeSupabaseQuery<T>(client: Client, queryWarnings: string[], label: string, sql: string): Promise<T[]> {
  try {
    const result = await client.query<T>(sql);
    return result.rows;
  } catch (error) {
    queryWarnings.push(`${label} unavailable: ${sanitizeSupabaseError(error)}`);
    return [];
  }
}

async function markTravelBrainSupabaseSourcesCollected(collectionTimestamp: Date, collection: SupabaseMetadataCollection) {
  const disabledRlsTables = getTablesWithDisabledRls(collection.tables);
  const privilegedRoles = collection.roles.filter((role) => role.superuser || role.bypass_rls);
  const sourceUpdates = [
    {
      sourceId: "SRC-TB-SUPABASE-SCHEMA",
      collected: collection.schemas.length > 0,
      valid: collection.schemas.length > 0
    },
    {
      sourceId: "SRC-TB-SUPABASE-TABLES",
      collected: collection.tables.length > 0,
      valid: collection.tables.length > 0
    },
    {
      sourceId: "SRC-TB-SUPABASE-RLS",
      collected: collection.tables.length > 0 || collection.policies.length > 0,
      valid: collection.policies.length > 0 && disabledRlsTables.length === 0
    },
    {
      sourceId: "SRC-TB-SUPABASE-ACCESS",
      collected: collection.roles.length > 0,
      valid: collection.roles.length > 0 && privilegedRoles.length === 0
    },
    {
      sourceId: "SRC-TB-SUPABASE-AUDIT",
      collected: collection.auditCapabilities.length > 0,
      valid: collection.auditCapabilities.some((capability) => capability.status === "installed")
    }
  ];

  for (const update of sourceUpdates) {
    await prisma.evidenceSource.update({
      where: { sourceId: update.sourceId },
      data: {
        collectionStatus: update.valid ? EvidenceCollectionStatus.VALIDATED : update.collected ? EvidenceCollectionStatus.COLLECTED : EvidenceCollectionStatus.MISSING,
        lastCollectedAt: update.collected ? collectionTimestamp : null,
        lastValidatedAt: update.valid ? collectionTimestamp : null,
        freshnessStatus: update.collected ? FreshnessStatus.CURRENT : FreshnessStatus.MISSING,
        connectorHealth: update.valid ? AuditStatus.ON_TRACK : update.collected ? AuditStatus.NEEDS_ATTENTION : AuditStatus.BLOCKED
      }
    });
  }
}

async function createSupabaseArtifactsFromCollection(
  supabaseConnectionId: string,
  sourceById: Map<string, string>,
  collectionTimestamp: Date,
  collection: SupabaseMetadataCollection
) {
  const disabledRlsTables = getTablesWithDisabledRls(collection.tables);
  const privilegedRoles = collection.roles.filter((role) => role.superuser || role.bypass_rls);
  const schemaValid = collection.schemas.length > 0;
  const inventoryValid = collection.tables.length > 0;
  const policyCollected = collection.tables.length > 0 || collection.policies.length > 0;
  const policyValid = collection.policies.length > 0 && disabledRlsTables.length === 0;
  const accessValid = collection.roles.length > 0 && privilegedRoles.length === 0;
  const auditInstalled = collection.auditCapabilities.some((capability) => capability.status === "installed");
  const sourceGap = collection.queryWarnings.length
    ? `Supabase metadata collection succeeded with warnings: ${collection.queryWarnings.join("; ")}`
    : "Real Supabase data-governance evidence collected through read-only metadata queries.";

  const artifacts: SupabaseEvidenceArtifactInput[] = [
    {
      artifactId: "DATA-TB-SUPA-SCHEMA-001",
      evidenceSourceId: sourceById.get("SRC-TB-SUPABASE-SCHEMA"),
      evidenceType: SupabaseEvidenceType.SCHEMA,
      title: "Travel Brain Supabase Schema Evidence",
      validationStatus: schemaValid ? EvidenceValidationValue.VALID : EvidenceValidationValue.MISSING,
      evidenceHealth: schemaValid ? SupabaseEvidenceHealth.PRESENT : SupabaseEvidenceHealth.MISSING,
      source: collection.source,
      schemaInventory: { databaseVersion: collection.databaseVersion, schemas: collection.schemas, schemaCount: collection.schemas.length },
      tableInventory: { tableCount: collection.tables.length, columnCount: collection.columns.length },
      rlsStatus: summarizeRls(collection.tables, disabledRlsTables),
      enabledPolicies: { policyCount: collection.policies.length },
      databaseRoles: { roleCount: collection.roles.length },
      auditCapability: { databaseVersion: collection.databaseVersion, extensions: collection.extensions, capabilities: collection.auditCapabilities },
      collectionMethod: "Read-only Supabase/Postgres metadata collection from SELECT version(), pg_namespace, and pg_extension. No table rows, customer data, secrets, credentials, or API keys are queried.",
      provenance: `${collection.source} · project ${collection.projectId} · ${collection.environment} · collected ${collectionTimestamp.toISOString()}`,
      relatedControls: ["GOV-001", "PRI-001", "AI-GOV-010"],
      evidenceSummary: schemaValid
        ? `Supabase schema evidence collected ${collection.schemas.length} non-system schema(s) for Travel Brain on ${collection.databaseVersion}.`
        : "Supabase schema evidence could not identify non-system schemas.",
      collectionReason: "Collected to prove the Travel Brain data boundary exists as inspectable database metadata rather than undocumented assumptions.",
      assuranceSummary: schemaValid
        ? "Schema assurance is supported because the Supabase schema inventory was collected from real metadata."
        : "Schema assurance is incomplete because schema metadata was not available.",
      failureCondition: "This assurance fails if schema metadata cannot be collected, the database boundary is unknown, or schema inventory cannot be linked to data-governance controls.",
      sourceGap
    },
    {
      artifactId: "DATA-TB-SUPA-INVENTORY-001",
      evidenceSourceId: sourceById.get("SRC-TB-SUPABASE-TABLES"),
      evidenceType: SupabaseEvidenceType.DATA_INVENTORY,
      title: "Travel Brain Supabase Data Inventory Evidence",
      validationStatus: inventoryValid ? EvidenceValidationValue.VALID : EvidenceValidationValue.MISSING,
      evidenceHealth: inventoryValid ? SupabaseEvidenceHealth.PRESENT : SupabaseEvidenceHealth.MISSING,
      source: collection.source,
      schemaInventory: { databaseVersion: collection.databaseVersion, schemaCount: collection.schemas.length },
      tableInventory: {
        tables: collection.tables,
        columns: collection.columns,
        tableCount: collection.tables.filter((table) => table.object_type === "table" || table.object_type === "partitioned_table").length,
        viewCount: collection.tables.filter((table) => table.object_type === "view" || table.object_type === "materialized_view").length,
        columnCount: collection.columns.length
      },
      rlsStatus: summarizeRls(collection.tables, disabledRlsTables),
      enabledPolicies: { policyCount: collection.policies.length },
      databaseRoles: { roleCount: collection.roles.length },
      auditCapability: { extensions: collection.extensions, capabilities: collection.auditCapabilities },
      collectionMethod: "Read-only Supabase/Postgres metadata collection from pg_class. Row contents and customer payloads are not queried.",
      provenance: `${collection.source} · project ${collection.projectId} · ${collection.environment} · collected ${collectionTimestamp.toISOString()}`,
      relatedControls: ["PRI-001", "AI-GOV-010", "AUD-001"],
      evidenceSummary: inventoryValid
        ? `Supabase table inventory collected ${collection.tables.length} non-system table/view object(s) without reading rows.`
        : "Supabase table inventory was not available.",
      collectionReason: "Collected to prove the data inventory supporting Travel Brain governance without collecting customer data.",
      assuranceSummary: inventoryValid
        ? "Data inventory assurance is supported by real database metadata and row-level security flags."
        : "Data inventory assurance is incomplete because table metadata was not collected.",
      failureCondition: "This assurance fails if table inventory disappears, customer data boundaries cannot be inspected, or metadata collection requires row-content access.",
      sourceGap
    },
    {
      artifactId: "DATA-TB-SUPA-POLICY-001",
      evidenceSourceId: sourceById.get("SRC-TB-SUPABASE-RLS"),
      evidenceType: SupabaseEvidenceType.POLICY,
      title: "Travel Brain Supabase RLS Policy Evidence",
      validationStatus: policyValid ? EvidenceValidationValue.VALID : policyCollected ? EvidenceValidationValue.INVALID : EvidenceValidationValue.MISSING,
      evidenceHealth: policyValid ? SupabaseEvidenceHealth.PRESENT : policyCollected ? SupabaseEvidenceHealth.DEGRADED : SupabaseEvidenceHealth.MISSING,
      source: collection.source,
      schemaInventory: { databaseVersion: collection.databaseVersion, schemaCount: collection.schemas.length },
      tableInventory: { tableCount: collection.tables.length },
      rlsStatus: summarizeRls(collection.tables, disabledRlsTables),
      enabledPolicies: {
        policies: collection.policies,
        policyCount: collection.policies.length,
        disabledRlsTables
      },
      databaseRoles: { roleCount: collection.roles.length },
      auditCapability: { extensions: collection.extensions, capabilities: collection.auditCapabilities },
      collectionMethod: "Read-only Supabase/Postgres metadata collection from pg_policies and pg_class. Policy expressions are represented only by presence flags, not stored as raw payload.",
      provenance: `${collection.source} · project ${collection.projectId} · ${collection.environment} · collected ${collectionTimestamp.toISOString()}`,
      relatedControls: ["PRI-001", "SEC-001", "AUD-001"],
      evidenceSummary: policyValid
        ? `Supabase RLS policy evidence collected ${collection.policies.length} policy record(s), with no governed tables reporting disabled RLS.`
        : policyCollected
          ? `Supabase policy metadata was collected, but ${disabledRlsTables.length} governed table(s) have RLS disabled or no policies were detected.`
          : "Supabase RLS policy evidence was not available.",
      collectionReason: "Collected to prove privacy and access controls exist at the data layer, not only in documentation.",
      assuranceSummary: policyValid
        ? "Policy assurance is supported by collected RLS status and enabled policy metadata."
        : "Policy assurance warns because RLS policy evidence is missing or incomplete for one or more governed tables.",
      failureCondition: "This assurance fails if RLS is disabled for governed tables, policies cannot be inventoried, or policy metadata cannot be traced to privacy and security controls.",
      sourceGap
    },
    {
      artifactId: "DATA-TB-SUPA-ACCESS-001",
      evidenceSourceId: sourceById.get("SRC-TB-SUPABASE-ACCESS"),
      evidenceType: SupabaseEvidenceType.ACCESS_CONTROL,
      title: "Travel Brain Supabase Access Control Evidence",
      validationStatus: accessValid ? EvidenceValidationValue.VALID : collection.roles.length > 0 ? EvidenceValidationValue.INVALID : EvidenceValidationValue.MISSING,
      evidenceHealth: accessValid ? SupabaseEvidenceHealth.PRESENT : collection.roles.length > 0 ? SupabaseEvidenceHealth.DEGRADED : SupabaseEvidenceHealth.MISSING,
      source: collection.source,
      schemaInventory: { databaseVersion: collection.databaseVersion, schemaCount: collection.schemas.length },
      tableInventory: { tableCount: collection.tables.length },
      rlsStatus: summarizeRls(collection.tables, disabledRlsTables),
      enabledPolicies: { policyCount: collection.policies.length },
      databaseRoles: {
        roles: collection.roles,
        roleCount: collection.roles.length,
        privilegedRoles
      },
      auditCapability: {
        databaseVersion: collection.databaseVersion,
        extensions: collection.extensions,
        extensionCount: collection.extensions.length,
        capabilities: collection.auditCapabilities,
        auditCapabilityDetected: auditInstalled
      },
      collectionMethod: "Read-only Supabase/Postgres metadata collection from pg_roles, pg_extension, and SELECT version(). Passwords, tokens, grants containing secrets, API keys, and environment values are not collected.",
      provenance: `${collection.source} · project ${collection.projectId} · ${collection.environment} · collected ${collectionTimestamp.toISOString()}`,
      relatedControls: ["SEC-001", "AUD-001", "OPS-001"],
      evidenceSummary: accessValid
        ? `Supabase access evidence collected ${collection.roles.length} role record(s) without privileged bypass indicators.`
        : collection.roles.length > 0
          ? `Supabase access metadata was collected, but ${privilegedRoles.length} privileged role(s) require governance review.`
          : "Supabase role inventory was not available.",
      collectionReason: "Collected to prove data access management and audit capability can be inspected without collecting credentials.",
      assuranceSummary: accessValid
        ? "Access control assurance is supported by role metadata and audit capability review."
        : "Access control assurance warns because role evidence is missing or privileged bypass indicators require review.",
      failureCondition: "This assurance fails if role inventory cannot be collected, privileged database access is unexplained, audit capability is absent, or access metadata cannot be traced to security controls.",
      sourceGap: auditInstalled ? sourceGap : `${sourceGap} Audit-related extension metadata did not show pgaudit or pg_stat_statements installed.`
    }
  ];

  const createdByType = new Map<SupabaseEvidenceType, { id: string; artifactId: string; evidenceType: SupabaseEvidenceType }>();
  for (const artifact of artifacts) {
    const created = await createSupabaseEvidenceArtifact(supabaseConnectionId, collectionTimestamp, artifact);
    createdByType.set(artifact.evidenceType, {
      id: created.id,
      artifactId: created.artifactId,
      evidenceType: created.evidenceType
    });
  }
  return createdByType;
}

async function createSupabaseGapEvidence(input: {
  aiSystemId: string;
  sourceById: Map<string, string>;
  collectionTimestamp: Date;
  projectId: string;
  environment: string;
  status: SupabaseConnectionStatus;
  sourceGap: string;
}) {
  const connection = await prisma.supabaseConnection.create({
    data: {
      connectionId: "SUPA-TB-CONN-001",
      aiSystemId: input.aiSystemId,
      projectId: input.projectId,
      environment: input.environment,
      status: input.status,
      lastScan: null,
      sourceGap: input.sourceGap
    }
  });
  const source = "not-configured://travel-brain-supabase";
  const commonGap = {
    schemaInventory: {
      sourceAvailable: false,
      schemas: [],
      privacyBoundary: "Connector-ready gap record only. No database rows, customer data, secrets, credentials, API keys, or sensitive payloads collected."
    },
    tableInventory: {
      sourceAvailable: false,
      tables: [],
      fieldsSafeToCollect: ["schema name", "table name", "object type", "RLS enabled", "RLS forced"],
      fieldsProhibitedFromCollection: ["row contents", "customer data", "secrets", "credentials", "API keys", "tokens", "payloads"]
    },
    rlsStatus: { sourceAvailable: false, disabledRlsTables: [], rlsReviewed: false },
    enabledPolicies: { sourceAvailable: false, policies: [] },
    databaseRoles: { sourceAvailable: false, roles: [] },
    auditCapability: { sourceAvailable: false, capabilities: [] },
    collectionMethod: "Connector-ready Supabase assessment. No live Supabase data-governance evidence was collected.",
    provenance: "Declared asset from AI Governance.yaml and Travel Brain asset inventory; no live Supabase provenance available.",
    source,
    validationStatus: EvidenceValidationValue.MISSING,
    evidenceHealth: SupabaseEvidenceHealth.MISSING,
    sourceGap: input.sourceGap
  };

  const artifacts: SupabaseEvidenceArtifactInput[] = [
    {
      ...commonGap,
      artifactId: "DATA-TB-SUPA-SCHEMA-001",
      evidenceSourceId: input.sourceById.get("SRC-TB-SUPABASE-SCHEMA"),
      evidenceType: SupabaseEvidenceType.SCHEMA,
      title: "Travel Brain Supabase Schema Evidence Gap",
      relatedControls: ["GOV-001", "PRI-001", "AI-GOV-010"],
      evidenceSummary: "Supabase schema evidence is not available. This record preserves the schema evidence gap instead of inventing database structures.",
      collectionReason: "Collected to show whether Travel Brain schema inventory can support data governance assurance.",
      assuranceSummary: "Assurance warning: data-governance reality cannot be proven because Supabase schema metadata was not collected.",
      failureCondition: "This assurance fails until a read-only Supabase/Postgres metadata connection provides schema inventory."
    },
    {
      ...commonGap,
      artifactId: "DATA-TB-SUPA-INVENTORY-001",
      evidenceSourceId: input.sourceById.get("SRC-TB-SUPABASE-TABLES"),
      evidenceType: SupabaseEvidenceType.DATA_INVENTORY,
      title: "Travel Brain Supabase Data Inventory Evidence Gap",
      relatedControls: ["PRI-001", "AI-GOV-010", "AUD-001"],
      evidenceSummary: "Supabase table inventory evidence is not available. This record preserves the data inventory gap without fabricating tables.",
      collectionReason: "Collected to show whether Travel Brain table inventory can support privacy and AI risk-domain assurance.",
      assuranceSummary: "Assurance warning: data inventory cannot be proven because Supabase table metadata was not collected.",
      failureCondition: "This assurance fails until table and view metadata can be collected without reading row contents."
    },
    {
      ...commonGap,
      artifactId: "DATA-TB-SUPA-POLICY-001",
      evidenceSourceId: input.sourceById.get("SRC-TB-SUPABASE-RLS"),
      evidenceType: SupabaseEvidenceType.POLICY,
      title: "Travel Brain Supabase RLS Policy Evidence Gap",
      relatedControls: ["PRI-001", "SEC-001", "AUD-001"],
      evidenceSummary: "Supabase RLS policy evidence is not available. This record preserves the privacy-control evidence gap without claiming policies exist.",
      collectionReason: "Collected to show whether RLS and policy metadata can support privacy, security, and audit controls.",
      assuranceSummary: "Assurance warning: RLS policy support cannot be proven because Supabase policy metadata was not collected.",
      failureCondition: "This assurance fails until RLS status and policy metadata can be collected and traced to privacy controls."
    },
    {
      ...commonGap,
      artifactId: "DATA-TB-SUPA-ACCESS-001",
      evidenceSourceId: input.sourceById.get("SRC-TB-SUPABASE-ACCESS"),
      evidenceType: SupabaseEvidenceType.ACCESS_CONTROL,
      title: "Travel Brain Supabase Access Control Evidence Gap",
      relatedControls: ["SEC-001", "AUD-001", "OPS-001"],
      evidenceSummary: "Supabase access control evidence is not available. This record preserves the role and audit-capability evidence gap without collecting credentials.",
      collectionReason: "Collected to show whether role inventory and audit capability can support access management assurance.",
      assuranceSummary: "Assurance warning: data access management cannot be proven because Supabase role metadata was not collected.",
      failureCondition: "This assurance fails until role inventory and audit capability metadata can be collected through read-only access."
    }
  ];

  for (const artifact of artifacts) {
    await createSupabaseEvidenceArtifact(connection.id, input.collectionTimestamp, artifact);
  }

  await prisma.supabaseDriftEvent.create({
    data: {
      driftId: "DRIFT-SUPA-TB-SOURCE-UNAVAILABLE",
      supabaseConnectionId: connection.id,
      previousSnapshotId: "No Supabase snapshot",
      currentSnapshotId: "No Supabase snapshot",
      eventType: SupabaseDriftType.SOURCE_UNAVAILABLE,
      previousValue: "No collected Supabase baseline",
      currentValue: "Supabase source unavailable",
      detectedAt: input.collectionTimestamp,
      changeSummary: "Supabase drift cannot be evaluated because the Travel Brain Supabase source was not collected.",
      status: AssuranceRuleStatus.WARNING,
      controlImpact: "PRI-001, SEC-001, AUD-001, AI-GOV-010, and OPS-001 cannot rely on live data-governance evidence while the source is unavailable.",
      recommendedAction: "Configure a read-only Supabase/Postgres metadata connection and rerun collection."
    }
  });
}

async function createSupabaseEvidenceArtifact(
  supabaseConnectionId: string,
  collectionTimestamp: Date,
  input: SupabaseEvidenceArtifactInput
) {
  const payload = {
    artifactId: input.artifactId,
    evidenceType: input.evidenceType,
    source: input.source,
    schemaInventory: input.schemaInventory,
    tableInventory: input.tableInventory,
    rlsStatus: input.rlsStatus,
    enabledPolicies: input.enabledPolicies,
    databaseRoles: input.databaseRoles,
    auditCapability: input.auditCapability,
    validationStatus: input.validationStatus,
    relatedControls: input.relatedControls,
    collectionTimestamp: collectionTimestamp.toISOString()
  };
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");

  return prisma.supabaseEvidenceArtifact.create({
    data: {
      artifactId: input.artifactId,
      supabaseConnectionId,
      evidenceSourceId: input.evidenceSourceId,
      evidenceType: input.evidenceType,
      title: input.title,
      collectionTimestamp,
      source: input.source,
      hash,
      validationStatus: input.validationStatus,
      evidenceHealth: input.evidenceHealth,
      schemaInventory: JSON.stringify(input.schemaInventory, null, 2),
      tableInventory: JSON.stringify(input.tableInventory, null, 2),
      rlsStatus: JSON.stringify(input.rlsStatus, null, 2),
      enabledPolicies: JSON.stringify(input.enabledPolicies, null, 2),
      databaseRoles: JSON.stringify(input.databaseRoles, null, 2),
      auditCapability: JSON.stringify(input.auditCapability, null, 2),
      collectionMethod: input.collectionMethod,
      provenance: input.provenance,
      relatedControlsJson: JSON.stringify(input.relatedControls),
      evidenceSummary: input.evidenceSummary,
      collectionReason: input.collectionReason,
      assuranceSummary: input.assuranceSummary,
      failureCondition: input.failureCondition,
      sourceGap: input.sourceGap
    }
  });
}

function supabaseSnapshotPayload(collection: SupabaseMetadataCollection) {
  const disabledRlsTables = getTablesWithDisabledRls(collection.tables);
  const privilegedRoles = collection.roles.filter((role) => role.superuser || role.bypass_rls);
  return {
    schemaInventory: {
      databaseVersion: collection.databaseVersion,
      schemaCount: collection.schemas.length,
      schemas: collection.schemas
    },
    tableInventory: {
      tableCount: collection.tables.length,
      columnCount: collection.columns.length,
      tables: collection.tables,
      columns: collection.columns
    },
    rlsInventory: summarizeRls(collection.tables, disabledRlsTables),
    policyInventory: {
      policyCount: collection.policies.length,
      policies: collection.policies
    },
    roleInventory: {
      roleCount: collection.roles.length,
      privilegedRoleCount: privilegedRoles.length,
      roles: collection.roles
    },
    extensionInventory: {
      extensionCount: collection.extensions.length,
      extensions: collection.extensions,
      auditCapabilities: collection.auditCapabilities
    }
  };
}

async function recreatePreviousSupabaseEvidenceSnapshot(supabaseConnectionId: string, previous: PreviousSupabaseSnapshot) {
  return prisma.supabaseEvidenceSnapshot.create({
    data: {
      snapshotId: "SUPA-TB-SNAPSHOT-PREVIOUS-001",
      supabaseConnectionId,
      collectionTimestamp: previous.collectionTimestamp,
      databaseVersion: previous.databaseVersion,
      hash: previous.hash,
      schemaInventory: previous.schemaInventory,
      tableInventory: previous.tableInventory,
      rlsInventory: previous.rlsInventory,
      policyInventory: previous.policyInventory,
      roleInventory: previous.roleInventory,
      extensionInventory: previous.extensionInventory
    }
  });
}

async function createSupabaseEvidenceSnapshotFromCollection(
  supabaseConnectionId: string,
  collectionTimestamp: Date,
  collection: SupabaseMetadataCollection
) {
  const payload = supabaseSnapshotPayload(collection);
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return prisma.supabaseEvidenceSnapshot.create({
    data: {
      snapshotId: "SUPA-TB-SNAPSHOT-CURRENT-001",
      supabaseConnectionId,
      collectionTimestamp,
      databaseVersion: collection.databaseVersion,
      hash,
      schemaInventory: JSON.stringify(payload.schemaInventory, null, 2),
      tableInventory: JSON.stringify(payload.tableInventory, null, 2),
      rlsInventory: JSON.stringify(payload.rlsInventory, null, 2),
      policyInventory: JSON.stringify(payload.policyInventory, null, 2),
      roleInventory: JSON.stringify(payload.roleInventory, null, 2),
      extensionInventory: JSON.stringify(payload.extensionInventory, null, 2)
    }
  });
}

type SupabaseDriftSeedResult = {
  eventType: SupabaseDriftType;
  status: AssuranceRuleStatus;
  changeSummary: string;
  controlImpact: string;
  recommendedAction: string;
};

async function createSupabaseDriftEvents(
  supabaseConnectionId: string,
  previousSnapshotId: string,
  currentSnapshotId: string,
  previousSnapshot: PreviousSupabaseSnapshot | null,
  collection: SupabaseMetadataCollection,
  collectionTimestamp: Date
): Promise<SupabaseDriftSeedResult[]> {
  const current = supabaseSnapshotPayload(collection);
  const previous = previousSnapshot ? {
    schemaInventory: parseJsonObject<{ schemas?: SupabaseSchemaRow[] }>(previousSnapshot.schemaInventory),
    tableInventory: parseJsonObject<{ tables?: SupabaseTableRow[]; columns?: SupabaseColumnRow[] }>(previousSnapshot.tableInventory),
    rlsInventory: parseJsonObject<Record<string, unknown>>(previousSnapshot.rlsInventory),
    policyInventory: parseJsonObject<{ policies?: SupabasePolicyRow[] }>(previousSnapshot.policyInventory),
    roleInventory: parseJsonObject<{ roles?: SupabaseRoleRow[] }>(previousSnapshot.roleInventory),
    extensionInventory: parseJsonObject<{ extensions?: SupabaseExtensionRow[] }>(previousSnapshot.extensionInventory)
  } : null;
  const results: SupabaseDriftSeedResult[] = [];

  const createEvent = async (input: {
    suffix: string;
    eventType: SupabaseDriftType;
    previousValue: string;
    currentValue: string;
    changeSummary: string;
    status: AssuranceRuleStatus;
    controlImpact: string;
    recommendedAction: string;
  }) => {
    await prisma.supabaseDriftEvent.create({
      data: {
        driftId: `DRIFT-SUPA-TB-${input.suffix}`,
        supabaseConnectionId,
        previousSnapshotId,
        currentSnapshotId,
        eventType: input.eventType,
        previousValue: input.previousValue,
        currentValue: input.currentValue,
        detectedAt: collectionTimestamp,
        changeSummary: input.changeSummary,
        status: input.status,
        controlImpact: input.controlImpact,
        recommendedAction: input.recommendedAction
      }
    });
    results.push({
      eventType: input.eventType,
      status: input.status,
      changeSummary: input.changeSummary,
      controlImpact: input.controlImpact,
      recommendedAction: input.recommendedAction
    });
  };

  if (!previous) {
    await createEvent({
      suffix: "BASELINE",
      eventType: SupabaseDriftType.BASELINE_RECORDED,
      previousValue: "No previous Supabase metadata snapshot",
      currentValue: `schemas ${collection.schemas.length}, tables ${collection.tables.length}, columns ${collection.columns.length}, policies ${collection.policies.length}, roles ${collection.roles.length}`,
      changeSummary: "Initial Supabase data-governance snapshot recorded. Future collections can detect schema, table, column, RLS, policy, role, and extension drift.",
      status: AssuranceRuleStatus.PASS,
      controlImpact: "AUD-001 and AI-GOV-010 now have retained Supabase metadata history for future comparison.",
      recommendedAction: "Use this baseline for the next collection cycle and review generated findings for current RLS or privileged-role conditions."
    });
    return results;
  }

  const schemaDiff = compareSets(
    (previous.schemaInventory.schemas ?? []).map((schema) => schema.schema_name),
    current.schemaInventory.schemas.map((schema) => schema.schema_name)
  );
  if (schemaDiff.changed) {
    await createEvent({
      suffix: "SCHEMA",
      eventType: SupabaseDriftType.SCHEMA_CHANGED,
      previousValue: summarizeDiff(schemaDiff, "schemas"),
      currentValue: current.schemaInventory.schemas.map((schema) => schema.schema_name).join(", ") || "No schemas collected",
      changeSummary: `Schema inventory changed: ${summarizeDiff(schemaDiff, "schema")}.`,
      status: AssuranceRuleStatus.WARNING,
      controlImpact: "GOV-001 and AI-GOV-010 require review because the governed database boundary changed.",
      recommendedAction: "Review new or removed schemas and update AI Governance.yaml data assets if the change is expected."
    });
  }

  const tableDiff = compareSets(
    (previous.tableInventory.tables ?? []).map((table) => `${table.schema_name}.${table.table_name}:${table.object_type}`),
    current.tableInventory.tables.map((table) => `${table.schema_name}.${table.table_name}:${table.object_type}`)
  );
  if (tableDiff.changed) {
    await createEvent({
      suffix: "TABLE",
      eventType: SupabaseDriftType.TABLE_CHANGED,
      previousValue: summarizeDiff(tableDiff, "tables"),
      currentValue: `${current.tableInventory.tableCount} table/view object(s) collected`,
      changeSummary: `Table inventory changed: ${summarizeDiff(tableDiff, "table")}.`,
      status: AssuranceRuleStatus.WARNING,
      controlImpact: "PRI-001 and AI-GOV-010 require review because data inventory changed.",
      recommendedAction: "Confirm any added tables are classified, governed, and covered by privacy and access controls."
    });
  }

  const columnDiff = compareSets(
    (previous.tableInventory.columns ?? []).map((column) => `${column.schema_name}.${column.table_name}.${column.column_name}:${column.data_type}:${column.is_nullable}`),
    current.tableInventory.columns.map((column) => `${column.schema_name}.${column.table_name}.${column.column_name}:${column.data_type}:${column.is_nullable}`)
  );
  if (columnDiff.changed) {
    await createEvent({
      suffix: "COLUMN",
      eventType: SupabaseDriftType.COLUMN_CHANGED,
      previousValue: summarizeDiff(columnDiff, "columns"),
      currentValue: `${current.tableInventory.columnCount} column metadata record(s) collected`,
      changeSummary: `Column inventory changed: ${summarizeDiff(columnDiff, "column")}.`,
      status: AssuranceRuleStatus.WARNING,
      controlImpact: "PRI-001 requires review because data attributes changed, which can alter privacy and retention obligations.",
      recommendedAction: "Review added or removed columns for personal data, retention expectations, and AI risk-domain impact."
    });
  }

  const rlsDiff = compareSets(
    ((previous.rlsInventory.disabledRlsTables as string[] | undefined) ?? []).sort(),
    current.rlsInventory.disabledRlsTables.sort()
  );
  if (rlsDiff.changed) {
    await createEvent({
      suffix: "RLS",
      eventType: SupabaseDriftType.RLS_CHANGED,
      previousValue: summarizeDiff(rlsDiff, "disabled RLS tables"),
      currentValue: current.rlsInventory.disabledRlsTables.join(", ") || "No disabled RLS tables detected",
      changeSummary: `RLS coverage changed: ${summarizeDiff(rlsDiff, "RLS status")}.`,
      status: current.rlsInventory.disabledRlsTables.length ? AssuranceRuleStatus.FAIL : AssuranceRuleStatus.WARNING,
      controlImpact: "PRI-001 and SEC-001 are impacted when governed tables lose RLS coverage.",
      recommendedAction: "Enable RLS for governed tables or document an approved compensating control."
    });
  }

  const previousPolicies = previous.policyInventory.policies ?? [];
  const currentPolicies = current.policyInventory.policies;
  const policyDiff = compareSets(
    previousPolicies.map(policyKey),
    currentPolicies.map(policyKey)
  );
  const policyShapeChanged = hashArray(previousPolicies.map(policyShape)) !== hashArray(currentPolicies.map(policyShape));
  if (policyDiff.changed || policyShapeChanged) {
    await createEvent({
      suffix: "POLICY",
      eventType: SupabaseDriftType.POLICY_CHANGED,
      previousValue: summarizeDiff(policyDiff, "policies"),
      currentValue: `${currentPolicies.length} policy metadata record(s) collected`,
      changeSummary: `Policy inventory changed: ${summarizeDiff(policyDiff, "policy")}${policyShapeChanged ? "; one or more policy command/role shapes changed" : ""}.`,
      status: policyDiff.removed.length || current.rlsInventory.disabledRlsTables.length ? AssuranceRuleStatus.FAIL : AssuranceRuleStatus.WARNING,
      controlImpact: "PRI-001, SEC-001, and AUD-001 are impacted because policy inventory supports privacy, access, and audit evidence.",
      recommendedAction: "Review removed or changed policies and confirm the change was approved before relying on policy assurance."
    });
  }

  const previousRoles = previous.roleInventory.roles ?? [];
  const currentRoles = current.roleInventory.roles;
  const roleDiff = compareSets(
    previousRoles.map(roleKey),
    currentRoles.map(roleKey)
  );
  const roleShapeChanged = hashArray(previousRoles.map(roleShape)) !== hashArray(currentRoles.map(roleShape));
  if (roleDiff.changed || roleShapeChanged) {
    await createEvent({
      suffix: "ROLE",
      eventType: SupabaseDriftType.ROLE_CHANGED,
      previousValue: summarizeDiff(roleDiff, "roles"),
      currentValue: `${currentRoles.length} role metadata record(s) collected`,
      changeSummary: `Role inventory changed: ${summarizeDiff(roleDiff, "role")}${roleShapeChanged ? "; one or more privileged role flags changed" : ""}.`,
      status: AssuranceRuleStatus.WARNING,
      controlImpact: "SEC-001, OPS-001, and AUD-001 are impacted because role drift changes access governance evidence.",
      recommendedAction: "Review role additions, deletions, and privilege changes with the database owner and risk owner."
    });
  }

  const previousExtensions = previous.extensionInventory.extensions ?? [];
  const extensionDiff = compareSets(
    previousExtensions.map((extension) => `${extension.extension_name}:${extension.version}:${extension.schema_name}`),
    current.extensionInventory.extensions.map((extension) => `${extension.extension_name}:${extension.version}:${extension.schema_name}`)
  );
  if (extensionDiff.changed) {
    await createEvent({
      suffix: "EXTENSION",
      eventType: SupabaseDriftType.EXTENSION_CHANGED,
      previousValue: summarizeDiff(extensionDiff, "extensions"),
      currentValue: `${current.extensionInventory.extensionCount} extension metadata record(s) collected`,
      changeSummary: `Extension inventory changed: ${summarizeDiff(extensionDiff, "extension")}.`,
      status: AssuranceRuleStatus.WARNING,
      controlImpact: "OPS-001 and AUD-001 are impacted because database extension drift can affect monitoring and audit capability.",
      recommendedAction: "Confirm extension changes were approved and audit/monitoring capability remains adequate."
    });
  }

  await createEvent({
    suffix: "BASELINE",
    eventType: SupabaseDriftType.BASELINE_RECORDED,
    previousValue: previousSnapshot.collectionTimestamp.toISOString(),
    currentValue: collectionTimestamp.toISOString(),
    changeSummary: results.some((event) => event.status !== AssuranceRuleStatus.PASS)
      ? "Supabase baseline updated after drift events were recorded for review."
      : "No Supabase metadata drift detected against the previous retained snapshot.",
    status: AssuranceRuleStatus.PASS,
    controlImpact: "AUD-001 retains a current evidence history for future data-governance comparisons.",
    recommendedAction: "Continue scheduled metadata collection and review any warning or failure events above."
  });

  return results;
}

async function createSupabaseControlValidations(
  supabaseConnectionId: string,
  artifactByType: Map<SupabaseEvidenceType, { id: string; artifactId: string; evidenceType: SupabaseEvidenceType }>,
  collection: SupabaseMetadataCollection,
  driftEvents: SupabaseDriftSeedResult[],
  collectionTimestamp: Date
) {
  const disabledRlsTables = getTablesWithDisabledRls(collection.tables);
  const privilegedRoles = collection.roles.filter((role) => role.superuser || role.bypass_rls);
  const auditInstalled = collection.auditCapabilities.some((capability) => capability.status === "installed");
  const driftWarnings = driftEvents.filter((event) => event.status !== AssuranceRuleStatus.PASS);
  const validations = [
    {
      validationId: "SUPA-VAL-TB-PRI-001",
      controlId: "PRI-001",
      artifact: artifactByType.get(SupabaseEvidenceType.POLICY) ?? artifactByType.get(SupabaseEvidenceType.DATA_INVENTORY),
      result: disabledRlsTables.length === 0 && collection.policies.length > 0 ? AssuranceRuleStatus.PASS : AssuranceRuleStatus.FAIL,
      checks: [
        `Governed table count: ${collection.tables.filter((table) => table.object_type === "table" || table.object_type === "partitioned_table").length}`,
        `Disabled RLS tables: ${disabledRlsTables.length}`,
        `Policy records collected: ${collection.policies.length}`
      ],
      evidenceUsed: ["DATA-TB-SUPA-INVENTORY-001", "DATA-TB-SUPA-POLICY-001"],
      controlImpact: disabledRlsTables.length
        ? `PRI-001 is weakened because ${disabledRlsTables.length} governed table(s) do not report RLS enabled.`
        : "PRI-001 is supported by table inventory and RLS policy evidence.",
      recommendedAction: disabledRlsTables.length
        ? "Enable RLS for governed tables or document approved compensating controls and exceptions."
        : "Continue periodic Supabase metadata collection and review new table/column drift.",
      failureConditions: "Fails when governed tables exist without RLS, policy metadata cannot be collected, or policy evidence is not traceable to privacy controls."
    },
    {
      validationId: "SUPA-VAL-TB-SEC-001",
      controlId: "SEC-001",
      artifact: artifactByType.get(SupabaseEvidenceType.ACCESS_CONTROL) ?? artifactByType.get(SupabaseEvidenceType.POLICY),
      result: privilegedRoles.length === 0 && collection.roles.length > 0 ? AssuranceRuleStatus.PASS : AssuranceRuleStatus.WARNING,
      checks: [
        `Role records collected: ${collection.roles.length}`,
        `Privileged or RLS-bypass roles: ${privilegedRoles.length}`,
        `RLS policy records collected: ${collection.policies.length}`
      ],
      evidenceUsed: ["DATA-TB-SUPA-POLICY-001", "DATA-TB-SUPA-ACCESS-001"],
      controlImpact: privilegedRoles.length
        ? `SEC-001 requires review because ${privilegedRoles.length} privileged role(s) or RLS-bypass role(s) were detected.`
        : "SEC-001 is supported by policy and database role metadata.",
      recommendedAction: privilegedRoles.length
        ? "Review privileged database roles with the security owner and document approval or remediation."
        : "Continue role inventory collection and privileged access review.",
      failureConditions: "Fails or warns when role inventory cannot be collected, privileged roles are unexplained, or policy metadata disappears."
    },
    {
      validationId: "SUPA-VAL-TB-AUD-001",
      controlId: "AUD-001",
      artifact: artifactByType.get(SupabaseEvidenceType.ACCESS_CONTROL) ?? artifactByType.get(SupabaseEvidenceType.DATA_INVENTORY),
      result: driftEvents.length > 0 && collection.tables.length > 0 ? AssuranceRuleStatus.PASS : AssuranceRuleStatus.WARNING,
      checks: [
        `Snapshot retained at ${collectionTimestamp.toISOString()}`,
        `Drift events recorded: ${driftEvents.length}`,
        `Query warnings: ${collection.queryWarnings.length}`
      ],
      evidenceUsed: ["SUPA-TB-SNAPSHOT-CURRENT-001", "DATA-TB-SUPA-INVENTORY-001", "DATA-TB-SUPA-ACCESS-001"],
      controlImpact: "AUD-001 is supported when Supabase metadata snapshots, drift events, and artifact provenance are retained.",
      recommendedAction: collection.queryWarnings.length
        ? "Review metadata query warnings and confirm any unavailable catalog area has compensating evidence."
        : "Use snapshots and drift events during auditor walkthroughs for data-governance proof.",
      failureConditions: "Fails when snapshots are not retained, drift cannot be evaluated, or evidence cannot be linked from control to artifact to source."
    },
    {
      validationId: "SUPA-VAL-TB-AI-GOV-010",
      controlId: "AI-GOV-010",
      artifact: artifactByType.get(SupabaseEvidenceType.SCHEMA) ?? artifactByType.get(SupabaseEvidenceType.DATA_INVENTORY),
      result: collection.schemas.length > 0 && collection.tables.length > 0 ? AssuranceRuleStatus.PASS : AssuranceRuleStatus.WARNING,
      checks: [
        `Schemas collected: ${collection.schemas.length}`,
        `Tables/views collected: ${collection.tables.length}`,
        `Columns collected: ${collection.columns.length}`
      ],
      evidenceUsed: ["DATA-TB-SUPA-SCHEMA-001", "DATA-TB-SUPA-INVENTORY-001"],
      controlImpact: "AI-GOV-010 is supported by real data-layer metadata for monitoring and AI risk-domain review.",
      recommendedAction: "Review schema/table/column drift as part of AI risk-domain monitoring.",
      failureConditions: "Fails when schema or table metadata cannot be collected or when data-layer changes are not reviewed."
    },
    {
      validationId: "SUPA-VAL-TB-OPS-001",
      controlId: "OPS-001",
      artifact: artifactByType.get(SupabaseEvidenceType.ACCESS_CONTROL),
      result: auditInstalled && privilegedRoles.length === 0 ? AssuranceRuleStatus.PASS : AssuranceRuleStatus.WARNING,
      checks: [
        `Audit capability records: ${collection.auditCapabilities.length}`,
        `Audit extension detected: ${auditInstalled}`,
        `Drift warning/failure events: ${driftWarnings.length}`
      ],
      evidenceUsed: ["DATA-TB-SUPA-ACCESS-001", "SUPA-TB-SNAPSHOT-CURRENT-001"],
      controlImpact: auditInstalled
        ? "OPS-001 has database audit capability evidence and role metadata."
        : "OPS-001 warns because audit-related extension metadata did not show pgaudit or pg_stat_statements installed.",
      recommendedAction: auditInstalled
        ? "Continue collection and review role/extension drift."
        : "Confirm whether audit capability exists outside collected extension metadata or enable auditable database monitoring.",
      failureConditions: "Warns or fails when database audit capability is absent, role metadata is missing, or extension/role drift is not reviewed."
    }
  ];

  for (const validation of validations) {
    await prisma.supabaseControlValidation.create({
      data: {
        validationId: validation.validationId,
        supabaseConnectionId,
        supabaseEvidenceArtifactId: validation.artifact?.id,
        controlId: validation.controlId,
        result: validation.result,
        evidenceUsed: JSON.stringify(validation.evidenceUsed, null, 2),
        validationChecks: JSON.stringify(validation.checks, null, 2),
        changeDetected: driftWarnings.length
          ? driftWarnings.map((event) => event.changeSummary).join(" ")
          : "No warning or failure drift detected against the retained Supabase baseline.",
        controlImpact: validation.controlImpact,
        recommendedAction: validation.recommendedAction,
        failureConditions: validation.failureConditions
      }
    });
  }
}

async function createSupabaseGovernanceFindings(
  aiSystemId: string,
  collectionTimestamp: Date,
  collection: SupabaseMetadataCollection,
  driftEvents: SupabaseDriftSeedResult[]
) {
  const system = await prisma.aiSystem.findUnique({ where: { id: aiSystemId } });
  if (!system) return;
  const tests = await prisma.controlTest.findMany({
    where: { testId: { in: ["SUPA-PRI-001", "SUPA-SEC-001", "SUPA-AUD-001"] } }
  });
  const testById = new Map(tests.map((test) => [test.testId, test]));
  const disabledRlsTables = getTablesWithDisabledRls(collection.tables);
  const privilegedRoles = collection.roles.filter((role) => role.superuser || role.bypass_rls);
  const policyRemoved = driftEvents.some((event) => event.eventType === SupabaseDriftType.POLICY_CHANGED && event.status === AssuranceRuleStatus.FAIL);
  const metadataMissing = collection.queryWarnings.length > 0 || collection.schemas.length === 0 || collection.tables.length === 0 || collection.roles.length === 0;

  const createFinding = async (input: {
    findingId: string;
    testId: string;
    title: string;
    description: string;
    severity: FindingSeverity;
    targetDays: number;
  }) => {
    const test = testById.get(input.testId);
    if (!test) return;
    await prisma.finding.create({
      data: {
        findingId: input.findingId,
        aiSystemId,
        controlTestId: test.id,
        title: input.title,
        description: input.description,
        severity: input.severity,
        status: FindingStatus.OPEN,
        createdDate: collectionTimestamp,
        remediationTargetDate: new Date(collectionTimestamp.getTime() + input.targetDays * 24 * 60 * 60 * 1000),
        owner: system.riskOwner || system.technologyOwner || system.businessOwner || "Unassigned"
      }
    });
  };

  if (disabledRlsTables.length > 0) {
    await createFinding({
      findingId: "FND-TB-SUPA-RLS-DISABLED-001",
      testId: "SUPA-PRI-001",
      title: "Supabase governed tables missing RLS",
      description: `Travel Brain Supabase metadata shows ${disabledRlsTables.length} governed table(s) without RLS enabled: ${disabledRlsTables.slice(0, 12).join(", ")}. Mapped controls: PRI-001, SEC-001, AUD-001, AI-GOV-010.`,
      severity: FindingSeverity.HIGH,
      targetDays: 30
    });
  }

  if (policyRemoved) {
    await createFinding({
      findingId: "FND-TB-SUPA-POLICY-REMOVED-001",
      testId: "SUPA-PRI-001",
      title: "Supabase policy inventory drift requires review",
      description: "Travel Brain Supabase drift detected removed or materially changed RLS policy metadata. Mapped controls: PRI-001, SEC-001, AUD-001.",
      severity: FindingSeverity.HIGH,
      targetDays: 21
    });
  }

  if (privilegedRoles.length > 0) {
    await createFinding({
      findingId: "FND-TB-SUPA-PRIVILEGED-ROLE-001",
      testId: "SUPA-SEC-001",
      title: "Supabase privileged roles require governance review",
      description: `Travel Brain Supabase metadata shows ${privilegedRoles.length} privileged or RLS-bypass role(s) requiring review: ${privilegedRoles.map((role) => role.role_name).slice(0, 12).join(", ")}. Mapped controls: SEC-001, OPS-001, AUD-001.`,
      severity: FindingSeverity.MEDIUM,
      targetDays: 45
    });
  }

  if (metadataMissing) {
    await createFinding({
      findingId: "FND-TB-SUPA-METADATA-MISSING-001",
      testId: "SUPA-AUD-001",
      title: "Supabase governance metadata collection incomplete",
      description: `Travel Brain Supabase metadata collection is incomplete. Query warnings: ${collection.queryWarnings.join("; ") || "none"}. Schema count: ${collection.schemas.length}; table count: ${collection.tables.length}; role count: ${collection.roles.length}. Mapped controls: AUD-001, AI-GOV-010, OPS-001.`,
      severity: FindingSeverity.MEDIUM,
      targetDays: 45
    });
  }
}

function getTablesWithDisabledRls(tables: SupabaseTableRow[]) {
  return tables
    .filter((table) => (table.object_type === "table" || table.object_type === "partitioned_table") && !table.rls_enabled)
    .map((table) => `${table.schema_name}.${table.table_name}`);
}

function parseJsonObject<T extends Record<string, unknown>>(value: string): T {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as T : {} as T;
  } catch {
    return {} as T;
  }
}

function compareSets(previousValues: string[], currentValues: string[]) {
  const previous = [...new Set(previousValues.filter(Boolean))].sort();
  const current = [...new Set(currentValues.filter(Boolean))].sort();
  const previousSet = new Set(previous);
  const currentSet = new Set(current);
  const added = current.filter((value) => !previousSet.has(value));
  const removed = previous.filter((value) => !currentSet.has(value));
  return {
    added,
    removed,
    changed: added.length > 0 || removed.length > 0
  };
}

function summarizeDiff(diff: { added: string[]; removed: string[] }, noun: string) {
  const added = diff.added.length ? `added ${diff.added.length} ${noun}: ${diff.added.slice(0, 8).join(", ")}` : `added 0 ${noun}`;
  const removed = diff.removed.length ? `removed ${diff.removed.length} ${noun}: ${diff.removed.slice(0, 8).join(", ")}` : `removed 0 ${noun}`;
  return `${added}; ${removed}`;
}

function policyKey(policy: SupabasePolicyRow) {
  return `${policy.schema_name}.${policy.table_name}.${policy.policy_name}`;
}

function policyShape(policy: SupabasePolicyRow) {
  return `${policyKey(policy)}:${policy.command}:${policy.permissive}:${[...policy.roles].sort().join("|")}:${policy.using_expression_present}:${policy.check_expression_present}`;
}

function roleKey(role: SupabaseRoleRow) {
  return role.role_name;
}

function roleShape(role: SupabaseRoleRow) {
  return `${role.role_name}:${role.superuser}:${role.can_create_db}:${role.can_create_role}:${role.can_login}:${role.replication}:${role.bypass_rls}`;
}

function hashArray(values: string[]) {
  return createHash("sha256").update(JSON.stringify([...values].sort())).digest("hex");
}

function summarizeRls(tables: SupabaseTableRow[], disabledRlsTables: string[]) {
  const governedTables = tables.filter((table) => table.object_type === "table" || table.object_type === "partitioned_table");
  return {
    governedTableCount: governedTables.length,
    rlsEnabledCount: governedTables.filter((table) => table.rls_enabled).length,
    rlsForcedCount: governedTables.filter((table) => table.rls_forced).length,
    disabledRlsTables
  };
}

function sanitizeSupabaseConnectionSource(databaseUrl: string) {
  try {
    const parsed = new URL(databaseUrl);
    const database = parsed.pathname.replace(/^\/+/, "") || "database";
    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}/${database}`;
  } catch {
    return "configured Supabase database URL";
  }
}

function sanitizeSupabaseError(error: unknown) {
  const candidates = [
    process.env.TRAVEL_BRAIN_SUPABASE_DB_URL,
    process.env.SUPABASE_DB_URL,
    process.env.SUPABASE_DATABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_ACCESS_TOKEN,
    process.env.SUPABASE_ANON_KEY
  ].filter((value): value is string => Boolean(value));
  let message = error instanceof Error ? error.message : String(error);
  for (const secret of candidates) {
    if (secret.trim()) message = message.replaceAll(secret.trim(), "<redacted>");
  }
  return message;
}

type McpToolMetadata = {
  name: string;
  category: string;
  authorityClassification: "Read Only" | "Write" | "Approval Required" | "Autonomous";
  permissionStatus: "Approved Read Only" | "Approved With Constraints" | "Inferred Read Only" | "Unclassified Write";
  requiresHumanReview: boolean;
};

type McpMetadataCollection = {
  repositoryPath: string;
  endpoint: string;
  serverName: string;
  version: string;
  toolNames: string[];
  requiredTools: string[];
  missingRequiredTools: string[];
  tools: McpToolMetadata[];
  categoryCounts: Record<string, number>;
  authorityCounts: Record<string, number>;
  approvedReadOnlyTools: string[];
  approvedWriteTools: string[];
  deniedActions: string[];
  humanEscalationTriggers: string[];
  capabilityInventory: Array<{ capability: string; toolCount: number; examples: string[] }>;
  source: string;
};

type McpEvidenceArtifactInput = {
  artifactId: string;
  evidenceSourceId?: string;
  evidenceType: McpEvidenceType;
  title: string;
  source: string;
  version: string;
  validationStatus: EvidenceValidationValue;
  evidenceHealth: McpEvidenceHealth;
  serverInventory: unknown;
  toolInventory: unknown;
  toolCategories: unknown;
  declaredPermissions: unknown;
  authorityClassifications: unknown;
  capabilityInventory: unknown;
  collectionMethod: string;
  provenance: string;
  relatedControls: string[];
  evidenceSummary: string;
  collectionReason: string;
  assuranceSummary: string;
  failureCondition: string;
  sourceGap: string;
};

async function seedTravelBrainMcpEvidence(aiSystemId: string) {
  const sourceById = await getTravelBrainMcpSourceMap();
  const collectionTimestamp = new Date();

  try {
    const collection = collectTravelBrainMcpMetadata();
    const permissionWarnings = collection.tools.filter((tool) => tool.permissionStatus === "Unclassified Write");
    const connection = await prisma.mcpConnection.create({
      data: {
        connectionId: "MCP-TB-CONN-001",
        aiSystemId,
        serverName: collection.serverName,
        endpoint: collection.endpoint,
        status: McpConnectionStatus.CONNECTED,
        lastScan: collectionTimestamp,
        sourceGap: permissionWarnings.length > 0
          ? `MCP source inventory collected from the real Travel Brain implementation. ${permissionWarnings.length} write-capable tool(s) need explicit policy classification before MCP assurance can become operational.`
          : "MCP source inventory collected from the real Travel Brain implementation. The collector stores server, tool, permission, authority, and capability metadata only; it does not collect prompts, tool inputs, tool outputs, secrets, credentials, or customer content."
      }
    });

    await markTravelBrainMcpSourcesCollected(collectionTimestamp, collection, permissionWarnings.length);
    await createMcpArtifactsFromCollection(connection.id, sourceById, collectionTimestamp, collection, permissionWarnings);
  } catch (error) {
    await createMcpGapEvidence({
      aiSystemId,
      collectionTimestamp,
      sourceById,
      status: McpConnectionStatus.ERROR,
      sourceGap: `MCP metadata collection failed: ${sanitizeMcpError(error)}. No MCP governance evidence was created because the actual Travel Brain MCP source could not be collected.`
    });
  }
}

async function getTravelBrainMcpSourceMap() {
  const sources = await prisma.evidenceSource.findMany({
    where: {
      sourceId: {
        in: ["SRC-TB-MCP-SERVERS", "SRC-TB-MCP-TOOLS", "SRC-TB-MCP-PERMISSIONS", "SRC-TB-MCP-AUTHORITY", "SRC-TB-MCP-CAPABILITIES"]
      }
    }
  });
  return new Map(sources.map((source) => [source.sourceId, source.id]));
}

function collectTravelBrainMcpMetadata(): McpMetadataCollection {
  const repositoryPath = getTravelBrainRepositoryPath();
  if (!repositoryPath) {
    throw new Error("Travel Brain repository path not found. Set TRAVEL_BRAIN_REPOSITORY_PATH or keep the local Travel-Brain reference checkout available.");
  }

  const manifestPath = join(repositoryPath, "AI Governance.yaml");
  const mcpSourcePath = join(repositoryPath, "travel-brain-mcp", "index.mjs");
  const packagePath = join(repositoryPath, "travel-brain-mcp", "package.json");
  const policyPath = join(repositoryPath, "governance", "tool-policy.yaml");
  for (const filePath of [manifestPath, mcpSourcePath, packagePath, policyPath]) {
    if (!existsSync(filePath)) throw new Error(`Required MCP governance source missing: ${filePath}`);
  }

  const manifest = readFileSync(manifestPath, "utf8");
  const mcpSource = readFileSync(mcpSourcePath, "utf8");
  const policy = readFileSync(policyPath, "utf8");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as { name?: string; version?: string };
  const endpoint = extractMcpEndpoint(manifest);
  const toolNames = extractMcpToolNames(mcpSource);
  const requiredTools = extractRequiredMcpTools(mcpSource);
  const approvedReadOnlyTools = namesFromPolicySection(policy, "approved_read_only_tools");
  const approvedWriteTools = namesFromPolicySection(policy, "approved_write_tools_with_constraints");
  const deniedActions = actionsFromPolicySection(policy, "denied_tools_actions");
  const humanEscalationTriggers = listItemsFromPolicySection(policy, "human_escalation_triggers");
  const tools = toolNames.map((name) => classifyMcpTool(name, approvedReadOnlyTools, approvedWriteTools));

  return {
    repositoryPath,
    endpoint,
    serverName: packageJson.name ?? "travel-brain-mcp",
    version: packageJson.version ?? "unknown",
    toolNames,
    requiredTools,
    missingRequiredTools: requiredTools.filter((toolName) => !toolNames.includes(toolName)),
    tools,
    categoryCounts: countValues(tools.map((tool) => tool.category)),
    authorityCounts: countValues(tools.map((tool) => tool.authorityClassification)),
    approvedReadOnlyTools,
    approvedWriteTools,
    deniedActions,
    humanEscalationTriggers,
    capabilityInventory: summarizeMcpCapabilities(tools),
    source: `local Travel Brain repository · ${relative(process.cwd(), repositoryPath)}`
  };
}

function getTravelBrainRepositoryPath() {
  const candidates = [
    process.env.TRAVEL_BRAIN_REPOSITORY_PATH,
    process.env.TRAVEL_BRAIN_REPO_PATH,
    "/Users/russell/Library/Mobile Documents/com~apple~CloudDocs/AI Stuff/Travel-Brain",
    join(process.cwd(), "reference-repositories", "travel-brain")
  ].filter((value): value is string => Boolean(value && value.trim()));

  return candidates.find((candidate) => existsSync(join(candidate, "AI Governance.yaml")) && existsSync(join(candidate, "travel-brain-mcp", "index.mjs"))) ?? null;
}

function extractMcpEndpoint(manifest: string) {
  const mcpSection = manifest.match(/mcp_server:\s*[\s\S]*?location:\s*([^\n]+)/);
  return mcpSection?.[1]?.trim() ?? "declared-mcp-endpoint-not-found";
}

function extractMcpToolNames(source: string) {
  const start = source.indexOf("const tools = [");
  const end = source.indexOf("const toolMap", start);
  const toolsBlock = start >= 0 && end > start ? source.slice(start, end) : source;
  return [...new Set([...toolsBlock.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1]))].sort();
}

function extractRequiredMcpTools(source: string) {
  const start = source.indexOf("const requiredMcpContractTools = [");
  const end = source.indexOf("];", start);
  const requiredBlock = start >= 0 && end > start ? source.slice(start, end) : "";
  return [...requiredBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]).sort();
}

function namesFromPolicySection(policy: string, section: string) {
  const block = topLevelYamlSection(policy, section);
  return [...block.matchAll(/^\s*-\s+name:\s*([^\n]+)/gm)].map((match) => match[1].trim());
}

function actionsFromPolicySection(policy: string, section: string) {
  const block = topLevelYamlSection(policy, section);
  return [...block.matchAll(/^\s*-\s+action:\s*([^\n]+)/gm)].map((match) => match[1].trim());
}

function listItemsFromPolicySection(policy: string, section: string) {
  const block = topLevelYamlSection(policy, section);
  return [...block.matchAll(/^\s*-\s+([^\n]+)/gm)]
    .map((match) => match[1].trim())
    .filter((item) => !item.includes(":"));
}

function topLevelYamlSection(policy: string, section: string) {
  const pattern = new RegExp(`^${section}:\\s*$`, "m");
  const match = pattern.exec(policy);
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = policy.slice(start);
  const next = rest.search(/^\S[^:\n]*:\s*$/m);
  return next >= 0 ? rest.slice(0, next) : rest;
}

function classifyMcpTool(name: string, approvedReadOnlyTools: string[], approvedWriteTools: string[]): McpToolMetadata {
  const readPrefixes = ["get_", "list_", "search_", "validate_", "explain_", "summarize_", "compare_", "preview_"];
  const writePrefixes = ["create_", "update_", "upsert_", "add_", "capture_", "promote_", "finalize_", "edit_", "approve_", "reject_", "defer_", "archive_", "restore_", "sync_", "extract_"];
  const category = classifyMcpToolCategory(name);
  if (approvedReadOnlyTools.includes(name) || readPrefixes.some((prefix) => name.startsWith(prefix))) {
    return { name, category, authorityClassification: "Read Only", permissionStatus: approvedReadOnlyTools.includes(name) ? "Approved Read Only" : "Inferred Read Only", requiresHumanReview: false };
  }
  if (approvedWriteTools.includes(name)) {
    return { name, category, authorityClassification: "Approval Required", permissionStatus: "Approved With Constraints", requiresHumanReview: true };
  }
  if (writePrefixes.some((prefix) => name.startsWith(prefix))) {
    return { name, category, authorityClassification: "Write", permissionStatus: "Unclassified Write", requiresHumanReview: true };
  }
  return { name, category, authorityClassification: "Read Only", permissionStatus: "Inferred Read Only", requiresHumanReview: false };
}

function classifyMcpToolCategory(name: string) {
  if (name.includes("approval")) return "Approval Workflow";
  if (name.includes("decision") || name.includes("option")) return "Decision Governance";
  if (name.includes("memory") || name.includes("preference") || name.includes("knowledge")) return "Memory and Preference";
  if (name.includes("trip") || name.includes("itinerary") || name.includes("excursion")) return "Trip Planning";
  if (name.includes("research") || name.includes("place") || name.includes("google")) return "Research";
  if (name.includes("packing")) return "Packing";
  if (name.includes("notion") || name.includes("sync")) return "Notion Sync";
  if (name.includes("archive") || name.includes("restore")) return "Lifecycle and Retention";
  if (name.includes("validate") || name.includes("catalog")) return "Reliability";
  if (name.includes("recommendation") || name.includes("explain")) return "Explainability";
  return "General";
}

function summarizeMcpCapabilities(tools: McpToolMetadata[]) {
  const byCategory = new Map<string, McpToolMetadata[]>();
  for (const tool of tools) {
    byCategory.set(tool.category, [...(byCategory.get(tool.category) ?? []), tool]);
  }
  return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([capability, categoryTools]) => ({
    capability,
    toolCount: categoryTools.length,
    examples: categoryTools.slice(0, 5).map((tool) => tool.name)
  }));
}

function countValues(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

async function markTravelBrainMcpSourcesCollected(collectionTimestamp: Date, collection: McpMetadataCollection, permissionWarningCount: number) {
  await prisma.evidenceSource.updateMany({
    where: { sourceId: { in: ["SRC-TB-MCP-SERVERS", "SRC-TB-MCP-TOOLS", "SRC-TB-MCP-CAPABILITIES"] } },
    data: {
      collectionStatus: EvidenceCollectionStatus.VALIDATED,
      lastCollectedAt: collectionTimestamp,
      lastValidatedAt: collectionTimestamp,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: AuditStatus.ON_TRACK
    }
  });
  await prisma.evidenceSource.updateMany({
    where: { sourceId: { in: ["SRC-TB-MCP-PERMISSIONS", "SRC-TB-MCP-AUTHORITY"] } },
    data: {
      collectionStatus: permissionWarningCount > 0 ? EvidenceCollectionStatus.COLLECTED : EvidenceCollectionStatus.VALIDATED,
      lastCollectedAt: collectionTimestamp,
      lastValidatedAt: collectionTimestamp,
      freshnessStatus: FreshnessStatus.CURRENT,
      connectorHealth: permissionWarningCount > 0 ? AuditStatus.NEEDS_ATTENTION : AuditStatus.ON_TRACK
    }
  });
}

async function createMcpArtifactsFromCollection(
  mcpConnectionId: string,
  sourceById: Map<string, string>,
  collectionTimestamp: Date,
  collection: McpMetadataCollection,
  permissionWarnings: McpToolMetadata[]
) {
  const baseServerInventory = {
    serverName: collection.serverName,
    endpoint: collection.endpoint,
    version: collection.version,
    repositoryPath: collection.repositoryPath,
    privacyBoundary: "MCP metadata only. No prompts, customer content, tool inputs, tool outputs, secrets, credentials, or payloads collected."
  };
  const toolInventory = collection.tools.map((tool) => ({
    name: tool.name,
    category: tool.category,
    authorityClassification: tool.authorityClassification,
    permissionStatus: tool.permissionStatus,
    requiresHumanReview: tool.requiresHumanReview
  }));
  const declaredPermissions = {
    approvedReadOnlyTools: collection.approvedReadOnlyTools,
    approvedWriteToolsWithConstraints: collection.approvedWriteTools,
    deniedActions: collection.deniedActions,
    humanEscalationTriggerCount: collection.humanEscalationTriggers.length,
    unclassifiedWriteTools: permissionWarnings.map((tool) => tool.name)
  };
  const authorityClassifications = {
    counts: collection.authorityCounts,
    readOnlyTools: collection.tools.filter((tool) => tool.authorityClassification === "Read Only").map((tool) => tool.name),
    writeToolsNeedingReview: permissionWarnings.map((tool) => tool.name),
    approvalRequiredTools: collection.tools.filter((tool) => tool.authorityClassification === "Approval Required").map((tool) => tool.name),
    autonomousTools: collection.tools.filter((tool) => tool.authorityClassification === "Autonomous").map((tool) => tool.name)
  };
  const policyWarningText = permissionWarnings.length > 0
    ? `${permissionWarnings.length} write-capable tool(s) are exposed by the MCP implementation but not explicitly listed in governance/tool-policy.yaml.`
    : "All write-capable tools are covered by explicit policy classification.";

  const artifacts: McpEvidenceArtifactInput[] = [
    {
      artifactId: "MCP-TB-TOOLS-001",
      evidenceSourceId: sourceById.get("SRC-TB-MCP-TOOLS"),
      evidenceType: McpEvidenceType.TOOL_REGISTRY,
      title: "Travel Brain MCP Tool Registry Evidence",
      source: collection.source,
      version: collection.version,
      validationStatus: collection.toolNames.length > 0 && collection.missingRequiredTools.length === 0 ? EvidenceValidationValue.VALID : EvidenceValidationValue.INVALID,
      evidenceHealth: collection.toolNames.length > 0 ? McpEvidenceHealth.PRESENT : McpEvidenceHealth.MISSING,
      serverInventory: baseServerInventory,
      toolInventory,
      toolCategories: collection.categoryCounts,
      declaredPermissions,
      authorityClassifications,
      capabilityInventory: collection.capabilityInventory,
      collectionMethod: "Static MCP metadata collection from the real Travel Brain MCP implementation. No MCP tool calls, tool inputs, tool outputs, prompts, customer content, secrets, or credentials were collected.",
      provenance: `${collection.serverName}@${collection.version} · ${collection.endpoint} · ${collection.toolNames.length} tools parsed from travel-brain-mcp/index.mjs`,
      relatedControls: ["AI-AGENT-001", "AI-GOV-006", "AUD-001"],
      evidenceSummary: `Travel Brain MCP exposes ${collection.toolNames.length} tool(s) across ${Object.keys(collection.categoryCounts).length} capability domain(s); ${collection.missingRequiredTools.length} required contract tool(s) are missing.`,
      collectionReason: "Collected to prove actual agent capability: which MCP tools are exposed by the Travel Brain server and whether the required tool contract is visible.",
      assuranceSummary: collection.missingRequiredTools.length === 0
        ? "MCP tool registry assurance passes because the real Travel Brain MCP implementation exposes the required contract tools."
        : `MCP tool registry assurance is incomplete because required tools are missing: ${collection.missingRequiredTools.join(", ")}.`,
      failureCondition: "This assurance fails if the MCP server source is unavailable, required tools disappear, or exposed tool inventory cannot be traced to the Travel Brain system.",
      sourceGap: ""
    },
    {
      artifactId: "MCP-TB-PERMISSIONS-001",
      evidenceSourceId: sourceById.get("SRC-TB-MCP-PERMISSIONS"),
      evidenceType: McpEvidenceType.TOOL_PERMISSIONS,
      title: "Travel Brain MCP Tool Permissions Evidence",
      source: collection.source,
      version: collection.version,
      validationStatus: permissionWarnings.length === 0 ? EvidenceValidationValue.VALID : EvidenceValidationValue.INVALID,
      evidenceHealth: permissionWarnings.length === 0 ? McpEvidenceHealth.PRESENT : McpEvidenceHealth.DEGRADED,
      serverInventory: baseServerInventory,
      toolInventory,
      toolCategories: collection.categoryCounts,
      declaredPermissions,
      authorityClassifications,
      capabilityInventory: collection.capabilityInventory,
      collectionMethod: "Policy reconciliation between real MCP tool inventory and governance/tool-policy.yaml. The collector stores tool names, categories, and authority classifications only.",
      provenance: `${collection.serverName}@${collection.version} · governance/tool-policy.yaml · ${collection.approvedReadOnlyTools.length} approved read-only tools · ${collection.approvedWriteTools.length} constrained write tools`,
      relatedControls: ["AI-GOV-006", "AI-AGENT-006", "AUD-001"],
      evidenceSummary: `Tool policy evidence reconciles ${collection.toolNames.length} exposed MCP tool(s) against ${collection.approvedReadOnlyTools.length} approved read-only tool(s), ${collection.approvedWriteTools.length} constrained write tool(s), and ${collection.deniedActions.length} denied action(s).`,
      collectionReason: "Collected to prove that actual MCP authority can be reconciled to approved tool permissions and denied-action boundaries.",
      assuranceSummary: permissionWarnings.length === 0
        ? "MCP permission assurance passes because write-capable tools are explicitly classified by policy."
        : `MCP permission assurance warns because ${policyWarningText}`,
      failureCondition: "This assurance fails if write-capable MCP tools exist without policy classification, denied actions are missing, or human escalation triggers are removed.",
      sourceGap: permissionWarnings.length > 0 ? policyWarningText : ""
    },
    {
      artifactId: "MCP-TB-AUTHORITY-001",
      evidenceSourceId: sourceById.get("SRC-TB-MCP-AUTHORITY"),
      evidenceType: McpEvidenceType.AUTHORITY_REGISTRY,
      title: "Travel Brain MCP Authority Registry Evidence",
      source: collection.source,
      version: collection.version,
      validationStatus: permissionWarnings.length === 0 ? EvidenceValidationValue.VALID : EvidenceValidationValue.INVALID,
      evidenceHealth: permissionWarnings.length === 0 ? McpEvidenceHealth.PRESENT : McpEvidenceHealth.DEGRADED,
      serverInventory: baseServerInventory,
      toolInventory,
      toolCategories: collection.categoryCounts,
      declaredPermissions,
      authorityClassifications,
      capabilityInventory: collection.capabilityInventory,
      collectionMethod: "Authority classification over real MCP tool inventory. Classifications are limited to metadata and policy alignment; no tool execution is performed.",
      provenance: `${collection.serverName}@${collection.version} · authority counts ${JSON.stringify(collection.authorityCounts)}`,
      relatedControls: ["AI-GOV-006", "AI-AGENT-001", "AI-AGENT-006"],
      evidenceSummary: `Authority registry classifies exposed MCP tools into ${JSON.stringify(collection.authorityCounts)}.`,
      collectionReason: "Collected to surface authority risk and show where MCP capability is read-only, write-capable, approval-required, or autonomous.",
      assuranceSummary: permissionWarnings.length === 0
        ? "MCP authority assurance passes because exposed authority is policy-classified and no autonomous tools are detected."
        : `MCP authority assurance warns because ${policyWarningText}`,
      failureCondition: "This assurance fails if autonomous or write-capable tools appear without approval policy, if authority classification is unavailable, or if actual MCP capability diverges from approved policy.",
      sourceGap: permissionWarnings.length > 0 ? policyWarningText : ""
    },
    {
      artifactId: "MCP-TB-CAPABILITIES-001",
      evidenceSourceId: sourceById.get("SRC-TB-MCP-CAPABILITIES"),
      evidenceType: McpEvidenceType.CAPABILITY_INVENTORY,
      title: "Travel Brain MCP Capability Inventory Evidence",
      source: collection.source,
      version: collection.version,
      validationStatus: collection.capabilityInventory.length > 0 ? EvidenceValidationValue.VALID : EvidenceValidationValue.INVALID,
      evidenceHealth: collection.capabilityInventory.length > 0 ? McpEvidenceHealth.PRESENT : McpEvidenceHealth.MISSING,
      serverInventory: baseServerInventory,
      toolInventory,
      toolCategories: collection.categoryCounts,
      declaredPermissions,
      authorityClassifications,
      capabilityInventory: collection.capabilityInventory,
      collectionMethod: "Capability inventory derived from real MCP tool names and policy classifications. Tool arguments, outputs, prompts, and customer payloads are excluded.",
      provenance: `${collection.serverName}@${collection.version} · ${collection.capabilityInventory.length} capability domains`,
      relatedControls: ["AI-GOV-010", "AI-AGENT-001", "AUD-001"],
      evidenceSummary: `Capability inventory identifies ${collection.capabilityInventory.length} MCP capability domain(s), including ${collection.capabilityInventory.slice(0, 4).map((item) => item.capability).join(", ")}.`,
      collectionReason: "Collected to prove actual agent capability domains and support audit review of the MCP system boundary.",
      assuranceSummary: "MCP capability assurance passes because capability domains are inspectable and traceable to controls without collecting runtime payloads.",
      failureCondition: "This assurance fails if capability inventory cannot be generated, tool categories cannot be reviewed, or new capability domains appear without governance review.",
      sourceGap: ""
    }
  ];

  for (const artifact of artifacts) {
    await createMcpEvidenceArtifact(mcpConnectionId, collectionTimestamp, artifact);
  }
}

async function createMcpGapEvidence(input: {
  aiSystemId: string;
  collectionTimestamp: Date;
  sourceById: Map<string, string>;
  status: McpConnectionStatus;
  sourceGap: string;
}) {
  const connection = await prisma.mcpConnection.create({
    data: {
      connectionId: "MCP-TB-CONN-001",
      aiSystemId: input.aiSystemId,
      serverName: "travel-brain-mcp",
      endpoint: "not-collected://travel-brain-mcp",
      status: input.status,
      lastScan: input.collectionTimestamp,
      sourceGap: input.sourceGap
    }
  });
  const emptyInventory = {
    sourceGap: input.sourceGap,
    fieldsProhibitedFromCollection: ["prompts", "customer content", "tool inputs", "tool outputs", "secrets", "credentials", "payloads"]
  };
  const gapArtifacts: McpEvidenceArtifactInput[] = [
    ["MCP-TB-TOOLS-001", "SRC-TB-MCP-TOOLS", McpEvidenceType.TOOL_REGISTRY, "Travel Brain MCP Tool Registry Evidence Gap", ["AI-AGENT-001", "AI-GOV-006", "AUD-001"]],
    ["MCP-TB-PERMISSIONS-001", "SRC-TB-MCP-PERMISSIONS", McpEvidenceType.TOOL_PERMISSIONS, "Travel Brain MCP Tool Permissions Evidence Gap", ["AI-GOV-006", "AI-AGENT-006", "AUD-001"]],
    ["MCP-TB-AUTHORITY-001", "SRC-TB-MCP-AUTHORITY", McpEvidenceType.AUTHORITY_REGISTRY, "Travel Brain MCP Authority Registry Evidence Gap", ["AI-GOV-006", "AI-AGENT-001", "AI-AGENT-006"]],
    ["MCP-TB-CAPABILITIES-001", "SRC-TB-MCP-CAPABILITIES", McpEvidenceType.CAPABILITY_INVENTORY, "Travel Brain MCP Capability Inventory Evidence Gap", ["AI-GOV-010", "AI-AGENT-001", "AUD-001"]]
  ].map(([artifactId, sourceId, evidenceType, title, relatedControls]) => ({
    artifactId: artifactId as string,
    evidenceSourceId: input.sourceById.get(sourceId as string),
    evidenceType: evidenceType as McpEvidenceType,
    title: title as string,
    source: "not-collected://travel-brain-mcp",
    version: "not-collected",
    validationStatus: EvidenceValidationValue.MISSING,
    evidenceHealth: McpEvidenceHealth.MISSING,
    serverInventory: emptyInventory,
    toolInventory: [],
    toolCategories: {},
    declaredPermissions: {},
    authorityClassifications: {},
    capabilityInventory: [],
    collectionMethod: "Connector-ready MCP assessment. No real MCP metadata was collected.",
    provenance: "Declared MCP asset from AI Governance.yaml and Travel Brain asset inventory; no live or source-level MCP provenance available.",
    relatedControls: relatedControls as string[],
    evidenceSummary: "MCP governance evidence is not available. This record preserves the MCP evidence gap instead of inventing tool inventory or authority classifications.",
    collectionReason: "Collected to show whether Travel Brain MCP capability, tool permissions, and authority classifications can support governance assurance.",
    assuranceSummary: "Assurance warning: actual MCP authority cannot be proven because MCP metadata was not collected.",
    failureCondition: "This assurance fails until a real MCP source provides server inventory, tool registry, tool permissions, authority classifications, and capability inventory.",
    sourceGap: input.sourceGap
  }));

  for (const artifact of gapArtifacts) {
    await createMcpEvidenceArtifact(connection.id, input.collectionTimestamp, artifact);
  }
}

async function createMcpEvidenceArtifact(
  mcpConnectionId: string,
  collectionTimestamp: Date,
  input: McpEvidenceArtifactInput
) {
  const payload = {
    artifactId: input.artifactId,
    evidenceType: input.evidenceType,
    source: input.source,
    version: input.version,
    serverInventory: input.serverInventory,
    toolInventory: input.toolInventory,
    declaredPermissions: input.declaredPermissions,
    authorityClassifications: input.authorityClassifications,
    capabilityInventory: input.capabilityInventory,
    validationStatus: input.validationStatus,
    relatedControls: input.relatedControls,
    collectionTimestamp: collectionTimestamp.toISOString()
  };
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");

  await prisma.mcpEvidenceArtifact.create({
    data: {
      artifactId: input.artifactId,
      mcpConnectionId,
      evidenceSourceId: input.evidenceSourceId,
      evidenceType: input.evidenceType,
      title: input.title,
      collectionTimestamp,
      source: input.source,
      version: input.version,
      hash,
      validationStatus: input.validationStatus,
      evidenceHealth: input.evidenceHealth,
      serverInventory: JSON.stringify(input.serverInventory, null, 2),
      toolInventory: JSON.stringify(input.toolInventory, null, 2),
      toolCategories: JSON.stringify(input.toolCategories, null, 2),
      declaredPermissions: JSON.stringify(input.declaredPermissions, null, 2),
      authorityClassifications: JSON.stringify(input.authorityClassifications, null, 2),
      capabilityInventory: JSON.stringify(input.capabilityInventory, null, 2),
      collectionMethod: input.collectionMethod,
      provenance: input.provenance,
      relatedControlsJson: JSON.stringify(input.relatedControls),
      evidenceSummary: input.evidenceSummary,
      collectionReason: input.collectionReason,
      assuranceSummary: input.assuranceSummary,
      failureCondition: input.failureCondition,
      sourceGap: input.sourceGap
    }
  });
}

function sanitizeMcpError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

type NotionRecordKind = "Approval" | "Review" | "Committee" | "Ownership" | "Documentation";

type NotionGovernanceRecord = {
  id: string;
  type: "page" | "database";
  title: string;
  url: string;
  lastEditedTime?: string;
  source: string;
  kinds: NotionRecordKind[];
  properties: Record<string, unknown>;
};

type NotionGovernanceCollection = {
  workspaceName: string;
  source: string;
  governancePages: NotionGovernanceRecord[];
  governanceDatabases: NotionGovernanceRecord[];
  approvalRecords: NotionGovernanceRecord[];
  reviewRecords: NotionGovernanceRecord[];
  committeeRecords: NotionGovernanceRecord[];
  ownershipRecords: NotionGovernanceRecord[];
  governanceDocumentation: NotionGovernanceRecord[];
  lastModified?: Date;
};

type NotionEvidenceArtifactInput = {
  artifactId: string;
  evidenceSourceId?: string;
  evidenceType: NotionEvidenceType;
  title: string;
  source: string;
  lastModified?: Date;
  validationStatus: EvidenceValidationValue;
  evidenceHealth: NotionEvidenceHealth;
  governancePages: unknown;
  governanceDatabases: unknown;
  approvalRecords: unknown;
  reviewRecords: unknown;
  committeeRecords: unknown;
  ownershipRecords: unknown;
  governanceDocumentation: unknown;
  collectionMethod: string;
  provenance: string;
  relatedControls: string[];
  evidenceSummary: string;
  collectionReason: string;
  assuranceSummary: string;
  failureCondition: string;
  sourceGap: string;
};

async function seedTravelBrainNotionEvidence(aiSystemId: string) {
  const sourceById = await getTravelBrainNotionSourceMap();
  const collectionTimestamp = new Date();

  try {
    const collection = await collectTravelBrainNotionGovernanceMetadata();
    const totalRecords = collection.governancePages.length
      + collection.governanceDatabases.length
      + collection.approvalRecords.length
      + collection.reviewRecords.length
      + collection.committeeRecords.length
      + collection.ownershipRecords.length
      + collection.governanceDocumentation.length;
    const sourceGap = totalRecords > 0
      ? "Notion governance metadata collected from the scoped Travel Brain workspace. The collector stores governance metadata and record properties only; it does not collect personal notes, unrelated workspace content, customer content, secrets, credentials, or page body content."
      : "Notion connection succeeded, but no Travel Brain governance records were visible in the configured scope. Share the governed Travel Brain pages or databases with the integration before moving Notion assurance toward MVP.";
    const connection = await prisma.notionConnection.create({
      data: {
        connectionId: "NOTION-TB-CONN-001",
        aiSystemId,
        workspaceName: collection.workspaceName,
        status: NotionConnectionStatus.CONNECTED,
        lastScan: collectionTimestamp,
        sourceGap
      }
    });

    await markTravelBrainNotionSourcesCollected(collectionTimestamp, collection);
    await createNotionArtifactsFromCollection(connection.id, sourceById, collectionTimestamp, collection, sourceGap);
  } catch (error) {
    const sanitizedError = sanitizeNotionError(error);
    const missingScopedConfig = sanitizedError.includes("Missing scoped Notion token");
    await createNotionGapEvidence({
      aiSystemId,
      collectionTimestamp,
      sourceById,
      status: missingScopedConfig ? NotionConnectionStatus.DISCONNECTED : NotionConnectionStatus.ERROR,
      sourceGap: missingScopedConfig
        ? "Notion connector model is ready, but scoped Travel Brain governance content is unavailable because no Notion token/page/database scope is configured for this run. This is a governed content-source gap, not a collected-content failure."
        : `Notion governance metadata collection failed: ${sanitizedError}. No real Notion governance evidence was created because the Travel Brain Notion source was not available to this run.`
    });
  }
}

async function getTravelBrainNotionSourceMap() {
  const sources = await prisma.evidenceSource.findMany({
    where: {
      sourceId: {
        in: [
          "SRC-TB-NOTION-PAGES",
          "SRC-TB-NOTION-DATABASES",
          "SRC-TB-NOTION-APPROVALS",
          "SRC-TB-NOTION-REVIEWS",
          "SRC-TB-NOTION-COMMITTEE",
          "SRC-TB-NOTION-OWNERSHIP"
        ]
      }
    }
  });
  return new Map(sources.map((source) => [source.sourceId, source.id]));
}

async function collectTravelBrainNotionGovernanceMetadata(): Promise<NotionGovernanceCollection> {
  const token = notionEnv("TRAVEL_BRAIN_NOTION_TOKEN", "NOTION_TOKEN", "NOTION_API_KEY");
  if (!token) {
    throw new Error("Missing scoped Notion token. Set TRAVEL_BRAIN_NOTION_TOKEN or NOTION_TOKEN and share the Travel Brain governance source with the integration.");
  }

  const workspaceName = notionEnv("TRAVEL_BRAIN_NOTION_WORKSPACE", "NOTION_WORKSPACE_NAME") ?? "Travel Brain Governance Workspace";
  const pageIds = splitEnvList(notionEnv("TRAVEL_BRAIN_NOTION_PAGE_IDS", "TRAVEL_BRAIN_NOTION_PAGE_ID", "NOTION_PAGE_ID"));
  const databaseIds = splitEnvList(notionEnv("TRAVEL_BRAIN_NOTION_DATABASE_IDS", "TRAVEL_BRAIN_NOTION_DATABASE_ID", "NOTION_DATABASE_ID"));
  const query = notionEnv("TRAVEL_BRAIN_NOTION_QUERY", "NOTION_QUERY") ?? "Travel Brain governance";
  const records: NotionGovernanceRecord[] = [];

  for (const pageId of pageIds) {
    const page = await notionRequest(token, `/pages/${encodeURIComponent(pageId)}`);
    records.push(notionObjectToRecord(page, "configured page"));
  }

  for (const databaseId of databaseIds) {
    const database = await notionRequest(token, `/databases/${encodeURIComponent(databaseId)}`);
    records.push(notionObjectToRecord(database, "configured database"));
    const queryResult = await notionRequest(token, `/databases/${encodeURIComponent(databaseId)}/query`, {
      page_size: 50
    });
    for (const item of asArray(queryResult.results)) {
      records.push(notionObjectToRecord(item, `database ${extractNotionTitle(database)}`));
    }
  }

  if (records.length === 0) {
    const searchResult = await notionRequest(token, "/search", {
      query,
      page_size: 50,
      sort: { direction: "descending", timestamp: "last_edited_time" }
    });
    for (const item of asArray(searchResult.results)) {
      const record = notionObjectToRecord(item, `search query ${query}`);
      if (isTravelBrainGovernanceRecord(record)) records.push(record);
    }
  }

  const uniqueRecords = [...new Map(records.map((record) => [record.id, record])).values()];
  const governancePages = uniqueRecords.filter((record) => record.type === "page");
  const governanceDatabases = uniqueRecords.filter((record) => record.type === "database");
  const approvalRecords = uniqueRecords.filter((record) => record.kinds.includes("Approval"));
  const reviewRecords = uniqueRecords.filter((record) => record.kinds.includes("Review"));
  const committeeRecords = uniqueRecords.filter((record) => record.kinds.includes("Committee"));
  const ownershipRecords = uniqueRecords.filter((record) => record.kinds.includes("Ownership"));
  const governanceDocumentation = uniqueRecords.filter((record) => record.kinds.includes("Documentation"));
  const lastModifiedValues = uniqueRecords
    .map((record) => record.lastEditedTime ? new Date(record.lastEditedTime) : null)
    .filter((value): value is Date => Boolean(value && !Number.isNaN(value.getTime())));

  return {
    workspaceName,
    source: databaseIds.length || pageIds.length
      ? `Notion scoped source · ${databaseIds.length} database(s) · ${pageIds.length} page(s)`
      : `Notion scoped search · ${query}`,
    governancePages,
    governanceDatabases,
    approvalRecords,
    reviewRecords,
    committeeRecords,
    ownershipRecords,
    governanceDocumentation,
    lastModified: lastModifiedValues.length ? new Date(Math.max(...lastModifiedValues.map((value) => value.getTime()))) : undefined
  };
}

async function notionRequest(token: string, path: string, body?: Record<string, unknown>) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion API ${path} returned ${response.status}: ${text.slice(0, 300)}`);
  }
  return await response.json() as Record<string, unknown>;
}

function notionObjectToRecord(item: Record<string, unknown>, source: string): NotionGovernanceRecord {
  const objectType = item.object === "database" ? "database" : "page";
  const title = extractNotionTitle(item);
  const properties = sanitizeNotionProperties(item.properties);
  const kinds = classifyNotionRecord(title, properties, source);
  return {
    id: String(item.id ?? title),
    type: objectType,
    title,
    url: typeof item.url === "string" ? item.url : "notion://not-provided",
    lastEditedTime: typeof item.last_edited_time === "string" ? item.last_edited_time : undefined,
    source,
    kinds,
    properties
  };
}

function extractNotionTitle(item: Record<string, unknown>) {
  const directTitle = richTextPlain(item.title);
  if (directTitle) return directTitle;
  const properties = item.properties && typeof item.properties === "object" ? item.properties as Record<string, unknown> : {};
  for (const [name, value] of Object.entries(properties)) {
    if (!value || typeof value !== "object") continue;
    const property = value as Record<string, unknown>;
    if (property.type === "title") {
      return richTextPlain(property.title) || name;
    }
  }
  return typeof item.id === "string" ? `Untitled Notion record ${item.id.slice(0, 8)}` : "Untitled Notion record";
}

function richTextPlain(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const text = item as Record<string, unknown>;
      if (typeof text.plain_text === "string") return text.plain_text;
      const nested = text.text && typeof text.text === "object" ? text.text as Record<string, unknown> : {};
      return typeof nested.content === "string" ? nested.content : "";
    })
    .join("")
    .trim();
}

function sanitizeNotionProperties(value: unknown) {
  if (!value || typeof value !== "object") return {};
  const safe: Record<string, unknown> = {};
  for (const [name, rawProperty] of Object.entries(value as Record<string, unknown>)) {
    if (!rawProperty || typeof rawProperty !== "object") continue;
    const property = rawProperty as Record<string, unknown>;
    const type = String(property.type ?? "unknown");
    safe[name] = { type, value: sanitizeNotionPropertyValue(property, type) };
  }
  return safe;
}

function sanitizeNotionPropertyValue(property: Record<string, unknown>, type: string): unknown {
  if (type === "title") return richTextPlain(property.title);
  if (type === "rich_text") return richTextPlain(property.rich_text).slice(0, 160);
  if (type === "select") return notionName(property.select);
  if (type === "status") return notionName(property.status);
  if (type === "multi_select") return asArray(property.multi_select).map(notionName).filter(Boolean);
  if (type === "date") {
    const date = property.date && typeof property.date === "object" ? property.date as Record<string, unknown> : {};
    return { start: date.start ?? null, end: date.end ?? null };
  }
  if (type === "people") {
    return asArray(property.people)
      .map((person) => person && typeof person === "object" ? (person as Record<string, unknown>).name : null)
      .filter(Boolean);
  }
  if (type === "checkbox") return Boolean(property.checkbox);
  if (type === "url") return typeof property.url === "string" ? property.url : null;
  if (type === "number") return typeof property.number === "number" ? property.number : null;
  if (type === "created_time") return property.created_time ?? null;
  if (type === "last_edited_time") return property.last_edited_time ?? null;
  return "[metadata omitted]";
}

function notionName(value: unknown) {
  return value && typeof value === "object" && typeof (value as Record<string, unknown>).name === "string"
    ? String((value as Record<string, unknown>).name)
    : null;
}

function classifyNotionRecord(title: string, properties: Record<string, unknown>, source: string): NotionRecordKind[] {
  const haystack = `${title} ${source} ${JSON.stringify(properties)}`.toLowerCase();
  const kinds = new Set<NotionRecordKind>();
  if (/approval|approved|decision|production readiness|pilot|exception|risk acceptance/.test(haystack)) kinds.add("Approval");
  if (/review|reviewer|oversight|validation|assessment/.test(haystack)) kinds.add("Review");
  if (/committee|meeting|working group|steering|minutes/.test(haystack)) kinds.add("Committee");
  if (/owner|ownership|accountable|approver|risk owner|business owner|technical owner/.test(haystack)) kinds.add("Ownership");
  if (/governance|policy|procedure|documentation|manifest|control|evidence/.test(haystack)) kinds.add("Documentation");
  if (kinds.size === 0) kinds.add("Documentation");
  return [...kinds];
}

function isTravelBrainGovernanceRecord(record: NotionGovernanceRecord) {
  const haystack = `${record.title} ${record.source} ${JSON.stringify(record.properties)}`.toLowerCase();
  const travelBrainScope = haystack.includes("travel brain") || haystack.includes("travel-brain");
  const governanceScope = /governance|approval|review|committee|owner|risk|control|evidence|oversight|decision/.test(haystack);
  return travelBrainScope && governanceScope;
}

function asArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")) : [];
}

function notionEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) return value.trim();
  }
  return null;
}

function splitEnvList(value: string | null) {
  if (!value) return [];
  return value.split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
}

async function markTravelBrainNotionSourcesCollected(collectionTimestamp: Date, collection: NotionGovernanceCollection) {
  const sourceUpdates = [
    { sourceId: "SRC-TB-NOTION-PAGES", count: collection.governancePages.length },
    { sourceId: "SRC-TB-NOTION-DATABASES", count: collection.governanceDatabases.length },
    { sourceId: "SRC-TB-NOTION-APPROVALS", count: collection.approvalRecords.length },
    { sourceId: "SRC-TB-NOTION-REVIEWS", count: collection.reviewRecords.length },
    { sourceId: "SRC-TB-NOTION-COMMITTEE", count: collection.committeeRecords.length },
    { sourceId: "SRC-TB-NOTION-OWNERSHIP", count: collection.ownershipRecords.length }
  ];

  for (const source of sourceUpdates) {
    await prisma.evidenceSource.updateMany({
      where: { sourceId: source.sourceId },
      data: {
        collectionStatus: source.count > 0 ? EvidenceCollectionStatus.VALIDATED : EvidenceCollectionStatus.COLLECTED,
        lastCollectedAt: collectionTimestamp,
        lastValidatedAt: collectionTimestamp,
        freshnessStatus: FreshnessStatus.CURRENT,
        connectorHealth: source.count > 0 ? AuditStatus.ON_TRACK : AuditStatus.NEEDS_ATTENTION
      }
    });
  }
}

async function createNotionArtifactsFromCollection(
  notionConnectionId: string,
  sourceById: Map<string, string>,
  collectionTimestamp: Date,
  collection: NotionGovernanceCollection,
  sourceGap: string
) {
  const hasApproval = collection.approvalRecords.length > 0;
  const hasReview = collection.reviewRecords.length > 0;
  const hasCommittee = collection.committeeRecords.length > 0;
  const hasDocs = collection.governanceDocumentation.length > 0 || collection.governancePages.length > 0 || collection.governanceDatabases.length > 0;
  const hasOwnership = collection.ownershipRecords.length > 0;

  const artifacts: NotionEvidenceArtifactInput[] = [
    {
      artifactId: "NOTION-TB-APPROVAL-001",
      evidenceSourceId: sourceById.get("SRC-TB-NOTION-APPROVALS"),
      evidenceType: NotionEvidenceType.APPROVAL_EVIDENCE,
      title: "Travel Brain Notion Approval Evidence",
      source: collection.source,
      lastModified: latestModified(collection.approvalRecords) ?? collection.lastModified,
      validationStatus: hasApproval ? EvidenceValidationValue.VALID : EvidenceValidationValue.MISSING,
      evidenceHealth: hasApproval ? NotionEvidenceHealth.PRESENT : NotionEvidenceHealth.MISSING,
      governancePages: collection.governancePages,
      governanceDatabases: collection.governanceDatabases,
      approvalRecords: collection.approvalRecords,
      reviewRecords: collection.reviewRecords,
      committeeRecords: collection.committeeRecords,
      ownershipRecords: collection.ownershipRecords,
      governanceDocumentation: collection.governanceDocumentation,
      collectionMethod: "Scoped Notion API metadata collection. Page body content, personal notes, unrelated workspace content, customer content, secrets, and credentials are excluded.",
      provenance: `${collection.workspaceName} · ${collection.approvalRecords.length} approval record(s) visible`,
      relatedControls: ["AI-LC-006", "AI-GOV-006", "AUD-001"],
      evidenceSummary: `Notion approval evidence contains ${collection.approvalRecords.length} scoped approval record(s) for Travel Brain governance review.`,
      collectionReason: "Collected to prove human-governed approval decisions that technical connectors cannot produce.",
      assuranceSummary: hasApproval
        ? "Human governance assurance passes for approvals because scoped Notion approval metadata is visible and traceable to controls."
        : "Human governance assurance warns because no approval records are visible in the scoped Notion source.",
      failureCondition: "This assurance fails if approval records are missing, not scoped to Travel Brain, lack approver/date metadata, or disappear from the governed Notion source.",
      sourceGap: hasApproval ? "" : sourceGap
    },
    {
      artifactId: "NOTION-TB-REVIEW-001",
      evidenceSourceId: sourceById.get("SRC-TB-NOTION-REVIEWS"),
      evidenceType: NotionEvidenceType.REVIEW_EVIDENCE,
      title: "Travel Brain Notion Review Evidence",
      source: collection.source,
      lastModified: latestModified(collection.reviewRecords) ?? collection.lastModified,
      validationStatus: hasReview ? EvidenceValidationValue.VALID : EvidenceValidationValue.MISSING,
      evidenceHealth: hasReview ? NotionEvidenceHealth.PRESENT : NotionEvidenceHealth.MISSING,
      governancePages: collection.governancePages,
      governanceDatabases: collection.governanceDatabases,
      approvalRecords: collection.approvalRecords,
      reviewRecords: collection.reviewRecords,
      committeeRecords: collection.committeeRecords,
      ownershipRecords: collection.ownershipRecords,
      governanceDocumentation: collection.governanceDocumentation,
      collectionMethod: "Scoped Notion API metadata collection of review records and reviewer accountability fields only.",
      provenance: `${collection.workspaceName} · ${collection.reviewRecords.length} review record(s) visible`,
      relatedControls: ["AI-GOV-004", "AI-GOV-010", "AUD-001"],
      evidenceSummary: `Notion review evidence contains ${collection.reviewRecords.length} review record(s) for oversight and validation traceability.`,
      collectionReason: "Collected to prove human review, oversight cadence, and accountability records.",
      assuranceSummary: hasReview
        ? "Human governance assurance passes for reviews because review metadata is visible and traceable."
        : "Human governance assurance warns because no review records are visible in the scoped Notion source.",
      failureCondition: "This assurance fails if review records lack reviewer/date metadata, are stale, or cannot be linked to Travel Brain controls.",
      sourceGap: hasReview ? "" : sourceGap
    },
    {
      artifactId: "NOTION-TB-COMMITTEE-001",
      evidenceSourceId: sourceById.get("SRC-TB-NOTION-COMMITTEE"),
      evidenceType: NotionEvidenceType.COMMITTEE_EVIDENCE,
      title: "Travel Brain Notion Committee Evidence",
      source: collection.source,
      lastModified: latestModified(collection.committeeRecords) ?? collection.lastModified,
      validationStatus: hasCommittee ? EvidenceValidationValue.VALID : EvidenceValidationValue.MISSING,
      evidenceHealth: hasCommittee ? NotionEvidenceHealth.PRESENT : NotionEvidenceHealth.MISSING,
      governancePages: collection.governancePages,
      governanceDatabases: collection.governanceDatabases,
      approvalRecords: collection.approvalRecords,
      reviewRecords: collection.reviewRecords,
      committeeRecords: collection.committeeRecords,
      ownershipRecords: collection.ownershipRecords,
      governanceDocumentation: collection.governanceDocumentation,
      collectionMethod: "Scoped Notion API metadata collection of committee decision records, meeting references, and governance body metadata.",
      provenance: `${collection.workspaceName} · ${collection.committeeRecords.length} committee record(s) visible`,
      relatedControls: ["GOV-001", "AI-LC-006", "AUD-001"],
      evidenceSummary: `Notion committee evidence contains ${collection.committeeRecords.length} committee or working-group record(s).`,
      collectionReason: "Collected to prove governance committee oversight and accountable human decision context.",
      assuranceSummary: hasCommittee
        ? "Committee governance assurance passes because committee metadata is visible and traceable."
        : "Committee governance assurance warns because no committee records are visible in the scoped Notion source.",
      failureCondition: "This assurance fails if committee decisions are not recorded, lack date/body context, or are unavailable to audit.",
      sourceGap: hasCommittee ? "" : sourceGap
    },
    {
      artifactId: "NOTION-TB-DOCS-001",
      evidenceSourceId: sourceById.get("SRC-TB-NOTION-PAGES"),
      evidenceType: NotionEvidenceType.GOVERNANCE_DOCUMENTATION_EVIDENCE,
      title: "Travel Brain Notion Governance Documentation Evidence",
      source: collection.source,
      lastModified: latestModified(collection.governanceDocumentation) ?? collection.lastModified,
      validationStatus: hasDocs ? EvidenceValidationValue.VALID : EvidenceValidationValue.MISSING,
      evidenceHealth: hasDocs ? NotionEvidenceHealth.PRESENT : NotionEvidenceHealth.MISSING,
      governancePages: collection.governancePages,
      governanceDatabases: collection.governanceDatabases,
      approvalRecords: collection.approvalRecords,
      reviewRecords: collection.reviewRecords,
      committeeRecords: collection.committeeRecords,
      ownershipRecords: collection.ownershipRecords,
      governanceDocumentation: collection.governanceDocumentation,
      collectionMethod: "Scoped Notion API metadata collection of governance documentation inventory only; page body content is not collected.",
      provenance: `${collection.workspaceName} · ${collection.governancePages.length} page(s) · ${collection.governanceDatabases.length} database(s)`,
      relatedControls: ["GOV-001", "AI-GOV-001", "AUD-001"],
      evidenceSummary: `Governance documentation inventory contains ${collection.governancePages.length} page(s), ${collection.governanceDatabases.length} database(s), and ${collection.governanceDocumentation.length} governance documentation record(s).`,
      collectionReason: "Collected to prove that human governance documentation exists as a governed evidence source.",
      assuranceSummary: hasDocs
        ? "Governance documentation assurance passes because scoped Notion governance documentation metadata is visible."
        : "Governance documentation assurance warns because no scoped Notion governance documentation is visible.",
      failureCondition: "This assurance fails if governance documentation is missing, unscoped, stale, or unavailable to audit.",
      sourceGap: hasDocs ? "" : sourceGap
    },
    {
      artifactId: "NOTION-TB-OWNERSHIP-001",
      evidenceSourceId: sourceById.get("SRC-TB-NOTION-OWNERSHIP"),
      evidenceType: NotionEvidenceType.OWNERSHIP_EVIDENCE,
      title: "Travel Brain Notion Ownership Evidence",
      source: collection.source,
      lastModified: latestModified(collection.ownershipRecords) ?? collection.lastModified,
      validationStatus: hasOwnership ? EvidenceValidationValue.VALID : EvidenceValidationValue.MISSING,
      evidenceHealth: hasOwnership ? NotionEvidenceHealth.PRESENT : NotionEvidenceHealth.MISSING,
      governancePages: collection.governancePages,
      governanceDatabases: collection.governanceDatabases,
      approvalRecords: collection.approvalRecords,
      reviewRecords: collection.reviewRecords,
      committeeRecords: collection.committeeRecords,
      ownershipRecords: collection.ownershipRecords,
      governanceDocumentation: collection.governanceDocumentation,
      collectionMethod: "Scoped Notion API metadata collection of ownership and accountability records.",
      provenance: `${collection.workspaceName} · ${collection.ownershipRecords.length} ownership record(s) visible`,
      relatedControls: ["AI-GOV-002", "GOV-001", "AUD-001"],
      evidenceSummary: `Ownership evidence contains ${collection.ownershipRecords.length} record(s) for business owner, risk owner, technical owner, reviewer, approver, or committee accountability.`,
      collectionReason: "Collected to prove human accountability and ownership records for Travel Brain governance.",
      assuranceSummary: hasOwnership
        ? "Ownership assurance passes because accountable ownership metadata is visible and traceable."
        : "Ownership assurance warns because no ownership records are visible in the scoped Notion source.",
      failureCondition: "This assurance fails if business, risk, technical, reviewer, approver, or committee accountability records are missing or stale.",
      sourceGap: hasOwnership ? "" : sourceGap
    }
  ];

  for (const artifact of artifacts) {
    await createNotionEvidenceArtifact(notionConnectionId, collectionTimestamp, artifact);
  }
}

async function createNotionGapEvidence(input: {
  aiSystemId: string;
  collectionTimestamp: Date;
  sourceById: Map<string, string>;
  status: NotionConnectionStatus;
  sourceGap: string;
}) {
  const connection = await prisma.notionConnection.create({
    data: {
      connectionId: "NOTION-TB-CONN-001",
      aiSystemId: input.aiSystemId,
      workspaceName: "Travel Brain Governance Workspace",
      status: input.status,
      lastScan: input.collectionTimestamp,
      sourceGap: input.sourceGap
    }
  });

  const emptyInventory = {
    sourceGap: input.sourceGap,
    requiredConfiguration: [
      "TRAVEL_BRAIN_NOTION_TOKEN or NOTION_TOKEN",
      "TRAVEL_BRAIN_NOTION_DATABASE_ID(S) or TRAVEL_BRAIN_NOTION_PAGE_ID(S), or integration-shared Travel Brain governance pages discoverable by search"
    ],
    fieldsProhibitedFromCollection: ["personal notes", "unrelated workspace content", "customer content", "secrets", "credentials", "page body content unless explicitly governed"]
  };
  const gapArtifacts: NotionEvidenceArtifactInput[] = [
    ["NOTION-TB-APPROVAL-001", "SRC-TB-NOTION-APPROVALS", NotionEvidenceType.APPROVAL_EVIDENCE, "Travel Brain Notion Approval Evidence Gap", ["AI-LC-006", "AI-GOV-006", "AUD-001"]],
    ["NOTION-TB-REVIEW-001", "SRC-TB-NOTION-REVIEWS", NotionEvidenceType.REVIEW_EVIDENCE, "Travel Brain Notion Review Evidence Gap", ["AI-GOV-004", "AI-GOV-010", "AUD-001"]],
    ["NOTION-TB-COMMITTEE-001", "SRC-TB-NOTION-COMMITTEE", NotionEvidenceType.COMMITTEE_EVIDENCE, "Travel Brain Notion Committee Evidence Gap", ["GOV-001", "AI-LC-006", "AUD-001"]],
    ["NOTION-TB-DOCS-001", "SRC-TB-NOTION-PAGES", NotionEvidenceType.GOVERNANCE_DOCUMENTATION_EVIDENCE, "Travel Brain Notion Governance Documentation Evidence Gap", ["GOV-001", "AI-GOV-001", "AUD-001"]],
    ["NOTION-TB-OWNERSHIP-001", "SRC-TB-NOTION-OWNERSHIP", NotionEvidenceType.OWNERSHIP_EVIDENCE, "Travel Brain Notion Ownership Evidence Gap", ["AI-GOV-002", "GOV-001", "AUD-001"]]
  ].map(([artifactId, sourceId, evidenceType, title, relatedControls]) => ({
    artifactId: artifactId as string,
    evidenceSourceId: input.sourceById.get(sourceId as string),
    evidenceType: evidenceType as NotionEvidenceType,
    title: title as string,
    source: "not-collected://travel-brain-notion",
    validationStatus: EvidenceValidationValue.MISSING,
    evidenceHealth: NotionEvidenceHealth.MISSING,
    governancePages: emptyInventory,
    governanceDatabases: emptyInventory,
    approvalRecords: [],
    reviewRecords: [],
    committeeRecords: [],
    ownershipRecords: [],
    governanceDocumentation: [],
    collectionMethod: "Connector-ready Notion governance assessment. No real Notion governance metadata was collected.",
    provenance: "Declared Notion governance workspace from the Travel Brain asset inventory; no scoped Notion API provenance available.",
    relatedControls: relatedControls as string[],
    evidenceSummary: "Notion human-governance evidence is not available. This record preserves the evidence gap instead of inventing approval, review, committee, ownership, or governance documentation records.",
    collectionReason: "Collected to show whether Travel Brain human-governance evidence can support governance assurance.",
    assuranceSummary: "Assurance warning: human governance reality cannot be proven because scoped Notion governance metadata was not collected.",
    failureCondition: "This assurance fails until a scoped Notion source provides governance documentation, approval records, review records, committee decisions, and ownership evidence.",
    sourceGap: input.sourceGap
  }));

  for (const artifact of gapArtifacts) {
    await createNotionEvidenceArtifact(connection.id, input.collectionTimestamp, artifact);
  }
}

async function createNotionEvidenceArtifact(
  notionConnectionId: string,
  collectionTimestamp: Date,
  input: NotionEvidenceArtifactInput
) {
  const payload = {
    artifactId: input.artifactId,
    evidenceType: input.evidenceType,
    source: input.source,
    governancePages: input.governancePages,
    governanceDatabases: input.governanceDatabases,
    approvalRecords: input.approvalRecords,
    reviewRecords: input.reviewRecords,
    committeeRecords: input.committeeRecords,
    ownershipRecords: input.ownershipRecords,
    governanceDocumentation: input.governanceDocumentation,
    validationStatus: input.validationStatus,
    relatedControls: input.relatedControls,
    collectionTimestamp: collectionTimestamp.toISOString()
  };
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");

  await prisma.notionEvidenceArtifact.create({
    data: {
      artifactId: input.artifactId,
      notionConnectionId,
      evidenceSourceId: input.evidenceSourceId,
      evidenceType: input.evidenceType,
      title: input.title,
      source: input.source,
      collectionTimestamp,
      lastModified: input.lastModified,
      hash,
      validationStatus: input.validationStatus,
      evidenceHealth: input.evidenceHealth,
      governancePages: JSON.stringify(input.governancePages, null, 2),
      governanceDatabases: JSON.stringify(input.governanceDatabases, null, 2),
      approvalRecords: JSON.stringify(input.approvalRecords, null, 2),
      reviewRecords: JSON.stringify(input.reviewRecords, null, 2),
      committeeRecords: JSON.stringify(input.committeeRecords, null, 2),
      ownershipRecords: JSON.stringify(input.ownershipRecords, null, 2),
      governanceDocumentation: JSON.stringify(input.governanceDocumentation, null, 2),
      collectionMethod: input.collectionMethod,
      provenance: input.provenance,
      relatedControlsJson: JSON.stringify(input.relatedControls),
      evidenceSummary: input.evidenceSummary,
      collectionReason: input.collectionReason,
      assuranceSummary: input.assuranceSummary,
      failureCondition: input.failureCondition,
      sourceGap: input.sourceGap
    }
  });
}

function latestModified(records: NotionGovernanceRecord[]) {
  const dates = records
    .map((record) => record.lastEditedTime ? new Date(record.lastEditedTime) : null)
    .filter((value): value is Date => Boolean(value && !Number.isNaN(value.getTime())));
  return dates.length ? new Date(Math.max(...dates.map((value) => value.getTime()))) : undefined;
}

function sanitizeNotionError(error: unknown) {
  const candidates = [
    process.env.TRAVEL_BRAIN_NOTION_TOKEN,
    process.env.NOTION_TOKEN,
    process.env.NOTION_API_KEY
  ].filter((value): value is string => Boolean(value));
  let message = error instanceof Error ? error.message : String(error);
  for (const secret of candidates) {
    if (secret.trim()) message = message.replaceAll(secret.trim(), "<redacted>");
  }
  return message;
}

type SecretMetadataRecord = {
  identifier: string;
  sourceSystem: SecretSourceSystem;
  environment: string;
  owner: string | null;
  lastRotatedDate: string | null;
  rotationPolicy: string;
  rotationConfigured: boolean;
  rotationStatus: "CONFIGURED" | "UNKNOWN" | "STALE";
  usageMapping: string;
  associatedAiSystem: string;
  discoveredFromSource: boolean;
  storageLocation: string;
  accessPolicy: string;
};

type SecretMetadataCollection = {
  source: string;
  environment: string;
  records: SecretMetadataRecord[];
  sourceSystems: SecretSourceSystem[];
  rotationWarnings: SecretMetadataRecord[];
  ownershipWarnings: SecretMetadataRecord[];
  staleSecrets: SecretMetadataRecord[];
  plaintextProhibition: {
    status: "PASS" | "WARNING";
    summary: string;
    prohibitedFields: string[];
  };
};

type SecretEvidenceArtifactInput = {
  artifactId: string;
  evidenceSourceId?: string;
  evidenceType: SecretEvidenceType;
  title: string;
  source: SecretSourceSystem;
  environment: string;
  validationStatus: EvidenceValidationValue;
  evidenceHealth: SecretEvidenceHealth;
  secretInventory: unknown;
  rotationEvidence: unknown;
  ownershipEvidence: unknown;
  usageMapping: unknown;
  plaintextProhibition: unknown;
  collectionMethod: string;
  provenance: string;
  relatedControls: string[];
  evidenceSummary: string;
  collectionReason: string;
  assuranceSummary: string;
  failureCondition: string;
  warningReason: string;
  evidenceUsed: string;
  controlImpact: string;
  recommendedAction: string;
  sourceGap: string;
};

async function seedTravelBrainSecretsEvidence(aiSystemId: string) {
  const collectionTimestamp = new Date();
  const sourceById = await getTravelBrainSecretsSourceMap();
  const collection = collectTravelBrainSecretMetadata(collectionTimestamp);
  const connectionBySource = new Map<SecretSourceSystem, { id: string }>();

  for (const sourceSystem of [
    SecretSourceSystem.ENVIRONMENT_VARIABLES,
    SecretSourceSystem.GITHUB_SECRETS,
    SecretSourceSystem.SUPABASE_SECRETS,
    SecretSourceSystem.PORTAINER_SECRETS,
    SecretSourceSystem.LOCAL_SECRET_STORES
  ]) {
    const recordsForSource = collection.records.filter((record) => record.sourceSystem === sourceSystem);
    const status = recordsForSource.length > 0
      ? SecretsConnectionStatus.CONNECTED
      : SecretsConnectionStatus.DISCONNECTED;
    const connection = await prisma.secretsConnection.create({
      data: {
        connectionId: `SECRETS-TB-${sourceSystem.replaceAll("_", "-")}`,
        aiSystemId,
        sourceSystem,
        status,
        lastScan: recordsForSource.length > 0 ? collectionTimestamp : null,
        sourceGap: recordsForSource.length > 0
          ? `Metadata-only collection found ${recordsForSource.length} ${secretSourceLabel(sourceSystem)} secret identifier(s). Secret values were not read, stored, displayed, logged, hashed, exported, or persisted.`
          : `${secretSourceLabel(sourceSystem)} metadata was not discovered in this run. No secret values were collected.`
      }
    });
    connectionBySource.set(sourceSystem, connection);
  }

  const primaryConnection = connectionBySource.get(SecretSourceSystem.ENVIRONMENT_VARIABLES)
    ?? [...connectionBySource.values()][0];
  if (!primaryConnection) return;

  await markTravelBrainSecretSourcesCollected(collectionTimestamp, collection);
  await createSecretArtifactsFromCollection(primaryConnection.id, sourceById, collectionTimestamp, collection);
}

type DiscoveryCandidate = {
  findingId: string;
  findingType: AssetDiscoveryFindingType;
  disposition: AssetDiscoveryDisposition;
  assetType: AssetDiscoveryAssetType;
  assetName: string;
  declared: boolean;
  discovered: boolean;
  tracked: boolean;
  orphaned: boolean;
  evidenceSourceMissing: boolean;
  sourceKey: AssetDiscoverySourceType;
  sourceLabel: string;
  sourceFile?: string;
  sourceAsset?: string;
  evidence: string;
  discoveryRule?: string;
  reason: string;
  confidence: number;
  confidenceLevel?: AssetDiscoveryConfidenceLevel;
  validationStatus?: AssetDiscoveryValidationStatus;
  validationExplanation?: string;
  invalidReason?: string;
  severity: FindingSeverity;
  status: AssetDiscoveryFindingStatus;
  recommendedAction: string;
  relatedControls: string[];
  assetId?: string;
};

async function seedTravelBrainAssetDiscovery(aiSystemId: string) {
  const discoveryAt = new Date();
  const repoRoot = join(process.cwd(), "..", "..");
  const travelBrainRepo = join(repoRoot, "reference-repositories", "travel-brain");
  const manifestPath = join(travelBrainRepo, "AI Governance.yaml");
  const workflowPath = join(travelBrainRepo, ".github", "workflows", "control-tests.yaml");
  const toolPolicyPath = join(travelBrainRepo, "governance", "tool-policy.yaml");
  const promptPath = join(travelBrainRepo, "prompts", "travel-planner.md");
  const dockerfilePath = join(travelBrainRepo, "Dockerfile");
  const composePath = join(travelBrainRepo, "docker-compose.yml");

  const manifestYaml = existsSync(manifestPath) ? readFileSync(manifestPath, "utf8") : "";
  const workflowYaml = existsSync(workflowPath) ? readFileSync(workflowPath, "utf8") : "";
  const toolPolicyYaml = existsSync(toolPolicyPath) ? readFileSync(toolPolicyPath, "utf8") : "";
  const promptText = existsSync(promptPath) ? readFileSync(promptPath, "utf8") : "";
  const declaredNames = new Set(
    [
      ...Array.from(manifestYaml.matchAll(/name:\s*([^\n]+)/g)).map((match) => match[1]?.trim()).filter(Boolean),
      ...Array.from(manifestYaml.matchAll(/asset:\s*([^\n]+)/g)).map((match) => match[1]?.trim()).filter(Boolean)
    ].map((name) => String(name))
  );

  const [
    assets,
    repositoryConnection,
    logSources,
    portainerConnections,
    supabaseConnections,
    mcpConnections,
    notionConnections,
    secretsConnections,
    secretArtifacts
  ] = await Promise.all([
    prisma.asset.findMany({ where: { aiSystemId }, include: { evidenceSources: true } }),
    prisma.repositoryConnection.findFirst({ where: { aiSystemId } }),
    prisma.logSource.findMany({ where: { aiSystemId }, include: { runtimeArtifacts: true } }),
    prisma.portainerConnection.findMany({ where: { aiSystemId }, include: { deploymentArtifacts: true } }),
    prisma.supabaseConnection.findMany({ where: { aiSystemId }, include: { evidenceArtifacts: true } }),
    prisma.mcpConnection.findMany({ where: { aiSystemId }, include: { evidenceArtifacts: true } }),
    prisma.notionConnection.findMany({ where: { aiSystemId }, include: { evidenceArtifacts: true } }),
    prisma.secretsConnection.findMany({ where: { aiSystemId }, include: { evidenceArtifacts: true } }),
    prisma.secretEvidenceArtifact.findMany({ include: { secretsConnection: true } })
  ]);

  const assetByType = new Map(assets.map((asset) => [asset.assetType, asset]));
  const secretInventoryArtifact = secretArtifacts.find((artifact) => artifact.evidenceType === SecretEvidenceType.SECRET_INVENTORY);
  const secretInventory = parseJsonObject<{ records?: Array<{ identifier?: string; usageMapping?: string; sourceSystem?: string }> }>(secretInventoryArtifact?.secretInventory ?? "{}");
  const secretRecords = secretInventory.records ?? [];
  const discoveredSecretNames = secretRecords.map((record) => record.identifier).filter((value): value is string => Boolean(value));
  const externalApiNames = [
    ...Array.from(toolPolicyYaml.matchAll(/name:\s*([^-\n][^\n]+API[^\n]*)/g)).map((match) => match[1]?.trim()).filter(Boolean),
    ...secretRecords
      .filter((record) => record.usageMapping?.toLowerCase().includes("api"))
      .map((record) => record.usageMapping?.replace(/\s+integration$/i, "").trim())
      .filter(Boolean)
  ].map((name) => canonicalExternalApiName(String(name)));
  const uniqueExternalApiNames = [...new Set(externalApiNames)];

  const dockerFilesExist = existsSync(dockerfilePath) || existsSync(composePath);
  const realPortainerEvidence = portainerConnections.flatMap((connection) => connection.deploymentArtifacts).some((artifact) => artifact.validationStatus === EvidenceValidationValue.VALID && artifact.artifactId !== "DEP-TB-PORT-GAP-001");
  const connectedNotion = notionConnections.some((connection) => connection.status === NotionConnectionStatus.CONNECTED);
  const connectedSupabase = supabaseConnections.some((connection) => connection.status === SupabaseConnectionStatus.CONNECTED);
  const connectedMcp = mcpConnections.some((connection) => connection.status === McpConnectionStatus.CONNECTED);

  const sourceInputs = [
    {
      key: AssetDiscoverySourceType.GITHUB_REPOSITORY,
      sourceId: "DISC-SRC-TB-GITHUB-REPOSITORY",
      name: "Travel Brain GitHub repository",
      location: "reference-repositories/travel-brain",
      method: "Repository file tree and collected GitHub artifact inspection.",
      evidence: `Repository connection ${repositoryConnection?.repositoryId ?? "not found"}; files inspected: ${[manifestPath, workflowPath, toolPolicyPath, promptPath].filter(existsSync).map((file) => relative(repoRoot, file)).join(", ")}.`,
      confidence: repositoryConnection ? 95 : 70
    },
    {
      key: AssetDiscoverySourceType.AI_GOVERNANCE_MANIFEST,
      sourceId: "DISC-SRC-TB-MANIFEST",
      name: "AI Governance.yaml",
      location: "reference-repositories/travel-brain/AI Governance.yaml",
      method: "Parse declared assets and evidence-source references from manifest text.",
      evidence: `Declared names: ${[...declaredNames].join(", ") || "none"}.`,
      confidence: manifestYaml ? 95 : 20
    },
    {
      key: AssetDiscoverySourceType.ENVIRONMENT_VARIABLES,
      sourceId: "DISC-SRC-TB-ENVIRONMENT",
      name: "Environment variable names",
      location: "process.env metadata names only",
      method: "Inspect environment variable names only; values are not read.",
      evidence: `Secret metadata names discovered or declared: ${discoveredSecretNames.join(", ") || "none"}.`,
      confidence: 80
    },
    {
      key: AssetDiscoverySourceType.GITHUB_WORKFLOWS,
      sourceId: "DISC-SRC-TB-WORKFLOWS",
      name: "GitHub workflows",
      location: "reference-repositories/travel-brain/.github/workflows/control-tests.yaml",
      method: "Scan workflow names and run commands for monitoring and governance jobs.",
      evidence: workflowYaml ? "Workflow runs manifest validation, prompt policy checks, and monitoring export." : "Workflow file not found.",
      confidence: workflowYaml ? 90 : 10
    },
    {
      key: AssetDiscoverySourceType.DOCKER_FILES,
      sourceId: "DISC-SRC-TB-DOCKER-FILES",
      name: "Docker files",
      location: "reference-repositories/travel-brain/Dockerfile",
      method: "Check for Dockerfile and container build metadata.",
      evidence: existsSync(dockerfilePath) ? "Dockerfile exists." : "No Dockerfile present in the Travel Brain reference repository.",
      confidence: 70
    },
    {
      key: AssetDiscoverySourceType.DOCKER_COMPOSE,
      sourceId: "DISC-SRC-TB-DOCKER-COMPOSE",
      name: "Docker Compose",
      location: "reference-repositories/travel-brain/docker-compose.yml",
      method: "Check for docker-compose service declarations.",
      evidence: existsSync(composePath) ? "docker-compose.yml exists." : "No docker-compose.yml present in the Travel Brain reference repository.",
      confidence: 70
    },
    {
      key: AssetDiscoverySourceType.PORTAINER_METADATA,
      sourceId: "DISC-SRC-TB-PORTAINER",
      name: "Portainer metadata",
      location: "Portainer connector evidence",
      method: "Inspect Portainer connection and deployment evidence metadata.",
      evidence: `${portainerConnections.length} connection(s), ${portainerConnections.flatMap((connection) => connection.deploymentArtifacts).length} deployment artifact(s), real deployment evidence ${realPortainerEvidence ? "present" : "missing"}.`,
      confidence: realPortainerEvidence ? 90 : 65
    },
    {
      key: AssetDiscoverySourceType.SUPABASE_METADATA,
      sourceId: "DISC-SRC-TB-SUPABASE",
      name: "Supabase metadata",
      location: "Supabase connector evidence",
      method: "Inspect Supabase connection and data-governance evidence artifacts.",
      evidence: `${supabaseConnections.length} connection(s), ${supabaseConnections.flatMap((connection) => connection.evidenceArtifacts).length} evidence artifact(s), status ${connectedSupabase ? "connected" : "not connected"}.`,
      confidence: connectedSupabase ? 95 : 60
    },
    {
      key: AssetDiscoverySourceType.MCP_METADATA,
      sourceId: "DISC-SRC-TB-MCP",
      name: "MCP metadata",
      location: "MCP connector evidence",
      method: "Inspect MCP server, tool, authority, and capability metadata.",
      evidence: `${mcpConnections.length} connection(s), ${mcpConnections.flatMap((connection) => connection.evidenceArtifacts).length} evidence artifact(s), status ${connectedMcp ? "connected" : "not connected"}.`,
      confidence: connectedMcp ? 95 : 60
    },
    {
      key: AssetDiscoverySourceType.CONFIGURATION_FILES,
      sourceId: "DISC-SRC-TB-CONFIG",
      name: "Configuration files",
      location: "governance/tool-policy.yaml and prompts/travel-planner.md",
      method: "Scan configuration and policy files for integrations and governed tools.",
      evidence: `Tool policy APIs: ${uniqueExternalApiNames.join(", ") || "none"}; prompt bytes ${promptText.length}.`,
      confidence: toolPolicyYaml ? 90 : 40
    },
    {
      key: AssetDiscoverySourceType.DOCUMENTATION,
      sourceId: "DISC-SRC-TB-DOCUMENTATION",
      name: "Documentation references",
      location: "reference repository governance and prompt documentation",
      method: "Inspect governance documentation and prompt references for assets absent from manifest.",
      evidence: `Governance policy found: ${Boolean(toolPolicyYaml)}; prompt found: ${Boolean(promptText)}.`,
      confidence: 80
    },
    {
      key: AssetDiscoverySourceType.NOTION_REFERENCES,
      sourceId: "DISC-SRC-TB-NOTION",
      name: "Notion references",
      location: "Notion connector gap artifacts",
      method: "Inspect scoped Notion connector status and gap artifacts.",
      evidence: `${notionConnections.length} connection(s), status ${connectedNotion ? "connected" : "blocked/unavailable"}.`,
      confidence: connectedNotion ? 90 : 65
    },
    {
      key: AssetDiscoverySourceType.SECRETS_METADATA,
      sourceId: "DISC-SRC-TB-SECRETS",
      name: "Secrets metadata",
      location: "Secrets metadata connector evidence",
      method: "Inspect secret identifiers and usage mappings only; values are not read.",
      evidence: `${secretsConnections.length} secrets source connection(s), ${secretRecords.length} secret metadata record(s).`,
      confidence: secretRecords.length ? 90 : 50
    }
  ];

  const run = await prisma.assetDiscoveryRun.create({
    data: {
      runId: "DISC-TB-2026-06-15-001",
      aiSystemId,
      status: AssetDiscoveryRunStatus.COMPLETED,
      startedAt: discoveryAt,
      completedAt: discoveryAt,
      knownAssetCount: 0,
      discoveredAssetCount: 0,
      unknownAssetCount: 0,
      untrackedAssetCount: 0,
      orphanedAssetCount: 0,
      missingAssetCount: 0,
      inventoryCompleteness: 0,
      summary: "Travel Brain asset discovery compares AI Governance.yaml declarations against repository files, connector metadata, configuration, documentation, runtime, and secrets metadata.",
      comparisonSummary: "Initial comparison pending finding creation.",
      recommendedAction: "Review discovery findings and decide which untracked assets should become governed assets or evidence sources."
    }
  });

  const sourceByType = new Map<AssetDiscoverySourceType, { id: string }>();
  for (const source of sourceInputs) {
    const created = await prisma.assetDiscoverySource.create({
      data: {
        sourceId: source.sourceId,
        runId: run.id,
        sourceType: source.key,
        name: source.name,
        location: source.location,
        inspectedAt: discoveryAt,
        inspectionMethod: source.method,
        evidenceSummary: source.evidence,
        discoveredAssetCount: 0,
        expectedAssetCount: 0,
        unknownAssetCount: 0,
        missingAssetCount: 0,
        confidence: source.confidence
      }
    });
    sourceByType.set(source.key, created);
  }

  const candidates: DiscoveryCandidate[] = [
    {
      findingId: "DISC-TB-KNOWN-GITHUB-001",
      findingType: AssetDiscoveryFindingType.UNDECLARED_ASSET_FOUND,
      disposition: AssetDiscoveryDisposition.KNOWN_ASSET,
      assetType: AssetDiscoveryAssetType.REPOSITORY,
      assetName: "GitHub - Travel Brain",
      declared: declaredNames.has("GitHub - Travel Brain"),
      discovered: Boolean(repositoryConnection),
      tracked: Boolean(assetByType.get(AssetType.GITHUB)),
      orphaned: false,
      evidenceSourceMissing: false,
      sourceKey: AssetDiscoverySourceType.GITHUB_REPOSITORY,
      sourceLabel: "Repository connection and AI Governance.yaml",
      evidence: `Manifest declares GitHub - Travel Brain; repository connection ${repositoryConnection?.repositoryId ?? "missing"} is present.`,
      reason: "Repository is declared, connected, tracked, and has evidence artifacts.",
      confidence: 95,
      severity: FindingSeverity.INFORMATIONAL,
      status: AssetDiscoveryFindingStatus.RESOLVED,
      recommendedAction: "No action required beyond scheduled connector collection.",
      relatedControls: ["AUD-001", "AI-GOV-001"],
      assetId: assetByType.get(AssetType.GITHUB)?.id
    },
    {
      findingId: "DISC-TB-KNOWN-LOGS-001",
      findingType: AssetDiscoveryFindingType.UNDECLARED_ASSET_FOUND,
      disposition: AssetDiscoveryDisposition.KNOWN_ASSET,
      assetType: AssetDiscoveryAssetType.LOG_SOURCE,
      assetName: "Recommendation Activity Logs",
      declared: declaredNames.has("Recommendation Activity Logs"),
      discovered: logSources.length > 0,
      tracked: Boolean(assetByType.get(AssetType.LOGS)),
      orphaned: false,
      evidenceSourceMissing: false,
      sourceKey: AssetDiscoverySourceType.AI_GOVERNANCE_MANIFEST,
      sourceLabel: "AI Governance.yaml and runtime log sources",
      evidence: `Manifest declares Recommendation Activity Logs; ${logSources.length} log source(s) and ${logSources.flatMap((source) => source.runtimeArtifacts).length} runtime evidence artifact(s) exist.`,
      reason: "Runtime logging is declared and supported by evidence.",
      confidence: 92,
      severity: FindingSeverity.INFORMATIONAL,
      status: AssetDiscoveryFindingStatus.RESOLVED,
      recommendedAction: "Keep log retention and runtime evidence collection current.",
      relatedControls: ["AUD-001", "AI-GOV-010"],
      assetId: assetByType.get(AssetType.LOGS)?.id
    },
    {
      findingId: "DISC-TB-UNDECLARED-SUPABASE-001",
      findingType: AssetDiscoveryFindingType.UNDECLARED_ASSET_FOUND,
      disposition: AssetDiscoveryDisposition.UNTRACKED_ASSET,
      assetType: AssetDiscoveryAssetType.DATABASE,
      assetName: "Supabase - Travel Brain",
      declared: manifestYaml.includes("Supabase - Travel Brain"),
      discovered: supabaseConnections.length > 0,
      tracked: Boolean(assetByType.get(AssetType.SUPABASE)),
      orphaned: false,
      evidenceSourceMissing: false,
      sourceKey: AssetDiscoverySourceType.SUPABASE_METADATA,
      sourceLabel: "Supabase connector metadata",
      evidence: `${supabaseConnections.length} Supabase connection(s) and ${supabaseConnections.flatMap((connection) => connection.evidenceArtifacts).length} Supabase evidence artifact(s) exist, but AI Governance.yaml does not declare a databases section.`,
      reason: "Database evidence exists outside the declared manifest boundary.",
      confidence: connectedSupabase ? 96 : 82,
      severity: FindingSeverity.MEDIUM,
      status: AssetDiscoveryFindingStatus.REVIEW_REQUIRED,
      recommendedAction: "Add a databases section to AI Governance.yaml and confirm owner, retention, privacy, and RLS evidence requirements.",
      relatedControls: ["PRI-001", "SEC-001", "AUD-001"],
      assetId: assetByType.get(AssetType.SUPABASE)?.id
    },
    {
      findingId: "DISC-TB-UNDECLARED-MCP-001",
      findingType: AssetDiscoveryFindingType.UNDECLARED_ASSET_FOUND,
      disposition: AssetDiscoveryDisposition.UNTRACKED_ASSET,
      assetType: AssetDiscoveryAssetType.MCP_SERVER,
      assetName: "Travel Brain MCP Server",
      declared: manifestYaml.includes("mcp_servers"),
      discovered: mcpConnections.length > 0,
      tracked: Boolean(assetByType.get(AssetType.MCP)),
      orphaned: false,
      evidenceSourceMissing: false,
      sourceKey: AssetDiscoverySourceType.MCP_METADATA,
      sourceLabel: "MCP governance metadata",
      evidence: `${mcpConnections.length} MCP connection(s) and ${mcpConnections.flatMap((connection) => connection.evidenceArtifacts).length} MCP artifact(s) exist, but AI Governance.yaml does not declare MCP servers.`,
      reason: "Agent capability surface is discoverable but missing from manifest declarations.",
      confidence: connectedMcp ? 96 : 80,
      severity: FindingSeverity.MEDIUM,
      status: AssetDiscoveryFindingStatus.REVIEW_REQUIRED,
      recommendedAction: "Declare MCP servers and map tool permissions, authority, and capability evidence to the manifest.",
      relatedControls: ["AI-GOV-006", "AI-AGENT-006", "AUD-001"],
      assetId: assetByType.get(AssetType.MCP)?.id
    },
    {
      findingId: "DISC-TB-UNDECLARED-SECRETS-001",
      findingType: AssetDiscoveryFindingType.UNDECLARED_ASSET_FOUND,
      disposition: AssetDiscoveryDisposition.UNTRACKED_ASSET,
      assetType: AssetDiscoveryAssetType.SECRETS_SOURCE,
      assetName: "Travel Brain Secrets Sources",
      declared: manifestYaml.includes("secrets:"),
      discovered: secretRecords.length > 0,
      tracked: Boolean(assetByType.get(AssetType.SECRETS)),
      orphaned: false,
      evidenceSourceMissing: false,
      sourceKey: AssetDiscoverySourceType.SECRETS_METADATA,
      sourceLabel: "Secrets metadata connector",
      evidence: `${secretRecords.length} secret metadata record(s) exist across ${secretsConnections.length} source system connection(s); AI Governance.yaml does not declare secrets.`,
      reason: "Secrets metadata is governed by connector evidence but absent from the declared asset boundary.",
      confidence: 94,
      confidenceLevel: AssetDiscoveryConfidenceLevel.MEDIUM,
      validationStatus: AssetDiscoveryValidationStatus.WARNING,
      validationExplanation: "Warning. Secrets evidence is metadata-only and some identifiers may originate from declared connector metadata rather than source-system discovery.",
      invalidReason: "",
      severity: FindingSeverity.MEDIUM,
      status: AssetDiscoveryFindingStatus.REVIEW_REQUIRED,
      recommendedAction: "Add metadata-only secrets source declarations and owner/rotation expectations to AI Governance.yaml.",
      relatedControls: ["SEC-001", "AUD-001", "OPS-001"],
      assetId: assetByType.get(AssetType.SECRETS)?.id
    },
    ...uniqueExternalApiNames.map((name, index): DiscoveryCandidate => {
      const deniedOnly = name === "Booking API";
      const secretOnly = name === "OpenAI API";
      return {
        findingId: `DISC-TB-UNKNOWN-API-${String(index + 1).padStart(3, "0")}`,
        findingType: AssetDiscoveryFindingType.UNKNOWN_INTEGRATION_FOUND,
        disposition: AssetDiscoveryDisposition.UNKNOWN_ASSET,
        assetType: AssetDiscoveryAssetType.EXTERNAL_API,
        assetName: name,
        declared: manifestYaml.includes(name),
        discovered: !deniedOnly,
        tracked: false,
        orphaned: false,
        evidenceSourceMissing: !deniedOnly,
        sourceKey: AssetDiscoverySourceType.CONFIGURATION_FILES,
        sourceLabel: "Tool policy and secrets usage metadata",
        evidence: `${name} appears in tool policy or secrets usage mapping but is not declared as an external service in AI Governance.yaml.`,
        discoveryRule: deniedOnly
          ? "Do not promote denied-tool references to discovered integrations."
          : "Create an unknown integration finding when an API name appears in approved tool policy or metadata-backed usage mapping but not in AI Governance.yaml external services.",
        reason: deniedOnly
          ? "Booking API appears only in denied tool policy language. That proves a prohibited capability boundary, not a real integration asset."
          : "External integration was inferred without explicit manifest declaration or evidence source.",
        confidence: secretOnly ? 72 : deniedOnly ? 35 : 88,
        confidenceLevel: secretOnly ? AssetDiscoveryConfidenceLevel.MEDIUM : deniedOnly ? AssetDiscoveryConfidenceLevel.LOW : AssetDiscoveryConfidenceLevel.HIGH,
        validationStatus: deniedOnly ? AssetDiscoveryValidationStatus.INVALID : secretOnly ? AssetDiscoveryValidationStatus.WARNING : AssetDiscoveryValidationStatus.VALID,
        validationExplanation: deniedOnly
          ? "Invalid. The only support is a denied-tools policy entry, so the engine cannot claim a Booking API integration exists."
          : secretOnly
            ? "Warning. OpenAI API is supported by secrets usage metadata, but no direct configuration file or manifest external-service declaration was found."
            : "Valid. The API appears directly in governed tool policy or metadata-backed usage mapping.",
        invalidReason: deniedOnly ? "Denied tool references are not evidence of an active integration." : "",
        severity: deniedOnly ? FindingSeverity.LOW : FindingSeverity.MEDIUM,
        status: AssetDiscoveryFindingStatus.REVIEW_REQUIRED,
        recommendedAction: deniedOnly
          ? "Keep the denied-tool boundary as policy evidence, but do not add Booking API to discovered asset inventory unless runtime or configuration evidence appears."
          : "Confirm whether this integration should be governed as an external service and add vendor/data-use evidence sources.",
        relatedControls: ["AI-GOV-006", "SEC-001", "TPRM-001"]
      };
    }),
    {
      findingId: "DISC-TB-MISSING-PORTAINER-001",
      findingType: AssetDiscoveryFindingType.DECLARED_ASSET_MISSING,
      disposition: realPortainerEvidence ? AssetDiscoveryDisposition.KNOWN_ASSET : AssetDiscoveryDisposition.MISSING_ASSET,
      assetType: AssetDiscoveryAssetType.CONTAINER,
      assetName: "Portainer - travel-brain-web",
      declared: false,
      discovered: realPortainerEvidence,
      tracked: Boolean(assetByType.get(AssetType.PORTAINER)),
      orphaned: !realPortainerEvidence,
      evidenceSourceMissing: !realPortainerEvidence,
      sourceKey: AssetDiscoverySourceType.PORTAINER_METADATA,
      sourceLabel: "Portainer connector metadata",
      evidence: realPortainerEvidence ? "Portainer deployment evidence exists." : "Portainer connector exists, but this run has only a deployment gap artifact and no real container metadata.",
      reason: realPortainerEvidence ? "Container is discoverable through runtime metadata." : "Container asset is tracked but current runtime evidence is unavailable, so discovery cannot prove the deployed container exists.",
      confidence: realPortainerEvidence ? 90 : 70,
      confidenceLevel: realPortainerEvidence ? AssetDiscoveryConfidenceLevel.HIGH : AssetDiscoveryConfidenceLevel.MEDIUM,
      validationStatus: realPortainerEvidence ? AssetDiscoveryValidationStatus.VALID : AssetDiscoveryValidationStatus.WARNING,
      validationExplanation: realPortainerEvidence ? "Valid. Runtime deployment evidence supports the container." : "Warning. The tracked Portainer asset exists, but current runtime metadata is a source gap artifact.",
      invalidReason: "",
      severity: realPortainerEvidence ? FindingSeverity.INFORMATIONAL : FindingSeverity.MEDIUM,
      status: realPortainerEvidence ? AssetDiscoveryFindingStatus.RESOLVED : AssetDiscoveryFindingStatus.OPEN,
      recommendedAction: realPortainerEvidence ? "Keep Portainer collection scheduled." : "Reconnect Portainer metadata collection and add container declaration to AI Governance.yaml.",
      relatedControls: ["OPS-001", "AI-GOV-010"],
      assetId: assetByType.get(AssetType.PORTAINER)?.id
    },
    {
      findingId: "DISC-TB-MISSING-NOTION-001",
      findingType: AssetDiscoveryFindingType.MISSING_EVIDENCE_SOURCE,
      disposition: connectedNotion ? AssetDiscoveryDisposition.KNOWN_ASSET : AssetDiscoveryDisposition.MISSING_ASSET,
      assetType: AssetDiscoveryAssetType.DOCUMENTATION,
      assetName: "Notion - Travel Brain Governance Workspace",
      declared: false,
      discovered: connectedNotion,
      tracked: Boolean(assetByType.get(AssetType.NOTION)),
      orphaned: !connectedNotion,
      evidenceSourceMissing: !connectedNotion,
      sourceKey: AssetDiscoverySourceType.NOTION_REFERENCES,
      sourceLabel: "Notion connector gap artifacts",
      evidence: connectedNotion ? "Scoped Notion governance metadata is connected." : "Notion connection and evidence gap artifacts exist, but scoped Notion source metadata is not available.",
      reason: "Human-governance documentation is expected by the operating model but not discoverable in the current source configuration.",
      confidence: connectedNotion ? 90 : 68,
      confidenceLevel: connectedNotion ? AssetDiscoveryConfidenceLevel.HIGH : AssetDiscoveryConfidenceLevel.MEDIUM,
      validationStatus: connectedNotion ? AssetDiscoveryValidationStatus.VALID : AssetDiscoveryValidationStatus.WARNING,
      validationExplanation: connectedNotion ? "Valid. Scoped Notion metadata supports the documentation source." : "Warning. The Notion source is connector-ready but not accessible, so discovery can only prove a source gap.",
      invalidReason: "",
      severity: connectedNotion ? FindingSeverity.INFORMATIONAL : FindingSeverity.MEDIUM,
      status: connectedNotion ? AssetDiscoveryFindingStatus.RESOLVED : AssetDiscoveryFindingStatus.OPEN,
      recommendedAction: "Configure scoped Travel Brain Notion access or record the governed documentation source another way.",
      relatedControls: ["GOV-001", "AUD-001", "AI-LC-006"],
      assetId: assetByType.get(AssetType.NOTION)?.id
    },
    {
      findingId: "DISC-TB-UNTRACKED-WORKFLOW-001",
      findingType: AssetDiscoveryFindingType.UNTRACKED_DEPENDENCY,
      disposition: AssetDiscoveryDisposition.UNTRACKED_ASSET,
      assetType: AssetDiscoveryAssetType.MONITORING_SYSTEM,
      assetName: "GitHub Actions governance monitoring workflow",
      declared: manifestYaml.includes(".github/workflows/control-tests.yaml"),
      discovered: workflowYaml.includes("governance:monitoring:export"),
      tracked: false,
      orphaned: false,
      evidenceSourceMissing: false,
      sourceKey: AssetDiscoverySourceType.GITHUB_WORKFLOWS,
      sourceLabel: "GitHub workflow file",
      evidence: "Workflow runs `npm run governance:monitoring:export`, but no monitoring system asset is declared.",
      reason: "Monitoring workflow is an operational dependency that humans could forget because it appears as CI configuration rather than an asset.",
      confidence: 90,
      severity: FindingSeverity.LOW,
      status: AssetDiscoveryFindingStatus.REVIEW_REQUIRED,
      recommendedAction: "Decide whether governance monitoring should be represented as a monitoring-system asset or evidence source.",
      relatedControls: ["AI-GOV-010", "AUD-001"]
    },
    {
      findingId: "DISC-TB-GAP-DOCKER-FILES-001",
      findingType: AssetDiscoveryFindingType.MISSING_EVIDENCE_SOURCE,
      disposition: dockerFilesExist ? AssetDiscoveryDisposition.KNOWN_ASSET : AssetDiscoveryDisposition.MISSING_ASSET,
      assetType: AssetDiscoveryAssetType.CONFIGURATION,
      assetName: "Container build/runtime configuration files",
      declared: false,
      discovered: dockerFilesExist,
      tracked: false,
      orphaned: !dockerFilesExist,
      evidenceSourceMissing: !dockerFilesExist,
      sourceKey: AssetDiscoverySourceType.DOCKER_FILES,
      sourceLabel: "Dockerfile and Docker Compose scan",
      evidence: dockerFilesExist ? "Docker runtime files found." : "No Dockerfile or docker-compose.yml was found in the Travel Brain reference repository.",
      reason: "Runtime container evidence exists through Portainer, but repository-level container configuration evidence is absent.",
      confidence: 70,
      confidenceLevel: AssetDiscoveryConfidenceLevel.MEDIUM,
      validationStatus: AssetDiscoveryValidationStatus.WARNING,
      validationExplanation: "Warning. The finding is based on absence of Docker files in the reference repository, not proof that container configuration does not exist elsewhere.",
      invalidReason: "",
      severity: FindingSeverity.LOW,
      status: dockerFilesExist ? AssetDiscoveryFindingStatus.RESOLVED : AssetDiscoveryFindingStatus.REVIEW_REQUIRED,
      recommendedAction: "Add runtime configuration evidence source or document why deployment configuration is managed outside the repository.",
      relatedControls: ["OPS-001", "AI-LC-006"]
    },
    {
      findingId: "DISC-TB-ORPHAN-LOCAL-SECRETS-001",
      findingType: AssetDiscoveryFindingType.ORPHANED_ASSET,
      disposition: AssetDiscoveryDisposition.ORPHANED_ASSET,
      assetType: AssetDiscoveryAssetType.SECRETS_SOURCE,
      assetName: "Local Secret Stores",
      declared: false,
      discovered: false,
      tracked: Boolean(assetByType.get(AssetType.SECRETS)),
      orphaned: false,
      evidenceSourceMissing: true,
      sourceKey: AssetDiscoverySourceType.SECRETS_METADATA,
      sourceLabel: "Secrets metadata source status",
      evidence: "Local Secret Stores source exists in supported source list but is disconnected in this discovery run.",
      reason: "A supported source is configured conceptually, but no backing metadata was discovered. This is not sufficient evidence that a local secret store exists.",
      confidence: 30,
      confidenceLevel: AssetDiscoveryConfidenceLevel.LOW,
      validationStatus: AssetDiscoveryValidationStatus.INVALID,
      validationExplanation: "Invalid. The source is a supported connector option and disconnected in this run; no source file, source asset, or metadata record proves an actual local secret store exists.",
      invalidReason: "Conceptual supported source with disconnected status is seed/configuration scope, not discovered asset evidence.",
      severity: FindingSeverity.LOW,
      status: AssetDiscoveryFindingStatus.REVIEW_REQUIRED,
      recommendedAction: "Confirm whether local secret stores are in scope; disable the source or add safe metadata collection.",
      relatedControls: ["SEC-001", "AUD-001"]
    }
  ];

  for (const candidate of candidates) {
    const sourceFile = candidate.sourceFile ?? discoverySourceFile(candidate.sourceKey);
    const sourceAsset = candidate.sourceAsset ?? discoverySourceAsset(candidate.sourceKey, candidate.assetName);
    const discoveryRule = candidate.discoveryRule ?? defaultDiscoveryRule(candidate);
    const confidenceLevel = candidate.confidenceLevel ?? confidenceLevelFor(candidate.confidence);
    const validationStatus = candidate.validationStatus ?? AssetDiscoveryValidationStatus.VALID;
    const validationExplanation = candidate.validationExplanation ?? `Valid. ${candidate.assetName} is supported by ${candidate.sourceLabel} with ${confidenceLevel.toLowerCase()} confidence.`;
    await prisma.assetDiscoveryFinding.create({
      data: {
        findingId: candidate.findingId,
        runId: run.id,
        sourceId: sourceByType.get(candidate.sourceKey)?.id,
        assetId: candidate.assetId,
        findingType: candidate.findingType,
        disposition: candidate.disposition,
        assetType: candidate.assetType,
        assetName: candidate.assetName,
        declared: candidate.declared,
        discovered: candidate.discovered,
        tracked: candidate.tracked,
        orphaned: candidate.orphaned,
        evidenceSourceMissing: candidate.evidenceSourceMissing,
        sourceLabel: candidate.sourceLabel,
        sourceFile,
        sourceAsset,
        evidence: candidate.evidence,
        discoveryRule,
        reason: candidate.reason,
        confidence: candidate.confidence,
        confidenceLevel,
        validationStatus,
        validationExplanation,
        invalidReason: candidate.invalidReason ?? "",
        severity: candidate.severity,
        status: candidate.status,
        recommendedAction: candidate.recommendedAction,
        relatedControlsJson: JSON.stringify(candidate.relatedControls)
      }
    });
  }

  const findings = await prisma.assetDiscoveryFinding.findMany({ where: { runId: run.id } });
  const validatedFindings = findings.filter((finding) => finding.validationStatus !== AssetDiscoveryValidationStatus.INVALID);
  const knownAssetCount = validatedFindings.filter((finding) => finding.disposition === AssetDiscoveryDisposition.KNOWN_ASSET).length;
  const discoveredAssetCount = validatedFindings.filter((finding) => finding.discovered).length;
  const unknownAssetCount = validatedFindings.filter((finding) => finding.disposition === AssetDiscoveryDisposition.UNKNOWN_ASSET).length;
  const untrackedAssetCount = validatedFindings.filter((finding) => finding.disposition === AssetDiscoveryDisposition.UNTRACKED_ASSET).length;
  const orphanedAssetCount = validatedFindings.filter((finding) => finding.disposition === AssetDiscoveryDisposition.ORPHANED_ASSET).length;
  const missingAssetCount = validatedFindings.filter((finding) => finding.disposition === AssetDiscoveryDisposition.MISSING_ASSET).length;
  const reviewedOrKnown = validatedFindings.filter((finding) => finding.disposition === AssetDiscoveryDisposition.KNOWN_ASSET || finding.status === AssetDiscoveryFindingStatus.RESOLVED).length;
  const inventoryCompleteness = Math.round((reviewedOrKnown / Math.max(validatedFindings.length, 1)) * 100);

  await prisma.assetDiscoveryRun.update({
    where: { id: run.id },
    data: {
      knownAssetCount,
      discoveredAssetCount,
      unknownAssetCount,
      untrackedAssetCount,
      orphanedAssetCount,
      missingAssetCount,
      inventoryCompleteness,
      comparisonSummary: `AI Governance.yaml declares ${declaredNames.size} named item(s); discovery produced ${findings.length} asset finding(s), with ${validatedFindings.length} valid or warning-level finding(s) used for inventory counts, including ${untrackedAssetCount} untracked, ${unknownAssetCount} unknown, ${orphanedAssetCount} orphaned, and ${missingAssetCount} missing asset(s).`,
      recommendedAction: "Review untracked Supabase, MCP, Secrets, external APIs, workflow monitoring, and source-gap findings before connector consistency cleanup."
    }
  });

  for (const [sourceType, source] of sourceByType.entries()) {
    const sourceFindings = findings.filter((finding) => finding.sourceId === source.id);
    const validatedSourceFindings = sourceFindings.filter((finding) => finding.validationStatus !== AssetDiscoveryValidationStatus.INVALID);
    await prisma.assetDiscoverySource.update({
      where: { id: source.id },
      data: {
        discoveredAssetCount: validatedSourceFindings.filter((finding) => finding.discovered).length,
        expectedAssetCount: validatedSourceFindings.length,
        unknownAssetCount: validatedSourceFindings.filter((finding) => finding.disposition === AssetDiscoveryDisposition.UNKNOWN_ASSET || finding.disposition === AssetDiscoveryDisposition.UNTRACKED_ASSET).length,
        missingAssetCount: validatedSourceFindings.filter((finding) => finding.disposition === AssetDiscoveryDisposition.MISSING_ASSET || finding.evidenceSourceMissing).length,
        evidenceSummary: `${sourceInputs.find((input) => input.key === sourceType)?.evidence ?? ""} Discovery findings: ${sourceFindings.length}; validated for inventory counts: ${validatedSourceFindings.length}.`
      }
    });
  }
}

function discoverySourceFile(sourceType: AssetDiscoverySourceType) {
  const sourceFiles: Record<AssetDiscoverySourceType, string> = {
    [AssetDiscoverySourceType.GITHUB_REPOSITORY]: "reference-repositories/travel-brain",
    [AssetDiscoverySourceType.AI_GOVERNANCE_MANIFEST]: "reference-repositories/travel-brain/AI Governance.yaml",
    [AssetDiscoverySourceType.ENVIRONMENT_VARIABLES]: "process.env metadata names",
    [AssetDiscoverySourceType.GITHUB_WORKFLOWS]: "reference-repositories/travel-brain/.github/workflows/control-tests.yaml",
    [AssetDiscoverySourceType.DOCKER_FILES]: "reference-repositories/travel-brain/Dockerfile",
    [AssetDiscoverySourceType.DOCKER_COMPOSE]: "reference-repositories/travel-brain/docker-compose.yml",
    [AssetDiscoverySourceType.PORTAINER_METADATA]: "Portainer connector metadata",
    [AssetDiscoverySourceType.SUPABASE_METADATA]: "Supabase connector metadata",
    [AssetDiscoverySourceType.MCP_METADATA]: "MCP connector metadata",
    [AssetDiscoverySourceType.CONFIGURATION_FILES]: "reference-repositories/travel-brain/governance/tool-policy.yaml",
    [AssetDiscoverySourceType.DOCUMENTATION]: "reference-repositories/travel-brain/prompts/travel-planner.md",
    [AssetDiscoverySourceType.NOTION_REFERENCES]: "Notion connector gap artifacts",
    [AssetDiscoverySourceType.SECRETS_METADATA]: "Secrets metadata connector artifacts"
  };
  return sourceFiles[sourceType];
}

function discoverySourceAsset(sourceType: AssetDiscoverySourceType, assetName: string) {
  if (sourceType === AssetDiscoverySourceType.SUPABASE_METADATA) return "Supabase - Travel Brain";
  if (sourceType === AssetDiscoverySourceType.MCP_METADATA) return "Travel Brain MCP Server";
  if (sourceType === AssetDiscoverySourceType.PORTAINER_METADATA) return "Portainer - travel-brain-web";
  if (sourceType === AssetDiscoverySourceType.SECRETS_METADATA) return "Travel Brain Secrets Sources";
  if (sourceType === AssetDiscoverySourceType.NOTION_REFERENCES) return "Notion - Travel Brain Governance Workspace";
  if (sourceType === AssetDiscoverySourceType.GITHUB_WORKFLOWS) return "GitHub Actions workflow";
  if (sourceType === AssetDiscoverySourceType.AI_GOVERNANCE_MANIFEST) return "AI Governance.yaml";
  return assetName;
}

function defaultDiscoveryRule(candidate: DiscoveryCandidate) {
  if (candidate.findingType === AssetDiscoveryFindingType.UNDECLARED_ASSET_FOUND) return "Compare discovered connector/repository evidence against AI Governance.yaml declarations.";
  if (candidate.findingType === AssetDiscoveryFindingType.MISSING_EVIDENCE_SOURCE) return "Create a warning when an expected evidence source is absent or inaccessible.";
  if (candidate.findingType === AssetDiscoveryFindingType.UNTRACKED_DEPENDENCY) return "Create a finding when an operational dependency appears in workflow/configuration but is not represented as an asset.";
  if (candidate.findingType === AssetDiscoveryFindingType.ORPHANED_ASSET) return "Create a finding when an asset/source appears configured but lacks supporting evidence.";
  return "Create a finding when source evidence indicates an asset outside the declared inventory.";
}

function confidenceLevelFor(confidence: number) {
  if (confidence >= 85) return AssetDiscoveryConfidenceLevel.HIGH;
  if (confidence >= 60) return AssetDiscoveryConfidenceLevel.MEDIUM;
  return AssetDiscoveryConfidenceLevel.LOW;
}

function canonicalExternalApiName(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("openai")) return "OpenAI API";
  if (normalized.includes("weather")) return "Weather API";
  if (normalized.includes("destination")) return "Destination Content API";
  if (normalized.includes("booking")) return "Booking API";
  return name.trim().replace(/\.$/, "");
}

async function getTravelBrainSecretsSourceMap() {
  const sources = await prisma.evidenceSource.findMany({
    where: {
      sourceId: {
        in: [
          "SRC-TB-SECRETS-INVENTORY",
          "SRC-TB-SECRETS-ROTATION",
          "SRC-TB-SECRETS-OWNERSHIP",
          "SRC-TB-SECRETS-USAGE"
        ]
      }
    }
  });
  return new Map(sources.map((source) => [source.sourceId, source.id]));
}

function collectTravelBrainSecretMetadata(collectionTimestamp: Date): SecretMetadataCollection {
  const environment = "production";
  const declaredSecrets: Array<Omit<SecretMetadataRecord, "lastRotatedDate" | "rotationConfigured" | "rotationStatus" | "discoveredFromSource" | "associatedAiSystem"> & { rotationMetadataKey?: string }> = [
    {
      identifier: "OPENAI_API_KEY",
      sourceSystem: SecretSourceSystem.ENVIRONMENT_VARIABLES,
      environment,
      owner: "Michael Thompson",
      rotationPolicy: "90 days",
      usageMapping: "OpenAI API integration for Travel Brain recommendation generation.",
      storageLocation: "Runtime environment variable",
      accessPolicy: "Restricted to Travel Brain runtime and deployment operators.",
      rotationMetadataKey: "OPENAI_API_KEY_LAST_ROTATED_AT"
    },
    {
      identifier: "TRAVEL_BRAIN_SUPABASE_DB_URL",
      sourceSystem: SecretSourceSystem.SUPABASE_SECRETS,
      environment,
      owner: "Michael Thompson",
      rotationPolicy: "90 days",
      usageMapping: "Supabase metadata connector read-only database access.",
      storageLocation: "Supabase project secret or deployment environment variable",
      accessPolicy: "Read-only metadata collector access; no row-content access."
    },
    {
      identifier: "SUPABASE_SERVICE_ROLE_KEY",
      sourceSystem: SecretSourceSystem.SUPABASE_SECRETS,
      environment,
      owner: "Security Lead",
      rotationPolicy: "90 days",
      usageMapping: "Supabase service integration credential declared for governance review.",
      storageLocation: "Supabase secret store",
      accessPolicy: "Service role use requires explicit security approval and rotation review."
    },
    {
      identifier: "PORTAINER_TOKEN",
      sourceSystem: SecretSourceSystem.PORTAINER_SECRETS,
      environment,
      owner: "Michael Thompson",
      rotationPolicy: "90 days",
      usageMapping: "Read-only Portainer metadata collection for deployed-state evidence.",
      storageLocation: "Runtime environment variable or Portainer access-token store",
      accessPolicy: "Read-only Portainer API access scoped to metadata collection.",
      rotationMetadataKey: "PORTAINER_TOKEN_LAST_ROTATED_AT"
    },
    {
      identifier: "GITHUB_TOKEN",
      sourceSystem: SecretSourceSystem.GITHUB_SECRETS,
      environment,
      owner: "Michael Thompson",
      rotationPolicy: "90 days",
      usageMapping: "GitHub repository metadata collection for governed Travel Brain artifacts.",
      storageLocation: "GitHub Actions secret or local connector environment variable",
      accessPolicy: "Repository metadata access only; no secret values are retrievable through this connector.",
      rotationMetadataKey: "GITHUB_TOKEN_LAST_ROTATED_AT"
    },
    {
      identifier: "WEATHER_API_TOKEN",
      sourceSystem: SecretSourceSystem.ENVIRONMENT_VARIABLES,
      environment,
      owner: null,
      rotationPolicy: "90 days",
      usageMapping: "Weather provider API integration for destination and itinerary context.",
      storageLocation: "Runtime environment variable",
      accessPolicy: "External API access should be restricted to Travel Brain runtime.",
      rotationMetadataKey: "WEATHER_API_TOKEN_LAST_ROTATED_AT"
    },
    {
      identifier: "DESTINATION_CONTENT_API_KEY",
      sourceSystem: SecretSourceSystem.ENVIRONMENT_VARIABLES,
      environment,
      owner: "Product Operations",
      rotationPolicy: "90 days",
      usageMapping: "Destination content API integration for travel recommendation enrichment.",
      storageLocation: "Runtime environment variable",
      accessPolicy: "External API access should be restricted to Travel Brain runtime.",
      rotationMetadataKey: "DESTINATION_CONTENT_API_KEY_LAST_ROTATED_AT"
    }
  ];

  const records = declaredSecrets.map((secret) => {
    const lastRotatedDate = getSecretRotationMetadata(secret.rotationMetadataKey);
    const rotationStatus = classifySecretRotation(lastRotatedDate, collectionTimestamp);
    return {
      identifier: secret.identifier,
      sourceSystem: secret.sourceSystem,
      environment: secret.environment,
      owner: secret.owner,
      lastRotatedDate,
      rotationPolicy: secret.rotationPolicy,
      rotationConfigured: Boolean(lastRotatedDate),
      rotationStatus,
      usageMapping: secret.usageMapping,
      associatedAiSystem: "Travel Brain",
      discoveredFromSource: secretMetadataNameDiscovered(secret.identifier),
      storageLocation: secret.storageLocation,
      accessPolicy: secret.accessPolicy
    };
  });

  const rotationWarnings = records.filter((record) => record.rotationStatus !== "CONFIGURED");
  const staleSecrets = records.filter((record) => record.rotationStatus === "STALE");
  const ownershipWarnings = records.filter((record) => !record.owner);

  return {
    source: "Travel Brain safe secret metadata collection",
    environment,
    records,
    sourceSystems: [...new Set(records.map((record) => record.sourceSystem))],
    rotationWarnings,
    ownershipWarnings,
    staleSecrets,
    plaintextProhibition: {
      status: "PASS",
      summary: "Collector stores secret names, source systems, owners, rotation metadata, usage mappings, and policy status only. Values are explicitly prohibited from collection.",
      fieldsProhibitedFromCollection: [
        "secret values",
        "tokens",
        "passwords",
        "API key values",
        "certificates",
        "private keys",
        "connection strings",
        "customer content",
        "sensitive payloads"
      ]
    }
  };
}

function secretMetadataNameDiscovered(identifier: string) {
  return Object.prototype.hasOwnProperty.call(process.env, identifier);
}

function getSecretRotationMetadata(key?: string) {
  if (!key) return null;
  const value = process.env[key]?.trim();
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function classifySecretRotation(lastRotatedDate: string | null, collectionTimestamp: Date): "CONFIGURED" | "UNKNOWN" | "STALE" {
  if (!lastRotatedDate) return "UNKNOWN";
  const rotatedAt = new Date(lastRotatedDate);
  if (Number.isNaN(rotatedAt.getTime())) return "UNKNOWN";
  const daysOld = Math.floor((collectionTimestamp.getTime() - rotatedAt.getTime()) / (24 * 60 * 60 * 1000));
  return daysOld > 90 ? "STALE" : "CONFIGURED";
}

async function markTravelBrainSecretSourcesCollected(collectionTimestamp: Date, collection: SecretMetadataCollection) {
  const hasInventory = collection.records.length > 0;
  const hasRotationWarnings = collection.rotationWarnings.length > 0;
  const hasOwnershipWarnings = collection.ownershipWarnings.length > 0;
  const updates = [
    {
      sourceId: "SRC-TB-SECRETS-INVENTORY",
      valid: hasInventory,
      warning: false
    },
    {
      sourceId: "SRC-TB-SECRETS-ROTATION",
      valid: hasInventory && !hasRotationWarnings,
      warning: hasRotationWarnings
    },
    {
      sourceId: "SRC-TB-SECRETS-OWNERSHIP",
      valid: hasInventory && !hasOwnershipWarnings,
      warning: hasOwnershipWarnings
    },
    {
      sourceId: "SRC-TB-SECRETS-USAGE",
      valid: hasInventory,
      warning: false
    }
  ];

  for (const update of updates) {
    await prisma.evidenceSource.updateMany({
      where: { sourceId: update.sourceId },
      data: {
        collectionStatus: update.valid ? EvidenceCollectionStatus.VALIDATED : hasInventory ? EvidenceCollectionStatus.COLLECTED : EvidenceCollectionStatus.MISSING,
        lastCollectedAt: hasInventory ? collectionTimestamp : null,
        lastValidatedAt: update.valid ? collectionTimestamp : null,
        freshnessStatus: hasInventory ? FreshnessStatus.CURRENT : FreshnessStatus.MISSING,
        connectorHealth: update.valid ? AuditStatus.ON_TRACK : update.warning ? AuditStatus.NEEDS_ATTENTION : AuditStatus.BLOCKED
      }
    });
  }
}

async function createSecretArtifactsFromCollection(
  secretsConnectionId: string,
  sourceById: Map<string, string>,
  collectionTimestamp: Date,
  collection: SecretMetadataCollection
) {
  const inventoryValid = collection.records.length > 0;
  const rotationValid = inventoryValid && collection.rotationWarnings.length === 0;
  const ownershipValid = inventoryValid && collection.ownershipWarnings.length === 0;
  const usageValid = collection.records.every((record) => Boolean(record.usageMapping && record.associatedAiSystem));
  const sourceGap = "Secrets metadata collected from safe source names and declared Travel Brain secret records. Secret values were never read, stored, displayed, logged, hashed, exported, or persisted.";

  const inventory = {
    records: collection.records.map(secretMetadataForStorage),
    sourceSystems: collection.sourceSystems.map(secretSourceLabel),
    discoveredNames: collection.records.filter((record) => record.discoveredFromSource).map((record) => record.identifier),
    declaredNames: collection.records.map((record) => record.identifier),
    fieldsProhibitedFromCollection: collection.plaintextProhibition.fieldsProhibitedFromCollection
  };
  const rotationEvidence = {
    totalSecrets: collection.records.length,
    rotationConfigured: collection.records.filter((record) => record.rotationStatus === "CONFIGURED").map(secretMetadataForStorage),
    rotationUnknown: collection.records.filter((record) => record.rotationStatus === "UNKNOWN").map(secretMetadataForStorage),
    staleSecrets: collection.staleSecrets.map(secretMetadataForStorage),
    policy: "Secrets should have explicit rotation metadata and owner review at least every 90 days."
  };
  const ownershipEvidence = {
    ownedSecrets: collection.records.filter((record) => record.owner).map(secretMetadataForStorage),
    missingOwnership: collection.ownershipWarnings.map(secretMetadataForStorage)
  };
  const usageMapping = {
    mappings: collection.records.map((record) => ({
      identifier: record.identifier,
      sourceSystem: secretSourceLabel(record.sourceSystem),
      environment: record.environment,
      usageMapping: record.usageMapping,
      associatedAiSystem: record.associatedAiSystem,
      storageLocation: record.storageLocation
    }))
  };
  const plaintextProhibition = collection.plaintextProhibition;

  const artifacts: SecretEvidenceArtifactInput[] = [
    {
      artifactId: "SEC-TB-SECRETS-INVENTORY-001",
      evidenceSourceId: sourceById.get("SRC-TB-SECRETS-INVENTORY"),
      evidenceType: SecretEvidenceType.SECRET_INVENTORY,
      title: "Travel Brain Secret Inventory Evidence",
      source: SecretSourceSystem.ENVIRONMENT_VARIABLES,
      environment: collection.environment,
      validationStatus: inventoryValid ? EvidenceValidationValue.VALID : EvidenceValidationValue.MISSING,
      evidenceHealth: inventoryValid ? SecretEvidenceHealth.PRESENT : SecretEvidenceHealth.MISSING,
      secretInventory: inventory,
      rotationEvidence,
      ownershipEvidence,
      usageMapping,
      plaintextProhibition,
      collectionMethod: "Metadata-only secrets collection from environment variable names and declared Travel Brain secret sources. Secret values are explicitly prohibited and are not hashed.",
      provenance: `${collection.source} · ${collection.records.length} identifier(s) · collected ${collectionTimestamp.toISOString()}`,
      relatedControls: ["SEC-001", "AUD-001", "OPS-001", "AI-GOV-010"],
      evidenceSummary: `Secrets inventory contains ${collection.records.length} Travel Brain secret identifier(s) across ${collection.sourceSystems.length} source system(s), with ${collection.records.filter((record) => record.discoveredFromSource).length} discovered as local metadata names.`,
      collectionReason: "Collected to prove Travel Brain has a governed inventory of secret identifiers and source systems without collecting any secret material.",
      assuranceSummary: inventoryValid
        ? "Secret inventory assurance is supported by metadata-only identifiers, source systems, environments, usage mappings, and AI-system association."
        : "Secret inventory assurance is incomplete because no secret metadata records were collected.",
      failureCondition: "This assurance fails if secret identifiers cannot be inventoried, source systems are unknown, or collection requires values, tokens, passwords, certificates, private keys, API key values, or connection strings.",
      warningReason: "",
      evidenceUsed: "Secret identifiers, source systems, environments, storage locations, usage mapping, and associated AI system.",
      controlImpact: "SEC-001, AUD-001, OPS-001, and AI-GOV-010 depend on knowing which secret metadata records exist and where they are used.",
      recommendedAction: "Continue metadata-only inventory collection and reconcile newly discovered secret names against AI Governance.yaml.",
      sourceGap
    },
    {
      artifactId: "SEC-TB-SECRETS-ROTATION-001",
      evidenceSourceId: sourceById.get("SRC-TB-SECRETS-ROTATION"),
      evidenceType: SecretEvidenceType.ROTATION_EVIDENCE,
      title: "Travel Brain Secret Rotation Evidence",
      source: SecretSourceSystem.ENVIRONMENT_VARIABLES,
      environment: collection.environment,
      validationStatus: rotationValid ? EvidenceValidationValue.VALID : EvidenceValidationValue.INVALID,
      evidenceHealth: rotationValid ? SecretEvidenceHealth.PRESENT : SecretEvidenceHealth.DEGRADED,
      secretInventory: inventory,
      rotationEvidence,
      ownershipEvidence,
      usageMapping,
      plaintextProhibition,
      collectionMethod: "Metadata-only rotation collection. Last rotated dates are collected only when explicitly provided as rotation metadata; secret values are never read.",
      provenance: `${collection.source} · rotation warnings ${collection.rotationWarnings.length} · collected ${collectionTimestamp.toISOString()}`,
      relatedControls: ["SEC-001", "OPS-001", "AUD-001"],
      evidenceSummary: rotationValid
        ? "All Travel Brain secret metadata records have current rotation metadata."
        : `${collection.rotationWarnings.length} Travel Brain secret metadata record(s) have unknown or stale rotation metadata.`,
      collectionReason: "Collected to prove rotation governance and identify stale or unknown secret rotation status.",
      assuranceSummary: rotationValid
        ? "Rotation assurance passes because all collected secret metadata has current rotation evidence."
        : "Rotation assurance warns because one or more secret identifiers have unknown or stale rotation metadata.",
      failureCondition: "This assurance fails if rotation metadata is missing, stale, or cannot be traced to a secret identifier and owner.",
      warningReason: collection.rotationWarnings.length
        ? `Rotation unknown or stale for: ${collection.rotationWarnings.map((record) => record.identifier).join(", ")}.`
        : "",
      evidenceUsed: "Secret identifier, last rotated date metadata where available, rotation policy, and rotation status.",
      controlImpact: "SEC-001 and OPS-001 are weakened when secret rotation cannot be proven or is stale.",
      recommendedAction: "Add explicit last-rotated metadata for unknown records and rotate any stale secrets through the approved secret manager.",
      sourceGap
    },
    {
      artifactId: "SEC-TB-SECRETS-OWNERSHIP-001",
      evidenceSourceId: sourceById.get("SRC-TB-SECRETS-OWNERSHIP"),
      evidenceType: SecretEvidenceType.OWNERSHIP_EVIDENCE,
      title: "Travel Brain Secret Ownership Evidence",
      source: SecretSourceSystem.ENVIRONMENT_VARIABLES,
      environment: collection.environment,
      validationStatus: ownershipValid ? EvidenceValidationValue.VALID : EvidenceValidationValue.INVALID,
      evidenceHealth: ownershipValid ? SecretEvidenceHealth.PRESENT : SecretEvidenceHealth.DEGRADED,
      secretInventory: inventory,
      rotationEvidence,
      ownershipEvidence,
      usageMapping,
      plaintextProhibition,
      collectionMethod: "Metadata-only ownership collection from declared owner fields and source metadata.",
      provenance: `${collection.source} · missing ownership ${collection.ownershipWarnings.length} · collected ${collectionTimestamp.toISOString()}`,
      relatedControls: ["SEC-001", "AUD-001", "AI-GOV-010"],
      evidenceSummary: ownershipValid
        ? "All Travel Brain secret metadata records have accountable owners."
        : `${collection.ownershipWarnings.length} Travel Brain secret metadata record(s) are missing ownership metadata.`,
      collectionReason: "Collected to prove accountable ownership for secrets that support Travel Brain operations and integrations.",
      assuranceSummary: ownershipValid
        ? "Ownership assurance passes because each secret metadata record has an accountable owner."
        : "Ownership assurance warns because at least one secret metadata record lacks an accountable owner.",
      failureCondition: "This assurance fails if secret ownership is missing, stale, or cannot be mapped to an accountable team or control owner.",
      warningReason: collection.ownershipWarnings.length
        ? `Missing owner for: ${collection.ownershipWarnings.map((record) => record.identifier).join(", ")}.`
        : "",
      evidenceUsed: "Secret identifier, owner metadata, source system, environment, and associated AI system.",
      controlImpact: "SEC-001 and AUD-001 require accountable ownership for access review, rotation, and audit follow-up.",
      recommendedAction: "Assign owners to secrets missing ownership and include owner review in the regular secrets governance cadence.",
      sourceGap
    },
    {
      artifactId: "SEC-TB-SECRETS-USAGE-001",
      evidenceSourceId: sourceById.get("SRC-TB-SECRETS-USAGE"),
      evidenceType: SecretEvidenceType.USAGE_MAPPING,
      title: "Travel Brain Secret Usage Mapping Evidence",
      source: SecretSourceSystem.ENVIRONMENT_VARIABLES,
      environment: collection.environment,
      validationStatus: usageValid ? EvidenceValidationValue.VALID : EvidenceValidationValue.INVALID,
      evidenceHealth: usageValid ? SecretEvidenceHealth.PRESENT : SecretEvidenceHealth.DEGRADED,
      secretInventory: inventory,
      rotationEvidence,
      ownershipEvidence,
      usageMapping,
      plaintextProhibition,
      collectionMethod: "Metadata-only usage mapping collection. The connector maps names to source systems, integrations, environments, and associated AI system without collecting secret material.",
      provenance: `${collection.source} · usage mappings ${collection.records.length} · collected ${collectionTimestamp.toISOString()}`,
      relatedControls: ["AI-GOV-010", "OPS-001", "AUD-001", "SEC-001"],
      evidenceSummary: `Usage mapping links ${collection.records.length} secret identifier(s) to Travel Brain integrations, environments, source systems, and controls.`,
      collectionReason: "Collected to prove which AI-system integrations depend on governed secrets and what controls would be impacted if metadata disappears.",
      assuranceSummary: usageValid
        ? "Usage mapping assurance passes because each secret identifier maps to a Travel Brain usage and source system."
        : "Usage mapping assurance warns because one or more secret identifiers lack usage or AI-system mapping.",
      failureCondition: "This assurance fails if usage mapping disappears, an unmanaged secret is discovered, or a secret cannot be tied to an AI system, integration, or control.",
      warningReason: "",
      evidenceUsed: "Secret identifier, source system, environment, usage mapping, storage location, and associated AI system.",
      controlImpact: "AI-GOV-010 and OPS-001 depend on usage mapping to understand operational and AI risk impact when secrets change or disappear.",
      recommendedAction: "Review usage mappings during connector consistency cleanup and add discovered unmanaged secrets to AI Governance.yaml.",
      sourceGap
    }
  ];

  for (const artifact of artifacts) {
    await createSecretEvidenceArtifact(secretsConnectionId, collectionTimestamp, artifact);
  }
}

function secretMetadataForStorage(record: SecretMetadataRecord) {
  return {
    identifier: record.identifier,
    sourceSystem: secretSourceLabel(record.sourceSystem),
    environment: record.environment,
    owner: record.owner,
    lastRotatedDate: record.lastRotatedDate,
    rotationPolicy: record.rotationPolicy,
    rotationConfigured: record.rotationConfigured,
    rotationStatus: record.rotationStatus,
    usageMapping: record.usageMapping,
    associatedAiSystem: record.associatedAiSystem,
    discoveredFromSource: record.discoveredFromSource,
    storageLocation: record.storageLocation,
    accessPolicy: record.accessPolicy
  };
}

async function createSecretEvidenceArtifact(
  secretsConnectionId: string,
  collectionTimestamp: Date,
  input: SecretEvidenceArtifactInput
) {
  const payload = {
    artifactId: input.artifactId,
    evidenceType: input.evidenceType,
    source: input.source,
    environment: input.environment,
    secretInventory: input.secretInventory,
    rotationEvidence: input.rotationEvidence,
    ownershipEvidence: input.ownershipEvidence,
    usageMapping: input.usageMapping,
    plaintextProhibition: input.plaintextProhibition,
    validationStatus: input.validationStatus,
    relatedControls: input.relatedControls,
    collectionTimestamp: collectionTimestamp.toISOString()
  };
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");

  await prisma.secretEvidenceArtifact.create({
    data: {
      artifactId: input.artifactId,
      secretsConnectionId,
      evidenceSourceId: input.evidenceSourceId,
      evidenceType: input.evidenceType,
      title: input.title,
      source: input.source,
      environment: input.environment,
      collectionTimestamp,
      hash,
      validationStatus: input.validationStatus,
      evidenceHealth: input.evidenceHealth,
      secretInventory: JSON.stringify(input.secretInventory, null, 2),
      rotationEvidence: JSON.stringify(input.rotationEvidence, null, 2),
      ownershipEvidence: JSON.stringify(input.ownershipEvidence, null, 2),
      usageMapping: JSON.stringify(input.usageMapping, null, 2),
      plaintextProhibition: JSON.stringify(input.plaintextProhibition, null, 2),
      collectionMethod: input.collectionMethod,
      provenance: input.provenance,
      relatedControlsJson: JSON.stringify(input.relatedControls),
      evidenceSummary: input.evidenceSummary,
      collectionReason: input.collectionReason,
      assuranceSummary: input.assuranceSummary,
      failureCondition: input.failureCondition,
      warningReason: input.warningReason,
      evidenceUsed: input.evidenceUsed,
      controlImpact: input.controlImpact,
      recommendedAction: input.recommendedAction,
      sourceGap: input.sourceGap
    }
  });
}

function secretSourceLabel(sourceSystem: SecretSourceSystem) {
  return {
    [SecretSourceSystem.ENVIRONMENT_VARIABLES]: "Environment Variables",
    [SecretSourceSystem.GITHUB_SECRETS]: "GitHub Secrets",
    [SecretSourceSystem.SUPABASE_SECRETS]: "Supabase Secrets",
    [SecretSourceSystem.PORTAINER_SECRETS]: "Portainer Secrets",
    [SecretSourceSystem.LOCAL_SECRET_STORES]: "Local Secret Stores"
  }[sourceSystem];
}

async function createRuntimeEvidenceArtifact(input: {
  artifactId: string;
  logSourceId: string;
  eventType: LogSourceType;
  evidenceType: RuntimeEvidenceType;
  eventTimestamp: Date;
  correlationId: string;
  sourceRecordId: string;
  relatedControlId: string;
  collectionDate: Date;
  sanitizedEvidence: string;
  evidenceSummary: string;
  collectionReason: string;
  retentionPolicy: string;
  evidenceHealth: RuntimeEvidenceHealth;
  retentionValid: boolean;
  collectionCurrent: boolean;
  collectionRationale: string;
  assuranceSummary: string;
  failureCondition: string;
}) {
  const hash = createHash("sha256").update(JSON.stringify({
    eventType: input.eventType,
    evidenceType: input.evidenceType,
    eventTimestamp: input.eventTimestamp.toISOString(),
    correlationId: input.correlationId,
    sourceRecordId: input.sourceRecordId,
    relatedControlId: input.relatedControlId,
    sanitizedEvidence: input.sanitizedEvidence
  })).digest("hex");

  await prisma.runtimeEvidenceArtifact.create({
    data: {
      artifactId: input.artifactId,
      logSourceId: input.logSourceId,
      eventType: input.eventType,
      evidenceType: input.evidenceType,
      eventTimestamp: input.eventTimestamp,
      correlationId: input.correlationId,
      hash,
      validationStatus: EvidenceValidationValue.VALID,
      collectionDate: input.collectionDate,
      sourceRecordId: input.sourceRecordId,
      relatedControlId: input.relatedControlId,
      sanitizedEvidence: input.sanitizedEvidence,
      evidenceSummary: input.evidenceSummary,
      collectionReason: input.collectionReason,
      retentionPolicy: input.retentionPolicy,
      evidenceHealth: input.evidenceHealth,
      retentionValid: input.retentionValid,
      collectionCurrent: input.collectionCurrent,
      collectionRationale: input.collectionRationale,
      assuranceSummary: input.assuranceSummary,
      failureCondition: input.failureCondition
    }
  });
}

async function githubGet<T>(url: string, token: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "ai-risk-governance",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) return null;
  return await response.json() as T;
}

async function seedArtifactAssuranceRules() {
  const artifacts = await prisma.evidenceArtifact.findMany();
  for (const artifact of artifacts) {
    const rules = assuranceChecksForArtifact(artifact);
    for (const [index, rule] of rules.entries()) {
      const assuranceRule = await prisma.assuranceRule.create({
        data: {
          ruleId: `ASSURE-${artifact.artifactId}-${String(index + 1).padStart(3, "0")}`,
          evidenceArtifactId: artifact.id,
          artifactType: artifact.artifactType,
          controlId: rule.controlId,
          validationRule: rule.validationRule,
          severity: rule.severity,
          status: rule.status,
          resultSummary: rule.resultSummary,
          missingElement: rule.missingElement
        }
      });
      const explanation = explanationForRule(artifact, rule);
      await prisma.assuranceExplanation.create({
        data: {
          assuranceRuleId: assuranceRule.id,
          ...explanation
        }
      });
    }
  }
}

async function seedGovernanceStories(createdControls: Map<string, { id: string }>) {
  for (const [controlCode, story] of Object.entries(governanceStories)) {
    const control = createdControls.get(controlCode);
    if (!control) continue;
    await prisma.governanceStory.create({
      data: {
        controlId: control.id,
        ...story
      }
    });
  }
}

type ArtifactForAssurance = {
  artifactType: EvidenceArtifactType;
  content: string;
  path: string;
};

type AssuranceCheck = {
  controlId: string;
  validationRule: string;
  severity: FindingSeverity;
  status: "PASS" | "WARNING" | "FAIL";
  resultSummary: string;
  missingElement?: string;
};

type AssuranceExplanationSeed = {
  result: "PASS" | "WARNING" | "FAIL";
  reason: string;
  supportingEvidence: string;
  supportingArtifacts: string;
  validationChecks: string;
  supportingControls: string;
  missingRequirements: string;
  failureConditions: string;
};

function assuranceChecksForArtifact(artifact: ArtifactForAssurance): AssuranceCheck[] {
  const content = artifact.content;
  const lower = content.toLowerCase();

  if (artifact.artifactType === EvidenceArtifactType.MANIFEST) {
    return [
      check("AI-GOV-001", "Business owner declared", FindingSeverity.HIGH, hasYamlKey(lower, "business_owner"), "Manifest declares accountable business ownership.", "owners.business_owner"),
      check("AI-GOV-001", "Risk owner declared", FindingSeverity.HIGH, hasYamlKey(lower, "risk_owner"), "Manifest declares accountable risk ownership.", "owners.risk_owner"),
      check("AI-LC-001", "Lifecycle stage declared", FindingSeverity.MEDIUM, hasYamlKey(lower, "lifecycle_stage"), "Manifest declares lifecycle stage for onboarding and stage-gate governance.", "system.lifecycle_stage"),
      check("AI-GOV-001", "AI type declared", FindingSeverity.MEDIUM, hasYamlKey(lower, "type") && lower.includes("ai:"), "Manifest declares AI type for governance classification.", "ai.type"),
      check("AI-LC-004", "Asset inventory declared", FindingSeverity.HIGH, lower.includes("assets:"), "Manifest declares asset inventory for evidence source mapping.", "assets"),
      check("AI-LC-004", "Evidence sources declared", FindingSeverity.HIGH, lower.includes("evidence_sources:"), "Manifest declares evidence sources for assurance collection.", "evidence_sources"),
      check("GOV-001", "Regulatory scope declared", FindingSeverity.MEDIUM, lower.includes("regulatory_scope:"), "Manifest declares regulatory scope.", "regulatory_scope"),
      check("AI-GOV-010", "Risk section declared", FindingSeverity.HIGH, lower.includes("risk:"), "Manifest declares AI risk profile.", "risk")
    ];
  }

  if (artifact.artifactType === EvidenceArtifactType.PROMPT) {
    return [
      check("AI-GOV-003", "Prompt exists", FindingSeverity.HIGH, content.trim().length > 0, "Prompt content was collected and is readable.", "prompt content"),
      check("AI-GOV-002", "Prompt owner evident", FindingSeverity.MEDIUM, /russell|owner|owned by|for russell/i.test(content), "Prompt contains ownership or accountable-user context.", "prompt owner"),
      check("AI-GOV-003", "Version history reference", FindingSeverity.MEDIUM, /version|changelog|history|source of truth/i.test(content), "Prompt contains version or source-of-truth context.", "version history"),
      check("AI-GOV-003", "Approval reference", FindingSeverity.HIGH, /approval|approved|human approval|explicitly asks/i.test(content), "Prompt contains approval or explicit human-authorization language.", "approval reference"),
      check("AI-GOV-006", "Prohibited actions bounded", FindingSeverity.HIGH, /do not|never|must not|without.*approval/i.test(content), "Prompt defines prohibited or bounded actions.", "prohibited actions"),
      check("AI-GOV-004", "Human escalation language", FindingSeverity.HIGH, /human|ask russell|confirm|approval|escalat/i.test(content), "Prompt includes human confirmation or escalation language.", "human escalation language")
    ];
  }

  if (artifact.artifactType === EvidenceArtifactType.POLICY) {
    return [
      check("AI-GOV-006", "Approved tools declared", FindingSeverity.HIGH, lower.includes("approved_tools") || lower.includes("approved_read_only_tools"), "Policy declares approved tooling.", "approved tools"),
      check("AI-GOV-006", "Denied actions declared", FindingSeverity.HIGH, lower.includes("denied") || lower.includes("prohibited"), "Policy declares denied or prohibited actions.", "denied actions"),
      check("AI-GOV-005", "Authority limits declared", FindingSeverity.HIGH, lower.includes("authority") || lower.includes("read_only") || lower.includes("read-only"), "Policy declares authority or read-only limits.", "authority limits"),
      check("AI-GOV-004", "Human review requirements declared", FindingSeverity.HIGH, lower.includes("human") || lower.includes("approval") || lower.includes("review"), "Policy declares human review or approval requirements.", "human review requirements")
    ];
  }

  if (artifact.artifactType === EvidenceArtifactType.WORKFLOW) {
    return [
      check("AI-LC-004", "Workflow exists", FindingSeverity.HIGH, content.trim().length > 0 && artifact.path.startsWith(".github/workflows/"), "Workflow artifact exists in the expected GitHub Actions location.", "workflow file"),
      check("AUD-001", "Control tests referenced", FindingSeverity.HIGH, /control-tests|control test|governance baseline/i.test(content), "Workflow references governance control testing.", "control test reference"),
      check("AI-GOV-010", "Monitoring references present", FindingSeverity.MEDIUM, /monitor|result|report|artifact|upload/i.test(content), "Workflow includes monitoring, result, report, or artifact references.", "monitoring result reference")
    ];
  }

  return [];
}

function check(controlId: string, validationRule: string, severity: FindingSeverity, passed: boolean, passSummary: string, missingElement: string): AssuranceCheck {
  return {
    controlId,
    validationRule,
    severity,
    status: passed ? AssuranceRuleStatus.PASS : severity === FindingSeverity.HIGH || severity === FindingSeverity.CRITICAL ? AssuranceRuleStatus.FAIL : AssuranceRuleStatus.WARNING,
    resultSummary: passed ? passSummary : `${validationRule} was not supported by the artifact content.`,
    missingElement: passed ? undefined : missingElement
  };
}

function explanationForRule(artifact: ArtifactForAssurance, rule: AssuranceCheck): AssuranceExplanationSeed {
  const artifactLabel = `${artifact.path} (${artifact.artifactType})`;
  const missingRequirements = rule.missingElement
    ? `${rule.missingElement} is not sufficiently evidenced in the collected artifact.`
    : "No missing requirements were detected for this validation check.";
  const failureConditions = rule.missingElement
    ? `${rule.validationRule} would fail if ${rule.missingElement} remains absent, is removed from the artifact, or cannot be traced to an approved source.`
    : `${rule.validationRule} would fail if the artifact is removed, changed without approval, becomes stale, loses provenance, or no longer contains the validated governance content.`;

  return {
    result: rule.status,
    reason: rule.status === AssuranceRuleStatus.PASS
      ? rule.resultSummary
      : `${rule.validationRule} produced ${rule.status.toLowerCase()} because ${rule.missingElement ?? "required governance content"} was not fully supported by the collected artifact.`,
    supportingEvidence: `Collected GitHub evidence artifact ${artifactLabel}.`,
    supportingArtifacts: artifactLabel,
    validationChecks: rule.validationRule,
    supportingControls: rule.controlId,
    missingRequirements,
    failureConditions
  };
}

function hasYamlKey(content: string, key: string) {
  return new RegExp(`(^|\\n)\\s*${escapeRegExp(key)}\\s*:`, "i").test(content);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
