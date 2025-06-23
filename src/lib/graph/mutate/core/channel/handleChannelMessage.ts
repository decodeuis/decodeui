//  currently we assume that each iframe has unique channel ID
import { reconcile, type SetStoreFunction } from "solid-js/store";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { updateVertexId } from "~/lib/graph/mutate/core/vertex/updateVertexId";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { replaceEdgeProperties } from "~/lib/graph/mutate/core/edge/replaceEdgeProperties";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import { updateEdgeId } from "~/lib/graph/mutate/core/edge/updateEdgeId";
import { updateEdge, updateVertex } from "~/lib/graph/mutate/core/setGraphData";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function handleChannelMessage(
  msg: any,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  id: string,
  addChannelId?: string,
  skipTransactionDetail?: boolean, // Transaction is processed on Iframe Itself.
) {
  const data = JSON.parse(msg);
  // initial data:
  if (data.graph) {
    setGraph(reconcile(data.graph, { merge: true }));
    if (addChannelId) {
      setGraph("broadcastChannels", (channels) =>
        channels.includes(addChannelId)
          ? channels
          : [...channels, addChannelId],
      );
    }
  }

  // Vertex functions:
  if (data.addNewVertex) {
    addNewVertex(
      data.addNewVertex.txnId,
      data.addNewVertex.vertex,
      graph,
      setGraph,
      { skipPostMessage: id, skipTransactionDetail },
    );
  }
  if (data.replaceVertexProperties) {
    replaceVertexProperties(
      data.replaceVertexProperties.txnId,
      data.replaceVertexProperties.vertexId,
      graph,
      setGraph,
      data.replaceVertexProperties.properties,
      { skipPostMessage: id, skipTransactionDetail },
    );
  }
  if (data.mergeVertexProperties) {
    mergeVertexProperties(
      data.mergeVertexProperties.txnId,
      data.mergeVertexProperties.vertexId,
      graph,
      setGraph,
      data.mergeVertexProperties.properties,
      { skipPostMessage: id, skipTransactionDetail },
    );
  }
  if (data.deleteVertex) {
    deleteVertex(
      data.deleteVertex.txnId,
      data.deleteVertex.vertexId,
      graph,
      setGraph,
      { skipPostMessage: id, skipTransactionDetail },
    );
  }
  if (data.updateVertexId) {
    updateVertexId(
      data.updateVertexId.oldVertexId,
      data.updateVertexId.newVertexId,
      graph,
      setGraph,
      { skipPostMessage: id, skipTransactionDetail },
    );
  }
  // Edge functions:
  if (data.addNewEdge) {
    addNewEdge(data.addNewEdge.txnId, data.addNewEdge.edge, graph, setGraph, {
      skipPostMessage: id,
      skipTransactionDetail,
    });
  }
  if (data.replaceEdgeProperties) {
    replaceEdgeProperties(
      data.replaceEdgeProperties.txnId,
      data.replaceEdgeProperties.edgeId,
      graph,
      setGraph,
      data.replaceEdgeProperties.properties,
      { skipPostMessage: id, skipTransactionDetail },
    );
  }
  if (data.deleteEdge) {
    deleteEdge(data.deleteEdge.txnId, data.deleteEdge.edgeId, graph, setGraph, {
      skipPostMessage: id,
      skipTransactionDetail,
    });
  }
  if (data.updateEdgeId) {
    updateEdgeId(
      data.updateEdgeId.oldEdgeId,
      data.updateEdgeId.newEdgeId,
      graph,
      setGraph,
      { skipPostMessage: id, skipTransactionDetail },
    );
  }
  // setGraphData functions:
  if (data.updateVertex) {
    updateVertex(
      data.updateVertex.vertexId,
      data.updateVertex.vertexData,
      graph,
      setGraph,
      {
        ...(data.updateVertex.options ?? {}),
        skipPostMessage: id,
        skipTransactionDetail,
      },
    );
  }
  if (data.updateEdge) {
    updateEdge(data.updateEdge.edgeId, data.updateEdge.edge, graph, setGraph, {
      ...(data.updateEdge.options ?? {}),
      skipPostMessage: id,
      skipTransactionDetail,
    });
  }
}
