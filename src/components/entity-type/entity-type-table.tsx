"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import type { EntityTypeRow } from "@/lib/entity-type/types";
import { internalExternalUseLabel } from "@/lib/entity-type/types";
import type { ConfidenceLabel } from "@/lib/entity-type/roleRules";
import { RoleBadges, ConfidenceBadge, Article25Badge } from "./role-badges";
import { downloadEntityCSV } from "@/lib/entity-type/csv";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ALL, SelectFilter } from "@/components/select-filter";
import { BUSINESS_FUNCTIONS, STATUSES, BUILD_TYPES } from "@/lib/options";
import { ClipboardCheck, ArrowUpDown, Download, X } from "lucide-react";

const ROLE_OPTIONS = [
  "Provider", "Deployer", "Importer", "Distributor",
  "Authorised Representative", "Product Manufacturer",
] as const;

const CONFIDENCE_OPTIONS: ConfidenceLabel[] = ["high", "medium", "low", "insufficient_information"];
const CONFIDENCE_DISPLAY: Record<ConfidenceLabel, string> = {
  high: "High", medium: "Medium", low: "Low", insufficient_information: "Insufficient info",
};

interface Filters {
  search: string;
  role: string;
  confidence: string;
  article25: string;
  businessFunction: string;
  status: string;
  buildType: string;
}

const EMPTY_FILTERS: Filters = {
  search: "", role: ALL, confidence: ALL, article25: ALL,
  businessFunction: ALL, status: ALL, buildType: ALL,
};

function applyFilters(rows: EntityTypeRow[], f: Filters): EntityTypeRow[] {
  return rows.filter(({ system, result }) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      const haystack = [system.systemName, system.shortDescription, system.vendorName].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.role !== ALL && !result.likelyRoles.includes(f.role) && !result.possibleRoles.includes(f.role)) return false;
    if (f.confidence !== ALL && result.confidenceLabel !== f.confidence) return false;
    if (f.article25 !== ALL) {
      const wants = f.article25 === "Yes";
      if (result.article25ProviderConversionRisk !== wants) return false;
    }
    if (f.businessFunction !== ALL && system.businessFunction !== f.businessFunction) return false;
    if (f.status !== ALL && system.status !== f.status) return false;
    if (f.buildType !== ALL && system.buildType !== f.buildType) return false;
    return true;
  });
}

export function EntityTypeTable({ initialRows }: { initialRows: EntityTypeRow[] }) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([]);
  const filtered = applyFilters(initialRows, filters);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() { setFilters(EMPTY_FILTERS); }

  const columns: ColumnDef<EntityTypeRow>[] = [
    {
      id: "systemName",
      accessorFn: (row) => row.system.systemName,
      header: ({ column }) => (
        <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting()}>
          System name <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900 text-sm">{row.original.system.systemName}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{row.original.system.shortDescription}</p>
        </div>
      ),
    },
    {
      id: "businessFunction",
      header: "Function",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.system.businessFunction ?? "-"}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.system.status ?? "-"}</span>,
    },
    {
      id: "buildType",
      header: "Build type",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.system.buildType ?? "-"}</span>,
    },
    {
      id: "vendor",
      header: "Vendor / provider",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.system.vendorName ?? row.original.system.modelProviderName ?? "-"}</span>,
    },
    {
      id: "internalExternal",
      header: "Internal / external",
      cell: ({ row }) => <span className="text-xs text-slate-600">{internalExternalUseLabel(row.original.answers)}</span>,
    },
    {
      id: "likelyRoles",
      header: "Likely role(s)",
      cell: ({ row }) => <RoleBadges likelyRoles={row.original.result.likelyRoles} possibleRoles={[]} />,
    },
    {
      id: "possibleRoles",
      header: "Possible role(s)",
      cell: ({ row }) => <RoleBadges likelyRoles={[]} possibleRoles={row.original.result.possibleRoles} />,
    },
    {
      id: "article25",
      header: "Article 25 risk",
      cell: ({ row }) => <Article25Badge atRisk={row.original.result.article25ProviderConversionRisk} />,
    },
    {
      id: "confidence",
      header: "Confidence",
      cell: ({ row }) => <ConfidenceBadge label={row.original.result.confidenceLabel} />,
    },
    {
      id: "keyUncertainty",
      header: "Key uncertainty",
      cell: ({ row }) => {
        const first = row.original.result.keyUncertainties[0];
        return <span className="text-xs text-slate-500 line-clamp-2 max-w-[220px] block">{first ?? "-"}</span>;
      },
    },
    {
      id: "lastAssessed",
      header: "Last assessed",
      cell: ({ row }) => {
        const date = row.original.lastAssessedAt;
        return (
          <span className="text-xs text-slate-400">
            {date ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "-"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 text-xs"
          onClick={() => router.push(`/entity-type/systems/${row.original.system.id}`)}
        >
          <ClipboardCheck className="w-3.5 h-3.5" /> Assess role
        </Button>
      ),
    },
  ];

  // TanStack Table returns non-memoizable functions, so we keep a targeted suppression here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isFiltered = (Object.keys(filters) as (keyof Filters)[]).some((k) => filters[k] !== EMPTY_FILTERS[k]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadEntityCSV(initialRows)}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          {isFiltered && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500" onClick={clearFilters}>
              <X className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          )}
        </div>
        <span className="text-xs text-slate-500">{filtered.length} of {initialRows.length} systems</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <Input
            placeholder="Search name, description, vendor..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <SelectFilter label="Role" value={filters.role} options={ROLE_OPTIONS} onChange={(v) => set("role", v)} />
        <SelectFilter label="Confidence" value={filters.confidence} options={CONFIDENCE_OPTIONS} display={(v) => CONFIDENCE_DISPLAY[v as ConfidenceLabel]} onChange={(v) => set("confidence", v)} />
        <SelectFilter label="Article 25 risk" value={filters.article25} options={["Yes", "No"]} onChange={(v) => set("article25", v)} />
        <SelectFilter label="Business function" value={filters.businessFunction} options={BUSINESS_FUNCTIONS} onChange={(v) => set("businessFunction", v)} />
        <SelectFilter label="Status" value={filters.status} options={STATUSES} onChange={(v) => set("status", v)} />
        <SelectFilter label="Build type" value={filters.buildType} options={BUILD_TYPES} onChange={(v) => set("buildType", v)} />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 whitespace-nowrap">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                  {initialRows.length === 0
                    ? "No AI systems in inventory yet. Add systems in the inventory module first."
                    : "No systems match the current filters."}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
