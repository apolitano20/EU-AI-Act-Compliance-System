"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { TransparencyRow } from "@/lib/transparency/types";
import { downloadTransparencyCSV } from "@/lib/transparency/csv";
import { Article50Badge, FriaBadge, ART50_LABELS, FRIA_LABELS } from "./transparency-questionnaire";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import { TR_ROLE_OPTIONS, type Article50Status, type FriaStatus } from "@/lib/transparency/rules";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

const FILTERS: AssessmentFilterSpec<TransparencyRow>[] = [
  {
    key: "role",
    label: "Role",
    options: TR_ROLE_OPTIONS,
    predicate: (row, v) => row.answers.tr_q6 === v,
  },
  {
    key: "trigger",
    label: "Art 50 trigger",
    options: ["TR-R1", "TR-R2", "TR-R3", "TR-R4", "TR-R5", "TR-R6"],
    predicate: (row, v) => row.result.article50Rules.some((r) => r.ruleId === v),
  },
  {
    key: "fria",
    label: "FRIA",
    options: Object.keys(FRIA_LABELS),
    display: (v) => FRIA_LABELS[v as FriaStatus],
    predicate: (row, v) => row.result.friaStatus === v,
  },
  {
    key: "status",
    label: "Transparency status",
    options: Object.keys(ART50_LABELS),
    display: (v) => ART50_LABELS[v as Article50Status],
    predicate: (row, v) => row.result.status === v,
  },
  {
    key: "confidence",
    label: "Confidence",
    options: ["high", "medium", "low", "insufficient_information"],
    display: (v) => (v === "insufficient_information" ? "Insufficient info" : v[0].toUpperCase() + v.slice(1)),
    predicate: (row, v) => row.result.confidenceLabel === v,
  },
];

export function TransparencyTable({ initialRows }: { initialRows: TransparencyRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<TransparencyRow>[] = [
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
      cell: ({ row }) => <span className="text-xs text-slate-700">{(row.original.answers.tr_q6 as string) ?? "-"}</span>,
    },
    {
      id: "triggers",
      header: "Article 50 triggers",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700">
          {row.original.result.article50Rules.map((r) => r.ruleId).join(", ") || "-"}
        </span>
      ),
    },
    {
      id: "fria",
      header: "FRIA trigger",
      cell: ({ row }) => <FriaBadge status={row.original.result.friaStatus} />,
    },
    {
      id: "status",
      header: "Transparency status",
      cell: ({ row }) => <Article50Badge status={row.original.result.status} />,
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
      id: "applicableFrom",
      header: "Applicable from",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {row.original.result.article50Rules.length > 0 ? "2026-08-02" : "-"}
          {row.original.result.friaRules.length > 0 ? " / FRIA 2027-12-02 (prov.)" : ""}
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
          onClick={() => router.push(`/transparency/systems/${row.original.system.id}`)}
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
      onExport={downloadTransparencyCSV}
    />
  );
}
