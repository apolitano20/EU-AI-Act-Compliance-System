// Module 9 self-check. Run with: npx tsx src/lib/reclassification/reclassificationRules.test.ts

import assert from "node:assert";
import { buildReclassificationAssessment, evaluateReclassificationTriggers } from "./reclassificationRules";

const confirmed = { highRiskStatus: "likely_high_risk", roleConfidenceLabel: "high" };

// VCR-1: deployer rebrands a high-risk system → provider.
{
  const a = buildReclassificationAssessment(
    { ownNameOrTrademark: "Yes", substantialModification: "No", purposeChangedToHighRisk: "No", currentRole: "Deployer" },
    confirmed
  );
  assert.strictEqual(a.status, "reclassification_likely_triggered");
  assert(a.triggerFlags.rebranded);
  assert.strictEqual(a.newRole, "Provider");
  assert(a.firedRules.some((r) => r.ruleId === "VCR-1"));
  assert(a.firedRules.some((r) => r.ruleId === "VCR-4"), "original-provider cooperation duty expected");
  assert(a.originalProviderCooperation?.includes("Art 25(2)-(3)"));
  assert(a.registrationRequired);
}

// VCR-2: distributor makes an unforeseen compliance-affecting change → provider.
{
  const a = buildReclassificationAssessment(
    { ownNameOrTrademark: "No", substantialModification: "Yes", purposeChangedToHighRisk: "No", currentRole: "Distributor" },
    confirmed
  );
  assert(a.triggerFlags.substantialModification);
  assert.strictEqual(a.status, "reclassification_likely_triggered");
  assert(a.firedRules.some((r) => r.ruleId === "VCR-5"), "draft-guidelines caveat expected for the Art 3(23) boundary");
}

// VCR-3: GPAI repurposed to credit scoring (now high-risk) → provider.
{
  const a = buildReclassificationAssessment(
    { ownNameOrTrademark: "No", substantialModification: "No", purposeChangedToHighRisk: "Yes", currentRole: "Deployer" },
    confirmed
  );
  assert(a.triggerFlags.purposeChangedToHighRisk);
  assert.strictEqual(a.newRole, "Provider");
}

// Already the original provider → module does not apply.
{
  const a = buildReclassificationAssessment(
    { ownNameOrTrademark: "Yes", currentRole: "Already the provider" },
    confirmed
  );
  assert.strictEqual(a.status, "not_applicable_original_provider");
  assert(!a.anyTriggerFired);
}

// Pre-planned in-scope change (answered No) → no reclassification.
{
  const a = buildReclassificationAssessment(
    { ownNameOrTrademark: "No", substantialModification: "No", purposeChangedToHighRisk: "No", currentRole: "Deployer" },
    confirmed
  );
  assert.strictEqual(a.status, "no_reclassification");
}

// Trigger reported but Module 7 unconfirmed → needs_review (draft-reliant), flags stay false.
{
  const { flags, pending, draftReliant } = evaluateReclassificationTriggers(
    { ownNameOrTrademark: "Yes", currentRole: "Deployer" },
    { highRiskStatus: "possibly_high_risk" }
  );
  assert(!flags.rebranded, "trigger must not fire on unconfirmed high-risk");
  assert(pending.length > 0);
  assert(draftReliant);
  const a = buildReclassificationAssessment(
    { ownNameOrTrademark: "Yes", currentRole: "Deployer" },
    { highRiskStatus: "possibly_high_risk", roleConfidenceLabel: "high" }
  );
  assert.strictEqual(a.status, "needs_review");
  assert(a.confidenceScore < 75, "confidence must drop below the 75 baseline");
}

// Purpose change assessed but result not high-risk → Art 6(3) documentation flag.
{
  const a = buildReclassificationAssessment(
    { ownNameOrTrademark: "No", substantialModification: "No", purposeChangedToHighRisk: "No", currentRole: "Deployer" },
    { highRiskStatus: "likely_not_high_risk", roleConfidenceLabel: "high", purposeChangeReported: true }
  );
  assert(a.notHighRiskDocumentationFlag, "'no reclassification' ≠ 'nothing to document'");
}

console.log("reclassificationRules.test.ts: all assertions passed");
