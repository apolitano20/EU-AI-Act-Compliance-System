import { Disclaimer } from "@/components/shared/disclaimer";
import { ExclusionSummaryCards } from "@/components/exclusions/exclusion-summary-cards";
import { ExclusionTable } from "@/components/exclusions/exclusion-table";
import { listExclusionRows } from "@/lib/exclusions/store";

export const dynamic = "force-dynamic";

export default async function ExclusionsPage() {
  const rows = await listExclusionRows();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Exclusions</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 5 — evaluates the Article 2 carve-outs that remove an otherwise in-scope system from the Act:
          military/defence/national-security, third-country law-enforcement cooperation, scientific R&amp;D and
          pre-market development, free and open-source release, and personal non-professional use. Each carve-out is
          narrow and conditional — the conditions that would revoke it are surfaced rather than declaring a clean exclusion.
        </p>
      </div>

      <div className="mb-6 max-w-3xl"><Disclaimer /></div>

      <ExclusionSummaryCards rows={rows} />
      <ExclusionTable initialRows={rows} />
    </div>
  );
}
