// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
import type { SetStoreFunction, Store } from "solid-js/store";

import { useToast } from "~/components/styled/modal/Toast";

import { getToEdge } from "../../get/sync/edge/getToEdge";
import { generateNewVertexId } from "../core/generateNewVertexId";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import { newEdge } from "~/lib/graph/mutate/core/edge/newEdge";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setSelectionValue(
  txnId: number,
  vertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  meta: Vertex,
  value?: Id | Id[],
) {
  const { showErrorToast } = useToast();

  // delete removed edges:
  const type = getToEdge(meta, vertex);
  const previousEdges = vertex.OUT[type] || [];

  if (!Array.isArray(value)) {
    if (value !== null && value !== undefined) {
      value = [value];
    } else {
      value = [];
    }
  }

  for (const edgeId of previousEdges) {
    // we should not delete edge that end to same vertex
    if (value.includes(graph.edges[edgeId].E)) {
      continue;
    }
    const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
    if (deleteEdgeResult?.error) {
      showErrorToast(deleteEdgeResult.error.toString());
    }
  }

  // add added edges:
  for (const vertexId of value) {
    if (vertexOutEdgeContainVertex(vertex, type, vertexId, graph)) {
      continue;
    }
    const insertEdgeResult = addNewEdge(
      txnId,
      newEdge(
        generateNewVertexId(graph, setGraph),
        type,
        {},
        vertex.id,
        vertexId,
      ),
      graph,
      setGraph,
    );
    if (insertEdgeResult.error) {
      showErrorToast(insertEdgeResult.error.toString());
    }
  }
}

function vertexOutEdgeContainVertex(
  vertex: Vertex,
  type: string,
  vertexId: Id,
  graph: Store<GraphInterface>,
) {
  const outEdges = vertex.OUT[type] || [];
  let containsVertexId = false;

  for (const edgeId of outEdges) {
    const endVertex = graph.edges[edgeId].E;
    if (endVertex === vertexId) {
      containsVertexId = true;
      break;
    }
  }
  return containsVertexId;
}
