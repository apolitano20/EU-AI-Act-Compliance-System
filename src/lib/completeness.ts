import type { NormalizedAISystemFormData } from "./ai-system-data";
import { REQUIRED_FIELDS } from "./schema";

const FIELD_LABELS: Record<string, string> = {
  systemName:                  "System name",
  shortDescription:            "Short description",
  businessFunction:            "Business function",
  status:                      "Status",
  deploymentContext:           "Deployment context",
  buildType:                   "Build type",
  outputTypes:                 "Output types",
  affectsDecisionsAboutPeople: "Affects decisions about people",
  usesPersonalData:            "Uses personal data",
  usesGpaiOrLlm:               "Uses GPAI / LLM",
  riskDomainFlags:             "Risk-domain flags",
};

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function scoreBand(score: number): "High" | "Medium" | "Low" {
  return score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";
}

export function computeCompleteness(system: NormalizedAISystemFormData): {
  score: number;
  band: "High" | "Medium" | "Low";
  missingFields: string[];
} {
  const missing = REQUIRED_FIELDS.filter((f) => !isPresent(system[f]));
  const filled = REQUIRED_FIELDS.length - missing.length;
  const score = Math.round((filled / REQUIRED_FIELDS.length) * 100);
  const missingFields = missing.map((f) => FIELD_LABELS[f] ?? f);
  return { score, band: scoreBand(score), missingFields };
}
