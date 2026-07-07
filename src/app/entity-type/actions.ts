"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { QUESTIONS, type Answers } from "@/lib/entity-type/roleRules";

const QUESTION_BY_KEY = new Map(QUESTIONS.map((q) => [q.key, q]));

function sanitizeAnswers(input: unknown): Answers {
  if (typeof input !== "object" || input === null) {
    throw new Error("Answers must be an object");
  }

  const answers: Answers = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const question = QUESTION_BY_KEY.get(key as never);
    if (!question) continue;

    if (question.multi) {
      if (Array.isArray(value)) {
        const cleaned = value.filter((v): v is string => typeof v === "string" && question.options.includes(v));
        if (cleaned.length > 0) (answers as Record<string, unknown>)[key] = cleaned;
      }
      continue;
    }

    if (typeof value === "string" && question.options.includes(value)) {
      (answers as Record<string, unknown>)[key] = value;
    }
  }
  return answers;
}

export async function saveAssessment(systemId: string, answers: unknown) {
  const id = systemId.trim();
  if (!id) throw new Error("System id is required");

  const sanitized = sanitizeAnswers(answers);

  await prisma.entityRoleAssessment.upsert({
    where: { systemId: id },
    create: { systemId: id, answers: JSON.stringify(sanitized), lastAssessedAt: new Date() },
    update: { answers: JSON.stringify(sanitized), lastAssessedAt: new Date() },
  });

  revalidatePath("/entity-type");
  revalidatePath(`/entity-type/systems/${id}`);
}
