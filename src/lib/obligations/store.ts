import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { ObligationRowView } from "./types";

function toRow(bundle: AssessmentBundle): ObligationRowView {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.obligationAnswers,
    context: bundle.obligationContext,
    result: bundle.obligations,
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "obligations") ?? bundle.system.updatedAt,
  };
}

export async function listObligationRows(): Promise<ObligationRowView[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getObligationRow(id: string): Promise<ObligationRowView | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
