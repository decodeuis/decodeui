import type { TransactionValue } from "./TransactionType";

export interface TransactionDetail {
  // Current position in the undo history
  activeUndoIndex: number;

  // Maps named checkpoints to their step indexes for quick reference
  namedUndoStepIndexes: { [key: string]: number };

  // Original index of submitted steps before any undo operations
  // This helps redo operations restore the correct submittedIndex
  // Keeps track of the highest committed position across branches
  originalSubmittedIndex: number;

  // Prevents undo operations before this index (safety threshold)
  preventUndoBeforeIndex: number;

  // Stores steps that were reverted/removed for potential recovery
  revertSteps: TransactionValue[];

  // The main sequence of transaction steps/operations
  steps: TransactionValue[];

  // Index of the last submitted/confirmed transaction
  // Tracks the most recent position that has been committed/saved
  submittedIndex: number;

  // Special indexes that mark important undo points/checkpoints
  undoStepIndexes: number[];

  // Transaction status for more explicit state tracking
  status: "idle" | "modified" | "committed" | "reverted" | "error";

  // Timestamp of last modification for better auditing
  lastModified: number;

  // Optional error information if status is 'error'
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Checks if there are steps that haven't been committed yet
 * (i.e., the user has made changes after the last save)
 */
export function hasUncommittedChanges(txn: TransactionDetail): boolean {
  return txn.activeUndoIndex > txn.submittedIndex;
}

/**
 * Checks if the user has undone steps that were previously committed
 * (i.e., going backward in history past a saved point)
 */
export function hasRevertedCommittedChanges(txn: TransactionDetail): boolean {
  return txn.activeUndoIndex < txn.originalSubmittedIndex;
}

/**
 * Checks if we're at a point where previously-reverted operations
 * have been restored through redo
 */
export function isAtRedoneCommittedState(txn: TransactionDetail): boolean {
  return (
    txn.activeUndoIndex === txn.submittedIndex &&
    txn.submittedIndex < txn.originalSubmittedIndex
  );
}

/**
 * Checks if we're at a fully committed state with no pending changes
 */
export function isFullyCommitted(txn: TransactionDetail): boolean {
  return (
    txn.activeUndoIndex === txn.submittedIndex &&
    txn.submittedIndex === txn.originalSubmittedIndex &&
    txn.revertSteps.length === 0 &&
    txn.status === "committed"
  );
}

/**
 * Determines the appropriate transaction status based on the current state
 * of the undo/redo indices and other transaction properties.
 *
 * This centralizes our status determination logic in one place for consistency.
 *
 * @param txn The transaction detail object
 * @returns The appropriate status for the current transaction state
 */
export function determineTransactionStatus(
  txn: TransactionDetail,
): "idle" | "modified" | "committed" | "reverted" | "error" {
  // If there's an error, preserve that status
  if (txn.status === "error") {
    return "error";
  }

  // If we've undone committed steps
  if (txn.activeUndoIndex < txn.originalSubmittedIndex) {
    return "reverted";
  }

  // If we're at exactly a committed point
  if (txn.activeUndoIndex === txn.submittedIndex) {
    // Special case: if we're at submittedIndex but below originalSubmittedIndex,
    // this means we've restored some previously committed steps but not all of them
    if (txn.submittedIndex < txn.originalSubmittedIndex) {
      return "modified";
    }
    return "committed";
  }

  // Otherwise we have uncommitted changes
  return "modified";
}

/**
 * Determines if a transaction has changes that need to be committed.
 * This can happen in several scenarios:
 * 1. There are uncommitted steps (activeUndoIndex > submittedIndex)
 * 2. Steps have been reverted from a previously committed state (activeUndoIndex < originalSubmittedIndex)
 * 3. There are explicit revert steps stored
 * 4. The transaction is in a 'reverted' or 'modified' status
 * 5. We're at a point where previously-reverted steps have been redone
 */
export function hasChangesToCommit(txn: TransactionDetail): boolean {
  // Special case: full committed state with nothing to do
  if (isFullyCommitted(txn)) {
    return false;
  }

  // Check if any steps would need to be committed based on indices
  const hasStepsToCommit =
    hasUncommittedChanges(txn) ||
    hasRevertedCommittedChanges(txn) ||
    isAtRedoneCommittedState(txn) ||
    (txn.revertSteps && txn.revertSteps.length > 0);

  // Also check status for explicit indication of changes
  const hasChangesBasedOnStatus =
    txn.status === "modified" || txn.status === "reverted";

  return hasStepsToCommit || hasChangesBasedOnStatus;
}
