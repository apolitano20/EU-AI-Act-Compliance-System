"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RemediationItem } from "@/generated/prisma/client";
import { completeRemediationItem, updateRemediationItem } from "@/app/remediation/actions";
import { GuidanceStatusBadge } from "@/components/shared/guidance-status-badge";
import { CADENCES, REMEDIATION_PRIORITIES, REMEDIATION_STATUSES } from "@/lib/remediation/remediationRules";
import type { GuidanceStatus } from "@/lib/assessment-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle2, RefreshCw } from "lucide-react";

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

export function RemediationItemCard({ item }: { item: RemediationItem }) {
  const router = useRouter();
  const [owner, setOwner] = useState(item.owner ?? "");
  const [dueDate, setDueDate] = useState(item.dueDate?.toISOString().slice(0, 10) ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const recurring = item.recurrenceKind !== "one_off";
  const overdue = item.dueDate && item.dueDate < new Date() && !["completed", "verified", "not_applicable"].includes(item.status);

  function run(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  return (
    <div className={cn("bg-white rounded-lg border p-3 shadow-sm space-y-2", overdue ? "border-red-300" : "border-slate-200")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono font-semibold text-slate-500">{item.obligationId}</span>
          <GuidanceStatusBadge status={item.guidanceStatus as GuidanceStatus} className="ml-1.5" />
          <p className="text-sm text-slate-800 mt-0.5">{item.title}</p>
          <p className="text-[11px] text-slate-500">
            {item.legalBasisCitation}
            {item.applicableFromDate && ` · applicable from ${item.applicableFromDate}`}
            {item.guidanceStatus !== "final" && " · timeline may shift"}
          </p>
        </div>
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap", PRIORITY_CLASSES[item.priority])}>
          {item.priority}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">Owner</span>
          <Input
            value={owner}
            placeholder="Unassigned"
            onChange={(e) => setOwner(e.target.value)}
            onBlur={() => owner !== (item.owner ?? "") && run(() => updateRemediationItem(item.id, { owner }))}
            className="h-7 text-xs"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">
            Due date {item.suggestedDueDate && `(suggested ${item.suggestedDueDate.toISOString().slice(0, 10)})`}
          </span>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={() => dueDate !== (item.dueDate?.toISOString().slice(0, 10) ?? "") && run(() => updateRemediationItem(item.id, { dueDate: dueDate || null }))}
            className="h-7 text-xs"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">Status</span>
          <select
            value={item.status}
            disabled={pending}
            onChange={(e) => run(() => updateRemediationItem(item.id, { status: e.target.value, owner }))}
            className="w-full h-7 text-xs border border-slate-200 rounded-md bg-white px-2"
          >
            {REMEDIATION_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">Priority (override)</span>
          <select
            value={item.priority}
            disabled={pending}
            onChange={(e) => run(() => updateRemediationItem(item.id, { priority: e.target.value }))}
            className="w-full h-7 text-xs border border-slate-200 rounded-md bg-white px-2"
          >
            {REMEDIATION_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        {recurring && (
          <label className="block col-span-2">
            <span className="text-[10px] uppercase tracking-wide text-slate-400">Cadence (recurring control)</span>
            <select
              value={item.cadence ?? ""}
              disabled={pending}
              onChange={(e) => run(() => updateRemediationItem(item.id, { cadence: e.target.value || null }))}
              className="w-full h-7 text-xs border border-slate-200 rounded-md bg-white px-2"
            >
              <option value="">— set cadence —</option>
              {CADENCES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500">
          {recurring ? (
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {item.recurrenceKind === "recurring" ? "Recurring control" : "One-off, then recurring"}
              {item.nextDueAt && ` · next due ${item.nextDueAt.toISOString().slice(0, 10)}`}
              {item.lastCompletedAt && ` · last verified ${item.lastCompletedAt.toISOString().slice(0, 10)}`}
            </span>
          ) : (
            "One-off task"
          )}
          {overdue && <span className="text-red-600 font-medium ml-2">Overdue</span>}
        </div>
        {!["completed", "verified", "not_applicable"].includes(item.status) && (
          <Button size="sm" variant="outline" disabled={pending} className="h-7 gap-1 text-xs" onClick={() => run(() => completeRemediationItem(item.id))}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {recurring ? "Complete & re-arm" : "Complete"}
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
