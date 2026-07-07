import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { HighRiskRow } from "./types";

const HEADER = [
  "systemName",
  "route",
  "matchedAnnexIiiAreas",
  "status",
  "carveOutApplied",
  "registrationRequired",
  "notHighRiskDocumentationFlag",
  "applicableFromDate",
  "standardsConformityRoute",
  "confidenceScore",
  "confidenceLabel",
  "keyUncertainty",
  "legalBasisCitations",
  "guidanceStatus",
  "sourceVersionDate",
  "lastAssessedAt",
];

export function toHighRiskCSV(rows: HighRiskRow[]): string {
  return buildCsv(
    HEADER,
    rows.map((row) => [
      row.system.systemName,
      row.result.route,
      row.result.matchedAnnexIiiAreas.join("; "),
      row.result.status,
      row.result.carveOutApplied ? "yes" : "no",
      row.result.registrationRequired ? "yes" : "no",
      row.result.notHighRiskDocumentationFlag ? "yes" : "no",
      row.result.applicableFromDate ?? "",
      row.result.standardsConformityRoute,
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

export function downloadHighRiskCSV(rows: HighRiskRow[], filename = "high-risk-classification.csv"): void {
  downloadCSVFile(toHighRiskCSV(rows), filename);
}
