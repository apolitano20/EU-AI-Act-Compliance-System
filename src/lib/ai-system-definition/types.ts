import type { AISystem } from "@/generated/prisma/client";
import type { NormalizedAISystemFormData } from "../ai-system-data";
import type { AiDefinitionAssessment } from "./definitionRules";

// One row of the AI-definition summary: the inventory system plus the
// deterministic assessment computed live from its current field values.
// There is no separate assessment table — this is recomputed on every load,
// so it can never drift from Module 1.
export interface AiDefinitionRow {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  result: AiDefinitionAssessment;
  lastAssessedAt: Date;
}

// Module 2 role assessments may need review if the item doesn't clear the gate.
export function needsModule2ConsistencyWarning(result: AiDefinitionAssessment): boolean {
  return result.classification === "likely_not_ai_system" || result.classification === "insufficient_information";
}
