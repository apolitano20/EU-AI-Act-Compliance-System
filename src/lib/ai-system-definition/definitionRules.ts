// Deterministic EU AI Act "AI system" definition-gate rules (Module 3).
// Pure functions over Module 1 inventory data — no LLM reasoning, no new
// questionnaire. Every output here is derived from existing AISystem fields.

import type { NormalizedAISystemFormData } from "../ai-system-data";

export type AiDefinitionClassification =
  | "likely_ai_system"
  | "possible_ai_system_needs_review"
  | "likely_not_ai_system"
  | "insufficient_information";

export type ConfidenceLabel = "high" | "medium" | "low" | "insufficient_information";

export interface AiDefinitionAssessment {
  classification: AiDefinitionClassification;
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  reasoningSummary: string;
  positiveIndicators: string[];
  negativeIndicators: string[];
  keyUncertainties: string[];
  missingFields: string[];
  recommendedNextQuestions: string[];
  evidenceUsed: {
    outputTypes?: string[];
    systemTypes?: string[];
    decisionLogicType?: string;
    learnedParametersUsedInProduction?: string;
    usesGpaiOrLlm?: string;
    usesRag?: string;
    canCallToolsOrApis?: string;
    canTakeActions?: string;
    generatesContent?: string;
    affectsDecisionsAboutPeople?: string;
    deploymentContext?: string;
    profilesIndividuals?: string;
    underlyingModelOrTool?: string;
  };
}

// System-type values that are themselves strong AI-technology signals.
export const STRONG_AI_SYSTEM_TYPES = [
  "Machine learning model", "Generative AI", "General-purpose AI / foundation model",
  "RAG system", "Agentic workflow", "Chatbot", "Recommender system", "Biometric system",
] as const;

// Output-type values that indicate the system infers rather than just displays data.
export const AI_OUTPUT_TYPES = [
  "Prediction", "Score", "Classification", "Recommendation", "Ranking",
  "Decision", "Text content", "Image / audio / video content", "Summary",
  "Action in another system",
] as const;

export const MODEL_BASED_DECISION_LOGIC = [
  "Statistical model with estimated coefficients",
  "Machine learning model trained on data",
  "General-purpose AI / LLM",
  "Hybrid: rules plus model",
] as const;

// The 10 fields the gate needs an answer for (spec §Essential fields).
export const ESSENTIAL_FIELDS = [
  "outputTypes", "systemTypes", "decisionLogicType", "learnedParametersUsedInProduction",
  "usesGpaiOrLlm", "usesRag", "generatesContent", "canCallToolsOrApis",
  "canTakeActions", "affectsDecisionsAboutPeople",
] as const satisfies readonly (keyof NormalizedAISystemFormData)[];

type EssentialField = (typeof ESSENTIAL_FIELDS)[number];

const ESSENTIAL_FIELD_LABELS: Record<EssentialField, string> = {
  outputTypes: "output type",
  systemTypes: "system type",
  decisionLogicType: "decision logic",
  learnedParametersUsedInProduction: "production use of learned parameters",
  usesGpaiOrLlm: "GPAI/LLM use",
  usesRag: "RAG use",
  generatesContent: "content generation",
  canCallToolsOrApis: "tool/API-calling capability",
  canTakeActions: "action-taking capability",
  affectsDecisionsAboutPeople: "impact on decisions about people",
};

function isYes(v?: string): boolean {
  return v === "Yes";
}
function isNo(v?: string): boolean {
  return v === "No";
}
function isArrayMissing(v: readonly string[] | undefined): boolean {
  return !v || v.length === 0 || (v.length === 1 && v[0] === "Not sure");
}
function isValueMissing(v?: string): boolean {
  return v == null || v === "Not sure";
}

function isFieldMissing(system: NormalizedAISystemFormData, field: EssentialField): boolean {
  if (field === "outputTypes" || field === "systemTypes") {
    return isArrayMissing(system[field]);
  }
  return isValueMissing(system[field]);
}

export function getMissingAiDefinitionFields(system: NormalizedAISystemFormData): string[] {
  return ESSENTIAL_FIELDS.filter((f) => isFieldMissing(system, f)).map((f) => ESSENTIAL_FIELD_LABELS[f]);
}

function hasStrongAiSystemType(system: NormalizedAISystemFormData): boolean {
  return (system.systemTypes ?? []).some((t) => (STRONG_AI_SYSTEM_TYPES as readonly string[]).includes(t));
}
function hasAiOutputType(system: NormalizedAISystemFormData): boolean {
  return (system.outputTypes ?? []).some((t) => (AI_OUTPUT_TYPES as readonly string[]).includes(t));
}
function isOnlyRulesEngine(system: NormalizedAISystemFormData): boolean {
  const types = system.systemTypes ?? [];
  return types.length > 0 && types.every((t) => t === "Deterministic rules engine");
}
function isModelBasedDecisionLogic(system: NormalizedAISystemFormData): boolean {
  return !!system.decisionLogicType && (MODEL_BASED_DECISION_LOGIC as readonly string[]).includes(system.decisionLogicType);
}
// systemTypes includes both a deterministic-only marker and a model-based type.
function hasSystemTypeContradiction(system: NormalizedAISystemFormData): boolean {
  const types = system.systemTypes ?? [];
  if (!types.includes("Deterministic rules engine")) return false;
  return types.some((t) => t !== "Deterministic rules engine" && t !== "Not sure" && t !== "Other");
}
// Fully hand-written rules paired with a model-based signal elsewhere.
function hasHandWrittenVsModelContradiction(system: NormalizedAISystemFormData): boolean {
  if (system.decisionLogicType !== "Fully hand-written business rules") return false;
  return isYes(system.learnedParametersUsedInProduction) || hasStrongAiSystemType(system) || isModelBasedDecisionLogic(system);
}

export function calculateAiDefinitionScore(system: NormalizedAISystemFormData): number {
  let score = 50;

  if (hasStrongAiSystemType(system)) score += 20;
  if (hasAiOutputType(system)) score += 15;
  if (isModelBasedDecisionLogic(system)) score += 20;
  if (isYes(system.learnedParametersUsedInProduction)) score += 15;
  if (isYes(system.usesGpaiOrLlm)) score += 15;
  if (isYes(system.usesRag)) score += 15;
  if (isYes(system.generatesContent)) score += 10;
  if (isYes(system.canCallToolsOrApis)) score += 10;
  if (isYes(system.canTakeActions)) score += 10;
  if (isYes(system.affectsDecisionsAboutPeople) || isYes(system.profilesIndividuals)) score += 10;

  if (system.decisionLogicType === "Fully hand-written business rules") score -= 25;
  if (isOnlyRulesEngine(system)) score -= 20;
  if (isNo(system.learnedParametersUsedInProduction) || system.learnedParametersUsedInProduction === "Not applicable") score -= 15;
  if (isNo(system.usesGpaiOrLlm)) score -= 10;
  if (isNo(system.usesRag)) score -= 10;
  if (isNo(system.generatesContent)) score -= 10;
  if (isNo(system.canCallToolsOrApis) && isNo(system.canTakeActions)) score -= 10;

  const missingCount = ESSENTIAL_FIELDS.filter((f) => isFieldMissing(system, f)).length;
  score -= Math.min(missingCount * 10, 40);

  if (hasSystemTypeContradiction(system) || hasHandWrittenVsModelContradiction(system)) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function confidenceLabelFor(score: number): ConfidenceLabel {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  if (score >= 20) return "low";
  return "insufficient_information";
}

function inBusinessOrOperationalContext(system: NormalizedAISystemFormData): boolean {
  return (!!system.deploymentContext && system.deploymentContext !== "Not sure")
    || system.status === "Production" || system.status === "Pilot";
}

function ruleA1(system: NormalizedAISystemFormData): boolean {
  return hasStrongAiSystemType(system) && hasAiOutputType(system);
}
function ruleA2(system: NormalizedAISystemFormData): boolean {
  return isModelBasedDecisionLogic(system) && isYes(system.learnedParametersUsedInProduction);
}
function ruleA3(system: NormalizedAISystemFormData): boolean {
  return (isYes(system.usesGpaiOrLlm) || isYes(system.usesRag) || isYes(system.generatesContent))
    && inBusinessOrOperationalContext(system);
}
function ruleA4(system: NormalizedAISystemFormData): boolean {
  return isYes(system.canCallToolsOrApis) && isYes(system.canTakeActions)
    && ((system.systemTypes ?? []).includes("Agentic workflow") || (system.systemTypes ?? []).includes("General-purpose AI / foundation model"));
}

function hasStrongObviousIndicator(system: NormalizedAISystemFormData): boolean {
  if (isYes(system.usesGpaiOrLlm) || isYes(system.usesRag)) return true;
  const strongObviousTypes = ["Machine learning model", "Generative AI", "General-purpose AI / foundation model", "Agentic workflow", "Chatbot", "Recommender system", "Biometric system"];
  return (system.systemTypes ?? []).some((t) => strongObviousTypes.includes(t));
}

// "Likely not an AI system" negative checks (spec §C) — majority of these true.
function negativeChecks(system: NormalizedAISystemFormData): boolean[] {
  return [
    isOnlyRulesEngine(system),
    system.decisionLogicType === "Fully hand-written business rules",
    isNo(system.learnedParametersUsedInProduction) || system.learnedParametersUsedInProduction === "Not applicable",
    isNo(system.usesGpaiOrLlm),
    isNo(system.usesRag),
    isNo(system.canCallToolsOrApis),
    isNo(system.canTakeActions),
    isNo(system.generatesContent),
    !hasAiOutputType(system),
  ];
}

export function classifyAiSystemDefinition(system: NormalizedAISystemFormData): AiDefinitionClassification {
  const missingCount = ESSENTIAL_FIELDS.filter((f) => isFieldMissing(system, f)).length;

  if (missingCount >= 5 && !hasStrongObviousIndicator(system)) {
    return "insufficient_information";
  }

  // A system flagged as both a deterministic rules engine and a model-based type
  // is contradictory by definition — always needs review, never "likely" outright
  // (spec §B: "systemTypes includes Deterministic rules engine plus ML/Statistical/...").
  if (hasSystemTypeContradiction(system) || hasHandWrittenVsModelContradiction(system)) {
    return "possible_ai_system_needs_review";
  }

  if (ruleA1(system) || ruleA2(system) || ruleA3(system) || ruleA4(system)) {
    return "likely_ai_system";
  }

  const negatives = negativeChecks(system);
  const negativeCount = negatives.filter(Boolean).length;
  if (negativeCount >= 6) {
    return "likely_not_ai_system";
  }

  return "possible_ai_system_needs_review";
}

export function getPositiveIndicators(system: NormalizedAISystemFormData): string[] {
  const indicators: string[] = [];
  const outputs = system.outputTypes ?? [];

  if (outputs.some((t) => ["Prediction", "Score", "Classification", "Recommendation", "Ranking", "Decision", "Action in another system"].includes(t))) {
    indicators.push("Produces predictions, scores, classifications, recommendations, rankings, decisions, or actions");
  }
  if (outputs.some((t) => ["Text content", "Image / audio / video content", "Summary"].includes(t)) || isYes(system.generatesContent)) {
    indicators.push("Generates text, image, audio, video, summaries, or other content");
  }
  if (hasStrongAiSystemType(system) || system.systemTypes?.includes("Statistical model") || isModelBasedDecisionLogic(system) || isYes(system.usesGpaiOrLlm) || isYes(system.usesRag)) {
    indicators.push("Uses machine learning, statistical modelling, GPAI/LLM, RAG, or agentic workflow");
  }
  if (isYes(system.learnedParametersUsedInProduction)) {
    indicators.push("Uses learned, estimated, trained, or calibrated parameters in production");
  }
  if (isYes(system.canCallToolsOrApis)) {
    indicators.push("Can call tools, APIs, databases, or software systems");
  }
  if (isYes(system.canTakeActions)) {
    indicators.push("Can take actions in another system");
  }
  if (isYes(system.affectsDecisionsAboutPeople)) {
    indicators.push("Influences decisions about people");
  }
  if (isYes(system.profilesIndividuals)) {
    indicators.push("Profiles individuals");
  }

  return indicators;
}

export function getNegativeIndicators(system: NormalizedAISystemFormData): string[] {
  const indicators: string[] = [];

  if (system.decisionLogicType === "Fully hand-written business rules") {
    indicators.push("Decision logic appears to be fully hand-written");
  }
  if (isOnlyRulesEngine(system)) {
    indicators.push("System is marked as deterministic rules engine only");
  }
  if (isNo(system.learnedParametersUsedInProduction) || system.learnedParametersUsedInProduction === "Not applicable") {
    indicators.push("No learned or trained parameters are used in production");
  }
  if (isNo(system.usesGpaiOrLlm) && isNo(system.usesRag)) {
    indicators.push("No GPAI/LLM or RAG use indicated");
  }
  if (isNo(system.generatesContent)) {
    indicators.push("No generated content indicated");
  }
  if (isNo(system.canCallToolsOrApis) && isNo(system.canTakeActions)) {
    indicators.push("No tool-calling or action-taking capability indicated");
  }

  return indicators;
}

export function getAiDefinitionUncertainties(system: NormalizedAISystemFormData): string[] {
  const uncertainties: string[] = [];

  if (isValueMissing(system.decisionLogicType)) {
    uncertainties.push("Unclear whether the system infers outputs from data or only applies fixed rules.");
  }
  if (isValueMissing(system.learnedParametersUsedInProduction)) {
    uncertainties.push("Unclear whether learned, estimated, or trained parameters are used in production.");
  }
  if (isArrayMissing(system.outputTypes)) {
    uncertainties.push("Unclear what type of output the system produces.");
  }
  if (hasSystemTypeContradiction(system) || hasHandWrittenVsModelContradiction(system)) {
    uncertainties.push("System appears both deterministic and model-based; review needed.");
  }
  if (system.underlyingModelOrTool && (isValueMissing(system.decisionLogicType) || isArrayMissing(system.systemTypes) || isValueMissing(system.usesGpaiOrLlm))) {
    uncertainties.push("Underlying model or tool suggests AI/ML, but structured technical fields are incomplete.");
  }

  return uncertainties;
}

export function getRecommendedAiDefinitionQuestions(system: NormalizedAISystemFormData): string[] {
  const questions: string[] = [];

  if (isValueMissing(system.decisionLogicType)) {
    questions.push("Confirm whether the scoring logic is trained, estimated, calibrated, or manually configured.");
  }
  if (isValueMissing(system.learnedParametersUsedInProduction)) {
    questions.push("Confirm whether learned or estimated parameters are used directly in production.");
  }
  if (system.underlyingModelOrTool && (isValueMissing(system.decisionLogicType) || isArrayMissing(system.systemTypes) || isValueMissing(system.usesGpaiOrLlm))) {
    questions.push("Check vendor documentation for references to machine learning, AI, NLP, generative AI, model training, or automated decisioning.");
  }
  if (hasSystemTypeContradiction(system) || isArrayMissing(system.systemTypes)) {
    questions.push("Confirm whether the system only follows fixed if/then rules.");
  }
  if (isValueMissing(system.affectsDecisionsAboutPeople) || !system.deploymentContext || system.deploymentContext === "Not sure") {
    questions.push("Confirm whether outputs influence a human decision, business process, user experience, or downstream system.");
  }

  return questions;
}

function joinClauses(clauses: string[]): string {
  if (clauses.length === 0) return "";
  if (clauses.length === 1) return clauses[0];
  return `${clauses.slice(0, -1).join(", ")}, and ${clauses[clauses.length - 1]}`;
}

function buildReasoningSummary(
  classification: AiDefinitionClassification,
  system: NormalizedAISystemFormData,
  negativeIndicators: string[],
  missingFields: string[]
): string {
  if (classification === "likely_ai_system") {
    const clauses: string[] = [];
    if (hasAiOutputType(system)) clauses.push("it produces predictions, scores, classifications, recommendations, or decisions");
    if (hasStrongAiSystemType(system) || isModelBasedDecisionLogic(system)) clauses.push("uses model-based decision logic");
    if (isYes(system.learnedParametersUsedInProduction)) clauses.push("uses learned or estimated parameters in production");
    if (isYes(system.usesGpaiOrLlm) || isYes(system.usesRag)) clauses.push("relies on GPAI/LLM or RAG");
    if (isYes(system.canCallToolsOrApis) && isYes(system.canTakeActions)) clauses.push("can call tools/APIs and take actions in other systems");
    const detail = clauses.length > 0 ? joinClauses(clauses) : "it shows strong AI-system indicators";
    return `This item is likely an AI system because the inventory indicates that ${detail}.`;
  }

  if (classification === "likely_not_ai_system") {
    const detail = negativeIndicators.length > 0
      ? negativeIndicators.map((i) => i[0].toLowerCase() + i.slice(1)).join(", ")
      : "it does not show model-based, learned, or generative indicators";
    return `This item is likely not an AI system because ${detail}.`;
  }

  if (classification === "insufficient_information") {
    const detail = missingFields.length > 0 ? missingFields.join(", ") : "several key technical fields";
    return `There is insufficient information to assess this item because several key fields are missing or marked as not sure, including ${detail}.`;
  }

  // possible_ai_system_needs_review
  return "This item may be an AI system, but review is needed because the inventory shows mixed or ambiguous indicators between rule-based and model-based behaviour.";
}

function undefinedIfEmpty<T extends string>(arr: readonly T[] | undefined): T[] | undefined {
  return arr && arr.length > 0 ? [...arr] : undefined;
}

export function buildAiDefinitionAssessment(system: NormalizedAISystemFormData): AiDefinitionAssessment {
  const classification = classifyAiSystemDefinition(system);
  const confidenceScore = calculateAiDefinitionScore(system);
  const positiveIndicators = getPositiveIndicators(system);
  const negativeIndicators = getNegativeIndicators(system);
  const keyUncertainties = getAiDefinitionUncertainties(system);
  const missingFields = getMissingAiDefinitionFields(system);
  const recommendedNextQuestions = getRecommendedAiDefinitionQuestions(system);

  return {
    classification,
    confidenceScore,
    confidenceLabel: confidenceLabelFor(confidenceScore),
    reasoningSummary: buildReasoningSummary(classification, system, negativeIndicators, missingFields),
    positiveIndicators,
    negativeIndicators,
    keyUncertainties,
    missingFields,
    recommendedNextQuestions,
    evidenceUsed: {
      outputTypes: undefinedIfEmpty(system.outputTypes),
      systemTypes: undefinedIfEmpty(system.systemTypes),
      decisionLogicType: system.decisionLogicType,
      learnedParametersUsedInProduction: system.learnedParametersUsedInProduction,
      usesGpaiOrLlm: system.usesGpaiOrLlm,
      usesRag: system.usesRag,
      canCallToolsOrApis: system.canCallToolsOrApis,
      canTakeActions: system.canTakeActions,
      generatesContent: system.generatesContent,
      affectsDecisionsAboutPeople: system.affectsDecisionsAboutPeople,
      deploymentContext: system.deploymentContext,
      profilesIndividuals: system.profilesIndividuals,
      underlyingModelOrTool: system.underlyingModelOrTool,
    },
  };
}
