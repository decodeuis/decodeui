import type { SetStoreFunction, Store } from "solid-js/store";

import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/**
 * Updates the transaction's submitted index after a successful commit.
 * This marks the current state as the new baseline for detecting changes.
 *
 * @param txnId - The ID of the transaction to update
 * @param graph - The current graph state
 * @param setGraph - Function to update the graph state
 */
export function updateSubmittedIndex(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }

  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);

  // Update transaction indices
  existingTxnValue.submittedIndex = existingTxnValue.activeUndoIndex;
  existingTxnValue.originalSubmittedIndex = existingTxnValue.activeUndoIndex;
  existingTxnValue.revertSteps = [];

  // Update status information
  existingTxnValue.status = "committed";
  existingTxnValue.lastModified = Date.now();

  // Clear any previous errors
  if (existingTxnValue.error) {
    delete existingTxnValue.error;
  }

  replaceVertexProperties(
    0,
    `txn${txnId}`,
    graph,
    setGraph,
    existingTxnValue as unknown as { [key: string]: unknown },
    {
      cloneProperties: false,
    },
  );
}
