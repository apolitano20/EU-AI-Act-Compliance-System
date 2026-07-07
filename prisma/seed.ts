import { config } from "dotenv";
config();

import { prisma } from "../src/lib/db";
import { parseAISystemMutationInput } from "../src/lib/ai-system-write";
import type { AISystemFormData } from "../src/lib/schema";
import { sanitizeAnswersForModule, type ModuleKey } from "../src/lib/module-registry";
import { getAssessmentBundle } from "../src/lib/assessment-pipeline";
import { generateRemediationItems } from "../src/lib/remediation/remediationRules";

const seeds = [
  {
    systemName: "ChatGPT Enterprise - Internal Drafting",
    shortDescription: "Used by employees to draft internal reports, emails, meeting summaries, and policy documents.",
    businessFunction: "IT / Engineering",
    businessOwner: "IT Department",
    technicalOwner: "IT Department",
    status: "Production",
    countriesUsed: ["United Kingdom", "Germany"],
    outputsUsedInEu: "Yes",
    users: ["Employees"],
    affectedPersons: ["No identifiable individuals"],
    deploymentContext: "Employee-facing",
    outputTypes: ["Text content", "Summary"],
    affectsDecisionsAboutPeople: "No",
    humanReviewOrOverride: "Yes",
    impactIfWrong: "Low impact",
    systemTypes: ["Generative AI", "General-purpose AI / foundation model"],
    decisionLogicType: "General-purpose AI / LLM",
    learnedParametersUsedInProduction: "Yes",
    underlyingModelOrTool: "GPT-4o",
    modelProvider: "OpenAI",
    usesGpaiOrLlm: "Yes",
    usesRag: "No",
    canCallToolsOrApis: "No",
    canTakeActions: "No",
    generatesContent: "Yes",
    interactsDirectlyWithPeople: "Yes",
    usesPersonalData: "No",
    usesSensitiveData: "No",
    profilesIndividuals: "No",
    dataTypes: ["Internal documents"],
    buildType: "Bought/licensed from vendor",
    vendorName: "Microsoft",
    vendorCountry: "United States",
    modelProviderName: "OpenAI",
    modelProviderCountry: "United States",
    brandedUnderOrganisationName: "No",
    vendorBrandVisible: "Yes",
    modifiedFineTunedRebrandedOrRepurposed: "No",
    riskDomainFlags: ["Internal productivity only"],
  },
  {
    systemName: "Customer Support Chatbot",
    shortDescription: "AI-powered chatbot that handles first-line customer queries on the website, including FAQs, order tracking, and complaint triage.",
    businessFunction: "Customer Service",
    businessOwner: "Customer Service Director",
    technicalOwner: "Product Engineering",
    status: "Production",
    countriesUsed: ["United Kingdom", "Ireland", "France"],
    outputsUsedInEu: "Yes",
    users: ["Customers", "Public users"],
    affectedPersons: ["Customers"],
    deploymentContext: "Customer-facing",
    outputTypes: ["Text content", "Recommendation"],
    affectsDecisionsAboutPeople: "No",
    humanReviewOrOverride: "Yes",
    impactIfWrong: "Medium impact",
    systemTypes: ["Chatbot", "Generative AI", "RAG system"],
    decisionLogicType: "General-purpose AI / LLM",
    learnedParametersUsedInProduction: "Yes",
    underlyingModelOrTool: "Claude 3.5 Sonnet",
    modelProvider: "Anthropic",
    usesGpaiOrLlm: "Yes",
    usesRag: "Yes",
    canCallToolsOrApis: "Yes",
    canTakeActions: "No",
    generatesContent: "Yes",
    interactsDirectlyWithPeople: "Yes",
    usesPersonalData: "Yes",
    usesSensitiveData: "No",
    profilesIndividuals: "No",
    dataTypes: ["Customer data", "Transaction data"],
    buildType: "Hybrid: internal plus vendor",
    vendorName: "Intercom",
    vendorCountry: "United States",
    modelProviderName: "Anthropic",
    modelProviderCountry: "United States",
    brandedUnderOrganisationName: "Yes",
    vendorBrandVisible: "No",
    modifiedFineTunedRebrandedOrRepurposed: "Yes",
    riskDomainFlags: ["Customer service or customer interaction"],
  },
  {
    systemName: "Vendor CV Screening Tool",
    shortDescription: "Third-party tool that scores and ranks job applicants based on their CVs before shortlisting for human review.",
    businessFunction: "HR",
    businessOwner: "Head of Talent Acquisition",
    technicalOwner: "HR Systems Team",
    status: "Production",
    countriesUsed: ["United Kingdom"],
    outputsUsedInEu: "No",
    users: ["Employees"],
    affectedPersons: ["Job applicants"],
    deploymentContext: "Internal only",
    outputTypes: ["Score", "Ranking", "Classification"],
    affectsDecisionsAboutPeople: "Yes",
    humanReviewOrOverride: "Yes",
    impactIfWrong: "High impact",
    systemTypes: ["Machine learning model", "Recommender system"],
    decisionLogicType: "Machine learning model trained on data",
    learnedParametersUsedInProduction: "Yes",
    underlyingModelOrTool: "Proprietary ML model",
    modelProvider: "HireVue",
    usesGpaiOrLlm: "No",
    usesRag: "No",
    canCallToolsOrApis: "No",
    canTakeActions: "No",
    generatesContent: "No",
    interactsDirectlyWithPeople: "No",
    usesPersonalData: "Yes",
    usesSensitiveData: "Not sure",
    profilesIndividuals: "Yes",
    dataTypes: ["Candidate / applicant data", "Behavioural data"],
    buildType: "Bought/licensed from vendor",
    vendorName: "HireVue",
    vendorCountry: "United States",
    brandedUnderOrganisationName: "No",
    vendorBrandVisible: "Yes",
    modifiedFineTunedRebrandedOrRepurposed: "No",
    riskDomainFlags: ["Recruitment or hiring"],
  },
  {
    systemName: "Internal Credit Scoring Model",
    shortDescription: "In-house logistic regression model that calculates a credit score for personal loan applicants and triggers automatic decline below a threshold.",
    businessFunction: "Risk",
    businessOwner: "Chief Risk Officer",
    technicalOwner: "Data Science Team",
    status: "Production",
    countriesUsed: ["United Kingdom", "Ireland"],
    outputsUsedInEu: "Yes",
    users: ["Other systems / automated processes"],
    affectedPersons: ["Borrowers / applicants for credit", "Customers"],
    deploymentContext: "Used by other systems",
    outputTypes: ["Score", "Decision"],
    affectsDecisionsAboutPeople: "Yes",
    humanReviewOrOverride: "Yes",
    impactIfWrong: "High impact",
    systemTypes: ["Statistical model", "Machine learning model"],
    decisionLogicType: "Statistical model with estimated coefficients",
    learnedParametersUsedInProduction: "Yes",
    underlyingModelOrTool: "Logistic regression (scikit-learn)",
    modelProvider: "Internal",
    usesGpaiOrLlm: "No",
    usesRag: "No",
    canCallToolsOrApis: "Yes",
    canTakeActions: "Yes",
    generatesContent: "No",
    interactsDirectlyWithPeople: "No",
    usesPersonalData: "Yes",
    usesSensitiveData: "No",
    profilesIndividuals: "Yes",
    dataTypes: ["Customer data", "Financial data", "Transaction data", "Behavioural data"],
    buildType: "Built internally",
    brandedUnderOrganisationName: "Yes",
    vendorBrandVisible: "No",
    modifiedFineTunedRebrandedOrRepurposed: "No",
    riskDomainFlags: ["Creditworthiness, lending, credit scoring, or loan approval"],
  },
  {
    systemName: "Internal Policy RAG Assistant",
    shortDescription: "Internal chatbot that lets employees search and ask questions about HR policies, compliance procedures, and regulatory guidance documents.",
    businessFunction: "Compliance",
    businessOwner: "Head of Compliance",
    technicalOwner: "IT / Engineering",
    status: "Pilot",
    countriesUsed: ["United Kingdom"],
    outputsUsedInEu: "No",
    users: ["Employees"],
    affectedPersons: ["No identifiable individuals"],
    deploymentContext: "Employee-facing",
    outputTypes: ["Text content", "Summary", "Recommendation"],
    affectsDecisionsAboutPeople: "No",
    humanReviewOrOverride: "Yes",
    impactIfWrong: "Medium impact",
    systemTypes: ["RAG system", "Chatbot", "Generative AI"],
    decisionLogicType: "General-purpose AI / LLM",
    learnedParametersUsedInProduction: "Yes",
    underlyingModelOrTool: "GPT-4o mini",
    modelProvider: "OpenAI",
    usesGpaiOrLlm: "Yes",
    usesRag: "Yes",
    canCallToolsOrApis: "No",
    canTakeActions: "No",
    generatesContent: "Yes",
    interactsDirectlyWithPeople: "Yes",
    usesPersonalData: "No",
    usesSensitiveData: "No",
    profilesIndividuals: "No",
    dataTypes: ["Internal documents"],
    buildType: "Built internally",
    brandedUnderOrganisationName: "Yes",
    vendorBrandVisible: "No",
    modifiedFineTunedRebrandedOrRepurposed: "No",
    riskDomainFlags: ["Internal productivity only", "Compliance or regulatory support"],
  },
  {
    // Distinct path: non-EU provider placing a high-risk system on the EU market
    // (Art 22 authorised representative; full provider obligation set).
    systemName: "EU Resume Ranker SaaS",
    shortDescription: "SaaS product built and sold by our US entity that ranks job applicants for EU corporate customers.",
    businessFunction: "HR",
    businessOwner: "VP Product",
    technicalOwner: "ML Platform Team",
    status: "Production",
    countriesUsed: ["Germany", "Netherlands", "United States"],
    outputsUsedInEu: "Yes",
    users: ["Customers", "Business partners"],
    affectedPersons: ["Job applicants"],
    deploymentContext: "Customer-facing",
    outputTypes: ["Score", "Ranking"],
    affectsDecisionsAboutPeople: "Yes",
    humanReviewOrOverride: "Not sure",
    impactIfWrong: "High impact",
    systemTypes: ["Machine learning model", "Recommender system"],
    decisionLogicType: "Machine learning model trained on data",
    learnedParametersUsedInProduction: "Yes",
    underlyingModelOrTool: "Proprietary gradient-boosted ranking model",
    modelProvider: "Internal",
    usesGpaiOrLlm: "No",
    usesRag: "No",
    canCallToolsOrApis: "Yes",
    canTakeActions: "No",
    generatesContent: "No",
    interactsDirectlyWithPeople: "No",
    usesPersonalData: "Yes",
    usesSensitiveData: "Not sure",
    profilesIndividuals: "Yes",
    dataTypes: ["Candidate / applicant data", "Behavioural data"],
    buildType: "Built internally",
    brandedUnderOrganisationName: "Yes",
    vendorBrandVisible: "No",
    modifiedFineTunedRebrandedOrRepurposed: "No",
    riskDomainFlags: ["Recruitment or hiring"],
  },
  {
    // Distinct path: military dual-use — the Art 2(3) carve-out is revoked.
    systemName: "Perimeter Threat Detection",
    shortDescription: "Camera-analytics system developed for base defence, also used for civilian site security at shared facilities.",
    businessFunction: "Operations",
    businessOwner: "Head of Security",
    technicalOwner: "Vision Team",
    status: "Pilot",
    countriesUsed: ["France"],
    outputsUsedInEu: "Yes",
    users: ["Employees"],
    affectedPersons: ["Public users", "Employees"],
    deploymentContext: "Internal only",
    outputTypes: ["Classification", "Action in another system"],
    affectsDecisionsAboutPeople: "Not sure",
    humanReviewOrOverride: "Yes",
    impactIfWrong: "High impact",
    systemTypes: ["Machine learning model", "Biometric system"],
    decisionLogicType: "Machine learning model trained on data",
    learnedParametersUsedInProduction: "Yes",
    underlyingModelOrTool: "YOLO-based detector",
    modelProvider: "Internal",
    usesGpaiOrLlm: "No",
    usesRag: "No",
    canCallToolsOrApis: "Yes",
    canTakeActions: "Yes",
    generatesContent: "No",
    interactsDirectlyWithPeople: "No",
    usesPersonalData: "Yes",
    usesSensitiveData: "Yes",
    profilesIndividuals: "No",
    dataTypes: ["Biometric data", "Public data"],
    buildType: "Built internally",
    brandedUnderOrganisationName: "Yes",
    vendorBrandVisible: "No",
    modifiedFineTunedRebrandedOrRepurposed: "No",
    riskDomainFlags: ["Biometrics", "Critical infrastructure"],
  },
] satisfies AISystemFormData[];

// Module 4-13 questionnaire answers per system (sanitized against each
// module's registered questions on write, exactly like the save action).
const moduleAnswerSeeds: Record<string, Partial<Record<ModuleKey, Record<string, string | string[]>>>> = {
  "ChatGPT Enterprise - Internal Drafting": {
    "high-risk": { hr1: "No", hr6: "No" },
    "eu-scope": { establishment: "Established in the EU/EEA" },
    exclusions: { militaryUse: "No", thirdCountryLawEnforcement: "No" },
    "ai-literacy": { measuresInPlace: "Yes, informal only", staffKnowledge: "Partially" },
    transparency: { tr_q3: "No", tr_q4: "No", tr_q7: "Neither" },
  },
  "Customer Support Chatbot": {
    "high-risk": { hr1: "No", hr6: "No" },
    // Distinct path: GPAI fine-tuner / downstream consumer.
    "eu-scope": { establishment: "Established in the EU/EEA" },
    exclusions: { militaryUse: "No", thirdCountryLawEnforcement: "No" },
    gpai: { gpai_q5: "Yes", gpai_q6: "Yes", annexXiiInfoReceived: "Partly", gpai_q7: "No" },
    transparency: { tr_q3: "No", tr_q4: "No", tr_q7: "Neither", tr_q8: "No" },
    "ai-literacy": { measuresInPlace: "Yes, documented", staffKnowledge: "Yes" },
  },
  "Vendor CV Screening Tool": {
    // Deployer of an Annex III high-risk system.
    "eu-scope": { establishment: "Established in the EU/EEA", placesOnEuMarket: "Not applicable" },
    exclusions: { militaryUse: "No", thirdCountryLawEnforcement: "No" },
    prohibited: { p1: "No", p2: "No", p3: "No", p4: "No", p5: "No", p10: "No" },
    "high-risk": { hr1: "No", hr4: "No", hr5: "No" },
    "ai-literacy": { measuresInPlace: "No", staffKnowledge: "Not sure" },
    transparency: { tr_q3: "No", tr_q4: "No", tr_q7: "Neither", tr_q8: "No" },
    readiness: { "OBL-ART26-DEPLOYER": "Partial", "OBL-ART4-LITERACY": "Not started" },
  },
  "Internal Credit Scoring Model": {
    // High-risk provider with a mixed evidence picture (drives Module 14).
    "eu-scope": { establishment: "Established in the EU/EEA" },
    exclusions: { militaryUse: "No", thirdCountryLawEnforcement: "No" },
    prohibited: { p1: "No", p2: "No", p3: "No", p4: "No", p5: "No", p10: "No" },
    "high-risk": { hr1: "No", hr4: "No", hr5: "No" },
    obligations: { conformityRoute: "No standards published yet" },
    transparency: { tr_q3: "No", tr_q4: "No", tr_q7: "Neither", tr_q8: "Yes – creditworthiness/credit scoring" },
    "ai-literacy": { measuresInPlace: "Yes, documented", staffKnowledge: "Yes" },
    readiness: {
      "OBL-ART9-RMS": "Partial",
      "OBL-ART10-DATA": "In place",
      "OBL-ART11-TECHDOC": "Not started",
      "OBL-ART12-LOGGING": "In place",
      "OBL-ART13-TRANSP-DEPLOYER": "Not started",
      "OBL-ART14-OVERSIGHT": "Partial",
      "OBL-ART15-ACCURACY": "Partial",
      "OBL-ART17-QMS": "Not started",
      "OBL-ART43-CONFORMITY": "Not started",
      "OBL-ART49-REGISTER": "Not started",
      "OBL-ART72-PMM": "Not sure",
      "OBL-ART73-INCIDENT": "Partial",
      "OBL-ART4-LITERACY": "In place",
      "OBL-ART50-TRANSP-AGG": "Partial",
    },
  },
  "Internal Policy RAG Assistant": {
    "high-risk": { hr1: "No", hr6: "No" },
    "eu-scope": { establishment: "Established in the EU/EEA" },
    exclusions: { militaryUse: "No", thirdCountryLawEnforcement: "No" },
    "ai-literacy": { measuresInPlace: "Yes, informal only", staffKnowledge: "Partially" },
  },
  "EU Resume Ranker SaaS": {
    // Non-EU provider, high-risk on the EU market → Art 22 authorised rep.
    "eu-scope": {
      establishment: "Established in a third country (outside EU/EEA)",
      placesOnEuMarket: "Yes",
      outputUsedInEu: "Yes",
      role: "Provider",
      nonEuProviderHighRiskOrGpai: "Yes",
    },
    exclusions: { militaryUse: "No", thirdCountryLawEnforcement: "No", personalUse: "No – professional/organisational use" },
    prohibited: { p1: "No", p2: "No", p3: "No", p4: "No", p5: "No", p10: "No" },
    "high-risk": { hr1: "No", hr4: "No", hr5: "No", hr6: "Yes" },
    obligations: { establishedOutsideEu: "Yes", conformityRoute: "Not sure" },
    "ai-literacy": { measuresInPlace: "Not sure", staffKnowledge: "Not sure" },
    readiness: { "OBL-ART9-RMS": "Partial", "OBL-ART22-AUTHREP": "Not started", "OBL-ART11-TECHDOC": "Partial" },
  },
  "Perimeter Threat Detection": {
    // Military dual use — carve-out revoked, biometric screening relevant.
    exclusions: { militaryUse: "Partly / dual use", thirdCountryLawEnforcement: "No", researchOnly: "Includes real-world testing" },
    prohibited: { p6: "No", p8: "Not sure", p9: "Not sure", p10: "No" },
    "high-risk": { hr1: "Not sure", hr4: "No", hr5: "Yes", hr6: "No" },
  },
};

// A couple of remediation items pre-assigned so /remediation is non-empty.
const remediationOwnerSeeds: Record<string, Record<string, { owner: string; status?: string }>> = {
  "Internal Credit Scoring Model": {
    "OBL-ART11-TECHDOC": { owner: "Data Science Lead", status: "in_progress" },
    "OBL-ART72-PMM": { owner: "Chief Risk Officer" },
    "OBL-ART73-INCIDENT": { owner: "Head of Compliance" },
  },
  "EU Resume Ranker SaaS": {
    "OBL-ART22-AUTHREP": { owner: "General Counsel", status: "in_progress" },
  },
};

function seedId(systemName: string): string {
  return `seed-${systemName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

async function main() {
  console.log("Seeding database...");
  for (const seed of seeds) {
    const { mutationData } = parseAISystemMutationInput(seed);
    const id = seedId(seed.systemName);

    await prisma.aISystem.upsert({
      where: { id },
      update: mutationData,
      create: { id, ...mutationData },
    });
  }
  console.log(`Done. ${seeds.length} systems seeded.`);

  // Modules 4-13 questionnaire answers (same sanitization as the save action).
  let answerCount = 0;
  for (const [systemName, modules] of Object.entries(moduleAnswerSeeds)) {
    const systemId = seedId(systemName);
    for (const [moduleKey, answers] of Object.entries(modules)) {
      const sanitized = sanitizeAnswersForModule(moduleKey, answers);
      await prisma.moduleAssessment.upsert({
        where: { systemId_moduleKey: { systemId, moduleKey } },
        create: { systemId, moduleKey, answers: JSON.stringify(sanitized), lastAssessedAt: new Date() },
        update: { answers: JSON.stringify(sanitized), lastAssessedAt: new Date() },
      });
      answerCount += 1;
    }
  }
  console.log(`Done. ${answerCount} module questionnaires seeded.`);

  // Module 14: generate remediation plans from the seeded Module 13 gaps and
  // pre-assign a few owners so /remediation is non-empty after db:reset.
  let itemCount = 0;
  for (const systemName of Object.keys(remediationOwnerSeeds)) {
    const systemId = seedId(systemName);
    const bundle = await getAssessmentBundle(systemId);
    if (!bundle) continue;
    const notifiedBody = bundle.obligations.standardsConformityRoute.includes("notified");
    const generated = generateRemediationItems(bundle.readiness.checklist, new Date(), notifiedBody);
    const roleSet = bundle.obligations.effectiveRoles.join(", ");
    for (const item of generated) {
      const ownerSeed = remediationOwnerSeeds[systemName][item.obligationId];
      await prisma.remediationItem.upsert({
        where: { systemId_obligationId: { systemId, obligationId: item.obligationId } },
        create: {
          systemId,
          obligationId: item.obligationId,
          title: item.title,
          sourceGapStatus: item.sourceGapStatus,
          suggestedDueDate: item.suggestedDueDate,
          recurrenceKind: item.recurrenceKind,
          cadence: item.cadence,
          priority: item.priority,
          legalBasisCitation: item.legalBasisCitation,
          applicableFromDate: item.applicableFromDate,
          guidanceStatus: item.guidanceStatus,
          generatedFromRoleSet: roleSet,
          owner: ownerSeed?.owner ?? null,
          dueDate: ownerSeed ? item.suggestedDueDate : null,
          status: ownerSeed?.status ?? "open",
        },
        update: {
          sourceGapStatus: item.sourceGapStatus,
          suggestedDueDate: item.suggestedDueDate,
          generatedFromRoleSet: roleSet,
        },
      });
      itemCount += 1;
    }
  }
  console.log(`Done. ${itemCount} remediation items seeded.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
