import { notFound } from "next/navigation";
import { getLiteracyRow } from "@/lib/ai-literacy/store";
import { literacyConsistencyMessages } from "@/lib/ai-literacy/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { FiredRulesPanel, IndicatorGrid, MissingFieldsPanel, ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { LiteracyQuestionnaire } from "@/components/ai-literacy/literacy-questionnaire";
import { LITERACY_IN_FLUX_NOTE } from "@/lib/ai-literacy/literacyRules";

export const dynamic = "force-dynamic";

export default async function AiLiteracyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getLiteracyRow(id);
  if (!row) notFound();

  const { system, result } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/ai-literacy" system={system} />

      <Disclaimer />
      <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-xs text-orange-800">
        {LITERACY_IN_FLUX_NOTE}
      </div>
      <ConsistencyWarning messages={literacyConsistencyMessages(row)} />

      <LiteracyQuestionnaire
        systemId={system.id}
        initialAnswers={row.answers}
        upstream={{
          likelyRoles: row.role.likelyRoles,
          definitionClassification: row.definition.classification,
          roleConfidenceLabel: row.role.confidenceLabel,
          highRiskStatus: row.highRiskStatus,
        }}
      />

      <FiredRulesPanel rules={result.firedRules} title="Article 4 rules (incl. the in-flux Omnibus note)" />
      <IndicatorGrid result={result} />
      <MissingFieldsPanel missingFields={result.missingFields} systemId={system.id} />
      <p className="text-xs text-slate-400">
        Rules version: {result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
