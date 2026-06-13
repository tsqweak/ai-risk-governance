import { notFound } from "next/navigation";
import { getRegulation } from "../../data";
import { formatDate } from "../../components/format";
import { LearningPanel, Section, StatusBadge } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function RegulationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const regulation = await getRegulation(slug);
  if (!regulation) notFound();

  const linkedSystems = new Map<string, string>();
  for (const control of regulation.controls) {
    for (const mapping of control.aiSystemMappings) {
      linkedSystems.set(mapping.aiSystem.id, mapping.aiSystem.name);
    }
  }

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Regulation detail</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">{regulation.name}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{regulation.description}</p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-line bg-white p-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact label="Jurisdiction" value={regulation.jurisdiction} />
            <Fact label="Regulator" value={regulation.regulator} />
            <Fact label="Status" value={regulation.status} />
            <Fact label="Effective date" value={formatDate(regulation.effectiveDate)} />
            <Fact label="Coverage" value={`${regulation.coverage.coveragePercentage}%`} />
            <Fact label="Open gaps" value={`${regulation.coverage.uncoveredRequirements}`} />
          </dl>
        </div>
        <LearningPanel title="Educational summary">
          {regulation.whyItMatters} Typical users include {regulation.audience}. Typical evidence includes governance approvals, inventories, validation reports, monitoring dashboards, vendor due diligence, and retained audit trails.
        </LearningPanel>
      </div>

      <Section title="Requirements">
        <div className="grid gap-3">
          {regulation.requirements.map((requirement) => {
            const covered = requirement.controlMappings.some((mapping) => mapping.regulatoryControl.aiSystemMappings.length > 0);
            return (
              <article key={requirement.id} className="rounded-md border border-line bg-white p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-ink">{requirement.referenceId} · {requirement.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{requirement.description}</p>
                  </div>
                  <StatusBadge status={covered ? "COVERED" : "OPEN_GAP"} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{requirement.rationale}</p>
                <div className="mt-3 text-xs text-slate-500">Evidence examples: {(JSON.parse(requirement.evidenceExamples) as string[]).join(", ")}</div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section title="Controls">
        <div className="grid gap-4 md:grid-cols-2">
          {regulation.controls.map((control) => (
            <article key={control.id} className="rounded-md border border-line bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">{control.controlId}</div>
              <h2 className="mt-2 text-base font-semibold text-ink">{control.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{control.objective}</p>
              <div className="mt-4 rounded border border-line bg-panel p-3 text-sm text-slate-700">
                <div className="font-semibold text-ink">Testing approach</div>
                <div className="mt-1">{control.testingApproach}</div>
              </div>
              <div className="mt-3 text-xs text-slate-500">Evidence required: {(JSON.parse(control.evidenceRequired) as string[]).join(", ")}</div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Linked AI systems">
        <div className="rounded-md border border-line bg-white p-5 text-sm text-slate-700">
          {[...linkedSystems.values()].length > 0 ? [...linkedSystems.values()].join(", ") : "No AI systems currently mapped."}
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value}</dd>
    </div>
  );
}
