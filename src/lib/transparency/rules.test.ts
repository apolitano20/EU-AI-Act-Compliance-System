// Module 11 self-check. Run with: npx tsx src/lib/transparency/rules.test.ts

import assert from "node:assert";
import { buildTransparencyAssessment, assessFria, type TransparencyDerivableData } from "./rules";

const data = (overrides: Partial<TransparencyDerivableData> = {}): TransparencyDerivableData => ({
  interactsDirectlyWithPeople: null,
  generatesContent: null,
  outputTypes: [],
  systemTypes: [],
  riskDomainFlags: [],
  ...overrides,
});

const upstream = { highRiskStatus: "likely_not_high_risk", roleConfidenceLabel: "high" };

const noTriggers = {
  tr_q1: "No", tr_q2: "No", tr_q3: "No", tr_q4: "No", tr_q5: "No",
  tr_q6: "Provider", tr_q7: "Neither", tr_q8: "No",
};

// TR-R1 + TR-R2: content-generating chatbot placed on market by the org.
{
  const a = buildTransparencyAssessment(data(), { ...noTriggers, tr_q1: "Yes", tr_q2: "Yes", tr_q6: "Provider" }, upstream);
  assert.strictEqual(a.status, "likely_transparency_duties");
  const ids = a.article50Rules.map((r) => r.ruleId);
  assert(ids.includes("TR-R1") && ids.includes("TR-R2"));
  assert.strictEqual(a.friaStatus, "not_required");
}

// TR-R4: deployer publishing deepfakes.
{
  const a = buildTransparencyAssessment(data(), { ...noTriggers, tr_q3: "Yes", tr_q6: "Deployer" }, upstream);
  assert(a.article50Rules.some((r) => r.ruleId === "TR-R4"));
  assert(a.keyUncertainties.some((u) => u.includes("Artistic")), "artistic exception nuance surfaced");
}

// FRIA-R1: public-service deployer of an Annex III high-risk system.
{
  const fria = assessFria(
    { ...noTriggers, tr_q6: "Deployer", tr_q7: "Private provider of public services" },
    { highRiskStatus: "likely_high_risk" }
  );
  assert.strictEqual(fria.status, "likely_required");
  assert(fria.fired.some((r) => r.ruleId === "FRIA-R1"));
  assert(fria.reasoning.includes("market surveillance authority"));
}

// FRIA-R2: private deployer doing credit scoring → required even for ordinary private deployers.
{
  const a = buildTransparencyAssessment(
    data(),
    { ...noTriggers, tr_q6: "Deployer", tr_q7: "Neither", tr_q8: "Yes – creditworthiness/credit scoring" },
    { ...upstream, highRiskStatus: "likely_high_risk" }
  );
  assert.strictEqual(a.friaStatus, "likely_required");
  assert(a.friaRules.some((r) => r.ruleId === "FRIA-R2"));
}

// TR-R5 exception: AI public-interest text under human editorial responsibility → exempt.
{
  const a = buildTransparencyAssessment(
    data(),
    { ...noTriggers, tr_q4: "Yes", tr_q4_editorial: "Yes", tr_q6: "Deployer" },
    upstream
  );
  assert(!a.article50Rules.some((r) => r.ruleId === "TR-R5"), "editorial-responsibility exception must exempt TR-R5");
  assert(a.negativeIndicators.some((n) => n.includes("editorial")));
}

// TR-R5 fires without the editorial exception.
{
  const a = buildTransparencyAssessment(
    data(),
    { ...noTriggers, tr_q4: "Yes", tr_q4_editorial: "No", tr_q6: "Deployer" },
    upstream
  );
  assert(a.article50Rules.some((r) => r.ruleId === "TR-R5"));
}

// FRIA with unresolved Module 7 status → possibly_required, not likely.
{
  const fria = assessFria(
    { ...noTriggers, tr_q6: "Deployer", tr_q7: "Public body" },
    { highRiskStatus: "possibly_high_risk" }
  );
  assert.strictEqual(fria.status, "possibly_required");
}

// Provider-only role: deployer duties (TR-R3) do not fire even when the trigger is met.
{
  const a = buildTransparencyAssessment(data(), { ...noTriggers, tr_q5: "Yes", tr_q6: "Provider" }, upstream);
  assert(!a.article50Rules.some((r) => r.ruleId === "TR-R3"), "TR-R3 is a deployer duty");
}

console.log("transparency rules.test.ts: all assertions passed");
