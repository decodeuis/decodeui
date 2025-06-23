import type { Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getActiveUndoIndex(
  txnId: number,
  graph: Store<GraphInterface>,
) {
  const txnVertex = graph.vertexes[`txn${txnId}`];

  if (!txnVertex) {
    return -1;
  }
  return txnVertex.P.activeUndoIndex ?? -1;
}
