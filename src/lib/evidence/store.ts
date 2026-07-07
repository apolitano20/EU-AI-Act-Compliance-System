import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { ReadinessRowView } from "./types";

function toRow(bundle: AssessmentBundle): ReadinessRowView {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.evidenceAnswers,
    result: bundle.readiness,
    matrix: bundle.obligations,
    matrixRows: bundle.obligations.rows,
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "readiness") ?? bundle.system.updatedAt,
  };
}

export async function listReadinessRows(): Promise<ReadinessRowView[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getReadinessRow(id: string): Promise<ReadinessRowView | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
