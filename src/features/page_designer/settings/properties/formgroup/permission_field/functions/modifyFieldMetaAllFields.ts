import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function modifyFieldMetaAllFields(
  attribute: FieldAttribute,
  _graph: GraphInterface,
  _setGraph: SetStoreFunction<GraphInterface>,
  _formStoreVertex: Vertex<FormStoreObject>,
  _ignoreTable?: boolean,
) {
  attribute.labelKey = "::'key'||::'P.key'||::'P.id'";
  attribute.valueKey = "id";
  attribute.childrenKey = "attributes";
  attribute.options = () => [];
  // generateFormMetaAttributes(
  //   graph,
  //   setGraph,
  //   graph.vertexes[formStoreVertex?.P.formDataId!],
  //   ignoreTable,
  // ).attributes;
  return attribute;
}
