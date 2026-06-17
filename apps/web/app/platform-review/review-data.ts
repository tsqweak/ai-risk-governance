import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { prisma } from "@airg/db";
import { getGovernanceOperationsDashboard } from "../data";
import { recommendedTopLevelHubs, sidebarNavigation } from "../navigation-model";
import { evidenceAssuranceNav } from "../evidence-assurance/navigation";

export type ReviewIssue = {
  title: string;
  severity: "PASS" | "WARNING" | "FAIL";
  category: string;
  detail: string;
  reviewPath: string;
};

export type RouteInventoryItem = {
  route: string;
  fileKind: "Page" | "Route Handler";
  pageType: string;
  status: "ACTIVE" | "REVIEW" | "DEPRECATED";
  category: string;
  filePath: string;
};

export type FeatureInventoryItem = {
  name: string;
  phase: string;
  status: string;
  maturity: string;
  dependencies: string;
  futureWork: string;
};

export async function getPlatformReviewData(statusFilter = "All") {
  const repoRoot = join(process.cwd(), "..", "..");
  const docsRoot = join(repoRoot, "docs");
  const appRoot = join(process.cwd(), "app");

  const [routes, featureRegistryMarkdown, operatingModelMarkdown, uxReviewMarkdown, operations, evidenceHealth, findings, exceptions] = await Promise.all([
    collectRouteInventory(appRoot),
    readFile(join(docsRoot, "FEATURE_REGISTRY.md"), "utf8"),
    readFile(join(docsRoot, "PROJECT_OPERATING_MODEL.md"), "utf8"),
    readFile(join(docsRoot, "UX_ARCHITECTURE_REVIEW.md"), "utf8"),
    getGovernanceOperationsDashboard(),
    prisma.evidenceHealth.findMany({ include: { aiSystem: true, evidenceRequirement: true }, orderBy: { health: "asc" } }),
    prisma.finding.findMany({ include: { aiSystem: true, controlTest: true }, orderBy: [{ status: "asc" }, { severity: "desc" }] }),
    prisma.exception.findMany({ include: { finding: { include: { aiSystem: true } } }, orderBy: { expirationDate: "asc" } })
  ]);

  const featureRegistry = parseFeatureRegistry(featureRegistryMarkdown);
  const features = statusFilter === "All"
    ? featureRegistry.features
    : featureRegistry.features.filter((feature) => feature.status === statusFilter);
  const navigation = buildNavigationInventory(routes);
  const evidenceInventory = buildEvidenceInventory(operations, evidenceHealth);
  const architectureDrift = buildArchitectureDrift(routes, featureRegistry.features, navigation, operatingModelMarkdown, uxReviewMarkdown);
  const openIssues = buildOpenIssues({
    routes,
    features: featureRegistry.features,
    navigation,
    operations,
    evidenceHealth,
    findings,
    exceptions,
    architectureDrift
  });

  return {
    generatedAt: new Date(),
    statusFilter,
    routes,
    featureRegistry,
    features,
    featureStatuses: ["All", ...Array.from(new Set(featureRegistry.features.map((feature) => feature.status))).sort()],
    navigation,
    evidenceInventory,
    architectureDrift,
    openIssues,
    packageScreens: platformReviewPackageScreens,
    reportPath: "docs/PLATFORM_REVIEW_REPORT.md",
    reviewCounts: {
      findings: findings.length,
      openFindings: findings.filter((finding) => finding.status === "OPEN").length,
      exceptions: exceptions.length,
      activeExceptions: exceptions.filter((exception) => exception.expirationDate >= new Date()).length
    }
  };
}

async function collectRouteInventory(appRoot: string): Promise<RouteInventoryItem[]> {
  const files = await collectFiles(appRoot);
  return files
    .filter((filePath) => filePath.endsWith(`${sep}page.tsx`) || filePath.endsWith(`${sep}route.ts`))
    .map((filePath) => {
      const fileKind: RouteInventoryItem["fileKind"] = filePath.endsWith(`${sep}route.ts`) ? "Route Handler" : "Page";
      const route = routeFromFile(appRoot, filePath);
      const classification = classifyRoute(route, fileKind);
      return {
        route,
        fileKind,
        pageType: classification.pageType,
        status: classification.status,
        category: classification.category,
        filePath: relative(process.cwd(), filePath)
      };
    })
    .sort((a, b) => a.route.localeCompare(b.route));
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(entryPath);
    return [entryPath];
  }));
  return nested.flat();
}

function routeFromFile(appRoot: string, filePath: string) {
  const routeDirectory = relative(appRoot, dirname(filePath));
  if (!routeDirectory) return "/";
  return `/${routeDirectory.split(sep).join("/")}`;
}

function classifyRoute(route: string, fileKind: "Page" | "Route Handler") {
  if (fileKind === "Route Handler") {
    return { pageType: "Route Handler", category: "Evidence", status: "ACTIVE" as const };
  }

  const deprecated = new Set(["/projects/travel-brain", "/regulatory-mapping"]);
  if (deprecated.has(route)) {
    return { pageType: "Legacy Route", category: "Deprecated", status: "DEPRECATED" as const };
  }

  const reviewRoutes = new Set([
    "/auditor",
    "/audit-packages",
    "/control-health",
    "/evidence",
    "/evidence-health",
    "/evidence-repository",
    "/governance-operations",
    "/regulatory-coverage",
    "/risk-heatmap",
    "/traceability",
    "/walkthroughs"
  ]);

  const status = reviewRoutes.has(route) ? "REVIEW" as const : "ACTIVE" as const;
  if (route === "/" || route === "/executive" || route === "/portfolio" || route === "/governance" || route === "/evidence-assurance" || route === "/administration") {
    return { pageType: "Hub", category: "Hub", status };
  }
  if (route.startsWith("/systems/[slug]")) {
    return { pageType: route === "/systems/[slug]" ? "AI System Workspace" : "Workspace Tab", category: "Workspace", status };
  }
  if (route.includes("[")) {
    return { pageType: "Object Detail", category: route.includes("evidence") ? "Evidence" : "Object Detail", status };
  }
  if (route.startsWith("/evidence-assurance") || route.startsWith("/evidence") || route.startsWith("/runtime-evidence") || route.startsWith("/deployment-evidence") || route.startsWith("/audit-packages")) {
    return { pageType: "Evidence Workbench", category: "Evidence", status };
  }
  if (route.startsWith("/onboarding")) {
    return { pageType: route.includes("travel-brain-pilot") ? "Pilot" : "Administration", category: "Administration", status };
  }
  if (route.includes("dashboard") || route.includes("health") || route.includes("monitoring") || route.includes("coverage") || route.includes("risk")) {
    return { pageType: "Dashboard", category: "Dashboard", status };
  }
  return { pageType: "Workbench", category: "Operational", status };
}

function parseFeatureRegistry(markdown: string) {
  const currentFocusText = between(markdown, "## Current Focus", "## Next Focus");
  const currentFocus = {
    phase: matchLine(currentFocusText, "Phase") || "Not stated",
    feature: matchLine(currentFocusText, "Feature") || "Not stated",
    target: matchLine(currentFocusText, "Target") || "Not stated",
    objective: matchLine(currentFocusText, "Objective") || "Not stated"
  };

  const featuresText = markdown.slice(markdown.indexOf("## Features"));
  const features = featuresText
    .split(/\n### /)
    .slice(1)
    .map((chunk) => `### ${chunk}`)
    .filter((chunk) => chunk.includes("Feature Name:"))
    .map((chunk): FeatureInventoryItem => ({
      name: matchLine(chunk, "Feature Name") || heading(chunk),
      phase: matchLine(chunk, "Phase") || "Not stated",
      status: matchLine(chunk, "Status") || "Not stated",
      maturity: matchLine(chunk, "Maturity") || "Not stated",
      dependencies: matchLine(chunk, "Dependencies") || "Not stated",
      futureWork: matchLine(chunk, "Future Work") || "Not stated"
    }));

  return {
    currentFocus,
    features,
    countsByStatus: countBy(features, "status"),
    countsByMaturity: countBy(features, "maturity")
  };
}

function between(markdown: string, start: string, end: string) {
  const startIndex = markdown.indexOf(start);
  if (startIndex === -1) return "";
  const endIndex = markdown.indexOf(end, startIndex + start.length);
  return markdown.slice(startIndex + start.length, endIndex === -1 ? undefined : endIndex);
}

function matchLine(text: string, label: string) {
  const match = text.match(new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim();
}

function heading(text: string) {
  return text.match(/^###\s+(.+)$/m)?.[1]?.trim() ?? "Unknown feature";
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildNavigationInventory(routes: RouteInventoryItem[]) {
  const sidebarItems = sidebarNavigation.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title })));
  const secondaryItems = evidenceAssuranceNav.map(([href, label]) => ({ href, label, hub: "Evidence & Assurance" }));
  const recommendedLabels = new Set(recommendedTopLevelHubs);
  const sidebarDrift = sidebarItems.filter((item) => !recommendedLabels.has(item.label as typeof recommendedTopLevelHubs[number]));
  const duplicateDestinations = [
    { topic: "Evidence", routes: routes.filter((route) => route.route.startsWith("/evidence") || route.route.startsWith("/runtime-evidence") || route.route.startsWith("/deployment-evidence") || route.route === "/audit-packages").map((route) => route.route) },
    { topic: "Auditor", routes: routes.filter((route) => route.route.startsWith("/auditor")).map((route) => route.route) },
    { topic: "Portfolio Health", routes: routes.filter((route) => ["/portfolio", "/risk-heatmap", "/regulatory-coverage", "/control-health"].includes(route.route)).map((route) => route.route) },
    { topic: "Governance Discipline", routes: routes.filter((route) => ["/ai-governance", "/agentic-governance", "/ai-lifecycle", "/ai-risk", "/governance-engineering"].includes(route.route)).map((route) => route.route) }
  ].filter((group) => group.routes.length > 1);

  const knownNavigation = new Set([
    ...sidebarItems.map((item) => item.href),
    ...secondaryItems.map((item) => item.href),
    "/platform-review",
    "/platform-review/package",
    "/platform-review/export"
  ]);
  const orphanedRoutes = routes.filter((route) =>
    route.fileKind === "Page"
    && route.status !== "DEPRECATED"
    && !knownNavigation.has(route.route)
    && !route.route.startsWith("/systems/[slug]")
    && !route.route.includes("[")
    && !route.route.startsWith("/onboarding/repositories/")
  );

  return {
    sidebarGroups: sidebarNavigation,
    secondaryNavigation: secondaryItems,
    duplicateDestinations,
    sidebarDrift,
    orphanedRoutes
  };
}

function buildEvidenceInventory(operations: Awaited<ReturnType<typeof getGovernanceOperationsDashboard>>, evidenceHealth: Array<{ health: string; validation: string }>) {
  const sourcesWithIssues = operations.evidenceSources.filter((source) =>
    source.collectionStatus === "MISSING"
    || source.collectionStatus === "EXPIRED"
    || source.freshnessStatus !== "CURRENT"
    || source.connectorHealth !== "ON_TRACK"
  );
  const artifactsWithoutAssurance = operations.artifacts.filter((artifact) => artifact.assuranceRules.length === 0);
  const healthIssues = evidenceHealth.filter((record) => record.health !== "CURRENT" || record.validation !== "VALID");

  return {
    summary: {
      evidenceSources: operations.evidenceSources.length,
      sourceIssues: sourcesWithIssues.length,
      artifacts: operations.artifacts.length,
      snapshots: operations.artifacts.reduce((total, artifact) => total + artifact.snapshots.length, 0),
      runtimeEvidence: operations.runtimeEvidenceArtifacts.length,
      deploymentEvidence: operations.deploymentEvidenceArtifacts.length,
      validDeploymentEvidence: operations.kpis.validDeploymentEvidence,
      supabaseEvidence: operations.supabaseEvidenceArtifacts.length,
      validSupabaseEvidence: operations.kpis.validSupabaseEvidence,
      supabaseSnapshots: operations.supabaseEvidenceSnapshots.length,
      supabaseDrift: operations.supabaseDriftEvents.length,
      supabaseControlValidations: operations.supabaseControlValidations.length,
      mcpEvidence: operations.mcpEvidenceArtifacts.length,
      validMcpEvidence: operations.kpis.validMcpEvidence,
      notionEvidence: operations.notionEvidenceArtifacts.length,
      validNotionEvidence: operations.kpis.validNotionEvidence,
      secretEvidence: operations.secretEvidenceArtifacts.length,
      validSecretEvidence: operations.kpis.validSecretEvidence,
      assetDiscoveryRuns: operations.assetDiscoveryRuns.length,
      assetDiscoverySources: operations.assetDiscoverySources.length,
      assetDiscoveryFindings: operations.assetDiscoveryFindings.length,
      unknownAssets: operations.kpis.unknownAssets,
      untrackedAssets: operations.kpis.untrackedAssets,
      orphanedAssets: operations.kpis.orphanedAssets,
      missingAssets: operations.kpis.missingAssets,
      openDiscoveryFindings: operations.kpis.openDiscoveryFindings,
      validDiscoveryFindings: operations.assetDiscoveryFindings.filter((finding) => finding.validationStatus === "VALID").length,
      warningDiscoveryFindings: operations.assetDiscoveryFindings.filter((finding) => finding.validationStatus === "WARNING").length,
      invalidDiscoveryFindings: operations.assetDiscoveryFindings.filter((finding) => finding.validationStatus === "INVALID").length,
      highConfidenceDiscoveryFindings: operations.assetDiscoveryFindings.filter((finding) => finding.confidenceLevel === "HIGH").length,
      mediumConfidenceDiscoveryFindings: operations.assetDiscoveryFindings.filter((finding) => finding.confidenceLevel === "MEDIUM").length,
      lowConfidenceDiscoveryFindings: operations.assetDiscoveryFindings.filter((finding) => finding.confidenceLevel === "LOW").length,
      evidenceObjects: evidenceHealth.length,
      evidenceHealthIssues: healthIssues.length,
      controlCoverage: operations.kpis.controlCoverage,
      evidenceCoverage: operations.kpis.evidenceCoverage
    },
    sourcesWithIssues,
    artifactsWithoutAssurance,
    healthIssues,
    assetDiscoveryRuns: operations.assetDiscoveryRuns,
    assetDiscoverySources: operations.assetDiscoverySources,
    assetDiscoveryFindings: operations.assetDiscoveryFindings,
    coverageSummary: `${operations.kpis.controlCoverage}% control coverage and ${operations.kpis.evidenceCoverage}% evidence coverage across GitHub, logs, Portainer, Supabase, MCP, Notion, Secrets, Asset Discovery, and seeded evidence objects.`
  };
}

function buildArchitectureDrift(
  routes: RouteInventoryItem[],
  features: FeatureInventoryItem[],
  navigation: ReturnType<typeof buildNavigationInventory>,
  operatingModelMarkdown: string,
  uxReviewMarkdown: string
) {
  const drift = [
    {
      title: "Global sidebar remains above target size",
      status: navigation.sidebarDrift.length > 0 ? "WARNING" as const : "PASS" as const,
      detail: `${navigation.sidebarDrift.length} global sidebar items are outside the long-term hub recommendation from the UX architecture review.`
    },
    {
      title: "Duplicate workflow surfaces remain visible",
      status: navigation.duplicateDestinations.length > 0 ? "WARNING" as const : "PASS" as const,
      detail: `${navigation.duplicateDestinations.length} duplicate destination groups need future UX Refactor 2 decisions.`
    },
    {
      title: "Legacy route candidates remain",
      status: routes.some((route) => route.status === "DEPRECATED") ? "WARNING" as const : "PASS" as const,
      detail: `${routes.filter((route) => route.status === "DEPRECATED").length} routes are marked as deprecated candidates.`
    },
    {
      title: "Major evidence domains remain planned or partial",
      status: features.some((feature) => ["Notion Governance Connector", "Secrets Metadata Connector"].includes(feature.name) && ["Planned", "Partial"].includes(feature.status)) ? "WARNING" as const : "PASS" as const,
      detail: "UX Refactor 2 should wait until partial evidence domains mature, Asset Discovery runs, connector consistency cleanup is complete, and connector warning conditions are reviewed."
    },
    {
      title: "Operating model alignment",
      status: operatingModelMarkdown.includes("Evidence & Assurance is the canonical proof layer") && uxReviewMarkdown.includes("Evidence & Assurance") ? "PASS" as const : "WARNING" as const,
      detail: "The current review compares routes and navigation against the operating model and UX architecture review."
    }
  ];

  return drift;
}

function buildOpenIssues(input: {
  routes: RouteInventoryItem[];
  features: FeatureInventoryItem[];
  navigation: ReturnType<typeof buildNavigationInventory>;
  operations: Awaited<ReturnType<typeof getGovernanceOperationsDashboard>>;
  evidenceHealth: Array<{ health: string; validation: string; aiSystem: { name: string } }>;
  findings: Array<{ title: string; status: string; severity: string; aiSystem: { name: string } }>;
  exceptions: Array<{ exceptionId: string; expirationDate: Date; finding: { aiSystem: { name: string } } }>;
  architectureDrift: Array<{ title: string; status: "PASS" | "WARNING"; detail: string }>;
}): ReviewIssue[] {
  const plannedConnectors = input.features.filter((feature) =>
    ["Supabase Connector", "MCP Connector", "Notion Governance Connector", "Secrets Metadata Connector"].includes(feature.name)
    && feature.status === "Planned"
  );
  const evidenceSourceIssues = input.operations.evidenceSources.filter((source) =>
    source.collectionStatus === "MISSING"
    || source.freshnessStatus !== "CURRENT"
    || source.connectorHealth !== "ON_TRACK"
  );
  const assuranceWarnings = input.operations.assuranceRules.filter((rule) => rule.status !== "PASS");
  const routeReviewCount = input.routes.filter((route) => route.status === "REVIEW").length;
  const deprecatedRouteCount = input.routes.filter((route) => route.status === "DEPRECATED").length;
  const evidenceHealthIssues = input.evidenceHealth.filter((record) => record.health !== "CURRENT" || record.validation !== "VALID");
  const openFindings = input.findings.filter((finding) => finding.status === "OPEN");

  return [
    ...plannedConnectors.map((feature): ReviewIssue => ({
      title: `${feature.name} remains planned`,
      severity: "WARNING",
      category: "Connector Roadmap",
      detail: feature.futureWork,
      reviewPath: "/platform-review#features"
    })),
    ...(evidenceSourceIssues.length > 0 ? [{
      title: "Evidence sources need review",
      severity: "WARNING" as const,
      category: "Evidence",
      detail: `${evidenceSourceIssues.length} evidence sources are missing, stale, or off-track.`,
      reviewPath: "/platform-review#evidence"
    }] : []),
    ...(assuranceWarnings.length > 0 ? [{
      title: "Assurance warnings exist",
      severity: "WARNING" as const,
      category: "Assurance",
      detail: `${assuranceWarnings.length} assurance checks are warning or failing.`,
      reviewPath: "/evidence-assurance/assurance"
    }] : []),
    ...(input.operations.missingTraceabilityControls.length > 0 ? [{
      title: "Traceability gaps remain",
      severity: "WARNING" as const,
      category: "Traceability",
      detail: `${input.operations.missingTraceabilityControls.length} expected controls do not yet have artifact-backed traceability.`,
      reviewPath: "/evidence-assurance/traceability"
    }] : []),
    ...(routeReviewCount > 0 ? [{
      title: "Routes need IA review",
      severity: "WARNING" as const,
      category: "Navigation",
      detail: `${routeReviewCount} routes are active but flagged for future consolidation or ownership review.`,
      reviewPath: "/platform-review#routes"
    }] : []),
    ...(deprecatedRouteCount > 0 ? [{
      title: "Deprecated route candidates remain",
      severity: "WARNING" as const,
      category: "Navigation",
      detail: `${deprecatedRouteCount} legacy routes remain in the application tree.`,
      reviewPath: "/platform-review#routes"
    }] : []),
    ...(evidenceHealthIssues.length > 0 ? [{
      title: "Evidence health issues remain",
      severity: "WARNING" as const,
      category: "Evidence",
      detail: `${evidenceHealthIssues.length} evidence health records are not current and valid.`,
      reviewPath: "/evidence-assurance/health"
    }] : []),
    ...(openFindings.length > 0 ? [{
      title: "Open findings remain",
      severity: "WARNING" as const,
      category: "Findings",
      detail: `${openFindings.length} open findings remain across the portfolio.`,
      reviewPath: "/findings"
    }] : []),
    ...input.architectureDrift
      .filter((item) => item.status !== "PASS")
      .map((item): ReviewIssue => ({
        title: item.title,
        severity: item.status,
        category: "Architecture Drift",
        detail: item.detail,
        reviewPath: "/platform-review#drift"
      }))
  ];
}

const platformReviewPackageScreens = [
  { href: "/platform-review", title: "Platform Review Workspace", purpose: "Route, feature, navigation, evidence, drift, and issue inventory." },
  { href: "/platform-review/export", title: "Review Package Export", purpose: "Single review artifact, screenshot manifest, connector report, and future packaging plan." },
  { href: "/evidence-assurance", title: "Evidence & Assurance Hub", purpose: "Canonical proof layer and secondary navigation." },
  { href: "/evidence-assurance/deployments", title: "Deployment Evidence", purpose: "Portainer deployed-state evidence, drift baseline, or explicit source-gap evidence." },
  { href: "/evidence-assurance/governance-evidence", title: "Governance Evidence", purpose: "Notion human-governance evidence, approvals, reviews, committee records, ownership, and source gaps." },
  { href: "/evidence-assurance/secrets-governance", title: "Secrets Governance", purpose: "Secret inventory, rotation, ownership, usage mapping, and plaintext-prohibition evidence." },
  { href: "/evidence-assurance/asset-discovery", title: "Asset Discovery", purpose: "Known, unknown, untracked, orphaned, and missing asset discovery findings." },
  { href: "/deployment-evidence/DEP-TB-PORT-001", title: "Travel Brain Deployment Artifact", purpose: "Inspectable Portainer evidence chain." },
  { href: "/notion-evidence/NOTION-TB-APPROVAL-001", title: "Travel Brain Notion Approval Evidence", purpose: "Inspectable human-governance evidence chain or source gap." },
  { href: "/secret-evidence/SEC-TB-SECRETS-INVENTORY-001", title: "Travel Brain Secret Inventory Evidence", purpose: "Inspectable metadata-only secrets evidence chain." },
  { href: "/evidence-artifacts/ART-TB-GH-MANIFEST-001", title: "Manifest Artifact", purpose: "GitHub design-intent evidence and assurance." },
  { href: "/runtime-evidence/RTE-TB-EXEC-001", title: "Runtime Evidence", purpose: "Logs operational activity evidence." },
  { href: "/controls/AI-GOV-006", title: "Tool Permission Control", purpose: "Control-to-evidence traceability and governance story." },
  { href: "/governance-operations", title: "Governance Operations", purpose: "Connector, source, artifact, freshness, and assurance mechanics." },
  { href: "/auditor-workspace", title: "Auditor Workspace", purpose: "Audit traceability and evidence review context." },
  { href: "/administration", title: "Administration", purpose: "Onboarding, standards, libraries, and platform review access." }
];

function countBy<T, K extends keyof T>(items: T[], key: K) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}
