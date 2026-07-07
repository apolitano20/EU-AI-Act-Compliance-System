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
      <MultiSelectField name="affectedPersons" label="Who may be affected by the system's outputs?" options={AFFECTED_PERSONS} tooltip="People the outputs are used ON, not just users — e.g. candidates ranked by a CV screener, customers scored for credit. Drives vulnerability and high-risk screening." />
      <SelectField name="deploymentContext" label="Deployment context" options={DEPLOYMENT_CONTEXTS} tooltip="Where the system is used matters: workplace and education settings trigger the emotion-recognition prohibition (Art 5(1)(f)); public-facing use affects transparency duties (Art 50)." />
      <MultiSelectField name="outputTypes" label="What does the system produce?" options={OUTPUT_TYPES} />
      <SelectField name="affectsDecisionsAboutPeople" label="Does the system make or influence decisions about people?" options={YES_NO_NOT_SURE} tooltip="Includes recommending, ranking, scoring or filtering that a human then acts on — not only fully automated decisions. Central to the AI-system definition gate and high-risk classification." />
      <SelectField name="humanReviewOrOverride" label="Can a human review or override the output?" options={YES_NO_NOT_SURE_NA} tooltip="'Yes' means a person can meaningfully check and change the outcome before it takes effect — a rubber-stamp does not count. Relevant to human-oversight duties (Art 14/26) and the Art 6(3) carve-out." />
      <SelectField name="impactIfWrong" label="What happens if the system output is wrong?" options={IMPACT_IF_WRONG} tooltip="Think worst realistic case for a person affected: losing a job offer, a loan, benefits, or access to services is high impact; a badly drafted internal email is low impact." />
      <TextAreaField name="useCaseNotes" label="Notes on use case" placeholder="Any additional context about how this system is used" />
    </div>
  );
}
