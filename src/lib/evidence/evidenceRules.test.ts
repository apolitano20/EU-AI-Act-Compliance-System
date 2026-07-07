// Module 13 self-check. Run with: npx tsx src/lib/evidence/evidenceRules.test.ts

import assert from "node:assert";
import { buildObligationMatrix, type ObligationContext } from "../obligations/obligationRules";
import { buildEvidenceChecklist, buildReadinessAssessment, mapEvidenceAnswer, sanitizeEvidenceAnswers, scoreReadiness } from "./evidenceRules";

const highRiskProviderCtx: ObligationContext = {
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
};

const matrixRows = buildObligationMatrix(highRiskProviderCtx, {});
const matrixShape = (rows = matrixRows, status = "assessed", confidenceLabel = "high") => ({
  rows, status, confidenceLabel,
  effectiveRoles: ["Provider"], registrationRequired: true,
  standardsConformityRoute: "route", notHighRiskDocumentationFlag: false,
});

// readiness_mapping.
{
  assert.strictEqual(mapEvidenceAnswer("In place"), "evidence_in_place");
  assert.strictEqual(mapEvidenceAnswer("Partial"), "partial_evidence");
  assert.strictEqual(mapEvidenceAnswer("Not started"), "not_started");
  assert.strictEqual(mapEvidenceAnswer("Not sure"), "unknown_evidence_state");
  assert.strictEqual(mapEvidenceAnswer("Not applicable"), "not_applicable");
  assert.strictEqual(mapEvidenceAnswer(undefined), "evidence_gap");
}

// High-risk system with technical documentation missing → OBL-ART11-TECHDOC gap, score reduced.
{
  const answers: Record<string, string> = {};
  for (const r of matrixRows) answers[r.obligationId] = "In place";
  answers["OBL-ART11-TECHDOC"] = "Not started";
  const checklist = buildEvidenceChecklist(matrixRows, answers);
  const techdoc = checklist.find((r) => r.obligationId === "OBL-ART11-TECHDOC");
  assert.strictEqual(techdoc?.readinessStatus, "not_started");
  const score = scoreReadiness(checklist);
  assert(score < 100 && score > 80, `expected slightly reduced score, got ${score}`);
  const a = buildReadinessAssessment(matrixShape(), answers);
  assert(a.negativeIndicators.some((n) => n.includes("OBL-ART11-TECHDOC")) || a.reasoningSummary.includes("OBL-ART11-TECHDOC"));
}

// All applicable obligations 'In place' → readiness 100.
{
  const answers: Record<string, string> = {};
  for (const r of matrixRows) answers[r.obligationId] = "In place";
  const a = buildReadinessAssessment(matrixShape(), answers);
  assert.strictEqual(a.readinessScore, 100);
  assert.strictEqual(a.counts.evidence_in_place, matrixRows.length);
}

// 'Not sure' → unknown_evidence_state counts 0 in the score and reduces confidence.
{
  const answers: Record<string, string> = {};
  for (const r of matrixRows) answers[r.obligationId] = "In place";
  answers["OBL-ART9-RMS"] = "Not sure";
  const a = buildReadinessAssessment(matrixShape(), answers);
  assert.strictEqual(a.counts.unknown_evidence_state, 1);
  assert(a.readinessScore < 100);
  assert(a.confidenceScore < 100, "confidence must drop on 'Not sure'");
}

// Partial counts 0.5.
{
  const rows = matrixRows.slice(0, 2);
  const answers = { [rows[0].obligationId]: "In place", [rows[1].obligationId]: "Partial" };
  const checklist = buildEvidenceChecklist(rows, answers);
  assert.strictEqual(scoreReadiness(checklist), 75);
}

// Art 6(3) derogation → checklist includes the self-assessment + registration evidence row.
{
  const carveCtx: ObligationContext = { ...highRiskProviderCtx, highRiskStatus: "not_high_risk_carve_out", carveOutApplied: true };
  const rows = buildObligationMatrix(carveCtx, {});
  const checklist = buildEvidenceChecklist(rows, {});
  assert(checklist.some((r) => r.obligationId === "OBL-ART6-3-NOTHR-DOC"), "Art 6(3) evidence row expected");
  assert(checklist.some((r) => r.obligationId === "OBL-ART49-REGISTER"), "registration evidence row expected");
}

// Citations/dates/guidance carried through from Module 12.
{
  const checklist = buildEvidenceChecklist(matrixRows, {});
  const rms = checklist.find((r) => r.obligationId === "OBL-ART9-RMS");
  assert.strictEqual(rms?.legalBasis, "Art 9; Recital 47");
  assert.strictEqual(rms?.applicableFromDate, "2027-12-02");
  assert.strictEqual(rms?.guidanceStatus, "provisional");
}

// Parent matrix 'needs review' → confidence penalty + uncertainty.
{
  const a = buildReadinessAssessment(matrixShape(matrixRows, "assessed", "low"), {});
  assert(a.keyUncertainties.some((u) => u.includes("Module 12")));
}

// Sanitizer keeps only OBL-* keys with valid options.
{
  const clean = sanitizeEvidenceAnswers({ "OBL-ART9-RMS": "In place", "OBL-ART10-DATA": "bogus", other: "In place" });
  assert.deepStrictEqual(clean, { "OBL-ART9-RMS": "In place" });
}

console.log("evidenceRules.test.ts: all assertions passed");
