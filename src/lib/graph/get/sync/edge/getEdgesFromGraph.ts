import type { Store } from "solid-js/store";

import type { NestedExpression } from "~/cypher/types/NestedExpression";

import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";

import { getInEdge } from "./getInEdge";
import { getToEdge } from "./getToEdge";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getEdgesFromGraph(
  graph: Store<GraphInterface>,
  vertexId: Id,
  ignoreTables = false,
): {
  incoming: NestedExpression[];
  outgoing: NestedExpression[];
} {
  const vertex = graph.vertexes[vertexId];
  if (!vertex) {
    return { incoming: [], outgoing: [] };
  }

  const outgoing = [] as NestedExpression[];
  const incoming = [] as NestedExpression[];

  function processVertex(vertex: Vertex) {
    if (ignoreTables && vertex.P.hideInGrid) {
      return;
    }
    if (vertex.P.ignoreFetch) {
      return;
    }

    if (
      vertex.P.componentName === "Select" ||
      vertex.P.componentName === "MultiSelect"
    ) {
      if (vertex.P.inward) {
        incoming.push({
          expression: `<-${getInEdge(
            { P: vertex.P } as unknown as Vertex,
            { L: ["$0"] } as unknown as Vertex,
          )}`, // `<-${capitalizedName}$0`
        });
      } else {
        outgoing.push({
          expression: `->${getToEdge(
            { P: vertex.P } as unknown as Vertex,
            { L: ["$0"] } as unknown as Vertex,
          )}`, // `->$0${capitalizedName}`
        });
      }
    } else if (
      vertex.P.componentName === "Table" ||
      vertex.P.componentName === "DynamicTable"
    ) {
      if (ignoreTables) {
        return;
      }

      const expression: NestedExpression = vertex.P.inward
        ? {
            expression: `<-${getInEdge(
              { P: vertex.P } as unknown as Vertex,
              { L: ["$0"] } as unknown as Vertex,
            )}`,
          }
        : {
            expression: `->${getToEdge(
              { P: vertex.P } as unknown as Vertex,
              { L: ["$0"] } as unknown as Vertex,
            )}`,
          };

      const children = getChildrenAttrs(graph, () => {}, vertex);
      if (children.length > 0) {
        const nested = getEdgesFromGraph(graph, children[0].id, ignoreTables);
        expression.incoming = nested.incoming;
        expression.outgoing = nested.outgoing;
      }

      if (vertex.P.inward) {
        incoming.push(expression);
      } else {
        outgoing.push(expression);
      }
    }

    // Process children recursively
    const children = getChildrenAttrs(graph, () => {}, vertex);
    for (const child of children) {
      processVertex(child);
    }
  }

  processVertex(vertex);

  return { incoming, outgoing };
}
