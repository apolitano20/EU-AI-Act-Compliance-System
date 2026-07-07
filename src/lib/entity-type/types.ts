import type { AISystem } from "@/generated/prisma/client";
import type { Answers, RoleAssessmentResult } from "./roleRules";

// One row of the entity-type summary: the inventory system plus its (possibly
// empty) questionnaire answers and the deterministic result computed from them.
export interface EntityTypeRow {
  system: AISystem;
  answers: Answers;
  result: RoleAssessmentResult;
  lastAssessedAt: Date | null;
}

export function internalExternalUseLabel(answers: Answers): string {
  const v = answers.madeAvailableOutsideOrganisation;
  if (v === "Yes") return "External";
  if (v === "No") return "Internal only";
  if (v === "Not applicable") return "Not applicable";
  return "Not sure / unanswered";
}
