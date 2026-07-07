import { DISCLAIMER_TEXT } from "@/lib/assessment-shared";

/** Verbatim non-legal-advice disclaimer required on every module result view. */
export function Disclaimer() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
      {DISCLAIMER_TEXT}
    </div>
  );
}
