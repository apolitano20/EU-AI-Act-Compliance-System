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
import { buildLiteracyAssessment, deriveLiteracyAnswers, LITERACY_QUESTIONS, type LiteracyAssessment } from "@/lib/ai-literacy/literacyRules";
import { buildReclassificationAssessment, deriveReclassificationAnswers, RECLASSIFICATION_QUESTIONS, type ReclassificationAssessment } from "@/lib/reclassification/reclassificationRules";
import { buildGpaiAssessment, deriveGpaiAnswers, GPAI_QUESTIONS, type GpaiAssessment } from "@/lib/gpai/rules";
import { buildTransparencyAssessment, deriveTransparencyAnswers, TRANSPARENCY_QUESTIONS, type TransparencyAssessment } from "@/lib/transparency/rules";
import { applyReclassification, buildObligationAssessment, OBLIGATION_QUESTIONS, type ObligationContext, type ObligationMatrixAssessment } from "@/lib/obligations/obligationRules";

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
  /** Module 8 — AI literacy (Article 4, horizontal). */
  literacyAnswers: ModuleAnswers;
  literacy: LiteracyAssessment;
  /** Module 9 — value-chain reclassification (Article 25, authoritative trigger flags). */
  reclassificationAnswers: ModuleAnswers;
  reclassification: ReclassificationAssessment;
  /** Module 10 — GPAI obligations (Art 51/53/55). */
  gpaiAnswers: ModuleAnswers;
  gpai: GpaiAssessment;
  /** Module 11 — transparency (Art 50) + FRIA (Art 27). */
  transparencyAnswers: ModuleAnswers;
  transparency: TransparencyAssessment;
  /** Module 12 — obligations matrix (pure aggregation of Modules 2-11). */
  obligationAnswers: ModuleAnswers;
  obligationContext: ObligationContext;
  obligations: ObligationMatrixAssessment;
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

  // Module 8 — AI literacy (horizontal: ignores Module 5/7 outcomes).
  const literacyAnswers: ModuleAnswers = {
    ...deriveLiteracyAnswers({ likelyRoles: role.likelyRoles, definitionClassification: definition.classification }),
    ...storedModuleAnswers(system, "ai-literacy", LITERACY_QUESTIONS),
  };
  const literacy = buildLiteracyAssessment(literacyAnswers, {
    likelyRoles: role.likelyRoles,
    definitionClassification: definition.classification,
    roleConfidenceLabel: role.confidenceLabel,
    highRiskStatus: highRisk.status,
  });

  // Module 9 — value-chain reclassification (authoritative Art 25 trigger flags).
  const reclassificationAnswers: ModuleAnswers = {
    ...deriveReclassificationAnswers({
      likelyRoles: role.likelyRoles,
      rebrandedThirdPartySystem: roleAnswers.rebrandedThirdPartySystem,
      substantiallyModifiedSystem: roleAnswers.substantiallyModifiedSystem,
      changedIntendedPurpose: roleAnswers.changedIntendedPurpose,
      highRiskStatus: highRisk.status,
    }),
    ...storedModuleAnswers(system, "reclassification", RECLASSIFICATION_QUESTIONS),
  };
  const reclassification = buildReclassificationAssessment(reclassificationAnswers, {
    highRiskStatus: highRisk.status,
    roleConfidenceLabel: role.confidenceLabel,
    purposeChangeReported: roleAnswers.changedIntendedPurpose === "Yes",
  });

  // Module 10 — GPAI obligations.
  const gpaiAnswers: ModuleAnswers = {
    ...deriveGpaiAnswers(normalized, { fineTunedOrRetrainedModel: roleAnswers.fineTunedOrRetrainedModel }),
    ...storedModuleAnswers(system, "gpai", GPAI_QUESTIONS),
  };
  const gpai = buildGpaiAssessment(gpaiAnswers);

  // Module 11 — transparency (Art 50) + FRIA (Art 27, distinct panel).
  const transparencyAnswers: ModuleAnswers = {
    ...deriveTransparencyAnswers(normalized, { likelyRoles: role.likelyRoles }),
    ...storedModuleAnswers(system, "transparency", TRANSPARENCY_QUESTIONS),
  };
  const transparency = buildTransparencyAssessment(normalized, transparencyAnswers, {
    highRiskStatus: highRisk.status,
    roleConfidenceLabel: role.confidenceLabel,
  });

  // Module 12 — obligations matrix (aggregates everything above).
  const obligationAnswers: ModuleAnswers = {
    ...deriveObligationAnswers(scopeAnswers, highRisk.carveOutApplied, reclassification.anyTriggerFired),
    ...storedModuleAnswers(system, "obligations", OBLIGATION_QUESTIONS),
  };
  const obligationContext: ObligationContext = {
    effectiveRoles: applyReclassification(role.likelyRoles, reclassification.anyTriggerFired),
    promotedByReclassification: reclassification.anyTriggerFired,
    definitionClassification: definition.classification,
    scopeStatus: scope.status,
    fullyExcluded: exclusions.fullExclusion,
    exclusionStatus: exclusions.status,
    prohibitedStatus: prohibited.status,
    highRiskStatus: highRisk.status,
    highRiskRegistrationRequired: highRisk.registrationRequired,
    carveOutApplied: highRisk.carveOutApplied,
    authorisedRepRequired: scope.authorisedRepRequired,
    literacyApplies: literacy.status === "obligation_likely_applies",
    art50TriggerIds: transparency.article50Rules.map((r) => r.ruleId),
    friaStatus: transparency.friaStatus,
    gpaiProvider: gpai.isGpaiProvider,
    gpaiSystemicRisk: gpai.systemicRisk,
    matchedAnnexIiiAreas: highRisk.matchedAnnexIiiAreas,
  };
  const obligations = buildObligationAssessment(obligationContext, obligationAnswers);

  return {
    system, normalized, roleAnswers, role, definition,
    scopeAnswers, scope, exclusionAnswers, exclusions,
    prohibitedAnswers, prohibited, highRiskAnswers, highRisk,
    literacyAnswers, literacy, reclassificationAnswers, reclassification,
    gpaiAnswers, gpai, transparencyAnswers, transparency,
    obligationAnswers, obligationContext, obligations,
  };
}

/** Matrix-specific answer seeding from upstream results. */
function deriveObligationAnswers(scopeAnswers: ModuleAnswers, carveOutApplied: boolean, promoted: boolean): ModuleAnswers {
  const d: ModuleAnswers = { roleScope: "All roles held" };
  if (scopeAnswers.establishment === "Established in the EU/EEA") d.establishedOutsideEu = "No";
  if (scopeAnswers.establishment === "Established in a third country (outside EU/EEA)") d.establishedOutsideEu = "Yes";
  if (!carveOutApplied) d.art63Documented = "Not applicable (system is high-risk)";
  if (promoted) d.changedSinceMarket = "Yes";
  return d;
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
