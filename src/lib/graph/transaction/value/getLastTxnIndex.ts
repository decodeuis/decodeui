import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getLastTxnIndex(txnId: number, graph: GraphInterface): number {
  const txnVertex = graph.vertexes[`txn${txnId}`];
  return txnVertex?.P.steps && txnVertex.P.steps.length > 0
    ? txnVertex.P.steps.length - 1
    : -1;
}
