export const evidenceAssuranceNavGroups = [
  {
    title: "Overview",
    items: [["/evidence-assurance", "Overview"]]
  },
  {
    title: "Review",
    items: [
      ["/evidence-assurance/repository", "Repository"],
      ["/evidence-assurance/health", "Health"],
      ["/evidence-assurance/assurance", "Assurance"],
      ["/evidence-assurance/traceability", "Traceability"],
      ["/evidence-assurance/packages", "Packages"]
    ]
  },
  {
    title: "Sources",
    items: [
      ["/evidence-assurance/sources", "Sources"],
      ["/evidence-assurance/asset-discovery", "Asset Discovery"],
      ["/governance-operations", "Operations"]
    ]
  },
  {
    title: "Artifacts",
    items: [
      ["/evidence-assurance/artifacts", "Artifacts"],
      ["/evidence-assurance/snapshots", "Snapshots"],
      ["/evidence-assurance/drift", "Drift"]
    ]
  },
  {
    title: "Evidence Domains",
    items: [
      ["/evidence-assurance/runtime", "Runtime"],
      ["/evidence-assurance/deployments", "Deployments"],
      ["/evidence-assurance/data-governance", "Data Governance"],
      ["/evidence-assurance/mcp-governance", "MCP Governance"],
      ["/evidence-assurance/governance-evidence", "Governance Evidence"],
      ["/evidence-assurance/secrets-governance", "Secrets Governance"]
    ]
  }
] as const;

export const evidenceAssuranceNav: ReadonlyArray<readonly [string, string]> = [
  ["/evidence-assurance", "Overview"],
  ["/evidence-assurance/repository", "Repository"],
  ["/evidence-assurance/health", "Health"],
  ["/evidence-assurance/assurance", "Assurance"],
  ["/evidence-assurance/traceability", "Traceability"],
  ["/evidence-assurance/packages", "Packages"],
  ["/evidence-assurance/sources", "Sources"],
  ["/evidence-assurance/asset-discovery", "Asset Discovery"],
  ["/governance-operations", "Operations"],
  ["/evidence-assurance/artifacts", "Artifacts"],
  ["/evidence-assurance/snapshots", "Snapshots"],
  ["/evidence-assurance/drift", "Drift"],
  ["/evidence-assurance/runtime", "Runtime"],
  ["/evidence-assurance/deployments", "Deployments"],
  ["/evidence-assurance/data-governance", "Data Governance"],
  ["/evidence-assurance/mcp-governance", "MCP Governance"],
  ["/evidence-assurance/governance-evidence", "Governance Evidence"],
  ["/evidence-assurance/secrets-governance", "Secrets Governance"]
];
