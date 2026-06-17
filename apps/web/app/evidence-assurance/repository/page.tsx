import Link from "next/link";
import { getEvidenceRepository } from "../../data";
import { formatDate } from "../../components/format";
import { Section, StatusBadge } from "../../components/ui";
import { FactTile, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceRepositoryPage() {
  const data = await getEvidenceRepository();
  const current = data.health.filter((record) => record.health === "CURRENT").length;
  const gaps = data.health.filter((record) => record.health === "MISSING" || record.health === "EXPIRED" || record.validation === "INVALID").length;

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4">
        <FactTile label="Evidence Objects" value={data.objects.length} />
        <FactTile label="Current" value={current} status="PASS" />
        <FactTile label="Gaps" value={gaps} status={gaps ? "WARNING" : "PASS"} />
        <FactTile label="Audit Packages" value={data.packages.length} />
      </div>

      <Section title="Repository workflow">
        <div className="grid gap-3 md:grid-cols-3">
          <WorkflowCard href="/evidence-assurance/artifacts" kicker="Next" title="Open artifacts" detail="Move from evidence objects to collected artifacts and proof content." />
          <WorkflowCard href="/evidence-assurance/traceability" kicker="Trace" title="Follow controls" detail="Connect evidence to controls, requirements, regulations, and systems." />
          <WorkflowCard href="/evidence-repository" kicker="Advanced" title="Use full search" detail="Open the existing repository search and filtering workbench." />
        </div>
      </Section>

      <Section title="Evidence objects">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Evidence</th><th className="px-4 py-3">System</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Expires</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.objects.slice(0, 12).map((evidence) => (
                <tr key={evidence.id}>
                  <td className="px-4 py-4">
                    <Link href={`/evidence/${evidence.evidenceId}`} className="font-semibold text-ink hover:text-brand">{evidence.title}</Link>
                    <div className="mt-1 text-xs text-slate-500">{evidence.evidenceId} · {evidence.evidenceType}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{evidence.aiSystem.name}</td>
                  <td className="px-4 py-4 text-slate-700">{evidence.owner}</td>
                  <td className="px-4 py-4"><StatusBadge status={evidence.status} /></td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(evidence.expirationDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
