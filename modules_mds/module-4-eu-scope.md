Build Module 4: EU Scope & Applicability for the existing EU AI Act Compliance Readiness Dashboard.

Flowchart section: #S Scope. Legal basis: Article 2, Article 22 (and Article 54 for GPAI).
Depends on: Module 1 (inventory), Module 2 (entity role). Feeds: Module 5 (exclusions), Module 12 (obligations matrix).

Design principle (same as Module 3):
Do NOT build a fresh questionnaire. This is a deterministic derived-assessment layer that reuses Module 1 (organisation establishment, countries where output is used, product type) and Module 2 (entity role) and only asks what is missing. It determines whether the AI Act applies at all, and whether a non-EU provider must appoint an EU authorised representative before market placement.

Establish these ONCE as shared conventions and reuse them in every later module (5-15); do not re-explain them each time:
- Deterministic rules in a per-module rules file, no LLM reasoning.
- Status wording is "likely / possible / needs review" — never "compliant", "non-compliant", "in scope confirmed", "legally cleared".
- Every rule and result carries: legal_basis_citation (Article/Annex), guidance_status ("final" | "provisional" | "draft"), source_version_date. Rules derived from the May 2026 Digital Omnibus or the 2026-05-19 draft high-risk guidelines must be tagged provisional/draft, never final.
- Standard disclaimer footer (verbatim): "This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made."
- CSV export on every table; cross-module consistency warning when an upstream uncertain status undermines this module.

Routes:
- /eu-scope — list view, one row per inventory item.
- /eu-scope/systems/[id] — detail view: each Article 2(1) trigger evaluated, matched rule id + citation, and the Article 22/54 authorised-representative determination with reasoning.

Questionnaire (reuse-first, plain English):
1. Where is your organisation legally established or located?
   Helper: 'Established' = where the entity is registered or has its main place of business. Answer 'Third country' if outside EU/EEA.
   Reused from: module-1 organisation location / module-2 entity establishment.
   Options: Established in the EU/EEA · Established in a third country (outside EU/EEA) · Not sure
2. Do you place this AI system on the EU market, or put it into service in the EU?
   Helper: 'Placing on the market' = first making it available in the Union. 'Putting into service' = supplying it for first use in the Union. For GPAI, placing the model on the EU market.
   Reused from: module-1 deployment/market fields. Options: Yes · No · Not sure · Not applicable
3. Is the output produced by the AI system (predictions, content, recommendations, decisions) used by people or organisations located in the EU?
   Helper: The extraterritorial trigger — even if you and the system sit outside the EU, using its output inside the EU brings you into scope.
   Reused from: module-1 countriesUsed / output destination. Options: Yes · No · Not sure · Not applicable
4. What is your role for this system?
   Helper: Provider, deployer, importer, distributor, authorised representative. Scope triggers differ by role.
   Reused from: module-2 role. Options: Provider · Deployer · Importer · Distributor · Authorised representative · Not sure
5. Are you a provider established outside the EU whose high-risk AI system or GPAI model will be made available on the EU market?
   Helper: If yes, Article 22 requires you to appoint, by written mandate, an EU-established authorised representative before the high-risk system is placed on the market. GPAI-model providers have a parallel duty (Article 54).
   Reused from: module-2 role + module-1 establishment/product type. Options: Yes · No · Not sure · Not applicable

Deterministic rules (src/lib/eu-scope/scopeRules.ts) — all guidance_status: final, source_version_date 2026-07-07:
- S-01: Provider places an AI system on the EU market / puts it into service (or places a GPAI model on the EU market), wherever established → IN SCOPE. [Article 2(1)(a)]
- S-02: Deployer established or located in the Union → IN SCOPE. [Article 2(1)(b)]
- S-03: Provider/deployer in a third country but system output is used in the Union → IN SCOPE (extraterritorial). [Article 2(1)(c)]
- S-04: Provider in a third country AND places a high-risk system on the EU market → MUST appoint an EU-established authorised representative by written mandate BEFORE market placement. [Article 22(1)]
- S-05: Provider in a third country AND places a GPAI model on the EU market → MUST appoint an EU authorised representative before placing the model (parallel to, independent of, S-04). [Article 54]
- S-06: None of S-01..S-03 satisfied → OUT OF SCOPE (a contrario). [Article 2(1)]

Result object (aiScopeAssessment, stored per system):
- classification_or_status: likely_in_scope | possibly_in_scope | likely_out_of_scope | needs_review
- confidence_score (0-100 deterministic), confidence_label: high 80-100 / medium 50-79 / low 20-49 / insufficient_information 0-19
- reasoning_summary (deterministic text naming the matched Article 2(1) trigger and any Art 22/54 duty)
- positive_indicators / negative_indicators / key_uncertainties / missing_fields / recommended_next_questions
- authorised_representative_required: boolean + citation (Art 22 / Art 54)
- role_conditional_obligation: keyed to Module 2 role (provider_non_eu_high_risk → appoint EU rep; provider_non_eu_gpai → appoint EU rep; deployer_eu → in scope as deployer; importer/distributor → verify a rep exists for non-EU providers). Re-evaluate if a Module 9 reclassification fires.

Confidence scoring: baseline 90 where establishment, output destination and role are all known and a single trigger clearly matches; subtract for each 'Not sure' on establishment / output-used-in-Union / role, and where product type (high-risk/GPAI) is unknown but needed for the Art 22/54 determination.

UI:
- Summary cards: in-scope trigger met (a/b/c), establishment location, output-used-in-Union flag, authorised-representative required.
- Table columns: system name, scope status, matched trigger (Art 2(1)(a/b/c)), authorised-rep required, confidence, key uncertainty. + CSV export.
- Filters: scope status, entity role, establishment (EU / third country), authorised-rep required.
- Cross-module consistency warning: flag if Module 2 role is uncertain (scope + authorised-rep duty depend on it), and note that a pending Module 5 exclusion may render an in-scope finding moot.

Implementation:
- Rules in src/lib/eu-scope/scopeRules.ts. Helpers: calculateScopeStatus(system), getAuthorisedRepRequirement(system), buildScopeAssessment(system). Auto-calculate on inventory create/update, with a manual "Refresh assessment" action.
- Add a self-check test (tsx pattern, like ai-system.test.ts): EU deployer → in scope (S-02); non-EU provider placing high-risk on EU market → in scope + authorised-rep required (S-01+S-04); non-EU provider, output not used in EU, no EU placement → out of scope (S-06); non-EU GPAI provider → authorised-rep required (S-05).

Acceptance criteria: /eu-scope list + detail exist; reuse Module 1/2 data without re-asking; deterministic scope status + Art 22/54 determination; confidence/reasoning/indicators/uncertainties shown; CSV export; consistency warning on uncertain Module 2 role; disclaimer footer present; tests cover S-01..S-06. No later modules implemented here.
