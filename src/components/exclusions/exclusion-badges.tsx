import { cn } from "@/lib/utils";
import type { ExclusionStatus } from "@/lib/exclusions/exclusionRules";

const STATUS_CLASSES: Record<ExclusionStatus, string> = {
  likely_excluded: "bg-slate-100 text-slate-700 border-slate-200",
  possibly_excluded_partial_conditional: "bg-amber-100 text-amber-800 border-amber-200",
  likely_not_excluded: "bg-blue-100 text-blue-800 border-blue-200",
  needs_review: "bg-red-100 text-red-700 border-red-200",
};

export const EXCLUSION_STATUS_LABELS: Record<ExclusionStatus, string> = {
  likely_excluded: "Likely excluded",
  possibly_excluded_partial_conditional: "Possibly excluded (partial/conditional)",
  likely_not_excluded: "Likely not excluded",
  needs_review: "Needs review",
};

export function ExclusionStatusBadge({ status }: { status: ExclusionStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_CLASSES[status])}>
      {EXCLUSION_STATUS_LABELS[status]}
    </span>
  );
}
