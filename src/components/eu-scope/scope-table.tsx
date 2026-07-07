"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { EuScopeRow } from "@/lib/eu-scope/types";
import { downloadEuScopeCSV } from "@/lib/eu-scope/csv";
import { ScopeStatusBadge, SCOPE_STATUS_LABELS } from "./scope-badges";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import { ESTABLISHMENT_OPTIONS, SCOPE_ROLE_OPTIONS, type ScopeStatus } from "@/lib/eu-scope/scopeRules";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

const TRIGGER_LABELS: Record<string, string> = {
  "S-01": "Art 2(1)(a)",
  "S-02": "Art 2(1)(b)",
  "S-03": "Art 2(1)(c)",
};

const FILTERS: AssessmentFilterSpec<EuScopeRow>[] = [
  {
    key: "status",
    label: "Scope status",
    options: Object.keys(SCOPE_STATUS_LABELS),
    display: (v) => SCOPE_STATUS_LABELS[v as ScopeStatus],
    predicate: (row, v) => row.result.status === v,
  },
  {
    key: "role",
    label: "Entity role",
    options: SCOPE_ROLE_OPTIONS,
    predicate: (row, v) => row.answers.role === v,
  },
  {
    key: "establishment",
    label: "Establishment",
    options: ESTABLISHMENT_OPTIONS,
    predicate: (row, v) => row.answers.establishment === v,
  },
  {
    key: "rep",
    label: "Authorised rep required",
    options: ["Yes", "No"],
    predicate: (row, v) => row.result.authorisedRepRequired === (v === "Yes"),
  },
];

export function ScopeTable({ initialRows }: { initialRows: EuScopeRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<EuScopeRow>[] = [
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
      header: "Scope status",
      cell: ({ row }) => <ScopeStatusBadge status={row.original.result.status} />,
    },
    {
      id: "trigger",
      header: "Matched trigger",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700">
          {row.original.result.matchedTriggers.map((t) => TRIGGER_LABELS[t] ?? t).join(", ") || "-"}
        </span>
      ),
    },
    {
      id: "rep",
      header: "Authorised rep required",
      cell: ({ row }) =>
        row.original.result.authorisedRepRequired ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
            Required ({row.original.result.authorisedRep.citations.join(", ")})
          </span>
        ) : (
          <span className="text-xs text-slate-400">No</span>
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
          onClick={() => router.push(`/eu-scope/systems/${row.original.system.id}`)}
        >
          <ClipboardCheck className="w-3.5 h-3.5" /> Assess scope
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
      onExport={downloadEuScopeCSV}
    />
  );
}
