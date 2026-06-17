import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, FileText, Server, ShieldCheck } from "lucide-react";
import { getDeploymentEvidenceArtifact } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { Breadcrumbs, LearningPanel, ProofChain, Section, StatusBadge, WorkflowContext } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function DeploymentEvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artifact = await getDeploymentEvidenceArtifact(id);
  if (!artifact) notFound();

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Evidence & Assurance", href: "/evidence-assurance" }, { label: "Deployments", href: "/evidence-assurance/deployments" }, { label: artifact.artifactId }]} />
          <p className="text-sm font-medium text-brand">Deployment evidence artifact</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{artifact.artifactId}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Portainer evidence should prove deployed-state reality without collecting secrets, tokens, credentials, environment variable values, customer content, or sensitive runtime payloads.
          </p>
          <WorkflowContext
            title="Deployment proof workflow"
            why="This page verifies deployed-state evidence and explains private infrastructure/source limitations without treating them as outages."
            next="Review source, runtime configuration boundary, assurance, drift, and linked controls before using this artifact in a package."
            backHref="/evidence-assurance/deployments"
            backLabel="Back to Deployment Evidence"
          />
        </div>
        <StatusBadge status={artifact.validationStatus} />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-md border border-line bg-white p-5">
          <dl className="grid gap-3 md:grid-cols-2">
            <Fact label="Deployment ID" value={artifact.deploymentId} />
            <Fact label="Container" value={artifact.containerName} />
            <Fact label="Image" value={`${artifact.imageName}:${artifact.imageTag}`} />
            <Fact label="Deployment Time" value={artifact.deploymentTimestamp ? formatDate(artifact.deploymentTimestamp) : "Not collected"} />
            <Fact label="Collection Timestamp" value={formatDate(artifact.collectionTimestamp)} />
            <Fact label="Health Status" value={artifact.healthStatus} />
            <Fact label="Restart Count" value={artifact.restartCount === null ? "Not collected" : `${artifact.restartCount}`} />
            <Fact label="Logging Enabled" value={artifact.loggingEnabled === null ? "Not collected" : artifact.loggingEnabled ? "Yes" : "No"} />
            <Fact label="Evidence Health" value={humanize(artifact.evidenceHealth)} />
            <Fact label="Validation" value={humanize(artifact.validationStatus)} />
            <Fact label="Hash" value={artifact.hash} wide />
          </dl>
        </article>
        <LearningPanel title="Deployed-state reality">
          GitHub proves design intent and logs prove operational activity. Portainer must prove what is actually deployed: container, image version, runtime health, logging status, and deployment drift.
        </LearningPanel>
      </div>

      <Section title="Deployment evidence">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Evidence summary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
            <div className="mt-4 grid gap-3">
              <InfoLine label="Collection Reason" value={artifact.collectionReason} />
              <InfoLine label="Collection Method" value={artifact.collectionMethod} />
              <InfoLine label="Provenance" value={artifact.provenance} />
            </div>
          </article>
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Safe runtime configuration evidence</h2>
            <pre className="mt-3 max-h-[30rem] overflow-auto rounded border border-line bg-slate-950 p-4 text-xs leading-6 text-slate-100">{artifact.runtimeConfiguration}</pre>
          </article>
        </div>
      </Section>

      <Section title="Proof path">
        <ProofChain steps={[
          { stage: "control", title: artifact.relatedControlIds[0] ?? "Unmapped control", detail: artifact.controls[0]?.title ?? "Deployment control mapping", href: `/controls/${artifact.relatedControlIds[0] ?? "AI-LC-006"}`, status: artifact.relatedControlIds.length ? "PRESENT" : "MISSING" },
          { stage: "requirement", title: "Deployment Evidence", detail: "Deployment evidence required to prove runtime state.", status: "PRESENT" },
          { stage: "source", title: artifact.portainerConnection.connectionId, detail: artifact.portainerConnection.endpoint, href: "#deployment-source", status: artifact.portainerConnection.status },
          { stage: "artifact", title: artifact.artifactId, detail: `${artifact.containerName} · ${artifact.imageName}:${artifact.imageTag}`, href: `/deployment-evidence/${artifact.artifactId}`, status: artifact.validationStatus, current: true },
          { stage: "assurance", title: humanize(artifact.validationStatus), detail: artifact.assuranceSummary, href: "#deployment-assurance", status: artifact.validationStatus },
          { stage: "traceability", title: `${artifact.controls.length} control(s)`, detail: "Deployment artifact traces to lifecycle, operations, or audit controls.", href: "#deployment-chain", status: artifact.controls.length ? "PRESENT" : "MISSING" },
          { stage: "package", title: artifact.driftEvents.length ? "Review drift" : "Package-ready check", detail: artifact.driftEvents.length ? "Resolve drift before package use." : artifact.failureCondition, href: "/audit-packages", status: artifact.driftEvents.length ? "WARNING" : artifact.validationStatus }
        ]} />
      </Section>

      <Section title="Portainer source">
        <article id="deployment-source" className="rounded-md border border-line bg-white p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Server className="h-4 w-4 text-brand" />
                {artifact.portainerConnection.connectionId} · {artifact.portainerConnection.aiSystem.name}
              </div>
              <p className="mt-1 break-all text-xs text-slate-500">{artifact.portainerConnection.environment} · {artifact.portainerConnection.endpoint}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.portainerConnection.sourceGap}</p>
              <p className="mt-1 text-xs text-slate-500">Last scan {artifact.portainerConnection.lastScan ? formatDate(artifact.portainerConnection.lastScan) : "not scanned"}</p>
            </div>
            <StatusBadge status={artifact.portainerConnection.status} />
          </div>
        </article>
      </Section>

      <Section title="Deployment assurance">
        <div id="deployment-assurance" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AssuranceCard title="Why was this collected?" icon={<FileText className="h-4 w-4 text-brand" />} text={artifact.collectionReason} />
          <AssuranceCard title="Which controls depend on it?" icon={<ShieldCheck className="h-4 w-4 text-brand" />} text={artifact.relatedControlIds.join(", ")} href={`/controls/${artifact.relatedControlIds[0] ?? "AI-LC-006"}`} />
          <AssuranceCard title="What does it prove?" icon={<Server className="h-4 w-4 text-brand" />} text={artifact.assuranceSummary} />
          <AssuranceCard title="What would fail if it disappeared?" icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} text={artifact.failureCondition} tone="risk" />
        </div>
      </Section>

      <Section title="Deployment drift">
        <div id="deployment-drift" className="grid gap-3">
          {artifact.driftEvents.map((event) => (
            <article key={event.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{humanize(event.eventType)}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{event.summary}</p>
                  <p className="mt-1 text-xs text-slate-500">Previous: {event.previousValue} · Current: {event.currentValue} · Detected {formatDate(event.detectedAt)}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Evidence chain">
        <div id="deployment-chain" className="grid gap-3 lg:grid-cols-6">
          <ChainLink title="Control" value={artifact.relatedControlIds[0] ?? "Not mapped"} detail={artifact.controls[0]?.title ?? "Deployment control mapping"} href={`/controls/${artifact.relatedControlIds[0] ?? "AI-LC-006"}`} />
          <ChainBox title="Validation" value={humanize(artifact.validationStatus)} detail={artifact.assuranceSummary} />
          <ChainBox title="Evidence" value={artifact.artifactId} detail={`${artifact.containerName} · ${humanize(artifact.evidenceHealth)}`} />
          <ChainBox title="Source" value={artifact.portainerConnection.connectionId} detail={artifact.portainerConnection.endpoint} />
          <ChainBox title="Collection" value={formatDate(artifact.collectionTimestamp)} detail={artifact.collectionMethod} />
          <ChainBox title="Version" value={artifact.hash.slice(0, 12)} detail="Deployment evidence hash" />
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
