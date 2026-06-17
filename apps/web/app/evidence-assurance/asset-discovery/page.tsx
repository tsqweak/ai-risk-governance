import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileSearch, Radar, Search, ShieldCheck } from "lucide-react";
import { getGovernanceOperationsDashboard } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { LearningPanel, Section, StatusBadge } from "../../components/ui";
import { FactTile, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function AssetDiscoveryPage() {
  const data = await getGovernanceOperationsDashboard();
  const travelBrainRuns = data.assetDiscoveryRuns.filter((run) => run.aiSystem.slug === "travel-brain");
  const latestRun = travelBrainRuns[0];
  const findings = latestRun?.findings ?? [];
  const sources = latestRun?.sources ?? [];
  const openFindings = findings.filter((finding) => finding.status === "OPEN" || finding.status === "REVIEW_REQUIRED");
  const declared = findings.filter((finding) => finding.declared);
  const discovered = findings.filter((finding) => finding.discovered);
  const untracked = findings.filter((finding) => finding.disposition === "UNTRACKED_ASSET");
  const unknown = findings.filter((finding) => finding.disposition === "UNKNOWN_ASSET");
  const missing = findings.filter((finding) => finding.disposition === "MISSING_ASSET");
  const orphaned = findings.filter((finding) => finding.disposition === "ORPHANED_ASSET");
  const validFindings = findings.filter((finding) => finding.validationStatus === "VALID");
  const warningFindings = findings.filter((finding) => finding.validationStatus === "WARNING");
  const invalidFindings = findings.filter((finding) => finding.validationStatus === "INVALID");

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4 xl:grid-cols-8">
        <FactTile label="Discovery Runs" value={travelBrainRuns.length} />
        <FactTile label="Sources" value={sources.length} />
        <FactTile label="Declared" value={declared.length} />
        <FactTile label="Discovered" value={discovered.length} />
        <FactTile label="Untracked" value={untracked.length} status={untracked.length ? "WARNING" : "PASS"} />
        <FactTile label="Unknown" value={unknown.length} status={unknown.length ? "WARNING" : "PASS"} />
        <FactTile label="Missing" value={missing.length + orphaned.length} status={missing.length || orphaned.length ? "WARNING" : "PASS"} />
        <FactTile label="Valid" value={validFindings.length} status="PASS" />
        <FactTile label="Warnings" value={warningFindings.length} status={warningFindings.length ? "WARNING" : "PASS"} />
        <FactTile label="Invalid" value={invalidFindings.length} status={invalidFindings.length ? "WARNING" : "PASS"} />
        <FactTile label="Completeness" value={latestRun ? `${latestRun.inventoryCompleteness}%` : "0%"} status={openFindings.length ? "WARNING" : "PASS"} />
      </div>

      <Section title="Discovery workflow">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <WorkflowCard href="/evidence-assurance/asset-discovery#sources" kicker="Source" title="Inspect signals" detail="Review where discovery looked: manifest, repository files, workflows, connectors, docs, and metadata." />
          <WorkflowCard href="/evidence-assurance/asset-discovery#findings" kicker="Finding" title="Review forgotten assets" detail="Open unknown, untracked, orphaned, and missing asset findings with confidence and evidence." />
          <WorkflowCard href="/evidence-assurance/sources" kicker="Evidence" title="Check evidence sources" detail="Compare discovery gaps against existing evidence source registry coverage." />
          <WorkflowCard href="/systems/travel-brain" kicker="System" title="Return to Travel Brain" detail="Use the AI System workspace as the canonical governed object view." />
        </div>
      </Section>

      <Section title="Discovery validation">
        <div className="grid gap-3 md:grid-cols-3">
          <SummaryPanel title="Valid findings" items={validFindings.map((finding) => finding.assetName)} empty="No valid findings yet." />
          <SummaryPanel title="Warning findings" items={warningFindings.map((finding) => finding.assetName)} empty="No warning findings." tone="warning" />
          <SummaryPanel title="Invalid findings" items={invalidFindings.map((finding) => `${finding.assetName} · ${finding.invalidReason}`)} empty="No invalid findings." tone="warning" />
        </div>
      </Section>

      <Section title="Travel Brain comparison">
        {latestRun ? (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <article className="rounded-md border border-line bg-white p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Radar className="h-4 w-4 text-brand" />
                    {latestRun.runId} · {latestRun.aiSystem.name}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Completed {formatDate(latestRun.completedAt)} · {latestRun.status}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{latestRun.summary}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{latestRun.comparisonSummary}</p>
                </div>
                <StatusBadge status={openFindings.length ? "WARNING" : latestRun.status} />
              </div>
            </article>
            <LearningPanel title="What Discovery Proves">
              Discovery challenges the declared system boundary. It identifies assets that are known, unknown, untracked, orphaned, or missing so governance reviewers can decide what must become governed inventory or evidence.
            </LearningPanel>
          </div>
        ) : (
          <EmptyState text="No Travel Brain asset discovery run has been recorded." />
        )}
      </Section>

      <Section title="Discovery sources">
        <div id="sources" className="grid gap-3 md:grid-cols-2">
          {sources.map((source) => (
            <article key={source.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Search className="h-4 w-4 text-brand" />
                    {humanize(source.sourceType)}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{source.name} · {source.location}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{source.evidenceSummary}</p>
                </div>
                <StatusBadge status={source.missingAssetCount ? "WARNING" : "PASS"} />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <FactLine label="Discovered" value={`${source.discoveredAssetCount}`} />
                <FactLine label="Expected" value={`${source.expectedAssetCount}`} />
                <FactLine label="Unknown" value={`${source.unknownAssetCount}`} />
                <FactLine label="Missing" value={`${source.missingAssetCount}`} />
                <FactLine label="Confidence" value={`${source.confidence}%`} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Discovery findings">
        <div id="findings" className="grid gap-3">
          {findings.map((finding) => (
            <article key={finding.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {finding.status === "RESOLVED" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    {finding.assetName}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{humanize(finding.findingType)} · {humanize(finding.disposition)} · {humanize(finding.assetType)} · {humanize(finding.validationStatus)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{finding.reason}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{finding.evidence}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={finding.status} />
                  <StatusBadge status={finding.validationStatus} />
                  <StatusBadge status={finding.severity} />
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                <FactLine label="Source" value={finding.sourceLabel} />
                <FactLine label="Source File" value={finding.sourceFile} />
                <FactLine label="Source Asset" value={finding.sourceAsset} />
                <FactLine label="Discovery Rule" value={finding.discoveryRule} />
                <FactLine label="Confidence" value={`${humanize(finding.confidenceLevel)} · ${finding.confidence}%`} />
                <FactLine label="Declared" value={finding.declared ? "Yes" : "No"} />
                <FactLine label="Discovered" value={finding.discovered ? "Yes" : "No"} />
                <FactLine label="Tracked" value={finding.tracked ? "Yes" : "No"} />
                <FactLine label="Evidence Missing" value={finding.evidenceSourceMissing ? "Yes" : "No"} />
              </div>
              <div className="mt-3 rounded border border-line bg-panel px-3 py-2 text-sm leading-6 text-slate-700">
                <span className="font-semibold text-ink">Validation: </span>{finding.validationExplanation}
                {finding.invalidReason ? <span> Invalid reason: {finding.invalidReason}</span> : null}
              </div>
              <div className="mt-3 rounded border border-line bg-panel px-3 py-2 text-sm leading-6 text-slate-700">
                <span className="font-semibold text-ink">Recommended action: </span>{finding.recommendedAction}
              </div>
              {finding.asset ? (
                <div className="mt-3">
                  <Link href={`/systems/${finding.asset.aiSystem.slug}`} className="inline-flex items-center gap-2 rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Tracked asset: {finding.asset.name}
                  </Link>
                </div>
              ) : null}
            </article>
          ))}
          {findings.length === 0 ? <EmptyState text="No discovery findings exist yet." /> : null}
        </div>
      </Section>

      <Section title="Inventory completeness">
        <div className="grid gap-3 md:grid-cols-4">
          <SummaryPanel title="Known assets" items={findings.filter((finding) => finding.disposition === "KNOWN_ASSET").map((finding) => finding.assetName)} empty="No known assets found." />
          <SummaryPanel title="Untracked assets" items={untracked.map((finding) => finding.assetName)} empty="No untracked assets found." tone="warning" />
          <SummaryPanel title="Unknown assets" items={unknown.map((finding) => finding.assetName)} empty="No unknown assets found." tone="warning" />
          <SummaryPanel title="Missing or orphaned" items={[...missing, ...orphaned].map((finding) => finding.assetName)} empty="No missing assets found." tone="warning" />
        </div>
      </Section>
    </>
  );
}

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span>{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-line bg-white p-5 text-sm text-slate-500">{text}</div>;
}

function SummaryPanel({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone?: "warning" }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <FileSearch className={`h-4 w-4 ${tone === "warning" ? "text-amber-600" : "text-brand"}`} />
        {title}
      </div>
      <div className="mt-3 grid gap-2">
        {items.length > 0 ? items.map((item) => (
          <div key={item} className="rounded border border-line bg-panel px-3 py-2 text-sm text-slate-700">{item}</div>
        )) : <div className="rounded border border-line bg-panel px-3 py-2 text-sm text-slate-500">{empty}</div>}
      </div>
    </article>
  );
}
