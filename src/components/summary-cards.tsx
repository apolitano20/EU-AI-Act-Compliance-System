import type { AISystem } from "../generated/prisma/client";

interface Props { systems: AISystem[] }

export function SummaryCards({ systems }: Props) {
  const n = systems.length;
  const production   = systems.filter((s) => s.status === "Production").length;
  const pilot        = systems.filter((s) => s.status === "Pilot").length;
  const vendor       = systems.filter((s) => s.buildType === "Bought/licensed from vendor").length;
  const internal     = systems.filter((s) => s.buildType === "Built internally").length;
  const gpai         = systems.filter((s) => s.usesGpaiOrLlm === "Yes").length;
  const rag          = systems.filter((s) => s.usesRag === "Yes").length;
  const agentic      = systems.filter((s) => s.canTakeActions === "Yes").length;
  const decisions    = systems.filter((s) => s.affectsDecisionsAboutPeople === "Yes").length;
  const incomplete   = systems.filter((s) => (s.completenessScore ?? 0) < 80).length;

  const cards = [
    { label: "Total systems",                  value: n,         color: "text-slate-800" },
    { label: "Production",                     value: production, color: "text-green-700" },
    { label: "Pilot",                          value: pilot,      color: "text-yellow-700" },
    { label: "Vendor systems",                 value: vendor,     color: "text-purple-700" },
    { label: "Internal systems",               value: internal,   color: "text-blue-700" },
    { label: "GPAI / LLM systems",            value: gpai,       color: "text-violet-700" },
    { label: "RAG systems",                    value: rag,        color: "text-cyan-700" },
    { label: "Agentic workflows",              value: agentic,    color: "text-amber-700" },
    { label: "Affecting decisions about people", value: decisions, color: "text-red-700" },
    { label: "Incomplete inventory data",      value: incomplete, color: "text-orange-700" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500 leading-tight mb-1">{c.label}</p>
          <p className={`text-2xl font-semibold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
