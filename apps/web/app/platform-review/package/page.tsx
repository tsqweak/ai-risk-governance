import Link from "next/link";
import { Camera, ClipboardCheck, FileText, Route } from "lucide-react";
import { formatDate } from "../../components/format";
import { Metric, Section, StatusBadge } from "../../components/ui";
import { getPlatformReviewData } from "../review-data";

export const dynamic = "force-dynamic";

export default async function PlatformReviewPackagePage() {
  const data = await getPlatformReviewData();
  const routeStatusCounts = countBy(data.routes, "status");
  const featureStatusCounts = data.featureRegistry.countsByStatus;

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Platform Review Package</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Review artifact bundle</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Key screens, route summary, feature summary, evidence summary, and open issues for platform review.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/platform-review/export" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
            Export package
          </Link>
          <Link href="/platform-review" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
            Back to platform review
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Generated" value={formatDate(data.generatedAt)} icon={FileText} />
        <Metric label="Screens" value={data.packageScreens.length} icon={Camera} />
        <Metric label="Routes" value={data.routes.length} icon={Route} />
        <Metric label="Issues" value={data.openIssues.length} icon={ClipboardCheck} />
      </div>

      <Section title="Key screens">
        <div className="grid gap-3 md:grid-cols-2">
          {data.packageScreens.map((screen) => (
            <Link key={screen.href} href={screen.href} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="text-sm font-semibold text-ink">{screen.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{screen.purpose}</p>
              <p className="mt-2 break-all text-xs font-semibold text-brand">{screen.href}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Route summary">
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(routeStatusCounts).map(([status, count]) => (
            <SummaryTile key={status} label={status} value={count} status={status} />
          ))}
        </div>
      </Section>

      <Section title="Feature summary">
        <div className="grid gap-3 md:grid-cols-4">
          {Object.entries(featureStatusCounts).map(([status, count]) => (
            <SummaryTile key={status} label={status} value={count} status={status.toUpperCase()} />
          ))}
        </div>
        <article className="mt-4 rounded-md border border-line bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Focus</div>
          <div className="mt-2 text-sm font-semibold text-ink">{data.featureRegistry.currentFocus.phase} · {data.featureRegistry.currentFocus.feature}</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{data.featureRegistry.currentFocus.objective}</p>
        </article>
      </Section>

      <Section title="Evidence summary">
        <div className="grid gap-3 md:grid-cols-4">
          <SummaryTile label="Sources" value={data.evidenceInventory.summary.evidenceSources} />
          <SummaryTile label="GitHub Artifacts" value={data.evidenceInventory.summary.artifacts} />
          <SummaryTile label="Runtime Evidence" value={data.evidenceInventory.summary.runtimeEvidence} />
          <SummaryTile label="Deployment Evidence" value={data.evidenceInventory.summary.deploymentEvidence} />
          <SummaryTile label="Snapshots" value={data.evidenceInventory.summary.snapshots} />
          <SummaryTile label="Source Issues" value={data.evidenceInventory.summary.sourceIssues} status={data.evidenceInventory.summary.sourceIssues ? "WARNING" : "PASS"} />
          <SummaryTile label="Control Coverage" value={`${data.evidenceInventory.summary.controlCoverage}%`} />
          <SummaryTile label="Evidence Coverage" value={`${data.evidenceInventory.summary.evidenceCoverage}%`} />
        </div>
      </Section>

      <Section title="Open issues">
        <div className="grid gap-3">
          {data.openIssues.map((issue) => (
            <article key={`${issue.category}-${issue.title}`} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{issue.category}</div>
                  <div className="mt-1 text-sm font-semibold text-ink">{issue.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{issue.detail}</p>
                </div>
                <StatusBadge status={issue.severity} />
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

function SummaryTile({ label, value, status }: { label: string; value: string | number; status?: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
        </div>
        {status ? <StatusBadge status={status} /> : null}
      </div>
    </article>
  );
}

function countBy<T, K extends keyof T>(items: T[], key: K) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}
