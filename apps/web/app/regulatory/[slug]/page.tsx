import Link from "next/link";
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
  const evidenceRequirements = regulation.requirements.flatMap((requirement) =>
    requirement.controlMappings.flatMap((mapping) => mapping.regulatoryControl.evidenceRequirements)
  );
  const currentEvidence = evidenceRequirements.flatMap((requirement) => requirement.evidenceLinks.map((link) => link.evidenceObject));
  const missingEvidence = evidenceRequirements.filter((requirement) => requirement.healthRecords.some((record) => record.health === "MISSING"));
  const expiredEvidence = evidenceRequirements.filter((requirement) => requirement.healthRecords.some((record) => record.health === "EXPIRED" || record.validation === "EXPIRED"));
  const packages = new Map<string, { title: string; packageId: string }>();
  for (const evidence of currentEvidence) {
    for (const link of evidence.auditPackageLinks ?? []) {
      packages.set(link.auditPackage.packageId, link.auditPackage);
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
            <Fact label="Required evidence" value={`${evidenceRequirements.length}`} />
            <Fact label="Current evidence" value={`${currentEvidence.length}`} />
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

      <Section title="Required and current evidence">
        <div className="grid gap-4 lg:grid-cols-4">
          <EvidenceSummary title="Required Evidence" value={evidenceRequirements.length} />
          <EvidenceSummary title="Current Evidence" value={currentEvidence.length} />
          <EvidenceSummary title="Missing Evidence" value={missingEvidence.length} />
          <EvidenceSummary title="Expired Evidence" value={expiredEvidence.length} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {evidenceRequirements.map((requirement) => (
            <article key={requirement.id} className="rounded-md border border-line bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">{requirement.controlId}</div>
              <h2 className="mt-1 text-sm font-semibold text-ink">{requirement.evidenceType}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{requirement.rationale}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {requirement.evidenceLinks.length > 0 ? requirement.evidenceLinks.map((link) => (
                  <Link key={link.id} href={`/evidence/${link.evidenceObject.evidenceId}`} className="rounded border border-line bg-panel px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white">
                    {link.evidenceObject.evidenceId} · {link.evidenceObject.aiSystem.name}
                  </Link>
                )) : <span className="rounded border border-line bg-panel px-2 py-1 text-xs text-red-700">Missing evidence</span>}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Compliance assurance chain">
        <div className="grid gap-3">
          {regulation.requirements.map((requirement) => (
            <article key={requirement.id} className="rounded-md border border-line bg-white p-4">
              <div className="text-sm font-semibold text-ink">{requirement.referenceId} · {requirement.title}</div>
              <div className="mt-3 grid gap-3 lg:grid-cols-5">
                <ChainBox title="Requirement" detail={requirement.description} />
                <ChainBox title="Control" detail={requirement.controlMappings.map((mapping) => mapping.regulatoryControl.controlId).join(", ") || "No mapped control"} />
                <ChainBox title="Evidence" detail={requirement.controlMappings.flatMap((mapping) => mapping.regulatoryControl.evidenceRequirements.flatMap((evidenceRequirement) => evidenceRequirement.evidenceLinks.map((link) => link.evidenceObject.evidenceId))).join(", ") || "Missing evidence"} />
                <ChainBox title="Approval" detail={[...packages.values()].map((auditPackage) => auditPackage.title).join(", ") || "No audit package approval"} />
                <ChainBox title="Monitoring" detail="Evidence health and CCM runs validate whether mapped controls remain supportable." />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Artifact-backed traceability">
        <div className="grid gap-3">
          {regulation.artifactTraceability.length > 0 ? regulation.artifactTraceability.map((control) => {
            const rules = regulation.artifactRules.filter((rule) => rule.controlId === control.code);
            return (
              <article key={control.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link href={`/controls/${control.code}`} className="text-sm font-semibold text-ink hover:text-brand">
                      {control.code} · {control.title}
                    </Link>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      Regulation → Control → Evidence Source → Evidence Artifact
                    </p>
                  </div>
                  <StatusBadge status={rules.some((rule) => rule.status === "FAIL") ? "FAIL" : rules.some((rule) => rule.status === "WARNING") ? "WARNING" : rules.length > 0 ? "PASS" : "MISSING"} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rules.length > 0 ? rules.map((rule) => (
                    <Link key={rule.id} href={`/evidence-artifacts/${rule.evidenceArtifact.artifactId}`} className="rounded border border-line bg-panel px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white">
                      {rule.evidenceArtifact.name} · {rule.evidenceArtifact.source.asset.aiSystem.name}
                    </Link>
                  )) : <span className="rounded border border-line bg-panel px-2 py-1 text-xs text-red-700">Missing artifact-backed evidence</span>}
                </div>
              </article>
            );
          }) : (
            <div className="rounded-md border border-line bg-white p-5 text-sm text-slate-600">
              No artifact-backed internal controls are mapped to this regulation yet.
            </div>
          )}
        </div>
      </Section>

      <Section title="Audit package">
        <div className="rounded-md border border-line bg-white p-5">
          {[...packages.values()].length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {[...packages.values()].map((auditPackage) => (
                <Link key={auditPackage.packageId} href="/audit-packages" className="rounded border border-line bg-panel px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
                  {auditPackage.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No audit package currently includes evidence for this regulation.</p>
          )}
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

function EvidenceSummary({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function ChainBox({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <p className="mt-2 text-xs leading-5 text-slate-700">{detail}</p>
    </div>
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
