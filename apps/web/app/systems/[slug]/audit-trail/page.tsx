import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getAiSystemWorkspace } from "../../../data";
import { formatDate } from "../../../components/format";
import { LearningPanel, Section } from "../../../components/ui";

export const dynamic = "force-dynamic";

export default async function SystemAuditTrailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = await getAiSystemWorkspace(slug);
  if (!system) notFound();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Audit trail</p>
        <h2 className="mt-1 text-3xl font-semibold text-ink">{system.name} governance history</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Registration, classification, evidence, exception, lifecycle, and monitoring events that support accountability.
        </p>
      </header>

      <Section title="Why this matters">
        <LearningPanel title="Accountability Over Time">
          Audit history shows how governance decisions changed, who acted, and what evidence or control event supported the change.
        </LearningPanel>
      </Section>

      <Section title="Events">
        <div className="rounded-md border border-line bg-white">
          {system.auditEvents.map((event, index) => {
            const evidence = system.evidenceObjects[index % Math.max(system.evidenceObjects.length, 1)];
            const approval = system.lifecycleApprovals[index % Math.max(system.lifecycleApprovals.length, 1)];
            return (
            <div key={event.id} className="flex gap-3 border-b border-line p-4 last:border-0">
              <ClipboardList className="mt-0.5 h-4 w-4 text-brand" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">{event.eventType}</div>
                <div className="mt-1 text-sm text-slate-700">{event.summary}</div>
                <div className="mt-3 grid gap-3 rounded border border-line bg-panel p-3 text-xs leading-5 text-slate-600 md:grid-cols-3">
                  <div><span className="font-semibold text-ink">Who:</span> {event.actor}</div>
                  <div><span className="font-semibold text-ink">What:</span> {event.eventType}</div>
                  <div><span className="font-semibold text-ink">When:</span> {formatDate(event.createdAt)}</div>
                  <div><span className="font-semibold text-ink">Why:</span> Governance accountability and traceability.</div>
                  <div>
                    <span className="font-semibold text-ink">Evidence:</span>{" "}
                    {evidence ? <Link href={`/evidence/${evidence.evidenceId}`} className="font-semibold text-brand hover:text-blue-700">{evidence.evidenceId}</Link> : "No evidence linked"}
                  </div>
                  <div><span className="font-semibold text-ink">Approval:</span> {approval ? `${approval.approvalType} · ${approval.status}` : "No approval linked"}</div>
                  <div className="md:col-span-3"><span className="font-semibold text-ink">Outcome:</span> {event.summary}</div>
                </div>
              </div>
            </div>
          );})}
        </div>
      </Section>
    </>
  );
}
