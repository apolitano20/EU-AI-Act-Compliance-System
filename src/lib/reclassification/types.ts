import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { RoleAssessmentResult } from "@/lib/entity-type/roleRules";
import type { HighRiskAssessment } from "@/lib/high-risk/rules";
import type { ReclassificationAssessment } from "./reclassificationRules";

export interface ReclassificationRow {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  result: ReclassificationAssessment;
  role: RoleAssessmentResult;
  highRisk: HighRiskAssessment;
  /** Forwarded for the client recompute. */
  upstream: { highRiskStatus: string; roleConfidenceLabel: string; purposeChangeReported: boolean };
  lastAssessedAt: Date;
}

export function reclassificationConsistencyMessages(row: ReclassificationRow): string[] {
  const messages: string[] = [];
  if (row.role.likelyRoles.length === 0 || row.role.confidenceLabel === "low" || row.role.confidenceLabel === "insufficient_information") {
    messages.push("The Module 2 role is uncertain — only deployers/distributors/importers/third parties can be converted to provider.");
  }
  if (["possibly_high_risk", "needs_review"].includes(row.highRisk.status)) {
    messages.push(
      "The Module 7 high-risk status needs review — triggers (a)/(b) require confirmed high-risk and trigger (c) requires a confirmed high-risk outcome after the change."
    );
  }
  if (row.result.firedRules.some((r) => r.ruleId === "VCR-5")) {
    messages.push("This determination relies partly on the 2026-05-19 DRAFT high-risk guidelines — treat as needs-review, not confirmed.");
  }
  return messages;
}
