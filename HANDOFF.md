# Handoff

Read this first for project status. See `CLAUDE.md` for architecture/commands and
`modules_mds/*.md` for the full spec of each module.

## What this is

An EU AI Act Compliance Readiness Dashboard. **All 15 modules are built** (specs in
`modules_mds/`): inventory → classification → obligations → readiness → remediation →
report.

## Built so far

**Module 1 — AI System Inventory** — the base data model. 7-step wizard
(`src/components/wizard/`, with "?" info tooltips on the non-obvious questions),
routes `/inventory`, `/inventory/new`, `/inventory/[id]`, `/inventory/[id]/edit`.
Completeness score in `src/lib/completeness.ts`.

**Module 2 — Entity Type / Role** — questionnaire stored in `EntityRoleAssessment`;
rules in `src/lib/entity-type/roleRules.ts`. Routes `/entity-type(/systems/[id])`.

**Module 3 — AI System Definition Gate** — pure derived (no storage);
`src/lib/ai-system-definition/`. Routes `/ai-system-definition(/systems/[id])`.

**Modules 4–13 — derived assessments with a stored-answers overlay.** Each module
follows one template:
- Pure rules file in `src/lib/<slug>/` with the spec-named helpers and rule IDs
  (S-01.., X-01.., PR-A.., HRR-1.., AILIT-1.., VCR-1.., GPAI-R1.., TR-R*/FRIA-R*,
  OBL-*), every rule carrying `legal_basis_citation` + `guidance_status`
  (final/provisional/draft) + `source_version_date`.
- Answers not derivable from Modules 1/2 are asked in a per-module questionnaire and
  stored in the generic **`ModuleAssessment`** table (one row per system × moduleKey,
  JSON answers — Module 2's overlay pattern generalized). Assessments themselves are
  never persisted; they are recomputed live in `src/lib/assessment-pipeline.ts`.
- Routes `/<slug>` (list: summary cards + filterable table + CSV) and
  `/<slug>/systems/[id]` (questionnaire + live result panel + fired rules + indicator
  grid). Modules/routes: `eu-scope`, `exclusions`, `prohibited`, `high-risk`,
  `ai-literacy`, `reclassification`, `gpai`, `transparency`, `obligations`
  (matrix, lib `src/lib/obligations/`), `readiness` (evidence, lib `src/lib/evidence/`,
  answers keyed by obligation_id).

**Module 14 — Remediation Tracker** — real persisted state: **`RemediationItem`**
(one row per system × obligation gap; owner/dueDate/status/priority preserved on
regeneration; recurring controls re-arm on completion, never close). Rules in
`src/lib/remediation/remediationRules.ts`, actions in `src/app/remediation/actions.ts`
(generate/update/complete; owner required past 'open'). Kanban board + recurring-
controls calendar at `/remediation(/systems/[id])`; plan-staleness banner when the
role set changed since generation (Module 9).

**Module 15 — Final Report** — pure aggregation (`src/lib/report/reportRules.ts`):
org roll-up, per-system report pages, portfolio obligations register (canonical CSV),
dedicated **non-final-guidance appendix** (`/report/non-final-guidance`) — anything
resting on the Digital Omnibus (provisional) or the 2026-05-19 draft high-risk
guidelines is badged and never presented as settled law. Report scoping via
searchParams; PDF via print CSS + `window.print()` (no PDF dependency).

## Key architecture (added for Modules 4–15)

- **`src/lib/assessment-pipeline.ts`** — the backbone. One DB query
  (`findMany` incl. `roleAssessment` + `moduleAssessments`), then
  `computeAssessmentBundle(system)` walks all modules in dependency order:
  role → definition → scope → exclusions → prohibited (short-circuits on full
  exclusion) → high-risk (gated on M5/M6) → literacy (horizontal) →
  reclassification (authoritative Art 25 trigger flags) → gpai → transparency/FRIA →
  obligations (M12: effective role after M9 promotion, prohibited short-circuit,
  out-of-scope suppression) → readiness (M13). Each module's `store.ts` just maps
  bundles to rows.
- **`src/lib/assessment-shared.ts`** — shared types (`GuidanceStatus`, `FiredRule`,
  `AssessmentCore`), `confidenceLabelFor` (80/50/20 bands), `DISCLAIMER_TEXT`
  (verbatim, single source), `APPLICABLE_DATES` (split timeline), `ModuleQuestion`
  (with `showWhen` conditionals), answer sanitizers.
- **`src/lib/module-registry.ts`** — moduleKey → {title, route, questions}; drives
  the one generic save action `src/app/assessments/actions.ts`
  (`saveModuleAnswers`). Module 13 uses a dynamic sanitizer (obligation_id keys).
- **Shared components** in `src/components/shared/`: `Disclaimer`,
  `ConsistencyWarning`, `GuidanceStatusBadge`, `ConfidenceBadge`,
  `assessment-panels` (fired rules / indicator grid / missing fields / detail
  header), `ModuleQuestionnaire` (generic questionnaire + live result), and
  `AssessmentTable` (generic search/filter/sort/CSV table). Nav is array-driven
  (`src/lib/nav.ts` → `MainNav`).

## Known tensions / notes (documented, not silently patched)

- Module 3's confidence-score formula tension (see spec) is unchanged.
- Spec confidence formulas differ per module (baseline-90, start-100-subtract,
  fixed-75 for Module 9) — implemented verbatim.
- Modules 4–11 specs claim to "reuse" Module 1 fields that don't exist
  (establishment, isSafetyComponent, licensing, sector…). Those became module
  questionnaire answers, seeded heuristically where a real signal exists (the
  `deriveXAnswers` functions document each seed).
- Module 13 treats an *unanswered* evidence question as `evidence_gap`
  (nothing evidenced); "Not sure" maps to `unknown_evidence_state`.
- The WORKLOG's pre-build note stands: the provisional 2026 legal content
  (Digital Omnibus dates, draft guidelines, PR-I) was implemented exactly as
  specced and badged — a legal/compliance review of citations + dates is still due.

## Verification checklist for any change

```bash
npm run lint
npx tsc --noEmit
npm run test        # chains ALL module self-check tests (15 files)
npm run build
npm run db:reset    # drop + re-seed (7 systems, module answers, remediation items)
```

Then smoke-test in a browser: all 16 routes (`/inventory`, `/entity-type`,
`/ai-system-definition`, `/eu-scope`, `/exclusions`, `/prohibited`, `/high-risk`,
`/reclassification`, `/gpai`, `/ai-literacy`, `/transparency`, `/obligations`,
`/readiness`, `/remediation`, `/report`, `/report/non-final-guidance`) list the same
systems consistently. End-to-end scenario on seeded data: **EU Resume Ranker SaaS**
(non-EU high-risk provider) flows M4 in-scope + Art 22 rep → M7 likely_high_risk →
M12 full provider row set → M13 gaps → M14 items (owner pre-assigned) → M15 report
with badged provisional deadlines; **Perimeter Threat Detection** exercises the
dual-use military re-entry + biometric needs-review path.

## Conventions established (keep consistent)

- Deterministic rules only, no LLM reasoning; every output traces to a rule ID.
- Status wording: "likely / possible / needs review" — never "compliant",
  "in scope confirmed", "legally cleared". Status enums use exact spec strings.
- Verbatim disclaimer (`DISCLAIMER_TEXT`) on every result view; CSV export on every
  table; cross-module consistency warnings whenever an uncertain upstream status
  undermines a module.
- Anything derived from the May 2026 Digital Omnibus or the 2026-05-19 draft
  guidelines is tagged provisional/draft — never final.
- Self-check tests are plain `node:assert` scripts run via `npx tsx <file>.test.ts`,
  all chained into `npm run test`.
- Prisma: run `npm run prisma:generate` after any schema change before `tsc`.
