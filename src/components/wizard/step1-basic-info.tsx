"use client";

import { TextField, SelectField, TagsField } from "./fields";
import { BUSINESS_FUNCTIONS, STATUSES, YES_NO_NOT_SURE } from "@/lib/options";

export function Step1BasicInfo() {
  return (
    <div className="space-y-5">
      <TextField name="systemName" label="System name" required placeholder="e.g. ChatGPT Enterprise for internal drafting" />
      <TextField name="shortDescription" label="Short description" required placeholder="What does this system do?" />
      <SelectField name="businessFunction" label="Business function" options={BUSINESS_FUNCTIONS} />
      <TextField name="businessOwner" label="Business owner" placeholder="Name or team responsible for this system" />
      <TextField name="technicalOwner" label="Technical owner" placeholder="Name or team that maintains this system" />
      <SelectField name="status" label="Current status" options={STATUSES} tooltip="Lifecycle stage: 'Idea' and pre-market development are treated differently under the Act than systems already in 'Production' (placed on the market / put into service). Pilots may count as real-world testing." />
      <TagsField name="countriesUsed" label="Countries where the system is used" placeholder="e.g. United Kingdom, Germany, France" tooltip="List every country where the system runs or is made available. Any EU/EEA country here is a strong signal the EU AI Act applies (Article 2 scope, assessed in the EU Scope module)." />
      <SelectField name="outputsUsedInEu" label="Are the system outputs used in the EU?" options={YES_NO_NOT_SURE} tooltip="The extraterritorial trigger: even if you and the system sit outside the EU, using its predictions, content, recommendations or decisions inside the EU brings you into scope (Article 2(1)(c))." />
    </div>
  );
}
