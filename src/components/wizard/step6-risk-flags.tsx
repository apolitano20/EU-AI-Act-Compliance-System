"use client";

import { MultiSelectField } from "./fields";
import { RISK_DOMAIN_FLAGS } from "@/lib/options";

export function Step6RiskFlags() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Select any areas where this system is used. These are flags only — legal risk classification happens in a later module.
      </p>
      <MultiSelectField
        name="riskDomainFlags"
        label="Risk-domain areas"
        options={RISK_DOMAIN_FLAGS}
      />
    </div>
  );
}
