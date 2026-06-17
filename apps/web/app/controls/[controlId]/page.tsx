import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Database, FileCode2, GitBranch, KeyRound, Network, Server, ShieldCheck } from "lucide-react";
import { getControlTraceability } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { ActionRequiredList, Breadcrumbs, LearningPanel, ProofChain, Section, StatusBadge, TaskLink, WorkflowContext } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function ControlTraceabilityPage({ params }: { params: Promise<{ controlId: string }> }) {
  const { controlId } = await params;
  const traceability = await getControlTraceability(controlId);
  if (!traceability) notFound();

  const {
    control,
    assuranceRules,
    runtimeEvidenceArtifacts,
    deploymentEvidenceArtifacts,
    supabaseEvidenceArtifacts,
    supabaseControlValidations,
    mcpEvidenceArtifacts,
    notionEvidenceArtifacts,
    secretEvidenceArtifacts,
    evidenceArtifacts,
    evidenceSources,
    assets,
    systems,
    evidenceRequired,
    deploymentEvidenceRequired,
    supabaseEvidencePresent,
    mcpEvidencePresent,
    notionEvidencePresent,
    secretEvidencePresent,
    evidencePresent,
    deploymentEvidencePresent,
    evidenceMissing,
    deploymentEvidenceMissing,
    supabaseEvidenceMissing,
    mcpEvidenceMissing,
    notionEvidenceMissing,
    secretEvidenceMissing,
    assuranceScore,
    findings,
    exceptions
  } = traceability;
  const hasRuntimeEvidence = runtimeEvidenceArtifacts.length > 0;
  const hasValidDeploymentEvidence = deploymentEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");
  const hasValidSupabaseEvidence = supabaseEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");
  const hasValidMcpEvidence = mcpEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");
  const hasValidNotionEvidence = notionEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");
  const hasValidSecretEvidence = secretEvidenceArtifacts.some((artifact) => artifact.validationStatus === "VALID");
  const requiredEvidenceLabels = [
    ...evidenceRequired.map((item) => `${humanize(item.artifactType)} · ${item.label}`),
    ...deploymentEvidenceRequired.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...traceability.supabaseEvidenceRequired.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...traceability.mcpEvidenceRequired.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...traceability.notionEvidenceRequired.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...traceability.secretEvidenceRequired.map((item) => `${humanize(item.evidenceType)} · ${item.label}`)
  ];
  const presentEvidenceLabels = [
    ...evidencePresent.map((item) => `${humanize(item.artifactType)} · ${item.label}`),
    ...deploymentEvidencePresent.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...supabaseEvidencePresent.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...mcpEvidencePresent.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...notionEvidencePresent.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...secretEvidencePresent.map((item) => `${humanize(item.evidenceType)} · ${item.label}`)
  ];
  const missingEvidenceLabels = [
    ...evidenceMissing.map((item) => `${humanize(item.artifactType)} · ${item.label}`),
    ...deploymentEvidenceMissing.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...supabaseEvidenceMissing.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...mcpEvidenceMissing.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...notionEvidenceMissing.map((item) => `${humanize(item.evidenceType)} · ${item.label}`),
    ...secretEvidenceMissing.map((item) => `${humanize(item.evidenceType)} · ${item.label}`)
  ];
  const controlStatus = assuranceRules.some((rule) => rule.status === "FAIL")
    ? "FAIL"
    : missingEvidenceLabels.length > 0 || deploymentEvidenceArtifacts.some((artifact) => artifact.validationStatus !== "VALID") || supabaseEvidenceArtifacts.some((artifact) => artifact.validationStatus !== "VALID") || supabaseControlValidations.some((validation) => validation.result !== "PASS") || mcpEvidenceArtifacts.some((artifact) => artifact.validationStatus !== "VALID") || notionEvidenceArtifacts.some((artifact) => artifact.validationStatus !== "VALID") || secretEvidenceArtifacts.some((artifact) => artifact.validationStatus !== "VALID")
      ? "WARNING"
      : assuranceRules.length > 0 || hasRuntimeEvidence || hasValidDeploymentEvidence || hasValidSupabaseEvidence || hasValidMcpEvidence || hasValidNotionEvidence || hasValidSecretEvidence
        ? "PASS"
        : "MISSING";
  const story = control.governanceStory;
  const packageStatus = controlStatus === "PASS" && missingEvidenceLabels.length === 0 ? "PASS" : "WARNING";
  const auditReadiness = packageStatus === "PASS"
    ? "Package-ready based on current evidence and assurance checks."
    : "Not package-ready until missing evidence, warnings, failed validations, or open findings are resolved.";
  const controlActionItems = controlStatus === "PASS" && findings.length === 0 ? [] : [{
    href: findings[0] ? `/findings#finding-${findings[0].findingId}` : `#control-assurance-summary`,
    title: `${control.code} proof requires review`,
    detail: explainControlResult(controlStatus, assuranceScore, presentEvidenceLabels.length, missingEvidenceLabels.length),
    status: controlStatus,
    owner: control.ownerRole,
    dueDate: "Before audit package",
    severity: controlStatus === "FAIL" ? "HIGH" : "MEDIUM",
    category: findings.length ? "Control Finding" : "Evidence Gap",
    impact: story?.failureScenario ?? "Audit and governance reviewers cannot rely on this control without current supporting proof.",
    evidenceUsed: presentEvidenceLabels.length ? presentEvidenceLabels.slice(0, 4).join("; ") : "No current mapped evidence.",
    recommendedAction: missingEvidenceLabels.length ? "Request or refresh the missing evidence, then rerun assurance review." : "Review warnings, findings, and assurance checks before marking package-ready.",
    nextStep: missingEvidenceLabels.length ? "Request Evidence" : "Review Finding",
    actionLabel: missingEvidenceLabels.length ? "Request Evidence" : "Review Finding"
  }];

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Auditor Workspace", href: "/auditor-workspace" }, { label: "Prove a Control", href: "/auditor-workspace#prove-control" }, { label: control.code }]} />
          <p className="text-sm font-medium text-brand">Control traceability</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{control.code} · {control.title}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{control.description}</p>
          <WorkflowContext
            title="Control proof workflow"
            why="This page proves whether a control is supported by required evidence, collected artifacts, assurance checks, and traceability."
            next="Review required evidence, open each supporting artifact, verify assurance and drift, then decide whether the control is package-ready or needs remediation."
            backHref="/auditor-workspace#prove-control"
            backLabel="Back to Prove a Control"
          />
        </div>
        <AssuranceDisclosure
          label="Control result"
          status={controlStatus}
          reason={explainControlResult(controlStatus, assuranceScore, presentEvidenceLabels.length, missingEvidenceLabels.length)}
          evidence={[...evidenceArtifacts.map((artifact) => artifact.name), ...runtimeEvidenceArtifacts.map((artifact) => artifact.artifactId), ...deploymentEvidenceArtifacts.map((artifact) => artifact.artifactId), ...supabaseEvidenceArtifacts.map((artifact) => artifact.artifactId), ...mcpEvidenceArtifacts.map((artifact) => artifact.artifactId), ...notionEvidenceArtifacts.map((artifact) => artifact.artifactId), ...secretEvidenceArtifacts.map((artifact) => artifact.artifactId)]}
          checks={[...assuranceRules.map((rule) => rule.validationRule), ...runtimeEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence demonstrates control operation`), ...deploymentEvidenceArtifacts.map((artifact) => `Deployment evidence ${humanize(artifact.validationStatus)} for deployed-state reality`), ...supabaseEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence ${humanize(artifact.validationStatus)} for data-governance reality`), ...mcpEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence ${humanize(artifact.validationStatus)} for actual MCP authority`), ...notionEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence ${humanize(artifact.validationStatus)} for human governance reality`), ...secretEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence ${humanize(artifact.validationStatus)} for secrets governance metadata`)]}
          controls={[control.code]}
          missing={missingEvidenceLabels}
          failures={story ? [story.failureScenario] : ["Evidence removed, stale, unlinked, or no longer sufficient to support the control."]}
          links={[
            ...evidenceArtifacts.flatMap((artifact) => [
            { label: `${artifact.name}`, href: `/evidence-artifacts/${artifact.artifactId}` },
            { label: `${artifact.name} drift`, href: `/evidence-artifacts/${artifact.artifactId}/drift` }
            ]),
            ...runtimeEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/runtime-evidence/${artifact.artifactId}` })),
            ...deploymentEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/deployment-evidence/${artifact.artifactId}` })),
            ...supabaseEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/supabase-evidence/${artifact.artifactId}` })),
            ...mcpEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/mcp-evidence/${artifact.artifactId}` })),
            ...notionEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/notion-evidence/${artifact.artifactId}` })),
            ...secretEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/secret-evidence/${artifact.artifactId}` }))
          ]}
        />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-line bg-white p-5">
          <dl className="grid gap-3 md:grid-cols-2">
            <Fact label="Owner" value={control.ownerRole} />
            <Fact label="Category" value={humanize(control.category)} />
            <Fact label="Testing Frequency" value={control.testingFrequency} />
            <Fact label="Mapped Systems" value={systems.length ? systems.map((system) => system.name).join(", ") : "No artifact-backed systems"} />
            <Fact label="Evidence Required" value={`${requiredEvidenceLabels.length}`} />
            <Fact label="Evidence Present" value={`${presentEvidenceLabels.length}`} />
            <Fact label="Evidence Missing" value={`${missingEvidenceLabels.length}`} />
            <Fact label="Runtime Evidence" value={`${runtimeEvidenceArtifacts.length}`} />
            <Fact label="Deployment Evidence" value={`${deploymentEvidenceArtifacts.length}`} />
            <Fact label="Data Evidence" value={`${supabaseEvidenceArtifacts.length}`} />
            <Fact label="Data Validations" value={`${supabaseControlValidations.length}`} />
            <Fact label="MCP Evidence" value={`${mcpEvidenceArtifacts.length}`} />
            <Fact label="Governance Evidence" value={`${notionEvidenceArtifacts.length}`} />
            <Fact label="Secrets Evidence" value={`${secretEvidenceArtifacts.length}`} />
            <Fact label="Assurance Score" value={`${assuranceScore}%`} />
            <Fact label="Current Proof Status" value={humanize(controlStatus)} />
            <Fact label="Audit Readiness" value={packageStatus === "PASS" ? "Package-ready" : "Needs review"} />
          </dl>
        </div>
        <LearningPanel title="Auditor workflow">
          Start from a control, inspect required evidence, open the supporting artifact, then follow the source, asset, system, and repository provenance without losing context.
        </LearningPanel>
      </div>

      <Section title="Action required">
        <ActionRequiredList items={controlActionItems} emptyMessage="This control is currently package-ready and has no open action item." />
      </Section>

      <Section title="Proof path">
        <ProofChain steps={[
          { stage: "control", title: control.code, detail: control.title, href: `/controls/${control.code}`, status: controlStatus, current: true },
          { stage: "requirement", title: `${requiredEvidenceLabels.length} required`, detail: missingEvidenceLabels.length ? `${missingEvidenceLabels.length} missing evidence requirement(s).` : "All mapped evidence requirements have support.", href: "#control-assurance-summary", status: missingEvidenceLabels.length ? "WARNING" : "PASS" },
          { stage: "source", title: `${evidenceSources.length} source(s)`, detail: evidenceSources.map((source) => source.sourceId).slice(0, 3).join(", ") || "No evidence source mapped.", href: "#evidence-sources-and-assets", status: evidenceSources.length ? "PRESENT" : "MISSING" },
          { stage: "artifact", title: `${evidenceArtifacts.length + runtimeEvidenceArtifacts.length + deploymentEvidenceArtifacts.length + supabaseEvidenceArtifacts.length + mcpEvidenceArtifacts.length + notionEvidenceArtifacts.length + secretEvidenceArtifacts.length} artifact(s)`, detail: presentEvidenceLabels.slice(0, 3).join("; ") || "No collected artifact currently supports this control.", href: "#evidence-artifacts", status: presentEvidenceLabels.length ? "PRESENT" : "MISSING" },
          { stage: "assurance", title: `${assuranceScore}% assurance`, detail: explainControlResult(controlStatus, assuranceScore, presentEvidenceLabels.length, missingEvidenceLabels.length), href: "#assurance-explanation", status: controlStatus },
          { stage: "traceability", title: `${systems.length} system(s)`, detail: systems.map((system) => system.name).join(", ") || "No artifact-backed system traceability.", href: "#evidence-chain", status: presentEvidenceLabels.length ? "PRESENT" : "MISSING" },
          { stage: "package", title: packageStatus === "PASS" ? "Package-ready" : "Needs review", detail: auditReadiness, href: "/audit-packages", status: packageStatus }
        ]} />
      </Section>

      <Section title="Governance story">
        {story ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
            <article className="rounded-md border border-line bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-brand" />
                Why this control matters
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{story.executiveSummary}</p>
            </article>
            <div className="grid gap-3 md:grid-cols-2">
              <StoryCard title="Risk" text={story.riskStatement} />
              <StoryCard title="Control Objective" text={story.controlObjective} />
              <StoryCard title="Evidence" text={story.evidenceNarrative} />
              <StoryCard title="Validation" text={story.validationNarrative} />
              <StoryCard title="Monitoring" text={story.monitoringNarrative} />
              <StoryCard title="Failure Scenario" text={story.failureScenario} tone="risk" />
              <StoryCard title="Owner" text={story.ownerNarrative} />
            </div>
          </div>
        ) : <EmptyState text="No governance story has been defined for this control yet." />}
      </Section>

      <Section id="control-assurance-summary" title="Control assurance summary">
        <div className="grid gap-4 lg:grid-cols-3">
          <SummaryPanel title="Evidence required" items={requiredEvidenceLabels} empty="No required artifact type mapped yet." />
          <SummaryPanel title="Evidence present" items={presentEvidenceLabels} empty="No evidence artifacts currently support this control." />
          <SummaryPanel title="Evidence missing" items={missingEvidenceLabels} empty="No mapped evidence gaps." tone="gap" />
        </div>
      </Section>

      <Section id="assurance-explanation" title="Assurance explanation">
        <AssuranceDisclosure
          label={`Assurance score · ${assuranceScore}%`}
          status={controlStatus}
          reason={explainControlResult(controlStatus, assuranceScore, presentEvidenceLabels.length, missingEvidenceLabels.length)}
          evidence={[...evidenceArtifacts.map((artifact) => `${artifact.name} · ${artifact.path}`), ...runtimeEvidenceArtifacts.map((artifact) => `${artifact.artifactId} · ${artifact.logSource.name}`), ...deploymentEvidenceArtifacts.map((artifact) => `${artifact.artifactId} · ${artifact.containerName}`), ...supabaseEvidenceArtifacts.map((artifact) => `${artifact.artifactId} · ${artifact.title}`), ...mcpEvidenceArtifacts.map((artifact) => `${artifact.artifactId} · ${artifact.title}`), ...notionEvidenceArtifacts.map((artifact) => `${artifact.artifactId} · ${artifact.title}`), ...secretEvidenceArtifacts.map((artifact) => `${artifact.artifactId} · ${artifact.title}`)]}
          checks={[...assuranceRules.map((rule) => rule.validationRule), ...runtimeEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence demonstrates control operation`), ...deploymentEvidenceArtifacts.map((artifact) => `Deployment evidence ${humanize(artifact.validationStatus)} for deployed-state reality`), ...supabaseEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence ${humanize(artifact.validationStatus)} for data-governance reality`), ...mcpEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence ${humanize(artifact.validationStatus)} for actual MCP authority`), ...notionEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence ${humanize(artifact.validationStatus)} for human governance reality`), ...secretEvidenceArtifacts.map((artifact) => `${humanize(artifact.evidenceType)} evidence ${humanize(artifact.validationStatus)} for secrets governance metadata`)]}
          controls={[control.code]}
          missing={missingEvidenceLabels}
          failures={story ? [story.failureScenario] : ["Evidence removed, stale, unlinked, or no longer sufficient to support the control."]}
          links={[
            ...evidenceArtifacts.flatMap((artifact) => [
              { label: `${artifact.name}`, href: `/evidence-artifacts/${artifact.artifactId}` },
              { label: `${artifact.name} drift`, href: `/evidence-artifacts/${artifact.artifactId}/drift` }
            ]),
            ...runtimeEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/runtime-evidence/${artifact.artifactId}` })),
            ...deploymentEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/deployment-evidence/${artifact.artifactId}` })),
            ...supabaseEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/supabase-evidence/${artifact.artifactId}` })),
            ...mcpEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/mcp-evidence/${artifact.artifactId}` })),
            ...notionEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/notion-evidence/${artifact.artifactId}` })),
            ...secretEvidenceArtifacts.map((artifact) => ({ label: artifact.artifactId, href: `/secret-evidence/${artifact.artifactId}` }))
          ]}
        />
      </Section>

      <Section id="evidence-artifacts" title="Evidence artifacts">
        <div className="grid gap-3 md:grid-cols-2">
          {evidenceArtifacts.length > 0 ? evidenceArtifacts.map((artifact) => {
            const rules = assuranceRules.filter((rule) => rule.evidenceArtifactId === artifact.id);
            const score = rules.length > 0 ? Math.round((rules.filter((rule) => rule.status === "PASS").length / rules.length) * 100) : 0;
            const status = rules.some((rule) => rule.status === "FAIL") ? "FAIL" : rules.some((rule) => rule.status === "WARNING") ? "WARNING" : "PASS";
            return (
              <Link key={artifact.id} href={`/evidence-artifacts/${artifact.artifactId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <FileCode2 className="h-4 w-4 text-brand" />
                      {artifact.name}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{artifact.path} · {artifact.source.sourceId}</p>
                    <p className="mt-1 break-all text-xs text-slate-500">{artifact.sourceUrl}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600">
                  <FactLine label="Assurance" value={`${score}%`} />
                  <FactLine label="Validation" value={humanize(artifact.validationStatus)} />
                  <FactLine label="Collected" value={formatDate(artifact.lastCollected)} />
                </div>
              </Link>
            );
          }) : <EmptyState text="No evidence artifacts currently support this control." />}
        </div>
      </Section>

      <Section title="Runtime evidence">
        <div className="grid gap-3 md:grid-cols-2">
          {runtimeEvidenceArtifacts.length > 0 ? runtimeEvidenceArtifacts.map((artifact) => (
            <Link key={artifact.id} href={`/runtime-evidence/${artifact.artifactId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{artifact.artifactId} · {humanize(artifact.eventType)}</div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.logSource.aiSystem.name} · {artifact.logSource.logSourceId} · {formatDate(artifact.eventTimestamp)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <FactLine label="Correlation ID" value={artifact.correlationId} />
                <FactLine label="Collection" value={formatDate(artifact.collectionDate)} />
                <FactLine label="Retention" value={artifact.retentionValid ? "Valid" : "Needs review"} />
                <FactLine label="Hash" value={artifact.hash.slice(0, 12)} />
              </div>
            </Link>
          )) : <EmptyState text="No runtime evidence currently supports this control." />}
        </div>
      </Section>

      <Section title="Deployment evidence">
        <div className="grid gap-3 md:grid-cols-2">
          {deploymentEvidenceArtifacts.length > 0 ? deploymentEvidenceArtifacts.map((artifact) => (
            <Link key={artifact.id} href={`/deployment-evidence/${artifact.artifactId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Server className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.containerName}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.portainerConnection.aiSystem.name} · {artifact.portainerConnection.connectionId} · {artifact.imageName}:{artifact.imageTag}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <FactLine label="Collection" value={formatDate(artifact.collectionTimestamp)} />
                <FactLine label="Health" value={artifact.healthStatus} />
                <FactLine label="Drift Events" value={`${artifact.driftEvents.length}`} />
                <FactLine label="Hash" value={artifact.hash.slice(0, 12)} />
              </div>
            </Link>
          )) : <EmptyState text="No deployment evidence currently supports this control." />}
        </div>
      </Section>

      <Section title="Data governance evidence">
        <div className="grid gap-3 md:grid-cols-2">
          {supabaseEvidenceArtifacts.length > 0 ? supabaseEvidenceArtifacts.map((artifact) => (
            <Link key={artifact.id} href={`/supabase-evidence/${artifact.artifactId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Database className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.supabaseConnection.aiSystem.name} · {artifact.supabaseConnection.connectionId} · {humanize(artifact.evidenceType)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <FactLine label="Collection" value={formatDate(artifact.collectionTimestamp)} />
                <FactLine label="Source" value={artifact.source} />
                <FactLine label="Hash" value={artifact.hash.slice(0, 12)} />
              </div>
            </Link>
          )) : <EmptyState text="No data-governance evidence currently supports this control." />}
        </div>
      </Section>

      <Section title="Data governance control validation">
        <div className="grid gap-3 md:grid-cols-2">
          {supabaseControlValidations.length > 0 ? supabaseControlValidations.map((validation) => (
            <article key={validation.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    {validation.controlId} · Supabase validation
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{validation.controlImpact}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{validation.recommendedAction}</p>
                  <p className="mt-1 text-xs text-slate-500">{validation.changeDetected}</p>
                </div>
                <StatusBadge status={validation.result} />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <FactLine label="Evidence Used" value={summarizeJsonList(validation.evidenceUsed)} />
                <FactLine label="Validation Checks" value={summarizeJsonList(validation.validationChecks)} />
                <FactLine label="Failure Conditions" value={validation.failureConditions} />
              </div>
            </article>
          )) : <EmptyState text="No Supabase control validation currently supports this control." />}
        </div>
      </Section>

      <Section title="MCP governance evidence">
        <div className="grid gap-3 md:grid-cols-2">
          {mcpEvidenceArtifacts.length > 0 ? mcpEvidenceArtifacts.map((artifact) => (
            <Link key={artifact.id} href={`/mcp-evidence/${artifact.artifactId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Network className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.mcpConnection.aiSystem.name} · {artifact.mcpConnection.serverName} · {humanize(artifact.evidenceType)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <FactLine label="Collection" value={formatDate(artifact.collectionTimestamp)} />
                <FactLine label="Source" value={artifact.source} />
                <FactLine label="Hash" value={artifact.hash.slice(0, 12)} />
              </div>
            </Link>
          )) : <EmptyState text="No MCP governance evidence currently supports this control." />}
        </div>
      </Section>

      <Section title="Human governance evidence">
        <div className="grid gap-3 md:grid-cols-2">
          {notionEvidenceArtifacts.length > 0 ? notionEvidenceArtifacts.map((artifact) => (
            <Link key={artifact.id} href={`/notion-evidence/${artifact.artifactId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <BookOpen className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.notionConnection.aiSystem.name} · {artifact.notionConnection.workspaceName} · {humanize(artifact.evidenceType)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <FactLine label="Collection" value={formatDate(artifact.collectionTimestamp)} />
                <FactLine label="Source" value={artifact.source} />
                <FactLine label="Hash" value={artifact.hash.slice(0, 12)} />
              </div>
            </Link>
          )) : <EmptyState text="No human-governance evidence currently supports this control." />}
        </div>
      </Section>

      <Section title="Secrets governance evidence">
        <div className="grid gap-3 md:grid-cols-2">
          {secretEvidenceArtifacts.length > 0 ? secretEvidenceArtifacts.map((artifact) => (
            <Link key={artifact.id} href={`/secret-evidence/${artifact.artifactId}`} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <KeyRound className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.secretsConnection.aiSystem.name} · {humanize(artifact.secretsConnection.sourceSystem)} · {humanize(artifact.evidenceType)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <FactLine label="Collection" value={formatDate(artifact.collectionTimestamp)} />
                <FactLine label="Source" value={humanize(artifact.source)} />
                <FactLine label="Hash" value={artifact.hash.slice(0, 12)} />
              </div>
            </Link>
          )) : <EmptyState text="No secrets governance evidence currently supports this control." />}
        </div>
      </Section>

      <Section title="Validation and assurance results">
        <div className="grid gap-3">
          {assuranceRules.length > 0 ? assuranceRules.map((rule) => (
            <article key={rule.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{rule.validationRule}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{rule.resultSummary}</p>
                  <div className="mt-1 text-xs text-slate-500">
                    {humanize(rule.artifactType)} · {rule.evidenceArtifact.path}
                    {rule.missingElement ? ` · Missing: ${rule.missingElement}` : ""}
                  </div>
                </div>
                <AssuranceDisclosure
                  label="Result"
                  status={rule.status}
                  reason={rule.explanation?.reason ?? rule.resultSummary}
                  evidence={rule.explanation ? [rule.explanation.supportingEvidence] : [rule.evidenceArtifact.name]}
                  artifacts={rule.explanation ? [rule.explanation.supportingArtifacts] : [rule.evidenceArtifact.path]}
                  checks={rule.explanation ? [rule.explanation.validationChecks] : [rule.validationRule]}
                  controls={rule.explanation ? [rule.explanation.supportingControls] : [rule.controlId]}
                  missing={rule.explanation ? [rule.explanation.missingRequirements] : rule.missingElement ? [rule.missingElement] : []}
                  failures={rule.explanation ? [rule.explanation.failureConditions] : ["Artifact removed, stale, or changed without approval."]}
                  links={[
                    { label: "Evidence artifact", href: `/evidence-artifacts/${rule.evidenceArtifact.artifactId}` },
                    { label: "Snapshot and chain", href: `/evidence-artifacts/${rule.evidenceArtifact.artifactId}#evidence-snapshot` },
                    { label: "Drift comparison", href: `/evidence-artifacts/${rule.evidenceArtifact.artifactId}/drift` },
                    { label: "GitHub source", href: rule.evidenceArtifact.sourceUrl }
                  ]}
                />
              </div>
            </article>
          )) : <EmptyState text="No assurance rules currently map to this control." />}
        </div>
      </Section>

      <Section title="Traceability chain">
        <div className="space-y-3">
          {evidenceArtifacts.length > 0 ? evidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-6">
                <ChainLink title="AI System" value={artifact.source.asset.aiSystem.name} href={`/systems/${artifact.source.asset.aiSystem.slug}`} />
                <ChainBox title="Asset" value={artifact.source.asset.name} detail={humanize(artifact.source.asset.assetType)} />
                <ChainBox title="Evidence Source" value={artifact.source.sourceId} detail={humanize(artifact.source.sourceType)} />
                <ChainLink title="Evidence Artifact" value={artifact.name} detail={artifact.path} href={`/evidence-artifacts/${artifact.artifactId}`} />
                <ChainBox title="Control" value={control.code} detail={control.title} />
                <ChainBox title="Regulatory Context" value={control.regulatoryMappings.map((mapping) => mapping.framework).join(", ") || "Unmapped"} detail={control.regulatoryMappings.map((mapping) => mapping.citation).join(", ")} />
              </div>
            </article>
          )) : deploymentEvidenceArtifacts.length === 0 && supabaseEvidenceArtifacts.length === 0 && mcpEvidenceArtifacts.length === 0 && notionEvidenceArtifacts.length === 0 && secretEvidenceArtifacts.length === 0 ? <EmptyState text="Traceability chain is incomplete until evidence artifacts support this control." /> : null}
          {deploymentEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-6">
                <ChainLink title="AI System" value={artifact.portainerConnection.aiSystem.name} href={`/systems/${artifact.portainerConnection.aiSystem.slug}`} />
                <ChainBox title="Asset" value={artifact.evidenceSource?.asset.name ?? "Portainer asset"} detail={artifact.evidenceSource?.asset.assetType ? humanize(artifact.evidenceSource.asset.assetType) : "Portainer"} />
                <ChainBox title="Evidence Source" value={artifact.evidenceSource?.sourceId ?? "Portainer source"} detail={artifact.evidenceSource?.sourceType ? humanize(artifact.evidenceSource.sourceType) : "Deployment evidence"} />
                <ChainLink title="Deployment Evidence" value={artifact.artifactId} detail={artifact.containerName} href={`/deployment-evidence/${artifact.artifactId}`} />
                <ChainBox title="Control" value={control.code} detail={control.title} />
                <ChainBox title="Status" value={humanize(artifact.validationStatus)} detail={artifact.assuranceSummary} />
              </div>
            </article>
          ))}
          {supabaseEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-6">
                <ChainLink title="AI System" value={artifact.supabaseConnection.aiSystem.name} href={`/systems/${artifact.supabaseConnection.aiSystem.slug}`} />
                <ChainBox title="Asset" value={artifact.evidenceSource?.asset.name ?? "Supabase asset"} detail={artifact.evidenceSource?.asset.assetType ? humanize(artifact.evidenceSource.asset.assetType) : "Supabase"} />
                <ChainBox title="Evidence Source" value={artifact.evidenceSource?.sourceId ?? "Supabase source"} detail={artifact.evidenceSource?.sourceType ? humanize(artifact.evidenceSource.sourceType) : "Data governance evidence"} />
                <ChainLink title="Supabase Evidence" value={artifact.artifactId} detail={humanize(artifact.evidenceType)} href={`/supabase-evidence/${artifact.artifactId}`} />
                <ChainBox title="Control" value={control.code} detail={control.title} />
                <ChainBox title="Status" value={humanize(artifact.validationStatus)} detail={artifact.assuranceSummary} />
              </div>
            </article>
          ))}
          {mcpEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-6">
                <ChainLink title="AI System" value={artifact.mcpConnection.aiSystem.name} href={`/systems/${artifact.mcpConnection.aiSystem.slug}`} />
                <ChainBox title="Asset" value={artifact.evidenceSource?.asset.name ?? "MCP asset"} detail={artifact.evidenceSource?.asset.assetType ? humanize(artifact.evidenceSource.asset.assetType) : "MCP"} />
                <ChainBox title="Evidence Source" value={artifact.evidenceSource?.sourceId ?? "MCP source"} detail={artifact.evidenceSource?.sourceType ? humanize(artifact.evidenceSource.sourceType) : "MCP evidence"} />
                <ChainLink title="MCP Evidence" value={artifact.artifactId} detail={humanize(artifact.evidenceType)} href={`/mcp-evidence/${artifact.artifactId}`} />
                <ChainBox title="Control" value={control.code} detail={control.title} />
                <ChainBox title="Status" value={humanize(artifact.validationStatus)} detail={artifact.assuranceSummary} />
              </div>
            </article>
          ))}
          {notionEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-6">
                <ChainLink title="AI System" value={artifact.notionConnection.aiSystem.name} href={`/systems/${artifact.notionConnection.aiSystem.slug}`} />
                <ChainBox title="Asset" value={artifact.evidenceSource?.asset.name ?? "Notion governance asset"} detail={artifact.evidenceSource?.asset.assetType ? humanize(artifact.evidenceSource.asset.assetType) : "Notion"} />
                <ChainBox title="Evidence Source" value={artifact.evidenceSource?.sourceId ?? "Notion source"} detail={artifact.evidenceSource?.sourceType ? humanize(artifact.evidenceSource.sourceType) : "Human governance evidence"} />
                <ChainLink title="Notion Evidence" value={artifact.artifactId} detail={humanize(artifact.evidenceType)} href={`/notion-evidence/${artifact.artifactId}`} />
                <ChainBox title="Control" value={control.code} detail={control.title} />
                <ChainBox title="Status" value={humanize(artifact.validationStatus)} detail={artifact.assuranceSummary} />
              </div>
            </article>
          ))}
          {secretEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-6">
                <ChainLink title="AI System" value={artifact.secretsConnection.aiSystem.name} href={`/systems/${artifact.secretsConnection.aiSystem.slug}`} />
                <ChainBox title="Asset" value={artifact.evidenceSource?.asset.name ?? "Secrets asset"} detail={artifact.evidenceSource?.asset.assetType ? humanize(artifact.evidenceSource.asset.assetType) : "Secrets"} />
                <ChainBox title="Evidence Source" value={artifact.evidenceSource?.sourceId ?? "Secrets source"} detail={artifact.evidenceSource?.sourceType ? humanize(artifact.evidenceSource.sourceType) : "Secrets metadata evidence"} />
                <ChainLink title="Secret Evidence" value={artifact.artifactId} detail={humanize(artifact.evidenceType)} href={`/secret-evidence/${artifact.artifactId}`} />
                <ChainBox title="Control" value={control.code} detail={control.title} />
                <ChainBox title="Status" value={humanize(artifact.validationStatus)} detail={artifact.assuranceSummary} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Regulatory mappings">
        <div className="grid gap-3 md:grid-cols-2">
          {control.regulatoryMappings.length > 0 ? control.regulatoryMappings.map((mapping) => (
            <article key={mapping.id} className="rounded-md border border-line bg-white p-4">
              <div className="text-sm font-semibold text-ink">{mapping.framework} · {mapping.citation}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{mapping.obligation}</p>
            </article>
          )) : <EmptyState text="No regulatory mappings currently declared for this control." />}
        </div>
      </Section>

      <Section id="evidence-sources-and-assets" title="Evidence sources and assets">
        <div className="grid gap-3 md:grid-cols-2">
          {evidenceSources.map((source) => (
            <article key={source.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start gap-3">
                <GitBranch className="mt-1 h-4 w-4 text-brand" />
                <div>
                  <div className="text-sm font-semibold text-ink">{source.sourceId} · {humanize(source.sourceType)}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{source.governanceValue}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={source.collectionStatus} />
                    <StatusBadge status={source.freshnessStatus} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <TaskLink href={`/evidence-assurance/sources#source-${source.sourceId}`}>Review Evidence Source</TaskLink>
                    {evidenceArtifacts.filter((artifact) => artifact.sourceId === source.id).slice(0, 3).map((artifact) => (
                      <TaskLink key={artifact.id} href={`/evidence-artifacts/${artifact.artifactId}`}>Verify Artifact {artifact.artifactId}</TaskLink>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
          {assets.length === 0 ? <EmptyState text="No source assets currently support this control." /> : null}
        </div>
      </Section>

      <Section title="Findings and exceptions">
        <div className="grid gap-3 md:grid-cols-2">
          <SummaryPanel title="Findings" items={findings.map((finding) => `${finding.findingId} · ${finding.title}`)} empty="No findings mapped to this control." />
          <SummaryPanel title="Exceptions" items={exceptions.map((exception) => `${exception.exceptionId} · expires ${formatDate(exception.expirationDate)}`)} empty="No exceptions mapped to this control." />
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

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function SummaryPanel({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone?: "gap" }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-3 grid gap-2">
        {items.length > 0 ? items.map((item) => (
          <div key={item} className={`rounded border border-line bg-panel px-3 py-2 text-sm ${tone === "gap" ? "text-red-700" : "text-slate-700"}`}>{item}</div>
        )) : <div className="rounded border border-line bg-panel px-3 py-2 text-sm text-slate-500">{empty}</div>}
      </div>
    </article>
  );
}

function StoryCard({ title, text, tone }: { title: string; text: string; tone?: "risk" }) {
  return (
    <article className={`rounded-md border p-4 ${tone === "risk" ? "border-amber-200 bg-amber-50" : "border-line bg-white"}`}>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
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
  artifacts?: string[];
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
        <ExplanationList title="Supporting artifacts" items={artifacts ?? evidence} empty="No artifacts currently support this conclusion." />
        <ExplanationList title="Validation checks" items={checks} empty="No validation checks were run." />
        <ExplanationList title="Supporting controls" items={controls} empty="No controls are linked." />
        <ExplanationList title="Missing requirements" items={missing} empty="No missing requirements detected." tone="gap" />
        <ExplanationList title="Failure conditions" items={failures} empty="No failure conditions defined." tone="gap" />
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
  const values = items.filter(Boolean);
  return (
    <div className={`rounded border border-line p-3 ${tone === "gap" ? "bg-amber-50" : "bg-panel"}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">
        {values.length ? values.map((item) => <div key={item}>{item}</div>) : <div className="text-slate-500">{empty}</div>}
      </div>
    </div>
  );
}

function explainControlResult(status: string, score: number, present: number, missing: number) {
  if (status === "PASS") return `This control is passing because ${present} required evidence type(s) are present and mapped assurance checks produce a ${score}% score.`;
  if (status === "WARNING") return `This control needs review because ${missing} required evidence type(s) are missing or one or more assurance checks need attention.`;
  if (status === "FAIL") return "This control is failing because a high-severity assurance check did not find required governance evidence.";
  return "This control has not yet accumulated enough artifact-backed assurance to produce a governed conclusion.";
}

function summarizeJsonList(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item) => typeof item === "string").slice(0, 4).join(" · ") || "Not recorded";
  } catch {
    // Fall through to the raw value below.
  }
  return value;
}

function ChainBox({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value || "Not mapped"}</div>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p> : null}
    </div>
  );
}

function ChainLink({ title, value, detail, href }: { title: string; value: string; detail?: string; href: string }) {
  return (
    <Link href={href} className="rounded border border-line bg-panel p-3 hover:bg-white">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p> : null}
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded border border-line bg-panel p-3 text-sm text-slate-500">{text}</div>;
}
