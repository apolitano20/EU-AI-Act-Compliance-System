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
      <SelectField name="status" label="Current status" options={STATUSES} />
      <TagsField name="countriesUsed" label="Countries where the system is used" placeholder="e.g. United Kingdom, Germany, France" />
      <SelectField name="outputsUsedInEu" label="Are the system outputs used in the EU?" options={YES_NO_NOT_SURE} />
    </div>
  );
}
