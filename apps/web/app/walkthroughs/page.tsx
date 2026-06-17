import Link from "next/link";
import { BookOpen, GitBranch, Landmark, Route } from "lucide-react";
import { Section } from "../components/ui";

export const dynamic = "force-dynamic";

const walkthroughs = [
  ["/systems/travel-brain", "Travel Brain Governance Walkthrough", "Production-ready recommendation-only AI system story.", BookOpen],
  ["/systems/autonomous-payment-agent/agentic-governance", "Agentic AI Walkthrough", "High-authority pilot with tools, approvals, execution logs, and kill switch gaps.", Route],
  ["/auditor-workspace", "Auditor Walkthrough", "Trace regulation to control to evidence to findings and exceptions.", GitBranch],
  ["/traceability", "Regulatory Traceability Walkthrough", "Follow obligations through requirements, controls, systems, and evidence.", Landmark]
] as const;

export default function WalkthroughsPage() {
  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Guided walkthroughs</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Architectural placeholders for guided demos</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Future guided walkthroughs will teach the governance story without replacing the operational workspaces.
        </p>
      </header>

      <Section title="Walkthrough placeholders">
        <div className="grid gap-3 md:grid-cols-2">
          {walkthroughs.map(([href, title, detail, Icon]) => (
            <Link key={title} href={href} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon className="h-4 w-4 text-brand" />
                {title}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
