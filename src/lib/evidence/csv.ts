import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { FlatEvidenceRow } from "./types";

// Per-obligation evidence rows, consumable by Modules 14/15.
const HEADER = [
  "systemName",
  "obligationId",
  "obligationName",
  "requiredArtifacts",
  "readinessStatus",
  "answer",
  "legalBasisCitation",
  "applicableFromDate",
  "guidanceStatus",
  "obligationType",
];

export function toEvidenceCSV(rows: FlatEvidenceRow[]): string {
  return buildCsv(
    HEADER,
    rows.map(({ systemName, row }) => [
      systemName,
      row.obligationId,
      row.obligationName,
      row.requiredArtifacts.join("; "),
      row.readinessStatus,
      row.answer ?? "",
      row.legalBasis,
      row.applicableFromDate,
      row.guidanceStatus,
      row.obligationType,
    ])
  );
}

export function downloadEvidenceCSV(rows: FlatEvidenceRow[], filename = "evidence-readiness.csv"): void {
  downloadCSVFile(toEvidenceCSV(rows), filename);
}
