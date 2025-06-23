// use it when new field is drag and drop.
import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";

import { isUniqueIdUsed } from "~/features/page_designer/functions/form/isUniqueIdUsed";

export function getUniqueName(
  _txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
  layoutVertex: Vertex,
) {
  let uniqueId = 1;

  while (
    isUniqueIdUsed(
      graph,
      setGraph,
      formVertex,
      layoutVertex,
      `unique_${uniqueId}`,
    )
  ) {
    uniqueId++;
  }

  return `unique_${uniqueId}`;
}
