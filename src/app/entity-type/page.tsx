import { Disclaimer } from "@/components/shared/disclaimer";
import { listEntityTypeRows } from "@/lib/entity-type/assessment-store";
import { EntitySummaryCards } from "@/components/entity-type/entity-summary-cards";
import { EntityTypeTable } from "@/components/entity-type/entity-type-table";

export const dynamic = "force-dynamic";

export default async function EntityTypePage() {
  const rows = await listEntityTypeRows();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Entity Type / Role Classification</h1>
        <p className="text-slate-500 mt-1 text-sm max-w-2xl">
          For each AI system in your inventory, answer a short factual questionnaire to see the EU AI Act role(s) your organisation likely holds.
        </p>
      </div>

      <div className="mb-6 max-w-3xl"><Disclaimer /></div>

      <EntitySummaryCards rows={rows} />
      <EntityTypeTable initialRows={rows} />
    </div>
  );
}
