import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { EuScopeAssessment } from "@/lib/eu-scope/scopeRules";
import type { AiDefinitionAssessment } from "@/lib/ai-system-definition/definitionRules";
import type { ExclusionAssessment } from "./exclusionRules";

export interface ExclusionRow {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  result: ExclusionAssessment;
  scope: EuScopeAssessment;
  definition: AiDefinitionAssessment;
  lastAssessedAt: Date;
}

export function exclusionConsistencyMessages(row: ExclusionRow): string[] {
  const messages: string[] = [];
  if (row.scope.status === "needs_review" || row.scope.status === "possibly_in_scope") {
    messages.push(
      "The Module 4 scope determination for this system is uncertain — exclusions only matter for otherwise in-scope systems. Settle the scope assessment first."
    );
  }
  if (row.definition.classification === "insufficient_information" || !row.normalized.status) {
    messages.push(
      "Module 3 / Module 1 lifecycle data for this system is uncertain — the R&D and open-source carve-outs depend on it."
    );
  }
  return messages;
}
