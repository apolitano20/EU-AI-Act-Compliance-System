import { notFound } from "next/navigation";
import Link from "next/link";
import { getGpaiRow } from "@/lib/gpai/store";
import { gpaiConsistencyMessages } from "@/lib/gpai/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { FiredRulesPanel, IndicatorGrid, MissingFieldsPanel, ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { GpaiQuestionnaire } from "@/components/gpai/gpai-questionnaire";

export const dynamic = "force-dynamic";

export default async function GpaiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getGpaiRow(id);
  if (!row) notFound();

  const { system, normalized, result } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/gpai" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={gpaiConsistencyMessages(row)} />

      <GpaiQuestionnaire systemId={system.id} initialAnswers={row.answers} />

      <FiredRulesPanel rules={result.firedRules} title="GPAI rules fired (Art 51/53/55)" />
      <IndicatorGrid result={result} />
      <MissingFieldsPanel missingFields={result.missingFields} systemId={system.id} />

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Inventory evidence used</h3>
        <ul className="text-xs text-slate-600 space-y-0.5">
          <li>Uses GPAI/LLM: {normalized.usesGpaiOrLlm ?? "-"}</li>
          <li>Underlying model/tool: {normalized.underlyingModelOrTool ?? "-"}</li>
          <li>Model provider: {normalized.modelProvider ?? normalized.modelProviderName ?? "-"}</li>
          <li>Build type: {normalized.buildType ?? "-"}</li>
          <li>Modified/fine-tuned/rebranded/repurposed: {normalized.modifiedFineTunedRebrandedOrRepurposed ?? "-"}</li>
        </ul>
        <Link href={`/inventory/${system.id}`} className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          View full inventory record →
        </Link>
      </div>

      <p className="text-xs text-slate-400">
        Rules version: {result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
