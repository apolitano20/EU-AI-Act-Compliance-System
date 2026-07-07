"use client";

import { SelectField, MultiSelectField, TextAreaField } from "./fields";
import { YES_NO_NOT_SURE, DATA_TYPES } from "@/lib/options";

export function Step4DataPeople() {
  return (
    <div className="space-y-5">
      <SelectField name="usesPersonalData" label="Does the system use personal data?" options={YES_NO_NOT_SURE} />
      <SelectField name="usesSensitiveData" label="Does the system use sensitive or special-category data?" options={YES_NO_NOT_SURE} tooltip="GDPR special categories: health, biometric or genetic data, racial/ethnic origin, political opinions, religion, trade-union membership, sex life or sexual orientation. Inferring these via biometrics can be a prohibited practice (Art 5(1)(g))." />
      <SelectField
        name="profilesIndividuals"
        label="Does the system profile individuals?"
        options={YES_NO_NOT_SURE}
      />
      <p className="text-xs text-slate-500 -mt-3 ml-0.5 italic">
        Profiling means using data about a person to evaluate or predict aspects of their life, behaviour, work performance, preferences, reliability, health, economic situation, location, or movement.
      </p>
      <MultiSelectField name="dataTypes" label="What types of data does the system use?" options={DATA_TYPES} tooltip="'Biometric data' (faces, voices, fingerprints, gait) switches on the biometric prohibitions and high-risk screening — answer it explicitly rather than leaving it blank." />
      <TextAreaField name="dataNotes" label="Data notes" placeholder="Any additional notes about data used by this system" />
    </div>
  );
}
