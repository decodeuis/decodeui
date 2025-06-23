import type { SetStoreFunction, Store } from "solid-js/store";

import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { uniqueNameKey } from "../../constants/constant";
import { getComponentLabel } from "../component/getComponentLabel";
import { getChildrenAttrs } from "../layout/getChildrenAttrs";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

// todo: write test for this function
export function generateFormMetaAttributes(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  rootVertex: Vertex,
  ignoreTable?: boolean,
): IFormMetaData {
  const result: FieldAttribute[] = [];

  function getAllInputFields(
    graph: Store<GraphInterface>,
    setGraph: SetStoreFunction<GraphInterface>,
    vertex: Vertex,
    parent: Vertex,
    parentComponent: string,
  ): FieldAttribute[] {
    const children = getChildrenAttrs(graph, setGraph, vertex);
    const componentName = getComponentLabel(graph, vertex);

    if (
      vertex !== rootVertex &&
      (vertex.P.as === "input" || componentName === "DynamicTable")
    ) {
      result.push({
        id: vertex.id,
        ...vertex.P,
        attributes:
          componentName === "DynamicTable" && !ignoreTable
            ? generateFormMetaAttributes(graph, setGraph, vertex, ignoreTable)
                .attributes
            : undefined,
        componentName: componentName,
        key: vertex.P[uniqueNameKey],
        title: parentComponent === "Label" ? parent.P.label : vertex.P.title,
      });
    }
    if (vertex !== rootVertex && componentName === "DynamicTable") {
      return [];
    }
    return children.map((child) => {
      const childComponent = getComponentLabel(graph, child);
      return {
        attributes: getAllInputFields(
          graph,
          setGraph,
          child,
          vertex,
          componentName,
        ),
        //title: componentName === "Label" ? vertex.P.label : child.P.title,
        componentName: childComponent,
        id: child.id,
        key: child.P[uniqueNameKey],
      };
    });
  }

  getAllInputFields(graph, setGraph, rootVertex, rootVertex, "");

  return {
    attributes: result,
    id: rootVertex.id,
    key: rootVertex.P[uniqueNameKey],
    title: rootVertex.P.title,
  };
}
