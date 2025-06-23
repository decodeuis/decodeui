import type { Store } from "solid-js/store";

import { getToEdge } from "./getToEdge";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getSelectedVertexValue(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex,
) {
  if (!vertex?.L) {
    return [];
  }
  const type = getToEdge(meta, vertex);
  return (vertex.OUT[type] || []).map((edgeId) => graph.edges[edgeId].E);
}
