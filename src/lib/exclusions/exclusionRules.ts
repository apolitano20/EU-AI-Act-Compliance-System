// Module 5 — Exclusions (modules_mds/module-5-exclusions.md).
// Evaluates the Article 2 carve-outs that remove an otherwise in-scope system
// from the Act. Each carve-out is narrow and conditional — the rules surface
// the conditions that would revoke it rather than declaring a clean exclusion.
//
// Pure rules only — no DB or server imports.

import { YES_NO_NOT_SURE_NA } from "@/lib/options";
import {
  clampScore,
  confidenceLabelFor,
  SOURCE_VERSION_DATE,
  type AssessmentCore,
  type FiredRule,
  type ModuleAnswers,
  type ModuleQuestion,
} from "@/lib/assessment-shared";

export const EXCLUSIONS_MODULE_KEY = "exclusions" as const;

// ---------------------------------------------------------------------------
// Questionnaire (reuse-first — labels/helpers from the spec)
// ---------------------------------------------------------------------------

export const MILITARY_OPTIONS = ["Yes", "No", "Partly / dual use", "Not sure"] as const;
export const RESEARCH_OPTIONS = [
  "Yes – pre-market R&D only",
  "No – already on market/in service",
  "Includes real-world testing",
  "Not sure",
] as const;
export const OPEN_SOURCE_OPTIONS = [
  "Yes – free and open-source",
  "No – proprietary/commercial",
  "Open-source but high-risk/prohibited/transparency-triggering",
  "Not sure",
] as const;
export const PERSONAL_USE_OPTIONS = ["Yes", "No – professional/organisational use", "Not sure"] as const;

export const EXCLUSION_QUESTIONS: ModuleQuestion[] = [
  {
    key: "militaryUse",
    label: "Is this AI system used exclusively for military, defence, or national-security purposes?",
    helper:
      "Purpose-based, not sector-based. If a military system is later used (even temporarily) for civilian/humanitarian/law-enforcement purposes, it re-enters scope.",
    options: MILITARY_OPTIONS,
    seededFrom: "module-1 use case/sector",
  },
  {
    key: "thirdCountryLawEnforcement",
    label:
      "Is the system operated by a third-country public authority or an international organisation under an international agreement for law-enforcement or judicial cooperation with the EU/a Member State?",
    helper: "Applies only where adequate fundamental-rights safeguards are in place.",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-1 operator type / module-2 entity type",
  },
  {
    key: "researchOnly",
    label:
      "Is the system currently only in scientific research, testing, or development, before being placed on the market or put into service?",
    helper: "Pre-market R&D is excluded. Exception: testing in real-world conditions is NOT covered and remains in scope.",
    options: RESEARCH_OPTIONS,
    seededFrom: "module-1 lifecycle status / module-3",
  },
  {
    key: "openSourceRelease",
    label: "Is the AI system released under a free and open-source licence?",
    helper:
      "Excluded UNLESS high-risk, a prohibited practice, or subject to Article 50 transparency duties. Open-source GPAI models still carry certain Article 53 documentation duties unless they present systemic risk.",
    options: OPEN_SOURCE_OPTIONS,
    seededFrom: "module-1 licensing / build-or-buy / module-3",
  },
  {
    key: "personalUse",
    label: "Is the system used by a natural person purely in the course of a personal, non-professional activity?",
    helper:
      "Excludes deployer obligations for individuals using AI privately, not organisations or any professional/commercial use.",
    options: PERSONAL_USE_OPTIONS,
    seededFrom: "module-2 (natural person vs organisation)",
  },
];

// ---------------------------------------------------------------------------
// Deterministic rules — guidance_status: final, source_version_date 2026-07-07
// ---------------------------------------------------------------------------

export interface ExclusionRuleDefinition {
  id: string;
  title: string;
  citation: string;
  guidanceStatus: "final";
  revokingConditions: string[];
}

export const EXCLUSION_RULES: ExclusionRuleDefinition[] = [
  {
    id: "X-01",
    title: "Used exclusively for military, defence or national-security purposes → excluded",
    citation: "Article 2(3)",
    guidanceStatus: "final",
    revokingConditions: [
      "Temporary or permanent use for other (civilian, humanitarian or law-enforcement) purposes re-enters scope.",
    ],
  },
  {
    id: "X-02",
    title:
      "Used by third-country public authorities / international organisations under law-enforcement & judicial cooperation with adequate fundamental-rights safeguards → excluded for that context",
    citation: "Article 2(4)",
    guidanceStatus: "final",
    revokingConditions: [
      "Applies only where adequate fundamental-rights safeguards are in place.",
      "Exclusion is context-limited — use outside the cooperation agreement is not covered.",
    ],
  },
  {
    id: "X-03",
    title: "Developed and put into service for the sole purpose of scientific R&D → excluded",
    citation: "Article 2(6)",
    guidanceStatus: "final",
    revokingConditions: ["Use beyond the sole scientific-R&D purpose re-enters scope."],
  },
  {
    id: "X-04",
    title: "Research, testing or development prior to market placement or putting into service → excluded",
    citation: "Article 2(8)",
    guidanceStatus: "final",
    revokingConditions: [
      "Testing in real-world conditions is expressly NOT covered and remains in scope.",
      "Market placement or putting into service ends the carve-out.",
    ],
  },
  {
    id: "X-05",
    title: "Deployer is a natural person using the system for a purely personal, non-professional activity → excluded (deployer obligations do not apply)",
    citation: "Article 2(10)",
    guidanceStatus: "final",
    revokingConditions: [
      "Releases only natural-person deployers — provider obligations are unaffected.",
      "Any professional, organisational or commercial use is not covered.",
    ],
  },
  {
    id: "X-06",
    title: "Released under a free and open-source licence → excluded, unless placed on the market/put into service as high-risk, a prohibited practice (Art 5), or subject to Article 50",
    citation: "Article 2(12) with Art 53/54 GPAI nuances",
    guidanceStatus: "final",
    revokingConditions: [
      "High-risk placement, a prohibited practice, or Article 50 transparency duties revoke the carve-out.",
      "Open-source GPAI models retain certain Article 53 duties unless systemic risk.",
    ],
  },
];

const RULE_BY_ID = new Map(EXCLUSION_RULES.map((r) => [r.id, r]));

function fireExclusionRule(id: string, detail?: string): FiredRule {
  const rule = RULE_BY_ID.get(id);
  if (!rule) throw new Error(`Unknown exclusion rule: ${id}`);
  return { ruleId: rule.id, title: rule.title, citation: rule.citation, guidanceStatus: rule.guidanceStatus, detail };
}

// ---------------------------------------------------------------------------
// Answer seeding from Modules 1 + 2
// ---------------------------------------------------------------------------

export interface ExclusionDerivableData {
  status?: string | null;
  buildType?: string | null;
  usesGpaiOrLlm?: string | null;
}

export interface ExclusionUpstream {
  /** Module 2 merged answer: business/professional use of the system. */
  businessOrProfessionalUse?: string;
}

export function deriveExclusionAnswers(data: ExclusionDerivableData, upstream: ExclusionUpstream): ModuleAnswers {
  const d: ModuleAnswers = {};

  // Lifecycle: Production/Retired systems have been placed on the market or in
  // service; a mere idea is still pre-market. Pilot is ambiguous (could be
  // real-world testing) — left unanswered.
  if (data.status === "Production" || data.status === "Retired") d.researchOnly = "No – already on market/in service";
  if (data.status === "Idea") d.researchOnly = "Yes – pre-market R&D only";

  if (data.buildType === "Bought/licensed from vendor" || data.buildType === "Commissioned from external developer") {
    d.openSourceRelease = "No – proprietary/commercial";
  }

  if (upstream.businessOrProfessionalUse === "Yes") d.personalUse = "No – professional/organisational use";

  return d;
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export type ExclusionStatus =
  | "likely_excluded"
  | "possibly_excluded_partial_conditional"
  | "likely_not_excluded"
  | "needs_review";

export interface ExclusionAssessment extends AssessmentCore<ExclusionStatus> {
  /** Carve-out rule ids that matched (fully or conditionally). */
  matchedCarveOuts: string[];
  /** Conditions that would revoke each matched carve-out. */
  revokingConditions: string[];
  /** Re-entry triggers surfaced for conditional exclusions. */
  reEntryTriggers: string[];
  /** Open-source GPAI models retain certain Art 53 duties unless systemic risk. */
  openSourceGpaiResidualDutyFlag: boolean;
  /** Art 6(3) not-high-risk self-assessment duty survives an open-source re-entry. */
  notHighRiskDocumentationFlag: boolean;
  /** Whether the exclusion fully removes the system (short-circuits Module 6). */
  fullExclusion: boolean;
  roleConditionalObligation: string;
  sourceVersionDate: string;
}

function answerStr(answers: ModuleAnswers, key: string): string | undefined {
  const v = answers[key];
  return typeof v === "string" ? v : undefined;
}

const isNotSure = (v?: string) => v === "Not sure";
const answered = (v?: string) => typeof v === "string" && v.length > 0;

/** Spec-named helper: per-carve-out classification. */
export function classifyExclusion(answers: ModuleAnswers): {
  status: ExclusionStatus;
  matchedCarveOuts: string[];
  fullExclusion: boolean;
} {
  const military = answerStr(answers, "militaryUse");
  const lawEnf = answerStr(answers, "thirdCountryLawEnforcement");
  const research = answerStr(answers, "researchOnly");
  const openSource = answerStr(answers, "openSourceRelease");
  const personal = answerStr(answers, "personalUse");

  const matched: string[] = [];
  let full = false;
  let partial = false;

  if (military === "Yes") {
    matched.push("X-01");
    full = true;
  }
  if (lawEnf === "Yes") {
    matched.push("X-02");
    partial = true; // context-limited
  }
  if (research === "Yes – pre-market R&D only") {
    matched.push("X-03", "X-04");
    full = true;
  }
  if (personal === "Yes") {
    matched.push("X-05");
    partial = true; // releases only natural-person deployers
  }
  if (openSource === "Yes – free and open-source") {
    matched.push("X-06");
    partial = true; // conditional on not being high-risk/prohibited/Art 50
  }

  if (full) return { status: "likely_excluded", matchedCarveOuts: matched, fullExclusion: true };
  if (partial) return { status: "possibly_excluded_partial_conditional", matchedCarveOuts: matched, fullExclusion: false };

  const allAnswered =
    answered(military) && !isNotSure(military) &&
    answered(research) && !isNotSure(research) &&
    answered(openSource) && !isNotSure(openSource) &&
    answered(personal) && !isNotSure(personal);
  if (allAnswered) return { status: "likely_not_excluded", matchedCarveOuts: [], fullExclusion: false };

  return { status: "needs_review", matchedCarveOuts: [], fullExclusion: false };
}

/** Spec-named helper: the conditions that would revoke the matched carve-outs. */
export function getExclusionRevokingConditions(answers: ModuleAnswers): string[] {
  const { matchedCarveOuts } = classifyExclusion(answers);
  const conditions: string[] = [];
  for (const id of matchedCarveOuts) {
    for (const c of RULE_BY_ID.get(id)?.revokingConditions ?? []) {
      if (!conditions.includes(c)) conditions.push(c);
    }
  }
  return conditions;
}

/** Spec-named helper: full Module 5 result object. */
export function buildExclusionAssessment(data: ExclusionDerivableData, answers: ModuleAnswers): ExclusionAssessment {
  const { status, matchedCarveOuts, fullExclusion } = classifyExclusion(answers);
  const revokingConditions = getExclusionRevokingConditions(answers);

  const military = answerStr(answers, "militaryUse");
  const lawEnf = answerStr(answers, "thirdCountryLawEnforcement");
  const research = answerStr(answers, "researchOnly");
  const openSource = answerStr(answers, "openSourceRelease");
  const personal = answerStr(answers, "personalUse");

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [];
  const reEntryTriggers: string[] = [];
  const firedRules: FiredRule[] = matchedCarveOuts.map((id) => fireExclusionRule(id));

  // Re-entry triggers and negative findings the carve-outs turn on.
  if (military === "Partly / dual use") {
    negativeIndicators.push("Dual/partly military use — the Article 2(3) carve-out requires EXCLUSIVE military/defence/national-security purpose, so the system re-enters scope.");
    reEntryTriggers.push("Dual or repurposed (civilian/humanitarian/law-enforcement) use of a military system.");
  }
  if (research === "Includes real-world testing") {
    negativeIndicators.push("Real-world-conditions testing is expressly NOT covered by the R&D carve-out (Article 2(8)) and remains in scope.");
    reEntryTriggers.push("Real-world-conditions testing has started.");
  }
  if (matchedCarveOuts.includes("X-03")) reEntryTriggers.push("Market placement or putting into service ends the pre-market R&D carve-out.");
  if (openSource === "Open-source but high-risk/prohibited/transparency-triggering") {
    negativeIndicators.push("Open-source release does not exclude a system placed on the market as high-risk, a prohibited practice, or subject to Article 50 (Article 2(12)).");
  }

  const openSourceGpaiResidualDutyFlag =
    (openSource === "Yes – free and open-source" || openSource === "Open-source but high-risk/prohibited/transparency-triggering") &&
    data.usesGpaiOrLlm === "Yes";
  if (openSourceGpaiResidualDutyFlag) {
    keyUncertainties.push("Open-source GPAI models retain certain Article 53 documentation duties unless systemic risk — the carve-out is not a clean exit.");
  }

  const notHighRiskDocumentationFlag = openSource === "Open-source but high-risk/prohibited/transparency-triggering";

  for (const id of matchedCarveOuts) {
    positiveIndicators.push(`${RULE_BY_ID.get(id)?.citation}: carve-out matched — ${RULE_BY_ID.get(id)?.title}`);
  }
  if (matchedCarveOuts.length === 0 && status === "likely_not_excluded") {
    negativeIndicators.push("No Article 2 carve-out matches the current answers.");
  }

  // Confidence: baseline 85 when purpose, lifecycle, licensing and deployer-type
  // are known and one carve-out cleanly matches; subtract per unknown.
  let score = 85;
  const checks: Array<[string | undefined, string, string]> = [
    [military, "military/defence/national-security purpose", "Is the system used exclusively for military, defence or national-security purposes?"],
    [research, "lifecycle stage (pre-market R&D vs on market)", "Is the system still pre-market R&D, or already placed on the market / in real-world testing?"],
    [openSource, "open-source licensing", "Is the system released under a free and open-source licence?"],
    [personal, "deployer type (natural person vs organisation)", "Is the system used by a natural person purely privately?"],
  ];
  for (const [value, field, question] of checks) {
    if (!answered(value) || isNotSure(value)) {
      score -= 20;
      missingFields.push(field);
      recommendedNextQuestions.push(question);
    }
  }
  if (answered(lawEnf) && isNotSure(lawEnf)) {
    score -= 10;
    keyUncertainties.push("Whether the system runs under a third-country law-enforcement/judicial cooperation agreement (Article 2(4)) is unknown.");
  }
  if (status === "possibly_excluded_partial_conditional") {
    score = Math.min(score, 70);
    keyUncertainties.push("The matched carve-out is conditional or partial — the revoking conditions must be checked before relying on it.");
  }
  if (status === "needs_review") score = Math.min(score, 40);
  const confidenceScore = clampScore(score);

  const roleConditionalObligation = matchedCarveOuts.includes("X-05")
    ? "personal-use carve-out (Art 2(10)) releases only natural-person deployers, not providers — provider obligations for this system are unaffected."
    : matchedCarveOuts.includes("X-06")
      ? "open-source carve-out affects provider obligations but not downstream deployers using the system in a high-risk or transparency-triggering way."
      : "No role-specific carve-out nuance on the current answers.";

  const statusText: Record<ExclusionStatus, string> = {
    likely_excluded: "An Article 2 carve-out likely removes this system from the Act",
    possibly_excluded_partial_conditional: "A conditional or partial Article 2 carve-out may apply",
    likely_not_excluded: "No Article 2 carve-out appears to apply",
    needs_review: "The Article 2 carve-outs cannot be evaluated on the current answers",
  };
  const reasoningSummary =
    `${statusText[status]}${matchedCarveOuts.length > 0 ? ` (${matchedCarveOuts.map((id) => RULE_BY_ID.get(id)?.citation).join(", ")})` : ""}.` +
    (revokingConditions.length > 0 ? ` Conditions that would revoke it: ${revokingConditions.join(" ")}` : "");

  return {
    status,
    confidenceScore,
    confidenceLabel: confidenceLabelFor(confidenceScore),
    reasoningSummary,
    positiveIndicators,
    negativeIndicators,
    keyUncertainties,
    missingFields,
    recommendedNextQuestions,
    firedRules,
    matchedCarveOuts,
    revokingConditions,
    reEntryTriggers,
    openSourceGpaiResidualDutyFlag,
    notHighRiskDocumentationFlag,
    fullExclusion,
    roleConditionalObligation,
    sourceVersionDate: SOURCE_VERSION_DATE,
  };
}
