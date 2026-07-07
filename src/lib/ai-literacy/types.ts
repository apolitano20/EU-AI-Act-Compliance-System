import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { RoleAssessmentResult } from "@/lib/entity-type/roleRules";
import type { AiDefinitionAssessment } from "@/lib/ai-system-definition/definitionRules";
import type { LiteracyAssessment } from "./literacyRules";

export interface LiteracyRow {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  result: LiteracyAssessment;
  role: RoleAssessmentResult;
  definition: AiDefinitionAssessment;
  /** Module 7 status, used for the proportionality note. */
  highRiskStatus: string;
  lastAssessedAt: Date;
}

export function literacyConsistencyMessages(row: LiteracyRow): string[] {
  const messages: string[] = [];
  if (row.role.likelyRoles.length === 0 || row.role.confidenceLabel === "low" || row.role.confidenceLabel === "insufficient_information") {
    messages.push("The Module 2 role is uncertain — the Article 4 applicability determination inherits that uncertainty.");
  }
  if (row.definition.classification === "insufficient_information") {
    messages.push("The Module 3 AI-system gate is uncertain for this item — settle it before relying on the Article 4 determination.");
  }
  return messages;
}

/** Organisation-level rollup of the per-system measures state. */
export function rollUpLiteracyMeasures(rows: LiteracyRow[]): {
  applicable: number;
  documented: number;
  informal: number;
  none: number;
  unknown: number;
} {
  const applicable = rows.filter((r) => r.result.status === "obligation_likely_applies");
  return {
    applicable: applicable.length,
    documented: applicable.filter((r) => r.result.measuresState === "documented").length,
    informal: applicable.filter((r) => r.result.measuresState === "informal").length,
    none: applicable.filter((r) => r.result.measuresState === "none").length,
    unknown: applicable.filter((r) => r.result.measuresState === "unknown").length,
  };
}
