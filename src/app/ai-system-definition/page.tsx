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

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-800 max-w-3xl">
        This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made.
      </div>

      <DefinitionSummaryCards rows={rows} />
      <DefinitionTable initialRows={rows} />
    </div>
  );
}
