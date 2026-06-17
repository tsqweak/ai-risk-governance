import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FileArchive, FileCheck2, PackageCheck, ShieldCheck } from "lucide-react";
import { getAiSystemWorkspace } from "../../../data";
import { formatDate } from "../../../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function SystemEvidencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemWorkspace(slug);
  if (!system) notFound();
  const currentEvidence = system.evidenceHealth.filter((record) => record.health === "CURRENT" && record.validation === "VALID").length;
  const gaps = system.evidenceHealth.filter((record) => record.health === "MISSING" || record.health === "EXPIRED" || record.validation === "INVALID").length;

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Evidence</p>
        <h2 className="mt-1 text-3xl font-semibold text-ink">{system.name} evidence library</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Evidence is the proof layer for controls, risks, regulations, monitoring, lifecycle gates, and implementation assurance.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Evidence Objects" value={system.evidenceObjects.length} icon={FileCheck2} />
        <Metric label="Current Evidence" value={currentEvidence} icon={ShieldCheck} />
        <Metric label="Evidence Gaps" value={gaps} icon={Download} />
        <Metric label="Audit Packages" value={system.auditPackages.length} icon={PackageCheck} />
      </div>

      <Section title="Evidence discoverability">
        <div className="grid gap-4 lg:grid-cols-3">
          <LearningPanel title="Proof, Not Attachments">
            Evidence must be reachable from every governance object and must show ownership, status, validation, expiration, and source location.
          </LearningPanel>
          <LearningPanel title="Compliance support">
            Evidence supports compliance by proving mapped controls are operating against regulatory obligations and stage gates.
          </LearningPanel>
          <LearningPanel title="Audit support">
            Auditors should be able to open evidence, review traceability, inspect findings and exceptions, and download the record without losing system context.
          </LearningPanel>
        </div>
      </Section>

      <Section title="Evidence objects">
        <div className="grid gap-3 md:grid-cols-2">
          {system.evidenceObjects.map((evidence) => (
            <Link key={evidence.id} href={`/evidence/${evidence.evidenceId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{evidence.evidenceId} · {evidence.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{evidence.evidenceType} · Owner {evidence.owner} · expires {formatDate(evidence.expirationDate)}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{evidence.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{evidence.requirementLinks.length} control links</span>
                    <span>{evidence.auditPackageLinks.length} package links</span>
                    <span>Reviewer {evidence.reviewer}</span>
                  </div>
                </div>
                <StatusBadge status={evidence.status} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Evidence traceability">
        <div className="grid gap-3 md:grid-cols-2">
          {system.evidenceObjects.flatMap((evidence) => evidence.requirementLinks.map((link) => (
            <article key={`${evidence.id}-${link.id}`} className="rounded-md border border-line bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">{link.evidenceRequirement.regulatoryControl?.regulation.name ?? "Unmapped regulation"}</div>
              <h3 className="mt-1 text-sm font-semibold text-ink">{link.evidenceRequirement.controlId} {"->"} {evidence.evidenceId}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{link.evidenceRequirement.rationale}</p>
              <Link href={`/evidence/${evidence.evidenceId}`} className="mt-3 inline-block text-xs font-semibold text-brand hover:text-blue-700">Review Evidence</Link>
            </article>
          )))}
        </div>
      </Section>

      <Section title="Evidence downloads">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {system.evidenceObjects.map((evidence) => (
            <article key={evidence.id} className="rounded-md border border-line bg-white p-4">
              <div className="text-sm font-semibold text-ink">{evidence.evidenceId}</div>
              <div className="mt-1 text-xs text-slate-500">{evidence.title}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <DownloadLink href={`/evidence/${evidence.evidenceId}/download?format=markdown`} label="Markdown" />
                <DownloadLink href={`/evidence/${evidence.evidenceId}/download?format=json`} label="JSON" />
                <DownloadLink href={`/evidence/${evidence.evidenceId}/download?format=text`} label="Text" />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Evidence packages">
        <div className="grid gap-4 md:grid-cols-2">
          {system.auditPackages.map((auditPackage) => (
            <article key={auditPackage.id} className="rounded-md border border-line bg-white p-5">
              <div className="flex items-start gap-3">
                <FileArchive className="mt-0.5 h-5 w-5 text-brand" />
                <div>
                  <h3 className="text-sm font-semibold text-ink">{auditPackage.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{auditPackage.scope}</p>
                  <div className="mt-2 text-xs text-slate-500">{auditPackage.packageId} · {auditPackage.evidenceLinks.length} evidence objects</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Evidence requirements and health">
        <div className="rounded-md border border-line bg-white">
          {system.evidenceHealth.map((record) => (
            <div key={record.id} className="flex flex-col gap-3 border-b border-line p-4 last:border-0 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm font-semibold text-ink">{record.evidenceRequirement.requirementId}</div>
                <div className="mt-1 text-xs text-slate-500">{record.evidenceRequirement.evidenceType} · {record.evidenceRequirement.controlId}</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{record.rationale}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={record.health} />
                <StatusBadge status={record.validation} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function DownloadLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded border border-line bg-panel px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white">
      {label}
    </Link>
  );
}
