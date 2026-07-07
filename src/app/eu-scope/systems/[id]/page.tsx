import { notFound } from "next/navigation";
import { getEuScopeRow } from "@/lib/eu-scope/store";
import { scopeConsistencyMessages } from "@/lib/eu-scope/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { FiredRulesPanel, IndicatorGrid, MissingFieldsPanel, ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { ScopeQuestionnaire } from "@/components/eu-scope/scope-questionnaire";

export const dynamic = "force-dynamic";

export default async function EuScopeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getEuScopeRow(id);
  if (!row) notFound();

  const { system, normalized, result } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/eu-scope" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={scopeConsistencyMessages(row)} />

      <ScopeQuestionnaire
        systemId={system.id}
        initialAnswers={row.answers}
        derivable={{
          countriesUsed: normalized.countriesUsed,
          outputsUsedInEu: normalized.outputsUsedInEu,
          usesGpaiOrLlm: normalized.usesGpaiOrLlm,
          riskDomainFlags: normalized.riskDomainFlags,
        }}
      />

      <FiredRulesPanel rules={result.firedRules} title="Article 2(1) triggers and Art 22/54 determination" />
      <IndicatorGrid result={result} />
      <MissingFieldsPanel missingFields={result.missingFields} systemId={system.id} />
      <p className="text-xs text-slate-400">
        Rules version: {result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
