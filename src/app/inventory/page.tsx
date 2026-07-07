import { listSystems } from "@/lib/inventory-store";
import { SummaryCards } from "@/components/summary-cards";
import { InventoryTable } from "@/components/inventory-table";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const systems = await listSystems();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI System Inventory</h1>
        <p className="text-slate-500 mt-1 text-sm max-w-2xl">
          Create a structured inventory of AI systems and AI-enabled use cases before assessing EU AI Act obligations.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-800 max-w-3xl">
        <strong>Guidance:</strong> List AI systems broadly at this stage. Do not worry yet about whether the system is legally in scope of the EU AI Act. Later modules will classify scope, role, risk category, and obligations. For now, capture any system that learns, predicts, scores, classifies, recommends, generates content, automates workflows, uses a foundation model, or otherwise influences decisions or digital/physical environments.
      </div>

      <SummaryCards systems={systems} />
      <InventoryTable initialSystems={systems} />
    </div>
  );
}
