import type { ModuleAnswers } from "@/lib/assessment-shared";
import type { NormalizedAISystemFormData } from "@/lib/ai-system-data";
import type { AISystem } from "@/generated/prisma/client";
import type { ObligationMatrixAssessment, ObligationRow } from "@/lib/obligations/obligationRules";
import type { EvidenceChecklistRow, ReadinessAssessment } from "./evidenceRules";

export interface ReadinessRowView {
  system: AISystem;
  normalized: NormalizedAISystemFormData;
  answers: ModuleAnswers;
  result: ReadinessAssessment;
  matrix: ObligationMatrixAssessment;
  matrixRows: ObligationRow[];
  lastAssessedAt: Date;
}

/** Flattened system x obligation evidence row for the list page + CSV. */
export interface FlatEvidenceRow {
  systemId: string;
  systemName: string;
  row: EvidenceChecklistRow;
}

export function flattenEvidenceRows(rows: ReadinessRowView[]): FlatEvidenceRow[] {
  return rows.flatMap((r) =>
    r.result.checklist.map((row) => ({ systemId: r.system.id, systemName: r.system.systemName, row }))
  );
}

export function readinessConsistencyMessages(row: ReadinessRowView): string[] {
  const messages: string[] = [];
  if (row.matrix.confidenceLabel === "low" || row.matrix.confidenceLabel === "insufficient_information" || row.matrix.possiblyCount + row.matrix.needsReviewCount > 0) {
    messages.push(
      "The parent Module 12 obligation set contains unresolved rows — evidence gaps may be over- or under-stated until the upstream classification is confirmed."
    );
  }
  if (row.result.status === "not_assessed_prohibited") {
    messages.push("Module 6 flags a likely prohibited practice — there is no readiness checklist to complete.");
  }
  return messages;
}
