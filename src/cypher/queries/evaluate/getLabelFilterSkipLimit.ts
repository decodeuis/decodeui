import type { EvalExpressionContext } from "~/cypher/types/EvalExpressionContext";

export function getLabelFilterSkipLimit(
  label: string,
  context: EvalExpressionContext,
) {
  const nameMatch = label.match(/\[(.*?)\]/);
  let key = "";
  let filter = {};
  let limit = 0;
  let skip = 0;
  if (nameMatch) {
    key = nameMatch[1];
    label = label.replace(`[${key}]`, "");
    if (key.startsWith("$")) {
      const contextData = context[key as keyof EvalExpressionContext] ?? {};
      filter = contextData.filter;
      limit = contextData.limit;
      skip = contextData.skip;
    } else {
      filter = { key: key };
    }
  }
  return { filter, label, limit, skip };
}
