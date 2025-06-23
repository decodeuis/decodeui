// no transaction detail add
// make sure to use klona to avoid cant mutate edge issues
import type { Store } from "solid-js/store";
import { untrack } from "solid-js";
import { klona } from "klona";
import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "~/lib/graph/get/sync/store/getGlobalStore";
import type { Edge } from "~/lib/graph/type/edge";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function updateEdgeIdsToNew(edge: Edge, graph: Store<GraphInterface>) {
  return untrack(() => {
    const edge2 = klona(edge);
    edge2.id = getEdgeOldIdToNewIdMap(graph)[edge.id] || edge.id;
    edge2.S = getVertexOldIdToNewIdMap(graph)[edge.S] || edge.S;
    edge2.E = getVertexOldIdToNewIdMap(graph)[edge.E] || edge.E;
    return edge2;
  });
}
