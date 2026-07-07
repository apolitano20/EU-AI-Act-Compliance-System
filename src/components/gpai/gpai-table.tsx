"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { GpaiRow } from "@/lib/gpai/types";
import { downloadGpaiCSV } from "@/lib/gpai/csv";
import { GpaiStatusBadge, GPAI_STATUS_LABELS } from "./gpai-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import type { GpaiStatus } from "@/lib/gpai/rules";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

const FILTERS: AssessmentFilterSpec<GpaiRow>[] = [
  {
    key: "status",
    label: "GPAI status",
    options: Object.keys(GPAI_STATUS_LABELS),
    display: (v) => GPAI_STATUS_LABELS[v as GpaiStatus],
    predicate: (row, v) => row.result.status === v,
  },
  {
    key: "gpaiRole",
    label: "GPAI role",
    options: ["Provider", "Downstream", "Neither"],
    predicate: (row, v) =>
      v === "Provider" ? row.result.isGpaiProvider : v === "Downstream" ? row.result.isDownstreamConsumer : !row.result.isGpaiProvider && !row.result.isDownstreamConsumer,
  },
  {
    key: "systemic",
    label: "Systemic-risk flag",
    options: ["presumed_by_compute", "possible_by_designation", "unknown", "not_indicated"],
    display: (v) => v.replace(/_/g, " "),
    predicate: (row, v) => row.result.systemicRisk === v,
  },
  {
    key: "confidence",
    label: "Confidence",
    options: ["high", "medium", "low", "insufficient_information"],
    display: (v) => (v === "insufficient_information" ? "Insufficient info" : v[0].toUpperCase() + v.slice(1)),
    predicate: (row, v) => row.result.confidenceLabel === v,
  },
];

export function GpaiTable({ initialRows }: { initialRows: GpaiRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<GpaiRow>[] = [
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
      id: "gpaiRole",
      header: "GPAI role",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700">
          {row.original.result.isGpaiProvider ? "Model provider" : row.original.result.isDownstreamConsumer ? "Downstream" : "-"}
        </span>
      ),
    },
    {
      id: "modelProvider",
      header: "Model provider",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {row.original.normalized.modelProvider ?? row.original.normalized.modelProviderName ?? "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "GPAI status",
      cell: ({ row }) => <GpaiStatusBadge status={row.original.result.status} />,
    },
    {
      id: "systemic",
      header: "Systemic-risk flag",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.result.systemicRisk.replace(/_/g, " ")}</span>,
    },
    {
      id: "annexXii",
      header: "Annex XII info received",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.result.annexXiiInfoReceived ?? "-"}</span>,
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
      id: "lastAssessed",
      header: "Last assessed",
      cell: ({ row }) => (
        <span className="text-xs text-slate-400">
          {row.original.lastAssessedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
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
          onClick={() => router.push(`/gpai/systems/${row.original.system.id}`)}
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
      searchText={(row) => `${row.system.systemName} ${row.system.shortDescription} ${row.normalized.modelProvider ?? ""}`}
      onExport={downloadGpaiCSV}
    />
  );
}
