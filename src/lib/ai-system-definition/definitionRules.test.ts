// Self-check for the deterministic AI-definition-gate rules.
// Run: npx tsx src/lib/ai-system-definition/definitionRules.test.ts
import assert from "node:assert";
import type { NormalizedAISystemFormData } from "../ai-system-data";
import { buildAiDefinitionAssessment, classifyAiSystemDefinition } from "./definitionRules";

// Fills every array field with [] and every optional field with undefined, so each
// test case only has to specify the fields it cares about.
function system(overrides: Partial<NormalizedAISystemFormData>): NormalizedAISystemFormData {
  return {
    systemName: "Test system",
    shortDescription: "Test",
    countriesUsed: [], users: [], affectedPersons: [], outputTypes: [],
    systemTypes: [], dataTypes: [], riskDomainFlags: [],
    ...overrides,
  };
}

// 1. ChatGPT Enterprise for internal drafting -> Likely AI system, high confidence.
{
  const s = system({
    systemTypes: ["General-purpose AI / foundation model", "Chatbot"],
    outputTypes: ["Text content"],
    usesGpaiOrLlm: "Yes", usesRag: "No", generatesContent: "Yes",
    decisionLogicType: "General-purpose AI / LLM", learnedParametersUsedInProduction: "Yes",
    canCallToolsOrApis: "No", canTakeActions: "No", affectsDecisionsAboutPeople: "No",
    deploymentContext: "Employee-facing", status: "Production",
  });
  const a = buildAiDefinitionAssessment(s);
  assert.strictEqual(a.classification, "likely_ai_system", "1: expected likely_ai_system");
  assert.strictEqual(a.confidenceLabel, "high", "1: expected high confidence");
}

// 2. Vendor CV screening tool -> Likely AI system, high confidence.
{
  const s = system({
    systemTypes: ["Machine learning model"],
    outputTypes: ["Score", "Classification", "Recommendation"],
    decisionLogicType: "Machine learning model trained on data", learnedParametersUsedInProduction: "Yes",
    usesGpaiOrLlm: "No", usesRag: "No", generatesContent: "No",
    canCallToolsOrApis: "No", canTakeActions: "No",
    affectsDecisionsAboutPeople: "Yes", profilesIndividuals: "Yes",
    deploymentContext: "Customer-facing", status: "Production",
  });
  const a = buildAiDefinitionAssessment(s);
  assert.strictEqual(a.classification, "likely_ai_system", "2: expected likely_ai_system");
  assert.strictEqual(a.confidenceLabel, "high", "2: expected high confidence");
}

// 3. Internal credit scoring model using statistical coefficients -> Likely AI, high confidence.
{
  const s = system({
    systemTypes: ["Statistical model"],
    outputTypes: ["Score", "Decision"],
    decisionLogicType: "Statistical model with estimated coefficients", learnedParametersUsedInProduction: "Yes",
    usesGpaiOrLlm: "No", usesRag: "No", generatesContent: "No",
    canCallToolsOrApis: "Yes", canTakeActions: "No",
    affectsDecisionsAboutPeople: "Yes",
    deploymentContext: "Internal only", status: "Production",
  });
  const a = buildAiDefinitionAssessment(s);
  assert.strictEqual(a.classification, "likely_ai_system", "3: expected likely_ai_system");
  assert.strictEqual(a.confidenceLabel, "high", "3: expected high confidence");
}

// 4. Internal policy RAG assistant -> Likely AI, high confidence.
{
  const s = system({
    systemTypes: ["RAG system"],
    outputTypes: ["Text content", "Summary"],
    decisionLogicType: "General-purpose AI / LLM", learnedParametersUsedInProduction: "Yes",
    usesGpaiOrLlm: "Yes", usesRag: "Yes", generatesContent: "Yes",
    canCallToolsOrApis: "Yes", canTakeActions: "No", affectsDecisionsAboutPeople: "No",
    deploymentContext: "Employee-facing", status: "Production",
  });
  const a = buildAiDefinitionAssessment(s);
  assert.strictEqual(a.classification, "likely_ai_system", "4: expected likely_ai_system");
  assert.strictEqual(a.confidenceLabel, "high", "4: expected high confidence");
}

// 5. Static spreadsheet with manually entered formulas -> Likely not an AI system.
{
  const s = system({
    systemTypes: ["Deterministic rules engine"],
    outputTypes: [],
    decisionLogicType: "Fully hand-written business rules", learnedParametersUsedInProduction: "No",
    usesGpaiOrLlm: "No", usesRag: "No", generatesContent: "No",
    canCallToolsOrApis: "No", canTakeActions: "No", affectsDecisionsAboutPeople: "No",
    deploymentContext: "Internal only", status: "Production",
  });
  const a = buildAiDefinitionAssessment(s);
  assert.strictEqual(a.classification, "likely_not_ai_system", "5: expected likely_not_ai_system");
}

// 6. Fixed workflow routing rules -> Likely not an AI system.
{
  const s = system({
    systemTypes: ["Deterministic rules engine"],
    outputTypes: ["Other"],
    decisionLogicType: "Fully hand-written business rules", learnedParametersUsedInProduction: "No",
    usesGpaiOrLlm: "No", usesRag: "No", generatesContent: "No",
    canCallToolsOrApis: "No", canTakeActions: "No", affectsDecisionsAboutPeople: "No",
  });
  assert.strictEqual(classifyAiSystemDefinition(s), "likely_not_ai_system", "6: expected likely_not_ai_system");
}

// 7. Scoring tool with unclear method -> Possible AI system / needs review.
{
  const s = system({
    outputTypes: ["Score"],
    usesRag: "No", generatesContent: "No", canCallToolsOrApis: "No", canTakeActions: "No",
    affectsDecisionsAboutPeople: "Yes",
    // decisionLogicType, systemTypes, learnedParametersUsedInProduction, usesGpaiOrLlm left unanswered
  });
  assert.strictEqual(classifyAiSystemDefinition(s), "possible_ai_system_needs_review", "7: expected possible_ai_system_needs_review");
}

// 8. Mostly unknown technical profile -> Insufficient information.
{
  const s = system({
    decisionLogicType: "Not sure", learnedParametersUsedInProduction: "Not sure",
    usesGpaiOrLlm: "Not sure", usesRag: "Not sure", affectsDecisionsAboutPeople: "Not sure",
    // outputTypes, systemTypes, generatesContent, canCallToolsOrApis, canTakeActions left unanswered
  });
  assert.strictEqual(classifyAiSystemDefinition(s), "insufficient_information", "8: expected insufficient_information");
}

// 9. Deterministic rules engine plus machine learning model selected -> Possible AI system, with contradiction.
{
  const s = system({
    systemTypes: ["Deterministic rules engine", "Machine learning model"],
    outputTypes: ["Score"],
    decisionLogicType: "Hybrid: rules plus model", learnedParametersUsedInProduction: "Not sure",
    usesGpaiOrLlm: "No", usesRag: "No", generatesContent: "No",
    canCallToolsOrApis: "No", canTakeActions: "No", affectsDecisionsAboutPeople: "Not sure",
  });
  const a = buildAiDefinitionAssessment(s);
  assert.strictEqual(a.classification, "possible_ai_system_needs_review", "9: expected possible_ai_system_needs_review");
  assert(
    a.keyUncertainties.some((u) => u.includes("both deterministic and model-based")),
    "9: expected contradiction uncertainty"
  );
}

// 10. Agentic workflow using LLM and APIs -> Likely AI system, high confidence.
{
  const s = system({
    systemTypes: ["Agentic workflow"],
    outputTypes: ["Action in another system", "Text content"],
    decisionLogicType: "General-purpose AI / LLM", learnedParametersUsedInProduction: "Yes",
    usesGpaiOrLlm: "Yes", usesRag: "No", generatesContent: "Yes",
    canCallToolsOrApis: "Yes", canTakeActions: "Yes", affectsDecisionsAboutPeople: "No",
    deploymentContext: "Employee-facing", status: "Production",
  });
  const a = buildAiDefinitionAssessment(s);
  assert.strictEqual(a.classification, "likely_ai_system", "10: expected likely_ai_system");
  assert.strictEqual(a.confidenceLabel, "high", "10: expected high confidence");
}

console.log("All ai-system-definition rule tests passed.");
