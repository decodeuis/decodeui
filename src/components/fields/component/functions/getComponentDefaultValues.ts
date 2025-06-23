import type { SetStoreFunction } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getComponentDefaultValues(
  component: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!component) {
    return {};
  }
  const variants =
    (evalExpression("->$0Variant", {
      graph,
      setGraph,
      vertexes: [component],
    }) as Vertex[]) || [];
  const defaultValues = {} as { [key: string]: any };
  for (const variant of variants) {
    if (variant.P.key) {
      if (variant.P.defValue !== undefined && variant.P.defValue !== null) {
        defaultValues[variant.P.key] = variant.P.defValue;
      }
    }
  }
  return defaultValues;
}
