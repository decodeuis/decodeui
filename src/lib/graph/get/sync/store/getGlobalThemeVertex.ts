import { evalExpression } from "~/lib/expression_eval";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/store/getGlobalSettingVertex";

import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getGlobalThemeVertex(
  graph: GraphInterface,
): undefined | Vertex {
  const globalSettingVertex = getGlobalSettingVertex(graph);
  if (!globalSettingVertex) {
    return;
  }
  return evalExpression("->$0Theme", {
    graph,
    setGraph: () => {},
    vertexes: [globalSettingVertex],
  })?.[0];
}
