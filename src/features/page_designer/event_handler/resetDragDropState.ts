import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function resetDragDropState(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id,
      graph,
      setGraph,
      {
        activeItem: null,
        draggedVertexIds: [],
        dragPosition: null,
      },
    );
  });
}
