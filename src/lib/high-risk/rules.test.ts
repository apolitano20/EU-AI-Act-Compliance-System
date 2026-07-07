// Module 7 self-check. Run with: npx tsx src/lib/high-risk/rules.test.ts

import assert from "node:assert";
import { buildHighRiskAssessment, deriveHighRiskAnswers, type HighRiskDerivableData } from "./rules";

const data = (overrides: Partial<HighRiskDerivableData> = {}): HighRiskDerivableData => ({
  riskDomainFlags: [],
  profilesIndividuals: null,
  ...overrides,
});

const clear = { fullyExcluded: false, likelyProhibited: false, prohibitedStatus: "likely_not_prohibited" };

// HRR-2 + HRR-4: recruitment screening that profiles candidates → likely_high_risk + registration.
{
  const a = buildHighRiskAssessment(data(), {
    hr1: "No",
    hr3: ["Employment, worker management and access to self-employment"],
    hr4: "No",
    hr5: "No",
    hr6: "Yes",
  }, clear);
  assert.strictEqual(a.status, "likely_high_risk");
  assert.strictEqual(a.route, "annex_iii");
  assert(a.firedRules.some((r) => r.ruleId === "HRR-2"));
  assert(a.firedRules.some((r) => r.ruleId === "HRR-4"), "profiling override must fire");
  assert(a.registrationRequired, "registration required (HRR-5)");
  assert(a.firedRules.some((r) => r.ruleId === "HRR-5"));
  assert.strictEqual(a.applicableFromDate, "2027-12-02");
}

// HRR-1: Annex I medical-device safety component requiring notified body → high_risk.
{
  const a = buildHighRiskAssessment(data(), { hr1: "Yes", hr2: "Yes", hr3: ["None of the above"], hr6: "No" }, clear);
  assert.strictEqual(a.status, "likely_high_risk");
  assert.strictEqual(a.route, "annex_i");
  assert(a.firedRules.some((r) => r.ruleId === "HRR-1"));
  assert.strictEqual(a.applicableFromDate, "2028-08-02");
}

// HRR-3: Annex III narrow procedural task, no profiling → carve-out, documentation flag.
{
  const a = buildHighRiskAssessment(data(), {
    hr1: "No",
    hr3: ["Education and vocational training"],
    hr4: "Yes",
    hr5: "No",
    hr6: "No",
  }, clear);
  assert.strictEqual(a.status, "not_high_risk_carve_out");
  assert(a.carveOutApplied);
  assert(a.notHighRiskDocumentationFlag, "Art 6(3) documentation flag must be set");
  const rule = a.firedRules.find((r) => r.ruleId === "HRR-3");
  assert.strictEqual(rule?.guidanceStatus, "draft", "HRR-3 must be badged draft");
  assert(a.registrationNote.includes("self-assessment"), "carve-out still carries a registration duty");
}

// Use case outside all Annex III areas, no Annex I → likely_not_high_risk.
{
  const a = buildHighRiskAssessment(data(), { hr1: "No", hr3: ["None of the above"], hr6: "No" }, clear);
  assert.strictEqual(a.status, "likely_not_high_risk");
  assert(!a.registrationRequired);
}

// Prohibited system → not assessed.
{
  const a = buildHighRiskAssessment(data(), { hr1: "Yes", hr2: "Yes" }, { ...clear, likelyProhibited: true, prohibitedStatus: "likely_prohibited" });
  assert.strictEqual(a.status, "not_assessed_excluded");
}

// Candidate area with unresolved carve-out answers → possibly_high_risk, low confidence.
{
  const a = buildHighRiskAssessment(data(), { hr1: "No", hr3: ["Law enforcement"], hr6: "No" }, clear);
  assert.strictEqual(a.status, "possibly_high_risk");
  assert(a.confidenceScore <= 75, `expected reduced confidence, got ${a.confidenceScore}`);
}

// Seeding: risk-domain flags map to Annex III areas; profilesIndividuals seeds HR6.
{
  const seeded = deriveHighRiskAnswers(
    data({ riskDomainFlags: ["Recruitment or hiring", "Creditworthiness, lending, credit scoring, or loan approval"], profilesIndividuals: "Yes" }),
    { aiEmbeddedInProduct: "No" }
  );
  assert(Array.isArray(seeded.hr3));
  assert((seeded.hr3 as string[]).includes("Employment, worker management and access to self-employment"));
  assert((seeded.hr3 as string[]).includes("Access to essential private and public services"));
  assert.strictEqual(seeded.hr6, "Yes");
  assert.strictEqual(seeded.hr1, "No");
}

console.log("high-risk rules.test.ts: all assertions passed");
