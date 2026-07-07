"use client";

import { SelectField, TextField, TextAreaField } from "./fields";
import { BUILD_TYPES, YES_NO_NOT_SURE } from "@/lib/options";

export function Step5BuildVendor() {
  return (
    <div className="space-y-5">
      <SelectField name="buildType" label="How was the system obtained or built?" options={BUILD_TYPES} tooltip="Drives the provider-vs-deployer role assessment: building internally points to 'provider'; buying/licensing points to 'deployer'. Hybrids can be both." />
      <TextField name="vendorName" label="Vendor name" placeholder="e.g. Microsoft, Salesforce, OpenAI" />
      <TextField name="vendorCountry" label="Vendor country" placeholder="e.g. United States, Ireland" />
      <TextField name="modelProviderName" label="Model provider name (if different from vendor)" placeholder="e.g. OpenAI, Anthropic" />
      <TextField name="modelProviderCountry" label="Model provider country" placeholder="e.g. United States" />
      <SelectField
        name="brandedUnderOrganisationName"
        label="Is the system offered, used, or branded under your organisation's name?"
        options={YES_NO_NOT_SURE}
        tooltip="Putting your own name or trademark on a third-party AI system can make you its provider for AI Act purposes even if you did not build it (Article 25(1)(a))."
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
        tooltip="Substantial modification or a purpose change of a (high-risk) system can convert you into its provider with the full provider obligation set (Article 25) — screened in the Reclassification module."
      />
      <TextAreaField name="supplyChainNotes" label="Supply chain notes" placeholder="Any additional notes about how the system was built or sourced" />
    </div>
  );
}
