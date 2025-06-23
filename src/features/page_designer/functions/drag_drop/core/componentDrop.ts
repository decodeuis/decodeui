import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona";
import { batch } from "solid-js";

import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { createAttrMetaVertex } from "~/features/page_designer/functions/drag_drop/attributes/createAttrMetaVertex";
import { processChildrenAttrs } from "~/features/page_designer/functions/drag_drop/hierachy/processChildrenAttrs";
import { addNewRow } from "~/lib/graph/mutate/form/addNewRow";

import { uniqueNameKey } from "../../../constants/constant";
import { getChildrenAttrs } from "../../layout/getChildrenAttrs";
import { getCompPropsObj } from "../attributes/getCompPropsObj";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { getUniqueName } from "~/features/page_designer/functions/form/getUniqueName";

// @Note:
// From Component To Layout drag:
// 1. Create a Row to proper parent.
// 2. Sort properly
export function componentDrop(
  formVertex: Vertex,
  txnId: number,
  fromVertex: Vertex,
  toParentVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  toIndex?: number,
  properties?: { [key: string]: number | string },
  toVertex?: Vertex,
  dragPosition = "center",
) {
  if (!fromVertex) {
    return -1;
  }

  const attrMetaVertex = createAttrMetaVertex(graph, setGraph);

  if (PageDesignerLabels.includes(fromVertex.L[0])) {
    return (
      processChildrenAttrs(
        formVertex,
        fromVertex,
        toParentVertex,
        txnId,
        graph,
        setGraph,
        attrMetaVertex,
      )[0] ?? -1
    );
  }

  const uniqueName = getUniqueName(
    txnId,
    graph,
    setGraph,
    formVertex,
    attrMetaVertex,
  );

  let rowResult: {
    edgeId?: string | undefined;
    error: boolean;
    vertexId?: string | undefined;
  };
  let props = properties ?? {};

  // Calculate the dragPosition value
  const newDisplayOrderValue = calculateInitialDragPosition(
    graph,
    setGraph,
    toParentVertex,
    toVertex,
    dragPosition,
    toIndex,
  );
  props = {
    ...props,
    displayOrder: newDisplayOrderValue,
    [uniqueNameKey]: uniqueName,
  };

  if (fromVertex.L[0] === "Comp") {
    const compProps = getCompPropsObj(graph, fromVertex);
    props = { ...compProps, ...props, componentName: fromVertex.P.key };
    // if (fromVertex.P.key === "Text" && !props.text) {
    //   props = { ...props, text: "Sample Text" };
    // }
    if (fromVertex.P.key === "Html" && !props.as) {
      props = { ...props, as: "div" };
    }
  } else if (fromVertex.L[0] === "Attr") {
    const p = klona(fromVertex.P);
    delete p.displayOrder;
    delete p.key;
    props = { ...props, ...p };
  } else if (fromVertex.L[0] === "Component") {
    props = { ...props, componentName: fromVertex.P.key };
  }
  batch(() => {
    rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      graph,
      setGraph,
      toParentVertex,
      props,
      false,
    );

    const rowVertex = graph.vertexes[rowResult.vertexId!];

    if (fromVertex.L[0] === "Attr") {
      processChildrenAttrs(
        formVertex,
        fromVertex,
        rowVertex,
        txnId,
        graph,
        setGraph,
        attrMetaVertex,
      );
    }
  });

  return rowResult!.vertexId!;
}

/**
 * Calculate the dragPosition value for component placement
 */
function calculateInitialDragPosition(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentVertex: Vertex,
  toVertex?: Vertex,
  dragPosition = "center",
  toIndex?: number,
): number {
  // If toIndex is provided, use it directly
  if (toIndex !== undefined) {
    return toIndex;
  }

  const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex);
  const lastPos =
    childrenAttrs.length > 0
      ? Math.max(...childrenAttrs.map((child) => child.P.displayOrder || 0))
      : 0;

  // If no target vertex or center dragPosition, append at the end
  if (dragPosition === "center" || !toVertex) {
    return lastPos + 1;
  }

  // Find the dragPosition of the target vertex
  const targetIndex = childrenAttrs.findIndex(
    (child) => child.id === toVertex.id,
  );
  if (targetIndex === -1) {
    return lastPos + 1;
  }

  const posCounter = targetIndex + 1; // 1-based dragPosition

  if (dragPosition === "before" || dragPosition === "left") {
    return posCounter - 0.5;
  }
  if (dragPosition === "after" || dragPosition === "right") {
    // If this is the last item, add 1 instead of 0.5
    return posCounter === lastPos ? posCounter + 1 : posCounter + 0.5;
  }

  // Default fallback
  return lastPos + 1;
}
