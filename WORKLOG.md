# Worklog

Running list of things to do or improve. Not a spec — just notes. Add new items as
they come up; check off when done.

## Open

- [ ] **Improve UI** — general pass, no specifics yet.

- [ ] **Legal/compliance review of citations + dates** — the Modules 4-15 build
  implements the specs' provisional 2026 material verbatim (Digital Omnibus dates,
  2026-05-19 draft high-risk guidelines, PR-I nudifier prohibition), all tagged
  `guidance_status`. A qualified review of the citations and the split timeline is
  still due before the outputs are relied on; regenerate/adjust once the Omnibus is
  published in the Official Journal.

_(Added 2026-07-07)_

## Done

- [x] **Add infobox to questions** — "?" tooltips with helper copy added to the
  Module 1 wizard steps (`src/components/wizard/step{1-6}-*.tsx`, shared
  `FieldLabel` in `fields.tsx`), same pattern as Module 2's questionnaire.
  _(Done 2026-07-07)_

- [x] **Build Modules 4-15** — all twelve modules built from
  `modules_mds/module-{4..15}-*.md`: EU scope, exclusions, prohibited practices,
  high-risk classification, AI literacy, value-chain reclassification, GPAI,
  transparency/FRIA, obligations matrix, evidence/readiness, remediation tracker,
  final report. See `HANDOFF.md` for the architecture (assessment pipeline,
  ModuleAssessment overlay, RemediationItem model, shared conventions layer) and
  the per-module rule IDs/tests. _(Done 2026-07-07)_
