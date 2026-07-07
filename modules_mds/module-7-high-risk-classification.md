Build Module 7: High-Risk Classification for the existing EU AI Act Compliance Readiness Dashboard.

Flowchart section: #HR1-#HR6. Legal basis: Article 6, Article 6(3), Annex I, Annex III, Article 49, Annex VIII. Depends on: Module 1, Module 2 (role), Module 5 (exclusions), Module 6 (prohibited). Feeds: Module 9, Module 11, Module 12.

Apply the shared conventions from Module 4. Reuse-first: reuse Module 1 (sector, use case, output types, is-safety-component, product embedding) and Module 2 (role). Runs only for systems Module 5 did not exclude and Module 6 did not flag as likely_prohibited.

Classifies each system as high-risk or not, via two independent routes then the Article 6(3) carve-out gate:
(1) Annex I product-safety route — the AI is/embeds a product covered by listed EU harmonisation law that requires third-party conformity assessment;
(2) Annex III use-case route — the system falls in one of eight listed high-risk areas.

Routes: /high-risk (list) and /high-risk/systems/[id] (detail — inventory overview, questionnaire, live result panel, role-conditional obligations preview, registration/conformity-route notes, per-rule citations with guidance_status badges).

Questionnaire (plain English):
- HR1 Is the AI system itself a product, or a safety component of a product, covered by one of the EU product-safety laws in Annex I (machinery, medical devices, toys, lifts, radio equipment, vehicles)? Helper: 'safety component' = a component whose failure endangers health/safety; Annex I Section A = New Legislative Framework, Section B = older/transport laws. (module-1 isSafetyComponent, productEmbedding, sector)
- HR2 Does that product already require conformity assessment by an independent third party (notified body) before sale/putting into service? Helper: distinguishes Annex I products that pull the AI into high-risk from those subject only to internal self-assessment.
- HR3 Which of these describes what the system is used for? (choose all — maps to the eight Annex III areas): Biometrics (not otherwise prohibited) · Critical infrastructure · Education and vocational training · Employment/worker management/access to self-employment · Access to essential private and public services (creditworthiness/credit scoring, life/health insurance risk & pricing, public benefits, emergency dispatch) · Law enforcement · Migration, asylum and border control · Administration of justice and democratic processes · None of the above. (module-1 useCaseDescription, sector, outputTypes)
- HR4 Does the system carry out a narrow procedural task, or only improve the result of a task a human already completed, without materially influencing the final decision? Helper: Article 6(3) carve-out condition (a)/(b).
- HR5 Does the system only detect decision-making patterns / deviations, and is it NOT meant to replace or influence a human assessment without proper human review? Helper: Article 6(3) condition (c).
- HR6 Regardless of the above, does the system perform profiling of natural persons? Helper: Article 6(3) final subparagraph — an Annex III system that profiles is ALWAYS high-risk and cannot use the carve-out. (module-1 useCaseDescription)

Deterministic rules (src/lib/high-risk/rules.ts) — carve-out rules relying on the 2026-05-19 draft guidelines are tagged guidance_status: draft:
- HRR-1 Annex I product-safety high-risk — HR1=Yes AND HR2=Yes → high_risk (Annex I route). [Art 6(1); Annex I A/B] final. Note: Digital Omnibus deferred Annex I embedded high-risk obligations to 2028-08-02.
- HRR-2 Annex III use-case (baseline) — any HR3 area selected (not 'None') → candidate_high_risk, proceed to carve-out gate. [Art 6(2); Annex III 1-8] final. Note: Digital Omnibus deferred Annex III stand-alone high-risk obligations to 2027-12-02.
- HRR-3 Article 6(3) significant-risk carve-out — candidate_high_risk AND (HR4=Yes OR HR5=Yes) AND HR6=No → not_high_risk (carve-out applies); sets not_high_risk_documentation_flag = true. [Art 6(3)(a)-(d)] guidance_status: draft (boundary clarified by 2026-05-19 draft guidelines, not final).
- HRR-4 Profiling override — candidate_high_risk AND HR6=Yes → high_risk (carve-out unavailable). [Art 6(3) final subparagraph] final.
- HRR-5 Registration on entering high-risk — result=high_risk (either route) → registration_required=true (Annex VIII / Art 49); non-public sub-database for law-enforcement, migration and border systems. [Art 49; Art 71; Annex VIII] final.

Result object:
- classification_or_status: likely_high_risk | possibly_high_risk | needs_review | likely_not_high_risk | not_high_risk_carve_out | not_assessed_excluded. Never "compliant".
- confidence_score: start 100; −20 if Annex I safety-component status unknown, −20 if Annex III area selection 'Not sure', −25 if carve-out answers (HR4/HR5) unknown while a candidate area is selected, −15 if profiling status (HR6) unknown, −10 per contradiction; floor 0. Standard labels.
- reasoning_summary (name route + carve-out outcome + applicable date), positive/negative indicators, key_uncertainties, missing_fields (module-1 isSafetyComponent/sector/useCaseDescription; module-2 role; module-6 status), recommended_next_questions.
- role_conditional_obligation: Provider → full Articles 8-17 + conformity assessment/CE marking (Art 43) + registration (Art 49); Deployer → Article 26 + Article 27 FRIA where applicable; Importer (Art 23)/Distributor (Art 24) → verification duties. Keyed to Module 2; re-evaluate on Module 9 reclassification.
- reclassification_trigger_flags: substantial_modification / rebranded / purpose_changed_to_high_risk (Article 25 — feed Module 9).
- registration_required: true when high_risk; Art 49/Annex VIII before market/putting into service; non-public section for law-enforcement/migration/asylum/border (Art 49(4)); also registration of the Article 6(3) not-high-risk self-assessment.
- not_high_risk_documentation_flag: true when HRR-3 applies — provider must document the "not high-risk" assessment before market placement and register it (Art 6(3)/6(4), Art 49(2)). "Not high-risk" ≠ "nothing to do".

UI: summary cards (total classified, likely/possibly high-risk, not-high-risk carve-out, likely not high-risk, needs review); table (system, route Annex I/III, matched category, status, confidence, carve-out applied?, registration required?, applicable-from date, key uncertainty, actions) + CSV incl. legal_basis_citation, guidance_status, applicable_from_date, standards_conformity_route; filters (status, confidence, route, Annex III area, registration required, carve-out applied, role). Cross-module consistency warning: when Module 6 is needs_review (a prohibited finding overrides high-risk), Module 2 role uncertain (obligation set can't be finalised), or Module 5 exclusion unresolved; note that all carve-out rules and enforcement dates rest on draft/provisional 2026 guidance and may change before 2027-12-02 / 2028-08-02.

Guidance-status note (show in UI): Annex I and Annex III themselves are final law; the Commission's draft high-risk classification guidelines (published 2026-05-19, consultation closed 2026-06-23) that clarify borderline cases and the Article 6(3) carve-out are NOT final — any rule derived from them carries guidance_status: draft. Enforcement dates deferred by the Digital Omnibus (provisional agreement 2026-05-07).

Implementation: rules in src/lib/high-risk/rules.ts; helpers classifyHighRisk(system), applyArticle6_3CarveOut(system), buildHighRiskAssessment(system). Self-check tests: recruitment screening that profiles candidates → HRR-2+HRR-4 likely_high_risk, registration required; Annex I medical-device safety component requiring notified body → HRR-1 high_risk; Annex III narrow procedural task, no profiling → HRR-3 not_high_risk_carve_out with documentation flag set; use case outside all Annex III areas → likely_not_high_risk.

Acceptance criteria: /high-risk list + detail; reuses Module 1/2; runs only for non-excluded, non-prohibited systems; two-route + carve-out gate deterministic; profiling override enforced; registration + not-high-risk documentation flags set correctly; draft-derived rules badged; CSV export; disclaimer footer; tests cover HRR-1..HRR-5.
