"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { HighRiskRow } from "@/lib/high-risk/types";
import { downloadHighRiskCSV } from "@/lib/high-risk/csv";
import { HighRiskStatusBadge, HIGH_RISK_STATUS_LABELS } from "./high-risk-badges";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import { ANNEX_III_AREAS, type HighRiskStatus } from "@/lib/high-risk/rules";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  annex_i: "Annex I",
  annex_iii: "Annex III",
  both: "Annex I + III",
  none: "-",
};

const FILTERS: AssessmentFilterSpec<HighRiskRow>[] = [
  {
    key: "status",
    label: "Status",
    options: Object.keys(HIGH_RISK_STATUS_LABELS),
    display: (v) => HIGH_RISK_STATUS_LABELS[v as HighRiskStatus],
    predicate: (row, v) => row.result.status === v,
  },
  {
    key: "route",
    label: "Route",
    options: ["annex_i", "annex_iii", "both"],
    display: (v) => ROUTE_LABELS[v],
    predicate: (row, v) => row.result.route === v,
  },
  {
    key: "area",
    label: "Annex III area",
    options: ANNEX_III_AREAS.filter((a) => a !== "None of the above"),
    predicate: (row, v) => row.result.matchedAnnexIiiAreas.includes(v),
  },
  {
    key: "registration",
    label: "Registration required",
    options: ["Yes", "No"],
    predicate: (row, v) => row.result.registrationRequired === (v === "Yes"),
  },
  {
    key: "carveOut",
    label: "Carve-out applied",
    options: ["Yes", "No"],
    predicate: (row, v) => row.result.carveOutApplied === (v === "Yes"),
  },
  {
    key: "role",
    label: "Role",
    options: ["Provider", "Deployer", "Importer", "Distributor"],
    predicate: (row, v) => row.role.likelyRoles.includes(v) || row.role.possibleRoles.includes(v),
  },
];

export function HighRiskTable({ initialRows }: { initialRows: HighRiskRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<HighRiskRow>[] = [
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
      id: "route",
      header: "Route",
      cell: ({ row }) => <span className="text-xs text-slate-700">{ROUTE_LABELS[row.original.result.route]}</span>,
    },
    {
      id: "area",
      header: "Matched category",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 line-clamp-2 max-w-[220px] block">
          {row.original.result.matchedAnnexIiiAreas.join("; ") || "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <HighRiskStatusBadge status={row.original.result.status} />,
    },
    {
      id: "carveOut",
      header: "Carve-out applied?",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.original.result.carveOutApplied ? "Yes (Art 6(3), draft)" : "No"}</span>
      ),
    },
    {
      id: "registration",
      header: "Registration required?",
      cell: ({ row }) =>
        row.original.result.registrationRequired ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
            Art 49 / Annex VIII
          </span>
        ) : (
          <span className="text-xs text-slate-400">No</span>
        ),
    },
    {
      id: "applicableFrom",
      header: "Applicable from",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {row.original.result.applicableFromDate ? `${row.original.result.applicableFromDate} (provisional)` : "-"}
        </span>
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
          onClick={() => router.push(`/high-risk/systems/${row.original.system.id}`)}
        >
          <ClipboardCheck className="w-3.5 h-3.5" /> Classify
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
      onExport={downloadHighRiskCSV}
    />
  );
}
