import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getMetaProps(
  meta: Record<string, unknown>,
  ignoreKeys: string[],
  _graph: GraphInterface,
): Record<string, unknown> {
  try {
    const result = {} as Record<string, unknown>;

    for (const key in meta) {
      if (ignoreKeys.includes(key)) {
        continue;
      }

      const value = meta[key];
      if (typeof value === "function") {
        result[key] = value;
      } else if (value !== null) {
        result[key] = value;
      }
    }
    return result;
  } catch (error) {
    console.error("Error in getMetaProps:", error);
    return {};
  }
}
