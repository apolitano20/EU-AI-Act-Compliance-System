import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { ExclusionRow } from "./types";

function toRow(bundle: AssessmentBundle): ExclusionRow {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.exclusionAnswers,
    result: bundle.exclusions,
    scope: bundle.scope,
    definition: bundle.definition,
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "exclusions") ?? bundle.system.updatedAt,
  };
}

export async function listExclusionRows(): Promise<ExclusionRow[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getExclusionRow(id: string): Promise<ExclusionRow | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
