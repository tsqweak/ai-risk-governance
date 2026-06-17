import Link from "next/link";
import { Bot, FileSearch, GitBranch, ShieldCheck } from "lucide-react";
import { revalidatePath } from "next/cache";
import { prisma } from "@airg/db";
import { getGitHubRepositoryDiscoveries, getRepositoryDiscoveries } from "../../data";
import { formatDate, humanize } from "../../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../../components/ui";

export const dynamic = "force-dynamic";

async function selectTravelBrainRepository(formData: FormData) {
  "use server";

  const repositoryId = String(formData.get("repositoryId") ?? "");
  if (!repositoryId) return;

  const [repository, travelBrain] = await Promise.all([
    prisma.gitHubRepositoryDiscovery.findUnique({ where: { repositoryId } }),
    prisma.aiSystem.findUnique({ where: { slug: "travel-brain" } })
  ]);
  if (!repository || !travelBrain) return;

  await prisma.gitHubRepositoryDiscovery.updateMany({
    where: { selectedForAiSystemId: travelBrain.id },
    data: { selectedForAiSystemId: null }
  });
  await prisma.gitHubRepositoryDiscovery.update({
    where: { repositoryId },
    data: { selectedForAiSystemId: travelBrain.id }
  });
  await prisma.repositoryConnection.update({
    where: { repositoryId: "REPO-TB-GITHUB-001" },
    data: {
      repositoryUrl: repository.repositoryUrl,
      branch: repository.defaultBranch,
      status: "CONNECTED",
      lastScan: new Date()
    }
  });

  revalidatePath("/onboarding/repositories");
  revalidatePath("/governance-operations");
}

export default async function RepositoryOnboardingPage() {
  const [repositories, githubRepositories] = await Promise.all([
    getRepositoryDiscoveries(),
    getGitHubRepositoryDiscoveries()
  ]);
  const pending = repositories.filter((repository) => repository.reviewStatus === "SUGGESTED" || repository.reviewStatus === "REVIEWED");
  const evidenceSources = repositories.flatMap((repository) => repository.evidenceSources);

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Repository Discovery</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Repository-first governance profiling</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Discover AI components, evidence sources, and suggested governance profiles from repositories. Suggestions require human review before activation.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Repositories" value={repositories.length} icon={GitBranch} />
        <Metric label="Suggested Profiles" value={repositories.filter((repository) => repository.reviewStatus === "SUGGESTED").length} icon={ShieldCheck} />
        <Metric label="Evidence Sources" value={evidenceSources.length} icon={FileSearch} />
        <Metric label="Pending Reviews" value={pending.length} icon={Bot} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LearningPanel title="Repository-first">
          Repository discovery starts from code, prompts, policies, configuration, workflows, and logs rather than asking teams to retype what already exists.
        </LearningPanel>
        <LearningPanel title="Human-reviewed">
          Suggested profiles are not final governance decisions. IT Risk, Compliance, and governance owners must review and approve before activation.
        </LearningPanel>
        <LearningPanel title="Evidence-aware">
          Discovery identifies possible evidence sources early so controls are tied to proof at the point of onboarding.
        </LearningPanel>
      </div>

      <Section title="Pilot assessment">
        <Link href="/onboarding/travel-brain-pilot" className="block rounded-md border border-line bg-white p-5 hover:bg-panel">
          <div className="text-sm font-semibold text-ink">Travel Brain Governance Manifest Pilot</div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Validate the Travel Brain manifest, asset inventory, evidence sources, discovery assessment, and automation readiness before Phase 9 Governance Operations.
          </p>
        </Link>
      </Section>

      <Section title="GitHub repository discovery">
        {githubRepositories.length > 0 ? (
          <div className="grid gap-3">
            {githubRepositories.map((repository) => (
              <article key={repository.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-ink">{repository.fullName}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{repository.description}</p>
                    <div className="mt-1 text-xs text-slate-500">
                      {repository.repositoryUrl} · Default branch {repository.defaultBranch} · Discovered {formatDate(repository.discoveredAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {repository.selectedForAiSystem ? <StatusBadge status="CONNECTED" /> : <StatusBadge status="SUGGESTED" />}
                    <form action={selectTravelBrainRepository}>
                      <input type="hidden" name="repositoryId" value={repository.repositoryId} />
                      <button className="rounded border border-line bg-panel px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white" type="submit">
                        Select for Travel Brain
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-line bg-white p-5">
            <div className="text-sm font-semibold text-ink">No GitHub repositories discovered</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Set `GITHUB_TOKEN` and `GITHUB_OWNER`, then run repository discovery to populate read-only GitHub repositories for selection.
            </p>
          </div>
        )}
      </Section>

      <Section title="Discovered repositories">
        <div className="grid gap-4">
          {repositories.map((repository) => (
            <Link key={repository.id} href={`/onboarding/repositories/${repository.id}`} className="rounded-md border border-line bg-white p-5 hover:bg-panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{repository.name}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{repository.description}</p>
                  <div className="mt-2 text-xs text-slate-500">
                    {humanize(repository.repositoryType)} · {repository.location} · Updated {formatDate(repository.updatedAt)}
                  </div>
                </div>
                <StatusBadge status={repository.reviewStatus} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <Fact label="System Type" value={repository.suggestedSystemType} />
                <Fact label="Agentic Level" value={`${repository.suggestedAgenticLevel}`} />
                <Fact label="Manifest" value={repository.governanceManifest ? repository.governanceManifest.validationStatus : "Missing"} />
                <Fact label="Evidence Sources" value={`${repository.evidenceSources.length}`} />
              </div>
              {repository.onboardingFindings.length > 0 ? (
                <div className="mt-3 rounded border border-line bg-panel p-3 text-xs font-semibold text-red-700">
                  {repository.onboardingFindings.map((finding) => `${finding.findingId}: ${finding.title}`).join("; ")}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
