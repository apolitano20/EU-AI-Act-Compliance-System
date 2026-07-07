import type { RemediationCsvRow } from "./csv";

const DAY = 24 * 60 * 60 * 1000;
const CLOSED = ["completed", "verified"];
const INACTIVE = ["completed", "verified", "not_applicable"];

export interface RemediationSummary {
  total: number;
  open: number;
  inProgress: number;
  blocked: number;
  closed: number;
  unassigned: number;
  overdueOrSoon: number;
  recurringActive: number;
  progressPct: number;
}

export function summarizeRemediation(rows: RemediationCsvRow[]): RemediationSummary {
  const now = Date.now();
  const closed = rows.filter((r) => CLOSED.includes(r.item.status)).length;
  return {
    total: rows.length,
    open: rows.filter((r) => r.item.status === "open").length,
    inProgress: rows.filter((r) => r.item.status === "in_progress").length,
    blocked: rows.filter((r) => r.item.status === "blocked").length,
    closed,
    unassigned: rows.filter((r) => !r.item.owner).length,
    overdueOrSoon: rows.filter((r) => {
      if (INACTIVE.includes(r.item.status)) return false;
      const due = r.item.dueDate ?? r.item.nextDueAt;
      return !!due && due.getTime() - now <= 30 * DAY;
    }).length,
    recurringActive: rows.filter((r) => r.item.recurrenceKind !== "one_off" && r.item.status !== "not_applicable").length,
    progressPct: rows.length > 0 ? Math.round((100 * closed) / rows.length) : 0,
  };
}
