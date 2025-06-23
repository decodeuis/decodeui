import type { SetStoreFunction } from "solid-js/store";

import { v7 as uuidv7 } from "uuid";

import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function createCompContextVertex(
  props: any,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const viewVertexObject = newVertex(
    `${uuidv7()}-comp-value`,
    ["ComponentValue"],
    props,
  );

  addNewVertex(0, viewVertexObject, graph, setGraph);

  return viewVertexObject;
}
