import type { AISystem } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { ensureAISystemRecordsRepaired } from "@/lib/inventory-repair";
import { assessRole, deriveAnswersFromSystem, QUESTIONS, type Answers, type SingleAnswerKey } from "./roleRules";
import type { EntityTypeRow } from "./types";

const QUESTION_KEYS = new Set(QUESTIONS.map((q) => q.key));

export function parseAnswers(json: string | null | undefined): Answers {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json) as unknown;
    if (typeof parsed !== "object" || parsed === null) return {};

    const answers: Answers = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!QUESTION_KEYS.has(key as SingleAnswerKey | "externalAccessWho")) continue;
      if (key === "externalAccessWho") {
        if (Array.isArray(value)) answers.externalAccessWho = value.map(String);
      } else if (typeof value === "string") {
        answers[key as SingleAnswerKey] = value;
      }
    }
    return answers;
  } catch {
    return {};
  }
}

function toRow(system: AISystem & { roleAssessment: { answers: string; lastAssessedAt: Date } | null }): EntityTypeRow {
  // Seed from inventory, then let saved questionnaire answers override.
  const answers = { ...deriveAnswersFromSystem(system), ...parseAnswers(system.roleAssessment?.answers) };
  return {
    system,
    answers,
    result: assessRole(answers),
    lastAssessedAt: system.roleAssessment?.lastAssessedAt ?? null,
  };
}

export async function listEntityTypeRows(): Promise<EntityTypeRow[]> {
  await ensureAISystemRecordsRepaired();
  const systems = await prisma.aISystem.findMany({
    include: { roleAssessment: true },
    orderBy: { createdAt: "desc" },
  });
  return systems.map(toRow);
}

export async function getEntityTypeRow(id: string): Promise<EntityTypeRow | null> {
  await ensureAISystemRecordsRepaired();
  const system = await prisma.aISystem.findUnique({
    where: { id },
    include: { roleAssessment: true },
  });
  return system ? toRow(system) : null;
}
