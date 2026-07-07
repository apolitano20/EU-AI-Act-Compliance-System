// Module 14 — Remediation Tracker (modules_mds/module-14-remediation-tracker.md).
// Turns each Module 13 evidence gap into a trackable remediation action item
// with an owner, a due date and a status. Does NOT re-derive applicability
// (Module 12) or evidence state (Module 13). One-off tasks are separated from
// recurring/lifecycle controls, which are re-armed on completion, never
// permanently "done". Pure rules only — persistence lives in the actions.

import { SOURCE_VERSION_DATE, type GuidanceStatus } from "@/lib/assessment-shared";
import type { EvidenceChecklistRow } from "@/lib/evidence/evidenceRules";

export const REMEDIATION_SOURCE_VERSION_DATE = SOURCE_VERSION_DATE;

export type RecurrenceKind = "one_off" | "one_off_then_recurring" | "recurring";
export type Cadence = "monthly" | "quarterly" | "semi_annually" | "annually" | "event_driven" | "custom";
export type RemediationStatus = "open" | "in_progress" | "blocked" | "completed" | "verified" | "deferred" | "not_applicable";
export type RemediationPriority = "critical" | "high" | "medium" | "low";

export const REMEDIATION_STATUSES: RemediationStatus[] = ["open", "in_progress", "blocked", "completed", "verified", "deferred", "not_applicable"];
export const REMEDIATION_PRIORITIES: RemediationPriority[] = ["critical", "high", "medium", "low"];
export const CADENCES: Cadence[] = ["monthly", "quarterly", "semi_annually", "annually", "event_driven", "custom"];

/** recurrence_map per spec: obligation_id → recurrence + default cadence + task wording. */
export const RECURRENCE_MAP: Record<string, { kind: RecurrenceKind; cadence?: Cadence; task: string }> = {
  "OBL-ART9-RMS": { kind: "recurring", cadence: "quarterly", task: "Stand up and maintain the lifecycle risk-management process" },
  "OBL-ART10-DATA": { kind: "one_off_then_recurring", cadence: "event_driven", task: "Produce data-governance documentation (review on data change)" },
  "OBL-ART11-TECHDOC": { kind: "one_off_then_recurring", cadence: "event_driven", task: "Author and keep current the Annex IV technical documentation file" },
  "OBL-ART12-LOGGING": { kind: "one_off_then_recurring", cadence: "quarterly", task: "Implement logging design; run recurring retention checks" },
  "OBL-ART13-TRANSP-DEPLOYER": { kind: "one_off_then_recurring", cadence: "event_driven", task: "Prepare deployer instructions for use (update on change)" },
  "OBL-ART14-OVERSIGHT": { kind: "one_off_then_recurring", cadence: "annually", task: "Design human-oversight measures; run recurring operator training" },
  "OBL-ART15-ACCURACY": { kind: "one_off_then_recurring", cadence: "event_driven", task: "Produce accuracy/robustness/cybersecurity evidence (re-test on change)" },
  "OBL-ART17-QMS": { kind: "recurring", cadence: "annually", task: "Document and periodically review the quality management system" },
  "OBL-ART26-DEPLOYER": { kind: "one_off_then_recurring", cadence: "quarterly", task: "Set up deployer duties; run recurring monitoring/log-keeping" },
  "OBL-ART43-CONFORMITY": { kind: "one_off", task: "Complete conformity assessment, EU declaration of conformity and CE marking (re-run on substantial modification)" },
  "OBL-ART49-REGISTER": { kind: "one_off_then_recurring", cadence: "event_driven", task: "Register in the EU database (update on change)" },
  "OBL-ART6-3-NOTHR-DOC": { kind: "one_off_then_recurring", cadence: "event_driven", task: "Document and register the Article 6(3) not-high-risk self-assessment (review on change)" },
  "OBL-ART72-PMM": { kind: "recurring", cadence: "monthly", task: "Stand up and run post-market monitoring" },
  "OBL-ART73-INCIDENT": { kind: "recurring", cadence: "event_driven", task: "Establish the serious-incident reporting procedure with an owner" },
  "OBL-ART22-AUTHREP": { kind: "one_off", task: "Appoint an EU-established authorised representative by written mandate" },
  "OBL-ART50-TRANSP-AGG": { kind: "one_off_then_recurring", cadence: "event_driven", task: "Implement the applicable Article 50 disclosures/markings (and FRIA where triggered)" },
  "OBL-ART4-LITERACY": { kind: "recurring", cadence: "annually", task: "Deliver AI-literacy measures with an annual refresh" },
  "OBL-GPAI-AGG": { kind: "one_off_then_recurring", cadence: "event_driven", task: "Produce the GPAI provider artefacts (docs, copyright policy, training-content summary)" },
};

/** Spec-named helper. */
export function classifyRecurrence(obligationId: string): { kind: RecurrenceKind; cadence?: Cadence } {
  const entry = RECURRENCE_MAP[obligationId];
  return entry ? { kind: entry.kind, cadence: entry.cadence } : { kind: "one_off" };
}

// Already-in-force obligations get an immediate/near-term due date, not the
// deferred high-risk date.
const IN_FORCE_DATES = new Set(["2025-02-02", "2025-08-02", "2026-08-02"]);

const DAY = 24 * 60 * 60 * 1000;

/**
 * Spec-named helper: suggested_due_date = applicable_from_date − lead-time
 * buffer (larger for the notified-body conformity route). `now` is injected so
 * the rules stay deterministic/testable.
 */
export function suggestDueDate(row: Pick<EvidenceChecklistRow, "obligationId" | "applicableFromDate">, now: Date, notifiedBodyRoute = false): Date {
  if (!row.applicableFromDate || IN_FORCE_DATES.has(row.applicableFromDate)) {
    // Already in force — immediate/near-term: 30 days out.
    return new Date(now.getTime() + 30 * DAY);
  }
  const target = new Date(`${row.applicableFromDate}T00:00:00Z`);
  const bufferDays = row.obligationId === "OBL-ART43-CONFORMITY" ? (notifiedBodyRoute ? 365 : 180) : 90;
  const suggested = new Date(target.getTime() - bufferDays * DAY);
  return suggested > now ? suggested : new Date(now.getTime() + 30 * DAY);
}

/**
 * Spec-named helper: priority = f(deadline proximity, gap size, guidance
 * status). In-force obligations outrank deferred high-risk items; 'not
 * started' > 'partial'; draft/provisional items are surfaced but flagged.
 */
export function computePriority(
  row: Pick<EvidenceChecklistRow, "obligationId" | "readinessStatus" | "applicableFromDate" | "guidanceStatus">
): RemediationPriority {
  const inForce = !row.applicableFromDate || IN_FORCE_DATES.has(row.applicableFromDate);
  const bigGap = row.readinessStatus === "not_started" || row.readinessStatus === "evidence_gap";
  // Spec example calibration: among deferred provisional gaps, one-off artifacts
  // (e.g. the Annex IV file) outrank standing recurring controls (e.g. Art 72 PMM).
  const oneOffArtifact = classifyRecurrence(row.obligationId).kind !== "recurring";

  if (inForce && bigGap) return "critical";
  if (inForce) return "high";
  if (bigGap) return row.guidanceStatus === "final" || oneOffArtifact ? "high" : "medium";
  return row.guidanceStatus === "final" ? "medium" : "low";
}

/** A generated (not yet persisted) remediation item — the actions upsert these. */
export interface GeneratedRemediationItem {
  obligationId: string;
  title: string;
  sourceGapStatus: string;
  suggestedDueDate: Date;
  recurrenceKind: RecurrenceKind;
  cadence: Cadence | null;
  priority: RemediationPriority;
  legalBasisCitation: string;
  applicableFromDate: string | null;
  guidanceStatus: GuidanceStatus;
}

const GAP_STATUSES = new Set(["partial_evidence", "evidence_gap", "not_started", "unknown_evidence_state"]);

/** Spec-named helper: one item per Module 13 gap (not 'in place'/'not applicable'). */
export function generateRemediationItems(checklist: EvidenceChecklistRow[], now: Date, notifiedBodyRoute = false): GeneratedRemediationItem[] {
  return checklist
    .filter((row) => GAP_STATUSES.has(row.readinessStatus))
    .map((row) => {
      const recurrence = classifyRecurrence(row.obligationId);
      return {
        obligationId: row.obligationId,
        title: RECURRENCE_MAP[row.obligationId]?.task ?? `Close the evidence gap for ${row.obligationId}`,
        sourceGapStatus: row.readinessStatus,
        suggestedDueDate: suggestDueDate(row, now, notifiedBodyRoute),
        recurrenceKind: recurrence.kind,
        cadence: recurrence.cadence ?? null,
        priority: computePriority(row),
        legalBasisCitation: row.legalBasis,
        applicableFromDate: row.applicableFromDate ?? null,
        guidanceStatus: row.guidanceStatus,
      };
    });
}

const CADENCE_DAYS: Record<Cadence, number | null> = {
  monthly: 30,
  quarterly: 91,
  semi_annually: 182,
  annually: 365,
  event_driven: null, // re-armed without a fixed next-due date (re-arm on trigger)
  custom: null,
};

/**
 * Spec-named helper: completing a recurring item re-arms it (schedules the next
 * occurrence) rather than closing it. Returns the field patch to persist.
 */
export function completeItem(
  item: { recurrenceKind: string; cadence: string | null },
  now: Date
): { status: RemediationStatus; lastCompletedAt: Date; nextDueAt: Date | null } {
  const recurring = item.recurrenceKind === "recurring" || item.recurrenceKind === "one_off_then_recurring";
  if (!recurring) {
    return { status: "completed", lastCompletedAt: now, nextDueAt: null };
  }
  const days = item.cadence ? CADENCE_DAYS[item.cadence as Cadence] ?? null : null;
  return {
    status: "verified", // re-armed: verified now, due again at nextDueAt / on trigger
    lastCompletedAt: now,
    nextDueAt: days ? new Date(now.getTime() + days * DAY) : null,
  };
}

/** Plan-level confidence (completeness of the remediation plan, not compliance). */
export function scorePlanConfidence(
  items: Array<{ owner: string | null; dueDate: Date | null; recurrenceKind: string; cadence: string | null }>,
  parentReadinessConfidenceLabel: string
): number {
  let score = 100;
  for (const item of items) {
    if (!item.owner) score -= 15;
    if (!item.dueDate) score -= 15;
    const recurring = item.recurrenceKind === "recurring" || item.recurrenceKind === "one_off_then_recurring";
    if (recurring && !item.cadence) score -= 10;
  }
  if (parentReadinessConfidenceLabel === "low" || parentReadinessConfidenceLabel === "insufficient_information") score -= 20;
  return Math.max(0, Math.min(100, score));
}
