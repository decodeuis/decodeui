import type { SetStoreFunction, Store } from "solid-js/store";

import { getActiveUndoIndex } from "../steps/getActiveUndoIndex";
import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";
import { getLastTxnIndex } from "../value/getLastTxnIndex";
import { determineTransactionStatus } from "../types/TransactionDetail";
import { redoTxn } from "./redoTxn";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/**
 * Performs a redo operation on a transaction, restoring previously undone changes.
 *
 * The redo operation:
 * 1. Moves forward to the next undo checkpoint if one exists
 * 2. Otherwise moves forward one step
 * 3. Applies all steps between current position and target position
 *
 * @param txnId - Transaction ID to redo
 * @param graph - Current graph state
 * @param setGraph - Function to update graph state
 */
export function redo(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  // Validate if redo operation is allowed
  if (!redoAllowed(txnId, graph)) {
    return;
  }

  // Get current transaction state
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = getActiveUndoIndex(txnId, graph);

  // Get the highest previous submitted index (may be higher than current submittedIndex after undo)
  const originalSubmittedIndex = txnValue.originalSubmittedIndex;

  // Find next undo checkpoint or step
  let nextUndoIndex = txnValue.undoStepIndexes.find(
    (index) => index > activeUndoIndex,
  );

  // If no checkpoint found, move forward one step
  if (nextUndoIndex === undefined) {
    nextUndoIndex = txnValue.activeUndoIndex + 1;
    if (nextUndoIndex >= txnValue.steps.length) {
      console.error("No next undo index found");
      return;
    }
  }

  try {
    // Update undo position and apply steps
    txnValue.activeUndoIndex = nextUndoIndex;
    for (const step of txnValue.steps.slice(
      activeUndoIndex + 1,
      nextUndoIndex + 1,
    )) {
      redoTxn(step, graph, setGraph);
    }

    // When redoing steps, we need to restore the original submittedIndex if appropriate
    // If we're redoing back into previously committed steps
    if (nextUndoIndex <= originalSubmittedIndex) {
      // If we redo to an index that was previously committed, restore the submittedIndex
      // but only up to our current position
      txnValue.submittedIndex = Math.min(nextUndoIndex, originalSubmittedIndex);
    }

    // Update transaction status using the helper function
    // This will handle all the different state permutations consistently
    txnValue.status = determineTransactionStatus(txnValue);
    txnValue.lastModified = Date.now();

    // Update transaction state in the graph
    replaceVertexProperties(
      0,
      `txn${txnId}`,
      graph,
      setGraph,
      txnValue as unknown as { [key: string]: unknown },
      {
        cloneProperties: false,
      },
    );
  } catch (error) {
    console.error("Error during redo operation:", error);
    // Update error status
    txnValue.status = "error";
    txnValue.error = {
      code: "REDO_ERROR",
      message:
        error instanceof Error ? error.message : "Unknown error during redo",
      details: error,
    };

    // Still try to update the transaction state
    replaceVertexProperties(
      0,
      `txn${txnId}`,
      graph,
      setGraph,
      txnValue as unknown as { [key: string]: unknown },
      {
        cloneProperties: false,
      },
    );
  }
}

/**
 * Checks if a redo operation is allowed for the given transaction.
 *
 * Validates:
 * 1. Transaction exists
 * 2. There are steps available to redo
 *
 * @param txnId - Transaction ID to check
 * @param graph - Current graph state
 * @returns boolean indicating if redo is allowed
 */
export function redoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  // Basic validation
  if (!txnId) {
    return false;
  }

  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return false;
  }

  const lastTxnIndex = getLastTxnIndex(txnId, graph);
  // Check if there are steps to redo
  const activeUndoIndex = getActiveUndoIndex(txnId, graph);
  return activeUndoIndex < lastTxnIndex;
}
