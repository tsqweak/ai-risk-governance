import Link from "next/link";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { Section, StatusBadge } from "../../components/ui";
import { DeploymentEvidenceLinks, FactTile, McpEvidenceLinks, NotionEvidenceLinks, RuntimeEvidenceLinks, SecretEvidenceLinks, SupabaseEvidenceLinks } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceSourcesPage() {
  const data = await getGovernanceOperationsDashboard();

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4">
        <FactTile label="Evidence Sources" value={data.evidenceSources.length} />
        <FactTile label="Validated" value={data.kpis.validatedSources} status="PASS" />
        <FactTile label="Current" value={data.kpis.currentSources} status="CURRENT" />
        <FactTile label="Assets" value={data.assets.length} />
      </div>

      <Section title="Evidence source registry">
        <div className="grid gap-3">
          {data.evidenceSources.map((source) => (
            <article id={`source-${source.sourceId}`} key={source.id} className="scroll-mt-32 rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{source.sourceId} · {humanize(source.sourceType)}</div>
                  <p className="mt-1 text-xs text-slate-500">{source.aiSystem.name} · {source.asset.name} · {source.evidenceLocation}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{source.governanceValue}</p>
                  <p className="mt-1 text-xs text-slate-500">Collected {source.lastCollectedAt ? formatDate(source.lastCollectedAt) : "not collected"} · Validated {source.lastValidatedAt ? formatDate(source.lastValidatedAt) : "not validated"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={source.collectionStatus} />
                  <StatusBadge status={source.freshnessStatus} />
                  <StatusBadge status={source.connectorHealth} />
                </div>
              </div>
              {source.artifacts.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {source.artifacts.map((artifact) => (
                    <Link key={artifact.id} href={`/evidence-artifacts/${artifact.artifactId}`} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
                      {artifact.name}
                    </Link>
                  ))}
                </div>
              ) : null}
              {source.deploymentArtifacts.length > 0 ? (
                <div className="mt-4 rounded border border-line bg-panel p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deployment evidence</div>
                  <div className="mt-3 grid gap-2">
                    {source.deploymentArtifacts.map((artifact) => (
                      <DeploymentEvidenceLinks key={artifact.id} artifactId={artifact.artifactId} />
                    ))}
                  </div>
                </div>
              ) : null}
              {source.supabaseArtifacts.length > 0 ? (
                <div className="mt-4 rounded border border-line bg-panel p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supabase evidence</div>
                  <div className="mt-3 grid gap-2">
                    {source.supabaseArtifacts.map((artifact) => (
                      <SupabaseEvidenceLinks key={artifact.id} artifactId={artifact.artifactId} />
                    ))}
                  </div>
                </div>
              ) : null}
              {source.mcpArtifacts.length > 0 ? (
                <div className="mt-4 rounded border border-line bg-panel p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">MCP evidence</div>
                  <div className="mt-3 grid gap-2">
                    {source.mcpArtifacts.map((artifact) => (
                      <McpEvidenceLinks key={artifact.id} artifactId={artifact.artifactId} />
                    ))}
                  </div>
                </div>
              ) : null}
              {source.notionArtifacts.length > 0 ? (
                <div className="mt-4 rounded border border-line bg-panel p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notion governance evidence</div>
                  <div className="mt-3 grid gap-2">
                    {source.notionArtifacts.map((artifact) => (
                      <NotionEvidenceLinks key={artifact.id} artifactId={artifact.artifactId} />
                    ))}
                  </div>
                </div>
              ) : null}
              {source.secretArtifacts.length > 0 ? (
                <div className="mt-4 rounded border border-line bg-panel p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secrets governance evidence</div>
                  <div className="mt-3 grid gap-2">
                    {source.secretArtifacts.map((artifact) => (
                      <SecretEvidenceLinks key={artifact.id} artifactId={artifact.artifactId} />
                    ))}
                  </div>
                </div>
              ) : null}
              {data.logSources.filter((logSource) => logSource.evidenceSource?.id === source.id).map((logSource) => (
                <div key={logSource.id} className="mt-4 rounded border border-line bg-panel p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Runtime source</div>
                      <div className="mt-1 text-sm font-semibold text-ink">{logSource.logSourceId} · {humanize(logSource.type)}</div>
                      <p className="mt-1 text-xs text-slate-500">{logSource.runtimeArtifacts.length} runtime evidence item(s)</p>
                    </div>
                    <StatusBadge status={logSource.status} />
                  </div>
                  <div className="mt-3 grid gap-2">
                    {logSource.runtimeArtifacts.map((artifact) => (
                      <RuntimeEvidenceLinks key={artifact.id} artifactId={artifact.artifactId} />
                    ))}
                  </div>
                </div>
              ))}
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
