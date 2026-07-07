import { Disclaimer } from "@/components/shared/disclaimer";
import { ObligationTable } from "@/components/obligations/obligation-table";
import { listObligationRows } from "@/lib/obligations/store";

export const dynamic = "force-dynamic";

export default async function ObligationsPage() {
  const rows = await listObligationRows();

  const cards = [
    { label: "Total assessed", value: rows.length, color: "text-slate-800" },
    { label: "With high-risk obligations", value: rows.filter((r) => r.result.rows.some((o) => o.obligationId.startsWith("OBL-ART9") || o.obligationId === "OBL-ART26-DEPLOYER")).length, color: "text-red-700" },
    { label: "With GPAI obligations", value: rows.filter((r) => r.result.rows.some((o) => o.obligationId === "OBL-GPAI-AGG")).length, color: "text-purple-700" },
    { label: "Transparency-only obligations", value: rows.filter((r) => r.result.status === "assessed" && r.result.rows.length > 0 && r.result.rows.every((o) => ["OBL-ART50-TRANSP-AGG", "OBL-ART4-LITERACY"].includes(o.obligationId))).length, color: "text-blue-700" },
    { label: "Prohibited (blocked)", value: rows.filter((r) => r.result.status === "prohibited_short_circuit").length, color: "text-red-700" },
    { label: "Out of scope / gate not met", value: rows.filter((r) => r.result.status === "suppressed_out_of_scope" || r.result.status === "suppressed_gate_not_met").length, color: "text-slate-600" },
    { label: "Obligations needing review", value: rows.reduce((n, r) => n + r.result.possiblyCount + r.result.needsReviewCount, 0), color: "text-amber-700" },
    { label: "Non-EU providers needing auth. rep", value: rows.filter((r) => r.result.rows.some((o) => o.obligationId === "OBL-ART22-AUTHREP")).length, color: "text-orange-700" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Obligations Matrix</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 12 — no new classification: aggregates the upstream module flags into a consolidated per-system,
          per-role obligations checklist. A prohibited flag short-circuits the matrix; out-of-scope or gate-not-met
          systems have their rows suppressed. A Module 9 reclassification re-runs the provider trigger set.
        </p>
      </div>

      <div className="mb-6 max-w-3xl"><Disclaimer /></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 leading-tight mb-1">{c.label}</p>
            <p className={`text-2xl font-semibold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <ObligationTable initialRows={rows} />
    </div>
  );
}
