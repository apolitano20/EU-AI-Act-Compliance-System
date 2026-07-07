// Module 15 — Final Report Generator (modules_mds/module-15-final-report-generator.md).
// Performs NO new classification: reads the result objects of Modules 1-14,
// joins them on system id, cites legal_basis_citation per obligation, and
// rolls per-system statuses, readiness scores and remediation progress into an
// organisation-level report. Its distinctive job is provenance and honesty:
// anything resting on non-final text (May 2026 Digital Omnibus, 2026-05-19
// draft high-risk guidelines) is badged and collected into a dedicated
// appendix — never presented as settled law. Pure aggregation only.
//
// The deterministic approach (guidance-status badging, uncertain-value
// skipping, per-obligation citation) mirrors the report prototype in
// eu-ai-act-modules/generate_report.py.

import { clampScore, confidenceLabelFor, SOURCE_VERSION_DATE, type ConfidenceLabel, type GuidanceStatus } from "@/lib/assessment-shared";
import type { AssessmentBundle } from "@/lib/assessment-pipeline";
import type { RemediationItem } from "@/generated/prisma/client";

export type RiskTier = "prohibited_flag" | "likely_high_risk" | "possibly_high_risk" | "not_high_risk" | "out_of_scope_or_excluded" | "needs_review";

export interface RegisterRow {
  systemId: string;
  systemName: string;
  riskTier: RiskTier;
  roles: string[];
  obligationId: string;
  obligationName: string;
  dutyHolder: string[];
  legalBasisCitation: string;
  applicableFromDate: string;
  guidanceStatus: GuidanceStatus;
  obligationStatus: string;
  readinessStatus: string;
  remediationStatus: string | null;
  owner: string | null;
  dueDate: Date | null;
}

export interface SystemReport {
  systemId: string;
  systemName: string;
  shortDescription: string;
  riskTier: RiskTier;
  roles: string[];
  promotedByReclassification: boolean;
  moduleStatuses: Array<{ module: string; route: string; status: string; confidenceLabel: string; note?: string }>;
  register: RegisterRow[];
  readinessScore: number;
  applicableObligations: number;
  remediation: { total: number; closed: number; open: number; unassigned: number; recurringActive: number };
  registrationRequired: boolean;
  standardsConformityRoute: string;
  notHighRiskDocumentationFlag: boolean;
  consistencyWarnings: string[];
  /** Minimum upstream confidence across the classification modules. */
  minUpstreamConfidence: number;
  missingUpstream: string[];
}

export function riskTierOf(bundle: AssessmentBundle): RiskTier {
  if (bundle.prohibited.status === "likely_prohibited" || bundle.prohibited.status === "possibly_prohibited") return "prohibited_flag";
  if (bundle.obligations.status === "suppressed_out_of_scope" || bundle.obligations.status === "suppressed_gate_not_met") return "out_of_scope_or_excluded";
  if (bundle.highRisk.status === "likely_high_risk") return "likely_high_risk";
  if (bundle.highRisk.status === "possibly_high_risk") return "possibly_high_risk";
  if (bundle.highRisk.status === "likely_not_high_risk" || bundle.highRisk.status === "not_high_risk_carve_out") return "not_high_risk";
  return "needs_review";
}

export const RISK_TIER_LABELS: Record<RiskTier, string> = {
  prohibited_flag: "Prohibited-practice flag",
  likely_high_risk: "Likely high-risk",
  possibly_high_risk: "Possibly high-risk (needs review)",
  not_high_risk: "Not high-risk",
  out_of_scope_or_excluded: "Out of scope / excluded / gate not met",
  needs_review: "Needs review",
};

/** Spec-named helper: join Modules 1-14 for one system. */
export function assembleSystemReport(bundle: AssessmentBundle, remediationItems: RemediationItem[]): SystemReport {
  const riskTier = riskTierOf(bundle);
  const readiness = bundle.readiness;
  const itemsByObligation = new Map(remediationItems.map((i) => [i.obligationId, i]));

  const register: RegisterRow[] = bundle.obligations.rows.map((o) => {
    const evidence = readiness.checklist.find((r) => r.obligationId === o.obligationId);
    const item = itemsByObligation.get(o.obligationId) ?? null;
    return {
      systemId: bundle.system.id,
      systemName: bundle.system.systemName,
      riskTier,
      roles: bundle.obligations.effectiveRoles,
      obligationId: o.obligationId,
      obligationName: o.name,
      dutyHolder: o.dutyHolder,
      legalBasisCitation: o.legalBasis, // carried through verbatim — the report cites, it does not invent
      applicableFromDate: o.applicableFromDate,
      guidanceStatus: o.guidanceStatus,
      obligationStatus: o.status,
      readinessStatus: evidence?.readinessStatus ?? "not_evidenced",
      remediationStatus: item?.status ?? null,
      owner: item?.owner ?? null,
      dueDate: item?.dueDate ?? item?.nextDueAt ?? null,
    };
  });

  const closed = remediationItems.filter((i) => ["completed", "verified"].includes(i.status)).length;
  const moduleStatuses = [
    { module: "M2 Entity role", route: "/entity-type", status: bundle.role.likelyRoles.join(", ") || "unresolved", confidenceLabel: bundle.role.confidenceLabel },
    { module: "M3 AI-system definition gate", route: "/ai-system-definition", status: bundle.definition.classification, confidenceLabel: bundle.definition.confidenceLabel },
    { module: "M4 EU scope", route: "/eu-scope", status: bundle.scope.status, confidenceLabel: bundle.scope.confidenceLabel, note: bundle.scope.authorisedRepRequired ? "authorised representative required (Art 22/54)" : undefined },
    { module: "M5 Exclusions", route: "/exclusions", status: bundle.exclusions.status, confidenceLabel: bundle.exclusions.confidenceLabel },
    { module: "M6 Prohibited practices", route: "/prohibited", status: bundle.prohibited.status, confidenceLabel: bundle.prohibited.confidenceLabel },
    { module: "M7 High-risk classification", route: "/high-risk", status: bundle.highRisk.status, confidenceLabel: bundle.highRisk.confidenceLabel, note: bundle.highRisk.notHighRiskDocumentationFlag ? "Art 6(3) self-assessment outstanding — not 'nothing to do'" : undefined },
    { module: "M8 AI literacy", route: "/ai-literacy", status: bundle.literacy.status, confidenceLabel: bundle.literacy.confidenceLabel },
    { module: "M9 Reclassification", route: "/reclassification", status: bundle.reclassification.status, confidenceLabel: bundle.reclassification.confidenceLabel, note: bundle.reclassification.anyTriggerFired ? `promoted to Provider (${Object.entries(bundle.reclassification.triggerFlags).filter(([, v]) => v).map(([k]) => k).join(", ")})` : undefined },
    { module: "M10 GPAI", route: "/gpai", status: bundle.gpai.status, confidenceLabel: bundle.gpai.confidenceLabel },
    { module: "M11 Transparency / FRIA", route: "/transparency", status: `${bundle.transparency.status}; FRIA: ${bundle.transparency.friaStatus}`, confidenceLabel: bundle.transparency.confidenceLabel },
    { module: "M12 Obligations matrix", route: "/obligations", status: bundle.obligations.reasoningSummary, confidenceLabel: bundle.obligations.confidenceLabel },
    { module: "M13 Readiness", route: "/readiness", status: `${readiness.readinessScore}/100 (${readiness.counts.evidence_in_place}/${readiness.applicableCount} in place)`, confidenceLabel: readiness.confidenceLabel },
    { module: "M14 Remediation", route: "/remediation", status: `${closed}/${remediationItems.length} closed`, confidenceLabel: remediationItems.length > 0 ? "high" : "insufficient_information" },
  ];

  const consistencyWarnings: string[] = [];
  if (bundle.role.likelyRoles.length === 0 || ["low", "insufficient_information"].includes(bundle.role.confidenceLabel)) {
    consistencyWarnings.push("This system's obligation set rests on a Module 2 role still marked needs review; the reported obligations may change once the role is confirmed.");
  }
  if (["possibly_high_risk", "needs_review"].includes(bundle.highRisk.status)) {
    consistencyWarnings.push("The Module 7 high-risk status is unresolved — the obligation set and readiness gaps may be over/under-stated.");
  }
  if (["needs_review", "possibly_in_scope"].includes(bundle.scope.status)) {
    consistencyWarnings.push("The Module 4 scope status is unresolved.");
  }
  if (bundle.reclassification.anyTriggerFired) {
    consistencyWarnings.push("A Module 9 reclassification fired — the expanded provider obligation set is shown; regenerate the remediation plan if built before the trigger.");
  }
  if (bundle.obligations.standardsConformityRoute.includes("not yet published") || bundle.obligations.standardsConformityRoute.includes("unresolved")) {
    consistencyWarnings.push("Conformity route unsettled — schedule risk where harmonised standards are not yet published.");
  }

  const upstreamConfidences = [
    bundle.role.confidenceScore, bundle.definition.confidenceScore, bundle.scope.confidenceScore,
    bundle.exclusions.confidenceScore, bundle.prohibited.confidenceScore, bundle.highRisk.confidenceScore,
  ];
  const missingUpstream: string[] = [];
  if (readiness.checklist.length > 0 && readiness.checklist.every((r) => r.answer === null)) missingUpstream.push("Module 13 evidence states not answered");
  if (remediationItems.length === 0 && readiness.checklist.some((r) => ["evidence_gap", "not_started", "unknown_evidence_state", "partial_evidence"].includes(r.readinessStatus))) {
    missingUpstream.push("Module 14 plan not generated for existing gaps");
  }

  return {
    systemId: bundle.system.id,
    systemName: bundle.system.systemName,
    shortDescription: bundle.system.shortDescription,
    riskTier,
    roles: bundle.obligations.effectiveRoles,
    promotedByReclassification: bundle.obligations.promotedByReclassification,
    moduleStatuses,
    register,
    readinessScore: readiness.readinessScore,
    applicableObligations: readiness.applicableCount,
    remediation: {
      total: remediationItems.length,
      closed,
      open: remediationItems.filter((i) => !["completed", "verified", "not_applicable"].includes(i.status)).length,
      unassigned: remediationItems.filter((i) => !i.owner).length,
      recurringActive: remediationItems.filter((i) => i.recurrenceKind !== "one_off" && i.status !== "not_applicable").length,
    },
    registrationRequired: bundle.obligations.registrationRequired,
    standardsConformityRoute: bundle.obligations.standardsConformityRoute,
    notHighRiskDocumentationFlag: bundle.obligations.notHighRiskDocumentationFlag,
    consistencyWarnings,
    minUpstreamConfidence: Math.min(...upstreamConfidences),
    missingUpstream,
  };
}

export interface NonFinalGuidanceEntry {
  systemName: string;
  obligationId: string;
  obligationName: string;
  legalBasisCitation: string;
  applicableFromDate: string;
  guidanceStatus: GuidanceStatus;
  source: string;
}

/** Spec-named helper: the dedicated draft/provisional-guidance appendix. */
export function collectNonFinalGuidance(register: RegisterRow[]): NonFinalGuidanceEntry[] {
  return register
    .filter((r) => r.guidanceStatus === "provisional" || r.guidanceStatus === "draft")
    .map((r) => ({
      systemName: r.systemName,
      obligationId: r.obligationId,
      obligationName: r.obligationName,
      legalBasisCitation: r.legalBasisCitation,
      applicableFromDate: r.applicableFromDate,
      guidanceStatus: r.guidanceStatus,
      source:
        r.guidanceStatus === "draft"
          ? "Draft Commission high-risk classification guidelines, 2026-05-19 (consultation closed 2026-06-23; not final)"
          : "Digital Omnibus provisional agreement, 2026-05-07 (enforcement-date deferral; final text not yet adopted)",
    }));
}

export interface OrganisationRollUp {
  systemsCovered: number;
  countsByTier: Record<RiskTier, number>;
  averageReadiness: number;
  totalObligations: number;
  nonFinalObligations: number;
  openRemediation: number;
  unassignedRemediation: number;
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  headline: string;
}

/** Spec-named helper: organisation-level roll-up (aggregation only). */
export function rollUpOrganisation(reports: SystemReport[]): OrganisationRollUp {
  const countsByTier: Record<RiskTier, number> = {
    prohibited_flag: 0, likely_high_risk: 0, possibly_high_risk: 0, not_high_risk: 0, out_of_scope_or_excluded: 0, needs_review: 0,
  };
  for (const r of reports) countsByTier[r.riskTier] += 1;

  const withObligations = reports.filter((r) => r.applicableObligations > 0);
  const averageReadiness =
    withObligations.length > 0 ? Math.round(withObligations.reduce((s, r) => s + r.readinessScore, 0) / withObligations.length) : 0;
  const allRegister = reports.flatMap((r) => r.register);
  const nonFinal = collectNonFinalGuidance(allRegister).length;

  // Coverage-weighted confidence: average of per-system minimum upstream
  // confidences, minus penalties for needs-review tiers and missing modules.
  let score =
    reports.length > 0 ? reports.reduce((s, r) => s + r.minUpstreamConfidence, 0) / reports.length : 0;
  score -= 10 * reports.filter((r) => r.riskTier === "needs_review" || r.riskTier === "possibly_high_risk").length;
  score -= 5 * reports.filter((r) => r.missingUpstream.length > 0).length;
  const confidenceScore = clampScore(score);

  const headline =
    `${reports.length} systems assessed: ${countsByTier.likely_high_risk} likely high-risk, ` +
    `${countsByTier.possibly_high_risk} possible high-risk needs review, ${countsByTier.not_high_risk} not high-risk, ` +
    `${countsByTier.prohibited_flag} prohibited-practice flags, ${countsByTier.out_of_scope_or_excluded} out of scope/excluded.`;

  return {
    systemsCovered: reports.length,
    countsByTier,
    averageReadiness,
    totalObligations: allRegister.length,
    nonFinalObligations: nonFinal,
    openRemediation: reports.reduce((s, r) => s + r.remediation.open, 0),
    unassignedRemediation: reports.reduce((s, r) => s + r.remediation.unassigned, 0),
    confidenceScore,
    confidenceLabel: confidenceLabelFor(confidenceScore),
    headline,
  };
}

// ---------------------------------------------------------------------------
// Report scoping (searchParams-driven — presentation only, never mutates data)
// ---------------------------------------------------------------------------

export type ReportScope = "all" | "high-risk" | "provider" | "deployer";
export type BadgeMode = "include_and_badge" | "include_without_badge" | "exclude_non_final";
export type Audience = "internal" | "board" | "auditor";
export type RemediationDetail = "full" | "summary";

export interface ReportOptions {
  scope: ReportScope;
  badgeMode: BadgeMode;
  audience: Audience;
  remediationDetail: RemediationDetail;
}

export function parseReportOptions(params: Record<string, string | string[] | undefined>): ReportOptions {
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const scope = pick(params.scope);
  const badge = pick(params.badge);
  const audience = pick(params.audience);
  const remediation = pick(params.remediation);
  return {
    scope: scope === "high-risk" || scope === "provider" || scope === "deployer" ? scope : "all",
    badgeMode: badge === "include_without_badge" || badge === "exclude_non_final" ? badge : "include_and_badge",
    audience: audience === "board" || audience === "auditor" ? audience : "internal",
    remediationDetail: remediation === "summary" ? "summary" : "full",
  };
}

export interface FinalReport {
  options: ReportOptions;
  reports: SystemReport[];
  rollUp: OrganisationRollUp;
  register: RegisterRow[];
  nonFinalAppendix: NonFinalGuidanceEntry[];
  consistencyWarnings: Array<{ systemName: string; warning: string }>;
  sourceVersionDate: string;
  assumptions: string[];
}

/** Spec-named helper: assemble the scoped final report. */
export function buildFinalReport(allReports: SystemReport[], options: ReportOptions): FinalReport {
  const scoped = allReports.filter((r) => {
    if (options.scope === "high-risk") return r.riskTier === "likely_high_risk" || r.riskTier === "possibly_high_risk";
    if (options.scope === "provider") return r.roles.includes("Provider");
    if (options.scope === "deployer") return r.roles.includes("Deployer");
    return true;
  });

  let register = scoped.flatMap((r) => r.register);
  // The appendix is ALWAYS built before any exclusion, so non-final duties are
  // never silently dropped — this is the module's headline behaviour.
  const nonFinalAppendix = collectNonFinalGuidance(register);
  if (options.badgeMode === "exclude_non_final") {
    register = register.filter((r) => r.guidanceStatus === "final");
  }

  return {
    options,
    reports: scoped,
    rollUp: rollUpOrganisation(scoped),
    register,
    nonFinalAppendix,
    consistencyWarnings: scoped.flatMap((r) => r.consistencyWarnings.map((warning) => ({ systemName: r.systemName, warning }))),
    sourceVersionDate: SOURCE_VERSION_DATE,
    assumptions: [
      `Rules version / date checked: ${SOURCE_VERSION_DATE}.`,
      "Guidance versions: EU AI Act final text; Digital Omnibus provisional agreement 2026-05-07 (not adopted); draft high-risk classification guidelines 2026-05-19 (consultation closed 2026-06-23).",
      "Split timeline: prohibited practices 2025-02-02 (final), AI literacy 2025-02-02 (final, possibly softened), GPAI 2025-08-02 (final), transparency 2026-08-02 (final), Annex III high-risk 2027-12-02 (provisional), Annex I high-risk 2028-08-02 (provisional).",
      "This report is a readiness snapshot, not an attestation — statuses use likely/possible/needs-review wording and remediation progress is not compliance.",
      options.badgeMode === "exclude_non_final"
        ? "Non-final rules are EXCLUDED from the register at the requester's option — this risks under-stating future duties; the appendix still lists them."
        : "Obligations resting on draft/provisional guidance are included and badged (conservative default).",
    ],
  };
}
