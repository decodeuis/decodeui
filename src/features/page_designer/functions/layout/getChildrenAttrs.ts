import type { SetStoreFunction, Store } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";
import { sortVertexesByPosition } from "~/lib/graph/get/sync/entity/sortVertexesByPosition";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getChildrenAttrs(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  child: Vertex,
): Vertex[] {
  if (!child) {
    return [];
  }
  return sortVertexesByPosition(
    evalExpression("->Attr", { graph, setGraph, vertexes: [child] }) || [],
  );
}
