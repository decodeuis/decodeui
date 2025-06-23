import { isObject } from "~/lib/data_structure/object/isObject";

import { handleDeleteEdge } from "./handlers/edge/handleDeleteEdge";
import { handleInsertEdge } from "./handlers/edge/handleInsertEdge";
import { handleReplaceEdge } from "./handlers/edge/handleReplaceEdge";
import { handleDeleteVertex } from "./handlers/vertex/handleDeleteVertex";
import { handleInsert } from "./handlers/vertex/handleInsert";
import { handleMerge } from "./handlers/vertex/handleMerge";
import { handleReplace } from "./handlers/vertex/handleReplace";
import type { Id } from "~/lib/graph/type/id";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";
import type { VertexMap } from "~/lib/graph/type/vertexMap";

export async function handleMutationObject(
  mutationObject: any,
  tx: any,
  clientToServerVertexIdMap: Map<Id, Id>,
  clientToServerEdgeIdMap: Map<Id, Id>,
  txnResult: any[],
  vertexes: VertexMap = {},
  edges: EdgeMap = {},
  deletedVertexes: Id[] = [],
  deletedEdges: Id[] = [],
) {
  if (mutationObject.insert && isObject(mutationObject.insert)) {
    await handleInsert(
      mutationObject.insert,
      tx,
      clientToServerVertexIdMap,
      txnResult,
      vertexes,
    );
  }
  if (mutationObject.replace && isObject(mutationObject.replace)) {
    await handleReplace(
      mutationObject.replace,
      tx,
      clientToServerVertexIdMap,
      txnResult,
      vertexes,
    );
  }
  if (mutationObject.merge && isObject(mutationObject.merge)) {
    await handleMerge(
      mutationObject.merge,
      tx,
      clientToServerVertexIdMap,
      txnResult,
      vertexes,
    );
  }
  if (mutationObject.deleteVertex) {
    await handleDeleteVertex(
      mutationObject.deleteVertex,
      tx,
      clientToServerVertexIdMap,
      txnResult,
      deletedVertexes,
    );
  }
  if (mutationObject.insertEdge) {
    await handleInsertEdge(
      mutationObject.insertEdge,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
      edges,
    );
  }
  if (mutationObject.replaceEdge) {
    await handleReplaceEdge(
      mutationObject.replaceEdge,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
      edges,
    );
  }
  // if (mutationObject.replaceEdgeStart) {
  //   await handleReplaceEdgeStart(
  //     mutationObject.replaceEdgeStart,
  //     tx,
  //     clientToServerVertexIdMap,
  //     clientToServerEdgeIdMap,
  //     txnResult,
  //     edges,
  //   );
  // }
  // if (mutationObject.replaceEdgeEnd) {
  //   await handleReplaceEdgeEnd(
  //     mutationObject.replaceEdgeEnd,
  //     tx,
  //     clientToServerVertexIdMap,
  //     clientToServerEdgeIdMap,
  //     txnResult,
  //     edges,
  //   );
  // }
  if (mutationObject.deleteEdge) {
    await handleDeleteEdge(
      mutationObject.deleteEdge,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
      deletedEdges,
    );
  }
}
