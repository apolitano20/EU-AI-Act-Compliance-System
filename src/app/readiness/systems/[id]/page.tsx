import { notFound } from "next/navigation";
import { getReadinessRow } from "@/lib/evidence/store";
import { readinessConsistencyMessages } from "@/lib/evidence/types";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { EvidenceChecklist } from "@/components/evidence/evidence-checklist";

export const dynamic = "force-dynamic";

export default async function ReadinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getReadinessRow(id);
  if (!row) notFound();

  const { system, matrix } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/readiness" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={readinessConsistencyMessages(row)} />

      <EvidenceChecklist
        systemId={system.id}
        initialAnswers={row.answers}
        matrix={{
          rows: matrix.rows,
          status: matrix.status,
          confidenceLabel: matrix.confidenceLabel,
          effectiveRoles: matrix.effectiveRoles,
          registrationRequired: matrix.registrationRequired,
          standardsConformityRoute: matrix.standardsConformityRoute,
          notHighRiskDocumentationFlag: matrix.notHighRiskDocumentationFlag,
        }}
      />

      <p className="text-xs text-slate-400">
        Rules version: {row.result.sourceVersionDate}. Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
