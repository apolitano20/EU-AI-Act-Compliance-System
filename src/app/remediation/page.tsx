import { Disclaimer } from "@/components/shared/disclaimer";
import { RemediationTable } from "@/components/remediation/remediation-table";
import { listRemediationViews } from "@/lib/remediation/store";
import { summarizeRemediation } from "@/lib/remediation/summary";
import type { RemediationCsvRow } from "@/lib/remediation/csv";

export const dynamic = "force-dynamic";

export default async function RemediationPage() {
  const views = await listRemediationViews();
  const rows: RemediationCsvRow[] = views.flatMap((v) => v.items.map((item) => ({ systemName: v.bundle.system.systemName, item })));
  const summary = summarizeRemediation(rows);

  const cards = [
    { label: "Total items", value: summary.total, color: "text-slate-800" },
    { label: "Open", value: summary.open, color: "text-blue-700" },
    { label: "In progress", value: summary.inProgress, color: "text-amber-700" },
    { label: "Blocked", value: summary.blocked, color: "text-red-700" },
    { label: "Completed / verified", value: summary.closed, color: "text-green-700" },
    { label: "Unassigned", value: summary.unassigned, color: "text-red-700" },
    { label: "Overdue / due within 30 days", value: summary.overdueOrSoon, color: "text-orange-700" },
    { label: "Recurring controls active", value: summary.recurringActive, color: "text-purple-700" },
    { label: "Overall progress", value: `${summary.progressPct}%`, color: "text-blue-700" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Remediation Tracker</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          Module 14 — turns each Module 13 evidence gap into a trackable action item with an owner, due date and
          status. One-off tasks are separated from recurring lifecycle controls (Art 9, 17, 72, 73), which re-arm on
          completion. Due dates anchor to the (provisional) enforcement timeline. A closed item means a gap was
          addressed — not that the system is legally compliant.
        </p>
      </div>

      <div className="mb-6 max-w-3xl"><Disclaimer /></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 leading-tight mb-1">{c.label}</p>
            <p className={`text-xl font-semibold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <RemediationTable initialRows={rows} />
    </div>
  );
}
