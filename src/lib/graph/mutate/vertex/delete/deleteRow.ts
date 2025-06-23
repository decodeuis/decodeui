import type { SetStoreFunction, Store } from "solid-js/store";

import { batch } from "solid-js";

import { commitTxn } from "../../../transaction/core/commitTxn";
import { generateNewTxnId } from "../../../transaction/core/generateNewTxnId";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function deleteRow(
  vertex: Vertex,
  isRealTime: boolean,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
) {
  batch(() => {
    if (isRealTime) {
      txnId = generateNewTxnId(graph, setGraph);
    }
    // delete all vertex in edges
    const inEdges = vertex.IN;
    for (const type in inEdges) {
      for (const edgeId of inEdges[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
        if (deleteEdgeResult?.error) {
          alert(deleteEdgeResult.error.toString());
        }
      }
    }
    // delete all outEdges of vertex
    const outEdge = vertex.OUT;
    for (const type in outEdge) {
      for (const edgeId of outEdge[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
        if (deleteEdgeResult?.error) {
          alert(deleteEdgeResult.error.toString());
        }
      }
    }

    // delete vertex:
    const deleteResult = deleteVertex(txnId, vertex.id, graph, setGraph);
    if (deleteResult.error) {
      alert(deleteResult.error.toString());
    }
    if (isRealTime) {
      commitTxn(txnId, graph);
    }
  });
}
