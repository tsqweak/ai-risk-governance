import Link from "next/link";
import { GroupedSecondaryNav, StatusBadge } from "../components/ui";
import { evidenceAssuranceNav, evidenceAssuranceNavGroups } from "./navigation";

export { evidenceAssuranceNav, evidenceAssuranceNavGroups };

export function EvidenceAssuranceNav() {
  return <GroupedSecondaryNav groups={evidenceAssuranceNavGroups} />;
}

export function WorkflowCard({ href, title, detail, kicker }: { href: string; title: string; detail: string; kicker: string }) {
  return (
    <Link href={href} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
      <div className="text-xs font-semibold uppercase tracking-wide text-brand">{kicker}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </Link>
  );
}

export function FactTile({ label, value, status }: { label: string; value: string | number; status?: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
        </div>
        {status ? <StatusBadge status={status} /> : null}
      </div>
    </div>
  );
}

export function ArtifactWorkflowLinks({ artifactId, sourceUrl }: { artifactId: string; sourceUrl?: string }) {
  const links = [
    [`/evidence-artifacts/${artifactId}`, "Artifact"],
    [`/evidence-artifacts/${artifactId}#evidence-snapshot`, "Snapshot"],
    [`/evidence-artifacts/${artifactId}/drift`, "Drift"],
    [`/evidence-artifacts/${artifactId}#evidence-chain`, "Assurance"]
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
          {label}
        </Link>
      ))}
      {sourceUrl ? (
        <Link href={sourceUrl} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
          Source
        </Link>
      ) : null}
    </div>
  );
}

export function RuntimeEvidenceLinks({ artifactId }: { artifactId: string }) {
  const links = [
    [`/runtime-evidence/${artifactId}`, "Runtime Evidence"],
    [`/runtime-evidence/${artifactId}#runtime-source`, "Source"],
    [`/runtime-evidence/${artifactId}#runtime-assurance`, "Assurance"],
    [`/runtime-evidence/${artifactId}#runtime-chain`, "Evidence Chain"]
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
          {label}
        </Link>
      ))}
    </div>
  );
}

export function DeploymentEvidenceLinks({ artifactId }: { artifactId: string }) {
  const links = [
    [`/deployment-evidence/${artifactId}`, "Deployment Evidence"],
    [`/deployment-evidence/${artifactId}#deployment-source`, "Source"],
    [`/deployment-evidence/${artifactId}#deployment-assurance`, "Assurance"],
    [`/deployment-evidence/${artifactId}#deployment-drift`, "Drift"],
    [`/deployment-evidence/${artifactId}#deployment-chain`, "Evidence Chain"]
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
          {label}
        </Link>
      ))}
    </div>
  );
}

export function SupabaseEvidenceLinks({ artifactId }: { artifactId: string }) {
  const links = [
    [`/supabase-evidence/${artifactId}`, "Supabase Evidence"],
    [`/supabase-evidence/${artifactId}#supabase-source`, "Source"],
    [`/supabase-evidence/${artifactId}#supabase-assurance`, "Assurance"],
    [`/supabase-evidence/${artifactId}#supabase-validation`, "Validation"],
    [`/supabase-evidence/${artifactId}#supabase-drift`, "Drift"],
    [`/supabase-evidence/${artifactId}#supabase-snapshots`, "Snapshots"],
    [`/supabase-evidence/${artifactId}#supabase-chain`, "Evidence Chain"]
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
          {label}
        </Link>
      ))}
    </div>
  );
}

export function McpEvidenceLinks({ artifactId }: { artifactId: string }) {
  const links = [
    [`/mcp-evidence/${artifactId}`, "MCP Evidence"],
    [`/mcp-evidence/${artifactId}#mcp-source`, "Source"],
    [`/mcp-evidence/${artifactId}#mcp-assurance`, "Assurance"],
    [`/mcp-evidence/${artifactId}#mcp-chain`, "Evidence Chain"]
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
          {label}
        </Link>
      ))}
    </div>
  );
}

export function NotionEvidenceLinks({ artifactId }: { artifactId: string }) {
  const links = [
    [`/notion-evidence/${artifactId}`, "Notion Evidence"],
    [`/notion-evidence/${artifactId}#notion-source`, "Source"],
    [`/notion-evidence/${artifactId}#notion-assurance`, "Assurance"],
    [`/notion-evidence/${artifactId}#notion-chain`, "Evidence Chain"]
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
          {label}
        </Link>
      ))}
    </div>
  );
}

export function SecretEvidenceLinks({ artifactId }: { artifactId: string }) {
  const links = [
    [`/secret-evidence/${artifactId}`, "Secret Evidence"],
    [`/secret-evidence/${artifactId}#secret-source`, "Source"],
    [`/secret-evidence/${artifactId}#secret-assurance`, "Assurance"],
    [`/secret-evidence/${artifactId}#secret-controls`, "Evidence Chain"]
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
          {label}
        </Link>
      ))}
    </div>
  );
}

export function artifactAssuranceStatus(rules: Array<{ status: string }>) {
  if (rules.some((rule) => rule.status === "FAIL")) return "FAIL";
  if (rules.some((rule) => rule.status === "WARNING")) return "WARNING";
  return rules.length > 0 ? "PASS" : "MISSING";
}

export function artifactAssuranceScore(rules: Array<{ status: string }>) {
  if (rules.length === 0) return 0;
  return Math.round((rules.filter((rule) => rule.status === "PASS").length / rules.length) * 100);
}
