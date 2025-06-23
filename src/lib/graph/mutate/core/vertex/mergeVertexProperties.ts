// mergeVertexProperties(0, vertexId, {props: { title }}) } }} will replace props.
import type { SetStoreFunction, Store } from "solid-js/store";
import { untrack } from "solid-js";
import { getVertexOldIdToNewIdMap } from "~/lib/graph/get/sync/store/getGlobalStore";
import { klona } from "klona";
import { transactionDetailAdd } from "~/lib/graph/transaction/core/transactionDetailAdd";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";

import { updateVertexIdsToNew } from "~/lib/graph/mutate/core/vertex/updateVertexIdsToNew";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function mergeVertexProperties<T extends { [key: string]: any }>(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: Partial<T>,
  options?: {
    cloneProperties?: boolean;
    skipPostMessage?: string;
    skipTransactionDetail?: boolean;
  },
): { error: string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualVertexId =
      getVertexOldIdToNewIdMap(graph)[vertexId] || vertexId;
    const vertex = graph.vertexes[actualVertexId];
    if (!vertex) {
      return { error: `Vertex ID is not valid ${actualVertexId}` };
    }
    // Store the original vertex before modification
    const originalVertex = klona(vertex);
    const originalProperties = {} as { [key: string]: unknown };
    for (const property in properties) {
      // clonning json will remove undefined value, so used null as default.
      originalProperties[property] = vertex.P[property] ?? null;
    }
    originalVertex.P = originalProperties;
    const clonedProperties = options?.cloneProperties
      ? klona(properties)
      : properties;
    // It will only merge top level properties.
    setGraph("vertexes", actualVertexId, "P", clonedProperties);
    const data = updateVertexIdsToNew(klona(vertex), graph, true);
    data.P = clonedProperties;

    if (!options?.skipTransactionDetail) {
      transactionDetailAdd(
        txnId,
        {
          data,
          id: actualVertexId,
          merge: "mergeVertex",
          originalData: originalVertex,
        },
        graph,
        setGraph,
        options,
      );
    }
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { mergeVertexProperties: { properties, txnId, vertexId } },
    );
    return {
      error: "",
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}
