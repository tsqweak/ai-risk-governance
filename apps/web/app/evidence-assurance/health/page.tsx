import Link from "next/link";
import { getEvidenceHealthDashboard } from "../../data";
import { Section, StatusBadge } from "../../components/ui";
import { FactTile, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceHealthPage() {
  const data = await getEvidenceHealthDashboard();
  const current = data.health.filter((record) => record.health === "CURRENT").length;
  const missing = data.health.filter((record) => record.health === "MISSING").length;
  const expired = data.health.filter((record) => record.health === "EXPIRED").length;
  const invalid = data.health.filter((record) => record.validation === "INVALID").length;

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4">
        <FactTile label="Current" value={current} status="PASS" />
        <FactTile label="Missing" value={missing} status={missing ? "WARNING" : "PASS"} />
        <FactTile label="Expired" value={expired} status={expired ? "FAIL" : "PASS"} />
        <FactTile label="Invalid" value={invalid} status={invalid ? "FAIL" : "PASS"} />
      </div>

      <Section title="Health workflow">
        <div className="grid gap-3 md:grid-cols-3">
          <WorkflowCard href="/evidence-assurance/repository" kicker="Evidence" title="Inspect evidence objects" detail="Review owner, reviewer, status, and expiration context." />
          <WorkflowCard href="/evidence-assurance/artifacts" kicker="Artifact" title="Verify collected proof" detail="Open artifact content and source provenance for current evidence." />
          <WorkflowCard href="/evidence-health" kicker="Advanced" title="Open detailed health view" detail="Use the existing evidence health dashboard for complete portfolio health." />
        </div>
      </Section>

      <Section title="Health by system">
        <div className="grid gap-3">
          {data.trendRows.map((row) => (
            <article key={row.system.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <Link href={`/systems/${row.system.slug}/evidence`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
                  <p className="mt-1 text-xs text-slate-500">{row.total} evidence health records</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="CURRENT" /> <span className="text-sm text-slate-700">{row.current}</span>
                  <StatusBadge status="MISSING" /> <span className="text-sm text-slate-700">{row.missing}</span>
                  <StatusBadge status="EXPIRED" /> <span className="text-sm text-slate-700">{row.expired}</span>
                  <StatusBadge status="INVALID" /> <span className="text-sm text-slate-700">{row.invalid}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
