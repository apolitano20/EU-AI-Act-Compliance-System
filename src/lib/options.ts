// Single source of truth for all dropdown/multiselect options used across the app.

export const BUSINESS_FUNCTIONS = [
  "HR", "Legal", "Compliance", "Risk", "Finance", "Customer Service",
  "Sales / Marketing", "Product", "Operations", "IT / Engineering",
  "Research / Data Science", "Other", "Not sure",
] as const;

export const STATUSES = ["Idea", "Pilot", "Production", "Retired", "Not sure"] as const;

export const DEPLOYMENT_CONTEXTS = [
  "Internal only", "Employee-facing", "Customer-facing", "Client-facing",
  "Public-facing", "Used by other systems", "Not sure",
] as const;

export const YES_NO_NOT_SURE = ["Yes", "No", "Not sure"] as const;
export const YES_NO_NOT_SURE_NA = ["Yes", "No", "Not sure", "Not applicable"] as const;

export const USER_GROUPS = [
  "Employees", "Contractors", "Customers", "Clients", "Public users",
  "Business partners", "Other systems / automated processes", "Not sure",
] as const;

export const AFFECTED_PERSONS = [
  "Employees", "Job applicants", "Customers", "Borrowers / applicants for credit",
  "Patients", "Students", "Insured persons", "Public users",
  "No identifiable individuals", "Not sure", "Other",
] as const;

export const OUTPUT_TYPES = [
  "Prediction", "Score", "Classification", "Recommendation", "Ranking",
  "Decision", "Text content", "Image / audio / video content", "Summary",
  "Action in another system", "Other", "Not sure",
] as const;

export const IMPACT_IF_WRONG = ["Low impact", "Medium impact", "High impact", "Not sure"] as const;

export const SYSTEM_TYPES = [
  "Deterministic rules engine", "Statistical model", "Machine learning model",
  "Generative AI", "General-purpose AI / foundation model", "RAG system",
  "Agentic workflow", "Chatbot", "Recommender system", "Biometric system",
  "Not sure", "Other",
] as const;

export const DECISION_LOGIC_TYPES = [
  "Fully hand-written business rules",
  "Hand-written rules informed by data analysis",
  "Statistical model with estimated coefficients",
  "Machine learning model trained on data",
  "General-purpose AI / LLM",
  "Hybrid: rules plus model",
  "Not sure",
] as const;

export const DATA_TYPES = [
  "Customer data", "Employee data", "Candidate / applicant data",
  "Financial data", "Health data", "Biometric data", "Behavioural data",
  "Public data", "Internal documents", "Transaction data",
  "No personal data", "Not sure", "Other",
] as const;

export const BUILD_TYPES = [
  "Built internally", "Bought/licensed from vendor",
  "Commissioned from external developer", "Hybrid: internal plus vendor",
  "Open-source component", "Not sure",
] as const;

export const RISK_DOMAIN_FLAGS = [
  "Recruitment or hiring",
  "Employee management, promotion, termination, task allocation, or performance monitoring",
  "Creditworthiness, lending, credit scoring, or loan approval",
  "Fraud detection",
  "Life insurance or health insurance pricing/risk assessment",
  "Education or vocational training",
  "Access to essential public or private services",
  "Biometrics",
  "Emotion recognition",
  "Critical infrastructure",
  "Law enforcement",
  "Migration, asylum, or border control",
  "Legal interpretation, justice, or dispute resolution",
  "Democratic processes, elections, or political campaigning",
  "Compliance or regulatory support",
  "Customer service or customer interaction",
  "Marketing or content generation",
  "Internal productivity only",
  "Software development",
  "Other",
  "Not sure",
] as const;

// Badge config for rendering chips in the table and detail view
export const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  Production:      { label: "Production",     className: "bg-green-100 text-green-800 border-green-200" },
  Pilot:           { label: "Pilot",           className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  Idea:            { label: "Idea",            className: "bg-slate-100 text-slate-700 border-slate-200" },
  Retired:         { label: "Retired",         className: "bg-red-100 text-red-700 border-red-200" },
  Internal:        { label: "Internal",        className: "bg-blue-100 text-blue-800 border-blue-200" },
  Vendor:          { label: "Vendor",          className: "bg-purple-100 text-purple-800 border-purple-200" },
  Commissioned:    { label: "Commissioned",   className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  Hybrid:          { label: "Hybrid",          className: "bg-orange-100 text-orange-800 border-orange-200" },
  GPAI:            { label: "GPAI / LLM",     className: "bg-violet-100 text-violet-800 border-violet-200" },
  RAG:             { label: "RAG",             className: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  Agentic:         { label: "Agentic",         className: "bg-amber-100 text-amber-800 border-amber-200" },
  "Personal Data": { label: "Personal Data",  className: "bg-rose-100 text-rose-800 border-rose-200" },
  "Decision Impact": { label: "Decision Impact", className: "bg-red-100 text-red-800 border-red-200" },
  "EU Output":     { label: "EU Output",       className: "bg-teal-100 text-teal-800 border-teal-200" },
};
