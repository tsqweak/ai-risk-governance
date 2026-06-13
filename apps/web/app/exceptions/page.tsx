import { AlertTriangle, CalendarClock, CheckCircle2, TimerOff } from "lucide-react";
import { getExceptionsDashboard } from "../data";
import { formatDate } from "../components/format";
import { Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function ExceptionsPage() {
  const exceptions = await getExceptionsDashboard();
  const active = exceptions.filter((exception) => exception.expirationBand === "ACTIVE");
  const expiring = exceptions.filter((exception) => exception.expirationBand === "EXPIRING");
  const expired = exceptions.filter((exception) => exception.expirationBand === "EXPIRED");

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Exceptions</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Risk acceptance and exception dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Time-bound visibility into accepted monitoring gaps, approvers, owners, and upcoming expirations.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Active exceptions" value={active.length} icon={CheckCircle2} />
        <Metric label="Expiring soon" value={expiring.length} icon={CalendarClock} />
        <Metric label="Expired" value={expired.length} icon={TimerOff} />
        <Metric label="Total exceptions" value={exceptions.length} icon={AlertTriangle} />
      </div>

      <Section title="Exception register">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Exception</th><th className="px-4 py-3">AI System</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Approver</th><th className="px-4 py-3">Expiration</th><th className="px-4 py-3">Days</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {exceptions.map((exception) => (
                <tr key={exception.id} className={exception.expirationBand === "EXPIRING" ? "bg-amber-50/50" : ""}>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-ink">{exception.exceptionId}</div>
                    <div className="mt-1 text-xs text-slate-500">{exception.finding.findingId}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{exception.finding.aiSystem.name}</td>
                  <td className="px-4 py-4 text-slate-700">{exception.finding.owner}</td>
                  <td className="px-4 py-4 text-slate-700">{exception.approvedBy}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(exception.expirationDate)}</td>
                  <td className="px-4 py-4 font-medium text-slate-700">{exception.daysRemaining}</td>
                  <td className="px-4 py-4"><StatusBadge status={exception.expirationBand} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
