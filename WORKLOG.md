# Worklog

Running list of things to do or improve. Not a spec — just notes. Add new items as
they come up; check off when done.

## Open

- [ ] **Improve UI** — general pass, no specifics yet.

- [ ] **Add infobox to questions** — some wizard/questionnaire questions aren't
  self-explanatory. Add a small "?" icon next to (or above) the question label that
  shows a detailed explanation on hover.
  - `src/components/ui/tooltip.tsx` already exists and is already used this way for
    Module 2's questionnaire (`src/components/entity-type/role-questionnaire.tsx`,
    the `Info` icon + `question.helper` field) — extend that same pattern to Module 1's
    wizard steps (`src/components/wizard/step{1-7}-*.tsx`), which don't have helper
    text yet.
  - Needs per-field helper copy written for whichever questions are unclear (not just
    the UI plumbing).

_(Added 2026-07-03)_

- [ ] **Build Modules 4-15** — build specs written in `modules_mds/module-{4..15}-*.md`
  (one per module: EU scope, exclusions, prohibited, high-risk, AI literacy, value-chain
  reclassification, GPAI, transparency/FRIA, obligations matrix, evidence/readiness,
  remediation tracker, final report). Same derived-assessment pattern as Modules 1-3.
  Shared conventions are stated once in `module-4-eu-scope.md` and referenced by the rest.
  - Build/dependency order: 4→5→6→7, then 8/9/10/11 (any order), then 12→13→14→15.
    12-15 only aggregate upstream, so they can't be built until 4-11 exist.
  - Specs trace to `eu-ai-act-modules/report.md` (the research compile). Content includes
    *provisional* 2026 material (Digital Omnibus, draft high-risk guidelines), all tagged
    `guidance_status`. Get a legal/compliance review of the citations + dates before building.

_(Added 2026-07-07)_
