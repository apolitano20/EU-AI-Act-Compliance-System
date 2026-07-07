"use client";

import { useCallback } from "react";
import { ModuleQuestionnaire } from "@/components/shared/module-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import {
  buildLiteracyAssessment,
  LITERACY_QUESTIONS,
  AI_LITERACY_MODULE_KEY,
  LITERACY_STATUS_TEXT,
  type LiteracyAssessment,
  type LiteracyBuildUpstream,
} from "@/lib/ai-literacy/literacyRules";
import type { ModuleAnswers } from "@/lib/assessment-shared";
import { cn } from "@/lib/utils";

function StatusBadge({ result }: { result: LiteracyAssessment }) {
  const cls =
    result.status === "obligation_likely_applies"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : result.status === "not_applicable_role"
        ? "bg-slate-100 text-slate-700 border-slate-200"
        : "bg-amber-100 text-amber-800 border-amber-200";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cls)}>
      {LITERACY_STATUS_TEXT[result.status].split(" — ")[0]}
    </span>
  );
}

function ResultPanel({ result }: { result: LiteracyAssessment }) {
  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</h2>
          <ConfidenceBadge label={result.confidenceLabel} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge result={result} />
          <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
        </div>
        <p className="text-xs text-slate-600">{LITERACY_STATUS_TEXT[result.status]}</p>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
          <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Who is obligated (Article 4)</p>
          <ul className="space-y-0.5 text-xs text-slate-600">
            <li>Provider/Deployer: {result.roleConditionalObligation.providerDeployer}</li>
            <li>Importer/Distributor: {result.roleConditionalObligation.importerDistributor}</li>
            <li>Authorised representative: {result.roleConditionalObligation.authorisedRepresentative}</li>
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

export function LiteracyQuestionnaire({ systemId, initialAnswers, upstream }: {
  systemId: string;
  initialAnswers: ModuleAnswers;
  upstream: LiteracyBuildUpstream;
}) {
  const computeResult = useCallback(
    (answers: ModuleAnswers) => buildLiteracyAssessment(answers, upstream),
    [upstream]
  );

  return (
    <ModuleQuestionnaire
      moduleKey={AI_LITERACY_MODULE_KEY}
      systemId={systemId}
      questions={LITERACY_QUESTIONS}
      initialAnswers={initialAnswers}
      computeResult={computeResult}
      renderResult={(result) => <ResultPanel result={result} />}
      title="Article 4 AI-literacy questionnaire"
    />
  );
}
