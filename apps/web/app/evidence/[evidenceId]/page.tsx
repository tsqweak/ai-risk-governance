import { notFound } from "next/navigation";
import { getEvidenceObject } from "../../data";
import { formatDate } from "../../components/format";
import { LearningPanel, Section, StatusBadge } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function EvidenceDetailPage({ params }: { params: Promise<{ evidenceId: string }> }) {
  const { evidenceId } = await params;
  const evidence = await getEvidenceObject(evidenceId);
  if (!evidence) notFound();

  const linkedControls = evidence.requirementLinks.map((link) => link.evidenceRequirement);

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Evidence detail</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{evidence.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{evidence.description}</p>
        </div>
        <StatusBadge status={evidence.status} />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-line bg-white p-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact label="Evidence ID" value={evidence.evidenceId} />
            <Fact label="AI System" value={evidence.aiSystem.name} />
            <Fact label="Evidence type" value={evidence.evidenceType} />
            <Fact label="Version" value={evidence.version} />
            <Fact label="Owner" value={evidence.owner} />
            <Fact label="Reviewer" value={evidence.reviewer} />
            <Fact label="Approval date" value={formatDate(evidence.approvalDate)} />
            <Fact label="Expiration date" value={formatDate(evidence.expirationDate)} />
            <Fact label="Source" value={evidence.source} />
            <Fact label="Last updated" value={formatDate(evidence.lastUpdated)} />
          </dl>
        </div>
        <LearningPanel title="Approval history">
          This MVP stores the approved evidence object, reviewer, approval date, version, source, and expiration date. Future phases can extend this into full workflow history and immutable attestations.
        </LearningPanel>
      </div>

      <Section title="Linked controls and regulations">
        <div className="grid gap-4 md:grid-cols-2">
          {linkedControls.map((requirement) => (
            <article key={requirement.id} className="rounded-md border border-line bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">{requirement.controlId}</div>
              <h2 className="mt-2 text-base font-semibold text-ink">{requirement.evidenceType}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{requirement.rationale}</p>
              <div className="mt-4 text-xs text-slate-500">
                Regulation: {requirement.regulatoryControl?.regulation.name ?? "Not linked"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Requirement references: {requirement.regulatoryControl?.requirementMappings.map((mapping) => mapping.requirement.referenceId).join(", ") || "Not linked"}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
