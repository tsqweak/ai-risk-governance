import Link from "next/link";
import { AlertTriangle, KeyRound } from "lucide-react";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { LearningPanel, Section, StatusBadge } from "../../components/ui";
import { FactTile, SecretEvidenceLinks, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceSecretsGovernancePage() {
  const data = await getGovernanceOperationsDashboard();
  const connectionWarnings = data.secretsConnections.filter((connection) => connection.status !== "CONNECTED");
  const reviewEvidence = data.secretEvidenceArtifacts.filter((artifact) => artifact.validationStatus !== "VALID");
  const hasSecretEvidence = data.secretEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4 xl:grid-cols-6">
        <FactTile label="Secrets Connections" value={data.secretsConnections.length} />
        <FactTile label="Connected" value={`${data.kpis.connectedSecretsConnections}/${data.kpis.secretsConnections}`} status={connectionWarnings.length ? "WARNING" : "PASS"} />
        <FactTile label="Secrets Evidence" value={data.secretEvidenceArtifacts.length} />
        <FactTile label="Validated Evidence" value={`${data.kpis.validSecretEvidence}/${data.kpis.secretEvidence}`} status={reviewEvidence.length ? "WARNING" : "PASS"} />
        <FactTile label="Rotation Warnings" value={data.secretEvidenceArtifacts.filter((artifact) => artifact.evidenceType === "ROTATION_EVIDENCE" && artifact.validationStatus !== "VALID").length} status={reviewEvidence.some((artifact) => artifact.evidenceType === "ROTATION_EVIDENCE") ? "WARNING" : "PASS"} />
        <FactTile label="Ownership Warnings" value={data.secretEvidenceArtifacts.filter((artifact) => artifact.evidenceType === "OWNERSHIP_EVIDENCE" && artifact.validationStatus !== "VALID").length} status={reviewEvidence.some((artifact) => artifact.evidenceType === "OWNERSHIP_EVIDENCE") ? "WARNING" : "PASS"} />
      </div>

      <Section title="Secrets governance workflow">
        <div className="grid gap-3 md:grid-cols-4">
          <WorkflowCard href="/evidence-assurance/secrets-governance#secret-connections" kicker="Source" title="Confirm sources" detail="Review supported secret source systems and metadata-only collection status." />
          <WorkflowCard href="/evidence-assurance/secrets-governance#secret-evidence" kicker="Evidence" title="Inspect metadata" detail="Open inventory, rotation, ownership, and usage mapping evidence artifacts." />
          <WorkflowCard href="/controls/SEC-001" kicker="Control" title="Trace secure access" detail="Start from SEC-001 and follow secrets metadata evidence." />
          <WorkflowCard href="/controls/AUD-001" kicker="Audit" title="Trace audit proof" detail="Review how secret metadata supports auditability without exposing values." />
        </div>
      </Section>

      <Section title="Secrets assurance">
        <div className="grid gap-4 md:grid-cols-2">
          {data.secretsAssuranceRows.map((row) => (
            <article key={row.system.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/systems/${row.system.slug}`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
                  <p className="mt-1 text-xs text-slate-500">{row.connections.length} secrets connection(s) · {row.secretArtifacts.length} evidence artifact(s)</p>
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

      <Section title="Secrets connection health">
        <div id="secret-connections" className="grid gap-3">
          {data.secretsConnections.map((connection) => (
            <article key={connection.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <KeyRound className="h-4 w-4 text-brand" />
                    {connection.connectionId} · {connection.aiSystem.name}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{humanize(connection.sourceSystem)} · Last scan {connection.lastScan ? formatDate(connection.lastScan) : "not scanned"}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{connection.sourceGap}</p>
                </div>
                <StatusBadge status={connection.status} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Secrets evidence artifacts">
        <div id="secret-evidence" className="grid gap-3 md:grid-cols-2">
          {data.secretEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/secret-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                  <p className="mt-1 text-xs text-slate-500">{humanize(artifact.evidenceType)} · {humanize(artifact.source)} · {artifact.environment}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">Metadata hash {artifact.hash}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                <FactLine label="Collection" value={formatDate(artifact.collectionTimestamp)} />
                <FactLine label="Control Impact" value={artifact.controlImpact} />
              </div>
              <div className="mt-4">
                <SecretEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Metadata-only boundary">
        <div className="grid gap-4 lg:grid-cols-2">
          <LearningPanel title="What Secrets should prove">
            Secrets governance should prove that identifiers are inventoried, owned, rotated, mapped to usage, associated with an AI system, and traceable to controls.
          </LearningPanel>
          <LearningPanel title={hasSecretEvidence ? "What is collected now" : "What is missing now"}>
            {hasSecretEvidence
              ? "Travel Brain has metadata-only secrets evidence. The platform stores secret names, source systems, owners, rotation metadata, usage mappings, and policy status only. Values, tokens, passwords, API key values, certificates, private keys, and connection strings are excluded."
              : "Travel Brain has a declared secrets asset, but no usable secret metadata source is available. The current evidence would be a gap record, never invented secret proof."}
          </LearningPanel>
        </div>
      </Section>

      {reviewEvidence.length ? (
        <Section title="Governance warnings">
          <div className="grid gap-3">
            {reviewEvidence.map((artifact) => (
              <article key={artifact.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      {artifact.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.warningReason || artifact.failureCondition}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.recommendedAction}</p>
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
      <span className="break-words text-right font-semibold text-ink">{value}</span>
    </div>
  );
}
