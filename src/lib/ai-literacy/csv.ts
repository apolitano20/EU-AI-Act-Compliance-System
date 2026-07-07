import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { LiteracyRow } from "./types";

const HEADER = [
  "systemName",
  "role",
  "obligationApplies",
  "measuresInPlace",
  "status",
  "confidenceScore",
  "confidenceLabel",
  "keyUncertainty",
  "legalBasisCitation",
  "applicableFromDate",
  "guidanceStatus",
  "sourceVersionDate",
  "lastAssessedAt",
];

export function toLiteracyCSV(rows: LiteracyRow[]): string {
  return buildCsv(
    HEADER,
    rows.map((row) => [
      row.system.systemName,
      typeof row.answers.literacyRole === "string" ? row.answers.literacyRole : "",
      row.result.status === "obligation_likely_applies" ? "yes" : row.result.status === "not_applicable_role" ? "no" : "needs review",
      row.result.measuresState,
      row.result.status,
      row.result.confidenceScore,
      row.result.confidenceLabel,
      row.result.keyUncertainties[0] ?? "",
      "Art 4; Recital 20",
      row.result.applicableFromDate,
      row.result.firedRules.map((r) => `${r.ruleId}:${r.guidanceStatus}`).join("; "),
      row.result.sourceVersionDate,
      row.lastAssessedAt.toISOString(),
    ])
  );
}

export function downloadLiteracyCSV(rows: LiteracyRow[], filename = "ai-literacy-assessment.csv"): void {
  downloadCSVFile(toLiteracyCSV(rows), filename);
}
