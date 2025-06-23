import type { SetStoreFunction } from "solid-js/store";

import { componentDrop } from "~/features/page_designer/functions/drag_drop/core/componentDrop";
import { sortChildren } from "~/features/page_designer/functions/drag_drop/hierachy/sortChildren";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function handlePageDrag(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex,
  toParentVertex: undefined | Vertex,
  formData: Vertex,
  dragPosition: string,
) {
  const layoutRowId = componentDrop(
    formData,
    txnId,
    fromVertex,
    toParentVertex || formData,
    graph,
    setGraph,
    undefined,
    undefined,
    toVertex,
    dragPosition,
  );
  if (layoutRowId === -1) {
    return;
  }

  fromVertex = graph.vertexes[layoutRowId];

  sortChildren(
    graph,
    setGraph,
    txnId,
    fromVertex,
    toParentVertex!,
    toVertex,
    dragPosition,
  );
}
