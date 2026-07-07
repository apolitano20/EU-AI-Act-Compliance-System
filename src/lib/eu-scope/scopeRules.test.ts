// Module 4 self-check. Run with: npx tsx src/lib/eu-scope/scopeRules.test.ts

import assert from "node:assert";
import { buildScopeAssessment, deriveScopeAnswers, type ScopeDerivableData } from "./scopeRules";

const data = (overrides: Partial<ScopeDerivableData> = {}): ScopeDerivableData => ({
  countriesUsed: [],
  outputsUsedInEu: null,
  usesGpaiOrLlm: null,
  riskDomainFlags: [],
  ...overrides,
});

// S-02: EU deployer → in scope.
{
  const a = buildScopeAssessment(data(), {
    establishment: "Established in the EU/EEA",
    placesOnEuMarket: "Not applicable",
    outputUsedInEu: "Yes",
    role: "Deployer",
    nonEuProviderHighRiskOrGpai: "Not applicable",
  });
  assert.strictEqual(a.status, "likely_in_scope", "EU deployer should be likely_in_scope");
  assert(a.matchedTriggers.includes("S-02"), "expected S-02 trigger");
  assert.strictEqual(a.authorisedRepRequired, false, "EU deployer needs no authorised rep");
  assert(a.firedRules.some((r) => r.citation === "Article 2(1)(b)"), "expected Art 2(1)(b) citation");
}

// S-01 + S-04: non-EU provider placing a high-risk system on the EU market.
{
  const a = buildScopeAssessment(data({ riskDomainFlags: ["Biometrics"] }), {
    establishment: "Established in a third country (outside EU/EEA)",
    placesOnEuMarket: "Yes",
    outputUsedInEu: "Yes",
    role: "Provider",
    nonEuProviderHighRiskOrGpai: "Yes",
  });
  assert.strictEqual(a.status, "likely_in_scope", "non-EU provider placing on EU market should be in scope");
  assert(a.matchedTriggers.includes("S-01"), "expected S-01 trigger");
  assert.strictEqual(a.authorisedRepRequired, true, "authorised rep required (Art 22)");
  assert(a.authorisedRep.citations.includes("Article 22(1)"), "expected Article 22(1) citation");
  assert(a.firedRules.some((r) => r.ruleId === "S-04"), "expected S-04 fired");
  assert(a.confidenceScore >= 80, `expected high confidence, got ${a.confidenceScore}`);
}

// S-06: non-EU provider, no EU placement, output not used in EU → out of scope.
{
  const a = buildScopeAssessment(data(), {
    establishment: "Established in a third country (outside EU/EEA)",
    placesOnEuMarket: "No",
    outputUsedInEu: "No",
    role: "Provider",
    nonEuProviderHighRiskOrGpai: "No",
  });
  assert.strictEqual(a.status, "likely_out_of_scope", "should be likely_out_of_scope");
  assert(a.firedRules.some((r) => r.ruleId === "S-06"), "expected S-06 (a contrario)");
  assert.strictEqual(a.authorisedRepRequired, false);
}

// S-05: non-EU GPAI provider → authorised rep required under Article 54.
{
  const a = buildScopeAssessment(data({ usesGpaiOrLlm: "Yes" }), {
    establishment: "Established in a third country (outside EU/EEA)",
    placesOnEuMarket: "Yes",
    outputUsedInEu: "Not sure",
    role: "Provider",
    nonEuProviderHighRiskOrGpai: "Yes",
  });
  assert.strictEqual(a.authorisedRepRequired, true, "GPAI provider needs authorised rep");
  assert(a.authorisedRep.citations.includes("Article 54"), "expected Article 54 citation");
  assert(a.firedRules.some((r) => r.ruleId === "S-05"), "expected S-05 fired");
}

// S-03: third-country operator whose output is used in the Union (extraterritorial).
{
  const a = buildScopeAssessment(data(), {
    establishment: "Established in a third country (outside EU/EEA)",
    placesOnEuMarket: "No",
    outputUsedInEu: "Yes",
    role: "Deployer",
    nonEuProviderHighRiskOrGpai: "Not applicable",
  });
  assert.strictEqual(a.status, "likely_in_scope", "extraterritorial trigger should apply");
  assert(a.matchedTriggers.includes("S-03"), "expected S-03 trigger");
}

// Unanswered core questions → needs_review, low/insufficient confidence.
{
  const a = buildScopeAssessment(data(), {});
  assert.strictEqual(a.status, "needs_review");
  assert(a.confidenceScore < 50, "unanswered assessment should not be confident");
  assert(a.missingFields.length >= 3, "expected missing fields listed");
}

// Seeding: outputsUsedInEu and EU countries flow through; EU establishment marks Q5 N/A.
{
  const seeded = deriveScopeAnswers(
    data({ countriesUsed: ["Germany", "United States"], outputsUsedInEu: "Yes" }),
    { organisationInEu: "Yes", likelyRoles: ["Deployer"] }
  );
  assert.strictEqual(seeded.establishment, "Established in the EU/EEA");
  assert.strictEqual(seeded.placesOnEuMarket, "Yes", "EU country in countriesUsed should seed market placement");
  assert.strictEqual(seeded.outputUsedInEu, "Yes");
  assert.strictEqual(seeded.role, "Deployer");
  assert.strictEqual(seeded.nonEuProviderHighRiskOrGpai, "Not applicable");
}

console.log("scopeRules.test.ts: all assertions passed");
