import type { SetStoreFunction, Store } from "solid-js/store";

import { isObject } from "~/lib/data_structure/object/isObject";
import { getId } from "~/lib/data_structure/string/getId";
import { getLabel } from "~/lib/data_structure/string/getLabel";
import { evalExpression } from "~/lib/expression_eval";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

// Select On Change Handler
export function onChangeHandler(
  txnId: number,
  formVertex: Vertex,
  vertex: Vertex,
  changedFieldAttribute: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!changedFieldAttribute.P.onchange) {
    return;
  }
  const isNew = typeof formVertex.id === "number" && formVertex.id < 0;
  try {
    let args = JSON.parse(changedFieldAttribute.P.onchange);
    if (Array.isArray(args)) {
      // args in proper format.
    } else if (isObject(args)) {
      // TODO: Find the form is new or edit.
      if (args.new && isNew) {
        args = args.new;
      } else if (args.edit) {
        args = args.edit;
      } else {
        return;
      }
    }

    const attribute = (
      evalExpression("-Attr->Attr", {
        graph,
        vertexes: [changedFieldAttribute],
      }) || []
    ).find((vertex: any) => vertex.P[IdAttr] === args[0]);
    if (!attribute) {
      return;
    }
    let value = args[1];

    if (value === null) {
      value = undefined;
    }
    if (value === "label") {
      value = getLabel(vertex.P[changedFieldAttribute.P[IdAttr]]);
    }
    if (value === "id") {
      value = getId(vertex.P[changedFieldAttribute.P[IdAttr]]);
    }
    if (value === "clear") {
      value = null;
    }
    if (
      attribute.P.componentName === "Select" ||
      attribute.P.componentName === "Tag"
    ) {
      setSelectionValue(txnId, vertex, graph, setGraph, attribute, value);
    } else {
      mergeVertexProperties(txnId, vertex.id, graph, setGraph, {
        [attribute.P[IdAttr]]: value,
      });
    }
  } catch (_e) {}
}
