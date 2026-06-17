import Link from "next/link";
import { getGovernanceOperationsDashboard } from "../../data";
import { Section, StatusBadge } from "../../components/ui";
import { ArtifactWorkflowLinks, FactTile, artifactAssuranceScore, artifactAssuranceStatus } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceArtifactsPage() {
  const data = await getGovernanceOperationsDashboard();
  const supportedControls = new Set(data.assuranceRules.map((rule) => rule.controlId));

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4">
        <FactTile label="Artifacts" value={data.artifacts.length} />
        <FactTile label="Controls Supported" value={supportedControls.size} />
        <FactTile label="Snapshots" value={data.artifacts.reduce((sum, artifact) => sum + artifact.snapshots.length, 0)} />
        <FactTile label="Warnings" value={data.assuranceRules.filter((rule) => rule.status !== "PASS").length} status={data.assuranceRules.some((rule) => rule.status !== "PASS") ? "WARNING" : "PASS"} />
      </div>

      <Section title="Artifact workflow">
        <div className="grid gap-3 md:grid-cols-2">
          {data.artifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/evidence-artifacts/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.name}</Link>
                  <p className="mt-1 text-xs text-slate-500">{artifact.aiSystem.name} · {artifact.path} · {artifact.version}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Assurance {artifactAssuranceScore(artifact.assuranceRules)}% · Commit {artifact.commitSha.slice(0, 12)} · Hash {artifact.artifactHash.slice(0, 12)}</p>
                </div>
                <StatusBadge status={artifactAssuranceStatus(artifact.assuranceRules)} />
              </div>
              <div className="mt-4">
                <ArtifactWorkflowLinks artifactId={artifact.artifactId} sourceUrl={artifact.sourceUrl} />
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
