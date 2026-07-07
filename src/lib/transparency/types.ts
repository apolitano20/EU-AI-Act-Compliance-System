import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { RoleAssessmentResult } from "@/lib/entity-type/roleRules";
import type { HighRiskAssessment } from "@/lib/high-risk/rules";
import type { TransparencyAssessment } from "./rules";

export interface TransparencyRow {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  result: TransparencyAssessment;
  role: RoleAssessmentResult;
  highRisk: HighRiskAssessment;
  lastAssessedAt: Date;
}

export function transparencyConsistencyMessages(row: TransparencyRow): string[] {
  const messages: string[] = [];
  if (["possibly_high_risk", "needs_review"].includes(row.highRisk.status) && row.result.friaStatus !== "not_required") {
    messages.push("FRIA depends on Annex III high-risk status — Module 7 has not confirmed it for this system; review that first.");
  }
  if (row.role.likelyRoles.length === 0 || row.role.confidenceLabel === "low" || row.role.confidenceLabel === "insufficient_information") {
    messages.push("The Module 2 role is uncertain — which Article 50 duty applies (provider vs deployer) depends on it.");
  }
  return messages;
}
