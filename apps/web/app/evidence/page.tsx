import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardCheck, FileWarning } from "lucide-react";
import { getEvidence } from "../data";
import { formatDate } from "../components/format";
import { LearningPanel, Metric, Section, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function EvidencePage() {
  const { objects, health } = await getEvidence();
  const countHealth = (value: string) => health.filter((record) => record.health === value).length;

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Evidence governance</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Evidence-based compliance monitoring</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Evidence is now a governed object with ownership, approval, versioning, expiration, control linkage, and health monitoring.
        </p>
      </header>

      <div className="mt-6 grid gap-0 sm:grid-cols-4">
        <Metric label="Current" value={countHealth("CURRENT")} icon={CheckCircle2} />
        <Metric label="Expiring soon" value={countHealth("EXPIRING_SOON")} icon={AlertTriangle} />
        <Metric label="Expired" value={countHealth("EXPIRED")} icon={FileWarning} />
        <Metric label="Missing" value={countHealth("MISSING")} icon={ClipboardCheck} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LearningPanel title="Why evidence is first-class">
          Bank-grade governance depends on proof. Evidence objects make approvals, versions, owners, reviewers, sources, expiration dates, and linked controls visible to audit and regulators.
        </LearningPanel>
        <LearningPanel title="How evidence health is calculated">
          Health is calculated from required evidence presence, approval status, and expiration date. Missing, expired, or invalid evidence can automatically generate monitoring findings.
        </LearningPanel>
        <LearningPanel title="How auditors use this">
          Auditors can start from a regulation or control, inspect the required evidence type, open the evidence object, and confirm the linked AI system and approval history.
        </LearningPanel>
      </div>

      <Section title="Evidence by AI System">
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(groupBy(objects, (object) => object.aiSystem.name)).map(([systemName, systemObjects]) => (
            <div key={systemName} className="rounded-md border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">{systemName}</h2>
                <span className="text-xs text-slate-500">{systemObjects.length} objects</span>
              </div>
              <div className="mt-4 space-y-3">
                {systemObjects.map((object) => (
                  <Link key={object.id} href={`/evidence/${object.evidenceId}`} className="block rounded border border-line bg-panel p-3 hover:bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink">{object.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{object.evidenceType} · v{object.version}</div>
                      </div>
                      <StatusBadge status={object.status} />
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Expires {formatDate(object.expirationDate)}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Evidence health">
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-panel text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">AI System</th>
                <th className="px-4 py-3">Evidence Requirement</th>
                <th className="px-4 py-3">Control</th>
                <th className="px-4 py-3">Regulation</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Validation</th>
                <th className="px-4 py-3">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {health.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-4 font-medium text-ink">{record.aiSystem.name}</td>
                  <td className="px-4 py-4 text-slate-700">{record.evidenceRequirement.evidenceType}</td>
                  <td className="px-4 py-4 text-slate-700">{record.evidenceRequirement.controlId}</td>
                  <td className="px-4 py-4 text-slate-700">{record.evidenceRequirement.regulatoryControl?.regulation.name ?? "Not linked"}</td>
                  <td className="px-4 py-4"><StatusBadge status={record.health} /></td>
                  <td className="px-4 py-4"><StatusBadge status={record.validation} /></td>
                  <td className="px-4 py-4 text-slate-700">{record.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = getKey(item);
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});
}
