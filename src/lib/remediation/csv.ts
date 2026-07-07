import type { RemediationItem } from "@/generated/prisma/client";
import { buildCsv, downloadCSVFile } from "@/lib/csv";

const HEADER = [
  "systemName",
  "task",
  "sourceObligation",
  "sourceGapStatus",
  "owner",
  "dueDate",
  "suggestedDueDate",
  "recurrence",
  "cadence",
  "status",
  "priority",
  "nextDueAt",
  "legalBasisCitation",
  "applicableFromDate",
  "guidanceStatus",
];

export interface RemediationCsvRow {
  systemName: string;
  item: RemediationItem;
}

export function toRemediationCSV(rows: RemediationCsvRow[]): string {
  return buildCsv(
    HEADER,
    rows.map(({ systemName, item }) => [
      systemName,
      item.title,
      item.obligationId,
      item.sourceGapStatus,
      item.owner ?? "",
      item.dueDate?.toISOString().slice(0, 10) ?? "",
      item.suggestedDueDate?.toISOString().slice(0, 10) ?? "",
      item.recurrenceKind,
      item.cadence ?? "",
      item.status,
      item.priority,
      item.nextDueAt?.toISOString().slice(0, 10) ?? "",
      item.legalBasisCitation,
      item.applicableFromDate ?? "",
      item.guidanceStatus,
    ])
  );
}

export function downloadRemediationCSV(rows: RemediationCsvRow[], filename = "remediation-plan.csv"): void {
  downloadCSVFile(toRemediationCSV(rows), filename);
}
