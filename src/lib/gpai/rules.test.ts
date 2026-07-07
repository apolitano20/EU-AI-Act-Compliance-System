// Module 10 self-check. Run with: npx tsx src/lib/gpai/rules.test.ts

import assert from "node:assert";
import { buildGpaiAssessment, deriveGpaiAnswers } from "./rules";

// Internal foundation model > 10^25 FLOP → R1+R2+R4 systemic risk.
{
  const a = buildGpaiAssessment({
    gpai_q1: "Yes",
    gpai_q2: "Yes, above 10^25 FLOP",
    gpai_q3: "No",
    gpai_q4: "No",
    gpai_q5: "No",
    gpai_q6: "No",
    gpai_q7: "No",
    gpai_q8: "Yes",
  });
  assert.strictEqual(a.status, "likely_gpai_provider");
  assert.strictEqual(a.systemicRisk, "presumed_by_compute");
  const ids = a.firedRules.map((r) => r.ruleId);
  assert(ids.includes("GPAI-R1") && ids.includes("GPAI-R2") && ids.includes("GPAI-R4") && ids.includes("GPAI-R9"));
  assert(a.registrationNote.includes("2 weeks"));
}

// External LLM API consumer → R6 downstream.
{
  const a = buildGpaiAssessment({
    gpai_q1: "No",
    gpai_q5: "Yes",
    annexXiiInfoReceived: "No",
    gpai_q6: "No",
    gpai_q7: "No",
  });
  assert.strictEqual(a.status, "downstream_consumer");
  assert(a.firedRules.some((r) => r.ruleId === "GPAI-R6"));
  assert(a.negativeIndicators.some((n) => n.includes("Annex XII")), "missing Annex XII info must be a negative indicator");
}

// Fine-tuned third-party model → R7 + Module 9 trigger.
{
  const a = buildGpaiAssessment({ gpai_q1: "No", gpai_q5: "Yes", annexXiiInfoReceived: "Yes", gpai_q6: "Yes", gpai_q7: "No" });
  assert(a.firedRules.some((r) => r.ruleId === "GPAI-R7"));
  assert(a.emitsModule9Trigger, "GPAI-R7 must emit a Module 9 reclassification trigger");
}

// Open-source non-systemic model → R5 partial exemption, but copyright/summary (R9) still flagged.
{
  const a = buildGpaiAssessment({
    gpai_q1: "Yes",
    gpai_q2: "No, below 10^25 FLOP",
    gpai_q3: "No",
    gpai_q4: "Yes",
    gpai_q5: "No",
    gpai_q6: "No",
    gpai_q7: "No",
    gpai_q8: "No",
  });
  assert(a.openSourcePartialExemption);
  const ids = a.firedRules.map((r) => r.ruleId);
  assert(ids.includes("GPAI-R5") && ids.includes("GPAI-R9"), "copyright duty applies to open-source providers too");
  assert(a.negativeIndicators.some((n) => n.includes("copyright")), "missing copyright policy flagged");
}

// Systemic-risk-by-designation surfaced as uncertainty → possibly_systemic_risk_needs_review.
{
  const a = buildGpaiAssessment({ gpai_q1: "Yes", gpai_q2: "No, below 10^25 FLOP", gpai_q3: "Yes", gpai_q8: "Yes" });
  assert.strictEqual(a.status, "possibly_systemic_risk_needs_review");
  assert(a.keyUncertainties.some((u) => u.includes("Commission-discretionary")), "designation must be an uncertainty, not a hard rule");
  assert(a.firedRules.some((r) => r.ruleId === "GPAI-R3") && a.firedRules.some((r) => r.ruleId === "GPAI-R4"));
}

// GPAI in a potentially high-risk system → R8 cross-dependency.
{
  const a = buildGpaiAssessment({ gpai_q1: "No", gpai_q5: "No", gpai_q7: "Yes" });
  assert.strictEqual(a.status, "gpai_in_high_risk_context");
  assert(a.firedRules.some((r) => r.ruleId === "GPAI-R8"));
}

// Seeding.
{
  const seeded = deriveGpaiAnswers(
    {
      usesGpaiOrLlm: "Yes",
      modelProvider: "OpenAI",
      underlyingModelOrTool: "GPT-5",
      buildType: "Bought/licensed from vendor",
      systemTypes: [],
      riskDomainFlags: ["Recruitment or hiring"],
      affectsDecisionsAboutPeople: "Yes",
      modifiedFineTunedRebrandedOrRepurposed: null,
    },
    { fineTunedOrRetrainedModel: "No" }
  );
  assert.strictEqual(seeded.gpai_q5, "Yes");
  assert.strictEqual(seeded.gpai_q7, "Yes");
  assert.strictEqual(seeded.gpai_q6, "No");
}

console.log("gpai rules.test.ts: all assertions passed");
