import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { RoleAssessmentResult } from "@/lib/entity-type/roleRules";
import type { EuScopeAssessment } from "./scopeRules";

export interface EuScopeRow {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  result: EuScopeAssessment;
  role: RoleAssessmentResult;
  lastAssessedAt: Date;
}

/** Scope + authorised-rep duty depend on the Module 2 role. */
export function needsRoleConsistencyWarning(role: RoleAssessmentResult): boolean {
  return role.likelyRoles.length === 0 || role.confidenceLabel === "low" || role.confidenceLabel === "insufficient_information";
}

export function scopeConsistencyMessages(row: EuScopeRow): string[] {
  const messages: string[] = [];
  if (needsRoleConsistencyWarning(row.role)) {
    messages.push(
      "The Module 2 entity role for this system is uncertain — scope triggers and the authorised-representative duty depend on it. Review the role assessment first."
    );
  }
  if (row.result.status === "likely_in_scope" || row.result.status === "possibly_in_scope") {
    messages.push(
      "A pending Module 5 exclusion (Article 2 carve-outs) may render an in-scope finding moot — check the Exclusions module."
    );
  }
  return messages;
}
