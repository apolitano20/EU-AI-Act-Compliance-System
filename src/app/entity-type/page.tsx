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

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-800 max-w-3xl">
        This tool supports EU AI Act readiness assessment. It does not provide legal advice. Results should be reviewed by qualified legal or compliance professionals before regulatory decisions are made.
      </div>

      <EntitySummaryCards rows={rows} />
      <EntityTypeTable initialRows={rows} />
    </div>
  );
}
