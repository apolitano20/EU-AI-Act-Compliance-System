# Handoff

Read this first for project status. See `CLAUDE.md` for architecture/commands and
`modules_mds/*.md` for the full spec of each module.

## What this is

An EU AI Act Compliance Readiness Dashboard, built module by module. Each module is a
spec file in `modules_mds/`, implemented one at a time — later modules are explicitly
not started until asked for.

## Built so far

**Module 1 — AI System Inventory** (`modules_mds/module-1-inventory.md`)
The base data model. A 7-step wizard (`src/components/wizard/`) captures one
`AISystem` record per inventory item — name, use case, technical profile, data/people,
build/vendor, risk-domain flags. Routes: `/inventory`, `/inventory/new`,
`/inventory/[id]`, `/inventory/[id]/edit`. Completeness score computed in
`src/lib/completeness.ts`.

**Module 2 — Entity Type / Role Classification** (`modules_mds/module-2-entity-type.md`)
Deterministic questionnaire (`src/lib/entity-type/roleRules.ts`) that classifies which
EU AI Act role(s) (Provider, Deployer, Importer, Distributor, Authorised
Representative, Product Manufacturer) the organisation likely holds per system.
Answers are seeded from Module 1 data where possible, stored in
`EntityRoleAssessment` (one row per system). Routes: `/entity-type`,
`/entity-type/systems/[id]`.

**Module 3 — AI System Definition Gate** (`modules_mds/module-3-ai-system-definition-gate.md`)
Deterministic gate classifying whether each inventory item likely meets the EU AI Act
definition of an "AI system" — reusing Module 1 fields only, **no new questionnaire**.
Rules engine: `src/lib/ai-system-definition/definitionRules.ts` (the spec-named
functions: `calculateAiDefinitionScore`, `classifyAiSystemDefinition`,
`getPositiveIndicators`, `getNegativeIndicators`, `getMissingAiDefinitionFields`,
`getAiDefinitionUncertainties`, `getRecommendedAiDefinitionQuestions`,
`buildAiDefinitionAssessment`). **Derived-only — no storage**: the assessment is
recomputed live from `AISystem` on every read (see `src/lib/ai-system-definition/store.ts`),
so it can never drift from Module 1. Routes: `/ai-system-definition`,
`/ai-system-definition/systems/[id]`. Test fixtures covering the spec's 10 example
cases: `src/lib/ai-system-definition/definitionRules.test.ts`.

Known tension carried over from the Module 3 spec (not fixed, just documented): the
confidence-score formula subtracts for every negative indicator, so a cleanly-answered
"likely not an AI system" record can score near 0 ("insufficient") even though the
classification itself is confident. Implemented the formula exactly as specified;
flagged rather than silently patched. Revisit if it causes confusing UI results.

## What's next

The Module 3 spec explicitly lists what NOT to build yet — this is the backlog, most
sequentially-dependent first:

1. EU scope
2. Exclusions
3. Prohibited AI
4. High-risk classification
5. Transparency obligations
6. GPAI obligations
7. Obligations matrix
8. Evidence / readiness assessment
9. Remediation tracker
10. Final report generator

No spec files exist yet for these (only `module-1`, `module-2`, `module-3` in
`modules_mds/`). When one is ready to start, expect a new
`modules_mds/module-N-*.md` spec to show up first.

## Conventions established so far (keep consistent)

- **Derived-assessment pattern**: a module that classifies/scores existing inventory
  data (Modules 2 & 3) puts its rules in a pure, deterministic `src/lib/<module>/`
  file with no LLM reasoning — every output traces to an explicit rule. Prefer
  recomputing live over storing a snapshot unless the module genuinely needs its own
  questionnaire (Module 2 does, because role answers aren't derivable from Module 1
  alone; Module 3 doesn't).
- Before adding a new module, check whether Module 1 already captures what's needed —
  don't duplicate the questionnaire.
- Every result view shows the disclaimer: "This assessment is a readiness-support tool
  based on deterministic screening rules. It does not provide legal advice and should
  be reviewed by qualified legal or compliance professionals before decisions are made."
- Status labels avoid legal-conclusion language ("likely", "possible", "needs review" —
  never "compliant", "in scope", "legally confirmed").
- Self-check tests are plain `node:assert` scripts run via `npx tsx <file>.test.ts`
  (no test framework in this repo) — see `src/lib/entity-type/roleRules.test.ts` and
  `src/lib/ai-system-definition/definitionRules.test.ts` as the pattern to copy.
- Route/component/lib naming mirrors the module name (`entity-type`,
  `ai-system-definition`) — keep this consistent for the next module.
- When the `headroom` MCP server is available, route large tool outputs through
  `headroom_compress` (see `CLAUDE.md` § Tooling notes).

## Verification checklist for any change

```bash
npm run lint
npx tsc --noEmit
npm run test                                              # existing framework-free suite
npx tsx src/lib/entity-type/roleRules.test.ts              # Module 2 self-check
npx tsx src/lib/ai-system-definition/definitionRules.test.ts  # Module 3 self-check
npm run build
```

Then smoke-test in a browser against the seeded dev DB (`npm run db:seed` if empty) —
`/inventory`, `/entity-type`, `/ai-system-definition` should all list the same systems
consistently.
