import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, FileSearch, GitBranch, ShieldAlert, ShieldCheck } from "lucide-react";
import { getRepositoryDiscovery } from "../../../data";
import { formatDate, humanize } from "../../../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function RepositoryReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repository = await getRepositoryDiscovery(id);
  if (!repository) notFound();

  const controls = JSON.parse(repository.suggestedControlsJson) as string[];
  const risks = JSON.parse(repository.suggestedRisksJson) as string[];
  const riskDomains = JSON.parse(repository.suggestedRiskDomainsJson) as string[];
  const jurisdictions = JSON.parse(repository.suggestedJurisdictionsJson) as string[];

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Repository Review</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{repository.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{repository.rationale}</p>
        </div>
        <StatusBadge status={repository.reviewStatus} />
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Components" value={repository.components.length} icon={GitBranch} />
        <Metric label="Evidence Sources" value={repository.evidenceSources.length} icon={FileSearch} />
        <Metric label="Controls" value={controls.length} icon={ShieldCheck} />
        <Metric label="Risks" value={risks.length} icon={ShieldAlert} />
        <Metric label="Review Status" value={humanize(repository.reviewStatus)} icon={CheckCircle2} />
      </div>

      <Section title="Repository analysis">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-md border border-line bg-white p-5">
            <dl className="grid gap-3 md:grid-cols-2">
              <Fact label="Description" value={repository.description} />
              <Fact label="Location" value={repository.location} />
              <Fact label="Repository Type" value={humanize(repository.repositoryType)} />
              <Fact label="Reviewer" value={repository.reviewer ?? "Unassigned"} />
              <Fact label="Created" value={formatDate(repository.createdAt)} />
              <Fact label="Updated" value={formatDate(repository.updatedAt)} />
            </dl>
          </div>
          <LearningPanel title="Review principle">
            This profile is a recommendation. It can help reviewers move faster, but final governance classification, risk acceptance, lifecycle approval, and authority assignment must remain human-reviewed.
          </LearningPanel>
        </div>
      </Section>

      <Section title="AI Governance.yaml">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <article className="rounded-md border border-line bg-white p-5">
            <div className="text-sm font-semibold text-ink">Manifest Check</div>
            <div className="mt-3">
              {repository.governanceManifest ? <StatusBadge status={repository.governanceManifest.validationStatus} /> : <StatusBadge status="INVALID" />}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {repository.governanceManifest ? "AI Governance.yaml was discovered and parsed into the suggested governance profile." : "AI Governance.yaml was not discovered. This repository cannot be approved until a manifest is declared and reviewed."}
            </p>
            <Link href="/governance-manifest" className="mt-4 inline-block text-sm font-semibold text-brand hover:text-blue-700">View manifest standard</Link>
          </article>
          <div className="rounded-md border border-line bg-white p-5">
            {repository.governanceManifest ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <Fact label="System" value={repository.governanceManifest.systemName} />
                  <Fact label="Business Owner" value={repository.governanceManifest.businessOwner} />
                  <Fact label="Risk Owner" value={repository.governanceManifest.riskOwner} />
                  <Fact label="AI Type" value={repository.governanceManifest.aiType} />
                  <Fact label="Lifecycle" value={humanize(repository.governanceManifest.lifecycleStage)} />
                  <Fact label="Evidence Sources" value={`${repository.governanceManifest.evidenceSourceCount}`} />
                </div>
                <pre className="mt-4 max-h-80 overflow-auto rounded border border-line bg-panel p-3 text-xs leading-5 text-slate-700">{repository.governanceManifest.manifestYaml}</pre>
              </>
            ) : (
              <div className="space-y-3">
                {repository.onboardingFindings.map((finding) => (
                  <Explainer key={finding.id} label={`${finding.findingId}: ${finding.title}`} value={finding.rationale} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section title="Suggested governance profile">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Profile label="System Type" value={repository.suggestedSystemType} />
          <Profile label="Agentic Level" value={`Level ${repository.suggestedAgenticLevel}`} />
          <Profile label="Authority Level" value={`Level ${repository.suggestedAuthorityLevel}`} />
          <Profile label="Lifecycle Stage" value={humanize(repository.suggestedLifecycleStage)} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ListPanel title="Risk Domains" items={riskDomains} />
          <ListPanel title="Jurisdictions" items={jurisdictions} />
        </div>
      </Section>

      <Section title="Detected AI components">
        <div className="grid gap-3 md:grid-cols-2">
          {repository.components.map((component) => (
            <article key={component.id} className="rounded-md border border-line bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">{humanize(component.componentType)}</div>
              <h2 className="mt-1 text-sm font-semibold text-ink">{component.name}</h2>
              <div className="mt-1 text-xs text-slate-500">{component.location}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{component.rationale}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Evidence source discovery">
        <div className="grid gap-3">
          {repository.evidenceSources.map((source) => (
            <article key={source.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand">{humanize(source.sourceType)}</div>
                  <h2 className="mt-1 text-sm font-semibold text-ink">{source.title}</h2>
                  <div className="mt-1 text-xs text-slate-500">{source.location}</div>
                </div>
                <StatusBadge status={source.automationLevel.toUpperCase()} />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Explainer label="Collection Method" value={source.collectionMethod} />
                <Explainer label="Validation Method" value={source.validationMethod} />
                <Explainer label="Why identified" value={source.rationale} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Section title="Suggested controls">
          <div className="space-y-3">
            {controls.map((control) => (
              <Explainer key={control} label={control} value={controlRationale(control)} />
            ))}
          </div>
        </Section>
        <Section title="Suggested risks">
          <div className="space-y-3">
            {risks.map((risk) => (
              <Explainer key={risk} label={risk} value={riskRationale(risk)} />
            ))}
          </div>
        </Section>
      </div>

      <Section title="Approval workflow">
        <div className="grid gap-3 md:grid-cols-4">
          {["Suggested", "Reviewed", "Approved", "Rejected"].map((status) => (
            <div key={status} className="rounded-md border border-line bg-white p-4">
              <div className="text-sm font-semibold text-ink">{status}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {status === "Suggested" ? "Generated by repository discovery." : status === "Reviewed" ? "Validated by IT Risk or Compliance." : status === "Approved" ? "Eligible to create or update active governance records." : "Rejected with rationale retained for audit."}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-ink">{value}</dd>
    </div>
  );
}

function Profile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-ink">{value}</div>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => <span key={item} className="rounded border border-line bg-panel px-2 py-1 text-xs font-semibold text-slate-700">{item}</span>)}
      </div>
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

function controlRationale(control: string) {
  if (control === "AI-GOV-006") return "Tool policy and read-only API usage were detected, so tool governance should be reviewed.";
  if (control === "AI-GOV-005") return "Prompt files were detected, so prompt version history and approval evidence are required.";
  if (control === "AI-LC-006") return "Repository appears production-oriented, so production approval evidence should be reviewed before activation.";
  return "Suggested because repository discovery found AI governance artifacts that should be reviewed before profile approval.";
}

function riskRationale(risk: string) {
  if (risk.includes("Hallucinated")) return "Generated travel recommendations can be inaccurate or unsupported.";
  if (risk.includes("Privacy")) return "Preference data and travel context may include personal information.";
  if (risk.includes("Guidance")) return "Customers may treat recommendations as bank-approved guidance.";
  return "Suggested by detected AI components, data usage, tools, and governance artifacts.";
}
