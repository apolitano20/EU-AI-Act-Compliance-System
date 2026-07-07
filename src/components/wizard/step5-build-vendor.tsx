"use client";

import { SelectField, TextField, TextAreaField } from "./fields";
import { BUILD_TYPES, YES_NO_NOT_SURE } from "@/lib/options";

export function Step5BuildVendor() {
  return (
    <div className="space-y-5">
      <SelectField name="buildType" label="How was the system obtained or built?" options={BUILD_TYPES} />
      <TextField name="vendorName" label="Vendor name" placeholder="e.g. Microsoft, Salesforce, OpenAI" />
      <TextField name="vendorCountry" label="Vendor country" placeholder="e.g. United States, Ireland" />
      <TextField name="modelProviderName" label="Model provider name (if different from vendor)" placeholder="e.g. OpenAI, Anthropic" />
      <TextField name="modelProviderCountry" label="Model provider country" placeholder="e.g. United States" />
      <SelectField
        name="brandedUnderOrganisationName"
        label="Is the system offered, used, or branded under your organisation's name?"
        options={YES_NO_NOT_SURE}
      />
      <SelectField
        name="vendorBrandVisible"
        label="Is another company's name or brand visible as provider/vendor?"
        options={YES_NO_NOT_SURE}
      />
      <SelectField
        name="modifiedFineTunedRebrandedOrRepurposed"
        label="Has the system been modified, fine-tuned, rebranded, or repurposed by your organisation?"
        options={YES_NO_NOT_SURE}
      />
      <TextAreaField name="supplyChainNotes" label="Supply chain notes" placeholder="Any additional notes about how the system was built or sourced" />
    </div>
  );
}
