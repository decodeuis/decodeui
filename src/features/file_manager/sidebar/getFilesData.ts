import type { SetStoreFunction } from "solid-js/store";

import { fetchAndSetGraphData } from "../../../lib/graph/mutate/data/fetchAndSetGraphData";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getExpressionForFilesData(
  toParentEdgeType: string,
  folderId: string | string[],
) {
  const ids = Array.isArray(folderId) ? folderId.join(",") : folderId;
  return `id:'${ids}'<-${toParentEdgeType}`;
}

export async function getFilesData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  folderId: string | string[],
) {
  const expression = getExpressionForFilesData(toParentEdgeType, folderId);
  return await fetchAndSetGraphData(graph, setGraph, expression);
}
