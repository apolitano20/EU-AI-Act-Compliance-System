import { buildCsv, downloadCSVFile } from "@/lib/csv";
import type { GpaiRow } from "./types";

const HEADER = [
  "systemName",
  "gpaiRole",
  "modelProvider",
  "gpaiStatus",
  "systemicRiskFlag",
  "annexXiiInfoReceived",
  "module9TriggerEmitted",
  "confidenceScore",
  "confidenceLabel",
  "keyUncertainty",
  "legalBasisCitations",
  "guidanceStatus",
  "sourceVersionDate",
  "lastAssessedAt",
];

export function toGpaiCSV(rows: GpaiRow[]): string {
  return buildCsv(
    HEADER,
    rows.map((row) => [
      row.system.systemName,
      row.result.isGpaiProvider ? "GPAI model provider" : row.result.isDownstreamConsumer ? "Downstream consumer" : "-",
      row.normalized.modelProvider ?? row.normalized.modelProviderName ?? "",
      row.result.status,
      row.result.systemicRisk,
      row.result.annexXiiInfoReceived ?? "",
      row.result.emitsModule9Trigger ? "yes" : "no",
      row.result.confidenceScore,
      row.result.confidenceLabel,
      row.result.keyUncertainties[0] ?? "",
      row.result.firedRules.map((r) => r.citation).join("; "),
      row.result.firedRules.map((r) => `${r.ruleId}:${r.guidanceStatus}`).join("; "),
      row.result.sourceVersionDate,
      row.lastAssessedAt.toISOString(),
    ])
  );
}

export function downloadGpaiCSV(rows: GpaiRow[], filename = "gpai-obligations.csv"): void {
  downloadCSVFile(toGpaiCSV(rows), filename);
}
