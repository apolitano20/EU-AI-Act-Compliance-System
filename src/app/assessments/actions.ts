"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MODULES, sanitizeAnswersForModule, getModuleDefinition } from "@/lib/module-registry";

/**
 * Generic save action for every Modules 4-13 questionnaire. Answers are
 * sanitized against the module's registered questions and upserted into the
 * ModuleAssessment overlay. All module routes are revalidated because
 * downstream assessments are derived live from these answers.
 */
export async function saveModuleAnswers(moduleKey: string, systemId: string, answers: unknown) {
  const id = systemId.trim();
  if (!id) throw new Error("System id is required");
  const def = getModuleDefinition(moduleKey);
  if (!def) throw new Error(`Unknown module key: ${moduleKey}`);

  const sanitized = sanitizeAnswersForModule(moduleKey, answers);

  await prisma.moduleAssessment.upsert({
    where: { systemId_moduleKey: { systemId: id, moduleKey } },
    create: { systemId: id, moduleKey, answers: JSON.stringify(sanitized), lastAssessedAt: new Date() },
    update: { answers: JSON.stringify(sanitized), lastAssessedAt: new Date() },
  });

  for (const definition of Object.values(MODULES)) {
    revalidatePath(definition.route);
    revalidatePath(`${definition.route}/systems/${id}`);
  }
}
