import Link from "next/link";
import { Activity, AlertTriangle, Clock, FileText } from "lucide-react";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { LearningPanel, Section, StatusBadge } from "../../components/ui";
import { FactTile, RuntimeEvidenceLinks, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceRuntimePage() {
  const data = await getGovernanceOperationsDashboard();
  const runtimeWarnings = data.logSources.filter((source) => source.status !== "CONNECTED");
  const staleSources = data.logSources.filter((source) => !source.lastCollected);
  const unhealthyRuntimeEvidence = data.runtimeEvidenceArtifacts.filter((artifact) => artifact.evidenceHealth !== "PRESENT" || !artifact.retentionValid || !artifact.collectionCurrent);

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4 xl:grid-cols-6">
        <FactTile label="Log Sources" value={data.logSources.length} />
        <FactTile label="Runtime Evidence" value={data.runtimeEvidenceArtifacts.length} />
        <FactTile label="Connected Sources" value={`${data.kpis.connectedLogSources}/${data.kpis.logSources}`} status={runtimeWarnings.length ? "WARNING" : "PASS"} />
        <FactTile label="Collection Gaps" value={staleSources.length} status={staleSources.length ? "WARNING" : "PASS"} />
        <FactTile label="Retention Valid" value={`${data.kpis.runtimeRetentionValid}/${data.kpis.runtimeEvidence}`} status={unhealthyRuntimeEvidence.length ? "WARNING" : "PASS"} />
        <FactTile label="Collection Current" value={`${data.kpis.runtimeCollectionCurrent}/${data.kpis.runtimeEvidence}`} status={unhealthyRuntimeEvidence.length ? "WARNING" : "PASS"} />
      </div>

      <Section title="Runtime evidence workflow">
        <div className="grid gap-3 md:grid-cols-3">
          <WorkflowCard href="/evidence-assurance/runtime#log-sources" kicker="Source" title="Confirm source" detail="Review where runtime metadata originates and whether the external source is connected." />
          <WorkflowCard href="/evidence-assurance/runtime#runtime-artifacts" kicker="Evidence" title="Inspect runtime evidence" detail="Open timestamp, correlation ID, hash, validation, related control, and source record metadata." />
          <WorkflowCard href="/evidence-assurance/runtime#runtime-assurance" kicker="Assurance" title="Explain operational proof" detail="See why each runtime item was collected, which control depends on it, and what would fail if it disappeared." />
        </div>
      </Section>

      <Section title="Runtime assurance">
        <div id="runtime-assurance" className="grid gap-4 md:grid-cols-2">
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

      <Section title="Log source health">
        <div id="log-sources" className="grid gap-3">
          {data.logSources.map((source) => (
            <article key={source.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {iconForSource(source.type)}
                    {source.logSourceId} · {source.name}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{source.aiSystem.name} · {humanize(source.type)} · {source.location}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{source.sourceGap}</p>
                  <p className="mt-1 text-xs text-slate-500">Retention: {source.retentionPeriod} · Last collected {source.lastCollected ? formatDate(source.lastCollected) : "not collected"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={source.status} />
                  <StatusBadge status={source.runtimeArtifacts.length > 0 ? "COLLECTED" : "MISSING"} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Runtime evidence artifacts">
        <div id="runtime-artifacts" className="grid gap-3 md:grid-cols-2">
          {data.runtimeEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/runtime-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                  <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {formatDate(artifact.eventTimestamp)} · {artifact.correlationId}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">Sanitized hash {artifact.hash}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                <HealthLine label="Retention" status={artifact.retentionValid ? "PASS" : "WARNING"} />
                <HealthLine label="Collection" status={artifact.collectionCurrent ? "PASS" : "WARNING"} />
              </div>
              <div className="mt-4">
                <RuntimeEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Connector-ready gaps">
        <div className="grid gap-4 lg:grid-cols-2">
          <LearningPanel title="What exists now">
            Travel Brain runtime evidence is generated from platform execution logs, monitoring test runs, control results, and audit events. Phase 9C.1 displays sanitized evidence bodies while preserving privacy boundaries.
          </LearningPanel>
          <LearningPanel title="What still needs instrumentation">
            Travel Brain has not exposed external runtime files or endpoints for `logs/recommendations/*.jsonl`, `monitoring/travel-brain-control-health.json`, or `monitoring/control-results/travel-brain.json`. Those sources are connector-ready but not yet connected.
          </LearningPanel>
        </div>
      </Section>
    </>
  );
}

function HealthLine({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-line bg-panel px-3 py-2">
      <span>{label}</span>
      <StatusBadge status={status} />
    </div>
  );
}

function iconForSource(type: string) {
  if (type === "EXECUTION_LOG") return <Activity className="h-4 w-4 text-brand" />;
  if (type === "MONITORING_RESULT") return <Clock className="h-4 w-4 text-brand" />;
  if (type === "CONTROL_RESULT") return <FileText className="h-4 w-4 text-brand" />;
  return <AlertTriangle className="h-4 w-4 text-brand" />;
}
