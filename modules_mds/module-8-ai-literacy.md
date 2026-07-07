Build Module 8: AI Literacy for the existing EU AI Act Compliance Readiness Dashboard.

Flowchart section: none (not in the Future of Life flowchart — research-identified gap). Legal basis: Article 4. Depends on: Module 1, Module 2 (role). Feeds: Module 12, Module 14.

Apply the shared conventions from Module 4. This is a HORIZONTAL obligation: Article 4 applies to every provider/deployer of any AI system regardless of risk tier (including minimal-risk and systems excluded from other obligations), which is why it cannot be nested inside the high-risk path. In force since 2025-02-02.

In-flux note: the Digital Omnibus simplification package would soften Article 4 from an obligation of result ('ensure a sufficient level') to an obligation of effort ('take appropriate measures to support the development of AI literacy'), and shift part of the burden to Member States/Commission. Until published in the Official Journal, keep the current in-force text as the operative rule and surface the softening as a forward-looking note (guidance_status: draft), not the binding standard.

Routes: /ai-literacy (list) and /ai-literacy/systems/[id] (detail — four answers, triggered rules with citations, role_conditional_obligation breakdown, in-flux banner for the Omnibus softening).

Questionnaire (reuse-first):
1. Does your organisation use, operate, or provide any AI system in the course of its professional activity? Helper: covers systems you build (provider) and systems you merely deploy/use (deployer), including minimal-risk/general-purpose tools (chatbots, coding assistants, off-the-shelf ML). (module-1 any AISystem record / module-3 gate) Options: Yes · No · Not sure
2. What is your organisation's role with respect to this AI system? Helper: Article 4 applies to both provider and deployer. (module-2 role) Options: Provider · Deployer · Both · Neither (importer/distributor only) · Not sure
3. Have you put in place any measures to build AI knowledge and skills among staff who operate or use this system (training, guidelines, onboarding, usage policies)? Helper: measures are proportionate to context — short internal guidance for a low-risk tool, richer measures for staff operating a high-risk system; no mandated curriculum. Options: Yes, documented · Yes, informal only · No · Not sure
4. Do the people who operate or are affected by this system have the technical knowledge, experience, and training to understand its capabilities, limitations, and risks? Helper: literacy must account for prior knowledge/experience and context of use. Options: Yes · Partially · No · Not sure

Deterministic rules (src/lib/ai-literacy/literacyRules.ts):
- AILIT-1 applies-to-all-tiers — IF module-2 role IN {provider, deployer, both} THEN Article 4 applies, irrespective of risk classification (module-5 exclusion / module-7 outcome do NOT switch it off). [Art 4; Recital 20] applicable_from_date 2025-02-02, final.
- AILIT-2 role-scope — obligation attaches only to provider/deployer. Pure importer/distributor → not_applicable pending a Module 9 reclassification check. [Art 4 addressees; Art 3(3)/(4)] final.
- AILIT-3 proportionality — required level of measures evaluated against (a) technical knowledge/experience/training of the persons, (b) context of use, (c) persons/groups the system is used on. No fixed certification threshold; absence of ANY measures for staff operating a higher-risk system lowers readiness confidence. [Art 4 second sentence] final.
- AILIT-4 omnibus-softening — IN-FLUX: reframes Article 4 to an effort-based duty and adds a Member-State/Commission encouragement duty. Retain current in-force text as operative until OJ publication; surface softening as a note. [Digital Omnibus amendment to Art 4] guidance_status: draft, applicable_from_date not_yet_in_force (Council final approval 2026-06-29, Parliament endorsement 2026-06-16; OJ publication expected before 2026-08-02).

Result object:
- classification_or_status: "AI literacy obligation likely applies (horizontal, all risk tiers) — organisational measures needed for provider/deployer staff" (or not_applicable for importer/distributor-only).
- confidence_score baseline 90 (high) where module-2 assigns provider/deployer and module-3 confirms an AI system; capped below certainty because adequacy of measures is judgement-based and the Omnibus softening is imminent.
- reasoning_summary, positive/negative indicators, key_uncertainties, missing_fields (module-2 role; presence/description of existing measures — not captured in modules 1-3), recommended_next_questions (do you keep records of measures? are measures differentiated by risk level/role? who owns literacy compliance?).
- role_conditional_obligation: provider & deployer → must take measures for own staff and others operating on their behalf/under their authority; importer & distributor → not directly obligated unless reclassified to provider (Module 9); authorised representative → not a direct addressee.
- registration_required: not_applicable. standards_conformity_route: not_applicable.

UI: summary cards (applies to all AI systems — Yes; in force since 2025-02-02; status: softening pending, guidance_status: draft); table (system, role, obligation applies Y/N, measures in place documented/informal/none, status, confidence, key uncertainty) + CSV incl. legal_basis_citation & applicable_from_date for Module 15 aggregation; filters (role, measures-in-place, confidence_label, guidance_status). Cross-module consistency warning: if Module 2 role is needs-review or Module 3 gate uncertain, warn the applicability determination inherits that uncertainty; surface the Omnibus in-flux warning.

Implementation: rules in src/lib/ai-literacy/literacyRules.ts; helpers assessAiLiteracy(system), buildLiteracyAssessment(org/system). Because this is org/role-level as much as per-system, evaluate per system but roll up to an organisation-level "measures in place" state. Self-check tests: deployer of a minimal-risk chatbot → obligation applies (AILIT-1); importer-only → not_applicable (AILIT-2); provider with documented training → applies, positive indicator; excluded high-risk system still deployed → obligation still applies (horizontal).

Acceptance criteria: /ai-literacy list + detail; reuses Module 1/2; obligation applies regardless of Module 5/7 outcome; importer/distributor-only correctly marked not_applicable; Omnibus softening shown as draft/in-flux, never as the binding standard; disclaimer footer; CSV export; tests cover AILIT-1..AILIT-3 and the in-flux AILIT-4 note.
