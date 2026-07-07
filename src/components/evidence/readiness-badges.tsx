import { cn } from "@/lib/utils";
import { READINESS_STATUS_LABELS, type ReadinessStatus } from "@/lib/evidence/evidenceRules";

const CLASSES: Record<ReadinessStatus, string> = {
  evidence_in_place: "bg-green-100 text-green-800 border-green-200",
  partial_evidence: "bg-yellow-100 text-yellow-800 border-yellow-200",
  evidence_gap: "bg-red-100 text-red-700 border-red-200",
  not_started: "bg-orange-100 text-orange-800 border-orange-200",
  unknown_evidence_state: "bg-amber-100 text-amber-800 border-amber-200",
  not_applicable: "bg-slate-100 text-slate-600 border-slate-200",
};

export function ReadinessStatusBadge({ status }: { status: ReadinessStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap", CLASSES[status])}>
      {READINESS_STATUS_LABELS[status]}
    </span>
  );
}
