import type { TransactionDetail } from "../types/TransactionDetail";

export function getDefaultTxnValue() {
  return {
    activeUndoIndex: -1,
    namedUndoStepIndexes: {},
    originalSubmittedIndex: -1,
    preventUndoBeforeIndex: -1,
    revertSteps: [],
    steps: [],
    submittedIndex: -1,
    undoStepIndexes: [],
  } as TransactionDetail;
}
