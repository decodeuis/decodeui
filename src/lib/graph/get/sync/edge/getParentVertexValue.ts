import type { Store } from "solid-js/store";

import { getInEdge } from "./getInEdge";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getParentVertexValue(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex,
): Id[] {
  const type = getInEdge(meta, vertex);
  if (!type) {
    return [];
  }
  return (vertex.IN[type] || []).map((edgeId) => graph.edges[edgeId].S);
}
