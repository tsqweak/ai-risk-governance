import Link from "next/link";
import { getAuditorTraceabilityEnhanced } from "../data";
import { Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function TraceabilityPage() {
  const { findings, regulations } = await getAuditorTraceabilityEnhanced();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Auditor traceability</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Regulation to AI system traceability</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Follow the evidence chain from finding to failed test to control expectation to requirement to regulation.
        </p>
      </header>

      <Section title="Finding-led traceability">
        <div className="space-y-4">
          {findings.map((finding) => {
            const related = relatedRegulations(finding.controlTest.testId, regulations);
            return (
              <article key={finding.id} className="rounded-md border border-line bg-white p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-ink">{finding.findingId}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Finding → Failed Test → Control → Requirement → Regulation
                    </div>
                  </div>
                  <div className="flex gap-2"><StatusBadge status={finding.severity} /><StatusBadge status={finding.status} /></div>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-4">
                  <TraceCard label="Finding" value={finding.title} detail={finding.aiSystem.name} href={`/systems/${finding.aiSystem.slug}/monitoring`} />
                  <TraceCard label="Failed Test" value={`${finding.controlTest.testId} · ${finding.controlTest.title}`} detail={finding.controlTest.aiGovernanceInterpretation} />
                  <TraceCard label="Control" value={finding.controlTest.traditionalGovernanceConcept} detail={finding.controlTest.whyItMatters} />
                  <div className="rounded border border-line bg-panel p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements / Regulations</div>
                    <div className="mt-2 space-y-2">
                      {related.slice(0, 4).map((item) => (
                        <Link key={`${item.regulation.slug}-${item.requirement.referenceId}`} href={`/regulatory/${item.regulation.slug}`} className="block rounded bg-white px-2 py-2 text-xs text-slate-700 hover:text-brand">
                          <span className="font-semibold text-ink">{item.requirement.referenceId}</span> · {item.regulation.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section title="Traceability chain">
        <div className="space-y-5">
          {regulations.map((regulation) => (
            <section key={regulation.id} className="rounded-md border border-line bg-white p-5">
              <Link href={`/regulatory/${regulation.slug}`} className="text-base font-semibold text-ink hover:text-brand">
                {regulation.name}
              </Link>
              <div className="mt-1 text-xs text-slate-500">{regulation.jurisdiction} · {regulation.regulator}</div>
              <div className="mt-4 space-y-3">
                {regulation.requirements.map((requirement) => (
                  <div key={requirement.id} className="rounded border border-line bg-panel p-4">
                    <div className="text-sm font-semibold text-ink">{requirement.referenceId} · {requirement.title}</div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-3">
                      {requirement.controlMappings.map((mapping) => (
                        <div key={mapping.id} className="rounded border border-line bg-white p-3">
                          <div className="text-xs font-semibold text-brand">{mapping.regulatoryControl.controlId}</div>
                          <div className="mt-1 text-sm font-medium text-ink">{mapping.regulatoryControl.title}</div>
                          <div className="mt-3 space-y-2">
                            {mapping.regulatoryControl.aiSystemMappings.length > 0 ? mapping.regulatoryControl.aiSystemMappings.map((systemMapping) => (
                              <div key={systemMapping.id} className="flex items-center justify-between gap-3 text-sm">
                                <Link href={`/systems/${systemMapping.aiSystem.slug}`} className="text-slate-700 hover:text-brand">
                                  {systemMapping.aiSystem.name}
                                </Link>
                                <StatusBadge status={systemMapping.auditStatus} />
                              </div>
                            )) : <StatusBadge status="OPEN_GAP" />}
                          </div>
                          <div className="mt-3 text-xs text-slate-500">
                            Evidence linked: {mapping.regulatoryControl.evidenceItems.length}
                          </div>
                          <div className="mt-3 space-y-2">
                            {mapping.regulatoryControl.evidenceRequirements.map((evidenceRequirement) => (
                              <div key={evidenceRequirement.id} className="rounded border border-line bg-panel p-2">
                                <div className="text-xs font-semibold text-ink">{evidenceRequirement.evidenceType}</div>
                                <div className="mt-1 text-xs text-slate-500">Evidence requirement: {evidenceRequirement.requirementId}</div>
                                {evidenceRequirement.evidenceLinks.length > 0 ? evidenceRequirement.evidenceLinks.map((link) => (
                                  <Link key={link.id} href={`/evidence/${link.evidenceObject.evidenceId}`} className="mt-2 block rounded bg-white px-2 py-1 text-xs text-slate-700 hover:text-brand">
                                    {link.evidenceObject.title} · {link.evidenceObject.aiSystem.name}
                                  </Link>
                                )) : (
                                  <div className="mt-2 text-xs text-red-700">Missing evidence object</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}

function TraceCard({ label, value, detail, href }: { label: string; value: string; detail: string; href?: string }) {
  const content = (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
      <div className="mt-2 text-xs leading-5 text-slate-600">{detail}</div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function relatedRegulations(
  testId: string,
  regulations: Awaited<ReturnType<typeof getAuditorTraceabilityEnhanced>>["regulations"]
) {
  const themes = themesForTest(testId);
  return regulations.flatMap((regulation) =>
    regulation.requirements
      .filter((requirement) => themes.some((theme) => requirement.title.toLowerCase().includes(theme)))
      .map((requirement) => ({ regulation, requirement }))
  );
}

function themesForTest(testId: string) {
  const map: Record<string, string[]> = {
    "CCM-001": ["governance"],
    "CCM-002": ["governance", "technical documentation"],
    "CCM-003": ["governance"],
    "CCM-004": ["validation", "risk management"],
    "CCM-005": ["monitoring"],
    "CCM-006": ["inventory", "governance"],
    "CCM-007": ["evidence", "technical documentation"],
    "CCM-008": ["human oversight"],
    "CCM-009": ["data governance"],
    "CCM-010": ["third party risk"]
  };
  return map[testId] ?? ["governance"];
}
