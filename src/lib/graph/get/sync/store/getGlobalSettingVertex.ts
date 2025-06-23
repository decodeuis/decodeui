import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getGlobalSettingVertex(
  graph: GraphInterface,
): undefined | Vertex {
  const globalSettingId = graph.vertexLabelIdMap.GlobalSetting?.[0];
  if (!globalSettingId) {
    return;
  }
  return graph.vertexes[globalSettingId];
}
