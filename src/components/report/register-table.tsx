import Link from "next/link";
import { GuidanceStatusBadge } from "@/components/shared/guidance-status-badge";
import { ReadinessStatusBadge } from "@/components/evidence/readiness-badges";
import type { ReadinessStatus } from "@/lib/evidence/evidenceRules";
import { RISK_TIER_LABELS, type BadgeMode, type RegisterRow } from "@/lib/report/reportRules";

/** The portfolio obligations register (server-rendered; print-friendly). */
export function RegisterTable({ rows, badgeMode }: { rows: RegisterRow[]; badgeMode: BadgeMode }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400 py-6 text-center">No obligation rows in the selected scope.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-left text-xs font-semibold text-slate-600">
            <th className="px-3 py-2">System</th>
            <th className="px-3 py-2">Risk tier</th>
            <th className="px-3 py-2">Role(s)</th>
            <th className="px-3 py-2">Obligation</th>
            <th className="px-3 py-2">Legal basis</th>
            <th className="px-3 py-2">Applicable from</th>
            {badgeMode !== "include_without_badge" && <th className="px-3 py-2">Guidance</th>}
            <th className="px-3 py-2">Readiness</th>
            <th className="px-3 py-2">Remediation</th>
            <th className="px-3 py-2">Owner / due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={`${r.systemId}-${r.obligationId}`} className="align-top">
              <td className="px-3 py-2 text-xs font-medium text-slate-900 whitespace-nowrap">
                <Link href={`/report/systems/${r.systemId}`} className="hover:underline">{r.systemName}</Link>
              </td>
              <td className="px-3 py-2 text-xs text-slate-600">{RISK_TIER_LABELS[r.riskTier]}</td>
              <td className="px-3 py-2 text-xs text-slate-600">{r.roles.join(", ") || "-"}</td>
              <td className="px-3 py-2">
                <span className="text-xs font-mono font-semibold text-slate-500">{r.obligationId}</span>
                <p className="text-xs text-slate-600 max-w-[260px] line-clamp-2">{r.obligationName}</p>
              </td>
              <td className="px-3 py-2 text-xs text-slate-600">{r.legalBasisCitation}</td>
              <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{r.applicableFromDate}</td>
              {badgeMode !== "include_without_badge" && (
                <td className="px-3 py-2"><GuidanceStatusBadge status={r.guidanceStatus} /></td>
              )}
              <td className="px-3 py-2">
                {r.readinessStatus === "not_evidenced" ? (
                  <span className="text-xs text-slate-400">not evidenced</span>
                ) : (
                  <ReadinessStatusBadge status={r.readinessStatus as ReadinessStatus} />
                )}
              </td>
              <td className="px-3 py-2 text-xs text-slate-600">{r.remediationStatus?.replace(/_/g, " ") ?? "-"}</td>
              <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                {r.owner ?? "-"}{r.dueDate ? ` / ${r.dueDate.toISOString().slice(0, 10)}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
