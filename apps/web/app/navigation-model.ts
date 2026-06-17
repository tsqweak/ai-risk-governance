export const sidebarNavigation = [
  {
    title: "Governance OS",
    items: [
      { href: "/executive", label: "Executive", icon: "BriefcaseBusiness" },
      { href: "/portfolio", label: "Portfolio", icon: "Gauge" },
      { href: "/", label: "AI Systems", icon: "Database" },
      { href: "/governance", label: "Governance", icon: "ShieldCheck" },
      { href: "/evidence-assurance", label: "Evidence & Assurance", icon: "ClipboardCheck" },
      { href: "/auditor-workspace", label: "Auditor Workspace", icon: "FileSearch" },
      { href: "/administration", label: "Administration", icon: "UserPlus" }
    ]
  }
] as const;

export const recommendedTopLevelHubs = [
  "Executive",
  "Portfolio",
  "AI Systems",
  "Governance",
  "Evidence & Assurance",
  "Auditor Workspace",
  "Administration"
] as const;

export const executiveSecondaryNav = [
  ["/executive", "Overview"],
  ["/portfolio", "Portfolio Health"],
  ["/regulatory-coverage", "Compliance Posture"],
  ["/governance", "Governance Health"],
  ["/ai-risk", "Material Risks"],
  ["/governance-committee", "Decisions Required"],
  ["/reports/executive", "Board Report"]
] as const;

export const portfolioSecondaryNav = [
  ["/portfolio", "Overview"],
  ["/", "AI Systems"],
  ["/risk-heatmap", "Risk Heatmap"],
  ["/regulatory-coverage", "Regulatory Coverage"],
  ["/control-health", "Control Health"],
  ["/evidence-health", "Evidence Health"],
  ["/portfolio#action-required", "Action Required"],
  ["/portfolio#trends", "Trends"]
] as const;

export const aiSystemsSecondaryNav = [
  ["/", "Inventory"],
  ["/evidence-assurance/asset-discovery", "Discovery Gaps"],
  ["/onboarding", "Onboarding Status"],
  ["/#system-workspaces", "System Workspaces"],
  ["/#owners", "Owners"],
  ["/#lifecycle", "Lifecycle"]
] as const;

export const governanceSecondaryNav = [
  ["/governance", "Overview"],
  ["/controls", "Controls"],
  ["/governance#control-owner-queue", "Control Owner Queue"],
  ["/regulatory", "Compliance"],
  ["/monitoring", "Monitoring"],
  ["/ai-lifecycle", "Lifecycle"],
  ["/ai-risk", "Risk"],
  ["/ai-governance", "AI Governance"],
  ["/agentic-governance", "Agentic Governance"],
  ["/governance-engineering", "Governance Engineering"],
  ["/governance-committee", "Committee Decisions"]
] as const;

export const auditorSecondaryNav = [
  ["/auditor-workspace#scope", "Scope"],
  ["/auditor-workspace#prove-control", "Prove a Control"],
  ["/traceability", "Traceability"],
  ["/auditor-workspace#evidence-review", "Evidence Review"],
  ["/evidence-assurance/artifacts", "Artifact Verification"],
  ["/audit-packages", "Audit Package"]
] as const;

export const administrationNavigationGroups = [
  {
    title: "Onboarding",
    items: [
      ["/administration", "Overview"],
      ["/onboarding", "Onboarding"],
      ["/onboarding/repositories", "Repository Discovery"],
      ["/onboarding/travel-brain-pilot", "Pilot Assessments"]
    ]
  },
  {
    title: "Standards",
    items: [
      ["/governance-manifest/registry", "Manifest Registry"],
      ["/governance-manifest", "AI Manifest"],
      ["/governance-framework", "Framework"]
    ]
  },
  {
    title: "Platform Operations",
    items: [
      ["/platform-review", "Platform Review"],
      ["/platform-review/package", "Review Package"],
      ["/platform-review/export", "Export"],
      ["/evidence-assurance/sources", "Connector Sources"]
    ]
  },
  {
    title: "Libraries",
    items: [
      ["/controls", "Controls"],
      ["/regulatory", "Regulatory Library"]
    ]
  },
  {
    title: "Support",
    items: [
      ["/walkthroughs", "Walkthroughs"]
    ]
  }
] as const;
