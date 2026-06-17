import { EvidenceAssuranceNav } from "./components";
import { Breadcrumbs } from "../components/ui";

export default function EvidenceAssuranceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <section className="border-b border-line bg-white pb-5">
        <Breadcrumbs items={[{ label: "Evidence & Assurance" }]} />
        <p className="text-sm font-medium text-brand">Evidence & Assurance</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Canonical proof layer</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          One workflow for evidence, artifacts, snapshots, drift, assurance, traceability, sources, and audit packaging.
        </p>
        <EvidenceAssuranceNav />
      </section>
      <div className="pt-6">{children}</div>
    </>
  );
}
