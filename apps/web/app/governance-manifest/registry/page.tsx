import Link from "next/link";
import { AlertTriangle, FileCode2, ShieldCheck } from "lucide-react";
import { getGovernanceManifestRegistry } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { Metric, Section, StatusBadge } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function GovernanceManifestRegistryPage() {
  const data = await getGovernanceManifestRegistry();
  const missing = data.repositories.filter((repository) => !repository.governanceManifest);

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Manifest Registry</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Discovered AI Governance.yaml files</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Manifest validation status, owners, lifecycle, risk tier, and declared evidence sources across repository onboarding.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Repositories" value={data.repositories.length} icon={FileCode2} />
        <Metric label="Manifests" value={data.manifests.length} icon={ShieldCheck} />
        <Metric label="Missing" value={missing.length} icon={AlertTriangle} />
        <Metric label="Findings" value={data.missingManifestFindings.length} icon={AlertTriangle} />
      </div>

      <Section title="Manifest records">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Repository</th>
                <th className="px-4 py-3">Validation</th>
                <th className="px-4 py-3">Owners</th>
                <th className="px-4 py-3">Lifecycle</th>
                <th className="px-4 py-3">Risk Tier</th>
                <th className="px-4 py-3">Evidence Sources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.repositories.map((repository) => (
                <tr key={repository.id}>
                  <td className="px-4 py-4">
                    <Link href={`/onboarding/repositories/${repository.id}`} className="font-semibold text-ink hover:text-brand">{repository.name}</Link>
                    <div className="mt-1 text-xs text-slate-500">{repository.governanceManifest?.location ?? "AI Governance.yaml not found"}</div>
                  </td>
                  <td className="px-4 py-4">
                    {repository.governanceManifest ? <StatusBadge status={repository.governanceManifest.validationStatus} /> : <StatusBadge status="INVALID" />}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {repository.governanceManifest ? `${repository.governanceManifest.businessOwner} / ${repository.governanceManifest.riskOwner}` : "Missing manifest owners"}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {repository.governanceManifest ? humanize(repository.governanceManifest.lifecycleStage) : humanize(repository.suggestedLifecycleStage)}
                  </td>
                  <td className="px-4 py-4">
                    {repository.governanceManifest ? <StatusBadge status={repository.governanceManifest.riskTier} /> : <StatusBadge status="WARNING" />}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {repository.governanceManifest?.evidenceSourceCount ?? repository.evidenceSources.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Manifest findings">
        <div className="grid gap-3">
          {data.missingManifestFindings.map((finding) => (
            <article key={finding.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{finding.findingId} · {finding.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{finding.rationale}</p>
                  <div className="mt-1 text-xs text-slate-500">Created {formatDate(finding.createdAt)}</div>
                </div>
                <div className="flex gap-2"><StatusBadge status={finding.severity} /><StatusBadge status={finding.status} /></div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
