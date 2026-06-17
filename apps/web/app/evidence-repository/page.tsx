import Link from "next/link";
import { Archive, CheckCircle2, Download, FileSearch, PackageCheck, Search } from "lucide-react";
import { getEvidenceRepository } from "../data";
import { formatDate } from "../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EvidenceRepositoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = getParam(params.q).toLowerCase();
  const systemFilter = getParam(params.system);
  const typeFilter = getParam(params.type);
  const statusFilter = getParam(params.status);
  const ownerFilter = getParam(params.owner).toLowerCase();
  const regulationFilter = getParam(params.regulation);

  const data = await getEvidenceRepository();
  const filteredObjects = data.objects.filter((evidence) => {
    const controls = evidence.requirementLinks.map((link) => link.evidenceRequirement.controlId).join(" ");
    const regulations = evidence.requirementLinks.map((link) => link.evidenceRequirement.regulatoryControl?.regulation.name ?? "").join(" ");
    const risks = evidence.aiRiskLinks.map((link) => link.aiRisk.title).join(" ");
    const haystack = [evidence.evidenceId, evidence.title, evidence.owner, evidence.reviewer, evidence.aiSystem.name, evidence.evidenceType, controls, regulations, risks].join(" ").toLowerCase();

    return (
      (!query || haystack.includes(query)) &&
      (!systemFilter || evidence.aiSystem.slug === systemFilter) &&
      (!typeFilter || evidence.evidenceType === typeFilter) &&
      (!statusFilter || evidence.status === statusFilter) &&
      (!ownerFilter || evidence.owner.toLowerCase().includes(ownerFilter)) &&
      (!regulationFilter || evidence.requirementLinks.some((link) => link.evidenceRequirement.regulatoryControl?.regulation.slug === regulationFilter))
    );
  });

  const evidenceTypes = unique(data.objects.map((evidence) => evidence.evidenceType));
  const statuses = unique(data.objects.map((evidence) => evidence.status));
  const current = data.health.filter((record) => record.health === "CURRENT").length;
  const gaps = data.health.filter((record) => record.health === "MISSING" || record.health === "EXPIRED" || record.validation === "INVALID").length;

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Enterprise Evidence Repository</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Evidence as governed proof</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Search, filter, review, download, and trace evidence across AI systems, regulations, controls, risks, findings, exceptions, and implementations.
          </p>
        </div>
        <Link href="/audit-packages" className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          <PackageCheck className="h-4 w-4" />
          Audit Packages
        </Link>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Evidence Objects" value={data.objects.length} icon={Archive} />
        <Metric label="Current Evidence" value={current} icon={CheckCircle2} />
        <Metric label="Evidence Gaps" value={gaps} icon={FileSearch} />
        <Metric label="Audit Packages" value={data.packages.length} icon={PackageCheck} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LearningPanel title="What is evidence?">
          Evidence is retained proof that a governance obligation, control, approval, review, or monitoring activity exists and is operating.
        </LearningPanel>
        <LearningPanel title="Why evidence matters">
          Evidence lets auditors and regulators move from assertion to verification: obligation to control, control to proof, proof to issue history.
        </LearningPanel>
        <LearningPanel title="How to use this page">
          Start with a search term or filter, open the evidence viewer, follow traceability links, then download or package the evidence for audit review.
        </LearningPanel>
      </div>

      <Section title="Search and filters">
        <form className="grid gap-3 rounded-md border border-line bg-white p-4 md:grid-cols-3 xl:grid-cols-6">
          <label className="text-xs font-semibold text-slate-500">
            Search
            <div className="mt-1 flex items-center gap-2 rounded border border-line bg-panel px-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input name="q" defaultValue={getParam(params.q)} className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none" placeholder="Title, ID, owner, system" />
            </div>
          </label>
          <Select name="system" label="AI System" value={systemFilter} options={data.systems.map((system) => [system.slug, system.name])} />
          <Select name="type" label="Evidence Type" value={typeFilter} options={evidenceTypes.map((type) => [type, type])} />
          <Select name="status" label="Status" value={statusFilter} options={statuses.map((status) => [status, status])} />
          <Select name="regulation" label="Regulation" value={regulationFilter} options={data.regulations.map((regulation) => [regulation.slug, regulation.name])} />
          <label className="text-xs font-semibold text-slate-500">
            Owner
            <input name="owner" defaultValue={getParam(params.owner)} className="mt-1 w-full rounded border border-line bg-panel px-3 py-2 text-sm text-ink outline-none" placeholder="Owner" />
          </label>
          <div className="md:col-span-3 xl:col-span-6">
            <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Apply Filters</button>
            <Link href="/evidence-repository" className="ml-3 text-sm font-semibold text-slate-600 hover:text-ink">Clear</Link>
          </div>
        </form>
      </Section>

      <Section title="Evidence inventory">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Evidence</th>
                <th className="px-4 py-3">AI System</th>
                <th className="px-4 py-3">Owner / Reviewer</th>
                <th className="px-4 py-3">Control / Regulation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredObjects.map((evidence) => {
                const firstRequirement = evidence.requirementLinks[0]?.evidenceRequirement;
                return (
                  <tr key={evidence.id}>
                    <td className="px-4 py-4">
                      <Link href={`/evidence/${evidence.evidenceId}`} className="font-semibold text-ink hover:text-brand">{evidence.title}</Link>
                      <div className="mt-1 text-xs text-slate-500">{evidence.evidenceId} · {evidence.evidenceType} · v{evidence.version}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{evidence.aiSystem.name}</td>
                    <td className="px-4 py-4 text-slate-700">{evidence.owner} / {evidence.reviewer}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {firstRequirement?.controlId ?? "Unmapped"}
                      <div className="mt-1 text-xs text-slate-500">{firstRequirement?.regulatoryControl?.regulation.name ?? "No regulation link"}</div>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={evidence.status} /></td>
                    <td className="px-4 py-4 text-slate-700">{formatDate(evidence.expirationDate)}</td>
                    <td className="px-4 py-4">
                      <Link href={`/evidence/${evidence.evidenceId}/download?format=markdown`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-blue-700">
                        <Download className="h-3.5 w-3.5" />
                        Markdown
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

function Select({ name, label, value, options }: { name: string; label: string; value: string; options: string[][] }) {
  return (
    <label className="text-xs font-semibold text-slate-500">
      {label}
      <select name={name} defaultValue={value} className="mt-1 w-full rounded border border-line bg-panel px-3 py-2 text-sm text-ink outline-none">
        <option value="">All</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function unique(items: string[]) {
  return Array.from(new Set(items)).sort();
}
