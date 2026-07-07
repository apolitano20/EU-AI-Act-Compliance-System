import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { TransparencyRow } from "./types";

const HEADER = [
  "systemName",
  "role",
  "article50Triggers",
  "friaTrigger",
  "transparencyStatus",
  "friaStatus",
  "confidenceScore",
  "confidenceLabel",
  "keyUncertainty",
  "legalBasisCitations",
  "applicableFrom",
  "guidanceStatus",
  "sourceVersionDate",
  "lastAssessedAt",
];

export function toTransparencyCSV(rows: TransparencyRow[]): string {
  return buildCsv(
    HEADER,
    rows.map((row) => [
      row.system.systemName,
      typeof row.answers.tr_q6 === "string" ? row.answers.tr_q6 : "",
      row.result.article50Rules.map((r) => r.ruleId).join("; "),
      row.result.friaRules.map((r) => r.ruleId).join("; "),
      row.result.status,
      row.result.friaStatus,
      row.result.confidenceScore,
      row.result.confidenceLabel,
      row.result.keyUncertainties[0] ?? "",
      row.result.firedRules.map((r) => r.citation).join("; "),
      row.result.firedRules.map((r) => `${r.ruleId}:${r.guidanceStatus}`).join("; "),
      row.result.firedRules.map((r) => r.ruleId).join("; "),
      row.result.sourceVersionDate,
      row.lastAssessedAt.toISOString(),
    ])
  );
}

export function downloadTransparencyCSV(rows: TransparencyRow[], filename = "transparency-obligations.csv"): void {
  downloadCSVFile(toTransparencyCSV(rows), filename);
}
