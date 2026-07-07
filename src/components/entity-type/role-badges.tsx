import { cn } from "@/lib/utils";
import type { ConfidenceLabel } from "@/lib/entity-type/roleRules";

const ROLE_CLASSES = "bg-blue-100 text-blue-800 border-blue-200";
const POSSIBLE_ROLE_CLASSES = "bg-slate-100 text-slate-700 border-slate-200";

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", className)}>
      {label}
    </span>
  );
}

export function RoleBadges({ likelyRoles, possibleRoles }: { likelyRoles: string[]; possibleRoles: string[] }) {
  if (likelyRoles.length === 0 && possibleRoles.length === 0) {
    return <span className="text-xs text-slate-400">Not assessed</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {likelyRoles.map((r) => <Badge key={`l-${r}`} label={r} className={ROLE_CLASSES} />)}
      {possibleRoles.map((r) => <Badge key={`p-${r}`} label={`Possible: ${r}`} className={POSSIBLE_ROLE_CLASSES} />)}
    </div>
  );
}

const CONFIDENCE_CLASSES: Record<ConfidenceLabel, string> = {
  high: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-orange-100 text-orange-800 border-orange-200",
  insufficient_information: "bg-red-100 text-red-700 border-red-200",
};

const CONFIDENCE_LABELS: Record<ConfidenceLabel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  insufficient_information: "Insufficient info",
};

export function ConfidenceBadge({ label }: { label: ConfidenceLabel }) {
  return <Badge label={CONFIDENCE_LABELS[label]} className={CONFIDENCE_CLASSES[label]} />;
}

export function Article25Badge({ atRisk }: { atRisk: boolean }) {
  if (!atRisk) return <span className="text-xs text-slate-300">-</span>;
  return <Badge label="Article 25 risk" className="bg-purple-100 text-purple-800 border-purple-200" />;
}
