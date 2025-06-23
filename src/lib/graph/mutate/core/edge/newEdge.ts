import type { Id } from "~/lib/graph/type/id";
import type { Edge } from "~/lib/graph/type/edge";

export function newEdge(
  edgeId: Id,
  type: string,
  properties: { [key: string]: unknown },
  startVertexId: Id,
  endVertexId: Id,
): Edge {
  if (!startVertexId) {
    console.error("edge startId should not be empty");
  }
  if (!endVertexId) {
    console.error("edge endId should not be empty");
  }
  return {
    E: endVertexId,
    id: edgeId,
    P: properties,
    S: startVertexId,
    T: type,
  };
}
