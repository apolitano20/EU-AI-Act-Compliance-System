// Registry of the Modules 4-13 stored-answer questionnaires. Drives the generic
// saveModuleAnswers server action (sanitization + revalidation) and keeps the
// per-module metadata in one place. Entries are added as each module is built.
//
// Must stay free of server-only imports (used by client components and tests).

import { sanitizeModuleAnswers, type ModuleAnswers, type ModuleQuestion } from "./assessment-shared";
import { SCOPE_QUESTIONS } from "./eu-scope/scopeRules";
import { EXCLUSION_QUESTIONS } from "./exclusions/exclusionRules";
import { PROHIBITED_QUESTIONS } from "./prohibited/rules";
import { HIGH_RISK_QUESTIONS } from "./high-risk/rules";
import { LITERACY_QUESTIONS } from "./ai-literacy/literacyRules";
import { RECLASSIFICATION_QUESTIONS } from "./reclassification/reclassificationRules";
import { GPAI_QUESTIONS } from "./gpai/rules";
import { TRANSPARENCY_QUESTIONS } from "./transparency/rules";
import { OBLIGATION_QUESTIONS } from "./obligations/obligationRules";

export type ModuleKey =
  | "eu-scope"
  | "exclusions"
  | "prohibited"
  | "high-risk"
  | "ai-literacy"
  | "reclassification"
  | "gpai"
  | "transparency"
  | "obligations"
  | "readiness";

export interface ModuleDefinition {
  title: string;
  route: string; // list route; detail route is `${route}/systems/[id]`
  questions: readonly ModuleQuestion[];
  /**
   * Optional sanitizer override for modules whose answer keys are dynamic
   * (Module 13 keys evidence answers by obligation_id, not by a fixed
   * question list).
   */
  sanitize?: (input: unknown) => ModuleAnswers;
}

export const MODULES: Partial<Record<ModuleKey, ModuleDefinition>> = {
  "eu-scope": { title: "EU Scope & Applicability", route: "/eu-scope", questions: SCOPE_QUESTIONS },
  exclusions: { title: "Exclusions", route: "/exclusions", questions: EXCLUSION_QUESTIONS },
  prohibited: { title: "Prohibited AI Practices", route: "/prohibited", questions: PROHIBITED_QUESTIONS },
  "high-risk": { title: "High-Risk Classification", route: "/high-risk", questions: HIGH_RISK_QUESTIONS },
  "ai-literacy": { title: "AI Literacy", route: "/ai-literacy", questions: LITERACY_QUESTIONS },
  reclassification: { title: "Value-Chain Reclassification", route: "/reclassification", questions: RECLASSIFICATION_QUESTIONS },
  gpai: { title: "GPAI Obligations", route: "/gpai", questions: GPAI_QUESTIONS },
  transparency: { title: "Transparency Obligations", route: "/transparency", questions: TRANSPARENCY_QUESTIONS },
  obligations: { title: "Obligations Matrix", route: "/obligations", questions: OBLIGATION_QUESTIONS },
};

export function getModuleDefinition(moduleKey: string): ModuleDefinition | undefined {
  return MODULES[moduleKey as ModuleKey];
}

export function sanitizeAnswersForModule(moduleKey: string, input: unknown): ModuleAnswers {
  const def = getModuleDefinition(moduleKey);
  if (!def) throw new Error(`Unknown module key: ${moduleKey}`);
  return def.sanitize ? def.sanitize(input) : sanitizeModuleAnswers(input, def.questions);
}
