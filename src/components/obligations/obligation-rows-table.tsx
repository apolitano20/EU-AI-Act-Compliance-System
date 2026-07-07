import Link from "next/link";
import { GuidanceStatusBadge } from "@/components/shared/guidance-status-badge";
import type { ObligationRow } from "@/lib/obligations/obligationRules";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<ObligationRow["status"], string> = {
  likely_applies: "bg-blue-100 text-blue-800 border-blue-200",
  possibly_applies: "bg-amber-100 text-amber-800 border-amber-200",
  needs_review: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<ObligationRow["status"], string> = {
  likely_applies: "Likely applies",
  possibly_applies: "Possibly applies",
  needs_review: "Needs review",
};

const TYPE_LABELS: Record<ObligationRow["obligationType"], string> = {
  one_off: "One-off",
  one_off_then_maintained: "One-off, then maintained",
  recurring: "Recurring (lifecycle)",
  recurring_event_driven: "Recurring / event-driven",
};

/** Per-obligation rows for one system (used in the expandable list + detail page). */
export function ObligationRowsTable({ rows, readinessHref }: { rows: ObligationRow[]; readinessHref?: string }) {
  if (rows.length === 0) {
    return <p className="text-xs text-slate-400 py-2">No obligation rows emitted.</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs font-semibold text-slate-500 border-b border-slate-200">
          <th className="py-2 pr-3">Obligation</th>
          <th className="py-2 pr-3">Duty holder</th>
          <th className="py-2 pr-3">Status</th>
          <th className="py-2 pr-3">Type</th>
          <th className="py-2 pr-3">Legal basis</th>
          <th className="py-2 pr-3">Applicable from</th>
          <th className="py-2 pr-3">Guidance</th>
          {readinessHref && <th className="py-2" />}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((o) => (
          <tr key={o.obligationId} className="align-top">
            <td className="py-2 pr-3">
              <span className="text-xs font-mono font-semibold text-slate-500">{o.obligationId}</span>
              <p className="text-xs text-slate-700 mt-0.5 max-w-[340px]">{o.name}</p>
              {o.note && <p className="text-[11px] text-amber-700 mt-0.5">{o.note}</p>}
              {o.detailRoute && (
                <Link href={o.detailRoute} className="text-[11px] text-blue-600 hover:underline">
                  Details in module →
                </Link>
              )}
            </td>
            <td className="py-2 pr-3 text-xs text-slate-600">{o.dutyHolder.join(", ")}</td>
            <td className="py-2 pr-3">
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap", STATUS_CLASSES[o.status])}>
                {STATUS_LABELS[o.status]}
              </span>
            </td>
            <td className="py-2 pr-3 text-xs text-slate-600 whitespace-nowrap">{TYPE_LABELS[o.obligationType]}</td>
            <td className="py-2 pr-3 text-xs text-slate-600">{o.legalBasis}</td>
            <td className="py-2 pr-3 text-xs text-slate-600 whitespace-nowrap">{o.applicableFromDate}</td>
            <td className="py-2 pr-3"><GuidanceStatusBadge status={o.guidanceStatus} /></td>
            {readinessHref && (
              <td className="py-2">
                <Link href={readinessHref} className="text-[11px] text-blue-600 hover:underline whitespace-nowrap">
                  Evidence →
                </Link>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
