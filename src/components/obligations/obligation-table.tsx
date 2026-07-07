"use client";

import { useState } from "react";
import Link from "next/link";
import type { ObligationRowView } from "@/lib/obligations/types";
import { downloadObligationCSV } from "@/lib/obligations/csv";
import { ObligationRowsTable } from "./obligation-rows-table";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Button } from "@/components/ui/button";
import { ALL, SelectFilter } from "@/components/select-filter";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Download, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  assessed: "Assessed",
  prohibited_short_circuit: "Prohibited (blocked)",
  suppressed_out_of_scope: "Out of scope (suppressed)",
  suppressed_gate_not_met: "Gate not met (suppressed)",
};

const STATUS_CLASSES: Record<string, string> = {
  assessed: "bg-blue-100 text-blue-800 border-blue-200",
  prohibited_short_circuit: "bg-red-100 text-red-800 border-red-200",
  suppressed_out_of_scope: "bg-slate-100 text-slate-600 border-slate-200",
  suppressed_gate_not_met: "bg-slate-100 text-slate-600 border-slate-200",
};

export function ObligationTable({ initialRows }: { initialRows: ObligationRowView[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [guidanceFilter, setGuidanceFilter] = useState(ALL);
  const [registrationFilter, setRegistrationFilter] = useState(ALL);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = initialRows.filter((row) => {
    if (search && !`${row.system.systemName} ${row.system.shortDescription}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== ALL && row.result.status !== statusFilter) return false;
    if (roleFilter !== ALL && !row.result.effectiveRoles.includes(roleFilter)) return false;
    if (guidanceFilter !== ALL && !row.result.rows.some((o) => o.guidanceStatus === guidanceFilter)) return false;
    if (registrationFilter !== ALL && row.result.registrationRequired !== (registrationFilter === "Yes")) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadObligationCSV(filtered)}>
          <Download className="w-3.5 h-3.5" /> Export CSV (flattened per-obligation rows)
        </Button>
        <span className="text-xs text-slate-500">{filtered.length} of {initialRows.length} systems</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="col-span-2">
          <Input placeholder="Search name, description..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 text-xs" />
        </div>
        <SelectFilter label="Status" value={statusFilter} options={Object.keys(STATUS_LABELS)} display={(v) => STATUS_LABELS[v]} onChange={setStatusFilter} />
        <SelectFilter label="Role" value={roleFilter} options={["Provider", "Deployer", "Importer", "Distributor", "Authorised Representative"]} onChange={setRoleFilter} />
        <SelectFilter label="Guidance status" value={guidanceFilter} options={["final", "provisional", "draft"]} onChange={setGuidanceFilter} />
        <SelectFilter label="Registration required" value={registrationFilter} options={["Yes", "No"]} onChange={setRegistrationFilter} />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 py-12 text-center text-slate-400 text-sm">
            {initialRows.length === 0 ? "No AI systems in inventory yet." : "No systems match the current filters."}
          </div>
        )}
        {filtered.map((row) => {
          const isOpen = expanded[row.system.id] ?? false;
          return (
            <div key={row.system.id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                onClick={() => setExpanded((prev) => ({ ...prev, [row.system.id]: !isOpen }))}
              >
                {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{row.system.systemName}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{row.system.shortDescription}</p>
                </div>
                <span className="text-xs text-slate-600 whitespace-nowrap hidden sm:inline">
                  Role(s): {row.result.effectiveRoles.join(", ") || "-"}
                  {row.result.promotedByReclassification && " (promoted)"}
                </span>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap", STATUS_CLASSES[row.result.status])}>
                  {STATUS_LABELS[row.result.status]}
                </span>
                <span className="text-xs text-slate-600 whitespace-nowrap">
                  {row.result.likelyCount} likely / {row.result.possiblyCount + row.result.needsReviewCount} review
                </span>
                {row.result.earliestApplicableDate && (
                  <span className="text-xs text-slate-500 whitespace-nowrap hidden md:inline">from {row.result.earliestApplicableDate}</span>
                )}
                <ConfidenceBadge label={row.result.confidenceLabel} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-100 overflow-x-auto">
                  <ObligationRowsTable rows={row.result.rows} readinessHref={`/readiness/systems/${row.system.id}`} />
                  <Link href={`/obligations/systems/${row.system.id}`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2">
                    <ClipboardList className="w-3.5 h-3.5" /> Full per-system checklist
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
