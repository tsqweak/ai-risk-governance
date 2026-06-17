import Link from "next/link";
import { AlertTriangle, CheckCircle2, Cpu, FileCheck2, ListChecks, Puzzle, ShieldCheck } from "lucide-react";
import { getGovernanceEngineeringDashboard } from "../data";
import { humanize } from "../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function GovernanceEngineeringPage() {
  const data = await getGovernanceEngineeringDashboard();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Governance engineering</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Control implementation assurance</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Trace governance requirements to technical implementation, evidence, monitoring, and validation status.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Controls Implemented" value={data.kpis.controlsImplemented} icon={ShieldCheck} />
        <Metric label="Missing Implementations" value={data.kpis.controlsMissingImplementations} icon={AlertTriangle} />
        <Metric label="Validated" value={data.kpis.validatedImplementations} icon={CheckCircle2} />
        <Metric label="Runtime Controls" value={data.kpis.runtimeControls} icon={Cpu} />
      </div>

      <Section title="Educational Layer">
        <div className="grid gap-4 lg:grid-cols-2">
          <LearningPanel title="Control to Continuous Assurance">
            <div className="grid gap-2">
              <p><span className="font-semibold">Control Objective:</span> Define what must be true for risk to be governed.</p>
              <p><span className="font-semibold">Implementation Method:</span> Show the technical or workflow mechanism that makes the control real.</p>
              <p><span className="font-semibold">Evidence Produced:</span> Retain policy files, configuration, code, diagrams, tests, or monitoring reports.</p>
              <p><span className="font-semibold">Monitoring Method:</span> Connect implementation status to CCM test results and findings.</p>
            </div>
          </LearningPanel>
          <LearningPanel title="Why It Matters">
            <div className="grid gap-2">
              <p><span className="font-semibold">Travel Brain Example:</span> Tool permissions are implemented by an agent tool policy that denies booking and write actions.</p>
              <p><span className="font-semibold">Autonomous Payment Agent Example:</span> Transaction limits, dual approval, kill switch, and execution logging make agentic controls inspectable.</p>
              <p><span className="font-semibold">Continuous Assurance:</span> CCM-014 checks implementation coverage, validation, evidence, and runtime monitoring.</p>
            </div>
          </LearningPanel>
        </div>
      </Section>

      <Section title="Implementations">
        <div className="grid gap-3">
          {data.implementations.map((implementation) => (
            <Link key={implementation.id} href={`/systems/${implementation.aiSystem.slug}/governance-engineering`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{implementation.implementationId} · {implementation.title}</div>
                  <p className="mt-1 text-sm text-slate-700">{implementation.description}</p>
                  <div className="mt-2 text-xs text-slate-500">
                    {implementation.aiSystem.name} · {implementation.implementationType} · {implementation.controlLinks.map((link) => link.control.code).join(", ")}
                  </div>
                </div>
                <StatusBadge status={implementation.status} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Panel title="Implementation Coverage" entries={data.byType} />
        <Panel title="Validation Status" entries={data.byStatus} />
        <Panel title="Missing Implementations" entries={Object.fromEntries(data.missingImplementations.map((control) => [`${control.code} ${control.title}`, 1]))} />
        <Panel title="Governance Engineering Findings" entries={Object.fromEntries(data.findings.map((finding) => [`${finding.aiSystem.name}: ${finding.severity}`, 1]))} />
      </div>

      <Section title="Implementation Evidence">
        <div className="grid gap-3 md:grid-cols-2">
          {data.implementations.flatMap((implementation) => implementation.evidence.map((evidence) => (
            <article key={evidence.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{evidence.evidenceId}</div>
                  <p className="mt-1 text-xs text-slate-500">{implementation.title} · {evidence.evidenceType}</p>
                </div>
                <FileCheck2 className="h-4 w-4 text-brand" />
              </div>
              <p className="mt-3 text-sm text-slate-700">{evidence.location}</p>
            </article>
          )))}
        </div>
      </Section>
    </>
  );
}

function Panel({ title, entries }: { title: string; entries: Record<string, number> }) {
  return (
    <section className="rounded-md border border-line bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <ListChecks className="h-4 w-4 text-brand" />
        {title}
      </h2>
      <div className="mt-4 divide-y divide-line">
        {Object.entries(entries).length === 0 ? <p className="py-3 text-sm text-slate-600">No records.</p> : null}
        {Object.entries(entries).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
            <div className="text-slate-700">{humanize(label)}</div>
            <div className="font-semibold text-ink">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
