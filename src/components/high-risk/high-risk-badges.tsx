import { cn } from "@/lib/utils";
import type { HighRiskStatus } from "@/lib/high-risk/rules";

const STATUS_CLASSES: Record<HighRiskStatus, string> = {
  likely_high_risk: "bg-red-100 text-red-800 border-red-200",
  possibly_high_risk: "bg-orange-100 text-orange-800 border-orange-200",
  needs_review: "bg-amber-100 text-amber-800 border-amber-200",
  likely_not_high_risk: "bg-green-100 text-green-800 border-green-200",
  not_high_risk_carve_out: "bg-blue-100 text-blue-800 border-blue-200",
  not_assessed_excluded: "bg-slate-100 text-slate-600 border-slate-200",
};

export const HIGH_RISK_STATUS_LABELS: Record<HighRiskStatus, string> = {
  likely_high_risk: "Likely high-risk",
  possibly_high_risk: "Possibly high-risk",
  needs_review: "Needs review",
  likely_not_high_risk: "Likely not high-risk",
  not_high_risk_carve_out: "Not high-risk (Art 6(3) carve-out)",
  not_assessed_excluded: "Not assessed (excluded/prohibited)",
};

export function HighRiskStatusBadge({ status }: { status: HighRiskStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_CLASSES[status])}>
      {HIGH_RISK_STATUS_LABELS[status]}
    </span>
  );
}
