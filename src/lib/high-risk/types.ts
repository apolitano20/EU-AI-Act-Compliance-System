import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { RoleAssessmentResult } from "@/lib/entity-type/roleRules";
import type { ExclusionAssessment } from "@/lib/exclusions/exclusionRules";
import type { ProhibitedAssessment } from "@/lib/prohibited/rules";
import type { HighRiskAssessment } from "./rules";

export interface HighRiskRow {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  result: HighRiskAssessment;
  role: RoleAssessmentResult;
  exclusions: ExclusionAssessment;
  prohibited: ProhibitedAssessment;
  /** Module 2 raw Article 25 signals (forwarded to the client recompute). */
  article25Signals: {
    rebrandedThirdPartySystem?: string;
    substantiallyModifiedSystem?: string;
    changedIntendedPurpose?: string;
  };
  lastAssessedAt: Date;
}

export function highRiskConsistencyMessages(row: HighRiskRow): string[] {
  const messages: string[] = [];
  if (row.prohibited.status === "needs_review" || row.prohibited.status === "possibly_prohibited") {
    messages.push(
      "Module 6 is unresolved for this system — a prohibited-practice finding overrides high-risk classification. Settle the Article 5 screening first."
    );
  }
  if (row.role.likelyRoles.length === 0 || row.role.confidenceLabel === "low" || row.role.confidenceLabel === "insufficient_information") {
    messages.push("The Module 2 role is uncertain — the role-conditional obligation set cannot be finalised.");
  }
  if (row.exclusions.status === "needs_review" || row.exclusions.status === "possibly_excluded_partial_conditional") {
    messages.push("The Module 5 exclusion status is unresolved — a carve-out could remove this system before high-risk duties attach.");
  }
  messages.push(
    "All carve-out rules and enforcement dates rest on draft/provisional 2026 guidance and may change before 2027-12-02 / 2028-08-02."
  );
  return messages;
}
