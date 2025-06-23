import type { SetStoreFunction } from "solid-js/store";

import { fetchAndSetGraphData } from "~/lib/graph/mutate/data/fetchAndSetGraphData";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function getParentData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  folderId?: string,
  fileId?: string,
) {
  const expression = getExpressionForParentData(
    toParentEdgeType,
    folderId,
    fileId,
  );
  if (!expression) {
    return { error: "Invalid expression" };
  }

  return await fetchAndSetGraphData(graph, setGraph, expression, {});
}

function getExpressionForParentData(
  toParentEdgeType: string,
  folderId?: string,
  fileId?: string,
) {
  // -> operator not return current vertex
  return `id:'${folderId || fileId}'->'${toParentEdgeType}*'`;
}
