import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";

import { validateDragOver } from "~/features/page_designer/functions/drag_drop/core/validateDragOver";
import { getIndicatorPosition } from "~/features/page_designer/functions/drag_drop/ui/getIndicatorPosition";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function handleDragOverAndSetDropPosition(
  e: DragEvent,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  _formStoreVertex: Vertex<FormStoreObject>,
  layoutVertex: Vertex,
  isDesignMode: boolean | undefined,
  collapsedKeys: Accessor<Id[]> | boolean,
  children: Accessor<Vertex[]>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex,
) {
  let dragPosition = getIndicatorPosition(e, e.currentTarget as HTMLElement) as
    | "after"
    | "before"
    | "center"
    | "left"
    | "right"
    | null;
  if (!dragPosition) {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id!,
      graph,
      setGraph,
      { activeItem: null, dragPosition: null },
    );
    return;
  }

  let activeItem: Id;
  if (dragPosition === "before" || dragPosition === "left") {
    activeItem = layoutVertex.id;
  } else if (dragPosition === "after" || dragPosition === "right") {
    if (
      isDesignMode ||
      typeof collapsedKeys !== "function" ||
      collapsedKeys().includes(layoutVertex.id)
    ) {
      // collapsed state
      activeItem = layoutVertex.id;
    } else {
      // expanded State
      if (children().length) {
        activeItem = children()[0].id;
        dragPosition = "before";
      } else {
        activeItem = layoutVertex.id;
      }
    }
  } else {
    // drop over
    activeItem = layoutVertex.id;
  }

  const fromVertex = graph.vertexes[layoutStoreVertex?.P.draggedVertexIds[0]];
  const toVertexId = activeItem;
  if (
    !validateDragOver(
      graph,
      setGraph,
      fromVertex,
      toVertexId,
      formData,
      dragPosition,
    )
  ) {
    dragPosition = null;
  }

  if (
    layoutStoreVertex.P.activeItem !== activeItem ||
    layoutStoreVertex.P.dragPosition !== dragPosition
  ) {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id!,
      graph,
      setGraph,
      { activeItem, dragPosition },
    );
  }
}
