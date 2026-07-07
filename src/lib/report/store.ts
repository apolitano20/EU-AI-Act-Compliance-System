import { prisma } from "@/lib/db";
import { getAssessmentBundle, listAssessmentBundles } from "@/lib/assessment-pipeline";
import { assembleSystemReport, buildFinalReport, parseReportOptions, type FinalReport, type SystemReport } from "./reportRules";
import type { RemediationItem } from "@/generated/prisma/client";

export async function listSystemReports(): Promise<SystemReport[]> {
  const [bundles, items] = await Promise.all([
    listAssessmentBundles(),
    prisma.remediationItem.findMany(),
  ]);
  const bySystem = new Map<string, RemediationItem[]>();
  for (const item of items) {
    const list = bySystem.get(item.systemId) ?? [];
    list.push(item);
    bySystem.set(item.systemId, list);
  }
  return bundles.map((b) => assembleSystemReport(b, bySystem.get(b.system.id) ?? []));
}

export async function getFinalReport(params: Record<string, string | string[] | undefined>): Promise<FinalReport> {
  const reports = await listSystemReports();
  return buildFinalReport(reports, parseReportOptions(params));
}

export async function getSystemReport(id: string): Promise<SystemReport | null> {
  const bundle = await getAssessmentBundle(id);
  if (!bundle) return null;
  const items = await prisma.remediationItem.findMany({ where: { systemId: id } });
  return assembleSystemReport(bundle, items);
}
