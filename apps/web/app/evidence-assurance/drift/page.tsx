import Link from "next/link";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { Section, StatusBadge } from "../../components/ui";
import { FactTile } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceDriftPage() {
  const data = await getGovernanceOperationsDashboard();
  const driftByArtifact = new Map(data.driftEvents.map((event) => [event.artifactId, event]));

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4">
        <FactTile label="Drift Events" value={data.driftEvents.length + data.deploymentDriftEvents.length} />
        <FactTile label="Artifacts" value={data.artifacts.length + data.deploymentEvidenceArtifacts.length} />
        <FactTile label="Baselines" value={data.driftEvents.filter((event) => event.previousHash === "baseline-pending").length} status="COLLECTED" />
        <FactTile label="Drift Reviews" value={data.artifacts.length + data.deploymentEvidenceArtifacts.length} />
      </div>

      <Section title="Drift review queue">
        <div className="grid gap-3">
          {data.artifacts.map((artifact) => {
            const event = driftByArtifact.get(artifact.artifactId);
            return (
              <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Link href={`/evidence-artifacts/${artifact.artifactId}/drift`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.name}</Link>
                    <p className="mt-1 text-xs text-slate-500">{artifact.aiSystem.name} · {artifact.path}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {event ? `${humanize(event.eventType)} · ${event.summary}` : "No drift event recorded."}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{event ? `Detected ${formatDate(event.detectedAt)} · Hash ${event.currentHash.slice(0, 12)}` : `Artifact hash ${artifact.artifactHash.slice(0, 12)}`}</p>
                  </div>
                  <StatusBadge status={event?.previousHash === "baseline-pending" ? "COLLECTED" : event ? "WARNING" : "MISSING"} />
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section title="Deployment drift review queue">
        <div className="grid gap-3">
          {data.deploymentDriftEvents.map((event) => {
            const artifact = data.deploymentEvidenceArtifacts.find((item) => item.id === event.deploymentEvidenceArtifactId);
            return (
              <article key={event.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Link href={`/deployment-evidence/${artifact?.artifactId ?? "DEP-TB-PORT-GAP-001"}`} className="text-sm font-semibold text-ink hover:text-brand">{humanize(event.eventType)}</Link>
                    <p className="mt-1 text-xs text-slate-500">{event.aiSystem.name} · Detected {formatDate(event.detectedAt)}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{event.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">Previous: {event.previousValue} · Current: {event.currentValue}</p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </>
  );
}
