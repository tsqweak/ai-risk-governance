import Link from "next/link";
import { Download, FileArchive, PackageCheck } from "lucide-react";
import { getAuditPackages } from "../data";
import { formatDate } from "../components/format";
import { Metric, Section } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function AuditPackagesPage() {
  const packages = await getAuditPackages();
  const evidenceCount = packages.reduce((sum, auditPackage) => sum + auditPackage.evidenceLinks.length, 0);

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Auditor Evidence Packages</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Packaged proof for audit review</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Generated evidence collections scoped by AI system, regulation, control, or audit period.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-3">
        <Metric label="Packages" value={packages.length} icon={PackageCheck} />
        <Metric label="Evidence Links" value={evidenceCount} icon={FileArchive} />
        <Metric label="Package Types" value={new Set(packages.map((auditPackage) => auditPackage.packageType)).size} icon={Download} />
      </div>

      <Section title="Available packages">
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((auditPackage) => (
            <article key={auditPackage.id} className="rounded-md border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand">{auditPackage.packageType}</div>
                  <h2 className="mt-1 text-base font-semibold text-ink">{auditPackage.title}</h2>
                </div>
                <span className="rounded bg-panel px-2 py-1 text-xs font-semibold text-slate-600">{auditPackage.evidenceLinks.length} evidence</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{auditPackage.scope}</p>
              <div className="mt-4 text-xs text-slate-500">
                {auditPackage.packageId} · Owner {auditPackage.owner} · Generated {formatDate(auditPackage.generatedDate)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {auditPackage.evidenceLinks.slice(0, 4).map((link) => (
                  <Link key={link.id} href={`/evidence/${link.evidenceObject.evidenceId}`} className="rounded border border-line bg-panel px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white">
                    {link.evidenceObject.evidenceId}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
