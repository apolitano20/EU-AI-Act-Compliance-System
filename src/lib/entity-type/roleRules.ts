// Deterministic EU AI Act role classification rules (Module 2).
// No LLM reasoning — every output here is derived from explicit answer combinations.

import { YES_NO_NOT_SURE_NA } from "../options";

export const INTENDED_PURPOSE_OPTIONS = [
  "Our organisation",
  "Vendor / external provider",
  "Jointly",
  "Not sure",
  "Not applicable",
] as const;

export const EXTERNAL_ACCESS_WHO_OPTIONS = [
  "Customers",
  "Clients",
  "Affiliates / group companies",
  "Business partners",
  "Resellers",
  "Public users",
  "Other",
  "Not sure",
  "Not applicable",
] as const;

export const ACCESS_MODEL_OPTIONS = ["Payment", "Free", "Both", "Not sure", "Not applicable"] as const;

export interface Question {
  key: SingleAnswerKey | "externalAccessWho";
  section: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  label: string;
  helper?: string;
  options: readonly string[];
  multi?: boolean;
}

export const SECTION_TITLES: Record<Question["section"], string> = {
  A: "Development / commissioning",
  B: "Business use",
  C: "Availability outside the organisation",
  D: "Non-EU supply chain",
  E: "Authorised representative",
  F: "Product manufacturer",
  G: "Modification / Article 25 risk",
};

export const QUESTIONS: Question[] = [
  // Section A
  { key: "builtInternally", section: "A", label: "Did your organisation develop this AI system internally?", options: YES_NO_NOT_SURE_NA },
  { key: "commissionedForUs", section: "A", label: "Did your organisation pay another company or person to build this AI system specifically for you?", options: YES_NO_NOT_SURE_NA },
  { key: "standardVendorProduct", section: "A", label: "Is this a standard vendor product used by many customers?", options: YES_NO_NOT_SURE_NA },
  { key: "ownNameOrBrand", section: "A", label: "Is the system used, offered, or released under your organisation's name, logo, product name, or trademark?", options: YES_NO_NOT_SURE_NA },
  { key: "vendorBrandVisible", section: "A", label: "Is another company's name or brand visible as the provider/vendor?", options: YES_NO_NOT_SURE_NA },
  { key: "intendedPurposeDefinedBy", section: "A", label: "Who defines what the system is intended to do?", options: INTENDED_PURPOSE_OPTIONS },

  // Section B
  { key: "usesSystem", section: "B", label: "Does your organisation use this AI system?", options: YES_NO_NOT_SURE_NA },
  { key: "businessOrProfessionalUse", section: "B", label: "Is it used for business, professional, public-sector, or organisational purposes?", options: YES_NO_NOT_SURE_NA },
  { key: "organisationControlsUse", section: "B", label: "Does your organisation decide who can use it and how it is used?", options: YES_NO_NOT_SURE_NA },

  // Section C
  {
    key: "madeAvailableOutsideOrganisation",
    section: "C",
    label: "Do you make this AI system available to anyone outside your organisation?",
    helper: "This includes customers, clients, affiliates, group companies, partners, resellers, or public users. It can be paid or free.",
    options: YES_NO_NOT_SURE_NA,
  },
  { key: "externalAccessWho", section: "C", label: "Who can access it outside your organisation?", options: EXTERNAL_ACCESS_WHO_OPTIONS, multi: true },
  { key: "accessModel", section: "C", label: "Is access provided for payment, for free, or both?", options: ACCESS_MODEL_OPTIONS },

  // Section D
  { key: "providerOutsideEu", section: "D", label: "Is the AI system provided by an organisation established outside the EU?", options: YES_NO_NOT_SURE_NA },
  { key: "organisationInEu", section: "D", label: "Is your organisation established or located in the EU?", options: YES_NO_NOT_SURE_NA },
  { key: "obtainedDirectlyFromNonEu", section: "D", label: "Did your organisation obtain the system directly from the non-EU provider?", options: YES_NO_NOT_SURE_NA },
  { key: "obtainedThroughEuReseller", section: "D", label: "Did your organisation obtain the system through another EU reseller, distributor, or partner?", options: YES_NO_NOT_SURE_NA },
  {
    key: "firstEuActorMakingAvailable",
    section: "D",
    label: "Are you the first EU-based organisation making this non-EU system available to EU customers or users?",
    helper: "Answer \"Yes\" only if your organisation is the first EU-based actor introducing or supplying the non-EU provider's system into the EU market. If you only use it internally, answer \"No\" or \"Not applicable.\"",
    options: YES_NO_NOT_SURE_NA,
  },
  { key: "keepsNonEuProviderBrand", section: "D", label: "Does the system keep the non-EU provider's name or trademark when made available in the EU?", options: YES_NO_NOT_SURE_NA },

  // Section E
  {
    key: "writtenMandateFromNonEuProvider",
    section: "E",
    label: "Has a non-EU AI provider formally appointed your organisation in writing to act on its behalf for EU AI Act or EU regulatory obligations?",
    helper: "This is not the same as being a reseller, consultant, implementation partner, or local sales contact. There must be a written mandate.",
    options: YES_NO_NOT_SURE_NA,
  },
  { key: "mandateMentionsEuAiActOrRegulatoryObligations", section: "E", label: "Does the written appointment specifically mention EU AI Act, EU regulatory compliance, conformity, documentation, or acting on behalf of the provider?", options: YES_NO_NOT_SURE_NA },

  // Section F
  { key: "aiEmbeddedInProduct", section: "F", label: "Is the AI system included inside a product your organisation sells or puts into service?", options: YES_NO_NOT_SURE_NA },
  { key: "productSoldUnderOwnBrand", section: "F", label: "Is that product sold, supplied, or put into service under your organisation's name or brand?", options: YES_NO_NOT_SURE_NA },
  { key: "safetyRisk", section: "F", label: "Could failure or malfunction of the AI system create safety risks for people or property?", options: YES_NO_NOT_SURE_NA },

  // Section G
  { key: "rebrandedThirdPartySystem", section: "G", label: "Have you put your own name, logo, trademark, or product name on an AI system originally provided by someone else?", options: YES_NO_NOT_SURE_NA },
  { key: "changedIntendedPurpose", section: "G", label: "Have you changed what the AI system is intended to be used for?", options: YES_NO_NOT_SURE_NA },
  { key: "substantiallyModifiedSystem", section: "G", label: "Have you substantially modified how the system works?", options: YES_NO_NOT_SURE_NA },
  { key: "fineTunedOrRetrainedModel", section: "G", label: "Have you fine-tuned, retrained, or otherwise materially adapted the model?", options: YES_NO_NOT_SURE_NA },
  { key: "integratedIntoNewWorkflowWithNewPurpose", section: "G", label: "Have you integrated the system into a new workflow where it now affects decisions, recommendations, or actions in a different context than originally intended?", options: YES_NO_NOT_SURE_NA },
];

export type SingleAnswerKey =
  | "builtInternally"
  | "commissionedForUs"
  | "standardVendorProduct"
  | "ownNameOrBrand"
  | "vendorBrandVisible"
  | "intendedPurposeDefinedBy"
  | "usesSystem"
  | "businessOrProfessionalUse"
  | "organisationControlsUse"
  | "madeAvailableOutsideOrganisation"
  | "accessModel"
  | "providerOutsideEu"
  | "organisationInEu"
  | "obtainedDirectlyFromNonEu"
  | "obtainedThroughEuReseller"
  | "firstEuActorMakingAvailable"
  | "keepsNonEuProviderBrand"
  | "writtenMandateFromNonEuProvider"
  | "mandateMentionsEuAiActOrRegulatoryObligations"
  | "aiEmbeddedInProduct"
  | "productSoldUnderOwnBrand"
  | "safetyRisk"
  | "rebrandedThirdPartySystem"
  | "changedIntendedPurpose"
  | "substantiallyModifiedSystem"
  | "fineTunedOrRetrainedModel"
  | "integratedIntoNewWorkflowWithNewPurpose";

export type Answers = Partial<Record<SingleAnswerKey, string>> & {
  externalAccessWho?: string[];
};

export type ConfidenceLabel = "high" | "medium" | "low" | "insufficient_information";

export interface RoleAssessmentResult {
  likelyRoles: string[];
  possibleRoles: string[];
  flags: string[];
  article25ProviderConversionRisk: boolean;
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  reasoningSummary: string;
  keyUncertainties: string[];
  recommendedNextQuestions: string[];
}

// Inventory fields (from the AISystem model) that carry over into the role
// questionnaire. Kept structural so this module stays decoupled from Prisma.
export interface DerivableSystem {
  buildType?: string | null;
  brandedUnderOrganisationName?: string | null;
  vendorBrandVisible?: string | null;
  modifiedFineTunedRebrandedOrRepurposed?: string | null;
  deploymentContext?: string | null;
  status?: string | null;
}

// Seed questionnaire answers from what the inventory already captured, so the
// entity-type table reflects real data before anyone opens the questionnaire.
// ponytail: heuristic seed — the questionnaire (saved answers) overrides these.
export function deriveAnswersFromSystem(s: DerivableSystem): Answers {
  const d: Answers = {};

  switch (s.buildType) {
    case "Built internally":
      d.builtInternally = "Yes"; d.commissionedForUs = "No"; d.standardVendorProduct = "No";
      d.intendedPurposeDefinedBy = "Our organisation";
      break;
    case "Commissioned from external developer":
      d.commissionedForUs = "Yes"; d.builtInternally = "No"; d.standardVendorProduct = "No";
      d.intendedPurposeDefinedBy = "Our organisation";
      break;
    case "Bought/licensed from vendor":
      d.standardVendorProduct = "Yes"; d.builtInternally = "No"; d.commissionedForUs = "No";
      d.intendedPurposeDefinedBy = "Vendor / external provider";
      break;
    case "Hybrid: internal plus vendor":
      d.builtInternally = "Yes"; d.standardVendorProduct = "Yes";
      d.intendedPurposeDefinedBy = "Jointly";
      break;
    // "Open-source component", "Not sure", null → leave unset
  }

  // Same Yes/No/Not sure vocabulary → carry directly.
  if (YES_NO_NOT_SURE_NA.includes(s.brandedUnderOrganisationName as never)) {
    d.ownNameOrBrand = s.brandedUnderOrganisationName!;
  }
  if (YES_NO_NOT_SURE_NA.includes(s.vendorBrandVisible as never)) {
    d.vendorBrandVisible = s.vendorBrandVisible!;
  }

  // Single Article 25 conversion signal from the inventory's modify/rebrand flag.
  if (s.modifiedFineTunedRebrandedOrRepurposed === "Yes") d.substantiallyModifiedSystem = "Yes";
  else if (s.modifiedFineTunedRebrandedOrRepurposed === "No") d.substantiallyModifiedSystem = "No";

  switch (s.deploymentContext) {
    case "Internal only":
    case "Employee-facing":
      d.madeAvailableOutsideOrganisation = "No";
      break;
    case "Customer-facing":
    case "Client-facing":
    case "Public-facing":
      d.madeAvailableOutsideOrganisation = "Yes";
      break;
    // "Used by other systems", "Not sure", null → leave unset
  }

  // A system in production/pilot is used professionally by the organisation.
  if (s.status === "Production" || s.status === "Pilot") {
    d.usesSystem = "Yes";
    d.businessOrProfessionalUse = "Yes";
  }
  // A first-party deployment context means the org controls how it is used.
  if (s.deploymentContext && s.deploymentContext !== "Not sure" && s.deploymentContext !== "Used by other systems") {
    d.organisationControlsUse = "Yes";
  }

  return d;
}

function isYes(v?: string): boolean {
  return v === "Yes";
}

function isNo(v?: string): boolean {
  return v === "No";
}

function isUnknown(v?: string): boolean {
  return v == null || v === "" || v === "Not sure";
}

// Core rule-driving questions used for confidence scoring (excludes ownNameOrBrand
// and madeAvailableOutsideOrganisation, which are scored separately below to avoid
// double-counting).
const CORE_QUESTIONS: SingleAnswerKey[] = [
  "builtInternally", "commissionedForUs", "standardVendorProduct", "vendorBrandVisible", "intendedPurposeDefinedBy",
  "usesSystem", "businessOrProfessionalUse", "organisationControlsUse",
  "providerOutsideEu", "organisationInEu", "obtainedDirectlyFromNonEu", "obtainedThroughEuReseller",
  "firstEuActorMakingAvailable", "keepsNonEuProviderBrand",
  "writtenMandateFromNonEuProvider", "mandateMentionsEuAiActOrRegulatoryObligations",
  "aiEmbeddedInProduct", "productSoldUnderOwnBrand", "safetyRisk",
  "rebrandedThirdPartySystem", "changedIntendedPurpose", "substantiallyModifiedSystem",
  "fineTunedOrRetrainedModel", "integratedIntoNewWorkflowWithNewPurpose",
];

const SUPPLY_CHAIN_KEYS: SingleAnswerKey[] = [
  "providerOutsideEu", "organisationInEu", "obtainedDirectlyFromNonEu",
  "obtainedThroughEuReseller", "firstEuActorMakingAvailable", "keepsNonEuProviderBrand",
];

export function assessRole(answers: Answers): RoleAssessmentResult {
  const a = answers;
  const likelyRoles: string[] = [];
  const possibleRoles: string[] = [];
  const flags: string[] = [];
  const reasoning: string[] = [];
  const keyUncertainties: string[] = [];
  const recommendedNextQuestions: string[] = [];

  // Rule 1 — Provider
  const developedOrCommissioned = isYes(a.builtInternally) || isYes(a.commissionedForUs);
  const providerByDevelopment = developedOrCommissioned && isYes(a.ownNameOrBrand);
  const providerByDistribution =
    isYes(a.madeAvailableOutsideOrganisation) && isYes(a.ownNameOrBrand) && a.intendedPurposeDefinedBy === "Our organisation";
  if (providerByDevelopment || providerByDistribution) {
    likelyRoles.push("Provider");
    reasoning.push("Based on your answers, the organisation likely developed or commissioned this system and offers it under its own name or brand.");
  }
  if (developedOrCommissioned && isNo(a.ownNameOrBrand)) {
    flags.push("Contractor / supplier scenario — review contractual allocation.");
  }

  // Rule 2 — Deployer
  if (isYes(a.usesSystem) && isYes(a.businessOrProfessionalUse) && isYes(a.organisationControlsUse)) {
    likelyRoles.push("Deployer");
    reasoning.push("The organisation appears to use the AI system professionally and under its own authority.");
  }

  // Rule 3 — Article 25 provider-conversion risk
  const article25Keys: SingleAnswerKey[] = [
    "rebrandedThirdPartySystem", "changedIntendedPurpose", "substantiallyModifiedSystem",
    "fineTunedOrRetrainedModel", "integratedIntoNewWorkflowWithNewPurpose",
  ];
  const article25ProviderConversionRisk = article25Keys.some((k) => isYes(a[k]));
  if (article25ProviderConversionRisk) {
    flags.push("Potential Article 25 provider-conversion risk. Review later after high-risk classification.");
  }

  // Rule 4 — Importer
  if (
    isYes(a.providerOutsideEu) &&
    isYes(a.organisationInEu) &&
    isYes(a.madeAvailableOutsideOrganisation) &&
    isYes(a.firstEuActorMakingAvailable) &&
    isYes(a.keepsNonEuProviderBrand)
  ) {
    likelyRoles.push("Importer");
    reasoning.push("The organisation may be the EU-based actor introducing a non-EU provider's AI system into the EU market under the non-EU provider's brand.");
  }

  // Rule 5 — Distributor
  if (
    isYes(a.madeAvailableOutsideOrganisation) &&
    isYes(a.standardVendorProduct) &&
    isNo(a.ownNameOrBrand) &&
    isYes(a.vendorBrandVisible) &&
    a.firstEuActorMakingAvailable !== "Yes"
  ) {
    likelyRoles.push("Distributor");
    reasoning.push("The organisation may be making another provider's AI system available in the EU supply chain without being the original provider or importer.");
  }

  // Rule 6 — Authorised Representative
  if (isYes(a.writtenMandateFromNonEuProvider) && isYes(a.mandateMentionsEuAiActOrRegulatoryObligations)) {
    likelyRoles.push("Authorised Representative");
    reasoning.push("A non-EU provider appears to have formally appointed the organisation to act on its behalf for EU regulatory obligations.");
  } else if (isYes(a.writtenMandateFromNonEuProvider)) {
    possibleRoles.push("Authorised Representative");
    keyUncertainties.push("A written mandate exists, but it's unclear whether it covers EU AI Act or EU regulatory obligations — requires confirmation.");
  }

  // Rule 7 — Product Manufacturer
  if (isYes(a.aiEmbeddedInProduct) && isYes(a.productSoldUnderOwnBrand)) {
    possibleRoles.push("Product Manufacturer");
    reasoning.push("The AI system may be embedded in a product placed on the market under the organisation's own brand — should be reviewed.");
    if (isYes(a.safetyRisk) || isUnknown(a.safetyRisk)) {
      keyUncertainties.push("The AI may be a safety component. Review in later high-risk/product-safety module.");
    }
  }

  // Rule 8 — Non-EU provider representative requirement (placeholder; high-risk/GPAI not yet classified)
  if (isNo(a.organisationInEu) && (providerByDevelopment || providerByDistribution)) {
    flags.push("May need to appoint an EU authorised representative — subject to confirmation once high-risk/GPAI classification is available in a later module.");
  }

  const supplyChainRelevant =
    isYes(a.madeAvailableOutsideOrganisation) || SUPPLY_CHAIN_KEYS.some((k) => a[k] != null && a[k] !== "");

  // Confidence scoring
  let score = 100;
  score -= CORE_QUESTIONS.filter((k) => a[k] === "Not sure").length * 10;
  if (isUnknown(a.ownNameOrBrand)) {
    score -= 20;
    recommendedNextQuestions.push("Clarify whether the system is used, offered, or released under your organisation's name, logo, product name, or trademark.");
  }
  if (isUnknown(a.madeAvailableOutsideOrganisation)) {
    score -= 20;
    recommendedNextQuestions.push("Clarify whether the AI system is made available to anyone outside your organisation.");
  }
  if (supplyChainRelevant && isUnknown(a.providerOutsideEu)) {
    score -= 20;
    recommendedNextQuestions.push("Clarify whether the AI system's provider is established outside the EU.");
  }
  if (likelyRoles.length === 0 && possibleRoles.length === 0) {
    score -= 30;
    recommendedNextQuestions.push("Review Sections A–C to help determine a likely role for this system.");
  }

  const contradictions =
    (isYes(a.builtInternally) && isYes(a.standardVendorProduct)) ||
    (isNo(a.usesSystem) && isYes(a.organisationControlsUse)) ||
    (isYes(a.obtainedDirectlyFromNonEu) && isYes(a.obtainedThroughEuReseller));
  if (contradictions) {
    score -= 15;
    keyUncertainties.push("Some answers appear contradictory — should be reviewed before this assessment is relied upon.");
  }

  score = Math.max(0, Math.min(100, score));
  const confidenceLabel: ConfidenceLabel =
    score >= 80 ? "high" : score >= 50 ? "medium" : score >= 20 ? "low" : "insufficient_information";

  const reasoningSummary =
    reasoning.length > 0
      ? reasoning.join(" ")
      : "Based on your answers, no likely or possible role could be determined yet. Additional information is needed and results should be reviewed.";

  return {
    likelyRoles,
    possibleRoles,
    flags,
    article25ProviderConversionRisk,
    confidenceScore: score,
    confidenceLabel,
    reasoningSummary,
    keyUncertainties,
    recommendedNextQuestions,
  };
}
