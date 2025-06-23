import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import type { PageLayoutObject } from "../context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function onLayoutItemClick(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertexId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  selectedIndex = 0,
) {
  batch(() => {
    if (layoutStoreVertex.P.formId !== formStoreVertex.id) {
      mergeVertexProperties<PageLayoutObject>(
        0,
        layoutStoreVertex.id,
        graph,
        setGraph,
        {
          formId: formStoreVertex.id,
        },
      );
    }
    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreVertex.id,
      graph,
      setGraph,
      {
        selectedId: layoutVertexId ?? -1,
        selectedIndex,
      },
    );
  });
}
