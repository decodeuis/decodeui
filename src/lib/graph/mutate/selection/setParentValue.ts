import type { SetStoreFunction, Store } from "solid-js/store";

import { useToast } from "~/components/styled/modal/Toast";

import { getInEdge } from "../../get/sync/edge/getInEdge";
import { generateNewVertexId } from "../core/generateNewVertexId";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import { newEdge } from "~/lib/graph/mutate/core/edge/newEdge";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setParentValue(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertex: Vertex,
  meta: Vertex,
  value?: Id | Id[],
) {
  const { showErrorToast, showWarningToast } = useToast();

  // delete removed edges:
  const type = getInEdge(meta, vertex);
  if (!type) {
    showWarningToast("edge type cant be empty");
  }
  const previousEdges = vertex.IN[type] || [];

  let valueArray = [] as Id[];

  if (Array.isArray(value)) {
    valueArray = value;
  } else if (value !== null && value !== undefined) {
    valueArray = [value];
  } else {
    valueArray = [];
  }

  for (const edgeId of previousEdges) {
    // we should not delete edge that start with same vertex
    if (valueArray.includes(graph.edges[edgeId].S)) {
      continue;
    }
    const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
    if (deleteEdgeResult?.error) {
      showErrorToast(deleteEdgeResult.error.toString());
    }
  }

  // add added edges:
  for (const vertexId of valueArray) {
    if (vertexInEdgeContainVertex(vertex, type, vertexId, graph)) {
      continue;
    }

    const insertEdgeResult = addNewEdge(
      txnId,
      newEdge(
        generateNewVertexId(graph, setGraph),
        type,
        {},
        vertexId,
        vertex.id,
      ),
      graph,
      setGraph,
    );
    if (insertEdgeResult.error) {
      showErrorToast(insertEdgeResult.error.toString());
    }
  }
}

function vertexInEdgeContainVertex(
  vertex: Vertex,
  type: any,
  vertexId: Id,
  graph: Store<GraphInterface>,
) {
  const inEdges = vertex.IN[type] || [];
  let includesVertexId = false;
  for (const edgeId of inEdges) {
    const startVertex = graph.edges[edgeId].S;
    if (startVertex === vertexId) {
      includesVertexId = true;
      break;
    }
  }
  return includesVertexId;
}
