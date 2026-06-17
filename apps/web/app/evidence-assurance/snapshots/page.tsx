import Link from "next/link";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate } from "../../components/format";
import { Section, StatusBadge } from "../../components/ui";
import { ArtifactWorkflowLinks, FactTile } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceSnapshotsPage() {
  const data = await getGovernanceOperationsDashboard();
  const snapshots = data.artifacts.flatMap((artifact) => artifact.snapshots.map((snapshot) => ({ ...snapshot, artifact })));
  const complete = data.artifacts.length > 0 && snapshots.length === data.artifacts.length;

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4">
        <FactTile label="Snapshots" value={snapshots.length} />
        <FactTile label="Artifacts" value={data.artifacts.length} />
        <FactTile label="Coverage" value={`${Math.round((snapshots.length / Math.max(data.artifacts.length, 1)) * 100)}%`} status={complete ? "PASS" : "WARNING"} />
        <FactTile label="Hash Matches" value={snapshots.filter((snapshot) => snapshot.artifactHash === snapshot.artifact.artifactHash).length} />
      </div>

      <Section title="Snapshot workflow">
        <div className="grid gap-3">
          {snapshots.map((snapshot) => (
            <article key={snapshot.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/evidence-artifacts/${snapshot.artifact.artifactId}#evidence-snapshot`} className="text-sm font-semibold text-ink hover:text-brand">{snapshot.snapshotId}</Link>
                  <p className="mt-1 text-xs text-slate-500">{snapshot.artifact.name} · {snapshot.artifact.path}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Version {snapshot.version} · Commit {snapshot.commitSha.slice(0, 12)} · Hash {snapshot.artifactHash.slice(0, 12)} · Collected {formatDate(snapshot.collectedAt)}</p>
                </div>
                <StatusBadge status={snapshot.artifactHash === snapshot.artifact.artifactHash ? "PASS" : "WARNING"} />
              </div>
              <div className="mt-4">
                <ArtifactWorkflowLinks artifactId={snapshot.artifact.artifactId} sourceUrl={snapshot.sourceUrl} />
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
