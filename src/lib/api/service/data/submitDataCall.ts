import type { SetStoreFunction, Store } from "solid-js/store";

import type { MutationArgs } from "~/cypher/types/MutationArgs";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { onMutatDataGet } from "~/lib/graph/mutate/data/onMutatDataGet";
import { updateSubmittedIndex } from "~/lib/graph/transaction/core/updateSubmittedIndex";
import type { TransactionDetail } from "~/lib/graph/transaction/types/TransactionDetail";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

// Submit generic data to the server
export async function submitDataCall(
  data: MutationArgs,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
) {
  try {
    // Mark transaction as processing
    const txnVertex = graph.vertexes[`txn${txnId}`];
    const txnDetail = txnVertex.P as TransactionDetail;
    replaceVertexProperties<TransactionDetail>(
      0,
      `txn${txnId}`,
      graph,
      setGraph,
      {
        ...txnDetail,
        status: "modified",
        lastModified: Date.now(),
      },
      { cloneProperties: false },
    );
    const result = await postAPI(API.submitDataUrl, data);
    // @ts-expect-error ignore
    onMutatDataGet(graph, setGraph, result);
    updateSubmittedIndex(txnId, graph, setGraph);
    return result;
  } catch (error: unknown) {
    const txnVertex = graph.vertexes[`txn${txnId}`];
    const txnDetail = txnVertex.P as TransactionDetail;
    replaceVertexProperties(
      0,
      `txn${txnId}`,
      graph,
      setGraph,
      {
        ...txnDetail,
        status: "error",
        error: {
          code: "COMMIT_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Unknown error during commit",
          details: error,
        },
        lastModified: Date.now(),
      } as unknown as { [key: string]: unknown },
      { cloneProperties: false },
    );
    throw error;
  }
}
