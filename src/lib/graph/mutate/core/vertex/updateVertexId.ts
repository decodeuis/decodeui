// update vertex id when we receive new id from api response
import type { SetStoreFunction, Store } from "solid-js/store";
import { untrack } from "solid-js";

import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function updateVertexId(
  oldVertexId: Id,
  newVertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
) {
  return untrack(() => {
    if (!graph.vertexes[oldVertexId]) {
      return { error: "Vertex ID is not valid" };
    }
    if (graph.vertexes[newVertexId]) {
      return { error: "new Vertex ID is not valid" };
    }
    setGraph("vertexes", newVertexId, graph.vertexes[oldVertexId]);
    setGraph("vertexes", newVertexId, "id", newVertexId);
    // TODO: replace id exactly at same position
    for (const label of graph.vertexes[newVertexId as string].L) {
      setGraph("vertexLabelIdMap", label, (ids) =>
        ids.filter((id) => id !== oldVertexId),
      );
    }
    for (const label of graph.vertexes[newVertexId as string].L) {
      setGraph("vertexLabelIdMap", label, (vertexIds: Id[]) =>
        Array.isArray(vertexIds) ? [...vertexIds, newVertexId] : [newVertexId],
      );
    }
    // v->E--in->V-out-->E->v
    for (const [_edgeType, edgeIds] of Object.entries(
      graph.vertexes[newVertexId as string].OUT,
    )) {
      setGraph("edges", edgeIds, "S", newVertexId);
    }
    for (const [_edgeType, edgeIds] of Object.entries(
      graph.vertexes[newVertexId as string].IN,
    )) {
      setGraph("edges", edgeIds, "E", newVertexId);
    }
    // @ts-expect-error intentionally setting vertex to undefined to remove it
    setGraph("vertexes", oldVertexId, undefined);
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { updateVertexId: { newVertexId, oldVertexId } },
    );
    return { error: "" };
  });
}
