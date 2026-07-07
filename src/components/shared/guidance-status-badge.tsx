import { cn } from "@/lib/utils";
import type { GuidanceStatus } from "@/lib/assessment-shared";

const CLASSES: Record<GuidanceStatus, string> = {
  final: "bg-green-50 text-green-700 border-green-200",
  provisional: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-orange-50 text-orange-700 border-orange-200",
};

const LABELS: Record<GuidanceStatus, string> = {
  final: "Final",
  provisional: "Provisional",
  draft: "Draft",
};

/**
 * Badge marking whether a rule rests on final law or on draft/provisional
 * guidance (May 2026 Digital Omnibus, 2026-05-19 draft high-risk guidelines).
 */
export function GuidanceStatusBadge({ status, className }: { status: GuidanceStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border", CLASSES[status], className)}>
      {LABELS[status]}
    </span>
  );
}
