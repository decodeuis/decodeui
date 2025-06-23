import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getEdgeOldIdToNewIdMap(graph: GraphInterface) {
  const vertex = graph.vertexes.edgeOldIdToNewIdMap as Vertex<Record<Id, Id>>;
  return vertex ? vertex.P : {};
}

export function getGlobalStore(graph: GraphInterface) {
  return (
    (graph.vertexes.globalStoreId as Vertex<GlobalProperties>) ??
    ({ P: {} } as Vertex<GlobalProperties>)
  );
}

export function getVertexOldIdToNewIdMap(graph: GraphInterface) {
  const vertex = graph.vertexes.vertexOldIdToNewIdMap as Vertex<Record<Id, Id>>;
  return vertex ? vertex.P : {};
}
