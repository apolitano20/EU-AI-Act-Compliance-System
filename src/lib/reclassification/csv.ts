import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { ReclassificationRow } from "./types";

const HEADER = [
  "systemName",
  "originalRole",
  "rebranded",
  "substantialModification",
  "purposeChangedToHighRisk",
  "newRole",
  "registrationRequired",
  "status",
  "confidenceScore",
  "confidenceLabel",
  "keyUncertainty",
  "legalBasisCitations",
  "guidanceStatus",
  "sourceVersionDate",
  "lastAssessedAt",
];

export function toReclassificationCSV(rows: ReclassificationRow[]): string {
  return buildCsv(
    HEADER,
    rows.map((row) => [
      row.system.systemName,
      typeof row.answers.currentRole === "string" ? row.answers.currentRole : "",
      row.result.triggerFlags.rebranded ? "yes" : "no",
      row.result.triggerFlags.substantialModification ? "yes" : "no",
      row.result.triggerFlags.purposeChangedToHighRisk ? "yes" : "no",
      row.result.newRole ?? "",
      row.result.registrationRequired ? "yes" : "no",
      row.result.status,
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

export function downloadReclassificationCSV(rows: ReclassificationRow[], filename = "reclassification-assessment.csv"): void {
  downloadCSVFile(toReclassificationCSV(rows), filename);
}
