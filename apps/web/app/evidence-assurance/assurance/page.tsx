import Link from "next/link";
import { getGovernanceOperationsDashboard } from "../../data";
import { Section, StatusBadge } from "../../components/ui";
import { FactTile, WorkflowCard } from "../components";

export const dynamic = "force-dynamic";

export default async function EvidenceAssuranceAssurancePage() {
  const data = await getGovernanceOperationsDashboard();
  const warningRules = data.assuranceRules.filter((rule) => rule.status !== "PASS");
  const deploymentControlIds = data.deploymentEvidenceArtifacts.flatMap((artifact) => parseRelatedControls(artifact.relatedControlsJson));
  const supabaseControlIds = data.supabaseEvidenceArtifacts.flatMap((artifact) => parseRelatedControls(artifact.relatedControlsJson));
  const mcpControlIds = data.mcpEvidenceArtifacts.flatMap((artifact) => parseRelatedControls(artifact.relatedControlsJson));
  const notionControlIds = data.notionEvidenceArtifacts.flatMap((artifact) => parseRelatedControls(artifact.relatedControlsJson));
  const controlIds = [...new Set([...data.assuranceRules.map((rule) => rule.controlId), ...deploymentControlIds, ...supabaseControlIds, ...mcpControlIds, ...notionControlIds])].sort();

  return (
    <>
      <div className="grid gap-0 sm:grid-cols-4">
        <FactTile label="Assurance" value={`${data.kpis.averageAssurance}%`} status={data.kpis.averageAssurance >= 80 ? "PASS" : "WARNING"} />
        <FactTile label="Rules Passed" value={`${data.kpis.passingAssuranceRules}/${data.kpis.assuranceRules}`} />
        <FactTile label="Control Coverage" value={`${data.kpis.controlCoverage}%`} />
        <FactTile label="Warnings" value={warningRules.length} status={warningRules.length ? "WARNING" : "PASS"} />
      </div>

      <Section title="Assurance workflow">
        <div className="grid gap-3 md:grid-cols-3">
          <WorkflowCard href="/controls/AI-GOV-003" kicker="Control" title="Prompt assurance" detail="Review prompt governance controls, evidence, validation checks, and failure conditions." />
          <WorkflowCard href="/evidence-assurance/artifacts" kicker="Artifact" title="Artifact assurance" detail="Inspect collected files and assurance status by artifact." />
          <WorkflowCard href="/evidence-assurance/deployments" kicker="Deployment" title="Deployment assurance" detail="Review Portainer deployed-state evidence, safe runtime boundaries, drift, and production approval traceability." />
          <WorkflowCard href="/evidence-assurance/data-governance" kicker="Data" title="Data governance assurance" detail="Review Supabase schema, table, RLS, access, and audit capability evidence." />
          <WorkflowCard href="/evidence-assurance/mcp-governance" kicker="MCP" title="MCP assurance" detail="Review tool registry, permissions, authority classifications, and capability evidence." />
          <WorkflowCard href="/evidence-assurance/governance-evidence" kicker="Governance" title="Human governance assurance" detail="Review Notion approval, review, committee, ownership, and governance documentation evidence." />
          <WorkflowCard href="/governance-operations" kicker="Detail" title="Operations detail" detail="Open the full operations page for connector and source mechanics." />
        </div>
      </Section>

      <Section title="Deployment assurance results">
        <div className="grid gap-3 md:grid-cols-2">
          {data.deploymentEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/deployment-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId} · {artifact.containerName}</Link>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  <p className="mt-1 text-xs text-slate-600">{artifact.sourceGap}</p>
                </div>
                <StatusBadge status={artifact.validationStatus} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {parseRelatedControls(artifact.relatedControlsJson).map((controlId) => (
                  <Link key={controlId} href={`/controls/${controlId}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">{controlId}</Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Data governance assurance results">
        <div className="grid gap-3 md:grid-cols-2">
          {data.supabaseEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/supabase-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId} · {artifact.title}</Link>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  <p className="mt-1 text-xs text-slate-600">{artifact.sourceGap}</p>
                </div>
                <StatusBadge status={artifact.validationStatus} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {parseRelatedControls(artifact.relatedControlsJson).map((controlId) => (
                  <Link key={controlId} href={`/controls/${controlId}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">{controlId}</Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="MCP assurance results">
        <div className="grid gap-3 md:grid-cols-2">
          {data.mcpEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/mcp-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId} · {artifact.title}</Link>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  <p className="mt-1 text-xs text-slate-600">{artifact.sourceGap}</p>
                </div>
                <StatusBadge status={artifact.validationStatus} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {parseRelatedControls(artifact.relatedControlsJson).map((controlId) => (
                  <Link key={controlId} href={`/controls/${controlId}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">{controlId}</Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Human governance assurance results">
        <div className="grid gap-3 md:grid-cols-2">
          {data.notionEvidenceArtifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/notion-evidence/${artifact.artifactId}`} className="text-sm font-semibold text-ink hover:text-brand">{artifact.artifactId} · {artifact.title}</Link>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{artifact.assuranceSummary}</p>
                  <p className="mt-1 text-xs text-slate-600">{artifact.sourceGap}</p>
                </div>
                <StatusBadge status={artifact.validationStatus} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {parseRelatedControls(artifact.relatedControlsJson).map((controlId) => (
                  <Link key={controlId} href={`/controls/${controlId}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">{controlId}</Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Warning and failure workbench">
        <div className="grid gap-3">
          {warningRules.length > 0 ? warningRules.map((rule) => (
            <article key={rule.id} className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/controls/${rule.controlId}`} className="text-sm font-semibold text-ink hover:text-brand">{rule.controlId} · {rule.validationRule}</Link>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{rule.explanation?.reason ?? rule.resultSummary}</p>
                  <p className="mt-1 text-xs text-slate-600">{rule.artifact.name} · {rule.artifact.path}</p>
                </div>
                <StatusBadge status={rule.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/evidence-artifacts/${rule.artifact.artifactId}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">Artifact</Link>
                <Link href={`/evidence-artifacts/${rule.artifact.artifactId}/drift`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">Drift</Link>
                <Link href={`/evidence-artifacts/${rule.artifact.artifactId}#evidence-chain`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">Evidence chain</Link>
              </div>
            </article>
          )) : <div className="rounded-md border border-line bg-white p-4 text-sm text-slate-600">No active assurance warnings or failures.</div>}
        </div>
      </Section>

      <Section title="Control coverage">
        <div className="flex flex-wrap gap-2">
          {controlIds.map((controlId) => (
            <Link key={controlId} href={`/controls/${controlId}`} className="rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-panel">
              {controlId}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

function parseRelatedControls(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
