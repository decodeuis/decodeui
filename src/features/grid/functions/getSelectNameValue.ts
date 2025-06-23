import type { CellContext } from "@tanstack/solid-table";
import type { SetStoreFunction } from "solid-js/store";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { evalExpression } from "~/lib/expression_eval";
import { selectedValue } from "~/lib/graph/get/sync/edge/selectedValue";

import { formNameDisplayExprFromVertex } from "./formNameDisplayExprFromVertex";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getSelectNameValue(
  props: Readonly<{
    attribute: FieldAttribute;
    graph: GraphInterface;
    info: CellContext<any, any>;
    setGraph: SetStoreFunction<GraphInterface>;
  }>,
) {
  const vertex = selectedValue(
    {
      P: props.attribute,
    } as unknown as Vertex,
    props.info.row.original,
    props.graph,
  );
  if (vertex[0]) {
    return evalExpression(
      props.attribute.displayExpr ||
        formNameDisplayExprFromVertex(
          props.graph,
          props.attribute.collection,
        ) ||
        props.attribute.labelKey ||
        `::'P.${IdAttr}'`,
      {
        graph: props.graph,
        setGraph: props.setGraph,
        vertexes: [props.graph.vertexes[vertex[0]]],
      },
    );
  }
  return "";
}
