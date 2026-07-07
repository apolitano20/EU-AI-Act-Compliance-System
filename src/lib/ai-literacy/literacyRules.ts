// Module 8 — AI Literacy (modules_mds/module-8-ai-literacy.md).
// Article 4 is a HORIZONTAL obligation: it applies to every provider/deployer
// of any AI system regardless of risk tier (a Module 5 exclusion or Module 7
// outcome does NOT switch it off). In force since 2025-02-02.
//
// In-flux: the Digital Omnibus would soften Article 4 to an obligation of
// effort. Until OJ publication the current in-force text stays operative; the
// softening is surfaced as a draft note only. Pure rules only.

import { YES_NO_NOT_SURE } from "@/lib/options";
import {
  clampScore,
  confidenceLabelFor,
  SOURCE_VERSION_DATE,
  type AssessmentCore,
  type FiredRule,
  type GuidanceStatus,
  type ModuleAnswers,
  type ModuleQuestion,
} from "@/lib/assessment-shared";

export const AI_LITERACY_MODULE_KEY = "ai-literacy" as const;

// ---------------------------------------------------------------------------
// Questionnaire
// ---------------------------------------------------------------------------

export const LITERACY_ROLE_OPTIONS = ["Provider", "Deployer", "Both", "Neither (importer/distributor only)", "Not sure"] as const;
export const MEASURES_OPTIONS = ["Yes, documented", "Yes, informal only", "No", "Not sure"] as const;
export const KNOWLEDGE_OPTIONS = ["Yes", "Partially", "No", "Not sure"] as const;

export const LITERACY_QUESTIONS: ModuleQuestion[] = [
  {
    key: "usesAiProfessionally",
    label: "Does your organisation use, operate, or provide any AI system in the course of its professional activity?",
    helper:
      "Covers systems you build (provider) and systems you merely deploy/use (deployer), including minimal-risk/general-purpose tools (chatbots, coding assistants, off-the-shelf ML).",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-1 inventory record / module-3 gate",
  },
  {
    key: "literacyRole",
    label: "What is your organisation's role with respect to this AI system?",
    helper: "Article 4 applies to both provider and deployer.",
    options: LITERACY_ROLE_OPTIONS,
    seededFrom: "module-2 role",
  },
  {
    key: "measuresInPlace",
    label:
      "Have you put in place any measures to build AI knowledge and skills among staff who operate or use this system (training, guidelines, onboarding, usage policies)?",
    helper:
      "Measures are proportionate to context — short internal guidance for a low-risk tool, richer measures for staff operating a high-risk system; no mandated curriculum.",
    options: MEASURES_OPTIONS,
  },
  {
    key: "staffKnowledge",
    label:
      "Do the people who operate or are affected by this system have the technical knowledge, experience, and training to understand its capabilities, limitations, and risks?",
    helper: "Literacy must account for prior knowledge/experience and context of use.",
    options: KNOWLEDGE_OPTIONS,
  },
];

// ---------------------------------------------------------------------------
// Deterministic rules
// ---------------------------------------------------------------------------

export interface LiteracyRuleDefinition {
  id: string;
  title: string;
  citation: string;
  guidanceStatus: GuidanceStatus;
  applicableFromDate: string;
}

export const LITERACY_RULES: LiteracyRuleDefinition[] = [
  {
    id: "AILIT-1",
    title: "Applies to all tiers: Article 4 applies to providers/deployers irrespective of risk classification (Module 5 exclusion / Module 7 outcome do not switch it off)",
    citation: "Art 4; Recital 20",
    guidanceStatus: "final",
    applicableFromDate: "2025-02-02",
  },
  {
    id: "AILIT-2",
    title: "Role scope: the obligation attaches only to providers/deployers; pure importer/distributor → not applicable pending a Module 9 reclassification check",
    citation: "Art 4 addressees; Art 3(3)/(4)",
    guidanceStatus: "final",
    applicableFromDate: "2025-02-02",
  },
  {
    id: "AILIT-3",
    title: "Proportionality: required measures evaluated against staff knowledge/experience, context of use, and the persons/groups the system is used on",
    citation: "Art 4 second sentence",
    guidanceStatus: "final",
    applicableFromDate: "2025-02-02",
  },
  {
    id: "AILIT-4",
    title: "Omnibus softening (IN-FLUX): would reframe Article 4 as an effort-based duty; current in-force text stays operative until OJ publication",
    citation: "Digital Omnibus amendment to Art 4",
    guidanceStatus: "draft",
    applicableFromDate: "not_yet_in_force",
  },
];

const RULE_BY_ID = new Map(LITERACY_RULES.map((r) => [r.id, r]));

function fireLiteracyRule(id: string, detail?: string): FiredRule {
  const rule = RULE_BY_ID.get(id);
  if (!rule) throw new Error(`Unknown literacy rule: ${id}`);
  return { ruleId: rule.id, title: rule.title, citation: rule.citation, guidanceStatus: rule.guidanceStatus, detail };
}

export const LITERACY_IN_FLUX_NOTE =
  "In-flux: the Digital Omnibus simplification package would soften Article 4 from an obligation of result to an " +
  "obligation of effort and shift part of the burden to Member States/Commission (Council final approval 2026-06-29, " +
  "Parliament endorsement 2026-06-16; OJ publication expected before 2026-08-02). Until published in the Official " +
  "Journal, the current in-force text remains the operative standard.";

// ---------------------------------------------------------------------------
// Answer seeding
// ---------------------------------------------------------------------------

export interface LiteracyUpstream {
  likelyRoles: string[];
  definitionClassification: string;
}

export function deriveLiteracyAnswers(upstream: LiteracyUpstream): ModuleAnswers {
  const d: ModuleAnswers = {};

  if (upstream.definitionClassification === "likely_ai_system" || upstream.definitionClassification === "possible_ai_system_needs_review") {
    d.usesAiProfessionally = "Yes";
  }

  const roles = upstream.likelyRoles;
  const isProvider = roles.includes("Provider");
  const isDeployer = roles.includes("Deployer");
  const importerDistributorOnly =
    roles.length > 0 && roles.every((r) => ["Importer", "Distributor"].includes(r));
  if (isProvider && isDeployer) d.literacyRole = "Both";
  else if (isProvider) d.literacyRole = "Provider";
  else if (isDeployer) d.literacyRole = "Deployer";
  else if (importerDistributorOnly) d.literacyRole = "Neither (importer/distributor only)";

  return d;
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export type LiteracyStatus = "obligation_likely_applies" | "not_applicable_role" | "needs_review";

export const LITERACY_STATUS_TEXT: Record<LiteracyStatus, string> = {
  obligation_likely_applies:
    "AI literacy obligation likely applies (horizontal, all risk tiers) — organisational measures needed for provider/deployer staff",
  not_applicable_role: "Not applicable — importer/distributor only (re-check after any Module 9 reclassification)",
  needs_review: "Needs review — the applicability determination depends on unsettled role or gate answers",
};

export interface LiteracyAssessment extends AssessmentCore<LiteracyStatus> {
  measuresState: "documented" | "informal" | "none" | "unknown";
  roleConditionalObligation: {
    providerDeployer: string;
    importerDistributor: string;
    authorisedRepresentative: string;
  };
  registrationRequired: "not_applicable";
  standardsConformityRoute: "not_applicable";
  applicableFromDate: string;
  sourceVersionDate: string;
}

function answerStr(answers: ModuleAnswers, key: string): string | undefined {
  const v = answers[key];
  return typeof v === "string" ? v : undefined;
}

/** Spec-named helper: applicability + proportionality evaluation. */
export function assessAiLiteracy(answers: ModuleAnswers): { status: LiteracyStatus; measuresState: LiteracyAssessment["measuresState"] } {
  const role = answerStr(answers, "literacyRole");
  const uses = answerStr(answers, "usesAiProfessionally");
  const measures = answerStr(answers, "measuresInPlace");

  const measuresState =
    measures === "Yes, documented" ? "documented" : measures === "Yes, informal only" ? "informal" : measures === "No" ? "none" : "unknown";

  if (role === "Neither (importer/distributor only)") return { status: "not_applicable_role", measuresState };
  if (uses === "No") return { status: "not_applicable_role", measuresState };
  if (role === "Provider" || role === "Deployer" || role === "Both") return { status: "obligation_likely_applies", measuresState };
  return { status: "needs_review", measuresState };
}

export interface LiteracyBuildUpstream extends LiteracyUpstream {
  roleConfidenceLabel: string;
  /** For the proportionality note: is this a higher-risk system? */
  highRiskStatus: string;
}

/** Spec-named helper: full Module 8 result object. */
export function buildLiteracyAssessment(answers: ModuleAnswers, upstream: LiteracyBuildUpstream): LiteracyAssessment {
  const { status, measuresState } = assessAiLiteracy(answers);

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [
    "Do you keep records of the AI-literacy measures taken?",
    "Are measures differentiated by risk level and staff role?",
    "Who owns AI-literacy compliance in the organisation?",
  ];
  const firedRules: FiredRule[] = [];

  if (status === "obligation_likely_applies") {
    firedRules.push(fireLiteracyRule("AILIT-1"), fireLiteracyRule("AILIT-3"));
  }
  if (status === "not_applicable_role") firedRules.push(fireLiteracyRule("AILIT-2"));
  firedRules.push(fireLiteracyRule("AILIT-4"));

  if (measuresState === "documented") positiveIndicators.push("Documented AI-literacy measures are in place for staff.");
  if (measuresState === "informal") {
    positiveIndicators.push("Some (informal) AI-literacy measures exist.");
    keyUncertainties.push("Informal measures may not evidence a 'sufficient level' — consider documenting them.");
  }
  const highRisk = upstream.highRiskStatus === "likely_high_risk" || upstream.highRiskStatus === "possibly_high_risk";
  if (measuresState === "none") {
    negativeIndicators.push(
      highRisk
        ? "No AI-literacy measures reported although staff operate a potentially high-risk system — proportionality (AILIT-3) demands richer measures here."
        : "No AI-literacy measures reported for staff using this system."
    );
  }

  // Confidence: baseline 90 where module-2 assigns provider/deployer and
  // module-3 confirms an AI system; capped below certainty because adequacy of
  // measures is judgement-based and the Omnibus softening is imminent.
  let score = 90;
  const role = answerStr(answers, "literacyRole");
  if (!role || role === "Not sure") {
    score -= 25;
    missingFields.push("organisation role for this system (module-2)");
  }
  if (upstream.definitionClassification === "insufficient_information") {
    score -= 15;
    keyUncertainties.push("The Module 3 AI-system gate is unsettled — Article 4 applicability inherits that uncertainty.");
  }
  const measures = answerStr(answers, "measuresInPlace");
  if (!measures || measures === "Not sure") {
    score -= 10;
    missingFields.push("presence/description of existing literacy measures (not captured in modules 1-3)");
  }
  const knowledge = answerStr(answers, "staffKnowledge");
  if (!knowledge || knowledge === "Not sure") {
    score -= 10;
    missingFields.push("staff technical knowledge/experience/training");
  }
  keyUncertainties.push(
    "Adequacy of measures is judgement-based (no fixed certification threshold), and the Omnibus softening of Article 4 is pending — confidence is capped."
  );
  const confidenceScore = Math.min(clampScore(score), 90);

  const reasoningSummary =
    status === "obligation_likely_applies"
      ? `Article 4 applies to this system's provider/deployer staff irrespective of its risk tier (in force since 2025-02-02). Measures state: ${measuresState}.`
      : status === "not_applicable_role"
        ? "Article 4 attaches to providers and deployers only — as importer/distributor-only (and absent a Module 9 reclassification) no direct duty applies."
        : "Article 4 applicability cannot be settled until the organisation's role for this system is known.";

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
    measuresState,
    roleConditionalObligation: {
      providerDeployer:
        "Must take measures to ensure a sufficient level of AI literacy for own staff and other persons operating/using AI systems on their behalf or under their authority.",
      importerDistributor: "Not directly obligated unless reclassified to provider (Module 9).",
      authorisedRepresentative: "Not a direct addressee of Article 4.",
    },
    registrationRequired: "not_applicable",
    standardsConformityRoute: "not_applicable",
    applicableFromDate: "2025-02-02",
    sourceVersionDate: SOURCE_VERSION_DATE,
  };
}
