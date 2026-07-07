"use client";

import { useCallback } from "react";
import { ModuleQuestionnaire } from "@/components/shared/module-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ScopeStatusBadge } from "./scope-badges";
import {
  buildScopeAssessment,
  SCOPE_QUESTIONS,
  EU_SCOPE_MODULE_KEY,
  type EuScopeAssessment,
  type ScopeDerivableData,
} from "@/lib/eu-scope/scopeRules";
import type { ModuleAnswers } from "@/lib/assessment-shared";

function ResultPanel({ result }: { result: EuScopeAssessment }) {
  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</h2>
          <ConfidenceBadge label={result.confidenceLabel} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ScopeStatusBadge status={result.status} />
          <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Authorised representative (Art 22 / Art 54)</p>
          <p className="text-xs text-slate-700">
            {result.authorisedRepRequired
              ? `Required before market placement (${result.authorisedRep.citations.join(", ")}).`
              : "No duty identified on the current answers."}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
          <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Role-conditional obligation</p>
          <p className="text-xs text-slate-600">{result.roleConditionalObligation}</p>
        </div>
        {result.keyUncertainties.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Key uncertainties</p>
            <ul className="space-y-1">
              {result.keyUncertainties.map((u) => <li key={u} className="text-xs text-slate-600">- {u}</li>)}
            </ul>
          </div>
        )}
      </div>
      <Disclaimer />
    </>
  );
}

export function ScopeQuestionnaire({ systemId, initialAnswers, derivable }: {
  systemId: string;
  initialAnswers: ModuleAnswers;
  derivable: ScopeDerivableData;
}) {
  const computeResult = useCallback(
    (answers: ModuleAnswers) => buildScopeAssessment(derivable, answers),
    [derivable]
  );

  return (
    <ModuleQuestionnaire
      moduleKey={EU_SCOPE_MODULE_KEY}
      systemId={systemId}
      questions={SCOPE_QUESTIONS}
      initialAnswers={initialAnswers}
      computeResult={computeResult}
      renderResult={(result) => <ResultPanel result={result} />}
      title="EU scope questionnaire"
    />
  );
}
