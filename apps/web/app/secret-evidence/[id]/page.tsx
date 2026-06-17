import Link from "next/link";
import { notFound } from "next/navigation";
import { KeyRound } from "lucide-react";
import { getSecretEvidenceArtifact } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { Breadcrumbs, LearningPanel, ProofChain, Section, StatusBadge, WorkflowContext } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function SecretEvidenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artifact = await getSecretEvidenceArtifact(id);
  if (!artifact) notFound();

  return (
    <>
      <div className="rounded-md border border-line bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Breadcrumbs items={[{ label: "Evidence & Assurance", href: "/evidence-assurance" }, { label: "Secrets Governance", href: "/evidence-assurance/secrets-governance" }, { label: artifact.artifactId }]} />
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand">
              <KeyRound className="h-4 w-4" />
              Secrets Metadata Evidence
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-ink">{artifact.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
            <WorkflowContext
              title="Secrets metadata proof workflow"
              why="This page verifies secret inventory, ownership, rotation, usage mapping, and plaintext-prohibition metadata without collecting secret values."
              next="Review metadata boundary, assurance warnings, source details, and linked controls before using this evidence in a package."
              backHref="/evidence-assurance/secrets-governance"
              backLabel="Back to Secrets Governance"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={artifact.validationStatus} />
            <StatusBadge status={artifact.evidenceHealth} />
            <StatusBadge status={artifact.secretsConnection.status} />
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Fact label="Artifact" value={artifact.artifactId} />
          <Fact label="Evidence Type" value={humanize(artifact.evidenceType)} />
          <Fact label="Source" value={humanize(artifact.source)} />
          <Fact label="Collected" value={formatDate(artifact.collectionTimestamp)} />
        </div>
      </div>

      <Section title="Metadata Boundary">
        <div className="grid gap-4 lg:grid-cols-2">
          <LearningPanel title="Collected metadata">
            Secret identifiers, source systems, environments, owners, rotation metadata, usage mappings, storage locations, access policy metadata, associated AI system, collection timestamp, source, validation status, and metadata hash.
          </LearningPanel>
          <LearningPanel title="Prohibited data">
            Secret values, tokens, passwords, API key values, certificates, private keys, connection strings, customer content, and sensitive payloads are not collected, stored, displayed, logged, hashed, exported, or persisted.
          </LearningPanel>
        </div>
      </Section>

      <Section title="Proof path">
        <ProofChain steps={[
          { stage: "control", title: artifact.relatedControlIds[0] ?? "Unmapped control", detail: artifact.controls[0]?.title ?? "Secrets governance control mapping", href: `/controls/${artifact.relatedControlIds[0] ?? "SEC-001"}`, status: artifact.relatedControlIds.length ? "PRESENT" : "MISSING" },
          { stage: "requirement", title: humanize(artifact.evidenceType), detail: "Secrets metadata evidence required to prove ownership, rotation, inventory, or usage mapping.", status: "PRESENT" },
          { stage: "source", title: artifact.secretsConnection.connectionId, detail: humanize(artifact.secretsConnection.sourceSystem), href: "#secret-source", status: artifact.secretsConnection.status },
          { stage: "artifact", title: artifact.artifactId, detail: artifact.title, href: `/secret-evidence/${artifact.artifactId}`, status: artifact.validationStatus, current: true },
          { stage: "assurance", title: humanize(artifact.validationStatus), detail: artifact.assuranceSummary, href: "#secret-assurance", status: artifact.validationStatus },
          { stage: "traceability", title: `${artifact.controls.length} control(s)`, detail: "Secrets metadata traces to security, audit, operations, and AI governance controls.", href: "#secret-controls", status: artifact.controls.length ? "PRESENT" : "MISSING" },
          { stage: "package", title: artifact.evidenceHealth === "PRESENT" ? "Package-ready check" : "Needs review", detail: artifact.failureCondition, href: "/audit-packages", status: artifact.evidenceHealth === "PRESENT" ? artifact.validationStatus : "WARNING" }
        ]} />
      </Section>

      <Section title="Explainable Assurance">
        <div id="secret-assurance" className="grid gap-3 md:grid-cols-2">
          <Panel title="Why Collected" value={artifact.collectionReason} />
          <Panel title="What It Proves" value={artifact.assuranceSummary} />
          <Panel title="What Fails If It Disappears" value={artifact.failureCondition} />
          <Panel title="Recommended Action" value={artifact.recommendedAction} />
          <Panel title="Evidence Used" value={artifact.evidenceUsed} />
          <Panel title="Control Impact" value={artifact.controlImpact} />
        </div>
      </Section>

      {artifact.warningReason ? (
        <Section title="Warning Explanation">
          <article className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm leading-6 text-slate-800">{artifact.warningReason}</p>
          </article>
        </Section>
      ) : null}

      <Section title="Evidence Metadata">
        <div id="secret-source" className="grid gap-4 lg:grid-cols-2">
          <JsonPanel title="Secret Inventory" value={artifact.secretInventory} />
          <JsonPanel title="Rotation Evidence" value={artifact.rotationEvidence} />
          <JsonPanel title="Ownership Evidence" value={artifact.ownershipEvidence} />
          <JsonPanel title="Usage Mapping" value={artifact.usageMapping} />
          <JsonPanel title="Plaintext Prohibition" value={artifact.plaintextProhibition} />
          <JsonPanel title="Source Gap" value={artifact.sourceGap} />
        </div>
      </Section>

      <Section title="Evidence Chain">
        <div id="secret-controls" className="grid gap-3">
          {artifact.controls.map((control) => (
            <article key={control.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/controls/${control.code}`} className="text-sm font-semibold text-ink hover:text-brand">{control.code} · {control.title}</Link>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{control.description}</p>
                  {control.governanceStory ? <p className="mt-1 text-xs text-slate-500">{control.governanceStory.evidenceNarrative}</p> : null}
                </div>
                <StatusBadge status="TRACEABLE" />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Source Details">
        <div className="grid gap-3 md:grid-cols-2">
          <Fact label="Connection" value={artifact.secretsConnection.connectionId} />
          <Fact label="Connection Source" value={humanize(artifact.secretsConnection.sourceSystem)} />
          <Fact label="Evidence Source" value={artifact.evidenceSource?.sourceId ?? "No source record"} />
          <Fact label="Metadata Hash" value={artifact.hash} />
          <Fact label="Collection Method" value={artifact.collectionMethod} />
          <Fact label="Provenance" value={artifact.provenance} />
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 break-words text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function Panel({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </article>
  );
}

function JsonPanel({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <pre className="mt-3 max-h-96 overflow-auto rounded bg-slate-950 p-3 text-xs leading-5 text-slate-100">{value}</pre>
    </article>
  );
}
