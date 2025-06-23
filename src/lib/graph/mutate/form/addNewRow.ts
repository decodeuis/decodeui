import type { SetStoreFunction, Store } from "solid-js/store";

import { batch, untrack } from "solid-js";

import { evalExpression } from "~/lib/expression_eval";

import { getInEdge } from "../../get/sync/edge/getInEdge";
import { getToEdge } from "../../get/sync/edge/getToEdge";
import { commitTxn } from "../../transaction/core/commitTxn";
import { generateNewTxnId } from "../../transaction/core/generateNewTxnId";
import { generateNewVertexId } from "../core/generateNewVertexId";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { newEdge } from "~/lib/graph/mutate/core/edge/newEdge";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function addNewRow(
  txnId: number,
  meta: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  parentVertex: Vertex,
  properties: { [key: string]: any },
  isRealTime: boolean,
) {
  return untrack(() => {
    if (isRealTime) {
      txnId = generateNewTxnId(graph, setGraph);
    }
    const type = meta.P.inward
      ? getInEdge(meta, parentVertex)
      : getToEdge(meta, parentVertex);
    const label = meta.P.label;

    const newRowResult = newRow(
      graph,
      setGraph,
      txnId,
      parentVertex,
      label,
      type,
      properties,
      meta.P.inward,
    );
    if (isRealTime) {
      commitTxn(txnId, graph);
    }
    return newRowResult;
  });
}

export function getSublistRows(
  graph: Store<GraphInterface>,
  meta: Vertex,
  vertex?: Vertex,
) {
  if (!vertex) {
    return [];
  }

  const type = meta.P.inward
    ? getInEdge(meta, vertex)
    : getToEdge(meta, vertex);
  return (
    evalExpression(meta.P.inward ? `<-${type}` : `->${type}`, {
      graph,
      vertexes: [vertex],
    }) || []
  ).sort((a: Vertex, b: Vertex) => a.P.displayOrder - b.P.displayOrder);
}

export function getSublistRowsForType(
  graph: Store<GraphInterface>,
  type: string,
  vertex: Vertex,
  _inward?: boolean,
) {
  return (
    evalExpression(`->${type}`, {
      graph,
      vertexes: [vertex],
    }) || []
  ).sort((a: Vertex, b: Vertex) => a.P.displayOrder - b.P.displayOrder);
}

export function newRow(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  parentVertex: Vertex,
  label: string,
  edgeType?: string,
  properties?: { [key: string]: any },
  inward?: boolean,
): { edgeId?: Id; error: boolean; vertexId?: Id } {
  return untrack(() =>
    batch(() => {
      const vertexNew = newVertex(
        generateNewVertexId(graph, setGraph),
        [label || edgeType!],
        properties,
      );
      const insertVertex = addNewVertex(txnId, vertexNew, graph, setGraph);
      if (insertVertex.error) {
        console.error(insertVertex.error.toString());
        return {
          error: true,
        };
      }

      const edgeNew = newEdge(
        generateNewVertexId(graph, setGraph),
        edgeType || label!,
        {},
        inward ? vertexNew.id : parentVertex.id,
        inward ? parentVertex.id : vertexNew.id,
      );
      const insertEdgeResult = addNewEdge(txnId, edgeNew, graph, setGraph);
      if (insertEdgeResult.error) {
        console.error(insertEdgeResult.error.toString());
        return {
          error: true,
          vertexId: vertexNew.id,
        };
      }
      return {
        edgeId: edgeNew.id,
        error: false,
        vertexId: vertexNew.id,
      };
    }),
  );
}
