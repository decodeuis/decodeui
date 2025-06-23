import type { SetStoreFunction, Store } from "solid-js/store";

import { onCleanup } from "solid-js";
import { createUniqueId } from "~/lib/solid/createUniqueId";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function createActiveClickOutside(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const currentId = createUniqueId();
  const globalStoreId = "globalStoreId";

  const currentActiveClickOutside =
    (graph.vertexes[globalStoreId] as Vertex<GlobalProperties>).P
      .activeClickOutside || [];
  const newActiveClickOutside = [...currentActiveClickOutside, currentId];

  mergeVertexProperties(0, globalStoreId, graph, setGraph, {
    activeClickOutside: newActiveClickOutside,
  });

  onCleanup(() => {
    const currentActiveClickOutside =
      (graph.vertexes[globalStoreId] as Vertex<GlobalProperties>).P
        .activeClickOutside || [];
    const updatedActiveClickOutside = currentActiveClickOutside.filter(
      (id) => id !== currentId,
    );
    mergeVertexProperties(0, globalStoreId, graph, setGraph, {
      activeClickOutside: updatedActiveClickOutside,
    });
  });

  return currentId;
}
