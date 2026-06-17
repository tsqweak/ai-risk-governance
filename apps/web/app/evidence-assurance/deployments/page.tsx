import Link from "next/link";
import { AlertTriangle, Server } from "lucide-react";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { LearningPanel, Section, StatusBadge } from "../../components/ui";
import { DeploymentEvidenceLinks, FactTile, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceDeploymentsPage() {
  const data = await getGovernanceOperationsDashboard();
  const connectionWarnings = data.portainerConnections.filter((connection) => connection.status !== "CONNECTED");
  const missingDeploymentEvidence = data.deploymentEvidenceArtifacts.filter((artifact) => artifact.validationStatus !== "VALID");
  const hasPortainerEvidence = data.deploymentEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4 xl:grid-cols-6">
        <FactTile label="Portainer Connections" value={data.portainerConnections.length} />
        <FactTile label="Connected" value={`${data.kpis.connectedPortainerConnections}/${data.kpis.portainerConnections}`} status={connectionWarnings.length ? "WARNING" : "PASS"} />
        <FactTile label="Deployment Evidence" value={data.deploymentEvidenceArtifacts.length} />
        <FactTile label="Validated Evidence" value={`${data.kpis.validDeploymentEvidence}/${data.kpis.deploymentEvidence}`} status={missingDeploymentEvidence.length ? "WARNING" : "PASS"} />
        <FactTile label="Deployment Drift" value={data.kpis.deploymentDrift} status={data.deploymentDriftEvents.some((event) => event.status !== "PASS") ? "WARNING" : "PASS"} />
        <FactTile label="Runtime Health" value={missingDeploymentEvidence.length ? "Gap" : "Current"} status={missingDeploymentEvidence.length ? "WARNING" : "PASS"} />
      </div>

      <Section title="Deployment evidence workflow">
        <div className="grid gap-3 md:grid-cols-4">
          <WorkflowCard href="/evidence-assurance/deployments#portainer-connections" kicker="Source" title="Confirm Portainer source" detail="Review whether a read-only endpoint or export is available for deployed-state evidence." />
          <WorkflowCard href="/evidence-assurance/deployments#deployment-evidence" kicker="Evidence" title="Inspect deployment evidence" detail="Open container name, image version, deployment time, safe runtime configuration, hash, and provenance." />
          <WorkflowCard href="/evidence-assurance/deployments#deployment-drift" kicker="Drift" title="Review runtime drift" detail="Check image, container, logging, health, or source-availability drift without creating findings yet." />
          <WorkflowCard href="/controls/AI-LC-006" kicker="Control" title="Trace to production approval" detail="Start from production approval and follow the deployment evidence gap." />
        </div>
      </Section>

      <Section title="Deployment assurance">
        <div className="grid gap-4 md:grid-cols-2">
          {data.deploymentAssuranceRows.map((row) => (
            <article key={row.system.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/systems/${row.system.slug}`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
                  <p className="mt-1 text-xs text-slate-500">{row.connections.length} Portainer connection(s) · {row.deploymentArtifacts.length} deployment evidence item(s)</p>
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

      <Section title="Portainer connection health">
        <div id="portainer-connections" className="grid gap-3">
          {data.portainerConnections.map((connection) => (
            <article key={connection.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Server className="h-4 w-4 text-brand" />
                    {connection.connectionId} · {connection.aiSystem.name}
                  </div>
                  <p className="mt-1 break-all text-xs text-slate-500">{connection.environment} · {connection.endpoint}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{connection.sourceGap}</p>
                  <p className="mt-1 text-xs text-slate-500">Last scan {connection.lastScan ? formatDate(connection.lastScan) : "not scanned"}</p>
                </div>
                <StatusBadge status={connection.status} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Deployment evidence artifacts">
        <div id="deployment-evidence" className="grid gap-3 md:grid-cols-2">
          {data.deploymentEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/deployment-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                  <p className="mt-1 text-xs text-slate-500">{artifact.containerName} · {artifact.imageName}:{artifact.imageTag}</p>
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
                <FactLine label="Deployment Time" value={artifact.deploymentTimestamp ? formatDate(artifact.deploymentTimestamp) : "Not collected"} />
                <FactLine label="Collection" value={formatDate(artifact.collectionTimestamp)} />
                <FactLine label="Health" value={artifact.healthStatus} />
                <FactLine label="Logging" value={artifact.loggingEnabled === null ? "Not collected" : artifact.loggingEnabled ? "Enabled" : "Disabled"} />
              </div>
              <div className="mt-4">
                <DeploymentEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Deployment drift">
        <div id="deployment-drift" className="grid gap-3">
          {data.deploymentDriftEvents.map((event) => (
            <article key={event.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    {humanize(event.eventType)}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{event.summary}</p>
                  <p className="mt-1 text-xs text-slate-500">Previous: {event.previousValue} · Current: {event.currentValue} · Detected {formatDate(event.detectedAt)}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={hasPortainerEvidence ? "Deployment evidence boundary" : "Instrumentation gap"}>
        <div className="grid gap-4 lg:grid-cols-2">
          <LearningPanel title="What Portainer should prove">
            Portainer should prove deployed-state reality: what container is running, which image version is active, when it was deployed, whether logging is enabled, whether the service is healthy, and whether runtime state drifted from the governed baseline.
          </LearningPanel>
          <LearningPanel title={hasPortainerEvidence ? "What is collected now" : "What is missing now"}>
            {hasPortainerEvidence
              ? "Travel Brain has real Portainer deployment evidence collected from read-only API access. The platform stores safe deployed-state metadata and excludes command payloads, environment variable values, secrets, tokens, credentials, mount details, customer content, and sensitive payloads."
              : "Travel Brain has a declared Portainer asset, but no usable read-only Portainer endpoint or export is available to this platform. The current evidence is an inspectable gap record, not a claim that deployed-state evidence has been collected."}
          </LearningPanel>
        </div>
      </Section>
    </>
  );
}

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-line bg-panel px-3 py-2">
      <span>{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
