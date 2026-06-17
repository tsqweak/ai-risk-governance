import Link from "next/link";
import { Activity, Archive, BookOpen, ClipboardCheck, Database, FileSearch, GitPullRequestArrow, KeyRound, Network, Radar, Server, ShieldCheck } from "lucide-react";
import { getAuditPackages, getEvidenceRepository, getGovernanceOperationsDashboard } from "../data";
import { formatDate } from "../components/format";
import { ActionRequiredList, ProofChain, Section, StatusBadge } from "../components/ui";
import { ArtifactWorkflowLinks, DeploymentEvidenceLinks, FactTile, McpEvidenceLinks, NotionEvidenceLinks, RuntimeEvidenceLinks, SecretEvidenceLinks, SupabaseEvidenceLinks, WorkflowCard, artifactAssuranceScore, artifactAssuranceStatus } from "./components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssurancePage() {
  const [repository, operations, packages] = await Promise.all([
    getEvidenceRepository(),
    getGovernanceOperationsDashboard(),
    getAuditPackages()
  ]);
  const snapshotCount = operations.artifacts.reduce((total, artifact) => total + artifact.snapshots.length, 0);
  const warningRules = operations.assuranceRules.filter((rule) => rule.status !== "PASS");
  const travelBrainArtifacts = operations.artifacts.filter((artifact) => artifact.aiSystem.slug === "travel-brain");
  const actionItems = [
    ...warningRules.slice(0, 4).map((rule) => ({
      href: "/evidence-assurance/assurance",
      title: `${rule.controlId} · ${rule.validationRule}`,
      detail: rule.explanation?.reason ?? rule.resultSummary,
      status: rule.status,
      owner: rule.artifact.source.asset.aiSystem.riskOwner || rule.artifact.source.asset.aiSystem.businessOwner,
      dueDate: "Before package readiness",
      severity: rule.severity,
      category: "Failed Validation",
      impact: rule.explanation?.failureConditions ?? rule.resultSummary,
      evidenceUsed: `${rule.artifact.artifactId} · ${rule.artifact.name}`,
      recommendedAction: rule.missingElement ? `Resolve missing element: ${rule.missingElement}.` : "Review assurance warning and remediate the missing evidence or failed validation.",
      nextStep: "Review Assurance",
      actionLabel: "Review Evidence"
    })),
    ...operations.evidenceSources.filter((source) => source.collectionStatus !== "COLLECTED" || source.connectorHealth !== "ON_TRACK").slice(0, 4).map((source) => ({
      href: "/evidence-assurance/sources",
      title: `${source.sourceId} · ${source.sourceType}`,
      detail: source.governanceValue,
      status: source.collectionStatus,
      owner: source.asset.aiSystem.riskOwner || source.asset.aiSystem.businessOwner,
      dueDate: "Next collection cycle",
      severity: source.connectorHealth === "BLOCKED" || source.collectionStatus === "MISSING" ? "HIGH" : "MEDIUM",
      category: "Source Issue",
      impact: source.governanceValue,
      evidenceUsed: `${source.sourceType} metadata · ${source.connectorHealth}`,
      recommendedAction: "Review source health, resolve connector/source limitation, or document an accepted evidence gap.",
      nextStep: "Review Source",
      actionLabel: "Review Evidence"
    })),
    ...operations.assetDiscoveryFindings.filter((finding) => finding.status === "OPEN" || finding.status === "REVIEW_REQUIRED").slice(0, 4).map((finding) => ({
      href: "/evidence-assurance/asset-discovery",
      title: `${finding.findingId} · ${finding.assetName}`,
      detail: finding.reason,
      status: finding.status,
      owner: finding.aiSystem.riskOwner || finding.aiSystem.businessOwner,
      dueDate: "Inventory review",
      severity: finding.severity,
      category: "Discovery Finding",
      impact: finding.validationExplanation,
      evidenceUsed: `${finding.discoverySource?.sourceType ?? "Discovery source"} · ${finding.evidence}`,
      recommendedAction: finding.recommendedAction,
      nextStep: "Review Discovery Finding",
      actionLabel: "Review Finding"
    })),
    ...repository.objects.filter((object) => object.status === "SUBMITTED" || object.status === "EXPIRED").slice(0, 4).map((object) => ({
      href: `/evidence/${object.evidenceId}`,
      title: `${object.evidenceId} · ${object.title}`,
      detail: `${object.aiSystem.name} · reviewer ${object.reviewer}`,
      status: object.status,
      owner: object.owner,
      dueDate: formatDate(object.expirationDate),
      severity: object.status === "EXPIRED" ? "HIGH" : "MEDIUM",
      category: "Review Task",
      impact: `Evidence is ${object.status}; package readiness depends on reviewer verification.`,
      evidenceUsed: `${object.evidenceType} · ${object.source}`,
      recommendedAction: "Verify ownership, reviewer, source, traceability, and package readiness.",
      nextStep: "Verify Artifact",
      actionLabel: "Review Evidence"
    }))
  ].slice(0, 8);

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4 xl:grid-cols-12">
        <FactTile label="Evidence Objects" value={repository.objects.length} />
        <FactTile label="Artifacts" value={operations.artifacts.length} />
        <FactTile label="Runtime Evidence" value={operations.runtimeEvidenceArtifacts.length} />
        <FactTile label="Deployments" value={operations.deploymentEvidenceArtifacts.length} status={operations.kpis.validDeploymentEvidence ? "PASS" : "WARNING"} />
        <FactTile label="Data Evidence" value={operations.supabaseEvidenceArtifacts.length} status={operations.kpis.validSupabaseEvidence ? "PASS" : "WARNING"} />
        <FactTile label="MCP Evidence" value={operations.mcpEvidenceArtifacts.length} status={operations.kpis.validMcpEvidence ? "PASS" : "WARNING"} />
        <FactTile label="Governance Evidence" value={operations.notionEvidenceArtifacts.length} status={operations.kpis.validNotionEvidence ? "PASS" : "WARNING"} />
        <FactTile label="Secrets Evidence" value={operations.secretEvidenceArtifacts.length} status={operations.kpis.validSecretEvidence ? "PASS" : "WARNING"} />
        <FactTile label="Discovery Findings" value={operations.assetDiscoveryFindings.length} status={operations.kpis.openDiscoveryFindings ? "WARNING" : "PASS"} />
        <FactTile label="Snapshots" value={snapshotCount} status={snapshotCount === operations.artifacts.length ? "PASS" : "WARNING"} />
        <FactTile label="Warnings" value={warningRules.length} status={warningRules.length ? "WARNING" : "PASS"} />
        <FactTile label="Drift Events" value={operations.driftEvents.length + operations.deploymentDriftEvents.length} />
        <FactTile label="Sources" value={operations.evidenceSources.length} />
        <FactTile label="Packages" value={packages.length} />
      </div>

      <Section title="Action Required">
        <ActionRequiredList items={actionItems} />
      </Section>

      <Section title="Proof workflow">
        <div className="mb-4">
          <ProofChain steps={[
            { stage: "control", title: "Control", detail: "Start from a control or assurance warning.", href: "/controls/AI-GOV-003" },
            { stage: "requirement", title: "Evidence Requirement", detail: "Confirm the expected proof for the control.", href: "/evidence-assurance/repository" },
            { stage: "source", title: "Evidence Source", detail: "Review connector/source health and source gaps.", href: "/evidence-assurance/sources" },
            { stage: "artifact", title: "Evidence Artifact", detail: "Inspect collected content, metadata, snapshot, hash, and provenance.", href: "/evidence-assurance/artifacts" },
            { stage: "assurance", title: "Assurance", detail: "Review validations, warnings, failure conditions, and recommended action.", href: "/evidence-assurance/assurance", current: true },
            { stage: "traceability", title: "Traceability", detail: "Move in either direction between controls and evidence.", href: "/evidence-assurance/traceability" },
            { stage: "package", title: "Package", detail: "Confirm proof is ready for audit or board reporting.", href: "/evidence-assurance/packages" }
          ]} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-10">
          <WorkflowCard href="/evidence-assurance/repository" kicker="Evidence" title="Find governed proof" detail="Start from evidence objects, ownership, status, regulation, control, or AI system context." />
          <WorkflowCard href="/evidence-assurance/artifacts" kicker="Artifact" title="Inspect collected files" detail="Open collected manifests, prompts, policies, and workflows with source provenance." />
          <WorkflowCard href="/evidence-assurance/runtime" kicker="Runtime" title="Prove operational reality" detail="Inspect execution, monitoring, control-result, and audit-event metadata without collecting sensitive payloads." />
          <WorkflowCard href="/evidence-assurance/deployments" kicker="Deployments" title="Prove deployed state" detail="Review Portainer connection status, deployment evidence, runtime configuration boundaries, drift, and assurance gaps." />
          <WorkflowCard href="/evidence-assurance/data-governance" kicker="Data" title="Prove data governance" detail="Review Supabase schema, table, RLS policy, access, and audit capability evidence without collecting row contents." />
          <WorkflowCard href="/evidence-assurance/mcp-governance" kicker="MCP" title="Prove actual authority" detail="Review MCP server inventory, tool registry, permissions, authority classifications, and capability inventory." />
          <WorkflowCard href="/evidence-assurance/governance-evidence" kicker="Governance" title="Prove human decisions" detail="Review Notion approvals, reviews, committee activity, ownership, and governance documentation evidence." />
          <WorkflowCard href="/evidence-assurance/secrets-governance" kicker="Secrets" title="Prove secret governance" detail="Review secret identifiers, owners, rotation metadata, usage mappings, and plaintext prohibition evidence." />
          <WorkflowCard href="/evidence-assurance/asset-discovery" kicker="Discovery" title="Find forgotten assets" detail="Compare declared assets against repository, runtime, data, MCP, secrets, documentation, and workflow signals." />
          <WorkflowCard href="/evidence-assurance/snapshots" kicker="Snapshot" title="Verify collected version" detail="Use preserved content, commit SHA, hash, collection method, and timestamp." />
          <WorkflowCard href="/evidence-assurance/drift" kicker="Drift" title="Compare current source" detail="Review whether source files still match the collected audit baseline." />
          <WorkflowCard href="/evidence-assurance/assurance" kicker="Assurance" title="Explain conclusions" detail="See validation checks, supported controls, warnings, and failure conditions." />
        </div>
      </Section>

      <Section title="Asset discovery reality">
        <div className="grid gap-3 md:grid-cols-2">
          {operations.assetDiscoveryRuns.filter((run) => run.aiSystem.slug === "travel-brain").map((run) => (
            <Link key={run.id} href="/evidence-assurance/asset-discovery" className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Radar className="h-4 w-4 text-brand" />
                    {run.runId} · {run.aiSystem.name}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{run.sources.length} source(s) · {run.findings.length} finding(s) · {run.inventoryCompleteness}% completeness</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{run.comparisonSummary}</p>
                </div>
                <StatusBadge status={run.findings.some((finding) => finding.status === "OPEN" || finding.status === "REVIEW_REQUIRED") ? "WARNING" : run.status} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Control workflow">
        <div className="grid gap-3 md:grid-cols-3">
          <WorkflowCard href="/controls/AI-GOV-003" kicker="Control" title="Prompt governance" detail="Control to evidence to artifact to assurance for Travel Brain prompt governance." />
          <WorkflowCard href="/controls/AI-GOV-006" kicker="Control" title="Tool permissions" detail="Control to policy evidence, validation, and source verification." />
          <WorkflowCard href="/controls/AUD-001" kicker="Control" title="Audit evidence" detail="Control to workflow artifact, snapshot, drift, and verification path." />
        </div>
      </Section>

      <Section title="Auditor workflow">
        <div className="grid gap-3 md:grid-cols-3">
          <WorkflowCard href="/evidence-assurance/traceability" kicker="Traceability" title="Follow the audit path" detail="Move from regulation or control into the supporting evidence chain." />
          <WorkflowCard href="/evidence-assurance/artifacts" kicker="Verification" title="Verify artifacts" detail="Open collected content, source, commit, snapshot, and drift comparison." />
          <WorkflowCard href="/evidence-assurance/packages" kicker="Packages" title="Prepare audit package" detail="Review existing audit packages and their included evidence objects." />
        </div>
      </Section>

      <Section title="Human governance reality">
        <div className="grid gap-3 md:grid-cols-2">
          {operations.notionEvidenceArtifacts.filter((artifact) => artifact.aiSystem.slug === "travel-brain").map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <BookOpen className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {artifact.notionConnection.status}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-4">
                <NotionEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Secrets governance reality">
        <div className="grid gap-3 md:grid-cols-2">
          {operations.secretEvidenceArtifacts.filter((artifact) => artifact.aiSystem.slug === "travel-brain").map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <KeyRound className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {artifact.secretsConnection.status}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-4">
                <SecretEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Actual MCP authority">
        <div className="grid gap-3 md:grid-cols-2">
          {operations.mcpEvidenceArtifacts.filter((artifact) => artifact.aiSystem.slug === "travel-brain").map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Network className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {artifact.mcpConnection.status}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-4">
                <McpEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Data governance reality">
        <div className="grid gap-3 md:grid-cols-2">
          {operations.supabaseEvidenceArtifacts.filter((artifact) => artifact.aiSystem.slug === "travel-brain").map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Database className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {artifact.supabaseConnection.status}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-4">
                <SupabaseEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Operational reality">
        <div className="grid gap-3 md:grid-cols-2">
          {operations.runtimeEvidenceArtifacts.filter((artifact) => artifact.aiSystem.slug === "travel-brain").map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Activity className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.logSource.name}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.evidenceType} · {artifact.correlationId} · Control {artifact.relatedControlId}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-4">
                <RuntimeEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Deployed-state reality">
        <div className="grid gap-3 md:grid-cols-2">
          {operations.deploymentEvidenceArtifacts.filter((artifact) => artifact.aiSystem.slug === "travel-brain").map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Server className="h-4 w-4 text-brand" />
                    {artifact.artifactId} · {artifact.containerName}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.imageName}:{artifact.imageTag} · {artifact.portainerConnection.status}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.evidenceSummary}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={artifact.validationStatus} />
                  <StatusBadge status={artifact.evidenceHealth} />
                </div>
              </div>
              <div className="mt-4">
                <DeploymentEvidenceLinks artifactId={artifact.artifactId} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Travel Brain validation">
        <div className="grid gap-3 md:grid-cols-2">
          {travelBrainArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {iconForType(artifact.artifactType)}
                    {artifact.name}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{artifact.path} · {artifact.version}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Assurance {artifactAssuranceScore(artifact.assuranceRules)}% · {artifact.snapshots.length} preserved snapshot(s)
                  </p>
                </div>
                <StatusBadge status={artifactAssuranceStatus(artifact.assuranceRules)} />
              </div>
              <div className="mt-4">
                <ArtifactWorkflowLinks artifactId={artifact.artifactId} sourceUrl={artifact.sourceUrl} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Consolidated detailed views">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/evidence-repository" className="rounded-md border border-line bg-white p-4 text-sm font-semibold text-ink hover:bg-panel">Advanced evidence repository</Link>
          <Link href="/evidence-health" className="rounded-md border border-line bg-white p-4 text-sm font-semibold text-ink hover:bg-panel">Detailed evidence health</Link>
          <Link href="/governance-operations" className="rounded-md border border-line bg-white p-4 text-sm font-semibold text-ink hover:bg-panel">Governance operations detail</Link>
          <Link href="/traceability" className="rounded-md border border-line bg-white p-4 text-sm font-semibold text-ink hover:bg-panel">Detailed traceability workspace</Link>
        </div>
      </Section>
    </>
  );
}

function iconForType(type: string) {
  const Icon = {
    MANIFEST: Archive,
    PROMPT: FileSearch,
    POLICY: ShieldCheck,
    WORKFLOW: GitPullRequestArrow
  }[type] ?? ClipboardCheck;
  return <Icon className="h-4 w-4 text-brand" />;
}
