import Link from "next/link";
import { FileCode2, GitBranch, ShieldCheck } from "lucide-react";
import { LearningPanel, Section } from "../components/ui";

export const dynamic = "force-dynamic";

const requiredSections = ["system", "owners", "ai", "assets", "evidence_sources", "regulatory_scope", "data", "risk"];

export default function GovernanceManifestPage() {
  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI Governance Manifest</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">AI Governance.yaml</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          A repository-native manifest standard for declaring AI system ownership, purpose, assets, evidence sources, risk profile, and regulatory scope.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LearningPanel title="What is AI Governance.yaml?">
          A human-readable and machine-readable file that declares the governance profile of an AI system directly in its repository.
        </LearningPanel>
        <LearningPanel title="Why it exists">
          Traditional governance starts from an application inventory. AI governance needs repository-native declarations for prompts, models, agents, tools, evidence, data, and risk.
        </LearningPanel>
        <LearningPanel title="Enterprise story">
          No manifest. No onboarding. No governance. The manifest does not approve a system, but it creates the minimum reviewable starting point.
        </LearningPanel>
      </div>

      <Section title="Required sections">
        <div className="grid gap-3 md:grid-cols-4">
          {requiredSections.map((section) => (
            <div key={section} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <FileCode2 className="h-4 w-4 text-brand" />
                {section}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Validation model">
        <div className="grid gap-4 md:grid-cols-3">
          <Validation title="Valid" detail="Required fields are present, evidence sources are declared, owners are identified, lifecycle stage is declared, and the manifest can support onboarding review." />
          <Validation title="Warning" detail="Required fields exist, but the manifest has quality concerns such as generic risks, incomplete asset owners, or missing approval sources." />
          <Validation title="Invalid" detail="Required fields are missing, or no evidence sources are declared. The repository should not be approved for governance onboarding." />
        </div>
      </Section>

      <Section title="How it supports governance">
        <div className="grid gap-4 lg:grid-cols-3">
          <Story title="Onboarding" icon={GitBranch} detail="Repository discovery can use manifest values to seed suggested governance profiles for review." />
          <Story title="Audit" icon={ShieldCheck} detail="Auditors can compare declared ownership, evidence sources, controls, and risks to actual repository evidence." />
          <Story title="Automation" icon={FileCode2} detail="Future jobs can validate manifest freshness, detect drift, and generate evidence-source records from declared paths." />
        </div>
      </Section>

      <Section title="Manifest registry">
        <Link href="/governance-manifest/registry" className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          Open Manifest Registry
        </Link>
      </Section>
    </>
  );
}

function Validation({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
  );
}

function Story({ title, detail, icon: Icon }: { title: string; detail: string; icon: typeof FileCode2 }) {
  return (
    <article className="rounded-md border border-line bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon className="h-4 w-4 text-brand" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
  );
}
