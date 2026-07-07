import { z } from "zod";
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

function preprocessOptionalString(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function optionalString() {
  return z.preprocess(preprocessOptionalString, z.string().optional());
}

function optionalStringArray() {
  return z.array(z.string().trim().min(1)).optional();
}

function optionalEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(preprocessOptionalString, z.enum(values).optional());
}

function optionalEnumArray<const T extends readonly [string, ...string[]]>(values: T) {
  return z.array(z.enum(values)).optional();
}

// Shared Zod schema for AISystem — used by wizard (create) and edit page.
export const aiSystemSchema = z.object({
  // Step 1
  systemName:       z.string().trim().min(1, "System name is required"),
  shortDescription: z.string().trim().min(1, "Short description is required"),
  businessFunction: optionalEnum(BUSINESS_FUNCTIONS),
  businessOwner:    optionalString(),
  technicalOwner:   optionalString(),
  status:           optionalEnum(STATUSES),
  countriesUsed:    optionalStringArray(),
  outputsUsedInEu:  optionalEnum(YES_NO_NOT_SURE),

  // Step 2
  users:                      optionalEnumArray(USER_GROUPS),
  affectedPersons:            optionalEnumArray(AFFECTED_PERSONS),
  deploymentContext:          optionalEnum(DEPLOYMENT_CONTEXTS),
  outputTypes:                optionalEnumArray(OUTPUT_TYPES),
  affectsDecisionsAboutPeople: optionalEnum(YES_NO_NOT_SURE),
  humanReviewOrOverride:      optionalEnum(YES_NO_NOT_SURE_NA),
  impactIfWrong:              optionalEnum(IMPACT_IF_WRONG),
  useCaseNotes:               optionalString(),

  // Step 3
  systemTypes:                       optionalEnumArray(SYSTEM_TYPES),
  decisionLogicType:                 optionalEnum(DECISION_LOGIC_TYPES),
  learnedParametersUsedInProduction: optionalEnum(YES_NO_NOT_SURE_NA),
  underlyingModelOrTool:             optionalString(),
  modelProvider:                     optionalString(),
  usesGpaiOrLlm:                     optionalEnum(YES_NO_NOT_SURE),
  usesRag:                           optionalEnum(YES_NO_NOT_SURE),
  canCallToolsOrApis:                optionalEnum(YES_NO_NOT_SURE),
  canTakeActions:                    optionalEnum(YES_NO_NOT_SURE),
  generatesContent:                  optionalEnum(YES_NO_NOT_SURE),
  interactsDirectlyWithPeople:       optionalEnum(YES_NO_NOT_SURE),

  // Step 4
  usesPersonalData:    optionalEnum(YES_NO_NOT_SURE),
  usesSensitiveData:   optionalEnum(YES_NO_NOT_SURE),
  profilesIndividuals: optionalEnum(YES_NO_NOT_SURE),
  dataTypes:           optionalEnumArray(DATA_TYPES),
  dataNotes:           optionalString(),

  // Step 5
  buildType:                              optionalEnum(BUILD_TYPES),
  vendorName:                             optionalString(),
  vendorCountry:                          optionalString(),
  modelProviderName:                      optionalString(),
  modelProviderCountry:                   optionalString(),
  brandedUnderOrganisationName:           optionalEnum(YES_NO_NOT_SURE),
  vendorBrandVisible:                     optionalEnum(YES_NO_NOT_SURE),
  modifiedFineTunedRebrandedOrRepurposed: optionalEnum(YES_NO_NOT_SURE),
  supplyChainNotes:                       optionalString(),

  // Step 6
  riskDomainFlags: optionalEnumArray(RISK_DOMAIN_FLAGS),
}).strict();

export type AISystemFormData = z.infer<typeof aiSystemSchema>;

// Fields that determine the completeness score (spec §Completeness score)
export const REQUIRED_FIELDS: (keyof AISystemFormData)[] = [
  "systemName",
  "shortDescription",
  "businessFunction",
  "status",
  "deploymentContext",
  "buildType",
  "outputTypes",
  "affectsDecisionsAboutPeople",
  "usesPersonalData",
  "usesGpaiOrLlm",
  "riskDomainFlags",
];
