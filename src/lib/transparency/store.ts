import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { TransparencyRow } from "./types";

function toRow(bundle: AssessmentBundle): TransparencyRow {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.transparencyAnswers,
    result: bundle.transparency,
    role: bundle.role,
    highRisk: bundle.highRisk,
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "transparency") ?? bundle.system.updatedAt,
  };
}

export async function listTransparencyRows(): Promise<TransparencyRow[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getTransparencyRow(id: string): Promise<TransparencyRow | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
