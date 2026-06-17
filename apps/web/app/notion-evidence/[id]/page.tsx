import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, BookOpen, FileText, ShieldCheck, Users } from "lucide-react";
import { getNotionEvidenceArtifact } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { Breadcrumbs, LearningPanel, ProofChain, Section, StatusBadge, WorkflowContext } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function NotionEvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artifact = await getNotionEvidenceArtifact(id);
  if (!artifact) notFound();

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Evidence & Assurance", href: "/evidence-assurance" }, { label: "Governance Evidence", href: "/evidence-assurance/governance-evidence" }, { label: artifact.artifactId }]} />
          <p className="text-sm font-medium text-brand">Notion governance evidence artifact</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{artifact.title}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Notion evidence should prove human governance reality without collecting personal notes, unrelated workspace content, customer content, secrets, credentials, or unnecessary page body content.
          </p>
          <WorkflowContext
            title="Human governance proof workflow"
            why="This page verifies approval, review, committee, ownership, and documentation evidence that technical connectors cannot prove."
            next="Review source availability, human-governance evidence, assurance, and linked controls before relying on this proof."
            backHref="/evidence-assurance/governance-evidence"
            backLabel="Back to Governance Evidence"
          />
        </div>
        <StatusBadge status={artifact.validationStatus} />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-md border border-line bg-white p-5">
          <dl className="grid gap-3 md:grid-cols-2">
            <Fact label="Artifact ID" value={artifact.artifactId} />
            <Fact label="Evidence Type" value={humanize(artifact.evidenceType)} />
            <Fact label="Workspace" value={artifact.notionConnection.workspaceName} />
            <Fact label="Connection" value={artifact.notionConnection.connectionId} />
            <Fact label="Collection Timestamp" value={formatDate(artifact.collectionTimestamp)} />
            <Fact label="Last Modified" value={artifact.lastModified ? formatDate(artifact.lastModified) : "not available"} />
            <Fact label="Evidence Health" value={humanize(artifact.evidenceHealth)} />
            <Fact label="Validation" value={humanize(artifact.validationStatus)} />
            <Fact label="Source" value={artifact.source} wide />
            <Fact label="Hash" value={artifact.hash} wide />
          </dl>
        </article>
        <LearningPanel title="Human governance reality">
          GitHub, logs, Portainer, Supabase, and MCP prove technical reality. Notion should prove the accountable human decisions and reviews that make governance real.
        </LearningPanel>
      </div>

      <Section title="Evidence summary">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Assurance context</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
            <div className="mt-4 grid gap-3">
              <InfoLine label="Collection Reason" value={artifact.collectionReason} />
              <InfoLine label="Collection Method" value={artifact.collectionMethod} />
              <InfoLine label="Provenance" value={artifact.provenance} />
            </div>
          </article>
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Notion governance evidence snapshot</h2>
            <div className="mt-3 grid gap-3">
              <EvidenceBlock title="Governance Pages" value={artifact.governancePages} />
              <EvidenceBlock title="Governance Databases" value={artifact.governanceDatabases} />
              <EvidenceBlock title="Approval Records" value={artifact.approvalRecords} />
              <EvidenceBlock title="Review Records" value={artifact.reviewRecords} />
              <EvidenceBlock title="Committee Records" value={artifact.committeeRecords} />
              <EvidenceBlock title="Ownership Records" value={artifact.ownershipRecords} />
              <EvidenceBlock title="Governance Documentation" value={artifact.governanceDocumentation} />
            </div>
          </article>
        </div>
      </Section>

      <Section title="Proof path">
        <ProofChain steps={[
          { stage: "control", title: artifact.relatedControlIds[0] ?? "Unmapped control", detail: artifact.controls[0]?.title ?? "Human governance control mapping", href: `/controls/${artifact.relatedControlIds[0] ?? "GOV-001"}`, status: artifact.relatedControlIds.length ? "PRESENT" : "MISSING" },
          { stage: "requirement", title: humanize(artifact.evidenceType), detail: "Human-governance evidence required to prove accountability and review.", status: "PRESENT" },
          { stage: "source", title: artifact.notionConnection.connectionId, detail: artifact.notionConnection.workspaceName, href: "#notion-source", status: artifact.notionConnection.status },
          { stage: "artifact", title: artifact.artifactId, detail: artifact.title, href: `/notion-evidence/${artifact.artifactId}`, status: artifact.validationStatus, current: true },
          { stage: "assurance", title: humanize(artifact.validationStatus), detail: artifact.assuranceSummary, href: "#notion-assurance", status: artifact.validationStatus },
          { stage: "traceability", title: `${artifact.controls.length} control(s)`, detail: "Human governance evidence traces to approval, review, and ownership controls.", href: "#notion-chain", status: artifact.controls.length ? "PRESENT" : "MISSING" },
          { stage: "package", title: artifact.evidenceHealth === "PRESENT" ? "Package-ready check" : "Needs review", detail: artifact.failureCondition, href: "/audit-packages", status: artifact.evidenceHealth === "PRESENT" ? artifact.validationStatus : "WARNING" }
        ]} />
      </Section>

      <Section title="Notion source">
        <article id="notion-source" className="rounded-md border border-line bg-white p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <BookOpen className="h-4 w-4 text-brand" />
                {artifact.notionConnection.connectionId} · {artifact.notionConnection.aiSystem.name}
              </div>
              <p className="mt-1 text-xs text-slate-500">{artifact.notionConnection.workspaceName}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.notionConnection.sourceGap}</p>
              <p className="mt-1 text-xs text-slate-500">Last scan {artifact.notionConnection.lastScan ? formatDate(artifact.notionConnection.lastScan) : "not scanned"}</p>
            </div>
            <StatusBadge status={artifact.notionConnection.status} />
          </div>
        </article>
      </Section>

      <Section title="Human governance assurance">
        <div id="notion-assurance" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AssuranceCard title="Why was this collected?" icon={<FileText className="h-4 w-4 text-brand" />} text={artifact.collectionReason} />
          <AssuranceCard title="Which controls depend on it?" icon={<ShieldCheck className="h-4 w-4 text-brand" />} text={artifact.relatedControlIds.join(", ")} href={`/controls/${artifact.relatedControlIds[0] ?? "GOV-001"}`} />
          <AssuranceCard title="What does it prove?" icon={<Users className="h-4 w-4 text-brand" />} text={artifact.assuranceSummary} />
          <AssuranceCard title="What would fail if it disappeared?" icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} text={artifact.failureCondition} tone="risk" />
        </div>
      </Section>

      <Section title="Evidence chain">
        <div id="notion-chain" className="grid gap-3 lg:grid-cols-6">
          <ChainLink title="Control" value={artifact.relatedControlIds[0] ?? "Not mapped"} detail={artifact.controls[0]?.title ?? "Human governance control mapping"} href={`/controls/${artifact.relatedControlIds[0] ?? "GOV-001"}`} />
          <ChainBox title="Validation" value={humanize(artifact.validationStatus)} detail={artifact.assuranceSummary} />
          <ChainBox title="Evidence" value={artifact.artifactId} detail={`${humanize(artifact.evidenceType)} · ${humanize(artifact.evidenceHealth)}`} />
          <ChainBox title="Source" value={artifact.notionConnection.connectionId} detail={artifact.source} />
          <ChainBox title="Collection" value={formatDate(artifact.collectionTimestamp)} detail={artifact.collectionMethod} />
          <ChainBox title="Version" value={artifact.lastModified ? formatDate(artifact.lastModified) : "not available"} detail={`Hash ${artifact.hash.slice(0, 12)}`} />
        </div>
      </Section>

      <Section title="Control traceability">
        <div className="grid gap-3 md:grid-cols-2">
          {artifact.controls.map((control) => (
            <Link key={control.id} href={`/controls/${control.code}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="text-sm font-semibold text-ink">{control.code} · {control.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{control.description}</p>
              <p className="mt-1 text-xs text-slate-500">{control.regulatoryMappings.map((mapping) => `${mapping.framework} ${mapping.citation}`).join(", ") || "No regulatory mapping attached."}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded border border-line bg-panel px-3 py-2 ${wide ? "md:col-span-2" : ""}`}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 break-all text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <p className="mt-1 break-words text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function EvidenceBlock({ title, value }: { title: string; value: string }) {
  return (
    <details className="rounded border border-line bg-panel p-3">
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</summary>
      <pre className="mt-3 max-h-64 overflow-auto rounded border border-line bg-slate-950 p-4 text-xs leading-6 text-slate-100">{value}</pre>
    </details>
  );
}

function AssuranceCard({ title, text, icon, href, tone }: { title: string; text: string; icon: React.ReactNode; href?: string; tone?: "risk" }) {
  const body = (
    <article className={`rounded-md border p-4 ${tone === "risk" ? "border-amber-200 bg-amber-50" : "border-line bg-white"}`}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">{icon}{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </article>
  );
  return href ? <Link href={href} className="block hover:opacity-90">{body}</Link> : body;
}

function ChainBox({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <div className="rounded border border-line bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 break-words text-sm font-semibold text-ink">{value}</div>
      {detail ? <p className="mt-1 break-words text-xs leading-5 text-slate-600">{detail}</p> : null}
    </div>
  );
}

function ChainLink({ title, value, detail, href }: { title: string; value: string; detail?: string; href: string }) {
  return (
    <Link href={href} className="rounded border border-line bg-white p-3 hover:bg-panel">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 break-words text-sm font-semibold text-ink">{value}</div>
      {detail ? <p className="mt-1 break-words text-xs leading-5 text-slate-600">{detail}</p> : null}
    </Link>
  );
}
