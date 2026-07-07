// Shared conventions for the derived-assessment modules (Modules 4-15), as
// established once in modules_mds/module-4-eu-scope.md:
// - deterministic rules with legal_basis_citation + guidance_status + source_version_date
// - "likely / possible / needs review" status wording (never "compliant")
// - standard confidence bands and disclaimer text
//
// This file must stay free of server-only imports so rules files, client
// components and tsx self-check tests can all use it.

export type GuidanceStatus = "final" | "provisional" | "draft";

export type ConfidenceLabel = "high" | "medium" | "low" | "insufficient_information";

/** Standard bands: high 80-100 / medium 50-79 / low 20-49 / insufficient 0-19. */
export function confidenceLabelFor(score: number): ConfidenceLabel {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  if (score >= 20) return "low";
  return "insufficient_information";
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** A deterministic rule's legal provenance. Content comes verbatim from the specs. */
export interface LegalCitation {
  citation: string; // e.g. "Article 2(1)(a)"
  guidanceStatus: GuidanceStatus;
  sourceVersionDate: string; // e.g. "2026-07-07"
  applicableFromDate?: string; // e.g. "2026-08-02"
}

/** A rule that matched during an assessment, shown with its citation + badge. */
export interface FiredRule {
  ruleId: string; // e.g. "S-01", "PR-F", "HRR-3"
  title: string;
  citation: string;
  guidanceStatus: GuidanceStatus;
  detail?: string;
}

/**
 * Common core carried by every module's result object. Modules extend this
 * with their spec-specific fields (flags, role_conditional_obligation, etc.).
 */
export interface AssessmentCore<TStatus extends string> {
  status: TStatus;
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  reasoningSummary: string;
  positiveIndicators: string[];
  negativeIndicators: string[];
  keyUncertainties: string[];
  missingFields: string[];
  recommendedNextQuestions: string[];
  firedRules: FiredRule[];
}

/** Verbatim disclaimer required on every module result view. */
export const DISCLAIMER_TEXT =
  "This assessment is a readiness-support tool based on deterministic screening rules. " +
  "It does not provide legal advice and should be reviewed by qualified legal or compliance " +
  "professionals before decisions are made.";

/** Rules' source_version_date for the Modules 4-15 build. */
export const SOURCE_VERSION_DATE = "2026-07-07";

/**
 * The split enforcement timeline. Final dates are in-force law; the deferred
 * high-risk dates rest on the (unadopted) May 2026 Digital Omnibus and are
 * provisional — never present them as settled.
 */
export const APPLICABLE_DATES = {
  prohibitedPractices: { date: "2025-02-02", guidanceStatus: "final" as GuidanceStatus },
  aiLiteracy: { date: "2025-02-02", guidanceStatus: "final" as GuidanceStatus },
  gpai: { date: "2025-08-02", guidanceStatus: "final" as GuidanceStatus },
  transparency: { date: "2026-08-02", guidanceStatus: "final" as GuidanceStatus },
  highRiskAnnexIII: { date: "2027-12-02", guidanceStatus: "provisional" as GuidanceStatus },
  highRiskAnnexI: { date: "2028-08-02", guidanceStatus: "provisional" as GuidanceStatus },
} as const;

/**
 * A questionnaire question for the generic module questionnaire component.
 * `seededFrom` names the Module 1/2 source shown to the user when an answer
 * was derived rather than saved. `showWhen` supports conditional questions
 * (e.g. Module 6's P11, shown only when P10 is Yes / Not sure).
 */
export interface ModuleQuestion {
  key: string;
  label: string;
  helper?: string;
  options: readonly string[];
  multi?: boolean;
  seededFrom?: string;
  showWhen?: (answers: ModuleAnswers) => boolean;
}

/** Answers for a module questionnaire: question key -> selected option(s). */
export type ModuleAnswers = Record<string, string | string[] | undefined>;

/** Parse a stored ModuleAssessment.answers JSON string against a question list. */
export function parseModuleAnswers(json: string | null | undefined, questions: readonly ModuleQuestion[]): ModuleAnswers {
  if (!json) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null) return {};
  return sanitizeModuleAnswers(parsed, questions);
}

/** Keep only known question keys with values among the question's options. */
export function sanitizeModuleAnswers(input: unknown, questions: readonly ModuleQuestion[]): ModuleAnswers {
  if (typeof input !== "object" || input === null) return {};
  const byKey = new Map(questions.map((q) => [q.key, q]));
  const answers: ModuleAnswers = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const question = byKey.get(key);
    if (!question) continue;
    if (question.multi) {
      if (Array.isArray(value)) {
        const cleaned = value.filter((v): v is string => typeof v === "string" && question.options.includes(v));
        if (cleaned.length > 0) answers[key] = cleaned;
      }
    } else if (typeof value === "string" && question.options.includes(value)) {
      answers[key] = value;
    }
  }
  return answers;
}
