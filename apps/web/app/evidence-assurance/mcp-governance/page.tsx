import Link from "next/link";
import { AlertTriangle, Network } from "lucide-react";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { LearningPanel, Section, StatusBadge } from "../../components/ui";
import { FactTile, McpEvidenceLinks, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceMcpGovernancePage() {
  const data = await getGovernanceOperationsDashboard();
  const connectionWarnings = data.mcpConnections.filter((connection) => connection.status !== "CONNECTED");
  const reviewEvidence = data.mcpEvidenceArtifacts.filter((artifact) => artifact.validationStatus !== "VALID");
  const hasMcpEvidence = data.mcpEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4 xl:grid-cols-6">
        <FactTile label="MCP Connections" value={data.mcpConnections.length} />
        <FactTile label="Connected" value={`${data.kpis.connectedMcpConnections}/${data.kpis.mcpConnections}`} status={connectionWarnings.length ? "WARNING" : "PASS"} />
        <FactTile label="MCP Evidence" value={data.mcpEvidenceArtifacts.length} />
        <FactTile label="Validated Evidence" value={`${data.kpis.validMcpEvidence}/${data.kpis.mcpEvidence}`} status={reviewEvidence.length ? "WARNING" : "PASS"} />
        <FactTile label="Tool Registries" value={data.mcpEvidenceArtifacts.filter((artifact) => artifact.evidenceType === "TOOL_REGISTRY").length} />
        <FactTile label="Authority Records" value={data.mcpEvidenceArtifacts.filter((artifact) => artifact.evidenceType === "AUTHORITY_REGISTRY").length} />
      </div>

      <Section title="MCP governance workflow">
        <div className="grid gap-3 md:grid-cols-4">
          <WorkflowCard href="/evidence-assurance/mcp-governance#mcp-connections" kicker="Source" title="Confirm MCP source" detail="Review the Travel Brain MCP server source and collection boundary." />
          <WorkflowCard href="/evidence-assurance/mcp-governance#mcp-evidence" kicker="Evidence" title="Inspect MCP evidence" detail="Open tool registry, permissions, authority, and capability inventory artifacts." />
          <WorkflowCard href="/controls/AI-GOV-006" kicker="Control" title="Trace tool permissions" detail="Start from the control and follow MCP permission evidence." />
          <WorkflowCard href="/controls/AI-AGENT-001" kicker="Agentic" title="Trace actual capability" detail="Review the actual MCP capability boundary for agentic governance." />
        </div>
      </Section>

      <Section title="MCP assurance">
        <div className="grid gap-4 md:grid-cols-2">
          {data.mcpAssuranceRows.map((row) => (
            <article key={row.system.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/systems/${row.system.slug}`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
                  <p className="mt-1 text-xs text-slate-500">{row.connections.length} MCP connection(s) · {row.mcpArtifacts.length} MCP evidence item(s)</p>
                </div>
                <StatusBadge status={row.assuranceScore >= 80 ? "PASS" : "WARNING"} />
              </div>
              <div className="mt-4 text-3xl font-semibold text-ink">{row.assuranceScore}%</div>
              <div className="mt-4 grid gap-2">
                {row.checks.map((check) => (
                  <div key={check.label} className="flex items-center justify-between gap-3 rounded border border-line bg-panel px-3 py-2 text-sm">
                    <span className="text-slate-700">{check.label}</span>
                    <StatusBadge status={check.status} />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="MCP connection health">
        <div id="mcp-connections" className="grid gap-3">
          {data.mcpConnections.map((connection) => (
            <article key={connection.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Network className="h-4 w-4 text-brand" />
                    {connection.connectionId} · {connection.aiSystem.name}
                  </div>
                  <p className="mt-1 break-all text-xs text-slate-500">{connection.serverName} · {connection.endpoint}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{connection.sourceGap}</p>
                  <p className="mt-1 text-xs text-slate-500">Last scan {connection.lastScan ? formatDate(connection.lastScan) : "not scanned"}</p>
                </div>
                <StatusBadge status={connection.status} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="MCP evidence artifacts">
        <div id="mcp-evidence" className="grid gap-3 md:grid-cols-2">
          {data.mcpEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/mcp-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                  <p className="mt-1 text-xs text-slate-500">{humanize(artifact.evidenceType)} · {artifact.mcpConnection.serverName}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">Hash {artifact.hash}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                <FactLine label="Collection" value={formatDate(artifact.collectionTimestamp)} />
                <FactLine label="Source" value={artifact.source} />
              </div>
              <div className="mt-4">
                <McpEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={hasMcpEvidence ? "MCP evidence boundary" : "Instrumentation gap"}>
        <div className="grid gap-4 lg:grid-cols-2">
          <LearningPanel title="What MCP should prove">
            MCP should prove actual agent capability: which servers and tools exist, what permissions are declared, what authority each tool carries, and which controls depend on that capability surface.
          </LearningPanel>
          <LearningPanel title={hasMcpEvidence ? "What is collected now" : "What is missing now"}>
            {hasMcpEvidence
              ? "Travel Brain has MCP metadata evidence collected from the real MCP implementation and policy files. The platform stores server, tool, permission, authority, and capability metadata only; prompts, tool inputs, tool outputs, secrets, credentials, and customer content are excluded."
              : "Travel Brain has a declared MCP asset, but no usable MCP metadata source is available. The current evidence is an inspectable gap record, not a claim that MCP authority has been collected."}
          </LearningPanel>
        </div>
      </Section>

      {reviewEvidence.length ? (
        <Section title="Review issues">
          <div className="grid gap-3">
            {reviewEvidence.map((artifact) => (
              <article key={artifact.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      {artifact.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.failureCondition}</p>
                    <p className="mt-1 text-xs text-slate-500">{artifact.sourceGap}</p>
                  </div>
                  <StatusBadge status={artifact.validationStatus} />
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-line bg-panel px-3 py-2">
      <span>{label}</span>
      <span className="break-all font-semibold text-ink">{value}</span>
    </div>
  );
}
