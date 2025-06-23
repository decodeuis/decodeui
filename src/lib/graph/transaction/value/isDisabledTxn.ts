import type { Store } from "solid-js/store";

import type { TransactionDetail } from "../types/TransactionDetail";
import { hasChangesToCommit } from "../types/TransactionDetail";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function isDisabledTxn(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId) {
    return true;
  }

  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return true;
  }

  const txnDetail = txnVertex.P as TransactionDetail;

  // If transaction has an error status, it's disabled
  if (txnDetail.status === "error") {
    return true;
  }

  // Enable if there are any changes to commit
  return !hasChangesToCommit(txnDetail);
}
