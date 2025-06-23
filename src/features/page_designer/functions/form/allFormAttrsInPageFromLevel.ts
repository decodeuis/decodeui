import type { Store } from "solid-js/store";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Id } from "~/lib/graph/type/id";
import { getComponentLabel } from "~/features/page_designer/functions/component/getComponentLabel";
import { evalExpression } from "~/lib/expression_eval";

export function allFormAttrsInPageFromLevel(
  graph: Store<GraphInterface>,
  parent: Vertex,
  componentLabel: string,
  excludeVertices: Id[] = [],
): Id[] {
  const verticesWithFormAttr: Id[] = [];

  function collectFormProperties(vertex: Vertex): void {
    if (excludeVertices.includes(vertex.id)) {
      return;
    }
    const compLabel = getComponentLabel(graph, vertex);

    if (compLabel === componentLabel) {
      verticesWithFormAttr.push(vertex.id);
    }

    const children =
      evalExpression("->Attr", { graph, vertexes: [vertex] }) || [];
    for (const child of children) {
      collectFormProperties(child);
    }
  }

  collectFormProperties(parent);

  return verticesWithFormAttr;
}
