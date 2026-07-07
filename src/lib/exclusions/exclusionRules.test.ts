// Module 5 self-check. Run with: npx tsx src/lib/exclusions/exclusionRules.test.ts

import assert from "node:assert";
import { buildExclusionAssessment, deriveExclusionAnswers, type ExclusionDerivableData } from "./exclusionRules";

const data = (overrides: Partial<ExclusionDerivableData> = {}): ExclusionDerivableData => ({
  status: "Production",
  buildType: null,
  usesGpaiOrLlm: null,
  ...overrides,
});

const baseAnswers = {
  militaryUse: "No",
  thirdCountryLawEnforcement: "No",
  researchOnly: "No – already on market/in service",
  openSourceRelease: "No – proprietary/commercial",
  personalUse: "No – professional/organisational use",
};

// X-01: military-only → excluded, with re-entry condition surfaced.
{
  const a = buildExclusionAssessment(data(), { ...baseAnswers, militaryUse: "Yes" });
  assert.strictEqual(a.status, "likely_excluded");
  assert(a.matchedCarveOuts.includes("X-01"));
  assert(a.fullExclusion, "military-only is a full exclusion");
  assert(a.revokingConditions.some((c) => c.includes("re-enters scope")), "re-entry condition surfaced");
}

// Military dual-use → NOT excluded (re-entry trigger).
{
  const a = buildExclusionAssessment(data(), { ...baseAnswers, militaryUse: "Partly / dual use" });
  assert.strictEqual(a.status, "likely_not_excluded", "dual use must not be excluded");
  assert(a.reEntryTriggers.length > 0, "dual-use re-entry trigger expected");
  assert(!a.fullExclusion);
}

// X-03/X-04: pre-market R&D → excluded.
{
  const a = buildExclusionAssessment(data({ status: "Idea" }), { ...baseAnswers, researchOnly: "Yes – pre-market R&D only" });
  assert.strictEqual(a.status, "likely_excluded");
  assert(a.matchedCarveOuts.includes("X-03") && a.matchedCarveOuts.includes("X-04"));
  assert(a.revokingConditions.some((c) => c.includes("real-world")), "real-world-testing revocation surfaced");
}

// R&D with real-world testing → NOT excluded.
{
  const a = buildExclusionAssessment(data(), { ...baseAnswers, researchOnly: "Includes real-world testing" });
  assert.strictEqual(a.status, "likely_not_excluded", "real-world testing remains in scope");
  assert(a.reEntryTriggers.some((t) => t.includes("Real-world")));
}

// X-06 revoked: open-source but high-risk/prohibited/transparency-triggering → not excluded.
{
  const a = buildExclusionAssessment(data(), {
    ...baseAnswers,
    openSourceRelease: "Open-source but high-risk/prohibited/transparency-triggering",
  });
  assert.strictEqual(a.status, "likely_not_excluded", "open-source high-risk must not be excluded");
  assert(a.notHighRiskDocumentationFlag, "Art 6(3) documentation flag expected");
}

// X-06: clean open-source release → conditional exclusion, never shown as clean.
{
  const a = buildExclusionAssessment(data({ usesGpaiOrLlm: "Yes" }), {
    ...baseAnswers,
    openSourceRelease: "Yes – free and open-source",
  });
  assert.strictEqual(a.status, "possibly_excluded_partial_conditional", "open-source carve-out is conditional");
  assert(a.openSourceGpaiResidualDutyFlag, "open-source GPAI residual duty flag expected");
  assert(a.revokingConditions.length > 0, "conditions surfaced");
  assert(!a.fullExclusion, "conditional exclusion must not short-circuit Module 6");
}

// X-05: natural-person personal use → partial exclusion (deployer obligations only).
{
  const a = buildExclusionAssessment(data(), { ...baseAnswers, personalUse: "Yes" });
  assert.strictEqual(a.status, "possibly_excluded_partial_conditional");
  assert(a.matchedCarveOuts.includes("X-05"));
  assert(a.roleConditionalObligation.includes("natural-person deployers"));
}

// Unanswered → needs_review.
{
  const a = buildExclusionAssessment(data(), {});
  assert.strictEqual(a.status, "needs_review");
  assert(a.confidenceScore < 50);
}

// Seeding from Module 1/2.
{
  const seeded = deriveExclusionAnswers(data({ status: "Production", buildType: "Bought/licensed from vendor" }), {
    businessOrProfessionalUse: "Yes",
  });
  assert.strictEqual(seeded.researchOnly, "No – already on market/in service");
  assert.strictEqual(seeded.openSourceRelease, "No – proprietary/commercial");
  assert.strictEqual(seeded.personalUse, "No – professional/organisational use");
}

console.log("exclusionRules.test.ts: all assertions passed");
