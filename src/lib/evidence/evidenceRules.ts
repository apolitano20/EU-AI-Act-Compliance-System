// Module 13 — Evidence & Readiness Assessment (modules_mds/module-13-evidence-readiness.md).
// Does NOT re-derive whether an obligation applies (that is Module 12) — it
// assesses readiness STATE per applicable obligation and rolls the rows into
// a system-level readiness score. Evidence answers are stored keyed by
// obligation_id. Pure rules only.

import {
  clampScore,
  confidenceLabelFor,
  SOURCE_VERSION_DATE,
  type AssessmentCore,
  type GuidanceStatus,
  type ModuleAnswers,
  type ModuleQuestion,
} from "@/lib/assessment-shared";
import type { ObligationRow } from "@/lib/obligations/obligationRules";

export const READINESS_MODULE_KEY = "readiness" as const;

export const EVIDENCE_OPTIONS = ["In place", "Partial", "Not started", "Not sure", "Not applicable"] as const;

export type ReadinessStatus = "evidence_in_place" | "partial_evidence" | "evidence_gap" | "not_started" | "unknown_evidence_state" | "not_applicable";

/** readiness_mapping per spec ('Not started' keeps its own label for the UI). */
export function mapEvidenceAnswer(answer: string | undefined): ReadinessStatus {
  switch (answer) {
    case "In place": return "evidence_in_place";
    case "Partial": return "partial_evidence";
    case "Not started": return "not_started";
    case "Not applicable": return "not_applicable";
    case "Not sure": return "unknown_evidence_state";
    default: return "evidence_gap";
  }
}

export const READINESS_STATUS_LABELS: Record<ReadinessStatus, string> = {
  evidence_in_place: "Evidence in place",
  partial_evidence: "Partial evidence",
  evidence_gap: "Evidence gap",
  not_started: "Not started",
  unknown_evidence_state: "Unknown",
  not_applicable: "Not applicable",
};

/** Per-obligation evidence question + required artifacts (spec verbatim in substance). */
export const EVIDENCE_SPECS: Record<string, { question: string; requiredArtifacts: string[] }> = {
  "OBL-ART9-RMS": {
    question: "Do you have a documented risk-management process, kept up to date across the lifecycle?",
    requiredArtifacts: ["Risk-management plan/policy", "Maintained risk register", "Residual-risk analysis", "Testing records"],
  },
  "OBL-ART10-DATA": {
    question: "Do you have data governance documentation for training/validation/testing data?",
    requiredArtifacts: ["Data governance policy", "Dataset documentation", "Provenance records", "Bias/representativeness examination"],
  },
  "OBL-ART11-TECHDOC": {
    question: "Does an Annex IV technical documentation file exist and is it current?",
    requiredArtifacts: ["Annex IV technical documentation file (must exist before market placement, maintained)"],
  },
  "OBL-ART12-LOGGING": {
    question: "Does the system automatically log events, with logs retained under a retention policy?",
    requiredArtifacts: ["Logging design/spec", "Retained logs", "Retention policy"],
  },
  "OBL-ART13-TRANSP-DEPLOYER": {
    question: "Have you prepared instructions for use / transparency documentation for deployers?",
    requiredArtifacts: ["Deployer-facing instructions (capabilities, limitations, human oversight, declared accuracy)"],
  },
  "OBL-ART14-OVERSIGHT": {
    question: "Are human-oversight measures designed in and documented?",
    requiredArtifacts: ["Oversight design", "Operator instructions", "Assigned oversight roles/training"],
  },
  "OBL-ART26-DEPLOYER": {
    question: "Are human-oversight measures operationally assigned, and are deployer duties (use per instructions, monitoring, log-keeping, informing affected workers) implemented?",
    requiredArtifacts: ["Oversight design", "Operator instructions", "Assigned oversight roles/training", "Monitoring and log-keeping procedures"],
  },
  "OBL-ART15-ACCURACY": {
    question: "Do you have accuracy, robustness and cybersecurity evidence?",
    requiredArtifacts: ["Declared accuracy metrics (stated in instructions for use)", "Robustness/adversarial test reports", "Cybersecurity measures/threat model"],
  },
  "OBL-ART17-QMS": {
    question: "Is there a documented QMS covering this system?",
    requiredArtifacts: ["QMS documentation", "Procedures", "Responsibilities", "Record-keeping"],
  },
  "OBL-ART43-CONFORMITY": {
    question: "Has conformity assessment been completed with an EU declaration of conformity and CE marking (plus notified-body certificate where required)?",
    requiredArtifacts: ["Conformity assessment records", "Signed EU declaration of conformity", "CE marking evidence", "Notified-body certificate (Annex VII route only)"],
  },
  "OBL-ART49-REGISTER": {
    question: "Is the system (or the Art 6(3) not-high-risk self-assessment) registered in the EU database?",
    requiredArtifacts: ["Registration entry (Annex VIII)", "Non-public variant for law-enforcement/migration/border where applicable"],
  },
  "OBL-ART6-3-NOTHR-DOC": {
    question: "Is the Article 6(3) not-high-risk self-assessment documented and registered?",
    requiredArtifacts: ["Documented Art 6(3) self-assessment", "Registration of the self-assessment (Art 49(2))"],
  },
  "OBL-ART72-PMM": {
    question: "Do you have a post-market monitoring plan and are you collecting monitoring data?",
    requiredArtifacts: ["Documented post-market monitoring plan", "Evidence of ongoing data collection (recurring control, not a one-off)"],
  },
  "OBL-ART73-INCIDENT": {
    question: "Is there a serious-incident reporting procedure with an owner and defined timelines?",
    requiredArtifacts: ["Documented procedure", "Assigned owner", "Awareness of statutory deadlines (readiness = procedure + owner)"],
  },
  "OBL-ART22-AUTHREP": {
    question: "Has an EU-established authorised representative been appointed by written mandate?",
    requiredArtifacts: ["Written mandate", "Representative's EU establishment evidence"],
  },
  "OBL-ART50-TRANSP-AGG": {
    question: "Are the applicable Article 50 disclosures/markings implemented (see Module 11 for the trigger detail)?",
    requiredArtifacts: ["Disclosure/marking implementation evidence per fired Art 50 trigger", "FRIA document where Art 27 applies"],
  },
  "OBL-ART4-LITERACY": {
    question: "Are AI-literacy measures in place and recorded for the staff operating/using this system (see Module 8)?",
    requiredArtifacts: ["Training/guidance materials", "Records of measures taken", "Role-differentiated content where proportionate"],
  },
  "OBL-GPAI-AGG": {
    question: "Are the applicable GPAI provider artefacts in place (see Module 10)?",
    requiredArtifacts: ["Annex XI technical documentation", "Annex XII downstream information", "EU copyright policy", "Public training-content summary", "Art 55 systemic-risk artefacts where flagged"],
  },
};

/** Build the dynamic questionnaire from the applicable Module 12 rows. */
export function buildEvidenceQuestions(rows: ObligationRow[]): ModuleQuestion[] {
  return rows
    .filter((r) => r.obligationId !== "OBL-ART5-PROHIBITED")
    .map((r) => {
      const spec = EVIDENCE_SPECS[r.obligationId];
      return {
        key: r.obligationId,
        label: spec?.question ?? `Is evidence in place for ${r.obligationId} (${r.name})?`,
        helper: spec ? `Required: ${spec.requiredArtifacts.join("; ")}. Legal basis: ${r.legalBasis}. Applicable from ${r.applicableFromDate} (${r.guidanceStatus}).` : r.legalBasis,
        options: EVIDENCE_OPTIONS,
      };
    });
}

/** Sanitizer for the dynamic obligation-keyed answers (registry override). */
export function sanitizeEvidenceAnswers(input: unknown): ModuleAnswers {
  if (typeof input !== "object" || input === null) return {};
  const answers: ModuleAnswers = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!key.startsWith("OBL-")) continue;
    if (typeof value === "string" && (EVIDENCE_OPTIONS as readonly string[]).includes(value)) answers[key] = value;
  }
  return answers;
}

// ---------------------------------------------------------------------------
// Checklist + scoring
// ---------------------------------------------------------------------------

export interface EvidenceChecklistRow {
  obligationId: string;
  obligationName: string;
  question: string;
  requiredArtifacts: string[];
  answer: string | null;
  readinessStatus: ReadinessStatus;
  legalBasis: string;
  applicableFromDate: string;
  guidanceStatus: GuidanceStatus;
  obligationType: ObligationRow["obligationType"];
  obligationStatus: ObligationRow["status"];
  /** Nearer applicable dates rank higher for prioritisation (not the raw score). */
  deadlinePriority: number;
}

/** Spec-named helper: one evidence row per applicable Module 12 obligation. */
export function buildEvidenceChecklist(rows: ObligationRow[], answers: ModuleAnswers): EvidenceChecklistRow[] {
  const applicable = rows.filter((r) => r.obligationId !== "OBL-ART5-PROHIBITED");
  const dates = [...new Set(applicable.map((r) => r.applicableFromDate))].sort();
  return applicable.map((r) => {
    const spec = EVIDENCE_SPECS[r.obligationId];
    const answer = typeof answers[r.obligationId] === "string" ? (answers[r.obligationId] as string) : null;
    return {
      obligationId: r.obligationId,
      obligationName: r.name,
      question: spec?.question ?? `Is evidence in place for ${r.obligationId}?`,
      requiredArtifacts: spec?.requiredArtifacts ?? [],
      answer,
      readinessStatus: mapEvidenceAnswer(answer ?? undefined),
      legalBasis: r.legalBasis,
      applicableFromDate: r.applicableFromDate,
      guidanceStatus: r.guidanceStatus,
      obligationType: r.obligationType,
      obligationStatus: r.status,
      deadlinePriority: dates.indexOf(r.applicableFromDate),
    };
  });
}

/**
 * Spec-named helper: system readiness_score = 100 × weighted in-place /
 * applicable, where partial counts 0.5 and unknown counts 0.
 */
export function scoreReadiness(checklist: EvidenceChecklistRow[]): number {
  const applicable = checklist.filter((r) => r.readinessStatus !== "not_applicable");
  if (applicable.length === 0) return 0;
  const weighted = applicable.reduce(
    (sum, r) => sum + (r.readinessStatus === "evidence_in_place" ? 1 : r.readinessStatus === "partial_evidence" ? 0.5 : 0),
    0
  );
  return Math.round((100 * weighted) / applicable.length);
}

export interface ReadinessAssessment extends AssessmentCore<"assessed" | "no_applicable_obligations" | "not_assessed_prohibited"> {
  checklist: EvidenceChecklistRow[];
  readinessScore: number;
  counts: Record<ReadinessStatus, number>;
  applicableCount: number;
  /** Inherited from Module 12. */
  effectiveRoles: string[];
  registrationRequired: boolean;
  standardsConformityRoute: string;
  notHighRiskDocumentationFlag: boolean;
  sourceVersionDate: string;
}

/** Spec-named helper: full Module 13 result object. */
export function buildReadinessAssessment(
  matrix: {
    rows: ObligationRow[];
    status: string;
    confidenceLabel: string;
    effectiveRoles: string[];
    registrationRequired: boolean;
    standardsConformityRoute: string;
    notHighRiskDocumentationFlag: boolean;
  },
  answers: ModuleAnswers
): ReadinessAssessment {
  const inherited = {
    effectiveRoles: matrix.effectiveRoles,
    registrationRequired: matrix.registrationRequired,
    standardsConformityRoute: matrix.standardsConformityRoute,
    notHighRiskDocumentationFlag: matrix.notHighRiskDocumentationFlag,
    sourceVersionDate: SOURCE_VERSION_DATE,
  };

  const emptyCounts: Record<ReadinessStatus, number> = {
    evidence_in_place: 0, partial_evidence: 0, evidence_gap: 0, not_started: 0, unknown_evidence_state: 0, not_applicable: 0,
  };

  if (matrix.status === "prohibited_short_circuit") {
    return {
      ...inherited,
      status: "not_assessed_prohibited",
      confidenceScore: 100,
      confidenceLabel: "high",
      reasoningSummary: "Module 12 short-circuited on a likely prohibited practice — there is no obligation checklist to evidence; the only action is not to place/use the system.",
      positiveIndicators: [], negativeIndicators: [], keyUncertainties: [], missingFields: [], recommendedNextQuestions: [],
      firedRules: [],
      checklist: [], readinessScore: 0, counts: emptyCounts, applicableCount: 0,
    };
  }

  const checklist = buildEvidenceChecklist(matrix.rows, answers);
  const readinessScore = scoreReadiness(checklist);
  const counts = { ...emptyCounts };
  for (const r of checklist) counts[r.readinessStatus] += 1;
  const applicableCount = checklist.filter((r) => r.readinessStatus !== "not_applicable").length;

  if (checklist.length === 0) {
    return {
      ...inherited,
      status: "no_applicable_obligations",
      confidenceScore: 80,
      confidenceLabel: "high",
      reasoningSummary: "Module 12 emitted no obligation rows for this system (out of scope, excluded, or gate not met) — there is nothing to evidence until that changes.",
      positiveIndicators: [], negativeIndicators: [],
      keyUncertainties: ["If the upstream scope/exclusion/gate finding changes, regenerate the obligation matrix and this checklist."],
      missingFields: [], recommendedNextQuestions: [],
      firedRules: [],
      checklist, readinessScore: 0, counts, applicableCount: 0,
    };
  }

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [
    "High-risk deadlines are provisional (Digital Omnibus 2027-12-02 / 2028-08-02).",
  ];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [];

  const gaps = checklist.filter((r) => ["evidence_gap", "not_started"].includes(r.readinessStatus));
  const largest = gaps.slice().sort((a, b) => a.deadlinePriority - b.deadlinePriority).slice(0, 3);
  if (counts.evidence_in_place > 0) positiveIndicators.push(`${counts.evidence_in_place} obligation(s) have evidence in place.`);
  if (gaps.length > 0) {
    negativeIndicators.push(`${gaps.length} obligation(s) have an evidence gap or are not started${largest.length > 0 ? ` — nearest-deadline gaps: ${largest.map((r) => r.obligationId).join(", ")}` : ""}.`);
    recommendedNextQuestions.push("Create remediation items for the identified gaps (Module 14).");
  }
  if (matrix.rows.some((r) => r.obligationId === "OBL-ART43-CONFORMITY")) {
    keyUncertainties.push("Conformity route (self-assess vs notified body) affects lead times — see the Module 12 conformity-route answer.");
  }
  if (matrix.registrationRequired) {
    keyUncertainties.push("Registration may fall under the non-public variant for law-enforcement/migration/border systems (Art 49(4)).");
  }

  // Confidence in the readiness picture (not compliance).
  let score = 100;
  let unanswered = 0;
  for (const r of checklist) {
    if (r.readinessStatus === "unknown_evidence_state") score -= 15;
    if (r.answer === null) unanswered += 1;
  }
  score -= Math.min(unanswered * 10, 40);
  if (unanswered > 0) {
    missingFields.push(`${unanswered} applicable obligation(s) with unanswered evidence state`);
    recommendedNextQuestions.push("Answer the evidence state for every applicable obligation.");
  }
  if (matrix.status !== "assessed" || matrix.confidenceLabel === "low" || matrix.confidenceLabel === "insufficient_information") {
    score -= 20;
    keyUncertainties.push("The parent Module 12 obligation set is itself uncertain — gaps may be over/under-stated until it is confirmed.");
  }
  const confidenceScore = clampScore(score);

  const nearestDeadline = checklist
    .filter((r) => ["evidence_gap", "not_started", "partial_evidence"].includes(r.readinessStatus))
    .map((r) => r.applicableFromDate)
    .sort()[0];
  const biggestGaps = gaps.map((r) => r.obligationId).slice(0, 2).join(" and ");
  const reasoningSummary =
    `Of ${applicableCount} applicable obligations: ${counts.evidence_in_place} in place, ${counts.partial_evidence} partial, ` +
    `${counts.evidence_gap + counts.not_started} gaps/not started, ${counts.unknown_evidence_state} unknown. Readiness score ${readinessScore}/100.` +
    (nearestDeadline ? ` Nearest (provisional) deadline ${nearestDeadline} drives priority.` : "") +
    (biggestGaps ? ` Largest gaps: ${biggestGaps}.` : "");

  return {
    ...inherited,
    status: "assessed",
    confidenceScore,
    confidenceLabel: confidenceLabelFor(confidenceScore),
    reasoningSummary,
    positiveIndicators,
    negativeIndicators,
    keyUncertainties,
    missingFields,
    recommendedNextQuestions,
    firedRules: [],
    checklist,
    readinessScore,
    counts,
    applicableCount,
  };
}
