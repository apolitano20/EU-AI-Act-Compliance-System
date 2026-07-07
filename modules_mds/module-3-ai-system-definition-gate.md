Build Module 3: AI System Definition Gate for the existing EU AI Act Compliance Readiness Dashboard.

Important design correction:
Do NOT build Module 3 as a full duplicate questionnaire.

Module 1 — AI System Inventory already captures most of the factual information needed to assess whether an inventory item is likely an “AI system” under the EU AI Act.

Module 3 should therefore be a deterministic derived-assessment layer that:
1. Reuses existing Module 1 inventory fields.
2. Runs transparent deterministic rules.
3. Classifies each inventory item as:
   - Likely AI system
   - Possible AI system / needs review
   - Likely not an AI system
   - Insufficient information
4. Shows reasoning, confidence, uncertainties, missing data, and recommended follow-up questions.
5. Only asks extra targeted questions if Module 1 data is missing, ambiguous, or contradictory.

Do not implement later modules:
- EU scope
- exclusions
- prohibited AI
- high-risk classification
- transparency obligations
- GPAI obligations
- obligations matrix
- evidence/readiness assessment
- remediation tracker
- final report generator

Only build Module 3.

Reference concept:
Use the EU AI Act definition of “AI system”:

“AI system” means a machine-based system that is designed to operate with varying levels of autonomy and that may exhibit adaptiveness after deployment, and that, for explicit or implicit objectives, infers, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.

Do not ask the user directly:
“Is this an AI system?”

Instead, infer the answer from inventory data.

Current existing Module 1 fields to reuse include, where available:

- systemName
- shortDescription
- outputTypes
- affectsDecisionsAboutPeople
- systemTypes
- decisionLogicType
- learnedParametersUsedInProduction
- underlyingModelOrTool
- modelProvider
- usesGpaiOrLlm
- usesRag
- canCallToolsOrApis
- canTakeActions
- generatesContent
- interactsDirectlyWithPeople
- deploymentContext
- users
- affectedPersons
- profilesIndividuals
- buildType
- riskDomainFlags
- completenessScore

Create a new page:

/ai-system-definition

This page should show:

1. Summary cards
2. Table with one row per inventory item
3. AI-system-definition status badge
4. Confidence score
5. Key uncertainty
6. Missing data indicator
7. Action button: “Review gate”

Create a detail page:

/ai-system-definition/systems/[id]

This page should show:

1. System overview from inventory
2. Existing inventory evidence used in the assessment
3. Deterministic result panel
4. Missing or ambiguous data
5. Optional targeted follow-up questions
6. Save/update assessment
7. Link back to edit the inventory record if core data needs updating

The user should not have to re-answer questions already answered in Module 1.

Module 3 should preferably calculate the assessment automatically whenever the inventory item is created or updated. If this is too intrusive, add a “Run assessment” / “Refresh assessment” action.

Suggested result object:

aiSystemDefinitionAssessment: {
  classification: "likely_ai_system" | "possible_ai_system_needs_review" | "likely_not_ai_system" | "insufficient_information",
  confidenceScore: number,
  confidenceLabel: "high" | "medium" | "low" | "insufficient_information",
  reasoningSummary: string,
  positiveIndicators: string[],
  negativeIndicators: string[],
  keyUncertainties: string[],
  missingFields: string[],
  recommendedNextQuestions: string[],
  evidenceUsed: {
    outputTypes?: string[],
    systemTypes?: string[],
    decisionLogicType?: string,
    learnedParametersUsedInProduction?: string,
    usesGpaiOrLlm?: string,
    usesRag?: string,
    canCallToolsOrApis?: string,
    canTakeActions?: string,
    generatesContent?: string,
    affectsDecisionsAboutPeople?: string,
    deploymentContext?: string,
    profilesIndividuals?: string,
    underlyingModelOrTool?: string
  },
  assessedAt: string,
  updatedAt: string
}

If the existing persistence design makes embedded objects difficult, create a separate table/model linked to AISystem by systemId.

Core deterministic mapping:

Treat these as strong positive AI-system indicators:

1. outputTypes includes:
   - Prediction
   - Score
   - Classification
   - Recommendation
   - Ranking
   - Decision
   - Text content
   - Image / audio / video content
   - Summary
   - Action in another system

2. systemTypes includes:
   - Statistical model
   - Machine learning model
   - Generative AI
   - General-purpose AI / foundation model
   - RAG system
   - Agentic workflow
   - Chatbot
   - Recommender system
   - Biometric system

3. decisionLogicType is:
   - Statistical model with estimated coefficients
   - Machine learning model trained on data
   - General-purpose AI / LLM
   - Hybrid: rules plus model

4. learnedParametersUsedInProduction = yes

5. usesGpaiOrLlm = yes

6. usesRag = yes

7. canCallToolsOrApis = yes, especially if combined with LLM/GPAI, agentic workflow, or canTakeActions

8. canTakeActions = yes

9. generatesContent = yes

10. affectsDecisionsAboutPeople = yes

11. profilesIndividuals = yes

Treat these as negative or non-AI indicators:

1. systemTypes includes only:
   - Deterministic rules engine

2. decisionLogicType is:
   - Fully hand-written business rules

3. learnedParametersUsedInProduction = no or not_applicable

4. outputTypes is empty, “Not sure”, or only “Other” without additional model-based indicators

5. no GPAI/LLM, no RAG, no model-based decision logic, no generated content, no learned parameters, no tool-calling/action capability

Classification rules:

A. Likely AI system

Classify as “Likely AI system” if any of the following are true:

Rule A1:
- systemTypes includes Machine learning model, Generative AI, General-purpose AI / foundation model, RAG system, Agentic workflow, Chatbot, Recommender system, Biometric system
AND
- outputTypes includes prediction, score, classification, recommendation, ranking, decision, generated content, summary, or action

Rule A2:
- decisionLogicType is Statistical model with estimated coefficients, Machine learning model trained on data, General-purpose AI / LLM, or Hybrid: rules plus model
AND
- learnedParametersUsedInProduction is yes

Rule A3:
- usesGpaiOrLlm = yes
OR usesRag = yes
OR generatesContent = yes
AND
- the system is used in a business or operational context

Rule A4:
- canCallToolsOrApis = yes
AND canTakeActions = yes
AND systemTypes includes Agentic workflow or General-purpose AI / foundation model

Examples:
- ChatGPT Enterprise for internal drafting
- Vendor CV screening tool
- Internal credit scoring model
- Customer support chatbot
- RAG assistant
- Agentic workflow
- Fraud detection model
- Recommender system
- Computer vision quality-control tool
- Statistical scoring model with estimated coefficients used in production

B. Possible AI system / needs review

Classify as “Possible AI system / needs review” if there are mixed or ambiguous indicators, for example:

- outputTypes includes scores, rankings, classifications, recommendations, decisions, or alerts, but decisionLogicType is “Not sure”
- systemTypes includes Deterministic rules engine plus Machine learning model, Statistical model, Generative AI, RAG, or Hybrid
- decisionLogicType is “Hand-written rules informed by data analysis”
- learnedParametersUsedInProduction is “Not sure”
- user selected both deterministic-only indicators and AI/model-based indicators
- underlyingModelOrTool suggests AI/ML/LLM but structured fields are incomplete
- system influences people or business processes, but the inference mechanism is unclear

C. Likely not an AI system

Classify as “Likely not an AI system” if most of the following are true:

- systemTypes includes only Deterministic rules engine
- decisionLogicType = Fully hand-written business rules
- learnedParametersUsedInProduction = no or not_applicable
- usesGpaiOrLlm = no
- usesRag = no
- canCallToolsOrApis = no
- canTakeActions = no
- generatesContent = no
- outputTypes does not include prediction, score, classification, recommendation, ranking, decision, generated content, summary, or action

Examples:
- Static spreadsheet with manually entered formulas
- Basic workflow automation with fixed routing rules
- Rule-based notification system with manually configured thresholds
- Simple database lookup
- Manual checklist tool
- Static dashboard showing historical data only

D. Insufficient information

Classify as “Insufficient information” if key fields are missing or “Not sure” and there are not enough strong positive or negative indicators.

Essential fields for this gate:

- outputTypes
- systemTypes
- decisionLogicType
- learnedParametersUsedInProduction
- usesGpaiOrLlm
- usesRag
- generatesContent
- canCallToolsOrApis
- canTakeActions
- affectsDecisionsAboutPeople

If 5 or more essential fields are missing/unknown, classify as “Insufficient information” unless there is a strong obvious AI indicator such as:
- usesGpaiOrLlm = yes
- usesRag = yes
- systemTypes includes Machine learning model, Generative AI, General-purpose AI / foundation model, Agentic workflow, Chatbot, Recommender system, or Biometric system

Confidence scoring:

Use deterministic scoring.

Start at 50.

Add:
- +20 if systemTypes includes strong AI technology: ML, generative AI, GPAI/foundation model, RAG, agentic workflow, chatbot, recommender system, biometric system
- +15 if outputTypes includes prediction, score, classification, recommendation, ranking, decision, content, summary, or action
- +20 if decisionLogicType is statistical model, ML trained on data, GPAI/LLM, or hybrid rules plus model
- +15 if learnedParametersUsedInProduction = yes
- +15 if usesGpaiOrLlm = yes
- +15 if usesRag = yes
- +10 if generatesContent = yes
- +10 if canCallToolsOrApis = yes
- +10 if canTakeActions = yes
- +10 if affectsDecisionsAboutPeople = yes or profilesIndividuals = yes

Subtract:
- -25 if decisionLogicType = Fully hand-written business rules
- -20 if systemTypes includes only Deterministic rules engine
- -15 if learnedParametersUsedInProduction = no or not_applicable
- -10 if usesGpaiOrLlm = no
- -10 if usesRag = no
- -10 if generatesContent = no
- -10 if canCallToolsOrApis = no and canTakeActions = no
- -10 for each essential unknown/missing field, capped at -40
- -15 for contradictory answers, such as “Fully hand-written business rules” plus “Machine learning model trained on data”

Clamp score between 0 and 100.

Confidence labels:
- 80–100 = high
- 50–79 = medium
- 20–49 = low
- 0–19 = insufficient_information

However, classification should not rely only on score. Use score plus rule triggers.

Reasoning summary:

Generate deterministic text based on indicators.

Examples:

Likely AI system:
“This item is likely an AI system because the inventory indicates that it produces recommendations or decisions, uses model-based decision logic, and uses learned or estimated parameters in production.”

Possible AI system:
“This item may be an AI system, but review is needed because it produces scores or classifications while the decision logic is unclear.”

Likely not AI system:
“This item is likely not an AI system because it appears to use fully hand-written business rules, does not use learned parameters in production, and does not use GPAI, RAG, generated content, or tool-calling functionality.”

Insufficient information:
“There is insufficient information to assess this item because several key fields are missing or marked as not sure, including output type, system type, decision logic, and production use of learned parameters.”

Positive indicators:

Populate from detected AI-like evidence, for example:
- “Produces predictions/scores/classifications/recommendations/decisions”
- “Generates text, image, audio, video, summaries, or other content”
- “Uses machine learning, statistical modelling, GPAI/LLM, RAG, or agentic workflow”
- “Uses learned, estimated, trained, or calibrated parameters in production”
- “Can call tools, APIs, databases, or software systems”
- “Can take actions in another system”
- “Influences decisions about people”
- “Profiles individuals”

Negative indicators:

Populate from non-AI evidence, for example:
- “Decision logic appears to be fully hand-written”
- “System is marked as deterministic rules engine only”
- “No learned or trained parameters are used in production”
- “No GPAI/LLM or RAG use indicated”
- “No generated content indicated”
- “No tool-calling or action-taking capability indicated”

Key uncertainties:

Populate from unknown/missing/contradictory data.

Examples:
- “Unclear whether the system infers outputs from data or only applies fixed rules.”
- “Unclear whether learned, estimated, or trained parameters are used in production.”
- “Unclear what type of output the system produces.”
- “System appears both deterministic and model-based; review needed.”
- “Underlying model or tool suggests AI/ML, but structured technical fields are incomplete.”

Recommended next questions:

Generate targeted questions only when needed.

Examples:
- “Confirm whether the scoring logic is trained, estimated, calibrated, or manually configured.”
- “Confirm whether learned or estimated parameters are used directly in production.”
- “Check vendor documentation for references to machine learning, AI, NLP, generative AI, model training, or automated decisioning.”
- “Confirm whether the system only follows fixed if/then rules.”
- “Confirm whether outputs influence a human decision, business process, user experience, or downstream system.”

Optional targeted follow-up questions:

Do not add a full new questionnaire unless needed.

If Module 1 is missing key data, the detail page may show a small “Clarify missing information” section with only the relevant questions.

Suggested optional fields to add to Module 1 only if not already present:

1. Does the system infer, estimate, predict, classify, rank, recommend, generate, or decide based on patterns in data?
   Options:
   - Yes
   - No
   - Partly
   - Not sure

2. Once inputs are provided, can the system generate outputs without a person manually writing each output?
   Options:
   - Yes
   - No
   - Partly
   - Not sure

3. Can the output influence a business process, human decision, digital environment, physical environment, user experience, or downstream system?
   Options:
   - Yes
   - No
   - Partly
   - Not sure

4. Is the system purely fixed hand-coded logic with no model-based, learned, estimated, trained, calibrated, or data-derived component?
   Options:
   - Yes
   - No
   - Partly
   - Not sure

If these are added, add them to the existing Module 1 Technical Profile or Use Case step. Do not create a separate long Module 3 questionnaire.

UI requirements:

On /ai-system-definition show summary cards:

- Total inventory items
- Likely AI systems
- Possible AI systems / needs review
- Likely not AI systems
- Insufficient information
- High confidence
- Medium confidence
- Low confidence
- Missing key data

Table columns:

- System name
- Business function
- Status
- Build type
- System types
- Output types
- AI definition status
- Confidence
- Key uncertainty
- Missing fields count
- Last assessed
- Actions

Filters:

- AI definition status
- Confidence label
- Business function
- Status
- Build type
- Uses GPAI/LLM
- Uses RAG
- Agentic/tool-calling
- Missing data

Add CSV export for the Module 3 table.

Detail page:

Show:

1. System overview
2. AI definition result card
3. Evidence used from inventory
4. Positive indicators
5. Negative indicators
6. Key uncertainties
7. Missing fields
8. Recommended next questions
9. Optional clarification questions if needed
10. Button to edit inventory record
11. Button to refresh assessment

Status labels:

Use:
- Likely AI system
- Possible AI system / needs review
- Likely not an AI system
- Insufficient information

Avoid:
- legally confirmed
- compliant
- non-compliant
- definitely in scope
- definitely out of scope

Important integration with Module 2:

Module 2 currently classifies entity type / role per system. Module 3 should not break Module 2.

If a system is classified as “Likely not an AI system” or “Insufficient information,” show a warning on the Module 3 result that later modules may need review before relying on role, scope, risk, or obligation outputs.

Do not automatically delete or hide Module 2 role assessments. Just surface a consistency warning, for example:

“This item may not meet the AI-system-definition gate. Review this before relying on later EU AI Act role, scope, risk, or obligation assessments.”

Implementation requirements:

- Inspect the existing codebase first.
- Reuse existing AISystem data.
- Do not duplicate Module 1 fields unless necessary.
- Add a small number of missing clarification fields to Module 1 only if required.
- Keep all rules in a separate file, for example:
  /lib/ai-system-definition/definitionRules.ts
- Add helper functions:
  - calculateAiDefinitionScore(system)
  - classifyAiSystemDefinition(system)
  - getPositiveIndicators(system)
  - getNegativeIndicators(system)
  - getMissingAiDefinitionFields(system)
  - getAiDefinitionUncertainties(system)
  - getRecommendedAiDefinitionQuestions(system)
  - buildAiDefinitionAssessment(system)
- Keep rules transparent and easy to edit.
- Add tests if the project already has a testing setup.

Test cases:

1. ChatGPT Enterprise for internal drafting
Expected:
- Likely AI system
- High confidence

2. Vendor CV screening tool
Expected:
- Likely AI system
- High confidence

3. Internal credit scoring model using statistical coefficients or ML
Expected:
- Likely AI system
- High confidence

4. Internal policy RAG assistant
Expected:
- Likely AI system
- High confidence

5. Static spreadsheet calculator with manually entered formulas
Expected:
- Likely not an AI system
- Medium or high confidence depending on completeness

6. Fixed workflow routing rules
Expected:
- Likely not an AI system, unless model-based or learned parameters are indicated

7. Scoring tool with unclear method
Expected:
- Possible AI system / needs review

8. Mostly unknown technical profile
Expected:
- Insufficient information

9. Deterministic rules engine plus machine learning model selected
Expected:
- Possible AI system / needs review, with contradiction uncertainty

10. Agentic workflow using LLM and APIs
Expected:
- Likely AI system
- High confidence

Acceptance criteria:

The module is complete when:

1. /ai-system-definition page exists.
2. It reuses Module 1 inventory records.
3. It does not duplicate the Module 1 questionnaire.
4. It produces deterministic AI-system-definition classifications.
5. It shows confidence, reasoning, indicators, uncertainties, missing fields, and next questions.
6. Optional clarification questions appear only when needed.
7. Assessments are stored or reproducibly calculated.
8. Module 1 and Module 2 continue working.
9. CSV export works.
10. Tests or fixtures cover likely AI, possible AI, likely not AI, and insufficient information cases.
11. No later EU AI Act modules are implemented yet.

Always display this disclaimer in Module 3 result views:

“This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made.”