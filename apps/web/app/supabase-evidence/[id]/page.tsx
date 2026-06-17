import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Database, FileText, ShieldCheck } from "lucide-react";
import { getSupabaseEvidenceArtifact } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { Breadcrumbs, LearningPanel, ProofChain, Section, StatusBadge, WorkflowContext } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function SupabaseEvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artifact = await getSupabaseEvidenceArtifact(id);
  if (!artifact) notFound();

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Evidence & Assurance", href: "/evidence-assurance" }, { label: "Data Governance", href: "/evidence-assurance/data-governance" }, { label: artifact.artifactId }]} />
          <p className="text-sm font-medium text-brand">Supabase evidence artifact</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{artifact.title}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Data-governance evidence should prove schema, inventory, policy, access, and audit capability reality without collecting row contents, customer data, secrets, credentials, tokens, or API keys.
          </p>
          <WorkflowContext
            title="Data governance proof workflow"
            why="This page verifies Supabase metadata evidence and control validations without exposing data rows or secrets."
            next="Review snapshots, validations, drift, assurance, and linked controls before adding this proof to an audit package."
            backHref="/evidence-assurance/data-governance"
            backLabel="Back to Data Governance"
          />
        </div>
        <StatusBadge status={artifact.validationStatus} />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-md border border-line bg-white p-5">
          <dl className="grid gap-3 md:grid-cols-2">
            <Fact label="Artifact ID" value={artifact.artifactId} />
            <Fact label="Evidence Type" value={humanize(artifact.evidenceType)} />
            <Fact label="Project" value={artifact.supabaseConnection.projectId} />
            <Fact label="Environment" value={artifact.supabaseConnection.environment} />
            <Fact label="Collection Timestamp" value={formatDate(artifact.collectionTimestamp)} />
            <Fact label="Evidence Health" value={humanize(artifact.evidenceHealth)} />
            <Fact label="Validation" value={humanize(artifact.validationStatus)} />
            <Fact label="Source" value={artifact.source} />
            <Fact label="Hash" value={artifact.hash} wide />
          </dl>
        </article>
        <LearningPanel title="Data governance reality">
          GitHub proves design intent, logs prove operational activity, Portainer proves deployed state, and Supabase should prove whether the data layer is inventoried, protected, reviewable, and auditable.
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
            <h2 className="text-sm font-semibold text-ink">Data evidence snapshot</h2>
            <div className="mt-3 grid gap-3">
              <EvidenceBlock title="Schema Inventory" value={artifact.schemaInventory} />
              <EvidenceBlock title="Table Inventory" value={artifact.tableInventory} />
              <EvidenceBlock title="RLS Status" value={artifact.rlsStatus} />
              <EvidenceBlock title="Enabled Policies" value={artifact.enabledPolicies} />
              <EvidenceBlock title="Database Roles" value={artifact.databaseRoles} />
              <EvidenceBlock title="Audit Capability" value={artifact.auditCapability} />
            </div>
          </article>
        </div>
      </Section>

      <Section title="Proof path">
        <ProofChain steps={[
          { stage: "control", title: artifact.relatedControlIds[0] ?? "Unmapped control", detail: artifact.controls[0]?.title ?? "Data governance control mapping", href: `/controls/${artifact.relatedControlIds[0] ?? "PRI-001"}`, status: artifact.relatedControlIds.length ? "PRESENT" : "MISSING" },
          { stage: "requirement", title: humanize(artifact.evidenceType), detail: "Data-governance evidence required to prove schema, access, policy, or audit posture.", status: "PRESENT" },
          { stage: "source", title: artifact.supabaseConnection.connectionId, detail: `${artifact.supabaseConnection.environment} · ${artifact.source}`, href: "#supabase-source", status: artifact.supabaseConnection.status },
          { stage: "artifact", title: artifact.artifactId, detail: artifact.title, href: `/supabase-evidence/${artifact.artifactId}`, status: artifact.validationStatus, current: true },
          { stage: "assurance", title: `${artifact.controlValidations.length} validation(s)`, detail: artifact.assuranceSummary, href: "#supabase-assurance", status: artifact.validationStatus },
          { stage: "traceability", title: `${artifact.controls.length} control(s)`, detail: "Supabase evidence traces to privacy, security, audit, monitoring, or resilience controls.", href: "#supabase-chain", status: artifact.controls.length ? "PRESENT" : "MISSING" },
          { stage: "package", title: artifact.evidenceHealth === "PRESENT" ? "Package-ready check" : "Needs review", detail: artifact.failureCondition, href: "/audit-packages", status: artifact.evidenceHealth === "PRESENT" ? artifact.validationStatus : "WARNING" }
        ]} />
      </Section>

      <Section title="Supabase source">
        <article id="supabase-source" className="rounded-md border border-line bg-white p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Database className="h-4 w-4 text-brand" />
                {artifact.supabaseConnection.connectionId} · {artifact.supabaseConnection.aiSystem.name}
              </div>
              <p className="mt-1 break-all text-xs text-slate-500">{artifact.supabaseConnection.environment} · project {artifact.supabaseConnection.projectId}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.supabaseConnection.sourceGap}</p>
              <p className="mt-1 text-xs text-slate-500">Last scan {artifact.supabaseConnection.lastScan ? formatDate(artifact.supabaseConnection.lastScan) : "not scanned"}</p>
            </div>
            <StatusBadge status={artifact.supabaseConnection.status} />
          </div>
        </article>
      </Section>

      <Section title="Supabase control validation">
        <div id="supabase-validation" className="grid gap-4 md:grid-cols-2">
          {artifact.controlValidations.length > 0 ? artifact.controlValidations.map((validation) => (
            <article key={validation.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/controls/${validation.controlId}`} className="text-sm font-semibold text-ink hover:text-brand">{validation.controlId}</Link>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{validation.controlImpact}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{validation.recommendedAction}</p>
                </div>
                <StatusBadge status={validation.result} />
              </div>
              <div className="mt-3 grid gap-3">
                <EvidenceBlock title="Evidence Used" value={validation.evidenceUsed} />
                <EvidenceBlock title="Validation Checks" value={validation.validationChecks} />
                <EvidenceBlock title="Change Detected" value={validation.changeDetected} />
                <EvidenceBlock title="Failure Conditions" value={validation.failureConditions} />
              </div>
            </article>
          )) : <EmptyState text="No direct control validation is attached to this artifact yet." />}
        </div>
      </Section>

      <Section title="Supabase drift">
        <div id="supabase-drift" className="grid gap-3">
          {artifact.supabaseConnection.driftEvents.length > 0 ? artifact.supabaseConnection.driftEvents.map((event) => (
            <article key={event.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{humanize(event.eventType)}</div>
                  <p className="mt-1 text-xs text-slate-500">Detected {formatDate(event.detectedAt)} · {event.previousSnapshotId} {"->"} {event.currentSnapshotId}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{event.changeSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{event.controlImpact}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.recommendedAction}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            </article>
          )) : <EmptyState text="No Supabase drift event has been recorded for this connection." />}
        </div>
      </Section>

      <Section title="Supabase snapshots">
        <div id="supabase-snapshots" className="grid gap-4 md:grid-cols-2">
          {artifact.supabaseConnection.snapshots.length > 0 ? artifact.supabaseConnection.snapshots.map((snapshot) => (
            <article key={snapshot.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{snapshot.snapshotId}</div>
                  <p className="mt-1 text-xs text-slate-500">Collected {formatDate(snapshot.collectionTimestamp)} · hash {snapshot.hash.slice(0, 12)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Historical Supabase evidence snapshot preserving metadata version without relying on current database state alone.</p>
                </div>
                <StatusBadge status="COLLECTED" />
              </div>
              <div className="mt-3 grid gap-3">
                <EvidenceBlock title="Schema Inventory" value={snapshot.schemaInventory} />
                <EvidenceBlock title="Table Inventory" value={snapshot.tableInventory} />
                <EvidenceBlock title="RLS Inventory" value={snapshot.rlsInventory} />
                <EvidenceBlock title="Policy Inventory" value={snapshot.policyInventory} />
                <EvidenceBlock title="Role Inventory" value={snapshot.roleInventory} />
                <EvidenceBlock title="Extension Inventory" value={snapshot.extensionInventory} />
              </div>
            </article>
          )) : <EmptyState text="No Supabase evidence snapshot is retained for this connection yet." />}
        </div>
      </Section>

      <Section title="Supabase assurance">
        <div id="supabase-assurance" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AssuranceCard title="Why was this collected?" icon={<FileText className="h-4 w-4 text-brand" />} text={artifact.collectionReason} />
          <AssuranceCard title="Which controls depend on it?" icon={<ShieldCheck className="h-4 w-4 text-brand" />} text={artifact.relatedControlIds.join(", ")} href={`/controls/${artifact.relatedControlIds[0] ?? "PRI-001"}`} />
          <AssuranceCard title="What does it prove?" icon={<Database className="h-4 w-4 text-brand" />} text={artifact.assuranceSummary} />
          <AssuranceCard title="What would fail if it disappeared?" icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} text={artifact.failureCondition} tone="risk" />
        </div>
      </Section>

      <Section title="Evidence chain">
        <div id="supabase-chain" className="grid gap-3 lg:grid-cols-6">
          <ChainLink title="Control" value={artifact.relatedControlIds[0] ?? "Not mapped"} detail={artifact.controls[0]?.title ?? "Data governance control mapping"} href={`/controls/${artifact.relatedControlIds[0] ?? "PRI-001"}`} />
          <ChainBox title="Validation" value={humanize(artifact.validationStatus)} detail={artifact.assuranceSummary} />
          <ChainBox title="Evidence" value={artifact.artifactId} detail={`${humanize(artifact.evidenceType)} · ${humanize(artifact.evidenceHealth)}`} />
          <ChainBox title="Source" value={artifact.supabaseConnection.connectionId} detail={artifact.source} />
          <ChainBox title="Collection" value={formatDate(artifact.collectionTimestamp)} detail={artifact.collectionMethod} />
          <ChainBox title="Version" value={artifact.hash.slice(0, 12)} detail="Supabase metadata evidence hash" />
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

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-line bg-panel p-4 text-sm text-slate-600">{text}</div>;
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
