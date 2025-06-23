import type { Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function txnHasSteps(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId) {
    return false;
  }
  const existingTxnValue = graph.vertexes[`txn${txnId}`]?.P?.steps || [];
  return existingTxnValue.length > 0;
}
