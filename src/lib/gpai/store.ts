import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { GpaiRow } from "./types";

function toRow(bundle: AssessmentBundle): GpaiRow {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.gpaiAnswers,
    result: bundle.gpai,
    definition: bundle.definition,
    highRisk: bundle.highRisk,
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "gpai") ?? bundle.system.updatedAt,
  };
}

export async function listGpaiRows(): Promise<GpaiRow[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getGpaiRow(id: string): Promise<GpaiRow | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
