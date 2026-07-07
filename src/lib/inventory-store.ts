import { prisma } from "./db";
import { ensureAISystemRecordsRepaired } from "./inventory-repair";

export async function listSystems() {
  await ensureAISystemRecordsRepaired();
  return prisma.aISystem.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getSystem(id: string) {
  await ensureAISystemRecordsRepaired();
  return prisma.aISystem.findUnique({ where: { id } });
}
