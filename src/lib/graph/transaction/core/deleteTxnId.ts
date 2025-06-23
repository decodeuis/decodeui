import type { SetStoreFunction, Store } from "solid-js/store";

import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function deleteTxnId(
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
  deleteVertex(0, `txn${txnId}`, graph, setGraph);
}
