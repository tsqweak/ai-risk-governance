import { getAiRiskDashboard, getExecutiveCommandCenter, getGovernanceOperationsDashboard } from "../data";
import { formatDate, humanize } from "../components/format";
import { GovernanceWorkClient, type GovernanceWorkItem } from "./GovernanceWorkClient";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const [data, operations, riskData] = await Promise.all([
    getExecutiveCommandCenter(),
    getGovernanceOperationsDashboard(),
    getAiRiskDashboard()
  ]);

  const failedRuns = data.testRuns.filter((run) => run.result === "FAIL");
  const evidenceIssues = data.evidenceHealth.filter((record) => record.health !== "CURRENT" || record.validation !== "VALID");
  const sourceIssues = operations.evidenceSources.filter((source) => source.collectionStatus !== "COLLECTED" || source.connectorHealth !== "ON_TRACK");
  const discoveryFindings = operations.assetDiscoveryFindings.filter((finding) => finding.status === "OPEN" || finding.status === "REVIEW_REQUIRED");
  const reviewTasks = data.systems.flatMap((system) =>
    system.evidenceObjects
      .filter((evidence) => evidence.status === "SUBMITTED" || evidence.status === "DRAFT" || evidence.status === "EXPIRED")
      .map((evidence) => ({ system, evidence }))
  );

  const queueItems: GovernanceWorkItem[] = [
    ...failedRuns.map((run) => ({
      id: `failed-${run.id}`,
      issueType: "Failed Validation",
      issue: `${run.controlTest.testId} failed for ${run.aiSystem.name}`,
      impactedAiSystem: run.aiSystem.name,
      owner: run.aiSystem.riskOwner || run.aiSystem.businessOwner,
      dueDate: "Today",
      severity: run.controlTest.severityIfFailed,
      status: run.result,
      why: run.resultDetails,
      evidenceUsed: `${run.evidenceReference} · ${run.controlTest.description}`,
      impact: run.controlTest.whyItMatters,
      recommendedAction: "Remediate the control or request updated evidence before the next governance cycle.",
      nextStep: "Review the failed monitoring run and update remediation evidence.",
      actionLabel: "Remediate Control",
      controlId: inferControlId(run.evidenceReference, run.controlTest.testId),
      evidenceRequirement: run.controlTest.title,
      evidenceSource: "Control monitoring",
      evidenceArtifact: run.evidenceReference,
      assuranceStatus: run.result,
      traceability: run.aiSystem.name,
      packageStatus: "Blocked",
      workflowState: "In Review",
      scopes: ["My Work", "Audit Blockers", "High Severity"],
      exactObjectHref: `/systems/${run.aiSystem.slug}/monitoring#run-${run.id}`
    })),
    ...evidenceIssues.map((record) => ({
      id: `evidence-${record.id}`,
      issueType: "Evidence Gap",
      issue: `${record.aiSystem.name}: ${record.evidenceRequirement.evidenceType}`,
      impactedAiSystem: record.aiSystem.name,
      owner: record.aiSystem.riskOwner || record.aiSystem.businessOwner,
      dueDate: "Before package readiness",
      severity: record.health === "MISSING" || record.health === "EXPIRED" ? "HIGH" : "MEDIUM",
      status: record.health,
      why: record.rationale,
      evidenceUsed: `${record.evidenceRequirement.evidenceType} · validation ${record.validation}`,
      impact: `Audit package readiness is blocked for ${record.evidenceRequirement.controlId}.`,
      recommendedAction: "Request or refresh the supporting evidence, then verify the control proof path.",
      nextStep: "Request Evidence",
      actionLabel: "Request Evidence",
      controlId: record.evidenceRequirement.controlId,
      evidenceRequirement: record.evidenceRequirement.evidenceType,
      evidenceSource: record.evidenceRequirement.regulatoryControl?.regulation.name ?? "Evidence health record",
      evidenceArtifact: record.health === "MISSING" ? "Missing" : record.evidenceRequirement.requirementId,
      assuranceStatus: record.validation,
      traceability: record.evidenceRequirement.regulatoryControl?.regulation.name ?? record.aiSystem.name,
      packageStatus: "Blocked",
      workflowState: "Waiting on Evidence",
      scopes: ["My Work", "Audit Blockers"],
      exactObjectHref: `/evidence-health#evidence-health-${record.id}`
    })),
    ...data.openFindings.map((finding) => ({
      id: `finding-${finding.id}`,
      issueType: "Finding",
      issue: `${finding.findingId} · ${finding.title}`,
      impactedAiSystem: finding.aiSystem.name,
      owner: finding.owner,
      dueDate: formatDate(finding.remediationTargetDate),
      severity: finding.severity,
      status: finding.status,
      why: finding.description,
      evidenceUsed: `${finding.controlTest.testId} · ${finding.controlTest.title}`,
      impact: finding.controlTest.whyItMatters,
      recommendedAction: "Review finding impact, update remediation evidence, or document exception/risk acceptance.",
      nextStep: "Review Finding",
      actionLabel: "Review Finding",
      controlId: inferControlId(finding.controlTest.description, finding.controlTest.testId),
      evidenceRequirement: finding.controlTest.title,
      evidenceSource: "Monitoring finding",
      evidenceArtifact: finding.findingId,
      assuranceStatus: finding.status,
      traceability: finding.aiSystem.name,
      packageStatus: finding.severity === "CRITICAL" || finding.severity === "HIGH" ? "Blocked" : "Needs review",
      workflowState: finding.status === "IN_PROGRESS" ? "Remediation Planned" : "New",
      scopes: ["My Work", "High Severity", "Committee Ready"],
      exactObjectHref: `/findings#finding-${finding.findingId}`
    })),
    ...sourceIssues.map((source) => ({
      id: `source-${source.id}`,
      issueType: "Source Issue",
      issue: `${source.sourceId} · ${humanize(source.sourceType)}`,
      impactedAiSystem: source.aiSystem.name,
      owner: source.aiSystem.riskOwner || source.aiSystem.businessOwner,
      dueDate: "Next collection cycle",
      severity: source.connectorHealth === "BLOCKED" || source.collectionStatus === "MISSING" ? "HIGH" : "MEDIUM",
      status: source.connectorHealth,
      why: source.governanceValue,
      evidenceUsed: `${humanize(source.sourceType)} source metadata · ${humanize(source.collectionStatus)}`,
      impact: `Controls depending on ${source.sourceId} may not be package-ready until the source is current and validated.`,
      recommendedAction: "Review source health, resolve the limitation, or document an accepted evidence gap.",
      nextStep: "Review source issue",
      actionLabel: "Review Evidence",
      controlId: "Source issue",
      evidenceRequirement: source.validationMethod,
      evidenceSource: source.sourceId,
      evidenceArtifact: source.artifacts[0]?.artifactId ?? "Missing",
      assuranceStatus: source.collectionStatus,
      traceability: source.aiSystem.name,
      packageStatus: source.connectorHealth === "ON_TRACK" ? "Needs review" : "Blocked",
      workflowState: source.collectionStatus === "MISSING" ? "Waiting on Evidence" : "In Review",
      scopes: ["My Work", "Audit Blockers"],
      exactObjectHref: `/evidence-assurance/sources#source-${source.sourceId}`
    })),
    ...discoveryFindings.map((finding) => ({
      id: `discovery-${finding.id}`,
      issueType: "Discovery Finding",
      issue: `${finding.findingId} · ${finding.assetName}`,
      impactedAiSystem: finding.aiSystem.name,
      owner: finding.aiSystem.riskOwner || finding.aiSystem.businessOwner,
      dueDate: "Inventory review",
      severity: finding.severity,
      status: finding.status,
      why: finding.reason,
      evidenceUsed: `${finding.sourceLabel} · ${finding.evidence}`,
      impact: finding.validationExplanation,
      recommendedAction: finding.recommendedAction,
      nextStep: "Classify discovered asset",
      actionLabel: "Review Finding",
      controlId: parseFirstControl(finding.relatedControlsJson) ?? "Discovery",
      evidenceRequirement: finding.discoveryRule,
      evidenceSource: finding.discoverySource?.sourceType ?? finding.sourceLabel,
      evidenceArtifact: finding.sourceFile,
      assuranceStatus: finding.validationStatus,
      traceability: `${finding.confidenceLevel} confidence`,
      packageStatus: finding.validationStatus === "VALID" ? "Needs review" : "Blocked",
      workflowState: "In Review",
      scopes: ["Discovery", "My Work"],
      exactObjectHref: "/evidence-assurance/asset-discovery#findings"
    })),
    ...data.activeExceptions.map((exception) => ({
      id: `exception-${exception.id}`,
      issueType: "Exception",
      issue: `${exception.exceptionId} · ${exception.finding.title}`,
      impactedAiSystem: exception.finding.aiSystem.name,
      owner: exception.approvedBy,
      dueDate: formatDate(exception.expirationDate),
      severity: exception.finding.severity,
      status: "ACCEPTED",
      why: exception.rationale,
      evidenceUsed: `${exception.finding.findingId} · ${exception.finding.description}`,
      impact: "Accepted exceptions still affect governance and audit posture until reviewed or expired.",
      recommendedAction: "Review the exception before expiration and confirm whether remediation, renewal, or closure is required.",
      nextStep: "Review Exception",
      actionLabel: "Review Exception",
      controlId: inferControlId(exception.finding.description, exception.finding.findingId),
      evidenceRequirement: "Exception rationale and approval record",
      evidenceSource: "Exception register",
      evidenceArtifact: exception.exceptionId,
      assuranceStatus: "ACCEPTED",
      traceability: exception.finding.aiSystem.name,
      packageStatus: "Needs review",
      workflowState: "Exception Requested",
      scopes: ["Committee Ready", "My Work"],
      exactObjectHref: "/exceptions"
    })),
    ...riskData.acceptedRisks.map((risk) => ({
      id: `risk-${risk.id}`,
      issueType: "Risk Acceptance",
      issue: `${risk.riskId} · ${risk.title}`,
      impactedAiSystem: risk.aiSystem.name,
      owner: risk.owner,
      dueDate: risk.acceptanceExpirationDate ? formatDate(risk.acceptanceExpirationDate) : formatDate(risk.reviewDate),
      severity: risk.residualRating,
      status: risk.status,
      why: risk.acceptanceRationale ?? risk.description,
      evidenceUsed: risk.evidenceLinks.map((link) => link.evidenceObject.evidenceId).join(", ") || "Risk register acceptance metadata",
      impact: risk.description,
      recommendedAction: "Confirm the accepted residual risk remains inside appetite or prepare committee review.",
      nextStep: "Accept Risk",
      actionLabel: "Accept Risk",
      controlId: risk.controlLinks[0]?.control.code ?? "Risk",
      evidenceRequirement: risk.treatmentPlan,
      evidenceSource: "AI risk register",
      evidenceArtifact: risk.riskId,
      assuranceStatus: risk.status,
      traceability: risk.aiSystem.name,
      packageStatus: "Needs review",
      workflowState: "Accepted Risk",
      scopes: ["Committee Ready", "My Work"],
      exactObjectHref: "/ai-risk"
    })),
    ...reviewTasks.map(({ system, evidence }) => ({
      id: `review-${evidence.id}`,
      issueType: "Review Task",
      issue: `${evidence.evidenceId} · ${evidence.title}`,
      impactedAiSystem: system.name,
      owner: evidence.owner,
      dueDate: formatDate(evidence.expirationDate),
      severity: evidence.status === "EXPIRED" ? "HIGH" : "MEDIUM",
      status: evidence.status,
      why: "Evidence review status requires governance confirmation before audit package use.",
      evidenceUsed: `${evidence.evidenceType} · ${evidence.source}`,
      impact: "Unreviewed evidence can create a metadata dead end and block proof readiness.",
      recommendedAction: "Verify evidence ownership, reviewer status, traceability, and package readiness.",
      nextStep: "Verify Evidence",
      actionLabel: "Verify Evidence",
      controlId: "Unmapped",
      evidenceRequirement: evidence.evidenceType,
      evidenceSource: evidence.source,
      evidenceArtifact: evidence.evidenceId,
      assuranceStatus: evidence.status,
      traceability: system.name,
      packageStatus: "Needs review",
      workflowState: evidence.status === "SUBMITTED" ? "In Review" : "Waiting on Evidence",
      scopes: ["My Work", "Audit Blockers"],
      exactObjectHref: `/evidence/${evidence.evidenceId}`
    }))
  ].sort(prioritySort);

  return (
    <GovernanceWorkClient items={queueItems} />
  );
}

function prioritySort(a: GovernanceWorkItem, b: GovernanceWorkItem) {
  const severityRank: Record<string, number> = { CRITICAL: 0, HIGH: 1, FAIL: 1, WARNING: 2, MEDIUM: 2, LOW: 3, INFORMATIONAL: 4 };
  return (severityRank[a.severity] ?? 5) - (severityRank[b.severity] ?? 5) || a.issueType.localeCompare(b.issueType);
}

function inferControlId(text: string, fallback: string) {
  const match = `${text} ${fallback}`.match(/\b[A-Z]{2,}-[A-Z0-9]+-\d{3}\b|\b[A-Z]{2,}-\d{3}\b/);
  return match?.[0] ?? fallback;
}

function parseFirstControl(value: string) {
  try {
    const parsed = JSON.parse(value) as string[];
    return parsed[0] ?? null;
  } catch {
    return null;
  }
}
