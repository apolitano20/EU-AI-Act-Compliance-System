import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { LiteracyRow } from "./types";

function toRow(bundle: AssessmentBundle): LiteracyRow {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.literacyAnswers,
    result: bundle.literacy,
    role: bundle.role,
    definition: bundle.definition,
    highRiskStatus: bundle.highRisk.status,
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "ai-literacy") ?? bundle.system.updatedAt,
  };
}

export async function listLiteracyRows(): Promise<LiteracyRow[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getLiteracyRow(id: string): Promise<LiteracyRow | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
