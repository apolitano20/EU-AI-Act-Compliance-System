import { Disclaimer } from "@/components/shared/disclaimer";
import { listAiDefinitionRows } from "@/lib/ai-system-definition/store";
import { DefinitionSummaryCards } from "@/components/ai-system-definition/definition-summary-cards";
import { DefinitionTable } from "@/components/ai-system-definition/definition-table";

export const dynamic = "force-dynamic";

export default async function AiSystemDefinitionPage() {
  const rows = await listAiDefinitionRows();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI System Definition Gate</h1>
        <p className="text-slate-500 mt-1 text-sm max-w-2xl">
          For each inventory item, this screens whether it likely meets the EU AI Act definition of an &quot;AI system&quot;, using the technical details already captured in Module 1.
        </p>
      </div>

      <div className="mb-6 max-w-3xl"><Disclaimer /></div>

      <DefinitionSummaryCards rows={rows} />
      <DefinitionTable initialRows={rows} />
    </div>
  );
}
