"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sentinel value for "no filter" — shared by all table filter dropdowns.
export const ALL = "__all__";

export function SelectFilter({
  label, value, options, display, onChange,
}: {
  label: string; value: string;
  options: readonly string[]; display?: (v: string) => string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? ALL)}>
      <SelectTrigger className="h-8 text-xs w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{display ? display(o) : o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
