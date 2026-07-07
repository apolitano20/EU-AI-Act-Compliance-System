import type { AISystem } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { ensureAISystemRecordsRepaired } from "@/lib/inventory-repair";
import { normalizeAISystemLike } from "@/lib/ai-system-data";
import { buildAiDefinitionAssessment } from "./definitionRules";
import type { AiDefinitionRow } from "./types";

function toRow(system: AISystem): AiDefinitionRow {
  const normalized = normalizeAISystemLike(system);
  return {
    system,
    normalized,
    result: buildAiDefinitionAssessment(normalized),
    lastAssessedAt: system.updatedAt,
  };
}

export async function listAiDefinitionRows(): Promise<AiDefinitionRow[]> {
  await ensureAISystemRecordsRepaired();
  const systems = await prisma.aISystem.findMany({ orderBy: { createdAt: "desc" } });
  return systems.map(toRow);
}

export async function getAiDefinitionRow(id: string): Promise<AiDefinitionRow | null> {
  await ensureAISystemRecordsRepaired();
  const system = await prisma.aISystem.findUnique({ where: { id } });
  return system ? toRow(system) : null;
}
