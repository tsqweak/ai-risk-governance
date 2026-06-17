import Link from "next/link";
import { notFound } from "next/navigation";
import { getAiSystemWorkspace } from "../../../data";
import { LearningPanel, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function SystemRegulationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemWorkspace(slug);
  if (!system) notFound();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Regulations</p>
        <h2 className="mt-1 text-3xl font-semibold text-ink">Regulatory traceability for {system.name}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Compliance-first view of mapped regulations, controls, audit status, and linked evidence expectations.
        </p>
      </header>

      <Section title="Why this matters">
        <LearningPanel title="Compliance to Proof">
          Regulations become auditable when obligations are mapped to controls, controls are linked to evidence, and evidence remains current.
        </LearningPanel>
      </Section>

      <Section title="Mapped regulatory controls">
        <div className="grid gap-3">
          {system.regulatoryControls.map((mapping) => (
            <Link key={mapping.id} href={`/regulatory/${mapping.regulatoryControl.regulation.slug}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{mapping.regulatoryControl.controlId} · {mapping.regulatoryControl.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {mapping.regulatoryControl.regulation.name} · {mapping.regulatoryControl.regulation.jurisdiction}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{mapping.regulatoryControl.objective}</p>
                </div>
                <StatusBadge status={mapping.auditStatus} />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
