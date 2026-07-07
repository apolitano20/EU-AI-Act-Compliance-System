import type { HighRiskRow } from "@/lib/high-risk/types";

export function HighRiskSummaryCards({ rows }: { rows: HighRiskRow[] }) {
  const cards = [
    { label: "Total classified", value: rows.length, color: "text-slate-800" },
    { label: "Likely high-risk", value: rows.filter((r) => r.result.status === "likely_high_risk").length, color: "text-red-700" },
    { label: "Possibly high-risk", value: rows.filter((r) => r.result.status === "possibly_high_risk").length, color: "text-orange-700" },
    { label: "Not high-risk (Art 6(3) carve-out)", value: rows.filter((r) => r.result.status === "not_high_risk_carve_out").length, color: "text-blue-700" },
    { label: "Likely not high-risk", value: rows.filter((r) => r.result.status === "likely_not_high_risk").length, color: "text-green-700" },
    { label: "Needs review", value: rows.filter((r) => r.result.status === "needs_review").length, color: "text-amber-700" },
    { label: "Registration required (Art 49)", value: rows.filter((r) => r.result.registrationRequired).length, color: "text-purple-700" },
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
