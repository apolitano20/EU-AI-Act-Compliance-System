// Module 6 — Prohibited AI Practices (modules_mds/module-6-prohibited-practices.md).
// Screens each system against the eight Article 5 prohibitions plus the new
// Digital Omnibus prohibition on AI 'nudifiers' / non-consensual intimate
// imagery and CSAM generation (provisional — applies 2026-12-02).
//
// Runs only if Module 5 did not fully exclude the system; a full exclusion
// short-circuits to not_assessed_excluded. Pure rules only.

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

export const PROHIBITED_MODULE_KEY = "prohibited" as const;

// ---------------------------------------------------------------------------
// Questionnaire (plain English, never "is this prohibited?")
// ---------------------------------------------------------------------------

const isYesOrNotSure = (answers: ModuleAnswers, key: string) => answers[key] === "Yes" || answers[key] === "Not sure";

export const PROHIBITED_QUESTIONS: ModuleQuestion[] = [
  {
    key: "p1",
    label:
      "Does the system try to influence people's decisions or behaviour using techniques they cannot consciously perceive, or that are designed to be deceptive or manipulative?",
    helper: "Subliminal cues below perception, dark patterns. Ordinary recognisable advertising is NOT this.",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-1 output types / use case",
  },
  {
    key: "p2",
    label:
      "Could the system materially distort the behaviour of a specific person or group in a way likely to cause significant harm (physical/psychological/financial)?",
    helper: "Paired with the previous question — Article 5(1)(a) needs both manipulation and likely significant harm.",
    options: YES_NO_NOT_SURE,
  },
  {
    key: "p3",
    label:
      "Does the system target or take advantage of people because of their age, a disability, or a specific social/economic situation?",
    helper: "Article 5(1)(b) — exploitation of vulnerabilities.",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-1 affected persons",
  },
  {
    key: "p4",
    label:
      "Does the system score/rate people over time based on social behaviour or personal characteristics, leading to unfavourable treatment in unrelated situations?",
    helper:
      "Social scoring (Article 5(1)(c)); ordinary sector credit scoring/fraud detection is separate (may be high-risk, not prohibited).",
    options: YES_NO_NOT_SURE,
  },
  {
    key: "p5",
    label:
      "Does the system predict the risk that an individual will commit a crime based solely on profiling or personality traits?",
    helper:
      "Article 5(1)(d); does not cover human assessment on objective verifiable facts linked to criminal activity.",
    options: YES_NO_NOT_SURE,
  },
  {
    key: "p6",
    label:
      "Does the system build/expand a facial-recognition database by scraping facial images from the internet or CCTV without targeting?",
    helper: "Article 5(1)(e) — untargeted scraping.",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-1 data types / biometric flags",
  },
  {
    key: "p7",
    label: "Does the system infer people's emotions in a workplace or education/training setting?",
    helper: "Article 5(1)(f); carve-out for medical/safety reasons (e.g. driver fatigue).",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-1 deployment context / risk-domain flags",
  },
  {
    key: "p7Exception",
    label: "Is that emotion inference put in place for medical or safety reasons?",
    helper: "The Article 5(1)(f) carve-out — e.g. driver-fatigue or medical monitoring.",
    options: YES_NO_NOT_SURE,
    showWhen: (a) => isYesOrNotSure(a, "p7"),
  },
  {
    key: "p8",
    label:
      "Does the system sort people into categories using biometric data to infer sensitive attributes (race, political opinions, trade-union membership, religion, sex life, sexual orientation)?",
    helper: "Article 5(1)(g); lawful law-enforcement dataset labelling excepted.",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-1 biometric data / output types",
  },
  {
    key: "p8Exception",
    label: "Is that categorisation limited to lawful labelling/filtering of law-enforcement datasets?",
    helper: "The Article 5(1)(g) exception.",
    options: YES_NO_NOT_SURE,
    showWhen: (a) => isYesOrNotSure(a, "p8"),
  },
  {
    key: "p9",
    label:
      "Is the system used for real-time remote biometric identification in publicly accessible spaces for law-enforcement purposes?",
    helper: "Article 5(1)(h); 'real-time' and 'remote' are cumulative; narrow authorised exceptions exist.",
    options: YES_NO_NOT_SURE,
    seededFrom: "module-1 biometric data / deployment context; module-2 role",
  },
  {
    key: "p9Exception",
    label: "Does the use fall under one of the narrow, judicially/administratively authorised exceptions of Article 5(2)-(7)?",
    helper: "Targeted searches for victims, imminent threats, or serious-crime suspects, with prior authorisation.",
    options: YES_NO_NOT_SURE,
    showWhen: (a) => isYesOrNotSure(a, "p9"),
  },
  {
    key: "p10",
    label:
      "Can the system generate sexual/intimate images of real, identifiable people without consent, or generate CSAM?",
    helper:
      "New Digital Omnibus prohibition (provisional, applies 2026-12-02); covers 'nudifier' apps and CSAM generators; applies where this is the intended purpose OR a reasonably foreseeable and reproducible output not prevented by adequate safeguards.",
    options: YES_NO_NOT_SURE,
  },
  {
    key: "p11",
    label:
      "If such imagery could theoretically be produced, has the provider put in place technical safeguards that reliably prevent it?",
    helper: "Adequate, reliable safeguards take a foreseeable-output case outside the provisional prohibition.",
    options: YES_NO_NOT_SURE,
    showWhen: (a) => isYesOrNotSure(a, "p10"),
  },
];

// ---------------------------------------------------------------------------
// Deterministic rules
// ---------------------------------------------------------------------------

export interface ProhibitedRuleDefinition {
  id: string;
  title: string;
  citation: string;
  guidanceStatus: GuidanceStatus;
  applicableFromDate: string;
}

export const PROHIBITED_RULES: ProhibitedRuleDefinition[] = [
  { id: "PR-A", title: "Harmful subliminal/manipulative/deceptive techniques", citation: "Art 5(1)(a); Recital 29", guidanceStatus: "final", applicableFromDate: "2025-02-02" },
  { id: "PR-B", title: "Exploitation of vulnerabilities (age, disability, social/economic situation)", citation: "Art 5(1)(b); Recital 29", guidanceStatus: "final", applicableFromDate: "2025-02-02" },
  { id: "PR-C", title: "Social scoring leading to detrimental treatment", citation: "Art 5(1)(c); Recital 31", guidanceStatus: "final", applicableFromDate: "2025-02-02" },
  { id: "PR-D", title: "Predictive policing based solely on profiling/personality traits", citation: "Art 5(1)(d); Recital 42", guidanceStatus: "final", applicableFromDate: "2025-02-02" },
  { id: "PR-E", title: "Untargeted facial-image scraping to build/expand facial-recognition databases", citation: "Art 5(1)(e); Recital 43", guidanceStatus: "final", applicableFromDate: "2025-02-02" },
  { id: "PR-F", title: "Emotion recognition in workplace/education (no medical/safety exception)", citation: "Art 5(1)(f); Recital 44", guidanceStatus: "final", applicableFromDate: "2025-02-02" },
  { id: "PR-G", title: "Biometric categorisation inferring sensitive attributes", citation: "Art 5(1)(g); Recital 30", guidanceStatus: "final", applicableFromDate: "2025-02-02" },
  { id: "PR-H", title: "Real-time remote biometric identification in public spaces for law enforcement", citation: "Art 5(1)(h), 5(2)-(7); Recital 32-38", guidanceStatus: "final", applicableFromDate: "2025-02-02" },
  { id: "PR-I", title: "AI generation of non-consensual intimate imagery ('nudifiers') and CSAM", citation: "Art 5 new point, Digital Omnibus 2026-05-07; Art 99 penalties", guidanceStatus: "provisional", applicableFromDate: "2026-12-02" },
];

const RULE_BY_ID = new Map(PROHIBITED_RULES.map((r) => [r.id, r]));

function fireProhibitedRule(id: string, detail?: string): FiredRule {
  const rule = RULE_BY_ID.get(id);
  if (!rule) throw new Error(`Unknown prohibited rule: ${id}`);
  return { ruleId: rule.id, title: rule.title, citation: rule.citation, guidanceStatus: rule.guidanceStatus, detail };
}

/** Guidance-status note shown in the UI (spec verbatim in substance). */
export const PROHIBITED_GUIDANCE_NOTE =
  "The original eight prohibitions are final (in force since 2025-02-02; Commission guidelines published 2025-02-04). " +
  "The nudifier/NCII/CSAM prohibition (PR-I) is provisional (Digital Omnibus political agreement 2026-05-07, applies 2026-12-02, final text not yet adopted).";

// ---------------------------------------------------------------------------
// Answer seeding from Module 1
// ---------------------------------------------------------------------------

export interface ProhibitedDerivableData {
  dataTypes: string[];
  systemTypes: string[];
  riskDomainFlags: string[];
  deploymentContext?: string | null;
}

const BIOMETRIC_FLAGS = ["Biometrics", "Emotion recognition"];

export function deriveProhibitedAnswers(data: ProhibitedDerivableData): ModuleAnswers {
  const d: ModuleAnswers = {};

  const flagsAnswered = data.riskDomainFlags.length > 0 && !data.riskDomainFlags.includes("Not sure");
  const dataTypesAnswered = data.dataTypes.length > 0 && !data.dataTypes.includes("Not sure");

  const hasBiometricSignal =
    data.riskDomainFlags.some((f) => BIOMETRIC_FLAGS.includes(f)) ||
    data.systemTypes.includes("Biometric system") ||
    data.dataTypes.includes("Biometric data");

  // Only the clearly negative biometric screens are seeded — everything else
  // needs a human answer.
  if (flagsAnswered && dataTypesAnswered && !hasBiometricSignal) {
    d.p6 = "No";
    d.p8 = "No";
    d.p9 = "No";
  }

  const workplaceOrEducation =
    data.deploymentContext === "Internal only" ||
    data.deploymentContext === "Employee-facing" ||
    data.riskDomainFlags.includes("Education or vocational training");
  if (data.riskDomainFlags.includes("Emotion recognition") && workplaceOrEducation) {
    d.p7 = "Yes";
  } else if (flagsAnswered && !data.riskDomainFlags.includes("Emotion recognition")) {
    d.p7 = "No";
  }

  return d;
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export type ProhibitedStatus =
  | "likely_prohibited"
  | "possibly_prohibited"
  | "needs_review"
  | "likely_not_prohibited"
  | "not_assessed_excluded";

export interface ProhibitedAssessment extends AssessmentCore<ProhibitedStatus> {
  /** Prohibition rule ids that matched. */
  matchedProhibitions: string[];
  /** Rule ids that partially matched (pending a 'Not sure' predicate). */
  possibleProhibitions: string[];
  /** Article 5 binds ALL operators — role only affects penalty exposure. */
  roleConditionalObligation: { provider: string; deployer: string; importerDistributor: string };
  registrationRequired: "not_applicable";
  standardsConformityRoute: "not_applicable";
  sourceVersionDate: string;
}

const yes = (a: ModuleAnswers, k: string) => a[k] === "Yes";
const no = (a: ModuleAnswers, k: string) => a[k] === "No";
const notSure = (a: ModuleAnswers, k: string) => a[k] === "Not sure";
const answered = (a: ModuleAnswers, k: string) => typeof a[k] === "string" && (a[k] as string).length > 0;

interface Screening {
  matched: string[];
  possible: string[];
  notes: Map<string, string>;
}

/** Spec-named helper: evaluate every prohibition pattern against the answers. */
export function screenProhibitedPractices(answers: ModuleAnswers): Screening {
  const matched: string[] = [];
  const possible: string[] = [];
  const notes = new Map<string, string>();

  // PR-A: P1=Yes AND P2=Yes.
  if (yes(answers, "p1") && yes(answers, "p2")) matched.push("PR-A");
  else if ((yes(answers, "p1") && notSure(answers, "p2")) || (notSure(answers, "p1") && yes(answers, "p2"))) possible.push("PR-A");

  // PR-B: P3=Yes AND (P2=Yes OR significant-harm likely).
  if (yes(answers, "p3") && yes(answers, "p2")) matched.push("PR-B");
  else if (yes(answers, "p3") && (notSure(answers, "p2") || !answered(answers, "p2"))) possible.push("PR-B");

  // PR-C: P4=Yes.
  if (yes(answers, "p4")) matched.push("PR-C");
  else if (notSure(answers, "p4")) possible.push("PR-C");

  // PR-D: P5=Yes.
  if (yes(answers, "p5")) matched.push("PR-D");
  else if (notSure(answers, "p5")) possible.push("PR-D");

  // PR-E: P6=Yes.
  if (yes(answers, "p6")) matched.push("PR-E");
  else if (notSure(answers, "p6")) possible.push("PR-E");

  // PR-F: P7=Yes AND NOT medical/safety exception.
  if (yes(answers, "p7")) {
    if (no(answers, "p7Exception")) matched.push("PR-F");
    else if (yes(answers, "p7Exception")) {
      notes.set("PR-F", "Medical/safety exception claimed — emotion inference falls outside Art 5(1)(f), but Article 50(3) disclosure may still apply (Module 11).");
    } else possible.push("PR-F");
  } else if (notSure(answers, "p7")) possible.push("PR-F");

  // PR-G: P8=Yes AND NOT law-enforcement labelling exception.
  if (yes(answers, "p8")) {
    if (no(answers, "p8Exception")) matched.push("PR-G");
    else if (yes(answers, "p8Exception")) {
      notes.set("PR-G", "Lawful law-enforcement dataset labelling exception claimed — verify it strictly applies.");
    } else possible.push("PR-G");
  } else if (notSure(answers, "p8")) possible.push("PR-G");

  // PR-H: P9=Yes AND NOT authorised exception.
  if (yes(answers, "p9")) {
    if (no(answers, "p9Exception")) matched.push("PR-H");
    else if (yes(answers, "p9Exception")) {
      notes.set("PR-H", "Authorised exception (Art 5(2)-(7)) claimed — requires prior judicial/administrative authorisation; verify.");
    } else possible.push("PR-H");
  } else if (notSure(answers, "p9")) possible.push("PR-H");

  // PR-I: P10=Yes AND (intended purpose OR (foreseeable reproducible output AND P11≠Yes)).
  if (yes(answers, "p10")) {
    if (yes(answers, "p11")) {
      notes.set("PR-I", "Technical safeguards claimed to reliably prevent such imagery — verify adequacy; the provisional prohibition applies where safeguards are inadequate.");
    } else if (no(answers, "p11")) matched.push("PR-I");
    else possible.push("PR-I");
  } else if (notSure(answers, "p10")) possible.push("PR-I");

  return { matched, possible, notes };
}

export interface ProhibitedUpstream {
  /** Module 5: a full exclusion short-circuits this module. */
  fullyExcluded: boolean;
  exclusionStatus: string;
}

/** Spec-named helper: full Module 6 result object. */
export function buildProhibitedAssessment(
  data: ProhibitedDerivableData,
  answers: ModuleAnswers,
  upstream: ProhibitedUpstream
): ProhibitedAssessment {
  const roleConditionalObligation = {
    provider: "must not place on market/put into service",
    deployer: "must not use",
    importerDistributor: "must not make available",
  };
  const base = {
    roleConditionalObligation,
    registrationRequired: "not_applicable" as const,
    standardsConformityRoute: "not_applicable" as const,
    sourceVersionDate: SOURCE_VERSION_DATE,
  };

  if (upstream.fullyExcluded) {
    return {
      ...base,
      status: "not_assessed_excluded",
      confidenceScore: 100,
      confidenceLabel: "high",
      reasoningSummary:
        "Module 5 found a full Article 2 exclusion for this system, so Article 5 screening was not performed. If the exclusion's revoking conditions fire, re-run this module.",
      positiveIndicators: [],
      negativeIndicators: [],
      keyUncertainties: [],
      missingFields: [],
      recommendedNextQuestions: [],
      firedRules: [],
      matchedProhibitions: [],
      possibleProhibitions: [],
    };
  }

  const { matched, possible, notes } = screenProhibitedPractices(answers);

  const positiveIndicators: string[] = [];
  const negativeIndicators: string[] = [];
  const keyUncertainties: string[] = [];
  const missingFields: string[] = [];
  const recommendedNextQuestions: string[] = [];
  const firedRules: FiredRule[] = matched.map((id) => fireProhibitedRule(id));

  for (const [ruleId, note] of notes) {
    keyUncertainties.push(`${ruleId}: ${note}`);
  }
  for (const id of matched) {
    positiveIndicators.push(`${id} matched — ${RULE_BY_ID.get(id)?.title} [${RULE_BY_ID.get(id)?.citation}]`);
  }
  for (const id of possible) {
    keyUncertainties.push(`${id} partially matched — ${RULE_BY_ID.get(id)?.title}: confirm the outstanding answers.`);
  }

  // Core questions (the exception/safeguard sub-questions are scored via their parents).
  const coreKeys = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"];
  let score = 100;
  let unansweredCore = 0;
  for (const k of coreKeys) {
    if (!answered(answers, k)) unansweredCore += 1;
    else if (notSure(answers, k)) score -= 15;
  }

  const biometricsRelevant = possible.some((id) => ["PR-E", "PR-G", "PR-H"].includes(id)) || matched.some((id) => ["PR-E", "PR-G", "PR-H"].includes(id));
  const biometricsUnknown =
    data.dataTypes.includes("Not sure") || (data.dataTypes.length === 0 && !answered(answers, "p6") && !answered(answers, "p8"));
  if (biometricsUnknown && biometricsRelevant) {
    score -= 20;
    missingFields.push("module-1 biometricData (dataTypes)");
  }

  const contextUnknown = !data.deploymentContext || data.deploymentContext === "Not sure";
  const biometricOrEmotionPartiallyMet = possible.some((id) => ["PR-F", "PR-G", "PR-H"].includes(id));
  if (contextUnknown && biometricOrEmotionPartiallyMet) {
    score -= 25;
    missingFields.push("module-1 deploymentContext (workplace/education/law-enforcement/public-space)");
  }

  // Contradictions: an exception claimed without its parent practice.
  for (const [parent, exception] of [["p7", "p7Exception"], ["p8", "p8Exception"], ["p9", "p9Exception"], ["p10", "p11"]] as const) {
    if (no(answers, parent) && answered(answers, exception)) {
      score -= 10;
      keyUncertainties.push(`Contradictory answers: ${exception} answered although ${parent} is 'No'.`);
    }
  }

  let status: ProhibitedStatus;
  if (matched.length > 0) status = "likely_prohibited";
  else if (possible.length > 0) status = "possibly_prohibited";
  else if (unansweredCore > 3) status = "needs_review";
  else status = "likely_not_prohibited";

  if (unansweredCore > 0) {
    score -= Math.min(unansweredCore * 10, 40);
    missingFields.push(`${unansweredCore} screening question(s) unanswered`);
    recommendedNextQuestions.push("Complete the remaining Article 5 screening questions.");
  }
  if (status === "likely_not_prohibited" && matched.length === 0 && possible.length === 0) {
    negativeIndicators.push("No Article 5 prohibition pattern matches the current answers (including the provisional PR-I).");
  }

  const confidenceScore = clampScore(score);

  const summaryParts: string[] = [];
  if (matched.length > 0) {
    summaryParts.push(
      `Matched prohibition(s): ${matched
        .map((id) => `${id} [${RULE_BY_ID.get(id)?.citation}]`)
        .join(", ")} — flag for legal review before any market placement or use.`
    );
  }
  if (possible.length > 0) summaryParts.push(`Partially matched (pending answers): ${possible.join(", ")}.`);
  if (matched.length === 0 && possible.length === 0) {
    summaryParts.push(
      status === "needs_review"
        ? "Too few screening answers to evaluate the Article 5 prohibitions."
        : "No prohibition pattern matched on the current answers."
    );
  }
  if (matched.includes("PR-I") || possible.includes("PR-I")) {
    summaryParts.push("PR-I rests on the provisional Digital Omnibus text (applies 2026-12-02, not yet adopted).");
  }

  return {
    ...base,
    status,
    confidenceScore,
    confidenceLabel: confidenceLabelFor(confidenceScore),
    reasoningSummary: summaryParts.join(" "),
    positiveIndicators,
    negativeIndicators,
    keyUncertainties,
    missingFields,
    recommendedNextQuestions,
    firedRules,
    matchedProhibitions: matched,
    possibleProhibitions: possible,
  };
}
