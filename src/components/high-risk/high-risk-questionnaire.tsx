"use client";

import { useCallback } from "react";
import { ModuleQuestionnaire } from "@/components/shared/module-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import { HighRiskStatusBadge } from "./high-risk-badges";
import {
  buildHighRiskAssessment,
  HIGH_RISK_QUESTIONS,
  HIGH_RISK_MODULE_KEY,
  type HighRiskAssessment,
  type HighRiskDerivableData,
  type HighRiskUpstream,
} from "@/lib/high-risk/rules";
import type { ModuleAnswers } from "@/lib/assessment-shared";

function ResultPanel({ result }: { result: HighRiskAssessment }) {
  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</h2>
          <ConfidenceBadge label={result.confidenceLabel} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <HighRiskStatusBadge status={result.status} />
          <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
          <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Registration (Art 49 / Annex VIII)</p>
          <p className="text-xs text-slate-600">{result.registrationNote}</p>
        </div>
        {result.notHighRiskDocumentationFlag && (
          <p className="text-xs text-blue-700">
            Article 6(3) documentation flag: the &quot;not high-risk&quot; self-assessment must be documented before
            market placement and registered — &quot;not high-risk&quot; ≠ &quot;nothing to do&quot;.
          </p>
        )}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Role-conditional obligations preview</p>
          <ul className="space-y-0.5 text-xs text-slate-600">
            <li>Provider: {result.roleConditionalObligation.provider}</li>
            <li>Deployer: {result.roleConditionalObligation.deployer}</li>
            <li>Importer: {result.roleConditionalObligation.importer}</li>
            <li>Distributor: {result.roleConditionalObligation.distributor}</li>
          </ul>
        </div>
        {result.standardsConformityRoute !== "not_applicable" && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Conformity route</p>
            <p className="text-xs text-slate-600">{result.standardsConformityRoute}</p>
          </div>
        )}
      </div>
      <Disclaimer />
    </>
  );
}

export function HighRiskQuestionnaire({ systemId, initialAnswers, derivable, upstream }: {
  systemId: string;
  initialAnswers: ModuleAnswers;
  derivable: HighRiskDerivableData;
  upstream: HighRiskUpstream;
}) {
  const computeResult = useCallback(
    (answers: ModuleAnswers) => buildHighRiskAssessment(derivable, answers, upstream),
    [derivable, upstream]
  );

  return (
    <ModuleQuestionnaire
      moduleKey={HIGH_RISK_MODULE_KEY}
      systemId={systemId}
      questions={HIGH_RISK_QUESTIONS}
      initialAnswers={initialAnswers}
      computeResult={computeResult}
      renderResult={(result) => <ResultPanel result={result} />}
      title="High-risk classification questionnaire"
    />
  );
}
