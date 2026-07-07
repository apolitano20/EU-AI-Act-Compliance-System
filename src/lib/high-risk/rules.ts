// Module 7 — High-Risk Classification (modules_mds/module-7-high-risk-classification.md).
// Two independent routes (Annex I product-safety, Annex III use-case) then the
// Article 6(3) significant-risk carve-out gate. Runs only for systems Module 5
// did not fully exclude and Module 6 did not flag as likely_prohibited.
//
// Carve-out rules relying on the 2026-05-19 draft guidelines are tagged
// guidance_status: draft. Pure rules only.

import { YES_NO_NOT_SURE } from "@/lib/options";
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

export const HIGH_RISK_MODULE_KEY = "high-risk" as const;

// ---------------------------------------------------------------------------
// Questionnaire
// ---------------------------------------------------------------------------

export const ANNEX_III_AREAS = [
  "Biometrics (not otherwise prohibited)",
  "Critical infrastructure",
  "Education and vocational training",
  "Employment, worker management and access to self-employment",
  "Access to essential private and public services",
  "Law enforcement",
  "Migration, asylum and border control",
  "Administration of justice and democratic processes",
  "None of the above",
] as const;

const annexIiiSelected = (a: ModuleAnswers) => {
  const v = a.hr3;
  return Array.isArray(v) && v.some((area) => area !== "None of the above");
};

export const HIGH_RISK_QUESTIONS: ModuleQuestion[] = [
  {
    key: "hr1",
    label:
      "Is the AI system itself a product, or a safety component of a product, covered by one of the EU product-safety laws in Annex I (machinery, medical devices, toys, lifts, radio equipment, vehicles)?",
    helper:
      "'Safety component' = a component whose failure endangers health/safety; Annex I Section A = New Legislative Framework, Section B = older/transport laws.",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-2 product embedding / safety-risk answers",
  },
  {
    key: "hr2",
    label:
      "Does that product already require conformity assessment by an independent third party (notified body) before sale/putting into service?",
    helper:
      "Distinguishes Annex I products that pull the AI into high-risk from those subject only to internal self-assessment.",
    options: YES_NO_NOT_SURE,
    showWhen: (a) => a.hr1 === "Yes" || a.hr1 === "Not sure",
  },
  {
    key: "hr3",
    label: "Which of these describes what the system is used for? (choose all that apply)",
    helper:
      "Maps to the eight Annex III high-risk areas. 'Access to essential private and public services' covers creditworthiness/credit scoring, life/health insurance risk & pricing, public benefits and emergency dispatch.",
    options: ANNEX_III_AREAS,
    multi: true,
    seededFrom: "module-1 risk-domain flags / use case",
  },
  {
    key: "hr4",
    label:
      "Does the system carry out a narrow procedural task, or only improve the result of a task a human already completed, without materially influencing the final decision?",
    helper: "Article 6(3) carve-out condition (a)/(b).",
    options: YES_NO_NOT_SURE,
    showWhen: annexIiiSelected,
  },
  {
    key: "hr5",
    label:
      "Does the system only detect decision-making patterns / deviations, and is it NOT meant to replace or influence a human assessment without proper human review?",
    helper: "Article 6(3) condition (c).",
    options: YES_NO_NOT_SURE,
    showWhen: annexIiiSelected,
  },
  {
    key: "hr6",
    label: "Regardless of the above, does the system perform profiling of natural persons?",
    helper:
      "Article 6(3) final subparagraph — an Annex III system that profiles is ALWAYS high-risk and cannot use the carve-out.",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-1 profiles individuals",
  },
];

// ---------------------------------------------------------------------------
// Deterministic rules
// ---------------------------------------------------------------------------

export interface HighRiskRuleDefinition {
  id: string;
  title: string;
  citation: string;
  guidanceStatus: GuidanceStatus;
  applicableFromDate?: string;
}

export const HIGH_RISK_RULES: HighRiskRuleDefinition[] = [
  {
    id: "HRR-1",
    title: "Annex I product-safety route: AI is/embeds a product requiring third-party conformity assessment → high-risk",
    citation: "Art 6(1); Annex I A/B",
    guidanceStatus: "final",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexI.date,
  },
  {
    id: "HRR-2",
    title: "Annex III use-case route (baseline): a listed high-risk area applies → candidate high-risk, proceed to the carve-out gate",
    citation: "Art 6(2); Annex III 1-8",
    guidanceStatus: "final",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
  },
  {
    id: "HRR-3",
    title: "Article 6(3) significant-risk carve-out: narrow procedural/detection-only task without profiling → not high-risk (documentation duty applies)",
    citation: "Art 6(3)(a)-(d)",
    guidanceStatus: "draft", // boundary clarified by the 2026-05-19 draft guidelines, not final
  },
  {
    id: "HRR-4",
    title: "Profiling override: an Annex III system that profiles natural persons is always high-risk (carve-out unavailable)",
    citation: "Art 6(3) final subparagraph",
    guidanceStatus: "final",
  },
  {
    id: "HRR-5",
    title: "Registration on entering high-risk: EU database registration required before market placement / putting into service",
    citation: "Art 49; Art 71; Annex VIII",
    guidanceStatus: "final",
  },
];

const RULE_BY_ID = new Map(HIGH_RISK_RULES.map((r) => [r.id, r]));

function fireHighRiskRule(id: string, detail?: string): FiredRule {
  const rule = RULE_BY_ID.get(id);
  if (!rule) throw new Error(`Unknown high-risk rule: ${id}`);
  return { ruleId: rule.id, title: rule.title, citation: rule.citation, guidanceStatus: rule.guidanceStatus, detail };
}

/** Guidance-status note shown in the UI. */
export const HIGH_RISK_GUIDANCE_NOTE =
  "Annex I and Annex III themselves are final law; the Commission's draft high-risk classification guidelines " +
  "(published 2026-05-19, consultation closed 2026-06-23) that clarify borderline cases and the Article 6(3) carve-out " +
  "are NOT final — rules derived from them carry guidance_status: draft. Enforcement dates were deferred by the " +
  "Digital Omnibus (provisional agreement 2026-05-07): Annex III stand-alone systems to 2027-12-02, Annex I embedded systems to 2028-08-02.";

// ---------------------------------------------------------------------------
// Answer seeding from Modules 1 + 2
// ---------------------------------------------------------------------------

export interface HighRiskDerivableData {
  riskDomainFlags: string[];
  profilesIndividuals?: string | null;
}

export interface HighRiskUpstream2 {
  /** Module 2 merged answers relevant to Annex I. */
  aiEmbeddedInProduct?: string;
  safetyRisk?: string;
}

const FLAG_TO_AREA: Record<string, (typeof ANNEX_III_AREAS)[number]> = {
  "Recruitment or hiring": "Employment, worker management and access to self-employment",
  "Employee management, promotion, termination, task allocation, or performance monitoring":
    "Employment, worker management and access to self-employment",
  "Creditworthiness, lending, credit scoring, or loan approval": "Access to essential private and public services",
  "Life insurance or health insurance pricing/risk assessment": "Access to essential private and public services",
  "Access to essential public or private services": "Access to essential private and public services",
  "Education or vocational training": "Education and vocational training",
  Biometrics: "Biometrics (not otherwise prohibited)",
  "Critical infrastructure": "Critical infrastructure",
  "Law enforcement": "Law enforcement",
  "Migration, asylum, or border control": "Migration, asylum and border control",
  "Legal interpretation, justice, or dispute resolution": "Administration of justice and democratic processes",
  "Democratic processes, elections, or political campaigning": "Administration of justice and democratic processes",
};

export function deriveHighRiskAnswers(data: HighRiskDerivableData, upstream: HighRiskUpstream2): ModuleAnswers {
  const d: ModuleAnswers = {};

  if (upstream.aiEmbeddedInProduct === "Yes" && upstream.safetyRisk === "Yes") d.hr1 = "Yes";
  if (upstream.aiEmbeddedInProduct === "No") d.hr1 = "No";

  const areas = new Set<string>();
  for (const flag of data.riskDomainFlags) {
    const area = FLAG_TO_AREA[flag];
    if (area) areas.add(area);
  }
  if (areas.size > 0) d.hr3 = [...areas];
  else if (data.riskDomainFlags.length > 0 && !data.riskDomainFlags.includes("Not sure")) d.hr3 = ["None of the above"];

  if (data.profilesIndividuals === "Yes" || data.profilesIndividuals === "No") d.hr6 = data.profilesIndividuals;

  return d;
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export type HighRiskStatus =
  | "likely_high_risk"
  | "possibly_high_risk"
  | "needs_review"
  | "likely_not_high_risk"
  | "not_high_risk_carve_out"
  | "not_assessed_excluded";

export interface ReclassificationTriggerFlags {
  substantialModification: boolean;
  rebranded: boolean;
  purposeChangedToHighRisk: boolean;
}

export interface HighRiskAssessment extends AssessmentCore<HighRiskStatus> {
  /** Which route(s) drove the result. */
  route: "annex_i" | "annex_iii" | "both" | "none";
  matchedAnnexIiiAreas: string[];
  carveOutApplied: boolean;
  registrationRequired: boolean;
  registrationNote: string;
  notHighRiskDocumentationFlag: boolean;
  /** Raw Article 25 signals (authoritatively evaluated in Module 9). */
  reclassificationTriggerFlags: ReclassificationTriggerFlags;
  roleConditionalObligation: {
    provider: string;
    deployer: string;
    importer: string;
    distributor: string;
  };
  standardsConformityRoute: string;
  applicableFromDate?: string;
  sourceVersionDate: string;
}

const yes = (a: ModuleAnswers, k: string) => a[k] === "Yes";
const no = (a: ModuleAnswers, k: string) => a[k] === "No";
const notSure = (a: ModuleAnswers, k: string) => a[k] === "Not sure";
const answered = (a: ModuleAnswers, k: string) => typeof a[k] === "string" && (a[k] as string).length > 0;

function selectedAreas(answers: ModuleAnswers): string[] {
  const v = answers.hr3;
  if (!Array.isArray(v)) return [];
  return v.filter((area) => area !== "None of the above");
}

/** Spec-named helper: the two classification routes (before the carve-out gate). */
export function classifyHighRisk(answers: ModuleAnswers): {
  annexI: "matched" | "possible" | "no";
  annexIii: "candidate" | "possible" | "no";
  areas: string[];
} {
  let annexI: "matched" | "possible" | "no";
  if (yes(answers, "hr1") && yes(answers, "hr2")) annexI = "matched";
  else if ((yes(answers, "hr1") || notSure(answers, "hr1")) && !no(answers, "hr2")) annexI = "possible";
  else annexI = "no";

  const areas = selectedAreas(answers);
  const hr3 = answers.hr3;
  const annexIii = areas.length > 0 ? "candidate" : Array.isArray(hr3) && hr3.length > 0 ? "no" : "possible";

  return { annexI, annexIii, areas };
}

/** Spec-named helper: the Article 6(3) gate for a candidate Annex III system. */
export function applyArticle6_3CarveOut(answers: ModuleAnswers): "applies" | "profiling_override" | "unavailable" | "unknown" {
  if (yes(answers, "hr6")) return "profiling_override";
  if ((yes(answers, "hr4") || yes(answers, "hr5")) && no(answers, "hr6")) return "applies";
  if (no(answers, "hr4") && no(answers, "hr5")) return "unavailable";
  return "unknown";
}

export interface HighRiskUpstream {
  fullyExcluded: boolean;
  likelyProhibited: boolean;
  prohibitedStatus: string;
  /** Module 2 raw Article 25 signals. */
  rebrandedThirdPartySystem?: string;
  substantiallyModifiedSystem?: string;
  changedIntendedPurpose?: string;
}

/** Spec-named helper: full Module 7 result object. */
export function buildHighRiskAssessment(
  data: HighRiskDerivableData,
  answers: ModuleAnswers,
  upstream: HighRiskUpstream
): HighRiskAssessment {
  const roleConditionalObligation = {
    provider: "Full Articles 8-17 requirements + conformity assessment/CE marking (Art 43) + registration (Art 49).",
    deployer: "Article 26 deployer obligations + Article 27 FRIA where applicable (Module 11).",
    importer: "Article 23 verification duties.",
    distributor: "Article 24 verification duties.",
  };
  const reclassificationTriggerFlags: ReclassificationTriggerFlags = {
    substantialModification: upstream.substantiallyModifiedSystem === "Yes",
    rebranded: upstream.rebrandedThirdPartySystem === "Yes",
    purposeChangedToHighRisk: upstream.changedIntendedPurpose === "Yes",
  };
  const base = {
    reclassificationTriggerFlags,
    roleConditionalObligation,
    sourceVersionDate: SOURCE_VERSION_DATE,
  };

  if (upstream.fullyExcluded || upstream.likelyProhibited) {
    const cause = upstream.fullyExcluded
      ? "Module 5 found a full Article 2 exclusion"
      : "Module 6 flagged a likely prohibited practice (a prohibited-practice finding overrides the high-risk workflow)";
    return {
      ...base,
      status: "not_assessed_excluded",
      confidenceScore: 100,
      confidenceLabel: "high",
      reasoningSummary: `${cause}, so high-risk classification was not performed.`,
      positiveIndicators: [],
      negativeIndicators: [],
      keyUncertainties: [],
      missingFields: [],
      recommendedNextQuestions: [],
      firedRules: [],
      route: "none",
      matchedAnnexIiiAreas: [],
      carveOutApplied: false,
      registrationRequired: false,
      registrationNote: "Not applicable — module not assessed.",
      notHighRiskDocumentationFlag: false,
      standardsConformityRoute: "not_applicable",
    };
  }

  const { annexI, annexIii, areas } = classifyHighRisk(answers);
  const carveOut = annexIii === "candidate" ? applyArticle6_3CarveOut(answers) : "unknown";

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [];
  const firedRules: FiredRule[] = [];

  let status: HighRiskStatus;
  let route: HighRiskAssessment["route"] = "none";
  let carveOutApplied = false;

  const annexIHigh = annexI === "matched";
  let annexIiiHigh = false;

  if (annexIii === "candidate") {
    firedRules.push(fireHighRiskRule("HRR-2", `Annex III area(s): ${areas.join("; ")}. Note: Digital Omnibus deferred Annex III stand-alone high-risk obligations to ${APPLICABLE_DATES.highRiskAnnexIII.date} (provisional).`));
    positiveIndicators.push(`Annex III area(s) selected: ${areas.join("; ")}.`);
    if (carveOut === "profiling_override") {
      firedRules.push(fireHighRiskRule("HRR-4"));
      annexIiiHigh = true;
      positiveIndicators.push("The system profiles natural persons — the Article 6(3) carve-out is unavailable (always high-risk).");
    } else if (carveOut === "applies") {
      firedRules.push(fireHighRiskRule("HRR-3"));
      carveOutApplied = true;
      negativeIndicators.push("Article 6(3) carve-out conditions met (narrow procedural / detection-only task, no profiling).");
      keyUncertainties.push("The Article 6(3) carve-out boundary rests on the 2026-05-19 DRAFT guidelines — the determination may change before the deferred enforcement dates.");
    } else if (carveOut === "unavailable") {
      annexIiiHigh = true;
      negativeIndicators.push("The Article 6(3) carve-out conditions are not met.");
    } else {
      keyUncertainties.push("The Article 6(3) carve-out answers (HR4/HR5/HR6) are incomplete — the candidate Annex III classification cannot be settled.");
    }
  }

  if (annexIHigh) {
    firedRules.push(fireHighRiskRule("HRR-1", `Note: Digital Omnibus deferred Annex I embedded high-risk obligations to ${APPLICABLE_DATES.highRiskAnnexI.date} (provisional).`));
    positiveIndicators.push("Annex I route: safety component of / product under listed EU harmonisation law requiring third-party conformity assessment.");
  }

  if (annexIHigh && (annexIiiHigh || annexIii === "candidate")) route = "both";
  else if (annexIHigh) route = "annex_i";
  else if (annexIii === "candidate") route = "annex_iii";

  if (annexIHigh || annexIiiHigh) status = "likely_high_risk";
  else if (annexIii === "candidate" && carveOut === "applies") status = "not_high_risk_carve_out";
  else if (annexIii === "candidate" && carveOut === "unknown") status = "possibly_high_risk";
  else if (annexI === "possible") status = "possibly_high_risk";
  else if (annexIii === "possible" || !answered(answers, "hr1")) status = "needs_review";
  else status = "likely_not_high_risk";

  const registrationRequired = status === "likely_high_risk";
  if (registrationRequired) {
    firedRules.push(fireHighRiskRule("HRR-5"));
  }
  const lawEnfArea = areas.some((a) => ["Law enforcement", "Migration, asylum and border control"].includes(a));
  const registrationNote = registrationRequired
    ? `EU database registration required before market placement / putting into service (Art 49; Annex VIII)${lawEnfArea ? " — non-public sub-database for law-enforcement, migration and border systems (Art 49(4))" : ""}.`
    : status === "not_high_risk_carve_out"
      ? "The Article 6(3) not-high-risk self-assessment must itself be documented and registered (Art 6(3)/6(4), Art 49(2))."
      : "No registration duty identified on the current classification.";

  const notHighRiskDocumentationFlag = status === "not_high_risk_carve_out";

  // Confidence: start 100; −20 Annex I unknown; −20 Annex III 'Not sure';
  // −25 carve-out unknown while candidate; −15 profiling unknown; −10 per contradiction.
  let score = 100;
  if (!answered(answers, "hr1") || notSure(answers, "hr1")) {
    score -= 20;
    missingFields.push("Annex I safety-component status (HR1)");
    recommendedNextQuestions.push("Is the AI a product / safety component under an Annex I EU product-safety law?");
  }
  if (!Array.isArray(answers.hr3) || answers.hr3.length === 0) {
    score -= 20;
    missingFields.push("Annex III use-case area selection (HR3)");
    recommendedNextQuestions.push("Which Annex III area(s), if any, does the use case fall in?");
  }
  if (annexIii === "candidate" && carveOut === "unknown") {
    score -= 25;
    missingFields.push("Article 6(3) carve-out answers (HR4/HR5)");
    recommendedNextQuestions.push("Does the system only perform a narrow procedural or detection-only task without materially influencing decisions?");
  }
  if (!answered(answers, "hr6") || notSure(answers, "hr6")) {
    score -= 15;
    missingFields.push("profiling of natural persons (HR6)");
    recommendedNextQuestions.push("Does the system perform profiling of natural persons?");
  }
  if (yes(answers, "hr2") && no(answers, "hr1")) {
    score -= 10;
    keyUncertainties.push("Contradictory answers: third-party conformity assessment reported (HR2) although HR1 says the system is not an Annex I product/safety component.");
  }
  if ((yes(answers, "hr4") || yes(answers, "hr5")) && yes(answers, "hr6")) {
    keyUncertainties.push("Carve-out conditions reported alongside profiling — the profiling override prevails (Art 6(3) final subparagraph).");
  }
  const confidenceScore = clampScore(score);

  const applicableFromDate = annexIHigh
    ? APPLICABLE_DATES.highRiskAnnexI.date
    : route !== "none"
      ? APPLICABLE_DATES.highRiskAnnexIII.date
      : undefined;

  const routeText =
    route === "both"
      ? "both the Annex I product-safety route and the Annex III use-case route"
      : route === "annex_i"
        ? "the Annex I product-safety route"
        : route === "annex_iii"
          ? "the Annex III use-case route"
          : "no high-risk route";
  const carveText =
    annexIii === "candidate"
      ? carveOut === "applies"
        ? " The Article 6(3) carve-out applies (draft-guideline dependent) — document and register the not-high-risk self-assessment."
        : carveOut === "profiling_override"
          ? " The profiling override makes the carve-out unavailable."
          : carveOut === "unavailable"
            ? " The Article 6(3) carve-out conditions are not met."
            : " The Article 6(3) carve-out gate is unresolved."
      : "";
  const dateText = applicableFromDate
    ? ` Applicable from ${applicableFromDate} (provisional Digital Omnibus timeline).`
    : "";
  const reasoningSummary = `Classification via ${routeText}.${carveText}${dateText}`;

  return {
    ...base,
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
    route,
    matchedAnnexIiiAreas: areas,
    carveOutApplied,
    registrationRequired,
    registrationNote,
    notHighRiskDocumentationFlag,
    standardsConformityRoute: registrationRequired
      ? "Conformity assessment route depends on harmonised-standards coverage: Annex VI internal control under the presumption of conformity, else Annex VII notified body (settled in Module 12)."
      : "not_applicable",
    applicableFromDate,
  };
}
