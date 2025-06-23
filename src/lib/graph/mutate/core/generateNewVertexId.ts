import type { SetStoreFunction } from "solid-js/store";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function generateNewVertexId(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): string {
  const globalStoreId = "globalStoreId";
  const newVertexId = graph.vertexes[globalStoreId].P.newVertexId_ + 1;

  mergeVertexProperties(0, globalStoreId, graph, setGraph, {
    newVertexId_: newVertexId,
  });

  return newVertexId.toString();
}
