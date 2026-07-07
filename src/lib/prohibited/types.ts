import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { ExclusionAssessment } from "@/lib/exclusions/exclusionRules";
import type { ProhibitedAssessment } from "./rules";

export interface ProhibitedRow {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  result: ProhibitedAssessment;
  exclusions: ExclusionAssessment;
  lastAssessedAt: Date;
}

export function prohibitedConsistencyMessages(row: ProhibitedRow): string[] {
  const messages: string[] = [];
  if (row.exclusions.status === "needs_review" || row.exclusions.status === "possibly_excluded_partial_conditional") {
    messages.push(
      "The Module 5 exclusion status for this system is uncertain — a prohibited-practice finding may be moot if a carve-out fully applies. Settle the exclusion assessment first."
    );
  }
  const biometricsUnknown = row.normalized.dataTypes.length === 0 || row.normalized.dataTypes.includes("Not sure");
  const contextUnknown = !row.normalized.deploymentContext || row.normalized.deploymentContext === "Not sure";
  if (biometricsUnknown || contextUnknown) {
    messages.push(
      "Module 1 biometric-data and/or deployment-context fields are missing — the biometric prohibitions (Art 5(1)(e)-(h)) cannot be reliably screened."
    );
  }
  return messages;
}
