# Platform Review Report

Phase: 9D.5 - Platform Review Agent

Purpose: summarize the current platform state, architecture concerns, UX concerns,
evidence concerns, and recommended next actions for internal review.

## Current State

The AI-Risk-Governance platform now includes an internal Platform Review Agent at
`/platform-review`.

The review workspace inventories:

- current routes
- feature maturity from `FEATURE_REGISTRY.md`
- sidebar and secondary navigation
- duplicate destinations
- evidence sources and evidence artifacts
- runtime evidence
- deployment evidence
- evidence health
- architecture drift
- open review issues
- key screens for review packages

The platform currently has 71 page or route-handler entries in `apps/web/app`.
This includes the main AI System Workspace, Evidence & Assurance Hub, evidence
artifact viewers, runtime evidence viewers, deployment evidence viewers, control
pages, auditor pages, governance operations, onboarding, and the new platform
review workspace.

## Strengths

- The AI System Workspace remains the strongest organizing object.
- Evidence & Assurance is now the canonical proof layer.
- GitHub evidence collection is operational against the real Travel Brain
  repository.
- Logs evidence is operational for sanitized runtime evidence.
- Portainer evidence is MVP with real deployed-state collection for Travel Brain.
- Control pages provide strong traceability from controls to evidence,
  validation, assurance, findings, exceptions, and governance stories.
- Evidence artifacts are inspectable and preserve provenance, hashes, snapshots,
  and drift context.
- The Feature Registry now provides a source of truth for capability maturity.
- The Platform Review Agent reduces manual route discovery and review-package
  preparation.

## Weaknesses

- The global sidebar still exposes more destinations than the long-term UX
  architecture recommends.
- Duplicate evidence, auditor, portfolio, and governance-discipline routes remain
  visible while UX Refactor 2 is intentionally deferred.
- Supabase, MCP, Notion, and Secrets connectors remain planned.
- Some evidence health issues remain intentionally visible for non-Travel Brain
  reference systems.
- The screenshot package is currently a review bundle and key-screen checklist,
  not an automated screenshot capture engine.
- The Platform Review Agent does not yet persist historical review runs.

## Architecture Concerns

- Route count and page sprawl are now high enough that continued manual review is
  brittle.
- Several routes are drill-downs or legacy candidates but still exist as direct
  pages.
- Governance Operations remains available as a standalone route, even though the
  long-term architecture treats it as part of the Evidence & Assurance proof
  layer.
- `/auditor` and `/auditor-workspace` still both exist; the UX Architecture
  Review recommends consolidating on Auditor Workspace.
- `/projects/travel-brain` and `/regulatory-mapping` remain legacy route
  candidates.

## UX Concerns

- The platform still mixes hubs, workbenches, object detail pages, pilots,
  standards, and legacy surfaces in the broader route tree.
- Evidence surfaces are better organized under Evidence & Assurance, but legacy
  direct routes remain for compatibility.
- Travel Brain Pilot is still a visible operational/pilot page rather than fully
  absorbed into Administration and onboarding.
- AI Manifest remains visible as an operational route, although the UX review
  recommends treating it as an onboarding standard and registry.
- UX Refactor 2 should still wait until Supabase, MCP, Notion, and Secrets
  evidence domains exist.

## Evidence Concerns

- GitHub, Logs, and Portainer now demonstrate the intended evidence maturity
  model:

```text
Metadata -> Evidence Source -> Evidence Artifact -> Assurance -> Explainable Assurance
```

- Supabase, MCP, Notion, and Secrets have not yet reached the same loop of
  collection, validation, assurance, and traceability.
- Human governance evidence such as approvals, committee decisions, exceptions,
  and risk acceptances still requires accountable review; it should not be
  fully automated.
- Deployment drift is recorded, but historical drift comparison and scheduled
  collection are still future work.
- Evidence package generation is present, but automated screenshot and review
  package export are not yet implemented.

## Recommended Next Actions

1. Use `/platform-review` before each major implementation phase.
2. Use `/platform-review/package` when preparing review screenshots or external
   ChatGPT analysis.
3. Keep UX Refactor 2 deferred until Supabase, MCP, Notion, and Secrets evidence
   domains mature.
4. Build the Supabase connector next, following the established GitHub, Logs, and
   Portainer evidence patterns.
5. Add automated screenshot capture and downloadable review package export to the
   Platform Review Agent.
6. Add route ownership metadata so the review agent can distinguish intentional
   drill-downs from true orphaned pages.
7. Add historical review runs so architecture drift can be compared over time.

## Review Principle

The Platform Review Agent is not a governance capability and not a connector. It
is an internal platform self-assessment capability.

It should answer:

```text
What exists?
What changed?
What is duplicated?
What is incomplete?
What is missing?
What should be reviewed?
```

The goal is to reduce manual review friction while preserving the operating
model:

```text
AI System -> Assets -> Evidence Sources -> Evidence Artifacts -> Assurance -> Governance
```
