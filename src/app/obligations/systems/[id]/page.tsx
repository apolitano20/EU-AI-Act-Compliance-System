import { notFound } from "next/navigation";
import { getObligationRow } from "@/lib/obligations/store";
import { obligationConsistencyMessages } from "@/lib/obligations/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { IndicatorGrid, ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { ObligationRowsTable } from "@/components/obligations/obligation-rows-table";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";

export const dynamic = "force-dynamic";

export default async function ObligationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getObligationRow(id);
  if (!row) notFound();

  const { system, result } = row;
  const dutyHolders = [...new Set(result.rows.flatMap((o) => o.dutyHolder))];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/obligations" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={obligationConsistencyMessages(row)} />

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <ConfidenceBadge label={result.confidenceLabel} />
          <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
          <span className="text-xs text-slate-600">
            Role(s): {result.effectiveRoles.join(", ") || "-"}
            {result.promotedByReclassification && " — promoted to Provider by Module 9"}
          </span>
        </div>
        <p className="text-sm text-slate-700 mt-3">{result.reasoningSummary}</p>
        <div className="text-xs text-slate-600 mt-2 space-y-0.5">
          <p>Registration: {result.registrationRequired ? "required (see OBL-ART49-REGISTER)" : "no registration row emitted"}</p>
          <p>Conformity route: {result.standardsConformityRoute}</p>
          {result.notHighRiskDocumentationFlag && (
            <p className="text-blue-700">Article 6(3) not-high-risk documentation flag set — see OBL-ART6-3-NOTHR-DOC.</p>
          )}
        </div>
      </div>

      {dutyHolders.length > 0 ? (
        dutyHolders.map((holder) => {
          const rows = result.rows.filter((o) => o.dutyHolder.includes(holder));
          return (
            <div key={holder} className="bg-white rounded-lg border border-slate-200 p-4 overflow-x-auto">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Duty holder: {holder}</h3>
              <ObligationRowsTable rows={rows} readinessHref={`/readiness/systems/${system.id}`} />
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">No obligation rows emitted for this system.</p>
        </div>
      )}

      <IndicatorGrid result={result} />
      <p className="text-xs text-slate-400">
        Rules version: {result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
