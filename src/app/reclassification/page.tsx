import { Disclaimer } from "@/components/shared/disclaimer";
import { ReclassificationTable } from "@/components/reclassification/reclassification-table";
import { listReclassificationRows } from "@/lib/reclassification/store";

export const dynamic = "force-dynamic";

export default async function ReclassificationPage() {
  const rows = await listReclassificationRows();

  const cards = [
    { label: "Total systems", value: rows.length, color: "text-slate-800" },
    { label: "Reclassification likely triggered", value: rows.filter((r) => r.result.status === "reclassification_likely_triggered").length, color: "text-red-700" },
    { label: "No reclassification", value: rows.filter((r) => r.result.status === "no_reclassification").length, color: "text-green-700" },
    { label: "Needs review", value: rows.filter((r) => r.result.status === "needs_review").length, color: "text-amber-700" },
    { label: "Already the provider", value: rows.filter((r) => r.result.status === "not_applicable_original_provider").length, color: "text-slate-600" },
    { label: "Promoted to Provider", value: rows.filter((r) => r.result.newRole === "Provider").length, color: "text-purple-700" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Value-Chain Reclassification</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 9 — Article 25 converts a deployer, distributor, importer or other third party into a
          &quot;provider&quot; of a high-risk system on three triggers: rebranding, substantial modification, or a
          purpose change into high-risk. This module is the authoritative writer of the reclassification trigger
          flags consumed by the obligations matrix.
        </p>
      </div>

      <div className="mb-6 max-w-3xl"><Disclaimer /></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 leading-tight mb-1">{c.label}</p>
            <p className={`text-2xl font-semibold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <ReclassificationTable initialRows={rows} />
    </div>
  );
}
