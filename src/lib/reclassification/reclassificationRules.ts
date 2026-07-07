// Module 9 — Value-Chain Reclassification (modules_mds/module-9-value-chain-reclassification.md).
// Article 25 converts a distributor/importer/deployer/other third party into a
// "provider" of a high-risk system in three cases: (a) rebranding, (b)
// substantial modification, (c) purpose change to high-risk. This module is
// the AUTHORITATIVE writer of reclassification_trigger_flags consumed
// downstream (Module 12). Pure rules only.

import { YES_NO_NOT_SURE } from "@/lib/options";
import {
  clampScore,
  confidenceLabelFor,
  SOURCE_VERSION_DATE,
  type AssessmentCore,
  type FiredRule,
  type GuidanceStatus,
  type ModuleAnswers,
  type ModuleQuestion,
} from "@/lib/assessment-shared";

export const RECLASSIFICATION_MODULE_KEY = "reclassification" as const;

// ---------------------------------------------------------------------------
// Questionnaire
// ---------------------------------------------------------------------------

export const SUBSTANTIAL_MOD_OPTIONS = ["Yes", "No", "Not sure", "Not applicable (not high-risk)"] as const;
export const CURRENT_ROLE_OPTIONS = ["Deployer", "Distributor", "Importer", "Other third party", "Already the provider", "Not sure"] as const;

export const RECLASSIFICATION_QUESTIONS: ModuleQuestion[] = [
  {
    key: "ownNameOrTrademark",
    label: "Have you placed your own name or trademark on an AI system originally provided by someone else?",
    helper: "Rebranding/white-labelling makes you its provider for AI Act purposes even if you did not build it.",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-2 Article 25 conversion-risk answers",
  },
  {
    key: "substantialModification",
    label: "Have you made a substantial modification to a high-risk AI system after it was placed on the market/put into service?",
    helper:
      "A 'substantial modification' (Art 3(23)) is a change not foreseen in the original conformity assessment that either affects compliance with the high-risk requirements or changes intended purpose; a pre-planned, already-assessed change is NOT substantial; routine in-scope retraining generally does not qualify.",
    options: SUBSTANTIAL_MOD_OPTIONS,
    seededFrom: "module-2 flag; module-7 status",
  },
  {
    key: "purposeChangedToHighRisk",
    label: "Have you changed the intended purpose of an AI system (including a GPAI system) in a way that turns it into a high-risk system?",
    helper: "E.g. taking a general-purpose model and deploying it to score creditworthiness or filter job applicants.",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-2 flag; module-7 use-case mapping",
  },
  {
    key: "currentRole",
    label: "What is your current role for this system before any reclassification?",
    helper:
      "Only deployers, distributors, importers or other third parties can be converted into providers; if you are already the original provider this module does not apply.",
    options: CURRENT_ROLE_OPTIONS,
    seededFrom: "module-2 role",
  },
];

// ---------------------------------------------------------------------------
// Deterministic rules
// ---------------------------------------------------------------------------

export interface ReclassificationRuleDefinition {
  id: string;
  title: string;
  citation: string;
  guidanceStatus: GuidanceStatus;
  applicableFromDate?: string;
}

export const RECLASSIFICATION_RULES: ReclassificationRuleDefinition[] = [
  {
    id: "VCR-1",
    title: "Rebrand: own name/trademark on a third-party high-risk system → reclassify to provider",
    citation: "Art 25(1)(a)",
    guidanceStatus: "final",
    applicableFromDate: "2026-08-02", // note the Annex III → 2027-12-02 and Annex I → 2028-08-02 Digital Omnibus timeline split
  },
  {
    id: "VCR-2",
    title: "Substantial modification of a high-risk system that remains high-risk → reclassify to provider (two-prong Art 3(23) test)",
    citation: "Art 25(1)(b); Art 3(23)",
    guidanceStatus: "final",
  },
  {
    id: "VCR-3",
    title: "Purpose change turning a system (incl. GPAI) into high-risk → reclassify to provider",
    citation: "Art 25(1)(c)",
    guidanceStatus: "final",
  },
  {
    id: "VCR-4",
    title: "Original-provider cooperation: the original provider ceases to be provider but keeps Art 25(2)-(3) duties (documentation, information, reasonable access)",
    citation: "Art 25(2), 25(3)",
    guidanceStatus: "final",
  },
  {
    id: "VCR-5",
    title: "Draft-guidelines caveat: the 'substantial modification' / 'becomes high-risk' boundary depends partly on the 2026-05-19 draft guidelines — borderline determinations are needs-review",
    citation: "2026-05-19 draft high-risk classification guidelines",
    guidanceStatus: "draft",
  },
];

const RULE_BY_ID = new Map(RECLASSIFICATION_RULES.map((r) => [r.id, r]));

function fireVcrRule(id: string, detail?: string): FiredRule {
  const rule = RULE_BY_ID.get(id);
  if (!rule) throw new Error(`Unknown reclassification rule: ${id}`);
  return { ruleId: rule.id, title: rule.title, citation: rule.citation, guidanceStatus: rule.guidanceStatus, detail };
}

// ---------------------------------------------------------------------------
// Answer seeding from Modules 2 + 7
// ---------------------------------------------------------------------------

export interface ReclassificationUpstream {
  likelyRoles: string[];
  /** Module 2 Section G raw signals. */
  rebrandedThirdPartySystem?: string;
  substantiallyModifiedSystem?: string;
  changedIntendedPurpose?: string;
  /** Module 7 outcome. */
  highRiskStatus: string;
}

const mapYesNo = (v?: string) => (v === "Yes" || v === "No" || v === "Not sure" ? v : undefined);

export function deriveReclassificationAnswers(upstream: ReclassificationUpstream): ModuleAnswers {
  const d: ModuleAnswers = {};

  const rebrand = mapYesNo(upstream.rebrandedThirdPartySystem);
  if (rebrand) d.ownNameOrTrademark = rebrand;

  if (upstream.substantiallyModifiedSystem === "Yes" || upstream.substantiallyModifiedSystem === "No" || upstream.substantiallyModifiedSystem === "Not sure") {
    d.substantialModification =
      upstream.highRiskStatus === "likely_not_high_risk" && upstream.substantiallyModifiedSystem !== "Yes"
        ? "Not applicable (not high-risk)"
        : upstream.substantiallyModifiedSystem;
  }

  if (upstream.changedIntendedPurpose === "No") d.purposeChangedToHighRisk = "No";
  if (upstream.changedIntendedPurpose === "Yes") {
    d.purposeChangedToHighRisk =
      upstream.highRiskStatus === "likely_high_risk" || upstream.highRiskStatus === "possibly_high_risk" ? "Yes" : "Not sure";
  }

  const roles = upstream.likelyRoles;
  if (roles.includes("Provider")) d.currentRole = "Already the provider";
  else if (roles.includes("Deployer")) d.currentRole = "Deployer";
  else if (roles.includes("Distributor")) d.currentRole = "Distributor";
  else if (roles.includes("Importer")) d.currentRole = "Importer";

  return d;
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export type ReclassificationStatus =
  | "reclassification_likely_triggered"
  | "no_reclassification"
  | "needs_review"
  | "not_applicable_original_provider";

export const RECLASSIFICATION_STATUS_TEXT: Record<ReclassificationStatus, string> = {
  reclassification_likely_triggered: "Provider reclassification likely triggered — full provider obligation set now applies",
  no_reclassification: "No reclassification on the current answers",
  needs_review: "Needs review — determination relies on unsettled answers or draft guidelines",
  not_applicable_original_provider: "Not applicable — already the original provider",
};

export interface ReclassificationTriggerFlags {
  rebranded: boolean;
  substantialModification: boolean;
  purposeChangedToHighRisk: boolean;
}

export interface ReclassificationAssessment extends AssessmentCore<ReclassificationStatus> {
  /** Authoritative flags consumed by Module 12. */
  triggerFlags: ReclassificationTriggerFlags;
  anyTriggerFired: boolean;
  newRole: "Provider" | null;
  originalProviderCooperation: string | null;
  registrationRequired: boolean;
  standardsConformityRoute: string;
  notHighRiskDocumentationFlag: boolean;
  roleConditionalObligation: string;
  sourceVersionDate: string;
}

function answerStr(answers: ModuleAnswers, key: string): string | undefined {
  const v = answers[key];
  return typeof v === "string" ? v : undefined;
}

const CONVERTIBLE_ROLES = ["Deployer", "Distributor", "Importer", "Other third party"];

/** Spec-named helper: evaluate the three Article 25 triggers. */
export function evaluateReclassificationTriggers(
  answers: ModuleAnswers,
  upstream: { highRiskStatus: string }
): { flags: ReclassificationTriggerFlags; pending: string[]; draftReliant: boolean } {
  const role = answerStr(answers, "currentRole");
  const convertible = !!role && CONVERTIBLE_ROLES.includes(role);
  const highRiskConfirmed = upstream.highRiskStatus === "likely_high_risk";
  const highRiskUncertain = ["possibly_high_risk", "needs_review"].includes(upstream.highRiskStatus);

  const flags: ReclassificationTriggerFlags = { rebranded: false, substantialModification: false, purposeChangedToHighRisk: false };
  const pending: string[] = [];
  let draftReliant = false;

  if (!convertible) return { flags, pending, draftReliant };

  // VCR-1: rebrand of a high-risk system.
  if (answerStr(answers, "ownNameOrTrademark") === "Yes") {
    if (highRiskConfirmed) flags.rebranded = true;
    else if (highRiskUncertain) {
      pending.push("VCR-1: rebranding reported, but the Module 7 high-risk status is unconfirmed.");
      draftReliant = true;
    }
  } else if (answerStr(answers, "ownNameOrTrademark") === "Not sure") {
    pending.push("VCR-1: whether the system carries your own name/trademark is unknown.");
  }

  // VCR-2: substantial modification of a system that remains high-risk.
  if (answerStr(answers, "substantialModification") === "Yes") {
    if (highRiskConfirmed) {
      flags.substantialModification = true;
      draftReliant = true; // Art 3(23) boundary partly rests on the draft guidelines
    } else if (highRiskUncertain) {
      pending.push("VCR-2: substantial modification reported, but whether the system remains high-risk is unconfirmed.");
      draftReliant = true;
    }
  } else if (answerStr(answers, "substantialModification") === "Not sure") {
    pending.push("VCR-2: whether the change qualifies as a 'substantial modification' (Art 3(23)) is unknown — the boundary partly rests on the 2026-05-19 draft guidelines.");
    draftReliant = true;
  }

  // VCR-3: purpose change into high-risk.
  if (answerStr(answers, "purposeChangedToHighRisk") === "Yes") {
    if (highRiskConfirmed || highRiskUncertain) {
      if (highRiskConfirmed) flags.purposeChangedToHighRisk = true;
      else {
        pending.push("VCR-3: a purpose change is reported, but the resulting Module 7 high-risk outcome is unconfirmed.");
        draftReliant = true;
      }
    } else {
      pending.push("VCR-3: a purpose change is reported but Module 7 does not (yet) classify the system as high-risk — re-run Module 7 for the new purpose.");
      draftReliant = true;
    }
  } else if (answerStr(answers, "purposeChangedToHighRisk") === "Not sure") {
    pending.push("VCR-3: whether the intended purpose changed into a high-risk use is unknown.");
  }

  return { flags, pending, draftReliant };
}

/** Spec-named helper: full Module 9 result object. */
export function buildReclassificationAssessment(
  answers: ModuleAnswers,
  upstream: { highRiskStatus: string; roleConfidenceLabel: string; purposeChangeReported?: boolean }
): ReclassificationAssessment {
  const role = answerStr(answers, "currentRole");
  const { flags, pending, draftReliant } = evaluateReclassificationTriggers(answers, upstream);
  const anyTriggerFired = flags.rebranded || flags.substantialModification || flags.purposeChangedToHighRisk;

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [...pending];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [];
  const firedRules: FiredRule[] = [];

  let status: ReclassificationStatus;
  if (role === "Already the provider") {
    status = "not_applicable_original_provider";
    negativeIndicators.push("Already the original provider — Article 25 conversion does not apply.");
  } else if (anyTriggerFired) {
    status = "reclassification_likely_triggered";
    if (flags.rebranded) {
      firedRules.push(fireVcrRule("VCR-1"));
      positiveIndicators.push("Own name/trademark placed on a third-party high-risk system (rebrand trigger).");
    }
    if (flags.substantialModification) {
      firedRules.push(fireVcrRule("VCR-2"));
      positiveIndicators.push("Substantial modification of a high-risk system after market placement (Art 3(23) two-prong test).");
    }
    if (flags.purposeChangedToHighRisk) {
      firedRules.push(fireVcrRule("VCR-3"));
      positiveIndicators.push("Intended purpose changed such that the system is now high-risk (applies to GPAI systems too).");
    }
    firedRules.push(fireVcrRule("VCR-4"));
  } else if (pending.length > 0 || !role || role === "Not sure") {
    status = "needs_review";
    if (!role || role === "Not sure") missingFields.push("current role before reclassification (module-2)");
  } else {
    status = "no_reclassification";
    negativeIndicators.push("None of the three Article 25 triggers (rebrand, substantial modification, purpose change) fires on the current answers.");
  }

  if (draftReliant) {
    firedRules.push(fireVcrRule("VCR-5"));
    keyUncertainties.push(
      "The precise boundary of 'substantial modification' and 'becomes high-risk' depends partly on the 2026-05-19 draft Commission guidelines (not final)."
    );
  }

  if (["possibly_high_risk", "needs_review"].includes(upstream.highRiskStatus)) {
    keyUncertainties.push("The underlying Module 7 high-risk status must be settled before triggers (b)/(c) can be confirmed.");
    recommendedNextQuestions.push("Complete the Module 7 high-risk classification for this system (post-change purpose).");
  }
  missingFields.push(
    ...(answerStr(answers, "substantialModification") === "Yes" || answerStr(answers, "purposeChangedToHighRisk") === "Yes"
      ? ["detail of the modification/purpose change (only signalled by the module-2 flag)"]
      : [])
  );
  recommendedNextQuestions.push("Document what exactly was modified/rebranded/repurposed and when, relative to the original conformity assessment.");

  // Confidence baseline 75 (medium) — the operative predicates are
  // judgement-laden and partly rest on non-final guidelines.
  let score = 75;
  if (!role || role === "Not sure") score -= 20;
  if (pending.length > 0) score -= 10 * Math.min(pending.length, 3);
  if (["possibly_high_risk", "needs_review"].includes(upstream.highRiskStatus)) score -= 15;
  if (upstream.roleConfidenceLabel === "low" || upstream.roleConfidenceLabel === "insufficient_information") score -= 10;
  if (status === "not_applicable_original_provider") score = 85;
  const confidenceScore = clampScore(score);

  // Where a purpose change was assessed and the result is NOT high-risk, the
  // Article 6(3) self-assessment must be retained and registered — "no
  // reclassification" ≠ "nothing to document".
  const notHighRiskDocumentationFlag =
    !!upstream.purposeChangeReported &&
    !flags.purposeChangedToHighRisk &&
    ["likely_not_high_risk", "not_high_risk_carve_out"].includes(upstream.highRiskStatus);
  if (notHighRiskDocumentationFlag) {
    keyUncertainties.push(
      "A purpose change was reported but the post-change assessment is not high-risk — retain and register the Article 6(3) self-assessment."
    );
  }

  const reasoningSummary =
    status === "reclassification_likely_triggered"
      ? `Article 25 trigger(s) fired: ${[
          flags.rebranded && "rebrand (Art 25(1)(a))",
          flags.substantialModification && "substantial modification (Art 25(1)(b))",
          flags.purposeChangedToHighRisk && "purpose change to high-risk (Art 25(1)(c))",
        ]
          .filter(Boolean)
          .join(", ")} — the organisation is promoted to provider with the full Article 16 obligation set; the original provider retains Art 25(2)-(3) cooperation duties. Module 12 must be regenerated under the provider role.`
      : RECLASSIFICATION_STATUS_TEXT[status] + (pending.length > 0 ? ` Pending: ${pending.join(" ")}` : "");

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
    triggerFlags: flags,
    anyTriggerFired,
    newRole: anyTriggerFired ? "Provider" : null,
    originalProviderCooperation: anyTriggerFired
      ? "The original provider ceases to be provider of this system BUT remains bound by Art 25(2)-(3): supply technical documentation/information and reasonable access to the new provider."
      : null,
    registrationRequired: anyTriggerFired,
    standardsConformityRoute: anyTriggerFired
      ? "Reclassified provider must complete conformity assessment (harmonised-standards presumption where available, else notified body / internal control per Art 43)."
      : "not_applicable",
    notHighRiskDocumentationFlag,
    roleConditionalObligation: anyTriggerFired
      ? "Promoted to provider: full Article 16 set (risk management, data governance, technical documentation, logging, transparency to deployers, human oversight, accuracy/robustness/cybersecurity, QMS, conformity assessment, registration)."
      : "No promotion — current role's obligation set continues to apply.",
    sourceVersionDate: SOURCE_VERSION_DATE,
  };
}
