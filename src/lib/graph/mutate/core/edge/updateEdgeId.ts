// no transaction detail add
import type { SetStoreFunction, Store } from "solid-js/store";
import { untrack } from "solid-js";
import { klona } from "klona";

import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function updateEdgeId(
  oldEdgeId: Id,
  newEdgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
) {
  return untrack(() => {
    if (!graph.edges[oldEdgeId]) {
      return { error: "ID is not valid" };
    }
    if (graph.edges[newEdgeId]) {
      return { error: "new Edge ID is not valid" };
    }
    setGraph("edges", newEdgeId, {
      ...klona(graph.edges[oldEdgeId]),
      id: newEdgeId,
    });
    setGraph(
      "vertexes",
      graph.edges[oldEdgeId].S,
      "OUT",
      graph.edges[oldEdgeId].T,
      (ids) => [...ids.filter((id) => id !== oldEdgeId), newEdgeId],
    );
    setGraph(
      "vertexes",
      graph.edges[oldEdgeId].E,
      "IN",
      graph.edges[oldEdgeId].T,
      (ids) => [...ids.filter((id) => id !== oldEdgeId), newEdgeId],
    );
    // @ts-expect-error intentionally setting edge to undefined to remove it
    setGraph("edges", oldEdgeId, undefined);
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { updateEdgeId: { newEdgeId, oldEdgeId } },
    );
    return { error: "" };
  });
}
