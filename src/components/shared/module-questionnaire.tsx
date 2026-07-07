"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { saveModuleAnswers } from "@/app/assessments/actions";
import type { ModuleAnswers, ModuleQuestion } from "@/lib/assessment-shared";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Info, Save } from "lucide-react";

function AnswerButtons({ question, value, onChange }: {
  question: ModuleQuestion; value: string | string[] | undefined; onChange: (v: string | string[]) => void;
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

export function QuestionRow({ question, value, onChange }: {
  question: ModuleQuestion; value: string | string[] | undefined; onChange: (v: string | string[]) => void;
}) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-1.5 mb-1">
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
      {question.seededFrom && (
        <p className="text-[11px] text-slate-400 mb-2">Reused from: {question.seededFrom}</p>
      )}
      <AnswerButtons question={question} value={value} onChange={onChange} />
    </div>
  );
}

/**
 * Generic questionnaire + live result panel for Modules 4-13. Each module
 * wraps this in a small client component that supplies its questions, a pure
 * `computeResult` from its rules file, and a `renderResult` panel.
 */
export function ModuleQuestionnaire<TResult>({
  moduleKey,
  systemId,
  questions,
  initialAnswers,
  computeResult,
  renderResult,
  title = "Questionnaire",
}: {
  moduleKey: string;
  systemId: string;
  questions: readonly ModuleQuestion[];
  initialAnswers: ModuleAnswers;
  computeResult: (answers: ModuleAnswers) => TResult;
  renderResult: (result: TResult) => React.ReactNode;
  title?: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<ModuleAnswers>(initialAnswers);
  const [saving, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const result = useMemo(() => computeResult(answers), [computeResult, answers]);
  const visibleQuestions = questions.filter((q) => !q.showWhen || q.showWhen(answers));

  function setAnswer(key: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      try {
        await saveModuleAnswers(moduleKey, systemId, answers);
        setSaved(true);
        router.refresh();
      } catch {
        setSaveError("Saving failed. Please try again.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</h2>
        {visibleQuestions.map((q) => (
          <QuestionRow key={q.key} question={q} value={answers[q.key]} onChange={(v) => setAnswer(q.key, v)} />
        ))}
        <Button onClick={handleSave} disabled={saving} className="w-full gap-1.5 mt-4">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved" : "Save answers"}
        </Button>
        {saveError && <p className="text-xs text-red-500 text-center mt-2">{saveError}</p>}
      </div>

      <div className="lg:sticky lg:top-6 space-y-4">
        {renderResult(result)}
      </div>
    </div>
  );
}
