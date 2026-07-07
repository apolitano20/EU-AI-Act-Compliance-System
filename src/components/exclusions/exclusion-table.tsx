"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { ExclusionRow } from "@/lib/exclusions/types";
import { downloadExclusionCSV } from "@/lib/exclusions/csv";
import { ExclusionStatusBadge, EXCLUSION_STATUS_LABELS } from "./exclusion-badges";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import type { ExclusionStatus } from "@/lib/exclusions/exclusionRules";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, AlertTriangle } from "lucide-react";

const CARVE_OUT_OPTIONS = [
  "Article 2(3)",
  "Article 2(4)",
  "Article 2(6)",
  "Article 2(8)",
  "Article 2(10)",
  "Article 2(12) with Art 53/54 GPAI nuances",
] as const;

const FILTERS: AssessmentFilterSpec<ExclusionRow>[] = [
  {
    key: "status",
    label: "Exclusion status",
    options: Object.keys(EXCLUSION_STATUS_LABELS),
    display: (v) => EXCLUSION_STATUS_LABELS[v as ExclusionStatus],
    predicate: (row, v) => row.result.status === v,
  },
  {
    key: "carveOut",
    label: "Carve-out type",
    options: CARVE_OUT_OPTIONS,
    display: (v) => v.replace(" with Art 53/54 GPAI nuances", ""),
    predicate: (row, v) => row.result.firedRules.some((r) => r.citation === v),
  },
  {
    key: "conditionality",
    label: "Conditional vs full",
    options: ["Full exclusion", "Conditional/partial"],
    predicate: (row, v) =>
      v === "Full exclusion" ? row.result.fullExclusion : row.result.status === "possibly_excluded_partial_conditional",
  },
  {
    key: "openSource",
    label: "Open-source flag",
    options: ["Yes", "No"],
    predicate: (row, v) =>
      (row.answers.openSourceRelease === "Yes – free and open-source" ||
        row.answers.openSourceRelease === "Open-source but high-risk/prohibited/transparency-triggering") === (v === "Yes"),
  },
];

export function ExclusionTable({ initialRows }: { initialRows: ExclusionRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<ExclusionRow>[] = [
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
      id: "status",
      header: "Exclusion status",
      cell: ({ row }) => <ExclusionStatusBadge status={row.original.result.status} />,
    },
    {
      id: "carveOut",
      header: "Matched carve-out",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700">
          {row.original.result.firedRules.map((r) => r.citation.replace(" with Art 53/54 GPAI nuances", "")).join(", ") || "-"}
        </span>
      ),
    },
    {
      id: "conditionality",
      header: "Conditionality",
      cell: ({ row }) =>
        row.original.result.revokingConditions.length > 0 ? (
          <span className="inline-flex items-start gap-1 text-xs text-amber-700 max-w-[220px]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{row.original.result.revokingConditions[0]}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
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
          onClick={() => router.push(`/exclusions/systems/${row.original.system.id}`)}
        >
          <ClipboardCheck className="w-3.5 h-3.5" /> Assess exclusions
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
      onExport={downloadExclusionCSV}
    />
  );
}
