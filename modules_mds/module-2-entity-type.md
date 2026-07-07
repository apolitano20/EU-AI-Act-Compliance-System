Here’s the final concise prompt for Claude Code.

Build **Module 2: Entity Type / Role Classification** for the existing EU AI Act Compliance Readiness Dashboard.

Module 1 already exists: **AI System Inventory**. Reuse the existing AI system records. Do not duplicate the inventory.

The goal is to classify, for each AI system/use case, what role the organisation likely has under the EU AI Act.

Possible outputs:

* Provider
* Deployer
* Importer
* Distributor
* Authorised Representative
* Product Manufacturer
* Article 25 provider-conversion risk
* Needs review / unclear

Do **not** implement high-risk classification, prohibited AI, transparency obligations, GPAI obligations, evidence assessment, or remediation yet.

---

## UI

Create a new page:

```text
/entity-type
```

This page should include:

1. Summary cards
2. Table with one row per AI system
3. Role badges
4. Confidence badge
5. Article 25 risk flag
6. Action button: “Assess role”

Create a detail page:

```text
/entity-type/systems/[id]
```

This page should include:

1. System overview from inventory
2. Plain-English questionnaire
3. Live result panel
4. Save/edit answers
5. Back to summary

The user should never be asked directly:

> Are you a provider?

Instead ask factual questions and infer the role in the backend.

---

## Summary cards

Show:

* Total AI systems
* Assessed systems
* Unassessed systems
* Likely Provider
* Likely Deployer
* Possible Importer
* Possible Distributor
* Possible Authorised Representative
* Possible Product Manufacturer
* Article 25 risk
* Low-confidence / unclear

---

## Summary table columns

* System name
* Business function
* Status
* Build type
* Vendor/provider
* Internal/external use
* Likely role(s)
* Possible role(s)
* Article 25 risk
* Confidence
* Key uncertainty
* Last assessed
* Actions

Add filters for role, confidence, Article 25 risk, business function, status, and build type.

Add CSV export.

---

## Questionnaire

Each question should support:

* Yes
* No
* Not sure
* Not applicable

### Section A — Development / commissioning

Q1. Did your organisation develop this AI system internally?

Q2. Did your organisation pay another company or person to build this AI system specifically for you?

Q3. Is this a standard vendor product used by many customers?

Q4. Is the system used, offered, or released under your organisation’s name, logo, product name, or trademark?

Q5. Is another company’s name or brand visible as the provider/vendor?

Q6. Who defines what the system is intended to do?

Options:

* Our organisation
* Vendor / external provider
* Jointly
* Not sure
* Not applicable

---

### Section B — Business use

Q7. Does your organisation use this AI system?

Q8. Is it used for business, professional, public-sector, or organisational purposes?

Q9. Does your organisation decide who can use it and how it is used?

---

### Section C — Availability outside the organisation

Q10. Do you make this AI system available to anyone outside your organisation?

Helper:

> This includes customers, clients, affiliates, group companies, partners, resellers, or public users. It can be paid or free.

Q11. Who can access it outside your organisation?

Options:

* Customers
* Clients
* Affiliates / group companies
* Business partners
* Resellers
* Public users
* Other
* Not sure
* Not applicable

Q12. Is access provided for payment, for free, or both?

Options:

* Payment
* Free
* Both
* Not sure
* Not applicable

---

### Section D — Non-EU supply chain

Q13. Is the AI system provided by an organisation established outside the EU?

Q14. Is your organisation established or located in the EU?

Q15. Did your organisation obtain the system directly from the non-EU provider?

Q16. Did your organisation obtain the system through another EU reseller, distributor, or partner?

Q17. Are you the first EU-based organisation making this non-EU system available to EU customers or users?

Helper:

> Answer “Yes” only if your organisation is the first EU-based actor introducing or supplying the non-EU provider’s system into the EU market. If you only use it internally, answer “No” or “Not applicable.”

Q18. Does the system keep the non-EU provider’s name or trademark when made available in the EU?

---

### Section E — Authorised representative

Q19. Has a non-EU AI provider formally appointed your organisation in writing to act on its behalf for EU AI Act or EU regulatory obligations?

Helper:

> This is not the same as being a reseller, consultant, implementation partner, or local sales contact. There must be a written mandate.

Q20. Does the written appointment specifically mention EU AI Act, EU regulatory compliance, conformity, documentation, or acting on behalf of the provider?

---

### Section F — Product manufacturer

Q21. Is the AI system included inside a product your organisation sells or puts into service?

Q22. Is that product sold, supplied, or put into service under your organisation’s name or brand?

Q23. Could failure or malfunction of the AI system create safety risks for people or property?

---

### Section G — Modification / Article 25 risk

Q24. Have you put your own name, logo, trademark, or product name on an AI system originally provided by someone else?

Q25. Have you changed what the AI system is intended to be used for?

Q26. Have you substantially modified how the system works?

Q27. Have you fine-tuned, retrained, or otherwise materially adapted the model?

Q28. Have you integrated the system into a new workflow where it now affects decisions, recommendations, or actions in a different context than originally intended?

---

## Deterministic decision rules

Implement these in a separate rules file, for example:

```text
/lib/entity-type/roleRules.ts
```

The logic should be deterministic and transparent. Do not use LLM reasoning.

Important: roles are **not mutually exclusive**. A system can be `Provider + Deployer`, for example.

---

### Rule 1 — Provider

Add `Provider` if:

* organisation developed the system or had it developed; and
* the system is used, offered, or released under the organisation’s name, logo, product name, or trademark.

Equivalent logic:

```text
(builtInternally = yes OR commissionedForUs = yes)
AND ownNameOrBrand = yes
```

Also add `Provider` if:

```text
madeAvailableOutsideOrganisation = yes
AND ownNameOrBrand = yes
AND intendedPurposeDefinedBy = our_organisation
```

If developed/commissioned but own name/brand is `no`, flag:

```text
Contractor / supplier scenario — review contractual allocation.
```

---

### Rule 2 — Deployer

Add `Deployer` if:

```text
usesSystem = yes
AND businessOrProfessionalUse = yes
AND organisationControlsUse = yes
```

Reason:

> The organisation appears to use the AI system professionally and under its own authority.

---

### Rule 3 — Article 25 provider-conversion risk

Flag `Article 25 provider-conversion risk` if any are yes:

```text
rebrandedThirdPartySystem
changedIntendedPurpose
substantiallyModifiedSystem
fineTunedOrRetrainedModel
integratedIntoNewWorkflowWithNewPurpose
```

Do not definitively classify this as Provider yet. Phrase as:

> Potential Article 25 provider-conversion risk. Review later after high-risk classification.

---

### Rule 4 — Importer

Add `Importer` if:

```text
providerOutsideEu = yes
AND organisationInEu = yes
AND madeAvailableOutsideOrganisation = yes
AND firstEuActorMakingAvailable = yes
AND keepsNonEuProviderBrand = yes
```

Do **not** classify as Importer if the organisation only uses the system internally.

Reason:

> The organisation may be the EU-based actor introducing a non-EU provider’s AI system into the EU market under the non-EU provider’s brand.

---

### Rule 5 — Distributor

Add `Distributor` if:

```text
madeAvailableOutsideOrganisation = yes
AND standardVendorProduct = yes
AND ownNameOrBrand = no
AND vendorBrandVisible = yes
AND firstEuActorMakingAvailable != yes
```

Reason:

> The organisation may be making another provider’s AI system available in the EU supply chain without being the original provider or importer.

---

### Rule 6 — Authorised Representative

Add `Authorised Representative` if:

```text
writtenMandateFromNonEuProvider = yes
AND mandateMentionsEuAiActOrRegulatoryObligations = yes
```

If written mandate is yes but the content is unclear, add `Possible Authorised Representative`.

Reason:

> A non-EU provider appears to have formally appointed the organisation to act on its behalf for EU regulatory obligations.

---

### Rule 7 — Product Manufacturer

Add `Possible Product Manufacturer` if:

```text
aiEmbeddedInProduct = yes
AND productSoldUnderOwnBrand = yes
```

If safety risk is yes or not sure, add uncertainty:

> The AI may be a safety component. Review in later high-risk/product-safety module.

---

### Rule 8 — Non-EU provider representative requirement

If the organisation itself is outside the EU and provides a high-risk AI system or GPAI model in the EU, flag:

```text
May need to appoint EU authorised representative.
```

Do not classify the organisation as Authorised Representative in this case. It is the non-EU provider that may need to appoint one.

Since high-risk/GPAI classification is not implemented yet, this can be left as an optional future flag or placeholder.

---

## Result object

For each assessed system, produce:

```text
likelyRoles: string[]
possibleRoles: string[]
flags: string[]
article25ProviderConversionRisk: boolean
confidenceScore: number
confidenceLabel: "high" | "medium" | "low" | "insufficient_information"
reasoningSummary: string
keyUncertainties: string[]
recommendedNextQuestions: string[]
lastAssessedAt: datetime
```

---

## Confidence scoring

Start at 100.

Subtract:

* 10 for each “Not sure” answer in core questions
* 20 if own name/brand is unknown
* 20 if made-available-outside-organisation is unknown
* 20 if non-EU provider status is unknown and supply-chain questions are relevant
* 30 if no role is triggered
* 15 for contradictory answers

Labels:

```text
80–100 = high
50–79 = medium
20–49 = low
0–19 = insufficient_information
```

---

## Result panel text

Show:

1. Likely role(s)
2. Possible role(s)
3. Flags
4. Confidence
5. Reasoning
6. Key uncertainties
7. Recommended next questions

Use wording like:

* likely
* possible
* based on your answers
* requires confirmation
* should be reviewed

Avoid:

* definitely
* legally confirmed
* compliant
* non-compliant
* guaranteed

Always display:

> This tool supports EU AI Act readiness assessment. It does not provide legal advice. Results should be reviewed by qualified legal or compliance professionals before regulatory decisions are made.

---

## Acceptance criteria

The module is complete when:

1. `/entity-type` page exists.
2. It reuses AI systems from the inventory.
3. Each system can be assessed through the questionnaire.
4. Answers can be saved and edited.
5. Deterministic rules produce role outputs.
6. Multiple roles can be shown for one system.
7. Article 25 risk is flagged.
8. Confidence is calculated and displayed.
9. The summary table shows role badges and key uncertainty.
10. CSV export works.
11. No high-risk/prohibited/transparency/GPAI/obligations modules are implemented yet.
