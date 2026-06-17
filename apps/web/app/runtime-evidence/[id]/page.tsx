import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, FileText, ShieldCheck } from "lucide-react";
import { getRuntimeEvidenceArtifact } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { Breadcrumbs, LearningPanel, ProofChain, Section, StatusBadge, WorkflowContext } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function RuntimeEvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artifact = await getRuntimeEvidenceArtifact(id);
  if (!artifact) notFound();

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Evidence & Assurance", href: "/evidence-assurance" }, { label: "Runtime", href: "/evidence-assurance/runtime" }, { label: artifact.artifactId }]} />
          <p className="text-sm font-medium text-brand">Runtime evidence artifact</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{artifact.artifactId}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Sanitized runtime evidence for operational assurance. No secrets, tokens, credentials, customer content, personal data, or sensitive runtime payloads are stored.
          </p>
          <WorkflowContext
            title="Runtime proof workflow"
            why="This page proves operational activity with sanitized runtime metadata linked to a control."
            next="Review source, validation, assurance, and control traceability before relying on this artifact in an audit package."
            backHref="/evidence-assurance/runtime"
            backLabel="Back to Runtime Evidence"
          />
        </div>
        <StatusBadge status={artifact.validationStatus} />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-md border border-line bg-white p-5">
          <dl className="grid gap-3 md:grid-cols-2">
            <Fact label="Evidence Type" value={humanize(artifact.evidenceType)} />
            <Fact label="Event Type" value={humanize(artifact.eventType)} />
            <Fact label="Timestamp" value={formatDate(artifact.eventTimestamp)} />
            <Fact label="Correlation ID" value={artifact.correlationId} />
            <Fact label="Source Record" value={artifact.sourceRecordId} />
            <Fact label="Related Control" value={artifact.relatedControlId} href={`/controls/${artifact.relatedControlId}`} />
            <Fact label="Collection Date" value={formatDate(artifact.collectionDate)} />
            <Fact label="Evidence Health" value={humanize(artifact.evidenceHealth)} />
            <Fact label="Retention Valid" value={artifact.retentionValid ? "Yes" : "No"} />
            <Fact label="Collection Current" value={artifact.collectionCurrent ? "Yes" : "No"} />
            <Fact label="Hash" value={artifact.hash} wide />
            <Fact label="Validation" value={humanize(artifact.validationStatus)} />
          </dl>
        </article>
        <LearningPanel title="Privacy boundary">
          Runtime evidence should prove operational reality without collecting customer content. Phase 9C.1 stores sanitized evidence: source, timestamp, action or control metadata, result, correlation ID, hash, validation, and control linkage.
        </LearningPanel>
      </div>

      <Section title="Runtime evidence">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Evidence summary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
            <div className="mt-4 grid gap-3">
              <InfoLine label="Collection Reason" value={artifact.collectionReason} />
              <InfoLine label="Retention Policy" value={artifact.retentionPolicy} />
            </div>
          </article>
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Sanitized evidence</h2>
            <pre className="mt-3 max-h-[30rem] overflow-auto rounded border border-line bg-slate-950 p-4 text-xs leading-6 text-slate-100">{artifact.sanitizedEvidence}</pre>
          </article>
        </div>
      </Section>

      <Section title="Proof path">
        <ProofChain steps={[
          { stage: "control", title: artifact.relatedControlId, detail: artifact.control?.title ?? "Runtime control mapping", href: `/controls/${artifact.relatedControlId}`, status: "PRESENT" },
          { stage: "requirement", title: humanize(artifact.evidenceType), detail: "Runtime evidence required to prove operational control execution.", status: "PRESENT" },
          { stage: "source", title: artifact.logSource.name, detail: artifact.logSource.location, href: "#runtime-source", status: artifact.logSource.status },
          { stage: "artifact", title: artifact.artifactId, detail: `${humanize(artifact.eventType)} · ${artifact.correlationId}`, href: `/runtime-evidence/${artifact.artifactId}`, status: artifact.validationStatus, current: true },
          { stage: "assurance", title: humanize(artifact.validationStatus), detail: artifact.assuranceSummary, href: "#runtime-assurance", status: artifact.validationStatus },
          { stage: "traceability", title: "Control linked", detail: "Runtime artifact links directly to the supporting control.", href: "#runtime-chain", status: "PRESENT" },
          { stage: "package", title: artifact.collectionCurrent && artifact.retentionValid ? "Package-ready check" : "Needs review", detail: artifact.failureCondition, href: "/audit-packages", status: artifact.collectionCurrent && artifact.retentionValid ? "PASS" : "WARNING" }
        ]} />
      </Section>

      <Section title="Runtime source">
        <article id="runtime-source" className="rounded-md border border-line bg-white p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Activity className="h-4 w-4 text-brand" />
                {artifact.logSource.logSourceId} · {artifact.logSource.name}
              </div>
              <p className="mt-1 text-xs text-slate-500">{artifact.logSource.aiSystem.name} · {humanize(artifact.logSource.type)} · {artifact.logSource.location}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.logSource.sourceGap}</p>
              <p className="mt-1 text-xs text-slate-500">Retention: {artifact.logSource.retentionPeriod} · Last collected {artifact.logSource.lastCollected ? formatDate(artifact.logSource.lastCollected) : "not collected"}</p>
            </div>
            <StatusBadge status={artifact.logSource.status} />
          </div>
        </article>
      </Section>

      <Section title="Runtime assurance">
        <div id="runtime-assurance" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AssuranceCard title="Why was this collected?" icon={<FileText className="h-4 w-4 text-brand" />} text={artifact.collectionRationale} />
          <AssuranceCard title="Which control depends on it?" icon={<ShieldCheck className="h-4 w-4 text-brand" />} text={`${artifact.relatedControlId}${artifact.control ? ` · ${artifact.control.title}` : ""}`} href={`/controls/${artifact.relatedControlId}`} />
          <AssuranceCard title="What operational proof does it provide?" icon={<Activity className="h-4 w-4 text-brand" />} text={artifact.assuranceSummary} />
          <AssuranceCard title="What would fail if it disappeared?" icon={<Activity className="h-4 w-4 text-brand" />} text={artifact.failureCondition} tone="risk" />
        </div>
      </Section>

      <Section title="Evidence chain">
        <div id="runtime-chain" className="grid gap-3 lg:grid-cols-6">
          <ChainLink title="Control" value={artifact.relatedControlId} detail={artifact.control?.title ?? "Control mapping"} href={`/controls/${artifact.relatedControlId}`} />
          <ChainBox title="Validation" value={humanize(artifact.validationStatus)} detail={artifact.assuranceSummary} />
          <ChainBox title="Evidence" value={artifact.artifactId} detail={`${humanize(artifact.evidenceType)} · ${humanize(artifact.evidenceHealth)}`} />
          <ChainBox title="Source" value={artifact.logSource.name} detail={artifact.logSource.location} />
          <ChainBox title="Collection" value={formatDate(artifact.collectionDate)} detail={artifact.correlationId} />
          <ChainBox title="Version" value={artifact.hash.slice(0, 12)} detail="Sanitized evidence hash" />
        </div>
      </Section>

      <Section title="Governance context">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-md border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink">Assurance summary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
          </article>
          <article className="rounded-md border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink">Regulatory context</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {artifact.control?.regulatoryMappings.length
                ? artifact.control.regulatoryMappings.map((mapping) => `${mapping.framework} ${mapping.citation}`).join(", ")
                : "No regulatory mapping attached to this control yet."}
            </p>
          </article>
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value, href, wide }: { label: string; value: string; href?: string; wide?: boolean }) {
  const content = href ? <Link href={href} className="hover:text-brand">{value}</Link> : value;
  return (
    <div className={`rounded border border-line bg-panel px-3 py-2 ${wide ? "md:col-span-2" : ""}`}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 break-all text-sm font-semibold text-ink">{content}</dd>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
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
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p> : null}
    </div>
  );
}

function ChainLink({ title, value, detail, href }: { title: string; value: string; detail?: string; href: string }) {
  return (
    <Link href={href} className="rounded border border-line bg-white p-3 hover:bg-panel">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 break-words text-sm font-semibold text-ink">{value}</div>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p> : null}
    </Link>
  );
}
