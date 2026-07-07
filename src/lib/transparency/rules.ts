// Module 11 — Transparency Obligations (modules_mds/module-11-transparency-obligations.md).
// Article 50 duties (provider: direct-interaction disclosure, synthetic-content
// marking; deployer: emotion/biometric disclosure, deepfake disclosure,
// public-interest text disclosure) plus the DISTINCT FRIA sub-section
// (Article 27) with its own trigger set. Pure rules only.

import { YES_NO_NOT_SURE_NA } from "@/lib/options";
import {
  clampScore,
  confidenceLabelFor,
  SOURCE_VERSION_DATE,
  APPLICABLE_DATES,
  type AssessmentCore,
  type FiredRule,
  type GuidanceStatus,
  type ModuleAnswers,
  type ModuleQuestion,
} from "@/lib/assessment-shared";

export const TRANSPARENCY_MODULE_KEY = "transparency" as const;

// ---------------------------------------------------------------------------
// Questionnaire
// ---------------------------------------------------------------------------

export const TR_ROLE_OPTIONS = ["Provider", "Deployer", "Both", "Not sure", "Not applicable"] as const;
export const FRIA_ORG_OPTIONS = ["Public body", "Private provider of public services", "Neither", "Not sure", "Not applicable"] as const;
export const FRIA_USE_OPTIONS = [
  "Yes – creditworthiness/credit scoring",
  "Yes – life/health insurance risk",
  "No",
  "Not sure",
  "Not applicable",
] as const;

export const TRANSPARENCY_QUESTIONS: ModuleQuestion[] = [
  {
    key: "tr_q1",
    label: "Does this system talk to or interact directly with people (chatbot, virtual assistant, voice bot)?",
    helper: "They generally must be told they are dealing with AI — unless obvious from context.",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-1 interacts directly with people / system types",
  },
  {
    key: "tr_q2",
    label: "Does the system generate or manipulate synthetic content — text, images, audio, video?",
    helper: "Output generally must be marked machine-readable as artificially generated/manipulated (watermark/metadata).",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-1 generates content / output types",
  },
  {
    key: "tr_q3",
    label:
      "Does the system produce image/audio/video that resembles real people/objects/places/events and could falsely appear authentic (a deepfake)?",
    helper:
      "Deployers must disclose artificial generation/manipulation; limited artistic/creative exceptions still require appropriate disclosure.",
    options: YES_NO_NOT_SURE_NA,
  },
  {
    key: "tr_q4",
    label: "Is AI-generated or AI-assisted text published to inform the public about matters of public interest?",
    helper:
      "Must be disclosed as artificially generated UNLESS it underwent human review/editorial control with a person/organisation holding editorial responsibility.",
    options: YES_NO_NOT_SURE_NA,
  },
  {
    key: "tr_q4_editorial",
    label: "Does that text undergo human review/editorial control with a person or organisation holding editorial responsibility?",
    helper: "The Article 50(4) second-subparagraph exception.",
    options: YES_NO_NOT_SURE_NA,
    showWhen: (a) => a.tr_q4 === "Yes" || a.tr_q4 === "Not sure",
  },
  {
    key: "tr_q5",
    label: "Does the system recognise/infer people's emotions, or categorise people based on biometric data?",
    helper:
      "Deployers must inform exposed persons; note some workplace/education emotion-recognition uses are prohibited (Module 6).",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-1 system types (biometric) / risk-domain flags",
  },
  {
    key: "tr_q6",
    label:
      "For each trigger above, is your organisation the provider (build/place on market) or the deployer (use under your own authority)?",
    helper:
      "Direct-interaction (50(1)) and synthetic-content marking (50(2)) are PROVIDER duties; deepfake, public-interest text, and emotion/biometric disclosure (50(3)-(4)) are DEPLOYER duties; the same system can carry both.",
    options: TR_ROLE_OPTIONS,
    seededFrom: "module-2 role",
  },
  {
    key: "tr_q7",
    label:
      "(FRIA) Is your organisation a public body, or a private organisation providing public services (healthcare, education, housing, social security, essential utilities)?",
    helper: "Such deployers of an Annex III high-risk system generally must complete a FRIA before first use.",
    options: FRIA_ORG_OPTIONS,
    seededFrom: "module-1/2 organisation type, deployment context",
  },
  {
    key: "tr_q8",
    label:
      "(FRIA) Does your organisation use an AI system to evaluate creditworthiness/credit scoring, or to assess risk & pricing for life/health insurance?",
    helper: "These two Annex III use cases (points 5(b)/5(c)) trigger a FRIA even for ordinary private deployers.",
    options: FRIA_USE_OPTIONS,
    seededFrom: "module-1 risk-domain flags",
  },
];

// ---------------------------------------------------------------------------
// Deterministic rules — FRIA rules structurally separate from Article 50 rules
// ---------------------------------------------------------------------------

export interface TransparencyRuleDefinition {
  id: string;
  title: string;
  citation: string;
  guidanceStatus: GuidanceStatus;
  applicableFromDate: string;
}

export const TRANSPARENCY_RULES: TransparencyRuleDefinition[] = [
  { id: "TR-R1", title: "Direct-interaction disclosure: provider must inform users they are interacting with AI unless obvious from context", citation: "Art 50(1); Recital 132", guidanceStatus: "final", applicableFromDate: APPLICABLE_DATES.transparency.date },
  { id: "TR-R2", title: "Synthetic-content marking: provider must mark outputs machine-readable as artificially generated/manipulated (robust, interoperable); legacy systems on the market before 2026-08-02 have a grace period to 2026-12-02", citation: "Art 50(2); Recital 133", guidanceStatus: "final", applicableFromDate: APPLICABLE_DATES.transparency.date },
  { id: "TR-R3", title: "Emotion-recognition / biometric-categorisation disclosure: deployer must inform exposed persons; process personal data per GDPR; cross-check Module 6", citation: "Art 50(3); Recital 132", guidanceStatus: "final", applicableFromDate: APPLICABLE_DATES.transparency.date },
  { id: "TR-R4", title: "Deepfake disclosure: deployer must disclose artificial generation/manipulation; reduced/adapted disclosure for evidently artistic/creative/satirical/fictional work, still required appropriately", citation: "Art 50(4) first subpara; Recital 134", guidanceStatus: "final", applicableFromDate: APPLICABLE_DATES.transparency.date },
  { id: "TR-R5", title: "AI-generated public-interest text disclosure: deployer must disclose unless human editorial review + editorial responsibility", citation: "Art 50(4) second subpara; Recital 135", guidanceStatus: "final", applicableFromDate: APPLICABLE_DATES.transparency.date },
  { id: "TR-R6", title: "Law-enforcement exemption: certain Art 50 duties relaxed for systems authorised by law to detect/prevent/investigate criminal offences, subject to safeguards — flag for legal review, never auto-clear", citation: "Art 50 exemptions", guidanceStatus: "final", applicableFromDate: APPLICABLE_DATES.transparency.date },
];

export const FRIA_RULES: TransparencyRuleDefinition[] = [
  { id: "FRIA-R1", title: "FRIA — public body / public-service deployer of an Annex III high-risk system: fundamental-rights impact assessment required before first use; notify the market surveillance authority", citation: "Art 27(1)-(3); Recital 96", guidanceStatus: "final", applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date },
  { id: "FRIA-R2", title: "FRIA — creditworthiness / life-health-insurance deployer (Annex III 5(b)/5(c)): FRIA required even for ordinary private deployers; same content set as FRIA-R1", citation: "Art 27(1); Annex III 5(b), 5(c)", guidanceStatus: "final", applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date },
];

const RULE_BY_ID = new Map([...TRANSPARENCY_RULES, ...FRIA_RULES].map((r) => [r.id, r]));

function fireRule(id: string, detail?: string): FiredRule {
  const rule = RULE_BY_ID.get(id);
  if (!rule) throw new Error(`Unknown transparency rule: ${id}`);
  return { ruleId: rule.id, title: rule.title, citation: rule.citation, guidanceStatus: rule.guidanceStatus, detail };
}

export const FRIA_CONTENT_SET =
  "FRIA content (Art 27(1)): deployer processes, period/frequency of use, categories of affected persons, specific risks of harm, human-oversight measures, and mitigation/governance arrangements.";

// ---------------------------------------------------------------------------
// Answer seeding from Modules 1 + 2
// ---------------------------------------------------------------------------

export interface TransparencyDerivableData {
  interactsDirectlyWithPeople?: string | null;
  generatesContent?: string | null;
  outputTypes: string[];
  systemTypes: string[];
  riskDomainFlags: string[];
}

export function deriveTransparencyAnswers(data: TransparencyDerivableData, upstream: { likelyRoles: string[] }): ModuleAnswers {
  const d: ModuleAnswers = {};

  if (data.interactsDirectlyWithPeople === "Yes" || data.interactsDirectlyWithPeople === "No") {
    d.tr_q1 = data.interactsDirectlyWithPeople;
  }
  if (!d.tr_q1 && data.systemTypes.includes("Chatbot")) d.tr_q1 = "Yes";

  if (data.generatesContent === "Yes" || data.generatesContent === "No") d.tr_q2 = data.generatesContent;

  if (data.generatesContent === "No" || (data.outputTypes.length > 0 && !data.outputTypes.includes("Image / audio / video content") && !data.outputTypes.includes("Not sure"))) {
    d.tr_q3 = "No";
  }

  if (data.systemTypes.includes("Biometric system") || data.riskDomainFlags.includes("Emotion recognition")) d.tr_q5 = "Yes";
  else if (data.riskDomainFlags.length > 0 && !data.riskDomainFlags.includes("Not sure") && !data.riskDomainFlags.includes("Biometrics")) d.tr_q5 = "No";

  const provider = upstream.likelyRoles.includes("Provider");
  const deployer = upstream.likelyRoles.includes("Deployer");
  if (provider && deployer) d.tr_q6 = "Both";
  else if (provider) d.tr_q6 = "Provider";
  else if (deployer) d.tr_q6 = "Deployer";

  if (data.riskDomainFlags.includes("Creditworthiness, lending, credit scoring, or loan approval")) {
    d.tr_q8 = "Yes – creditworthiness/credit scoring";
  } else if (data.riskDomainFlags.includes("Life insurance or health insurance pricing/risk assessment")) {
    d.tr_q8 = "Yes – life/health insurance risk";
  } else if (data.riskDomainFlags.length > 0 && !data.riskDomainFlags.includes("Not sure")) {
    d.tr_q8 = "No";
  }

  return d;
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export type Article50Status = "likely_transparency_duties" | "possibly_transparency_duties" | "needs_review" | "likely_no_transparency_duties";
export type FriaStatus = "likely_required" | "possibly_required" | "not_required" | "needs_review";

export interface TransparencyAssessment extends AssessmentCore<Article50Status> {
  /** Distinct FRIA determination (never merged into Article 50). */
  friaStatus: FriaStatus;
  friaRules: FiredRule[];
  friaReasoning: string;
  article50Rules: FiredRule[];
  roleConditionalObligation: { provider: string; deployer: string; both: string };
  registrationNote: string;
  notHighRiskDocumentationFlag: boolean;
  sourceVersionDate: string;
}

const yes = (a: ModuleAnswers, k: string) => a[k] === "Yes";
const notSure = (a: ModuleAnswers, k: string) => a[k] === "Not sure";
const answered = (a: ModuleAnswers, k: string) => typeof a[k] === "string" && (a[k] as string).length > 0;

function roleOf(a: ModuleAnswers): { provider: boolean; deployer: boolean; known: boolean } {
  const r = a.tr_q6;
  return {
    provider: r === "Provider" || r === "Both",
    deployer: r === "Deployer" || r === "Both",
    known: r === "Provider" || r === "Deployer" || r === "Both",
  };
}

/** Spec-named helper: the Article 50 panel. */
export function assessArticle50(answers: ModuleAnswers, data: TransparencyDerivableData): {
  status: Article50Status;
  fired: FiredRule[];
  possible: string[];
} {
  const { provider, deployer, known } = roleOf(answers);
  const fired: FiredRule[] = [];
  const possible: string[] = [];

  const evalTrigger = (q: string, ruleId: string, roleOk: boolean, extra = true) => {
    if (yes(answers, q) && roleOk && known && extra) fired.push(fireRule(ruleId));
    else if ((yes(answers, q) || notSure(answers, q)) && extra && (!known || roleOk || notSure(answers, q))) {
      if (yes(answers, q) || notSure(answers, q)) possible.push(ruleId);
    }
  };

  evalTrigger("tr_q1", "TR-R1", provider);
  evalTrigger("tr_q2", "TR-R2", provider);
  evalTrigger("tr_q5", "TR-R3", deployer);
  evalTrigger("tr_q3", "TR-R4", deployer);
  // TR-R5 with the editorial-responsibility exception.
  if (yes(answers, "tr_q4") && deployer && known) {
    if (answers.tr_q4_editorial === "Yes") {
      // exempt — noted as uncertainty by the caller
    } else if (answers.tr_q4_editorial === "No") fired.push(fireRule("TR-R5"));
    else possible.push("TR-R5");
  } else if (yes(answers, "tr_q4") || notSure(answers, "tr_q4")) {
    possible.push("TR-R5");
  }
  // TR-R6: law-enforcement relaxation — flagged, never auto-cleared.
  if (data.riskDomainFlags.includes("Law enforcement") && (fired.length > 0 || possible.length > 0)) {
    fired.push(fireRule("TR-R6", "Flag for legal review — do not auto-clear any Article 50 duty."));
  }

  const dedupedPossible = [...new Set(possible.filter((id) => !fired.some((f) => f.ruleId === id)))];

  let status: Article50Status;
  const substantiveFired = fired.filter((f) => f.ruleId !== "TR-R6");
  if (substantiveFired.length > 0) status = "likely_transparency_duties";
  else if (dedupedPossible.length > 0) status = "possibly_transparency_duties";
  else if (["tr_q1", "tr_q2", "tr_q3", "tr_q4", "tr_q5"].every((q) => answered(answers, q) && !notSure(answers, q)) && roleOf(answers).known) {
    status = "likely_no_transparency_duties";
  } else status = "needs_review";

  return { status, fired, possible: dedupedPossible };
}

/** Spec-named helper: the distinct FRIA panel. */
export function assessFria(
  answers: ModuleAnswers,
  upstream: { highRiskStatus: string }
): { status: FriaStatus; fired: FiredRule[]; reasoning: string } {
  const { deployer } = roleOf(answers);
  const org = answers.tr_q7;
  const isPublicish = org === "Public body" || org === "Private provider of public services";
  const creditOrInsurance = answers.tr_q8 === "Yes – creditworthiness/credit scoring" || answers.tr_q8 === "Yes – life/health insurance risk";
  const annexIiiHighRisk = upstream.highRiskStatus === "likely_high_risk";
  const highRiskUnresolved = ["possibly_high_risk", "needs_review"].includes(upstream.highRiskStatus);

  const fired: FiredRule[] = [];

  if (isPublicish && deployer && annexIiiHighRisk) fired.push(fireRule("FRIA-R1"));
  if (creditOrInsurance && deployer) fired.push(fireRule("FRIA-R2"));

  if (fired.length > 0) {
    return {
      status: "likely_required",
      fired,
      reasoning: `FRIA required before first use (${fired.map((f) => f.citation).join("; ")}). ${FRIA_CONTENT_SET} The completed FRIA is notified to the market surveillance authority.`,
    };
  }

  if ((isPublicish && deployer && highRiskUnresolved) || (creditOrInsurance && !roleOf(answers).known) || (isPublicish && !roleOf(answers).known)) {
    return {
      status: "possibly_required",
      fired,
      reasoning:
        "A FRIA trigger is partially met — the determination depends on the unresolved Module 7 Annex III high-risk status and/or the deployer role.",
    };
  }

  if ((org === "Neither" || org === "Not applicable") && (answers.tr_q8 === "No" || answers.tr_q8 === "Not applicable")) {
    return {
      status: "not_required",
      fired,
      reasoning:
        "No FRIA trigger matches: the organisation is neither a public body / public-service provider deploying an Annex III high-risk system, nor a creditworthiness / life-health-insurance deployer. Record why FRIA was found not to apply.",
    };
  }

  return {
    status: "needs_review",
    fired,
    reasoning: "The FRIA trigger set cannot be evaluated on the current answers (organisation type or use case unknown).",
  };
}

/** Spec-named helper: full Module 11 result object (two separately addressable panels). */
export function buildTransparencyAssessment(
  data: TransparencyDerivableData,
  answers: ModuleAnswers,
  upstream: { highRiskStatus: string; roleConfidenceLabel: string }
): TransparencyAssessment {
  const art50 = assessArticle50(answers, data);
  const fria = assessFria(answers, upstream);

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [];

  for (const f of art50.fired.filter((f) => f.ruleId !== "TR-R6")) positiveIndicators.push(`${f.ruleId} fired — ${f.citation}`);
  for (const id of art50.possible) keyUncertainties.push(`${id} partially matched — confirm the outstanding trigger/role answers.`);
  if (art50.fired.some((f) => f.ruleId === "TR-R6")) {
    keyUncertainties.push("Law-enforcement context: certain Art 50 duties may be relaxed subject to safeguards — flag for legal review, do not auto-clear.");
  }
  if (yes(answers, "tr_q1")) keyUncertainties.push("'Obvious from context' is a judgement call — the direct-interaction disclosure may be dispensable only where obviousness is clear.");
  if (yes(answers, "tr_q4") && answers.tr_q4_editorial === "Yes") {
    negativeIndicators.push("Public-interest text is under human editorial review with editorial responsibility — the Art 50(4) disclosure exception applies (TR-R5 not fired).");
  }
  if (yes(answers, "tr_q3")) keyUncertainties.push("Artistic/creative/satirical deepfake exceptions reduce but do not remove disclosure — appropriate disclosure is still required.");
  if (fria.status === "likely_required" || fria.status === "possibly_required") {
    keyUncertainties.push(`The FRIA applicable-from date follows the deferred Annex III timeline (${APPLICABLE_DATES.highRiskAnnexIII.date}, provisional).`);
  }

  // Confidence per spec.
  let score = 100;
  for (const k of ["tr_q1", "tr_q2", "tr_q5"]) if (notSure(answers, k)) score -= 15;
  if (!roleOf(answers).known) {
    score -= 20;
    missingFields.push("provider/deployer role for the transparency triggers (tr_q6)");
    recommendedNextQuestions.push("Is the organisation the provider or the deployer for each matched trigger?");
  }
  if (!answered(answers, "tr_q7") || notSure(answers, "tr_q7")) {
    score -= 20;
    missingFields.push("organisation type for FRIA (public body / public-service provider)");
    recommendedNextQuestions.push("Is the organisation a public body or a private provider of public services?");
  }
  let missing = 0;
  for (const k of ["tr_q3", "tr_q4", "tr_q8"]) if (!answered(answers, k)) missing += 1;
  score -= Math.min(missing * 10, 40);
  if (answers.tr_q2 === "No" && yes(answers, "tr_q3")) {
    score -= 15;
    keyUncertainties.push("Contradiction: deepfake output reported although the system reportedly does not generate synthetic content.");
  }
  const confidenceScore = clampScore(score);

  const roleConditionalObligation = {
    provider: "Art 50(1) direct-interaction disclosure design + Art 50(2) synthetic-content marking (no FRIA).",
    deployer: "Art 50(3) emotion/biometric disclosure + Art 50(4) deepfake/public-interest-text disclosure + Art 27 FRIA where triggered.",
    both: "Duties accumulate — provider and deployer obligations both apply.",
  };

  const reasoningSummary =
    (art50.fired.filter((f) => f.ruleId !== "TR-R6").length > 0
      ? `Article 50 duties likely apply: ${art50.fired
          .filter((f) => f.ruleId !== "TR-R6")
          .map((f) => f.ruleId)
          .join(", ")} (applicable from ${APPLICABLE_DATES.transparency.date}).`
      : art50.status === "possibly_transparency_duties"
        ? `Possible Article 50 duties pending confirmation: ${art50.possible.join(", ")}.`
        : art50.status === "likely_no_transparency_duties"
          ? "No Article 50 trigger matches the current answers."
          : "The Article 50 triggers cannot be evaluated on the current answers.") +
    ` FRIA: ${fria.status.replace(/_/g, " ")}.`;

  return {
    status: art50.status,
    confidenceScore,
    confidenceLabel: confidenceLabelFor(confidenceScore),
    reasoningSummary,
    positiveIndicators,
    negativeIndicators,
    keyUncertainties,
    missingFields,
    recommendedNextQuestions,
    firedRules: [...art50.fired, ...fria.fired],
    friaStatus: fria.status,
    friaRules: fria.fired,
    friaReasoning: fria.reasoning,
    article50Rules: art50.fired,
    roleConditionalObligation,
    registrationNote:
      "Article 50 alone does not trigger Annex VIII registration; FRIA-triggering systems are Annex III high-risk and therefore also carry Art 49/Annex VIII registration (non-public variant for law-enforcement/migration/border); the completed FRIA is notified to the market surveillance authority.",
    notHighRiskDocumentationFlag: fria.status === "not_required" && art50.status === "likely_transparency_duties",
    sourceVersionDate: SOURCE_VERSION_DATE,
  };
}
