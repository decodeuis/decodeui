import { reconcile, type SetStoreFunction, type Store } from "solid-js/store";
import { untrack } from "solid-js";
import { getEdgeOldIdToNewIdMap } from "~/lib/graph/get/sync/store/getGlobalStore";
import { klona } from "klona";
import { transactionDetailAdd } from "~/lib/graph/transaction/core/transactionDetailAdd";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";

import { updateEdgeIdsToNew } from "~/lib/graph/mutate/core/edge/updateEdgeIdsToNew";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function replaceEdgeProperties(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: { [key: string]: unknown },
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
): { error: boolean | string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[edgeId] || edgeId;

    if (!graph.edges[actualEdgeId]) {
      return { error: "Edge ID is not valid" };
    }
    const originalEdge = klona(graph.edges[actualEdgeId]);
    setGraph("edges", actualEdgeId, "P", reconcile(klona(properties)));
    const data = updateEdgeIdsToNew(graph.edges[actualEdgeId], graph);
    if (!options?.skipTransactionDetail) {
      transactionDetailAdd(
        txnId,
        {
          data,
          id: actualEdgeId,
          originalData: originalEdge,
          replaceEdge: "replaceEdgeFn",
        },
        graph,
        setGraph,
        options,
      );
    }
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { replaceEdgeProperties: { edgeId, properties, txnId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}
