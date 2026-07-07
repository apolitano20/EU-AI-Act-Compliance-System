import { cn } from "@/lib/utils";

interface Props {
  score: number;
  band: "High" | "Medium" | "Low";
}

export function CompletenessBadge({ score, band }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        band === "High"   && "bg-green-50 text-green-700 border-green-200",
        band === "Medium" && "bg-yellow-50 text-yellow-700 border-yellow-200",
        band === "Low"    && "bg-red-50 text-red-700 border-red-200"
      )}
    >
      {score}%
    </span>
  );
}
