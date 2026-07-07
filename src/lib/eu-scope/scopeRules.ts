// Module 4 — EU Scope & Applicability (modules_mds/module-4-eu-scope.md).
// Deterministic derived-assessment: determines whether the EU AI Act applies
// at all (Article 2(1) triggers) and whether a non-EU provider must appoint an
// EU authorised representative (Article 22 / Article 54).
//
// Pure rules only — no DB or server imports (used by client components and
// the tsx self-check test).

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

export const EU_SCOPE_MODULE_KEY = "eu-scope" as const;

// ---------------------------------------------------------------------------
// Questionnaire (reuse-first, plain English — labels/helpers from the spec)
// ---------------------------------------------------------------------------

export const ESTABLISHMENT_OPTIONS = [
  "Established in the EU/EEA",
  "Established in a third country (outside EU/EEA)",
  "Not sure",
] as const;

export const SCOPE_ROLE_OPTIONS = [
  "Provider",
  "Deployer",
  "Importer",
  "Distributor",
  "Authorised representative",
  "Not sure",
] as const;

export const SCOPE_QUESTIONS: ModuleQuestion[] = [
  {
    key: "establishment",
    label: "Where is your organisation legally established or located?",
    helper:
      "'Established' = where the entity is registered or has its main place of business. Answer 'Third country' if outside EU/EEA.",
    options: ESTABLISHMENT_OPTIONS,
    seededFrom: "module-2 organisation location",
  },
  {
    key: "placesOnEuMarket",
    label: "Do you place this AI system on the EU market, or put it into service in the EU?",
    helper:
      "'Placing on the market' = first making it available in the Union. 'Putting into service' = supplying it for first use in the Union. For GPAI, placing the model on the EU market.",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-1 countries where used",
  },
  {
    key: "outputUsedInEu",
    label:
      "Is the output produced by the AI system (predictions, content, recommendations, decisions) used by people or organisations located in the EU?",
    helper:
      "The extraterritorial trigger — even if you and the system sit outside the EU, using its output inside the EU brings you into scope.",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-1 outputs used in EU / countries where used",
  },
  {
    key: "role",
    label: "What is your role for this system?",
    helper: "Provider, deployer, importer, distributor, authorised representative. Scope triggers differ by role.",
    options: SCOPE_ROLE_OPTIONS,
    seededFrom: "module-2 role assessment",
  },
  {
    key: "nonEuProviderHighRiskOrGpai",
    label:
      "Are you a provider established outside the EU whose high-risk AI system or GPAI model will be made available on the EU market?",
    helper:
      "If yes, Article 22 requires you to appoint, by written mandate, an EU-established authorised representative before the high-risk system is placed on the market. GPAI-model providers have a parallel duty (Article 54).",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-2 role + module-1 establishment/product type",
  },
];

// ---------------------------------------------------------------------------
// Deterministic rules — all guidance_status: final, source_version_date 2026-07-07
// ---------------------------------------------------------------------------

export interface ScopeRuleDefinition {
  id: string;
  title: string;
  citation: string;
  guidanceStatus: "final";
}

export const SCOPE_RULES: ScopeRuleDefinition[] = [
  {
    id: "S-01",
    title:
      "Provider places an AI system on the EU market / puts it into service (or places a GPAI model on the EU market), wherever established → in scope",
    citation: "Article 2(1)(a)",
    guidanceStatus: "final",
  },
  {
    id: "S-02",
    title: "Deployer established or located in the Union → in scope",
    citation: "Article 2(1)(b)",
    guidanceStatus: "final",
  },
  {
    id: "S-03",
    title: "Provider/deployer in a third country but system output is used in the Union → in scope (extraterritorial)",
    citation: "Article 2(1)(c)",
    guidanceStatus: "final",
  },
  {
    id: "S-04",
    title:
      "Provider in a third country placing a high-risk system on the EU market must appoint an EU-established authorised representative by written mandate before market placement",
    citation: "Article 22(1)",
    guidanceStatus: "final",
  },
  {
    id: "S-05",
    title:
      "Provider in a third country placing a GPAI model on the EU market must appoint an EU authorised representative before placing the model (parallel to, independent of, S-04)",
    citation: "Article 54",
    guidanceStatus: "final",
  },
  {
    id: "S-06",
    title: "None of the Article 2(1) triggers satisfied → out of scope (a contrario)",
    citation: "Article 2(1)",
    guidanceStatus: "final",
  },
];

const RULE_BY_ID = new Map(SCOPE_RULES.map((r) => [r.id, r]));

export function fireScopeRule(id: string, detail?: string): FiredRule {
  const rule = RULE_BY_ID.get(id);
  if (!rule) throw new Error(`Unknown scope rule: ${id}`);
  return { ruleId: rule.id, title: rule.title, citation: rule.citation, guidanceStatus: rule.guidanceStatus, detail };
}

export const SCOPE_SOURCE_VERSION_DATE = SOURCE_VERSION_DATE;

// ---------------------------------------------------------------------------
// Answer seeding from Modules 1 + 2
// ---------------------------------------------------------------------------

// EU/EEA member states, for matching the free-text module-1 countriesUsed list.
const EU_EEA_COUNTRIES = new Set(
  [
    "austria", "belgium", "bulgaria", "croatia", "cyprus", "czechia", "czech republic",
    "denmark", "estonia", "finland", "france", "germany", "greece", "hungary", "ireland",
    "italy", "latvia", "lithuania", "luxembourg", "malta", "netherlands", "poland",
    "portugal", "romania", "slovakia", "slovenia", "spain", "sweden",
    "norway", "iceland", "liechtenstein",
    "eu", "eu/eea", "european union",
  ]
);

export function includesEuEeaCountry(countries: readonly string[]): boolean {
  return countries.some((c) => EU_EEA_COUNTRIES.has(c.trim().toLowerCase()));
}

/** The Module 1/2 evidence this module derives from (kept structural). */
export interface ScopeDerivableData {
  countriesUsed: string[];
  outputsUsedInEu?: string | null;
  usesGpaiOrLlm?: string | null;
  riskDomainFlags: string[];
}

export interface ScopeUpstream {
  /** Module 2 merged answers (for organisationInEu). */
  organisationInEu?: string;
  /** Module 2 result roles. */
  likelyRoles: string[];
}

export function deriveScopeAnswers(data: ScopeDerivableData, upstream: ScopeUpstream): ModuleAnswers {
  const d: ModuleAnswers = {};

  if (upstream.organisationInEu === "Yes") d.establishment = "Established in the EU/EEA";
  if (upstream.organisationInEu === "No") d.establishment = "Established in a third country (outside EU/EEA)";

  if (includesEuEeaCountry(data.countriesUsed)) d.placesOnEuMarket = "Yes";

  if (data.outputsUsedInEu === "Yes" || data.outputsUsedInEu === "No" || data.outputsUsedInEu === "Not sure") {
    d.outputUsedInEu = data.outputsUsedInEu;
  }
  if (!d.outputUsedInEu && includesEuEeaCountry(data.countriesUsed)) d.outputUsedInEu = "Yes";

  const roleOptions = new Set<string>(SCOPE_ROLE_OPTIONS);
  const mapped = upstream.likelyRoles
    .map((r) => (r === "Authorised Representative" ? "Authorised representative" : r))
    .filter((r) => roleOptions.has(r) && r !== "Not sure");
  if (mapped.length === 1) d.role = mapped[0];

  // Q5 only applies to non-EU providers; mark the clear negatives.
  if (d.establishment === "Established in the EU/EEA") d.nonEuProviderHighRiskOrGpai = "Not applicable";
  else if (d.role && d.role !== "Provider" && d.role !== "Not sure") d.nonEuProviderHighRiskOrGpai = "Not applicable";

  return d;
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export type ScopeStatus = "likely_in_scope" | "possibly_in_scope" | "likely_out_of_scope" | "needs_review";

export interface AuthorisedRepRequirement {
  required: boolean;
  /** Citations backing the duty (Article 22(1) and/or Article 54). */
  citations: string[];
  reasoning: string;
}

export interface EuScopeAssessment extends AssessmentCore<ScopeStatus> {
  /** Matched Article 2(1) trigger rule ids (S-01/S-02/S-03). */
  matchedTriggers: string[];
  authorisedRepRequired: boolean;
  authorisedRep: AuthorisedRepRequirement;
  roleConditionalObligation: string;
  sourceVersionDate: string;
}

const isYes = (v?: string) => v === "Yes";
const isNo = (v?: string) => v === "No" || v === "Not applicable";
const isNotSure = (v?: string) => v === "Not sure";
const answered = (v?: string) => typeof v === "string" && v.length > 0;

function answerStr(answers: ModuleAnswers, key: string): string | undefined {
  const v = answers[key];
  return typeof v === "string" ? v : undefined;
}

/** Article 2(1) trigger evaluation. Spec-named helper. */
export function calculateScopeStatus(answers: ModuleAnswers): {
  status: ScopeStatus;
  matchedTriggers: string[];
  possibleTriggers: string[];
} {
  const establishment = answerStr(answers, "establishment");
  const places = answerStr(answers, "placesOnEuMarket");
  const output = answerStr(answers, "outputUsedInEu");
  const role = answerStr(answers, "role");

  const inEu = establishment === "Established in the EU/EEA";
  const thirdCountry = establishment === "Established in a third country (outside EU/EEA)";
  const roleKnown = answered(role) && role !== "Not sure";

  const matched: string[] = [];
  const possible: string[] = [];

  // S-01: provider places on EU market / puts into service, wherever established.
  if (role === "Provider" && isYes(places)) matched.push("S-01");
  else if ((role === "Provider" || !roleKnown) && (isYes(places) || isNotSure(places) || !answered(places))) {
    if (isYes(places) || isNotSure(places)) possible.push("S-01");
  }

  // S-02: deployer established or located in the Union.
  if (role === "Deployer" && inEu) matched.push("S-02");
  else if (
    (role === "Deployer" && (isNotSure(establishment) || !answered(establishment))) ||
    (!roleKnown && inEu)
  ) {
    possible.push("S-02");
  }

  // S-03: third-country operator, output used in the Union.
  if (thirdCountry && isYes(output)) matched.push("S-03");
  else if (
    (thirdCountry && isNotSure(output)) ||
    ((isNotSure(establishment) || !answered(establishment)) && isYes(output))
  ) {
    possible.push("S-03");
  }

  if (matched.length > 0) return { status: "likely_in_scope", matchedTriggers: matched, possibleTriggers: possible };
  if (possible.length > 0) return { status: "possibly_in_scope", matchedTriggers: matched, possibleTriggers: possible };

  // S-06 (a contrario) only when the core answers are definitively negative.
  const negativesSettled =
    answered(establishment) && !isNotSure(establishment) &&
    roleKnown &&
    answered(places) && !isNotSure(places) && !isYes(places) &&
    answered(output) && !isNotSure(output) && !isYes(output) &&
    // an EU deployer would have matched S-02; reaching here with role known means no trigger
    !(role === "Deployer" && inEu);
  if (negativesSettled) return { status: "likely_out_of_scope", matchedTriggers: [], possibleTriggers: [] };

  return { status: "needs_review", matchedTriggers: [], possibleTriggers: [] };
}

/** Article 22 / Article 54 authorised-representative determination. Spec-named helper. */
export function getAuthorisedRepRequirement(data: ScopeDerivableData, answers: ModuleAnswers): AuthorisedRepRequirement {
  const establishment = answerStr(answers, "establishment");
  const role = answerStr(answers, "role");
  const q5 = answerStr(answers, "nonEuProviderHighRiskOrGpai");

  const thirdCountry = establishment === "Established in a third country (outside EU/EEA)";
  const gpaiSignal = data.usesGpaiOrLlm === "Yes";
  const riskSignal = data.riskDomainFlags.length > 0;

  if (isYes(q5) && (thirdCountry || !answered(establishment) || isNotSure(establishment)) && role !== "Deployer") {
    const citations: string[] = [];
    if (riskSignal || !gpaiSignal) citations.push("Article 22(1)");
    if (gpaiSignal) citations.push("Article 54");
    return {
      required: true,
      citations,
      reasoning:
        "Non-EU provider making a high-risk AI system or GPAI model available on the EU market must appoint an EU-established authorised representative by written mandate before market placement.",
    };
  }

  return {
    required: false,
    citations: [],
    reasoning:
      role === "Importer" || role === "Distributor"
        ? "No direct authorised-representative duty for this role — but verify that an EU authorised representative exists for any non-EU provider whose system you make available."
        : "No Article 22 / Article 54 authorised-representative duty identified on the current answers.",
  };
}

function roleConditionalObligation(answers: ModuleAnswers, rep: AuthorisedRepRequirement): string {
  const role = answerStr(answers, "role");
  const establishment = answerStr(answers, "establishment");
  const thirdCountry = establishment === "Established in a third country (outside EU/EEA)";

  if (role === "Provider" && thirdCountry && rep.required) {
    return "provider_non_eu: appoint an EU-established authorised representative by written mandate before market placement (Article 22 / Article 54). Re-evaluate if a Module 9 reclassification fires.";
  }
  if (role === "Deployer") {
    return "deployer_eu: in scope as deployer where established/located in the Union (Article 2(1)(b)). Re-evaluate if a Module 9 reclassification fires.";
  }
  if (role === "Importer" || role === "Distributor") {
    return "importer_distributor: verify an EU authorised representative exists for non-EU providers whose systems you make available (Article 23 / Article 24 verification duties). Re-evaluate if a Module 9 reclassification fires.";
  }
  return "Role-conditional obligations cannot be finalised until the Module 2 role is settled.";
}

/** Full Module 4 result object. Spec-named helper. */
export function buildScopeAssessment(data: ScopeDerivableData, answers: ModuleAnswers): EuScopeAssessment {
  const { status, matchedTriggers, possibleTriggers } = calculateScopeStatus(answers);
  const rep = getAuthorisedRepRequirement(data, answers);

  const establishment = answerStr(answers, "establishment");
  const places = answerStr(answers, "placesOnEuMarket");
  const output = answerStr(answers, "outputUsedInEu");
  const role = answerStr(answers, "role");
  const q5 = answerStr(answers, "nonEuProviderHighRiskOrGpai");

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [];
  const firedRules: FiredRule[] = [];

  for (const id of matchedTriggers) firedRules.push(fireScopeRule(id));
  if (status === "likely_out_of_scope") firedRules.push(fireScopeRule("S-06"));

  if (establishment === "Established in the EU/EEA") positiveIndicators.push("Organisation is established in the EU/EEA.");
  if (establishment === "Established in a third country (outside EU/EEA)") {
    negativeIndicators.push("Organisation is established in a third country (outside EU/EEA).");
  }
  if (isYes(places)) positiveIndicators.push("System is placed on the EU market or put into service in the EU.");
  if (isYes(output)) positiveIndicators.push("System output is used by people or organisations located in the EU.");
  if (isNo(places) && isNo(output)) negativeIndicators.push("No EU market placement and no EU use of outputs reported.");
  if (role && role !== "Not sure") positiveIndicators.push(`Role for this system: ${role}.`);

  // Confidence: baseline 90 where establishment, output destination and role
  // are all known and a single trigger clearly matches; subtract per 'Not sure'
  // on establishment / output-used-in-Union / role, and where product type
  // (high-risk/GPAI) is unknown but needed for the Art 22/54 determination.
  let score = 90;
  if (!answered(establishment) || isNotSure(establishment)) {
    score -= 25;
    missingFields.push("organisation establishment (EU/EEA vs third country)");
    keyUncertainties.push("Establishment location is unknown — Article 2(1)(b)/(c) and Article 22 depend on it.");
    recommendedNextQuestions.push("Where is the organisation legally established or registered?");
  }
  if (!answered(output) || isNotSure(output)) {
    score -= 25;
    missingFields.push("output used in the Union");
    keyUncertainties.push("Whether system output is used in the Union is unknown — the extraterritorial trigger (Article 2(1)(c)) cannot be settled.");
    recommendedNextQuestions.push("Are the system's predictions, content, recommendations or decisions used by anyone located in the EU?");
  }
  if (!answered(role) || role === "Not sure") {
    score -= 25;
    missingFields.push("entity role (Module 2)");
    keyUncertainties.push("The entity role is unsettled — scope triggers and the authorised-representative duty differ by role.");
    recommendedNextQuestions.push("Complete the Module 2 role questionnaire for this system.");
  }
  if (!answered(places) || isNotSure(places)) {
    score -= 15;
    missingFields.push("EU market placement / putting into service");
    keyUncertainties.push("EU market placement / putting into service is unknown (Article 2(1)(a)).");
    recommendedNextQuestions.push("Is this system made available or put into service in the EU?");
  }
  const q5Relevant = establishment !== "Established in the EU/EEA" && role !== "Deployer";
  if (q5Relevant && (!answered(q5) || isNotSure(q5))) {
    score -= 15;
    missingFields.push("high-risk / GPAI product type (needed for Article 22/54)");
    keyUncertainties.push("Whether the system is high-risk or a GPAI model is unknown, but the Article 22/54 authorised-representative determination depends on it.");
    recommendedNextQuestions.push("Will a high-risk system or GPAI model be made available on the EU market? (Modules 7 and 10 refine this.)");
  }
  if (matchedTriggers.length > 1) score -= 0; // multiple clean triggers do not reduce confidence
  if (status === "possibly_in_scope") score = Math.min(score, 60);
  if (status === "needs_review") score = Math.min(score, 40);

  const confidenceScore = clampScore(score);

  if (rep.required) {
    for (const c of rep.citations) {
      firedRules.push(fireScopeRule(c === "Article 54" ? "S-05" : "S-04"));
    }
    positiveIndicators.push("Authorised-representative duty identified before EU market placement.");
  }

  const triggerText =
    matchedTriggers.length > 0
      ? `Matched Article 2(1) trigger(s): ${matchedTriggers
          .map((id) => RULE_BY_ID.get(id)?.citation ?? id)
          .join(", ")}.`
      : possibleTriggers.length > 0
        ? `Possible Article 2(1) trigger(s) pending confirmation: ${possibleTriggers
            .map((id) => RULE_BY_ID.get(id)?.citation ?? id)
            .join(", ")}.`
        : status === "likely_out_of_scope"
          ? "None of the Article 2(1)(a)-(c) triggers is satisfied on the current answers (a contrario, Article 2(1))."
          : "The Article 2(1) triggers cannot be evaluated on the current answers.";
  const repText = rep.required
    ? ` An EU authorised representative must be appointed before market placement (${rep.citations.join(" and ")}).`
    : "";
  const reasoningSummary = `${triggerText}${repText}`;

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
    matchedTriggers,
    authorisedRepRequired: rep.required,
    authorisedRep: rep,
    roleConditionalObligation: roleConditionalObligation(answers, rep),
    sourceVersionDate: SCOPE_SOURCE_VERSION_DATE,
  };
}
