import { notFound } from "next/navigation";
import { getExclusionRow } from "@/lib/exclusions/store";
import { exclusionConsistencyMessages } from "@/lib/exclusions/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { FiredRulesPanel, IndicatorGrid, MissingFieldsPanel, ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { ExclusionQuestionnaire } from "@/components/exclusions/exclusion-questionnaire";

export const dynamic = "force-dynamic";

export default async function ExclusionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getExclusionRow(id);
  if (!row) notFound();

  const { system, normalized, result } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/exclusions" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={exclusionConsistencyMessages(row)} />

      <ExclusionQuestionnaire
        systemId={system.id}
        initialAnswers={row.answers}
        derivable={{
          status: normalized.status,
          buildType: normalized.buildType,
          usesGpaiOrLlm: normalized.usesGpaiOrLlm,
        }}
      />

      <FiredRulesPanel rules={result.firedRules} title="Article 2 carve-outs evaluated" />
      <IndicatorGrid result={result} />
      <MissingFieldsPanel missingFields={result.missingFields} systemId={system.id} />
      <p className="text-xs text-slate-400">
        Rules version: {result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
