"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import type { AISystem } from "../generated/prisma/client";
import { normalizeArrayField } from "@/lib/ai-system-data";
import { SystemChips } from "./chip";
import { CompletenessBadge } from "./completeness-badge";
import { scoreBand } from "@/lib/completeness";
import { downloadCSV } from "@/lib/csv";
import { deleteSystem } from "@/app/inventory/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ALL, SelectFilter } from "@/components/select-filter";
import { BUSINESS_FUNCTIONS, STATUSES, DEPLOYMENT_CONTEXTS, BUILD_TYPES, RISK_DOMAIN_FLAGS, YES_NO_NOT_SURE } from "@/lib/options";
import { Trash2, Pencil, Eye, ArrowUpDown, Download, Plus, X } from "lucide-react";

interface Filters {
  search: string;
  businessFunction: string;
  status: string;
  buildType: string;
  deploymentContext: string;
  usesGpaiOrLlm: string;
  usesRag: string;
  canTakeActions: string;
  usesPersonalData: string;
  affectsDecisionsAboutPeople: string;
  outputsUsedInEu: string;
  riskDomainFlag: string;
  completeness: string;
}

const EMPTY_FILTERS: Filters = {
  search: "", businessFunction: ALL, status: ALL, buildType: ALL,
  deploymentContext: ALL, usesGpaiOrLlm: ALL, usesRag: ALL,
  canTakeActions: ALL, usesPersonalData: ALL, affectsDecisionsAboutPeople: ALL,
  outputsUsedInEu: ALL, riskDomainFlag: ALL, completeness: ALL,
};

function applyFilters(systems: AISystem[], f: Filters): AISystem[] {
  return systems.filter((s) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      const haystack = [s.systemName, s.shortDescription, s.vendorName, s.underlyingModelOrTool, s.businessOwner]
        .filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.businessFunction !== ALL && s.businessFunction !== f.businessFunction) return false;
    if (f.status !== ALL && s.status !== f.status) return false;
    if (f.buildType !== ALL && s.buildType !== f.buildType) return false;
    if (f.deploymentContext !== ALL && s.deploymentContext !== f.deploymentContext) return false;
    if (f.usesGpaiOrLlm !== ALL && s.usesGpaiOrLlm !== f.usesGpaiOrLlm) return false;
    if (f.usesRag !== ALL && s.usesRag !== f.usesRag) return false;
    if (f.canTakeActions !== ALL && s.canTakeActions !== f.canTakeActions) return false;
    if (f.usesPersonalData !== ALL && s.usesPersonalData !== f.usesPersonalData) return false;
    if (f.affectsDecisionsAboutPeople !== ALL && s.affectsDecisionsAboutPeople !== f.affectsDecisionsAboutPeople) return false;
    if (f.outputsUsedInEu !== ALL && s.outputsUsedInEu !== f.outputsUsedInEu) return false;
    if (f.riskDomainFlag !== ALL) {
      const flags = normalizeArrayField("riskDomainFlags", s.riskDomainFlags);
      if (!flags.includes(f.riskDomainFlag as (typeof flags)[number])) return false;
    }
    if (f.completeness !== ALL && scoreBand(s.completenessScore ?? 0) !== f.completeness) return false;
    return true;
  });
}

export function InventoryTable({ initialSystems }: { initialSystems: AISystem[] }) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [, startTransition] = useTransition();
  const systems = initialSystems;
  const filtered = applyFilters(systems, filters);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() { setFilters(EMPTY_FILTERS); }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteSystem(id);
      router.refresh();
    });
  }

  const columns: ColumnDef<AISystem>[] = [
    {
      accessorKey: "systemName",
      header: ({ column }) => (
        <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting()}>
          System name <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900 text-sm">{row.original.systemName}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{row.original.shortDescription}</p>
        </div>
      ),
    },
    {
      accessorKey: "businessFunction",
      header: "Function",
      cell: ({ getValue }) => <span className="text-xs text-slate-600">{(getValue() as string | null) ?? "-"}</span>,
    },
    {
      accessorKey: "businessOwner",
      header: "Owner",
      cell: ({ getValue }) => <span className="text-xs text-slate-600">{(getValue() as string | null) ?? "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const v = getValue() as string | null;
        return v ? <span className="text-xs text-slate-700">{v}</span> : <span className="text-slate-300">-</span>;
      },
    },
    {
      id: "flags",
      header: "Flags",
      cell: ({ row }) => <SystemChips system={row.original} />,
    },
    {
      accessorKey: "vendorName",
      header: "Vendor / Model",
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="text-slate-700">{row.original.vendorName ?? row.original.underlyingModelOrTool ?? "-"}</p>
          {row.original.underlyingModelOrTool && row.original.vendorName && (
            <p className="text-slate-400">{row.original.underlyingModelOrTool}</p>
          )}
        </div>
      ),
    },
    {
      id: "completeness",
      header: "Complete",
      cell: ({ row }) => {
        const score = row.original.completenessScore ?? 0;
        return <CompletenessBadge score={score} band={scoreBand(score)} />;
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ getValue }) => {
        const value = getValue();
        const date = value instanceof Date ? value : new Date(String(value));

        return (
          <span className="text-xs text-slate-400">
            {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => router.push(`/inventory/${row.original.id}`)}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => router.push(`/inventory/${row.original.id}/edit`)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(row.original.id, row.original.systemName)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
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
      {/* Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/inventory/new")} size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add AI System
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadCSV(systems)}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          {isFiltered && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500" onClick={clearFilters}>
              <X className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          )}
        </div>
        <span className="text-xs text-slate-500">{filtered.length} of {systems.length} systems</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <Input
              placeholder="Search name, description, vendor, owner..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <SelectFilter label="Business function" value={filters.businessFunction} options={BUSINESS_FUNCTIONS} onChange={(v) => set("businessFunction", v)} />
        <SelectFilter label="Status" value={filters.status} options={STATUSES} onChange={(v) => set("status", v)} />
        <SelectFilter label="Build type" value={filters.buildType} options={BUILD_TYPES} onChange={(v) => set("buildType", v)} />
        <SelectFilter label="Deployment context" value={filters.deploymentContext} options={DEPLOYMENT_CONTEXTS} onChange={(v) => set("deploymentContext", v)} />
        <SelectFilter label="Uses GPAI / LLM" value={filters.usesGpaiOrLlm} options={YES_NO_NOT_SURE} onChange={(v) => set("usesGpaiOrLlm", v)} />
        <SelectFilter label="Uses RAG" value={filters.usesRag} options={YES_NO_NOT_SURE} onChange={(v) => set("usesRag", v)} />
        <SelectFilter label="Agentic" value={filters.canTakeActions} options={YES_NO_NOT_SURE} onChange={(v) => set("canTakeActions", v)} />
        <SelectFilter label="Personal data" value={filters.usesPersonalData} options={YES_NO_NOT_SURE} onChange={(v) => set("usesPersonalData", v)} />
        <SelectFilter label="Affects decisions" value={filters.affectsDecisionsAboutPeople} options={YES_NO_NOT_SURE} onChange={(v) => set("affectsDecisionsAboutPeople", v)} />
        <SelectFilter label="EU output" value={filters.outputsUsedInEu} options={YES_NO_NOT_SURE} onChange={(v) => set("outputsUsedInEu", v)} />
        <SelectFilter label="Risk domain" value={filters.riskDomainFlag} options={RISK_DOMAIN_FLAGS} onChange={(v) => set("riskDomainFlag", v)} />
        <SelectFilter label="Completeness" value={filters.completeness} options={["High", "Medium", "Low"]} onChange={(v) => set("completeness", v)} />
      </div>

      {/* Table */}
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
                  {systems.length === 0
                    ? 'No systems added yet. Click "Add AI System" to get started.'
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
