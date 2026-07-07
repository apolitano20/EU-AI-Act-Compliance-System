import { Disclaimer } from "@/components/shared/disclaimer";
import { TransparencyTable } from "@/components/transparency/transparency-table";
import { listTransparencyRows } from "@/lib/transparency/store";

export const dynamic = "force-dynamic";

export default async function TransparencyPage() {
  const rows = await listTransparencyRows();

  const cards = [
    { label: "Total systems", value: rows.length, color: "text-slate-800" },
    { label: "Likely Art 50 duties", value: rows.filter((r) => r.result.status === "likely_transparency_duties").length, color: "text-blue-700" },
    { label: "Deepfake / synthetic-content systems", value: rows.filter((r) => r.result.article50Rules.some((x) => x.ruleId === "TR-R2" || x.ruleId === "TR-R4")).length, color: "text-orange-700" },
    { label: "Emotion / biometric systems", value: rows.filter((r) => r.result.article50Rules.some((x) => x.ruleId === "TR-R3")).length, color: "text-purple-700" },
    { label: "FRIA likely required (Art 27)", value: rows.filter((r) => r.result.friaStatus === "likely_required").length, color: "text-purple-700" },
    { label: "Possible / needs review", value: rows.filter((r) => r.result.status === "possibly_transparency_duties" || r.result.status === "needs_review").length, color: "text-amber-700" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Transparency Obligations</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 11 — Article 50 disclosure duties (provider: direct-interaction disclosure, synthetic-content marking;
          deployer: emotion/biometric disclosure, deepfake disclosure, public-interest text disclosure) plus the
          distinct Article 27 Fundamental Rights Impact Assessment with its own trigger set.
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

      <TransparencyTable initialRows={rows} />
    </div>
  );
}
