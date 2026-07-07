import { cn } from "@/lib/utils";
import type { ScopeStatus } from "@/lib/eu-scope/scopeRules";

const STATUS_CLASSES: Record<ScopeStatus, string> = {
  likely_in_scope: "bg-blue-100 text-blue-800 border-blue-200",
  possibly_in_scope: "bg-amber-100 text-amber-800 border-amber-200",
  likely_out_of_scope: "bg-slate-100 text-slate-700 border-slate-200",
  needs_review: "bg-red-100 text-red-700 border-red-200",
};

export const SCOPE_STATUS_LABELS: Record<ScopeStatus, string> = {
  likely_in_scope: "Likely in scope",
  possibly_in_scope: "Possibly in scope",
  likely_out_of_scope: "Likely out of scope",
  needs_review: "Needs review",
};

export function ScopeStatusBadge({ status }: { status: ScopeStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_CLASSES[status])}>
      {SCOPE_STATUS_LABELS[status]}
    </span>
  );
}
