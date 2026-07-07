"use client";

import { SelectField, MultiSelectField, TextField } from "./fields";
import { SYSTEM_TYPES, DECISION_LOGIC_TYPES, YES_NO_NOT_SURE, YES_NO_NOT_SURE_NA } from "@/lib/options";

export function Step3Technical() {
  return (
    <div className="space-y-5">
      <MultiSelectField name="systemTypes" label="What kind of system is this?" options={SYSTEM_TYPES} tooltip="Pick every description that fits. 'General-purpose AI / foundation model' and 'Biometric system' switch on dedicated GPAI and biometric screening in later modules." />
      <SelectField name="decisionLogicType" label="How is the decision logic created?" options={DECISION_LOGIC_TYPES} tooltip="The EU AI Act definition of an 'AI system' turns on whether the system infers from inputs rather than only executing hand-written rules. Fully hand-written business rules point away from the definition." />
      <SelectField
        name="learnedParametersUsedInProduction"
        label="Are learned, estimated, or trained parameters used directly in production?"
        options={YES_NO_NOT_SURE_NA}
        tooltip="'Yes' when weights/coefficients learned from data drive live outputs (an ML model, statistical scorecard, LLM). 'No' when analysis only informed rules that humans then hard-coded."
      />
      <TextField
        name="underlyingModelOrTool"
        label="Underlying model, tool, or platform"
        placeholder="e.g. GPT-4o, Claude 3.5, XGBoost, Salesforce Einstein"
      />
      <TextField name="modelProvider" label="Model provider" placeholder="e.g. OpenAI, Anthropic, AWS, internal" />
      <SelectField name="usesGpaiOrLlm" label="Does the system use a general-purpose AI model or large language model?" options={YES_NO_NOT_SURE} tooltip="Covers calling an external LLM API (GPT, Claude, Gemini), a downloaded foundation model, or a vendor product built on one. Triggers the GPAI obligations module (Art 53/55)." />
      <SelectField name="usesRag" label="Does the system use retrieval-augmented generation (RAG) or internal-document search?" options={YES_NO_NOT_SURE} />
      <SelectField name="canCallToolsOrApis" label="Can the system call tools, APIs, databases, or other software systems?" options={YES_NO_NOT_SURE} />
      <SelectField name="canTakeActions" label="Can the system take actions in another system?" options={YES_NO_NOT_SURE} tooltip="E.g. writing records, sending messages, executing transactions without a human doing it — a signal of autonomy under the AI-system definition." />
      <SelectField name="generatesContent" label="Does the system generate text, image, audio, or video content?" options={YES_NO_NOT_SURE} />
      <SelectField
        name="interactsDirectlyWithPeople"
        label="Does the system interact directly with natural persons (employees, customers, candidates, public users)?"
        options={YES_NO_NOT_SURE}
        tooltip="Direct interaction (chatbot, voice bot, assistant) generally requires telling people they are dealing with AI unless obvious from context (Art 50(1))."
      />
    </div>
  );
}
