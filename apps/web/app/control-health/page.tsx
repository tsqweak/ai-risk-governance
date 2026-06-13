import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, FileWarning } from "lucide-react";
import { getControlHealthDashboard } from "../data";
import { formatDate, humanize } from "../components/format";
import { Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function ControlHealthPage() {
  const { systems, controls, testRuns, totals, controlsByDomain } = await getControlHealthDashboard();
  const totalRuns = testRuns.length || 1;

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Control health</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Continuous control health dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Executive view of monitoring tests by result, AI system, governance domain, and recent activity.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Total controls" value={controls.length} icon={Activity} />
        <Metric label="Pass" value={totals.PASS ?? 0} icon={CheckCircle2} />
        <Metric label="Warning" value={totals.WARNING ?? 0} icon={AlertTriangle} />
        <Metric label="Fail" value={totals.FAIL ?? 0} icon={FileWarning} />
      </div>

      <Section title="Control health mix">
        <div className="rounded-md border border-line bg-white p-5">
          <div className="grid gap-3">
            {["PASS", "WARNING", "FAIL"].map((result) => (
              <Bar key={result} label={humanize(result)} value={totals[result] ?? 0} total={totalRuns} status={result} />
            ))}
          </div>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Controls by AI System">
          <div className="rounded-md border border-line bg-white">
            {systems.map((system) => {
              const pass = system.testRuns.filter((run) => run.result === "PASS").length;
              const fail = system.testRuns.filter((run) => run.result === "FAIL").length;
              return (
                <Link key={system.id} href={`/systems/${system.slug}/monitoring`} className="block border-b border-line p-4 last:border-0 hover:bg-panel">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink">{system.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{system.testRuns.length} latest checks</div>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge status="PASS" /> <span className="text-sm text-slate-700">{pass}</span>
                      <StatusBadge status="FAIL" /> <span className="text-sm text-slate-700">{fail}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>

        <Section title="Controls by Domain">
          <div className="rounded-md border border-line bg-white p-5">
            <div className="grid gap-3">
              {Object.entries(controlsByDomain).map(([domain, count]) => (
                <Bar key={domain} label={humanize(domain)} value={count} total={Math.max(...Object.values(controlsByDomain))} status="PASS" />
              ))}
            </div>
          </div>
        </Section>
      </div>

      <Section title="Recent test activity">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">AI System</th><th className="px-4 py-3">Test</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Details</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {testRuns.slice(0, 12).map((run) => (
                <tr key={run.id}>
                  <td className="px-4 py-4 text-slate-700">{formatDate(run.executionDate)}</td>
                  <td className="px-4 py-4 font-medium text-ink">{run.aiSystem.name}</td>
                  <td className="px-4 py-4 text-slate-700">{run.controlTest.testId}</td>
                  <td className="px-4 py-4"><StatusBadge status={run.result} /></td>
                  <td className="px-4 py-4 text-slate-700">{run.resultDetails}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

function Bar({ label, value, total, status }: { label: string; value: number; total: number; status: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm"><span className="font-medium text-ink">{label}</span><span className="text-slate-600">{value}</span></div>
      <div className="mt-2 h-2 rounded bg-slate-100">
        <div className={`h-2 rounded ${status === "FAIL" ? "bg-red-500" : status === "WARNING" ? "bg-amber-500" : "bg-teal-600"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
