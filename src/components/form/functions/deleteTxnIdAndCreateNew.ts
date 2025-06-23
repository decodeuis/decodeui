import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { useGraph } from "~/lib/graph/context/UseGraph";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { FormStoreObject } from "~/components/form/context/FormContext";

export function deleteTxnIdAndCreateNew(
  txnId: number,
  formId: string,
  graph: GraphInterface,
  setGraph: ReturnType<typeof useGraph>[1],
) {
  // Delete existing transaction
  revertTransaction(txnId, graph, setGraph);
  // Generate and return a new transaction ID
  const newTxnId = generateNewTxnId(graph, setGraph);
  mergeVertexProperties<FormStoreObject>(0, formId, graph, setGraph, {
    txnId: newTxnId,
  });
  return newTxnId;
}
