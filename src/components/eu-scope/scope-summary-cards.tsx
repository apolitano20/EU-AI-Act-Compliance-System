import type { EuScopeRow } from "@/lib/eu-scope/types";

export function ScopeSummaryCards({ rows }: { rows: EuScopeRow[] }) {
  const n = rows.length;
  const triggerA = rows.filter((r) => r.result.matchedTriggers.includes("S-01")).length;
  const triggerB = rows.filter((r) => r.result.matchedTriggers.includes("S-02")).length;
  const triggerC = rows.filter((r) => r.result.matchedTriggers.includes("S-03")).length;
  const inScope = rows.filter((r) => r.result.status === "likely_in_scope").length;
  const possibly = rows.filter((r) => r.result.status === "possibly_in_scope").length;
  const outOfScope = rows.filter((r) => r.result.status === "likely_out_of_scope").length;
  const needsReview = rows.filter((r) => r.result.status === "needs_review").length;
  const euEstablished = rows.filter((r) => r.answers.establishment === "Established in the EU/EEA").length;
  const outputInEu = rows.filter((r) => r.answers.outputUsedInEu === "Yes").length;
  const repRequired = rows.filter((r) => r.result.authorisedRepRequired).length;

  const cards = [
    { label: "Total systems", value: n, color: "text-slate-800" },
    { label: "Likely in scope", value: inScope, color: "text-blue-700" },
    { label: "Possibly in scope", value: possibly, color: "text-amber-700" },
    { label: "Likely out of scope", value: outOfScope, color: "text-slate-600" },
    { label: "Needs review", value: needsReview, color: "text-red-700" },
    { label: "Trigger met: Art 2(1)(a) provider", value: triggerA, color: "text-blue-700" },
    { label: "Trigger met: Art 2(1)(b) EU deployer", value: triggerB, color: "text-blue-700" },
    { label: "Trigger met: Art 2(1)(c) output in EU", value: triggerC, color: "text-blue-700" },
    { label: "Established in EU/EEA", value: euEstablished, color: "text-slate-700" },
    { label: "Output used in EU", value: outputInEu, color: "text-slate-700" },
    { label: "Authorised rep required", value: repRequired, color: "text-purple-700" },
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
