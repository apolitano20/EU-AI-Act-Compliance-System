import { cn } from "@/lib/utils";
import { BADGE_CONFIG } from "@/lib/options";

interface ChipProps {
  type: keyof typeof BADGE_CONFIG;
  className?: string;
}

export function Chip({ type, className }: ChipProps) {
  const config = BADGE_CONFIG[type];
  if (!config) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function SystemChips({ system }: { system: {
  status?: string | null;
  buildType?: string | null;
  usesGpaiOrLlm?: string | null;
  usesRag?: string | null;
  canTakeActions?: string | null;
  usesPersonalData?: string | null;
  affectsDecisionsAboutPeople?: string | null;
  outputsUsedInEu?: string | null;
} }) {
  const chips: (keyof typeof BADGE_CONFIG)[] = [];

  if (system.status && ["Production", "Pilot", "Idea", "Retired"].includes(system.status)) {
    chips.push(system.status as keyof typeof BADGE_CONFIG);
  }

  if (system.buildType === "Built internally") chips.push("Internal");
  else if (system.buildType === "Bought/licensed from vendor") chips.push("Vendor");
  else if (system.buildType === "Commissioned from external developer") chips.push("Commissioned");
  else if (system.buildType === "Hybrid: internal plus vendor") chips.push("Hybrid");

  if (system.usesGpaiOrLlm === "Yes") chips.push("GPAI");
  if (system.usesRag === "Yes") chips.push("RAG");
  if (system.canTakeActions === "Yes") chips.push("Agentic");
  if (system.usesPersonalData === "Yes") chips.push("Personal Data");
  if (system.affectsDecisionsAboutPeople === "Yes") chips.push("Decision Impact");
  if (system.outputsUsedInEu === "Yes") chips.push("EU Output");

  return (
    <div className="flex flex-wrap gap-1">
      {chips.map((c) => <Chip key={c} type={c} />)}
    </div>
  );
}
