import type { Store } from "solid-js/store";

import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function findVertexByLabelAndPks(
  label: string,
  value: {
    [key: string]: boolean | number | string;
  },
  graph: Store<GraphInterface>,
) {
  if (!value) {
    return undefined;
  }
  const vertexId = (graph.vertexLabelIdMap[label] || []).find((vertexId) => {
    for (const valueKey in value) {
      if (value[valueKey] !== graph.vertexes[vertexId].P[valueKey]) {
        return false;
      }
    }
    return true;
  });
  return vertexId ? graph.vertexes[vertexId] : undefined;
}

export function findVertexByLabelAndUniqueId(
  graph: Store<GraphInterface>,
  label: string,
  attribute: string,
  value: number | string,
) {
  if (!value) {
    return undefined;
  }
  const vertexId = (graph.vertexLabelIdMap[label] || []).find(
    (vertexId) => value === graph.vertexes[vertexId].P[attribute],
  );
  return vertexId ? graph.vertexes[vertexId] : undefined;
}

export function findVertexByLabelAndUniqueIdWithSkip(
  label: string,
  attribute: string,
  value: any,
  skipId: Id,
  graph: Store<GraphInterface>,
) {
  let vertexIds = graph.vertexLabelIdMap[label] || [];
  if (skipId !== undefined) {
    vertexIds = vertexIds.filter((value) => value !== skipId);
  }
  const vertexId = vertexIds.find(
    (vertexId) => value === graph.vertexes[vertexId].P[attribute],
  );

  return vertexId ? graph.vertexes[vertexId] : undefined;
}

// helper function to find all the vertex ids of the label
export function findVertexIdsByLabel(
  graph: Store<GraphInterface>,
  label: string,
): Id[] {
  return graph.vertexLabelIdMap[label] || [];
}
