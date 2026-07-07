import { notFound } from "next/navigation";
import Link from "next/link";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { RegisterTable } from "@/components/report/register-table";
import { PrintButton } from "@/components/report/print-button";
import { getSystemReport } from "@/lib/report/store";
import { RISK_TIER_LABELS } from "@/lib/report/reportRules";
import { collectNonFinalGuidance } from "@/lib/report/reportRules";
import type { ConfidenceLabel } from "@/lib/assessment-shared";

export const dynamic = "force-dynamic";

export default async function SystemReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getSystemReport(id);
  if (!report) notFound();

  const nonFinal = collectNonFinalGuidance(report.register);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <ModuleDetailHeader
          backHref="/report"
          backLabel="Back to organisation report"
          system={{ id: report.systemId, systemName: report.systemName, shortDescription: report.shortDescription }}
        />
        <PrintButton />
      </div>

      <Disclaimer />
      <ConsistencyWarning messages={report.consistencyWarnings} />

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-3 flex-wrap text-sm text-slate-700">
          <span className="font-semibold">{RISK_TIER_LABELS[report.riskTier]}</span>
          <span>Role(s): {report.roles.join(", ") || "-"}{report.promotedByReclassification && " (promoted via Art 25)"}</span>
          <span>Readiness: {report.readinessScore}/100</span>
          <span>
            Remediation: {report.remediation.closed}/{report.remediation.total} closed, {report.remediation.unassigned} unassigned,
            {" "}{report.remediation.recurringActive} recurring controls
          </span>
        </div>
        <div className="text-xs text-slate-600 mt-2 space-y-0.5">
          <p>Registration: {report.registrationRequired ? "required / outstanding — see the register row" : "no registration row emitted"}.</p>
          <p>Conformity route: {report.standardsConformityRoute}</p>
          {report.notHighRiskDocumentationFlag && (
            <p className="text-blue-700">Art 6(3) not-high-risk self-assessment + registration outstanding — this system is NOT &quot;nothing to do&quot;.</p>
          )}
          {report.missingUpstream.length > 0 && (
            <p className="text-amber-700">Incomplete upstream inputs: {report.missingUpstream.join("; ")} — shown as incomplete, not silently dropped.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Module-by-module status</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {report.moduleStatuses.map((m) => (
              <tr key={m.module}>
                <td className="py-1.5 pr-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                  <Link href={`${m.route}/systems/${report.systemId}`} className="hover:underline">
                    {m.module}
                  </Link>
                </td>
                <td className="py-1.5 pr-3 text-xs text-slate-600">{m.status}{m.note && <span className="text-amber-700"> — {m.note}</span>}</td>
                <td className="py-1.5"><ConfidenceBadge label={m.confidenceLabel as ConfidenceLabel} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Obligations register (badged)</h2>
        <RegisterTable rows={report.register} badgeMode="include_and_badge" />
      </div>

      {nonFinal.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
          <h2 className="text-sm font-semibold text-purple-800 mb-1">Legal-basis footnotes — non-final guidance</h2>
          <ul className="space-y-1">
            {nonFinal.map((e) => (
              <li key={e.obligationId} className="text-xs text-purple-800">
                {e.obligationId} [{e.legalBasisCitation}] — {e.source}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
