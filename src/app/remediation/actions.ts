"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getAssessmentBundle } from "@/lib/assessment-pipeline";
import {
  completeItem,
  generateRemediationItems,
  CADENCES,
  REMEDIATION_PRIORITIES,
  REMEDIATION_STATUSES,
  type RemediationStatus,
} from "@/lib/remediation/remediationRules";

function revalidateRemediation(systemId: string) {
  revalidatePath("/remediation");
  revalidatePath(`/remediation/systems/${systemId}`);
  revalidatePath("/report");
  revalidatePath(`/report/systems/${systemId}`);
}

/**
 * Generate (or regenerate) the remediation plan for a system from the Module 13
 * gaps. Upserts one item per gap, PRESERVING owner/dueDate/status/notes already
 * set; suggested due date, priority (unless overridden), source gap and the
 * role-set snapshot are refreshed. Items whose gap has closed are left in place
 * (their history matters) — they are simply no longer regenerated.
 */
export async function generateRemediationPlan(systemId: string) {
  const id = systemId.trim();
  if (!id) throw new Error("System id is required");
  const bundle = await getAssessmentBundle(id);
  if (!bundle) throw new Error("System not found");

  const notifiedBodyRoute = bundle.obligations.standardsConformityRoute.includes("notified");
  const generated = generateRemediationItems(bundle.readiness.checklist, new Date(), notifiedBodyRoute);
  const roleSet = bundle.obligations.effectiveRoles.join(", ");

  for (const item of generated) {
    await prisma.remediationItem.upsert({
      where: { systemId_obligationId: { systemId: id, obligationId: item.obligationId } },
      create: {
        systemId: id,
        obligationId: item.obligationId,
        title: item.title,
        sourceGapStatus: item.sourceGapStatus,
        suggestedDueDate: item.suggestedDueDate,
        recurrenceKind: item.recurrenceKind,
        cadence: item.cadence,
        priority: item.priority,
        legalBasisCitation: item.legalBasisCitation,
        applicableFromDate: item.applicableFromDate,
        guidanceStatus: item.guidanceStatus,
        generatedFromRoleSet: roleSet,
      },
      update: {
        // Preserve owner/dueDate/status/notes; refresh the derived fields.
        title: item.title,
        sourceGapStatus: item.sourceGapStatus,
        suggestedDueDate: item.suggestedDueDate,
        recurrenceKind: item.recurrenceKind,
        legalBasisCitation: item.legalBasisCitation,
        applicableFromDate: item.applicableFromDate,
        guidanceStatus: item.guidanceStatus,
        generatedFromRoleSet: roleSet,
      },
    });
  }

  // Refresh priority only where the user has not overridden it.
  for (const item of generated) {
    await prisma.remediationItem.updateMany({
      where: { systemId: id, obligationId: item.obligationId, priorityOverridden: false },
      data: { priority: item.priority },
    });
  }

  revalidateRemediation(id);
  return generated.length;
}

export interface RemediationItemPatch {
  owner?: string | null;
  dueDate?: string | null; // ISO date
  status?: string;
  priority?: string;
  cadence?: string | null;
  notes?: string | null;
}

export async function updateRemediationItem(itemId: string, patch: RemediationItemPatch) {
  const item = await prisma.remediationItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Remediation item not found");

  const data: Record<string, unknown> = {};
  if ("owner" in patch) data.owner = patch.owner?.trim() || null;
  if ("dueDate" in patch) data.dueDate = patch.dueDate ? new Date(patch.dueDate) : null;
  if ("notes" in patch) data.notes = patch.notes?.trim() || null;
  if (patch.cadence !== undefined) {
    if (patch.cadence !== null && !(CADENCES as string[]).includes(patch.cadence)) throw new Error("Invalid cadence");
    data.cadence = patch.cadence;
  }
  if (patch.priority !== undefined) {
    if (!(REMEDIATION_PRIORITIES as string[]).includes(patch.priority)) throw new Error("Invalid priority");
    data.priority = patch.priority;
    data.priorityOverridden = true;
  }
  if (patch.status !== undefined) {
    if (!(REMEDIATION_STATUSES as string[]).includes(patch.status)) throw new Error("Invalid status");
    const nextOwner = "owner" in patch ? (patch.owner?.trim() || null) : item.owner;
    if (patch.status !== "open" && patch.status !== "not_applicable" && !nextOwner) {
      throw new Error("An owner is required before an item moves past 'open'.");
    }
    data.status = patch.status as RemediationStatus;
  }

  await prisma.remediationItem.update({ where: { id: itemId }, data });
  revalidateRemediation(item.systemId);
}

/** Completing a recurring item re-arms it (schedules the next occurrence). */
export async function completeRemediationItem(itemId: string) {
  const item = await prisma.remediationItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Remediation item not found");
  if (!item.owner) throw new Error("An owner is required before an item can be completed.");

  const patch = completeItem(item, new Date());
  await prisma.remediationItem.update({ where: { id: itemId }, data: patch });
  revalidateRemediation(item.systemId);
}
