import { normalizeAISystemLike, toAISystemMutationData } from "./ai-system-data";
import { computeCompleteness } from "./completeness";
import { aiSystemSchema } from "./schema";

export function parseAISystemMutationInput(input: unknown) {
  const parsed = aiSystemSchema.parse(input);
  const normalized = normalizeAISystemLike(parsed);
  const completeness = computeCompleteness(normalized);

  return {
    normalized,
    completeness,
    mutationData: toAISystemMutationData(normalized, completeness.score),
  };
}
