import { Disclaimer } from "@/components/shared/disclaimer";
import { EvidenceTable } from "@/components/evidence/evidence-table";
import { listReadinessRows } from "@/lib/evidence/store";
import { flattenEvidenceRows } from "@/lib/evidence/types";

export const dynamic = "force-dynamic";

export default async function ReadinessPage() {
  const rows = await listReadinessRows();
  const flat = flattenEvidenceRows(rows);
  const assessed = rows.filter((r) => r.result.status === "assessed");
  const avgReadiness = assessed.length > 0 ? Math.round(assessed.reduce((s, r) => s + r.result.readinessScore, 0) / assessed.length) : 0;

  const cards = [
    { label: "Applicable obligations (all systems)", value: flat.filter((f) => f.row.readinessStatus !== "not_applicable").length, color: "text-slate-800" },
    { label: "Evidence in place", value: flat.filter((f) => f.row.readinessStatus === "evidence_in_place").length, color: "text-green-700" },
    { label: "Partial", value: flat.filter((f) => f.row.readinessStatus === "partial_evidence").length, color: "text-yellow-700" },
    { label: "Gaps", value: flat.filter((f) => f.row.readinessStatus === "evidence_gap").length, color: "text-red-700" },
    { label: "Not started", value: flat.filter((f) => f.row.readinessStatus === "not_started").length, color: "text-orange-700" },
    { label: "Unknown", value: flat.filter((f) => f.row.readinessStatus === "unknown_evidence_state").length, color: "text-amber-700" },
    { label: "Nearest provisional deadline", value: "2027-12-02", color: "text-slate-700" },
    { label: "Overall readiness %", value: `${avgReadiness}%`, color: "text-blue-700" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Evidence &amp; Readiness</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 13 — does not re-derive whether an obligation applies (that is Module 12): it assesses the readiness
          state (evidence in place / partial / gap / not started / unknown) per applicable obligation and rolls the
          rows into a system-level readiness score. Gaps hand off to the remediation tracker (Module 14).
        </p>
      </div>

      <div className="mb-6 max-w-3xl"><Disclaimer /></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 leading-tight mb-1">{c.label}</p>
            <p className={`text-xl font-semibold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <EvidenceTable initialRows={flat} />
    </div>
  );
}
