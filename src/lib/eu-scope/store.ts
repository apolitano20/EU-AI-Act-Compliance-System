import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { EuScopeRow } from "./types";

function toRow(bundle: AssessmentBundle): EuScopeRow {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.scopeAnswers,
    result: bundle.scope,
    role: bundle.role,
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "eu-scope") ?? bundle.system.updatedAt,
  };
}

export async function listEuScopeRows(): Promise<EuScopeRow[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getEuScopeRow(id: string): Promise<EuScopeRow | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
