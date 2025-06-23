import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";
import { uniqueNameKey } from "~/features/page_designer/constants/constant";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";

export function isUniqueIdUsed(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
  layoutVertex: Vertex,
  key: string,
) {
  function checkVertex(attrVertex: Vertex) {
    if (
      attrVertex.P[uniqueNameKey] === key &&
      attrVertex.id !== layoutVertex.id
    ) {
      return true;
    }

    return getChildrenAttrs(graph, setGraph, attrVertex).some(checkVertex);
  }

  return getChildrenAttrs(graph, setGraph, formVertex).some(checkVertex);
}
