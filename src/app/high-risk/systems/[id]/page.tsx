import { notFound } from "next/navigation";
import { getHighRiskRow } from "@/lib/high-risk/store";
import { highRiskConsistencyMessages } from "@/lib/high-risk/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { FiredRulesPanel, IndicatorGrid, MissingFieldsPanel, ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { HighRiskQuestionnaire } from "@/components/high-risk/high-risk-questionnaire";

export const dynamic = "force-dynamic";

export default async function HighRiskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getHighRiskRow(id);
  if (!row) notFound();

  const { system, normalized, result } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/high-risk" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={highRiskConsistencyMessages(row)} />

      <HighRiskQuestionnaire
        systemId={system.id}
        initialAnswers={row.answers}
        derivable={{
          riskDomainFlags: normalized.riskDomainFlags,
          profilesIndividuals: normalized.profilesIndividuals,
        }}
        upstream={{
          fullyExcluded: row.exclusions.fullExclusion,
          likelyProhibited: row.prohibited.status === "likely_prohibited",
          prohibitedStatus: row.prohibited.status,
          ...row.article25Signals,
        }}
      />

      <FiredRulesPanel rules={result.firedRules} title="Classification rules fired (with guidance-status badges)" />
      <IndicatorGrid result={result} />
      <MissingFieldsPanel missingFields={result.missingFields} systemId={system.id} />
      <p className="text-xs text-slate-400">
        Rules version: {result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
