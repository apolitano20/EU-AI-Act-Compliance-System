import { csvEscape as escape, downloadCSVFile } from "../csv";
import type { AiDefinitionRow } from "./types";

const CLASSIFICATION_LABELS: Record<string, string> = {
  likely_ai_system: "Likely AI system",
  possible_ai_system_needs_review: "Possible AI system / needs review",
  likely_not_ai_system: "Likely not an AI system",
  insufficient_information: "Insufficient information",
};

const HEADERS = [
  "System name", "Business function", "Status", "Build type", "System types", "Output types",
  "AI definition status", "Confidence", "Key uncertainty", "Missing fields count", "Last assessed",
] as const;

export function toAiDefinitionCSV(rows: AiDefinitionRow[]): string {
  const header = HEADERS.join(",");
  const body = rows.map(({ system, normalized, result, lastAssessedAt }) =>
    [
      escape(system.systemName),
      escape(system.businessFunction),
      escape(system.status),
      escape(system.buildType),
      escape(normalized.systemTypes.join("; ")),
      escape(normalized.outputTypes.join("; ")),
      escape(CLASSIFICATION_LABELS[result.classification]),
      escape(result.confidenceLabel),
      escape(result.keyUncertainties[0] ?? ""),
      escape(result.missingFields.length),
      escape(lastAssessedAt),
    ].join(",")
  );
  return [header, ...body].join("\r\n");
}

export function downloadAiDefinitionCSV(rows: AiDefinitionRow[], filename = "ai-system-definition-gate.csv"): void {
  downloadCSVFile(toAiDefinitionCSV(rows), filename);
}
