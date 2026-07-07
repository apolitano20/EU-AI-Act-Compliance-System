"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReclassificationRow } from "@/lib/reclassification/types";
import { downloadReclassificationCSV } from "@/lib/reclassification/csv";
import { ReclassificationStatusBadge } from "./reclassification-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import { CURRENT_ROLE_OPTIONS, RECLASSIFICATION_STATUS_TEXT, type ReclassificationStatus } from "@/lib/reclassification/reclassificationRules";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

const TRIGGER_OPTIONS = ["Rebrand", "Substantial modification", "Purpose change"] as const;

const FILTERS: AssessmentFilterSpec<ReclassificationRow>[] = [
  {
    key: "originalRole",
    label: "Original role",
    options: CURRENT_ROLE_OPTIONS,
    predicate: (row, v) => row.answers.currentRole === v,
  },
  {
    key: "trigger",
    label: "Trigger type",
    options: TRIGGER_OPTIONS,
    predicate: (row, v) =>
      v === "Rebrand"
        ? row.result.triggerFlags.rebranded
        : v === "Substantial modification"
          ? row.result.triggerFlags.substantialModification
          : row.result.triggerFlags.purposeChangedToHighRisk,
  },
  {
    key: "status",
    label: "Status",
    options: Object.keys(RECLASSIFICATION_STATUS_TEXT),
    display: (v) => RECLASSIFICATION_STATUS_TEXT[v as ReclassificationStatus].split(" — ")[0],
    predicate: (row, v) => row.result.status === v,
  },
  {
    key: "registration",
    label: "Registration required",
    options: ["Yes", "No"],
    predicate: (row, v) => row.result.registrationRequired === (v === "Yes"),
  },
];

export function ReclassificationTable({ initialRows }: { initialRows: ReclassificationRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<ReclassificationRow>[] = [
    {
      id: "systemName",
      accessorFn: (row) => row.system.systemName,
      header: sortableHeader("System name"),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900 text-sm">{row.original.system.systemName}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{row.original.system.shortDescription}</p>
        </div>
      ),
    },
    {
      id: "originalRole",
      header: "Original role",
      cell: ({ row }) => <span className="text-xs text-slate-700">{(row.original.answers.currentRole as string) ?? "-"}</span>,
    },
    {
      id: "triggers",
      header: "Trigger(s) fired",
      cell: ({ row }) => {
        const f = row.original.result.triggerFlags;
        const fired = [f.rebranded && "Rebrand", f.substantialModification && "Substantial modification", f.purposeChangedToHighRisk && "Purpose change"].filter(Boolean);
        return <span className="text-xs text-slate-700">{fired.join(", ") || "-"}</span>;
      },
    },
    {
      id: "newRole",
      header: "New role",
      cell: ({ row }) =>
        row.original.result.newRole ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
            Provider (Art 25)
          </span>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
    },
    {
      id: "registration",
      header: "Registration required",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.original.result.registrationRequired ? "Art 49 / Annex VIII" : "No"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <ReclassificationStatusBadge status={row.original.result.status} />,
    },
    {
      id: "confidence",
      header: "Confidence",
      cell: ({ row }) => <ConfidenceBadge label={row.original.result.confidenceLabel} />,
    },
    {
      id: "keyUncertainty",
      header: "Key uncertainty",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 line-clamp-2 max-w-[220px] block">
          {row.original.result.keyUncertainties[0] ?? "-"}
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
          onClick={() => router.push(`/reclassification/systems/${row.original.system.id}`)}
        >
          <ClipboardCheck className="w-3.5 h-3.5" /> Assess
        </Button>
      ),
    },
  ];

  return (
    <AssessmentTable
      rows={initialRows}
      columns={columns}
      filters={FILTERS}
      searchText={(row) => `${row.system.systemName} ${row.system.shortDescription}`}
      onExport={downloadReclassificationCSV}
    />
  );
}
