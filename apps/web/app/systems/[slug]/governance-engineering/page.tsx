import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Cpu, FileCheck2, Radar, ShieldCheck } from "lucide-react";
import { getAiSystemGovernanceEngineering } from "../../../data";
import { formatDate, humanize } from "../../../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function SystemGovernanceEngineeringPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemGovernanceEngineering(slug);
  if (!system) notFound();
  const validated = system.controlImplementations.filter((implementation) => implementation.status === "VALIDATED");
  const runtime = system.controlImplementations.filter((implementation) => implementation.implementationType === "Runtime Control");

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI system governance engineering</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">{system.name} implementation traceability</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Control to implementation to evidence to monitoring to status for this AI system.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-5">
        <Metric label="Controls" value={system.systemControls.length} icon={ShieldCheck} />
        <Metric label="Implementations" value={system.controlImplementations.length} icon={Cpu} />
        <Metric label="Validated" value={validated.length} icon={CheckCircle2} />
        <Metric label="Runtime" value={runtime.length} icon={Radar} />
        <Metric label="Findings" value={system.findings.length} icon={AlertTriangle} />
      </div>

      <Section title="Educational Layer">
        <div className="grid gap-4 lg:grid-cols-2">
          {system.controlImplementations.slice(0, 2).map((implementation) => (
            <LearningPanel key={implementation.id} title={implementation.title}>
              <div className="grid gap-2">
                <p><span className="font-semibold">Control Objective:</span> {implementation.primaryControl.title}</p>
                <p><span className="font-semibold">Implementation Method:</span> {implementation.description}</p>
                <p><span className="font-semibold">Evidence Produced:</span> {implementation.evidence.map((evidence) => evidence.evidenceType).join(", ") || "No evidence"}</p>
                <p><span className="font-semibold">Monitoring Method:</span> {implementation.validationMethod}</p>
                <p><span className="font-semibold">Travel Brain Example:</span> Prompt and tool policies turn governance controls into inspectable implementation records.</p>
                <p><span className="font-semibold">Autonomous Payment Agent Example:</span> Runtime controls expose transaction limits, dual approval, kill switch, and execution logging readiness.</p>
                <p><span className="font-semibold">Why It Matters:</span> Auditors can verify that a control exists in technology, not just in policy language.</p>
              </div>
            </LearningPanel>
          ))}
        </div>
      </Section>

      <Section title="Assurance story for non-engineers">
        <div className="grid gap-4 lg:grid-cols-2">
          {system.controlImplementations.slice(0, 4).map((implementation) => (
            <article key={implementation.id} className="rounded-md border border-line bg-white p-4">
              <h2 className="text-sm font-semibold text-ink">{implementation.title}</h2>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                <p><span className="font-semibold text-ink">Risk Requirement:</span> {implementation.primaryControl.description}</p>
                <p><span className="font-semibold text-ink">Control:</span> {implementation.primaryControl.code} · {implementation.primaryControl.title}</p>
                <p><span className="font-semibold text-ink">Implementation:</span> {implementation.implementationLocation}</p>
                <p><span className="font-semibold text-ink">Evidence:</span> {implementation.evidence.map((evidence) => `${evidence.evidenceId} (${evidence.evidenceType})`).join(", ") || "Missing"}</p>
                <p><span className="font-semibold text-ink">Monitoring:</span> {implementation.validationMethod}</p>
                <p><span className="font-semibold text-ink">Assurance Story:</span> This shows how a governance requirement becomes a technical control, how that control produces evidence, and how monitoring proves whether it is still operating.</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Control to Implementation Traceability">
        <div className="grid gap-4">
          {system.controlImplementations.map((implementation) => (
            <article key={implementation.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-ink">{implementation.primaryControl.code} {"->"} {implementation.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{implementation.description}</p>
                  <div className="mt-2 text-xs text-slate-500">{implementation.implementationType} · Owner {implementation.owner} · {implementation.implementationLocation}</div>
                </div>
                <StatusBadge status={implementation.status} />
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <TraceCard title="Controls" status={implementation.primaryControl.category} detail={implementation.controlLinks.map((link) => `${link.control.code} ${link.control.title}`).join("; ")} />
                <TraceCard title="Evidence" status={implementation.evidence.length > 0 ? "COLLECTED" : "MISSING"} detail={implementation.evidence.map((evidence) => `${evidence.evidenceId}: ${evidence.location}`).join("; ") || "No implementation evidence."} />
                <TraceCard title="Monitoring" status={implementation.validationMethod.includes("CCM-") ? "VALID" : "NEEDS_ATTENTION"} detail={implementation.validationMethod} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Panel title="CCM-014 Monitoring">
          {system.testRuns.map((run) => (
            <Row key={run.id} title={run.controlTest.title} subtitle={`${formatDate(run.executionDate)} · ${run.resultDetails}`} status={run.result} />
          ))}
        </Panel>
        <Panel title="Governance Engineering Findings">
          {system.findings.length === 0 ? <p className="p-4 text-sm text-slate-600">No governance engineering findings.</p> : null}
          {system.findings.map((finding) => (
            <Row key={finding.id} title={finding.title} subtitle={finding.description} status={finding.status} />
          ))}
        </Panel>
      </div>
    </>
  );
}

function TraceCard({ title, status, detail }: { title: string; status: string; detail: string }) {
  return (
    <div className="rounded-md border border-line bg-panel p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">{title}</div>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-700">{detail}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-white">
      <h2 className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">{title}</h2>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function Row({ title, subtitle, status }: { title: string; subtitle: string; status: string }) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink">{title}</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</div>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
