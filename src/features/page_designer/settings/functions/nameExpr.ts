import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function nameExpr(
  v: Vertex,
  componentName: string,
  _graph: GraphInterface,
) {
  let displayName = componentName;
  if (componentName === "Html") {
    displayName = v.P.as ? `Html (${v.P.as})` : "Html";
  }
  return `${displayName ? ` ${displayName}` : ""}${v.P.layerName ? ` (${v.P.layerName})` : ""}`;
}
