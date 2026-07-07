"use client";

import { ModuleQuestionnaire } from "@/components/shared/module-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import {
  buildGpaiAssessment,
  GPAI_QUESTIONS,
  GPAI_MODULE_KEY,
  type GpaiAssessment,
  type GpaiStatus,
} from "@/lib/gpai/rules";
import type { ModuleAnswers } from "@/lib/assessment-shared";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<GpaiStatus, string> = {
  likely_gpai_provider: "bg-purple-100 text-purple-800 border-purple-200",
  possibly_systemic_risk_needs_review: "bg-red-100 text-red-800 border-red-200",
  downstream_consumer: "bg-blue-100 text-blue-800 border-blue-200",
  gpai_in_high_risk_context: "bg-orange-100 text-orange-800 border-orange-200",
  likely_not_gpai: "bg-slate-100 text-slate-700 border-slate-200",
  insufficient_information: "bg-amber-100 text-amber-800 border-amber-200",
};

export const GPAI_STATUS_LABELS: Record<GpaiStatus, string> = {
  likely_gpai_provider: "Likely GPAI provider (Art 53)",
  possibly_systemic_risk_needs_review: "Possible systemic risk — needs review",
  downstream_consumer: "Downstream consumer",
  gpai_in_high_risk_context: "GPAI in high-risk context",
  likely_not_gpai: "Likely not GPAI",
  insufficient_information: "Insufficient information",
};

export function GpaiStatusBadge({ status }: { status: GpaiStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_CLASSES[status])}>
      {GPAI_STATUS_LABELS[status]}
    </span>
  );
}

function ResultPanel({ result }: { result: GpaiAssessment }) {
  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</h2>
          <ConfidenceBadge label={result.confidenceLabel} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <GpaiStatusBadge status={result.status} />
          <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Systemic risk</p>
          <p className="text-xs text-slate-600">{result.systemicRisk.replace(/_/g, " ")}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
          <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Role-conditional obligations</p>
          <ul className="space-y-0.5 text-xs text-slate-600">
            <li>GPAI model provider: {result.roleConditionalObligation.gpaiModelProvider}</li>
            <li>Downstream provider/deployer: {result.roleConditionalObligation.downstreamProviderDeployer}</li>
            <li>Modifier/fine-tuner: {result.roleConditionalObligation.modifierFineTuner}</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Registration / notification</p>
          <p className="text-xs text-slate-600">{result.registrationNote}</p>
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

export function GpaiQuestionnaire({ systemId, initialAnswers }: { systemId: string; initialAnswers: ModuleAnswers }) {
  return (
    <ModuleQuestionnaire
      moduleKey={GPAI_MODULE_KEY}
      systemId={systemId}
      questions={GPAI_QUESTIONS}
      initialAnswers={initialAnswers}
      computeResult={buildGpaiAssessment}
      renderResult={(result) => <ResultPanel result={result} />}
      title="GPAI questionnaire"
    />
  );
}
