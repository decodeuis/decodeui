import type { SetStoreFunction, Store } from "solid-js/store";

import type { TransactionValue } from "../types/TransactionType";

import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

const MAX_HISTORY_SIZE = 100; // Maximum number of steps to keep in history
const CLEANUP_THRESHOLD = 80; // When to trigger cleanup (80% of max)

export function redo(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!redoAllowed(txnId, graph)) {
    return;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  const nextUndoIndex = txnValue.undoStepIndexes.find(
    (index) => index > activeUndoIndex,
  );
  if (nextUndoIndex !== undefined) {
    txnValue.activeUndoIndex = nextUndoIndex;
    txnValue.steps
      .slice(activeUndoIndex + 1, nextUndoIndex + 1)
      .forEach((step) => {
        if (step.redo) {
          step.redo();
        }
      });
  }

  replaceVertexProperties(
    0,
    `txn${txnId}`,
    graph,
    setGraph,
    { P: txnValue },
    { cloneProperties: false },
  );
}

export function redoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId) {
    return false;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  return activeUndoIndex < txnValue.steps.length - 1;
}

export function saveUndoPoint(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);

  let activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  if (activeUndoIndex === -1) {
    activeUndoIndex = 0;
  }

  if (!txnValue.undoStepIndexes.includes(activeUndoIndex)) {
    const insertIndex = txnValue.undoStepIndexes.findIndex(
      (index) => index > activeUndoIndex,
    );
    if (insertIndex === -1) {
      txnValue.undoStepIndexes.push(activeUndoIndex);
    } else {
      txnValue.undoStepIndexes.splice(insertIndex, 0, activeUndoIndex);
    }
  }

  // Check if cleanup is needed
  if (txnValue.steps.length > CLEANUP_THRESHOLD) {
    cleanupTransactionHistory(txnValue, activeUndoIndex);
  }

  replaceVertexProperties(
    0,
    `txn${txnId}`,
    graph,
    setGraph,
    { P: txnValue },
    { cloneProperties: false },
  );
}

export function transactionDetailAdd(
  txnId: number,
  txnValue: TransactionValue,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }

  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex =
    existingTxnValue.activeUndoIndex ?? existingTxnValue.steps.length - 1;

  // Clear future steps if we're not at the end
  if (activeUndoIndex < existingTxnValue.steps.length - 1) {
    const activeUndoPointIndex = existingTxnValue.undoStepIndexes.findIndex(
      (index) => index > activeUndoIndex,
    );
    existingTxnValue.undoStepIndexes = existingTxnValue.undoStepIndexes.slice(
      0,
      activeUndoPointIndex === -1 ? undefined : activeUndoPointIndex,
    );
    existingTxnValue.steps = existingTxnValue.steps.slice(
      0,
      activeUndoIndex + 1,
    );
  }

  // Add new step
  existingTxnValue.steps.push({
    ...txnValue,
    timestamp: Date.now(),
  });

  // Check if cleanup is needed
  if (existingTxnValue.steps.length > CLEANUP_THRESHOLD) {
    cleanupTransactionHistory(existingTxnValue, activeUndoIndex);
  }

  replaceVertexProperties(
    0,
    `txn${txnId}`,
    graph,
    setGraph,
    { P: existingTxnValue },
    { cloneProperties: false },
  );
}

export function undo(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!undoAllowed(txnId, graph)) {
    return;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  const nearestLowestIndex = txnValue.undoStepIndexes
    .slice()
    .reverse()
    .find((index) => index < activeUndoIndex);

  const newUndoIndex =
    nearestLowestIndex !== undefined ? nearestLowestIndex : activeUndoIndex - 1;

  txnValue.steps.slice(newUndoIndex + 1, activeUndoIndex + 1);
  txnValue.activeUndoIndex = newUndoIndex;

  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue);
}

export function undoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId) {
    return false;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  if (txnValue.steps.length <= 1) {
    return false;
  }

  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  return activeUndoIndex > 0;
}

function cleanupTransactionHistory(
  txnValue: { steps: TransactionValue[]; undoStepIndexes: number[] },
  activeUndoIndex: number,
) {
  if (txnValue.steps.length <= MAX_HISTORY_SIZE) {
    return;
  }

  // Keep recent history and important undo points
  const keepCount = Math.floor(MAX_HISTORY_SIZE * 0.7); // Keep 70% of max size
  const _removeCount = txnValue.steps.length - keepCount;

  // Don't remove steps that are part of the current undo/redo chain
  const minKeepIndex = Math.max(0, activeUndoIndex - Math.floor(keepCount / 2));

  if (minKeepIndex > 0) {
    txnValue.steps = txnValue.steps.slice(minKeepIndex);
    // Adjust undo indexes
    txnValue.undoStepIndexes = txnValue.undoStepIndexes
      .map((index) => index - minKeepIndex)
      .filter((index) => index >= 0);
  }
}

transactionDetailAdd(1, { a: 1 });

saveUndoPoint(1);
transactionDetailAdd(1, { a: 2 });
transactionDetailAdd(1, { a: 3 });
transactionDetailAdd(1, { a: 4 });
saveUndoPoint(1);
transactionDetailAdd(1, { a: 5 });
transactionDetailAdd(1, { a: 6 });
transactionDetailAdd(1, { a: 7 });
saveUndoPoint(1);
undo(1);
undo(1);
// transactionDetailAdd(1, { a: 8 });
transactions.get(1)!.submittedIndex = transactions.get(1)!.steps.length - 1;
saveUndoPoint(1);
// redo(1);
// redo(1);
saveUndoPoint(1);
transactionDetailAdd(1, { a: 8 });
undo(1);
undo(1);
transactions.get(1)!.submittedIndex = transactions.get(1)!.steps.length - 1;
