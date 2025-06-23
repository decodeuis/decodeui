import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";
import { uniqueNameKey } from "~/features/page_designer/constants/constant";
import { validateInput } from "~/features/page_designer/settings/properties/validations/validateInput";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";

export function isAnyFieldInvalid(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
  data: Vertex,
) {
  function checkVertex(attrVertex: Vertex) {
    if (attrVertex.P.validation) {
      const value = data.P[attrVertex.P[uniqueNameKey]];
      const error = validateInput(
        attrVertex.P.validation,
        value,
        attrVertex.P.key,
      );
      mergeVertexProperties(0, attrVertex.id, graph, setGraph, {
        error: error || "",
      });
      if (error) {
        return true;
      }
    }

    return getChildrenAttrs(graph, setGraph, attrVertex).some(checkVertex);
  }

  return getChildrenAttrs(graph, setGraph, formVertex).some(checkVertex);
}
