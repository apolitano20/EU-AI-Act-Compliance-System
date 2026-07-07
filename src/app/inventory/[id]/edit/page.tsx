import { notFound } from "next/navigation";
import { getSystem } from "@/lib/inventory-store";
import { normalizeAISystemLike } from "@/lib/ai-system-data";
import { WizardShell } from "@/components/wizard/wizard-shell";

export default async function EditSystemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const system = await getSystem(id);
  if (!system) notFound();

  const defaultValues = normalizeAISystemLike(system);

  return <WizardShell defaultValues={defaultValues} systemId={id} />;
}
