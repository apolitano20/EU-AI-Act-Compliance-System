import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { ObligationContext, ObligationMatrixAssessment } from "./obligationRules";

export interface ObligationRowView {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  context: ObligationContext;
  result: ObligationMatrixAssessment;
  lastAssessedAt: Date;
}

export function obligationConsistencyMessages(row: ObligationRowView): string[] {
  const messages: string[] = [];
  const c = row.context;
  if (["possibly_high_risk", "needs_review"].includes(c.highRiskStatus)) {
    messages.push("The Module 7 high-risk classification needs review — the emitted obligation set may change once it is settled.");
  }
  if (c.definitionClassification === "insufficient_information") {
    messages.push("The Module 3 AI-system gate is unsettled for this item.");
  }
  if (row.result.status === "suppressed_out_of_scope" || row.result.status === "suppressed_gate_not_met") {
    messages.push(
      "Obligation rows are suppressed: the system appears out of scope (Module 4), fully excluded (Module 5), or likely not an AI system (Module 3). Revisit those modules if circumstances change."
    );
  }
  if (["needs_review", "possibly_in_scope"].includes(c.scopeStatus) && row.result.status === "assessed") {
    messages.push("The Module 4 scope status is unresolved — the obligation set assumes the Act applies.");
  }
  return messages;
}
