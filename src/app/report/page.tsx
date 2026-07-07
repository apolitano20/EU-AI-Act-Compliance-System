import Link from "next/link";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { ReportControls } from "@/components/report/report-controls";
import { RegisterTable } from "@/components/report/register-table";
import { getFinalReport } from "@/lib/report/store";
import { RISK_TIER_LABELS } from "@/lib/report/reportRules";

export const dynamic = "force-dynamic";

export default async function ReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const report = await getFinalReport(params);
  const { rollUp, options } = report;

  const cards = [
    { label: "Systems covered", value: rollUp.systemsCovered, color: "text-slate-800" },
    { label: "Likely high-risk", value: rollUp.countsByTier.likely_high_risk, color: "text-red-700" },
    { label: "Prohibited-practice flags", value: rollUp.countsByTier.prohibited_flag, color: "text-red-700" },
    { label: "Average readiness", value: `${rollUp.averageReadiness}%`, color: "text-blue-700" },
    { label: "Open remediation items", value: rollUp.openRemediation, color: "text-orange-700" },
    { label: "Unassigned items", value: rollUp.unassignedRemediation, color: "text-amber-700" },
    { label: "Obligations on non-final guidance", value: rollUp.nonFinalObligations, color: "text-purple-700" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">EU AI Act Readiness Report</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-3xl">
            Module 15 — aggregates Modules 1-14 with no new classification. Every obligation line cites its legal
            basis and applicable date; anything resting on draft/provisional guidance is badged and collected in the
            <Link href="/report/non-final-guidance" className="text-blue-600 hover:underline"> non-final-guidance appendix</Link>,
            never presented as settled law. Audience: {options.audience.replace(/_/g, " ")}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Report confidence</span>
          <ConfidenceBadge label={rollUp.confidenceLabel} />
        </div>
      </div>

      <Disclaimer />
      <ReportControls options={options} register={report.register} />

      {/* 1. Executive summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Executive summary</h2>
        <p className="text-sm text-slate-700">{rollUp.headline}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-lg border border-slate-100 px-3 py-2">
              <p className="text-xs text-slate-500 leading-tight mb-0.5">{c.label}</p>
              <p className={`text-xl font-semibold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Per-system pages */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Per-system reports</h2>
        <div className="divide-y divide-slate-100">
          {report.reports.map((r) => (
            <div key={r.systemId} className="py-2 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <Link href={`/report/systems/${r.systemId}`} className="text-sm font-medium text-blue-700 hover:underline">
                  {r.systemName}
                </Link>
                <span className="text-xs text-slate-500 ml-2">{RISK_TIER_LABELS[r.riskTier]}</span>
                {r.promotedByReclassification && <span className="text-xs text-red-600 ml-2">promoted to Provider (Art 25)</span>}
              </div>
              <div className="text-xs text-slate-600">
                {r.applicableObligations} obligations · readiness {r.readinessScore}/100 ·{" "}
                {options.remediationDetail === "full"
                  ? `${r.remediation.closed}/${r.remediation.total} remediation closed, ${r.remediation.unassigned} unassigned`
                  : `remediation ${r.remediation.total > 0 ? Math.round((100 * r.remediation.closed) / r.remediation.total) : 0}%`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Portfolio obligations register */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Obligations register (portfolio)</h2>
        <RegisterTable rows={report.register} badgeMode={options.badgeMode} />
      </div>

      {/* 4. Appendix pointer + 5. consistency warnings + 6. assumptions */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-sm text-purple-800">
        {rollUp.nonFinalObligations} obligation line(s) rest on draft/provisional guidance —{" "}
        <Link href="/report/non-final-guidance" className="underline font-medium">see the dedicated appendix</Link>.
        A provisional deadline or in-flux obligation is never presented as final.
      </div>

      {report.consistencyWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <h2 className="text-sm font-semibold text-amber-800 mb-1">Cross-module consistency warnings</h2>
          <ul className="space-y-1">
            {report.consistencyWarnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-800">
                <span className="font-medium">{w.systemName}:</span> {w.warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Assumptions &amp; disclaimers</h2>
        <ul className="space-y-1">
          {report.assumptions.map((a) => <li key={a} className="text-xs text-slate-600">- {a}</li>)}
        </ul>
      </div>
    </div>
  );
}
