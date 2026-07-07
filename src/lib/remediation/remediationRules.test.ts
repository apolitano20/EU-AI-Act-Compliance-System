// Module 14 self-check. Run with: npx tsx src/lib/remediation/remediationRules.test.ts

import assert from "node:assert";
import type { EvidenceChecklistRow } from "../evidence/evidenceRules";
import { classifyRecurrence, completeItem, computePriority, generateRemediationItems, scorePlanConfidence, suggestDueDate } from "./remediationRules";

const NOW = new Date("2026-07-07T00:00:00Z");

const row = (overrides: Partial<EvidenceChecklistRow>): EvidenceChecklistRow => ({
  obligationId: "OBL-ART11-TECHDOC",
  obligationName: "Technical documentation",
  question: "",
  requiredArtifacts: [],
  answer: null,
  readinessStatus: "evidence_gap",
  legalBasis: "Art 11; Annex IV",
  applicableFromDate: "2027-12-02",
  guidanceStatus: "provisional",
  obligationType: "one_off_then_maintained",
  obligationStatus: "likely_applies",
  deadlinePriority: 0,
  ...overrides,
});

// Technical-documentation gap → one-off(-then-recurring) item, due before the high-risk date.
{
  const items = generateRemediationItems([row({})], NOW);
  assert.strictEqual(items.length, 1);
  const item = items[0];
  assert.strictEqual(item.obligationId, "OBL-ART11-TECHDOC");
  assert.strictEqual(item.recurrenceKind, "one_off_then_recurring");
  assert(item.suggestedDueDate < new Date("2027-12-02T00:00:00Z"), "due date must precede the applicable-from date");
  assert(item.suggestedDueDate > NOW);
}

// Post-market monitoring → recurring; completing it re-arms rather than closes.
{
  assert.deepStrictEqual(classifyRecurrence("OBL-ART72-PMM"), { kind: "recurring", cadence: "monthly" });
  const patch = completeItem({ recurrenceKind: "recurring", cadence: "monthly" }, NOW);
  assert.strictEqual(patch.status, "verified", "recurring item must not close");
  assert(patch.nextDueAt && patch.nextDueAt > NOW, "next occurrence scheduled");
  const oneOff = completeItem({ recurrenceKind: "one_off", cadence: null }, NOW);
  assert.strictEqual(oneOff.status, "completed");
  assert.strictEqual(oneOff.nextDueAt, null);
}

// In-force AI-literacy gap prioritised above a deferred high-risk gap.
{
  const literacy = computePriority(row({ obligationId: "OBL-ART4-LITERACY", applicableFromDate: "2025-02-02", guidanceStatus: "final", readinessStatus: "not_started" }));
  const deferred = computePriority(row({ readinessStatus: "not_started", guidanceStatus: "provisional" }));
  const order = ["critical", "high", "medium", "low"];
  assert(order.indexOf(literacy) < order.indexOf(deferred), `in-force (${literacy}) must outrank deferred (${deferred})`);
}

// 'not started' outranks 'partial'.
{
  const notStarted = computePriority(row({ readinessStatus: "not_started", guidanceStatus: "final" }));
  const partial = computePriority(row({ readinessStatus: "partial_evidence", guidanceStatus: "final" }));
  const order = ["critical", "high", "medium", "low"];
  assert(order.indexOf(notStarted) < order.indexOf(partial));
}

// In-force obligations get an immediate/near-term due date.
{
  const due = suggestDueDate({ obligationId: "OBL-ART4-LITERACY", applicableFromDate: "2025-02-02" }, NOW);
  assert(due.getTime() - NOW.getTime() <= 31 * 24 * 3600 * 1000, "in-force gap should be near-term");
}

// Notified-body conformity route gets a larger lead-time buffer.
{
  const selfAssess = suggestDueDate({ obligationId: "OBL-ART43-CONFORMITY", applicableFromDate: "2027-12-02" }, NOW, false);
  const notifiedBody = suggestDueDate({ obligationId: "OBL-ART43-CONFORMITY", applicableFromDate: "2027-12-02" }, NOW, true);
  assert(notifiedBody < selfAssess, "notified-body route must be scheduled earlier");
}

// 'In place'/'not applicable' rows generate no items; gaps and unknowns do.
{
  const items = generateRemediationItems(
    [
      row({ obligationId: "OBL-ART9-RMS", readinessStatus: "evidence_in_place" }),
      row({ obligationId: "OBL-ART10-DATA", readinessStatus: "not_applicable" }),
      row({ obligationId: "OBL-ART12-LOGGING", readinessStatus: "unknown_evidence_state" }),
    ],
    NOW
  );
  assert.deepStrictEqual(items.map((i) => i.obligationId), ["OBL-ART12-LOGGING"]);
}

// Unassigned gaps reduce plan confidence.
{
  const withOwner = scorePlanConfidence([{ owner: "DPO", dueDate: NOW, recurrenceKind: "one_off", cadence: null }], "high");
  const without = scorePlanConfidence([{ owner: null, dueDate: null, recurrenceKind: "recurring", cadence: null }], "high");
  assert(without < withOwner);
  assert.strictEqual(withOwner, 100);
  assert.strictEqual(without, 100 - 15 - 15 - 10);
}

console.log("remediationRules.test.ts: all assertions passed");
