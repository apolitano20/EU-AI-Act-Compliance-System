import type { EntityTypeRow } from "@/lib/entity-type/types";

export function EntitySummaryCards({ rows }: { rows: EntityTypeRow[] }) {
  const n = rows.length;
  const assessed = rows.filter((r) => r.lastAssessedAt !== null).length;
  const unassessed = n - assessed;
  const likelyProvider = rows.filter((r) => r.result.likelyRoles.includes("Provider")).length;
  const likelyDeployer = rows.filter((r) => r.result.likelyRoles.includes("Deployer")).length;
  const likelyImporter = rows.filter((r) => r.result.likelyRoles.includes("Importer")).length;
  const likelyDistributor = rows.filter((r) => r.result.likelyRoles.includes("Distributor")).length;
  const possibleAuthRep = rows.filter(
    (r) => r.result.likelyRoles.includes("Authorised Representative") || r.result.possibleRoles.includes("Authorised Representative")
  ).length;
  const possibleManufacturer = rows.filter((r) => r.result.possibleRoles.includes("Product Manufacturer")).length;
  const article25Risk = rows.filter((r) => r.result.article25ProviderConversionRisk).length;
  const lowConfidence = rows.filter(
    (r) => r.result.confidenceLabel === "low" || r.result.confidenceLabel === "insufficient_information"
  ).length;

  const cards = [
    { label: "Total AI systems",                 value: n,                  color: "text-slate-800" },
    { label: "Assessed systems",                  value: assessed,           color: "text-green-700" },
    { label: "Unassessed systems",                 value: unassessed,         color: "text-slate-500" },
    { label: "Likely Provider",                    value: likelyProvider,     color: "text-blue-700" },
    { label: "Likely Deployer",                    value: likelyDeployer,     color: "text-cyan-700" },
    { label: "Likely Importer",                    value: likelyImporter,     color: "text-purple-700" },
    { label: "Likely Distributor",                  value: likelyDistributor,  color: "text-indigo-700" },
    { label: "Possible Authorised Representative",  value: possibleAuthRep,    color: "text-amber-700" },
    { label: "Possible Product Manufacturer",       value: possibleManufacturer, color: "text-orange-700" },
    { label: "Article 25 risk",                     value: article25Risk,      color: "text-red-700" },
    { label: "Low-confidence / unclear",            value: lowConfidence,      color: "text-rose-700" },
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
