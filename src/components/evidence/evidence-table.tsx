"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { FlatEvidenceRow } from "@/lib/evidence/types";
import { downloadEvidenceCSV } from "@/lib/evidence/csv";
import { ReadinessStatusBadge } from "./readiness-badges";
import { GuidanceStatusBadge } from "@/components/shared/guidance-status-badge";
import { AssessmentTable, sortableHeader, type AssessmentFilterSpec } from "@/components/shared/assessment-table";
import { READINESS_STATUS_LABELS, type ReadinessStatus } from "@/lib/evidence/evidenceRules";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

const FILTERS: AssessmentFilterSpec<FlatEvidenceRow>[] = [
  {
    key: "readiness",
    label: "Readiness status",
    options: Object.keys(READINESS_STATUS_LABELS),
    display: (v) => READINESS_STATUS_LABELS[v as ReadinessStatus],
    predicate: (row, v) => row.row.readinessStatus === v,
  },
  {
    key: "obligation",
    label: "Obligation",
    options: [
      "OBL-ART9-RMS", "OBL-ART10-DATA", "OBL-ART11-TECHDOC", "OBL-ART12-LOGGING",
      "OBL-ART13-TRANSP-DEPLOYER", "OBL-ART14-OVERSIGHT", "OBL-ART15-ACCURACY", "OBL-ART17-QMS",
      "OBL-ART26-DEPLOYER", "OBL-ART22-AUTHREP", "OBL-ART43-CONFORMITY", "OBL-ART49-REGISTER",
      "OBL-ART6-3-NOTHR-DOC", "OBL-ART72-PMM", "OBL-ART73-INCIDENT",
      "OBL-ART50-TRANSP-AGG", "OBL-ART4-LITERACY", "OBL-GPAI-AGG",
    ],
    predicate: (row, v) => row.row.obligationId === v,
  },
  {
    key: "guidance",
    label: "Guidance status",
    options: ["final", "provisional", "draft"],
    predicate: (row, v) => row.row.guidanceStatus === v,
  },
  {
    key: "applicableFrom",
    label: "Applicable from",
    options: ["2025-02-02", "2025-08-02", "2026-08-02", "2027-12-02", "2028-08-02"],
    predicate: (row, v) => row.row.applicableFromDate === v,
  },
];

export function EvidenceTable({ initialRows }: { initialRows: FlatEvidenceRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<FlatEvidenceRow>[] = [
    {
      id: "systemName",
      accessorFn: (row) => row.systemName,
      header: sortableHeader("System"),
      cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{row.original.systemName}</span>,
    },
    {
      id: "obligation",
      header: "Obligation",
      cell: ({ row }) => (
        <div className="max-w-[280px]">
          <span className="text-xs font-mono font-semibold text-slate-500">{row.original.row.obligationId}</span>
          <p className="text-xs text-slate-600 line-clamp-2">{row.original.row.obligationName}</p>
        </div>
      ),
    },
    {
      id: "legalBasis",
      header: "Legal basis",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.row.legalBasis}</span>,
    },
    {
      id: "applicableFrom",
      header: "Applicable from",
      cell: ({ row }) => <span className="text-xs text-slate-600 whitespace-nowrap">{row.original.row.applicableFromDate}</span>,
    },
    {
      id: "guidance",
      header: "Guidance",
      cell: ({ row }) => <GuidanceStatusBadge status={row.original.row.guidanceStatus} />,
    },
    {
      id: "artifacts",
      header: "Required evidence",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 line-clamp-2 max-w-[260px] block">
          {row.original.row.requiredArtifacts.join("; ")}
        </span>
      ),
    },
    {
      id: "readiness",
      header: "Readiness",
      cell: ({ row }) => <ReadinessStatusBadge status={row.original.row.readinessStatus} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 text-xs"
          onClick={() => router.push(`/readiness/systems/${row.original.systemId}`)}
        >
          <ClipboardCheck className="w-3.5 h-3.5" /> Evidence
        </Button>
      ),
    },
  ];

  return (
    <AssessmentTable
      rows={initialRows}
      columns={columns}
      filters={FILTERS}
      searchText={(row) => `${row.systemName} ${row.row.obligationId} ${row.row.obligationName}`}
      onExport={downloadEvidenceCSV}
      countNoun="obligation rows"
      emptyMessage="No applicable obligations yet — complete the upstream modules first."
    />
  );
}
