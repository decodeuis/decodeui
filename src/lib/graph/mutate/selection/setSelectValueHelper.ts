import type { SetStoreFunction } from "solid-js/store";

import type { Option } from "~/components/styled/MultiSelect";

import { setParentValue } from "~/lib/graph/mutate/selection/setParentValue";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function setSelectValueHelper(
  txnId: number,
  meta: Vertex,
  dataVertex: Vertex,
  componentName: string,
  value: Option[],
  isRemove: boolean,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  let data: Id | Id[];
  let vertexes: Vertex[];
  if (isRemove && componentName === "Select") {
    data = [];
    vertexes = [];
  } else if (componentName === "Select") {
    // @ts-expect-error ignore
    data = value[0].id;
    vertexes = [value[0]] as Vertex[];
  } else {
    // @ts-expect-error ignore
    data = value.map((e) => e.id);
    vertexes = value as Vertex[];
  }
  if (Array.isArray(vertexes)) {
    for (const vertex of vertexes) {
      if (!graph.vertexes[vertex.id]) {
        addNewVertex(0, vertex, graph, setGraph);
      }
    }
  }
  if (meta.P.inward) {
    setParentValue(graph, setGraph, txnId ?? 0, dataVertex!, meta, data);
  } else {
    setSelectionValue(txnId ?? 0, dataVertex!, graph, setGraph, meta, data);
  }
}
