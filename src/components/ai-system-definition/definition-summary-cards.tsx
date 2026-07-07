import type { AiDefinitionRow } from "@/lib/ai-system-definition/types";

export function DefinitionSummaryCards({ rows }: { rows: AiDefinitionRow[] }) {
  const n = rows.length;
  const likely = rows.filter((r) => r.result.classification === "likely_ai_system").length;
  const possible = rows.filter((r) => r.result.classification === "possible_ai_system_needs_review").length;
  const likelyNot = rows.filter((r) => r.result.classification === "likely_not_ai_system").length;
  const insufficient = rows.filter((r) => r.result.classification === "insufficient_information").length;
  const highConfidence = rows.filter((r) => r.result.confidenceLabel === "high").length;
  const mediumConfidence = rows.filter((r) => r.result.confidenceLabel === "medium").length;
  const lowConfidence = rows.filter((r) => r.result.confidenceLabel === "low").length;
  const missingData = rows.filter((r) => r.result.missingFields.length > 0).length;

  const cards = [
    { label: "Total inventory items",                value: n,            color: "text-slate-800" },
    { label: "Likely AI systems",                     value: likely,       color: "text-blue-700" },
    { label: "Possible AI systems / needs review",     value: possible,     color: "text-amber-700" },
    { label: "Likely not AI systems",                  value: likelyNot,    color: "text-slate-600" },
    { label: "Insufficient information",               value: insufficient, color: "text-red-700" },
    { label: "High confidence",                        value: highConfidence,   color: "text-green-700" },
    { label: "Medium confidence",                       value: mediumConfidence, color: "text-yellow-700" },
    { label: "Low confidence",                          value: lowConfidence,    color: "text-orange-700" },
    { label: "Missing key data",                        value: missingData,      color: "text-rose-700" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500 leading-tight mb-1">{c.label}</p>
          <p className={`text-2xl font-semibold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
