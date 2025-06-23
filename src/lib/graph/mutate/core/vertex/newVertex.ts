// return a new Vertex
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

export function newVertex<T extends { [key: string]: any }>(
  id: Id,
  labels: string[],
  properties?: T,
): Vertex {
  return { id, IN: {}, L: labels, OUT: {}, P: properties || {} };
}
