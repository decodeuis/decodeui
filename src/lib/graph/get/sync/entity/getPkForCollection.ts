import type { Store } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getPkForCollection(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
) {
  const pks =
    evalExpression("->$0Pk", {
      graph,
      vertexes: [collVertex],
    }) || [];
  return pks.map((pk: Vertex) => pk.P.key);
}
