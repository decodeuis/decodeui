import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Id } from "~/lib/graph/type/id";
import { evalExpression } from "~/lib/expression_eval";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";

export function getAllFieldsUsedInRootLevelSetting(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
  layoutVertex: Vertex,
  projection: string,
): Id[] {
  const allUniqueKeys =
    evalExpression(projection, { graph, setGraph, vertexes: [formVertex] }) ||
    [];
  const allUniqueKeyIds = allUniqueKeys.map((key: Vertex) => key.id);

  const fieldsUsedInUniqueConstraints = [] as Id[];

  function collectUniqueConstraints(vertex: Vertex) {
    if (allUniqueKeyIds.includes(vertex.id)) {
      fieldsUsedInUniqueConstraints.push(vertex.id);
    }
    for (const child of getChildrenAttrs(graph, setGraph, vertex)) {
      collectUniqueConstraints(child);
    }
  }

  collectUniqueConstraints(layoutVertex);

  return fieldsUsedInUniqueConstraints;
}
