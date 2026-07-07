import { cn } from "@/lib/utils";
import type { AiDefinitionClassification, ConfidenceLabel } from "@/lib/ai-system-definition/definitionRules";

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", className)}>
      {label}
    </span>
  );
}

const STATUS_CLASSES: Record<AiDefinitionClassification, string> = {
  likely_ai_system: "bg-blue-100 text-blue-800 border-blue-200",
  possible_ai_system_needs_review: "bg-amber-100 text-amber-800 border-amber-200",
  likely_not_ai_system: "bg-slate-100 text-slate-700 border-slate-200",
  insufficient_information: "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_LABELS: Record<AiDefinitionClassification, string> = {
  likely_ai_system: "Likely AI system",
  possible_ai_system_needs_review: "Possible AI system / needs review",
  likely_not_ai_system: "Likely not an AI system",
  insufficient_information: "Insufficient information",
};

export function AiDefinitionStatusBadge({ classification }: { classification: AiDefinitionClassification }) {
  return <Badge label={STATUS_LABELS[classification]} className={STATUS_CLASSES[classification]} />;
}

const CONFIDENCE_CLASSES: Record<ConfidenceLabel, string> = {
  high: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-orange-100 text-orange-800 border-orange-200",
  insufficient_information: "bg-red-100 text-red-700 border-red-200",
};

const CONFIDENCE_LABELS: Record<ConfidenceLabel, string> = {
  high: "High", medium: "Medium", low: "Low", insufficient_information: "Insufficient info",
};

export function ConfidenceBadge({ label }: { label: ConfidenceLabel }) {
  return <Badge label={CONFIDENCE_LABELS[label]} className={CONFIDENCE_CLASSES[label]} />;
}
