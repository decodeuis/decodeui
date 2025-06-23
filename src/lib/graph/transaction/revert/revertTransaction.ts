import type { SetStoreFunction, Store } from "solid-js/store";

import { undo } from "../history/undo";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function revertTransaction(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return;
  }
  undo(txnId, graph, setGraph, -1, true);
  deleteVertex(0, `txn${txnId}`, graph, setGraph);
}
