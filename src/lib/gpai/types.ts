import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { AiDefinitionAssessment } from "@/lib/ai-system-definition/definitionRules";
import type { HighRiskAssessment } from "@/lib/high-risk/rules";
import type { GpaiAssessment } from "./rules";

export interface GpaiRow {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  result: GpaiAssessment;
  definition: AiDefinitionAssessment;
  highRisk: HighRiskAssessment;
  lastAssessedAt: Date;
}

export function gpaiConsistencyMessages(row: GpaiRow): string[] {
  const messages: string[] = [];
  if (row.definition.classification === "likely_not_ai_system" || row.definition.classification === "insufficient_information") {
    messages.push("Module 3 flagged this item as 'likely not an AI system' or 'insufficient information' — review the gate before relying on this GPAI assessment.");
  }
  if (row.result.gpaiInHighRiskContext && ["possibly_high_risk", "needs_review"].includes(row.highRisk.status)) {
    messages.push("The GPAI model is integrated into a system whose Module 7 high-risk status is unresolved — review that first.");
  }
  return messages;
}
