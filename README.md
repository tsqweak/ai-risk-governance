# AI Risk Governance

A TypeScript monorepo for an AI Risk Governance platform aimed at financial institutions.

Phase 1 focuses on a bank-grade **AI System Registry** for existing and future AI systems. An AI System can include models, agents, prompts, tools, APIs, data sources, workflows, vendors, controls, evidence, and human oversight. The platform ships with seed data for **Travel Brain**.

Phase 2 adds a **Regulatory Mapping Engine** that traces Regulations → Requirements → Controls → Evidence → AI Systems.

Phase 3A adds a **Continuous Control Monitoring Engine** that executes governance checks, records test runs, generates findings, and tracks approved exceptions.

Phase 3B adds executive, auditor, and risk dashboards for control health, findings, exceptions, AI-system monitoring, and portfolio heatmaps.

Phase 4 makes evidence a first-class governance object with evidence requirements, evidence health, validation, expiration monitoring, and evidence-based findings.

Phase 5 adds an executive-grade AI Governance Command Center with portfolio, regulatory coverage, governance committee, auditor workspace, and board-style reporting views.

## Stack

- Next.js web app
- Node/TypeScript API
- SQLite
- Prisma ORM
- Tailwind CSS
- Shared TypeScript multi-dimensional risk classification engine

## Monorepo Layout

```text
apps/
  web/      Next.js demo application
  api/      Express API service
packages/
  db/       Prisma schema, client, seed data
  risk-engine/
            Risk classification logic shared by web and API
```

## Setup

```bash
cd ai-risk-governance
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The web app runs at [http://localhost:3000](http://localhost:3000).

To run the standalone API:

```bash
npm run dev:api
```

The API runs at [http://localhost:4000](http://localhost:4000).

## Phase 1 Walkthrough

- Open the inventory page to see AI systems, lifecycle status, environment, risk tier, ownership, next review, and control health.
- Open **Travel Brain** at `/systems/travel-brain` to review overview, ownership, risk assessment, data and jurisdictions, models/tools/vendors, controls, evidence, audit trail, and learning notes.
- Visit onboarding at `/onboarding` to see the intake workflow for existing and future AI systems.
- Visit regulatory coverage at `/regulatory` to inspect regulation coverage percentages and open gaps.
- Visit a regulation detail page such as `/regulatory/osfi-e-23` to inspect educational summaries, requirements, controls, evidence expectations, and linked AI systems.
- Visit auditor traceability at `/traceability` to follow Regulation → Requirement → Control → AI System.
- Visit continuous monitoring at `/monitoring` to review control tests, latest runs, findings, exceptions, and educational governance explanations.
- Visit `/control-health`, `/findings`, `/exceptions`, and `/risk-heatmap` for executive and risk monitoring dashboards.
- Visit `/systems/travel-brain/monitoring` for an AI-system-specific monitoring view.
- Visit `/evidence` and evidence detail pages such as `/evidence/EV-TB-RISK-001` to inspect evidence health, ownership, approvals, linked controls, and linked regulations.
- Visit `/executive`, `/portfolio`, `/regulatory-coverage`, `/governance-committee`, and `/reports/executive` for executive and committee-ready portfolio storytelling.
- Visit the control library to browse controls across governance, model risk, privacy, security, third party risk, explainability, auditability, human oversight, and operational resilience.
- Visit regulatory mapping for EU AI Act, NIST AI RMF, SR 11-7, GLBA, FFIEC, and OCC-style governance obligations.
- Visit evidence status to see collection and review health.
- Visit auditor view for a control-by-control audit readiness perspective.

## Travel Brain Seed Profile

- Customer-facing
- Recommendation-only
- Uses personal travel data
- Business owner: Sarah Chen
- Technology owner: Michael Thompson
- Risk owner: Russell
- Executive sponsor: David Kim
- Jurisdictions: Canada, US, UK, EU, Japan
- Lifecycle status: production
- Environment: production
- No autonomous actions
- No financial transaction execution
- Medium risk

## Useful Commands

```bash
npm run lint
npm run typecheck
npm run build
APP_URL=http://localhost:3000 npm run smoke
```
