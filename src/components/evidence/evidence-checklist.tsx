"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { saveModuleAnswers } from "@/app/assessments/actions";
import { buildReadinessAssessment, EVIDENCE_OPTIONS, READINESS_MODULE_KEY, type ReadinessAssessment } from "@/lib/evidence/evidenceRules";
import type { ObligationRow } from "@/lib/obligations/obligationRules";
import type { ModuleAnswers } from "@/lib/assessment-shared";
import { ReadinessStatusBadge } from "./readiness-badges";
import { GuidanceStatusBadge } from "@/components/shared/guidance-status-badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Disclaimer } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { Save, Wrench } from "lucide-react";

export function EvidenceChecklist({ systemId, initialAnswers, matrix }: {
  systemId: string;
  initialAnswers: ModuleAnswers;
  matrix: {
    rows: ObligationRow[];
    status: string;
    confidenceLabel: string;
    effectiveRoles: string[];
    registrationRequired: boolean;
    standardsConformityRoute: string;
    notHighRiskDocumentationFlag: boolean;
  };
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<ModuleAnswers>(initialAnswers);
  const [saving, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const result: ReadinessAssessment = useMemo(() => buildReadinessAssessment(matrix, answers), [matrix, answers]);

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      try {
        await saveModuleAnswers(READINESS_MODULE_KEY, systemId, answers);
        setSaved(true);
        router.refresh();
      } catch {
        setSaveError("Saving failed. Please try again.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-1">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Evidence checklist (one question per applicable Module 12 obligation)
        </h2>
        {result.checklist.length === 0 && (
          <p className="text-sm text-slate-500 py-4">No applicable obligations — nothing to evidence.</p>
        )}
        {result.checklist.map((row) => (
          <div key={row.obligationId} className="py-3 border-b border-slate-100 last:border-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-semibold text-slate-500">{row.obligationId}</span>
                <GuidanceStatusBadge status={row.guidanceStatus} className="ml-2" />
                <span className="ml-2 text-[11px] text-slate-400">
                  {row.legalBasis} · from {row.applicableFromDate}
                </span>
                <p className="text-sm text-slate-800 mt-1">{row.question}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Required: {row.requiredArtifacts.join("; ")}</p>
              </div>
              <ReadinessStatusBadge status={row.readinessStatus} />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {EVIDENCE_OPTIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => { setAnswers((prev) => ({ ...prev, [row.obligationId]: o })); setSaved(false); }}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs border transition-colors",
                    answers[row.obligationId] === o
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
        {result.checklist.length > 0 && (
          <>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-1.5 mt-4">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : saved ? "Saved" : "Save evidence states"}
            </Button>
            {saveError && <p className="text-xs text-red-500 text-center mt-2">{saveError}</p>}
          </>
        )}
      </div>

      <div className="lg:sticky lg:top-6 space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Readiness</h2>
            <ConfidenceBadge label={result.confidenceLabel} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{result.readinessScore}<span className="text-base font-medium text-slate-400">/100</span></p>
            <p className="text-xs text-slate-500 mt-1">
              {result.counts.evidence_in_place} of {result.applicableCount} applicable obligations have evidence in place
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-0.5">
            <li>In place: {result.counts.evidence_in_place}</li>
            <li>Partial: {result.counts.partial_evidence}</li>
            <li>Gaps / not started: {result.counts.evidence_gap + result.counts.not_started}</li>
            <li>Unknown: {result.counts.unknown_evidence_state}</li>
            <li>Not applicable: {result.counts.not_applicable}</li>
          </ul>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
            <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
          </div>
          <Link href={`/remediation/systems/${systemId}`} className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
            <Wrench className="w-3.5 h-3.5" /> Create remediation items from the gaps (Module 14)
          </Link>
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}
