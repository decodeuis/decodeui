import type { SetStoreFunction, Store } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function validateDragOver(
  graph: Store<GraphInterface>,
  _setGraph: SetStoreFunction<GraphInterface>,
  fromVertex: Vertex,
  toVertexId: Id | number,
  formData: Vertex,
  dragPosition: string,
) {
  // If fromVertex is not valid, don't allow drop
  if (!fromVertex) {
    return false;
  }
  // If fromVertex and toVertex are the same, don't allow drop
  if (fromVertex.id === toVertexId) {
    return false;
  }

  // Don't allow parent to move inside children.
  let parentVertex = graph.vertexes[toVertexId];
  while (true) {
    const parentResult = evalExpression("<-Attr", {
      graph,
      vertexes: [parentVertex],
    })?.[0];
    if (!parentResult) {
      break;
    }
    if (parentResult.id === fromVertex.id) {
      // Don't allow drag and drop
      return false;
    }
    parentVertex = parentResult;
  }

  if (dragPosition === "center") {
    // is Top Layer:
    if (toVertexId === formData.id) {
      // Allow drag over it
    } else {
      // each component can accept children
      // const compVertex = getComponentFromLayoutRow(toVertexId, graph, setGraph);
      // if (!compVertex?.P.child) {
      //   // Don't allow drag and drop
      //   return false;
      // }
    }
  } else {
    const toParentVertex = evalExpression("<-Attr", {
      graph,
      vertexes: [graph.vertexes[toVertexId]],
    })?.[0];

    if (!toParentVertex) {
      // Dont allow drag before and after first element
      return;
    }

    // const rootChildren = () => evalExpression("->Attr", { graph, setGraph, vertexes: [formData] }) || [];
    // const isFormRootVertetx = () => formData?.L?.[0] === "Page";
    const rootVertexes = () => {
      // if (isFormRootVertetx()) {
      //   return rootChildren();
      // }
      return [formData];
    };
    if (rootVertexes().includes(graph.vertexes[toVertexId])) {
      // Dont allow drag before and after first element
      return;
    }
  }
  return true;
}
