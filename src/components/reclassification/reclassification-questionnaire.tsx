"use client";

import { useCallback } from "react";
import { ModuleQuestionnaire } from "@/components/shared/module-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import {
  buildReclassificationAssessment,
  RECLASSIFICATION_QUESTIONS,
  RECLASSIFICATION_MODULE_KEY,
  RECLASSIFICATION_STATUS_TEXT,
  type ReclassificationAssessment,
  type ReclassificationStatus,
} from "@/lib/reclassification/reclassificationRules";
import type { ModuleAnswers } from "@/lib/assessment-shared";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<ReclassificationStatus, string> = {
  reclassification_likely_triggered: "bg-red-100 text-red-800 border-red-200",
  no_reclassification: "bg-green-100 text-green-800 border-green-200",
  needs_review: "bg-amber-100 text-amber-800 border-amber-200",
  not_applicable_original_provider: "bg-slate-100 text-slate-700 border-slate-200",
};

export function ReclassificationStatusBadge({ status }: { status: ReclassificationStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_CLASSES[status])}>
      {RECLASSIFICATION_STATUS_TEXT[status].split(" — ")[0]}
    </span>
  );
}

function ResultPanel({ result }: { result: ReclassificationAssessment }) {
  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</h2>
          <ConfidenceBadge label={result.confidenceLabel} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ReclassificationStatusBadge status={result.status} />
          <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Triggers</p>
          <ul className="space-y-0.5 text-xs text-slate-600">
            <li>Rebrand (Art 25(1)(a)): {result.triggerFlags.rebranded ? "fired" : "not fired"}</li>
            <li>Substantial modification (Art 25(1)(b)): {result.triggerFlags.substantialModification ? "fired" : "not fired"}</li>
            <li>Purpose change to high-risk (Art 25(1)(c)): {result.triggerFlags.purposeChangedToHighRisk ? "fired" : "not fired"}</li>
          </ul>
        </div>
        {result.newRole && (
          <p className="text-xs text-red-700 font-medium">
            New role: {result.newRole} — the full Article 16 provider obligation set now applies; Module 12 must be
            regenerated under the provider role.
          </p>
        )}
        {result.originalProviderCooperation && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Original-provider cooperation (Art 25(2)-(3))</p>
            <p className="text-xs text-slate-600">{result.originalProviderCooperation}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
          <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
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

export function ReclassificationQuestionnaire({ systemId, initialAnswers, upstream }: {
  systemId: string;
  initialAnswers: ModuleAnswers;
  upstream: { highRiskStatus: string; roleConfidenceLabel: string; purposeChangeReported: boolean };
}) {
  const computeResult = useCallback(
    (answers: ModuleAnswers) => buildReclassificationAssessment(answers, upstream),
    [upstream]
  );

  return (
    <ModuleQuestionnaire
      moduleKey={RECLASSIFICATION_MODULE_KEY}
      systemId={systemId}
      questions={RECLASSIFICATION_QUESTIONS}
      initialAnswers={initialAnswers}
      computeResult={computeResult}
      renderResult={(result) => <ResultPanel result={result} />}
      title="Article 25 trigger questionnaire"
    />
  );
}
