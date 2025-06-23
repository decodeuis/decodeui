import type { SetStoreFunction, Store } from "solid-js/store";

import { untrack } from "solid-js";

import type { TransactionDetail } from "../types/TransactionDetail";
import type { TransactionValue } from "../types/TransactionType";
import { determineTransactionStatus } from "../types/TransactionDetail";

import { getLastTxnIndex } from "../value/getLastTxnIndex";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/**
 * Adds a new transaction step to the transaction history while managing undo/redo state.
 *
 * This function:
 * 1. Handles adding new steps to the transaction history
 * 2. Manages the undo/redo stack when adding steps after an undo
 * 3. Preserves reverted steps for potential recovery
 *
 * @param txnId - The ID of the transaction to modify
 * @param txnValue - The new transaction step to add
 * @param graph - The current graph state
 * @param setGraph - Function to update the graph state
 * @param options - Optional configuration { skipPostMessage?: string }
 */
export function transactionDetailAdd(
  txnId: number,
  txnValue: TransactionValue,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string },
) {
  return untrack(() => {
    if (!txnId) {
      return;
    }

    const txnVertex = graph.vertexes[`txn${txnId}`];
    const currentTxnState = txnVertex.P as TransactionDetail;

    // Initialize working copies of transaction state
    let steps = [...currentTxnState.steps];
    let undoStepIndexes = [...currentTxnState.undoStepIndexes];
    let revertSteps = [...currentTxnState.revertSteps];
    let submittedIndex = currentTxnState.submittedIndex ?? -1;
    let originalSubmittedIndex =
      currentTxnState.originalSubmittedIndex ?? submittedIndex;

    // Track when this operation occurred
    const lastModified = Date.now();

    const lastStepIndex = getLastTxnIndex(txnId, graph);
    // Get current position in undo history directly from the current transaction state
    const currentUndoPosition = currentTxnState.activeUndoIndex;

    // If we're adding a step after an undo, we need to handle the branching
    if (currentUndoPosition < lastStepIndex) {
      // Remove undo checkpoints that are after our current position
      const nextUndoPointIndex = undoStepIndexes.findIndex(
        (index) => index > currentUndoPosition,
      );
      // If no undo points are found after current position, keep all existing points
      // Otherwise, slice to keep only the points before the next one
      undoStepIndexes =
        nextUndoPointIndex === -1
          ? undoStepIndexes
          : undoStepIndexes.slice(0, nextUndoPointIndex);

      // If we had submitted steps that are being discarded, save them for revert in the database
      if (originalSubmittedIndex > currentUndoPosition) {
        const discardedSteps = steps.slice(
          currentUndoPosition + 1,
          originalSubmittedIndex + 1,
        );
        // discard steps should be first in the revertSteps array
        revertSteps = [...discardedSteps, ...revertSteps];

        // When branching, adjust submittedIndex to current position
        submittedIndex = currentUndoPosition;
        // Reset originalSubmittedIndex as we're creating a new branch
        // Old values are meaningless in this new branch
        originalSubmittedIndex = currentUndoPosition;
      }

      // Remove all steps after our current position
      steps = steps.slice(0, currentUndoPosition + 1);
    }

    // Add the new step and update the undo position
    steps.push(txnValue);
    const newUndoPosition = steps.length - 1;

    // Create updated transaction state
    const updatedTxnState = {
      ...currentTxnState,
      activeUndoIndex: newUndoPosition,
      lastModified,
      originalSubmittedIndex,
      revertSteps,
      steps,
      submittedIndex,
      undoStepIndexes,
    };

    // Use the helper function to determine the appropriate status
    updatedTxnState.status = determineTransactionStatus(updatedTxnState);

    // Update the graph with new transaction state
    replaceVertexProperties(
      0,
      `txn${txnId}`,
      graph,
      setGraph,
      updatedTxnState as unknown as { [key: string]: unknown },
      {
        cloneProperties: false,
        skipPostMessage: options?.skipPostMessage,
      },
    );
  });
}
