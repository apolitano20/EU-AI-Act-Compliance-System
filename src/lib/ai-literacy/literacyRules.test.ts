// Module 8 self-check. Run with: npx tsx src/lib/ai-literacy/literacyRules.test.ts

import assert from "node:assert";
import { buildLiteracyAssessment, deriveLiteracyAnswers } from "./literacyRules";

const upstream = (overrides: Partial<Parameters<typeof buildLiteracyAssessment>[1]> = {}) => ({
  likelyRoles: ["Deployer"],
  definitionClassification: "likely_ai_system",
  roleConfidenceLabel: "high",
  highRiskStatus: "likely_not_high_risk",
  ...overrides,
});

// AILIT-1: deployer of a minimal-risk chatbot → obligation applies.
{
  const a = buildLiteracyAssessment(
    { usesAiProfessionally: "Yes", literacyRole: "Deployer", measuresInPlace: "Yes, documented", staffKnowledge: "Yes" },
    upstream()
  );
  assert.strictEqual(a.status, "obligation_likely_applies");
  assert(a.firedRules.some((r) => r.ruleId === "AILIT-1"));
  assert.strictEqual(a.applicableFromDate, "2025-02-02");
  assert(a.confidenceScore >= 80, `expected high confidence, got ${a.confidenceScore}`);
  assert(a.confidenceScore <= 90, "confidence must stay capped below certainty");
}

// AILIT-2: importer-only → not_applicable.
{
  const a = buildLiteracyAssessment(
    { usesAiProfessionally: "Yes", literacyRole: "Neither (importer/distributor only)" },
    upstream({ likelyRoles: ["Importer"] })
  );
  assert.strictEqual(a.status, "not_applicable_role");
  assert(a.firedRules.some((r) => r.ruleId === "AILIT-2"));
}

// Provider with documented training → applies, positive indicator.
{
  const a = buildLiteracyAssessment(
    { usesAiProfessionally: "Yes", literacyRole: "Provider", measuresInPlace: "Yes, documented", staffKnowledge: "Partially" },
    upstream({ likelyRoles: ["Provider"] })
  );
  assert.strictEqual(a.status, "obligation_likely_applies");
  assert(a.positiveIndicators.some((p) => p.includes("Documented")));
}

// Horizontal: an excluded/high-risk-not-assessed system still carries the obligation.
{
  const a = buildLiteracyAssessment(
    { usesAiProfessionally: "Yes", literacyRole: "Deployer", measuresInPlace: "No" },
    upstream({ highRiskStatus: "not_assessed_excluded" })
  );
  assert.strictEqual(a.status, "obligation_likely_applies", "Article 4 is horizontal — exclusion does not switch it off");
}

// AILIT-4 in-flux note is always fired as draft, never operative.
{
  const a = buildLiteracyAssessment({ literacyRole: "Deployer", usesAiProfessionally: "Yes" }, upstream());
  const omnibus = a.firedRules.find((r) => r.ruleId === "AILIT-4");
  assert.strictEqual(omnibus?.guidanceStatus, "draft");
}

// Proportionality: no measures for a high-risk system → negative indicator.
{
  const a = buildLiteracyAssessment(
    { usesAiProfessionally: "Yes", literacyRole: "Deployer", measuresInPlace: "No", staffKnowledge: "No" },
    upstream({ highRiskStatus: "likely_high_risk" })
  );
  assert(a.negativeIndicators.some((n) => n.includes("high-risk")), "proportionality note expected");
}

// Seeding.
{
  const seeded = deriveLiteracyAnswers({ likelyRoles: ["Provider", "Deployer"], definitionClassification: "likely_ai_system" });
  assert.strictEqual(seeded.literacyRole, "Both");
  assert.strictEqual(seeded.usesAiProfessionally, "Yes");
  const seededImporter = deriveLiteracyAnswers({ likelyRoles: ["Importer"], definitionClassification: "likely_ai_system" });
  assert.strictEqual(seededImporter.literacyRole, "Neither (importer/distributor only)");
}

console.log("literacyRules.test.ts: all assertions passed");
