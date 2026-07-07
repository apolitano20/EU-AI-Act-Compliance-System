import { cn } from "@/lib/utils";
import type { ProhibitedStatus } from "@/lib/prohibited/rules";

const STATUS_CLASSES: Record<ProhibitedStatus, string> = {
  likely_prohibited: "bg-red-100 text-red-800 border-red-200",
  possibly_prohibited: "bg-orange-100 text-orange-800 border-orange-200",
  needs_review: "bg-amber-100 text-amber-800 border-amber-200",
  likely_not_prohibited: "bg-green-100 text-green-800 border-green-200",
  not_assessed_excluded: "bg-slate-100 text-slate-600 border-slate-200",
};

export const PROHIBITED_STATUS_LABELS: Record<ProhibitedStatus, string> = {
  likely_prohibited: "Likely prohibited practice",
  possibly_prohibited: "Possibly prohibited",
  needs_review: "Needs review",
  likely_not_prohibited: "Likely not prohibited",
  not_assessed_excluded: "Not assessed (excluded)",
};

export function ProhibitedStatusBadge({ status }: { status: ProhibitedStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_CLASSES[status])}>
      {PROHIBITED_STATUS_LABELS[status]}
    </span>
  );
}
