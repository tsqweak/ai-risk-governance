import Link from "next/link";
import { Bot, CheckCircle2, ClipboardCheck, FileSearch, Gauge, GitBranch, Layers3, Radar, ShieldCheck } from "lucide-react";
import { getTravelBrainPilotAssessment } from "../../data";
import { humanize } from "../../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function TravelBrainPilotPage() {
  const pilot = await getTravelBrainPilotAssessment();
  const declaredAssets = pilot.assets.reduce((total, asset) => total + asset.declaredAssets.length, 0);
  const evidenceSourceCount = pilot.evidenceSources.reduce((total, source) => total + source.sources.length, 0);

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Phase 8.6 Pilot Workspace</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Travel Brain governance manifest pilot</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Validate AI Governance.yaml, the asset inventory model, the Evidence Source Framework, and repository discovery before building Governance Operations and Evidence Automation.
          </p>
        </div>
        <Link href="/systems/travel-brain" className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          Open Travel Brain
        </Link>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Manifest" value={pilot.manifest ? humanize(pilot.manifest.validationStatus) : "Missing"} icon={ClipboardCheck} />
        <Metric label="Asset Categories" value={pilot.assets.length} icon={Layers3} />
        <Metric label="Declared Assets" value={declaredAssets} icon={GitBranch} />
        <Metric label="Evidence Sources" value={evidenceSourceCount} icon={FileSearch} />
        <Metric label="Readiness" value={`${pilot.readiness.governanceReadiness}%`} icon={Gauge} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <LearningPanel title="Manifest first">
          AI Governance.yaml provides the declared onboarding baseline. It tells reviewers what the system is, who owns it, what assets exist, and where evidence should originate.
        </LearningPanel>
        <LearningPanel title="Discovery validates">
          Discovery should validate and challenge the manifest. It should not silently make final governance decisions or replace accountable review.
        </LearningPanel>
        <LearningPanel title="Evidence driven">
          Assets matter because evidence comes from assets. Controls become credible only when the platform can show supporting evidence and validation.
        </LearningPanel>
        <LearningPanel title="Enterprise scalable">
          The Travel Brain pilot tests patterns that can later apply to other AI systems, repositories, databases, runtime platforms, and governance workspaces.
        </LearningPanel>
      </div>

      <Section title="Manifest review">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <article className="rounded-md border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-ink">AI Governance.yaml</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">Current manifest validates for the repository discovery model. Manifest v2 adds full AI system asset inventory expectations.</p>
              </div>
              {pilot.manifest ? <StatusBadge status={pilot.manifest.validationStatus} /> : <StatusBadge status="INVALID" />}
            </div>
            <div className="mt-4 grid gap-3">
              <Fact label="System" value={pilot.manifest?.systemName ?? "Missing"} />
              <Fact label="Business Owner" value={pilot.manifest?.businessOwner ?? "Missing"} />
              <Fact label="Risk Owner" value={pilot.manifest?.riskOwner ?? "Missing"} />
              <Fact label="Lifecycle" value={pilot.manifest ? humanize(pilot.manifest.lifecycleStage) : "Missing"} />
              <Fact label="Governance Readiness" value={`${pilot.readiness.governanceReadiness}%`} />
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Missing v2 fields</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {pilot.missingFields.length > 0 ? pilot.missingFields.map((field) => <span key={field} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">{field}</span>) : <StatusBadge status="VALID" />}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {pilot.manifestMessages.map((message) => (
                <div key={message} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  {message}
                </div>
              ))}
            </div>
          </article>
          <pre className="max-h-[34rem] overflow-auto rounded-md border border-line bg-white p-4 text-xs leading-5 text-slate-700">{pilot.manifest?.manifestYaml ?? "AI Governance.yaml not found."}</pre>
        </div>
      </Section>

      <Section title="Asset inventory">
        <div className="grid gap-3">
          {pilot.assets.map((asset) => (
            <article key={asset.category} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{asset.category}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{asset.rationale}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={asset.discoveryStatus} />
                  <StatusBadge status={asset.evidencePotential} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {asset.declaredAssets.map((declaredAsset) => (
                  <span key={declaredAsset} className="rounded border border-line bg-panel px-2 py-1 text-xs font-semibold text-slate-700">{declaredAsset}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Evidence source inventory">
        <div className="grid gap-3">
          {pilot.evidenceSources.map((source) => (
            <article key={source.asset} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{source.asset}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {source.sources.map((item) => <span key={item} className="rounded border border-line bg-panel px-2 py-1 text-xs font-semibold text-slate-700">{item}</span>)}
                  </div>
                </div>
                <StatusBadge status={source.automationPotential} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Explainer label="Collection Method" value={source.collectionMethod} />
                <Explainer label="Validation Method" value={source.validationMethod} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Section title="Discovery assessment">
          <div className="grid gap-3">
            <DiscoveryPanel title="Discoverable" icon={Radar} items={pilot.discoveryAssessment.discoverable.map((asset) => asset.category)} detail="Can be discovered from repository, runtime, log, or monitoring metadata with limited human input." />
            <DiscoveryPanel title="Partially Discoverable" icon={Bot} items={pilot.discoveryAssessment.partiallyDiscoverable.map((asset) => asset.category)} detail="Can be detected technically, but governance meaning, ownership, approval, or classification requires reviewer validation." />
            <DiscoveryPanel title="Manual" icon={ShieldCheck} items={pilot.discoveryAssessment.manual.map((asset) => asset.category)} detail="Requires human governance records or scoped workspace access before the platform can treat it as reviewable evidence." />
          </div>
        </Section>

        <Section title="Automation assessment">
          <div className="rounded-md border border-line bg-white p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Score label="Automated Evidence" value={pilot.automationAssessment.automatedEvidencePct} />
              <Score label="Derived Evidence" value={pilot.automationAssessment.derivedEvidencePct} />
              <Score label="Human Governance" value={pilot.automationAssessment.humanGovernanceEvidencePct} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{pilot.automationAssessment.rationale}</p>
          </div>
        </Section>
      </div>

      <Section title="Governance readiness assessment">
        <div className="grid gap-4 md:grid-cols-5">
          <Score label="Manifest Quality" value={pilot.readiness.manifestQuality} />
          <Score label="Asset Coverage" value={pilot.readiness.assetCoverage} />
          <Score label="Evidence Coverage" value={pilot.readiness.evidenceCoverage} />
          <Score label="Automation Readiness" value={pilot.readiness.automationReadiness} />
          <Score label="Governance Readiness" value={pilot.readiness.governanceReadiness} />
        </div>
      </Section>

      <Section title="Phase 9 recommendations">
        <div className="grid gap-4 lg:grid-cols-3">
          <Recommendation title="Build asset inventory first" detail="Phase 9 should model AI system assets before connector automation. Without asset inventory, evidence collection has no governed boundary." />
          <Recommendation title="Prioritize high-yield connectors" detail="Start with GitHub, Portainer, log sources, and monitoring outputs, then add Supabase, MCP server, secrets, and Notion evidence collection." />
          <Recommendation title="Keep human approvals human" detail="Automate collection and validation checks, but preserve reviewer accountability for production approval, risk acceptance, and governance committee decisions." />
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function Explainer({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function DiscoveryPanel({ title, detail, items, icon: Icon }: { title: string; detail: string; items: string[]; icon: typeof Radar }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon className="h-4 w-4 text-brand" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => <span key={item} className="rounded border border-line bg-panel px-2 py-1 text-xs font-semibold text-slate-700">{item}</span>)}
      </div>
    </article>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}%</div>
    </div>
  );
}

function Recommendation({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
  );
}
