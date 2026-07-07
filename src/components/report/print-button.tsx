"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button size="sm" variant="outline" className="gap-1.5 print-hide shrink-0" onClick={() => window.print()}>
      <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
    </Button>
  );
}
