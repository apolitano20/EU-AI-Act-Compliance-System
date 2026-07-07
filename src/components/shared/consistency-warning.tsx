import { AlertTriangle } from "lucide-react";

/**
 * Cross-module consistency warning: shown when an uncertain upstream status
 * (role, scope, exclusion, high-risk, ...) undermines this module's result.
 */
export function ConsistencyWarning({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 space-y-1.5">
      {messages.map((m) => (
        <div key={m} className="flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{m}</span>
        </div>
      ))}
    </div>
  );
}
