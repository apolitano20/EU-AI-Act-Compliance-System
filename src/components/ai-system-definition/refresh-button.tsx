"use client";

// The assessment is always computed live from current inventory data, so there is
// nothing to persist — "refresh" just re-fetches the server component's data.
// ponytail: no server round trip needed beyond router.refresh(); add a real
// server action here only if assessments become stored/cached.
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function RefreshAssessmentButton() {
  const router = useRouter();
  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.refresh()}>
      <RefreshCw className="w-3.5 h-3.5" /> Refresh assessment
    </Button>
  );
}
