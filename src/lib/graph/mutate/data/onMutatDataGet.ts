import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { MutationResult } from "~/cypher/types/MutationArgs";

import { useToast } from "~/components/styled/modal/Toast";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { updateVertexId } from "~/lib/graph/mutate/core/vertex/updateVertexId";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import { updateEdgeId } from "~/lib/graph/mutate/core/edge/updateEdgeId";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function onMutatDataGet(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  d: MutationResult,
) {
  const { showErrorToast } = useToast();
  batch(() => {
    for (const txnObject of d.data) {
      // Vertexes and edges are interlinked.
      // It's complicated to insert replace without error.
      // When saving Form with Select field, table is giving error.
      if (txnObject.insert) {
        handleInsertVertex(
          txnObject.insert[0],
          txnObject.insert[1],
          graph,
          setGraph,
        );
      }
      if (txnObject.insertEdge) {
        handleInsertEdge(
          txnObject.insertEdge[0],
          txnObject.insertEdge[1],
          graph,
          setGraph,
        );
      }
      if (txnObject.deleteVertex) {
        handleDeleteVertex(
          txnObject.deleteVertex.error,
          txnObject.deleteVertex.id,
          txnObject.deleteVertex.message,
          graph,
          setGraph,
          showErrorToast,
        );
      }
      if (txnObject.deleteEdge) {
        handleDeleteEdge(
          txnObject.deleteEdge.error,
          txnObject.deleteEdge.id,
          txnObject.deleteEdge.message,
          graph,
          setGraph,
          showErrorToast,
        );
      }
      // TODO: handle other cases for replace
    }

    /*if (isAllTxnProcessed(graph)) {
      mergeVertexProperties(0, "globalStoreId", graph, setGraph, {vertexOldIdToNewIdMap: []})
      mergeVertexProperties(0, "globalStoreId", graph, setGraph, {edgeOldIdToNewIdMap: []})
    } else {
      // commitTxn(txnId, graph);
    }*/
  });
}

function handleDeleteEdge(
  error: boolean,
  edgeId: string,
  message: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (msg: string) => void,
) {
  if (error) {
    showErrorToast(message);
  } else {
    // If the edge was successfully deleted on the server,
    // ensure it's also removed from the client-side graph
    deleteEdge(0, edgeId, graph, setGraph);
  }
}

function handleDeleteVertex(
  error: boolean,
  vertexId: string,
  message: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (msg: string) => void,
) {
  if (error) {
    showErrorToast(message);
  } else {
    // If the vertex was successfully deleted on the server,
    // ensure it's also removed from the client-side graph
    deleteVertex(0, vertexId, graph, setGraph);
  }
}

function handleInsertEdge(
  oldId: string,
  newId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties(0, "edgeOldIdToNewIdMap", graph, setGraph, {
    [oldId]: newId,
  });
  updateEdgeId(oldId, newId, graph, setGraph);
}

function handleInsertVertex(
  oldId: string,
  newId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties(0, "vertexOldIdToNewIdMap", graph, setGraph, {
    [oldId]: newId,
  });
  updateVertexId(oldId, newId, graph, setGraph);
}
