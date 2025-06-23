import type { SetStoreFunction, Store } from "solid-js/store";

import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";

import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function createAttrMetaVertex(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return newVertex(generateNewVertexId(graph, setGraph), [], {
    componentName: "Table",
    key: "Attr",
    label: "Attr",

    tab: "Attribute",
    type: "Attr",
  });
}
