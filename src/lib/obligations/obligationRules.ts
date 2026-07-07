// Module 12 — Obligations Matrix (modules_mds/module-12-obligations-matrix.md).
// Performs NO new classification — aggregates upstream flags into a
// consolidated per-system, per-role obligations checklist. Every applicable
// article is decomposed into a concrete obligation ROW, switched on/off
// deterministically by upstream flags. Pure rules only.

import {
  clampScore,
  confidenceLabelFor,
  SOURCE_VERSION_DATE,
  APPLICABLE_DATES,
  type AssessmentCore,
  type FiredRule,
  type GuidanceStatus,
  type ModuleAnswers,
  type ModuleQuestion,
} from "@/lib/assessment-shared";

export const OBLIGATIONS_MODULE_KEY = "obligations" as const;

// ---------------------------------------------------------------------------
// Questionnaire (reuse M2-M11 first; ask only what upstream could not settle)
// ---------------------------------------------------------------------------

export const MATRIX_ROLE_OPTIONS = ["Provider", "Deployer", "Importer", "Distributor", "Authorised representative", "All roles held", "Not sure"] as const;
export const ART63_DOC_OPTIONS = ["Yes, documented", "No", "Not sure", "Not applicable (system is high-risk)"] as const;
export const CONFORMITY_ROUTE_OPTIONS = ["Harmonised standards apply", "Notified body required", "No standards published yet", "Not sure", "Not applicable"] as const;

export const OBLIGATION_QUESTIONS: ModuleQuestion[] = [
  {
    key: "roleScope",
    label: "Should obligations be assessed for a specific entity role, or every role your organisation holds?",
    options: MATRIX_ROLE_OPTIONS,
    seededFrom: "module-2 likely/possible roles",
  },
  {
    key: "changedSinceMarket",
    label: "Has the system, its intended purpose, or its branding changed since first placed on the market/put into service?",
    helper:
      "Substantial modification, re-branding, or a purpose change to high-risk can convert a deployer/distributor into a provider (Art 25); Module 9 screens this.",
    options: ["Yes", "No", "Not sure", "Not applicable"],
    seededFrom: "module-9 trigger answers",
  },
  {
    key: "art63Documented",
    label: "For a system not classified high-risk, has the provider documented the \"no significant risk\" self-assessment?",
    helper:
      "Art 6(3) lets a provider treat an Annex III system as not-high-risk only if documented and (Art 49) registered.",
    options: ART63_DOC_OPTIONS,
    seededFrom: "module-7 carve-out outcome",
  },
  {
    key: "establishedOutsideEu",
    label: "Is your organisation established outside the EU while placing this system on the EU market/putting it into service?",
    helper:
      "A non-EU provider of a high-risk system or GPAI model must appoint an EU authorised representative before market placement (Art 22 / Art 54).",
    options: ["Yes", "No", "Not sure", "Not applicable"],
    seededFrom: "module-4 establishment answer",
  },
  {
    key: "conformityRoute",
    label: "For a high-risk system, do published harmonised standards cover its intended purpose, or will a notified body be involved?",
    helper:
      "Harmonised standards → self-assess under presumption of conformity (Annex VI); biometric/some Annex III cases or absence of standards → notified body (Annex VII).",
    options: CONFORMITY_ROUTE_OPTIONS,
    seededFrom: "module-7 Annex I vs III route",
  },
];

// ---------------------------------------------------------------------------
// Upstream context (assembled by the pipeline)
// ---------------------------------------------------------------------------

export interface ObligationContext {
  /** Effective roles after any Module 9 promotion. */
  effectiveRoles: string[];
  promotedByReclassification: boolean;
  definitionClassification: string;
  scopeStatus: string;
  fullyExcluded: boolean;
  exclusionStatus: string;
  prohibitedStatus: string;
  highRiskStatus: string;
  highRiskRegistrationRequired: boolean;
  carveOutApplied: boolean;
  authorisedRepRequired: boolean;
  literacyApplies: boolean;
  art50TriggerIds: string[];
  friaStatus: string;
  gpaiProvider: boolean;
  gpaiSystemicRisk: string;
  matchedAnnexIiiAreas: string[];
}

// ---------------------------------------------------------------------------
// Obligation row definitions
// ---------------------------------------------------------------------------

export type ObligationRowStatus = "likely_applies" | "possibly_applies" | "needs_review";
export type ObligationType = "one_off" | "one_off_then_maintained" | "recurring" | "recurring_event_driven";

export interface ObligationRow {
  obligationId: string;
  name: string;
  dutyHolder: string[];
  legalBasis: string;
  applicableFromDate: string;
  guidanceStatus: GuidanceStatus;
  obligationType: ObligationType;
  status: ObligationRowStatus;
  note?: string;
  /** Module route that owns the detail (for aggregated pointer rows). */
  detailRoute?: string;
}

type Emit = { status: ObligationRowStatus; note?: string } | null;

interface ObligationDefinition {
  obligationId: string;
  name: string;
  dutyHolder: string[];
  legalBasis: string;
  applicableFromDate: string | ((ctx: ObligationContext) => string);
  guidanceStatus: GuidanceStatus;
  obligationType: ObligationType;
  detailRoute?: string;
  trigger: (ctx: ObligationContext, answers: ModuleAnswers) => Emit;
}

const hasRole = (ctx: ObligationContext, role: string) => ctx.effectiveRoles.includes(role);

/** High-risk provider row helper: likely when confirmed, possibly when unresolved. */
function highRiskProviderEmit(ctx: ObligationContext): Emit {
  if (!hasRole(ctx, "Provider")) return null;
  if (ctx.highRiskStatus === "likely_high_risk") return { status: "likely_applies" };
  if (ctx.highRiskStatus === "possibly_high_risk") return { status: "possibly_applies", note: "Module 7 high-risk status unresolved." };
  if (ctx.highRiskStatus === "needs_review") return { status: "needs_review", note: "Module 7 needs review." };
  return null;
}

export const OBLIGATION_DEFINITIONS: ObligationDefinition[] = [
  {
    obligationId: "OBL-ART9-RMS",
    name: "Risk-management system (lifecycle recurring)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 9; Recital 47",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "recurring",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART10-DATA",
    name: "Data and data governance (lifecycle recurring)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 10",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "recurring",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART11-TECHDOC",
    name: "Technical documentation Annex IV (one-off then maintained)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 11; Annex IV",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "one_off_then_maintained",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART12-LOGGING",
    name: "Record-keeping / automatic logging (lifecycle recurring)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 12",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "recurring",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART13-TRANSP-DEPLOYER",
    name: "Transparency & instructions for use to deployers (one-off then maintained) — distinct from Article 50 end-user transparency",
    dutyHolder: ["Provider"],
    legalBasis: "Art 13",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "one_off_then_maintained",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART14-OVERSIGHT",
    name: "Human oversight design measures (lifecycle recurring)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 14",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "recurring",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART15-ACCURACY",
    name: "Accuracy, robustness & cybersecurity (lifecycle recurring)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 15",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "recurring",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART17-QMS",
    name: "Quality management system (lifecycle recurring)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 17",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "recurring",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART26-DEPLOYER",
    name: "Deployer obligations for high-risk systems: use per instructions, human oversight, monitor, keep logs, inform affected workers; FRIA where Art 27 applies via Module 11",
    dutyHolder: ["Deployer"],
    legalBasis: "Art 26",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "recurring",
    trigger: (ctx) => {
      if (!hasRole(ctx, "Deployer")) return null;
      if (ctx.highRiskStatus === "likely_high_risk") return { status: "likely_applies" };
      if (ctx.highRiskStatus === "possibly_high_risk") return { status: "possibly_applies", note: "Module 7 high-risk status unresolved." };
      return null;
    },
  },
  {
    obligationId: "OBL-ART22-AUTHREP",
    name: "Appointment of EU authorised representative (one-off)",
    dutyHolder: ["Provider", "Authorised representative"],
    legalBasis: "Art 22 (high-risk) / Art 54 (GPAI); Art 23 importer / Art 24 distributor reciprocal checks",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "one_off",
    trigger: (ctx, answers) => {
      const outsideEu = answers.establishedOutsideEu === "Yes" || ctx.authorisedRepRequired;
      if (!outsideEu || !hasRole(ctx, "Provider")) return null;
      if (ctx.highRiskStatus === "likely_high_risk" || ctx.gpaiProvider) return { status: "likely_applies" };
      if (ctx.highRiskStatus === "possibly_high_risk") return { status: "possibly_applies", note: "Depends on the unresolved high-risk status." };
      return ctx.authorisedRepRequired ? { status: "likely_applies" } : null;
    },
  },
  {
    obligationId: "OBL-ART43-CONFORMITY",
    name: "Conformity assessment, EU declaration of conformity & CE marking (one-off then on substantial change; route per standards_conformity_route; re-assessment on substantial modification links to Module 9)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 43/47/48",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "one_off",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART49-REGISTER",
    name: "EU database registration (one-off then maintained; non-public variant for law-enforcement/migration/asylum/border, Art 49(4))",
    dutyHolder: ["Provider", "Deployer (public authority)"],
    legalBasis: "Art 49; Annex VIII",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "one_off_then_maintained",
    trigger: (ctx, answers) => {
      const derogationClaimed = ctx.carveOutApplied || answers.art63Documented === "Yes, documented" || answers.art63Documented === "No";
      if (ctx.highRiskStatus === "likely_high_risk" && hasRole(ctx, "Provider")) return { status: "likely_applies" };
      if (ctx.carveOutApplied && hasRole(ctx, "Provider")) return { status: "likely_applies", note: "Registration of the Article 6(3) not-high-risk self-assessment." };
      if (ctx.highRiskStatus === "possibly_high_risk" && hasRole(ctx, "Provider")) return { status: "possibly_applies" };
      return derogationClaimed && hasRole(ctx, "Provider") ? { status: "possibly_applies" } : null;
    },
  },
  {
    obligationId: "OBL-ART6-3-NOTHR-DOC",
    name: "Article 6(3) not-high-risk self-assessment documentation & registration (one-off then maintained)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 6(3)/6(4); Art 49",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "draft", // boundaries depend on the 2026-05-19 draft guidelines
    obligationType: "one_off_then_maintained",
    trigger: (ctx, answers) => {
      if (!hasRole(ctx, "Provider")) return null;
      if (ctx.carveOutApplied) {
        return answers.art63Documented === "Yes, documented"
          ? { status: "likely_applies", note: "Self-assessment reported as documented — keep it maintained and registered." }
          : { status: "likely_applies", note: "Annex III matched but the Art 6(3) derogation is claimed — the self-assessment must be documented and registered." };
      }
      return null;
    },
  },
  {
    obligationId: "OBL-ART72-PMM",
    name: "Post-market monitoring (recurring lifecycle)",
    dutyHolder: ["Provider"],
    legalBasis: "Art 72; Recital 166",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "recurring",
    trigger: highRiskProviderEmit,
  },
  {
    obligationId: "OBL-ART73-INCIDENT",
    name: "Serious-incident reporting (recurring event-driven; readiness = procedure + owner)",
    dutyHolder: ["Provider", "Deployer (reporting via provider)"],
    legalBasis: "Art 73",
    applicableFromDate: APPLICABLE_DATES.highRiskAnnexIII.date,
    guidanceStatus: "provisional",
    obligationType: "recurring_event_driven",
    trigger: (ctx) => {
      if (ctx.highRiskStatus === "likely_high_risk" && (hasRole(ctx, "Provider") || hasRole(ctx, "Deployer"))) return { status: "likely_applies" };
      if (ctx.highRiskStatus === "possibly_high_risk" && (hasRole(ctx, "Provider") || hasRole(ctx, "Deployer"))) return { status: "possibly_applies" };
      return null;
    },
  },
  {
    obligationId: "OBL-ART50-TRANSP-AGG",
    name: "Article 50 transparency (aggregated pointer to Module 11; FRIA sub-trigger via Art 27)",
    dutyHolder: ["Provider", "Deployer"],
    legalBasis: "Art 50; Art 27 (FRIA sub-trigger)",
    applicableFromDate: APPLICABLE_DATES.transparency.date,
    guidanceStatus: "final",
    obligationType: "recurring",
    detailRoute: "/transparency",
    trigger: (ctx) => {
      const substantive = ctx.art50TriggerIds.filter((id) => id !== "TR-R6");
      if (substantive.length > 0) return { status: "likely_applies", note: `Module 11 triggers: ${substantive.join(", ")}${ctx.friaStatus === "likely_required" ? "; FRIA likely required (Art 27)" : ""}.` };
      if (ctx.friaStatus === "likely_required" || ctx.friaStatus === "possibly_required") return { status: "possibly_applies", note: "FRIA trigger via Module 11." };
      return null;
    },
  },
  {
    obligationId: "OBL-ART4-LITERACY",
    name: "AI literacy (aggregated pointer to Module 8)",
    dutyHolder: ["Provider", "Deployer"],
    legalBasis: "Art 4",
    applicableFromDate: APPLICABLE_DATES.aiLiteracy.date,
    guidanceStatus: "final",
    obligationType: "recurring",
    detailRoute: "/ai-literacy",
    trigger: (ctx) => (ctx.literacyApplies ? { status: "likely_applies" } : null),
  },
  {
    obligationId: "OBL-GPAI-AGG",
    name: "GPAI provider obligations (aggregated pointer to Module 10; systemic-risk sub-flag)",
    dutyHolder: ["Provider (GPAI model)"],
    legalBasis: "Art 53 (all) / Art 55 (systemic-risk)",
    applicableFromDate: APPLICABLE_DATES.gpai.date,
    guidanceStatus: "final",
    obligationType: "recurring",
    detailRoute: "/gpai",
    trigger: (ctx) => {
      if (!ctx.gpaiProvider) return null;
      const systemic = ctx.gpaiSystemicRisk === "presumed_by_compute" || ctx.gpaiSystemicRisk === "possible_by_designation";
      return {
        status: "likely_applies",
        note: systemic ? "Systemic-risk sub-flag set — Article 55 duties on top of Article 53." : undefined,
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Matrix assembly
// ---------------------------------------------------------------------------

export interface ObligationMatrixAssessment extends AssessmentCore<"assessed" | "prohibited_short_circuit" | "suppressed_out_of_scope" | "suppressed_gate_not_met"> {
  rows: ObligationRow[];
  likelyCount: number;
  possiblyCount: number;
  needsReviewCount: number;
  effectiveRoles: string[];
  promotedByReclassification: boolean;
  registrationRequired: boolean;
  standardsConformityRoute: string;
  notHighRiskDocumentationFlag: boolean;
  earliestApplicableDate: string | null;
  sourceVersionDate: string;
}

/** Spec-named helper: the prohibited short-circuit row. */
export function applyProhibitedShortCircuit(): ObligationRow[] {
  return [
    {
      obligationId: "OBL-ART5-PROHIBITED",
      name: "Must not place on market, put into service, use, or make available — a likely prohibited practice overrides every other obligation workflow",
      dutyHolder: ["Provider", "Deployer", "Importer", "Distributor"],
      legalBasis: "Art 5; Art 99 (penalties)",
      applicableFromDate: APPLICABLE_DATES.prohibitedPractices.date,
      guidanceStatus: "final",
      obligationType: "one_off",
      status: "likely_applies",
      detailRoute: "/prohibited",
    },
  ];
}

/** Spec-named helper: effective roles after a Module 9 promotion. */
export function applyReclassification(baseRoles: string[], promoted: boolean): string[] {
  const roles = new Set(baseRoles);
  if (promoted) roles.add("Provider");
  return [...roles];
}

/** Spec-named helper: emit the applicable obligation rows for a system. */
export function buildObligationMatrix(ctx: ObligationContext, answers: ModuleAnswers): ObligationRow[] {
  if (ctx.prohibitedStatus === "likely_prohibited") return applyProhibitedShortCircuit();
  if (ctx.scopeStatus === "likely_out_of_scope" || ctx.definitionClassification === "likely_not_ai_system" || ctx.fullyExcluded) {
    return [];
  }

  const roleScope = typeof answers.roleScope === "string" ? answers.roleScope : "All roles held";
  const scoped =
    roleScope !== "All roles held" && roleScope !== "Not sure"
      ? { ...ctx, effectiveRoles: ctx.effectiveRoles.filter((r) => r === roleScope) }
      : ctx;

  const rows: ObligationRow[] = [];
  for (const def of OBLIGATION_DEFINITIONS) {
    const emit = def.trigger(scoped, answers);
    if (!emit) continue;
    rows.push({
      obligationId: def.obligationId,
      name: def.name,
      dutyHolder: def.dutyHolder,
      legalBasis: def.legalBasis,
      applicableFromDate: typeof def.applicableFromDate === "function" ? def.applicableFromDate(scoped) : def.applicableFromDate,
      guidanceStatus: def.guidanceStatus,
      obligationType: def.obligationType,
      status: emit.status,
      note: emit.note,
      detailRoute: def.detailRoute,
    });
  }
  return rows;
}

/** Full Module 12 result object. */
export function buildObligationAssessment(ctx: ObligationContext, answers: ModuleAnswers): ObligationMatrixAssessment {
  const rows = buildObligationMatrix(ctx, answers);

  const suppressed =
    ctx.prohibitedStatus !== "likely_prohibited" &&
    (ctx.scopeStatus === "likely_out_of_scope" || ctx.definitionClassification === "likely_not_ai_system" || ctx.fullyExcluded);

  const status: ObligationMatrixAssessment["status"] =
    ctx.prohibitedStatus === "likely_prohibited"
      ? "prohibited_short_circuit"
      : suppressed
        ? ctx.definitionClassification === "likely_not_ai_system"
          ? "suppressed_gate_not_met"
          : "suppressed_out_of_scope"
        : "assessed";

  const likelyCount = rows.filter((r) => r.status === "likely_applies").length;
  const possiblyCount = rows.filter((r) => r.status === "possibly_applies").length;
  const needsReviewCount = rows.filter((r) => r.status === "needs_review").length;

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [
    "High-risk enforcement dates rest on the unadopted Digital Omnibus (provisional).",
    "High-risk boundaries depend on the 2026-05-19 draft guidelines.",
  ];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [];
  const firedRules: FiredRule[] = rows.map((r) => ({
    ruleId: r.obligationId,
    title: r.name,
    citation: r.legalBasis,
    guidanceStatus: r.guidanceStatus,
    detail: r.note,
  }));

  if (status === "prohibited_short_circuit") {
    negativeIndicators.push("Module 6 flags a likely prohibited practice — the matrix short-circuits to a single 'must not place on market' row.");
  }
  if (suppressed) {
    keyUncertainties.push(
      "Obligation rows are suppressed because the system appears out of scope / not an AI system / fully excluded — if that upstream finding changes, regenerate this matrix."
    );
  }
  if (ctx.promotedByReclassification) {
    positiveIndicators.push("Module 9 reclassification promotes the organisation to Provider — the provider trigger set was re-run.");
  }
  if (ctx.gpaiSystemicRisk === "possible_by_designation" || ctx.gpaiSystemicRisk === "unknown") {
    keyUncertainties.push("GPAI systemic-risk designation is Commission-discretionary and unresolved.");
  }
  keyUncertainties.push("Whether the Article 4 AI-literacy duty stays an obligation of result depends on the pending Omnibus.");

  // Confidence per spec.
  let score = 100;
  if (["possibly_high_risk", "needs_review"].includes(ctx.highRiskStatus)) score -= 20;
  if (ctx.effectiveRoles.length === 0) {
    score -= 15;
    missingFields.push("module-2 entity role");
    recommendedNextQuestions.push("Complete the Module 2 role questionnaire.");
  }
  if (ctx.promotedByReclassification === false && answers.changedSinceMarket === "Yes") {
    score -= 15;
    keyUncertainties.push("A change since market placement is reported but Module 9 has not (yet) confirmed a reclassification — resolve it before relying on the role set.");
  }
  for (const k of ["roleScope", "changedSinceMarket", "art63Documented", "establishedOutsideEu", "conformityRoute"]) {
    if (answers[k] === "Not sure") score -= 10;
  }
  if (["needs_review", "possibly_in_scope"].includes(ctx.scopeStatus)) score -= 20;
  const confidenceScore = clampScore(score);

  const conformityAnswer = typeof answers.conformityRoute === "string" ? answers.conformityRoute : undefined;
  const standardsConformityRoute =
    conformityAnswer === "Harmonised standards apply"
      ? "Annex VI internal control under the presumption of conformity (harmonised standards)."
      : conformityAnswer === "Notified body required"
        ? "Annex VII notified-body conformity assessment."
        : conformityAnswer === "No standards published yet"
          ? "No harmonised standards published yet — notified body / internal control per Art 43; schedule risk."
          : rows.some((r) => r.obligationId === "OBL-ART43-CONFORMITY")
            ? "Route unresolved — harmonised-standards presumption vs notified body (many standards not yet published)."
            : "not_applicable";

  const registrationRequired = rows.some((r) => r.obligationId === "OBL-ART49-REGISTER");
  const notHighRiskDocumentationFlag = rows.some((r) => r.obligationId === "OBL-ART6-3-NOTHR-DOC");
  const earliestApplicableDate = rows.length > 0 ? rows.map((r) => r.applicableFromDate).sort()[0] : null;

  const reasoningSummary =
    status === "assessed"
      ? `Obligations identified: ${likelyCount} likely, ${possiblyCount} possibly, ${needsReviewCount} needs review — for role(s): ${ctx.effectiveRoles.join(", ") || "unknown"}${ctx.promotedByReclassification ? " (incl. Module 9 promotion to Provider)" : ""}.`
      : status === "prohibited_short_circuit"
        ? "Prohibited-practice short-circuit: the only operative obligation is not to place the system on the market / put it into service / use it."
        : "Obligation rows suppressed — the system appears out of scope, not an AI system, or fully excluded (see the consistency warning).";

  return {
    status,
    confidenceScore,
    confidenceLabel: confidenceLabelFor(confidenceScore),
    reasoningSummary,
    positiveIndicators,
    negativeIndicators,
    keyUncertainties,
    missingFields,
    recommendedNextQuestions,
    firedRules,
    rows,
    likelyCount,
    possiblyCount,
    needsReviewCount,
    effectiveRoles: ctx.effectiveRoles,
    promotedByReclassification: ctx.promotedByReclassification,
    registrationRequired,
    standardsConformityRoute,
    notHighRiskDocumentationFlag,
    earliestApplicableDate,
    sourceVersionDate: SOURCE_VERSION_DATE,
  };
}
