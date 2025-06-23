import type { SetStoreFunction, Store } from "solid-js/store";

import { undo } from "../history/undo";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function revertTransactionUpToIndex(
  txnId: number,
  txnIndex: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  undo(txnId, graph, setGraph, txnIndex, true);
}
