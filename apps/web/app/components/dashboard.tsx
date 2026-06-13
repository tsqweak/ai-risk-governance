import { StatusBadge } from "./ui";

export function ProgressBar({ label, value, total, tone = "teal" }: { label: string; value: number; total: number; tone?: "teal" | "amber" | "red" | "slate" }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const color = tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : tone === "slate" ? "bg-slate-500" : "bg-teal-600";
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-slate-600">{value}{total > 100 ? "" : ` / ${total}`}</span>
      </div>
      <div className="mt-2 h-2 rounded bg-slate-100">
        <div className={`h-2 rounded ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

export function ScoreCard({ title, score, subtitle }: { title: string; score: number; subtitle: string }) {
  const tone = score >= 80 ? "text-teal-700" : score >= 60 ? "text-amber-700" : "text-red-700";
  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className={`mt-3 text-4xl font-semibold ${tone}`}>{score}</div>
      <div className="mt-2 text-sm text-slate-600">{subtitle}</div>
    </div>
  );
}

export function MaturityCard({ name, score, level }: { name: string; score: number; level: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink">{name}</div>
          <div className="mt-1 text-xs text-slate-500">{level}</div>
        </div>
        <StatusBadge status={score >= 70 ? "PASS" : score >= 50 ? "WARNING" : "FAIL"} />
      </div>
      <div className="mt-4 h-2 rounded bg-slate-100">
        <div className={`h-2 rounded ${score >= 70 ? "bg-teal-600" : score >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
      </div>
      <div className="mt-2 text-xs text-slate-500">{score}/100 maturity score</div>
    </div>
  );
}
