"use client";

import { useCallback } from "react";
import { ModuleQuestionnaire } from "@/components/shared/module-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ExclusionStatusBadge } from "./exclusion-badges";
import {
  buildExclusionAssessment,
  EXCLUSION_QUESTIONS,
  EXCLUSIONS_MODULE_KEY,
  type ExclusionAssessment,
  type ExclusionDerivableData,
} from "@/lib/exclusions/exclusionRules";
import type { ModuleAnswers } from "@/lib/assessment-shared";

function ResultPanel({ result }: { result: ExclusionAssessment }) {
  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</h2>
          <ConfidenceBadge label={result.confidenceLabel} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExclusionStatusBadge status={result.status} />
          <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
        </div>
        {result.revokingConditions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Conditions that would revoke the carve-out</p>
            <ul className="space-y-1">
              {result.revokingConditions.map((c) => <li key={c} className="text-xs text-amber-700">- {c}</li>)}
            </ul>
          </div>
        )}
        {result.reEntryTriggers.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Re-entry triggers</p>
            <ul className="space-y-1">
              {result.reEntryTriggers.map((t) => <li key={t} className="text-xs text-orange-700">- {t}</li>)}
            </ul>
          </div>
        )}
        {result.openSourceGpaiResidualDutyFlag && (
          <p className="text-xs text-purple-700">
            Open-source GPAI: certain Article 53 documentation duties remain unless systemic risk.
          </p>
        )}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
          <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Role-conditional note</p>
          <p className="text-xs text-slate-600">{result.roleConditionalObligation}</p>
        </div>
      </div>
      <Disclaimer />
    </>
  );
}

export function ExclusionQuestionnaire({ systemId, initialAnswers, derivable }: {
  systemId: string;
  initialAnswers: ModuleAnswers;
  derivable: ExclusionDerivableData;
}) {
  const computeResult = useCallback(
    (answers: ModuleAnswers) => buildExclusionAssessment(derivable, answers),
    [derivable]
  );

  return (
    <ModuleQuestionnaire
      moduleKey={EXCLUSIONS_MODULE_KEY}
      systemId={systemId}
      questions={EXCLUSION_QUESTIONS}
      initialAnswers={initialAnswers}
      computeResult={computeResult}
      renderResult={(result) => <ResultPanel result={result} />}
      title="Article 2 carve-out questionnaire"
    />
  );
}
