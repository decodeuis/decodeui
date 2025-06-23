import type { Store } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getNameKeyForCollection(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
): string[] {
  const pks =
    evalExpression("->$0NameKey", {
      graph,
      vertexes: [collVertex],
    }) || [];
  return pks.map((pk: Vertex) => pk.P.key);
}
