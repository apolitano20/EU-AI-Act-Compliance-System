"use client";

import { useFormContext, Controller } from "react-hook-form";
import type { AISystemFormData } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type FieldName = keyof AISystemFormData;

function FieldLabel({ label, required, tooltip, htmlFor }: {
  label: string; required?: boolean; tooltip?: string; htmlFor?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function TextField({ name, label, required, placeholder, tooltip }: {
  name: FieldName; label: string; required?: boolean; placeholder?: string; tooltip?: string;
}) {
  const { register, formState: { errors } } = useFormContext<AISystemFormData>();
  const error = errors[name]?.message as string | undefined;
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={name} label={label} required={required} tooltip={tooltip} />
      <Input id={name} {...register(name)} placeholder={placeholder} className={error ? "border-red-400" : ""} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function TextAreaField({ name, label, placeholder, tooltip }: {
  name: FieldName; label: string; placeholder?: string; tooltip?: string;
}) {
  const { register } = useFormContext<AISystemFormData>();
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={name} label={label} tooltip={tooltip} />
      <Textarea id={name} {...register(name)} placeholder={placeholder} rows={3} />
    </div>
  );
}

export function SelectField({ name, label, options, tooltip }: {
  name: FieldName; label: string; options: readonly string[]; tooltip?: string;
}) {
  const { control } = useFormContext<AISystemFormData>();
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} tooltip={tooltip} />
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={(field.value as string) ?? ""} onValueChange={(v) => v !== null && field.onChange(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

export function MultiSelectField({ name, label, options, tooltip }: {
  name: FieldName; label: string; options: readonly string[]; tooltip?: string;
}) {
  const { control } = useFormContext<AISystemFormData>();
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} tooltip={tooltip} />
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const current: string[] = Array.isArray(field.value) ? (field.value as string[]) : [];
          function toggle(option: string) {
            const next = current.includes(option)
              ? current.filter((v) => v !== option)
              : [...current, option];
            field.onChange(next);
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-1">
              {options.map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900 py-0.5">
                  <Checkbox
                    checked={current.includes(o)}
                    onCheckedChange={() => toggle(o)}
                    className="shrink-0"
                  />
                  {o}
                </label>
              ))}
            </div>
          );
        }}
      />
    </div>
  );
}

export function TagsField({ name, label, placeholder, tooltip }: {
  name: FieldName; label: string; placeholder?: string; tooltip?: string;
}) {
  // Simple comma-separated text -> array storage
  const { control } = useFormContext<AISystemFormData>();
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} tooltip={tooltip} />
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const current: string[] = Array.isArray(field.value) ? (field.value as string[]) : [];
          return (
            <Input
              value={current.join(", ")}
              onChange={(e) => {
                const raw = e.target.value;
                field.onChange(raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : []);
              }}
              placeholder={placeholder ?? "Separate multiple with commas"}
            />
          );
        }}
      />
    </div>
  );
}
