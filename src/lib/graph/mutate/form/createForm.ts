import type { SetStoreFunction, Store } from "solid-js/store";

import { commitTxn } from "../../transaction/core/commitTxn";
import { generateNewTxnId } from "../../transaction/core/generateNewTxnId";
import { generateNewVertexId } from "../core/generateNewVertexId";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function createFormVertex(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  label: string,
  properties?: {
    [key: string]: any;
  },
): {
  error: string;
  vertex?: Vertex;
} {
  if (!label) {
    return { error: "Label not found" };
  }

  const isRealTime = false;
  if (isRealTime) {
    txnId = generateNewTxnId(graph, setGraph);
  }
  const newVertexObj = newVertex(
    generateNewVertexId(graph, setGraph),
    [label],
    properties || {},
  );
  // TODO: Do Create Transformation for the vertex
  const addNewVertexResult = addNewVertex(txnId, newVertexObj, graph, setGraph);
  if (addNewVertexResult.error) {
    return addNewVertexResult;
  }
  if (isRealTime) {
    commitTxn(txnId, graph);
  }
  const vertex = graph.vertexes[newVertexObj.id];
  return {
    error: "",
    vertex: vertex,
  };
}
