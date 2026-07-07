import { notFound } from "next/navigation";
import Link from "next/link";
import { getEntityTypeRow } from "@/lib/entity-type/assessment-store";
import { normalizeAISystemLike } from "@/lib/ai-system-data";
import { RoleQuestionnaire } from "@/components/entity-type/role-questionnaire";
import { ArrowLeft } from "lucide-react";

export default async function EntityTypeSystemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getEntityTypeRow(id);
  if (!row) notFound();

  const normalized = normalizeAISystemLike(row.system);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <Link href="/entity-type" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to summary
        </Link>
        <h1 className="text-xl font-bold text-slate-900">{normalized.systemName}</h1>
        <p className="text-slate-500 text-sm mt-1">{normalized.shortDescription}</p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
          {normalized.businessFunction && <span>{normalized.businessFunction}</span>}
          {normalized.status && <span>· {normalized.status}</span>}
          {normalized.buildType && <span>· {normalized.buildType}</span>}
        </div>
      </div>

      <RoleQuestionnaire systemId={row.system.id} initialAnswers={row.answers} />
    </div>
  );
}
