import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "../../../context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function onCompDragStart(
  e: DragEvent,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  childId: string,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  selectedComponents?: () => Set<Vertex>,
  setSelectedComponents?: (updater: (prev: Set<Vertex>) => Set<Vertex>) => void,
) {
  e.stopPropagation();

  mergeVertexProperties<PageLayoutObject>(
    0,
    layoutStoreVertex.id,
    graph,
    setGraph,
    {
      draggedVertexIds: [],
    },
  );
  if (!graph.vertexes[childId]) {
    console.error("Dragged vertex not found, this should not happen");
    return;
  }

  const draggedItems =
    selectedComponents && selectedComponents().size > 0
      ? Array.from(selectedComponents())
      : [graph.vertexes[childId]];

  mergeVertexProperties<PageLayoutObject>(
    0,
    layoutStoreVertex.id,
    graph,
    setGraph,
    {
      draggedVertexIds: [
        ...layoutStoreVertex.P.draggedVertexIds,
        ...draggedItems.map((v) => v.id),
      ],
    },
  );

  if (setSelectedComponents) {
    setSelectedComponents(() => new Set<Vertex>());
  }
}
