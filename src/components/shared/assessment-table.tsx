"use client";

import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ALL, SelectFilter } from "@/components/select-filter";
import { ArrowUpDown, Download, X } from "lucide-react";

export interface AssessmentFilterSpec<Row> {
  key: string;
  label: string;
  options: readonly string[];
  display?: (value: string) => string;
  /** Keep the row when the filter is set to `value`. */
  predicate: (row: Row, value: string) => boolean;
}

/** Sortable-header helper for TanStack columns. */
export function sortableHeader(label: string) {
  return function SortableHeader({ column }: { column: { toggleSorting: () => void } }) {
    return (
      <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting()}>
        {label} <ArrowUpDown className="w-3 h-3" />
      </button>
    );
  };
}

/**
 * Generic list table for the assessment modules: text search + select filters +
 * sortable TanStack table + CSV export button. Modules supply columns, filter
 * specs and the export handler.
 */
export function AssessmentTable<Row>({
  rows,
  columns,
  filters,
  searchText,
  searchPlaceholder = "Search name, description...",
  onExport,
  emptyMessage = "No AI systems in inventory yet. Add systems in the inventory module first.",
  countNoun = "systems",
}: {
  rows: Row[];
  columns: ColumnDef<Row>[];
  filters: AssessmentFilterSpec<Row>[];
  searchText: (row: Row) => string;
  searchPlaceholder?: string;
  onExport: (rows: Row[]) => void;
  emptyMessage?: string;
  countNoun?: string;
}) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = rows.filter((row) => {
    if (search && !searchText(row).toLowerCase().includes(search.toLowerCase())) return false;
    for (const spec of filters) {
      const value = filterValues[spec.key] ?? ALL;
      if (value !== ALL && !spec.predicate(row, value)) return false;
    }
    return true;
  });

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

  const isFiltered = search !== "" || filters.some((spec) => (filterValues[spec.key] ?? ALL) !== ALL);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onExport(filtered)}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-500"
              onClick={() => { setSearch(""); setFilterValues({}); }}
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          )}
        </div>
        <span className="text-xs text-slate-500">{filtered.length} of {rows.length} {countNoun}</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        {filters.map((spec) => (
          <SelectFilter
            key={spec.key}
            label={spec.label}
            value={filterValues[spec.key] ?? ALL}
            options={spec.options}
            display={spec.display}
            onChange={(v) => setFilterValues((prev) => ({ ...prev, [spec.key]: v }))}
          />
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-sm">
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
                  {rows.length === 0 ? emptyMessage : "No systems match the current filters."}
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
