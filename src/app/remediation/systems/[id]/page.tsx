import { notFound } from "next/navigation";
import { getRemediationView } from "@/lib/remediation/store";
import { Disclaimer } from "@/components/shared/disclaimer";
import { ConsistencyWarning } from "@/components/shared/consistency-warning";
import { ModuleDetailHeader } from "@/components/shared/assessment-panels";
import { RemediationBoard } from "@/components/remediation/remediation-board";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { confidenceLabelFor } from "@/lib/assessment-shared";

export const dynamic = "force-dynamic";

export default async function RemediationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = await getRemediationView(id);
  if (!view) notFound();

  const { bundle, items, planStale, planConfidence, gapsWithoutItems } = view;
  const system = bundle.system;

  const warnings: string[] = [];
  if (planStale) {
    warnings.push(
      "The role set has changed since this plan was generated (Module 9 reclassification) — the plan is stale. Regenerate to capture the additional provider-obligation gaps; owners and due dates already set are preserved."
    );
  }
  if (bundle.readiness.confidenceLabel === "low" || bundle.readiness.confidenceLabel === "insufficient_information") {
    warnings.push("This plan is built from a low-confidence Module 13 readiness picture — gaps may be over- or under-stated.");
  }
  if (bundle.obligations.standardsConformityRoute.includes("No harmonised standards") || bundle.obligations.standardsConformityRoute.includes("not yet published")) {
    warnings.push("Schedule risk: harmonised standards are not yet published for the conformity item — the due date may be undeliverable regardless of owner effort.");
  }

  const assigned = items.filter((i) => i.owner && (i.dueDate || i.nextDueAt)).length;
  const closedCount = items.filter((i) => ["completed", "verified"].includes(i.status)).length;
  const recurringActive = items.filter((i) => i.recurrenceKind !== "one_off" && i.status !== "not_applicable").length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <ModuleDetailHeader backHref="/remediation" system={system} />

      <Disclaimer />
      <ConsistencyWarning messages={warnings} />

      <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 flex-wrap">
        <ConfidenceBadge label={confidenceLabelFor(planConfidence)} />
        <span className="text-sm text-slate-700">
          {assigned} of {items.length} items have an owner and due date · {closedCount} closed · {recurringActive} recurring controls active
        </span>
        <span className="text-xs text-slate-400">Plan confidence measures completeness of the plan, not compliance.</span>
      </div>

      <RemediationBoard systemId={system.id} items={items} gapsWithoutItems={gapsWithoutItems} />
    </div>
  );
}
