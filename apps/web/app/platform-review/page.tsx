import Link from "next/link";
import { AlertTriangle, ClipboardCheck, FileSearch, GitBranch, LayoutDashboard, Route, ShieldCheck } from "lucide-react";
import { formatDate, humanize } from "../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../components/ui";
import { getPlatformReviewData } from "./review-data";

export const dynamic = "force-dynamic";

export default async function PlatformReviewPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const data = await getPlatformReviewData(params?.status ?? "All");
  const routeStatusCounts = countBy(data.routes, "status");
  const routeCategoryCounts = countBy(data.routes, "category");

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Platform Review Agent</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Platform health and architecture review</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Internal self-assessment for route inventory, feature maturity, navigation drift, evidence maturity, review issues, and screenshot package preparation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/platform-review/export" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
            Export package
          </Link>
          <Link href="/platform-review/package" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
            Open review package
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Routes" value={data.routes.length} icon={Route} />
        <Metric label="Features" value={data.featureRegistry.features.length} icon={ClipboardCheck} />
        <Metric label="Open Issues" value={data.openIssues.length} icon={AlertTriangle} />
        <Metric label="Evidence Sources" value={data.evidenceInventory.summary.evidenceSources} icon={FileSearch} />
        <Metric label="Artifacts" value={data.evidenceInventory.summary.artifacts + data.evidenceInventory.summary.runtimeEvidence + data.evidenceInventory.summary.deploymentEvidence} icon={ShieldCheck} />
        <Metric label="Coverage" value={`${data.evidenceInventory.summary.controlCoverage}%`} icon={LayoutDashboard} />
      </div>

      <Section title="Review package generator">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <article className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <GitBranch className="h-4 w-4 text-brand" />
              Platform review package
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              The package combines key review screens with route, feature, evidence, connector, governance, and issue summaries for follow-up analysis.
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {data.packageScreens.slice(0, 6).map((screen) => (
                <Link key={screen.href} href={screen.href} className="rounded border border-line bg-panel px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
                  {screen.title}
                </Link>
              ))}
            </div>
            <Link href="/platform-review/export" className="mt-4 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
              Generate export artifact
            </Link>
          </article>
          <LearningPanel title="Review scope">
            Generated {formatDate(data.generatedAt)} from actual app routes, current navigation models, `FEATURE_REGISTRY.md`, Evidence & Assurance data, findings, exceptions, and the approved operating/UX review documents.
          </LearningPanel>
        </div>
      </Section>

      <Section title="Route inventory" action={<a href="#routes" className="text-sm font-semibold text-brand hover:text-blue-700">View table</a>}>
        <div className="grid gap-3 md:grid-cols-4">
          {Object.entries(routeStatusCounts).map(([status, count]) => (
            <Fact key={status} label={humanize(status)} value={count} status={status} />
          ))}
          {Object.entries(routeCategoryCounts).slice(0, 4).map(([category, count]) => (
            <Fact key={category} label={category} value={count} />
          ))}
        </div>
        <div id="routes" className="mt-4 overflow-hidden rounded-md border border-line bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-panel text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.routes.map((route) => (
                <tr key={`${route.fileKind}-${route.route}`}>
                  <td className="px-4 py-3 font-semibold text-ink">{route.route}</td>
                  <td className="px-4 py-3 text-slate-700">{route.pageType}</td>
                  <td className="px-4 py-3 text-slate-700">{route.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={route.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Feature inventory" action={<div className="flex flex-wrap gap-2">{data.featureStatuses.map((status) => <Link key={status} href={status === "All" ? "/platform-review#features" : `/platform-review?status=${encodeURIComponent(status)}#features`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">{status}</Link>)}</div>}>
        <div id="features" className="grid gap-3">
          <article className="rounded-md border border-line bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Focus</div>
            <div className="mt-2 text-sm font-semibold text-ink">{data.featureRegistry.currentFocus.phase} · {data.featureRegistry.currentFocus.feature}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{data.featureRegistry.currentFocus.objective}</p>
          </article>
          <div className="overflow-hidden rounded-md border border-line bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-panel text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Maturity</th>
                  <th className="px-4 py-3">Dependencies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.features.map((feature) => (
                  <tr key={feature.name}>
                    <td className="px-4 py-3 font-semibold text-ink">{feature.name}</td>
                    <td className="px-4 py-3 text-slate-700">{feature.phase}</td>
                    <td className="px-4 py-3"><StatusBadge status={feature.status.toUpperCase()} /></td>
                    <td className="px-4 py-3 text-slate-700">{feature.maturity}</td>
                    <td className="px-4 py-3 text-slate-700">{feature.dependencies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section title="Navigation inventory">
        <div className="grid gap-4 lg:grid-cols-3">
          {data.navigation.sidebarGroups.map((group) => (
            <article key={group.title} className="rounded-md border border-line bg-white p-4">
              <div className="text-sm font-semibold text-ink">{group.title}</div>
              <div className="mt-3 grid gap-2">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} className="text-sm font-semibold text-brand hover:text-blue-700">{item.label}</Link>
                ))}
              </div>
            </article>
          ))}
          <article className="rounded-md border border-line bg-white p-4">
            <div className="text-sm font-semibold text-ink">Evidence & Assurance secondary nav</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.navigation.secondaryNavigation.map((item) => (
                <Link key={item.href} href={item.href} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">{item.label}</Link>
              ))}
            </div>
          </article>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <IssueBox title="Duplicate destinations" count={data.navigation.duplicateDestinations.length} detail={data.navigation.duplicateDestinations.map((group) => `${group.topic}: ${group.routes.length}`).join(", ") || "No duplicate destination groups detected."} />
          <IssueBox title="Potential navigation drift" count={data.navigation.sidebarDrift.length} detail={data.navigation.sidebarDrift.map((item) => item.label).join(", ") || "Sidebar matches the recommended hub set."} />
          <IssueBox title="Potential orphan pages" count={data.navigation.orphanedRoutes.length} detail={data.navigation.orphanedRoutes.slice(0, 6).map((route) => route.route).join(", ") || "No potential orphan pages detected."} />
        </div>
      </Section>

      <Section title="Evidence inventory">
        <div id="evidence" className="grid gap-3 md:grid-cols-4">
          <Fact label="Evidence Sources" value={data.evidenceInventory.summary.evidenceSources} />
          <Fact label="Source Issues" value={data.evidenceInventory.summary.sourceIssues} status={data.evidenceInventory.summary.sourceIssues ? "WARNING" : "PASS"} />
          <Fact label="Snapshots" value={data.evidenceInventory.summary.snapshots} />
          <Fact label="Runtime Evidence" value={data.evidenceInventory.summary.runtimeEvidence} />
          <Fact label="Deployment Evidence" value={data.evidenceInventory.summary.deploymentEvidence} />
          <Fact label="Evidence Health Issues" value={data.evidenceInventory.summary.evidenceHealthIssues} status={data.evidenceInventory.summary.evidenceHealthIssues ? "WARNING" : "PASS"} />
          <Fact label="Control Coverage" value={`${data.evidenceInventory.summary.controlCoverage}%`} />
          <Fact label="Evidence Coverage" value={`${data.evidenceInventory.summary.evidenceCoverage}%`} />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-700">{data.evidenceInventory.coverageSummary}</p>
      </Section>

      <Section title="Architecture drift review">
        <div id="drift" className="grid gap-3 md:grid-cols-2">
          {data.architectureDrift.map((item) => (
            <article key={item.title} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-ink">{item.title}</div>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.detail}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Open issues register">
        <div className="grid gap-3">
          {data.openIssues.map((issue) => (
            <article key={`${issue.category}-${issue.title}`} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{issue.category}</div>
                  <Link href={issue.reviewPath} className="mt-1 block text-sm font-semibold text-ink hover:text-brand">{issue.title}</Link>
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

function Fact({ label, value, status }: { label: string; value: string | number; status?: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
        </div>
        {status ? <StatusBadge status={status} /> : null}
      </div>
    </div>
  );
}

function IssueBox({ title, count, detail }: { title: string; count: number; detail: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink">{title}</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
        </div>
        <StatusBadge status={count ? "WARNING" : "PASS"} />
      </div>
      <div className="mt-4 text-3xl font-semibold text-ink">{count}</div>
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
