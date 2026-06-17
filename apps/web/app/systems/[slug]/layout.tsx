import Link from "next/link";
import { notFound } from "next/navigation";
import { getAiSystemWorkspace } from "../../data";
import { Breadcrumbs, RiskBadge, StatusBadge } from "../../components/ui";

const tabs = [
  ["Overview", ""],
  ["Risk", "risk"],
  ["Regulations", "regulations"],
  ["Controls", "controls"],
  ["Evidence", "evidence"],
  ["Monitoring", "monitoring"],
  ["Lifecycle", "lifecycle"],
  ["AI Governance", "ai-governance"],
  ["Agentic Governance", "agentic-governance"],
  ["Governance Engineering", "governance-engineering"],
  ["Audit Trail", "audit-trail"]
] as const;

export default async function SystemWorkspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemWorkspace(slug);
  if (!system) notFound();

  return (
    <>
      <section className="sticky top-0 z-10 -mx-5 border-b border-line bg-panel/95 px-5 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Breadcrumbs items={[{ label: "AI Systems", href: "/" }, { label: system.name }]} />
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">AI System Workspace</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">{system.name}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{system.description}</p>
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-3 xl:w-[560px]">
            <Signal label="Lifecycle" value={<StatusBadge status={system.lifecycleStatus} />} />
            <Signal label="Risk tier" value={<RiskBadge level={system.assessment?.overallRiskTier ?? "LOW"} />} />
            <Signal label="Evidence health" value={`${system.workspaceMetrics.evidenceHealthPct}%`} />
            <Signal label="Open findings" value={system.workspaceMetrics.openFindings} />
            <Signal label="Authority" value={system.authorityAssignment ? `Level ${system.authorityAssignment.delegatedAuthority.authorityLevel}` : "Unassigned"} />
            <Signal label="Owners" value={`${system.businessOwner} / ${system.riskOwner || "Unassigned"}`} />
          </div>
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto">
          {tabs.map(([label, suffix]) => {
            const href = suffix ? `/systems/${slug}/${suffix}` : `/systems/${slug}`;
            return (
              <Link key={label} href={href} className="whitespace-nowrap rounded px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white hover:text-ink">
                {label}
              </Link>
            );
          })}
        </nav>
      </section>
      <div className="pt-6">{children}</div>
    </>
  );
}

function Signal({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-white px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
