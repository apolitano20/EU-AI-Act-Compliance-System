import type { AISystem, Prisma } from "../generated/prisma/client";
import {
  AFFECTED_PERSONS,
  BUILD_TYPES,
  BUSINESS_FUNCTIONS,
  DATA_TYPES,
  DECISION_LOGIC_TYPES,
  DEPLOYMENT_CONTEXTS,
  IMPACT_IF_WRONG,
  OUTPUT_TYPES,
  RISK_DOMAIN_FLAGS,
  STATUSES,
  SYSTEM_TYPES,
  USER_GROUPS,
  YES_NO_NOT_SURE,
  YES_NO_NOT_SURE_NA,
} from "./options";
import type { AISystemFormData } from "./schema";

export const ARRAY_FIELDS = [
  "countriesUsed",
  "users",
  "affectedPersons",
  "outputTypes",
  "systemTypes",
  "dataTypes",
  "riskDomainFlags",
] as const satisfies readonly (keyof AISystemFormData)[];

type ArrayFieldName = (typeof ARRAY_FIELDS)[number];
type ArrayFieldValue<K extends ArrayFieldName> = NonNullable<NormalizedAISystemFormData[K]>;

type SingleOptionFieldName =
  | "businessFunction"
  | "status"
  | "outputsUsedInEu"
  | "deploymentContext"
  | "affectsDecisionsAboutPeople"
  | "humanReviewOrOverride"
  | "impactIfWrong"
  | "decisionLogicType"
  | "learnedParametersUsedInProduction"
  | "usesGpaiOrLlm"
  | "usesRag"
  | "canCallToolsOrApis"
  | "canTakeActions"
  | "generatesContent"
  | "interactsDirectlyWithPeople"
  | "usesPersonalData"
  | "usesSensitiveData"
  | "profilesIndividuals"
  | "buildType"
  | "brandedUnderOrganisationName"
  | "vendorBrandVisible"
  | "modifiedFineTunedRebrandedOrRepurposed";

export type NormalizedAISystemFormData = Omit<AISystemFormData, ArrayFieldName> & {
  [K in ArrayFieldName]-?: NonNullable<AISystemFormData[K]>;
};

export type AISystemMutationData = Omit<
  Prisma.AISystemCreateInput,
  "id" | "createdAt" | "updatedAt" | "roleAssessment" | "moduleAssessments"
>;

type AISystemLike = Partial<Record<keyof AISystemFormData, unknown>>;

const ARRAY_FIELD_SET = new Set<string>(ARRAY_FIELDS);

const LEGACY_RISK_FLAG_MAP: Record<string, string> = {
  Compliance: "Compliance or regulatory support",
};

const SINGLE_VALUE_OPTIONS = {
  businessFunction: BUSINESS_FUNCTIONS,
  status: STATUSES,
  outputsUsedInEu: YES_NO_NOT_SURE,
  deploymentContext: DEPLOYMENT_CONTEXTS,
  affectsDecisionsAboutPeople: YES_NO_NOT_SURE,
  humanReviewOrOverride: YES_NO_NOT_SURE_NA,
  impactIfWrong: IMPACT_IF_WRONG,
  decisionLogicType: DECISION_LOGIC_TYPES,
  learnedParametersUsedInProduction: YES_NO_NOT_SURE_NA,
  usesGpaiOrLlm: YES_NO_NOT_SURE,
  usesRag: YES_NO_NOT_SURE,
  canCallToolsOrApis: YES_NO_NOT_SURE,
  canTakeActions: YES_NO_NOT_SURE,
  generatesContent: YES_NO_NOT_SURE,
  interactsDirectlyWithPeople: YES_NO_NOT_SURE,
  usesPersonalData: YES_NO_NOT_SURE,
  usesSensitiveData: YES_NO_NOT_SURE,
  profilesIndividuals: YES_NO_NOT_SURE,
  buildType: BUILD_TYPES,
  brandedUnderOrganisationName: YES_NO_NOT_SURE,
  vendorBrandVisible: YES_NO_NOT_SURE,
  modifiedFineTunedRebrandedOrRepurposed: YES_NO_NOT_SURE,
} as const satisfies Record<SingleOptionFieldName, readonly string[]>;

const ARRAY_VALUE_OPTIONS = {
  users: USER_GROUPS,
  affectedPersons: AFFECTED_PERSONS,
  outputTypes: OUTPUT_TYPES,
  systemTypes: SYSTEM_TYPES,
  dataTypes: DATA_TYPES,
  riskDomainFlags: RISK_DOMAIN_FLAGS,
} as const satisfies Partial<Record<ArrayFieldName, readonly string[]>>;


function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function normalizeRequiredString(value: unknown): string {
  return normalizeOptionalString(value) ?? "";
}

function parseArrayCandidate(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
    if (typeof parsed === "string") {
      return [parsed];
    }
  } catch {
    // Fall through to best-effort parsing.
  }

  return trimmed.includes(",") ? trimmed.split(",") : [trimmed];
}

function canonicalizeRiskFlag(value: string): string {
  return LEGACY_RISK_FLAG_MAP[value] ?? value;
}

function normalizeOptionValue<const T extends readonly string[]>(
  value: unknown,
  options: T
): T[number] | undefined {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return undefined;
  return options.includes(normalized) ? (normalized as T[number]) : undefined;
}

export function isArrayField(field: string): field is ArrayFieldName {
  return ARRAY_FIELD_SET.has(field);
}

export function normalizeArrayField<K extends ArrayFieldName>(
  field: K,
  value: unknown
): ArrayFieldValue<K> {
  const allowedValues = (
    field in ARRAY_VALUE_OPTIONS
      ? ARRAY_VALUE_OPTIONS[field as keyof typeof ARRAY_VALUE_OPTIONS]
      : undefined
  ) as readonly string[] | undefined;
  const result: string[] = [];
  const seen = new Set<string>();

  for (const entry of parseArrayCandidate(value)) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const candidate = field === "riskDomainFlags" ? canonicalizeRiskFlag(trimmed) : trimmed;
    if (allowedValues && !allowedValues.includes(candidate)) continue;
    if (seen.has(candidate)) continue;

    seen.add(candidate);
    result.push(candidate);
  }

  return result as ArrayFieldValue<K>;
}

export function serializeArrayField(field: ArrayFieldName, value: unknown): string | null {
  const normalized = normalizeArrayField(field, value);
  return normalized.length > 0 ? JSON.stringify(normalized) : null;
}

export function normalizeAISystemLike(data: AISystemLike): NormalizedAISystemFormData {
  return {
    systemName: normalizeRequiredString(data.systemName),
    shortDescription: normalizeRequiredString(data.shortDescription),
    businessFunction: normalizeOptionValue(data.businessFunction, SINGLE_VALUE_OPTIONS.businessFunction),
    businessOwner: normalizeOptionalString(data.businessOwner),
    technicalOwner: normalizeOptionalString(data.technicalOwner),
    status: normalizeOptionValue(data.status, SINGLE_VALUE_OPTIONS.status),
    countriesUsed: normalizeArrayField("countriesUsed", data.countriesUsed),
    outputsUsedInEu: normalizeOptionValue(data.outputsUsedInEu, SINGLE_VALUE_OPTIONS.outputsUsedInEu),
    users: normalizeArrayField("users", data.users),
    affectedPersons: normalizeArrayField("affectedPersons", data.affectedPersons),
    deploymentContext: normalizeOptionValue(data.deploymentContext, SINGLE_VALUE_OPTIONS.deploymentContext),
    outputTypes: normalizeArrayField("outputTypes", data.outputTypes),
    affectsDecisionsAboutPeople: normalizeOptionValue(
      data.affectsDecisionsAboutPeople,
      SINGLE_VALUE_OPTIONS.affectsDecisionsAboutPeople
    ),
    humanReviewOrOverride: normalizeOptionValue(
      data.humanReviewOrOverride,
      SINGLE_VALUE_OPTIONS.humanReviewOrOverride
    ),
    impactIfWrong: normalizeOptionValue(data.impactIfWrong, SINGLE_VALUE_OPTIONS.impactIfWrong),
    useCaseNotes: normalizeOptionalString(data.useCaseNotes),
    systemTypes: normalizeArrayField("systemTypes", data.systemTypes),
    decisionLogicType: normalizeOptionValue(data.decisionLogicType, SINGLE_VALUE_OPTIONS.decisionLogicType),
    learnedParametersUsedInProduction: normalizeOptionValue(
      data.learnedParametersUsedInProduction,
      SINGLE_VALUE_OPTIONS.learnedParametersUsedInProduction
    ),
    underlyingModelOrTool: normalizeOptionalString(data.underlyingModelOrTool),
    modelProvider: normalizeOptionalString(data.modelProvider),
    usesGpaiOrLlm: normalizeOptionValue(data.usesGpaiOrLlm, SINGLE_VALUE_OPTIONS.usesGpaiOrLlm),
    usesRag: normalizeOptionValue(data.usesRag, SINGLE_VALUE_OPTIONS.usesRag),
    canCallToolsOrApis: normalizeOptionValue(data.canCallToolsOrApis, SINGLE_VALUE_OPTIONS.canCallToolsOrApis),
    canTakeActions: normalizeOptionValue(data.canTakeActions, SINGLE_VALUE_OPTIONS.canTakeActions),
    generatesContent: normalizeOptionValue(data.generatesContent, SINGLE_VALUE_OPTIONS.generatesContent),
    interactsDirectlyWithPeople: normalizeOptionValue(
      data.interactsDirectlyWithPeople,
      SINGLE_VALUE_OPTIONS.interactsDirectlyWithPeople
    ),
    usesPersonalData: normalizeOptionValue(data.usesPersonalData, SINGLE_VALUE_OPTIONS.usesPersonalData),
    usesSensitiveData: normalizeOptionValue(data.usesSensitiveData, SINGLE_VALUE_OPTIONS.usesSensitiveData),
    profilesIndividuals: normalizeOptionValue(data.profilesIndividuals, SINGLE_VALUE_OPTIONS.profilesIndividuals),
    dataTypes: normalizeArrayField("dataTypes", data.dataTypes),
    dataNotes: normalizeOptionalString(data.dataNotes),
    buildType: normalizeOptionValue(data.buildType, SINGLE_VALUE_OPTIONS.buildType),
    vendorName: normalizeOptionalString(data.vendorName),
    vendorCountry: normalizeOptionalString(data.vendorCountry),
    modelProviderName: normalizeOptionalString(data.modelProviderName),
    modelProviderCountry: normalizeOptionalString(data.modelProviderCountry),
    brandedUnderOrganisationName: normalizeOptionValue(
      data.brandedUnderOrganisationName,
      SINGLE_VALUE_OPTIONS.brandedUnderOrganisationName
    ),
    vendorBrandVisible: normalizeOptionValue(data.vendorBrandVisible, SINGLE_VALUE_OPTIONS.vendorBrandVisible),
    modifiedFineTunedRebrandedOrRepurposed: normalizeOptionValue(
      data.modifiedFineTunedRebrandedOrRepurposed,
      SINGLE_VALUE_OPTIONS.modifiedFineTunedRebrandedOrRepurposed
    ),
    supplyChainNotes: normalizeOptionalString(data.supplyChainNotes),
    riskDomainFlags: normalizeArrayField("riskDomainFlags", data.riskDomainFlags),
  };
}

export function toAISystemMutationData(
  data: NormalizedAISystemFormData,
  completenessScore: number
): AISystemMutationData {
  return {
    systemName: data.systemName,
    shortDescription: data.shortDescription,
    businessFunction: data.businessFunction ?? null,
    businessOwner: data.businessOwner ?? null,
    technicalOwner: data.technicalOwner ?? null,
    status: data.status ?? null,
    countriesUsed: serializeArrayField("countriesUsed", data.countriesUsed),
    outputsUsedInEu: data.outputsUsedInEu ?? null,
    users: serializeArrayField("users", data.users),
    affectedPersons: serializeArrayField("affectedPersons", data.affectedPersons),
    deploymentContext: data.deploymentContext ?? null,
    outputTypes: serializeArrayField("outputTypes", data.outputTypes),
    affectsDecisionsAboutPeople: data.affectsDecisionsAboutPeople ?? null,
    humanReviewOrOverride: data.humanReviewOrOverride ?? null,
    impactIfWrong: data.impactIfWrong ?? null,
    useCaseNotes: data.useCaseNotes ?? null,
    systemTypes: serializeArrayField("systemTypes", data.systemTypes),
    decisionLogicType: data.decisionLogicType ?? null,
    learnedParametersUsedInProduction: data.learnedParametersUsedInProduction ?? null,
    underlyingModelOrTool: data.underlyingModelOrTool ?? null,
    modelProvider: data.modelProvider ?? null,
    usesGpaiOrLlm: data.usesGpaiOrLlm ?? null,
    usesRag: data.usesRag ?? null,
    canCallToolsOrApis: data.canCallToolsOrApis ?? null,
    canTakeActions: data.canTakeActions ?? null,
    generatesContent: data.generatesContent ?? null,
    interactsDirectlyWithPeople: data.interactsDirectlyWithPeople ?? null,
    usesPersonalData: data.usesPersonalData ?? null,
    usesSensitiveData: data.usesSensitiveData ?? null,
    profilesIndividuals: data.profilesIndividuals ?? null,
    dataTypes: serializeArrayField("dataTypes", data.dataTypes),
    dataNotes: data.dataNotes ?? null,
    buildType: data.buildType ?? null,
    vendorName: data.vendorName ?? null,
    vendorCountry: data.vendorCountry ?? null,
    modelProviderName: data.modelProviderName ?? null,
    modelProviderCountry: data.modelProviderCountry ?? null,
    brandedUnderOrganisationName: data.brandedUnderOrganisationName ?? null,
    vendorBrandVisible: data.vendorBrandVisible ?? null,
    modifiedFineTunedRebrandedOrRepurposed: data.modifiedFineTunedRebrandedOrRepurposed ?? null,
    supplyChainNotes: data.supplyChainNotes ?? null,
    riskDomainFlags: serializeArrayField("riskDomainFlags", data.riskDomainFlags),
    completenessScore,
  };
}

export function hasAISystemMutationChanges(
  system: Partial<AISystem>,
  mutationData: AISystemMutationData
): boolean {
  return (Object.keys(mutationData) as (keyof AISystemMutationData)[]).some((field) => {
    const currentValue = system[field] ?? null;
    const nextValue = mutationData[field] ?? null;
    return currentValue !== nextValue;
  });
}
