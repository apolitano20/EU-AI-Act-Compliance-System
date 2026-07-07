import { notFound } from "next/navigation";
import { getProhibitedRow } from "@/lib/prohibited/store";
import { prohibitedConsistencyMessages } from "@/lib/prohibited/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { FiredRulesPanel, IndicatorGrid, MissingFieldsPanel, ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { ProhibitedQuestionnaire } from "@/components/prohibited/prohibited-questionnaire";

export const dynamic = "force-dynamic";

export default async function ProhibitedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getProhibitedRow(id);
  if (!row) notFound();

  const { system, normalized, result } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/prohibited" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={prohibitedConsistencyMessages(row)} />

      <ProhibitedQuestionnaire
        systemId={system.id}
        initialAnswers={row.answers}
        derivable={{
          dataTypes: normalized.dataTypes,
          systemTypes: normalized.systemTypes,
          riskDomainFlags: normalized.riskDomainFlags,
          deploymentContext: normalized.deploymentContext,
        }}
        upstream={{ fullyExcluded: row.exclusions.fullExclusion, exclusionStatus: row.exclusions.status }}
      />

      <FiredRulesPanel rules={result.firedRules} title="Matched Article 5 prohibitions" />
      <IndicatorGrid result={result} />
      <MissingFieldsPanel missingFields={result.missingFields} systemId={system.id} />
      <p className="text-xs text-slate-400">
        Rules version: {result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
