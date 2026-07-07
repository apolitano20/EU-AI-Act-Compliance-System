import type { AISystem, PrismaClient } from "../generated/prisma/client";
import { prisma } from "./db";
import { computeCompleteness } from "./completeness";
import {
  hasAISystemMutationChanges,
  normalizeAISystemLike,
  toAISystemMutationData,
  type AISystemMutationData,
} from "./ai-system-data";

type RepairResult = {
  checked: number;
  updated: number;
};

type GlobalRepairState = {
  inventoryRepairDone?: boolean;
  inventoryRepairPromise?: Promise<RepairResult>;
};

const globalForRepair = globalThis as typeof globalThis & GlobalRepairState;

export function getAISystemRepairData(system: Partial<AISystem>): AISystemMutationData {
  const normalized = normalizeAISystemLike(system);
  const completeness = computeCompleteness(normalized);
  return toAISystemMutationData(normalized, completeness.score);
}

export async function repairAISystemRecords(client: PrismaClient = prisma): Promise<RepairResult> {
  const systems = await client.aISystem.findMany();
  let updated = 0;

  for (const system of systems) {
    const mutationData = getAISystemRepairData(system);
    if (!hasAISystemMutationChanges(system, mutationData)) continue;

    await client.aISystem.update({
      where: { id: system.id },
      data: mutationData,
    });
    updated += 1;
  }

  return { checked: systems.length, updated };
}

export async function ensureAISystemRecordsRepaired(client: PrismaClient = prisma): Promise<RepairResult> {
  if (globalForRepair.inventoryRepairDone) {
    return { checked: 0, updated: 0 };
  }

  if (!globalForRepair.inventoryRepairPromise) {
    globalForRepair.inventoryRepairPromise = repairAISystemRecords(client)
      .then((result) => {
        globalForRepair.inventoryRepairDone = true;
        return result;
      })
      .finally(() => {
        globalForRepair.inventoryRepairPromise = undefined;
      });
  }

  return globalForRepair.inventoryRepairPromise;
}
