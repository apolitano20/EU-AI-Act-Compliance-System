import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GuidanceStatusBadge } from "./guidance-status-badge";
import type { AssessmentCore, FiredRule } from "@/lib/assessment-shared";
import { CheckCircle2, XCircle, HelpCircle, ListChecks, Pencil, Scale } from "lucide-react";

export function IndicatorList({ title, items, icon, tone }: {
  title: string; items: string[]; icon: React.ReactNode; tone: string;
}) {
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

/** The standard 2x2 grid: positive / negative indicators, uncertainties, next questions. */
export function IndicatorGrid({ result }: { result: AssessmentCore<string> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <IndicatorList title="Positive indicators" items={result.positiveIndicators} icon={<CheckCircle2 className="w-4 h-4" />} tone="text-green-700" />
      <IndicatorList title="Negative indicators" items={result.negativeIndicators} icon={<XCircle className="w-4 h-4" />} tone="text-slate-600" />
      <IndicatorList title="Key uncertainties" items={result.keyUncertainties} icon={<HelpCircle className="w-4 h-4" />} tone="text-amber-700" />
      <IndicatorList title="Recommended next questions" items={result.recommendedNextQuestions} icon={<ListChecks className="w-4 h-4" />} tone="text-blue-700" />
    </div>
  );
}

/** Matched deterministic rules with their legal citations and guidance-status badges. */
export function FiredRulesPanel({ rules, title = "Matched rules and legal basis" }: { rules: FiredRule[]; title?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-2">
        <Scale className="w-4 h-4" /> {title}
      </h3>
      {rules.length === 0 ? (
        <p className="text-xs text-slate-400">No rules matched.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rules.map((r) => (
            <li key={r.ruleId} className="py-2 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-semibold text-slate-500">{r.ruleId}</span>
                <span className="text-sm text-slate-800">{r.title}</span>
                <GuidanceStatusBadge status={r.guidanceStatus} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{r.citation}</p>
              {r.detail && <p className="text-xs text-slate-600 mt-1">{r.detail}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Missing-fields chips with a link to fix the inventory record. */
export function MissingFieldsPanel({ missingFields, systemId, description }: {
  missingFields: string[]; systemId: string; description?: string;
}) {
  if (missingFields.length === 0) return null;
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">Clarify missing information</h3>
      <p className="text-xs text-slate-500 mb-2">
        {description ?? "These fields are missing or uncertain and affect this assessment's confidence:"}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {missingFields.map((f) => (
          <span key={f} className="px-2 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">{f}</span>
        ))}
      </div>
      <Link href={`/inventory/${systemId}/edit`} className="inline-block mt-3">
        <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="w-3.5 h-3.5" /> Update inventory record</Button>
      </Link>
    </div>
  );
}

/** Standard detail-page header: back link, system identity, edit button. */
export function ModuleDetailHeader({ backHref, backLabel, system }: {
  backHref: string;
  backLabel?: string;
  system: { id: string; systemName: string; shortDescription: string; businessFunction?: string | null; status?: string | null; buildType?: string | null };
}) {
  return (
    <div>
      <Link href={backHref} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3">
        ← {backLabel ?? "Back to summary"}
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
  );
}
