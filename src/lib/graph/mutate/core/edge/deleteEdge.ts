import type { SetStoreFunction, Store } from "solid-js/store";
import { batch, untrack } from "solid-js";
import { getEdgeOldIdToNewIdMap } from "~/lib/graph/get/sync/store/getGlobalStore";
import { klona } from "klona";
import { transactionDetailAdd } from "~/lib/graph/transaction/core/transactionDetailAdd";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";

import { updateEdgeIdsToNew } from "~/lib/graph/mutate/core/edge/updateEdgeIdsToNew";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function deleteEdge(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[edgeId] || edgeId;

    if (!graph.edges[actualEdgeId]) {
      return { error: "Edge ID is not valid" };
    }
    const edge = updateEdgeIdsToNew(graph.edges[actualEdgeId], graph);
    batch(() => {
      const type = edge.T;
      setGraph("vertexes", graph.edges[actualEdgeId].S, "OUT", type, (ids) => {
        const filteredIds = Array.isArray(ids)
          ? ids.filter((id_) => id_ !== actualEdgeId)
          : ids;
        return filteredIds.length
          ? filteredIds
          : (undefined as unknown as Id[]);
      });
      setGraph("vertexes", graph.edges[actualEdgeId].E, "IN", type, (ids) => {
        const filteredIds = Array.isArray(ids)
          ? ids.filter((id_) => id_ !== actualEdgeId)
          : ids;
        return filteredIds.length
          ? filteredIds
          : (undefined as unknown as Id[]);
      });
      // @ts-expect-error intentionally setting edge to undefined to remove it
      setGraph("edges", actualEdgeId, undefined);
    });

    const data = klona(edge);

    if (!options?.skipTransactionDetail) {
      transactionDetailAdd(
        txnId,
        {
          data,
          deleteEdge: "deleteEdgeFn",
          id: actualEdgeId,
          originalData: klona(edge),
        },
        graph,
        setGraph,
        options,
      );
    }
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { deleteEdge: { edgeId, txnId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}
