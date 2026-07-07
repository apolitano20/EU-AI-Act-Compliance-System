import { Disclaimer } from "@/components/shared/disclaimer";
import { GpaiTable } from "@/components/gpai/gpai-table";
import { listGpaiRows } from "@/lib/gpai/store";

export const dynamic = "force-dynamic";

export default async function GpaiPage() {
  const rows = await listGpaiRows();

  const cards = [
    { label: "Systems with a GPAI/LLM component", value: rows.filter((r) => r.normalized.usesGpaiOrLlm === "Yes").length, color: "text-slate-800" },
    { label: "Likely GPAI providers (Art 53)", value: rows.filter((r) => r.result.status === "likely_gpai_provider").length, color: "text-purple-700" },
    { label: "Possible systemic risk (Art 55) — needs review", value: rows.filter((r) => r.result.status === "possibly_systemic_risk_needs_review").length, color: "text-red-700" },
    { label: "Downstream on third-party GPAI", value: rows.filter((r) => r.result.isDownstreamConsumer).length, color: "text-blue-700" },
    { label: "GPAI in potentially high-risk systems", value: rows.filter((r) => r.result.gpaiInHighRiskContext).length, color: "text-orange-700" },
    { label: "Insufficient information", value: rows.filter((r) => r.result.status === "insufficient_information").length, color: "text-amber-700" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">GPAI Obligations</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 10 — covers three angles: providing a GPAI model (Article 53, plus Article 55 if systemic risk),
          building downstream on a third-party GPAI model (Annex XII information-flow reliance), and GPAI integrated
          into potentially high-risk systems. Systemic risk by Commission designation is surfaced as an uncertainty,
          not a hard rule.
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

      <GpaiTable initialRows={rows} />
    </div>
  );
}
