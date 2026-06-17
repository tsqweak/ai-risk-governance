import { NextResponse } from "next/server";
import { getEvidenceObject } from "../../../data";
import { formatDate } from "../../../components/format";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ evidenceId: string }> }) {
  const { evidenceId } = await params;
  const evidence = await getEvidenceObject(evidenceId);
  if (!evidence) return new NextResponse("Evidence not found", { status: 404 });

  const format = new URL(request.url).searchParams.get("format") ?? "json";
  const filename = `${evidence.evidenceId}.${extension(format)}`;
  const body = renderEvidence(evidence, format);

  return new NextResponse(body, {
    headers: {
      "content-type": contentType(format),
      "content-disposition": `attachment; filename="${filename}"`
    }
  });
}

function renderEvidence(evidence: NonNullable<Awaited<ReturnType<typeof getEvidenceObject>>>, format: string) {
  const payload = {
    evidenceId: evidence.evidenceId,
    title: evidence.title,
    type: evidence.evidenceType,
    owner: evidence.owner,
    reviewer: evidence.reviewer,
    status: evidence.status,
    version: evidence.version,
    source: evidence.source,
    approvalDate: formatDate(evidence.approvalDate),
    expirationDate: formatDate(evidence.expirationDate),
    aiSystem: evidence.aiSystem.name,
    controls: evidence.requirementLinks.map((link) => link.evidenceRequirement.controlId),
    regulations: evidence.requirementLinks.map((link) => link.evidenceRequirement.regulatoryControl?.regulation.name).filter(Boolean),
    risks: evidence.aiRiskLinks.map((link) => link.aiRisk.title),
    packages: evidence.auditPackageLinks.map((link) => link.auditPackage.title)
  };

  if (format === "markdown") {
    return [
      `# ${payload.title}`,
      "",
      `- Evidence ID: ${payload.evidenceId}`,
      `- Type: ${payload.type}`,
      `- AI System: ${payload.aiSystem}`,
      `- Owner: ${payload.owner}`,
      `- Reviewer: ${payload.reviewer}`,
      `- Status: ${payload.status}`,
      `- Version: ${payload.version}`,
      `- Source: ${payload.source}`,
      `- Approval Date: ${payload.approvalDate}`,
      `- Expiration Date: ${payload.expirationDate}`,
      "",
      "## Traceability",
      "",
      `- Controls: ${payload.controls.join(", ") || "Unmapped"}`,
      `- Regulations: ${payload.regulations.join(", ") || "Unmapped"}`,
      `- Risks: ${payload.risks.join(", ") || "None linked"}`,
      `- Audit Packages: ${payload.packages.join(", ") || "None linked"}`,
      "",
      "## Description",
      "",
      evidence.description
    ].join("\n");
  }

  if (format === "text") {
    return [
      `${payload.evidenceId} - ${payload.title}`,
      `Type: ${payload.type}`,
      `AI System: ${payload.aiSystem}`,
      `Owner: ${payload.owner}`,
      `Reviewer: ${payload.reviewer}`,
      `Status: ${payload.status}`,
      `Source: ${payload.source}`,
      `Controls: ${payload.controls.join(", ") || "Unmapped"}`,
      `Regulations: ${payload.regulations.join(", ") || "Unmapped"}`,
      `Risks: ${payload.risks.join(", ") || "None linked"}`,
      "",
      evidence.description
    ].join("\n");
  }

  return JSON.stringify({ ...payload, description: evidence.description }, null, 2);
}

function contentType(format: string) {
  if (format === "markdown") return "text/markdown; charset=utf-8";
  if (format === "text") return "text/plain; charset=utf-8";
  return "application/json; charset=utf-8";
}

function extension(format: string) {
  if (format === "markdown") return "md";
  if (format === "text") return "txt";
  return "json";
}
