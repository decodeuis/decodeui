import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";

import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { handleDropAtPosition } from "~/features/page_designer/functions/drag_drop/core/handleDropAtPosition";
import { loadPageData } from "~/features/page_designer/functions/fetch/loadPageData";

import { onLayoutItemClick } from "./onLayoutItemClick";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function handleDrop(
  e: DragEvent,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
) {
  e.stopPropagation();

  if (!layoutStoreVertex?.P.activeItem) {
    // layoutVertex
    showErrorToast("Active item not found when dropping");
    return;
  }
  const toVertex = graph.vertexes[layoutStoreVertex.P.activeItem!];
  if (!toVertex) {
    showErrorToast("Target vertex not found when dropping");
    return;
  }

  for (const vertexId of layoutStoreVertex.P.draggedVertexIds) {
    const fromVertex = graph.vertexes[vertexId];

    if (!fromVertex) {
      showErrorToast("from Vertex not found when dropping ");
      return;
    }

    if (!layoutStoreVertex?.P.dragPosition) {
      showErrorToast("Position not found when dropping");
      return;
    }

    if (PageDesignerLabels.includes(fromVertex.L[0])) {
      await loadPageData(graph, setGraph, fromVertex, showErrorToast);
    }

    // NOTE: Multiple selected dragged vertexes may not drop before or after as expected. test it.
    const layoutId = await handleDropAtPosition(
      graph,
      setGraph,
      formStoreVertex?.P.txnId,
      graph.vertexes[formStoreVertex.P.formDataId!],
      fromVertex,
      toVertex,
      layoutStoreVertex.P.dragPosition!,
    );
    if (
      (layoutId !== -1 && fromVertex.L[0] === "Comp") ||
      fromVertex.L[0] === "Component"
    ) {
      onLayoutItemClick(
        layoutStoreVertex,
        formStoreVertex,
        layoutId as string,
        graph,
        setGraph,
      );
    }
  }
}
