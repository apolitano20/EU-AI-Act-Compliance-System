import assert from "node:assert/strict";

import type { AISystem } from "../generated/prisma/client";
import { normalizeAISystemLike, toAISystemMutationData } from "./ai-system-data";
import { parseAISystemMutationInput } from "./ai-system-write";
import { computeCompleteness } from "./completeness";
import { toCSV } from "./csv";
import type { AISystemFormData } from "./schema";

const validInput: AISystemFormData = {
  systemName: "Example system",
  shortDescription: "Summarizes internal documents for staff.",
  businessFunction: "IT / Engineering",
  status: "Production",
  deploymentContext: "Employee-facing",
  outputTypes: ["Text content"],
  affectsDecisionsAboutPeople: "No",
  usesPersonalData: "No",
  usesGpaiOrLlm: "Yes",
  buildType: "Built internally",
  riskDomainFlags: ["Internal productivity only"],
};

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function createSystem(overrides: Partial<AISystem> = {}): AISystem {
  return {
    id: "system-1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    systemName: "Example system",
    shortDescription: "Summarizes internal documents for staff.",
    businessFunction: "IT / Engineering",
    businessOwner: null,
    technicalOwner: null,
    status: "Production",
    countriesUsed: JSON.stringify(["Germany"]),
    outputsUsedInEu: "Yes",
    users: null,
    affectedPersons: null,
    deploymentContext: "Employee-facing",
    outputTypes: JSON.stringify(["Text content"]),
    affectsDecisionsAboutPeople: "No",
    humanReviewOrOverride: null,
    impactIfWrong: null,
    useCaseNotes: null,
    systemTypes: null,
    decisionLogicType: null,
    learnedParametersUsedInProduction: null,
    underlyingModelOrTool: null,
    modelProvider: null,
    usesGpaiOrLlm: "Yes",
    usesRag: null,
    canCallToolsOrApis: null,
    canTakeActions: null,
    generatesContent: null,
    interactsDirectlyWithPeople: null,
    usesPersonalData: "No",
    usesSensitiveData: null,
    profilesIndividuals: null,
    dataTypes: null,
    dataNotes: null,
    buildType: "Built internally",
    vendorName: null,
    vendorCountry: null,
    modelProviderName: null,
    modelProviderCountry: null,
    brandedUnderOrganisationName: null,
    vendorBrandVisible: null,
    modifiedFineTunedRebrandedOrRepurposed: null,
    supplyChainNotes: null,
    riskDomainFlags: JSON.stringify(["Internal productivity only"]),
    completenessScore: 100,
    ...overrides,
  };
}

runTest("computeCompleteness treats empty required multiselects as missing", () => {
  const result = computeCompleteness(
    normalizeAISystemLike({
      ...validInput,
      outputTypes: "[]",
      riskDomainFlags: "[]",
    })
  );

  assert.equal(result.score, 82);
  assert.deepEqual(result.missingFields.sort(), ["Output types", "Risk-domain flags"]);
});

runTest("parseAISystemMutationInput normalizes data and rejects extra fields", () => {
  const parsed = parseAISystemMutationInput({
    ...validInput,
    systemName: "  Example system  ",
    shortDescription: "  Summarizes internal documents for staff.  ",
    businessOwner: "   ",
    countriesUsed: [" Germany ", "France", "Germany"],
    users: [],
  });

  assert.equal(parsed.normalized.systemName, "Example system");
  assert.equal(parsed.normalized.shortDescription, "Summarizes internal documents for staff.");
  assert.equal(parsed.normalized.businessOwner, undefined);
  assert.deepEqual(parsed.normalized.countriesUsed, ["Germany", "France"]);
  assert.equal(parsed.mutationData.countriesUsed, JSON.stringify(["Germany", "France"]));
  assert.equal(parsed.mutationData.users, null);
  assert.equal(parsed.mutationData.completenessScore, 100);

  assert.throws(
    () => parseAISystemMutationInput({ ...validInput, id: "user-controlled-id" }),
    /unrecognized key/i
  );
});

runTest("toCSV escapes spreadsheet formulas and exports normalized arrays", () => {
  const csv = toCSV([
    createSystem({
      systemName: "=2+2",
      countriesUsed: JSON.stringify(["France", "Germany"]),
      riskDomainFlags: JSON.stringify(["Internal productivity only"]),
    }),
  ]);

  assert.match(csv, /'=2\+2/);
  assert.match(csv, /France; Germany/);
  assert.doesNotMatch(csv, /\["France","Germany"\]/);
});

runTest("legacy risk flags are canonicalized during normalization and repair writes", () => {
  const normalized = normalizeAISystemLike(
    createSystem({
      riskDomainFlags: JSON.stringify(["Compliance"]),
      completenessScore: 0,
    })
  );
  const repaired = toAISystemMutationData(normalized, 0);

  assert.equal(
    repaired.riskDomainFlags,
    JSON.stringify(["Compliance or regulatory support"])
  );
});
