import Link from "next/link";
import { AlertTriangle, BookOpen, Users } from "lucide-react";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { LearningPanel, Section, StatusBadge } from "../../components/ui";
import { FactTile, NotionEvidenceLinks, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceGovernanceEvidencePage() {
  const data = await getGovernanceOperationsDashboard();
  const connectionWarnings = data.notionConnections.filter((connection) => connection.status !== "CONNECTED");
  const reviewEvidence = data.notionEvidenceArtifacts.filter((artifact) => artifact.validationStatus !== "VALID");
  const hasNotionEvidence = data.notionEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4 xl:grid-cols-6">
        <FactTile label="Notion Connections" value={data.notionConnections.length} />
        <FactTile label="Connected" value={`${data.kpis.connectedNotionConnections}/${data.kpis.notionConnections}`} status={connectionWarnings.length ? "WARNING" : "PASS"} />
        <FactTile label="Governance Evidence" value={data.notionEvidenceArtifacts.length} />
        <FactTile label="Validated Evidence" value={`${data.kpis.validNotionEvidence}/${data.kpis.notionEvidence}`} status={reviewEvidence.length ? "WARNING" : "PASS"} />
        <FactTile label="Approval Records" value={data.notionEvidenceArtifacts.filter((artifact) => artifact.evidenceType === "APPROVAL_EVIDENCE").length} />
        <FactTile label="Ownership Records" value={data.notionEvidenceArtifacts.filter((artifact) => artifact.evidenceType === "OWNERSHIP_EVIDENCE").length} />
      </div>

      <Section title="Human governance workflow">
        <div className="grid gap-3 md:grid-cols-4">
          <WorkflowCard href="/evidence-assurance/governance-evidence#notion-connections" kicker="Source" title="Confirm Notion scope" detail="Review the Travel Brain Notion workspace scope and collection boundary." />
          <WorkflowCard href="/evidence-assurance/governance-evidence#notion-evidence" kicker="Evidence" title="Inspect governance evidence" detail="Open approval, review, committee, documentation, and ownership evidence artifacts." />
          <WorkflowCard href="/controls/GOV-001" kicker="Governance" title="Trace governance oversight" detail="Start from governance control and follow Notion committee/documentation evidence." />
          <WorkflowCard href="/controls/AUD-001" kicker="Audit" title="Trace human decisions" detail="Review the audit path from control to Notion approval and review evidence." />
        </div>
      </Section>

      <Section title="Human governance assurance">
        <div className="grid gap-4 md:grid-cols-2">
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

      <Section title="Notion connection health">
        <div id="notion-connections" className="grid gap-3">
          {data.notionConnections.map((connection) => (
            <article key={connection.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <BookOpen className="h-4 w-4 text-brand" />
                    {connection.connectionId} · {connection.aiSystem.name}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{connection.workspaceName}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{connection.sourceGap}</p>
                  <p className="mt-1 text-xs text-slate-500">Last scan {connection.lastScan ? formatDate(connection.lastScan) : "not scanned"}</p>
                </div>
                <StatusBadge status={connection.status} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Notion evidence artifacts">
        <div id="notion-evidence" className="grid gap-3 md:grid-cols-2">
          {data.notionEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/notion-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId}</Link>
                  <p className="mt-1 text-xs text-slate-500">{humanize(artifact.evidenceType)} · {artifact.notionConnection.workspaceName}</p>
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
                <FactLine label="Last Modified" value={artifact.lastModified ? formatDate(artifact.lastModified) : "not available"} />
                <FactLine label="Source" value={artifact.source} />
              </div>
              <div className="mt-4">
                <NotionEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={hasNotionEvidence ? "Human governance boundary" : "Instrumentation gap"}>
        <div className="grid gap-4 lg:grid-cols-2">
          <LearningPanel title="What Notion should prove">
            Notion should prove human governance reality: accountable decisions, approvals, reviews, ownership, committee activity, and governance documentation that technical connectors cannot produce.
          </LearningPanel>
          <LearningPanel title={hasNotionEvidence ? "What is collected now" : "What is missing now"}>
            {hasNotionEvidence
              ? "Travel Brain has scoped Notion governance metadata. The platform stores governance record metadata and safe properties only; personal notes, unrelated workspace content, customer content, secrets, credentials, and page body content are excluded."
              : "Travel Brain has a declared Notion governance workspace, but no scoped Notion source is available to the application. The current artifacts are inspectable gap records, not claims that human governance records have been collected."}
          </LearningPanel>
        </div>
      </Section>

      {reviewEvidence.length ? (
        <Section title="Review issues">
          <div className="grid gap-3">
            {reviewEvidence.map((artifact) => (
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

      <Section title="Governance accountability">
        <div className="grid gap-4 lg:grid-cols-2">
          <LearningPanel title="Why this remains human-governed">
            Approvals, risk acceptances, production decisions, exception approvals, and committee decisions are accountability records. A connector can collect evidence that the record exists, but it cannot replace the human decision.
          </LearningPanel>
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink"><Users className="h-4 w-4 text-brand" /> Evidence should answer</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              {["Who reviewed it?", "Who approved it?", "Which committee decided?", "What was the governance scope?", "Which controls depend on the record?"].map((item) => (
                <div key={item} className="rounded border border-line bg-panel px-3 py-2">{item}</div>
              ))}
            </div>
          </article>
        </div>
      </Section>
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
