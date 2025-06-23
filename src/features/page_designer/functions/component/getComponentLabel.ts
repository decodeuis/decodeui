import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

// Deprecated in favor of getComponentName, Delete this function
export function getComponentLabel(
  graph: GraphInterface,
  vertex: Vertex,
): string | undefined {
  const componentVertex = vertex.P.componentName
    ? findVertexByLabelAndUniqueId(
        graph,
        "Component",
        "key",
        vertex.P.componentName,
      )
    : undefined;

  return getComponentName(componentVertex, vertex);
}

export function getComponentName(
  componentVertex: Vertex | undefined,
  attrVertex: Vertex,
): string {
  return componentVertex?.P.key || attrVertex.P.componentName || "Html";
}
