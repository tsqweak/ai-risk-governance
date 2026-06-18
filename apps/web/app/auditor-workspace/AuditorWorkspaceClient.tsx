"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Bookmark,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FileCheck2,
  GitBranch,
  Home,
  Menu,
  PackageCheck,
  Search,
  ShieldAlert
} from "lucide-react";

export type ProofRequirement = {
  id: string;
  label: string;
  category: string;
  status: "Available" | "Missing";
};

export type ProofArtifact = {
  id: string;
  title: string;
  connector: string;
  source: string;
  proofQuality: ProofQuality;
  provenance: string;
  collectedAt: string;
  validationStatus: string;
  hashStatus: string;
  snapshotStatus: string;
  driftStatus: string;
  proves: string;
  doesNotProve: string;
  evidenceHref: string | null;
  evidenceAccess: "Exact artifact" | "Source only" | "Unavailable";
};

export type ProofQuality =
  | "Inspectable Evidence Artifact"
  | "Human Governance Record"
  | "Source Metadata Only"
  | "Missing Evidence"
  | "Gap Artifact / Limitation";

export type ControlProofFile = {
  id: string;
  auditScope: string;
  packageId: string;
  packageTitle: string;
  controlId: string;
  controlTitle: string;
  controlObjective: string;
  testExpectation: string;
  controlOwner: string;
  systemsInScope: string[];
  requiredEvidence: ProofRequirement[];
  availableEvidence: ProofArtifact[];
  missingEvidence: ProofRequirement[];
  evidenceSufficiency: string;
  assuranceJudgment: string;
  assuranceScore: number;
  exceptions: Array<{ id: string; label: string; status: string; expires: string }>;
  packageStatus: string;
  reviewerStatus: string;
  openBlockers: string[];
  proofStatus: "Blocked" | "Needs Review" | "Ready";
  primaryAction: string;
  auditTrail: string[];
};

type ProofStage = "Scope" | "Control" | "Evidence" | "Verify" | "Package";
type EvidenceRequestDraft = {
  requirement: string;
  category: string;
  reason: string;
  artifactTitle?: string;
  source?: string;
};

const proofStages: ProofStage[] = ["Scope", "Control", "Evidence", "Verify", "Package"];
const lifecycle = ["Draft", "Scope Confirmed", "Evidence Complete", "Exceptions Reviewed", "Ready for Export", "Archived"];

export function AuditorWorkspaceClient({ proofFiles }: { proofFiles: ControlProofFile[] }) {
  const defaultFile = proofFiles.find((file) => file.systemsInScope.includes("Travel Brain") && file.controlId === "AI-GOV-006")
    ?? proofFiles.find((file) => file.systemsInScope.includes("Travel Brain") && file.controlId === "AI-GOV-003")
    ?? proofFiles.find((file) => file.systemsInScope.includes("Travel Brain") && file.controlId === "AI-GOV-010")
    ?? proofFiles.find((file) => file.systemsInScope.includes("Travel Brain") && file.controlId === "AUD-001")
    ?? proofFiles.find((file) => file.systemsInScope.includes("Travel Brain"))
    ?? proofFiles[0];
  const [stage, setStage] = useState<ProofStage>("Scope");
  const [selectedId, setSelectedId] = useState(defaultFile?.id ?? "");
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [requestDraft, setRequestDraft] = useState<EvidenceRequestDraft | null>(null);
  const [queuedRequest, setQueuedRequest] = useState<EvidenceRequestDraft | null>(null);
  const selected = proofFiles.find((file) => file.id === selectedId) ?? defaultFile;
  const selectedArtifact = selected?.availableEvidence.find((artifact) => artifact.id === selectedArtifactId) ?? null;
  const systemsInScope = useMemo(() => unique(proofFiles.flatMap((file) => file.systemsInScope)).filter(Boolean), [proofFiles]);
  const travelBrainControls = useMemo(() => proofFiles.filter((file) => file.systemsInScope.includes("Travel Brain")), [proofFiles]);
  const visibleControls = useMemo(() => {
    const candidates = travelBrainControls.length ? travelBrainControls : proofFiles;
    return [...candidates].sort((a, b) => scenarioPriority(a) - scenarioPriority(b));
  }, [proofFiles, travelBrainControls]);

  if (!selected) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[#eef3f7] text-sm font-semibold text-[#526174]">
        No reference audit controls are available.
      </div>
    );
  }

  return (
    <div data-auditor-workspace="root" className="fixed inset-0 z-50 flex min-w-0 flex-col overflow-hidden bg-[#eef3f7] text-[13px] text-[#172033]">
      <TopAppBar />
      <BreadcrumbBar />
      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2.5">
        <div className="flex h-9 shrink-0 items-center justify-between rounded border border-[#ccd5e1] bg-white px-3">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="shrink-0 text-[15px] font-semibold text-[#111827]">Prove this control</h1>
            <span className="h-4 w-px bg-[#d7dee8]" />
            <span className="hidden truncate text-xs font-medium text-[#526174] min-[1180px]:inline">
              Guided audit proof flow · Scope, control, evidence, artifact verification, and package decision
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#526174]">
            <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">Reference audit scope</span>
            <span className="hidden min-[1280px]:inline">{selected.packageId}</span>
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1 text-[#27364a]">{travelBrainControls.length} Travel Brain controls</span>
          </div>
        </div>

        <section data-auditor-workspace="layout" className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_220px] overflow-hidden rounded border border-[#ccd5e1] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] min-[1366px]:grid-cols-[320px_minmax(0,1fr)_240px] min-[1500px]:grid-cols-[340px_minmax(0,1fr)_260px]">
          <LeftRail
            files={visibleControls}
            selected={selected}
            systemsInScope={systemsInScope}
            onSelect={(id) => {
              setSelectedId(id);
              setSelectedArtifactId(null);
              setStage("Control");
            }}
          />
          <GuidedProofPanel
            file={selected}
            stage={stage}
            selectedArtifact={selectedArtifact}
            onStage={setStage}
            onRequestEvidence={(draft) => {
              setQueuedRequest(null);
              setRequestDraft(draft);
            }}
            onArtifactSelect={(artifactId) => {
              setSelectedArtifactId(artifactId);
              setStage("Verify");
            }}
          />
          <ProofSummaryRail file={selected} stage={stage} />
        </section>

        {stage === "Verify" && selectedArtifact ? <ArtifactVerificationPanel artifact={selectedArtifact} onContinue={() => setStage("Package")} /> : null}
      </main>
      {requestDraft ? (
        <EvidenceRequestDrawer
          file={selected}
          draft={requestDraft}
          queued={queuedRequest}
          onClose={() => setRequestDraft(null)}
          onCreate={() => setQueuedRequest(requestDraft)}
        />
      ) : null}
    </div>
  );
}

function TopAppBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 bg-[#061b2c] px-3 text-white shadow-sm min-[1500px]:gap-4 min-[1500px]:px-4">
      <button className="inline-flex h-7 w-7 items-center justify-center rounded text-white/90 hover:bg-white/10" type="button" aria-label="Menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex shrink-0 items-center gap-2 font-semibold">
        <Building2 className="h-5 w-5" />
        <span>AI Governance Audit Workspace</span>
      </div>
      <button className="flex h-8 shrink-0 items-center gap-2 rounded border border-white/20 bg-white/5 px-2.5 text-sm font-medium text-white/90 min-[1500px]:px-3" type="button">
        Q2 AI Governance Audit
        <ChevronDown className="h-4 w-4" />
      </button>
      <div className="mx-auto flex h-8 min-w-[240px] max-w-[520px] flex-1 items-center gap-2 rounded border border-white/20 bg-white/5 px-3 text-sm text-white/70">
        <Search className="h-4 w-4" />
        <span className="truncate">Search controls, evidence, artifacts, exceptions...</span>
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[11px]">⌘K</span>
      </div>
      <TopUtility icon={Bookmark} label="Bookmarks" />
      <TopUtility icon={ClipboardCheck} label="Workpapers" badge="8" />
      <TopUtility icon={Bell} label="Requests" badge="3" />
      <TopUtility icon={CircleHelp} label="Help" />
      <div className="flex shrink-0 items-center gap-2 border-l border-white/15 pl-2 min-[1500px]:pl-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-semibold text-[#061b2c]">IA</span>
        <div className="hidden leading-tight min-[1366px]:block">
          <div className="text-xs font-semibold">Internal Audit</div>
          <div className="text-[10px] text-white/65">Assurance Reviewer</div>
        </div>
      </div>
    </header>
  );
}

function BreadcrumbBar() {
  return (
    <nav className="flex h-10 shrink-0 items-center gap-2 border-b border-[#cfd7e3] bg-white px-4 text-xs font-semibold text-[#27364a]">
      <Home className="h-4 w-4 text-[#526174]" />
      <ChevronRight className="h-4 w-4 text-[#8a95a6]" />
      <span>Auditor Workspace</span>
      <ChevronRight className="h-4 w-4 text-[#8a95a6]" />
      <span className="text-[#111827]">Prove a Control</span>
    </nav>
  );
}

function LeftRail({
  files,
  selected,
  systemsInScope,
  onSelect
}: {
  files: ControlProofFile[];
  selected: ControlProofFile;
  systemsInScope: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="flex min-h-0 min-w-0 flex-col border-r border-[#cfd7e3] bg-white">
      <div className="shrink-0 border-b border-[#cfd7e3] p-3">
        <div className="text-xs font-semibold uppercase text-[#344256]">Audit scope</div>
        <div className="mt-2 rounded border border-[#d8e0ea] bg-[#fbfcfe] p-2">
          <div className="text-xs font-semibold text-[#111827]">Q2 AI Governance Audit</div>
          <div className="mt-1 text-[11px] leading-4 text-[#526174]">Reference audit scope focused on Travel Brain proof, with portfolio context from Autonomous Payment Agent and Legacy Branch Assistant.</div>
          <div className="mt-2 flex items-center gap-1">
            {lifecycle.map((stage, index) => (
              <span key={stage} className={`h-1.5 flex-1 rounded ${index <= 1 ? "bg-[#0b4a92]" : "bg-[#d7dee8]"}`} title={stage} />
            ))}
          </div>
        </div>
        <div className="mt-3 text-[11px] font-semibold uppercase text-[#526174]">Scoped systems</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {systemsInScope.slice(0, 3).map((system) => <span key={system} className="rounded border border-[#d6dee9] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#344256]">{system}</span>)}
        </div>
      </div>
      <div className="shrink-0 border-b border-[#e1e6ee] px-3 py-2">
        <div className="text-xs font-semibold uppercase text-[#344256]">Controls in scope</div>
        <div className="mt-1 text-[11px] leading-4 text-[#526174]">Select one Travel Brain control to prove.</div>
      </div>
      <div data-auditor-workspace="control-rail-scroll" className="min-h-0 flex-1 overflow-y-auto">
        {files.map((file) => (
          <button
            key={file.id}
            className={`block w-full border-b border-[#e1e6ee] px-3 py-3 text-left hover:bg-[#f7faff] ${selected.id === file.id ? "bg-[#edf4ff] shadow-[inset_3px_0_0_#0b4a92]" : "bg-white"}`}
            type="button"
            onClick={() => onSelect(file.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[11px] font-semibold text-[#526174]">{file.controlId}</div>
        <div className="mt-1 text-xs font-semibold leading-4 text-[#172033]">{proofWorkItemTitle(file)}</div>
                <div className="mt-1 text-[11px] leading-4 text-[#526174]">{file.systemsInScope.join(", ") || "Reference systems"}</div>
              </div>
              {statusIcon(file.proofStatus)}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <ToneBadge tone={file.proofStatus} />
              <span className="text-[11px] font-semibold text-[#526174]">{file.missingEvidence.length} gap(s)</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function GuidedProofPanel({
  file,
  stage,
  selectedArtifact,
  onStage,
  onRequestEvidence,
  onArtifactSelect
}: {
  file: ControlProofFile;
  stage: ProofStage;
  selectedArtifact: ProofArtifact | null;
  onStage: (stage: ProofStage) => void;
  onRequestEvidence: (draft: EvidenceRequestDraft) => void;
  onArtifactSelect: (artifactId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [stage, file.id, selectedArtifact?.id]);

  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-[#cfd7e3] bg-white">
      <div className="shrink-0 border-b border-[#cfd7e3] px-5 py-3">
        <div className="font-mono text-[11px] font-semibold text-[#526174]">
          {stage === "Scope" ? "REFERENCE AUDIT SCOPE" : `${file.packageId} · ${file.controlId}`}
        </div>
        <h2 className="mt-1 text-[18px] font-semibold leading-6 text-[#111827]">{stageTitle(stage, file)}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#344256]">
          <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">{file.auditScope}</span>
          <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">Travel Brain</span>
          {stage === "Scope" ? (
            <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">Select system/control</span>
          ) : (
            <>
              <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">{file.evidenceSufficiency}</span>
              {stage === "Package" ? <span className="rounded border border-[#d6dee9] bg-[#f8fafc] px-2 py-1">{file.packageStatus}</span> : null}
            </>
          )}
        </div>
      </div>
      <div ref={scrollRef} data-auditor-workspace="proof-file-scroll" className="min-h-0 flex-1 overflow-y-auto p-4 min-[1500px]:p-5">
        <ProofPathStepper stage={stage} />
        {stage === "Scope" ? <ScopeStep file={file} onStage={onStage} /> : null}
        {stage === "Control" ? <ControlStep file={file} onStage={onStage} /> : null}
        {stage === "Evidence" ? <EvidenceStep file={file} onArtifactSelect={onArtifactSelect} onRequestEvidence={onRequestEvidence} /> : null}
        {stage === "Verify" ? <VerifyStep file={file} artifact={selectedArtifact} onStage={onStage} onRequestEvidence={onRequestEvidence} /> : null}
        {stage === "Package" ? <PackageStep file={file} onRequestEvidence={onRequestEvidence} /> : null}
      </div>
    </section>
  );
}

function ScopeStep({ file, onStage }: { file: ControlProofFile; onStage: (stage: ProofStage) => void }) {
  return (
    <div className="max-w-4xl">
      <CurrentTask tone="blue" title="Start here" detail="Confirm the reference audit scope, then select the Travel Brain control you want to prove." />
      <div className="grid gap-3 min-[1366px]:grid-cols-[1fr_1fr]">
        <FactBox label="Audit scope" value="Q2 AI Governance Audit" />
        <FactBox label="Default scenario" value={proofScenarioSummary(file)} />
        <FactBox label="Scoped systems" value="Travel Brain, Autonomous Payment Agent, Legacy Branch Assistant" />
        <FactBox label="Package context" value={`${file.packageTitle} · ${file.packageStatus}`} />
      </div>
      <div className="mt-3 rounded border border-[#cfd7e3] bg-white p-3">
        <div className="text-[11px] font-semibold uppercase text-[#526174]">Selected proof target</div>
        <div className="mt-2 text-sm font-semibold text-[#172033]">{file.controlId} · {proofWorkItemTitle(file)}</div>
        <div className="mt-1 text-xs leading-5 text-[#526174]">Default reference scenario uses Travel Brain because it has the richest current connector-backed evidence path in the database.</div>
      </div>
      <button className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded bg-[#0b3b78] px-4 text-sm font-semibold text-white" type="button" onClick={() => onStage("Control")}>
        <FileCheck2 className="h-4 w-4" />
        Prove {file.controlId}
      </button>
    </div>
  );
}

function ControlStep({ file, onStage }: { file: ControlProofFile; onStage: (stage: ProofStage) => void }) {
  return (
    <div className="max-w-4xl">
      <CurrentTask tone="blue" title="Control selected" detail="Review the objective and test expectation before opening the evidence comparison." />
      <div className="grid gap-3 min-[1366px]:grid-cols-[1fr_1fr]">
        <FactBox label="Control objective" value={file.controlObjective} />
        <FactBox label="Test expectation" value={file.testExpectation} />
        <FactBox label="Control owner" value={file.controlOwner} />
        <FactBox label="Systems in scope" value={file.systemsInScope.join(", ") || "Travel Brain"} />
      </div>
      <button className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded bg-[#0b3b78] px-4 text-sm font-semibold text-white" type="button" onClick={() => onStage("Evidence")}>
        <ClipboardCheck className="h-4 w-4" />
        Review Required Evidence
      </button>
    </div>
  );
}

function EvidenceStep({
  file,
  onArtifactSelect,
  onRequestEvidence
}: {
  file: ControlProofFile;
  onArtifactSelect: (artifactId: string) => void;
  onRequestEvidence: (draft: EvidenceRequestDraft) => void;
}) {
  return (
    <div>
      <CurrentTask
        tone={isAuditReady(file) ? "blue" : "red"}
        title={isAuditReady(file) ? "Proof set ready for review" : "Not audit-ready"}
        detail={proofConclusion(file)}
      />
      <section className="rounded border-2 border-[#8fa6c3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#d3dce8] bg-[#f6f8fb] px-3 py-2">
          <div>
            <div className="text-sm font-semibold text-[#111827]">Evidence Matrix</div>
            <div className="mt-0.5 text-[11px] font-medium text-[#526174]">Required evidence vs available proof vs missing evidence vs sufficiency.</div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#526174]">
            <span>{file.requiredEvidence.length} required</span>
            <span>{usableProofCount(file)} usable proof</span>
            <span>{contextOnlyCount(file)} context/limits</span>
            <span>{file.missingEvidence.length} missing</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="bg-[#f6f8fb] text-[11px] font-semibold uppercase text-[#344256]">
              <tr>
                  <th className="px-3 py-2">Required Proof</th>
                  <th className="border-l border-[#d9e0ea] px-3 py-2">Available Artifact</th>
                  <th className="border-l border-[#d9e0ea] px-3 py-2">Source / Quality</th>
                  <th className="border-l border-[#d9e0ea] px-3 py-2">Sufficiency</th>
                  <th className="border-l border-[#d9e0ea] px-3 py-2">Proof Meaning</th>
                  <th className="border-l border-[#d9e0ea] px-3 py-2">Reviewer Action</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows(file).map((row) => (
                <tr key={row.key} className={`border-t border-[#e1e6ee] ${row.artifactId ? "cursor-pointer hover:bg-[#f7faff]" : ""}`} onClick={() => row.artifactId ? onArtifactSelect(row.artifactId) : undefined}>
                  <td className="max-w-[220px] px-3 py-3 font-semibold leading-4 text-[#172033]">{row.requirement}</td>
                  <td className="max-w-[220px] border-l border-[#e1e6ee] px-3 py-3 leading-4 text-[#27364a]">
                    <div className="font-semibold text-[#172033]">{row.artifact}</div>
                    <div className="mt-1 text-[11px] text-[#526174]">{row.access}</div>
                    <div className="mt-1"><ToneBadge tone={row.proofQuality} /></div>
                  </td>
                  <td className="max-w-[190px] border-l border-[#e1e6ee] px-3 py-3 leading-4 text-[#27364a]">{row.source}</td>
                  <td className="border-l border-[#e1e6ee] px-3 py-3"><ToneBadge tone={row.sufficiency} /></td>
                  <td className="max-w-[260px] border-l border-[#e1e6ee] px-3 py-3 leading-4 text-[#27364a]">{row.meaning}</td>
                  <td className="border-l border-[#e1e6ee] px-3 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      {row.href ? (
                        <Link
                          href={row.href}
                          className="text-xs font-semibold text-[#0b4a92] hover:text-[#062f5f]"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Open Evidence
                        </Link>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#7a8698]">{row.openLabel}</span>
                      )}
                      {row.artifactId ? (
                        <button className="text-xs font-semibold text-[#0b4a92] hover:text-[#062f5f]" type="button" onClick={(event) => {
                          event.stopPropagation();
                          onArtifactSelect(row.artifactId);
                        }}>
                          {row.action}
                        </button>
                      ) : null}
                      {!row.artifactId && row.requestDraft ? (
                        <button
                          className="text-xs font-semibold text-[#0b4a92] hover:text-[#062f5f]"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (row.requestDraft) onRequestEvidence(row.requestDraft);
                          }}
                        >
                          Request Evidence
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function VerifyStep({
  file,
  artifact,
  onStage,
  onRequestEvidence
}: {
  file: ControlProofFile;
  artifact: ProofArtifact | null;
  onStage: (stage: ProofStage) => void;
  onRequestEvidence: (draft: EvidenceRequestDraft) => void;
}) {
  if (!artifact) {
    return <CurrentTask tone="amber" title="Select evidence first" detail="Return to Evidence and choose one artifact to verify provenance, validation, hash, and what it proves." />;
  }
  const artifactValid = artifact.validationStatus === "VALID" || artifact.validationStatus === "PASS";
  const auditSufficient = isSufficientForAudit(artifact);

  return (
    <div className="max-w-5xl">
      <CurrentTask
        tone={artifactValid ? "blue" : "red"}
        title="Verify one artifact"
        detail={auditSufficient ? "This inspectable proof can support the selected control if the auditor accepts it." : "This record is not sufficient audit proof. Decide whether to request evidence or raise an exception."}
      />
      <div className="grid gap-3 min-[1366px]:grid-cols-2">
        <FactBox label="Artifact" value={artifact.title} />
        <FactBox label="Source / connector" value={`${artifact.connector} · ${artifact.source}`} />
        <FactBox label="Proof quality" value={artifact.proofQuality} />
        <FactBox label="Audit sufficiency" value={auditSufficient ? "Sufficient for audit if accepted" : "Not sufficient for audit"} />
        <FactBox label="Provenance" value={artifact.provenance} />
        <FactBox label="Collection timestamp" value={artifact.collectedAt} />
        <FactBox label="Validation" value={artifact.validationStatus} />
        <FactBox label="Hash / snapshot / drift" value={`${artifact.hashStatus} · ${artifact.snapshotStatus} · ${artifact.driftStatus}`} />
      </div>
      <div className="mt-3 rounded border border-[#cfd7e3] bg-[#fbfcfe] p-3">
        <div className="text-[11px] font-semibold uppercase text-[#526174]">What this artifact proves</div>
        <div className="mt-2 text-sm font-semibold leading-5 text-[#172033]">{artifact.proves}</div>
      </div>
      <div className="mt-3 rounded border border-[#cfd7e3] bg-white p-3">
        <div className="text-[11px] font-semibold uppercase text-[#526174]">What this does not prove</div>
        <div className="mt-2 text-xs font-semibold leading-5 text-[#27364a]">{artifact.doesNotProve}</div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="inline-flex h-9 items-center justify-center gap-2 rounded bg-[#0b3b78] px-4 text-sm font-semibold text-white" type="button" onClick={() => onStage("Package")}>
          {auditSufficient ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          {auditSufficient ? "Mark Artifact Sufficient" : "Raise Exception"}
        </button>
        <button
          className="inline-flex h-9 items-center justify-center rounded border border-[#c8d2df] bg-white px-3 text-xs font-semibold text-[#0b3b78]"
          type="button"
          onClick={() => onRequestEvidence({
            requirement: auditSufficient ? "Supplemental evidence for artifact verification" : "Replacement evidence for insufficient proof",
            category: "Artifact verification",
            artifactTitle: artifact.title,
            source: `${artifact.connector} · ${artifact.source}`,
            reason: auditSufficient
              ? "Auditor needs supplemental evidence before relying on this artifact in the proof file."
              : `${artifact.proofQuality} is not sufficient audit proof for this control.`
          })}
        >
          Request Evidence
        </button>
        {auditSufficient ? <button className="inline-flex h-9 items-center justify-center rounded border border-[#c8d2df] bg-white px-3 text-xs font-semibold text-[#0b3b78]" type="button">Raise Exception</button> : null}
      </div>
    </div>
  );
}

function PackageStep({ file, onRequestEvidence }: { file: ControlProofFile; onRequestEvidence: (draft: EvidenceRequestDraft) => void }) {
  const blocker = file.missingEvidence[0];
  const ready = isAuditReady(file);
  return (
    <div className="max-w-4xl">
      <CurrentTask
        tone={ready ? "green" : "red"}
        title={ready ? "Package decision" : "Control proof blocked"}
        detail={ready ? "The proof set can be added to the audit package if the auditor accepts the evidence." : "This control cannot be marked ready until missing approval, review, access-accountability, or replacement proof is supplied, or an exception is approved."}
      />
      <div className="grid gap-3 min-[1366px]:grid-cols-2">
        <FactBox label="Assurance judgment" value={ready ? `${file.assuranceJudgment} · ${file.assuranceScore}% assurance` : "Insufficient · Not audit-ready"} />
        <FactBox label="Package readiness" value={`${file.packageTitle} · ${file.packageStatus}`} />
        <FactBox label="Proof conclusion" value={proofConclusion(file)} />
        <FactBox label="Exceptions" value={file.exceptions.length ? file.exceptions.map((item) => `${item.label} ${item.status}`).join(", ") : "No exceptions attached."} />
        <FactBox label="Open blockers" value={file.openBlockers.length ? file.openBlockers.join("; ") : "No open blockers for this proof file."} />
      </div>
      <button
        className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded bg-[#0b3b78] px-4 text-sm font-semibold text-white"
        type="button"
        onClick={() => {
          if (ready) return;
          onRequestEvidence({
            requirement: blocker?.label ?? "Package blocker evidence",
            category: blocker?.category ?? "Audit package blocker",
            reason: "Control proof cannot move into the audit package until this blocker has supporting evidence."
          });
        }}
      >
        <PackageCheck className="h-4 w-4" />
        {ready ? "Add to Audit Package" : "Request Evidence"}
      </button>
    </div>
  );
}

function ProofSummaryRail({ file, stage }: { file: ControlProofFile; stage: ProofStage }) {
  return (
    <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex h-10 shrink-0 items-center border-b border-[#cfd7e3] px-3 text-xs font-semibold text-[#344256]">Proof Summary</div>
      <div data-auditor-workspace="right-rail-scroll" className="min-h-0 flex-1 overflow-y-auto p-3 text-[11px]">
        <RailFact label="Current step" value={stage} />
        {stage === "Scope" ? (
          <>
            <RailFact label="Scenario" value="Travel Brain reference audit" />
            <RailFact label="Next task" value="Select or confirm one control to prove." />
          </>
        ) : (
          <>
            <RailFact label="Selected control" value={`${file.controlId} · ${proofWorkItemTitle(file)}`} />
            {stage === "Evidence" || stage === "Verify" || stage === "Package" ? <RailFact label="Evidence status" value={`${usableProofCount(file)} usable proof · ${contextOnlyCount(file)} context/limits · ${file.missingEvidence.length} missing`} /> : null}
            {stage === "Package" ? <RailFact label="Assurance" value={isAuditReady(file) ? `${file.assuranceScore}% · ${file.evidenceSufficiency}` : "Insufficient · Blocked"} /> : null}
            {stage === "Package" ? <RailFact label="Package" value={file.packageStatus} /> : null}
          </>
        )}
        {stage === "Package" ? (
          <div className="mt-4 border-t border-[#e1e6ee] pt-3">
            <div className="mb-2 text-xs font-semibold uppercase text-[#344256]">Audit trail</div>
            <div className="space-y-2">
              {file.auditTrail.map((entry) => (
                <div key={entry} className="grid grid-cols-[16px_1fr] gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#526174]" />
                  <span className="text-[#27364a]">{entry}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function ArtifactVerificationPanel({ artifact, onContinue }: { artifact: ProofArtifact; onContinue: () => void }) {
  return (
    <section data-auditor-workspace="artifact-panel" className="max-h-[132px] shrink-0 overflow-hidden rounded border border-[#cfd7e3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex h-8 items-center justify-between border-b border-[#e1e6ee] px-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#344256]">
          Artifact Verification
          <CircleHelp className="h-4 w-4 text-[#526174]" />
        </div>
        <button className="text-xs font-semibold text-[#0b4a92]" type="button" onClick={onContinue}>Continue to package</button>
      </div>
      <div className="grid grid-cols-[1.1fr_0.8fr_1fr_0.8fr_0.9fr_1.4fr] gap-1.5 overflow-x-auto p-2 text-[11px]">
        <VerificationTile label="Artifact" value={artifact.title} status={artifact.validationStatus} />
        <VerificationTile label="Source / Connector" value={`${artifact.connector} · ${artifact.source}`} />
        <VerificationTile label="Proof Quality" value={artifact.proofQuality} status={artifact.proofQuality} />
        <VerificationTile label="Provenance" value={artifact.provenance} />
        <VerificationTile label="Collected" value={artifact.collectedAt} />
        <VerificationTile label="Audit Sufficiency" value={isSufficientForAudit(artifact) ? "Sufficient if accepted" : "Not sufficient"} status={isSufficientForAudit(artifact) ? "Sufficient" : "Insufficient"} />
        <VerificationTile label="What this proves" value={artifact.proves} />
      </div>
    </section>
  );
}

function ProofPathStepper({ stage }: { stage: ProofStage }) {
  const current = proofStages.indexOf(stage);
  return (
    <div className="mb-3 rounded border border-[#cfd7e3] bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        {proofStages.map((step, index) => {
          const state = index < current ? "done" : index === current ? "current" : "upcoming";
          return (
            <div key={step} className="flex min-w-0 flex-1 items-center gap-2">
              <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${state === "done" ? "border-[#0b4a92] bg-[#0b4a92] text-white" : state === "current" ? "border-[#0b4a92] bg-[#eaf2ff] text-[#0b4a92]" : "border-[#c8d2df] bg-white text-[#526174]"}`}>{index + 1}</div>
              <div className={`truncate text-xs font-semibold ${state === "current" ? "text-[#0b4a92]" : "text-[#344256]"}`}>{step}</div>
              {index < proofStages.length - 1 ? <div className={`h-px flex-1 ${index < current ? "bg-[#0b4a92]" : "bg-[#d7dee8]"}`} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CurrentTask({ tone, title, detail }: { tone: "blue" | "green" | "amber" | "red"; title: string; detail: string }) {
  const className = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    green: "border-green-200 bg-green-50 text-green-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-900"
  }[tone];

  return (
    <div className={`mb-3 rounded border px-3 py-2 ${className}`}>
      <div className="text-xs font-bold uppercase">{title}</div>
      <div className="mt-1 text-sm font-semibold leading-5">{detail}</div>
    </div>
  );
}

function FactBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded border border-[#cfd7e3] bg-[#fbfcfe] p-3">
      <div className="text-[11px] font-semibold uppercase text-[#526174]">{label}</div>
      <div className="mt-2 text-xs font-semibold leading-5 text-[#172033]">{value}</div>
    </div>
  );
}

function RailFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#e1e6ee] py-2">
      <div className="text-[10px] font-semibold uppercase text-[#526174]">{label}</div>
      <div className="mt-1 text-xs font-semibold leading-4 text-[#172033]">{value}</div>
    </div>
  );
}

function VerificationTile({ label, value, status }: { label: string; value: string; status?: string }) {
  return (
    <div className="min-w-[132px] rounded border border-[#d8e0ea] bg-[#fbfcfe] px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-[#344256]">{label}</span>
        {status ? <ToneBadge tone={status} /> : null}
      </div>
      <div className="mt-1 line-clamp-2 leading-4 text-[#172033]">{value}</div>
    </div>
  );
}

function matrixRows(file: ControlProofFile) {
  const maxRows = Math.max(file.requiredEvidence.length, 1);
  return Array.from({ length: maxRows }).map((_, index) => {
    const requirement = file.requiredEvidence[index];
    const artifact = bestArtifactForRequirement(requirement, file.availableEvidence, index);
    const missing = requirement?.status === "Missing";
    const sufficientForAudit = artifact ? isSufficientForAudit(artifact) && !missing : false;
    const proofQuality = artifact?.proofQuality ?? "Missing Evidence";
    return {
      key: `${requirement?.id ?? "requirement"}-${artifact?.id ?? index}`,
      artifactId: artifact?.id ?? null,
      requirement: requirement?.label ?? "No required evidence configured",
      artifact: artifact?.title ?? "Missing evidence",
      href: artifact?.evidenceHref ?? null,
      access: artifact?.evidenceAccess ?? (missing ? "Missing evidence" : "Evidence record unavailable"),
      proofQuality,
      openLabel: missing ? "Evidence record unavailable" : artifact?.evidenceAccess === "Source only" ? "Source only" : "Evidence record unavailable",
      source: artifact ? `${artifact.connector} · ${artifact.validationStatus}` : "No source artifact",
      requestDraft: missing && requirement ? {
        requirement: requirement.label,
        category: requirement.category,
        reason: `Required proof is missing for ${file.controlId}: ${proofWorkItemTitle(file)}.`
      } : null,
      meaning: missing
        ? artifact?.proofQuality === "Gap Artifact / Limitation"
          ? `Limitation record explains why ${requirement?.label ?? "required proof"} is unavailable; it does not prove the control.`
          : `Blocking gap: ${requirement?.label ?? "required proof"} is not supported by current valid evidence.`
        : artifact
          ? artifact.proves
          : "No artifact is available for this required proof.",
      sufficiency: sufficientForAudit ? "Sufficient" : artifact?.proofQuality === "Source Metadata Only" ? "Metadata Only" : missing ? "Insufficient" : "Partial",
      action: artifact ? artifactActionLabel(artifact) : missing ? "Request Evidence" : "Raise Exception"
    };
  });
}

function isSufficientForAudit(artifact: ProofArtifact) {
  const valid = artifact.validationStatus === "VALID" || artifact.validationStatus === "PASS";
  return valid && (artifact.proofQuality === "Inspectable Evidence Artifact" || artifact.proofQuality === "Human Governance Record");
}

function artifactActionLabel(artifact: ProofArtifact) {
  if (artifact.proofQuality === "Source Metadata Only") return "Review Metadata";
  if (artifact.proofQuality === "Gap Artifact / Limitation") return "Review Limitation";
  return "Verify Artifact";
}

function usableProofCount(file: ControlProofFile) {
  return file.availableEvidence.filter((artifact) => isSufficientForAudit(artifact)).length;
}

function contextOnlyCount(file: ControlProofFile) {
  return file.availableEvidence.filter((artifact) => artifact.proofQuality === "Source Metadata Only" || artifact.proofQuality === "Gap Artifact / Limitation").length;
}

function isAuditReady(file: ControlProofFile) {
  return file.requiredEvidence.length > 0
    && file.missingEvidence.length === 0
    && contextOnlyCount(file) === 0
    && usableProofCount(file) >= file.requiredEvidence.length
    && file.packageStatus === "Ready for Package";
}

function proofConclusion(file: ControlProofFile) {
  if (isAuditReady(file)) {
    return "Audit-ready: required proof is supported by sufficient inspectable evidence or valid human governance records.";
  }
  return "Not audit-ready: policy evidence exists, but approval/review/access-accountability proof is missing or metadata-only. Source metadata and gap artifacts explain context but do not prove the control.";
}

function stageTitle(stage: ProofStage, file: ControlProofFile) {
  if (stage === "Scope") return "Confirm audit scope";
  if (stage === "Control") return `${file.controlId} · ${proofWorkItemTitle(file)}`;
  if (stage === "Evidence") return "Compare required evidence";
  if (stage === "Verify") return "Verify selected artifact";
  return "Package proof decision";
}

function proofWorkItemTitle(file: ControlProofFile) {
  if (file.systemsInScope.includes("Travel Brain") && file.controlId === "AI-GOV-006") return "Prove Travel Brain tool permissions are approved";
  if (file.systemsInScope.includes("Travel Brain") && file.controlId === "AI-GOV-003") return "Prove Travel Brain prompt changes are approved and versioned";
  if (file.systemsInScope.includes("Travel Brain") && file.controlId === "AI-GOV-010") return "Prove Travel Brain runtime monitoring evidence is current";
  if (file.systemsInScope.includes("Travel Brain") && file.controlId === "AUD-001") return "Prove Travel Brain evidence is package-ready for audit";
  return file.controlTitle;
}

function proofScenarioSummary(file: ControlProofFile) {
  if (file.controlId === "AI-GOV-006") {
    return "Travel Brain tool-permission proof using GitHub policy evidence, MCP permission evidence, and related source limitations.";
  }
  return "Travel Brain control proof using database-backed reference evidence.";
}

function scenarioPriority(file: ControlProofFile) {
  if (file.systemsInScope.includes("Travel Brain") && file.controlId === "AI-GOV-006") return 0;
  if (file.systemsInScope.includes("Travel Brain") && file.controlId === "AI-GOV-003") return 1;
  if (file.systemsInScope.includes("Travel Brain") && file.controlId === "AI-GOV-010") return 2;
  if (file.systemsInScope.includes("Travel Brain") && file.controlId === "AUD-001") return 3;
  return 10;
}

function bestArtifactForRequirement(requirement: ProofRequirement | undefined, artifacts: ProofArtifact[], fallbackIndex: number) {
  if (!requirement) return artifacts[fallbackIndex];
  const label = requirement.label.toLowerCase();
  const category = requirement.category.toLowerCase();
  const candidates = artifacts.filter((artifact) => {
    const text = `${artifact.title} ${artifact.connector} ${artifact.proves}`.toLowerCase();
    if (category.includes("human")) return artifact.connector === "Notion" || text.includes("notion");
    if (category.includes("secrets")) return artifact.connector === "Secrets" || text.includes("secret");
    if (label.includes("mcp") || category.includes("mcp")) return text.includes("mcp");
    if (label.includes("tool permission")) return text.includes("permission") || text.includes("policy");
    if (label.includes("authority")) return text.includes("authority");
    if (label.includes("prohibited")) return text.includes("prompt") || text.includes("policy");
    if (category.includes("repository")) return text.includes("github") || text.includes("policy") || text.includes("prompt");
    return text.includes(label);
  });
  return candidates[0];
}

function EvidenceRequestDrawer({
  file,
  draft,
  queued,
  onClose,
  onCreate
}: {
  file: ControlProofFile;
  draft: EvidenceRequestDraft;
  queued: EvidenceRequestDraft | null;
  onClose: () => void;
  onCreate: () => void;
}) {
  const impactedSystem = file.systemsInScope.find((system) => system === "Travel Brain") ?? file.systemsInScope[0] ?? "Reference AI system";
  const dueDate = "Within 5 business days";
  const likelyOwner = likelyEvidenceOwner(draft, file);

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-[#071827]/35">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close evidence request drawer" onClick={onClose} />
      <aside className="relative flex h-full w-[440px] max-w-[calc(100vw-24px)] flex-col border-l border-[#c4cfdd] bg-white shadow-2xl">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#d7dee8] px-4">
          <div>
            <div className="text-sm font-semibold text-[#111827]">Request Evidence</div>
            <div className="text-[11px] font-semibold uppercase text-[#526174]">Draft request workflow</div>
          </div>
          <button className="rounded border border-[#c8d2df] bg-white px-2 py-1 text-xs font-semibold text-[#344256]" type="button" onClick={onClose}>Cancel</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
            This foundation can prepare an in-page evidence request draft. Workflow persistence, assignment notifications, and approval routing are not implemented yet.
          </div>
          {queued ? (
            <div className="mt-3 rounded border border-green-200 bg-green-50 p-3 text-xs font-semibold leading-5 text-green-900">
              Draft queued in this page for {queued.requirement}. It has not been persisted to the database.
            </div>
          ) : null}
          <div className="mt-4 grid gap-3">
            <RequestFact label="Audit scope" value={file.auditScope} />
            <RequestFact label="Selected control" value={`${file.controlId} · ${proofWorkItemTitle(file)}`} />
            <RequestFact label="Missing evidence requirement" value={draft.requirement} />
            <RequestFact label="Evidence category" value={draft.category} />
            <RequestFact label="Evidence owner / likely owner" value={likelyOwner} />
            <RequestFact label="Impacted AI system" value={impactedSystem} />
            <RequestFact label="Due date / requested by" value={`${dueDate} · Internal Audit`} />
            <RequestFact label="Reason this evidence is required" value={draft.reason} />
            {draft.artifactTitle ? <RequestFact label="Related artifact" value={draft.artifactTitle} /> : null}
            {draft.source ? <RequestFact label="Related source" value={draft.source} /> : null}
            <RequestFact label="Linked package / control context" value={`${file.packageId} · ${file.packageTitle} · ${file.controlId}`} />
            <label className="block">
              <span className="text-[11px] font-semibold uppercase text-[#526174]">Optional note</span>
              <textarea
                className="mt-1 h-24 w-full resize-none rounded border border-[#cfd7e3] bg-[#fbfcfe] p-2 text-xs font-medium leading-5 text-[#172033] outline-none focus:border-[#0b4a92]"
                placeholder="Add audit request context for the evidence owner..."
              />
            </label>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#d7dee8] p-3">
          <button className="h-9 rounded border border-[#c8d2df] bg-white px-3 text-xs font-semibold text-[#344256]" type="button" onClick={onClose}>Cancel</button>
          <button
            className="h-9 rounded bg-[#0b3b78] px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9aa8b8]"
            type="button"
            onClick={onCreate}
            disabled={Boolean(queued)}
          >
            {queued ? "Draft Queued" : "Create Evidence Request"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function RequestFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#d7dee8] bg-[#fbfcfe] p-3">
      <div className="text-[11px] font-semibold uppercase text-[#526174]">{label}</div>
      <div className="mt-1 text-xs font-semibold leading-5 text-[#172033]">{value}</div>
    </div>
  );
}

function likelyEvidenceOwner(draft: EvidenceRequestDraft, file: ControlProofFile) {
  const category = draft.category.toLowerCase();
  const requirement = draft.requirement.toLowerCase();
  if (category.includes("mcp") || requirement.includes("mcp")) return "Platform Engineering / MCP owner";
  if (category.includes("repository") || requirement.includes("policy") || requirement.includes("prompt")) return "Governance Engineering";
  if (category.includes("human") || requirement.includes("approval") || requirement.includes("review")) return "Governance Owner";
  if (category.includes("secret")) return "Security Lead";
  if (category.includes("artifact")) return "Evidence Owner";
  return file.controlOwner;
}

function TopUtility({ icon: Icon, label, badge }: { icon: typeof Bookmark; label: string; badge?: string }) {
  return (
    <button className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-white/90" type="button" aria-label={label}>
      <Icon className="h-4 w-4" />
      <span className="hidden min-[1450px]:inline">{label}</span>
      {badge ? <span className="grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-[#061b2c]">{badge}</span> : null}
    </button>
  );
}

function ToneBadge({ tone }: { tone: string }) {
  const normalized = tone.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const className = {
    BLOCKED: "border-red-300 bg-red-50 text-red-700",
    MISSING: "border-red-300 bg-red-50 text-red-700",
    INSUFFICIENT: "border-red-300 bg-red-50 text-red-700",
    FAIL: "border-red-300 bg-red-50 text-red-700",
    INVALID: "border-red-300 bg-red-50 text-red-700",
    METADATA_ONLY: "border-slate-300 bg-slate-50 text-slate-700",
    SOURCE_METADATA_ONLY: "border-slate-300 bg-slate-50 text-slate-700",
    NEEDS_REVIEW: "border-amber-300 bg-amber-50 text-amber-700",
    PARTIAL: "border-amber-300 bg-amber-50 text-amber-700",
    EXCEPTIONS_REVIEW: "border-amber-300 bg-amber-50 text-amber-700",
    WARNING: "border-amber-300 bg-amber-50 text-amber-700",
    GAP_ARTIFACT_LIMITATION: "border-amber-300 bg-amber-50 text-amber-700",
    SCOPE_CONFIRMED: "border-blue-300 bg-blue-50 text-blue-700",
    AVAILABLE: "border-green-300 bg-green-50 text-green-700",
    READY: "border-green-300 bg-green-50 text-green-700",
    READY_FOR_PACKAGE: "border-green-300 bg-green-50 text-green-700",
    SUFFICIENT: "border-green-300 bg-green-50 text-green-700",
    INSPECTABLE_EVIDENCE_ARTIFACT: "border-green-300 bg-green-50 text-green-700",
    HUMAN_GOVERNANCE_RECORD: "border-green-300 bg-green-50 text-green-700",
    VALID: "border-green-300 bg-green-50 text-green-700",
    PASS: "border-green-300 bg-green-50 text-green-700"
  }[normalized] ?? "border-slate-300 bg-slate-50 text-slate-700";

  return <span className={`inline-flex max-w-full items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-4 ${className}`}>{humanize(tone)}</span>;
}

function statusIcon(status: string) {
  if (status === "Ready") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === "Blocked") return <ShieldAlert className="h-4 w-4 text-red-600" />;
  return <AlertTriangle className="h-4 w-4 text-amber-600" />;
}

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function unique(values: string[]) {
  return [...new Set(values)];
}
