import { Disclaimer } from "@/components/shared/disclaimer";
import { HighRiskSummaryCards } from "@/components/high-risk/high-risk-summary-cards";
import { HighRiskTable } from "@/components/high-risk/high-risk-table";
import { listHighRiskRows } from "@/lib/high-risk/store";
import { HIGH_RISK_GUIDANCE_NOTE } from "@/lib/high-risk/rules";

export const dynamic = "force-dynamic";

export default async function HighRiskPage() {
  const rows = await listHighRiskRows();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">High-Risk Classification</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 7 — classifies each system via the Annex I product-safety route and the Annex III use-case route,
          then applies the Article 6(3) significant-risk carve-out gate (with the profiling override). Runs only for
          systems Module 5 did not exclude and Module 6 did not flag as likely prohibited.
        </p>
      </div>

      <div className="mb-4 max-w-3xl"><Disclaimer /></div>
      <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 mb-6 text-xs text-slate-600 max-w-3xl">
        {HIGH_RISK_GUIDANCE_NOTE}
      </div>

      <HighRiskSummaryCards rows={rows} />
      <HighRiskTable initialRows={rows} />
    </div>
  );
}
