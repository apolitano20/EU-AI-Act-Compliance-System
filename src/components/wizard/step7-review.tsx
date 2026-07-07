"use client";

import { useFormContext } from "react-hook-form";
import type { AISystemFormData } from "@/lib/schema";

function Row({ label, value }: { label: string; value: unknown }) {
  const display = Array.isArray(value)
    ? (value as string[]).join(", ") || "—"
    : (value as string) || "—";
  return (
    <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-xs text-slate-800">{display}</span>
    </div>
  );
}

export function Step7Review() {
  const { watch } = useFormContext<AISystemFormData>();
  const data = watch();

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Review all information before saving. You can go back to any step to make changes.</p>

      <Section title="Basic Information">
        <Row label="System name" value={data.systemName} />
        <Row label="Short description" value={data.shortDescription} />
        <Row label="Business function" value={data.businessFunction} />
        <Row label="Business owner" value={data.businessOwner} />
        <Row label="Technical owner" value={data.technicalOwner} />
        <Row label="Status" value={data.status} />
        <Row label="Countries used" value={data.countriesUsed} />
        <Row label="Outputs used in EU" value={data.outputsUsedInEu} />
      </Section>

      <Section title="Use Case">
        <Row label="Users" value={data.users} />
        <Row label="Affected persons" value={data.affectedPersons} />
        <Row label="Deployment context" value={data.deploymentContext} />
        <Row label="Output types" value={data.outputTypes} />
        <Row label="Affects decisions about people" value={data.affectsDecisionsAboutPeople} />
        <Row label="Human review or override" value={data.humanReviewOrOverride} />
        <Row label="Impact if wrong" value={data.impactIfWrong} />
        <Row label="Use case notes" value={data.useCaseNotes} />
      </Section>

      <Section title="Technical Profile">
        <Row label="System types" value={data.systemTypes} />
        <Row label="Decision logic type" value={data.decisionLogicType} />
        <Row label="Learned parameters in production" value={data.learnedParametersUsedInProduction} />
        <Row label="Underlying model or tool" value={data.underlyingModelOrTool} />
        <Row label="Model provider" value={data.modelProvider} />
        <Row label="Uses GPAI / LLM" value={data.usesGpaiOrLlm} />
        <Row label="Uses RAG" value={data.usesRag} />
        <Row label="Can call tools / APIs" value={data.canCallToolsOrApis} />
        <Row label="Can take actions" value={data.canTakeActions} />
        <Row label="Generates content" value={data.generatesContent} />
        <Row label="Interacts with people" value={data.interactsDirectlyWithPeople} />
      </Section>

      <Section title="Data and People">
        <Row label="Uses personal data" value={data.usesPersonalData} />
        <Row label="Uses sensitive data" value={data.usesSensitiveData} />
        <Row label="Profiles individuals" value={data.profilesIndividuals} />
        <Row label="Data types" value={data.dataTypes} />
        <Row label="Data notes" value={data.dataNotes} />
      </Section>

      <Section title="Build / Vendor">
        <Row label="Build type" value={data.buildType} />
        <Row label="Vendor name" value={data.vendorName} />
        <Row label="Vendor country" value={data.vendorCountry} />
        <Row label="Model provider name" value={data.modelProviderName} />
        <Row label="Model provider country" value={data.modelProviderCountry} />
        <Row label="Branded under org name" value={data.brandedUnderOrganisationName} />
        <Row label="Vendor brand visible" value={data.vendorBrandVisible} />
        <Row label="Modified / fine-tuned" value={data.modifiedFineTunedRebrandedOrRepurposed} />
        <Row label="Supply chain notes" value={data.supplyChainNotes} />
      </Section>

      <Section title="Risk-Domain Flags">
        <Row label="Risk-domain areas" value={data.riskDomainFlags} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
      <div className="bg-slate-50 rounded-lg px-4 py-1">{children}</div>
    </div>
  );
}
