"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProhibitedRow } from "@/lib/prohibited/types";
import { downloadProhibitedCSV } from "@/lib/prohibited/csv";
import { ProhibitedStatusBadge, PROHIBITED_STATUS_LABELS } from "./prohibited-badges";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { GuidanceStatusBadge } from "@/components/shared/guidance-status-badge";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import { PROHIBITED_RULES, type ProhibitedStatus } from "@/lib/prohibited/rules";
import { BUSINESS_FUNCTIONS, DEPLOYMENT_CONTEXTS } from "@/lib/options";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

const RULE_BY_ID = new Map(PROHIBITED_RULES.map((r) => [r.id, r]));
const CONFIDENCE_OPTIONS = ["high", "medium", "low", "insufficient_information"] as const;

const FILTERS: AssessmentFilterSpec<ProhibitedRow>[] = [
  {
    key: "status",
    label: "Status",
    options: Object.keys(PROHIBITED_STATUS_LABELS),
    display: (v) => PROHIBITED_STATUS_LABELS[v as ProhibitedStatus],
    predicate: (row, v) => row.result.status === v,
  },
  {
    key: "confidence",
    label: "Confidence",
    options: CONFIDENCE_OPTIONS,
    display: (v) => (v === "insufficient_information" ? "Insufficient info" : v[0].toUpperCase() + v.slice(1)),
    predicate: (row, v) => row.result.confidenceLabel === v,
  },
  {
    key: "prohibition",
    label: "Matched prohibition",
    options: PROHIBITED_RULES.map((r) => r.id),
    predicate: (row, v) => row.result.matchedProhibitions.includes(v) || row.result.possibleProhibitions.includes(v),
  },
  {
    key: "sector",
    label: "Business function",
    options: BUSINESS_FUNCTIONS,
    predicate: (row, v) => row.system.businessFunction === v,
  },
  {
    key: "context",
    label: "Deployment context",
    options: DEPLOYMENT_CONTEXTS,
    predicate: (row, v) => row.system.deploymentContext === v,
  },
];

export function ProhibitedTable({ initialRows }: { initialRows: ProhibitedRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<ProhibitedRow>[] = [
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
      id: "prohibitions",
      header: "Matched prohibition(s)",
      cell: ({ row }) => {
        const ids = [...row.original.result.matchedProhibitions, ...row.original.result.possibleProhibitions];
        if (ids.length === 0) return <span className="text-xs text-slate-400">-</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {ids.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 text-xs font-mono text-slate-700">
                {id}
                <GuidanceStatusBadge status={RULE_BY_ID.get(id)?.guidanceStatus ?? "final"} />
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <ProhibitedStatusBadge status={row.original.result.status} />,
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
      cell: ({ row }) => {
        const ids = [...row.original.result.matchedProhibitions, ...row.original.result.possibleProhibitions];
        const dates = [...new Set(ids.map((id) => RULE_BY_ID.get(id)?.applicableFromDate).filter(Boolean))];
        return <span className="text-xs text-slate-600">{dates.join(", ") || "-"}</span>;
      },
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
          onClick={() => router.push(`/prohibited/systems/${row.original.system.id}`)}
        >
          <ClipboardCheck className="w-3.5 h-3.5" /> Screen
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
      onExport={downloadProhibitedCSV}
    />
  );
}
