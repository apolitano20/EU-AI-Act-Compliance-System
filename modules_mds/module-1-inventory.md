You are building the first module of a broader EU AI Act Compliance Readiness Dashboard.

The first module is called **AI System Inventory**.

The purpose of this module is to help a consultant create and manage a structured inventory of all AI systems, AI-enabled tools, models, vendor platforms, copilots, chatbots, RAG systems, agentic workflows, and AI use cases used, built, commissioned, sold, or made available by a client organisation.

This module is only the inventory foundation. Do not build the full EU AI Act legal workflow yet. Later modules will classify entity type, AI Act scope, prohibited AI, high-risk status, transparency obligations, GPAI dependencies, obligations, evidence gaps, and remediation actions. Design the data model so those future modules can be added later.

## Product context

The broader product will assess EU AI Act readiness system by system. The unit of assessment is **one AI system or materially distinct AI use case**, not the whole company.

For example, “ChatGPT Enterprise” should not necessarily be one single row if it is used in several materially different ways. The inventory should allow separate entries such as:

* ChatGPT Enterprise for internal drafting
* ChatGPT Enterprise for customer complaint summarisation
* Vendor CV screening tool
* Internal credit scoring model
* Public customer service chatbot
* Internal policy RAG assistant
* Agentic workflow that updates CRM records

The first module should help the user capture these systems in a structured way.

## Build scope

Build only:

1. AI Inventory page
2. Add AI System wizard
3. Edit AI System page
4. Dynamic inventory table
5. Basic dashboard summary cards
6. Filtering and search
7. CSV export
8. Local persistence

Do not implement entity type classification, high-risk classification, obligations, or legal reasoning yet.

## Recommended stack

Use:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Prisma
* SQLite for local development
* TanStack Table or equivalent for the dynamic table
* React Hook Form + Zod for forms and validation

The app should run locally without external APIs.

## Main navigation

Create a single main module/page:

* `/inventory`

Optional supporting routes:

* `/inventory/new`
* `/inventory/[id]`
* `/inventory/[id]/edit`

## AI Inventory page

The `/inventory` page should include:

### 1. Page title

Title:

> AI System Inventory

Subtitle:

> Create a structured inventory of AI systems and AI-enabled use cases before assessing EU AI Act obligations.

### 2. Disclaimer / guidance box

Include this text:

> List AI systems broadly at this stage. Do not worry yet about whether the system is legally in scope of the EU AI Act. Later modules will classify scope, role, risk category, and obligations. For now, capture any system that learns, predicts, scores, classifies, recommends, generates content, automates workflows, uses a foundation model, or otherwise influences decisions or digital/physical environments.

### 3. Summary cards

Show the following cards:

* Total systems
* Production systems
* Pilot systems
* Vendor systems
* Internal systems
* Systems using GPAI / LLMs
* Systems using RAG
* Agentic workflows
* Systems affecting decisions about people
* Systems with incomplete inventory data

### 4. Main inventory table

Each row represents one AI system or materially distinct AI use case.

Columns:

* System name
* Short description
* Business function
* Business owner
* Technical owner
* Status
* Build type
* Deployment context
* Vendor / provider
* Underlying model or tool
* Uses GPAI / LLM
* Uses RAG
* Agentic / tool-calling
* Uses personal data
* Profiles individuals
* Affects decisions about people
* Outputs used in EU
* Risk-domain flags
* Completeness score
* Last updated
* Actions: View / Edit / Delete

Use badges/chips for:

* Production
* Pilot
* Internal
* Vendor
* Commissioned
* Hybrid
* GPAI
* RAG
* Agentic
* Personal Data
* Decision Impact
* EU Output

### 5. Filters

Add filters for:

* Business function
* Status
* Build type
* Deployment context
* Uses GPAI / LLM
* Uses RAG
* Agentic
* Uses personal data
* Affects decisions about people
* Outputs used in EU
* Risk-domain flag
* Completeness status

Also include free-text search across system name, description, vendor, model, and business owner.

### 6. Actions

Add buttons:

* Add AI System
* Export CSV
* Clear Filters

## Add AI System wizard

Create a multi-step wizard for adding a system.

The wizard should use plain English. The user may not understand legal or technical jargon.

Each question should allow “Not sure” where appropriate.

## Wizard Step 1 — Basic Information

Fields:

1. System name
   Free text. Required.

2. Short description
   Free text. Required.

3. Business function
   Dropdown:

   * HR
   * Legal
   * Compliance
   * Risk
   * Finance
   * Customer Service
   * Sales / Marketing
   * Product
   * Operations
   * IT / Engineering
   * Research / Data Science
   * Other
   * Not sure

4. Business owner
   Free text.

5. Technical owner
   Free text.

6. Current status
   Dropdown:

   * Idea
   * Pilot
   * Production
   * Retired
   * Not sure

7. Countries where the system is used
   Multi-value text field or simple free text.

8. Are the system outputs used in the EU?
   Options:

   * Yes
   * No
   * Not sure

## Wizard Step 2 — Use Case

Fields:

1. Who uses the system?
   Multi-select:

   * Employees
   * Contractors
   * Customers
   * Clients
   * Public users
   * Business partners
   * Other systems / automated processes
   * Not sure

2. Who may be affected by the system’s outputs?
   Multi-select:

   * Employees
   * Job applicants
   * Customers
   * Borrowers / applicants for credit
   * Patients
   * Students
   * Insured persons
   * Public users
   * No identifiable individuals
   * Not sure
   * Other

3. Deployment context
   Dropdown:

   * Internal only
   * Employee-facing
   * Customer-facing
   * Client-facing
   * Public-facing
   * Used by other systems
   * Not sure

4. What does the system produce?
   Multi-select:

   * Prediction
   * Score
   * Classification
   * Recommendation
   * Ranking
   * Decision
   * Text content
   * Image / audio / video content
   * Summary
   * Action in another system
   * Other
   * Not sure

5. Does the system make or influence decisions about people?
   Options:

   * Yes
   * No
   * Not sure

6. Can a human review or override the output?
   Options:

   * Yes
   * No
   * Not sure
   * Not applicable

7. What happens if the system output is wrong?
   Dropdown:

   * Low impact
   * Medium impact
   * High impact
   * Not sure

8. Notes on use case
   Free text.

## Wizard Step 3 — Technical Profile

Fields:

1. What kind of system is this?
   Multi-select:

   * Deterministic rules engine
   * Statistical model
   * Machine learning model
   * Generative AI
   * General-purpose AI / foundation model
   * RAG system
   * Agentic workflow
   * Chatbot
   * Recommender system
   * Biometric system
   * Not sure
   * Other

2. How is the decision logic created?
   Dropdown:

   * Fully hand-written business rules
   * Hand-written rules informed by data analysis
   * Statistical model with estimated coefficients
   * Machine learning model trained on data
   * General-purpose AI / LLM
   * Hybrid: rules plus model
   * Not sure

3. Are learned, estimated, or trained parameters used directly in production?
   Options:

   * Yes
   * No
   * Not sure
   * Not applicable

4. Underlying model, tool, or platform
   Free text. Examples: GPT-4, Claude, Gemini, Mistral, Llama, XGBoost, logistic regression, Microsoft Copilot, Salesforce Einstein.

5. Model provider
   Free text.

6. Does the system use a general-purpose AI model or large language model?
   Options:

   * Yes
   * No
   * Not sure

7. Does the system use retrieval augmented generation, RAG, or internal-document search?
   Options:

   * Yes
   * No
   * Not sure

8. Can the system call tools, APIs, databases, or other software systems?
   Options:

   * Yes
   * No
   * Not sure

9. Can the system take actions in another system?
   Options:

   * Yes
   * No
   * Not sure

10. Does the system generate text, image, audio, or video content?
    Options:

* Yes
* No
* Not sure

11. Does the system interact directly with natural persons, such as employees, customers, candidates, or public users?
    Options:

* Yes
* No
* Not sure

## Wizard Step 4 — Data and People

Fields:

1. Does the system use personal data?
   Options:

   * Yes
   * No
   * Not sure

2. Does the system use sensitive or special-category data?
   Options:

   * Yes
   * No
   * Not sure

3. Does the system profile individuals?
   Tooltip:

   > Profiling means using data about a person to evaluate or predict aspects of their life, behaviour, work performance, preferences, reliability, health, economic situation, location, or movement.
   > Options:

   * Yes
   * No
   * Not sure

4. What types of data does the system use?
   Multi-select:

   * Customer data
   * Employee data
   * Candidate / applicant data
   * Financial data
   * Health data
   * Biometric data
   * Behavioural data
   * Public data
   * Internal documents
   * Transaction data
   * No personal data
   * Not sure
   * Other

5. Data notes
   Free text.

## Wizard Step 5 — Build / Vendor / Supply Chain

Fields:

1. How was the system obtained or built?
   Dropdown:

   * Built internally
   * Bought/licensed from vendor
   * Commissioned from external developer
   * Hybrid: internal plus vendor
   * Open-source component
   * Not sure

2. Vendor name
   Free text.

3. Vendor country
   Free text.

4. Model provider name, if different from vendor
   Free text.

5. Model provider country
   Free text.

6. Is the system offered, used, or branded under your organisation’s name?
   Options:

   * Yes
   * No
   * Not sure

7. Is another company’s name or brand visible as provider/vendor?
   Options:

   * Yes
   * No
   * Not sure

8. Has the system been modified, fine-tuned, rebranded, or repurposed by your organisation?
   Options:

   * Yes
   * No
   * Not sure

9. Supply chain notes
   Free text.

## Wizard Step 6 — Risk-Domain Flags

Ask the user to select any areas where the system is used.

Multi-select:

* Recruitment or hiring
* Employee management, promotion, termination, task allocation, or performance monitoring
* Creditworthiness, lending, credit scoring, or loan approval
* Fraud detection
* Life insurance or health insurance pricing/risk assessment
* Education or vocational training
* Access to essential public or private services
* Biometrics
* Emotion recognition
* Critical infrastructure
* Law enforcement
* Migration, asylum, or border control
* Legal interpretation, justice, or dispute resolution
* Democratic processes, elections, or political campaigning
* Customer service or customer interaction
* Marketing or content generation
* Internal productivity only
* Software development
* Other
* Not sure

These are only flags. Do not classify high-risk status yet.

## Wizard Step 7 — Review

Show a review screen with all entered data.

Buttons:

* Save system
* Back
* Cancel

After saving, redirect to the inventory table.

## Edit AI System page

The edit page should allow users to update all fields from the wizard.

## System detail page

The system detail page should show:

* Overview
* Use case
* Technical profile
* Data and people
* Build/vendor/supply chain
* Risk-domain flags
* Notes

Also show a simple completeness score.

## Completeness score

Calculate a basic inventory completeness score.

Required fields:

* system_name
* short_description
* business_function
* status
* deployment_context
* vendor_internal_type
* output types
* decision impact
* uses personal data
* uses GPAI
* risk-domain flags

Score:

* High completeness: 80-100%
* Medium completeness: 50-79%
* Low completeness: below 50%

Show missing key fields.

## Data model

Create a Prisma model for AISystem.

Suggested fields:

* id
* systemName
* shortDescription
* businessFunction
* businessOwner
* technicalOwner
* status
* countriesUsed
* outputsUsedInEu
* users
* affectedPersons
* deploymentContext
* outputTypes
* affectsDecisionsAboutPeople
* humanReviewOrOverride
* impactIfWrong
* useCaseNotes
* systemTypes
* decisionLogicType
* learnedParametersUsedInProduction
* underlyingModelOrTool
* modelProvider
* usesGpaiOrLlm
* usesRag
* canCallToolsOrApis
* canTakeActions
* generatesContent
* interactsDirectlyWithPeople
* usesPersonalData
* usesSensitiveData
* profilesIndividuals
* dataTypes
* dataNotes
* buildType
* vendorName
* vendorCountry
* modelProviderName
* modelProviderCountry
* brandedUnderOrganisationName
* vendorBrandVisible
* modifiedFineTunedRebrandedOrRepurposed
* supplyChainNotes
* riskDomainFlags
* completenessScore
* createdAt
* updatedAt

For fields with multiple values, use JSON arrays if using SQLite.

## Seed data

Create five example systems:

1. ChatGPT Enterprise for internal drafting
2. Customer support chatbot
3. Vendor CV screening tool
4. Internal credit scoring model
5. Internal policy RAG assistant

The seed data should demonstrate different combinations of GPAI, RAG, vendor, internal, personal data, and decision impact.

## CSV export

Export the inventory table to CSV with all key fields.

## Visual style

Use a clean professional consulting-dashboard style.

Prioritise:

* clarity
* readable tables
* simple badges
* plain English
* no legal jargon in the inventory module

## Important constraints

Do not implement legal classification yet.

Do not output:

* provider
* deployer
* importer
* distributor
* high-risk
* prohibited
* Article 50
* obligations

Those are future modules.

This module should only capture the inventory information needed for later classification.

## Acceptance criteria

The module is complete when:

1. User can view the AI Inventory page.
2. User can add a new AI system through a multi-step wizard.
3. User can edit an existing AI system.
4. User can delete a system.
5. User can view all systems in a dynamic table.
6. User can filter and search systems.
7. User can see summary cards.
8. User can export the inventory to CSV.
9. User can open a system detail page.
10. User can see completeness score and missing fields.
11. Data persists locally.
12. App runs locally without external APIs.
13. The code is modular enough to add entity type classification later.
