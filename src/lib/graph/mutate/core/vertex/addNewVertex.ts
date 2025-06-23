// add a new vertex to the graph
import type { SetStoreFunction, Store } from "solid-js/store";
import { untrack } from "solid-js";
import { getVertexOldIdToNewIdMap } from "~/lib/graph/get/sync/store/getGlobalStore";
import { klona } from "klona";
import { transactionDetailAdd } from "~/lib/graph/transaction/core/transactionDetailAdd";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";

import { updateVertexIdsToNew } from "~/lib/graph/mutate/core/vertex/updateVertexIdsToNew";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function addNewVertex(
  txnId: number,
  vertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
): {
  error: string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualVertexId =
      getVertexOldIdToNewIdMap(graph)[vertex.id] || vertex.id;
    if (graph.vertexes[actualVertexId]) {
      return { error: "Vertex ID Already exist" };
    }
    const existedVertexes = vertex.L.filter(
      (label) =>
        Array.isArray(graph.vertexLabelIdMap[label]) &&
        graph.vertexLabelIdMap[label].includes(actualVertexId),
    );
    if (existedVertexes.length) {
      return { error: "vertex ID already exist while adding new vertex" };
    }
    const actualVertex = updateVertexIdsToNew(klona(vertex), graph, true);
    setGraph("vertexes", actualVertexId, { ...actualVertex, IN: {}, OUT: {} });
    for (const label of vertex.L) {
      setGraph("vertexLabelIdMap", label, (vertexIds: Id[]) =>
        Array.isArray(vertexIds)
          ? [...vertexIds, actualVertexId]
          : [actualVertexId],
      );
    }
    const data = klona(actualVertex);
    if (!options?.skipTransactionDetail) {
      transactionDetailAdd(
        txnId,
        {
          data,
          id: actualVertexId,
          insert: "insertVertex",
          originalData: klona(vertex),
        },
        graph,
        setGraph,
        options,
      );
    }
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { addNewVertex: { txnId, vertex } },
    );
    return {
      error: "",
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}
