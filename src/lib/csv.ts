import type { AISystem } from "../generated/prisma/client";
import { isArrayField, normalizeAISystemLike } from "./ai-system-data";

const HEADERS: (keyof AISystem)[] = [
  "id", "systemName", "shortDescription", "businessFunction", "businessOwner",
  "technicalOwner", "status", "countriesUsed", "outputsUsedInEu", "deploymentContext",
  "buildType", "vendorName", "vendorCountry", "underlyingModelOrTool", "modelProvider",
  "usesGpaiOrLlm", "usesRag", "canCallToolsOrApis", "canTakeActions",
  "generatesContent", "interactsDirectlyWithPeople", "usesPersonalData",
  "usesSensitiveData", "profilesIndividuals", "dataTypes",
  "affectsDecisionsAboutPeople", "humanReviewOrOverride", "impactIfWrong",
  "riskDomainFlags", "completenessScore", "createdAt", "updatedAt",
];

// Escapes a CSV cell, including spreadsheet-formula injection protection.
export function csvEscape(v: unknown): string {
  const raw = v == null ? "" : v instanceof Date ? v.toISOString() : String(v).replace(/\r?\n/g, " ");
  const s = /^[\t\r ]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return s.includes(",") || s.includes('"')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function downloadCSVFile(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Builds a CSV string from a header row and data rows, escaping every cell.
export function buildCsv(header: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const head = header.map(csvEscape).join(",");
  const body = rows.map((row) => row.map(csvEscape).join(","));
  return [head, ...body].join("\r\n");
}

export function toCSV(rows: AISystem[]): string {
  const header = HEADERS.join(",");
  const body = rows.map((row) => {
    const normalized = normalizeAISystemLike(row);

    return HEADERS.map((headerKey) => {
      if (isArrayField(headerKey)) {
        return csvEscape(normalized[headerKey].join("; "));
      }

      return csvEscape(row[headerKey]);
    }).join(",");
  });
  return [header, ...body].join("\r\n");
}

export function downloadCSV(rows: AISystem[], filename = "ai-inventory.csv"): void {
  downloadCSVFile(toCSV(rows), filename);
}
