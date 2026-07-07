"use client";

import { useCallback } from "react";
import { ModuleQuestionnaire } from "@/components/shared/module-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ProhibitedStatusBadge } from "./prohibited-badges";
import {
  buildProhibitedAssessment,
  PROHIBITED_QUESTIONS,
  PROHIBITED_MODULE_KEY,
  type ProhibitedAssessment,
  type ProhibitedDerivableData,
  type ProhibitedUpstream,
} from "@/lib/prohibited/rules";
import type { ModuleAnswers } from "@/lib/assessment-shared";

function ResultPanel({ result }: { result: ProhibitedAssessment }) {
  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</h2>
          <ConfidenceBadge label={result.confidenceLabel} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ProhibitedStatusBadge status={result.status} />
          <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
          <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Applies to every operator (Article 5)</p>
          <ul className="space-y-0.5 text-xs text-slate-600">
            <li>Provider: {result.roleConditionalObligation.provider}</li>
            <li>Deployer: {result.roleConditionalObligation.deployer}</li>
            <li>Importer/Distributor: {result.roleConditionalObligation.importerDistributor}</li>
          </ul>
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

export function ProhibitedQuestionnaire({ systemId, initialAnswers, derivable, upstream }: {
  systemId: string;
  initialAnswers: ModuleAnswers;
  derivable: ProhibitedDerivableData;
  upstream: ProhibitedUpstream;
}) {
  const computeResult = useCallback(
    (answers: ModuleAnswers) => buildProhibitedAssessment(derivable, answers, upstream),
    [derivable, upstream]
  );

  return (
    <ModuleQuestionnaire
      moduleKey={PROHIBITED_MODULE_KEY}
      systemId={systemId}
      questions={PROHIBITED_QUESTIONS}
      initialAnswers={initialAnswers}
      computeResult={computeResult}
      renderResult={(result) => <ResultPanel result={result} />}
      title="Article 5 screening questionnaire"
    />
  );
}
