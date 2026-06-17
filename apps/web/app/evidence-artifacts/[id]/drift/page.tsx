import Link from "next/link";
import { notFound } from "next/navigation";
import { GitCompareArrows } from "lucide-react";
import { getEvidenceArtifactDriftComparison } from "../../../data";
import { formatDate, humanize } from "../../../components/format";
import { Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function EvidenceArtifactDriftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comparison = await getEvidenceArtifactDriftComparison(id);
  if (!comparison) notFound();

  const { artifact, snapshot, current, comparisonStatus, changedLines } = comparison;
  const source = artifact.source;
  const system = source.asset.aiSystem;

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Evidence drift detection</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{artifact.name}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Compare the preserved evidence snapshot used for assurance against the current repository source. The snapshot remains the audit baseline even if the source changes later.
          </p>
        </div>
        <StatusBadge status={comparisonStatus} />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-md border border-line bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <GitCompareArrows className="h-4 w-4 text-brand" />
            Comparison result
          </div>
          <div className="mt-4 text-3xl font-semibold text-ink">{humanize(comparisonStatus)}</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{summaryForStatus(comparisonStatus, current.available, changedLines.length)}</p>
        </article>
        <article className="rounded-md border border-line bg-white p-5">
          <div className="text-sm font-semibold text-ink">Collected snapshot</div>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
            <div>Version: {snapshot.version}</div>
            <div>Commit: {snapshot.commitSha}</div>
            <div>Hash: {snapshot.artifactHash}</div>
            <div>Collected: {formatDate(snapshot.collectedAt)}</div>
          </div>
        </article>
        <article className="rounded-md border border-line bg-white p-5">
          <div className="text-sm font-semibold text-ink">Current source</div>
          {current.available ? (
            <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
              <div>Commit: {current.commitSha}</div>
              <div>Hash: {current.artifactHash}</div>
              <div>Fetched: {formatDate(current.fetchedAt)}</div>
              <Link href={current.sourceUrl} className="break-all font-semibold text-brand hover:text-blue-700">Open current GitHub source</Link>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-700">{current.reason}</p>
          )}
        </article>
      </div>

      <Section title="Evidence chain">
        <div className="grid gap-3">
          {artifact.assuranceRules.map((rule) => (
            <article key={rule.id} className="rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-6">
                <TraceLink title="Control" value={rule.controlId} href={`/controls/${rule.controlId}`} />
                <TraceBox title="Validation" value={rule.validationRule} detail={rule.resultSummary} />
                <TraceLink title="Evidence" value={artifact.name} detail={artifact.artifactId} href={`/evidence-artifacts/${artifact.artifactId}`} />
                <TraceBox title="Source" value={source.sourceId} detail={source.evidenceLocation} />
                <TraceBox title="Collection" value={formatDate(snapshot.collectedAt)} detail={snapshot.collectionMethod} />
                <TraceBox title="Version" value={snapshot.version} detail={snapshot.commitSha.slice(0, 16)} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Changed lines">
        {current.available ? (
          changedLines.length > 0 ? (
            <div className="grid gap-3">
              {changedLines.map((line) => (
                <article key={line.line} className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-semibold text-ink">Line {line.line}</div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <CodeBlock title="Collected snapshot" value={line.collected || "(blank)"} />
                    <CodeBlock title="Current source" value={line.current || "(blank)"} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-line bg-white p-4 text-sm leading-6 text-slate-700">
              No line-level differences were detected between the preserved snapshot and the current repository source.
            </div>
          )
        ) : (
          <div className="rounded-md border border-line bg-white p-4 text-sm leading-6 text-slate-700">
            Current source could not be fetched, so line-level drift comparison is unavailable. The preserved snapshot remains inspectable below.
          </div>
        )}
      </Section>

      <Section title="Snapshot content">
        <pre className="max-h-[32rem] overflow-auto rounded-md border border-line bg-white p-4 text-xs leading-5 text-slate-800">{snapshot.content}</pre>
      </Section>

      {current.available ? (
        <Section title="Current source content">
          <pre className="max-h-[32rem] overflow-auto rounded-md border border-line bg-white p-4 text-xs leading-5 text-slate-800">{current.content}</pre>
        </Section>
      ) : null}

      <Section title="Auditor navigation">
        <div className="flex flex-wrap gap-2">
          <Link href={`/evidence-artifacts/${artifact.artifactId}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">Artifact viewer</Link>
          <Link href={`/evidence-artifacts/${artifact.artifactId}#evidence-snapshot`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">Preserved snapshot</Link>
          <Link href={`/evidence-artifacts/${artifact.artifactId}#evidence-chain`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">Evidence chain</Link>
          <Link href={`/systems/${system.slug}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">AI system workspace</Link>
        </div>
      </Section>
    </>
  );
}

function summaryForStatus(status: string, currentAvailable: boolean, changedLineCount: number) {
  if (!currentAvailable) return "The preserved snapshot can be inspected, but current source comparison is unavailable.";
  if (status === "MATCH") return "The current repository source matches the collected evidence snapshot hash.";
  if (status === "DRIFT") return `${changedLineCount} changed line(s) were detected in the current source compared with the collected snapshot.`;
  return "Current source comparison could not produce a governed conclusion.";
}

function TraceBox({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p> : null}
    </div>
  );
}

function TraceLink({ title, value, detail, href }: { title: string; value: string; detail?: string; href: string }) {
  return (
    <Link href={href} className="rounded border border-line bg-panel p-3 hover:bg-white">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p> : null}
    </Link>
  );
}

function CodeBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <pre className="mt-2 overflow-auto rounded border border-line bg-white p-3 text-xs leading-5 text-slate-800">{value}</pre>
    </div>
  );
}
