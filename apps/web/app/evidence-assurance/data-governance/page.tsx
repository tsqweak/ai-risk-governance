import Link from "next/link";
import { AlertTriangle, Database } from "lucide-react";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { LearningPanel, Section, StatusBadge } from "../../components/ui";
import { FactTile, SupabaseEvidenceLinks, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceDataGovernancePage() {
  const data = await getGovernanceOperationsDashboard();
  const connectionWarnings = data.supabaseConnections.filter((connection) => connection.status !== "CONNECTED");
  const missingEvidence = data.supabaseEvidenceArtifacts.filter((artifact) => artifact.validationStatus !== "VALID");
  const validationIssues = data.supabaseControlValidations.filter((validation) => validation.result !== "PASS");
  const driftIssues = data.supabaseDriftEvents.filter((event) => event.status !== "PASS");
  const hasSupabaseEvidence = data.supabaseEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4 xl:grid-cols-6">
        <FactTile label="Supabase Connections" value={data.supabaseConnections.length} />
        <FactTile label="Connected" value={`${data.kpis.connectedSupabaseConnections}/${data.kpis.supabaseConnections}`} status={connectionWarnings.length ? "WARNING" : "PASS"} />
        <FactTile label="Data Evidence" value={data.supabaseEvidenceArtifacts.length} />
        <FactTile label="Validated Evidence" value={`${data.kpis.validSupabaseEvidence}/${data.kpis.supabaseEvidence}`} status={missingEvidence.length ? "WARNING" : "PASS"} />
        <FactTile label="Schema Evidence" value={data.supabaseEvidenceArtifacts.filter((artifact) => artifact.evidenceType === "SCHEMA").length} />
        <FactTile label="Policy Evidence" value={data.supabaseEvidenceArtifacts.filter((artifact) => artifact.evidenceType === "POLICY").length} />
        <FactTile label="Snapshots" value={data.kpis.supabaseSnapshots} status={data.kpis.supabaseSnapshots ? "PASS" : "WARNING"} />
        <FactTile label="Drift Events" value={data.kpis.supabaseDrift} status={driftIssues.length ? "WARNING" : "PASS"} />
        <FactTile label="Control Validations" value={`${data.kpis.passingSupabaseControlValidations}/${data.kpis.supabaseControlValidations}`} status={validationIssues.length ? "WARNING" : "PASS"} />
      </div>

      <Section title="Data governance evidence workflow">
        <div className="grid gap-3 md:grid-cols-4">
          <WorkflowCard href="/evidence-assurance/data-governance#supabase-connections" kicker="Source" title="Confirm Supabase source" detail="Review whether a read-only Supabase/Postgres metadata connection is available." />
          <WorkflowCard href="/evidence-assurance/data-governance#supabase-evidence" kicker="Evidence" title="Inspect data evidence" detail="Open schema, table inventory, RLS policy, access, and audit capability metadata." />
          <WorkflowCard href="/evidence-assurance/data-governance#supabase-drift" kicker="Drift" title="Review data drift" detail="Compare current metadata against retained Supabase snapshots." />
          <WorkflowCard href="/evidence-assurance/data-governance#supabase-validation" kicker="Validation" title="Review control validation" detail="Open explainable results for privacy, security, audit, monitoring, and resilience controls." />
          <WorkflowCard href="/controls/PRI-001" kicker="Privacy" title="Trace privacy controls" detail="Start from privacy controls and follow the Supabase evidence path." />
          <WorkflowCard href="/controls/SEC-001" kicker="Security" title="Trace access controls" detail="Start from secure access controls and follow database role evidence." />
        </div>
      </Section>

      <Section title="Data governance assurance">
        <div className="grid gap-4 md:grid-cols-2">
          {data.supabaseAssuranceRows.map((row) => (
            <article key={row.system.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/systems/${row.system.slug}`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
                  <p className="mt-1 text-xs text-slate-500">{row.connections.length} Supabase connection(s) · {row.supabaseArtifacts.length} data-governance evidence item(s)</p>
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

      <Section title="Supabase snapshots">
        <div id="supabase-snapshots" className="grid gap-3 md:grid-cols-2">
          {data.supabaseEvidenceSnapshots.map((snapshot) => (
            <article key={snapshot.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{snapshot.snapshotId}</div>
                  <p className="mt-1 text-xs text-slate-500">{snapshot.aiSystem.name} · {snapshot.supabaseConnection.projectId}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Retained Supabase metadata snapshot for schema, table, RLS, policy, role, and extension inventory.</p>
                </div>
                <StatusBadge status="COLLECTED" />
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                <FactLine label="Collection" value={formatDate(snapshot.collectionTimestamp)} />
                <FactLine label="Database Version" value={snapshot.databaseVersion.split(" ").slice(0, 3).join(" ")} />
                <FactLine label="Hash" value={snapshot.hash.slice(0, 12)} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Supabase drift">
        <div id="supabase-drift" className="grid gap-3">
          {data.supabaseDriftEvents.map((event) => (
            <article key={event.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{humanize(event.eventType)}</div>
                  <p className="mt-1 text-xs text-slate-500">{event.aiSystem.name} · {formatDate(event.detectedAt)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{event.changeSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{event.controlImpact}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.recommendedAction}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Supabase control validation">
        <div id="supabase-validation" className="grid gap-3 md:grid-cols-2">
          {data.supabaseControlValidations.map((validation) => (
            <Link key={validation.id} href={`/controls/${validation.controlId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{validation.controlId}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{validation.controlImpact}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{validation.recommendedAction}</p>
                  <p className="mt-1 text-xs text-slate-500">{validation.changeDetected}</p>
                </div>
                <StatusBadge status={validation.result} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Supabase connection health">
        <div id="supabase-connections" className="grid gap-3">
          {data.supabaseConnections.map((connection) => (
            <article key={connection.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Database className="h-4 w-4 text-brand" />
                    {connection.connectionId} · {connection.aiSystem.name}
                  </div>
                  <p className="mt-1 break-all text-xs text-slate-500">{connection.environment} · project {connection.projectId}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{connection.sourceGap}</p>
                  <p className="mt-1 text-xs text-slate-500">Last scan {connection.lastScan ? formatDate(connection.lastScan) : "not scanned"}</p>
                </div>
                <StatusBadge status={connection.status} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Supabase evidence artifacts">
        <div id="supabase-evidence" className="grid gap-3 md:grid-cols-2">
          {data.supabaseEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/supabase-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                  <p className="mt-1 text-xs text-slate-500">{humanize(artifact.evidenceType)} · {artifact.supabaseConnection.projectId}</p>
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
                <SupabaseEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={hasSupabaseEvidence ? "Data evidence boundary" : "Instrumentation gap"}>
        <div className="grid gap-4 lg:grid-cols-2">
          <LearningPanel title="What Supabase should prove">
            Supabase should prove data-governance reality: what schemas and tables exist, whether row-level security is enabled, which policies and roles are reviewable, and whether audit capability metadata exists.
          </LearningPanel>
          <LearningPanel title={hasSupabaseEvidence ? "What is collected now" : "What is missing now"}>
            {hasSupabaseEvidence
              ? "Travel Brain has Supabase metadata evidence collected through read-only database queries. The platform stores only schema, table, RLS, role, and audit capability metadata; row contents, customer data, secrets, credentials, and API keys are excluded."
              : "Travel Brain has a declared Supabase asset, but no usable read-only Supabase/Postgres metadata source is available to this platform. The current evidence is an inspectable gap record, not a claim that data-governance evidence has been collected."}
          </LearningPanel>
        </div>
      </Section>

      {missingEvidence.length ? (
        <Section title="Review issues">
          <div className="grid gap-3">
            {missingEvidence.map((artifact) => (
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
