import { Disclaimer } from "@/components/shared/disclaimer";
import { ScopeSummaryCards } from "@/components/eu-scope/scope-summary-cards";
import { ScopeTable } from "@/components/eu-scope/scope-table";
import { listEuScopeRows } from "@/lib/eu-scope/store";

export const dynamic = "force-dynamic";

export default async function EuScopePage() {
  const rows = await listEuScopeRows();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">EU Scope &amp; Applicability</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 4 — determines whether the EU AI Act applies to each inventory item at all (Article 2(1) triggers),
          and whether a non-EU provider must appoint an EU authorised representative before market placement
          (Article 22 / Article 54). Reuses Module 1 and Module 2 data; only missing answers are asked.
        </p>
      </div>

      <div className="mb-6 max-w-3xl"><Disclaimer /></div>

      <ScopeSummaryCards rows={rows} />
      <ScopeTable initialRows={rows} />
    </div>
  );
}
