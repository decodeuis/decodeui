import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { GraphData } from "~/cypher/types/ServerResult";
import type { UpdateOptions } from "~/lib/graph/mutate/core/setGraphData";

import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import { replaceEdgeProperties } from "~/lib/graph/mutate/core/edge/replaceEdgeProperties";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function setGraphDataWithTransaction(
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  args: GraphData,
  options: UpdateOptions = {},
): { error: boolean | string; txnDetailIndex?: number } {
  let error: boolean | string = false;
  let txnDetailIndex: number | undefined = undefined;

  batch(() => {
    for (const vertexId in args.vertexes) {
      const result = updateVertexWithTransaction(
        txnId,
        vertexId,
        args.vertexes[vertexId],
        graph,
        setGraph,
        options,
      );
      if (result.error) {
        error = result.error;
      }
      if (result.txnDetailIndex !== undefined) {
        txnDetailIndex = result.txnDetailIndex;
      }
    }

    for (const edgeId in args.edges) {
      const result = updateEdgeWithTransaction(
        txnId,
        edgeId,
        args.edges[edgeId],
        graph,
        setGraph,
        options,
      );
      if (result.error) {
        error = result.error;
      }
      if (result.txnDetailIndex !== undefined) {
        txnDetailIndex = result.txnDetailIndex;
      }
    }

    if (args.deleted_edges || args.deleted_vertexes) {
      const result = handleDeletionsWithTransaction(
        txnId,
        args.deleted_edges,
        args.deleted_vertexes,
        graph,
        setGraph,
        options,
      );
      if (result.error) {
        error = result.error;
      }
      if (result.txnDetailIndex !== undefined) {
        txnDetailIndex = result.txnDetailIndex;
      }
    }
  });

  return { error, txnDetailIndex };
}

export function updateEdgeWithTransaction(
  txnId: number,
  edgeId: string,
  edge: Edge,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
): { error: boolean | string; txnDetailIndex?: number } {
  const { skipExisting = false } = options;

  const originalEdge = graph.edges[edgeId];

  // NOTE: this skipExisting may cause bug in rare cases here
  if (skipExisting && originalEdge) {
    return { error: false };
  }

  if (originalEdge) {
    if (JSON.stringify(originalEdge.P) !== JSON.stringify(edge.P)) {
      const result = replaceEdgeProperties(
        txnId,
        edgeId,
        graph,
        setGraph,
        originalEdge.P,
        options,
      );
      if (result.error) {
        return result;
      }
    }
  } else {
    return addNewEdge(txnId, edge, graph, setGraph, options);
  }

  return {
    error: false,
    txnDetailIndex: getLastTxnIndex(txnId, graph),
  };
}

export function updateVertexWithTransaction(
  txnId: number,
  vertexId: string,
  vertexData: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
): { error: boolean | string; txnDetailIndex?: number } {
  const { skipExisting = false } = options;

  const originalVertex = graph.vertexes[vertexId];

  if (skipExisting && originalVertex) {
    return { error: false };
  }

  return originalVertex
    ? replaceVertexProperties(
        txnId,
        vertexId,
        graph,
        setGraph,
        originalVertex.P,
        options,
      )
    : addNewVertex(txnId, vertexData, graph, setGraph, options);
}

function handleDeletionsWithTransaction(
  txnId: number,
  deletedEdges: string[] | undefined,
  deletedVertexes: string[] | undefined,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
): { error: boolean | string; txnDetailIndex?: number } {
  let error: boolean | string = false;
  let txnDetailIndex: number | undefined = undefined;

  for (const edgeId of deletedEdges || []) {
    const result = deleteEdge(txnId, edgeId, graph, setGraph, options);
    if (result.error) {
      error = result.error;
    }
    if (result.txnDetailIndex !== undefined) {
      txnDetailIndex = result.txnDetailIndex;
    }
  }

  for (const vertexId of deletedVertexes || []) {
    const result = deleteVertex(txnId, vertexId, graph, setGraph, options);
    if (result.error) {
      error = result.error;
    }
    if (result.txnDetailIndex !== undefined) {
      txnDetailIndex = result.txnDetailIndex;
    }
  }

  return { error, txnDetailIndex };
}
