import Link from "next/link";
import { AlertTriangle, CalendarClock, FileWarning, ShieldAlert } from "lucide-react";
import { getExecutiveCommandCenter } from "../data";
import { formatDate } from "../components/format";
import { Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function GovernanceCommitteePage() {
  const data = await getExecutiveCommandCenter();
  const escalations = data.findings.filter((finding) => finding.severity === "CRITICAL" || finding.severity === "HIGH");
  const upcomingReviews = data.systems.filter((system) => daysUntil(system.nextReviewDate) <= 90);
  const expiringEvidence = data.evidenceHealth.filter((record) => record.health === "EXPIRING_SOON" || record.health === "EXPIRED" || record.health === "MISSING");

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI Governance Committee</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Committee workspace</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Escalations, exceptions, upcoming reviews, and evidence issues requiring governance attention.</p>
      </header>
      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="High-risk systems" value={data.kpis.highRiskSystems} icon={ShieldAlert} />
        <Metric label="Open exceptions" value={data.activeExceptions.length} icon={AlertTriangle} />
        <Metric label="Escalation findings" value={escalations.length} icon={FileWarning} />
        <Metric label="Upcoming reviews" value={upcomingReviews.length} icon={CalendarClock} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Findings requiring escalation">
          <div className="rounded-md border border-line bg-white">
            {escalations.map((finding) => (
              <Link key={finding.id} href={`/systems/${finding.aiSystem.slug}/monitoring`} className="block border-b border-line p-4 last:border-0 hover:bg-panel">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="text-sm font-semibold text-ink">{finding.title}</div><div className="mt-1 text-xs text-slate-500">{finding.aiSystem.name}</div></div>
                  <StatusBadge status={finding.severity} />
                </div>
              </Link>
            ))}
          </div>
        </Section>
        <Section title="Open exceptions">
          <div className="rounded-md border border-line bg-white">
            {data.activeExceptions.map((exception) => (
              <div key={exception.id} className="border-b border-line p-4 last:border-0">
                <div className="text-sm font-semibold text-ink">{exception.exceptionId}</div>
                <div className="mt-1 text-xs text-slate-500">{exception.finding.aiSystem.name} · expires {formatDate(exception.expirationDate)}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Upcoming reviews">
          <List rows={upcomingReviews.map((system) => [system.name, `Next review ${formatDate(system.nextReviewDate)}`])} />
        </Section>
        <Section title="Expiring or missing evidence">
          <List rows={expiringEvidence.map((record) => [record.aiSystem.name, `${record.health} · ${record.evidenceRequirement.evidenceType}`])} />
        </Section>
      </div>
    </>
  );
}

function List({ rows }: { rows: string[][] }) {
  return <div className="rounded-md border border-line bg-white">{rows.length ? rows.map(([title, detail]) => <div key={`${title}-${detail}`} className="border-b border-line p-4 last:border-0"><div className="text-sm font-semibold text-ink">{title}</div><div className="mt-1 text-xs text-slate-500">{detail}</div></div>) : <div className="p-4 text-sm text-slate-600">No items currently require attention.</div>}</div>;
}

function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}
