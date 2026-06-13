export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RiskDimension =
  | "customerImpact"
  | "financialImpact"
  | "privacyImpact"
  | "operationalImpact"
  | "regulatoryImpact"
  | "autonomyLevel"
  | "thirdPartyDependency"
  | "dataSensitivity"
  | "explainabilityNeed";

export type RiskDimensions = Record<RiskDimension, RiskLevel>;

export type RiskInput = {
  customerFacing: boolean;
  internalUserFacing: boolean;
  personalData: boolean;
  materialBusinessProcess: boolean;
  regulatedActivity: boolean;
  autonomousAction: boolean;
  financialTransaction: boolean;
  externalThirdPartyDependency: boolean;
  dataClassification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  recommendationOnly?: boolean;
};

export type RiskClassification = {
  score: number;
  dimensions: RiskDimensions;
  overallRiskTier: RiskLevel;
  drivers: string[];
  mitigants: string[];
  rationale: string;
};

const riskWeights: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
};

export function classifyRisk(input: RiskInput): RiskClassification {
  const dimensions: RiskDimensions = {
    customerImpact: input.customerFacing ? "MEDIUM" : input.internalUserFacing ? "LOW" : "LOW",
    financialImpact: input.financialTransaction ? "HIGH" : input.materialBusinessProcess ? "MEDIUM" : "LOW",
    privacyImpact: input.personalData ? "MEDIUM" : "LOW",
    operationalImpact: input.materialBusinessProcess ? "MEDIUM" : "LOW",
    regulatoryImpact: input.regulatedActivity ? "HIGH" : input.customerFacing ? "MEDIUM" : "LOW",
    autonomyLevel: input.autonomousAction ? "HIGH" : "LOW",
    thirdPartyDependency: input.externalThirdPartyDependency ? "MEDIUM" : "LOW",
    dataSensitivity: mapDataSensitivity(input.dataClassification),
    explainabilityNeed: input.customerFacing || input.regulatedActivity ? "MEDIUM" : "LOW"
  };

  if (input.autonomousAction && input.financialTransaction) {
    dimensions.autonomyLevel = "CRITICAL";
    dimensions.financialImpact = "CRITICAL";
  }

  const overallRiskTier = calculateOverallRiskTier(dimensions);
  const score = calculateScore(dimensions);
  const drivers = buildDrivers(input, dimensions);
  const mitigants = buildMitigants(input);

  return {
    score,
    dimensions,
    overallRiskTier,
    drivers,
    mitigants,
    rationale: buildRationale(overallRiskTier, dimensions, drivers, mitigants)
  };
}

export function calculateOverallRiskTier(dimensions: RiskDimensions): RiskLevel {
  const values = Object.values(dimensions);
  const criticalCount = values.filter((value) => value === "CRITICAL").length;
  const highCount = values.filter((value) => value === "HIGH").length;
  const mediumCount = values.filter((value) => value === "MEDIUM").length;
  const allOtherDimensionsLow =
    highCount === 1 && values.every((value) => value === "LOW" || value === "HIGH");

  if (criticalCount > 0) return "CRITICAL";
  if (highCount >= 2) return "HIGH";
  if (highCount === 1 && !allOtherDimensionsLow) return "HIGH";
  if (mediumCount >= 2) return "MEDIUM";
  if (highCount === 1) return "MEDIUM";
  if (mediumCount === 1) return "MEDIUM";
  return "LOW";
}

function calculateScore(dimensions: RiskDimensions) {
  const total = Object.values(dimensions).reduce((sum, value) => sum + riskWeights[value], 0);
  return Math.round((total / (Object.keys(dimensions).length * 4)) * 100);
}

function mapDataSensitivity(classification: RiskInput["dataClassification"]): RiskLevel {
  if (classification === "RESTRICTED") return "HIGH";
  if (classification === "CONFIDENTIAL") return "MEDIUM";
  if (classification === "INTERNAL") return "LOW";
  return "LOW";
}

function buildDrivers(input: RiskInput, dimensions: RiskDimensions) {
  const drivers: string[] = [];

  if (input.customerFacing) drivers.push("Customer-facing AI receives greater scrutiny because outputs may influence customer decisions, fairness expectations, and complaint outcomes.");
  if (input.personalData) drivers.push("Personal data use increases privacy, retention, consent, and explainability obligations.");
  if (input.materialBusinessProcess) drivers.push("Material business process dependency raises operational resilience and continuity expectations.");
  if (input.regulatedActivity) drivers.push("Regulated activity links the system to supervisory obligations and formal control evidence.");
  if (input.externalThirdPartyDependency) drivers.push("External dependency requires third-party risk governance, contracting, monitoring, and exit planning.");
  if (dimensions.dataSensitivity === "HIGH") drivers.push("Restricted data classification increases data protection and access-control expectations.");
  if (input.autonomousAction) drivers.push("Autonomy increases regulatory risk because the system can initiate actions without prior human decisioning.");

  return drivers;
}

function buildMitigants(input: RiskInput) {
  const mitigants: string[] = [];

  if (input.recommendationOnly) mitigants.push("Recommendation-only design limits direct execution risk.");
  if (!input.autonomousAction) mitigants.push("No autonomous action keeps humans accountable for final decisions.");
  if (!input.financialTransaction) mitigants.push("No financial transaction execution reduces direct customer financial harm.");

  return mitigants;
}

function buildRationale(
  overallRiskTier: RiskLevel,
  dimensions: RiskDimensions,
  drivers: string[],
  mitigants: string[]
) {
  const highSignals = Object.entries(dimensions)
    .filter(([, value]) => value === "HIGH" || value === "CRITICAL")
    .map(([key, value]) => `${label(key)} is ${value.toLowerCase()}`);
  const mediumSignals = Object.entries(dimensions)
    .filter(([, value]) => value === "MEDIUM")
    .map(([key]) => label(key));

  const signalText =
    highSignals.length > 0
      ? highSignals.join("; ")
      : mediumSignals.length > 0
        ? `multiple medium dimensions: ${mediumSignals.join(", ")}`
        : "mostly low dimensions";

  return `Overall risk is ${overallRiskTier.toLowerCase()} based on ${signalText}. ${drivers.join(" ")} ${mitigants.length > 0 ? `Mitigants: ${mitigants.join(" ")}` : ""}`.trim();
}

function label(value: string) {
  return value.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`).trim();
}
