// Self-check for the deterministic role rules. Run: npx tsx src/lib/entity-type/roleRules.test.ts
import assert from "node:assert";
import { assessRole, deriveAnswersFromSystem, type Answers } from "./roleRules";

// Provider + Deployer combo: built internally, own brand, used professionally under our control.
{
  const answers: Answers = {
    builtInternally: "Yes",
    ownNameOrBrand: "Yes",
    usesSystem: "Yes",
    businessOrProfessionalUse: "Yes",
    organisationControlsUse: "Yes",
    madeAvailableOutsideOrganisation: "No",
  };
  const result = assessRole(answers);
  assert(result.likelyRoles.includes("Provider"), "expected Provider");
  assert(result.likelyRoles.includes("Deployer"), "expected Deployer");
  assert(result.confidenceScore > 0);
}

// Importer chain: non-EU provider, org in EU, first EU actor, keeps brand.
{
  const answers: Answers = {
    providerOutsideEu: "Yes",
    organisationInEu: "Yes",
    madeAvailableOutsideOrganisation: "Yes",
    firstEuActorMakingAvailable: "Yes",
    keepsNonEuProviderBrand: "Yes",
    ownNameOrBrand: "No",
  };
  const result = assessRole(answers);
  assert(result.likelyRoles.includes("Importer"), "expected Importer");
  assert(!result.likelyRoles.includes("Provider"), "should not be Provider");
}

// Distributor: standard vendor product, made available, vendor brand visible, not first EU actor.
{
  const answers: Answers = {
    madeAvailableOutsideOrganisation: "Yes",
    standardVendorProduct: "Yes",
    ownNameOrBrand: "No",
    vendorBrandVisible: "Yes",
    firstEuActorMakingAvailable: "No",
  };
  const result = assessRole(answers);
  assert(result.likelyRoles.includes("Distributor"), "expected Distributor");
}

// Article 25 risk flag: fine-tuned a third-party model.
{
  const answers: Answers = { fineTunedOrRetrainedModel: "Yes" };
  const result = assessRole(answers);
  assert(result.article25ProviderConversionRisk === true, "expected Article 25 risk");
  assert(result.flags.some((f) => f.includes("Article 25")), "expected Article 25 flag text");
  assert(!result.likelyRoles.includes("Provider"), "Article 25 risk alone must not classify as Provider");
}

// Confidence bands: fully answered, role triggered -> high; empty answers -> low (no role, key fields unknown);
// all-"Not sure" answers -> insufficient_information.
{
  const highAnswers: Answers = {
    builtInternally: "Yes",
    ownNameOrBrand: "Yes",
    usesSystem: "Yes",
    businessOrProfessionalUse: "Yes",
    organisationControlsUse: "Yes",
    madeAvailableOutsideOrganisation: "No",
  };
  const highResult = assessRole(highAnswers);
  assert(highResult.confidenceLabel === "high", `expected high, got ${highResult.confidenceLabel} (${highResult.confidenceScore})`);

  const emptyResult = assessRole({});
  assert(emptyResult.likelyRoles.length === 0 && emptyResult.possibleRoles.length === 0);
  assert(emptyResult.confidenceScore < 50, `expected empty answers to score below medium, got ${emptyResult.confidenceScore}`);

  const notSureAnswers: Answers = {
    ownNameOrBrand: "Not sure",
    madeAvailableOutsideOrganisation: "Not sure",
    providerOutsideEu: "Not sure",
    builtInternally: "Not sure",
    commissionedForUs: "Not sure",
    standardVendorProduct: "Not sure",
    vendorBrandVisible: "Not sure",
    intendedPurposeDefinedBy: "Not sure",
    usesSystem: "Not sure",
    businessOrProfessionalUse: "Not sure",
  };
  const notSureResult = assessRole(notSureAnswers);
  assert(
    notSureResult.confidenceLabel === "insufficient_information",
    `expected insufficient_information, got ${notSureResult.confidenceLabel} (${notSureResult.confidenceScore})`
  );
}

// Authorised Representative: mandate exists but content unclear -> possible, not likely.
{
  const answers: Answers = { writtenMandateFromNonEuProvider: "Yes", mandateMentionsEuAiActOrRegulatoryObligations: "Not sure" };
  const result = assessRole(answers);
  assert(result.possibleRoles.includes("Authorised Representative"), "expected possible Authorised Representative");
  assert(!result.likelyRoles.includes("Authorised Representative"), "should not be likely");
}

// Inventory seed: a production, internally-built, own-branded, customer-facing system
// should classify as Provider + Deployer straight from inventory, no questionnaire.
{
  const seeded = deriveAnswersFromSystem({
    buildType: "Built internally",
    brandedUnderOrganisationName: "Yes",
    deploymentContext: "Customer-facing",
    status: "Production",
  });
  const result = assessRole(seeded);
  assert(result.likelyRoles.includes("Provider"), "expected Provider from inventory seed");
  assert(result.likelyRoles.includes("Deployer"), "expected Deployer from inventory seed");
  assert(seeded.madeAvailableOutsideOrganisation === "Yes", "customer-facing -> external");
}

// Empty inventory produces no seeded answers (no phantom classification).
assert(Object.keys(deriveAnswersFromSystem({})).length === 0, "empty system seeds nothing");

console.log("roleRules.test.ts: all assertions passed");
