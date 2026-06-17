import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardCheck, FileWarning, ShieldX } from "lucide-react";
import { getEvidenceHealthDashboard } from "../data";
import { Metric, Section, StatusBadge } from "../components/ui";
import { ProgressBar } from "../components/dashboard";

export const dynamic = "force-dynamic";

export default async function EvidenceHealthPage() {
  const data = await getEvidenceHealthDashboard();
  const count = (health: string) => data.health.filter((record) => record.health === health).length;
  const invalid = data.health.filter((record) => record.validation === "INVALID").length;

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Evidence Health</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Portfolio evidence readiness</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Current, expiring, expired, missing, and invalid evidence across the governed AI portfolio.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Current" value={count("CURRENT")} icon={CheckCircle2} />
        <Metric label="Expiring Soon" value={count("EXPIRING_SOON")} icon={AlertTriangle} />
        <Metric label="Expired" value={count("EXPIRED")} icon={FileWarning} />
        <Metric label="Missing" value={count("MISSING")} icon={ClipboardCheck} />
        <Metric label="Invalid" value={invalid} icon={ShieldX} />
      </div>

      <Section title="Portfolio trends">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.trendRows.map((row) => (
            <article key={row.system.id} className="rounded-md border border-line bg-white p-5">
              <Link href={`/systems/${row.system.slug}/evidence`} className="text-sm font-semibold text-ink hover:text-brand">{row.system.name}</Link>
              <div className="mt-4 space-y-3">
                <ProgressBar label="Current" value={row.current} total={row.total} />
                <ProgressBar label="Expiring/expired/missing" value={row.expiringSoon + row.expired + row.missing} total={row.total} />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs text-slate-600">
                <div className="rounded bg-panel p-2">{row.expiringSoon}<br />Soon</div>
                <div className="rounded bg-panel p-2">{row.expired}<br />Expired</div>
                <div className="rounded bg-panel p-2">{row.missing}<br />Missing</div>
                <div className="rounded bg-panel p-2">{row.invalid}<br />Invalid</div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Evidence health detail">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">AI System</th>
                <th className="px-4 py-3">Requirement</th>
                <th className="px-4 py-3">Control</th>
                <th className="px-4 py-3">Regulation</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.health.map((record) => (
                <tr id={`evidence-health-${record.id}`} key={record.id} className="scroll-mt-24">
                  <td className="px-4 py-4 font-medium text-ink">{record.aiSystem.name}</td>
                  <td className="px-4 py-4 text-slate-700">{record.evidenceRequirement.evidenceType}</td>
                  <td className="px-4 py-4 text-slate-700">
                    <Link href={`/controls/${record.evidenceRequirement.controlId}`} className="font-semibold text-brand hover:text-ink">
                      {record.evidenceRequirement.controlId}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{record.evidenceRequirement.regulatoryControl?.regulation.name ?? "Unmapped"}</td>
                  <td className="px-4 py-4"><StatusBadge status={record.health} /></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <StatusBadge status={record.validation} />
                      <Link href={`/systems/${record.aiSystem.slug}/evidence`} className="text-xs font-semibold text-brand hover:text-ink">Request Evidence</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
