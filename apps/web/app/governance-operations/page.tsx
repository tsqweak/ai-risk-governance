import Link from "next/link";
import { Activity, BookOpen, CheckCircle2, ClipboardCheck, Database, FileSearch, Gauge, GitBranch, ListChecks, Network, Radar, ShieldCheck } from "lucide-react";
import { getGovernanceOperationsDashboard } from "../data";
import { formatDate, humanize } from "../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../components/ui";
import { DeploymentEvidenceLinks, McpEvidenceLinks, NotionEvidenceLinks, RuntimeEvidenceLinks, SupabaseEvidenceLinks } from "../evidence-assurance/components";

export const dynamic = "force-dynamic";

export default async function GovernanceOperationsPage() {
  const data = await getGovernanceOperationsDashboard();
  const hasPortainerEvidence = data.deploymentEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");
  const hasSupabaseEvidence = data.supabaseEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");
  const hasMcpEvidence = data.mcpEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");
  const hasNotionEvidence = data.notionEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Governance Operations</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Evidence automation assurance</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          Operationalize governance through asset inventory, evidence collection, validation, freshness tracking, deployed-state gaps, and assurance scoring.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4 xl:grid-cols-11">
        <Metric label="Assets" value={data.kpis.assets} icon={Database} />
        <Metric label="Evidence Sources" value={data.kpis.evidenceSources} icon={FileSearch} />
        <Metric label="Artifacts" value={data.kpis.artifacts} icon={ClipboardCheck} />
        <Metric label="Runtime Evidence" value={data.kpis.runtimeEvidence} icon={Activity} />
        <Metric label="Deployment Evidence" value={data.kpis.deploymentEvidence} icon={Radar} />
        <Metric label="Data Evidence" value={data.kpis.supabaseEvidence} icon={Database} />
        <Metric label="MCP Evidence" value={data.kpis.mcpEvidence} icon={Network} />
        <Metric label="Governance Evidence" value={data.kpis.notionEvidence} icon={BookOpen} />
        <Metric label="Rules Passed" value={`${data.kpis.passingAssuranceRules}/${data.kpis.assuranceRules}`} icon={ShieldCheck} />
        <Metric label="Validated" value={data.kpis.validatedSources} icon={CheckCircle2} />
        <Metric label="Assurance" value={`${data.kpis.averageAssurance}%`} icon={Gauge} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LearningPanel title="Read-only connectors">
          {hasPortainerEvidence
            ? `GitHub collects design-intent artifacts, logs collect sanitized runtime evidence, and Portainer collects real deployed-state evidence through read-only connector access.${hasSupabaseEvidence ? " Supabase also collects data-governance metadata." : " Supabase remains connector-ready until read-only database metadata access is configured."}${hasMcpEvidence ? " MCP now collects actual tool and authority metadata." : " MCP remains connector-ready until actual tool metadata is collected."}${hasNotionEvidence ? " Notion collects human governance metadata." : " Notion remains connector-ready until scoped governance workspace access is configured."}`
            : `GitHub collects artifact content from the configured Travel Brain repository when \`GITHUB_TOKEN\` and \`GITHUB_OWNER\` are present. Logs collect sanitized runtime evidence. Portainer remains connector-ready until real deployed-state evidence is collected.${hasSupabaseEvidence ? " Supabase has data-governance metadata evidence." : " Supabase remains connector-ready until read-only database metadata access is configured."}${hasMcpEvidence ? " MCP has actual tool and authority metadata." : " MCP remains connector-ready until actual tool metadata is collected."}${hasNotionEvidence ? " Notion has human governance metadata evidence." : " Notion remains connector-ready until scoped governance workspace access is configured."}`}
        </LearningPanel>
        <LearningPanel title="Evidence freshness">
          Every source tracks last collected, last validated, and freshness status so stale evidence becomes visible before audit or regulatory review.
        </LearningPanel>
        <LearningPanel title="Assurance over status">
          Assurance now checks whether artifacts support controls. Existence proves the file is present; assurance explains whether the file supports governance.
        </LearningPanel>
      </div>

      <Section title="Travel Brain assurance">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.assuranceRows.map((row) => (
            <article key={row.system.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/systems/${row.system.slug}`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
                  <p className="mt-1 text-xs text-slate-500">{row.system.lifecycleStatus} · {row.system.riskOwner}</p>
                </div>
                <Gauge className="h-4 w-4 text-brand" />
              </div>
              <div className="mt-4 text-3xl font-semibold text-ink">{row.assuranceScore}%</div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <ScoreLine label="Coverage" value={row.evidenceCoverage} />
                <ScoreLine label="Freshness" value={row.evidenceFreshness} />
                <ScoreLine label="Validation" value={row.validationHealth} />
                <ScoreLine label="Connector Health" value={row.connectorHealth} />
              </div>
              <div className="mt-4">
                <AssuranceDisclosure
                  label="Score explanation"
                  status={row.assuranceScore >= 80 ? "PASS" : row.assuranceScore >= 60 ? "WARNING" : "FAIL"}
                  reason={`The assurance score averages evidence coverage, evidence freshness, validation health, and connector health for ${row.system.name}.`}
                  evidence={data.artifacts.filter((artifact) => artifact.aiSystem.id === row.system.id).map((artifact) => artifact.name)}
                  artifacts={data.artifacts.filter((artifact) => artifact.aiSystem.id === row.system.id).map((artifact) => artifact.path)}
                  checks={["Evidence coverage", "Evidence freshness", "Validation health", "Connector health"]}
                  controls={[...new Set(data.assuranceRules.filter((rule) => rule.aiSystem.id === row.system.id).map((rule) => rule.controlId))]}
                  missing={data.missingTraceabilityControls}
                  failures={["Evidence source missing", "evidence stale", "validation not performed", "connector health off track", "artifact no longer linked to a control"]}
                  links={data.artifacts.filter((artifact) => artifact.aiSystem.id === row.system.id).flatMap((artifact) => [
                    { label: artifact.name, href: `/evidence-artifacts/${artifact.artifactId}` },
                    { label: `${artifact.name} drift`, href: `/evidence-artifacts/${artifact.artifactId}/drift` }
                  ])}
                />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Runtime evidence">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="grid gap-3">
            {data.runtimeAssuranceRows.map((row) => (
              <article key={row.system.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/systems/${row.system.slug}`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
                    <p className="mt-1 text-xs text-slate-500">{row.sources.length} log source(s) · {row.runtimeArtifacts.length} runtime evidence item(s)</p>
                  </div>
                  <StatusBadge status={row.assuranceScore >= 80 ? "PASS" : "WARNING"} />
                </div>
                <div className="mt-4 text-3xl font-semibold text-ink">{row.assuranceScore}%</div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600">
                  {row.checks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between gap-3">
                      <span>{check.label}</span>
                      <StatusBadge status={check.status} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="grid gap-3">
            {data.runtimeEvidenceArtifacts.map((artifact) => (
              <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Link href={`/runtime-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId} · {humanize(artifact.evidenceType)}</Link>
                    <p className="mt-1 text-xs text-slate-500">{artifact.aiSystem.name} · {artifact.logSource.logSourceId} · {formatDate(artifact.eventTimestamp)} · {artifact.correlationId}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={artifact.validationStatus} />
                    <StatusBadge status={artifact.evidenceHealth} />
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                  <Explainer label="Collection Reason" value={artifact.collectionReason} />
                  <Explainer label="Retention Policy" value={artifact.retentionPolicy} />
                </div>
                <div className="mt-4">
                  <RuntimeEvidenceLinks artifactId={artifact.artifactId} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section title="MCP governance evidence">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="grid gap-3">
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
                <div className="mt-3 grid gap-2 text-xs text-slate-600">
                  {row.checks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between gap-3">
                      <span>{check.label}</span>
                      <StatusBadge status={check.status} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="grid gap-3">
            {data.mcpEvidenceArtifacts.map((artifact) => (
              <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Link href={`/mcp-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId} · {humanize(artifact.evidenceType)}</Link>
                    <p className="mt-1 text-xs text-slate-500">{artifact.aiSystem.name} · {artifact.mcpConnection.serverName} · {artifact.version}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={artifact.validationStatus} />
                    <StatusBadge status={artifact.evidenceHealth} />
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                  <Explainer label="Collection Method" value={artifact.collectionMethod} />
                  <Explainer label="Source Gap" value={artifact.sourceGap} />
                </div>
                <div className="mt-4">
                  <McpEvidenceLinks artifactId={artifact.artifactId} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Human governance evidence">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="grid gap-3">
            {data.notionAssuranceRows.map((row) => (
              <article key={row.system.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/systems/${row.system.slug}`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
                    <p className="mt-1 text-xs text-slate-500">{row.connections.length} Notion connection(s) · {row.notionArtifacts.length} governance evidence item(s)</p>
                  </div>
                  <StatusBadge status={row.assuranceScore >= 80 ? "PASS" : "WARNING"} />
                </div>
                <div className="mt-4 text-3xl font-semibold text-ink">{row.assuranceScore}%</div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600">
                  {row.checks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between gap-3">
                      <span>{check.label}</span>
                      <StatusBadge status={check.status} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="grid gap-3">
            {data.notionEvidenceArtifacts.map((artifact) => (
              <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Link href={`/notion-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId} · {humanize(artifact.evidenceType)}</Link>
                    <p className="mt-1 text-xs text-slate-500">{artifact.aiSystem.name} · {artifact.notionConnection.workspaceName}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={artifact.validationStatus} />
                    <StatusBadge status={artifact.evidenceHealth} />
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                  <Explainer label="Collection Method" value={artifact.collectionMethod} />
                  <Explainer label="Source Gap" value={artifact.sourceGap} />
                </div>
                <div className="mt-4">
                  <NotionEvidenceLinks artifactId={artifact.artifactId} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Data governance evidence">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="grid gap-3">
            {data.supabaseAssuranceRows.map((row) => (
              <article key={row.system.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/systems/${row.system.slug}`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
                    <p className="mt-1 text-xs text-slate-500">{row.connections.length} Supabase connection(s) · {row.supabaseArtifacts.length} data evidence item(s)</p>
                  </div>
                  <StatusBadge status={row.assuranceScore >= 80 ? "PASS" : "WARNING"} />
                </div>
                <div className="mt-4 text-3xl font-semibold text-ink">{row.assuranceScore}%</div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600">
                  {row.checks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between gap-3">
                      <span>{check.label}</span>
                      <StatusBadge status={check.status} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="grid gap-3">
            {data.supabaseEvidenceArtifacts.map((artifact) => (
              <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Link href={`/supabase-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId} · {humanize(artifact.evidenceType)}</Link>
                    <p className="mt-1 text-xs text-slate-500">{artifact.aiSystem.name} · {artifact.supabaseConnection.connectionId} · project {artifact.supabaseConnection.projectId}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={artifact.validationStatus} />
                    <StatusBadge status={artifact.evidenceHealth} />
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                  <Explainer label="Collection Method" value={artifact.collectionMethod} />
                  <Explainer label="Source Gap" value={artifact.sourceGap} />
                </div>
                <div className="mt-4">
                  <SupabaseEvidenceLinks artifactId={artifact.artifactId} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Deployment evidence">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="grid gap-3">
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
                <div className="mt-3 grid gap-2 text-xs text-slate-600">
                  {row.checks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between gap-3">
                      <span>{check.label}</span>
                      <StatusBadge status={check.status} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="grid gap-3">
            {data.deploymentEvidenceArtifacts.map((artifact) => (
              <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Link href={`/deployment-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId} · {artifact.containerName}</Link>
                    <p className="mt-1 text-xs text-slate-500">{artifact.aiSystem.name} · {artifact.portainerConnection.connectionId} · {artifact.imageName}:{artifact.imageTag}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={artifact.validationStatus} />
                    <StatusBadge status={artifact.evidenceHealth} />
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                  <Explainer label="Collection Method" value={artifact.collectionMethod} />
                  <Explainer label="Source Gap" value={artifact.sourceGap} />
                </div>
                <div className="mt-4">
                  <DeploymentEvidenceLinks artifactId={artifact.artifactId} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Warning and failure workbench">
        <div className="grid gap-3">
          {data.assuranceRules.filter((rule) => rule.status !== "PASS").length > 0 ? data.assuranceRules.filter((rule) => rule.status !== "PASS").map((rule) => (
            <article key={rule.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{rule.controlId} · {rule.validationRule}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{rule.explanation?.reason ?? rule.resultSummary}</p>
                  <p className="mt-1 text-xs text-slate-600">{rule.artifact.name} · {rule.artifact.path}</p>
                </div>
                <StatusBadge status={rule.status} />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Explainer label="Issue" value={rule.missingElement ?? rule.validationRule} />
                <Explainer label="Missing Evidence" value={rule.explanation?.missingRequirements ?? "Missing requirement not recorded."} />
                <Explainer label="Recommended Remediation" value={`Update ${rule.artifact.path} so it clearly evidences ${rule.missingElement ?? rule.validationRule}, then recollect and validate the artifact.`} />
              </div>
            </article>
          )) : (
            <article className="rounded-md border border-line bg-white p-4">
              <div className="text-sm font-semibold text-ink">No active warning or failure rules</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">Current Travel Brain GitHub artifacts do not have open assurance failures. Failure conditions remain visible in each artifact and control explanation.</p>
            </article>
          )}
        </div>
      </Section>

      <Section title="Traceability view">
        <div className="grid gap-4 lg:grid-cols-4">
          <TraceMetric label="Control Coverage" value={`${data.kpis.controlCoverage}%`} detail={`${data.kpis.traceableControls} controls have artifact-backed assurance`} />
          <TraceMetric label="Evidence Coverage" value={`${data.kpis.evidenceCoverage}%`} detail={`${data.kpis.artifacts} artifacts are traceable to controls`} />
          <TraceMetric label="Missing Evidence" value={data.kpis.missingEvidence} detail={data.missingTraceabilityControls.length ? data.missingTraceabilityControls.join(", ") : "No mapped control evidence gaps"} />
          <Link href="/traceability" className="rounded-md border border-line bg-white p-4 hover:bg-panel">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Auditor traceability</div>
            <div className="mt-2 text-lg font-semibold text-ink">Open traceability workspace</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">Review regulation, requirement, control, evidence, and finding traceability.</p>
          </Link>
        </div>
      </Section>

      <Section title="Control coverage">
        <div className="flex flex-wrap gap-2">
          {[...new Set(data.assuranceRules.map((rule) => rule.controlId))].sort().map((controlId) => (
            <Link key={controlId} href={`/controls/${controlId}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">
              {controlId}
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Repository connections">
        <div className="grid gap-3">
          {data.repositoryConnections.map((connection) => (
            <article key={connection.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{connection.repositoryId} · {connection.aiSystem.name}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{connection.repositoryUrl}</p>
                  <div className="mt-1 text-xs text-slate-500">Branch {connection.branch} · Last scan {connection.lastScan ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(connection.lastScan) : "Not scanned"}</div>
                </div>
                <StatusBadge status={connection.status} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Asset inventory">
        <div className="grid gap-3">
          {data.assets.map((asset) => (
            <article key={asset.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {iconForAsset(asset.assetType)}
                    {asset.assetId} · {asset.name}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{asset.description}</p>
                  <div className="mt-2 text-xs text-slate-500">{asset.aiSystem.name} · Owner: {asset.owner} · {asset.evidenceSources.length} evidence sources</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={asset.assetType} />
                  <StatusBadge status={asset.criticality} />
                  <StatusBadge status={asset.status} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Evidence source registry">
        <div className="grid gap-3">
          {data.evidenceSources.map((source) => (
            <article key={source.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{source.sourceId} · {humanize(source.sourceType)}</div>
                  <p className="mt-1 text-xs text-slate-500">{source.asset.name} · {source.evidenceLocation}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={source.collectionStatus} />
                  <StatusBadge status={source.freshnessStatus} />
                  <StatusBadge status={source.connectorHealth} />
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Explainer label="Collection Method" value={source.collectionMethod} />
                <Explainer label="Validation Method" value={source.validationMethod} />
                <Explainer label="Governance Value" value={source.governanceValue} />
              </div>
              {source.artifacts.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {source.artifacts.map((artifact) => (
                    <Link key={artifact.id} href={`/evidence-artifacts/${artifact.artifactId}`} className="inline-flex rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
                      {artifact.name}
                    </Link>
                  ))}
                </div>
              ) : null}
              {source.supabaseArtifacts.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {source.supabaseArtifacts.map((artifact) => (
                    <Link key={artifact.id} href={`/supabase-evidence/${artifact.artifactId}`} className="inline-flex rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
                      {artifact.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section title="Collected GitHub artifacts">
        <div className="grid gap-3 md:grid-cols-2">
          {data.artifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/evidence-artifacts/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.name}</Link>
                  <p className="mt-1 text-xs text-slate-500">{artifact.path} · {artifact.version}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">{artifact.sourceUrl}</p>
                </div>
                <StatusBadge status={artifactAssuranceStatus(artifact.assuranceRules)} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{artifact.source.sourceId} · {artifact.asset.name} · Commit {artifact.commitSha.slice(0, 12)} · Hash {artifact.artifactHash.slice(0, 12)}</p>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <ScoreLine label="Artifact assurance" value={artifactAssuranceScore(artifact.assuranceRules)} />
                <div className="flex items-center justify-between gap-3">
                  <span>Control checks</span>
                  <span className="font-semibold text-ink">{artifact.assuranceRules.filter((rule) => rule.status === "PASS").length}/{artifact.assuranceRules.length}</span>
                </div>
              </div>
              <div className="mt-4">
                <AssuranceDisclosure
                  label="Artifact assurance explanation"
                  status={artifactAssuranceStatus(artifact.assuranceRules)}
                  reason={explainArtifactRules(artifact.assuranceRules)}
                  evidence={[artifact.name]}
                  artifacts={[artifact.path]}
                  checks={artifact.assuranceRules.map((rule) => rule.validationRule)}
                  controls={[...new Set(artifact.assuranceRules.map((rule) => rule.controlId))]}
                  missing={artifact.assuranceRules.filter((rule) => rule.status !== "PASS").map((rule) => rule.explanation?.missingRequirements ?? rule.missingElement ?? rule.validationRule)}
                  failures={artifact.assuranceRules.map((rule) => rule.explanation?.failureConditions ?? `${rule.validationRule} fails if supporting content is absent.`)}
                  links={[
                    { label: "Artifact viewer", href: `/evidence-artifacts/${artifact.artifactId}` },
                    { label: "Evidence snapshot", href: `/evidence-artifacts/${artifact.artifactId}#evidence-snapshot` },
                    { label: "Evidence chain", href: `/evidence-artifacts/${artifact.artifactId}#evidence-chain` },
                    { label: "Drift comparison", href: `/evidence-artifacts/${artifact.artifactId}/drift` },
                    { label: "GitHub source", href: artifact.sourceUrl }
                  ]}
                />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Drift events">
        <div className="grid gap-3">
          {data.driftEvents.map((event) => (
            <article key={event.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{humanize(event.eventType)} · {event.aiSystem.name}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{event.summary}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.path} · {event.currentHash.slice(0, 12)}</p>
                </div>
                <StatusBadge status="COLLECTED" />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-4">
        <Panel title="Assets by Type" entries={data.byAssetType} />
        <Panel title="Validation Status" entries={data.byValidationStatus} />
        <Panel title="Freshness" entries={data.byFreshness} />
        <Panel title="Connector Health" entries={data.byConnectorHealth} />
      </div>
    </>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-semibold text-ink">{value}%</span>
    </div>
  );
}

function AssuranceDisclosure({
  label,
  status,
  reason,
  evidence,
  artifacts,
  checks,
  controls,
  missing,
  failures,
  links
}: {
  label: string;
  status: string;
  reason: string;
  evidence: string[];
  artifacts: string[];
  checks: string[];
  controls: string[];
  missing: string[];
  failures: string[];
  links?: Array<{ label: string; href: string }>;
}) {
  return (
    <details className="rounded-md border border-line bg-panel p-3">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-ink">{label}</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">{reason}</p>
          </div>
          <StatusBadge status={status} />
        </div>
      </summary>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ExplanationList title="Underlying evidence" items={evidence} empty="No evidence currently supports this score." />
        <ExplanationList title="Underlying artifacts" items={artifacts} empty="No artifacts currently support this score." />
        <ExplanationList title="Validation checks" items={checks} empty="No validation checks were run." />
        <ExplanationList title="Supporting controls" items={controls} empty="No controls are linked." />
        <ExplanationList title="Missing requirements" items={missing} empty="No missing requirements detected." tone="gap" />
        <ExplanationList title="Failure conditions" items={failures} empty="No failure conditions defined." tone="gap" />
      </div>
      {links && links.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link key={`${link.label}-${link.href}`} href={link.href} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </details>
  );
}

function ExplanationList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone?: "gap" }) {
  const values = [...new Set(items.filter(Boolean))];
  return (
    <div className={`rounded border border-line p-3 ${tone === "gap" ? "bg-amber-50" : "bg-white"}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">
        {values.length ? values.map((item) => <div key={item}>{item}</div>) : <div className="text-slate-500">{empty}</div>}
      </div>
    </div>
  );
}

function TraceMetric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </div>
  );
}

function Explainer({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function Panel({ title, entries }: { title: string; entries: Record<string, number> }) {
  return (
    <section className="rounded-md border border-line bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <ListChecks className="h-4 w-4 text-brand" />
        {title}
      </h2>
      <div className="mt-4 divide-y divide-line">
        {Object.entries(entries).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
            <div className="text-slate-700">{humanize(label)}</div>
            <div className="font-semibold text-ink">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function iconForAsset(assetType: string) {
  if (assetType === "GITHUB") return <GitBranch className="h-4 w-4 text-brand" />;
  if (assetType === "LOGS") return <ClipboardCheck className="h-4 w-4 text-brand" />;
  return <Radar className="h-4 w-4 text-brand" />;
}

function artifactAssuranceScore(rules: Array<{ status: string }>) {
  if (rules.length === 0) return 0;
  return Math.round((rules.filter((rule) => rule.status === "PASS").length / rules.length) * 100);
}

function artifactAssuranceStatus(rules: Array<{ status: string }>) {
  if (rules.some((rule) => rule.status === "FAIL")) return "FAIL";
  if (rules.some((rule) => rule.status === "WARNING")) return "WARNING";
  return rules.length > 0 ? "PASS" : "MISSING";
}

function explainArtifactRules(rules: Array<{ status: string }>) {
  const passed = rules.filter((rule) => rule.status === "PASS").length;
  const gaps = rules.length - passed;
  if (gaps === 0) return `All ${rules.length} artifact assurance check(s) passed.`;
  return `${passed}/${rules.length} artifact assurance check(s) passed; ${gaps} require review.`;
}
