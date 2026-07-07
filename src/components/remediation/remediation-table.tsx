"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { downloadRemediationCSV, type RemediationCsvRow } from "@/lib/remediation/csv";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import { GuidanceStatusBadge } from "@/components/shared/guidance-status-badge";
import { REMEDIATION_PRIORITIES, REMEDIATION_STATUSES } from "@/lib/remediation/remediationRules";
import type { GuidanceStatus } from "@/lib/assessment-shared";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const DAY = 24 * 60 * 60 * 1000;

const FILTERS: AssessmentFilterSpec<RemediationCsvRow>[] = [
  {
    key: "status",
    label: "Status",
    options: REMEDIATION_STATUSES,
    display: (v) => v.replace(/_/g, " "),
    predicate: (row, v) => row.item.status === v,
  },
  {
    key: "priority",
    label: "Priority",
    options: REMEDIATION_PRIORITIES,
    predicate: (row, v) => row.item.priority === v,
  },
  {
    key: "owner",
    label: "Owner assigned",
    options: ["Assigned", "Unassigned"],
    predicate: (row, v) => (v === "Assigned") === !!row.item.owner,
  },
  {
    key: "recurrence",
    label: "Recurrence",
    options: ["one_off", "one_off_then_recurring", "recurring"],
    display: (v) => v.replace(/_/g, " "),
    predicate: (row, v) => row.item.recurrenceKind === v,
  },
  {
    key: "guidance",
    label: "Guidance status",
    options: ["final", "provisional", "draft"],
    predicate: (row, v) => row.item.guidanceStatus === v,
  },
  {
    key: "due",
    label: "Due",
    options: ["Overdue", "Due within 30d", "Due within 90d"],
    predicate: (row, v) => {
      const due = row.item.dueDate ?? row.item.nextDueAt;
      if (!due || ["completed", "verified", "not_applicable"].includes(row.item.status)) return false;
      const delta = due.getTime() - Date.now();
      if (v === "Overdue") return delta < 0;
      if (v === "Due within 30d") return delta >= 0 && delta <= 30 * DAY;
      return delta >= 0 && delta <= 90 * DAY;
    },
  },
];

export function RemediationTable({ initialRows }: { initialRows: RemediationCsvRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<RemediationCsvRow>[] = [
    {
      id: "system",
      accessorFn: (row) => row.systemName,
      header: sortableHeader("System"),
      cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{row.original.systemName}</span>,
    },
    {
      id: "task",
      header: "Task",
      cell: ({ row }) => (
        <div className="max-w-[280px]">
          <span className="text-xs font-mono font-semibold text-slate-500">{row.original.item.obligationId}</span>
          <p className="text-xs text-slate-700 line-clamp-2">{row.original.item.title}</p>
        </div>
      ),
    },
    {
      id: "legalBasis",
      header: "Legal basis",
      cell: ({ row }) => (
        <div className="text-xs text-slate-600">
          {row.original.item.legalBasisCitation}
          <div className="mt-0.5"><GuidanceStatusBadge status={row.original.item.guidanceStatus as GuidanceStatus} /></div>
        </div>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      cell: ({ row }) => (
        <span className={cn("text-xs", row.original.item.owner ? "text-slate-700" : "text-red-600")}>
          {row.original.item.owner ?? "Unassigned"}
        </span>
      ),
    },
    {
      id: "dueDate",
      header: "Due date",
      cell: ({ row }) => {
        const item = row.original.item;
        const due = item.dueDate ?? item.nextDueAt;
        const overdue = due && due < new Date() && !["completed", "verified", "not_applicable"].includes(item.status);
        return (
          <span className={cn("text-xs whitespace-nowrap", overdue ? "text-red-600 font-medium" : "text-slate-600")}>
            {due?.toISOString().slice(0, 10) ?? (item.suggestedDueDate ? `(sugg. ${item.suggestedDueDate.toISOString().slice(0, 10)})` : "-")}
          </span>
        );
      },
    },
    {
      id: "recurrence",
      header: "Recurrence",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 whitespace-nowrap">
          {row.original.item.recurrenceKind.replace(/_/g, " ")}
          {row.original.item.cadence ? ` (${row.original.item.cadence.replace(/_/g, " ")})` : ""}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.item.status.replace(/_/g, " ")}</span>,
    },
    {
      id: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border", PRIORITY_CLASSES[row.original.item.priority])}>
          {row.original.item.priority}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 text-xs"
          onClick={() => router.push(`/remediation/systems/${row.original.item.systemId}`)}
        >
          <Wrench className="w-3.5 h-3.5" /> Board
        </Button>
      ),
    },
  ];

  return (
    <AssessmentTable
      rows={initialRows}
      columns={columns}
      filters={FILTERS}
      searchText={(row) => `${row.systemName} ${row.item.obligationId} ${row.item.title} ${row.item.owner ?? ""}`}
      onExport={downloadRemediationCSV}
      countNoun="items"
      emptyMessage="No remediation items yet — generate a plan from a system's Module 13 gaps."
    />
  );
}
