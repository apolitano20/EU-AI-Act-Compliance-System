"use client";

import { SelectField, MultiSelectField, TextAreaField } from "./fields";
import {
  USER_GROUPS, AFFECTED_PERSONS, DEPLOYMENT_CONTEXTS,
  OUTPUT_TYPES, YES_NO_NOT_SURE, YES_NO_NOT_SURE_NA, IMPACT_IF_WRONG,
} from "@/lib/options";

export function Step2UseCase() {
  return (
    <div className="space-y-5">
      <MultiSelectField name="users" label="Who uses the system?" options={USER_GROUPS} />
      <MultiSelectField name="affectedPersons" label="Who may be affected by the system's outputs?" options={AFFECTED_PERSONS} />
      <SelectField name="deploymentContext" label="Deployment context" options={DEPLOYMENT_CONTEXTS} />
      <MultiSelectField name="outputTypes" label="What does the system produce?" options={OUTPUT_TYPES} />
      <SelectField name="affectsDecisionsAboutPeople" label="Does the system make or influence decisions about people?" options={YES_NO_NOT_SURE} />
      <SelectField name="humanReviewOrOverride" label="Can a human review or override the output?" options={YES_NO_NOT_SURE_NA} />
      <SelectField name="impactIfWrong" label="What happens if the system output is wrong?" options={IMPACT_IF_WRONG} />
      <TextAreaField name="useCaseNotes" label="Notes on use case" placeholder="Any additional context about how this system is used" />
    </div>
  );
}
