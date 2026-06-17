import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@airg/db", "@airg/risk-engine"],
  serverExternalPackages: ["@prisma/client"],
  async redirects() {
    return [
      { source: "/executive/board-report", destination: "/reports/executive", permanent: false },
      { source: "/executive/portfolio-health", destination: "/portfolio", permanent: false },
      { source: "/executive/material-gaps", destination: "/findings", permanent: false },
      { source: "/executive/decisions-required", destination: "/governance-committee", permanent: false },

      { source: "/portfolio/ai-systems", destination: "/", permanent: false },
      { source: "/portfolio/risk-heatmap", destination: "/risk-heatmap", permanent: false },
      { source: "/portfolio/regulatory-coverage", destination: "/regulatory-coverage", permanent: false },
      { source: "/portfolio/control-health", destination: "/control-health", permanent: false },
      { source: "/portfolio/evidence-health", destination: "/evidence-health", permanent: false },
      { source: "/portfolio/findings", destination: "/findings", permanent: false },
      { source: "/portfolio/exceptions", destination: "/exceptions", permanent: false },

      { source: "/governance/risk-management", destination: "/ai-risk", permanent: false },
      { source: "/governance/regulatory-compliance", destination: "/regulatory-coverage", permanent: false },
      { source: "/governance/control-monitoring", destination: "/monitoring", permanent: false },
      { source: "/governance/evidence-repository", destination: "/evidence-repository", permanent: false },
      { source: "/governance/ai-lifecycle", destination: "/ai-lifecycle", permanent: false },

      { source: "/auditor-workspace/audit-dashboard", destination: "/auditor", permanent: false },
      { source: "/auditor-workspace/traceability", destination: "/traceability", permanent: false },
      { source: "/auditor-workspace/evidence-library", destination: "/evidence-repository", permanent: false },
      { source: "/auditor-workspace/evidence-health", destination: "/evidence-health", permanent: false },
      { source: "/auditor-workspace/evidence-packages", destination: "/audit-packages", permanent: false },
      { source: "/auditor-workspace/control-testing", destination: "/control-health", permanent: false },
      { source: "/auditor-workspace/findings", destination: "/findings", permanent: false },
      { source: "/auditor-workspace/exceptions", destination: "/exceptions", permanent: false },

      { source: "/governance-committee/approval-queue", destination: "/governance-committee", permanent: false },
      { source: "/governance-committee/production-readiness", destination: "/ai-lifecycle", permanent: false },
      { source: "/governance-committee/risk-acceptances", destination: "/ai-risk", permanent: false },
      { source: "/governance-committee/authority-changes", destination: "/agentic-governance", permanent: false },
      { source: "/governance-committee/lifecycle-decisions", destination: "/ai-lifecycle", permanent: false },

      { source: "/administration/onboarding", destination: "/onboarding", permanent: false },
      { source: "/administration/system-intake", destination: "/onboarding", permanent: false },
      { source: "/administration/control-libraries", destination: "/controls", permanent: false },
      { source: "/administration/regulatory-libraries", destination: "/regulatory", permanent: false }
    ];
  }
};

export default nextConfig;
