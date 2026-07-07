// Module 10 — GPAI Obligations (modules_mds/module-10-gpai-obligations.md).
// Covers three angles: (1) provider of a GPAI model (Art 53, + Art 55 if
// systemic-risk); (2) downstream builder on a third-party GPAI model relying
// on the Art 25/53 information flow; (3) GPAI integrated into a potentially
// high-risk system. Systemic risk is NOT purely the 10^25 FLOP presumption —
// Commission designation (Art 51(1)(b), Annex XIII) is surfaced as an
// UNCERTAINTY, not a hard rule. Pure rules only.

import { YES_NO_NOT_SURE_NA } from "@/lib/options";
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

export const GPAI_MODULE_KEY = "gpai" as const;

// ---------------------------------------------------------------------------
// Questionnaire
// ---------------------------------------------------------------------------

export const FLOP_OPTIONS = ["Yes, above 10^25 FLOP", "No, below 10^25 FLOP", "Not sure", "Not applicable"] as const;
export const COPYRIGHT_OPTIONS = ["Yes", "No", "Partly", "Not sure", "Not applicable"] as const;
export const ANNEX_XII_OPTIONS = ["Yes", "No", "Partly", "Not sure", "Not applicable"] as const;

const isYesOrNotSure = (a: ModuleAnswers, k: string) => a[k] === "Yes" || a[k] === "Not sure";

export const GPAI_QUESTIONS: ModuleQuestion[] = [
  {
    key: "gpai_q1",
    label:
      "Does your organisation develop, train, or place on the market a general-purpose AI model (broadly capable — LLM, foundation, multimodal)?",
    helper: "The model itself, not a narrow single-purpose tool.",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-1 GPAI/LLM usage, underlying model, build type",
  },
  {
    key: "gpai_q2",
    label: "Was this model trained using a very large amount of computing power?",
    helper:
      "Presumed systemic risk when cumulative training compute > 10^25 FLOP; if unknown, answer Not sure — provider/vendor docs may state it.",
    options: FLOP_OPTIONS,
    showWhen: (a) => isYesOrNotSure(a, "gpai_q1"),
  },
  {
    key: "gpai_q3",
    label: "Has the Commission (or AI Office) designated your model as GPAI with systemic risk, or notified you that it may be?",
    helper:
      "Designation can rest on evaluated capabilities, user base, market reach, scalability, or tool access/autonomy (Art 51(1)(b), Annex XIII) — not a fixed number.",
    options: YES_NO_NOT_SURE_NA,
    showWhen: (a) => isYesOrNotSure(a, "gpai_q1"),
  },
  {
    key: "gpai_q4",
    label:
      "Is your GPAI model released under a free and open-source licence with parameters, architecture and usage info publicly available?",
    helper:
      "Open-source GPAI gets a partial exemption from some Art 53 documentation duties, but NOT if systemic risk; copyright policy and training-content summary duties still apply.",
    options: YES_NO_NOT_SURE_NA,
    showWhen: (a) => isYesOrNotSure(a, "gpai_q1"),
  },
  {
    key: "gpai_q5",
    label:
      "Does this system build on, call, or fine-tune a GPAI model provided by another company (external LLM API or downloaded foundation model)?",
    helper: "The downstream/reciprocal case — you rely on the upstream provider giving you Annex XII information.",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-1 GPAI/LLM usage, model provider, build type",
  },
  {
    key: "annexXiiInfoReceived",
    label: "Have you actually received the Annex XII downstream information (capabilities, limitations, integration guidance) from the upstream model provider?",
    helper: "Feeds Module 12 as a supply-chain evidence item (Art 53(1)(b); Annex XII).",
    options: ANNEX_XII_OPTIONS,
    showWhen: (a) => isYesOrNotSure(a, "gpai_q5"),
  },
  {
    key: "gpai_q6",
    label: "Have you fine-tuned, retrained, or substantially modified a third-party GPAI model?",
    helper:
      "Can make YOU a provider of the modified model (Art 53, and Art 55 if your training compute crosses the threshold); links to Module 9.",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-2 fine-tuning answer; module-1 modification field",
  },
  {
    key: "gpai_q7",
    label:
      "Is a GPAI model integrated into a system that could be high-risk (recruitment, credit, biometrics, critical infrastructure)?",
    helper:
      "The downstream provider needs sufficient information/cooperation from the model provider; full high-risk classification is Module 7 — here we flag the dependency.",
    options: YES_NO_NOT_SURE_NA,
    seededFrom: "module-1 risk-domain flags, affects decisions about people",
  },
  {
    key: "gpai_q8",
    label:
      "If you provide a GPAI model, have you put in place an EU copyright-compliance policy and a sufficiently detailed public summary of the training content?",
    helper: "Art 53(1)(c)/(d) apply to ALL GPAI providers, including open-source.",
    options: COPYRIGHT_OPTIONS,
    showWhen: (a) => isYesOrNotSure(a, "gpai_q1"),
  },
];

// ---------------------------------------------------------------------------
// Deterministic rules
// ---------------------------------------------------------------------------

export interface GpaiRuleDefinition {
  id: string;
  title: string;
  citation: string;
  guidanceStatus: GuidanceStatus;
  applicableFromDate: string;
}

export const GPAI_RULES: GpaiRuleDefinition[] = [
  { id: "GPAI-R1", title: "Provider of a GPAI model → Article 53 duties: technical documentation (Annex XI), downstream information (Annex XII), EU copyright policy, public training-content summary", citation: "Art 53; Annex XI, XII; Recital 97", guidanceStatus: "final", applicableFromDate: "2025-08-02" },
  { id: "GPAI-R2", title: "Systemic-risk presumption (compute > 10^25 FLOP) → Article 55 on top of Art 53; notify the Commission within 2 weeks", citation: "Art 51(1)(a), 51(2); Art 52; Art 55", guidanceStatus: "final", applicableFromDate: "2025-08-02" },
  { id: "GPAI-R3", title: "Systemic-risk designation (qualitative) → POSSIBLE systemic risk even below the FLOP threshold — surfaced as uncertainty, not a hard rule", citation: "Art 51(1)(b); Annex XIII; Recital 110", guidanceStatus: "final", applicableFromDate: "2025-08-02" },
  { id: "GPAI-R4", title: "Article 55 systemic-risk obligations: model evaluation + adversarial testing, systemic-risk assessment & mitigation, serious-incident tracking/reporting to the AI Office, adequate cybersecurity", citation: "Art 55(1)(a)-(d)", guidanceStatus: "final", applicableFromDate: "2025-08-02" },
  { id: "GPAI-R5", title: "Open-source partial exemption: exempt from Annex XI technical docs and Annex XII downstream info, but copyright policy and training-content summary still apply; VOID if systemic risk", citation: "Art 53(2); Art 53(1)(c)-(d); Recital 104", guidanceStatus: "final", applicableFromDate: "2025-08-02" },
  { id: "GPAI-R6", title: "Downstream provider — right to receive Annex XII information and cooperation from the upstream provider", citation: "Art 53(1)(b); Annex XII; Art 25(4)", guidanceStatus: "final", applicableFromDate: "2025-08-02" },
  { id: "GPAI-R7", title: "Fine-tuning/substantial modification may convert you into provider of the modified model (Art 53 scoped to the change; Art 55 if modification compute crosses the threshold) — Module 9 trigger", citation: "Art 25(1); Recital 109; Art 53", guidanceStatus: "final", applicableFromDate: "2025-08-02" },
  { id: "GPAI-R8", title: "GPAI integrated into a (potentially) high-risk system → cross-dependency: the high-risk downstream provider needs information/cooperation from the model provider", citation: "Art 25(4); Art 53(1)(b); Annex XII", guidanceStatus: "final", applicableFromDate: "2025-08-02" },
  { id: "GPAI-R9", title: "Copyright policy and public training-content summary mandatory for ALL GPAI providers incl. open-source (AI Office template)", citation: "Art 53(1)(c); 53(1)(d)", guidanceStatus: "final", applicableFromDate: "2025-08-02" },
];

const RULE_BY_ID = new Map(GPAI_RULES.map((r) => [r.id, r]));

function fireGpaiRule(id: string, detail?: string): FiredRule {
  const rule = RULE_BY_ID.get(id);
  if (!rule) throw new Error(`Unknown GPAI rule: ${id}`);
  return { ruleId: rule.id, title: rule.title, citation: rule.citation, guidanceStatus: rule.guidanceStatus, detail };
}

// ---------------------------------------------------------------------------
// Answer seeding from Modules 1 + 2
// ---------------------------------------------------------------------------

export interface GpaiDerivableData {
  usesGpaiOrLlm?: string | null;
  modelProvider?: string | null;
  underlyingModelOrTool?: string | null;
  buildType?: string | null;
  systemTypes: string[];
  riskDomainFlags: string[];
  affectsDecisionsAboutPeople?: string | null;
  modifiedFineTunedRebrandedOrRepurposed?: string | null;
}

const HIGH_RISK_HINT_FLAGS = [
  "Recruitment or hiring",
  "Employee management, promotion, termination, task allocation, or performance monitoring",
  "Creditworthiness, lending, credit scoring, or loan approval",
  "Life insurance or health insurance pricing/risk assessment",
  "Education or vocational training",
  "Access to essential public or private services",
  "Biometrics",
  "Critical infrastructure",
  "Law enforcement",
  "Migration, asylum, or border control",
  "Legal interpretation, justice, or dispute resolution",
  "Democratic processes, elections, or political campaigning",
];

export function deriveGpaiAnswers(data: GpaiDerivableData, upstream: { fineTunedOrRetrainedModel?: string }): ModuleAnswers {
  const d: ModuleAnswers = {};

  const isFoundationBuilder = data.buildType === "Built internally" && data.systemTypes.includes("General-purpose AI / foundation model");
  if (isFoundationBuilder) d.gpai_q1 = "Yes";
  else if (data.usesGpaiOrLlm === "No") {
    d.gpai_q1 = "Not applicable";
    d.gpai_q5 = "No";
  }

  const externalModel = !!data.modelProvider?.trim() || data.buildType === "Bought/licensed from vendor";
  if (data.usesGpaiOrLlm === "Yes" && externalModel) d.gpai_q5 = "Yes";

  if (upstream.fineTunedOrRetrainedModel === "Yes" || upstream.fineTunedOrRetrainedModel === "No") {
    d.gpai_q6 = upstream.fineTunedOrRetrainedModel;
  }

  if (data.usesGpaiOrLlm === "Yes") {
    const highRiskHint = data.riskDomainFlags.some((f) => HIGH_RISK_HINT_FLAGS.includes(f));
    if (highRiskHint) d.gpai_q7 = "Yes";
    else if (data.riskDomainFlags.length > 0 && !data.riskDomainFlags.includes("Not sure")) d.gpai_q7 = "No";
  }

  return d;
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export type GpaiStatus =
  | "likely_gpai_provider"
  | "possibly_systemic_risk_needs_review"
  | "downstream_consumer"
  | "gpai_in_high_risk_context"
  | "likely_not_gpai"
  | "insufficient_information";

export interface GpaiAssessment extends AssessmentCore<GpaiStatus> {
  isGpaiProvider: boolean;
  systemicRisk: "presumed_by_compute" | "possible_by_designation" | "not_indicated" | "unknown";
  isDownstreamConsumer: boolean;
  gpaiInHighRiskContext: boolean;
  openSourcePartialExemption: boolean;
  annexXiiInfoReceived: string | null;
  emitsModule9Trigger: boolean;
  roleConditionalObligation: {
    gpaiModelProvider: string;
    downstreamProviderDeployer: string;
    modifierFineTuner: string;
  };
  registrationNote: string;
  notHighRiskDocumentationFlag: boolean;
  sourceVersionDate: string;
}

const yes = (a: ModuleAnswers, k: string) => a[k] === "Yes";
const notSure = (a: ModuleAnswers, k: string) => a[k] === "Not sure";
const answered = (a: ModuleAnswers, k: string) => typeof a[k] === "string" && (a[k] as string).length > 0;

/** Spec-named helper: which GPAI rules fire on the answers. */
export function assessGpaiObligations(answers: ModuleAnswers): {
  fired: string[];
  systemicRisk: GpaiAssessment["systemicRisk"];
} {
  const fired: string[] = [];
  const provider = yes(answers, "gpai_q1");
  const computePresumption = answers.gpai_q2 === "Yes, above 10^25 FLOP";
  const designation = yes(answers, "gpai_q3") || notSure(answers, "gpai_q3");

  let systemicRisk: GpaiAssessment["systemicRisk"];
  if (computePresumption) systemicRisk = "presumed_by_compute";
  else if (yes(answers, "gpai_q3")) systemicRisk = "possible_by_designation";
  else if (provider && (notSure(answers, "gpai_q2") || notSure(answers, "gpai_q3") || !answered(answers, "gpai_q2"))) systemicRisk = "unknown";
  else systemicRisk = "not_indicated";

  if (provider) {
    fired.push("GPAI-R1", "GPAI-R9");
    if (computePresumption) fired.push("GPAI-R2");
    if (yes(answers, "gpai_q3")) fired.push("GPAI-R3");
    if (computePresumption || yes(answers, "gpai_q3")) fired.push("GPAI-R4");
    if (yes(answers, "gpai_q4") && !computePresumption && !designation) fired.push("GPAI-R5");
  }
  if (yes(answers, "gpai_q5")) fired.push("GPAI-R6");
  if (yes(answers, "gpai_q6")) fired.push("GPAI-R7");
  if (yes(answers, "gpai_q7")) fired.push("GPAI-R8");

  return { fired, systemicRisk };
}

/** Spec-named helper: full Module 10 result object. */
export function buildGpaiAssessment(answers: ModuleAnswers): GpaiAssessment {
  const { fired, systemicRisk } = assessGpaiObligations(answers);

  const isGpaiProvider = yes(answers, "gpai_q1");
  const isDownstreamConsumer = yes(answers, "gpai_q5");
  const gpaiInHighRiskContext = yes(answers, "gpai_q7");
  const openSourcePartialExemption = fired.includes("GPAI-R5");
  const emitsModule9Trigger = fired.includes("GPAI-R7");
  const annexXiiInfoReceived = typeof answers.annexXiiInfoReceived === "string" ? answers.annexXiiInfoReceived : null;

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [];
  const firedRules: FiredRule[] = fired.map((id) => fireGpaiRule(id));

  let status: GpaiStatus;
  if (isGpaiProvider) {
    status =
      systemicRisk === "possible_by_designation" || systemicRisk === "unknown"
        ? "possibly_systemic_risk_needs_review"
        : "likely_gpai_provider";
  } else if (isDownstreamConsumer) {
    status = gpaiInHighRiskContext ? "gpai_in_high_risk_context" : "downstream_consumer";
  } else if (gpaiInHighRiskContext) {
    status = "gpai_in_high_risk_context";
  } else if (answers.gpai_q1 === "No" || answers.gpai_q1 === "Not applicable") {
    status = answers.gpai_q5 === "No" || answers.gpai_q5 === "Not applicable" ? "likely_not_gpai" : "insufficient_information";
  } else {
    status = "insufficient_information";
  }

  if (isGpaiProvider) positiveIndicators.push("Organisation provides a GPAI model — Article 53 duties apply (Annex XI/XII docs, copyright policy, training-content summary).");
  if (systemicRisk === "presumed_by_compute") {
    positiveIndicators.push("Training compute above 10^25 FLOP — systemic risk presumed; Article 55 applies and the Commission must be notified within 2 weeks (Art 52).");
  }
  if (systemicRisk === "possible_by_designation" || (isGpaiProvider && systemicRisk === "unknown")) {
    keyUncertainties.push(
      "Systemic-risk status beyond the FLOP presumption is Commission-discretionary (Art 51(1)(b), Annex XIII — capabilities, user base, scalability, autonomy) — surfaced as uncertainty, not a hard rule."
    );
  }
  if (openSourcePartialExemption) {
    positiveIndicators.push("Open-source partial exemption from Annex XI/XII documentation — copyright policy and training-content summary still apply; exemption void if systemic risk.");
  }
  if (isGpaiProvider && answers.gpai_q8 !== "Yes") {
    negativeIndicators.push("EU copyright-compliance policy and/or public training-content summary not (fully) in place — Art 53(1)(c)/(d) bind all GPAI providers, including open-source.");
  }
  if (isDownstreamConsumer) {
    positiveIndicators.push("Downstream consumer of a third-party GPAI model — entitled to Annex XII information and cooperation from the upstream provider.");
    if (annexXiiInfoReceived === "No" || annexXiiInfoReceived === "Partly") {
      negativeIndicators.push("Annex XII downstream information not (fully) received from the upstream provider — supply-chain evidence gap (feeds Module 12).");
    }
  }
  if (emitsModule9Trigger) {
    keyUncertainties.push("Fine-tuning/substantial modification of a third-party GPAI model may convert the organisation into provider of the modified model — evaluated in Module 9 (whether the modification compute crosses the Art 55 threshold is a further uncertainty).");
  }
  if (gpaiInHighRiskContext) {
    keyUncertainties.push("GPAI is integrated into a potentially high-risk system — full high-risk classification is Module 7; the high-risk provider depends on model-provider cooperation (Art 25(4)).");
  }

  // Confidence scoring per spec.
  let score = 100;
  for (const k of ["gpai_q1", "gpai_q2", "gpai_q5"]) {
    if (notSure(answers, k)) score -= 15;
  }
  const largeModelHint = isGpaiProvider || isDownstreamConsumer;
  if (largeModelHint && (notSure(answers, "gpai_q3") || (isGpaiProvider && notSure(answers, "gpai_q2")))) score -= 25;
  if (isDownstreamConsumer && (!annexXiiInfoReceived || annexXiiInfoReceived === "Not sure")) {
    score -= 20;
    missingFields.push("annex_xii_information_received");
    recommendedNextQuestions.push("Request the Annex XII downstream documentation from the model provider.");
  }
  let missing = 0;
  if (isGpaiProvider && !answered(answers, "gpai_q2")) { missingFields.push("training_compute_flop"); missing += 1; }
  if (isGpaiProvider && !answered(answers, "gpai_q3")) { missingFields.push("systemic_risk_designation_status"); missing += 1; }
  if (isDownstreamConsumer && !answered(answers, "gpai_q6")) { missingFields.push("fine_tuning_compute / modification status"); missing += 1; }
  if (!answered(answers, "gpai_q1")) { missingFields.push("gpai_provider_status"); missing += 1; }
  score -= Math.min(missing * 10, 40);
  if (yes(answers, "gpai_q4") && (systemicRisk === "presumed_by_compute" || systemicRisk === "possible_by_designation")) {
    score -= 15;
    keyUncertainties.push("Open-source release claimed alongside systemic-risk indications — the Art 53(2) exemption is void for systemic-risk models (contradiction to resolve).");
  }
  const confidenceScore = clampScore(score);

  if (isGpaiProvider && notSure(answers, "gpai_q2")) {
    keyUncertainties.push("Training compute (FLOP) is often undisclosed — check provider/vendor documentation.");
    recommendedNextQuestions.push("Obtain the cumulative training compute figure from model documentation.");
  }

  const statusText: Record<GpaiStatus, string> = {
    likely_gpai_provider: "Likely GPAI model provider — Article 53 duties apply" + (systemicRisk === "presumed_by_compute" ? " plus Article 55 (systemic risk presumed by compute)" : ""),
    possibly_systemic_risk_needs_review: "GPAI provider with possible systemic-risk designation — needs review",
    downstream_consumer: "Downstream consumer of a third-party GPAI model — Annex XII information-flow reliance",
    gpai_in_high_risk_context: "GPAI model integrated into a potentially high-risk system — cross-module dependency flagged",
    likely_not_gpai: "No GPAI provider or downstream role indicated",
    insufficient_information: "Insufficient information to determine the GPAI role",
  };

  return {
    status,
    confidenceScore,
    confidenceLabel: confidenceLabelFor(confidenceScore),
    reasoningSummary: statusText[status] + (fired.length > 0 ? ` Rules fired: ${fired.join(", ")}.` : ""),
    positiveIndicators,
    negativeIndicators,
    keyUncertainties,
    missingFields,
    recommendedNextQuestions,
    firedRules,
    isGpaiProvider,
    systemicRisk,
    isDownstreamConsumer,
    gpaiInHighRiskContext,
    openSourcePartialExemption,
    annexXiiInfoReceived,
    emitsModule9Trigger,
    roleConditionalObligation: {
      gpaiModelProvider:
        "Art 53 (+ Art 55 if systemic; + Art 54 EU authorised representative if established outside the EU).",
      downstreamProviderDeployer:
        "Rely on Annex XII information; no Art 53 model-provider duties unless converted by modification (Art 25).",
      modifierFineTuner: "May inherit Art 53 (scoped to the change) via Art 25 — re-evaluate in Module 9.",
    },
    registrationNote:
      "GPAI providers do NOT register in the Annex VIII high-risk database, but systemic-risk providers must notify the Commission within 2 weeks (Art 52); if the GPAI is embedded in a high-risk system, Art 49/Annex VIII applies at the system level.",
    notHighRiskDocumentationFlag: isDownstreamConsumer && !gpaiInHighRiskContext,
    sourceVersionDate: SOURCE_VERSION_DATE,
  };
}
