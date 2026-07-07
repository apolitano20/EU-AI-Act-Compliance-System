import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { RegisterRow } from "./reportRules";

// The single canonical export of the whole assessment: the portfolio
// obligations register, one row per system x obligation.
const HEADER = [
  "systemName",
  "riskTier",
  "roles",
  "obligationId",
  "obligationName",
  "dutyHolder",
  "legalBasisCitation",
  "applicableFromDate",
  "guidanceStatus",
  "obligationStatus",
  "readinessStatus",
  "remediationStatus",
  "owner",
  "dueDate",
];

export function toPortfolioCSV(rows: RegisterRow[]): string {
  return buildCsv(
    HEADER,
    rows.map((r) => [
      r.systemName,
      r.riskTier,
      r.roles.join("; "),
      r.obligationId,
      r.obligationName,
      r.dutyHolder.join("; "),
      r.legalBasisCitation,
      r.applicableFromDate,
      r.guidanceStatus,
      r.obligationStatus,
      r.readinessStatus,
      r.remediationStatus ?? "",
      r.owner ?? "",
      r.dueDate?.toISOString().slice(0, 10) ?? "",
    ])
  );
}

export function downloadPortfolioCSV(rows: RegisterRow[], filename = "eu-ai-act-portfolio-register.csv"): void {
  downloadCSVFile(toPortfolioCSV(rows), filename);
}
