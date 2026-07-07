import type { RemediationItem } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getAssessmentBundle, listAssessmentBundles, type AssessmentBundle } from "@/lib/assessment-pipeline";
import { scorePlanConfidence } from "./remediationRules";

export interface RemediationSystemView {
  bundle: AssessmentBundle;
  items: RemediationItem[];
  planConfidence: number;
  /** True when the effective role set changed since the plan was generated. */
  planStale: boolean;
  gapsWithoutItems: number;
}

const GAP_STATUSES = new Set(["partial_evidence", "evidence_gap", "not_started", "unknown_evidence_state"]);

function toView(bundle: AssessmentBundle, items: RemediationItem[]): RemediationSystemView {
  const roleSet = bundle.obligations.effectiveRoles.join(", ");
  const planStale = items.some((i) => i.generatedFromRoleSet !== null && i.generatedFromRoleSet !== roleSet);
  const gaps = bundle.readiness.checklist.filter((r) => GAP_STATUSES.has(r.readinessStatus));
  const covered = new Set(items.map((i) => i.obligationId));
  return {
    bundle,
    items,
    planConfidence: scorePlanConfidence(items, bundle.readiness.confidenceLabel),
    planStale,
    gapsWithoutItems: gaps.filter((g) => !covered.has(g.obligationId)).length,
  };
}

export async function listRemediationViews(): Promise<RemediationSystemView[]> {
  const [bundles, items] = await Promise.all([
    listAssessmentBundles(),
    prisma.remediationItem.findMany({ orderBy: [{ priority: "asc" }, { dueDate: "asc" }] }),
  ]);
  const bySystem = new Map<string, RemediationItem[]>();
  for (const item of items) {
    const list = bySystem.get(item.systemId) ?? [];
    list.push(item);
    bySystem.set(item.systemId, list);
  }
  return bundles.map((b) => toView(b, bySystem.get(b.system.id) ?? []));
}

export async function getRemediationView(id: string): Promise<RemediationSystemView | null> {
  const bundle = await getAssessmentBundle(id);
  if (!bundle) return null;
  const items = await prisma.remediationItem.findMany({
    where: { systemId: id },
    orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
  });
  return toView(bundle, items);
}
