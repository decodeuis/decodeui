import type { Store } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getDataVertex(graph: Store<GraphInterface>, item?: Vertex) {
  const vertexes = evalExpression("->$0Data", {
    graph,
    vertexes: [item],
  });
  return vertexes?.[0];
}
