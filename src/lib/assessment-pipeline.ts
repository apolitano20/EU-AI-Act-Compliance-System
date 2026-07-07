// Cross-module assessment pipeline. Loads each AISystem with its stored
// answer overlays in ONE query, then computes every module's assessment in
// dependency order as pure functions — so downstream modules (exclusions,
// prohibited, high-risk, obligations, ...) never re-implement upstream
// loading, and short-circuits stay consistent everywhere.
//
// Per-module results are appended to AssessmentBundle as modules are built.

import type { AISystem, EntityRoleAssessment, ModuleAssessment } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { ensureAISystemRecordsRepaired } from "@/lib/inventory-repair";
import { normalizeAISystemLike, type NormalizedAISystemFormData } from "@/lib/ai-system-data";
import { parseModuleAnswers, type ModuleAnswers, type ModuleQuestion } from "@/lib/assessment-shared";
import type { ModuleKey } from "@/lib/module-registry";
import { assessRole, deriveAnswersFromSystem, type Answers as RoleAnswers, type RoleAssessmentResult } from "@/lib/entity-type/roleRules";
import { parseAnswers as parseRoleAnswers } from "@/lib/entity-type/assessment-store";
import { buildAiDefinitionAssessment, type AiDefinitionAssessment } from "@/lib/ai-system-definition/definitionRules";
import { buildScopeAssessment, deriveScopeAnswers, SCOPE_QUESTIONS, type EuScopeAssessment } from "@/lib/eu-scope/scopeRules";
import { buildExclusionAssessment, deriveExclusionAnswers, EXCLUSION_QUESTIONS, type ExclusionAssessment } from "@/lib/exclusions/exclusionRules";
import { buildProhibitedAssessment, deriveProhibitedAnswers, PROHIBITED_QUESTIONS, type ProhibitedAssessment } from "@/lib/prohibited/rules";
import { buildHighRiskAssessment, deriveHighRiskAnswers, HIGH_RISK_QUESTIONS, type HighRiskAssessment } from "@/lib/high-risk/rules";

export type SystemWithAssessments = AISystem & {
  roleAssessment: EntityRoleAssessment | null;
  moduleAssessments: ModuleAssessment[];
};

export interface AssessmentBundle {
  system: SystemWithAssessments;
  normalized: NormalizedAISystemFormData;
  /** Module 2 (merged answers: inventory seed overlaid with saved answers). */
  roleAnswers: RoleAnswers;
  role: RoleAssessmentResult;
  /** Module 3 (pure derived). */
  definition: AiDefinitionAssessment;
  /** Module 4 — EU scope (merged answers + assessment). */
  scopeAnswers: ModuleAnswers;
  scope: EuScopeAssessment;
  /** Module 5 — exclusions (Article 2 carve-outs). */
  exclusionAnswers: ModuleAnswers;
  exclusions: ExclusionAssessment;
  /** Module 6 — prohibited practices (Article 5). */
  prohibitedAnswers: ModuleAnswers;
  prohibited: ProhibitedAssessment;
  /** Module 7 — high-risk classification (Article 6, Annex I/III). */
  highRiskAnswers: ModuleAnswers;
  highRisk: HighRiskAssessment;
}

/** Stored answers for one module, or {} when nothing was saved. */
export function storedModuleAnswers(
  system: SystemWithAssessments,
  moduleKey: ModuleKey,
  questions: readonly ModuleQuestion[]
): ModuleAnswers {
  const record = system.moduleAssessments.find((a) => a.moduleKey === moduleKey);
  return parseModuleAnswers(record?.answers, questions);
}

/** When the module's answers were last explicitly saved (null = derived only). */
export function moduleLastAssessedAt(system: SystemWithAssessments, moduleKey: ModuleKey): Date | null {
  return system.moduleAssessments.find((a) => a.moduleKey === moduleKey)?.lastAssessedAt ?? null;
}

export function computeAssessmentBundle(system: SystemWithAssessments): AssessmentBundle {
  const normalized = normalizeAISystemLike(system);

  // Module 2 — entity role (seed from inventory, saved answers override).
  const roleAnswers: RoleAnswers = { ...deriveAnswersFromSystem(system), ...parseRoleAnswers(system.roleAssessment?.answers) };
  const role = assessRole(roleAnswers);

  // Module 3 — AI-system definition gate (pure derived).
  const definition = buildAiDefinitionAssessment(normalized);

  // Module 4 — EU scope (seed from Modules 1+2, saved answers override).
  const scopeAnswers: ModuleAnswers = {
    ...deriveScopeAnswers(normalized, { organisationInEu: roleAnswers.organisationInEu, likelyRoles: role.likelyRoles }),
    ...storedModuleAnswers(system, "eu-scope", SCOPE_QUESTIONS),
  };
  const scope = buildScopeAssessment(normalized, scopeAnswers);

  // Module 5 — exclusions (Article 2 carve-outs).
  const exclusionAnswers: ModuleAnswers = {
    ...deriveExclusionAnswers(normalized, { businessOrProfessionalUse: roleAnswers.businessOrProfessionalUse }),
    ...storedModuleAnswers(system, "exclusions", EXCLUSION_QUESTIONS),
  };
  const exclusions = buildExclusionAssessment(normalized, exclusionAnswers);

  // Module 6 — prohibited practices (short-circuits on a full Module 5 exclusion).
  const prohibitedAnswers: ModuleAnswers = {
    ...deriveProhibitedAnswers(normalized),
    ...storedModuleAnswers(system, "prohibited", PROHIBITED_QUESTIONS),
  };
  const prohibited = buildProhibitedAssessment(normalized, prohibitedAnswers, {
    fullyExcluded: exclusions.fullExclusion,
    exclusionStatus: exclusions.status,
  });

  // Module 7 — high-risk (runs only for non-excluded, non-prohibited systems).
  const highRiskAnswers: ModuleAnswers = {
    ...deriveHighRiskAnswers(normalized, {
      aiEmbeddedInProduct: roleAnswers.aiEmbeddedInProduct,
      safetyRisk: roleAnswers.safetyRisk,
    }),
    ...storedModuleAnswers(system, "high-risk", HIGH_RISK_QUESTIONS),
  };
  const highRisk = buildHighRiskAssessment(normalized, highRiskAnswers, {
    fullyExcluded: exclusions.fullExclusion,
    likelyProhibited: prohibited.status === "likely_prohibited",
    prohibitedStatus: prohibited.status,
    rebrandedThirdPartySystem: roleAnswers.rebrandedThirdPartySystem,
    substantiallyModifiedSystem: roleAnswers.substantiallyModifiedSystem,
    changedIntendedPurpose: roleAnswers.changedIntendedPurpose,
  });

  return {
    system, normalized, roleAnswers, role, definition,
    scopeAnswers, scope, exclusionAnswers, exclusions,
    prohibitedAnswers, prohibited, highRiskAnswers, highRisk,
  };
}

export async function loadSystemsWithAssessments(): Promise<SystemWithAssessments[]> {
  await ensureAISystemRecordsRepaired();
  return prisma.aISystem.findMany({
    include: { roleAssessment: true, moduleAssessments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function loadSystemWithAssessments(id: string): Promise<SystemWithAssessments | null> {
  await ensureAISystemRecordsRepaired();
  return prisma.aISystem.findUnique({
    where: { id },
    include: { roleAssessment: true, moduleAssessments: true },
  });
}

export async function listAssessmentBundles(): Promise<AssessmentBundle[]> {
  const systems = await loadSystemsWithAssessments();
  return systems.map(computeAssessmentBundle);
}

export async function getAssessmentBundle(id: string): Promise<AssessmentBundle | null> {
  const system = await loadSystemWithAssessments(id);
  return system ? computeAssessmentBundle(system) : null;
}
