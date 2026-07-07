import type { ExclusionRow } from "@/lib/exclusions/types";

export function ExclusionSummaryCards({ rows }: { rows: ExclusionRow[] }) {
  const n = rows.length;
  const excluded = rows.filter((r) => r.result.status === "likely_excluded").length;
  const conditional = rows.filter((r) => r.result.status === "possibly_excluded_partial_conditional").length;
  const notExcluded = rows.filter((r) => r.result.status === "likely_not_excluded").length;
  const needsReview = rows.filter((r) => r.result.status === "needs_review").length;
  const reEntry = rows.filter((r) => r.result.reEntryTriggers.length > 0).length;
  const osGpai = rows.filter((r) => r.result.openSourceGpaiResidualDutyFlag).length;

  const cards = [
    { label: "Total systems", value: n, color: "text-slate-800" },
    { label: "Likely excluded (Art 2 carve-out)", value: excluded, color: "text-slate-600" },
    { label: "Conditional / partial exclusion", value: conditional, color: "text-amber-700" },
    { label: "Likely not excluded", value: notExcluded, color: "text-blue-700" },
    { label: "Needs review", value: needsReview, color: "text-red-700" },
    { label: "Re-entry trigger flagged", value: reEntry, color: "text-orange-700" },
    { label: "Open-source GPAI residual duties", value: osGpai, color: "text-purple-700" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500 leading-tight mb-1">{c.label}</p>
          <p className={`text-2xl font-semibold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
