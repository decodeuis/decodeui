import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { useGraph } from "~/lib/graph/context/UseGraph";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { FormStoreObject } from "~/components/form/context/FormContext";

export function removeTxnIdAndCreateNew(
  txnId: number,
  formId: string,
  graph: GraphInterface,
  setGraph: ReturnType<typeof useGraph>[1],
) {
  deleteVertex(0, `txn${txnId}`, graph, setGraph);
  const newTxnId = generateNewTxnId(graph, setGraph);
  mergeVertexProperties<FormStoreObject>(0, formId, graph, setGraph, {
    txnId: newTxnId,
  });
  return newTxnId;
}
