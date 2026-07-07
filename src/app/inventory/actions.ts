"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseAISystemMutationInput } from "@/lib/ai-system-write";

function normalizeId(id: string): string {
  const normalized = id.trim();
  if (!normalized) {
    throw new Error("System id is required");
  }
  return normalized;
}

export async function createSystem(data: unknown) {
  const { mutationData } = parseAISystemMutationInput(data);
  await prisma.aISystem.create({ data: mutationData });
  revalidatePath("/inventory");
}

export async function updateSystem(id: string, data: unknown) {
  const systemId = normalizeId(id);
  const { mutationData } = parseAISystemMutationInput(data);

  await prisma.aISystem.update({ where: { id: systemId }, data: mutationData });
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${systemId}`);
  revalidatePath(`/inventory/${systemId}/edit`);
}

export async function deleteSystem(id: string) {
  const systemId = normalizeId(id);

  await prisma.aISystem.delete({ where: { id: systemId } });
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${systemId}`);
  revalidatePath(`/inventory/${systemId}/edit`);
}
