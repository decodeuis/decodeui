import type { SetStoreFunction, Store } from "solid-js/store";

import { getNamedIndex } from "../value/getNamedIndex";
import { revertTransactionUpToIndex } from "./revertTransactionUpToIndex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/**
 * Resets a transaction to its initial state by reverting all changes up to the initial index.
 * If no initial index is found, no action is taken.
 */
export function resetTransaction(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): void {
  const initialIndex = getNamedIndex(txnId, "initial", graph);
  if (initialIndex === undefined) {
    return;
  }
  revertTransactionUpToIndex(txnId, initialIndex - 1, graph, setGraph);
}
