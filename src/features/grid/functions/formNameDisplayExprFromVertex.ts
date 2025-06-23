import type { Store } from "solid-js/store";

import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { getNameKeyForCollection } from "~/lib/graph/get/sync/entity/getNameKeyForCollection";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

// so in future can use more operators.

export function formNameDisplayExprFromVertex(
  graph: Store<GraphInterface>,
  collection?: string,
) {
  if (!collection) {
    return;
  }
  const collectionVertex = findVertexByLabelAndUniqueId(
    graph,
    "Page",
    "key",
    collection,
  );
  if (collectionVertex) {
    const nameKeys = getNameKeyForCollection(graph, collectionVertex);
    if (nameKeys.length === 0) {
      return;
    }
    return nameKeys.length === 1
      ? `::'P.${nameKeys[0]}'`
      : nameKeys.map((key) => `(::'P.${key}')`).join("+(' ')");
  }
}
