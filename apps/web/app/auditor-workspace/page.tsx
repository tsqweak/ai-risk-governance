import Link from "next/link";
import { AlertTriangle, ClipboardCheck, FileSearch, GitBranch, PackageCheck, Radar } from "lucide-react";
import { getAuditPackages, getEvidenceRepository, getExecutiveCommandCenter } from "../data";
import { formatDate } from "../components/format";
import { ActionRequiredList, Breadcrumbs, Metric, ProofChain, Section, SecondaryNav, StatusBadge } from "../components/ui";
import { auditorSecondaryNav } from "../navigation-model";

export const dynamic = "force-dynamic";

export default async function AuditorWorkspacePage() {
  const [data, evidence, packages] = await Promise.all([getExecutiveCommandCenter(), getEvidenceRepository(), getAuditPackages()]);
  const evidenceGaps = data.evidenceHealth.filter((record) => record.health === "MISSING" || record.health === "EXPIRED");
  const failedRuns = data.testRuns.filter((run) => run.result === "FAIL");
  const reviewQueue = evidence.objects.filter((object) => object.status === "SUBMITTED" || object.status === "DRAFT" || object.status === "EXPIRED");
  const recentEvidence = [...evidence.objects].sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()).slice(0, 5);
  const evidenceExceptions = data.activeExceptions.filter((exception) => exception.finding.description.toLowerCase().includes("evidence") || exception.rationale.toLowerCase().includes("evidence"));
  const actionItems = [
    ...evidenceGaps.slice(0, 3).map((record) => ({
      href: `/evidence-health#evidence-health-${record.id}`,
      title: `${record.aiSystem.name}: ${record.evidenceRequirement.evidenceType}`,
      detail: record.rationale,
      status: record.health,
      category: "Evidence Gap",
      owner: record.aiSystem.riskOwner || record.aiSystem.businessOwner,
      dueDate: "Before package readiness",
      severity: record.health === "MISSING" || record.health === "EXPIRED" ? "HIGH" : "MEDIUM",
      impact: `Control ${record.evidenceRequirement.controlId} cannot be treated as package-ready while evidence is ${formatDate(record.calculatedAt)} / ${record.health}.`,
      evidenceUsed: `${record.evidenceRequirement.evidenceType} · ${record.validation}`,
      actionLabel: "Review Evidence",
      nextStep: "Request or refresh the required evidence.",
      recommendedAction: "Inspect the mapped evidence requirement and request the missing or refreshed proof."
    })),
    ...failedRuns.slice(0, 3).map((run) => ({
      href: `/systems/${run.aiSystem.slug}/monitoring#run-${run.id}`,
      title: `${run.controlTest.testId} failed for ${run.aiSystem.name}`,
      detail: run.resultDetails,
      status: run.result,
      category: "Failed Validation",
      owner: run.aiSystem.riskOwner || run.aiSystem.businessOwner,
      severity: run.controlTest.severityIfFailed,
      dueDate: "Immediate review",
      impact: run.controlTest.whyItMatters,
      evidenceUsed: `${run.controlTest.testId} · ${run.evidenceReference}`,
      actionLabel: "Review Failed Test",
      nextStep: "Verify whether the failed validation has sufficient compensating proof.",
      recommendedAction: "Review the exact monitoring run and verify whether the control has sufficient evidence."
    })),
    ...reviewQueue.slice(0, 3).map((object) => ({
      href: `/evidence/${object.evidenceId}`,
      title: `${object.evidenceId} · ${object.title}`,
      detail: `${object.aiSystem.name} · reviewer ${object.reviewer}`,
      status: object.status,
      owner: object.owner,
      category: "Review Task",
      actionLabel: "Review Evidence",
      dueDate: formatDate(object.expirationDate),
      severity: object.status === "EXPIRED" ? "HIGH" : "MEDIUM",
      impact: `Evidence status is ${object.status}; package readiness depends on reviewer confirmation.`,
      evidenceUsed: `${object.evidenceType} · ${object.source}`,
      nextStep: "Verify Evidence",
      recommendedAction: "Verify ownership, reviewer, status, and package readiness."
    }))
  ].slice(0, 6);

  return (
    <>
      <header>
        <Breadcrumbs items={[{ label: "Auditor Workspace" }]} />
        <p className="text-sm font-medium text-brand">Auditor workspace</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Traceability, evidence, and control testing</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Auditor-first navigation for evidence discovery, control testing, findings, exceptions, and audit packages.
        </p>
        <SecondaryNav items={auditorSecondaryNav} />
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Findings" value={data.findings.length} icon={FileSearch} />
        <Metric label="Exceptions" value={data.activeExceptions.length} icon={AlertTriangle} />
        <Metric label="Evidence gaps" value={evidenceGaps.length} icon={ClipboardCheck} />
        <Metric label="Failed tests" value={failedRuns.length} icon={Radar} />
        <Metric label="Trace paths" value={data.regulations.length} icon={GitBranch} />
      </div>

      <Section title="Action Required">
        <ActionRequiredList items={actionItems} />
      </Section>

      <Section id="scope" title="Auditor workflow">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Quick href="/auditor" title="Scope" detail="Select systems, regulations, controls, and package scope." icon={FileSearch} />
          <Quick href="/auditor-workspace#prove-control" title="Prove a Control" detail="Use the guided proof path below before opening a control detail page." icon={Radar} />
          <Quick href="/traceability" title="Traceability" detail="Follow regulation to control to evidence and finding impact." icon={GitBranch} />
          <Quick href="/evidence-repository" title="Evidence Review" detail="Inspect evidence objects, owners, status, reviewers, and source links." icon={ClipboardCheck} />
          <Quick href="/evidence-assurance/artifacts" title="Artifact Verification" detail="Verify collected artifacts, snapshots, hashes, drift, and assurance." icon={AlertTriangle} />
          <Quick href="/audit-packages" title="Audit Package" detail="Review package scope, evidence links, exceptions, and export readiness." icon={PackageCheck} />
        </div>
      </Section>

      <Section id="prove-control" title="Prove a Control">
        <div className="rounded-md border border-line bg-white p-5">
          <div className="text-sm font-semibold text-ink">Canonical proof path</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Scope a control, inspect traceability, review supporting evidence, verify artifact provenance, then add the evidence set to an audit package.
          </p>
          <div className="mt-4">
            <ProofChain steps={[
              { stage: "control", title: "Select Control", detail: "Start from an audit scope and a specific control.", href: "/controls/AI-GOV-003", current: true },
              { stage: "requirement", title: "Required Evidence", detail: "Review the evidence types required to prove the control." },
              { stage: "source", title: "Evidence Source", detail: "Confirm the source system or connector that produced proof." },
              { stage: "artifact", title: "Available and Missing Evidence", detail: "Inspect available artifacts and identify missing evidence." },
              { stage: "assurance", title: "Assurance", detail: "Review validation checks, warnings, and confidence." },
              { stage: "traceability", title: "Traceability", detail: "Follow evidence back to controls, risks, systems, and regulations.", href: "/evidence-assurance/traceability" },
              { stage: "package", title: "Package Status", detail: "Add verified proof to the audit package or raise an exception.", href: "/audit-packages" }
            ]} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <ProofCard href="/controls/AI-GOV-003" title="AI-GOV-003 · Prompt approved" detail="Review required prompt evidence, artifact provenance, assurance, drift, and traceability." />
            <ProofCard href="/controls/AI-GOV-006" title="AI-GOV-006 · Tool permissions approved" detail="Verify tool policy evidence, source collection, validation checks, and missing elements." />
            <ProofCard href="/controls/AUD-001" title="AUD-001 · Audit trail completeness" detail="Follow control evidence through artifact, snapshot, drift, and audit package readiness." />
          </div>
        </div>
      </Section>

      <Section id="evidence-review" title="Evidence review queue">
        <div className="grid gap-3 md:grid-cols-2">
          {reviewQueue.map((object) => (
            <Link key={object.id} href={`/evidence/${object.evidenceId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{object.evidenceId} · {object.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{object.aiSystem.name} · Owner {object.owner} · Reviewer {object.reviewer}</div>
                </div>
                <StatusBadge status={object.status} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Evidence health">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">System</th><th className="px-4 py-3">Requirement</th><th className="px-4 py-3">Health</th><th className="px-4 py-3">Validation</th><th className="px-4 py-3">Rationale</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {evidenceGaps.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-4 font-medium text-ink">{record.aiSystem.name}</td>
                  <td className="px-4 py-4 text-slate-700">{record.evidenceRequirement.evidenceType}</td>
                  <td className="px-4 py-4"><StatusBadge status={record.health} /></td>
                  <td className="px-4 py-4"><StatusBadge status={record.validation} /></td>
                  <td className="px-4 py-4 text-slate-700">{record.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Section title="Evidence packages">
          <div className="space-y-3">
            {packages.map((auditPackage) => (
              <Link key={auditPackage.id} href="/audit-packages" className="block rounded-md border border-line bg-white p-4 hover:bg-panel">
                <div className="text-sm font-semibold text-ink">{auditPackage.title}</div>
                <div className="mt-1 text-xs text-slate-500">{auditPackage.packageType} · {auditPackage.evidenceLinks.length} evidence · {auditPackage.owner}</div>
              </Link>
            ))}
          </div>
        </Section>
        <Section title="Recent evidence changes">
          <div className="space-y-3">
            {recentEvidence.map((object) => (
              <Link key={object.id} href={`/evidence/${object.evidenceId}`} className="block rounded-md border border-line bg-white p-4 hover:bg-panel">
                <div className="text-sm font-semibold text-ink">{object.title}</div>
                <div className="mt-1 text-xs text-slate-500">{object.evidenceId} · updated {formatDate(object.lastUpdated)}</div>
              </Link>
            ))}
          </div>
        </Section>
        <Section title="Evidence exceptions">
          <div className="space-y-3">
            {evidenceExceptions.map((exception) => (
              <Link key={exception.id} href="/exceptions" className="block rounded-md border border-line bg-white p-4 hover:bg-panel">
                <div className="text-sm font-semibold text-ink">{exception.exceptionId}</div>
                <div className="mt-1 text-xs text-slate-500">{exception.finding.aiSystem.name} · expires {formatDate(exception.expirationDate)}</div>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

function Quick({ href, title, detail, icon: Icon }: { href: string; title: string; detail: string; icon: typeof FileSearch }) {
  return (
    <Link href={href} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon className="h-4 w-4 text-brand" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </Link>
  );
}

function ProofCard({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <Link href={href} className="rounded-md border border-line bg-panel p-4 hover:bg-white">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
      <div className="mt-3 text-xs font-semibold text-brand">Prove Control</div>
    </Link>
  );
}
