import type { SetStoreFunction } from "solid-js/store";

import { getDefaultTxnValue } from "../value/getDefaultTxnValue";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function generateNewTxnId(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): number {
  const globalStoreId = "globalStoreId";
  const txnId = graph.vertexes[globalStoreId].P.txnId_ + 1;

  mergeVertexProperties(0, globalStoreId, graph, setGraph, { txnId_: txnId });

  addNewVertex(
    0,
    {
      id: `txn${txnId}`,
      IN: {},
      L: ["Transaction"],
      OUT: {},
      P: {
        ...getDefaultTxnValue(),
        undoStepIndexes: [],
      },
    },
    graph,
    setGraph,
  );

  return txnId;
}
