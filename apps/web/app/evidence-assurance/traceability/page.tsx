import Link from "next/link";
import { getGovernanceOperationsDashboard } from "../../data";
import { Section, StatusBadge } from "../../components/ui";
import { ArtifactWorkflowLinks, DeploymentEvidenceLinks, FactTile, McpEvidenceLinks, NotionEvidenceLinks, RuntimeEvidenceLinks, SecretEvidenceLinks, SupabaseEvidenceLinks, WorkflowCard, artifactAssuranceStatus } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceTraceabilityPage() {
  const data = await getGovernanceOperationsDashboard();
  const deploymentControlIds = data.deploymentEvidenceArtifacts.flatMap((artifact) => parseRelatedControls(artifact.relatedControlsJson));
  const supabaseControlIds = data.supabaseEvidenceArtifacts.flatMap((artifact) => parseRelatedControls(artifact.relatedControlsJson));
  const mcpControlIds = data.mcpEvidenceArtifacts.flatMap((artifact) => parseRelatedControls(artifact.relatedControlsJson));
  const notionControlIds = data.notionEvidenceArtifacts.flatMap((artifact) => parseRelatedControls(artifact.relatedControlsJson));
  const secretControlIds = data.secretEvidenceArtifacts.flatMap((artifact) => parseRelatedControls(artifact.relatedControlsJson));
  const controlIds = [...new Set([...data.assuranceRules.map((rule) => rule.controlId), ...data.runtimeEvidenceArtifacts.map((artifact) => artifact.relatedControlId), ...deploymentControlIds, ...supabaseControlIds, ...mcpControlIds, ...notionControlIds, ...secretControlIds])].sort();

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4">
        <FactTile label="Traceable Controls" value={data.kpis.traceableControls} />
        <FactTile label="Control Coverage" value={`${data.kpis.controlCoverage}%`} />
        <FactTile label="Evidence Coverage" value={`${data.kpis.evidenceCoverage}%`} />
        <FactTile label="Missing Evidence" value={data.kpis.missingEvidence} status={data.kpis.missingEvidence ? "WARNING" : "PASS"} />
      </div>

      <Section title="Traceability workflow">
        <div className="grid gap-3 md:grid-cols-3">
          <WorkflowCard href="/traceability" kicker="Audit" title="Regulation-led traceability" detail="Open detailed regulation, requirement, control, evidence, and finding traceability." />
          <WorkflowCard href="/evidence-assurance/assurance" kicker="Assurance" title="Control-led traceability" detail="Start from assurance rules and move into the supporting artifacts." />
          <WorkflowCard href="/evidence-assurance/artifacts" kicker="Evidence" title="Evidence-led traceability" detail="Start from artifacts and inspect snapshots, drift, and supported controls." />
        </div>
      </Section>

      <Section title="Control to evidence coverage">
        <div className="grid gap-3">
          {controlIds.map((controlId) => {
            const rules = data.assuranceRules.filter((rule) => rule.controlId === controlId);
            const artifacts = [...new Map(rules.map((rule) => [rule.artifact.artifactId, rule.artifact])).values()];
            const runtimeArtifacts = data.runtimeEvidenceArtifacts.filter((artifact) => artifact.relatedControlId === controlId);
            const deploymentArtifacts = data.deploymentEvidenceArtifacts.filter((artifact) => parseRelatedControls(artifact.relatedControlsJson).includes(controlId));
            const supabaseArtifacts = data.supabaseEvidenceArtifacts.filter((artifact) => parseRelatedControls(artifact.relatedControlsJson).includes(controlId));
            const mcpArtifacts = data.mcpEvidenceArtifacts.filter((artifact) => parseRelatedControls(artifact.relatedControlsJson).includes(controlId));
            const notionArtifacts = data.notionEvidenceArtifacts.filter((artifact) => parseRelatedControls(artifact.relatedControlsJson).includes(controlId));
            const secretArtifacts = data.secretEvidenceArtifacts.filter((artifact) => parseRelatedControls(artifact.relatedControlsJson).includes(controlId));
            return (
              <article key={controlId} className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Link href={`/controls/${controlId}`} className="text-sm font-semibold text-ink hover:text-brand">{controlId}</Link>
                    <p className="mt-1 text-xs text-slate-500">{rules.length} validation check(s) · {artifacts.length} artifact(s) · {runtimeArtifacts.length} runtime item(s) · {deploymentArtifacts.length} deployment item(s) · {supabaseArtifacts.length} data item(s) · {mcpArtifacts.length} MCP item(s) · {notionArtifacts.length} governance item(s) · {secretArtifacts.length} secrets item(s)</p>
                  </div>
                  <StatusBadge status={rules.some((rule) => rule.status !== "PASS") || deploymentArtifacts.some((artifact) => artifact.validationStatus !== "VALID") || supabaseArtifacts.some((artifact) => artifact.validationStatus !== "VALID") || mcpArtifacts.some((artifact) => artifact.validationStatus !== "VALID") || notionArtifacts.some((artifact) => artifact.validationStatus !== "VALID") || secretArtifacts.some((artifact) => artifact.validationStatus !== "VALID") ? "WARNING" : artifacts.length || runtimeArtifacts.length || deploymentArtifacts.length || supabaseArtifacts.length || mcpArtifacts.length || notionArtifacts.length || secretArtifacts.length ? "PASS" : "MISSING"} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {artifacts.map((artifact) => (
                    <div key={artifact.id} className="rounded border border-line bg-panel p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/evidence-artifacts/${artifact.artifactId}`} className="text-xs font-semibold text-ink hover:text-brand">{artifact.name}</Link>
                          <p className="mt-1 text-xs text-slate-500">{artifact.path}</p>
                        </div>
                        <StatusBadge status={artifactAssuranceStatus(artifact.assuranceRules)} />
                      </div>
                      <div className="mt-3">
                        <ArtifactWorkflowLinks artifactId={artifact.artifactId} sourceUrl={artifact.sourceUrl} />
                      </div>
                    </div>
                  ))}
                  {runtimeArtifacts.map((artifact) => (
                    <div key={artifact.id} className="rounded border border-line bg-panel p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/runtime-evidence/${artifact.artifactId}`} className="text-xs font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                          <p className="mt-1 text-xs text-slate-500">{artifact.eventType} · {artifact.correlationId}</p>
                        </div>
                        <StatusBadge status={artifact.validationStatus} />
                      </div>
                      <div className="mt-3">
                        <RuntimeEvidenceLinks artifactId={artifact.artifactId} />
                      </div>
                    </div>
                  ))}
                  {deploymentArtifacts.map((artifact) => (
                    <div key={artifact.id} className="rounded border border-line bg-panel p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/deployment-evidence/${artifact.artifactId}`} className="text-xs font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                          <p className="mt-1 text-xs text-slate-500">{artifact.containerName} · {artifact.imageName}:{artifact.imageTag}</p>
                        </div>
                        <StatusBadge status={artifact.validationStatus} />
                      </div>
                      <div className="mt-3">
                        <DeploymentEvidenceLinks artifactId={artifact.artifactId} />
                      </div>
                    </div>
                  ))}
                  {supabaseArtifacts.map((artifact) => (
                    <div key={artifact.id} className="rounded border border-line bg-panel p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/supabase-evidence/${artifact.artifactId}`} className="text-xs font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                          <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {artifact.supabaseConnection.projectId}</p>
                        </div>
                        <StatusBadge status={artifact.validationStatus} />
                      </div>
                      <div className="mt-3">
                        <SupabaseEvidenceLinks artifactId={artifact.artifactId} />
                      </div>
                    </div>
                  ))}
                  {mcpArtifacts.map((artifact) => (
                    <div key={artifact.id} className="rounded border border-line bg-panel p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/mcp-evidence/${artifact.artifactId}`} className="text-xs font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                          <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {artifact.mcpConnection.serverName}</p>
                        </div>
                        <StatusBadge status={artifact.validationStatus} />
                      </div>
                      <div className="mt-3">
                        <McpEvidenceLinks artifactId={artifact.artifactId} />
                      </div>
                    </div>
                  ))}
                  {notionArtifacts.map((artifact) => (
                    <div key={artifact.id} className="rounded border border-line bg-panel p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/notion-evidence/${artifact.artifactId}`} className="text-xs font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                          <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {artifact.notionConnection.workspaceName}</p>
                        </div>
                        <StatusBadge status={artifact.validationStatus} />
                      </div>
                      <div className="mt-3">
                        <NotionEvidenceLinks artifactId={artifact.artifactId} />
                      </div>
                    </div>
                  ))}
                  {secretArtifacts.map((artifact) => (
                    <div key={artifact.id} className="rounded border border-line bg-panel p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/secret-evidence/${artifact.artifactId}`} className="text-xs font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                          <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {artifact.secretsConnection.sourceSystem}</p>
                        </div>
                        <StatusBadge status={artifact.validationStatus} />
                      </div>
                      <div className="mt-3">
                        <SecretEvidenceLinks artifactId={artifact.artifactId} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </>
  );
}

function parseRelatedControls(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
