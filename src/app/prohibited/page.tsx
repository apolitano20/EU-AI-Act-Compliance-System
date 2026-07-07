import { Disclaimer } from "@/components/shared/disclaimer";
import { ProhibitedSummaryCards } from "@/components/prohibited/prohibited-summary-cards";
import { ProhibitedTable } from "@/components/prohibited/prohibited-table";
import { listProhibitedRows } from "@/lib/prohibited/store";
import { PROHIBITED_GUIDANCE_NOTE } from "@/lib/prohibited/rules";

export const dynamic = "force-dynamic";

export default async function ProhibitedPage() {
  const rows = await listProhibitedRows();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Prohibited AI Practices</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 6 — screens each system against the eight Article 5 prohibitions plus the provisional Digital
          Omnibus prohibition on AI &apos;nudifiers&apos; / non-consensual intimate imagery and CSAM generation.
          Systems fully excluded by Module 5 are not screened.
        </p>
      </div>

      <div className="mb-4 max-w-3xl"><Disclaimer /></div>
      <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 mb-6 text-xs text-slate-600 max-w-3xl">
        {PROHIBITED_GUIDANCE_NOTE}
      </div>

      <ProhibitedSummaryCards rows={rows} />
      <ProhibitedTable initialRows={rows} />
    </div>
  );
}
