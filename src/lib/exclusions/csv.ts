import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { ExclusionRow } from "./types";

const HEADER = [
  "systemName",
  "exclusionStatus",
  "matchedCarveOuts",
  "conditionalityWarning",
  "reEntryTriggers",
  "openSourceGpaiResidualDuty",
  "confidenceScore",
  "confidenceLabel",
  "keyUncertainty",
  "legalBasisCitations",
  "guidanceStatus",
  "sourceVersionDate",
  "lastAssessedAt",
];

export function toExclusionCSV(rows: ExclusionRow[]): string {
  return buildCsv(
    HEADER,
    rows.map((row) => [
      row.system.systemName,
      row.result.status,
      row.result.firedRules.map((r) => r.citation).join("; "),
      row.result.revokingConditions.join("; "),
      row.result.reEntryTriggers.join("; "),
      row.result.openSourceGpaiResidualDutyFlag ? "yes" : "no",
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

export function downloadExclusionCSV(rows: ExclusionRow[], filename = "exclusions-assessment.csv"): void {
  downloadCSVFile(toExclusionCSV(rows), filename);
}
