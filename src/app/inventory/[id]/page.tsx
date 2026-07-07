import { notFound } from "next/navigation";
import Link from "next/link";
import { getSystem } from "@/lib/inventory-store";
import { normalizeAISystemLike } from "@/lib/ai-system-data";
import { computeCompleteness } from "@/lib/completeness";
import { SystemChips } from "@/components/chip";
import { CompletenessBadge } from "@/components/completeness-badge";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";

function Field({ label, value }: { label: string; value: string | string[] | null | undefined }) {
  const display = Array.isArray(value) ? value.join(", ") : value;
  if (!display) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-800 col-span-2">{display}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default async function SystemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const system = await getSystem(id);
  if (!system) notFound();

  const normalized = normalizeAISystemLike(system);
  const { score, band, missingFields } = computeCompleteness(normalized);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <Link href="/inventory" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to inventory
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{normalized.systemName}</h1>
            <p className="text-slate-500 text-sm mt-1">{normalized.shortDescription}</p>
          </div>
          <Link href={`/inventory/${id}/edit`}>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SystemChips system={system} />
        </div>
      </div>

      {/* Completeness */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory completeness</h2>
          <CompletenessBadge score={score} band={band} />
        </div>
        {missingFields.length > 0 && (
          <div className="text-xs text-slate-500">
            <span className="font-medium">Missing fields: </span>
            {missingFields.join(", ")}
          </div>
        )}
        {missingFields.length === 0 && (
          <p className="text-xs text-green-600">All key fields are complete.</p>
        )}
      </div>

      {/* Overview */}
      <Section title="Overview">
        <Field label="Business function" value={normalized.businessFunction} />
        <Field label="Business owner" value={normalized.businessOwner} />
        <Field label="Technical owner" value={normalized.technicalOwner} />
        <Field label="Status" value={normalized.status} />
        <Field label="Countries used" value={normalized.countriesUsed} />
        <Field label="Outputs used in EU" value={normalized.outputsUsedInEu} />
      </Section>

      <Section title="Use Case">
        <Field label="Users" value={normalized.users} />
        <Field label="Affected persons" value={normalized.affectedPersons} />
        <Field label="Deployment context" value={normalized.deploymentContext} />
        <Field label="Output types" value={normalized.outputTypes} />
        <Field label="Affects decisions about people" value={normalized.affectsDecisionsAboutPeople} />
        <Field label="Human review or override" value={normalized.humanReviewOrOverride} />
        <Field label="Impact if wrong" value={normalized.impactIfWrong} />
        {normalized.useCaseNotes && <Field label="Notes" value={normalized.useCaseNotes} />}
      </Section>

      <Section title="Technical Profile">
        <Field label="System types" value={normalized.systemTypes} />
        <Field label="Decision logic type" value={normalized.decisionLogicType} />
        <Field label="Learned parameters in production" value={normalized.learnedParametersUsedInProduction} />
        <Field label="Underlying model or tool" value={normalized.underlyingModelOrTool} />
        <Field label="Model provider" value={normalized.modelProvider} />
        <Field label="Uses GPAI / LLM" value={normalized.usesGpaiOrLlm} />
        <Field label="Uses RAG" value={normalized.usesRag} />
        <Field label="Can call tools / APIs" value={normalized.canCallToolsOrApis} />
        <Field label="Can take actions" value={normalized.canTakeActions} />
        <Field label="Generates content" value={normalized.generatesContent} />
        <Field label="Interacts with people" value={normalized.interactsDirectlyWithPeople} />
      </Section>

      <Section title="Data and People">
        <Field label="Uses personal data" value={normalized.usesPersonalData} />
        <Field label="Uses sensitive data" value={normalized.usesSensitiveData} />
        <Field label="Profiles individuals" value={normalized.profilesIndividuals} />
        <Field label="Data types" value={normalized.dataTypes} />
        {normalized.dataNotes && <Field label="Notes" value={normalized.dataNotes} />}
      </Section>

      <Section title="Build / Vendor / Supply Chain">
        <Field label="Build type" value={normalized.buildType} />
        <Field label="Vendor name" value={normalized.vendorName} />
        <Field label="Vendor country" value={normalized.vendorCountry} />
        <Field label="Model provider name" value={normalized.modelProviderName} />
        <Field label="Model provider country" value={normalized.modelProviderCountry} />
        <Field label="Branded under org name" value={normalized.brandedUnderOrganisationName} />
        <Field label="Vendor brand visible" value={normalized.vendorBrandVisible} />
        <Field label="Modified / fine-tuned / rebranded" value={normalized.modifiedFineTunedRebrandedOrRepurposed} />
        {normalized.supplyChainNotes && <Field label="Notes" value={normalized.supplyChainNotes} />}
      </Section>

      <Section title="Risk-Domain Flags">
        {normalized.riskDomainFlags.length > 0 ? (
          <ul className="space-y-1">
            {normalized.riskDomainFlags.map((f) => (
              <li key={f} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-slate-300 mt-0.5">-</span>{f}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No risk-domain flags selected.</p>
        )}
      </Section>
    </div>
  );
}
