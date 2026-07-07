import { buildCsv, downloadCSVFile } from "@/lib/csv";
import { PROHIBITED_RULES } from "./rules";
import type { ProhibitedRow } from "./types";

const RULE_BY_ID = new Map(PROHIBITED_RULES.map((r) => [r.id, r]));

const HEADER = [
  "systemName",
  "status",
  "matchedProhibitions",
  "possibleProhibitions",
  "legalBasisCitations",
  "guidanceStatusPerProhibition",
  "applicableFromDates",
  "confidenceScore",
  "confidenceLabel",
  "keyUncertainty",
  "sourceVersionDate",
  "lastAssessedAt",
];

export function toProhibitedCSV(rows: ProhibitedRow[]): string {
  return buildCsv(
    HEADER,
    rows.map((row) => {
      const all = [...row.result.matchedProhibitions, ...row.result.possibleProhibitions];
      return [
        row.system.systemName,
        row.result.status,
        row.result.matchedProhibitions.join("; "),
        row.result.possibleProhibitions.join("; "),
        all.map((id) => RULE_BY_ID.get(id)?.citation ?? id).join("; "),
        all.map((id) => `${id}:${RULE_BY_ID.get(id)?.guidanceStatus}`).join("; "),
        all.map((id) => `${id}:${RULE_BY_ID.get(id)?.applicableFromDate}`).join("; "),
        row.result.confidenceScore,
        row.result.confidenceLabel,
        row.result.keyUncertainties[0] ?? "",
        row.result.sourceVersionDate,
        row.lastAssessedAt.toISOString(),
      ];
    })
  );
}

export function downloadProhibitedCSV(rows: ProhibitedRow[], filename = "prohibited-practices-screening.csv"): void {
  downloadCSVFile(toProhibitedCSV(rows), filename);
}
