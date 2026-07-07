// Module 6 self-check. Run with: npx tsx src/lib/prohibited/rules.test.ts

import assert from "node:assert";
import { buildProhibitedAssessment, deriveProhibitedAnswers, type ProhibitedDerivableData } from "./rules";

const data = (overrides: Partial<ProhibitedDerivableData> = {}): ProhibitedDerivableData => ({
  dataTypes: [],
  systemTypes: [],
  riskDomainFlags: [],
  deploymentContext: "Internal only",
  ...overrides,
});

const notExcluded = { fullyExcluded: false, exclusionStatus: "likely_not_excluded" };

const allNo = {
  p1: "No", p2: "No", p3: "No", p4: "No", p5: "No",
  p6: "No", p7: "No", p8: "No", p9: "No", p10: "No",
};

// PR-F: workplace emotion recognition, no medical purpose → likely_prohibited.
{
  const a = buildProhibitedAssessment(data(), { ...allNo, p7: "Yes", p7Exception: "No" }, notExcluded);
  assert.strictEqual(a.status, "likely_prohibited");
  assert(a.matchedProhibitions.includes("PR-F"));
  assert(a.firedRules.some((r) => r.citation.includes("5(1)(f)")));
}

// PR-F exception: medical/safety purpose → not prohibited, uncertainty noted.
{
  const a = buildProhibitedAssessment(data(), { ...allNo, p7: "Yes", p7Exception: "Yes" }, notExcluded);
  assert(!a.matchedProhibitions.includes("PR-F"));
  assert.strictEqual(a.status, "likely_not_prohibited");
  assert(a.keyUncertainties.some((u) => u.includes("Medical/safety exception")));
}

// PR-I: nudifier app without safeguards → likely_prohibited (provisional).
{
  const a = buildProhibitedAssessment(data(), { ...allNo, p10: "Yes", p11: "No" }, notExcluded);
  assert(a.matchedProhibitions.includes("PR-I"));
  assert.strictEqual(a.status, "likely_prohibited");
  const rule = a.firedRules.find((r) => r.ruleId === "PR-I");
  assert.strictEqual(rule?.guidanceStatus, "provisional", "PR-I must be badged provisional");
  assert(a.reasoningSummary.includes("2026-12-02"));
}

// PR-I with reliable safeguards → not matched.
{
  const a = buildProhibitedAssessment(data(), { ...allNo, p10: "Yes", p11: "Yes" }, notExcluded);
  assert(!a.matchedProhibitions.includes("PR-I"));
  assert(a.keyUncertainties.some((u) => u.includes("safeguards")));
}

// Ordinary credit scoring → likely_not_prohibited (not PR-C social scoring).
{
  const a = buildProhibitedAssessment(
    data({ riskDomainFlags: ["Creditworthiness, lending, credit scoring, or loan approval"] }),
    allNo,
    notExcluded
  );
  assert.strictEqual(a.status, "likely_not_prohibited");
  assert.strictEqual(a.matchedProhibitions.length, 0);
}

// Fully-excluded system → not_assessed_excluded, no screening.
{
  const a = buildProhibitedAssessment(data(), { ...allNo, p4: "Yes" }, { fullyExcluded: true, exclusionStatus: "likely_excluded" });
  assert.strictEqual(a.status, "not_assessed_excluded");
  assert.strictEqual(a.matchedProhibitions.length, 0);
}

// PR-A needs both P1 and P2; P2 'Not sure' → possibly_prohibited.
{
  const a = buildProhibitedAssessment(data(), { ...allNo, p1: "Yes", p2: "Not sure" }, notExcluded);
  assert.strictEqual(a.status, "possibly_prohibited");
  assert(a.possibleProhibitions.includes("PR-A"));
}

// PR-H: real-time remote biometric ID without authorised exception.
{
  const a = buildProhibitedAssessment(data(), { ...allNo, p9: "Yes", p9Exception: "No" }, notExcluded);
  assert(a.matchedProhibitions.includes("PR-H"));
}

// Seeding: no biometric signals at all → p6/p8/p9 seeded "No"; emotion flag + workplace → p7 "Yes".
{
  const seededNeg = deriveProhibitedAnswers(data({ riskDomainFlags: ["Internal productivity only"], dataTypes: ["Internal documents"] }));
  assert.strictEqual(seededNeg.p6, "No");
  assert.strictEqual(seededNeg.p8, "No");
  assert.strictEqual(seededNeg.p9, "No");
  const seededEmotion = deriveProhibitedAnswers(data({ riskDomainFlags: ["Emotion recognition"], deploymentContext: "Employee-facing" }));
  assert.strictEqual(seededEmotion.p7, "Yes");
}

console.log("prohibited rules.test.ts: all assertions passed");
