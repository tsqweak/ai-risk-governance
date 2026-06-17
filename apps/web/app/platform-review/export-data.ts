import { getPlatformReviewData } from "./review-data";

type PlatformReviewData = Awaited<ReturnType<typeof getPlatformReviewData>>;

export type ScreenshotCategory =
  | "Executive"
  | "Portfolio"
  | "Governance"
  | "Evidence & Assurance"
  | "Auditor"
  | "Administration"
  | "System Workspace"
  | "Control Detail"
  | "Artifact Detail"
  | "Connector"
  | "Review";

export type ScreenshotManifestItem = {
  route: string;
  pageTitle: string;
  category: ScreenshotCategory;
  importance: "Critical" | "High" | "Medium";
};

export type ConnectorStatusReport = {
  connector: string;
  status: string;
  maturity: string;
  evidenceTypes: string[];
  evidenceQuality: string;
  assuranceQuality: string;
  traceabilityQuality: string;
  openGaps: string[];
};

export type GovernanceStatusItem = {
  area: string;
  status: "PASS" | "WARNING";
  summary: string;
  gaps: string[];
};

export async function getPlatformReviewExportData() {
  const data = await getPlatformReviewData();
  const routeStatusCounts = countBy(data.routes, "status");
  const routeCategoryCounts = countBy(data.routes, "category");
  const screenshotManifest = buildScreenshotManifest();
  const connectorStatusReport = buildConnectorStatusReport(data);
  const governanceStatusReport = buildGovernanceStatusReport(data);
  const currentStateSummary = buildCurrentStateSummary(data, connectorStatusReport);
  const packageContents = [
    "Platform Review Report",
    "Route Inventory",
    "Feature Inventory",
    "Evidence Inventory",
    "Connector Inventory",
    "Open Issues",
    "Architecture Drift Review",
    "Navigation Inventory",
    "Screenshot Manifest",
    "Current State Summary",
    "Supabase Status",
    "MCP Status",
    "Notion Status",
    "Secrets Status",
    "Asset Discovery Status",
    "Connector Consistency Review",
    "Discovery Validation Summary",
    "Discovery Confidence",
    "Validated Findings",
    "Invalid Findings",
    "Discovery Findings",
    "Inventory Completeness",
    "Known vs Discovered Assets",
    "Governance Status Report",
    "Future ZIP Packaging Design"
  ];
  const futurePackagingDesign = buildFuturePackagingDesign();

  return {
    ...data,
    routeStatusCounts,
    routeCategoryCounts,
    screenshotManifest,
    connectorStatusReport,
    governanceStatusReport,
    currentStateSummary,
    packageContents,
    futurePackagingDesign,
    markdown: renderPlatformReviewPackageMarkdown({
      data,
      routeStatusCounts,
      routeCategoryCounts,
      screenshotManifest,
      connectorStatusReport,
      governanceStatusReport,
      currentStateSummary,
      packageContents,
      futurePackagingDesign
    })
  };
}

function buildCurrentStateSummary(data: PlatformReviewData, connectors: ConnectorStatusReport[]) {
  const plannedConnectors = connectors.filter((connector) => connector.status === "Planned").map((connector) => connector.connector);
  const hasValidDeploymentEvidence = data.evidenceInventory.summary.validDeploymentEvidence > 0;
  const hasValidSupabaseEvidence = data.evidenceInventory.summary.validSupabaseEvidence > 0;
  const hasValidMcpEvidence = data.evidenceInventory.summary.validMcpEvidence > 0;
  const hasValidSecretEvidence = data.evidenceInventory.summary.validSecretEvidence > 0;
  const plannedConnectorRisk = plannedConnectors.length > 0
    ? `${plannedConnectors.length} major evidence domain(s) remain planned: ${plannedConnectors.join(", ")}.`
    : "No major connector evidence domain remains planned; current risk shifts to MVP maturation, source warnings, and discovery coverage.";

  return {
    platformMaturity: "Level 3+ MVP, approaching Level 4 Operational for the Travel Brain evidence operations reference scope.",
    majorStrengths: [
      "Evidence & Assurance is the canonical proof layer.",
      "GitHub evidence collection supports real artifacts, snapshots, commit SHA, artifact hash, provenance, assurance, and traceability.",
      "Logs evidence provides inspectable sanitized runtime proof without collecting customer content or sensitive payloads.",
      hasValidDeploymentEvidence
        ? "Portainer evidence proves deployed-state reality for Travel Brain through read-only deployed-state collection."
        : "Portainer is healthy by local validation, and the platform preserves explicit gap evidence when the Codex runtime cannot reach the private LAN endpoint.",
      hasValidSupabaseEvidence
        ? "Supabase evidence now proves data-governance reality with real metadata, historical snapshots, drift review, control validation, and generated findings."
        : "Supabase connector capability is operational, and the current run preserves explicit source-gap evidence when read-only metadata access is unavailable.",
      hasValidMcpEvidence
        ? "MCP evidence now proves actual agent capability through server, tool, permission, authority, and capability metadata."
        : "MCP connector capability is implemented, and the current run preserves explicit source-gap evidence when MCP metadata is unavailable.",
      "Notion connector-ready evidence now makes human-governance source gaps explicit instead of inventing approval or committee records.",
      hasValidSecretEvidence
        ? "Secrets metadata evidence now proves inventory, rotation, ownership, usage mapping, and plaintext-prohibition boundaries without collecting secret values."
        : "Secrets metadata connector capability is implemented, and current gap evidence preserves plaintext-prohibition boundaries without collecting secret values.",
      "Asset Discovery now compares declared Travel Brain assets against repository, workflow, connector, documentation, runtime, and metadata signals to find forgotten assets.",
      "Control detail pages now connect governance story, evidence, validation, assurance, failure scenario, owner, and traceability.",
      "Platform Review centralizes route, feature, evidence, navigation, drift, and open-issue review."
    ],
    majorWeaknesses: [
      "Global navigation still exposes more destinations than the long-term hub architecture recommends.",
      "Legacy and review-candidate routes remain visible for compatibility.",
      ...(hasValidDeploymentEvidence ? [] : ["Current Portainer run has source-gap evidence only because Codex cannot reach the private LAN endpoint; this is a Private Infrastructure Access Limitation, not a Portainer outage."]),
      hasValidSupabaseEvidence
        ? "Supabase evidence is operational, though generated RLS or privileged-role findings may remain open until reviewed."
        : "Current Supabase run lacks read-only metadata access, so source-gap evidence is retained until configuration is restored.",
      hasValidMcpEvidence
        ? "MCP evidence includes real metadata but has tool-permission and authority classification warnings for policy review."
        : "Current MCP run lacks valid metadata collection, so source-gap evidence is retained until source access is restored.",
      "Notion human-governance evidence is connector-ready, but scoped governance content is unavailable until a shared Travel Brain source is configured.",
      hasValidSecretEvidence
        ? "Secrets metadata evidence is MVP and intentionally warning-heavy where rotation metadata or ownership is unknown."
        : "Current Secrets run lacks valid metadata collection, so gap evidence is retained and secret values remain prohibited.",
      "Asset Discovery is MVP and now validates findings before inventory counts; denied-only or unsupported inferences remain visible as invalid findings instead of trusted assets.",
      "The review package does not yet capture real screenshots or produce a ZIP bundle.",
      "Historical platform review runs are not yet persisted."
    ],
    topRisks: [
      `${data.openIssues.length} open platform review issue(s) require follow-up.`,
      `${data.reviewCounts.openFindings} open finding(s) remain across the governed portfolio.`,
      `${data.evidenceInventory.summary.openDiscoveryFindings} validated or warning-level asset discovery finding(s) need inventory review.`,
      plannedConnectorRisk,
      `${data.evidenceInventory.summary.sourceIssues} evidence source issue(s) remain visible.`
    ],
    topTechnicalDebt: [
      "Route ownership metadata is inferred from paths rather than explicitly declared.",
      "Feature maturity parsing depends on Feature Registry markdown structure.",
      "Automated screenshot capture and downloadable ZIP packaging are designed but not implemented.",
      "Review history is not persisted, so drift over time is not yet measurable."
    ],
    topUxIssues: [
      "Global sidebar remains above the recommended hub count.",
      "Evidence workflows still have legacy direct routes outside Evidence & Assurance.",
      "Auditor and Auditor Workspace surfaces need final consolidation.",
      "Governance Operations is still reachable as a standalone route while also belonging to Evidence & Assurance.",
      "Travel Brain Pilot and AI Manifest still need final placement under Administration/onboarding."
    ],
    currentFocus: `${data.featureRegistry.currentFocus.phase} - ${data.featureRegistry.currentFocus.feature}`,
    nextRecommendedWork: "Move to connector consistency cleanup, then UX Refactor 2 and Phase 10 Analytics & Trends."
  };
}

function buildConnectorStatusReport(data: PlatformReviewData): ConnectorStatusReport[] {
  const featureByName = new Map(data.featureRegistry.features.map((feature) => [feature.name, feature]));
  const sourceIssues = data.evidenceInventory.sourcesWithIssues;
  const sourceIssuesFor = (assetType: string) => sourceIssues.filter((source) => source.asset.assetType === assetType);
  const formattedSourceIssuesFor = (assetType: string) => sourceIssuesFor(assetType).map(formatSourceIssue);
  const feature = (name: string) => featureByName.get(name);
  const hasValidDeploymentEvidence = data.evidenceInventory.summary.validDeploymentEvidence > 0;

  const githubWarnings = [
    ...formattedSourceIssuesFor("GITHUB"),
    "Workflow assurance has a monitoring-reference warning."
  ];

  return [
    {
      connector: "GitHub",
      status: feature("GitHub Connector")?.status ?? "Operational",
      maturity: feature("GitHub Connector")?.maturity ?? "Level 4 - Operational",
      evidenceTypes: ["AI Governance.yaml", "Prompt files", "Policy files", "Workflow files", "Snapshots", "Drift events"],
      evidenceQuality: `${data.evidenceInventory.summary.artifacts} collected GitHub artifact(s) with ${data.evidenceInventory.summary.snapshots} preserved snapshot(s).`,
      assuranceQuality: `${data.featureRegistry.features.some((item) => item.name === "Explainable Assurance") ? "Explainable assurance is available." : "Assurance explanations need review."} ${githubWarnings.length ? `${githubWarnings.length} warning item(s) remain.` : "No GitHub warning items detected."}`,
      traceabilityQuality: "High. Artifacts link to sources, controls, assets, AI system context, collection, version, and provenance.",
      openGaps: githubWarnings
    },
    {
      connector: "Logs",
      status: feature("Logs Connector")?.status ?? "Operational",
      maturity: feature("Logs Connector")?.maturity ?? "Level 4 - Operational",
      evidenceTypes: ["Execution events", "Monitoring results", "Control results", "Audit events", "Correlation IDs", "Runtime hashes"],
      evidenceQuality: `${data.evidenceInventory.summary.runtimeEvidence} sanitized runtime evidence artifact(s) are available.`,
      assuranceQuality: "High for the Travel Brain reference scope. Runtime evidence explains why it was collected, which control depends on it, and what would fail if it disappeared.",
      traceabilityQuality: "High. Runtime evidence links to controls such as AI-AGENT-006, AI-GOV-010, and AUD-001.",
      openGaps: formattedSourceIssuesFor("LOGS")
    },
    {
      connector: "Portainer",
      status: feature("Portainer Connector")?.status ?? "MVP",
      maturity: feature("Portainer Connector")?.maturity ?? "Level 3 - MVP",
      evidenceTypes: ["Container metadata", "Deployment metadata", "Runtime metadata", "Image version", "Health status", "Deployment drift"],
      evidenceQuality: hasValidDeploymentEvidence
        ? `${data.evidenceInventory.summary.validDeploymentEvidence} valid deployed-state artifact(s) are available for Travel Brain.`
        : `${data.evidenceInventory.summary.deploymentEvidence} Portainer gap artifact(s) are available; current Codex run could not reach the private LAN endpoint even though local validation shows Portainer is healthy.`,
      assuranceQuality: hasValidDeploymentEvidence
        ? "Medium-high. Deployed-state evidence is inspectable and explainable for Travel Brain, but scheduled collection and deeper history remain future work."
        : "Warning. Connector logic exists, but Codex runtime access to private infrastructure is limited, so assurance should use the Portainer Evidence Export Pattern until direct runtime access is available.",
      traceabilityQuality: hasValidDeploymentEvidence
        ? "High for the reference artifact. Deployment evidence links to AI-LC-006, AI-GOV-010, OPS-001, and AUD-001."
        : "Partial. Gap evidence remains traceable to AI-LC-006, AI-GOV-010, OPS-001, and AUD-001; exported Portainer evidence should be attached to prove deployed-state reality.",
      openGaps: formattedSourceIssuesFor("PORTAINER")
    },
    {
      connector: "Supabase",
      status: feature("Supabase Connector")?.status ?? "Operational",
      maturity: feature("Supabase Connector")?.maturity ?? "Level 4 - Operational",
      evidenceTypes: ["Schema metadata", "Table inventory", "Column inventory", "RLS status", "Policy inventory", "Role inventory", "Extension inventory", "Database version", "Snapshots", "Drift events", "Control validations"],
      evidenceQuality: data.evidenceInventory.summary.validSupabaseEvidence > 0
        ? `${data.evidenceInventory.summary.validSupabaseEvidence} valid Supabase data-governance evidence artifact(s), ${data.evidenceInventory.summary.supabaseSnapshots} snapshot(s), and ${data.evidenceInventory.summary.supabaseDrift} drift event(s) are available for Travel Brain.`
        : `${data.evidenceInventory.summary.supabaseEvidence} Supabase gap artifact(s) are available; current run did not collect valid data-governance metadata.`,
      assuranceQuality: data.evidenceInventory.summary.validSupabaseEvidence > 0
        ? "High for the reference scope. Real metadata collection is inspectable and explainable with retained snapshots, drift records, control validation, and generated findings for warning/failure conditions."
        : "Warning. Supabase connector capability remains Operational, but the current read-only source is unavailable, so assurance is limited to explicit gap artifacts.",
      traceabilityQuality: data.evidenceInventory.summary.validSupabaseEvidence > 0
        ? "High. Supabase evidence links to GOV-001, PRI-001, SEC-001, AI-GOV-010, AUD-001, and OPS-001."
        : "Partial. Supabase gap evidence remains traceable to controls but does not prove current data-governance reality.",
      openGaps: formattedSourceIssuesFor("SUPABASE")
    },
    {
      connector: "MCP",
      status: feature("MCP Connector")?.status ?? "MVP",
      maturity: feature("MCP Connector")?.maturity ?? "Level 3 - MVP",
      evidenceTypes: ["MCP server inventory", "Tool registry", "Tool permissions", "Authority registry", "Capability inventory"],
      evidenceQuality: data.evidenceInventory.summary.validMcpEvidence > 0
        ? `${data.evidenceInventory.summary.validMcpEvidence} valid MCP governance evidence artifact(s) are available for Travel Brain.`
        : `${data.evidenceInventory.summary.mcpEvidence} MCP gap artifact(s) are available; current run did not collect valid MCP metadata.`,
      assuranceQuality: "Medium-high. MCP metadata is inspectable and explainable, with tool-permission and authority classification warnings preserved as assurance signals.",
      traceabilityQuality: "High. MCP evidence links to AI-GOV-006, AI-GOV-010, AI-AGENT-001, AI-AGENT-006, and AUD-001.",
      openGaps: formattedSourceIssuesFor("MCP")
    },
    {
      connector: "Notion",
      status: feature("Notion Governance Connector")?.status ?? "Partial",
      maturity: feature("Notion Governance Connector")?.maturity ?? "Level 2 - Prototype",
      evidenceTypes: ["Governance documentation", "Approval records", "Review records", "Committee decisions", "Ownership records"],
      evidenceQuality: data.evidenceInventory.summary.notionEvidence > 0
        ? `${data.evidenceInventory.summary.notionEvidence} Notion governance evidence artifact(s) or explicit gap artifact(s) are available for Travel Brain.`
        : "No Notion governance evidence artifacts are available.",
      assuranceQuality: data.evidenceInventory.sourcesWithIssues.some((source) => source.asset.assetType === "NOTION")
        ? "Partial. Connector-ready gap artifacts explain that human-governance records cannot be proven until scoped Travel Brain content is shared with the integration."
        : "Medium-high. Scoped Notion governance metadata is inspectable and explainable.",
      traceabilityQuality: "Partial. Notion evidence artifacts link to controls and source records, but real approval/review traceability requires scoped Notion access.",
      openGaps: formattedSourceIssuesFor("NOTION")
    },
    {
      connector: "Secrets",
      status: feature("Secrets Metadata Connector")?.status ?? "MVP",
      maturity: feature("Secrets Metadata Connector")?.maturity ?? "Level 3 - MVP",
      evidenceTypes: ["Secret inventory metadata", "Rotation evidence", "Ownership evidence", "Usage mapping", "Plaintext-prohibition boundary"],
      evidenceQuality: data.evidenceInventory.summary.validSecretEvidence > 0
        ? `${data.evidenceInventory.summary.validSecretEvidence} valid metadata-only secrets evidence artifact(s) are available for Travel Brain.`
        : `${data.evidenceInventory.summary.secretEvidence} secrets gap artifact(s) are available; current run did not collect valid secrets metadata.`,
      assuranceQuality: data.evidenceInventory.summary.secretEvidence > 0
        ? "Medium-high. Secrets evidence is inspectable and explainable, with warnings preserved when rotation metadata or ownership is unknown."
        : "Not available until metadata-only collection and validation exist.",
      traceabilityQuality: data.evidenceInventory.summary.secretEvidence > 0
        ? "High. Secrets evidence links to SEC-001, AUD-001, OPS-001, and AI-GOV-010 without storing secret material."
        : "Not available until evidence sources and artifacts exist.",
      openGaps: [
        ...formattedSourceIssuesFor("SECRETS"),
        ...(data.evidenceInventory.summary.secretEvidence > 0 ? [] : ["Collection, validation, assurance, and traceability are still planned."])
      ]
    }
  ];
}

function formatSourceIssue(source: PlatformReviewData["evidenceInventory"]["sourcesWithIssues"][number]) {
  const reason = connectorIssueReason(source);
  return `${source.sourceId}: ${source.collectionStatus}/${source.freshnessStatus}/${source.connectorHealth}${reason ? ` - ${reason}` : ""}`;
}

function connectorIssueReason(source: PlatformReviewData["evidenceInventory"]["sourcesWithIssues"][number] | string) {
  const sourceId = typeof source === "string" ? source : source.sourceId;
  const collectionStatus = typeof source === "string" ? "" : source.collectionStatus;
  if (collectionStatus === "MISSING" && sourceId.startsWith("SRC-TB-SUPABASE")) {
    return "read-only Supabase/Postgres source is unavailable in this run, so only explicit gap evidence exists";
  }
  if (collectionStatus === "MISSING" && sourceId.startsWith("SRC-TB-MCP")) {
    return "Travel Brain MCP source metadata is unavailable in this run, so only explicit gap evidence exists";
  }
  if (collectionStatus === "MISSING" && sourceId.startsWith("SRC-TB-SECRETS")) {
    return "metadata-only secrets source is unavailable in this run, so only explicit gap evidence exists";
  }
  const reasons: Record<string, string> = {
    "SRC-TB-PORT-CONTAINER": "Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for container metadata",
    "SRC-TB-PORT-DEPLOYMENT": "Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for deployment metadata",
    "SRC-TB-PORT-RUNTIME": "Private Infrastructure Access Limitation: Codex cannot reach the healthy private LAN Portainer endpoint, so use the Portainer Evidence Export Pattern for runtime health metadata",
    "SRC-TB-GH-REVIEWS": "review metadata is collected but stale and needs updated approval/change-review evidence",
    "SRC-TB-GH-WORKFLOWS": "workflow artifact is current, but monitoring-result linkage remains a review warning",
    "SRC-TB-SUPABASE-RLS": "real RLS metadata was collected and generated a policy review warning",
    "SRC-TB-SUPABASE-ACCESS": "real role metadata was collected and generated a privileged-role review warning",
    "SRC-TB-MCP-PERMISSIONS": "real MCP tool metadata was collected, but write-capable tools need explicit policy classification",
    "SRC-TB-MCP-AUTHORITY": "real MCP authority metadata was collected, but write-capable tools need explicit authority classification",
    "SRC-TB-SECRETS-ROTATION": "metadata-only collection found unknown or stale rotation metadata",
    "SRC-TB-SECRETS-OWNERSHIP": "metadata-only collection found missing ownership metadata",
    "SRC-TB-NOTION-PAGES": "connector is ready, but scoped Travel Brain governance pages are unavailable",
    "SRC-TB-NOTION-DATABASES": "connector is ready, but scoped Travel Brain governance databases are unavailable",
    "SRC-TB-NOTION-APPROVALS": "connector is ready, but scoped approval records are unavailable",
    "SRC-TB-NOTION-REVIEWS": "connector is ready, but scoped review records are unavailable",
    "SRC-TB-NOTION-COMMITTEE": "connector is ready, but scoped committee records are unavailable",
    "SRC-TB-NOTION-OWNERSHIP": "connector is ready, but scoped ownership records are unavailable"
  };
  return reasons[sourceId] ?? "";
}

function buildGovernanceStatusReport(data: PlatformReviewData): GovernanceStatusItem[] {
  const hasAssuranceWarnings = data.openIssues.some((issue) => issue.category === "Assurance");
  const hasTraceabilityGaps = data.openIssues.some((issue) => issue.category === "Traceability");
  const hasConnectorIssues = data.evidenceInventory.summary.sourceIssues > 0;
  const hasValidDeploymentEvidence = data.evidenceInventory.summary.validDeploymentEvidence > 0;
  const sourceIssueGapsFor = (assetType: string) =>
    data.evidenceInventory.sourcesWithIssues
      .filter((source) => source.asset.assetType === assetType)
      .map(formatSourceIssue);

  return [
    {
      area: "Controls",
      status: data.evidenceInventory.summary.controlCoverage >= 100 ? "PASS" : "WARNING",
      summary: `${data.evidenceInventory.summary.controlCoverage}% control coverage across artifact, runtime, deployment, and data-governance evidence paths.`,
      gaps: hasTraceabilityGaps ? ["Some required controls still need artifact-backed traceability."] : []
    },
    {
      area: "Evidence",
      status: data.evidenceInventory.summary.evidenceHealthIssues === 0 ? "PASS" : "WARNING",
      summary: `${data.evidenceInventory.summary.evidenceObjects} evidence health record(s), with ${data.evidenceInventory.summary.evidenceHealthIssues} issue(s).`,
      gaps: data.evidenceInventory.summary.evidenceHealthIssues ? ["Evidence health issues remain visible for follow-up."] : []
    },
    {
      area: "Artifacts",
      status: data.evidenceInventory.summary.artifacts > 0 ? "PASS" : "WARNING",
      summary: `${data.evidenceInventory.summary.artifacts} GitHub artifact(s), ${data.evidenceInventory.summary.runtimeEvidence} runtime artifact(s), ${data.evidenceInventory.summary.deploymentEvidence} deployment artifact(s), ${data.evidenceInventory.summary.supabaseEvidence} Supabase data-governance artifact(s), ${data.evidenceInventory.summary.mcpEvidence} MCP governance artifact(s), ${data.evidenceInventory.summary.notionEvidence} Notion human-governance artifact(s), and ${data.evidenceInventory.summary.secretEvidence} secrets metadata artifact(s).`,
      gaps: data.evidenceInventory.artifactsWithoutAssurance.length ? [`${data.evidenceInventory.artifactsWithoutAssurance.length} artifact(s) do not have assurance rules.`] : []
    },
    {
      area: "Assurance",
      status: hasAssuranceWarnings ? "WARNING" : "PASS",
      summary: "Assurance explanations exist for artifact-backed controls, runtime/deployment evidence, Supabase data-governance evidence, MCP governance evidence, Notion human-governance evidence or source gaps, and Secrets metadata evidence.",
      gaps: hasAssuranceWarnings ? ["At least one assurance warning remains."] : []
    },
    {
      area: "Traceability",
      status: hasTraceabilityGaps ? "WARNING" : "PASS",
      summary: "Control, evidence, source, collection, and version paths are available for the primary Travel Brain proof chain across GitHub, logs, Portainer, Supabase, MCP, Notion, and Secrets.",
      gaps: hasTraceabilityGaps ? ["Review missing traceability controls in Evidence & Assurance."] : []
    },
    {
      area: "Runtime Evidence",
      status: data.evidenceInventory.summary.runtimeEvidence > 0 ? "PASS" : "WARNING",
      summary: `${data.evidenceInventory.summary.runtimeEvidence} sanitized runtime evidence artifact(s) are inspectable.`,
      gaps: []
    },
    {
      area: "Deployment Evidence",
      status: hasValidDeploymentEvidence ? "PASS" : "WARNING",
      summary: hasValidDeploymentEvidence
        ? `${data.evidenceInventory.summary.validDeploymentEvidence} valid deployment evidence artifact(s) are inspectable.`
        : `${data.evidenceInventory.summary.deploymentEvidence} Portainer gap artifact(s) are inspectable. Local validation shows Portainer is healthy; Codex cannot reach the private LAN endpoint, so this is a Private Infrastructure Access Limitation.`,
      gaps: sourceIssueGapsFor("PORTAINER")
    },
    {
      area: "Data Governance Evidence",
      status: data.evidenceInventory.summary.validSupabaseEvidence > 0 ? "PASS" : "WARNING",
      summary: data.evidenceInventory.summary.validSupabaseEvidence > 0
        ? `${data.evidenceInventory.summary.validSupabaseEvidence} valid Supabase metadata evidence artifact(s) are inspectable.`
        : `${data.evidenceInventory.summary.supabaseEvidence} Supabase gap artifact(s) are inspectable, but no valid data-governance artifact was collected in this run.`,
      gaps: sourceIssueGapsFor("SUPABASE")
    },
    {
      area: "MCP Governance Evidence",
      status: data.evidenceInventory.summary.validMcpEvidence > 0 ? "PASS" : "WARNING",
      summary: data.evidenceInventory.summary.validMcpEvidence > 0
        ? `${data.evidenceInventory.summary.validMcpEvidence} valid MCP metadata evidence artifact(s) are inspectable.`
        : `${data.evidenceInventory.summary.mcpEvidence} MCP gap artifact(s) are inspectable, but no valid MCP metadata artifact was collected in this run.`,
      gaps: sourceIssueGapsFor("MCP")
    },
    {
      area: "Human Governance Evidence",
      status: sourceIssueGapsFor("NOTION").length === 0 && data.evidenceInventory.summary.notionEvidence > 0 ? "PASS" : "WARNING",
      summary: `${data.evidenceInventory.summary.notionEvidence} Notion governance evidence artifact(s) or gap artifact(s) are inspectable.`,
      gaps: sourceIssueGapsFor("NOTION")
    },
    {
      area: "Secrets Governance Evidence",
      status: data.evidenceInventory.summary.validSecretEvidence > 0 ? "PASS" : "WARNING",
      summary: data.evidenceInventory.summary.validSecretEvidence > 0
        ? `${data.evidenceInventory.summary.validSecretEvidence} valid metadata-only secrets governance evidence artifact(s) are inspectable.`
        : `${data.evidenceInventory.summary.secretEvidence} secrets gap artifact(s) are inspectable, but no valid secrets metadata artifact was collected in this run.`,
      gaps: sourceIssueGapsFor("SECRETS")
    },
    {
      area: "Asset Discovery",
      status: data.evidenceInventory.summary.assetDiscoveryRuns > 0 ? "PASS" : "WARNING",
      summary: `${data.evidenceInventory.summary.assetDiscoveryRuns} discovery run(s), ${data.evidenceInventory.summary.assetDiscoverySources} source(s), and ${data.evidenceInventory.summary.assetDiscoveryFindings} finding(s): ${data.evidenceInventory.summary.validDiscoveryFindings} valid, ${data.evidenceInventory.summary.warningDiscoveryFindings} warning, and ${data.evidenceInventory.summary.invalidDiscoveryFindings} invalid.`,
      gaps: data.evidenceInventory.assetDiscoveryFindings
        .filter((finding) => finding.validationStatus !== "INVALID" && (finding.status === "OPEN" || finding.status === "REVIEW_REQUIRED"))
        .map((finding) => `${finding.findingId}: ${finding.validationStatus}/${finding.disposition}/${finding.assetName}`)
    },
    {
      area: "Connector Health",
      status: hasConnectorIssues ? "WARNING" : "PASS",
      summary: `${data.evidenceInventory.summary.evidenceSources} evidence source(s), with ${data.evidenceInventory.summary.sourceIssues} source issue(s).`,
      gaps: hasConnectorIssues ? data.evidenceInventory.sourcesWithIssues.map(formatSourceIssue) : []
    },
    {
      area: "Open Findings",
      status: data.reviewCounts.openFindings === 0 ? "PASS" : "WARNING",
      summary: `${data.reviewCounts.openFindings} open finding(s) remain across the portfolio.`,
      gaps: data.reviewCounts.openFindings ? ["Open findings should remain visible in the review package for risk and audit follow-up."] : []
    },
    {
      area: "Open Exceptions",
      status: data.reviewCounts.activeExceptions === 0 ? "PASS" : "WARNING",
      summary: `${data.reviewCounts.activeExceptions} active exception(s) remain across the portfolio.`,
      gaps: data.reviewCounts.activeExceptions ? ["Active exceptions should be reviewed for expiry and compensating control context."] : []
    }
  ];
}

function buildScreenshotManifest(): ScreenshotManifestItem[] {
  return [
    { route: "/executive", pageTitle: "Executive Overview", category: "Executive", importance: "Critical" },
    { route: "/portfolio", pageTitle: "Portfolio", category: "Portfolio", importance: "Critical" },
    { route: "/governance", pageTitle: "Governance", category: "Governance", importance: "High" },
    { route: "/evidence-assurance", pageTitle: "Evidence & Assurance Hub", category: "Evidence & Assurance", importance: "Critical" },
    { route: "/evidence-assurance/artifacts", pageTitle: "Evidence Artifacts", category: "Evidence & Assurance", importance: "High" },
    { route: "/evidence-assurance/runtime", pageTitle: "Runtime Evidence", category: "Connector", importance: "High" },
    { route: "/evidence-assurance/deployments", pageTitle: "Deployment Evidence", category: "Connector", importance: "High" },
    { route: "/evidence-assurance/governance-evidence", pageTitle: "Governance Evidence", category: "Connector", importance: "High" },
    { route: "/evidence-assurance/secrets-governance", pageTitle: "Secrets Governance", category: "Connector", importance: "High" },
    { route: "/evidence-assurance/asset-discovery", pageTitle: "Asset Discovery", category: "Evidence & Assurance", importance: "High" },
    { route: "/evidence-assurance/traceability", pageTitle: "Evidence Traceability", category: "Evidence & Assurance", importance: "High" },
    { route: "/auditor-workspace", pageTitle: "Auditor Workspace", category: "Auditor", importance: "High" },
    { route: "/administration", pageTitle: "Administration", category: "Administration", importance: "Medium" },
    { route: "/systems/travel-brain", pageTitle: "Travel Brain Workspace", category: "System Workspace", importance: "Critical" },
    { route: "/systems/travel-brain/evidence", pageTitle: "Travel Brain Evidence", category: "System Workspace", importance: "High" },
    { route: "/controls/AI-GOV-006", pageTitle: "Tool Permission Control", category: "Control Detail", importance: "Critical" },
    { route: "/evidence-artifacts/ART-TB-GH-MANIFEST-001", pageTitle: "Travel Brain Manifest Artifact", category: "Artifact Detail", importance: "Critical" },
    { route: "/runtime-evidence/RTE-TB-EXEC-001", pageTitle: "Travel Brain Runtime Evidence", category: "Artifact Detail", importance: "High" },
    { route: "/deployment-evidence/DEP-TB-PORT-001", pageTitle: "Travel Brain Deployment Evidence", category: "Artifact Detail", importance: "High" },
    { route: "/notion-evidence/NOTION-TB-APPROVAL-001", pageTitle: "Travel Brain Notion Approval Evidence", category: "Artifact Detail", importance: "High" },
    { route: "/secret-evidence/SEC-TB-SECRETS-INVENTORY-001", pageTitle: "Travel Brain Secret Inventory Evidence", category: "Artifact Detail", importance: "High" },
    { route: "/platform-review", pageTitle: "Platform Review Workspace", category: "Review", importance: "Critical" },
    { route: "/platform-review/package", pageTitle: "Platform Review Package", category: "Review", importance: "High" },
    { route: "/platform-review/export", pageTitle: "Platform Review Export", category: "Review", importance: "Critical" }
  ];
}

function buildFuturePackagingDesign() {
  return [
    "Create a server-side package builder that emits Markdown, JSON inventories, and screenshot manifest from one shared data contract.",
    "Add an authenticated screenshot runner that reads the screenshot manifest and captures desktop/mobile PNGs for each important route.",
    "Create `platform-review.zip` with `/reports/PLATFORM_REVIEW_PACKAGE.md`, `/inventories/*.json`, `/screenshots/*.png`, and `/metadata/package-manifest.json`.",
    "Keep package contents read-only and sanitized. Do not include secrets, tokens, credentials, customer content, or sensitive payloads.",
    "Optimize the Markdown artifact for direct upload into ChatGPT as a single context-transfer file."
  ];
}

function renderPlatformReviewPackageMarkdown(input: {
  data: PlatformReviewData;
  routeStatusCounts: Record<string, number>;
  routeCategoryCounts: Record<string, number>;
  screenshotManifest: ScreenshotManifestItem[];
  connectorStatusReport: ConnectorStatusReport[];
  governanceStatusReport: GovernanceStatusItem[];
  currentStateSummary: ReturnType<typeof buildCurrentStateSummary>;
  packageContents: string[];
  futurePackagingDesign: string[];
}) {
  const { data, routeStatusCounts, routeCategoryCounts, screenshotManifest, connectorStatusReport, governanceStatusReport, currentStateSummary, packageContents, futurePackagingDesign } = input;
  const supabaseConnector = connectorStatusReport.find((connector) => connector.connector === "Supabase");
  const mcpConnector = connectorStatusReport.find((connector) => connector.connector === "MCP");
  const notionConnector = connectorStatusReport.find((connector) => connector.connector === "Notion");
  const secretsConnector = connectorStatusReport.find((connector) => connector.connector === "Secrets");
  const githubIssueCount = data.evidenceInventory.sourcesWithIssues.filter((source) => source.asset.assetType === "GITHUB").length;
  const logsIssueCount = data.evidenceInventory.sourcesWithIssues.filter((source) => source.asset.assetType === "LOGS").length;
  const portainerIssueCount = data.evidenceInventory.sourcesWithIssues.filter((source) => source.asset.assetType === "PORTAINER").length;
  const supabaseIssueCount = data.evidenceInventory.sourcesWithIssues.filter((source) => source.asset.assetType === "SUPABASE").length;
  const mcpIssueCount = data.evidenceInventory.sourcesWithIssues.filter((source) => source.asset.assetType === "MCP").length;
  const notionIssueCount = data.evidenceInventory.sourcesWithIssues.filter((source) => source.asset.assetType === "NOTION").length;
  const secretsIssueCount = data.evidenceInventory.sourcesWithIssues.filter((source) => source.asset.assetType === "SECRETS").length;
  const hasValidDeploymentEvidence = data.evidenceInventory.summary.validDeploymentEvidence > 0;
  const latestDiscoveryRun = data.evidenceInventory.assetDiscoveryRuns[0];
  const discoveryFindings = data.evidenceInventory.assetDiscoveryFindings;
  const validatedDiscoveryFindings = discoveryFindings.filter((finding) => finding.validationStatus !== "INVALID");
  const invalidDiscoveryFindings = discoveryFindings.filter((finding) => finding.validationStatus === "INVALID");
  const discoveryOpenFindings = validatedDiscoveryFindings.filter((finding) => finding.status === "OPEN" || finding.status === "REVIEW_REQUIRED");

  return [
    "# Platform Review Package",
    "",
    "Purpose: single-file platform review artifact for ChatGPT, CIO, CRO, Internal Audit, and Risk Committee review.",
    "",
    `Generated: ${data.generatedAt.toISOString()}`,
    "",
    "## Package Contents",
    bulletList(packageContents),
    "",
    "## Current State Summary",
    `Platform maturity: ${currentStateSummary.platformMaturity}`,
    "",
    `Current focus: ${currentStateSummary.currentFocus}`,
    "",
    `Next recommended work: ${currentStateSummary.nextRecommendedWork}`,
    "",
    "### Major Strengths",
    bulletList(currentStateSummary.majorStrengths),
    "",
    "### Major Weaknesses",
    bulletList(currentStateSummary.majorWeaknesses),
    "",
    "### Top Risks",
    bulletList(currentStateSummary.topRisks),
    "",
    "### Top Technical Debt",
    bulletList(currentStateSummary.topTechnicalDebt),
    "",
    "### Top UX Issues",
    bulletList(currentStateSummary.topUxIssues),
    "",
    "## Supabase Status",
    markdownTable(["Item", "Status"], [
      ["Connector status", supabaseConnector?.status ?? "Operational"],
      ["Connector maturity", supabaseConnector?.maturity ?? "Level 4 - Operational"],
      ["Governance metadata collection", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? "Collected from real read-only Supabase/Postgres metadata" : "Source unavailable in this run; explicit gap artifacts created"],
      ["Evidence artifacts", data.evidenceInventory.summary.supabaseEvidence],
      ["Valid evidence artifacts", data.evidenceInventory.summary.validSupabaseEvidence],
      ["Historical snapshots", data.evidenceInventory.summary.supabaseSnapshots],
      ["Drift events", data.evidenceInventory.summary.supabaseDrift],
      ["Control validations", data.evidenceInventory.summary.supabaseControlValidations],
      ["Source issues", supabaseIssueCount],
      ["Schema inventory", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? "Collected" : "Not collected in current run"],
      ["Table inventory", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? "Collected" : "Not collected in current run"],
      ["RLS status", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? supabaseIssueCount ? "Collected with review warnings" : "Collected" : "Not collected in current run"],
      ["Policy inventory", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? supabaseIssueCount ? "Collected with review warnings" : "Collected" : "Not collected in current run"],
      ["Role inventory", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? supabaseIssueCount ? "Collected with review warnings" : "Collected" : "Not collected in current run"],
      ["Extension inventory", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? "Collected" : "Not collected in current run"],
      ["Database version", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? "Collected" : "Not collected in current run"],
      ["Privacy boundary", "No row data, customer content, secrets, credentials, tokens, API keys, or sensitive payloads collected"],
      ["Recommended action", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? "Review any generated Supabase findings and continue scheduled data-governance collection" : "Restore read-only Supabase/Postgres metadata configuration and rerun collection"]
    ]),
    "",
    "## MCP Status",
    markdownTable(["Item", "Status"], [
      ["Connector status", mcpConnector?.status ?? "Not found"],
      ["Connector maturity", mcpConnector?.maturity ?? "Not found"],
      ["Governance metadata collection", data.evidenceInventory.summary.validMcpEvidence > 0 ? "Collected from real Travel Brain MCP source metadata" : "Source unavailable in this run; explicit gap artifacts created"],
      ["Evidence artifacts", data.evidenceInventory.summary.mcpEvidence],
      ["Valid evidence artifacts", data.evidenceInventory.summary.validMcpEvidence],
      ["Source issues", mcpIssueCount],
      ["Server inventory", data.evidenceInventory.summary.validMcpEvidence > 0 ? "Collected" : "Not collected in current run"],
      ["Tool registry", data.evidenceInventory.summary.validMcpEvidence > 0 ? "Collected" : "Not collected in current run"],
      ["Tool permissions", data.evidenceInventory.summary.validMcpEvidence > 0 ? mcpIssueCount ? "Collected with review warnings" : "Collected" : "Not collected in current run"],
      ["Authority registry", data.evidenceInventory.summary.validMcpEvidence > 0 ? mcpIssueCount ? "Collected with review warnings" : "Collected" : "Not collected in current run"],
      ["Capability inventory", data.evidenceInventory.summary.validMcpEvidence > 0 ? "Collected" : "Not collected in current run"],
      ["Privacy boundary", "No prompts, customer content, tool inputs, tool outputs, secrets, credentials, or sensitive payloads collected"],
      ["Recommended action", "Review unclassified write-capable MCP tools and update governance/tool-policy.yaml before moving MCP toward Operational"]
    ]),
    "",
    "## Notion Status",
    markdownTable(["Item", "Status"], [
      ["Connector status", notionConnector?.status ?? "Not found"],
      ["Connector maturity", notionConnector?.maturity ?? "Not found"],
      ["Governance metadata collection", data.evidenceInventory.summary.validNotionEvidence > 0 ? "Collected from scoped Notion governance metadata" : "Connector-ready; scoped Travel Brain governance content unavailable; explicit gap artifacts created"],
      ["Evidence artifacts", data.evidenceInventory.summary.notionEvidence],
      ["Valid evidence artifacts", data.evidenceInventory.summary.validNotionEvidence],
      ["Source issues", notionIssueCount],
      ["Governance pages", data.evidenceInventory.summary.validNotionEvidence > 0 ? "Collected" : "Not collected"],
      ["Governance databases", data.evidenceInventory.summary.validNotionEvidence > 0 ? "Collected" : "Not collected"],
      ["Approval records", data.evidenceInventory.summary.validNotionEvidence > 0 ? "Collected" : "Not collected"],
      ["Review records", data.evidenceInventory.summary.validNotionEvidence > 0 ? "Collected" : "Not collected"],
      ["Committee records", data.evidenceInventory.summary.validNotionEvidence > 0 ? "Collected" : "Not collected"],
      ["Ownership records", data.evidenceInventory.summary.validNotionEvidence > 0 ? "Collected" : "Not collected"],
      ["Privacy boundary", "No personal notes, unrelated workspace content, customer content, secrets, credentials, or unnecessary page body content collected"],
      ["Recommended action", "Share a scoped Travel Brain Notion page or database with the integration and configure the token/source ID, then rerun collection"]
    ]),
    "",
    "## Secrets Status",
    markdownTable(["Item", "Status"], [
      ["Connector status", secretsConnector?.status ?? "Not found"],
      ["Connector maturity", secretsConnector?.maturity ?? "Not found"],
      ["Governance metadata collection", data.evidenceInventory.summary.validSecretEvidence > 0 ? "Collected from metadata-only Travel Brain secret source names and declared secret records" : "Source unavailable in this run; explicit gap artifacts created"],
      ["Evidence artifacts", data.evidenceInventory.summary.secretEvidence],
      ["Valid evidence artifacts", data.evidenceInventory.summary.validSecretEvidence],
      ["Source issues", secretsIssueCount],
      ["Secret inventory", data.evidenceInventory.summary.secretEvidence > 0 ? "Collected" : "Not collected"],
      ["Rotation evidence", secretsIssueCount ? "Collected with review warnings" : "Collected"],
      ["Ownership evidence", secretsIssueCount ? "Collected with review warnings" : "Collected"],
      ["Usage mapping", data.evidenceInventory.summary.secretEvidence > 0 ? "Collected" : "Not collected"],
      ["Supported sources", "Environment Variables, GitHub Secrets, Supabase Secrets, Portainer Secrets, Local Secret Stores"],
      ["Privacy boundary", "No secret values, tokens, passwords, API key values, certificates, private keys, connection strings, customer content, or sensitive payloads collected, stored, displayed, logged, hashed, exported, or persisted"],
      ["Recommended action", secretsIssueCount ? "Resolve stale rotation metadata, unknown rotation metadata, disconnected source metadata, and missing ownership warnings before moving Secrets toward Operational" : "Continue scheduled metadata-only collection and add newly discovered source names to governance review"]
    ]),
    "",
    "## Connector Consistency Review",
    markdownTable(["Connector", "Reviewed Warning Sources", "Cleanup Decision", "Rationale"], [
      ["GitHub", "SRC-TB-GH-REVIEWS; SRC-TB-GH-WORKFLOWS", githubIssueCount ? "Warnings retained" : "No warnings retained", "Review metadata remains stale and workflow monitoring linkage remains a real assurance warning; repository artifacts themselves are valid and current."],
      ["Logs", "Runtime log sources", logsIssueCount ? "Warnings retained" : "No warnings retained", logsIssueCount ? "Runtime source warnings remain visible." : "Execution, monitoring, control-result, and audit-event metadata are validated/current/on-track."],
      ["Portainer", "SRC-TB-PORT-CONTAINER; SRC-TB-PORT-DEPLOYMENT; SRC-TB-PORT-RUNTIME", hasValidDeploymentEvidence ? "Source warnings removed for current run" : "Warnings retained as Private Infrastructure Access Limitation", hasValidDeploymentEvidence ? "Read-only deployed-state metadata was collected and source rows are validated/current/on-track." : "Local validation confirms Portainer is healthy at the private LAN endpoint, but Codex runtime cannot reach that endpoint. Use the Portainer Evidence Export Pattern for governance collection instead of classifying this as a Portainer outage."],
      ["Supabase", "SRC-TB-SUPABASE-ACCESS; SRC-TB-SUPABASE-RLS", supabaseIssueCount ? "Warnings retained" : "No warnings retained", data.evidenceInventory.summary.validSupabaseEvidence > 0 ? supabaseIssueCount ? "Real metadata was collected, but RLS policy and privileged-role validation generated review warnings." : "Schema, inventory, RLS, access, audit, snapshot, drift, and control validation evidence are on track." : "Current run has explicit gap evidence because the read-only Supabase/Postgres source is unavailable; this is a real source issue, not stale seed data."],
      ["MCP", "SRC-TB-MCP-AUTHORITY; SRC-TB-MCP-PERMISSIONS", mcpIssueCount ? "Warnings retained" : "No warnings retained", mcpIssueCount ? "Real MCP metadata was collected, but write-capable tools still need explicit policy and authority classification." : "Tool registry, permission, authority, and capability metadata are validated/current/on-track."],
      ["Secrets", "SRC-TB-SECRETS-OWNERSHIP; SRC-TB-SECRETS-ROTATION", secretsIssueCount ? "Warnings retained" : "No warnings retained", secretsIssueCount ? "Metadata-only evidence is collected, but stale or unknown rotation metadata and missing ownership metadata remain real governance warnings." : "Inventory, rotation, ownership, and usage metadata are validated/current/on-track without collecting secret values."],
      ["Notion", "SRC-TB-NOTION-*", notionIssueCount ? "Warnings retained with wording cleanup" : "No warnings retained", notionIssueCount ? "Connector model and gap artifacts work; scoped Travel Brain governance content is unavailable, so warnings now describe a governed content-source gap rather than a connector failure." : "Scoped Notion governance metadata is collected and on track."]
    ]),
    "",
    "## Asset Discovery Status",
    markdownTable(["Item", "Status"], [
      ["Engine status", data.featureRegistry.features.find((feature) => feature.name === "Asset Discovery Engine")?.status ?? "Not found"],
      ["Engine maturity", data.featureRegistry.features.find((feature) => feature.name === "Asset Discovery Engine")?.maturity ?? "Not found"],
      ["Latest run", latestDiscoveryRun?.runId ?? "No run recorded"],
      ["Discovery sources", data.evidenceInventory.summary.assetDiscoverySources],
      ["Discovery findings", data.evidenceInventory.summary.assetDiscoveryFindings],
      ["Valid findings", data.evidenceInventory.summary.validDiscoveryFindings],
      ["Warning findings", data.evidenceInventory.summary.warningDiscoveryFindings],
      ["Invalid findings", data.evidenceInventory.summary.invalidDiscoveryFindings],
      ["Open/review findings", data.evidenceInventory.summary.openDiscoveryFindings],
      ["Inventory completeness", latestDiscoveryRun ? `${latestDiscoveryRun.inventoryCompleteness}%` : "Not available"],
      ["Known assets", latestDiscoveryRun?.knownAssetCount ?? 0],
      ["Discovered assets", latestDiscoveryRun?.discoveredAssetCount ?? 0],
      ["Unknown assets", data.evidenceInventory.summary.unknownAssets],
      ["Untracked assets", data.evidenceInventory.summary.untrackedAssets],
      ["Orphaned assets", data.evidenceInventory.summary.orphanedAssets],
      ["Missing assets", data.evidenceInventory.summary.missingAssets],
      ["Discovery boundary", "Compares manifest declarations against repository, workflow, configuration, documentation, connector metadata, runtime metadata, and secrets metadata without requiring AI Governance.yaml to be complete"],
      ["Recommended action", latestDiscoveryRun?.recommendedAction ?? "Run discovery against Travel Brain"]
    ]),
    "",
    "## Discovery Validation Summary",
    markdownTable(["Metric", "Value"], [
      ["Valid findings", data.evidenceInventory.summary.validDiscoveryFindings],
      ["Warning findings", data.evidenceInventory.summary.warningDiscoveryFindings],
      ["Invalid findings", data.evidenceInventory.summary.invalidDiscoveryFindings],
      ["Validation basis", "Findings are counted in inventory completeness only when validation status is VALID or WARNING. INVALID findings remain visible for review but are excluded from inventory counts."],
      ["Primary cleanup result", "Denied-tool-only and disconnected conceptual source findings are downgraded to INVALID instead of trusted as discovered assets."]
    ]),
    "",
    "## Discovery Confidence",
    markdownTable(["Level", "Count", "Definition"], [
      ["High", data.evidenceInventory.summary.highConfidenceDiscoveryFindings, "Direct configuration, manifest, workflow, or connector evidence."],
      ["Medium", data.evidenceInventory.summary.mediumConfidenceDiscoveryFindings, "Multiple indirect references or source-gap evidence that still needs reviewer confirmation."],
      ["Low", data.evidenceInventory.summary.lowConfidenceDiscoveryFindings, "Weak inference, denied-only reference, or disconnected conceptual source."]
    ]),
    "",
    "## Validated Findings",
    validatedDiscoveryFindings.length
      ? markdownTable(["Finding", "Validation", "Confidence", "Asset", "Source File", "Source Asset", "Rule", "Evidence"], validatedDiscoveryFindings.map((finding) => [
        finding.findingId,
        finding.validationStatus,
        `${finding.confidenceLevel}/${finding.confidence}%`,
        finding.assetName,
        finding.sourceFile,
        finding.sourceAsset,
        finding.discoveryRule,
        finding.evidence
      ]))
      : "No validated discovery findings recorded.",
    "",
    "## Invalid Findings",
    invalidDiscoveryFindings.length
      ? markdownTable(["Finding", "Asset", "Source File", "Evidence", "Invalid Reason"], invalidDiscoveryFindings.map((finding) => [
        finding.findingId,
        finding.assetName,
        finding.sourceFile,
        finding.evidence,
        finding.invalidReason
      ]))
      : "No invalid discovery findings recorded.",
    "",
    "## Discovery Findings",
    discoveryFindings.length
      ? markdownTable(["Finding", "Type", "Disposition", "Validation", "Asset", "Source", "Confidence", "Status", "Recommended Action"], discoveryFindings.map((finding) => [
        finding.findingId,
        finding.findingType,
        finding.disposition,
        finding.validationStatus,
        finding.assetName,
        finding.sourceLabel,
        `${finding.confidenceLevel}/${finding.confidence}%`,
        finding.status,
        finding.recommendedAction
      ]))
      : "No asset discovery findings recorded.",
    "",
    "## Inventory Completeness",
    markdownTable(["Metric", "Value"], [
      ["Validated declared findings", validatedDiscoveryFindings.filter((finding) => finding.declared).length],
      ["Validated discovered findings", validatedDiscoveryFindings.filter((finding) => finding.discovered).length],
      ["Validated tracked findings", validatedDiscoveryFindings.filter((finding) => finding.tracked).length],
      ["Untracked findings", data.evidenceInventory.summary.untrackedAssets],
      ["Unknown findings", data.evidenceInventory.summary.unknownAssets],
      ["Missing findings", data.evidenceInventory.summary.missingAssets],
      ["Orphaned findings", data.evidenceInventory.summary.orphanedAssets],
      ["Open or review findings", discoveryOpenFindings.length],
      ["Inventory completeness", latestDiscoveryRun ? `${latestDiscoveryRun.inventoryCompleteness}%` : "Not available"]
    ]),
    "",
    "## Known vs Discovered Assets",
    validatedDiscoveryFindings.length
      ? markdownTable(["Asset", "Type", "Declared", "Discovered", "Tracked", "Disposition", "Validation", "Evidence"], validatedDiscoveryFindings.map((finding) => [
        finding.assetName,
        finding.assetType,
        finding.declared ? "Yes" : "No",
        finding.discovered ? "Yes" : "No",
        finding.tracked ? "Yes" : "No",
        finding.disposition,
        finding.validationStatus,
        finding.evidence
      ]))
      : "No validated asset discovery comparison recorded.",
    "",
    "## Route Inventory",
    markdownTable(["Route", "Type", "Category", "Status"], data.routes.map((route) => [route.route, route.pageType, route.category, route.status])),
    "",
    "### Route Counts By Status",
    markdownTable(["Status", "Count"], Object.entries(routeStatusCounts)),
    "",
    "### Route Counts By Category",
    markdownTable(["Category", "Count"], Object.entries(routeCategoryCounts)),
    "",
    "## Feature Inventory",
    "### Feature Counts By Status",
    markdownTable(["Status", "Count"], Object.entries(data.featureRegistry.countsByStatus)),
    "",
    markdownTable(["Feature", "Phase", "Status", "Maturity", "Dependencies"], data.featureRegistry.features.map((feature) => [feature.name, feature.phase, feature.status, feature.maturity, feature.dependencies])),
    "",
    "## Evidence Inventory",
    markdownTable(["Metric", "Value"], Object.entries(data.evidenceInventory.summary).map(([key, value]) => [key, String(value)])),
    "",
    "### Evidence Source Issues",
    data.evidenceInventory.sourcesWithIssues.length
      ? markdownTable(["Source", "Asset", "Collection", "Freshness", "Connector", "Rationale"], data.evidenceInventory.sourcesWithIssues.map((source) => [source.sourceId, source.asset.assetType, source.collectionStatus, source.freshnessStatus, source.connectorHealth, connectorIssueReason(source) || "Review source health and evidence mapping."]))
      : "No evidence source issues detected.",
    "",
    "## Connector Inventory",
    markdownTable(["Connector", "Status", "Maturity", "Evidence Quality", "Assurance Quality", "Traceability Quality", "Open Gaps"], connectorStatusReport.map((connector) => [
      connector.connector,
      connector.status,
      connector.maturity,
      connector.evidenceQuality,
      connector.assuranceQuality,
      connector.traceabilityQuality,
      connector.openGaps.join("; ") || "None"
    ])),
    "",
    "## Governance Status Report",
    markdownTable(["Area", "Status", "Summary", "Gaps"], governanceStatusReport.map((item) => [item.area, item.status, item.summary, item.gaps.join("; ") || "None"])),
    "",
    "## Navigation Inventory",
    "### Sidebar Structure",
    markdownTable(["Group", "Item", "Route"], data.navigation.sidebarGroups.flatMap((group) => group.items.map((item) => [group.title, item.label, item.href]))),
    "",
    "### Evidence & Assurance Secondary Navigation",
    markdownTable(["Label", "Route"], data.navigation.secondaryNavigation.map((item) => [item.label, item.href])),
    "",
    "### Duplicate Destinations",
    data.navigation.duplicateDestinations.length
      ? markdownTable(["Topic", "Routes"], data.navigation.duplicateDestinations.map((group) => [group.topic, group.routes.join(", ")]))
      : "No duplicate destination groups detected.",
    "",
    "## Architecture Drift Review",
    markdownTable(["Review Item", "Status", "Detail"], data.architectureDrift.map((item) => [item.title, item.status, item.detail])),
    "",
    "## Open Issues",
    markdownTable(["Category", "Severity", "Issue", "Detail", "Review Path"], data.openIssues.map((issue) => [issue.category, issue.severity, issue.title, issue.detail, issue.reviewPath])),
    "",
    "## Screenshot Manifest",
    "This is a screenshot plan only. Actual screenshot capture is intentionally future work.",
    "",
    markdownTable(["Route", "Page Title", "Category", "Importance"], screenshotManifest.map((screen) => [screen.route, screen.pageTitle, screen.category, screen.importance])),
    "",
    "## Future ZIP Packaging Design",
    bulletList(futurePackagingDesign),
    "",
    "## Upload Guidance",
    "Use this Markdown file as the single ChatGPT review artifact. It is intentionally self-contained and avoids requiring manual screenshot/PDF context transfer."
  ].join("\n");
}

function markdownTable(headers: string[], rows: Array<Array<string | number>>) {
  return [
    `| ${headers.map(escapeCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => escapeCell(String(cell))).join(" | ")} |`)
  ].join("\n");
}

function bulletList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function escapeCell(input: string) {
  return input.replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

function countBy<T, K extends keyof T>(items: T[], key: K) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}
