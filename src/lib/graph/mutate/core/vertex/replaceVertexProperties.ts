// replace a vertex properties
import { reconcile, type SetStoreFunction, type Store } from "solid-js/store";
import { untrack } from "solid-js";
import { getVertexOldIdToNewIdMap } from "~/lib/graph/get/sync/store/getGlobalStore";
import { klona } from "klona";
import { transactionDetailAdd } from "~/lib/graph/transaction/core/transactionDetailAdd";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";

import { updateVertexIdsToNew } from "~/lib/graph/mutate/core/vertex/updateVertexIdsToNew";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function replaceVertexProperties<T extends { [key: string]: any }>(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: T,
  // cloning will reduce performance, so we can use this flag to disable it.
  options?: {
    cloneProperties?: boolean;
    skipPostMessage?: string;
    skipTransactionDetail?: boolean;
  },
): { error: boolean | string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualVertexId =
      getVertexOldIdToNewIdMap(graph)[vertexId] || vertexId;
    if (!graph.vertexes[actualVertexId]) {
      const error = `Vertex ID not exist ${actualVertexId}`;
      console.error(error);
      return { error };
    }
    const shouldClone = options?.cloneProperties ?? true;
    const originalVertex = klona(graph.vertexes[actualVertexId]);
    setGraph(
      "vertexes",
      actualVertexId,
      "P",
      reconcile(shouldClone ? klona(properties) : properties),
    );
    if (txnId && !options?.skipTransactionDetail) {
      const data = updateVertexIdsToNew(
        klona(graph.vertexes[actualVertexId]),
        graph,
        true,
      );
      transactionDetailAdd(
        txnId,
        {
          data,
          id: actualVertexId,
          originalData: originalVertex,
          replace: "replaceVertex",
        },
        graph,
        setGraph,
        options,
      );
    }
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { replaceVertexProperties: { properties, txnId, vertexId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}
