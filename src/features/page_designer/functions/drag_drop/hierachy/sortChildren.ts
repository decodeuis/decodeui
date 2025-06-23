import type { SetStoreFunction, Store } from "solid-js/store";

import { getChildrenAttrs } from "../../layout/getChildrenAttrs";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function sortChildren(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: undefined | Vertex,
  toParentVertex: Vertex,
  toVertex: undefined | Vertex,
  dragPosition: string,
) {
  let displayOrder = 1;
  const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex!);
  for (const child of childrenAttrs) {
    if (child.id === fromVertex?.id && dragPosition !== "center") {
      continue;
    }
    // const childIndex = child.P.displayOrder;
    // if (childIndex === undefined) {
    //  alert ('childIndex Pos should not be undefined.');
    // }
    if (child.id === toVertex?.id) {
      if (!fromVertex) {
        continue;
      }
      // childIndex === toIndex, childIndex may be undefined.
      if (dragPosition === "before" || dragPosition === "left") {
        if (fromVertex?.P.displayOrder !== displayOrder) {
          mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
            displayOrder,
          });
        }
        displayOrder++;
        if (child.P.displayOrder !== displayOrder) {
          mergeVertexProperties(txnId, child.id, graph, setGraph, {
            displayOrder,
          });
        }
        displayOrder++;
      } else if (dragPosition === "after" || dragPosition === "right") {
        if (child.P.displayOrder !== displayOrder) {
          mergeVertexProperties(txnId, child.id, graph, setGraph, {
            displayOrder,
          });
        }
        displayOrder++;
        if (fromVertex?.P.displayOrder !== displayOrder) {
          mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
            displayOrder,
          });
        }
        displayOrder++;
      }
    } else {
      if (child.P.displayOrder !== displayOrder) {
        mergeVertexProperties(txnId, child.id, graph, setGraph, {
          displayOrder,
        });
      }
      displayOrder++;
    }
  }
}
