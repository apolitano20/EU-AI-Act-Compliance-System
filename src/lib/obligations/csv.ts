import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { ObligationRowView } from "./types";

// The CSV exports the FLATTENED per-obligation rows (system x obligation).
const HEADER = [
  "systemName",
  "effectiveRoles",
  "obligationId",
  "obligationName",
  "dutyHolder",
  "status",
  "obligationType",
  "legalBasisCitation",
  "applicableFromDate",
  "guidanceStatus",
  "note",
  "sourceVersionDate",
  "lastAssessedAt",
];

export function toObligationCSV(rows: ObligationRowView[]): string {
  const flat: unknown[][] = [];
  for (const row of rows) {
    for (const o of row.result.rows) {
      flat.push([
        row.system.systemName,
        row.result.effectiveRoles.join("; "),
        o.obligationId,
        o.name,
        o.dutyHolder.join("; "),
        o.status,
        o.obligationType,
        o.legalBasis,
        o.applicableFromDate,
        o.guidanceStatus,
        o.note ?? "",
        row.result.sourceVersionDate,
        row.lastAssessedAt.toISOString(),
      ]);
    }
  }
  return buildCsv(HEADER, flat);
}

export function downloadObligationCSV(rows: ObligationRowView[], filename = "obligations-matrix.csv"): void {
  downloadCSVFile(toObligationCSV(rows), filename);
}
