import type { Store } from "solid-js/store";

import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function loadForm(
  graph: Store<GraphInterface>,
  id: Id,
): { error: boolean | string; vertex?: Vertex } {
  if (!graph.vertexes[id]) {
    return { error: "vertex not found" };
  }
  const vertex = graph.vertexes[id];

  return {
    error: false,
    vertex: vertex,
  };
}
