import Link from "next/link";
import { Disclaimer } from "@/components/shared/disclaimer";
import { GuidanceStatusBadge } from "@/components/shared/guidance-status-badge";
import { PrintButton } from "@/components/report/print-button";
import { getFinalReport } from "@/lib/report/store";

export const dynamic = "force-dynamic";

export default async function NonFinalGuidancePage() {
  const report = await getFinalReport({});
  const entries = report.nonFinalAppendix;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/report" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3">
            ← Back to organisation report
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Appendix — Obligations resting on draft/provisional guidance</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-3xl">
            Every obligation line whose rule text, boundary or enforcement date rests on non-final material (the
            Digital Omnibus 2026-05 provisional agreement or the 2026-05-19 draft high-risk guidelines). These are
            included in the report and badged — never presented as settled law.
          </p>
        </div>
        <PrintButton />
      </div>

      <Disclaimer />

      <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-x-auto">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No obligations resting on non-final guidance in the current portfolio.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-600">
                <th className="px-3 py-2">System</th>
                <th className="px-3 py-2">Obligation</th>
                <th className="px-3 py-2">Legal basis</th>
                <th className="px-3 py-2">Applicable from</th>
                <th className="px-3 py-2">Guidance</th>
                <th className="px-3 py-2">Non-final source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e, i) => (
                <tr key={i} className="align-top">
                  <td className="px-3 py-2 text-xs font-medium text-slate-900 whitespace-nowrap">{e.systemName}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs font-mono font-semibold text-slate-500">{e.obligationId}</span>
                    <p className="text-xs text-slate-600 max-w-[280px] line-clamp-2">{e.obligationName}</p>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{e.legalBasisCitation}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{e.applicableFromDate}</td>
                  <td className="px-3 py-2"><GuidanceStatusBadge status={e.guidanceStatus} /></td>
                  <td className="px-3 py-2 text-xs text-slate-600 max-w-[280px]">{e.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
