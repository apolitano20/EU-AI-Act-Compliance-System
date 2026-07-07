import { cn } from "@/lib/utils";
import type { ConfidenceLabel } from "@/lib/assessment-shared";

const CLASSES: Record<ConfidenceLabel, string> = {
  high: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-orange-100 text-orange-800 border-orange-200",
  insufficient_information: "bg-red-100 text-red-700 border-red-200",
};

const LABELS: Record<ConfidenceLabel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  insufficient_information: "Insufficient info",
};

export function ConfidenceBadge({ label }: { label: ConfidenceLabel }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", CLASSES[label])}>
      {LABELS[label]}
    </span>
  );
}
