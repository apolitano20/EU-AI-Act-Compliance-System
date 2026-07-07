Build Module 5: Exclusions for the existing EU AI Act Compliance Readiness Dashboard.

Flowchart section: #R2. Legal basis: Article 2 (carve-outs). Depends on: Module 1, Module 3 (AI-system gate), Module 4 (scope). Feeds: Module 6 (prohibited), Module 7 (high-risk).

Apply the shared conventions established in Module 4 (deterministic rules file, "likely/possible/needs review" wording, legal_basis_citation + guidance_status + source_version_date on every rule, verbatim disclaimer footer, CSV export, cross-module consistency warnings). Reuse-first derived assessment: only ask what Module 1/3/4 did not already capture.

Evaluates the Article 2 carve-outs that remove an otherwise in-scope system from the Act: military/defence/national-security, third-country law-enforcement/judicial cooperation, scientific R&D and pre-market development, free and open-source release, and personal/non-professional use. Each carve-out is narrow and conditional — surface the conditions that would revoke it rather than declaring a clean exclusion.

Routes: /exclusions (list) and /exclusions/systems/[id] (detail — each Article 2 carve-out evaluated, matched rule id + citation, revoking conditions, residual duties).

Questionnaire (reuse-first):
1. Is this AI system used exclusively for military, defence, or national-security purposes?
   Helper: Purpose-based, not sector-based. If a military system is later used (even temporarily) for civilian/humanitarian/law-enforcement purposes, it re-enters scope.
   Reused from: module-1 use case/sector. Options: Yes · No · Partly / dual use · Not sure
2. Is the system operated by a third-country public authority or an international organisation under an international agreement for law-enforcement or judicial cooperation with the EU/a Member State?
   Helper: Applies only where adequate fundamental-rights safeguards are in place.
   Reused from: module-1 operator type / module-2 entity type. Options: Yes · No · Not sure · Not applicable
3. Is the system currently only in scientific research, testing, or development, before being placed on the market or put into service?
   Helper: Pre-market R&D is excluded. Exception: testing in real-world conditions is NOT covered and remains in scope.
   Reused from: module-1 lifecycle stage / module-3. Options: Yes – pre-market R&D only · No – already on market/in service · Includes real-world testing · Not sure
4. Is the AI system released under a free and open-source licence?
   Helper: Excluded UNLESS high-risk, a prohibited practice, or subject to Article 50 transparency duties. Open-source GPAI models still carry certain Article 53 documentation duties unless they present systemic risk.
   Reused from: module-1 licensing / build-or-buy / module-3. Options: Yes – free and open-source · No – proprietary/commercial · Open-source but high-risk/prohibited/transparency-triggering · Not sure
5. Is the system used by a natural person purely in the course of a personal, non-professional activity?
   Helper: Excludes deployer obligations for individuals using AI privately, not organisations or any professional/commercial use.
   Reused from: module-2 (natural person vs organisation). Options: Yes · No – professional/organisational use · Not sure

Deterministic rules (src/lib/exclusions/exclusionRules.ts) — guidance_status: final, source_version_date 2026-07-07:
- X-01: Used exclusively for military/defence/national-security purposes → EXCLUDED, unless used temporarily/permanently for other (civilian/humanitarian/law-enforcement) purposes, which re-enters scope. [Article 2(3)]
- X-02: Used by third-country public authorities / international organisations under law-enforcement & judicial cooperation with adequate fundamental-rights safeguards → EXCLUDED for that context. [Article 2(4)]
- X-03: Developed and put into service for the sole purpose of scientific R&D → EXCLUDED. [Article 2(6)]
- X-04: Research/testing/development prior to market placement or putting into service → EXCLUDED, BUT real-world-conditions testing is expressly NOT covered and remains in scope. [Article 2(8)]
- X-05: Deployer is a natural person using the system for a purely personal, non-professional activity → EXCLUDED (deployer obligations do not apply). [Article 2(10)]
- X-06: Released under a free and open-source licence → EXCLUDED, UNLESS placed on the market/put into service as high-risk, a prohibited practice (Art 5), or subject to Article 50. Open-source GPAI models retain certain Article 53 duties unless systemic risk. [Article 2(12) with Art 53/54 GPAI nuances]

Result object (aiExclusionAssessment):
- classification_or_status: likely_excluded | possibly_excluded_partial_conditional | likely_not_excluded | needs_review
- confidence_score / confidence_label (baseline 85 when purpose, lifecycle, licensing and deployer-type are known and one carve-out cleanly matches)
- reasoning_summary, positive/negative indicators, key_uncertainties, missing_fields, recommended_next_questions
- conditionality flags: re-entry trigger (dual/repurposed use, real-world testing started, market placement) and open-source-GPAI residual-duty flag
- role_conditional_obligation: personal-use carve-out (Art 2(10)) releases only natural-person deployers, not providers; open-source carve-out affects provider obligations but not downstream deployers using the system in a high-risk/transparency-triggering way.
- not_high_risk_documentation_flag: the open-source carve-out does NOT remove the Article 6(3) not-high-risk self-assessment duty for a provider whose system re-enters scope but is claimed not high-risk.

UI:
- Summary cards: exclusion matched (which Art 2 carve-out), conditional/partial-exclusion warning, re-entry trigger flag, open-source-GPAI residual-duty flag.
- Table: system name, exclusion status, matched carve-out (Art 2(3/4/6/8/10/12)), conditionality warning, confidence, key uncertainty. + CSV.
- Filters: exclusion status, carve-out type, conditional vs full exclusion, open-source flag.
- Cross-module consistency warning: flag if Module 4 scope is uncertain (exclusions only matter for otherwise in-scope systems); flag if Module 3 / Module 1 lifecycle data is uncertain (R&D and open-source carve-outs depend on it).

Implementation: rules in src/lib/exclusions/exclusionRules.ts; helpers classifyExclusion(system), getExclusionRevokingConditions(system), buildExclusionAssessment(system). Auto-calc + refresh action. Self-check tests: military-only → excluded (X-01); military dual-use → not excluded; pre-market R&D → excluded (X-03/04); R&D with real-world testing → not excluded; open-source high-risk → not excluded (X-06); natural-person personal use → excluded (X-05).

Acceptance criteria: /exclusions list + detail; reuses Module 1/3/4; deterministic per-carve-out evaluation with revoking conditions surfaced; conditional exclusions never shown as clean; disclaimer footer; CSV export; consistency warning on uncertain Module 4 scope; tests cover X-01..X-06.
