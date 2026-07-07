import { getAssessmentBundle, listAssessmentBundles, moduleLastAssessedAt, type AssessmentBundle } from "@/lib/assessment-pipeline";
import type { HighRiskRow } from "./types";

function toRow(bundle: AssessmentBundle): HighRiskRow {
  return {
    system: bundle.system,
    normalized: bundle.normalized,
    answers: bundle.highRiskAnswers,
    result: bundle.highRisk,
    role: bundle.role,
    exclusions: bundle.exclusions,
    prohibited: bundle.prohibited,
    article25Signals: {
      rebrandedThirdPartySystem: bundle.roleAnswers.rebrandedThirdPartySystem,
      substantiallyModifiedSystem: bundle.roleAnswers.substantiallyModifiedSystem,
      changedIntendedPurpose: bundle.roleAnswers.changedIntendedPurpose,
    },
    lastAssessedAt: moduleLastAssessedAt(bundle.system, "high-risk") ?? bundle.system.updatedAt,
  };
}

export async function listHighRiskRows(): Promise<HighRiskRow[]> {
  return (await listAssessmentBundles()).map(toRow);
}

export async function getHighRiskRow(id: string): Promise<HighRiskRow | null> {
  const bundle = await getAssessmentBundle(id);
  return bundle ? toRow(bundle) : null;
}
