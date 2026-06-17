import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, GitBranch } from "lucide-react";
import { getEvidenceObject } from "../../data";
import { formatDate } from "../../components/format";
import { Breadcrumbs, LearningPanel, ProofChain, Section, StatusBadge, TaskLink, WorkflowContext } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function EvidenceDetailPage({ params }: { params: Promise<{ evidenceId: string }> }) {
  const { evidenceId } = await params;
  const evidence = await getEvidenceObject(evidenceId);
  if (!evidence) notFound();

  const linkedControls = evidence.requirementLinks.map((link) => link.evidenceRequirement);
  const linkedFindings = evidence.aiRiskLinks.flatMap((link) => link.aiRisk.findingLinks.map((findingLink) => findingLink.finding));
  const linkedExceptions = linkedFindings.flatMap((finding) => finding.exceptions);
  const relatedImplementationEvidence = evidence.aiSystem.controlImplementations.flatMap((implementation) =>
    implementation.evidence
      .filter((implementationEvidence) => implementationEvidence.location === evidence.source || implementationEvidence.evidenceType === evidence.evidenceType)
      .map((implementationEvidence) => ({ implementation, implementationEvidence }))
  );

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Evidence & Assurance", href: "/evidence-assurance" }, { label: "Repository", href: "/evidence-assurance/repository" }, { label: evidence.evidenceId }]} />
          <p className="text-sm font-medium text-brand">Evidence detail</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{evidence.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{evidence.description}</p>
          <WorkflowContext
            title="Evidence review workflow"
            why="This page reviews a governed evidence object: ownership, review state, expiration, linked controls, risks, findings, exceptions, and package readiness."
            next="Check traceability, open linked controls or findings, download the evidence package format if needed, then return to the system evidence workspace."
            backHref={`/systems/${evidence.aiSystem.slug}/evidence`}
            backLabel="Back to System Evidence"
          />
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
            <Fact label="Status" value={evidence.status} />
            <Fact label="Validation status" value={linkedControls.length > 0 ? "Traceable" : "Unmapped"} />
            <Fact label="Approval date" value={formatDate(evidence.approvalDate)} />
            <Fact label="Expiration date" value={formatDate(evidence.expirationDate)} />
            <Fact label="Source" value={evidence.source} />
            <Fact label="Last updated" value={formatDate(evidence.lastUpdated)} />
          </dl>
        </div>
        <div className="space-y-4">
          <LearningPanel title="Evidence as proof">
            This record shows who owns the evidence, who reviewed it, what it supports, when it expires, and how it connects to controls, risks, findings, exceptions, and audit packages.
          </LearningPanel>
          <div className="rounded-md border border-line bg-white p-4">
            <div className="text-sm font-semibold text-ink">Downloads</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <DownloadLink href={`/evidence/${evidence.evidenceId}/download?format=markdown`} label="Markdown" />
              <DownloadLink href={`/evidence/${evidence.evidenceId}/download?format=json`} label="JSON" />
              <DownloadLink href={`/evidence/${evidence.evidenceId}/download?format=text`} label="Text" />
            </div>
          </div>
        </div>
      </div>

      <Section title="Evidence accessibility path">
        <ProofChain steps={[
          { stage: "control", title: linkedControls[0]?.controlId ?? "Unmapped control", detail: linkedControls[0]?.rationale ?? "No mapped control requirement yet.", href: linkedControls[0] ? `/controls/${linkedControls[0].controlId}` : undefined, status: linkedControls.length ? "PRESENT" : "MISSING" },
          { stage: "requirement", title: linkedControls[0]?.evidenceType ?? evidence.evidenceType, detail: "Evidence requirement this object is expected to satisfy.", status: linkedControls.length ? "PRESENT" : "MISSING" },
          { stage: "source", title: evidence.source, detail: `${evidence.aiSystem.name} evidence source`, href: `/systems/${evidence.aiSystem.slug}/evidence`, status: "PRESENT" },
          { stage: "artifact", title: evidence.evidenceId, detail: evidence.title, href: `/evidence/${evidence.evidenceId}`, status: evidence.status, current: true },
          { stage: "assurance", title: linkedControls.length ? "Traceable" : "Unmapped", detail: linkedControls.length ? "Linked to control requirements and regulatory mappings." : "Needs control requirement mapping before assurance can be trusted.", href: "#evidence-traceability", status: linkedControls.length ? "PRESENT" : "WARNING" },
          { stage: "traceability", title: `${linkedFindings.length} finding(s)`, detail: linkedFindings.length ? "Evidence also participates in finding or exception review." : "No active finding depends on this evidence.", href: linkedFindings[0] ? `/findings#finding-${linkedFindings[0].findingId}` : "#evidence-traceability", status: linkedFindings.length ? "WARNING" : "PASS" },
          { stage: "package", title: evidence.auditPackageLinks.length ? "Package linked" : "Not packaged", detail: evidence.auditPackageLinks.length ? "This evidence is already included in an audit package." : "Add to a package when review is complete.", href: "/audit-packages", status: evidence.auditPackageLinks.length ? "PRESENT" : "MISSING" }
        ]} />
      </Section>

      <Section id="evidence-traceability" title="Evidence traceability">
        <div className="grid gap-4 lg:grid-cols-3">
          <TracePanel title="Regulation -> Requirement -> Control -> Evidence">
            {linkedControls.length > 0 ? linkedControls.map((requirement) => (
              <div key={requirement.id} className="rounded border border-line bg-panel p-3">
                <div className="text-xs font-semibold text-brand">{requirement.regulatoryControl?.regulation.name ?? "Unmapped regulation"}</div>
                <Link href={`/controls/${requirement.controlId}`} className="mt-1 block text-sm font-semibold text-ink hover:text-brand">{requirement.controlId}</Link>
                <div className="mt-1 text-xs text-slate-500">
                  Requirements: {requirement.regulatoryControl?.requirementMappings.map((mapping) => mapping.requirement.referenceId).join(", ") || "Not linked"}
                </div>
              </div>
            )) : <Empty text="No mapped regulatory control." />}
          </TracePanel>
          <TracePanel title="Evidence -> Risk -> Finding -> Exception">
            {evidence.aiRiskLinks.length > 0 ? evidence.aiRiskLinks.map((link) => (
              <div key={link.id} className="rounded border border-line bg-panel p-3">
                <div className="text-sm font-semibold text-ink">{link.aiRisk.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Findings: {link.aiRisk.findingLinks.map((findingLink) => findingLink.finding.findingId).join(", ") || "None linked"}
                </div>
              </div>
            )) : <Empty text="No linked AI risks." />}
          </TracePanel>
          <TracePanel title="Implementation -> Evidence">
            {relatedImplementationEvidence.length > 0 ? relatedImplementationEvidence.map(({ implementation, implementationEvidence }) => (
              <div key={implementationEvidence.id} className="rounded border border-line bg-panel p-3">
                <div className="text-sm font-semibold text-ink">{implementation.title}</div>
                <div className="mt-1 text-xs text-slate-500">{implementation.primaryControl.code} · {implementationEvidence.evidenceId}</div>
              </div>
            )) : <Empty text="No direct implementation evidence match." />}
          </TracePanel>
        </div>
      </Section>

      <Section title="Relationships">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Relation title="AI System" href={`/systems/${evidence.aiSystem.slug}`} value={evidence.aiSystem.name} />
          <Relation title="Risks" href={`/systems/${evidence.aiSystem.slug}/risk`} value={`${evidence.aiRiskLinks.length} linked`} />
          <Relation title="Findings" href={linkedFindings[0] ? `/findings#finding-${linkedFindings[0].findingId}` : "/findings"} value={`${linkedFindings.length} linked`} />
          <Relation title="Exceptions" href="/exceptions" value={`${linkedExceptions.length} linked`} />
        </div>
      </Section>

      <Section title="Evidence provenance">
        <div className="grid gap-4 lg:grid-cols-3">
          <Provenance title="Source and version" rows={[`Source: ${evidence.source}`, `Version: ${evidence.version}`, `Expiration: ${formatDate(evidence.expirationDate)}`]} />
          <Provenance title="Ownership and approval" rows={[`Owner: ${evidence.owner}`, `Reviewer: ${evidence.reviewer}`, `Approval: ${formatDate(evidence.approvalDate)}`]} />
          <Provenance title="Linked governance objects" rows={[`Controls: ${linkedControls.map((control) => control.controlId).join(", ") || "None"}`, `Risks: ${evidence.aiRiskLinks.map((link) => link.aiRisk.riskId).join(", ") || "None"}`, `Findings: ${linkedFindings.map((finding) => finding.findingId).join(", ") || "None"}`, `Regulations: ${linkedControls.map((control) => control.regulatoryControl?.regulation.name).filter(Boolean).join(", ") || "None"}`]} />
        </div>
      </Section>

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
              <div className="mt-4 flex flex-wrap gap-2">
                <TaskLink href={`/controls/${requirement.controlId}`}>Review Control</TaskLink>
                <TaskLink href={`/systems/${evidence.aiSystem.slug}/evidence`}>Review System Evidence</TaskLink>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Audit history">
        <div className="grid gap-3">
          {evidence.aiSystem.auditEvents.slice(0, 6).map((event) => (
            <article key={event.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start gap-3">
                <GitBranch className="mt-0.5 h-4 w-4 text-brand" />
                <div>
                  <div className="text-sm font-semibold text-ink">{event.eventType}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{event.summary}</p>
                  <div className="mt-1 text-xs text-slate-500">{event.actor} · {formatDate(event.createdAt)}</div>
                </div>
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

function DownloadLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
      <Download className="h-3.5 w-3.5 text-brand" />
      {label}
    </Link>
  );
}

function TracePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded border border-line bg-panel p-3 text-sm text-slate-500">{text}</div>;
}

function Relation({ title, value, href }: { title: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </Link>
  );
}

function Provenance({ title, rows }: { title: string; rows: string[] }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
        {rows.map((row) => <div key={row}>{row}</div>)}
      </div>
    </article>
  );
}
