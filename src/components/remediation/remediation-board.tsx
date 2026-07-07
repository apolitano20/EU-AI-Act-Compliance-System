"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { RemediationItem } from "@/generated/prisma/client";
import { generateRemediationPlan } from "@/app/remediation/actions";
import { RemediationItemCard } from "./remediation-item-card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wand2 } from "lucide-react";

const COLUMNS: { key: string; title: string; statuses: string[] }[] = [
  { key: "open", title: "Open", statuses: ["open"] },
  { key: "in_progress", title: "In progress", statuses: ["in_progress"] },
  { key: "blocked", title: "Blocked", statuses: ["blocked"] },
  { key: "done", title: "Completed / Verified", statuses: ["completed", "verified"] },
  { key: "parked", title: "Deferred / N/A", statuses: ["deferred", "not_applicable"] },
];

export function RemediationBoard({ systemId, items, gapsWithoutItems }: {
  systemId: string;
  items: RemediationItem[];
  gapsWithoutItems: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const recurringControls = items.filter((i) => i.recurrenceKind !== "one_off");

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      try {
        await generateRemediationPlan(systemId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-slate-600">
          {items.length} remediation item(s)
          {gapsWithoutItems > 0 && (
            <span className="text-amber-700 ml-2">{gapsWithoutItems} Module 13 gap(s) have no item yet — regenerate the plan.</span>
          )}
        </div>
        <Button size="sm" onClick={handleGenerate} disabled={pending} className="gap-1.5">
          <Wand2 className="w-4 h-4" />
          {pending ? "Generating..." : items.length > 0 ? "Regenerate plan from Module 13 gaps" : "Generate plan from Module 13 gaps"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-start">
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => col.statuses.includes(i.status));
          return (
            <div key={col.key} className="bg-slate-100/60 rounded-lg p-2 space-y-2 min-h-[80px]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">
                {col.title} <span className="text-slate-400">({colItems.length})</span>
              </p>
              {colItems.map((item) => <RemediationItemCard key={item.id} item={item} />)}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-2">
          <RefreshCw className="w-4 h-4" /> Recurring-controls calendar
        </h3>
        {recurringControls.length === 0 ? (
          <p className="text-xs text-slate-400">No recurring controls yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 border-b border-slate-200">
                <th className="py-1.5 pr-3">Control</th>
                <th className="py-1.5 pr-3">Cadence</th>
                <th className="py-1.5 pr-3">Last verified</th>
                <th className="py-1.5 pr-3">Next due</th>
                <th className="py-1.5">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recurringControls.map((i) => (
                <tr key={i.id}>
                  <td className="py-1.5 pr-3 text-xs text-slate-700">{i.obligationId} — {i.title}</td>
                  <td className="py-1.5 pr-3 text-xs text-slate-600">{i.cadence?.replace(/_/g, " ") ?? "not set"}</td>
                  <td className="py-1.5 pr-3 text-xs text-slate-600">{i.lastCompletedAt?.toISOString().slice(0, 10) ?? "-"}</td>
                  <td className="py-1.5 pr-3 text-xs text-slate-600">{i.nextDueAt?.toISOString().slice(0, 10) ?? (i.cadence === "event_driven" ? "on trigger" : "-")}</td>
                  <td className="py-1.5 text-xs text-slate-600">{i.owner ?? "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-[11px] text-slate-400 mt-2">
          Recurring/lifecycle controls (Art 72 monitoring, Art 73 incident readiness, Art 17 QMS review, Art 9 risk
          management) are re-verified on a cadence and can never be permanently &quot;done&quot; — completing one
          schedules its next occurrence.
        </p>
      </div>
    </div>
  );
}
