import type { ProhibitedRow } from "@/lib/prohibited/types";

export function ProhibitedSummaryCards({ rows }: { rows: ProhibitedRow[] }) {
  const cards = [
    { label: "Total screened", value: rows.length, color: "text-slate-800" },
    { label: "Likely prohibited", value: rows.filter((r) => r.result.status === "likely_prohibited").length, color: "text-red-700" },
    { label: "Possibly prohibited", value: rows.filter((r) => r.result.status === "possibly_prohibited").length, color: "text-orange-700" },
    { label: "Needs review", value: rows.filter((r) => r.result.status === "needs_review").length, color: "text-amber-700" },
    { label: "Likely not prohibited", value: rows.filter((r) => r.result.status === "likely_not_prohibited").length, color: "text-green-700" },
    { label: "Excluded via Module 5", value: rows.filter((r) => r.result.status === "not_assessed_excluded").length, color: "text-slate-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500 leading-tight mb-1">{c.label}</p>
          <p className={`text-2xl font-semibold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
