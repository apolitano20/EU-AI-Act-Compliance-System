import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { ReclassificationRow } from "./types";

function toRow(bundle: AssessmentBundle): ReclassificationRow {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.reclassificationAnswers,
    result: bundle.reclassification,
    role: bundle.role,
    highRisk: bundle.highRisk,
    upstream: {
      highRiskStatus: bundle.highRisk.status,
      roleConfidenceLabel: bundle.role.confidenceLabel,
      purposeChangeReported: bundle.roleAnswers.changedIntendedPurpose === "Yes",
    },
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "reclassification") ?? bundle.system.updatedAt,
  };
}

export async function listReclassificationRows(): Promise<ReclassificationRow[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getReclassificationRow(id: string): Promise<ReclassificationRow | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
