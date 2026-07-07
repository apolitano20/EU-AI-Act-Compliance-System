import { notFound } from "next/navigation";
import Link from "next/link";
import { getAiDefinitionRow } from "@/lib/ai-system-definition/store";
import { needsModule2ConsistencyWarning } from "@/lib/ai-system-definition/types";
import { AiDefinitionStatusBadge, ConfidenceBadge } from "@/components/ai-system-definition/definition-badges";
import { RefreshAssessmentButton } from "@/components/ai-system-definition/refresh-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, HelpCircle, ListChecks, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

function EvidenceRow({ label, value }: { label: string; value?: string | string[] | null }) {
  const display = Array.isArray(value) ? (value.length > 0 ? value.join(", ") : null) : value;
  if (!display) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 text-right">{display}</span>
    </div>
  );
}

function IndicatorList({ title, items, icon, tone }: { title: string; items: string[]; icon: React.ReactNode; tone: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className={`flex items-center gap-1.5 text-sm font-semibold mb-2 ${tone}`}>{icon} {title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">None identified.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => <li key={item} className="text-xs text-slate-700">• {item}</li>)}
        </ul>
      )}
    </div>
  );
}

export default async function AiSystemDefinitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getAiDefinitionRow(id);
  if (!row) notFound();

  const { system, normalized, result } = row;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <Link href="/ai-system-definition" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to summary
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{system.systemName}</h1>
            <p className="text-slate-500 text-sm mt-1">{system.shortDescription}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
              {system.businessFunction && <span>{system.businessFunction}</span>}
              {system.status && <span>· {system.status}</span>}
              {system.buildType && <span>· {system.buildType}</span>}
            </div>
          </div>
          <Link href={`/inventory/${system.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="w-3.5 h-3.5" /> Edit inventory record</Button>
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        This assessment is a readiness-support tool based on deterministic screening rules. It does not provide legal advice and should be reviewed by qualified legal or compliance professionals before decisions are made.
      </div>

      {needsModule2ConsistencyWarning(result) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>This item may not meet the AI-system-definition gate. Review this before relying on later EU AI Act role, scope, risk, or obligation assessments.</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <AiDefinitionStatusBadge classification={result.classification} />
            <ConfidenceBadge label={result.confidenceLabel} />
            <span className="text-xs text-slate-400">Score: {result.confidenceScore}/100</span>
          </div>
          <RefreshAssessmentButton />
        </div>
        <p className="text-sm text-slate-700 mt-3">{result.reasoningSummary}</p>
        <p className="text-xs text-slate-400 mt-2">Last assessed: {row.lastAssessedAt.toLocaleString("en-GB")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IndicatorList title="Positive indicators" items={result.positiveIndicators} icon={<CheckCircle2 className="w-4 h-4" />} tone="text-green-700" />
        <IndicatorList title="Negative indicators" items={result.negativeIndicators} icon={<XCircle className="w-4 h-4" />} tone="text-slate-600" />
        <IndicatorList title="Key uncertainties" items={result.keyUncertainties} icon={<HelpCircle className="w-4 h-4" />} tone="text-amber-700" />
        <IndicatorList title="Recommended next questions" items={result.recommendedNextQuestions} icon={<ListChecks className="w-4 h-4" />} tone="text-blue-700" />
      </div>

      {result.missingFields.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Clarify missing information</h3>
          <p className="text-xs text-slate-500 mb-2">
            These fields are missing or marked &quot;Not sure&quot; in the inventory record and affect this assessment&apos;s confidence:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.missingFields.map((f) => (
              <span key={f} className="px-2 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">{f}</span>
            ))}
          </div>
          <Link href={`/inventory/${system.id}/edit`} className="inline-block mt-3">
            <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="w-3.5 h-3.5" /> Update inventory record</Button>
          </Link>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Evidence used from inventory</h3>
        <div>
          <EvidenceRow label="Output types" value={result.evidenceUsed.outputTypes} />
          <EvidenceRow label="System types" value={result.evidenceUsed.systemTypes} />
          <EvidenceRow label="Decision logic type" value={result.evidenceUsed.decisionLogicType} />
          <EvidenceRow label="Learned parameters used in production" value={result.evidenceUsed.learnedParametersUsedInProduction} />
          <EvidenceRow label="Uses GPAI/LLM" value={result.evidenceUsed.usesGpaiOrLlm} />
          <EvidenceRow label="Uses RAG" value={result.evidenceUsed.usesRag} />
          <EvidenceRow label="Can call tools/APIs" value={result.evidenceUsed.canCallToolsOrApis} />
          <EvidenceRow label="Can take actions" value={result.evidenceUsed.canTakeActions} />
          <EvidenceRow label="Generates content" value={result.evidenceUsed.generatesContent} />
          <EvidenceRow label="Affects decisions about people" value={result.evidenceUsed.affectsDecisionsAboutPeople} />
          <EvidenceRow label="Profiles individuals" value={result.evidenceUsed.profilesIndividuals} />
          <EvidenceRow label="Deployment context" value={result.evidenceUsed.deploymentContext} />
          <EvidenceRow label="Underlying model or tool" value={result.evidenceUsed.underlyingModelOrTool ?? normalized.underlyingModelOrTool} />
        </div>
      </div>
    </div>
  );
}
