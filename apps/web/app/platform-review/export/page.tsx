import Link from "next/link";
import { Archive, Camera, ClipboardCheck, FileText, GitBranch, ShieldCheck } from "lucide-react";
import { Metric, Section, StatusBadge } from "../../components/ui";
import { getPlatformReviewExportData } from "../export-data";

export const dynamic = "force-dynamic";

export default async function PlatformReviewExportPage() {
  const data = await getPlatformReviewExportData();

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Platform Review Agent v2</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Review package export</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            A single reusable package for route inventory, feature maturity, evidence state, connector status, architecture drift, open issues, screenshot planning, and future packaging.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/platform-review/package" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
            Review package
          </Link>
          <Link href="/platform-review" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
            Back to review
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Package Sections" value={data.packageContents.length} icon={Archive} />
        <Metric label="Routes" value={data.routes.length} icon={GitBranch} />
        <Metric label="Features" value={data.featureRegistry.features.length} icon={ClipboardCheck} />
        <Metric label="Screenshot Plan" value={data.screenshotManifest.length} icon={Camera} />
        <Metric label="Connectors" value={data.connectorStatusReport.length} icon={ShieldCheck} />
      </div>

      <Section title="Single export artifact">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <FileText className="h-4 w-4 text-brand" />
              docs/PLATFORM_REVIEW_PACKAGE.md
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              The canonical export artifact is a self-contained Markdown package designed to be uploaded directly into ChatGPT as one review file.
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {data.packageContents.map((item) => (
                <div key={item} className="rounded border border-line bg-panel px-3 py-2 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-md border border-line bg-white p-5">
            <div className="text-sm font-semibold text-ink">Current state summary</div>
            <dl className="mt-3 grid gap-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Maturity</dt>
                <dd className="mt-1 leading-6 text-slate-700">{data.currentStateSummary.platformMaturity}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current focus</dt>
                <dd className="mt-1 leading-6 text-slate-700">{data.currentStateSummary.currentFocus}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next work</dt>
                <dd className="mt-1 leading-6 text-slate-700">{data.currentStateSummary.nextRecommendedWork}</dd>
              </div>
            </dl>
          </article>
        </div>
      </Section>

      <Section title="Connector status report">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-panel text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Connector</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Maturity</th>
                <th className="px-4 py-3">Evidence Quality</th>
                <th className="px-4 py-3">Open Gaps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.connectorStatusReport.map((connector) => (
                <tr key={connector.connector}>
                  <td className="px-4 py-3 font-semibold text-ink">{connector.connector}</td>
                  <td className="px-4 py-3"><StatusBadge status={connector.status.toUpperCase()} /></td>
                  <td className="px-4 py-3 text-slate-700">{connector.maturity}</td>
                  <td className="px-4 py-3 text-slate-700">{connector.evidenceQuality}</td>
                  <td className="px-4 py-3 text-slate-700">{connector.openGaps.join("; ") || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Governance status report">
        <div className="grid gap-3 md:grid-cols-2">
          {data.governanceStatusReport.map((item) => (
            <article key={item.area} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{item.area}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.summary}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              {item.gaps.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {item.gaps.map((gap) => <li key={gap}>{gap}</li>)}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section title="Screenshot manifest">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-panel text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Page Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Importance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.screenshotManifest.map((screen) => (
                <tr key={screen.route}>
                  <td className="px-4 py-3 font-semibold text-brand">{screen.route}</td>
                  <td className="px-4 py-3 text-slate-700">{screen.pageTitle}</td>
                  <td className="px-4 py-3 text-slate-700">{screen.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={screen.importance.toUpperCase()} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Future ZIP packaging design">
        <div className="rounded-md border border-line bg-white p-5">
          <ul className="grid gap-2 text-sm leading-6 text-slate-700">
            {data.futurePackagingDesign.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </Section>

      <Section title="Markdown package preview">
        <pre className="max-h-[680px] overflow-auto rounded-md border border-line bg-slate-950 p-5 text-xs leading-5 text-slate-100">
          {data.markdown}
        </pre>
      </Section>
    </>
  );
}
