"use client";

import { useState } from "react";
import { useForm, FormProvider, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { aiSystemSchema, type AISystemFormData } from "@/lib/schema";
import { createSystem, updateSystem } from "@/app/inventory/actions";
import { Button } from "@/components/ui/button";
import { Step1BasicInfo } from "./step1-basic-info";
import { Step2UseCase } from "./step2-use-case";
import { Step3Technical } from "./step3-technical";
import { Step4DataPeople } from "./step4-data-people";
import { Step5BuildVendor } from "./step5-build-vendor";
import { Step6RiskFlags } from "./step6-risk-flags";
import { Step7Review } from "./step7-review";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

const STEPS: { title: string; component: React.ComponentType; fields: (keyof AISystemFormData)[] }[] = [
  {
    title: "Basic Information",
    component: Step1BasicInfo,
    fields: ["systemName", "shortDescription", "businessFunction", "businessOwner", "technicalOwner", "status", "countriesUsed", "outputsUsedInEu"],
  },
  {
    title: "Use Case",
    component: Step2UseCase,
    fields: ["users", "affectedPersons", "deploymentContext", "outputTypes", "affectsDecisionsAboutPeople", "humanReviewOrOverride", "impactIfWrong", "useCaseNotes"],
  },
  {
    title: "Technical Profile",
    component: Step3Technical,
    fields: ["systemTypes", "decisionLogicType", "learnedParametersUsedInProduction", "underlyingModelOrTool", "modelProvider", "usesGpaiOrLlm", "usesRag", "canCallToolsOrApis", "canTakeActions", "generatesContent", "interactsDirectlyWithPeople"],
  },
  {
    title: "Data and People",
    component: Step4DataPeople,
    fields: ["usesPersonalData", "usesSensitiveData", "profilesIndividuals", "dataTypes", "dataNotes"],
  },
  {
    title: "Build / Vendor",
    component: Step5BuildVendor,
    fields: ["buildType", "vendorName", "vendorCountry", "modelProviderName", "modelProviderCountry", "brandedUnderOrganisationName", "vendorBrandVisible", "modifiedFineTunedRebrandedOrRepurposed", "supplyChainNotes"],
  },
  { title: "Risk-Domain Flags", component: Step6RiskFlags, fields: ["riskDomainFlags"] },
  { title: "Review", component: Step7Review, fields: [] },
];

interface Props {
  defaultValues?: Partial<AISystemFormData>;
  systemId?: string;
}

export function WizardShell({ defaultValues, systemId }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  const methods = useForm<AISystemFormData>({
    resolver: zodResolver(aiSystemSchema) as Resolver<AISystemFormData>,
    defaultValues: {
      systemName: "", shortDescription: "",
      countriesUsed: [], users: [], affectedPersons: [], outputTypes: [],
      systemTypes: [], dataTypes: [], riskDomainFlags: [],
      ...defaultValues,
    },
    mode: "onBlur",
  });

  const isLast = step === STEPS.length - 1;
  const StepComponent = STEPS[step].component;

  async function handleNext() {
    if (await methods.trigger(STEPS[step].fields)) {
      setStep((s) => s + 1);
    }
  }

  // Safety net: if submit-time validation fails, jump to the step that owns the first error.
  function handleInvalid(errors: FieldErrors<AISystemFormData>) {
    const target = STEPS.findIndex((s) => s.fields.some((f) => f in errors));
    if (target !== -1) setStep(target);
  }

  async function handleSave(data: AISystemFormData) {
    setSaving(true);
    setSaveError(null);
    try {
      if (systemId) {
        await updateSystem(systemId, data);
      } else {
        await createSystem(data);
      }
      router.push("/inventory");
      router.refresh();
    } catch {
      setSaveError("Saving failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-slate-900">
              {systemId ? "Edit AI System" : "Add AI System"}
            </h1>
            <span className="text-xs text-slate-400">Step {step + 1} of {STEPS.length}</span>
          </div>
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-blue-500" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-sm font-medium text-slate-600">{STEPS[step].title}</p>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <StepComponent />
        </div>

        {/* Navigation */}
        {saveError && <p className="text-sm text-red-500 mb-2 text-right">{saveError}</p>}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/inventory")}>
              Cancel
            </Button>
            {isLast ? (
              <Button
                onClick={methods.handleSubmit(handleSave, handleInvalid)}
                disabled={saving}
                className="gap-1.5"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : systemId ? "Save changes" : "Save system"}
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-1.5">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
