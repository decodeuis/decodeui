import type { SetStoreFunction, Store } from "solid-js/store";

import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function saveNamedStepIndex(
  txnId: number,
  key: string,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  txnValue.namedUndoStepIndexes[key] = txnValue.activeUndoIndex;
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, {
    cloneProperties: false,
  });
}
