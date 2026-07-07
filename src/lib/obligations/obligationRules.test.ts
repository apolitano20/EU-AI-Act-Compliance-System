// Module 12 self-check. Run with: npx tsx src/lib/obligations/obligationRules.test.ts

import assert from "node:assert";
import { buildObligationAssessment, buildObligationMatrix, applyReclassification, type ObligationContext } from "./obligationRules";

const baseCtx = (overrides: Partial<ObligationContext> = {}): ObligationContext => ({
  effectiveRoles: ["Provider"],
  promotedByReclassification: false,
  definitionClassification: "likely_ai_system",
  scopeStatus: "likely_in_scope",
  fullyExcluded: false,
  exclusionStatus: "likely_not_excluded",
  prohibitedStatus: "likely_not_prohibited",
  highRiskStatus: "likely_high_risk",
  highRiskRegistrationRequired: true,
  carveOutApplied: false,
  authorisedRepRequired: false,
  literacyApplies: true,
  art50TriggerIds: [],
  friaStatus: "not_required",
  gpaiProvider: false,
  gpaiSystemicRisk: "not_indicated",
  matchedAnnexIiiAreas: ["Employment, worker management and access to self-employment"],
  ...overrides,
});

// Confirmed high-risk provider → full provider row set + registration + conformity.
{
  const rows = buildObligationMatrix(baseCtx(), {});
  const ids = rows.map((r) => r.obligationId);
  for (const expected of [
    "OBL-ART9-RMS", "OBL-ART10-DATA", "OBL-ART11-TECHDOC", "OBL-ART12-LOGGING",
    "OBL-ART13-TRANSP-DEPLOYER", "OBL-ART14-OVERSIGHT", "OBL-ART15-ACCURACY", "OBL-ART17-QMS",
    "OBL-ART43-CONFORMITY", "OBL-ART49-REGISTER", "OBL-ART72-PMM", "OBL-ART73-INCIDENT",
    "OBL-ART4-LITERACY",
  ]) {
    assert(ids.includes(expected), `expected ${expected} in provider row set`);
  }
  assert(!ids.includes("OBL-ART26-DEPLOYER"), "deployer row must not fire for a provider-only role");
  assert(rows.every((r) => r.status === "likely_applies"));
  const rms = rows.find((r) => r.obligationId === "OBL-ART9-RMS");
  assert.strictEqual(rms?.guidanceStatus, "provisional");
  assert.strictEqual(rms?.applicableFromDate, "2027-12-02");
}

// Deployer of a high-risk system → OBL-ART26 + literacy + transparency pointer where triggered.
{
  const rows = buildObligationMatrix(
    baseCtx({ effectiveRoles: ["Deployer"], art50TriggerIds: ["TR-R3"], friaStatus: "likely_required" }),
    {}
  );
  const ids = rows.map((r) => r.obligationId);
  assert(ids.includes("OBL-ART26-DEPLOYER"));
  assert(ids.includes("OBL-ART50-TRANSP-AGG"));
  assert(ids.includes("OBL-ART73-INCIDENT"));
  assert(!ids.includes("OBL-ART9-RMS"), "provider rows must not fire for deployer-only role");
}

// Prohibited system → single "must not place on market" row.
{
  const rows = buildObligationMatrix(baseCtx({ prohibitedStatus: "likely_prohibited" }), {});
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].obligationId, "OBL-ART5-PROHIBITED");
  const a = buildObligationAssessment(baseCtx({ prohibitedStatus: "likely_prohibited" }), {});
  assert.strictEqual(a.status, "prohibited_short_circuit");
}

// Out-of-scope system → rows suppressed + consistency-warning status.
{
  const a = buildObligationAssessment(baseCtx({ scopeStatus: "likely_out_of_scope" }), {});
  assert.strictEqual(a.rows.length, 0);
  assert.strictEqual(a.status, "suppressed_out_of_scope");
}

// Non-EU high-risk provider → OBL-ART22-AUTHREP emitted.
{
  const rows = buildObligationMatrix(baseCtx({ authorisedRepRequired: true }), { establishedOutsideEu: "Yes" });
  assert(rows.some((r) => r.obligationId === "OBL-ART22-AUTHREP"));
}

// Module 9 promotion re-runs the provider set against a deployer.
{
  const roles = applyReclassification(["Deployer"], true);
  assert(roles.includes("Provider") && roles.includes("Deployer"));
  const rows = buildObligationMatrix(baseCtx({ effectiveRoles: roles, promotedByReclassification: true }), {});
  assert(rows.some((r) => r.obligationId === "OBL-ART9-RMS"), "promoted deployer inherits provider rows");
  assert(rows.some((r) => r.obligationId === "OBL-ART26-DEPLOYER"), "deployer rows remain");
}

// Art 6(3) carve-out → OBL-ART6-3-NOTHR-DOC (draft) + registration of the self-assessment.
{
  const rows = buildObligationMatrix(baseCtx({ highRiskStatus: "not_high_risk_carve_out", carveOutApplied: true }), {});
  const doc = rows.find((r) => r.obligationId === "OBL-ART6-3-NOTHR-DOC");
  assert(doc, "Art 6(3) documentation row expected");
  assert.strictEqual(doc?.guidanceStatus, "draft");
  assert(rows.some((r) => r.obligationId === "OBL-ART49-REGISTER"), "self-assessment registration row expected");
  assert(!rows.some((r) => r.obligationId === "OBL-ART9-RMS"), "high-risk provider rows must not fire under the carve-out");
}

// GPAI provider → OBL-GPAI-AGG with systemic-risk sub-flag note.
{
  const rows = buildObligationMatrix(baseCtx({ highRiskStatus: "likely_not_high_risk", matchedAnnexIiiAreas: [], gpaiProvider: true, gpaiSystemicRisk: "presumed_by_compute" }), {});
  const gpai = rows.find((r) => r.obligationId === "OBL-GPAI-AGG");
  assert(gpai);
  assert(gpai?.note?.includes("Article 55"));
  assert.strictEqual(gpai?.applicableFromDate, "2025-08-02");
}

// Unresolved high-risk status → provider rows possibly_applies + confidence penalty.
{
  const a = buildObligationAssessment(baseCtx({ highRiskStatus: "possibly_high_risk" }), {});
  const rms = a.rows.find((r) => r.obligationId === "OBL-ART9-RMS");
  assert.strictEqual(rms?.status, "possibly_applies");
  assert(a.confidenceScore <= 80);
}

console.log("obligationRules.test.ts: all assertions passed");
