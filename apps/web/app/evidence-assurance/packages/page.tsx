import Link from "next/link";
import { getAuditPackages } from "../../data";
import { formatDate } from "../../components/format";
import { Section } from "../../components/ui";
import { FactTile, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssurancePackagesPage() {
  const packages = await getAuditPackages();
  const evidenceCount = packages.reduce((total, auditPackage) => total + auditPackage.evidenceLinks.length, 0);

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-3">
        <FactTile label="Packages" value={packages.length} />
        <FactTile label="Evidence Included" value={evidenceCount} />
        <FactTile label="Package Types" value={new Set(packages.map((auditPackage) => auditPackage.packageType)).size} />
      </div>

      <Section title="Package workflow">
        <div className="grid gap-3 md:grid-cols-3">
          <WorkflowCard href="/evidence-assurance/traceability" kicker="Traceability" title="Confirm scope" detail="Review regulation, control, evidence, and artifact traceability before packaging." />
          <WorkflowCard href="/evidence-assurance/artifacts" kicker="Verification" title="Verify artifacts" detail="Inspect snapshots, hashes, commit SHAs, and drift status for included proof." />
          <WorkflowCard href="/audit-packages" kicker="Detail" title="Open package detail" detail="Use the existing audit package page for package-level evidence review." />
        </div>
      </Section>

      <Section title="Audit packages">
        <div className="grid gap-3 md:grid-cols-2">
          {packages.map((auditPackage) => (
            <article key={auditPackage.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href="/audit-packages" className="text-sm font-semibold text-ink hover:text-brand">{auditPackage.title}</Link>
                  <p className="mt-1 text-xs text-slate-500">{auditPackage.packageType} · {auditPackage.scope} · {auditPackage.aiSystem?.name ?? "Portfolio scope"}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{auditPackage.evidenceLinks.length} evidence object(s) · Owner {auditPackage.owner} · Generated {formatDate(auditPackage.generatedDate)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
