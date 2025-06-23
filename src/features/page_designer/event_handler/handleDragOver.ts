import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";

import { validateDragOver } from "~/features/page_designer/functions/drag_drop/core/validateDragOver";

import { handleDragOverAndSetDropPosition } from "./handleDragOverAndSetDropPosition";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function handleDragOver(
  e: DragEvent,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertex: Vertex,
  isDesignMode: boolean | undefined,
  collapsedKeys: Accessor<Id[]> | boolean,
  children: Accessor<Vertex[]>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex,
  expandChildren?: (dragPosition: string) => void,
) {
  e.stopPropagation();

  handleDragOverAndSetDropPosition(
    e,
    layoutStoreVertex,
    formStoreVertex,
    layoutVertex,
    isDesignMode,
    collapsedKeys,
    children,
    graph,
    setGraph,
    formData,
  );

  if (!layoutStoreVertex.P.dragPosition) {
    // Don't allow drag and drop
    return;
  }
  expandChildren?.(layoutStoreVertex.P.dragPosition!);

  for (const vertexId of layoutStoreVertex.P.draggedVertexIds) {
    const fromVertex = graph.vertexes[vertexId];
    const toVertexId = layoutStoreVertex.P.activeItem!;
    if (!fromVertex) {
      // Don't allow drag and drop
      return;
    }

    if (
      !validateDragOver(
        graph,
        setGraph,
        fromVertex,
        toVertexId,
        formData,
        layoutStoreVertex.P.dragPosition!,
      )
    ) {
      // Don't allow drag and drop
      return;
    }
  }

  // This is necessary to allow the drop action to proceed
  e.preventDefault();
}
