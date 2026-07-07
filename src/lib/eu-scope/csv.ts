import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { EuScopeRow } from "./types";

const HEADER = [
  "systemName",
  "scopeStatus",
  "matchedTriggers",
  "authorisedRepRequired",
  "authorisedRepCitations",
  "confidenceScore",
  "confidenceLabel",
  "keyUncertainty",
  "legalBasisCitations",
  "guidanceStatus",
  "sourceVersionDate",
  "lastAssessedAt",
];

export function toEuScopeCSV(rows: EuScopeRow[]): string {
  return buildCsv(
    HEADER,
    rows.map((row) => [
      row.system.systemName,
      row.result.status,
      row.result.matchedTriggers.join("; "),
      row.result.authorisedRepRequired ? "yes" : "no",
      row.result.authorisedRep.citations.join("; "),
      row.result.confidenceScore,
      row.result.confidenceLabel,
      row.result.keyUncertainties[0] ?? "",
      row.result.firedRules.map((r) => r.citation).join("; "),
      row.result.firedRules.map((r) => `${r.ruleId}:${r.guidanceStatus}`).join("; "),
      row.result.sourceVersionDate,
      row.lastAssessedAt.toISOString(),
    ])
  );
}

export function downloadEuScopeCSV(rows: EuScopeRow[], filename = "eu-scope-assessment.csv"): void {
  downloadCSVFile(toEuScopeCSV(rows), filename);
}
