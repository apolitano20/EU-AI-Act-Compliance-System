import { notFound } from "next/navigation";
import { getTransparencyRow } from "@/lib/transparency/store";
import { transparencyConsistencyMessages } from "@/lib/transparency/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { FiredRulesPanel, IndicatorGrid, MissingFieldsPanel, ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { TransparencyQuestionnaire } from "@/components/transparency/transparency-questionnaire";

export const dynamic = "force-dynamic";

export default async function TransparencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getTransparencyRow(id);
  if (!row) notFound();

  const { system, normalized, result } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/transparency" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={transparencyConsistencyMessages(row)} />

      <TransparencyQuestionnaire
        systemId={system.id}
        initialAnswers={row.answers}
        derivable={{
          interactsDirectlyWithPeople: normalized.interactsDirectlyWithPeople,
          generatesContent: normalized.generatesContent,
          outputTypes: normalized.outputTypes,
          systemTypes: normalized.systemTypes,
          riskDomainFlags: normalized.riskDomainFlags,
        }}
        upstream={{ highRiskStatus: row.highRisk.status, roleConfidenceLabel: row.role.confidenceLabel }}
      />

      <FiredRulesPanel rules={result.firedRules} title="Article 50 + FRIA rules fired" />
      <IndicatorGrid result={result} />
      <MissingFieldsPanel missingFields={result.missingFields} systemId={system.id} />
      <p className="text-xs text-slate-400">
        Rules version: {result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
