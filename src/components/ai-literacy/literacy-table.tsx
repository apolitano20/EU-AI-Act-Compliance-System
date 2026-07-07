"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { LiteracyRow } from "@/lib/ai-literacy/types";
import { downloadLiteracyCSV } from "@/lib/ai-literacy/csv";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import { LITERACY_ROLE_OPTIONS, MEASURES_OPTIONS } from "@/lib/ai-literacy/literacyRules";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const MEASURE_LABELS: Record<string, string> = {
  documented: "Documented",
  informal: "Informal only",
  none: "None",
  unknown: "Unknown",
};

const FILTERS: AssessmentFilterSpec<LiteracyRow>[] = [
  {
    key: "role",
    label: "Role",
    options: LITERACY_ROLE_OPTIONS,
    predicate: (row, v) => row.answers.literacyRole === v,
  },
  {
    key: "measures",
    label: "Measures in place",
    options: MEASURES_OPTIONS,
    predicate: (row, v) => row.answers.measuresInPlace === v,
  },
  {
    key: "confidence",
    label: "Confidence",
    options: ["high", "medium", "low", "insufficient_information"],
    display: (v) => (v === "insufficient_information" ? "Insufficient info" : v[0].toUpperCase() + v.slice(1)),
    predicate: (row, v) => row.result.confidenceLabel === v,
  },
  {
    key: "applies",
    label: "Obligation applies",
    options: ["Yes", "No", "Needs review"],
    predicate: (row, v) =>
      v === "Yes"
        ? row.result.status === "obligation_likely_applies"
        : v === "No"
          ? row.result.status === "not_applicable_role"
          : row.result.status === "needs_review",
  },
];

export function LiteracyTable({ initialRows }: { initialRows: LiteracyRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<LiteracyRow>[] = [
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
      id: "role",
      header: "Role",
      cell: ({ row }) => <span className="text-xs text-slate-700">{(row.original.answers.literacyRole as string) ?? "-"}</span>,
    },
    {
      id: "applies",
      header: "Obligation applies",
      cell: ({ row }) => {
        const s = row.original.result.status;
        const cls =
          s === "obligation_likely_applies"
            ? "bg-blue-100 text-blue-800 border-blue-200"
            : s === "not_applicable_role"
              ? "bg-slate-100 text-slate-700 border-slate-200"
              : "bg-amber-100 text-amber-800 border-amber-200";
        const label = s === "obligation_likely_applies" ? "Yes (Art 4)" : s === "not_applicable_role" ? "No" : "Needs review";
        return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cls)}>{label}</span>;
      },
    },
    {
      id: "measures",
      header: "Measures in place",
      cell: ({ row }) => <span className="text-xs text-slate-700">{MEASURE_LABELS[row.original.result.measuresState]}</span>,
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
          onClick={() => router.push(`/ai-literacy/systems/${row.original.system.id}`)}
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
      onExport={downloadLiteracyCSV}
    />
  );
}
