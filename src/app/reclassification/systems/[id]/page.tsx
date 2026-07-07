import { notFound } from "next/navigation";
import { getReclassificationRow } from "@/lib/reclassification/store";
import { reclassificationConsistencyMessages } from "@/lib/reclassification/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { FiredRulesPanel, IndicatorGrid, MissingFieldsPanel, ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { ReclassificationQuestionnaire } from "@/components/reclassification/reclassification-questionnaire";

export const dynamic = "force-dynamic";

export default async function ReclassificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getReclassificationRow(id);
  if (!row) notFound();

  const { system, result } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/reclassification" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={reclassificationConsistencyMessages(row)} />

      <ReclassificationQuestionnaire systemId={system.id} initialAnswers={row.answers} upstream={row.upstream} />

      <FiredRulesPanel rules={result.firedRules} title="Article 25 rules fired" />
      <IndicatorGrid result={result} />
      <MissingFieldsPanel missingFields={result.missingFields} systemId={system.id} />
      <p className="text-xs text-slate-400">
        Rules version: {result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
