"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { downloadPortfolioCSV } from "@/lib/report/csv";
import type { RegisterRow, ReportOptions } from "@/lib/report/reportRules";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

function Select({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 text-xs border border-slate-200 rounded-md bg-white px-2"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/** Scoping/audience controls (searchParams-driven — presentation only), CSV + print. */
export function ReportControls({ options, register }: { options: ReportOptions; register: RegisterRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function set(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`/report?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 print-hide">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 items-end">
        <Select
          label="Systems covered"
          value={options.scope}
          onChange={(v) => set("scope", v)}
          options={[
            { value: "all", label: "All systems" },
            { value: "high-risk", label: "High-risk only" },
            { value: "provider", label: "By role: Provider" },
            { value: "deployer", label: "By role: Deployer" },
          ]}
        />
        <Select
          label="Non-final guidance"
          value={options.badgeMode}
          onChange={(v) => set("badge", v)}
          options={[
            { value: "include_and_badge", label: "Include and badge (recommended)" },
            { value: "include_without_badge", label: "Include without badge" },
            { value: "exclude_non_final", label: "Exclude non-final rules" },
          ]}
        />
        <Select
          label="Audience"
          value={options.audience}
          onChange={(v) => set("audience", v)}
          options={[
            { value: "internal", label: "Internal compliance" },
            { value: "board", label: "Board / executive" },
            { value: "auditor", label: "External auditor / regulator" },
          ]}
        />
        <Select
          label="Remediation detail"
          value={options.remediationDetail}
          onChange={(v) => set("remediation", v)}
          options={[
            { value: "full", label: "Full remediation plan" },
            { value: "summary", label: "Progress summary only" },
          ]}
        />
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadPortfolioCSV(register)}>
          <Download className="w-3.5 h-3.5" /> Portfolio CSV
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
        </Button>
      </div>
      {options.badgeMode === "exclude_non_final" && (
        <p className="text-xs text-amber-700 mt-2">
          Non-final rules are excluded from the register — this risks under-stating future duties. The
          draft/provisional-guidance appendix still lists them.
        </p>
      )}
    </div>
  );
}
