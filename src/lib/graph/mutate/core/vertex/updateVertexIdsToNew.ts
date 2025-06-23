// make sure to use klona to avoid cant mutate vertex issues
import type { Store } from "solid-js/store";
import { untrack } from "solid-js";
import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "~/lib/graph/get/sync/store/getGlobalStore";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function updateVertexIdsToNew(
  vertex: Vertex,
  graph: Store<GraphInterface>,
  ignoreEdges: boolean,
) {
  return untrack(() => {
    vertex.id = getVertexOldIdToNewIdMap(graph)[vertex.id] || vertex.id;
    if (!ignoreEdges) {
      for (const [edgeType, edgeIds] of Object.entries(vertex.IN)) {
        vertex.IN[edgeType] = edgeIds.map(
          (id) => getEdgeOldIdToNewIdMap(graph)[id] || id,
        );
      }

      for (const [edgeType, edgeIds] of Object.entries(vertex.OUT)) {
        vertex.OUT[edgeType] = edgeIds.map(
          (id) => getEdgeOldIdToNewIdMap(graph)[id] || id,
        );
      }
    }
    return vertex;
  });
}
