import { csvEscape as escape, downloadCSVFile } from "../csv";
import { internalExternalUseLabel, type EntityTypeRow } from "./types";

const HEADERS = [
  "System name", "Business function", "Status", "Build type", "Vendor/provider",
  "Internal/external use", "Likely role(s)", "Possible role(s)", "Article 25 risk",
  "Confidence", "Key uncertainty", "Last assessed",
] as const;

export function toEntityCSV(rows: EntityTypeRow[]): string {
  const header = HEADERS.join(",");
  const body = rows.map(({ system, answers, result, lastAssessedAt }) =>
    [
      escape(system.systemName),
      escape(system.businessFunction),
      escape(system.status),
      escape(system.buildType),
      escape(system.vendorName ?? system.modelProviderName),
      escape(internalExternalUseLabel(answers)),
      escape(result.likelyRoles.join("; ")),
      escape(result.possibleRoles.join("; ")),
      escape(result.article25ProviderConversionRisk ? "Yes" : "No"),
      escape(result.confidenceLabel),
      escape(result.keyUncertainties[0] ?? ""),
      escape(lastAssessedAt),
    ].join(",")
  );
  return [header, ...body].join("\r\n");
}

export function downloadEntityCSV(rows: EntityTypeRow[], filename = "entity-type-assessment.csv"): void {
  downloadCSVFile(toEntityCSV(rows), filename);
}
