import { getAuditPackages, getControlTraceability } from "../data";
import { AuditorWorkspaceClient, type ControlProofFile, type ProofArtifact, type ProofRequirement } from "./AuditorWorkspaceClient";

export const dynamic = "force-dynamic";

const scopedControls = ["AI-GOV-003", "AI-GOV-006", "AUD-001", "AI-AGENT-003", "AI-LC-006", "SEC-001"];

export default async function AuditorWorkspacePage() {
  const [packages, traces] = await Promise.all([
    getAuditPackages(),
    Promise.all(scopedControls.map((controlId) => getControlTraceability(controlId)))
  ]);

  const auditPackage = packages[0] ?? null;
  const proofFiles = traces
    .filter((trace): trace is NonNullable<typeof trace> => Boolean(trace))
    .map((trace) => toProofFile(trace, auditPackage));

  return <AuditorWorkspaceClient proofFiles={proofFiles} />;
}

function toProofFile(
  trace: NonNullable<Awaited<ReturnType<typeof getControlTraceability>>>,
  auditPackage: Awaited<ReturnType<typeof getAuditPackages>>[number] | null
): ControlProofFile {
  const requiredEvidence = [
    ...trace.evidenceRequired.map((item) => requirement(item.label, "Repository artifact", isPresent(item.label, trace.evidencePresent.map((present) => present.label)))),
    ...trace.deploymentEvidenceRequired.map((item) => requirement(item.label, "Deployment evidence", isPresent(item.label, trace.deploymentEvidencePresent.map((present) => present.label)))),
    ...trace.supabaseEvidenceRequired.map((item) => requirement(item.label, "Data governance evidence", isPresent(item.label, trace.supabaseEvidencePresent.map((present) => present.label)))),
    ...trace.mcpEvidenceRequired.map((item) => requirement(item.label, "MCP governance evidence", isPresent(item.label, trace.mcpEvidencePresent.map((present) => present.label)))),
    ...trace.notionEvidenceRequired.map((item) => requirement(item.label, "Human governance evidence", isPresent(item.label, trace.notionEvidencePresent.map((present) => present.label)))),
    ...trace.secretEvidenceRequired.map((item) => requirement(item.label, "Secrets governance evidence", isPresent(item.label, trace.secretEvidencePresent.map((present) => present.label))))
  ];

  const availableEvidence = [
    ...trace.evidenceArtifacts.map((artifact) => ({
      id: artifact.artifactId,
      title: artifact.name,
      connector: connectorFromArtifactType(artifact.artifactType),
      source: artifact.source.sourceId,
      proofQuality: "Inspectable Evidence Artifact" as const,
      provenance: `${artifact.path} · ${artifact.repositoryConnection?.repositoryUrl ?? "stored repository evidence"}`,
      collectedAt: formatDateTime(artifact.lastCollected),
      validationStatus: artifact.validationStatus,
      hashStatus: artifact.artifactHash ? `Hash ${artifact.artifactHash.slice(0, 12)}` : "Hash unavailable",
      snapshotStatus: "Snapshot available",
      driftStatus: "Drift review available",
      proves: repositoryArtifactProof(trace.control.code, artifact.artifactType, artifact.name),
      doesNotProve: "Does not by itself prove runtime behavior, human approval, or that connector source health is current.",
      evidenceHref: `/evidence-artifacts/${artifact.artifactId}`,
      evidenceAccess: "Exact artifact" as const
    })),
    ...trace.runtimeEvidenceArtifacts.map((artifact) => ({
      id: artifact.artifactId,
      title: artifact.evidenceType,
      connector: "Logs",
      source: artifact.logSource.logSourceId,
      proofQuality: "Inspectable Evidence Artifact" as const,
      provenance: `${artifact.logSource.name} · ${artifact.correlationId}`,
      collectedAt: formatDateTime(artifact.eventTimestamp),
      validationStatus: artifact.validationStatus,
      hashStatus: "Runtime event hash retained",
      snapshotStatus: artifact.collectionCurrent ? "Collection current" : "Collection stale",
      driftStatus: artifact.retentionValid ? "Retention valid" : "Retention review",
      proves: artifact.evidenceSummary,
      doesNotProve: "Does not prove design-time approval unless linked to repository, review, or workflow evidence.",
      evidenceHref: `/runtime-evidence/${artifact.artifactId}`,
      evidenceAccess: "Exact artifact" as const
    })),
    ...trace.deploymentEvidenceArtifacts.map((artifact) => ({
      id: artifact.artifactId,
      title: artifact.containerName,
      connector: "Portainer",
      source: artifact.evidenceSource?.sourceId ?? artifact.portainerConnection.connectionId,
      proofQuality: "Inspectable Evidence Artifact" as const,
      provenance: `${artifact.imageName}:${artifact.imageTag}`,
      collectedAt: formatDateTime(artifact.collectionTimestamp),
      validationStatus: artifact.validationStatus,
      hashStatus: `Evidence hash tied to ${artifact.artifactId}`,
      snapshotStatus: artifact.evidenceHealth,
      driftStatus: artifact.driftEvents.length ? `${artifact.driftEvents.length} drift event(s)` : "No drift recorded",
      proves: artifact.evidenceSummary,
      doesNotProve: "Does not prove application-level AI governance approval or human review.",
      evidenceHref: `/deployment-evidence/${artifact.artifactId}`,
      evidenceAccess: "Exact artifact" as const
    })),
    ...trace.supabaseEvidenceArtifacts.map((artifact) => ({
      id: artifact.artifactId,
      title: artifact.title,
      connector: "Supabase",
      source: artifact.evidenceSource?.sourceId ?? artifact.supabaseConnection.connectionId,
      proofQuality: "Inspectable Evidence Artifact" as const,
      provenance: artifact.source,
      collectedAt: formatDateTime(artifact.collectionTimestamp),
      validationStatus: artifact.validationStatus,
      hashStatus: `Evidence hash tied to ${artifact.artifactId}`,
      snapshotStatus: artifact.evidenceHealth,
      driftStatus: artifact.controlValidations.length ? `${artifact.controlValidations.length} control validation(s)` : "No control validation",
      proves: artifact.evidenceSummary,
      doesNotProve: "Does not prove prompt, model, tool, or approval controls outside the data layer.",
      evidenceHref: `/supabase-evidence/${artifact.artifactId}`,
      evidenceAccess: "Exact artifact" as const
    })),
    ...trace.mcpEvidenceArtifacts.map((artifact) => ({
      id: artifact.artifactId,
      title: artifact.title,
      connector: "MCP",
      source: artifact.evidenceSource?.sourceId ?? artifact.mcpConnection.connectionId,
      proofQuality: "Source Metadata Only" as const,
      provenance: artifact.source,
      collectedAt: formatDateTime(artifact.collectionTimestamp),
      validationStatus: artifact.validationStatus,
      hashStatus: `Evidence hash tied to ${artifact.artifactId}`,
      snapshotStatus: artifact.evidenceHealth,
      driftStatus: "Authority metadata review",
      proves: artifact.evidenceSummary,
      doesNotProve: artifact.validationStatus === "VALID"
        ? "Does not prove human approval or policy owner sign-off unless paired with approval evidence."
        : "Does not prove audit sufficiency until the MCP source limitation is resolved.",
      evidenceHref: `/mcp-evidence/${artifact.artifactId}`,
      evidenceAccess: "Exact artifact" as const
    })),
    ...trace.notionEvidenceArtifacts.map((artifact) => ({
      id: artifact.artifactId,
      title: artifact.title,
      connector: "Notion",
      source: artifact.evidenceSource?.sourceId ?? artifact.notionConnection.connectionId,
      proofQuality: artifact.validationStatus === "VALID" ? "Human Governance Record" as const : "Gap Artifact / Limitation" as const,
      provenance: artifact.source,
      collectedAt: formatDateTime(artifact.collectionTimestamp),
      validationStatus: artifact.validationStatus,
      hashStatus: `Evidence hash tied to ${artifact.artifactId}`,
      snapshotStatus: artifact.evidenceHealth,
      driftStatus: "Governance record review",
      proves: artifact.evidenceSummary,
      doesNotProve: artifact.validationStatus === "VALID"
        ? "Does not prove technical enforcement without connector or repository evidence."
        : "Does not prove approval because scoped governance content is unavailable.",
      evidenceHref: `/notion-evidence/${artifact.artifactId}`,
      evidenceAccess: "Exact artifact" as const
    })),
    ...trace.secretEvidenceArtifacts.map((artifact) => ({
      id: artifact.artifactId,
      title: artifact.title,
      connector: "Secrets",
      source: artifact.evidenceSource?.sourceId ?? artifact.secretsConnection.connectionId,
      proofQuality: "Source Metadata Only" as const,
      provenance: artifact.source,
      collectedAt: formatDateTime(artifact.collectionTimestamp),
      validationStatus: artifact.validationStatus,
      hashStatus: `Evidence hash tied to ${artifact.artifactId}`,
      snapshotStatus: artifact.evidenceHealth,
      driftStatus: "Metadata-only boundary preserved",
      proves: artifact.evidenceSummary,
      doesNotProve: "Does not store or prove secret values, tokens, passwords, certificates, private keys, or connection strings.",
      evidenceHref: `/secret-evidence/${artifact.artifactId}`,
      evidenceAccess: "Exact artifact" as const
    }))
  ];

  const missingEvidence = requiredEvidence.filter((item) => item.status === "Missing");
  const warningEvidence = availableEvidence.filter((item) => !["VALID", "PASS"].includes(String(item.validationStatus)));
  const exceptions = trace.exceptions.map((exception) => ({
    id: exception.id,
    label: exception.exceptionId,
    status: "Accepted",
    expires: formatDateTime(exception.expirationDate)
  }));
  const sufficiency = missingEvidence.length > 0 ? "Insufficient" : warningEvidence.length > 0 ? "Needs Review" : "Sufficient";
  const packageStatus = missingEvidence.length > 0 ? "Blocked" : exceptions.length > 0 ? "Exceptions Review" : trace.assuranceScore >= 80 ? "Ready for Package" : "Needs Review";

  return {
    id: trace.control.code,
    auditScope: auditPackage?.scope ?? "Q2 AI Governance Audit",
    packageId: auditPackage?.packageId ?? "AUDPKG-REFERENCE-001",
    packageTitle: auditPackage?.title ?? "Reference Audit Package",
    controlId: trace.control.code,
    controlTitle: trace.control.title,
    controlObjective: trace.control.description,
    testExpectation: trace.control.governanceStory?.validationNarrative ?? `Auditor verifies that ${trace.control.title.toLowerCase()} is implemented, evidenced, and traceable.`,
    controlOwner: trace.systems[0]?.riskOwner ?? trace.systems[0]?.businessOwner ?? "Control Owner",
    systemsInScope: trace.systems.map((system) => system.name),
    requiredEvidence,
    availableEvidence,
    missingEvidence,
    evidenceSufficiency: sufficiency,
    assuranceJudgment: assuranceJudgment(trace.assuranceScore, sufficiency),
    assuranceScore: trace.assuranceScore,
    exceptions,
    packageStatus,
    reviewerStatus: packageStatus === "Ready for Package" ? "Reviewer can add proof to package" : "Reviewer action required",
    openBlockers: [
      ...missingEvidence.map((item) => `${item.label} missing`),
      ...warningEvidence.slice(0, 2).map((item) => `${item.title} needs validation review`)
    ],
    proofStatus: packageStatus === "Ready for Package" ? "Ready" : packageStatus === "Blocked" ? "Blocked" : "Needs Review",
    primaryAction: primaryActionFor({ missingEvidence, warningEvidence, sufficiency, packageStatus }),
    auditTrail: [
      `Scope loaded from ${auditPackage?.packageId ?? "reference package"}`,
      `${availableEvidence.length} available artifact(s) linked`,
      `${missingEvidence.length} required evidence gap(s) identified`,
      `Assurance score calculated at ${trace.assuranceScore}%`
    ]
  };
}

function repositoryArtifactProof(controlId: string, artifactType: string, artifactName: string) {
  if (controlId === "AI-GOV-006" && artifactType === "POLICY") {
    return `${artifactName} proves approved and denied Travel Brain tool boundaries are declared in GitHub policy evidence.`;
  }
  if (controlId === "AI-GOV-006" && artifactType === "PROMPT") {
    return `${artifactName} supports prohibited-action boundaries for Travel Brain user-facing behavior.`;
  }
  if (controlId === "AI-GOV-003" && artifactType === "PROMPT") {
    return `${artifactName} proves a prompt artifact exists with versioned repository evidence.`;
  }
  return `Supports ${controlId} through ${artifactType.toLowerCase()} evidence.`;
}

function requirement(label: string, category: string, present: boolean): ProofRequirement {
  return { id: `${category}-${label}`, label, category, status: present ? "Available" : "Missing" };
}

function isPresent(label: string, presentLabels: string[]) {
  return presentLabels.some((present) => present === label);
}

function assuranceJudgment(score: number, sufficiency: string) {
  if (sufficiency === "Insufficient") return "Insufficient for audit";
  if (sufficiency === "Needs Review") return "Partially sufficient pending review";
  if (score >= 80) return "Sufficient for audit package";
  return "Evidence mapped but assurance is not final";
}

function primaryActionFor({
  missingEvidence,
  warningEvidence,
  sufficiency,
  packageStatus
}: {
  missingEvidence: ProofRequirement[];
  warningEvidence: ProofArtifact[];
  sufficiency: string;
  packageStatus: string;
}) {
  if (missingEvidence.length > 0) return "Request Evidence";
  if (warningEvidence.length > 0) return "Verify Artifact";
  if (sufficiency === "Insufficient") return "Raise Exception";
  if (packageStatus === "Ready for Package") return "Add to Audit Package";
  return "Mark Control Ready";
}

function connectorFromArtifactType(type: string) {
  if (type.includes("PROMPT") || type.includes("POLICY") || type.includes("MANIFEST")) return "GitHub";
  if (type.includes("LOG") || type.includes("RUNTIME")) return "Logs";
  return "Evidence Repository";
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(value);
}
