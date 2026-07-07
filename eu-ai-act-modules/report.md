# EU AI Act Compliance Readiness Dashboard — Remaining Modules (4-15)

Research report generated from `outline.yaml` / `fields.yaml` and validated `results/*.json`.

## Table of Contents

1. [EU Scope & Applicability](#eu-scope--applicability) - Confidence: 90 (high) | Basis: Article 2, Article 22
2. [Exclusions](#exclusions) - Confidence: 85 (high) | Basis: Article 2
3. [Prohibited AI Practices](#prohibited-ai-practices) - Basis: Article 5, Recital 28-45, Article 99
4. [High-Risk Classification](#high-risk-classification) - Basis: Article 6, Article 6(3), Annex I, Annex III, Article 49, Annex VIII
5. [AI Literacy](#ai-literacy) - Confidence: 90 (high) | Basis: Article 4
6. [Value-Chain Reclassification](#value-chain-reclassification) - Confidence: 75 (medium) | Basis: Article 25
7. [GPAI Obligations](#gpai-obligations) - Basis: Article 51, Article 53, Article 55, Article 25, Annex XI, Annex XII, Annex XIII, Recital 97, Recital 110
8. [Transparency Obligations](#transparency-obligations) - Basis: Article 50, Article 27, Annex III, Recital 132, Recital 133, Recital 134, Recital 135, Recital 96
9. [Obligations Matrix](#obligations-matrix) - Basis: Article 9-15, Article 17, Article 22-24, Article 26, Article 43, Article 47-49, Article 72-73, Recital 47, Recital 166
10. [Evidence & Readiness Assessment](#evidence--readiness-assessment) - Basis: Article 9-15, Article 17, Article 26, Article 43, Article 47-49, Article 72-73, Annex IV (technical documentation), Annex VIII (registration)
11. [Remediation Tracker](#remediation-tracker) - Basis: Article 9-15 (obligations whose gaps are being remediated, inherited via Module 13/12), Article 17 (quality management system), Article 26 (deployer obligations), Article 43, 47-49 (conformity assessment, registration), Article 72 (post-market monitoring — recurring), Article 73 (serious-incident reporting readiness — event-driven/recurring), Annex IV (technical documentation), Annex VIII (registration)
12. [Final Report Generator](#final-report-generator) - Basis: Article 2 (scope), Article 4 (AI literacy), Article 5 (prohibited practices), Article 6, Annex I, Annex III (high-risk classification), Article 9-15 (high-risk requirements), Article 17 (QMS), Article 22-25 (authorised rep, value-chain/provider conversion), Article 26-27 (deployer obligations, FRIA), Article 43, 47-49 (conformity, registration), Article 50 (transparency), Article 51, 53, 55 (GPAI, systemic risk), Article 72-73 (post-market monitoring, incident reporting), Annex IV (technical documentation), Annex VIII (registration), Recital 47, Recital 166

---

## 1. EU Scope & Applicability
**Module ID**: module-4  
**Flowchart section**: #S Scope  
**Legal basis**: Article 2, Article 22  
**Depends on**: module-1, module-2  

Determines whether the AI Act applies at all, based on where the provider/deployer is established and where system outputs are used. Extended with an Article 22 question: whether a non-EU provider of a high-risk system / GPAI model must appoint an EU authorised representative before market placement.

### Questionnaire

- **questions**:
  - **question_text**: Where is your organisation legally established or located? | **helper_text**: 'Established' means where the entity is registered or has its main place of business. Answer 'Third country' if you are outside the EU/EEA. | **reused_from**: module-1 (organisation location) / module-2 (entity establishment)
    Established in the EU/EEA, Established in a third country (outside EU/EEA), Not sure
  - **question_text**: Do you place this AI system on the EU market, or put it into service in the EU? | **helper_text**: 'Placing on the market' = first making it available in the Union. 'Putting into service' = supplying it for first use to a deployer or for own use in the Union. For GPAI, this means placing the model on the EU market. | **reused_from**: module-1 (deployment/market fields)
    Yes, No, Not sure, Not applicable
  - **question_text**: Is the output produced by the AI system (predictions, content, recommendations, decisions) used by people or organisations located in the EU? | **helper_text**: This is the extraterritorial trigger: even if you and your system sit entirely outside the EU, using its output inside the EU can bring you into scope. | **reused_from**: module-1 (countriesUsed / output destination)
    Yes, No, Not sure, Not applicable
  - **question_text**: What is your role for this system? | **helper_text**: Provider, deployer, importer, distributor, or authorised representative. Scope triggers differ by role (a deployer is in scope if established in the EU; a provider is in scope if it places the system on the EU market wherever it sits). | **reused_from**: module-2 (role classification)
    Provider, Deployer, Importer, Distributor, Authorised representative, Not sure
  - **question_text**: Are you a provider established outside the EU whose high-risk AI system or GPAI model will be made available on the EU market? | **helper_text**: If yes, Article 22 requires you to appoint, by written mandate, an EU-established authorised representative before the high-risk system is placed on the market. GPAI-model providers have a parallel duty (Article 54). | **reused_from**: module-2 (role) + module-1 (establishment, product type)
    Yes, No, Not sure, Not applicable

### Deterministic Rules

- **rules**:
  - **rule_id**: S-01 | **condition**: Provider places an AI system on the EU market or puts it into service in the Union (or places a GPAI model on the EU market), irrespective of where the provider is established. | **result**: IN SCOPE | **legal_basis_citation**: Article 2(1)(a) | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: S-02 | **condition**: Deployer of an AI system has its place of establishment or is located within the Union. | **result**: IN SCOPE | **legal_basis_citation**: Article 2(1)(b) | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: S-03 | **condition**: Provider or deployer is established/located in a third country, but the output produced by the AI system is used in the Union. | **result**: IN SCOPE (extraterritorial) | **legal_basis_citation**: Article 2(1)(c) | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: S-04 | **condition**: Provider is established in a third country AND places a high-risk AI system on the EU market. | **result**: MUST appoint an EU-established authorised representative by written mandate BEFORE making the high-risk system available on the Union market. | **legal_basis_citation**: Article 22(1) | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: S-05 | **condition**: Provider is established in a third country AND places a GPAI model on the EU market. | **result**: MUST appoint an EU-established authorised representative before placing the GPAI model on the market (parallel to, and independent of, the Article 22 high-risk duty). | **legal_basis_citation**: Article 54 | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: S-06 | **condition**: None of S-01 through S-03 is satisfied (no EU market placement, no EU deployer, no output used in the Union). | **result**: OUT OF SCOPE (subject to exclusion checks in Module 5 still being moot). | **legal_basis_citation**: Article 2(1) (a contrario) | **guidance_status**: final | **source_version_date**: 2026-07-07

### Result Object

- **classification_or_status**: likely in scope | possibly in scope | likely out of scope | needs review
- **confidence_score**: 90
- **confidence_label**: high
- **reasoning_summary**: Scope is established when any one of the three Article 2(1) triggers is met: (a) a provider places the system/GPAI model on the EU market wherever established; (b) a deployer is established or located in the Union; or (c) a third-country provider/deployer whose system output is used in the Union. Where a non-EU provider of a high-risk system (Article 22) or GPAI model (Article 54) is in scope, an EU authorised representative must be appointed before market placement.
- **positive_indicators**:
  - System placed on the EU market or put into service in the Union (Art 2(1)(a))
  - Deployer established or located in the EU (Art 2(1)(b))
  - System output used in the Union despite third-country establishment (Art 2(1)(c))
  - Non-EU provider of high-risk system or GPAI model triggering authorised-representative duty (Art 22 / Art 54)
- **negative_indicators**:
  - No EU market placement, no EU deployer, and no output used in the Union
  - Activity falls entirely under a Module 5 exclusion (military/national security, third-country law-enforcement cooperation, R&D, personal non-professional use)
- **key_uncertainties**:
  - Whether system output is 'used in the Union' can be ambiguous where users are transient or location is unknown
  - Timing/independence of the GPAI authorised-representative duty (Art 54) relative to the high-risk one (Art 22) for providers who are both
  - Interaction between scope determination and open-source/R&D exclusions handled in Module 5
- **missing_fields**:
  - organisation_establishment_country (module-1)
  - output_destination / countriesUsed (module-1)
  - entity_role (module-2)
  - product_type: high_risk_or_gpai (module-1/module-7)
- **recommended_next_questions**:
  - Confirm the countries where system output is consumed.
  - Confirm whether the system is high-risk or a GPAI model (needed to assess the Article 22 / Article 54 authorised-representative duty).
  - If out of scope, re-check after any change that routes output into the Union.
- **role_conditional_obligation**:
  - **provider_non_eu_high_risk**: Appoint EU authorised representative before market placement (Art 22); full provider obligations otherwise.
  - **provider_non_eu_gpai**: Appoint EU authorised representative before placing GPAI model on market (Art 54).
  - **deployer_eu**: In scope as deployer; deployer obligations apply per risk tier (assessed downstream).
  - **importer_distributor**: In scope as importer/distributor with verification duties; must confirm authorised representative exists for non-EU providers.
  - **note**: Same in-scope system yields different duties by Module 2 role; re-evaluate if a Module 9 reclassification trigger fires.
- **reclassification_trigger_flags**:
  - **substantial_modification**: False
  - **rebranded**: False
  - **purpose_changed_to_high_risk**: False
  - **note**: Scope module does not set these; it flags them for Module 9. A reclassification that promotes a non-EU deployer/distributor to provider can newly trigger the Article 22 authorised-representative duty.
- **not_high_risk_documentation_flag**: Not applicable at scope stage; the Article 6(3) not-high-risk documentation duty is evaluated in the high-risk classification module for in-scope systems.

### UI Pattern

- **summary_cards**:
  - In-scope trigger met (a/b/c)
  - Establishment location
  - Output-used-in-Union flag
  - Authorised-representative required (Art 22/54)
- **results_table**: Columns: system name, scope status, matched trigger (Art 2(1)(a/b/c)), authorised-rep required, confidence, key uncertainty.
- **filters**:
  scope status, entity role, establishment (EU/third country), authorised-rep required
- **csv_export**: True
- **detail_page**: Shows each Article 2(1) trigger evaluated, the matched rule id and citation, and the Article 22/54 authorised-representative determination with reasoning.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and does not confirm legal compliance. Consult qualified counsel for definitive determinations.
- **cross_module_consistency_warning**: Flag if Module 2 (entity role) is uncertain/needs-review, since scope triggers and the authorised-representative duty depend on the role and establishment classification; also flag if a Module 5 exclusion is pending, as it may render an in-scope finding moot.

### Other Info

- **source_version_date**: 2026-07-07

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date
- registration_required
- standards_conformity_route


---

## 2. Exclusions
**Module ID**: module-5  
**Flowchart section**: #R2  
**Legal basis**: Article 2  
**Depends on**: module-1, module-3, module-4  

Evaluates the Article 2 carve-outs that remove a system from the AI Act's scope: military/defence/national-security use, third-country law-enforcement/judicial cooperation, scientific research & pre-market development, free and open-source release, and personal/non-professional use by a natural person.

### Questionnaire

- **questions**:
  - **question_text**: Is this AI system used exclusively for military, defence, or national-security purposes? | **helper_text**: The carve-out is purpose-based, not sector-based. If a system built for military use is later used (even temporarily) for civilian, humanitarian, or law-enforcement purposes, it re-enters scope. | **reused_from**: module-1 (use case / sector)
    Yes, No, Partly / dual use, Not sure
  - **question_text**: Is the system operated by a third-country public authority or an international organisation under an international agreement for law-enforcement or judicial cooperation with the EU or a Member State? | **helper_text**: This narrow exclusion applies only where adequate safeguards for fundamental rights are in place under such cooperation frameworks. | **reused_from**: module-1 (operator type) / module-2 (entity type)
    Yes, No, Not sure, Not applicable
  - **question_text**: Is the system currently only in scientific research, testing, or development, before being placed on the market or put into service? | **helper_text**: Pre-market R&D is excluded. Important exception: testing in real-world conditions is NOT covered by the exclusion and remains in scope. | **reused_from**: module-1 (lifecycle stage) / module-3 (AI-system definition gate)
    - Yes - pre-market R&D only
    - No - already placed on market / in service
    - Includes real-world testing
    - Not sure
  - **question_text**: Is the AI system released under a free and open-source licence? | **helper_text**: Open-source release is excluded UNLESS the system is high-risk, a prohibited practice, or subject to Article 50 transparency duties. Note: open-source GPAI models still carry certain Article 53 documentation duties unless they present systemic risk. | **reused_from**: module-1 (licensing / build-or-buy) / module-3
    - Yes - free and open-source
    - No - proprietary/commercial
    - Open-source but high-risk/prohibited/transparency-triggering
    - Not sure
  - **question_text**: Is the system used by a natural person purely in the course of a personal, non-professional activity? | **helper_text**: This excludes deployer obligations for individuals using AI privately (e.g. a hobby project), not organisations or any professional/commercial use. | **reused_from**: module-2 (entity/role: natural person vs organisation)
    Yes, No - professional/organisational use, Not sure

### Deterministic Rules

- **rules**:
  - **rule_id**: X-01 | **condition**: AI system placed on the market, put into service, or used exclusively for military, defence, or national-security purposes (regardless of the type of entity carrying out the activity). | **result**: EXCLUDED — unless the system is used, temporarily or permanently, for other (civilian/humanitarian/law-enforcement) purposes, in which case it re-enters scope. | **legal_basis_citation**: Article 2(3) | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: X-02 | **condition**: System used by public authorities of a third country or by international organisations acting within international cooperation/agreements for law-enforcement and judicial cooperation with the EU or Member States, with adequate fundamental-rights safeguards. | **result**: EXCLUDED for that cooperation context. | **legal_basis_citation**: Article 2(4) | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: X-03 | **condition**: AI systems or models specifically developed and put into service for the sole purpose of scientific research and development. | **result**: EXCLUDED. | **legal_basis_citation**: Article 2(6) | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: X-04 | **condition**: Any research, testing, or development activity regarding AI systems/models prior to their being placed on the market or put into service. | **result**: EXCLUDED — but testing in real-world conditions is expressly NOT covered and remains in scope. | **legal_basis_citation**: Article 2(8) | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: X-05 | **condition**: Deployer is a natural person using the AI system in the course of a purely personal, non-professional activity. | **result**: EXCLUDED (deployer obligations do not apply). | **legal_basis_citation**: Article 2(10) | **guidance_status**: final | **source_version_date**: 2026-07-07
  - **rule_id**: X-06 | **condition**: AI system released under a free and open-source licence. | **result**: EXCLUDED — UNLESS it is placed on the market/put into service as a high-risk system, is a prohibited practice (Art 5), or is subject to Article 50 transparency obligations. Open-source GPAI models retain certain Article 53 duties unless they present systemic risk. | **legal_basis_citation**: Article 2(12) (with Article 53/54 GPAI open-source nuances) | **guidance_status**: final | **source_version_date**: 2026-07-07

### Result Object

- **classification_or_status**: likely excluded | possibly excluded (partial/conditional) | likely not excluded | needs review
- **confidence_score**: 85
- **confidence_label**: high
- **reasoning_summary**: A system is removed from the AI Act's scope only if it fully satisfies one of the Article 2 carve-outs. Each carve-out is narrow and conditional: the military exclusion collapses on dual-use; the R&D exclusion collapses once real-world testing begins or the system is placed on the market; the open-source exclusion collapses for high-risk, prohibited, or transparency-triggering systems and does not fully release open-source GPAI models; and the personal-use exclusion applies only to natural persons acting non-professionally.
- **positive_indicators**:
  - Exclusive military/defence/national-security purpose (Art 2(3))
  - Third-country/international law-enforcement cooperation with safeguards (Art 2(4))
  - Sole scientific R&D purpose (Art 2(6)) or pre-market development (Art 2(8))
  - Free and open-source release that is not high-risk/prohibited/transparency-triggering (Art 2(12))
  - Natural person, purely personal non-professional use (Art 2(10))
- **negative_indicators**:
  - Dual or repurposed use of a military system (re-enters scope)
  - Real-world testing underway, or system already placed on market / in service
  - Open-source system that is high-risk, prohibited, or subject to Article 50 transparency
  - Professional/organisational use rather than personal use
  - Open-source GPAI model (Art 53 documentation duties persist)
- **key_uncertainties**:
  - Boundary between excluded pre-market R&D and in-scope real-world testing (Art 2(6)/(8))
  - Whether an open-source GPAI model's Article 53 duties survive the open-source carve-out (systemic-risk dependent)
  - Scope of the 'national security' carve-out (Art 2(3)) where use is partly civilian — subject to interpretive debate
  - 'Adequate safeguards' threshold for the third-country law-enforcement exclusion (Art 2(4))
- **missing_fields**:
  - use_case_purpose (module-1)
  - lifecycle_stage / real_world_testing_flag (module-1)
  - licensing_open_source_flag (module-1)
  - deployer_natural_person_flag (module-2)
  - in_scope_status (module-4)
- **recommended_next_questions**:
  - Confirm whether any real-world testing has begun (breaks the R&D exclusion).
  - For open-source systems, confirm high-risk / prohibited / transparency status and whether it is a GPAI model.
  - For military systems, confirm there is no civilian, humanitarian, or law-enforcement use.
- **role_conditional_obligation**:
  - **note**: Exclusions can be role- and use-specific. The Article 2(10) personal-use carve-out releases only natural-person deployers, not providers; the open-source carve-out affects provider obligations but does not release downstream deployers who use the system in a high-risk or transparency-triggering way.
  - **provider_open_source**: Released from most provider obligations unless high-risk/prohibited/Art 50; GPAI providers keep Art 53 duties unless systemic risk.
  - **deployer_natural_person_personal_use**: Excluded from deployer obligations (Art 2(10)).
  - **deployer_professional**: Not covered by the personal-use exclusion.
- **reclassification_trigger_flags**:
  - **substantial_modification**: False
  - **rebranded**: False
  - **purpose_changed_to_high_risk**: False
  - **note**: A purpose change (e.g. military-to-civilian, or personal-to-professional) or repurposing that ends an exclusion is a re-entry event; flag for Module 4 (scope) and Module 9 (reclassification).
- **not_high_risk_documentation_flag**: The open-source carve-out does not remove the Article 6(3) not-high-risk self-assessment documentation duty for providers whose system re-enters scope but is claimed not high-risk.

### UI Pattern

- **summary_cards**:
  - Exclusion matched (which Article 2 carve-out)
  - Conditional / partial exclusion warning
  - Re-entry trigger flag
  - Open-source GPAI residual-duty flag
- **results_table**: Columns: system name, exclusion status, matched carve-out (Art 2(3/4/6/8/10/12)), conditionality warning, confidence, key uncertainty.
- **filters**:
  exclusion status, carve-out type, conditional vs full exclusion, open-source flag
- **csv_export**: True
- **detail_page**: Shows each Article 2 carve-out evaluated with its matched rule id and citation, the conditions that could revoke the exclusion, and residual duties (e.g. open-source GPAI Art 53).
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and does not confirm legal compliance. Consult qualified counsel for definitive determinations.
- **cross_module_consistency_warning**: Flag if Module 4 (scope) is uncertain, since exclusions only matter for otherwise in-scope systems; flag if Module 3 (AI-system definition) or Module 1 lifecycle data is uncertain, as R&D and open-source carve-outs depend on it.

### Other Info

- **source_version_date**: 2026-07-07

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date
- registration_required
- standards_conformity_route


---

## 3. Prohibited AI Practices
**Module ID**: module-6  
**Flowchart section**: #R3  
**Legal basis**: Article 5, Recital 28-45, Article 99  
**Depends on**: module-1, module-5  

Screens each inventoried AI system against the eight Article 5 prohibitions (subliminal/manipulative techniques, exploitation of vulnerabilities, social scoring, predictive policing by profiling, untargeted facial-image scraping, workplace/education emotion recognition, sensitive-attribute biometric categorisation, real-time remote biometric identification), plus the new Digital Omnibus Article 5 prohibition on AI 'nudifiers' / non-consensual intimate imagery and CSAM generation.

### Questionnaire

- **category**: Questionnaire
- **detail_level**: detailed
- **description**: Plain-English, factual-only questions. Never asks 'is this prohibited?'. Reuses Module 1 (use case, output types, deployment context, biometrics flag) and Module 5 (exclusion status) before asking anything new.
- **questions**:
  - **id**: P1 | **question_text**: Does the system try to influence people's decisions or behaviour using techniques they cannot consciously perceive or that are designed to be deceptive or manipulative? | **helper_text**: Examples: subliminal audio/visual cues below conscious perception, dark patterns engineered to distort choices. Ordinary persuasive advertising that people can recognise is NOT this. | **reused_from**: module-1.outputTypes, module-1.useCaseDescription
    Yes, No, Not sure, Not applicable
  - **id**: P2 | **question_text**: Could the system materially distort the behaviour of a specific person or group in a way likely to cause them significant harm? | **helper_text**: 'Significant harm' includes physical, psychological, or financial harm. Paired with P1 to distinguish prohibited manipulation from lawful influence.
    Yes, No, Not sure, Not applicable
  - **id**: P3 | **question_text**: Does the system target or take advantage of people because of their age, a disability, or a specific social or economic situation? | **helper_text**: 'Exploiting a vulnerability' means using a known weakness of a protected group to distort their behaviour in a harmful way (Article 5(1)(b)). | **reused_from**: module-1.affectedPeople
    Yes, No, Not sure, Not applicable
  - **id**: P4 | **question_text**: Does the system score or rate people over time based on their social behaviour or personal characteristics, in a way that can lead to unfavourable treatment in unrelated situations? | **helper_text**: 'Social scoring' (Article 5(1)(c)). Ordinary sector-specific credit scoring or fraud detection based on relevant data is treated separately (may be high-risk, not prohibited). | **reused_from**: module-1.useCaseDescription
    Yes, No, Not sure, Not applicable
  - **id**: P5 | **question_text**: Does the system predict the risk that an individual will commit a crime based solely on profiling or personality traits? | **helper_text**: Article 5(1)(d). The prohibition does not cover systems that support human assessment based on objective, verifiable facts directly linked to a criminal activity. | **reused_from**: module-1.useCaseDescription, module-1.sector
    Yes, No, Not sure, Not applicable
  - **id**: P6 | **question_text**: Does the system build or expand a facial-recognition database by scraping facial images from the internet or CCTV footage without targeting? | **helper_text**: Article 5(1)(e) prohibits untargeted (mass) scraping of facial images to create or grow recognition databases. | **reused_from**: module-1.dataSources, module-1.biometricData
    Yes, No, Not sure, Not applicable
  - **id**: P7 | **question_text**: Does the system infer people's emotions in a workplace or an education/training setting? | **helper_text**: Article 5(1)(f). There is a carve-out for medical or safety reasons (e.g. detecting driver fatigue for safety). | **reused_from**: module-1.deploymentContext, module-1.outputTypes
    Yes, No, Not sure, Not applicable
  - **id**: P8 | **question_text**: Does the system sort people into categories using their biometric data to infer sensitive attributes such as race, political opinions, trade-union membership, religion, sex life, or sexual orientation? | **helper_text**: Article 5(1)(g). Labelling or filtering of lawfully acquired biometric datasets in law enforcement is excepted. | **reused_from**: module-1.biometricData, module-1.outputTypes
    Yes, No, Not sure, Not applicable
  - **id**: P9 | **question_text**: Is the system used for real-time remote biometric identification of people in publicly accessible spaces for law-enforcement purposes? | **helper_text**: Article 5(1)(h). 'Real-time' and 'remote' are cumulative. Narrow exceptions exist (e.g. targeted search for victims, imminent threat, locating a suspect of a listed serious offence) subject to authorisation. | **reused_from**: module-1.biometricData, module-2.role, module-1.deploymentContext
    Yes, No, Not sure, Not applicable
  - **id**: P10 | **question_text**: Can the system generate sexual or intimate images of real, identifiable people without their consent, or generate child sexual abuse material? | **helper_text**: New Digital Omnibus prohibition (provisional, applies 2026-12-02). Covers 'nudifier' apps and CSAM generators. Applies where this is the intended purpose OR a reasonably foreseeable and reproducible output that the provider has not prevented with reasonable and adequate technical safeguards. | **reused_from**: module-1.outputTypes, module-1.useCaseDescription
    Yes, No, Not sure, Not applicable
  - **id**: P11 | **question_text**: If such intimate/sexual or abusive imagery could theoretically be produced, has the provider put in place technical safeguards that reliably prevent it? | **helper_text**: Shown only if P10 is Yes or Not sure. The provisional prohibition captures foreseeable-misuse cases where safeguards are absent or inadequate.
    Yes, No, Not sure, Not applicable

### Deterministic Rules

- **category**: Deterministic Rules
- **detail_level**: detailed
- **description**: src/lib/prohibited/rules.ts — deterministic, rule-traceable, no LLM reasoning. Each rule maps a questionnaire pattern to a prohibition with an explicit legal citation. Runs only if Module 5 did not fully exclude the system; a full exclusion short-circuits to 'not_assessed_excluded'.
- **rules**:
  - **rule_id**: PR-A | **prohibition**: Harmful subliminal, manipulative or deceptive techniques | **trigger**: P1 = Yes AND P2 = Yes | **legal_basis_citation**: Article 5(1)(a); Recital 29 | **source_version_date**: 2026-07-07
  - **rule_id**: PR-B | **prohibition**: Exploitation of vulnerabilities (age, disability, socio-economic situation) | **trigger**: P3 = Yes AND (P2 = Yes OR significant-harm likely) | **legal_basis_citation**: Article 5(1)(b); Recital 29 | **source_version_date**: 2026-07-07
  - **rule_id**: PR-C | **prohibition**: Social scoring leading to detrimental/unfavourable treatment | **trigger**: P4 = Yes | **legal_basis_citation**: Article 5(1)(c); Recital 31 | **source_version_date**: 2026-07-07
  - **rule_id**: PR-D | **prohibition**: Predictive policing based solely on profiling/personality | **trigger**: P5 = Yes | **legal_basis_citation**: Article 5(1)(d); Recital 42 | **source_version_date**: 2026-07-07
  - **rule_id**: PR-E | **prohibition**: Untargeted scraping of facial images to build/expand recognition databases | **trigger**: P6 = Yes | **legal_basis_citation**: Article 5(1)(e); Recital 43 | **source_version_date**: 2026-07-07
  - **rule_id**: PR-F | **prohibition**: Emotion recognition in workplace and education (no medical/safety exception) | **trigger**: P7 = Yes AND NOT medical_or_safety_exception | **legal_basis_citation**: Article 5(1)(f); Recital 44 | **source_version_date**: 2026-07-07
  - **rule_id**: PR-G | **prohibition**: Biometric categorisation inferring sensitive attributes | **trigger**: P8 = Yes AND NOT law-enforcement labelling exception | **legal_basis_citation**: Article 5(1)(g); Recital 30 | **source_version_date**: 2026-07-07
  - **rule_id**: PR-H | **prohibition**: Real-time remote biometric identification in public spaces for law enforcement | **trigger**: P9 = Yes AND NOT authorised_exception (Article 5(1)(h)(i)-(iii)) | **legal_basis_citation**: Article 5(1)(h), Article 5(2)-(7); Recital 32-38 | **source_version_date**: 2026-07-07
  - **rule_id**: PR-I | **prohibition**: AI generation of non-consensual intimate imagery ('nudifiers') and CSAM | **trigger**: P10 = Yes AND (intended_purpose OR (foreseeable_reproducible_output AND P11 != Yes)) | **legal_basis_citation**: Article 5 (new point, Digital Omnibus 2026-05-07); Article 99 penalties | **source_version_date**: 2026-07-07

### Result Object

- **category**: Result Object
- **detail_level**: detailed
- **description**: Per-system prohibited-practice screening output.
- **classification_or_status**: One of: likely_prohibited | possibly_prohibited | needs_review | likely_not_prohibited | not_assessed_excluded. Never 'compliant'/'illegal' — the tool flags likelihood for legal review.
- **confidence_score**: 0-100 deterministic. Start at 100; subtract 15 per core 'Not sure', 20 if biometrics status unknown but relevant, 25 if deployment context (workplace/education/law-enforcement/public-space) unknown but a biometric or emotion trigger is partially met, 10 for each contradictory answer; floor at 0.
- **confidence_label**: high (80-100) | medium (50-79) | low (20-49) | insufficient_information (0-19)
- **reasoning_summary**: Deterministic text, e.g. 'This system infers emotions and is deployed in a workplace with no stated medical or safety purpose, matching the Article 5(1)(f) prohibition. It should be reviewed by qualified counsel before deployment.'
- **positive_indicators**:
  - Matched trigger pattern for one or more Article 5 prohibitions
  - Deployment context confirms a prohibited setting (e.g. workplace, publicly accessible space)
  - Biometric/emotion/sensitive-attribute output type confirmed in Module 1
- **negative_indicators**:
  - A statutory exception applies (medical/safety, authorised law-enforcement use, lawful dataset labelling)
  - System already fully excluded by Module 5 (military/national-security, R&D, personal use)
  - Output type and use case do not touch any Article 5 category
- **key_uncertainties**:
  - Whether a claimed medical/safety exception to emotion recognition genuinely applies
  - Whether real-time remote biometric ID falls within an authorised Article 5(1)(h) exception
  - Scope of the provisional nudifier/CSAM prohibition and the 'reasonable and adequate safeguards' standard pending final Digital Omnibus text
  - Whether foreseeable-misuse generation of intimate imagery is 'reproducible without significant modification'
- **missing_fields**:
  module-1.biometricData, module-1.deploymentContext, module-1.outputTypes, module-5.exclusionStatus
- **recommended_next_questions**:
  - Is the emotion-recognition use justified strictly by a medical or safety purpose?
  - Is the biometric identification real-time or post-event, and is there a documented legal authorisation?
  - What technical safeguards prevent generation of intimate imagery of real identifiable people?
- **role_conditional_obligation**: Prohibitions in Article 5 bind ALL operators (providers, deployers, importers, distributors) regardless of role — there is no role that makes a prohibited practice permissible. Role only affects who bears the penalty exposure. Store as: { provider: 'must not place on market/put into service', deployer: 'must not use', importer_distributor: 'must not make available' }.
- **registration_required**: Not applicable — prohibited systems cannot be placed on the market at all, so there is no Annex VIII / Article 49 registration path. A prohibited-practice finding overrides any high-risk registration workflow.
- **standards_conformity_route**: Not applicable — prohibited practices have no conformity-assessment route; the outcome is prohibition, not certification.
- **not_high_risk_documentation_flag**: Not applicable to prohibited practices. If a system is likely_not_prohibited it proceeds to Module 7 (high-risk classification), where the Article 6(3) not-high-risk documentation duty may apply.

### UI Pattern

- **category**: UI Pattern
- **detail_level**: brief
- **summary_cards**:
  - Total systems screened
  - Likely prohibited
  - Possibly prohibited
  - Needs review
  - Likely not prohibited
  - Excluded (from Module 5)
- **results_table**: One row per system with columns: System name, Matched prohibition(s), Status, Confidence, Key uncertainty, Applicable-from date, Last assessed, Actions. Status and confidence columns mandatory.
- **filters**:
  Status, Confidence, Matched prohibition, Sector, Deployment context
- **csv_export**: Exports all table columns plus legal_basis_citation and guidance_status per matched prohibition.
- **detail_page**: /prohibited/systems/[id] — system overview from inventory, questionnaire, live result panel with reasoning_summary, positive/negative indicators, key uncertainties, recommended next questions, and per-prohibition legal citations.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice. Results should be reviewed by qualified legal or compliance professionals before regulatory decisions are made.
- **cross_module_consistency_warning**: If Module 5 returned an uncertain/needs-review exclusion status, warn that a prohibited-practice finding may be moot (or vice versa) until the exclusion is confirmed. If Module 1's biometricData or deploymentContext is missing, warn that biometric-related prohibitions cannot be reliably screened.

### Other Info

- **source_version_date**: 2026-07-07
- **guidance_status_note**: Original eight prohibitions are final (in force since 2025-02-02, Commission guidelines on prohibited practices published 2025-02-04). The nudifier/NCII/CSAM prohibition is provisional (Digital Omnibus political agreement 2026-05-07, applies 2026-12-02, not yet the adopted final text).

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date
- guidance_status
- reclassification_trigger_flags


---

## 4. High-Risk Classification
**Module ID**: module-7  
**Flowchart section**: #HR1-#HR6  
**Legal basis**: Article 6, Article 6(3), Annex I, Annex III, Article 49, Annex VIII  
**Depends on**: module-1, module-2, module-5, module-6  

Classifies each non-prohibited, non-excluded AI system as high-risk or not. Two independent routes: (1) Annex I product-safety route — AI is a safety component of, or is itself, a product covered by listed EU harmonisation legislation that requires third-party conformity assessment; (2) Annex III use-case route — the system falls in one of eight listed high-risk use-case areas. Applies the Article 6(3) significant-risk carve-out and its documentation duty.

### Questionnaire

- **category**: Questionnaire
- **detail_level**: detailed
- **description**: Runs only for systems that Module 5 did not exclude and Module 6 did not flag as likely_prohibited. Reuses Module 1 (sector, use case, output types, whether it is a safety component, product embedding) and Module 2 (role) before asking new questions.
- **questions**:
  - **id**: HR1 | **question_text**: Is the AI system itself a product, or a safety component of a product, that is covered by one of the EU product-safety laws listed in Annex I (e.g. machinery, medical devices, toys, lifts, radio equipment, vehicles)? | **helper_text**: 'Safety component' means a component whose failure endangers health or safety. Annex I Section A lists New-Legislative-Framework products; Section B lists older/transport-sector laws. | **reused_from**: module-1.isSafetyComponent, module-1.productEmbedding, module-1.sector
    Yes, No, Not sure, Not applicable
  - **id**: HR2 | **question_text**: Does that product already require a conformity assessment by an independent third party (a notified body) before it can be sold or put into service? | **helper_text**: This distinguishes Annex I products that pull the AI into high-risk (third-party assessment required) from those subject only to internal self-assessment.
    Yes, No, Not sure, Not applicable
  - **id**: HR3 | **question_text**: Which of these describes what the system is used for? | **helper_text**: Maps to the eight Annex III areas. Choose all that apply. Selecting one moves you to the significant-risk carve-out questions. | **reused_from**: module-1.useCaseDescription, module-1.sector, module-1.outputTypes
    - Biometrics (remote identification, categorisation by sensitive attributes, emotion recognition) not otherwise prohibited
    - Critical infrastructure (safety of digital infrastructure, road traffic, water/gas/heating/electricity supply)
    - Education and vocational training (admission, assessment, detecting prohibited behaviour during tests)
    - Employment, worker management, access to self-employment (recruitment, task allocation, promotion, termination, monitoring)
    - Access to essential private and public services (creditworthiness/credit scoring, life/health insurance risk & pricing, public benefits eligibility, emergency dispatch)
    - Law enforcement (risk assessment of offending/re-offending, polygraphs, evidence reliability, profiling)
    - Migration, asylum and border control (risk assessment, application examination, detection of irregular entry)
    - Administration of justice and democratic processes (assisting judicial authorities, influencing elections/referenda)
    - None of the above
  - **id**: HR4 | **question_text**: Does the system carry out a narrow procedural task, or only improve the result of a task a human already completed, without materially influencing the final decision? | **helper_text**: Article 6(3) carve-out condition (a)/(b). If yes, the system may NOT be high-risk despite falling in an Annex III area.
    Yes, No, Not sure, Not applicable
  - **id**: HR5 | **question_text**: Does the system only detect decision-making patterns or deviations from prior patterns, and is it NOT meant to replace or influence a human assessment without proper human review? | **helper_text**: Article 6(3) carve-out condition (c). Preparatory/pattern-detection tasks can qualify for the carve-out.
    Yes, No, Not sure, Not applicable
  - **id**: HR6 | **question_text**: Regardless of the above, does the system perform profiling of natural persons? | **helper_text**: Article 6(3) final subparagraph: an Annex III system that profiles natural persons is ALWAYS considered high-risk and cannot use the carve-out. | **reused_from**: module-1.useCaseDescription
    Yes, No, Not sure, Not applicable

### Deterministic Rules

- **category**: Deterministic Rules
- **detail_level**: detailed
- **description**: src/lib/high-risk/rules.ts — deterministic. Two entry routes (Annex I, Annex III) then the Article 6(3) carve-out gate. Carve-out rules that rely on the 2026-05-19 draft guidelines are tagged guidance_status: draft.
- **rules**:
  - **rule_id**: HRR-1 | **name**: Annex I product-safety high-risk | **trigger**: HR1 = Yes AND HR2 = Yes | **result**: high_risk (Annex I route) | **legal_basis_citation**: Article 6(1); Annex I Section A and B | **source_version_date**: 2026-07-07 | **note**: Digital Omnibus deferred Annex I embedded high-risk obligations to 2028-08-02 (from 2027-08-02).
  - **rule_id**: HRR-2 | **name**: Annex III use-case high-risk (baseline) | **trigger**: any HR3 area selected (not 'None') | **result**: candidate_high_risk — proceed to carve-out gate | **legal_basis_citation**: Article 6(2); Annex III points 1-8 | **source_version_date**: 2026-07-07 | **note**: Digital Omnibus deferred Annex III stand-alone high-risk obligations to 2027-12-02 (from 2026-08-02).
  - **rule_id**: HRR-3 | **name**: Article 6(3) significant-risk carve-out | **trigger**: candidate_high_risk AND (HR4 = Yes OR HR5 = Yes) AND HR6 = No | **result**: not_high_risk (carve-out applies) — sets not_high_risk_documentation_flag = true | **legal_basis_citation**: Article 6(3) subparagraphs (a)-(d) | **source_version_date**: 2026-07-07 | **note**: Boundary of 'narrow procedural task' / 'no material influence' clarified by draft Commission guidelines (2026-05-19), not yet final.
  - **rule_id**: HRR-4 | **name**: Profiling override | **trigger**: candidate_high_risk AND HR6 = Yes | **result**: high_risk (carve-out unavailable) | **legal_basis_citation**: Article 6(3) final subparagraph | **source_version_date**: 2026-07-07
  - **rule_id**: HRR-5 | **name**: Registration on entering high-risk | **trigger**: result = high_risk (either route) | **result**: registration_required = true (Annex VIII / Article 49); non-public sub-database for law-enforcement, migration and border systems | **legal_basis_citation**: Article 49; Article 71; Annex VIII | **source_version_date**: 2026-07-07

### Result Object

- **category**: Result Object
- **detail_level**: detailed
- **description**: Per-system high-risk classification output.
- **classification_or_status**: One of: likely_high_risk | possibly_high_risk | needs_review | likely_not_high_risk | not_high_risk_carve_out | not_assessed_excluded. Never 'compliant'.
- **confidence_score**: 0-100 deterministic. Start 100; subtract 20 if Annex I safety-component status unknown, 20 if the Annex III area selection is 'Not sure', 25 if carve-out answers (HR4/HR5) unknown while a candidate area is selected, 15 if profiling status (HR6) unknown, 10 per contradictory answer; floor 0.
- **confidence_label**: high (80-100) | medium (50-79) | low (20-49) | insufficient_information (0-19)
- **reasoning_summary**: Deterministic text, e.g. 'This system is used for recruitment screening (Annex III point 4) and profiles candidates, so the Article 6(3) carve-out does not apply and it is likely high-risk. Provider obligations under Articles 8-17 and registration under Article 49 would apply from 2 December 2027.'
- **positive_indicators**:
  - Falls within a listed Annex III use-case area
  - Is a safety component of an Annex I product requiring third-party conformity assessment
  - Performs profiling of natural persons (blocks the carve-out)
- **negative_indicators**:
  - Performs only a narrow procedural or preparatory task with no material influence on decisions (Article 6(3) carve-out)
  - Annex I product uses internal self-assessment only, not third-party conformity assessment
  - Use case falls outside all eight Annex III areas
- **key_uncertainties**:
  - Exact boundary of 'narrow procedural task' and 'materially influencing the outcome' pending final Commission high-risk guidelines (2026-05-19 draft)
  - Whether a borderline biometric use is high-risk (Annex III) or already prohibited (Module 6 Article 5)
  - Whether the specific Annex I product law requires third-party rather than internal conformity assessment
- **missing_fields**:
  - module-1.isSafetyComponent
  - module-1.sector
  - module-1.useCaseDescription
  - module-2.role
  - module-6.classification_or_status
- **recommended_next_questions**:
  - Which specific Annex I product-safety law applies, and does it mandate a notified-body assessment?
  - Does a human make the final decision, and does the AI output materially influence it?
  - Does the system build a profile of the individuals it assesses?
- **role_conditional_obligation**: High-risk duties differ sharply by Module 2 role. Provider: full Articles 8-17 (risk management, data governance, technical documentation, logging, transparency-to-deployers, human oversight, accuracy/robustness/cybersecurity, QMS), conformity assessment + CE marking (Art 43), registration (Art 49). Deployer: Article 26 duties (use per instructions, human oversight, input-data relevance, monitoring, logs) plus Article 27 FRIA where applicable. Importer (Art 23) / Distributor (Art 24): verification duties. Store keyed to Module 2 output; re-evaluate on a Module 9 reclassification.
- **reclassification_trigger_flags**:
  - **substantial_modification**: A substantial modification (Article 25) makes the modifier a provider of a high-risk system with full obligations.
  - **rebranded**: Putting own name/trademark on a high-risk system makes the actor its provider (Article 25(1)(a)).
  - **purpose_changed_to_high_risk**: Changing intended purpose so the system now falls in Annex III makes the actor a provider (Article 25(1)(c)) — must re-run this module.
- **registration_required**: true when result = high_risk. Article 49 / Annex VIII registration in the EU database before placing on market or putting into service. Law-enforcement, migration, asylum and border-control high-risk systems register in a non-public section (Article 49(4)). Also applies to Article 6(3) not-high-risk self-assessments (registration of the carve-out determination).
- **not_high_risk_documentation_flag**: true when HRR-3 carve-out applies. Article 6(3)/6(4): the provider must document the assessment that the system is NOT high-risk before placing it on the market and register it (Article 49(2)). Prevents treating 'not high-risk' as 'nothing to do'.

### UI Pattern

- **category**: UI Pattern
- **detail_level**: brief
- **summary_cards**:
  - Total systems classified
  - Likely high-risk
  - Possibly high-risk
  - Not high-risk (carve-out)
  - Likely not high-risk
  - Needs review
- **results_table**: One row per system: System name, Route (Annex I / Annex III), Matched category, Status, Confidence, Carve-out applied?, Registration required?, Applicable-from date, Key uncertainty, Actions. Status and confidence mandatory.
- **filters**:
  - Status
  - Confidence
  - Route (Annex I / III)
  - Annex III area
  - Registration required
  - Carve-out applied
  - Role (from Module 2)
- **csv_export**: Exports all columns plus legal_basis_citation, guidance_status, applicable_from_date, and standards_conformity_route per system.
- **detail_page**: /high-risk/systems/[id] — inventory overview, questionnaire, live result panel with reasoning_summary, positive/negative indicators, key uncertainties, role-conditional obligations preview, registration and conformity-route notes, and per-rule legal citations with guidance_status badges.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice. Results should be reviewed by qualified legal or compliance professionals before regulatory decisions are made.
- **cross_module_consistency_warning**: Warn when Module 6 status is needs_review (a prohibited finding would override high-risk), when Module 2 role is uncertain (obligation set cannot be finalised), or when Module 5 exclusion is unresolved. Also flag that all carve-out rules and enforcement dates rest on draft/provisional 2026 guidance and may change before the 2027-12-02 / 2028-08-02 application dates.

### Other Info

- **source_version_date**: 2026-07-07
- **guidance_status_note**: Annex I and Annex III themselves are final law. The Commission's draft guidelines on high-risk classification (published 2026-05-19, consultation closed 2026-06-23) that clarify borderline cases and the Article 6(3) carve-out are NOT yet final — any rule derived from them carries guidance_status: draft. Enforcement dates were deferred by the Digital Omnibus (provisional agreement 2026-05-07).

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date
- guidance_status
- standards_conformity_route


---

## 5. AI Literacy
**Module ID**: module-8  
**Flowchart section**: _(not in flowchart — practical add-on)_  
**Legal basis**: Article 4  
**Depends on**: module-1, module-2  

Article 4 requires providers and deployers to take measures ensuring a sufficient level of AI literacy of their staff and other persons operating/using AI systems on their behalf. It applies horizontally to every AI system regardless of risk tier (including minimal-risk and systems otherwise excluded from other obligations), which is why it cannot be nested inside the high-risk path. In force since 2025-02-02. The Digital Omnibus simplification package softens this into an obligation of effort ('support the development of' AI literacy) rather than an obligation of result ('ensure a sufficient level'), and shifts part of the burden to Member States/Commission to encourage such measures.

### Questionnaire

- **question_text**: Does your organisation use, operate, or provide any AI system in the course of its professional activity? | **helper_text**: This covers systems you build (provider) and systems you merely deploy/use (deployer). It includes minimal-risk and general-purpose systems such as chatbots, coding assistants, or off-the-shelf ML tools. If your organisation touches any AI system at all in a professional context, answer Yes. | **reused_from**: module-1 (any AISystem inventory record) / module-3 (is-an-AI-system gate)
  Yes, No, Not sure
- **question_text**: What is your organisation's role with respect to this AI system? | **helper_text**: Provider = you develop it or have it developed and place it on the market/put it into service under your own name or trademark. Deployer = you use an AI system under your own authority in a professional context. Article 4 applies to both provider and deployer roles. | **reused_from**: module-2 (entity-type role classification)
  Provider, Deployer, Both, Neither (importer/distributor only), Not sure
- **question_text**: Have you put in place any measures to build AI knowledge and skills among the staff who operate or use this system (e.g. training, guidelines, onboarding, usage policies)? | **helper_text**: 'Measures' can be proportionate to context: for a small team using a low-risk tool this may be short internal guidance; for staff operating a high-risk system it should reflect the system's risk, the technical knowledge/experience of those people, and the context of use. There is no mandated curriculum.
  Yes, documented, Yes, informal only, No, Not sure
- **question_text**: Do the people who operate or are affected by this system have the technical knowledge, experience, and training needed to understand its capabilities, limitations, and the risks it poses? | **helper_text**: AI literacy must account for the persons' prior knowledge/experience and the context in which the system is used, including who is affected by its outputs. Answer No if any operating staff use the system without understanding what it can and cannot reliably do.
  Yes, Partially, No, Not sure

### Deterministic Rules

- **rule_id**: AILIT-1-applies-to-all-tiers | **rule_logic**: IF organisation is a provider OR deployer of at least one AI system (module-2 role IN {provider, deployer, both}) THEN Article 4 AI literacy obligation applies, irrespective of the system's risk classification (module-5 exclusion / module-7 high-risk outcome does NOT switch it off). | **legal_basis_citation**: Article 4; Recital 20 | **applicable_from_date**: 2025-02-02 | **guidance_status**: final | **source_version_date**: 2026-07-07
- **rule_id**: AILIT-2-role-scope | **rule_logic**: Obligation attaches only to provider and deployer roles. Pure importer/distributor roles are NOT directly subject to Article 4 (unless reclassified to provider via module-9). IF module-2 role == importer_only OR distributor_only THEN mark not_applicable pending module-9 reclassification check. | **legal_basis_citation**: Article 4 (addressees: 'providers and deployers'); Article 3(3)/(4) role definitions | **applicable_from_date**: 2025-02-02 | **guidance_status**: final | **source_version_date**: 2026-07-07
- **rule_id**: AILIT-3-proportionality | **rule_logic**: Required level of measures is proportionate: evaluate against (a) technical knowledge/experience/education/training of the persons, (b) the context the system is used in, and (c) the persons/groups on whom the system is used. No fixed certification threshold; absence of ANY measures for staff operating a higher-risk system lowers confidence in readiness. | **legal_basis_citation**: Article 4, second sentence | **applicable_from_date**: 2025-02-02 | **guidance_status**: final | **source_version_date**: 2026-07-07
- **rule_id**: AILIT-4-omnibus-softening | **rule_logic**: IN-FLUX: Digital Omnibus reframes Article 4 as an obligation of effort ('take appropriate measures to support the development of AI literacy') rather than result ('ensure a sufficient level'), and adds a Member-State/Commission duty to encourage such measures. Until published in the Official Journal, retain the current in-force text as the operative rule and surface the softening as a forward-looking note, not the binding standard. | **legal_basis_citation**: Digital Omnibus amendment to Article 4 (AI Act simplification package) | **applicable_from_date**: not_yet_in_force (OJ publication expected before 2026-08-02; Council final approval 2026-06-29, Parliament endorsement 2026-06-16) | **guidance_status**: draft | **source_version_date**: 2026-07-07

### Result Object

- **classification_or_status**: AI literacy obligation likely applies (horizontal, all risk tiers) — organisational measures needed for provider/deployer staff
- **confidence_score**: 90
- **confidence_label**: high
- **reasoning_summary**: Article 4 is a horizontal obligation binding on any provider or deployer of an AI system since 2025-02-02, independent of risk classification. Where module-2 assigns a provider or deployer role and module-3 confirms an AI system exists, the obligation applies with high confidence. Confidence is capped below certainty only because (a) the concrete adequacy of measures is judgement-based and proportionate, and (b) the Digital Omnibus softening to an effort-based duty is imminent but not yet published, which may lower the compliance bar retroactively for readiness purposes.
- **positive_indicators**:
  - Organisation is a provider and/or deployer of at least one AI system (module-2)
  - Obligation is already in force (since 2025-02-02) and not deferred by the Omnibus timeline split
  - Applies regardless of risk tier, so no dependence on module-7 high-risk outcome
  - Documented training/guidelines already in place (if questionnaire Q3 == 'Yes, documented')
- **negative_indicators**:
  - Organisation is importer/distributor only with no provider/deployer role and no module-9 reclassification
  - No AI system present (module-3 gate not passed)
  - No measures of any kind in place for staff operating the system (weakens readiness, does not remove the obligation)
- **key_uncertainties**:
  - Whether Article 4 remains an obligation of result or is softened to an effort-based duty depends on final Digital Omnibus text not yet published in the OJ
  - What counts as 'sufficient' AI literacy is context- and proportionality-dependent, with no fixed threshold
  - Whether informal, undocumented measures satisfy the obligation in an enforcement context
- **missing_fields**:
  - module-2 role classification (provider vs deployer vs importer/distributor)
  - presence/description of existing AI-literacy measures (not captured in modules 1-3)
- **recommended_next_questions**:
  - Do you maintain a record of the AI-literacy measures taken (training logs, policies, onboarding materials)?
  - Are measures differentiated by the risk level of each system and the role of the staff using it?
  - Who in the organisation owns AI-literacy compliance, and is it reviewed periodically?
- **role_conditional_obligation**:
  - **provider**: Must take measures to ensure sufficient AI literacy of own staff and others operating/using the system on the provider's behalf.
  - **deployer**: Must take measures to ensure sufficient AI literacy of staff and others operating/using the system under the deployer's authority.
  - **importer**: Not directly obligated under Article 4 unless reclassified to provider (module-9).
  - **distributor**: Not directly obligated under Article 4 unless reclassified to provider (module-9).
  - **authorised_representative**: Not a direct Article 4 addressee; obligation stays with the represented provider.
- **reclassification_trigger_flags**:
  - **substantial_modification**: False
  - **rebranded**: False
  - **purpose_changed_to_high_risk**: False
  - **note**: Article 4 applies to provider and deployer roles alike, so reclassification (module-9) does not create a new AI-literacy duty for a deployer that already had one; it is relevant only for an importer/distributor being promoted into provider scope.
- **registration_required**: not_applicable — Article 4 carries no EU-database registration duty of its own
- **standards_conformity_route**: not_applicable — AI literacy is not subject to harmonised-standards presumption-of-conformity or notified-body assessment

### UI Pattern

- **summary_cards**:
  - Applies to all AI systems (horizontal) — Yes
  - In force since 2025-02-02
  - Status: softening pending (Digital Omnibus, guidance_status: draft)
- **results_table**: Columns: System | Role (provider/deployer) | Obligation applies (Y/N) | Measures in place (documented/informal/none) | Status | Confidence | Key uncertainty
- **filters**:
  role, measures-in-place, confidence_label, guidance_status
- **csv_export**: Export per-system AI-literacy status with legal_basis_citation and applicable_from_date columns for module-15 report aggregation.
- **detail_page**: Shows the four questionnaire answers, the triggered deterministic rules with citations, the role_conditional_obligation breakdown, and an in-flux banner for the Omnibus softening.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and does not guarantee compliance with the EU AI Act. Confirm obligations with qualified counsel.
- **cross_module_consistency_warning**: If module-2 role classification is 'needs review' or module-3 AI-system gate is uncertain, warn that the Article 4 applicability determination inherits that uncertainty. Also surface an in-flux warning that the Digital Omnibus may soften Article 4 to an effort-based duty (guidance_status: draft) before final adoption.

### Other Info

- **new**: True

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date (Omnibus softening OJ publication date not yet fixed; expected before 2026-08-02)
- guidance_status (rule AILIT-4 depends on final Digital Omnibus text not yet published in the Official Journal)
- not_high_risk_documentation_flag


---

## 6. Value-Chain Reclassification
**Module ID**: module-9  
**Flowchart section**: Article 25 provider-conversion risk (referenced but not fully modeled in Module 2)  
**Legal basis**: Article 25  
**Depends on**: module-1, module-2  

Article 25 reallocates responsibility along the AI value chain. A distributor, importer, deployer, or other third party is reclassified as a 'provider' of a high-risk AI system — inheriting the full Article 16 provider obligation set — in three circumstances: (a) they put their name or trademark on a high-risk system already on the market; (b) they make a substantial modification to a high-risk system already placed on the market/put into service such that it remains high-risk; or (c) they modify the intended purpose of a system (including a GPAI system) not previously classified as high-risk such that it becomes high-risk. Module 2 already collects the raw signal (Article25ProviderConversionRisk flag); this module converts it into an explicit reclassification determination feeding the Obligations Matrix (module-12).

### Questionnaire

- **question_text**: Have you placed your own name or trademark on an AI system that was originally provided by someone else? | **helper_text**: 'Rebranding' or white-labelling an existing system under your own brand makes you its provider for AI Act purposes, even if you did not build it. Answer Yes if the system is marketed to your users under your name rather than the original developer's. | **reused_from**: module-2 (Article25ProviderConversionRisk flag)
  Yes, No, Not sure
- **question_text**: Have you made a substantial modification to a high-risk AI system after it was placed on the market or put into service? | **helper_text**: A 'substantial modification' is a change not foreseen or planned in the system's original conformity assessment that either affects its compliance with the high-risk requirements (Chapter III, Section 2) or changes its intended purpose. A pre-planned, already-assessed change is NOT substantial even if technically significant. Routine retraining within the documented scope generally does not qualify. | **reused_from**: module-2 (Article25ProviderConversionRisk flag); module-7 (high-risk status)
  Yes, No, Not sure, Not applicable (system not high-risk)
- **question_text**: Have you changed the intended purpose of an AI system (including a general-purpose AI system) in a way that turns it into a high-risk system? | **helper_text**: If a system that was not high-risk is repurposed by you for a use listed in Annex III (or an Annex I safety-component use) so that it now qualifies as high-risk, you become its provider. Example: taking a general-purpose model and deploying it to score creditworthiness or filter job applicants. | **reused_from**: module-2 (Article25ProviderConversionRisk flag); module-7 (high-risk use-case mapping)
  Yes, No, Not sure
- **question_text**: What is your current role for this system before any reclassification? | **helper_text**: Reclassification only promotes non-provider actors. Only deployers, distributors, importers, or other third parties can be converted into providers under Article 25. If you are already the original provider, this module does not apply. | **reused_from**: module-2 (entity-type role classification)
  Deployer, Distributor, Importer, Other third party, Already the provider, Not sure

### Deterministic Rules

- **rule_id**: VCR-1-rebrand | **rule_logic**: IF role IN {deployer, distributor, importer, third_party} AND put_own_name_or_trademark == true AND system is high-risk THEN reclassify to provider (Article 25(1)(a)). Set reclassification_trigger_flags.rebranded = true. | **legal_basis_citation**: Article 25(1)(a) | **applicable_from_date**: 2026-08-02 (high-risk obligation stream; note Annex III enforcement deferred to 2027-12-02 and Annex I to 2028-08-02 under the Digital Omnibus timeline split) | **guidance_status**: final | **source_version_date**: 2026-07-07
- **rule_id**: VCR-2-substantial-modification | **rule_logic**: IF role IN {deployer, distributor, importer, third_party} AND substantial_modification == true AND system remains high-risk after the change THEN reclassify to provider (Article 25(1)(b)). Apply the two-prong test from Article 3(23): change unforeseen in original conformity assessment AND (affects Chapter III Section 2 compliance OR alters assessed intended purpose). Set reclassification_trigger_flags.substantial_modification = true. | **legal_basis_citation**: Article 25(1)(b); Article 3(23) (definition of substantial modification) | **applicable_from_date**: 2026-08-02 (see Annex I/III deferral note in VCR-1) | **guidance_status**: final | **source_version_date**: 2026-07-07
- **rule_id**: VCR-3-purpose-change-to-high-risk | **rule_logic**: IF role IN {deployer, distributor, importer, third_party} AND intended_purpose_changed == true AND resulting system is now high-risk (module-7 re-evaluation returns high-risk) THEN reclassify to provider (Article 25(1)(c)). Applies even to GPAI systems repurposed into a high-risk use. Set reclassification_trigger_flags.purpose_changed_to_high_risk = true. | **legal_basis_citation**: Article 25(1)(c) | **applicable_from_date**: 2026-08-02 (see Annex I/III deferral note in VCR-1) | **guidance_status**: final | **source_version_date**: 2026-07-07
- **rule_id**: VCR-4-original-provider-cooperation | **rule_logic**: WHEN any of VCR-1/2/3 fires, the original provider ceases to be the provider of that specific system, BUT remains bound by Article 25(2)-(3) cooperation duties: provide the new provider with technical documentation/information and reasonable access needed to fulfil obligations. Emit an informational obligation row for the original provider even after liability shifts. | **legal_basis_citation**: Article 25(2), Article 25(3) | **applicable_from_date**: 2026-08-02 | **guidance_status**: final | **source_version_date**: 2026-07-07
- **rule_id**: VCR-5-draft-high-risk-guidelines-caveat | **rule_logic**: The precise boundary of 'substantial modification' and of 'becomes high-risk' depends in part on the Commission's draft high-risk classification guidelines (published 2026-05-19, consultation closed 2026-06-23), which are not yet final. Any borderline reclassification determination that relies on those guidelines must carry guidance_status: draft and be surfaced as needs-review rather than confirmed. | **legal_basis_citation**: Article 6, Annex III (interpreted via draft Commission high-risk classification guidelines) | **applicable_from_date**: n/a (interpretive guidance) | **guidance_status**: draft | **source_version_date**: 2026-07-07

### Result Object

- **classification_or_status**: Provider reclassification likely triggered — full provider obligation set now applies (needs review where reliant on draft high-risk guidelines)
- **confidence_score**: 75
- **confidence_label**: medium
- **reasoning_summary**: Reclassification under Article 25 is deterministic once a trigger is confirmed: rebranding, substantial modification of a high-risk system, or a purpose change that makes a system high-risk each convert a deployer/distributor/importer into a provider carrying Article 16 obligations. Confidence is medium rather than high because the operative predicates depend on judgement-laden concepts ('substantial modification', 'becomes high-risk') whose boundaries partly rest on not-yet-final Commission guidelines, and because the underlying high-risk status (module-7) must itself be settled before triggers (b) and (c) can be confirmed.
- **positive_indicators**:
  - Organisation is a non-provider actor (deployer/distributor/importer/third party) per module-2 — eligible for conversion
  - Module 2 Article25ProviderConversionRisk flag is set
  - At least one trigger answered Yes (rebrand / substantial modification / purpose change to high-risk)
  - System confirmed high-risk in module-7 (for triggers (a) and (b))
- **negative_indicators**:
  - Organisation is already the original provider (Article 25 promotion not applicable)
  - System is not high-risk and no purpose change makes it high-risk (triggers (a),(b) require high-risk; trigger (c) requires the change to produce high-risk)
  - Change was foreseen and covered by the original conformity assessment (not a substantial modification)
  - Rebranding/modification confined to a non-high-risk system with no purpose change
- **key_uncertainties**:
  - Whether a given modification meets the Article 3(23) 'substantial modification' threshold
  - Whether a repurposed system 'becomes high-risk' — depends on module-7 and draft Commission high-risk guidelines
  - Scope of the original provider's residual cooperation duty after liability shifts
- **missing_fields**:
  - module-7 high-risk classification outcome (required to confirm triggers (a) and (b), and to evaluate trigger (c))
  - detail of the modification/purpose change (not captured in modules 1-3; only signalled by the module-2 flag)
- **recommended_next_questions**:
  - Was the change to the system documented and covered by the original conformity assessment?
  - For a repurposed system, does the new use fall under an Annex III category or an Annex I safety-component use?
  - Has the original provider agreed in writing to supply the technical information you need to meet provider obligations?
- **role_conditional_obligation**:
  - **deployer**: On any Article 25 trigger, deployer is promoted to provider and must satisfy the full Article 16 provider obligation set (risk management, data governance, technical documentation, logging, transparency to deployers, human oversight, accuracy/robustness/cybersecurity, QMS, conformity assessment, registration).
  - **distributor**: Same promotion to provider on a rebrand or substantial modification of a high-risk system.
  - **importer**: Same promotion to provider on a rebrand or substantial modification of a high-risk system.
  - **provider**: Original provider is released as provider of the specific reclassified system but retains Article 25(2)-(3) cooperation/information-sharing duties.
  - **authorised_representative**: Not a conversion target; obligations remain tied to whichever party holds provider status.
- **reclassification_trigger_flags**:
  - **substantial_modification**: False
  - **rebranded**: False
  - **purpose_changed_to_high_risk**: False
  - **note**: This module is the authoritative writer of these flags; boolean values above are defaults to be overwritten by the fired VCR rules. Any true value promotes the actor to provider and re-invokes the Obligations Matrix (module-12) under the provider role.
- **registration_required**: conditional — IF reclassification confirms provider status of a high-risk system THEN the new provider inherits the Article 49 / Annex VIII EU-database registration duty (non-public variant for law-enforcement/migration/border systems). Flag drives an Obligations Matrix action item.
- **standards_conformity_route**: conditional — a reclassified provider of a high-risk system must complete conformity assessment; presumption-of-conformity via harmonised standards applies where relevant standards exist, otherwise notified-body assessment (Annex I Section A products) or internal control (most Annex III use cases) per Article 43.
- **not_high_risk_documentation_flag**: conditional — where a purpose change is assessed and the result is NOT high-risk (trigger (c) not met), the acting provider should retain Article 6(3) not-high-risk self-assessment documentation and register it, so 'no reclassification' is not treated as 'nothing to document'.

### UI Pattern

- **summary_cards**:
  - Reclassification triggered? (Yes/No/Needs review)
  - New role: Provider (if any trigger fired)
  - Trigger(s): rebrand / substantial modification / purpose change
- **results_table**: Columns: System | Original role | Trigger(s) fired | New role | Registration required | Status | Confidence | Key uncertainty
- **filters**:
  original_role, trigger_type, confidence_label, guidance_status, registration_required
- **csv_export**: Export per-system reclassification determination with the three trigger flags, resulting role, legal_basis_citation, and registration_required for module-12/module-15 aggregation.
- **detail_page**: Shows each trigger question and answer, the fired VCR rules with Article 25 citations, the promoted role_conditional_obligation set, the original-provider cooperation duty, and a needs-review banner where the determination rests on draft high-risk guidelines.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and does not guarantee compliance with the EU AI Act. Confirm obligations with qualified counsel.
- **cross_module_consistency_warning**: If module-2 role is uncertain or module-7 high-risk status is 'needs review', warn that the reclassification determination inherits that uncertainty — triggers (a)/(b) require confirmed high-risk status and trigger (c) requires a confirmed high-risk outcome after the purpose change. Also flag when the determination depends on the not-yet-final Commission high-risk classification guidelines (guidance_status: draft).

### Other Info

- **new**: True

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- guidance_status (VCR-5 boundary determinations depend on the not-yet-final Commission high-risk classification guidelines)
- not_high_risk_documentation_flag (conditional on the purpose-change assessment outcome)
- reclassification_trigger_flags (default booleans, set at runtime by the fired VCR rules)
- standards_conformity_route (depends on module-7 Annex I vs Annex III outcome and availability of harmonised standards)


---

## 7. GPAI Obligations
**Module ID**: module-10  
**Flowchart section**: #R1  
**Legal basis**: Article 51, Article 53, Article 55, Article 25, Annex XI, Annex XII, Annex XIII, Recital 97, Recital 110  
**Depends on**: module-1  

General-purpose AI model (GPAI) obligations and systemic-risk designation. Covers three angles: (1) the organisation is itself a provider of a GPAI model (Article 53, and Article 55 if systemic-risk); (2) the reciprocal downstream question set — the organisation builds on a third-party GPAI model and relies on Article 25/53 information-flow obligations; (3) a GPAI model is integrated into a high-risk AI system. Systemic-risk is NOT purely the 10^25 FLOP presumption — the Commission can also designate on capability/user-base/scalability/autonomy criteria (Article 51(1)(b), Annex XIII), so it is surfaced as an uncertainty rather than a hard rule.

### Questionnaire

- **description**: Plain-English, factual-only questions. Reuse Module 1 inventory data first (usesGpaiOrLlm, underlyingModelOrTool, modelProvider, buildType, fineTunedOrRetrainedModel); ask only what is missing.
- **questions**:
  - **id**: gpai_q1 | **question_text**: Does your organisation develop, train, or place on the market a general-purpose AI model (a broadly capable model such as a large language model, foundation model, or multimodal model)? | **helper_text**: A general-purpose AI model displays significant generality and can competently perform a wide range of distinct tasks, and can be integrated into many downstream systems. This is the model itself, not a narrow single-purpose tool. | **reused_from**: Module 1: usesGpaiOrLlm, underlyingModelOrTool, buildType (built internally)
    Yes, No, Not sure, Not applicable
  - **id**: gpai_q2 | **question_text**: Was this general-purpose AI model trained using a very large amount of computing power? | **helper_text**: A model is presumed to carry systemic risk when the cumulative training compute is greater than 10^25 floating-point operations (FLOP). If you do not know the training compute, answer 'Not sure' — the model provider or vendor documentation may state it.
    Yes, above 10^25 FLOP, No, below 10^25 FLOP, Not sure, Not applicable
  - **id**: gpai_q3 | **question_text**: Has the European Commission (or the AI Office) designated your model as a general-purpose AI model with systemic risk, or notified you that it may be? | **helper_text**: Beyond the compute threshold, the Commission can designate a model on other grounds — evaluated capabilities, number of registered/business users, market reach, scalability, or access to tools/autonomy (Article 51(1)(b), Annex XIII). This is not a fixed number, so it is treated as an open question.
    Yes, No, Not sure, Not applicable
  - **id**: gpai_q4 | **question_text**: Is your general-purpose AI model released under a free and open-source licence, with its parameters, architecture, and usage information made publicly available? | **helper_text**: Open-source GPAI models get a partial exemption from some Article 53 documentation duties, BUT this exemption does NOT apply if the model has systemic risk. The copyright policy and the training-content summary duties still apply.
    Yes, No, Not sure, Not applicable
  - **id**: gpai_q5 | **question_text**: Does this AI system build on, call, or fine-tune a general-purpose AI model provided by another company (for example an external LLM API or a downloaded foundation model)? | **helper_text**: This is the downstream / reciprocal case. If yes, you are a downstream provider or deployer and rely on the upstream model provider giving you the information listed in Annex XII so you can meet your own obligations. | **reused_from**: Module 1: usesGpaiOrLlm = yes, modelProvider (external), buildType
    Yes, No, Not sure, Not applicable
  - **id**: gpai_q6 | **question_text**: Have you fine-tuned, retrained, or substantially modified a third-party general-purpose AI model? | **helper_text**: Substantial modification or fine-tuning of a GPAI model can make YOU a provider of the modified model, triggering Article 53 obligations for the change you made (and Article 55 if your training compute crosses the systemic-risk threshold). Links to Module 9 reclassification. | **reused_from**: Module 1: fineTunedOrRetrainedModel; Module 2: Article 25 provider-conversion risk
    Yes, No, Not sure, Not applicable
  - **id**: gpai_q7 | **question_text**: Is a general-purpose AI model integrated into a system that could be high-risk (for example used in recruitment, credit, biometrics, or critical infrastructure)? | **helper_text**: When a GPAI model is integrated into a high-risk AI system, the downstream provider needs sufficient information and cooperation from the model provider to comply with the high-risk obligations. Full high-risk classification is handled in a later module; here we only flag the dependency. | **reused_from**: Module 1: riskDomainFlags, affectsDecisionsAboutPeople
    Yes, No, Not sure, Not applicable
  - **id**: gpai_q8 | **question_text**: If you provide a general-purpose AI model, have you put in place a policy to comply with EU copyright law and prepared a sufficiently detailed public summary of the content used to train the model? | **helper_text**: These two duties (Article 53(1)(c) copyright policy and Article 53(1)(d) training-content summary using the AI Office template) apply to ALL GPAI providers, including open-source ones.
    Yes, No, Partly, Not sure, Not applicable

### Deterministic Rules

- **description**: Rules file src/lib/gpai/rules.ts — deterministic, no LLM reasoning, rule-traceable. Each rule carries its legal basis, per-obligation enforcement date, guidance status, and the date the source text was last checked.
- **rules**:
  - **id**: GPAI-R1 | **name**: Provider of a GPAI model | **condition**: gpai_q1 = Yes (organisation develops/places a GPAI model on the market) | **outcome**: Flag Article 53 GPAI-provider obligations: technical documentation (Annex XI), information for downstream providers (Annex XII), EU copyright policy, and public training-content summary. | **legal_basis_citation**: Article 53; Annex XI; Annex XII; Recital 97 | **source_version_date**: 2026-07-07
  - **id**: GPAI-R2 | **name**: Systemic-risk presumption (compute) | **condition**: gpai_q2 = Yes (training compute > 10^25 FLOP) | **outcome**: Presumed GPAI model with systemic risk. Add Article 55 obligations on top of Article 53. Provider must notify the Commission within 2 weeks of meeting/expecting to meet the threshold (Article 52). | **legal_basis_citation**: Article 51(1)(a), 51(2); Article 52; Article 55 | **source_version_date**: 2026-07-07
  - **id**: GPAI-R3 | **name**: Systemic-risk designation (qualitative) | **condition**: gpai_q3 = Yes OR (model is among the most advanced / very high reach) — Commission designation on capability, user-base, scalability, or autonomy grounds | **outcome**: Possible GPAI model with systemic risk even below the FLOP threshold. Surface as UNCERTAINTY, not a hard rule — designation is a Commission decision using Annex XIII criteria, not a fixed number. Recommend monitoring and legal review. | **legal_basis_citation**: Article 51(1)(b); Annex XIII; Recital 110 | **source_version_date**: 2026-07-07
  - **id**: GPAI-R4 | **name**: Article 55 systemic-risk obligations | **condition**: GPAI-R2 OR GPAI-R3 triggers | **outcome**: Flag: state-of-the-art model evaluation and adversarial testing (red-teaming), systemic-risk assessment and mitigation, serious-incident tracking and reporting to the AI Office, and adequate cybersecurity protection for the model and physical infrastructure. | **legal_basis_citation**: Article 55(1)(a)-(d) | **source_version_date**: 2026-07-07
  - **id**: GPAI-R5 | **name**: Open-source partial exemption | **condition**: gpai_q4 = Yes AND NOT (GPAI-R2 OR GPAI-R3) | **outcome**: Exempt from Annex XI technical documentation and Annex XII downstream-information duties, but the copyright policy and training-content summary still apply. Exemption is VOID if the model has systemic risk. | **legal_basis_citation**: Article 53(2); Article 53(1)(c)-(d); Recital 104 | **source_version_date**: 2026-07-07
  - **id**: GPAI-R6 | **name**: Downstream provider — information-flow reliance | **condition**: gpai_q5 = Yes (builds on a third-party GPAI model) | **outcome**: Organisation is a downstream provider/deployer. Flag right to receive Annex XII information and cooperation from the upstream GPAI model provider; capture whether that information was actually received. Feeds the Obligations Matrix as a supply-chain evidence item. | **legal_basis_citation**: Article 53(1)(b); Annex XII; Article 25(4) | **source_version_date**: 2026-07-07
  - **id**: GPAI-R7 | **name**: Fine-tuning / substantial modification converts to provider | **condition**: gpai_q6 = Yes (fine-tuned/retrained/substantially modified a third-party GPAI model) | **outcome**: Organisation may become provider of the modified GPAI model for the modification, inheriting Article 53 duties (scoped to the change) and Article 55 if the modification training compute crosses the threshold. Set reclassification_trigger flag for Module 9. | **legal_basis_citation**: Article 25(1); Recital 109; Article 53 | **source_version_date**: 2026-07-07
  - **id**: GPAI-R8 | **name**: GPAI integrated into a high-risk system | **condition**: gpai_q7 = Yes (GPAI model integrated into a potentially high-risk system) | **outcome**: Flag cross-dependency: the high-risk downstream provider needs sufficient information/cooperation from the GPAI model provider to meet high-risk obligations. Defer full high-risk classification to the later high-risk module; raise a cross-module consistency note. | **legal_basis_citation**: Article 25(4); Article 53(1)(b); Annex XII | **source_version_date**: 2026-07-07
  - **id**: GPAI-R9 | **name**: Copyright policy and training-content summary | **condition**: gpai_q1 = Yes (any GPAI provider, including open-source) | **outcome**: Flag mandatory EU copyright-compliance policy and public sufficiently-detailed training-content summary (AI Office template). Applies regardless of open-source status. | **legal_basis_citation**: Article 53(1)(c); Article 53(1)(d) | **source_version_date**: 2026-07-07

### Result Object

- **description**: Per-system, per-module GPAI assessment output.
- **confidence_score**: 0-100 deterministic score. Start at 100; subtract 15 per core 'Not sure' (is-a-GPAI-model, training-compute, model-provider); subtract 25 if systemic-risk status unknown but model is large; subtract 20 if downstream information receipt unknown; subtract 10 for each missing essential field (cap -40); subtract 15 for contradictory answers. Clamp 0-100.
- **confidence_label**: high (80-100) / medium (50-79) / low (20-49) / insufficient_information (0-19)
- **reasoning_summary**: Deterministic generated text, e.g. 'This system is likely subject to Article 53 GPAI-provider obligations because the organisation develops a general-purpose model placed on the EU market. Systemic-risk status is uncertain because training compute is not stated and no Commission designation is recorded.'
- **positive_indicators**:
  - Organisation develops or places a GPAI model on the market
  - Training compute reported above 10^25 FLOP
  - Commission/AI Office systemic-risk designation recorded
  - System builds on or fine-tunes a third-party GPAI model
  - GPAI model integrated into a potentially high-risk context
- **negative_indicators**:
  - No general-purpose model developed or provided
  - Narrow single-purpose system with no GPAI/LLM component
  - Training compute clearly below threshold and no qualitative systemic-risk signals
  - Model used only as an unmodified downstream consumer with obligations resting upstream
- **key_uncertainties**:
  - Systemic-risk designation beyond the 10^25 FLOP presumption depends on a Commission decision using Annex XIII capability/user-base/scalability/autonomy criteria — not a fixed rule.
  - Whether fine-tuning/modification crosses the threshold to make the organisation a provider of the modified model.
  - Whether Annex XII information was actually received from the upstream GPAI provider.
  - Training compute (FLOP) often not disclosed by vendors.
- **missing_fields**:
  - training_compute_flop
  - gpai_provider_name
  - systemic_risk_designation_status
  - annex_xii_information_received
  - fine_tuning_compute
- **recommended_next_questions**:
  - Confirm the training compute (FLOP) of the model, from provider or vendor documentation.
  - Confirm whether the upstream GPAI provider has supplied the Annex XII integration information.
  - Confirm whether any fine-tuning materially changed the model's capabilities or intended purpose.
  - Check whether the model appears on any published Commission list of systemic-risk GPAI models.
- **role_conditional_obligation**:
  - **description**: Same model yields different duties by entity role, keyed to Module 2 output.
  - **GPAI_model_provider**: Article 53 (technical docs Annex XI, downstream info Annex XII, copyright policy, training-content summary); Article 55 if systemic-risk; Article 54 EU authorised representative if provider is established outside the EU.
  - **downstream_provider_deployer**: Rely on Annex XII information from upstream; own obligations depend on the system role and later high-risk/transparency modules; no Article 53 model-provider duties unless converted by modification.
  - **modifier_fine_tuner**: May inherit Article 53 (scoped to the modification) via Article 25; re-evaluate on Module 9 reclassification trigger.
- **registration_required**: Not the primary GPAI trigger. GPAI providers do not register in the Annex VIII high-risk database, but systemic-risk providers must NOTIFY the Commission (Article 52) within 2 weeks; if the GPAI is embedded in a high-risk system, Article 49/Annex VIII registration applies at the system level.
- **not_high_risk_documentation_flag**: Even where GPAI obligations do not apply, a downstream provider building on a GPAI model should document why the resulting system is not high-risk (Article 6(3) self-assessment) rather than treating 'GPAI-only' as 'nothing to do'.

### UI Pattern

- **summary_cards**:
  - Total systems with a GPAI/LLM component
  - Likely GPAI providers (Article 53)
  - Possible systemic-risk GPAI (Article 55) — needs review
  - Downstream systems building on third-party GPAI
  - GPAI integrated into potentially high-risk systems
  - Insufficient information
- **results_table**:
  - **columns**:
    - System name
    - GPAI role
    - Model provider
    - GPAI status
    - Systemic-risk flag
    - Confidence
    - Key uncertainty
    - Annex XII info received
    - Last assessed
    - Actions
  - **note**: Includes status / confidence / key-uncertainty columns at minimum.
- **filters**:
  - GPAI role
  - Systemic-risk flag
  - Confidence label
  - Model provider
  - Downstream vs. provider
  - Missing data
- **csv_export**: Export the GPAI assessment table to CSV.
- **detail_page**: /gpai/systems/[id] — system overview, evidence used from Module 1, deterministic result panel, positive/negative indicators, key uncertainties, missing fields, recommended next questions, applicable dates per obligation, link back to inventory.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made.
- **cross_module_consistency_warning**: If Module 3 flagged the item as 'not an AI system' or 'insufficient information', or if the GPAI is integrated into a system whose high-risk status is still unresolved, warn that GPAI/high-risk obligations should be reviewed before relying on this output.

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date
- classification_or_status
- guidance_status
- reclassification_trigger_flags
- standards_conformity_route


---

## 8. Transparency Obligations
**Module ID**: module-11  
**Flowchart section**: #R4, #R5  
**Legal basis**: Article 50, Article 27, Annex III, Recital 132, Recital 133, Recital 134, Recital 135, Recital 96  
**Depends on**: module-2, module-7  

Article 50 transparency duties: direct-interaction disclosure (chatbots), synthetic-content marking (machine-readable watermarking), emotion-recognition and biometric-categorisation disclosure, and deepfake / AI-generated-public-interest-text labelling. The Fundamental Rights Impact Assessment (FRIA, Article 27) is surfaced as a DISTINCT sub-section — not bundled into general transparency — because it has its own trigger set: public bodies, private providers of public services, and deployers running Annex III creditworthiness/credit-scoring or life/health-insurance risk assessment.

### Questionnaire

- **description**: Plain-English, factual-only questions. Reuse Module 1 (interactsDirectlyWithPeople, generatesContent, outputTypes, systemTypes) and Module 2 (provider vs. deployer role) first; ask only what is missing.
- **questions**:
  - **id**: tr_q1 | **question_text**: Does this AI system talk to or interact directly with people (for example a chatbot, virtual assistant, or voice bot)? | **helper_text**: If people interact with it directly, they generally must be told they are dealing with an AI — unless that is already obvious from the context to a reasonably well-informed person. | **reused_from**: Module 1: interactsDirectlyWithPeople; Module 1: systemTypes includes Chatbot
    Yes, No, Not sure, Not applicable
  - **id**: tr_q2 | **question_text**: Does the system generate or manipulate synthetic content — text, images, audio, or video? | **helper_text**: If it produces synthetic content, the output generally must be marked in a machine-readable format as artificially generated or manipulated (for example watermarking or metadata). | **reused_from**: Module 1: generatesContent; Module 1: outputTypes includes generated content
    Yes, No, Not sure, Not applicable
  - **id**: tr_q3 | **question_text**: Does the system produce image, audio, or video content that resembles real people, objects, places, or events and could falsely appear authentic (a deepfake)? | **helper_text**: Deployers of deepfake-generating systems must disclose that the content has been artificially generated or manipulated. Limited artistic/creative exceptions apply but still require disclosure in an appropriate way. | **reused_from**: Module 1: generatesContent, outputTypes (image/audio/video)
    Yes, No, Not sure, Not applicable
  - **id**: tr_q4 | **question_text**: Is AI-generated or AI-assisted text published to inform the public about matters of public interest (for example news, current affairs, or public information)? | **helper_text**: Such text must be disclosed as artificially generated — UNLESS it has undergone human review or editorial control and a person/organisation holds editorial responsibility for it. | **reused_from**: Module 1: generatesContent (text); use case / deployment context
    Yes, No, Not sure, Not applicable
  - **id**: tr_q5 | **question_text**: Does the system recognise or infer people's emotions, or categorise people based on biometric data (for example facial or voice analysis)? | **helper_text**: Deployers of emotion-recognition or biometric-categorisation systems must inform the people exposed to them. Note some emotion-recognition uses (workplace, education) are prohibited under Article 5 and are handled in the prohibited-practices module. | **reused_from**: Module 1: systemTypes includes Biometric system; profilesIndividuals
    Yes, No, Not sure, Not applicable
  - **id**: tr_q6 | **question_text**: For each transparency trigger above, is your organisation the provider (you build/place the system on the market) or the deployer (you use it under your own authority)? | **helper_text**: Direct-interaction (50(1)) and synthetic-content marking (50(2)) are PROVIDER duties. Deepfake disclosure, public-interest text disclosure, and emotion/biometric disclosure (50(3)-(4)) are DEPLOYER duties. The same system can carry both. | **reused_from**: Module 2: entity role classification
    Provider, Deployer, Both, Not sure, Not applicable
  - **id**: tr_q7 | **question_text**: Is your organisation a public body, or a private organisation providing public services (for example healthcare, education, housing, social security, or essential utilities)? | **helper_text**: This is a FRIA trigger. Public authorities and private providers of public services that deploy an Annex III high-risk system generally must complete a Fundamental Rights Impact Assessment before first use. | **reused_from**: Module 2 / Module 1: organisation type, deployment context
    Public body, Private provider of public services, Neither, Not sure, Not applicable
  - **id**: tr_q8 | **question_text**: Does your organisation use an AI system to evaluate creditworthiness / credit scoring, or to assess risk and pricing for life or health insurance? | **helper_text**: These two specific high-risk use cases (Annex III points 5(b) and 5(c)) trigger a FRIA even for ordinary private deployers, regardless of whether you provide public services. | **reused_from**: Module 1: riskDomainFlags, business function
    - Yes - creditworthiness/credit scoring
    - Yes - life/health insurance risk
    - No
    - Not sure
    - Not applicable

### Deterministic Rules

- **description**: Rules file src/lib/transparency/rules.ts — deterministic, rule-traceable. FRIA rules (FRIA-R*) are kept structurally separate from Article 50 rules (TR-R*) so the FRIA sub-section can be surfaced independently.
- **rules**:
  - **id**: TR-R1 | **name**: Direct-interaction disclosure | **condition**: tr_q1 = Yes AND role = Provider AND interaction not obvious to user | **outcome**: Provider must design and inform users that they are interacting with an AI system, unless obvious from context. Flag disclosure-at-point-of-interaction obligation. | **legal_basis_citation**: Article 50(1); Recital 132 | **source_version_date**: 2026-07-07
  - **id**: TR-R2 | **name**: Synthetic-content marking | **condition**: tr_q2 = Yes AND role = Provider | **outcome**: Provider must mark outputs (text/image/audio/video) as artificially generated or manipulated in a machine-readable, robust, interoperable format. Legacy systems on the market before 2026-08-02 get a grace period to 2026-12-02. | **legal_basis_citation**: Article 50(2); Recital 133 | **legacy_grace_until**: 2026-12-02 | **source_version_date**: 2026-07-07
  - **id**: TR-R3 | **name**: Emotion-recognition / biometric-categorisation disclosure | **condition**: tr_q5 = Yes AND role = Deployer AND not prohibited under Article 5 | **outcome**: Deployer must inform exposed natural persons of the system's operation and process personal data per GDPR. Cross-check the prohibited-practices module for banned workplace/education emotion recognition. | **legal_basis_citation**: Article 50(3); Recital 132 | **source_version_date**: 2026-07-07
  - **id**: TR-R4 | **name**: Deepfake disclosure | **condition**: tr_q3 = Yes AND role = Deployer | **outcome**: Deployer must disclose that image/audio/video content has been artificially generated or manipulated. Reduced/adapted disclosure for evidently artistic, creative, satirical or fictional work, but disclosure still required in an appropriate manner. | **legal_basis_citation**: Article 50(4) first subparagraph; Recital 134 | **source_version_date**: 2026-07-07
  - **id**: TR-R5 | **name**: AI-generated public-interest text disclosure | **condition**: tr_q4 = Yes AND role = Deployer AND NOT (human editorial review + editorial responsibility) | **outcome**: Deployer must disclose that text published to inform the public on matters of public interest is artificially generated. Exempt where the text underwent human review and a person/organisation holds editorial responsibility. | **legal_basis_citation**: Article 50(4) second subparagraph; Recital 135 | **source_version_date**: 2026-07-07
  - **id**: TR-R6 | **name**: Transparency exemption — law enforcement | **condition**: System authorised by law to detect/prevent/investigate criminal offences | **outcome**: Certain Article 50 disclosure duties are relaxed for legally authorised law-enforcement use, subject to safeguards. Flag for legal review rather than auto-clearing. | **legal_basis_citation**: Article 50(1),(2),(4) exemptions | **source_version_date**: 2026-07-07
  - **id**: FRIA-R1 | **name**: FRIA — public body / public-service deployer | **condition**: tr_q7 = Public body OR Private provider of public services, AND system is an Annex III high-risk system deployed by the organisation | **outcome**: Fundamental Rights Impact Assessment required before first use: describe deployer processes, period/frequency of use, categories of natural persons affected, specific risks of harm, human-oversight measures, and mitigation/governance. Notify the market surveillance authority. | **legal_basis_citation**: Article 27(1); Article 27(2)-(3); Recital 96 | **source_version_date**: 2026-07-07
  - **id**: FRIA-R2 | **name**: FRIA — creditworthiness / insurance deployer | **condition**: tr_q8 = Yes (Annex III 5(b) creditworthiness/credit scoring OR 5(c) life/health insurance risk assessment & pricing) | **outcome**: FRIA required even for ordinary private deployers of these two Annex III use cases. Same FRIA content set as FRIA-R1. | **legal_basis_citation**: Article 27(1); Annex III point 5(b), 5(c) | **source_version_date**: 2026-07-07

### Result Object

- **description**: Per-system, per-module transparency + FRIA assessment output.
- **confidence_score**: 0-100 deterministic score. Start at 100; subtract 15 per core 'Not sure' (interacts-with-people, generates-content, biometric, role); subtract 20 if provider/deployer role unknown (drives which duty applies); subtract 20 if organisation type unknown for FRIA; subtract 10 per missing essential field (cap -40); subtract 15 for contradictory answers. Clamp 0-100.
- **confidence_label**: high (80-100) / medium (50-79) / low (20-49) / insufficient_information (0-19)
- **reasoning_summary**: Deterministic generated text, e.g. 'This system likely carries Article 50(1) direct-interaction and 50(2) synthetic-content duties because it is a content-generating chatbot placed on the market by your organisation. A FRIA is possibly required because you are a public-service provider, pending confirmation of high-risk status.'
- **positive_indicators**:
  - System interacts directly with people (chatbot/assistant)
  - System generates or manipulates synthetic text/image/audio/video
  - Output could be a deepfake resembling real people/events
  - AI-generated text published on matters of public interest
  - Emotion-recognition or biometric-categorisation capability
  - Deployer is a public body / provider of public services
  - Use case is creditworthiness or life/health insurance risk
- **negative_indicators**:
  - No direct human interaction and no content generation
  - Synthetic-content marking handled upstream by the provider (organisation is only a downstream user)
  - Interaction with AI is obvious from context
  - AI-generated public-interest text under human editorial responsibility
  - Not a public body, no public-service provision, and no credit/insurance use
- **key_uncertainties**:
  - Whether 'obvious from context' applies, removing the 50(1) disclosure duty.
  - Whether the artistic/creative/editorial exceptions to deepfake and public-interest-text disclosure apply.
  - Whether the system meets the Annex III high-risk threshold that FRIA depends on — resolved in the high-risk module.
  - FRIA enforcement date follows the deferred Annex III high-risk timeline, which the Digital Omnibus is still finalising.
- **missing_fields**:
  - provider_or_deployer_role
  - organisation_type_public_or_public_service
  - content_generation_modalities
  - annex_iii_high_risk_status
  - human_editorial_control_flag
- **recommended_next_questions**:
  - Confirm whether your organisation is the provider or the deployer for each transparency trigger.
  - Confirm whether AI-generated public-interest text is under human editorial responsibility.
  - Confirm whether the deepfake output is for evidently artistic/creative purposes.
  - Confirm whether the system is used for creditworthiness or life/health insurance risk assessment.
- **role_conditional_obligation**:
  - **description**: Article 50 splits duties by role; FRIA is a deployer-only duty. Keyed to Module 2 output.
  - **provider**: Article 50(1) direct-interaction disclosure design; Article 50(2) machine-readable synthetic-content marking. No FRIA.
  - **deployer**: Article 50(3) emotion/biometric disclosure; Article 50(4) deepfake and public-interest-text disclosure; Article 27 FRIA if a public body/public-service provider or credit/insurance use.
  - **both**: Provider and deployer duties accumulate on the same system.
- **registration_required**: Article 50 transparency alone does not trigger Annex VIII registration. FRIA-triggering systems are Annex III high-risk and therefore also carry Article 49/Annex VIII registration (with the non-public variant for law-enforcement/migration/border deployers); the completed FRIA is notified to the market surveillance authority.
- **not_high_risk_documentation_flag**: A transparency-only system that is not high-risk still owes the Article 50 disclosures; document that Article 50 was assessed and, where FRIA was considered and found not to apply, record why (organisation type / use case did not match the trigger set) rather than treating 'not high-risk' as 'nothing to do'.

### UI Pattern

- **summary_cards**:
  - Total AI systems in scope
  - Likely Article 50 transparency duties
  - Deepfake / synthetic-content systems
  - Emotion-recognition / biometric-categorisation systems
  - Likely FRIA required (Article 27)
  - Possible / needs review
  - Insufficient information
- **results_table**:
  - **columns**:
    - System name
    - Role
    - Article 50 triggers
    - FRIA trigger
    - Transparency status
    - Confidence
    - Key uncertainty
    - Applicable from
    - Last assessed
    - Actions
  - **note**: Includes status / confidence / key-uncertainty columns at minimum; FRIA shown as its own column, not merged into the Article 50 trigger column.
- **filters**:
  - Role (provider/deployer)
  - Article 50 trigger type
  - FRIA trigger
  - Confidence label
  - Organisation type
  - Missing data
- **csv_export**: Export the transparency + FRIA assessment table to CSV.
- **detail_page**: /transparency/systems/[id] — system overview, evidence used from Modules 1/2, a dedicated Article 50 result panel AND a separate FRIA result panel, positive/negative indicators, key uncertainties, missing fields, recommended next questions, applicable dates per obligation, link back to inventory.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made.
- **cross_module_consistency_warning**: FRIA depends on Annex III high-risk status. If the high-risk module has not yet confirmed it, or if Module 2's role classification is uncertain, warn that the FRIA and role-specific transparency outputs should be reviewed before relying on them.

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date
- classification_or_status
- guidance_status
- reclassification_trigger_flags
- standards_conformity_route


---

## 9. Obligations Matrix
**Module ID**: module-12  
**Flowchart section**: Understanding your obligations  
**Legal basis**: Article 9-15, Article 17, Article 22-24, Article 26, Article 43, Article 47-49, Article 72-73, Recital 47, Recital 166  
**Depends on**: module-2, module-4, module-6, module-7, module-8, module-9, module-10, module-11  

Aggregates entity role (M2), AI-system-definition gate (M3), EU scope (M4), prohibited (M6), high-risk (M7), AI literacy (M8), value-chain reclassification (M9), GPAI (M10) and transparency (M11) status into a consolidated per-system obligations checklist. Every applicable article is decomposed into a concrete obligation row (risk-management, data governance, technical documentation, logging, transparency-to-deployers, human oversight, accuracy/robustness/cybersecurity, QMS, EU database registration incl. the Art 6(3) not-high-risk documentation duty, conformity assessment + CE marking, post-market monitoring and serious-incident reporting) rather than left as an article-level reference. No LLM reasoning: obligation rows are switched on/off by deterministic upstream flags.

### Questionnaire

- **description**: Reuse M2-M11 outputs first; ask only what upstream modules could not settle. Options are Yes / No / Not sure / Not applicable unless noted.
- **fields**:
  - **question_text**: Should this system's obligations be assessed for a specific entity role, or for every role your organisation holds? | **helper_text**: The same system produces different duties depending on whether you are the provider, deployer, importer, distributor or authorised representative. Module 2 already inferred your role(s); this only confirms which role the matrix should be generated for. | **reused_from**: module-2 (likelyRoles / possibleRoles)
    Provider, Deployer, Importer, Distributor, Authorised representative, All roles held, Not sure
  - **question_text**: Has the system, its intended purpose, or its branding changed since it was first placed on the market or put into service? | **helper_text**: Substantial modification, re-branding, or a purpose change that makes it high-risk can convert a deployer/distributor into a provider (Article 25) and swap the obligation set. Module 9 already screens for this. | **reused_from**: module-9 (reclassification determination); module-2 (Article25ProviderConversionRisk flag)
    Yes, No, Not sure, Not applicable
  - **question_text**: For a system your upstream assessment did not classify as high-risk, has the provider documented the 'no significant risk' self-assessment? | **helper_text**: Article 6(3) lets a provider treat an Annex III system as not-high-risk, but only if it documents that assessment and (per Article 49) registers it. 'Not high-risk' is not the same as 'nothing to do'. | **reused_from**: module-7 (Article 6(3) derogation determination)
    Yes, documented, No, Not sure, Not applicable (system is high-risk)
  - **question_text**: Is your organisation established outside the EU while placing this system on the EU market or putting it into service in the EU? | **helper_text**: A non-EU provider of a high-risk system or GPAI model must appoint an EU authorised representative before market placement (Article 22 / Article 54 for GPAI). | **reused_from**: module-4 (scope / establishment); module-2 (non-EU supply chain section)
    Yes, No, Not sure, Not applicable
  - **question_text**: For a high-risk system, do published harmonised standards cover its intended purpose, or will a notified body be involved in conformity assessment? | **helper_text**: If harmonised standards exist and are applied, the provider can self-assess under the presumption-of-conformity route (Annex VI). Biometric and some other Annex III cases, or the absence of standards, may require a notified body (Annex VII). | **reused_from**: module-7 (Annex I vs Annex III high-risk category)
    - Harmonised standards apply
    - Notified body required
    - No standards published yet
    - Not sure
    - Not applicable

### Deterministic Rules

- **description**: One rule per obligation row (src/lib/obligations/obligationRules.ts). A row is emitted only when its trigger evaluates true against upstream module flags; no LLM reasoning. Each row carries its own legal_basis_citation, applicable_from_date, guidance_status and source_version_date so Module 15's report can cite the source and flag draft-derived timing.
- **aggregation_logic**: row.emitted = trigger(upstreamFlags) === true. Role determines which duty-holder column is populated (provider/deployer/importer/distributor/auth-rep). A Module 9 reclassification flag re-runs the provider trigger set against a deployer/distributor. Prohibited (M6) short-circuits the matrix to a single 'must not place on market' row. Out-of-scope (M4) or 'likely not an AI system' (M3) suppresses obligation rows and raises a cross-module consistency warning instead.
- **legal_basis_citation**: Per-row Article/Annex/Recital reference; see obligation_rows[].legal_basis_citation.
- **applicable_from_date**: Per-row enforcement date; see obligation_rows[].applicable_from_date. Timeline is split (Digital Omnibus, provisional).
- **guidance_status**: Per-row; final for enacted articles, provisional where the enforcement date rests on the not-yet-adopted Digital Omnibus, draft where the trigger depends on the 2026-05-19 high-risk classification guidelines.
- **source_version_date**: 2026-07-07
- **obligation_rows**:
  - **obligation_id**: OBL-ART9-RMS | **obligation_name**: Risk-management system | **obligation_type**: lifecycle_recurring | **applies_when**: module-7 classification = high-risk (Annex I or Annex III) AND not suppressed by prohibited/out-of-scope | **legal_basis_citation**: Article 9; Recital 47 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Obligation text is final law; only the enforcement date is provisional pending the Digital Omnibus deferral. Continuous, iterative process across the lifecycle.
    Provider
  - **obligation_id**: OBL-ART10-DATA | **obligation_name**: Data and data governance | **obligation_type**: lifecycle_recurring | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 10 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Training/validation/testing data quality, relevance, bias examination and provenance.
    Provider
  - **obligation_id**: OBL-ART11-TECHDOC | **obligation_name**: Technical documentation (Annex IV) | **obligation_type**: one_off_then_maintained | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 11; Annex IV | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Must exist before market placement and be kept up to date.
    Provider
  - **obligation_id**: OBL-ART12-LOGGING | **obligation_name**: Record-keeping / automatic logging | **obligation_type**: lifecycle_recurring | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 12 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Technical capability for automatic event logging over the system's lifetime.
    Provider
  - **obligation_id**: OBL-ART13-TRANSP-DEPLOYER | **obligation_name**: Transparency and instructions for use to deployers | **obligation_type**: one_off_then_maintained | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 13 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Distinct from Article 50 end-user transparency (Module 11); this is provider-to-deployer instructions for use.
    Provider
  - **obligation_id**: OBL-ART14-OVERSIGHT | **obligation_name**: Human oversight (design measures) | **obligation_type**: lifecycle_recurring | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 14 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Provider designs oversight; deployer implements it operationally under Article 26.
    Provider
  - **obligation_id**: OBL-ART15-ACCURACY | **obligation_name**: Accuracy, robustness and cybersecurity | **obligation_type**: lifecycle_recurring | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 15 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Declared accuracy metrics stated in instructions for use; resilience to errors and adversarial manipulation.
    Provider
  - **obligation_id**: OBL-ART17-QMS | **obligation_name**: Quality management system | **obligation_type**: lifecycle_recurring | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 17 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Organisation-wide documented QMS covering the other Article 9-15 duties.
    Provider
  - **obligation_id**: OBL-ART26-DEPLOYER | **obligation_name**: Deployer obligations for high-risk systems | **obligation_type**: lifecycle_recurring | **applies_when**: module-2 role = Deployer AND module-7 classification = high-risk | **legal_basis_citation**: Article 26 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Use per instructions, assign competent human oversight, monitor operation, keep logs, inform affected workers; FRIA where Article 27 applies (Module 11).
    Deployer
  - **obligation_id**: OBL-ART22-AUTHREP | **obligation_name**: Appointment of EU authorised representative (non-EU provider) | **obligation_type**: one_off | **applies_when**: module-4 provider established outside EU AND (module-7 = high-risk OR module-10 = GPAI model placed on EU market) | **legal_basis_citation**: Article 22 (high-risk); Article 54 (GPAI); Article 23 importer / Article 24 distributor duties are the reciprocal supply-chain checks | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Written mandate must be in place before market placement. Importer (Art 23) and distributor (Art 24) verification duties are surfaced as sibling rows when Module 2 assigns those roles.
    Provider, Authorised representative
  - **obligation_id**: OBL-ART43-CONFORMITY | **obligation_name**: Conformity assessment, EU declaration of conformity and CE marking | **obligation_type**: one_off_then_on_substantial_change | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 43 (conformity assessment route); Article 47 (EU declaration of conformity); Article 48 (CE marking) | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Route depends on standards_conformity_route: Annex VI internal control (presumption of conformity via harmonised standards) vs Annex VII notified-body assessment. Re-assessment triggered by substantial modification (links to Module 9).
    Provider
  - **obligation_id**: OBL-ART49-REGISTER | **obligation_name**: EU database registration | **obligation_type**: one_off_then_maintained | **applies_when**: module-7 classification = high-risk (Annex III) OR Article 6(3) not-high-risk derogation claimed | **legal_basis_citation**: Article 49; Annex VIII | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Non-public registration variant applies to law-enforcement, migration, asylum and border-control systems (Article 49(4)). Public-authority deployers register their use per Article 49(3).
    Provider, Deployer (public authority)
  - **obligation_id**: OBL-ART6-3-NOTHR-DOC | **obligation_name**: Article 6(3) not-high-risk self-assessment documentation and registration | **obligation_type**: one_off_then_maintained | **applies_when**: module-7 = Annex III use-case matched BUT provider claims the Article 6(3) 'no significant risk' derogation | **legal_basis_citation**: Article 6(3); Article 6(4); Article 49 (registration of the assessment) | **guidance_status**: draft | **source_version_date**: 2026-07-07 | **note**: Prevents treating 'not high-risk' as 'nothing to do'. Boundaries depend on the 2026-05-19 draft high-risk classification guidelines (consultation closed 2026-06-23), hence guidance_status: draft.
    Provider
  - **obligation_id**: OBL-ART72-PMM | **obligation_name**: Post-market monitoring | **obligation_type**: recurring_lifecycle | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 72; Recital 166 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Documented post-market monitoring plan; ongoing, not a one-off task.
    Provider
  - **obligation_id**: OBL-ART73-INCIDENT | **obligation_name**: Serious-incident reporting | **obligation_type**: recurring_event_driven | **applies_when**: module-7 classification = high-risk | **legal_basis_citation**: Article 73 | **guidance_status**: provisional | **source_version_date**: 2026-07-07 | **note**: Reporting to market surveillance authority within statutory deadlines after becoming aware of a serious incident; readiness (procedure + owner) is the assessable state, not a one-time deliverable.
    Provider, Deployer (reporting via provider)
  - **obligation_id**: OBL-ART50-TRANSP-AGG | **obligation_name**: Article 50 transparency (aggregated pointer to Module 11) | **obligation_type**: lifecycle_recurring | **applies_when**: module-11 flags any Article 50 trigger (direct interaction, synthetic content, deepfake, emotion recognition / biometric categorisation) | **legal_basis_citation**: Article 50; Article 27 (FRIA sub-trigger) | **applicable_from_date**: 2026-08-02 | **guidance_status**: final | **source_version_date**: 2026-07-07 | **note**: Row aggregates the Module 11 determination; timeline unchanged by the Digital Omnibus.
    Provider, Deployer
  - **obligation_id**: OBL-GPAI-AGG | **obligation_name**: GPAI provider obligations (aggregated pointer to Module 10) | **obligation_type**: lifecycle_recurring | **applies_when**: module-10 = GPAI model provider (with systemic-risk sub-flag where designated) | **legal_basis_citation**: Article 53 (all GPAI); Article 55 (systemic-risk GPAI) | **applicable_from_date**: 2025-08-02 | **guidance_status**: final | **source_version_date**: 2026-07-07 | **note**: Systemic-risk designation is not purely the 10^25 FLOP threshold; the Commission can also designate on capability/user-base/autonomy grounds. Surface as an uncertainty, not a hard rule.
    Provider (GPAI model)

### Result Object

- **description**: Per-system, per-role consolidated obligations output.
- **classification_or_status**: Status label per obligation row using 'likely applies' / 'possibly applies' / 'needs review' / 'does not appear to apply' wording, plus an overall 'obligations identified: N (likely) / M (needs review)' summary. Never 'compliant' or 'legally confirmed'.
- **confidence_score**: 0-100 deterministic. Start at 100; subtract 20 if the upstream high-risk classification is 'needs review', 15 per unresolved role ambiguity from Module 2, 15 if a Module 9 reclassification flag is unresolved, 10 per 'Not sure' answer to a matrix-specific question, 20 if scope (Module 4) is unresolved. Example: high-risk confirmed + single clear provider role + no reclassification flag = 92.
- **confidence_label**: high (80-100) / medium (50-79) / low (20-49) / insufficient_information (0-19)
- **reasoning_summary**: Deterministic text, e.g. 'As the likely provider of a system your assessment treats as high-risk under Annex III, the following provider obligations appear to apply: risk-management (Art 9), data governance (Art 10) ... Enforcement dates shown are provisional pending the Digital Omnibus. Review the reclassification flag before relying on the deployer-only column.'
- **positive_indicators**:
  - Upstream high-risk classification is confirmed with high confidence
  - Entity role resolved to a single duty-holder (e.g. provider)
  - System is in EU scope and passed the AI-system-definition gate
  - No Module 9 reclassification flag outstanding
- **negative_indicators**:
  - Prohibited-practice flag from Module 6 (matrix collapses to a single 'must not place on market' row)
  - Out-of-scope (Module 4) or 'likely not an AI system' (Module 3) — obligation rows suppressed
  - System classified not-high-risk with no Article 6(3) derogation claimed (only baseline/transparency/literacy duties remain)
- **key_uncertainties**:
  - High-risk enforcement dates rest on the unadopted Digital Omnibus (provisional agreement 2026-05-07); shown dates may move.
  - High-risk classification boundaries depend on the 2026-05-19 draft Commission guidelines (consultation closed 2026-06-23), still not final.
  - Whether a systemic-risk GPAI designation applies (Commission can designate beyond the 10^25 FLOP threshold).
  - Whether AI literacy (Art 4) remains a firm organisational obligation or is softened by the Digital Omnibus.
- **missing_fields**:
  - module-7 high-risk classification (blocks the whole provider obligation set)
  - module-2 resolved role (determines which duty-holder column is populated)
  - module-4 scope determination
  - module-9 reclassification determination
  - standards_conformity_route input (blocks the conformity-assessment row detail)
- **recommended_next_questions**:
  - Confirm the entity role the matrix should be generated for.
  - Confirm whether harmonised standards cover the system or a notified body is required.
  - Confirm whether an Article 6(3) not-high-risk self-assessment has been documented and registered.
  - Confirm whether the provider is established outside the EU (authorised-representative trigger).
- **role_conditional_obligation**:
  - **description**: Obligation set keyed to the Module 2 role output; re-evaluated when a Module 9 reclassification trigger fires.
  - **provider**:
    - Art 9
    - Art 10
    - Art 11
    - Art 12
    - Art 13
    - Art 14
    - Art 15
    - Art 17
    - Art 43
    - Art 47
    - Art 48
    - Art 49
    - Art 72
    - Art 73
  - **deployer**:
    - Art 26
    - Art 27 (FRIA where triggered)
    - Art 50 (relevant transparency)
    - Art 49(3) registration where public authority
  - **importer**:
    Art 23 (verify conformity, documentation, CE marking before placing on market)
  - **distributor**:
    Art 24 (verify CE marking and accompanying documentation)
  - **authorised_representative**:
    Art 22 (keep documentation, cooperate with authorities on behalf of non-EU provider)
- **reclassification_trigger_flags**:
  - **description**: Boolean set from Module 9 / Module 2 that can promote a deployer/distributor to provider status and swap the obligation set.
- **registration_required**:
  - **description**: Article 49 / Annex VIII flag driving an Obligations Matrix action item.
  - **high_risk_annex_iii**: True
  - **article_6_3_not_high_risk_assessment**: True
- **standards_conformity_route**:
  - **description**: For high-risk systems, whether the presumption-of-conformity route via harmonised standards applies vs notified-body assessment; feeds the conformity-assessment obligation and remediation-timeline realism.
  - **note**: Many harmonised standards under the AI Act are not yet published; absence of an applicable standard can force the notified-body route or delay self-assessment.
- **not_high_risk_documentation_flag**:
  - **description**: Article 6(3) carve-out still requires the provider to document the 'no significant risk' self-assessment and register it (Article 49). Prevents treating 'not high-risk' as 'nothing to do'.
  - **value**: set when Module 7 matched an Annex III use case but the Article 6(3) derogation is claimed

### UI Pattern

- **summary_cards**:
  - Total systems assessed
  - Systems with high-risk obligations
  - Systems with GPAI obligations
  - Systems with transparency-only obligations
  - Prohibited (blocked)
  - Out-of-scope / gate not met
  - Obligations needing review
  - Non-EU providers needing authorised representative
- **results_table**:
  - **description**: One row per system (expandable to per-obligation rows).
  - **columns**:
    - System name
    - Role(s)
    - Status
    - Obligation count (likely / needs review)
    - Registration required
    - Conformity route
    - Earliest applicable date
    - Confidence
    - Key uncertainty
    - Last assessed
    - Actions
- **filters**:
  - Role
  - Obligation status
  - Registration required
  - Conformity route
  - Guidance status (final/provisional/draft)
  - Confidence
  - Applicable-from date range
- **csv_export**: Exports the flattened per-obligation rows (system x obligation) with legal_basis_citation, applicable_from_date and guidance_status columns so downstream reporting can cite sources.
- **detail_page**: Per-system obligations checklist grouped by duty-holder role; each obligation row shows legal basis, applicable date (with provisional/draft badge), obligation type (one-off vs recurring), and a link into Module 13 evidence assessment.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made.
- **cross_module_consistency_warning**: Flag when an upstream 'needs review'/uncertain status (e.g. Module 7 high-risk classification, Module 3 AI-system gate, Module 9 reclassification) undermines the obligation set — e.g. 'The high-risk classification this matrix relies on is still marked needs review; obligations shown may change.'

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- Exact high-risk classification boundaries pending finalisation of the 2026-05-19 draft Commission guidelines
- GPAI systemic-risk designation criteria beyond the 10^25 FLOP threshold
- Whether AI literacy (Art 4) remains a firm organisational obligation under the final Digital Omnibus text
- applicable_from_date (all high-risk rows: 2027-12-02 Annex III / 2028-08-02 Annex I rest on the unadopted Digital Omnibus)
- guidance_status (high-risk rows = provisional; Article 6(3) row = draft pending 2026-05-19 guidelines)
- reclassification_trigger_flags (substantial_modification, rebranded, purpose_changed_to_high_risk — set per system by Module 9)
- registration_required.non_public_variant_law_enforcement_migration_border
- standards_conformity_route.route


---

## 10. Evidence & Readiness Assessment
**Module ID**: module-13  
**Flowchart section**: _(not in flowchart — practical add-on)_  
**Legal basis**: Article 9-15, Article 17, Article 26, Article 43, Article 47-49, Article 72-73, Annex IV (technical documentation), Annex VIII (registration)  
**Depends on**: module-12  

Turns each Obligations Matrix row (Module 12) into an evidence-gap checklist: for the obligation, what documentation/controls are required by the underlying article versus what the organisation actually has. Does not re-derive whether an obligation applies (that is Module 12); it only assesses readiness state (evidence in place / partial / gap / not started) per applicable obligation and rolls the rows up into a system-level readiness score. Reuses Module 12's obligation set, role-conditional obligations, registration and conformity flags rather than recomputing them.

### Questionnaire

- **description**: One evidence question per applicable Module 12 obligation row. Seeded from Module 12; only shown for obligations that actually apply to the system/role. Options: In place / Partial / Not started / Not sure / Not applicable.
- **fields**:
  - **question_text**: Do you have a documented risk-management process for this system, kept up to date across its lifecycle? | **helper_text**: Article 9 evidence: a risk-management plan/policy, a maintained risk register, residual-risk analysis and testing records. 'A spreadsheet once' is partial, not in place. | **reused_from**: module-12 obligation OBL-ART9-RMS
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Do you have data governance documentation for the training, validation and testing data? | **helper_text**: Article 10 evidence: data governance policy, dataset documentation, provenance records, and bias/representativeness examination. | **reused_from**: module-12 obligation OBL-ART10-DATA
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Does a technical documentation file covering the Annex IV contents exist and is it current? | **helper_text**: Article 11 / Annex IV evidence: the technical documentation file. It must exist before market placement and be maintained. | **reused_from**: module-12 obligation OBL-ART11-TECHDOC
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Does the system automatically log events, and are logs retained under a retention policy? | **helper_text**: Article 12 evidence: logging design/spec, retained logs, and a retention policy. | **reused_from**: module-12 obligation OBL-ART12-LOGGING
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Have you prepared instructions for use / transparency documentation for deployers? | **helper_text**: Article 13 evidence: deployer-facing instructions for use covering capabilities, limitations, human oversight and declared accuracy. | **reused_from**: module-12 obligation OBL-ART13-TRANSP-DEPLOYER
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Are human-oversight measures designed into the system and documented (and, if you are the deployer, operationally assigned)? | **helper_text**: Article 14 (provider design) and Article 26 (deployer implementation) evidence: oversight measures design, operator instructions, assigned oversight roles and training. | **reused_from**: module-12 obligations OBL-ART14-OVERSIGHT, OBL-ART26-DEPLOYER
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Do you have accuracy, robustness and cybersecurity evidence for the system? | **helper_text**: Article 15 evidence: declared accuracy metrics (stated in the instructions for use), robustness/adversarial test reports, and cybersecurity measures / threat model. | **reused_from**: module-12 obligation OBL-ART15-ACCURACY
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Is there a documented quality management system covering this system? | **helper_text**: Article 17 evidence: QMS documentation, procedures, responsibilities and record-keeping that tie the Article 9-15 duties together. | **reused_from**: module-12 obligation OBL-ART17-QMS
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Has conformity assessment been completed, with an EU declaration of conformity and CE marking evidence (plus a notified-body certificate where required)? | **helper_text**: Articles 43/47/48 evidence: conformity assessment records, signed EU declaration of conformity, CE marking evidence, and — on the Annex VII route — a notified-body certificate. | **reused_from**: module-12 obligation OBL-ART43-CONFORMITY; standards_conformity_route
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Is the system (or the Article 6(3) not-high-risk self-assessment) registered in the EU database? | **helper_text**: Article 49 / Annex VIII evidence: the registration entry. For a claimed not-high-risk derogation, the documented Article 6(3) self-assessment must also be registered. Note the non-public registration variant for law-enforcement/migration/border systems. | **reused_from**: module-12 obligations OBL-ART49-REGISTER, OBL-ART6-3-NOTHR-DOC; registration_required
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Do you have a post-market monitoring plan and are you collecting monitoring data? | **helper_text**: Article 72 evidence: a documented post-market monitoring plan plus evidence of ongoing data collection — this is a recurring control, not a one-off document. | **reused_from**: module-12 obligation OBL-ART72-PMM
    In place, Partial, Not started, Not sure, Not applicable
  - **question_text**: Is there a serious-incident reporting procedure with an owner and defined reporting timelines? | **helper_text**: Article 73 evidence: a documented reporting procedure, an assigned owner, and awareness of the statutory reporting deadlines. Readiness (procedure + owner) is what is assessed, since incidents are event-driven. | **reused_from**: module-12 obligation OBL-ART73-INCIDENT
    In place, Partial, Not started, Not sure, Not applicable

### Deterministic Rules

- **description**: Rules file (src/lib/evidence/evidenceRules.ts). For each applicable Module 12 obligation, a static required-artifact list is compared to the answered evidence state to derive a per-obligation readiness_status. No LLM reasoning. Carries through the legal_basis_citation, applicable_from_date and guidance_status of the parent Module 12 row so remediation (Module 14) and the final report (Module 15) can cite the source and see which deadline drives urgency.
- **readiness_mapping**:
  - **In place**: evidence_in_place
  - **Partial**: partial_evidence
  - **Not started**: evidence_gap
  - **Not sure**: unknown_evidence_state
  - **Not applicable**: not_applicable
- **gap_scoring_logic**: system readiness_score = 100 * (weighted evidence_in_place obligations) / (applicable obligations), where partial counts 0.5 and unknown counts 0. Obligations with a nearer applicable_from_date are weighted higher for prioritisation (not for the raw score).
- **legal_basis_citation**: Inherited per obligation from Module 12 (e.g. Article 9 for the risk-management evidence row).
- **applicable_from_date**: Inherited per obligation from Module 12; high-risk rows carry the provisional 2027-12-02 / 2028-08-02 dates.
- **guidance_status**: Inherited per obligation from Module 12 (final / provisional / draft).
- **source_version_date**: 2026-07-07
- **required_evidence_by_obligation**:
  - **obligation_id**: OBL-ART9-RMS | **legal_basis_citation**: Article 9 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    risk-management plan/policy, maintained risk register, residual-risk analysis, testing records
  - **obligation_id**: OBL-ART10-DATA | **legal_basis_citation**: Article 10 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    - data governance policy
    - dataset documentation
    - data provenance records
    - bias/representativeness examination
  - **obligation_id**: OBL-ART11-TECHDOC | **legal_basis_citation**: Article 11; Annex IV | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    Annex IV technical documentation file
  - **obligation_id**: OBL-ART12-LOGGING | **legal_basis_citation**: Article 12 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    logging design/spec, retained logs, log retention policy
  - **obligation_id**: OBL-ART13-TRANSP-DEPLOYER | **legal_basis_citation**: Article 13 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    instructions for use, deployer-facing documentation
  - **obligation_id**: OBL-ART14-OVERSIGHT | **legal_basis_citation**: Article 14; Article 26 (deployer) | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    human oversight measures design, operator instructions/training
  - **obligation_id**: OBL-ART15-ACCURACY | **legal_basis_citation**: Article 15 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    - declared accuracy metrics
    - robustness/adversarial test reports
    - cybersecurity measures / threat model
  - **obligation_id**: OBL-ART17-QMS | **legal_basis_citation**: Article 17 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    QMS documentation, procedures and responsibilities, record-keeping
  - **obligation_id**: OBL-ART26-DEPLOYER | **legal_basis_citation**: Article 26; Article 27 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    - use-per-instructions records
    - assigned human oversight
    - operation monitoring
    - retained logs
    - worker information notice
    - FRIA where Article 27 applies
  - **obligation_id**: OBL-ART43-CONFORMITY | **legal_basis_citation**: Article 43; Article 47; Article 48 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    - conformity assessment records
    - EU declaration of conformity
    - CE marking evidence
    - notified-body certificate (Annex VII route only)
  - **obligation_id**: OBL-ART49-REGISTER | **legal_basis_citation**: Article 49; Annex VIII | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    EU database registration entry (Annex VIII)
  - **obligation_id**: OBL-ART6-3-NOTHR-DOC | **legal_basis_citation**: Article 6(3); Article 49 | **guidance_status**: draft | **source_version_date**: 2026-07-07
    documented Article 6(3) no-significant-risk self-assessment, registration of that assessment
  - **obligation_id**: OBL-ART72-PMM | **legal_basis_citation**: Article 72; Recital 166 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    post-market monitoring plan, monitoring data collection evidence
  - **obligation_id**: OBL-ART73-INCIDENT | **legal_basis_citation**: Article 73 | **guidance_status**: provisional | **source_version_date**: 2026-07-07
    serious-incident reporting procedure, assigned owner, reporting timeline awareness, incident log

### Result Object

- **description**: Per-system readiness roll-up plus per-obligation evidence rows.
- **classification_or_status**: Per-obligation readiness label: 'evidence in place' / 'partial evidence' / 'evidence gap' / 'not started' / 'unknown' / 'not applicable'; plus a system-level 'X of Y applicable obligations have evidence in place' summary. Factual readiness wording only — never 'compliant'.
- **confidence_score**: 0-100 deterministic, measuring confidence in the readiness picture (not compliance). Start at 100; subtract 15 per obligation answered 'Not sure', 20 if the parent Module 12 obligation set is itself 'needs review', 10 if required_artifacts for an applicable obligation were left unanswered. Example: all applicable obligations answered, matrix stable = 90.
- **confidence_label**: high (80-100) / medium (50-79) / low (20-49) / insufficient_information (0-19)
- **reasoning_summary**: Deterministic text, e.g. 'Of 12 applicable obligations, 4 have evidence in place, 3 are partial and 5 are gaps. The nearest provisional deadline (2027-12-02, Annex III) drives priority; technical documentation (Art 11) and conformity assessment (Art 43) are the largest gaps. Readiness confidence is medium because 2 obligations are marked Not sure.'
- **positive_indicators**:
  - Core Article 9-15 evidence artifacts exist and are current
  - EU declaration of conformity and CE marking evidence present
  - Registration entry exists (or Article 6(3) assessment documented and registered)
  - Post-market monitoring and incident-reporting procedures are documented with owners
- **negative_indicators**:
  - No technical documentation file (Annex IV) despite high-risk classification
  - No conformity assessment / declaration of conformity
  - Post-market monitoring or incident-reporting exists only as intent, not documented control
  - Required evidence questions left as 'Not sure'
- **key_uncertainties**:
  - Deadlines driving remediation urgency are provisional (Digital Omnibus not adopted); a gap may be more or less urgent than shown.
  - Whether the conformity route is self-assessment or notified-body (affects how much evidence and lead time a gap needs).
  - Whether the non-public registration variant applies, changing what 'registered' means as evidence.
- **missing_fields**:
  - Answered evidence state for one or more applicable obligations
  - module-12 obligation set (this module cannot run until the matrix is generated)
  - standards_conformity_route (needed to scope the conformity-assessment evidence list)
- **recommended_next_questions**:
  - For each 'Partial' obligation, what specific artifact is missing (policy, records, testing, sign-off)?
  - Who owns the technical documentation file and when was it last updated?
  - Has the EU declaration of conformity been signed, and by whom?
  - Is the post-market monitoring plan actively collecting data, or only drafted?
- **role_conditional_obligation**:
  - **description**: Carried through from Module 12 — the evidence checklist only lists obligations for the roles the system holds; a provider checklist is far longer than a distributor checklist.
  - **note**: Inherited, not recomputed. Re-runs if a Module 9 reclassification changes the Module 12 role set.
- **reclassification_trigger_flags**:
  - **description**: Inherited from Module 12. If set, the evidence checklist must be regenerated against the provider obligation set before readiness is trusted.
- **registration_required**:
  - **description**: Inherited from Module 12; drives a specific evidence row (registration entry exists yes/no).
  - **evidence_row**: EU database registration entry (Annex VIII); Article 6(3) assessment registration where derogation claimed
- **standards_conformity_route**:
  - **description**: Inherited from Module 12; determines whether the conformity-assessment evidence row requires a notified-body certificate or only internal-control records.
  - **note**: Notified-body route materially increases required evidence and lead time; flag as a readiness risk when standards are not yet published.
- **not_high_risk_documentation_flag**:
  - **description**: Inherited from Module 12; when set, the checklist includes the Article 6(3) self-assessment + registration as a required evidence row so 'not high-risk' is not treated as 'no evidence needed'.
  - **value**: carried through from Module 12 OBL-ART6-3-NOTHR-DOC

### UI Pattern

- **summary_cards**:
  - Total applicable obligations
  - Evidence in place
  - Partial evidence
  - Evidence gaps
  - Not started
  - Unknown state
  - Obligations past/near a deadline
  - Overall readiness %
- **results_table**:
  - **description**: One row per system x obligation.
  - **columns**:
    - System name
    - Obligation
    - Legal basis
    - Applicable from
    - Guidance status
    - Required evidence
    - Readiness status
    - Confidence
    - Key uncertainty
    - Owner (if set)
    - Actions
- **filters**:
  - Readiness status
  - Obligation
  - Role
  - Guidance status (final/provisional/draft)
  - Applicable-from date range
  - Confidence
  - Owner assigned
- **csv_export**: Exports the per-obligation evidence rows with required_artifacts, readiness_status, legal_basis_citation and applicable_from_date so Module 14 remediation and Module 15 reporting can consume them directly.
- **detail_page**: Per-system evidence checklist grouped by obligation; each row shows the required artifacts, the answered evidence state, the gap, the legal basis and deadline badge, and a 'create remediation item' hand-off to Module 14.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made.
- **cross_module_consistency_warning**: Flag when the parent Module 12 obligation set is 'needs review' or an upstream classification is uncertain — e.g. 'This evidence checklist was generated from an obligations matrix still marked needs review; gaps may be over- or under-stated until the classification is confirmed.'

### Other Info

- **flowchart_section_note**: Practical add-on, not in the Future of Life Institute flowchart.

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date (all high-risk evidence rows inherit the provisional 2027-12-02 / 2028-08-02 dates)
- guidance_status (high-risk rows = provisional; Article 6(3) row = draft)
- reclassification_trigger_flags (inherited per system from Module 9 via Module 12)
- registration_required.non_public_variant_law_enforcement_migration_border
- standards_conformity_route.route (drives whether notified-body evidence is required)


---

## 11. Remediation Tracker
**Module ID**: module-14  
**Flowchart section**: _(not in flowchart — practical add-on)_  
**Legal basis**: Article 9-15 (obligations whose gaps are being remediated, inherited via Module 13/12), Article 17 (quality management system), Article 26 (deployer obligations), Article 43, 47-49 (conformity assessment, registration), Article 72 (post-market monitoring — recurring), Article 73 (serious-incident reporting readiness — event-driven/recurring), Annex IV (technical documentation), Annex VIII (registration)  
**Depends on**: module-13  

Turns each evidence gap from Module 13 (readiness status of 'partial evidence', 'evidence gap', 'not started' or 'unknown') into a trackable remediation action item with an owner, a due date and a status. It does not re-derive whether an obligation applies (Module 12) or whether evidence exists (Module 13); it only manages the closing of gaps already identified. Critically, it distinguishes one-off tasks (e.g. author the Annex IV technical documentation file) from recurring/lifecycle controls (post-market monitoring under Article 72, serious-incident reporting readiness under Article 73, periodic QMS review under Article 17) that must be re-verified on a cadence and can never be marked permanently 'done'. Due dates are anchored to the per-obligation applicable_from_date carried through from Module 12/13, so the tracker reflects the real (provisional) enforcement timeline rather than an arbitrary date.

### Questionnaire

- **description**: One planning question per Module 13 gap row, plus a small set of recurrence-configuration questions for lifecycle obligations. Seeded from Module 13; only shown for obligations whose readiness_status is not 'evidence in place' or 'not applicable'. The tracker asks who owns the fix and when it is due, not whether the obligation applies.
- **fields**:
  - **question_text**: Who is the owner responsible for closing this evidence gap? | **helper_text**: Assign a named person or role (e.g. 'Head of ML', 'DPO', 'Quality Manager'). Unassigned gaps are the most common reason remediation stalls; an owner is required before an item can move past 'open'. | **reused_from**: module-13 obligation row (readiness_status, obligation_id)
    <free text: owner name/role>, Unassigned, Not sure
  - **question_text**: What is the target due date for closing this gap? | **helper_text**: Default is derived from the obligation's applicable_from_date (from Module 12/13) minus a lead-time buffer for conformity assessment. For high-risk rows this is the provisional 2027-12-02 (Annex III) or 2028-08-02 (Annex I); you can override with your internal deadline. | **reused_from**: module-13 → module-12 applicable_from_date
    <date>, Use suggested date from applicable_from_date, Not sure
  - **question_text**: Is this a one-off task or a recurring control? | **helper_text**: One-off: produce a document/artifact once (e.g. write the Annex IV file, sign the declaration of conformity). Recurring: a control that must be re-verified on a cadence and is never permanently complete — post-market monitoring (Article 72), incident-reporting readiness (Article 73), periodic QMS/risk-management review (Articles 17, 9). | **reused_from**: module-13 required_evidence_by_obligation (Art 72/73/17/9 flagged recurring)
    One-off task, Recurring control, Not sure
  - **question_text**: For a recurring control, how often must it be reviewed? | **helper_text**: Sets the recurrence cadence that regenerates the item after it is completed (e.g. monthly post-market monitoring review, quarterly incident-procedure drill, annual QMS audit). Shown only when the item is a recurring control. | **reused_from**: answer to 'one-off vs recurring' above
    Monthly, Quarterly, Semi-annually, Annually, Event-driven (re-arm on trigger), Custom, Not sure
  - **question_text**: What is the current status of this remediation item? | **helper_text**: Lifecycle: Open → In progress → Blocked → Completed (one-off) or → Verified/Re-armed (recurring). 'Completed' on a recurring item schedules the next occurrence rather than closing it. | **reused_from**: new — tracker state
    Open, In progress, Blocked, Completed, Verified, Deferred, Not applicable
  - **question_text**: What is the priority of this item? | **helper_text**: Suggested priority is computed from the nearness of the obligation's applicable_from_date and the size of the gap ('not started' > 'partial'). You can override. Prohibited-practice and already-in-force items (e.g. AI literacy, transparency) outrank deferred high-risk items. | **reused_from**: module-13 readiness_status + module-12 applicable_from_date/guidance_status
    Critical, High, Medium, Low, Not sure

### Deterministic Rules

- **description**: Rules file (src/lib/remediation/remediationRules.ts). For each Module 13 gap, a remediation item is generated deterministically: a suggested due date from applicable_from_date, a one-off-vs-recurring classification from a static map of obligation_id → recurrence, and a priority from (deadline proximity × gap size × guidance_status). No LLM reasoning. The legal_basis_citation, applicable_from_date and guidance_status are inherited per obligation from Module 12/13 so the item, its urgency and its source are traceable. Recurring items are re-armed on completion rather than closed.
- **recurrence_map**:
  - **OBL-ART72-PMM**: recurring (post-market monitoring — continuous, review on cadence)
  - **OBL-ART73-INCIDENT**: recurring/event-driven (incident-reporting readiness — periodic drill + re-arm on incident)
  - **OBL-ART17-QMS**: recurring (periodic QMS review/audit)
  - **OBL-ART9-RMS**: recurring (risk-management is a continuous iterative process across the lifecycle)
  - **OBL-ART10-DATA**: one-off with review-on-change
  - **OBL-ART11-TECHDOC**: one-off with keep-current duty
  - **OBL-ART12-LOGGING**: one-off design + recurring retention checks
  - **OBL-ART13-TRANSP-DEPLOYER**: one-off with update-on-change
  - **OBL-ART14-OVERSIGHT**: one-off design + recurring operator training (deployer)
  - **OBL-ART15-ACCURACY**: one-off with re-test-on-change
  - **OBL-ART26-DEPLOYER**: one-off setup + recurring monitoring/logging
  - **OBL-ART43-CONFORMITY**: one-off (re-run on substantial modification)
  - **OBL-ART49-REGISTER**: one-off with update-on-change
  - **OBL-ART6-3-NOTHR-DOC**: one-off with review-on-change
- **due_date_logic**: suggested_due_date = obligation.applicable_from_date − lead_time_buffer, where lead_time_buffer is larger for OBL-ART43-CONFORMITY on the notified-body route (standards_conformity_route) because third-party assessment has long lead times. Already-in-force obligations (AI literacy 2025-02-02, GPAI 2025-08-02, transparency 2026-08-02) get an immediate/near-term due date, not the deferred high-risk date.
- **priority_logic**: priority = f(deadline_proximity, gap_size, guidance_status). Nearer applicable_from_date → higher; 'not started' > 'partial'; obligations already in force outrank deferred high-risk ones. guidance_status 'draft'/'provisional' items are surfaced but flagged 'timeline may shift' so effort is not mis-prioritised against a date that could move.
- **legal_basis_citation**: Inherited per obligation from Module 12/13 (e.g. Article 9 for the risk-management remediation item, Article 72 for the post-market-monitoring recurring item).
- **guidance_status**: Inherited per obligation from Module 12/13 (final / provisional / draft). A remediation item derived from a provisional/draft rule inherits that flag so a user is not told to hit a deadline that is not yet law.
- **source_version_date**: 2026-07-07
- **generated_items_example**:
  - **item_id**: REM-ART11-TECHDOC | **source_obligation**: OBL-ART11-TECHDOC | **task**: Author and maintain the Annex IV technical documentation file | **recurrence**: one-off + keep-current | **legal_basis_citation**: Article 11; Annex IV | **guidance_status**: provisional | **priority**: High | **source_version_date**: 2026-07-07
  - **item_id**: REM-ART72-PMM | **source_obligation**: OBL-ART72-PMM | **task**: Stand up and run the post-market monitoring plan; review monitoring data on cadence | **recurrence**: recurring (e.g. monthly review) | **suggested_due_date**: plan in place before high-risk applicable date; then continuous | **legal_basis_citation**: Article 72; Recital 166 | **guidance_status**: provisional | **priority**: Medium | **source_version_date**: 2026-07-07
  - **item_id**: REM-ART73-INCIDENT | **source_obligation**: OBL-ART73-INCIDENT | **task**: Establish serious-incident reporting procedure with owner and deadlines; drill periodically | **recurrence**: recurring/event-driven (re-arm on incident) | **suggested_due_date**: procedure + owner before high-risk applicable date; periodic re-verify | **legal_basis_citation**: Article 73 | **guidance_status**: provisional | **priority**: Medium | **source_version_date**: 2026-07-07
  - **item_id**: REM-ART4-LITERACY | **source_obligation**: OBL-ART4-LITERACY (via Module 8) | **task**: Deliver AI-literacy measures to staff; refresh on cadence | **recurrence**: recurring (annual refresh) | **suggested_due_date**: already in force — immediate | **legal_basis_citation**: Article 4 | **applicable_from_date**: 2025-02-02 | **priority**: High | **source_version_date**: 2026-07-07

### Result Object

- **description**: Per-system remediation plan: a set of action items rolled up into a system-level remediation progress view, plus a recurring-controls calendar.
- **classification_or_status**: Per-item status label: 'open' / 'in progress' / 'blocked' / 'completed' / 'verified' / 'deferred' / 'not applicable'; plus a system-level 'X of Y gaps have an owner and due date, Z closed, N recurring controls active' summary. Factual remediation-progress wording only — never 'compliant'. A closed item means an evidence gap was addressed, not that the system is legally compliant.
- **confidence_score**: 0-100 deterministic, measuring confidence in the completeness of the remediation plan (not in compliance). Start at 100; subtract 15 per gap with no owner assigned, 15 per gap with no due date, 20 if the parent Module 13 readiness picture is itself low-confidence, 10 per recurring control with no cadence set. Example: all gaps owned and dated, cadences set, Module 13 stable = 90.
- **confidence_label**: high (80-100) / medium (50-79) / low (20-49) / insufficient_information (0-19)
- **reasoning_summary**: Deterministic text, e.g. 'This system has 5 open evidence gaps; 3 have an owner and due date, 2 are unassigned. 2 items are recurring controls (post-market monitoring, incident-reporting readiness) and are tracked on a monthly/periodic cadence. The nearest driving deadline is the provisional 2027-12-02 (Annex III); the technical-documentation item (Art 11) is highest priority. Plan-completeness confidence is medium because 2 gaps lack an owner.'
- **positive_indicators**:
  - Every Module 13 gap has a named owner and a due date
  - Due dates are anchored to the obligation's applicable_from_date, not arbitrary
  - Recurring controls (Art 72 monitoring, Art 73 incident readiness, Art 17 QMS) are configured with a cadence and re-arm on completion
  - In-force obligations (AI literacy, transparency) are prioritised ahead of deferred high-risk items
- **negative_indicators**:
  - Open evidence gaps with no owner assigned
  - Recurring controls tracked as one-off tasks and marked 'done' permanently
  - Due dates set past the (provisional) applicable_from_date with no lead-time buffer for conformity assessment
  - Remediation plan generated from a low-confidence Module 13 readiness picture
- **key_uncertainties**:
  - Deadlines anchoring due dates are provisional (Digital Omnibus not adopted); an item may be more or less urgent than shown.
  - Whether the conformity route is self-assessment or notified-body — the notified-body route needs a much longer lead time, changing a realistic due date.
  - Whether AI-literacy remains a firm obligation or is softened by the final Digital Omnibus, affecting the priority of that recurring item.
  - Whether a Module 9 reclassification will add provider obligations, generating new gaps and new remediation items after this plan was built.
- **missing_fields**:
  - Owner and/or due date for one or more gaps
  - Recurrence cadence for a recurring control
  - module-13 gap set (this module cannot run until the readiness assessment is generated)
  - standards_conformity_route (needed to set a realistic conformity-assessment due date)
- **recommended_next_questions**:
  - For each unassigned gap, who is the accountable owner?
  - For each recurring control, what review cadence will you commit to?
  - Does the conformity-assessment item allow enough lead time if a notified body is required?
  - Should any item be deferred pending confirmation of the provisional high-risk deadline, or worked now to be safe?
- **role_conditional_obligation**:
  - **description**: Carried through from Module 12/13 — the remediation plan only contains items for obligations the system's role actually holds; a provider plan is far longer than a distributor plan. If Module 9 reclassifies a deployer/distributor to provider, the plan must be regenerated to add the provider-obligation remediation items.
  - **note**: Inherited, not recomputed. Owners/due dates already set on shared items are preserved when the plan regenerates.
- **reclassification_trigger_flags**:
  - **description**: Inherited from Module 12/13. If set, the remediation plan is stale — new provider obligations create new gaps (Module 13) and therefore new remediation items that this plan does not yet contain.
- **registration_required**:
  - **description**: Inherited from Module 12/13; when set, generates a specific remediation item to complete the EU-database registration (or the Article 6(3) self-assessment registration).
  - **remediation_item**: Complete EU database registration (Annex VIII); register the Article 6(3) not-high-risk assessment where a derogation is claimed
- **standards_conformity_route**:
  - **description**: Inherited from Module 12/13; determines the lead time and content of the conformity-assessment remediation item — the notified-body route needs a much longer buffer and cannot be closed by internal effort alone.
  - **note**: When harmonised standards are not yet published, flag the conformity item as schedule-risk: the due date may be undeliverable regardless of owner effort.
- **not_high_risk_documentation_flag**:
  - **description**: Inherited from Module 12/13; when set, the plan includes a remediation item to produce and register the Article 6(3) self-assessment, so 'not high-risk' does not silently produce an empty remediation plan.
  - **value**: carried through from Module 12/13 OBL-ART6-3-NOTHR-DOC

### UI Pattern

- **summary_cards**:
  - Total remediation items
  - Open
  - In progress
  - Blocked
  - Completed
  - Unassigned (no owner)
  - Overdue / due within 30 days
  - Recurring controls active
  - Overall remediation progress %
- **results_table**:
  - **description**: One row per remediation item (system x obligation gap).
  - **columns**:
    - System name
    - Task
    - Source obligation
    - Legal basis
    - Applicable from
    - Guidance status
    - Owner
    - Due date
    - Recurrence
    - Status
    - Priority
    - Confidence
    - Key uncertainty
    - Actions
- **filters**:
  - Status
  - Owner
  - Priority
  - Recurrence (one-off/recurring)
  - Obligation
  - Guidance status (final/provisional/draft)
  - Due-date range (overdue/30d/90d)
  - System
- **csv_export**: Exports the remediation items with owner, due_date, recurrence, status, source_obligation, legal_basis_citation, applicable_from_date and guidance_status so Module 15's final report can cite them and show the remediation state per obligation.
- **detail_page**: Per-system remediation board (Kanban by status) plus a recurring-controls calendar view. Each item shows the source gap, the required artifacts (from Module 13), owner, due date, priority, the legal basis and deadline badge, and — for recurring items — the cadence and next-due date. Completing a recurring item schedules its next occurrence instead of closing it.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made.
- **cross_module_consistency_warning**: Flag when the plan was generated from a Module 13 readiness picture that is low-confidence or 'needs review', or when a Module 9 reclassification has fired since the plan was built — e.g. 'New provider obligations were triggered after this remediation plan was created; regenerate to capture the additional gaps.'

### Other Info

- **flowchart_section_note**: Practical add-on, not in the Future of Life Institute flowchart.

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date (high-risk remediation items inherit the provisional 2027-12-02 / 2028-08-02 dates that anchor their due dates)
- guidance_status (high-risk items = provisional; Article 6(3) and AI-literacy items = draft)
- reclassification_trigger_flags (inherited per system from Module 9 via Module 12/13)
- registration_required.non_public_variant_law_enforcement_migration_border
- standards_conformity_route.route (drives whether the conformity item's due date is realistic)


---

## 12. Final Report Generator
**Module ID**: module-15  
**Flowchart section**: _(not in flowchart — practical add-on)_  
**Legal basis**: Article 2 (scope), Article 4 (AI literacy), Article 5 (prohibited practices), Article 6, Annex I, Annex III (high-risk classification), Article 9-15 (high-risk requirements), Article 17 (QMS), Article 22-25 (authorised rep, value-chain/provider conversion), Article 26-27 (deployer obligations, FRIA), Article 43, 47-49 (conformity, registration), Article 50 (transparency), Article 51, 53, 55 (GPAI, systemic risk), Article 72-73 (post-market monitoring, incident reporting), Annex IV (technical documentation), Annex VIII (registration), Recital 47, Recital 166  
**Depends on**: module-1, module-2, module-3, module-4, module-5, module-6, module-7, module-8, module-9, module-10, module-11, module-12, module-13, module-14  

Aggregates every module's output across every inventoried system into a single exportable compliance-readiness report. It performs no new classification of its own — it reads the result objects of Modules 1-14, cites the legal_basis_citation per obligation, and rolls the per-system statuses, readiness scores and remediation progress into an organisation-level summary. Its distinctive job is provenance and honesty: every obligation in the report shows the article/annex it rests on, its applicable_from_date, and — the flagged requirement of this module — whether the rule derives from final law or from draft/provisional guidance (the May 2026 Digital Omnibus and the 2026-05-19 draft high-risk classification guidelines). Anything resting on non-final text is badged so the report never presents a provisional deadline or an in-flux obligation as settled law.

### Questionnaire

- **description**: The report generator asks almost nothing of its own — it consumes upstream answers. The only questions are report-scoping choices about what to include and how conservatively to present in-flux rules.
- **fields**:
  - **question_text**: Which systems should the report cover? | **helper_text**: Default is all inventoried systems (Module 1). You can scope to a subset (e.g. only high-risk, only a business unit) for a targeted board or auditor report. | **reused_from**: module-1 inventory
    All systems, High-risk only, By business unit, By role (provider/deployer), Custom selection
  - **question_text**: How should obligations resting on draft or provisional guidance be presented? | **helper_text**: Conservative: include them and badge them as 'timeline/obligation not yet final'. Excluded: omit non-final rules entirely (risk: under-stating future duties). The default is conservative — include and badge, never silently drop. | **reused_from**: module-12/13/14 guidance_status per obligation
    Include and badge (recommended), Include without badge, Exclude non-final rules, Not sure
  - **question_text**: Who is the audience for this report? | **helper_text**: Adjusts tone and detail: internal (full detail, all uncertainties), board/executive (summary + risk view), external auditor/regulator (evidence citations and legal basis emphasised). Does not change the underlying data. | **reused_from**: new — report scoping
    Internal compliance, Board / executive, External auditor / regulator, Not sure
  - **question_text**: Include the full remediation plan or a progress summary only? | **helper_text**: Full: every remediation item with owner and due date (Module 14). Summary: progress percentages and overdue counts only. Board reports usually want the summary; auditors usually want the full plan. | **reused_from**: module-14 remediation items
    Full remediation plan, Progress summary only, Not sure

### Deterministic Rules

- **description**: Rules file (src/lib/report/reportRules.ts). Pure aggregation — no LLM reasoning and no new classification. For each system it reads the result objects of Modules 1-14, joins them on system_id, and emits report sections. Each obligation line carries through its legal_basis_citation, applicable_from_date and guidance_status verbatim from the source module. A deterministic rule flags any line whose guidance_status is 'draft' or 'provisional' and surfaces it in a dedicated 'rests on non-final guidance' section. The report also runs cross-module consistency checks (e.g. an uncertain Module 2 role that undermines a Module 12 obligation) and lists them rather than hiding them.
- **aggregation_logic**: For each system: pull status from Modules 3-11, the consolidated obligation set from Module 12, readiness state from Module 13, and remediation progress from Module 14. Roll up to organisation level: counts by risk tier, average readiness score, total open/overdue remediation items, and a count of obligations resting on non-final guidance.
- **non_final_flagging_logic**: any obligation line with guidance_status ∈ {draft, provisional} is badged and collected into a 'Obligations resting on draft/provisional guidance' appendix, with its source (Digital Omnibus 2026-05 provisional agreement, or draft high-risk guidelines 2026-05-19) named. A report is never allowed to present a provisional deadline or in-flux obligation as final.
- **legal_basis_citation**: Carried through verbatim per obligation from the source module (Module 12 is the canonical source; e.g. Article 9 for risk management, Article 50 for transparency, Article 5 for prohibited practices). The report cites, it does not invent, legal basis.
- **applicable_from_date**: Carried through per obligation. The report shows the split timeline explicitly: prohibited practices 2025-02-02 (final), AI literacy 2025-02-02 (final, possibly softened), GPAI 2025-08-02 (final), transparency 2026-08-02 (final), Annex III high-risk 2027-12-02 (provisional — Digital Omnibus deferral), Annex I high-risk 2028-08-02 (provisional).
- **guidance_status**: Carried through per obligation (final / provisional / draft) and used to drive the non-final-guidance flagging. This is the module's headline field.
- **source_version_date**: 2026-07-07
- **report_sections**:
  - **section**: Executive summary | **content**: organisation-level readiness snapshot, counts by risk tier, headline risks, count of obligations on non-final guidance
  - **section**: Per-system pages | **content**: for each system: role (M2), definition gate (M3), scope/exclusions (M4-5), prohibited (M6), high-risk (M7), literacy (M8), reclassification (M9), GPAI (M10), transparency/FRIA (M11), obligations matrix (M12), readiness (M13), remediation (M14)
  - **section**: Obligations register | **content**: every applicable obligation across all systems with legal_basis_citation, applicable_from_date, guidance_status, readiness and remediation status
  - **section**: Draft/provisional-guidance appendix | **content**: every obligation whose rule rests on the Digital Omnibus (2026-05) or draft high-risk guidelines (2026-05-19), badged and sourced
  - **section**: Cross-module consistency warnings | **content**: uncertain upstream statuses that may undermine downstream classifications
  - **section**: Assumptions & disclaimers | **content**: date checked, guidance versions, the standard non-legal-advice disclaimer

### Result Object

- **description**: Organisation-level compliance-readiness report object plus per-system report pages. Aggregation only — it inherits all classifications and never re-derives them.
- **classification_or_status**: Organisation-level readiness status using 'likely/possible/needs review' wording, e.g. 'N systems assessed: A likely high-risk, B possible high-risk needs review, C not high-risk, D prohibited-practice flags'. Per-obligation lines carry the source module's status label. Never 'compliant' or 'legally confirmed' — the report is a readiness snapshot, not an attestation.
- **confidence_score**: 0-100 deterministic, measuring confidence in the aggregated picture (not in compliance). Computed as a coverage-weighted roll-up: the minimum/weighted-average of upstream module confidences per system, minus penalties for systems with 'needs review' statuses or missing upstream modules. A report over an inventory with many uncertain upstream statuses scores lower.
- **confidence_label**: high (80-100) / medium (50-79) / low (20-49) / insufficient_information (0-19)
- **reasoning_summary**: Deterministic text, e.g. 'This report covers 8 systems. 3 are likely high-risk with an average readiness of 42%; 12 obligations across the portfolio rest on draft/provisional guidance (the deferred high-risk deadlines and the draft classification guidelines) and are badged accordingly. 5 remediation items are overdue against provisional deadlines. Aggregate confidence is medium because 2 systems have an uncertain Module 2 role that undermines their obligation sets.'
- **positive_indicators**:
  - Every obligation line cites its legal_basis_citation and applicable_from_date
  - Obligations resting on draft/provisional guidance are badged and collected in a dedicated appendix, never presented as settled
  - Cross-module consistency warnings are surfaced, not hidden
  - Per-system readiness (M13) and remediation progress (M14) are traceable back to the underlying articles
- **negative_indicators**:
  - Systems in the inventory missing one or more upstream modules (report incomplete for them)
  - Provisional deadlines presented without the non-final badge
  - Upstream 'needs review' statuses rolled into a confident-looking headline
  - Remediation progress reported as compliance
- **key_uncertainties**:
  - The split enforcement timeline itself is provisional — the Digital Omnibus (provisional agreement 2026-05-07) is not yet adopted, so the deferred high-risk dates (2027-12-02 / 2028-08-02) could change.
  - The high-risk classification of some systems rests on draft Commission guidelines (2026-05-19, consultation closed 2026-06-23) not yet final.
  - Whether AI literacy (Article 4) remains a firm obligation or is softened by the final Omnibus text.
  - GPAI systemic-risk designations beyond the 10^25 FLOP threshold (capability/user-base/autonomy grounds) are Commission-discretionary and cannot be firmly reported.
- **missing_fields**:
  - One or more upstream module result objects for a system in the inventory
  - module-14 remediation state (for the remediation section)
  - module-13 readiness scores (for the readiness roll-up)
  - guidance_status on any obligation line (needed to run the non-final flagging)
- **recommended_next_questions**:
  - For systems missing upstream modules, should they be excluded from the report or run first?
  - Should the report be regenerated once the Digital Omnibus is finalised, given how many lines rest on provisional dates?
  - Which audience version (internal / board / auditor) is being produced, so detail and badging are set appropriately?
  - Should systems with 'needs review' upstream statuses be excluded from the headline readiness figure?
- **role_conditional_obligation**:
  - **description**: Reported, not recomputed. The report shows, per system, the obligation set for the role(s) it holds (from Module 2/12); a provider page lists far more obligations than a distributor page. Where a system holds multiple roles, both obligation sets are shown.
  - **note**: If a Module 9 reclassification changed the role, the report reflects the reclassified (provider) obligation set and notes the trigger.
- **reclassification_trigger_flags**:
  - **description**: Reported per system from Module 9/12. When set, the report annotates the system as reclassified-to-provider and shows the expanded obligation set, with the trigger named.
- **registration_required**:
  - **description**: Reported per system from Module 12; the report lists registration status (done/outstanding) as part of the obligations register and flags the non-public variant where relevant.
  - **report_line**: EU database registration (Annex VIII) status per system; Article 6(3) not-high-risk assessment registration where a derogation is claimed
- **standards_conformity_route**:
  - **description**: Reported per high-risk system from Module 12/13; the report shows whether conformity rests on harmonised standards (presumption of conformity) or a notified body, because it materially affects the realism of the remediation timeline shown.
  - **note**: Where harmonised standards are not yet published, the report flags the conformity line as schedule-risk.
- **not_high_risk_documentation_flag**:
  - **description**: Reported per system from Module 12/13; when set, the report shows the Article 6(3) self-assessment + registration as an outstanding obligation, so a 'not high-risk' system is not reported as having nothing to do.
  - **value**: carried through from Module 12/13 OBL-ART6-3-NOTHR-DOC per system

### UI Pattern

- **summary_cards**:
  - Systems covered
  - Likely high-risk
  - Prohibited-practice flags
  - GPAI models
  - Average readiness %
  - Open/overdue remediation items
  - Obligations on non-final guidance
  - Overall report confidence
- **results_table**:
  - **description**: Portfolio obligations register — one row per system x obligation, aggregated across all modules.
  - **columns**:
    - System name
    - Risk tier
    - Role
    - Obligation
    - Legal basis
    - Applicable from
    - Guidance status
    - Readiness
    - Remediation status
    - Owner
    - Due date
    - Confidence
    - Key uncertainty
- **filters**:
  - System
  - Risk tier
  - Role
  - Obligation
  - Guidance status (final/provisional/draft)
  - Readiness status
  - Remediation status
  - Applicable-from range
  - Confidence
- **csv_export**: Exports the full portfolio obligations register with legal_basis_citation, applicable_from_date, guidance_status, readiness and remediation state per system x obligation — the single canonical export of the whole assessment. Also supports PDF export of the formatted report (executive summary + per-system pages + non-final-guidance appendix).
- **detail_page**: Per-system report page assembling every module's output for that system, with a badged obligations register, the readiness score, the remediation board, and a legal-basis footnote per obligation. Plus an organisation-level dashboard page and a dedicated 'rests on non-final guidance' appendix page.
- **disclaimer_footer**: This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made.
- **cross_module_consistency_warning**: Aggregates and displays every upstream consistency warning: flag when a system's downstream classification (e.g. Module 12 obligations) depends on an uncertain/needs-review upstream status (e.g. Module 2 role, Module 3 definition gate, Module 7 high-risk) — e.g. 'This system's obligation set rests on a Module 2 role still marked needs review; the reported obligations may change once the role is confirmed.'

### Other Info

- **flowchart_section_note**: Practical add-on, not in the Future of Life Institute flowchart.

### Not Yet Settled

The following fields could not be resolved by research alone (runtime-dependent, or pending finalization of draft/provisional EU guidance):

- applicable_from_date (deferred high-risk dates 2027-12-02 / 2028-08-02 are provisional pending Digital Omnibus adoption)
- guidance_status (obligations derived from the Digital Omnibus and the 2026-05-19 draft high-risk guidelines are provisional/draft)
- reclassification_trigger_flags (inherited per system from Module 9 via Module 12)
- registration_required.non_public_variant_law_enforcement_migration_border
- standards_conformity_route.route (affects reported conformity-timeline realism)

