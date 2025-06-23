import type { SetStoreFunction, Store } from "solid-js/store";

import { componentDrop } from "~/features/page_designer/functions/drag_drop/core/componentDrop";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
// import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
// import { IdAttr } from "~/lib/graph/graph";

export function addComponentAttrInPage(
  formVertex: Vertex,
  dataVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  componentName: string,
  properties: Record<string, any> = {},
  toVertex?: Vertex,
  dragPosition = "center",
) {
  // now we are not fetching components initially
  // const formCompVertex = findVertexByLabelAndUniqueId(
  //   graph,
  //   "Comp",
  //   IdAttr,
  //   componentName,
  // );
  // if (!formCompVertex) {
  //   return -1;
  // }

  const formCompVertex = {
    id: "",
    IN: {},
    L: ["Comp"],
    OUT: {},
    P: {
      key: componentName,
    },
  } as Vertex;

  return componentDrop(
    formVertex,
    txnId,
    formCompVertex,
    dataVertex,
    graph,
    setGraph,
    undefined,
    properties,
    toVertex,
    dragPosition,
  );
}
