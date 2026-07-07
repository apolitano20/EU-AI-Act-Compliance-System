import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { ProhibitedRow } from "./types";

function toRow(bundle: AssessmentBundle): ProhibitedRow {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.prohibitedAnswers,
    result: bundle.prohibited,
    exclusions: bundle.exclusions,
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "prohibited") ?? bundle.system.updatedAt,
  };
}

export async function listProhibitedRows(): Promise<ProhibitedRow[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getProhibitedRow(id: string): Promise<ProhibitedRow | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
