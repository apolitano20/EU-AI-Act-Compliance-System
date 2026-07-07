import { Disclaimer } from "@/components/shared/disclaimer";
import { LiteracyTable } from "@/components/ai-literacy/literacy-table";
import { listLiteracyRows } from "@/lib/ai-literacy/store";
import { rollUpLiteracyMeasures } from "@/lib/ai-literacy/types";
import { LITERACY_IN_FLUX_NOTE } from "@/lib/ai-literacy/literacyRules";

export const dynamic = "force-dynamic";

export default async function AiLiteracyPage() {
  const rows = await listLiteracyRows();
  const rollup = rollUpLiteracyMeasures(rows);

  const cards = [
    { label: "Applies to all AI systems", value: "Yes", color: "text-blue-700" },
    { label: "In force since", value: "2025-02-02", color: "text-slate-800" },
    { label: "Systems where obligation applies", value: rollup.applicable, color: "text-blue-700" },
    { label: "Documented measures", value: rollup.documented, color: "text-green-700" },
    { label: "Informal measures only", value: rollup.informal, color: "text-amber-700" },
    { label: "No measures", value: rollup.none, color: "text-red-700" },
    { label: "Measures state unknown", value: rollup.unknown, color: "text-slate-600" },
    { label: "Omnibus softening", value: "Draft", color: "text-orange-700" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Literacy</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 8 — Article 4 is a horizontal obligation: it applies to every provider/deployer of any AI system
          regardless of risk tier (including minimal-risk and otherwise-excluded systems). Evaluated per system,
          rolled up to an organisation-level measures state.
        </p>
      </div>

      <div className="mb-4 max-w-3xl"><Disclaimer /></div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-6 text-xs text-orange-800 max-w-3xl">
        {LITERACY_IN_FLUX_NOTE}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 leading-tight mb-1">{c.label}</p>
            <p className={`text-xl font-semibold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <LiteracyTable initialRows={rows} />
    </div>
  );
}
