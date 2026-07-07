Build Module 6: Prohibited AI Practices for the existing EU AI Act Compliance Readiness Dashboard.

Flowchart section: #R3. Legal basis: Article 5, Recital 28-45, Article 99 (penalties). Depends on: Module 1, Module 5 (exclusions). Feeds: Module 7 (high-risk), Module 12.

Apply the shared conventions from Module 4. Reuse-first: reuse Module 1 (use case, output types, deployment context, biometrics flag) and Module 5 (exclusion status) before asking anything new. Runs only if Module 5 did not fully exclude the system; a full exclusion short-circuits to status not_assessed_excluded.

Screens each system against the eight Article 5 prohibitions plus the new Digital Omnibus prohibition on AI 'nudifiers' / non-consensual intimate imagery and CSAM generation (provisional — applies 2026-12-02, not yet adopted final text; tag guidance_status: provisional).

Routes: /prohibited (list) and /prohibited/systems/[id] (detail — questionnaire, live result panel, per-prohibition legal citations).

Questionnaire (plain English, never "is this prohibited?"):
- P1 Does the system try to influence people's decisions or behaviour using techniques they cannot consciously perceive, or that are designed to be deceptive or manipulative? Helper: subliminal cues below perception, dark patterns. Ordinary recognisable advertising is NOT this. (module-1 outputTypes, useCaseDescription)
- P2 Could the system materially distort the behaviour of a specific person or group in a way likely to cause significant harm (physical/psychological/financial)? Paired with P1.
- P3 Does the system target or take advantage of people because of their age, a disability, or a specific social/economic situation? (Article 5(1)(b); module-1 affectedPeople)
- P4 Does the system score/rate people over time based on social behaviour or personal characteristics, leading to unfavourable treatment in unrelated situations? Helper: social scoring (5(1)(c)); ordinary sector credit scoring/fraud detection is separate (may be high-risk, not prohibited).
- P5 Does the system predict the risk that an individual will commit a crime based solely on profiling or personality traits? Helper: 5(1)(d); does not cover human assessment on objective verifiable facts linked to criminal activity.
- P6 Does the system build/expand a facial-recognition database by scraping facial images from the internet or CCTV without targeting? (5(1)(e); module-1 dataSources, biometricData)
- P7 Does the system infer people's emotions in a workplace or education/training setting? Helper: 5(1)(f); carve-out for medical/safety reasons (e.g. driver fatigue). (module-1 deploymentContext, outputTypes)
- P8 Does the system sort people into categories using biometric data to infer sensitive attributes (race, political opinions, trade-union membership, religion, sex life, sexual orientation)? Helper: 5(1)(g); lawful law-enforcement dataset labelling excepted. (module-1 biometricData, outputTypes)
- P9 Is the system used for real-time remote biometric identification in publicly accessible spaces for law-enforcement purposes? Helper: 5(1)(h); 'real-time' and 'remote' are cumulative; narrow authorised exceptions exist. (module-1 biometricData, deploymentContext; module-2 role)
- P10 Can the system generate sexual/intimate images of real, identifiable people without consent, or generate CSAM? Helper: new Digital Omnibus prohibition (provisional, applies 2026-12-02); covers 'nudifier' apps and CSAM generators; applies where this is the intended purpose OR a reasonably foreseeable and reproducible output not prevented by adequate safeguards.
- P11 (shown only if P10 = Yes/Not sure) If such imagery could theoretically be produced, has the provider put in place technical safeguards that reliably prevent it?

Deterministic rules (src/lib/prohibited/rules.ts) — each maps a questionnaire pattern to a prohibition with citation:
- PR-A Harmful subliminal/manipulative/deceptive techniques — P1=Yes AND P2=Yes. [Art 5(1)(a); Recital 29] final
- PR-B Exploitation of vulnerabilities — P3=Yes AND (P2=Yes OR significant-harm likely). [Art 5(1)(b); Recital 29] final
- PR-C Social scoring → detrimental treatment — P4=Yes. [Art 5(1)(c); Recital 31] final
- PR-D Predictive policing by profiling/personality — P5=Yes. [Art 5(1)(d); Recital 42] final
- PR-E Untargeted facial-image scraping to build/expand databases — P6=Yes. [Art 5(1)(e); Recital 43] final
- PR-F Emotion recognition in workplace/education — P7=Yes AND NOT medical/safety exception. [Art 5(1)(f); Recital 44] final
- PR-G Biometric categorisation inferring sensitive attributes — P8=Yes AND NOT law-enforcement labelling exception. [Art 5(1)(g); Recital 30] final
- PR-H Real-time remote biometric ID in public spaces for law enforcement — P9=Yes AND NOT authorised exception. [Art 5(1)(h), 5(2)-(7); Recital 32-38] final
- PR-I AI generation of non-consensual intimate imagery ('nudifiers') and CSAM — P10=Yes AND (intended_purpose OR (foreseeable_reproducible_output AND P11≠Yes)). [Art 5 new point, Digital Omnibus 2026-05-07; Art 99 penalties] guidance_status: provisional

Result object:
- classification_or_status: likely_prohibited | possibly_prohibited | needs_review | likely_not_prohibited | not_assessed_excluded. Never "compliant"/"illegal" — flags likelihood for legal review.
- confidence_score: start 100; −15 per core 'Not sure', −20 if biometrics status unknown but relevant, −25 if deployment context (workplace/education/law-enforcement/public-space) unknown but a biometric/emotion trigger partially met, −10 per contradictory answer; floor 0. Labels high/medium/low/insufficient as standard.
- reasoning_summary, positive/negative indicators, key_uncertainties, missing_fields (module-1 biometricData, deploymentContext, outputTypes; module-5 exclusionStatus), recommended_next_questions.
- role_conditional_obligation: Article 5 binds ALL operators — no role makes a prohibited practice permissible; role only affects penalty exposure. Store { provider: 'must not place on market/put into service', deployer: 'must not use', importer/distributor: 'must not make available' }.
- registration_required: not applicable — a prohibited-practice finding overrides any high-risk registration workflow. standards_conformity_route: not applicable.

UI: summary cards (total screened, likely/possibly prohibited, needs review, likely not prohibited, excluded-from-M5); table (system, matched prohibition(s), status, confidence, key uncertainty, applicable-from date, last assessed, actions) + CSV incl. legal_basis_citation & guidance_status per matched prohibition; filters (status, confidence, matched prohibition, sector, deployment context). Cross-module consistency warning: if Module 5 exclusion status is uncertain, warn a prohibited finding may be moot; if module-1 biometricData/deploymentContext missing, warn biometric prohibitions cannot be reliably screened.

Guidance-status note (show in UI): the original eight prohibitions are final (in force since 2025-02-02; Commission guidelines published 2025-02-04). The nudifier/NCII/CSAM prohibition (PR-I) is provisional (Digital Omnibus political agreement 2026-05-07, applies 2026-12-02, final text not yet adopted) — badge it as such.

Implementation: rules in src/lib/prohibited/rules.ts; helpers screenProhibitedPractices(system), buildProhibitedAssessment(system). Self-check tests: workplace emotion recognition, no medical purpose → PR-F likely_prohibited; nudifier app without safeguards → PR-I; ordinary credit-scoring → likely_not_prohibited (not PR-C); fully-excluded (M5) system → not_assessed_excluded.

Acceptance criteria: /prohibited list + detail; reuses Module 1/5; short-circuits on full M5 exclusion; deterministic per-prohibition screening with citations and guidance-status badges; never uses "compliant"; CSV export; disclaimer footer; tests cover PR-A..PR-I including the provisional PR-I and its exceptions.
