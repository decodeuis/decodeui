import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function isPermissionsConfigurable(
  graph: GraphInterface,
  formDataId?: Id,
): boolean {
  if (!formDataId) {
    return false;
  }

  const formDataType = graph.vertexes[formDataId]?.L?.[0];
  return formDataType === "Page";
}
