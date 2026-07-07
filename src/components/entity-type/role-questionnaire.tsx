"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DISCLAIMER_TEXT } from "@/lib/assessment-shared";
import { saveAssessment } from "@/app/entity-type/actions";
import { assessRole, QUESTIONS, SECTION_TITLES, type Answers, type Question } from "@/lib/entity-type/roleRules";
import { RoleBadges, ConfidenceBadge, Article25Badge } from "./role-badges";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Info, Save } from "lucide-react";

const SECTION_ORDER: Question["section"][] = ["A", "B", "C", "D", "E", "F", "G"];

function AnswerButtons({ question, value, onChange }: {
  question: Question; value: string | string[] | undefined; onChange: (v: string | string[]) => void;
}) {
  if (question.multi) {
    const current = Array.isArray(value) ? value : [];
    function toggle(option: string) {
      onChange(current.includes(option) ? current.filter((v) => v !== option) : [...current, option]);
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {question.options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs border transition-colors",
              current.includes(o) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {question.options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs border transition-colors",
            value === o ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function QuestionRow({ question, value, onChange }: {
  question: Question; value: string | string[] | undefined; onChange: (v: string | string[]) => void;
}) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-1.5 mb-2">
        <p className="text-sm text-slate-800">{question.label}</p>
        {question.helper && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-help mt-0.5 shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">{question.helper}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <AnswerButtons question={question} value={value} onChange={onChange} />
    </div>
  );
}

export function RoleQuestionnaire({ systemId, initialAnswers }: { systemId: string; initialAnswers: Answers }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [saving, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const result = useMemo(() => assessRole(answers), [answers]);

  function setAnswer(key: Question["key"], value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }) as Answers);
    setSaved(false);
  }

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      try {
        await saveAssessment(systemId, answers);
        setSaved(true);
        router.refresh();
      } catch {
        setSaveError("Saving failed. Please try again.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* Questionnaire */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {SECTION_ORDER.map((section) => (
          <div key={section} className="p-5 border-b border-slate-200 last:border-0">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Section {section} — {SECTION_TITLES[section]}
            </h2>
            {QUESTIONS.filter((q) => q.section === section).map((q) => (
              <QuestionRow
                key={q.key}
                question={q}
                value={answers[q.key as keyof Answers]}
                onChange={(v) => setAnswer(q.key, v)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Live result panel */}
      <div className="lg:sticky lg:top-6 space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</h2>
            <ConfidenceBadge label={result.confidenceLabel} />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Likely role(s)</p>
            <RoleBadges likelyRoles={result.likelyRoles} possibleRoles={[]} />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Possible role(s)</p>
            <RoleBadges likelyRoles={[]} possibleRoles={result.possibleRoles} />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Article 25 risk</p>
            <Article25Badge atRisk={result.article25ProviderConversionRisk} />
          </div>

          {result.flags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Flags</p>
              <ul className="space-y-1">
                {result.flags.map((f) => <li key={f} className="text-xs text-slate-600">- {f}</li>)}
              </ul>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Reasoning</p>
            <p className="text-xs text-slate-600">{result.reasoningSummary}</p>
          </div>

          {result.keyUncertainties.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Key uncertainties</p>
              <ul className="space-y-1">
                {result.keyUncertainties.map((u) => <li key={u} className="text-xs text-slate-600">- {u}</li>)}
              </ul>
            </div>
          )}

          {result.recommendedNextQuestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Recommended next questions</p>
              <ul className="space-y-1">
                {result.recommendedNextQuestions.map((q) => <li key={q} className="text-xs text-slate-600">- {q}</li>)}
              </ul>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full gap-1.5">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : saved ? "Saved" : "Save answers"}
          </Button>
          {saveError && <p className="text-xs text-red-500 text-center">{saveError}</p>}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800">
          {DISCLAIMER_TEXT}
        </div>
      </div>
    </div>
  );
}
