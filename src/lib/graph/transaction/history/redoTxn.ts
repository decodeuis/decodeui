import type { SetStoreFunction, Store } from "solid-js/store";

import type { TransactionValue } from "../types/TransactionType";

import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "../../get/sync/store/getGlobalStore";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { updateVertexIdsToNew } from "~/lib/graph/mutate/core/vertex/updateVertexIdsToNew";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import { replaceEdgeProperties } from "~/lib/graph/mutate/core/edge/replaceEdgeProperties";
import { updateEdgeIdsToNew } from "~/lib/graph/mutate/core/edge/updateEdgeIdsToNew";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/**
 * Reapplies a previously undone transaction step to the graph.
 *
 * This function handles various graph mutation actions:
 * - Vertex operations: insert, delete, merge, replace properties
 * - Edge operations: insert, delete, replace properties/start/end
 *
 * For each action, it:
 * 1. Maps old IDs to new IDs if needed
 * 2. Applies the appropriate mutation to the graph
 *
 * @param txnDetail - Transaction step details containing the action and data
 * @param graph - Current graph state
 * @param setGraph - Function to update graph state
 */
export function redoTxn(
  txnDetail: TransactionValue,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const { data, id, originalData, ...actions } = txnDetail;

  // Process each action in the transaction
  for (const action in actions) {
    if (!actions.hasOwnProperty(action)) {
      continue;
    }

    // Map old IDs to new IDs where needed
    const actualVertexId = getVertexOldIdToNewIdMap(graph)[id] || id;
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[id] || id;

    switch (action) {
      // Edge Operations
      case "deleteEdge":
        deleteEdge(0, actualVertexId, graph, setGraph);
        break;

      // Vertex Operations
      case "deleteVertex":
        deleteVertex(0, actualVertexId, graph, setGraph);
        break;

      case "insert":
        addNewVertex(
          0,
          updateVertexIdsToNew(data as Vertex, graph, false),
          graph,
          setGraph,
        );
        break;

      case "insertEdge":
        addNewEdge(0, updateEdgeIdsToNew(data as Edge, graph), graph, setGraph);
        break;

      case "merge":
        mergeVertexProperties(0, actualVertexId, graph, setGraph, data.P);
        break;

      case "replace":
        replaceVertexProperties(0, actualVertexId, graph, setGraph, data.P);
        break;

      case "replaceEdge":
        replaceEdgeProperties(0, actualEdgeId, graph, setGraph, data.P);
        break;

      default:
        console.error(`Unknown action: ${action}`);
    }
  }
}
