"use client";

import { useCallback } from "react";
import { ModuleQuestionnaire } from "@/components/shared/module-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import {
  buildTransparencyAssessment,
  TRANSPARENCY_QUESTIONS,
  TRANSPARENCY_MODULE_KEY,
  type TransparencyAssessment,
  type TransparencyDerivableData,
  type Article50Status,
  type FriaStatus,
} from "@/lib/transparency/rules";
import type { ModuleAnswers } from "@/lib/assessment-shared";
import { cn } from "@/lib/utils";

const ART50_CLASSES: Record<Article50Status, string> = {
  likely_transparency_duties: "bg-blue-100 text-blue-800 border-blue-200",
  possibly_transparency_duties: "bg-amber-100 text-amber-800 border-amber-200",
  needs_review: "bg-red-100 text-red-700 border-red-200",
  likely_no_transparency_duties: "bg-slate-100 text-slate-700 border-slate-200",
};

export const ART50_LABELS: Record<Article50Status, string> = {
  likely_transparency_duties: "Likely Art 50 duties",
  possibly_transparency_duties: "Possibly Art 50 duties",
  needs_review: "Needs review",
  likely_no_transparency_duties: "Likely no Art 50 duties",
};

const FRIA_CLASSES: Record<FriaStatus, string> = {
  likely_required: "bg-purple-100 text-purple-800 border-purple-200",
  possibly_required: "bg-amber-100 text-amber-800 border-amber-200",
  not_required: "bg-slate-100 text-slate-700 border-slate-200",
  needs_review: "bg-red-100 text-red-700 border-red-200",
};

export const FRIA_LABELS: Record<FriaStatus, string> = {
  likely_required: "FRIA likely required",
  possibly_required: "FRIA possibly required",
  not_required: "FRIA not required",
  needs_review: "FRIA needs review",
};

export function Article50Badge({ status }: { status: Article50Status }) {
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", ART50_CLASSES[status])}>{ART50_LABELS[status]}</span>;
}

export function FriaBadge({ status }: { status: FriaStatus }) {
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", FRIA_CLASSES[status])}>{FRIA_LABELS[status]}</span>;
}

function ResultPanel({ result }: { result: TransparencyAssessment }) {
  return (
    <>
      {/* Article 50 panel */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Article 50 — transparency</h2>
          <ConfidenceBadge label={result.confidenceLabel} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Article50Badge status={result.status} />
          <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
        </div>
        {result.article50Rules.length > 0 && (
          <ul className="space-y-0.5 text-xs text-slate-600">
            {result.article50Rules.map((r) => (
              <li key={r.ruleId}>
                <span className="font-mono font-semibold">{r.ruleId}</span> — {r.citation}
              </li>
            ))}
          </ul>
        )}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Role-conditional duties</p>
          <ul className="space-y-0.5 text-xs text-slate-600">
            <li>Provider: {result.roleConditionalObligation.provider}</li>
            <li>Deployer: {result.roleConditionalObligation.deployer}</li>
            <li>Both: {result.roleConditionalObligation.both}</li>
          </ul>
        </div>
        <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
      </div>

      {/* Distinct FRIA panel */}
      <div className="bg-white rounded-lg border border-purple-200 p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Article 27 — FRIA (distinct trigger set)</h2>
        <FriaBadge status={result.friaStatus} />
        <p className="text-xs text-slate-600">{result.friaReasoning}</p>
        <p className="text-xs text-slate-500">{result.registrationNote}</p>
      </div>
      <Disclaimer />
    </>
  );
}

export function TransparencyQuestionnaire({ systemId, initialAnswers, derivable, upstream }: {
  systemId: string;
  initialAnswers: ModuleAnswers;
  derivable: TransparencyDerivableData;
  upstream: { highRiskStatus: string; roleConfidenceLabel: string };
}) {
  const computeResult = useCallback(
    (answers: ModuleAnswers) => buildTransparencyAssessment(derivable, answers, upstream),
    [derivable, upstream]
  );

  return (
    <ModuleQuestionnaire
      moduleKey={TRANSPARENCY_MODULE_KEY}
      systemId={systemId}
      questions={TRANSPARENCY_QUESTIONS}
      initialAnswers={initialAnswers}
      computeResult={computeResult}
      renderResult={(result) => <ResultPanel result={result} />}
      title="Article 50 + FRIA questionnaire"
    />
  );
}
