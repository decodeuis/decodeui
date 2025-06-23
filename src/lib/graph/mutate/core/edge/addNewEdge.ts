// TODO: is error is handle in all functions?
import type { SetStoreFunction, Store } from "solid-js/store";
import { batch, untrack } from "solid-js";
import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "~/lib/graph/get/sync/store/getGlobalStore";
import { transactionDetailAdd } from "~/lib/graph/transaction/core/transactionDetailAdd";
import { klona } from "klona";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";

import { updateEdgeIdsToNew } from "~/lib/graph/mutate/core/edge/updateEdgeIdsToNew";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import type { Edge } from "~/lib/graph/type/edge";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function addNewEdge(
  txnId: number,
  edge: Edge,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[edge.id] || edge.id;
    const actualStartVertexId =
      getVertexOldIdToNewIdMap(graph)[edge.S] || edge.S;
    const actualEndVertexId = getVertexOldIdToNewIdMap(graph)[edge.E] || edge.E;

    if (!actualEdgeId) {
      return { error: "Edge ID is not valid" };
    }
    if (graph.edges[actualEdgeId]) {
      return { error: "Edge ID already exist while adding new edge" };
    }
    if (!graph.vertexes[actualStartVertexId]) {
      return {
        error: `Edge Start Vertex ${actualStartVertexId} not exist while adding new edge`,
      };
    }
    if (!graph.vertexes[actualEndVertexId]) {
      return { error: "Edge End Vertex not exist while adding new edge" };
    }
    const startVertexOutEdges = graph.vertexes[actualStartVertexId].OUT[edge.T];
    if (
      Array.isArray(startVertexOutEdges) &&
      startVertexOutEdges.includes(actualEdgeId)
    ) {
      return {
        error: `Edge ID ${actualEdgeId} already exist in out_edges of the Start vertex ${actualStartVertexId}`,
      };
    }

    const endVertexInEdges = graph.vertexes[actualEndVertexId].IN[edge.T];
    if (
      Array.isArray(endVertexInEdges) &&
      endVertexInEdges.includes(actualEdgeId)
    ) {
      return {
        error: `Edge ID ${actualEdgeId} already exist in in_edges of the End vertex ${actualEndVertexId}`,
      };
    }
    batch(() => {
      setGraph("edges", actualEdgeId, updateEdgeIdsToNew(edge, graph));
      setGraph("vertexes", actualStartVertexId, "OUT", edge.T, (out_edges) =>
        Array.isArray(out_edges)
          ? [...out_edges, actualEdgeId]
          : [actualEdgeId],
      );
      setGraph("vertexes", actualEndVertexId, "IN", edge.T, (in_edges) =>
        Array.isArray(in_edges) ? [...in_edges, actualEdgeId] : [actualEdgeId],
      );
    });
    const data = updateEdgeIdsToNew(edge, graph);
    if (!options?.skipTransactionDetail) {
      transactionDetailAdd(
        txnId,
        {
          data,
          id: actualEdgeId,
          insertEdge: "insertEdgeFn",
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
      { addNewEdge: { edge, txnId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}
