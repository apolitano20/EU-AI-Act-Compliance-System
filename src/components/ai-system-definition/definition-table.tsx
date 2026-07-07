"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import type { AiDefinitionRow } from "@/lib/ai-system-definition/types";
import type { AiDefinitionClassification, ConfidenceLabel } from "@/lib/ai-system-definition/definitionRules";
import { AiDefinitionStatusBadge, ConfidenceBadge, STATUS_LABELS } from "./definition-badges";
import { downloadAiDefinitionCSV } from "@/lib/ai-system-definition/csv";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ALL, SelectFilter } from "@/components/select-filter";
import { BUSINESS_FUNCTIONS, STATUSES, BUILD_TYPES } from "@/lib/options";
import { ShieldQuestion, ArrowUpDown, Download, X } from "lucide-react";

const CLASSIFICATION_OPTIONS: AiDefinitionClassification[] = [
  "likely_ai_system", "possible_ai_system_needs_review", "likely_not_ai_system", "insufficient_information",
];

const CONFIDENCE_OPTIONS: ConfidenceLabel[] = ["high", "medium", "low", "insufficient_information"];
const CONFIDENCE_DISPLAY: Record<ConfidenceLabel, string> = {
  high: "High", medium: "Medium", low: "Low", insufficient_information: "Insufficient info",
};

function isAgentic(row: AiDefinitionRow): boolean {
  return row.normalized.canCallToolsOrApis === "Yes" || row.normalized.canTakeActions === "Yes";
}

interface Filters {
  search: string;
  classification: string;
  confidence: string;
  businessFunction: string;
  systemStatus: string;
  buildType: string;
  usesGpaiOrLlm: string;
  usesRag: string;
  agentic: string;
  missingData: string;
}

const EMPTY_FILTERS: Filters = {
  search: "", classification: ALL, confidence: ALL, businessFunction: ALL,
  systemStatus: ALL, buildType: ALL, usesGpaiOrLlm: ALL, usesRag: ALL, agentic: ALL, missingData: ALL,
};

function applyFilters(rows: AiDefinitionRow[], f: Filters): AiDefinitionRow[] {
  return rows.filter((row) => {
    const { system, normalized, result } = row;
    if (f.search) {
      const q = f.search.toLowerCase();
      const haystack = [system.systemName, system.shortDescription].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.classification !== ALL && result.classification !== f.classification) return false;
    if (f.confidence !== ALL && result.confidenceLabel !== f.confidence) return false;
    if (f.businessFunction !== ALL && system.businessFunction !== f.businessFunction) return false;
    if (f.systemStatus !== ALL && system.status !== f.systemStatus) return false;
    if (f.buildType !== ALL && system.buildType !== f.buildType) return false;
    if (f.usesGpaiOrLlm !== ALL && normalized.usesGpaiOrLlm !== f.usesGpaiOrLlm) return false;
    if (f.usesRag !== ALL && normalized.usesRag !== f.usesRag) return false;
    if (f.agentic !== ALL && (isAgentic(row) ? "Yes" : "No") !== f.agentic) return false;
    if (f.missingData !== ALL) {
      const hasMissing = result.missingFields.length > 0;
      if ((f.missingData === "Yes") !== hasMissing) return false;
    }
    return true;
  });
}

export function DefinitionTable({ initialRows }: { initialRows: AiDefinitionRow[] }) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([]);
  const filtered = applyFilters(initialRows, filters);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() { setFilters(EMPTY_FILTERS); }

  const columns: ColumnDef<AiDefinitionRow>[] = [
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
      id: "systemTypes",
      header: "System types",
      cell: ({ row }) => <span className="text-xs text-slate-600 line-clamp-2 max-w-[180px] block">{row.original.normalized.systemTypes.join(", ") || "-"}</span>,
    },
    {
      id: "outputTypes",
      header: "Output types",
      cell: ({ row }) => <span className="text-xs text-slate-600 line-clamp-2 max-w-[180px] block">{row.original.normalized.outputTypes.join(", ") || "-"}</span>,
    },
    {
      id: "classification",
      header: "AI definition status",
      cell: ({ row }) => <AiDefinitionStatusBadge classification={row.original.result.classification} />,
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
      id: "missingFields",
      header: "Missing fields",
      cell: ({ row }) => {
        const count = row.original.result.missingFields.length;
        return <span className={`text-xs ${count > 0 ? "text-red-600 font-medium" : "text-slate-400"}`}>{count}</span>;
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
          onClick={() => router.push(`/ai-system-definition/systems/${row.original.system.id}`)}
        >
          <ShieldQuestion className="w-3.5 h-3.5" /> Review gate
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
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadAiDefinitionCSV(initialRows)}>
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

      <div className="bg-white rounded-lg border border-slate-200 p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <Input
            placeholder="Search name, description..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <SelectFilter label="AI definition status" value={filters.classification} options={CLASSIFICATION_OPTIONS} display={(v) => STATUS_LABELS[v as AiDefinitionClassification]} onChange={(v) => set("classification", v)} />
        <SelectFilter label="Confidence" value={filters.confidence} options={CONFIDENCE_OPTIONS} display={(v) => CONFIDENCE_DISPLAY[v as ConfidenceLabel]} onChange={(v) => set("confidence", v)} />
        <SelectFilter label="Business function" value={filters.businessFunction} options={BUSINESS_FUNCTIONS} onChange={(v) => set("businessFunction", v)} />
        <SelectFilter label="Status" value={filters.systemStatus} options={STATUSES} onChange={(v) => set("systemStatus", v)} />
        <SelectFilter label="Build type" value={filters.buildType} options={BUILD_TYPES} onChange={(v) => set("buildType", v)} />
        <SelectFilter label="Uses GPAI/LLM" value={filters.usesGpaiOrLlm} options={["Yes", "No", "Not sure"]} onChange={(v) => set("usesGpaiOrLlm", v)} />
        <SelectFilter label="Uses RAG" value={filters.usesRag} options={["Yes", "No", "Not sure"]} onChange={(v) => set("usesRag", v)} />
        <SelectFilter label="Agentic/tool-calling" value={filters.agentic} options={["Yes", "No"]} onChange={(v) => set("agentic", v)} />
        <SelectFilter label="Missing data" value={filters.missingData} options={["Yes", "No"]} onChange={(v) => set("missingData", v)} />
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
