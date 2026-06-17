import Link from "next/link";
import { notFound } from "next/navigation";
import { FileCode2, GitBranch, ShieldCheck } from "lucide-react";
import { getEvidenceArtifact } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { Breadcrumbs, LearningPanel, ProofChain, Section, StatusBadge, WorkflowContext } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function EvidenceArtifactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artifact = await getEvidenceArtifact(id);
  if (!artifact) notFound();

  const source = artifact.source;
  const asset = source.asset;
  const system = asset.aiSystem;
  const repository = artifact.repositoryConnection;
  const linkedControls = controlsForArtifact(artifact.artifactType, system.systemControls);
  const driftEvents = repository?.driftEvents.filter((event) => event.artifactId === artifact.artifactId) ?? [];
  const assuranceRules = artifact.assuranceRules;
  const assurancePassed = assuranceRules.filter((rule) => rule.status === "PASS");
  const assuranceGaps = assuranceRules.filter((rule) => rule.status !== "PASS");
  const assuranceScore = assuranceRules.length > 0 ? Math.round((assurancePassed.length / assuranceRules.length) * 100) : 0;
  const supportedControls = [...new Set(assurancePassed.map((rule) => rule.controlId))];
  const missingControls = [...new Set(assuranceGaps.map((rule) => rule.controlId))];
  const assuranceStatus = assuranceGaps.some((rule) => rule.status === "FAIL") ? "FAIL" : assuranceGaps.length > 0 ? "WARNING" : "PASS";
  const snapshot = artifact.snapshots[0] ?? {
    snapshotId: `SNAP-${artifact.artifactId}-LEGACY`,
    content: artifact.content,
    artifactHash: artifact.artifactHash,
    commitSha: artifact.commitSha,
    version: artifact.version,
    sourceUrl: artifact.sourceUrl,
    collectionMethod: "Legacy artifact record",
    collectedAt: artifact.lastCollected
  };
  const artifactLinks = [
    { label: "Collected content", href: `#artifact-content` },
    { label: "Evidence snapshot", href: `#evidence-snapshot` },
    { label: "Evidence chain", href: `#evidence-chain` },
    { label: "Drift comparison", href: `/evidence-artifacts/${artifact.artifactId}/drift` },
    { label: "GitHub source", href: artifact.sourceUrl }
  ];

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Evidence & Assurance", href: "/evidence-assurance" }, { label: "Artifacts", href: "/evidence-assurance/artifacts" }, { label: artifact.artifactId }]} />
          <p className="text-sm font-medium text-brand">Evidence artifact</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{artifact.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Collected GitHub artifact content with source, version, validation, linked controls, and evidence source traceability.
          </p>
          <WorkflowContext
            title="Artifact verification workflow"
            why="This page verifies the collected evidence artifact that supports one or more controls."
            next="Inspect the snapshot, review assurance checks, compare drift, then follow traceability back to the supporting control or system workspace."
            backHref="/evidence-assurance/artifacts"
            backLabel="Back to Artifacts"
          />
        </div>
        <AssuranceDisclosure
          label="Artifact assurance result"
          status={assuranceStatus}
          reason={explainArtifactResult(assuranceStatus, assuranceScore, assuranceRules.length, assuranceGaps.length)}
          evidence={[artifact.name]}
          artifacts={[`${artifact.path} · ${artifact.version}`]}
          checks={assuranceRules.map((rule) => rule.validationRule)}
          controls={[...new Set(assuranceRules.map((rule) => rule.controlId))]}
          missing={assuranceGaps.map((rule) => rule.missingElement ?? rule.validationRule)}
          failures={artifact.traceControls.flatMap((control) => control.governanceStory?.failureScenario ? [control.governanceStory.failureScenario] : [])}
          links={artifactLinks}
        />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-line bg-white p-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact label="Artifact ID" value={artifact.artifactId} />
            <Fact label="Artifact Type" value={humanize(artifact.artifactType)} />
            <Fact label="AI System" value={system.name} />
            <Fact label="Source" value={source.sourceId} />
            <Fact label="Asset" value={asset.name} />
            <Fact label="Path" value={artifact.path} />
            <Fact label="Version" value={artifact.version} />
            <Fact label="Commit SHA" value={artifact.commitSha.slice(0, 16)} />
            <Fact label="Artifact Hash" value={artifact.artifactHash.slice(0, 16)} />
            <Fact label="Last Collected" value={formatDate(artifact.lastCollected)} />
            <Fact label="Validation" value={humanize(artifact.validationStatus)} />
            <Fact label="Evidence Source Status" value={humanize(source.collectionStatus)} />
          </dl>
        </div>
        <div className="space-y-4">
          <LearningPanel title="Artifact as proof">
            Metadata tells you where evidence should exist. Artifact collection shows the actual content that supports the governance claim.
          </LearningPanel>
          <div className="rounded-md border border-line bg-white p-4">
            <div className="text-sm font-semibold text-ink">Navigation</div>
            <div className="mt-3 grid gap-2">
              <Link href="/governance-operations" className="text-sm font-semibold text-brand hover:text-blue-700">Governance Operations</Link>
              <Link href={`/evidence-artifacts/${artifact.artifactId}/drift`} className="text-sm font-semibold text-brand hover:text-blue-700">Drift Comparison</Link>
              <Link href={`/systems/${system.slug}/ai-governance`} className="text-sm font-semibold text-brand hover:text-blue-700">AI Governance View</Link>
              <Link href={`/systems/${system.slug}`} className="text-sm font-semibold text-brand hover:text-blue-700">AI System Workspace</Link>
            </div>
          </div>
        </div>
      </div>

      <Section title="Verification path">
        <ProofChain steps={[
          { stage: "control", title: linkedControls[0]?.control.code ?? supportedControls[0] ?? "Unmapped control", detail: linkedControls[0]?.control.title ?? "Control support is inferred from assurance rules.", href: supportedControls[0] ? `/controls/${supportedControls[0]}` : undefined, status: supportedControls.length ? "PRESENT" : "MISSING" },
          { stage: "requirement", title: humanize(artifact.artifactType), detail: "Artifact type required by one or more control proof paths.", status: assuranceRules.length ? "PRESENT" : "MISSING" },
          { stage: "source", title: source.sourceId, detail: source.collectionMethod, href: `/evidence-assurance/sources#source-${source.sourceId}`, status: source.collectionStatus },
          { stage: "artifact", title: artifact.artifactId, detail: artifact.name, href: `/evidence-artifacts/${artifact.artifactId}`, status: artifact.validationStatus, current: true },
          { stage: "assurance", title: `${assuranceScore}% assurance`, detail: explainArtifactResult(assuranceStatus, assuranceScore, assuranceRules.length, assuranceGaps.length), href: "#assurance-summary", status: assuranceStatus },
          { stage: "traceability", title: `${assuranceRules.length} rule(s)`, detail: "Traceability links this artifact back to controls and source provenance.", href: "#evidence-chain", status: assuranceRules.length ? "PRESENT" : "MISSING" },
          { stage: "package", title: driftEvents.length ? "Review drift" : "Package-ready check", detail: driftEvents.length ? "Resolve drift before relying on this artifact in a package." : "Artifact can support a package if assurance remains valid.", href: `/evidence-artifacts/${artifact.artifactId}/drift`, status: driftEvents.length ? "WARNING" : assuranceStatus }
        ]} />
      </Section>

      <div id="evidence-snapshot">
        <Section title="Evidence snapshot">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <article className="rounded-md border border-line bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{snapshot.snapshotId}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    This snapshot preserves the exact evidence version collected for assurance. Verification does not depend on the current GitHub file remaining unchanged.
                  </p>
                </div>
                <StatusBadge status={snapshot.artifactHash === artifact.artifactHash ? "PASS" : "WARNING"} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Fact label="Snapshot Version" value={snapshot.version} />
                <Fact label="Snapshot Commit" value={snapshot.commitSha.slice(0, 16)} />
                <Fact label="Snapshot Hash" value={snapshot.artifactHash.slice(0, 16)} />
                <Fact label="Collected At" value={formatDate(snapshot.collectedAt)} />
                <Fact label="Collection Method" value={snapshot.collectionMethod} />
                <Fact label="Snapshot Source" value={snapshot.sourceUrl} />
              </div>
            </article>
            <article className="rounded-md border border-line bg-white p-5">
              <div className="text-sm font-semibold text-ink">Independent verification</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                An auditor can hash the preserved content, compare it to the stored SHA-256 hash, inspect the commit SHA, then compare the snapshot to the current repository source.
              </p>
              <Link href={`/evidence-artifacts/${artifact.artifactId}/drift`} className="mt-4 inline-flex rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
                Review drift comparison
              </Link>
            </article>
          </div>
        </Section>
      </div>

      <Section id="assurance-summary" title="Assurance summary">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-md border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-ink">Artifact supports governance</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Assurance checks validate whether this artifact supports required controls, not only whether the file exists.
                </p>
              </div>
              <StatusBadge status={assuranceStatus} />
            </div>
            <div className="mt-4 text-4xl font-semibold text-ink">{assuranceScore}%</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Assurance score</div>
            <div className="mt-4 grid gap-2">
              <Fact label="Controls Supported" value={supportedControls.length ? supportedControls.join(", ") : "None"} />
              <Fact label="Controls Missing" value={missingControls.length ? missingControls.join(", ") : "None"} />
            </div>
            <div className="mt-4">
              <AssuranceDisclosure
                label={`Score explanation · ${assuranceScore}%`}
                status={assuranceStatus}
                reason={explainArtifactResult(assuranceStatus, assuranceScore, assuranceRules.length, assuranceGaps.length)}
                evidence={[artifact.name]}
                artifacts={[`${artifact.path} · ${artifact.version}`]}
                checks={assuranceRules.map((rule) => rule.validationRule)}
                controls={[...new Set(assuranceRules.map((rule) => rule.controlId))]}
                missing={assuranceGaps.map((rule) => rule.missingElement ?? rule.validationRule)}
                failures={artifact.traceControls.flatMap((control) => control.governanceStory?.failureScenario ? [control.governanceStory.failureScenario] : [])}
                links={artifactLinks}
              />
            </div>
          </div>
          <div className="rounded-md border border-line bg-white p-5">
            <div className="text-sm font-semibold text-ink">Validation checks</div>
            <div className="mt-4 grid gap-3">
              {assuranceRules.map((rule) => (
                <article key={rule.id} className="rounded border border-line bg-panel p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-ink">{rule.controlId} · {rule.validationRule}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{rule.resultSummary}</p>
                      {rule.missingElement ? <div className="mt-1 text-xs font-semibold text-red-700">Missing: {rule.missingElement}</div> : null}
                    </div>
                    <AssuranceDisclosure
                      label="Result"
                      status={rule.status}
                      reason={rule.explanation?.reason ?? rule.resultSummary}
                      evidence={rule.explanation ? [rule.explanation.supportingEvidence] : [artifact.name]}
                      artifacts={rule.explanation ? [rule.explanation.supportingArtifacts] : [artifact.path]}
                      checks={rule.explanation ? [rule.explanation.validationChecks] : [rule.validationRule]}
                      controls={rule.explanation ? [rule.explanation.supportingControls] : [rule.controlId]}
                      missing={rule.explanation ? [rule.explanation.missingRequirements] : rule.missingElement ? [rule.missingElement] : []}
                      failures={rule.explanation ? [rule.explanation.failureConditions] : ["Artifact removed, stale, or changed without approval."]}
                      links={[
                        { label: "Control", href: `/controls/${rule.controlId}` },
                        { label: "Artifact", href: `/evidence-artifacts/${artifact.artifactId}` },
                        { label: "Snapshot", href: `#evidence-snapshot` },
                        { label: "Drift comparison", href: `/evidence-artifacts/${artifact.artifactId}/drift` },
                        { label: "GitHub source", href: artifact.sourceUrl }
                      ]}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Governance context">
        <div className="grid gap-3">
          {artifact.traceControls.some((control) => control.governanceStory) ? artifact.traceControls.filter((control) => control.governanceStory).map((control) => (
            <article key={control.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={`/controls/${control.code}`} className="text-sm font-semibold text-ink hover:text-brand">
                    {control.code} · {control.title}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{control.governanceStory?.executiveSummary}</p>
                </div>
                <AssuranceDisclosure
                  label="Why"
                  status="PASS"
                  reason={control.governanceStory?.executiveSummary ?? "This artifact supports a linked control."}
                  evidence={[control.governanceStory?.evidenceNarrative ?? artifact.name]}
                  artifacts={[artifact.path]}
                  checks={assuranceRules.filter((rule) => rule.controlId === control.code).map((rule) => rule.validationRule)}
                  controls={[control.code]}
                  missing={[]}
                  failures={control.governanceStory?.failureScenario ? [control.governanceStory.failureScenario] : []}
                  links={[
                    { label: "Control page", href: `/controls/${control.code}` },
                    { label: "Artifact", href: `/evidence-artifacts/${artifact.artifactId}` },
                    { label: "Evidence chain", href: `#evidence-chain` },
                    { label: "Drift comparison", href: `/evidence-artifacts/${artifact.artifactId}/drift` }
                  ]}
                />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <TraceBox title="Why this artifact exists" value={control.governanceStory?.evidenceNarrative ?? "No evidence narrative"} />
                <TraceBox title="Risk mitigated" value={control.governanceStory?.riskStatement ?? "No risk statement"} />
                <TraceBox title="Failure scenario" value={control.governanceStory?.failureScenario ?? "No failure scenario"} />
              </div>
            </article>
          )) : <div className="rounded border border-line bg-panel p-3 text-sm text-slate-500">No governance story currently depends on this artifact.</div>}
        </div>
      </Section>

      <div id="evidence-chain">
        <Section title="Evidence chain">
          <div className="grid gap-3">
            {assuranceRules.length > 0 ? assuranceRules.map((rule) => (
              <article key={rule.id} className="rounded-md border border-line bg-white p-4">
                <div className="grid gap-3 lg:grid-cols-6">
                  <TraceLink title="Control" value={rule.controlId} detail="Governance control" href={`/controls/${rule.controlId}`} />
                  <TraceBox title="Validation" value={rule.validationRule} detail={rule.resultSummary} />
                  <TraceLink title="Evidence" value={artifact.name} detail={artifact.artifactId} href={`/evidence-artifacts/${artifact.artifactId}`} />
                  <TraceBox title="Source" value={source.sourceId} detail={source.collectionMethod} />
                  <TraceBox title="Collection" value={formatDate(snapshot.collectedAt)} detail={snapshot.collectionMethod} />
                  <TraceBox title="Version" value={snapshot.version} detail={snapshot.commitSha.slice(0, 16)} />
                </div>
              </article>
            )) : <div className="rounded border border-line bg-panel p-3 text-sm text-slate-500">No validation-backed evidence chain has been established for this artifact.</div>}
          </div>
        </Section>
      </div>

      <Section title="Artifact traceability">
        <div className="grid gap-3">
          {artifact.traceControls.length > 0 ? artifact.traceControls.map((control) => (
            <article key={control.id} className="rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-5">
                <TraceLink title="Artifact" value={artifact.name} detail={artifact.path} href={`/evidence-artifacts/${artifact.artifactId}`} />
                <TraceBox title="Evidence Source" value={source.sourceId} detail={humanize(source.sourceType)} />
                <TraceLink title="Control" value={`${control.code} · ${control.title}`} detail={control.ownerRole} href={`/controls/${control.code}`} />
                <TraceBox title="Requirement" value={control.regulatoryMappings.map((mapping) => mapping.obligation).join("; ") || "No mapped obligation"} detail={control.regulatoryMappings.map((mapping) => mapping.citation).join(", ")} />
                <TraceBox title="Regulation" value={control.regulatoryMappings.map((mapping) => mapping.framework).join(", ") || "Unmapped"} />
              </div>
            </article>
          )) : <div className="rounded border border-line bg-panel p-3 text-sm text-slate-500">No control traceability has been established for this artifact.</div>}
        </div>
      </Section>

      <div id="artifact-content">
        <Section title="Artifact content">
          <pre className="max-h-[38rem] overflow-auto rounded-md border border-line bg-white p-4 text-xs leading-5 text-slate-800">{snapshot.content}</pre>
        </Section>
      </div>

      <Section title="Artifact provenance">
        <div className="grid gap-4 lg:grid-cols-3">
          <Provenance title="Repository" rows={[
            `Repository: ${repository?.repositoryUrl ?? "Not linked"}`,
            `Branch: ${repository?.branch ?? "Unknown"}`,
            `Status: ${repository ? humanize(repository.status) : "Unknown"}`,
            `Last scan: ${repository?.lastScan ? formatDate(repository.lastScan) : "Not scanned"}`
          ]} />
          <Provenance title="Source location" rows={[
            `Path: ${artifact.path}`,
            `Source URL: ${artifact.sourceUrl}`,
            `Commit SHA: ${artifact.commitSha}`,
            `Version: ${artifact.version}`,
            `Hash: ${artifact.artifactHash}`
          ]} />
          <Provenance title="Validation" rows={[
            `Artifact exists: Yes`,
            `Artifact current: ${source.freshnessStatus === "CURRENT" ? "Yes" : "Review required"}`,
            `Artifact linked: Yes`,
            `Version known: ${artifact.version ? "Yes" : "No"}`
          ]} />
        </div>
      </Section>

      <div id="drift-detection">
        <Section title="Drift detection">
        <div className="grid gap-3">
          {driftEvents.length > 0 ? driftEvents.map((event) => (
            <article key={event.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{humanize(event.eventType)}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{event.summary}</p>
                  <div className="mt-1 text-xs text-slate-500">{event.path} · {formatDate(event.detectedAt)}</div>
                </div>
                <StatusBadge status={event.previousHash === "baseline-pending" ? "COLLECTED" : "WARNING"} />
              </div>
            </article>
          )) : <div className="rounded border border-line bg-panel p-3 text-sm text-slate-500">No drift events recorded.</div>}
        </div>
        <Link href={`/evidence-artifacts/${artifact.artifactId}/drift`} className="mt-4 inline-flex rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">
          Compare current source to collected snapshot
        </Link>
      </Section>
      </div>

      <Section title="Linked controls">
        <div className="grid gap-3 md:grid-cols-2">
          {linkedControls.map(({ id, control, auditStatus }) => (
            <article key={id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    {control.code} · {control.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{control.description}</p>
                </div>
                <StatusBadge status={auditStatus} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Linked evidence source">
        <div className="rounded-md border border-line bg-white p-5">
          <div className="flex items-start gap-3">
            <GitBranch className="mt-1 h-4 w-4 text-brand" />
            <div>
              <div className="text-sm font-semibold text-ink">{source.sourceId} · {humanize(source.sourceType)}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{source.governanceValue}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Fact label="Collection Method" value={source.collectionMethod} />
                <Fact label="Validation Method" value={source.validationMethod} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {source.artifacts.map((relatedArtifact) => (
                  <Link key={relatedArtifact.id} href={`/evidence-artifacts/${relatedArtifact.artifactId}`} className="inline-flex items-center gap-2 rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
                    <FileCode2 className="h-3.5 w-3.5 text-brand" />
                    {relatedArtifact.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Provenance({ title, rows }: { title: string; rows: string[] }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
        {rows.map((row) => <div key={row} className="break-words">{row}</div>)}
      </div>
    </article>
  );
}

function AssuranceDisclosure({
  label,
  status,
  reason,
  evidence,
  artifacts,
  checks,
  controls,
  missing,
  failures,
  links
}: {
  label: string;
  status: string;
  reason: string;
  evidence: string[];
  artifacts: string[];
  checks: string[];
  controls: string[];
  missing: string[];
  failures: string[];
  links?: Array<{ label: string; href: string }>;
}) {
  return (
    <details className="rounded-md border border-line bg-white p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-ink">{label}</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">{reason}</p>
          </div>
          <StatusBadge status={status} />
        </div>
      </summary>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ExplanationList title="Evidence used" items={evidence} empty="No evidence currently supports this conclusion." />
        <ExplanationList title="Supporting artifacts" items={artifacts} empty="No artifacts currently support this conclusion." />
        <ExplanationList title="Validation checks" items={checks} empty="No validation checks were run." />
        <ExplanationList title="Supporting controls" items={controls} empty="No controls are linked." />
        <ExplanationList title="Missing requirements" items={missing} empty="No missing requirements detected." tone="gap" />
        <ExplanationList title="Failure conditions" items={failures} empty="Artifact removed, stale, unlinked, or changed without approval." tone="gap" />
      </div>
      {links && links.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link key={`${link.label}-${link.href}`} href={link.href} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </details>
  );
}

function ExplanationList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone?: "gap" }) {
  const values = [...new Set(items.filter(Boolean))];
  return (
    <div className={`rounded border border-line p-3 ${tone === "gap" ? "bg-amber-50" : "bg-panel"}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">
        {values.length ? values.map((item) => <div key={item}>{item}</div>) : <div className="text-slate-500">{empty}</div>}
      </div>
    </div>
  );
}

function explainArtifactResult(status: string, score: number, totalRules: number, gapRules: number) {
  if (status === "PASS") return `This artifact supports governance because all ${totalRules} validation check(s) passed, producing a ${score}% assurance score.`;
  if (status === "WARNING") return `This artifact supports some governance claims but needs review because ${gapRules} validation check(s) produced a warning.`;
  if (status === "FAIL") return `This artifact does not sufficiently support governance because ${gapRules} high-severity validation check(s) failed.`;
  return "This artifact has not yet accumulated enough validation evidence to explain the assurance result.";
}

function TraceBox({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p> : null}
    </div>
  );
}

function TraceLink({ title, value, detail, href }: { title: string; value: string; detail?: string; href: string }) {
  return (
    <Link href={href} className="rounded border border-line bg-panel p-3 hover:bg-white">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p> : null}
    </Link>
  );
}

function controlsForArtifact(
  artifactType: string,
  controls: Array<{ id: string; auditStatus: string; control: { code: string; title: string; description: string } }>
) {
  const byType: Record<string, string[]> = {
    MANIFEST: ["AI-GOV-001", "AI-LC-001", "AI-LC-004"],
    PROMPT: ["AI-GOV-002", "AI-GOV-003", "AI-GOV-010"],
    POLICY: ["AI-GOV-006", "AI-GOV-004", "AI-AGENT-002"],
    WORKFLOW: ["AI-LC-004", "AI-GOV-010", "AUD-001"]
  };
  const codes = byType[artifactType] ?? [];
  return controls.filter(({ control }) => codes.includes(control.code)).slice(0, 6);
}
