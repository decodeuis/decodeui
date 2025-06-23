import { evalExpression } from "~/lib/expression_eval";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getCompChildren(
  vertex: Vertex[],
  edgeName: string,
  graph: GraphInterface,
) {
  if (!vertex) {
    return [];
  }
  const children: Vertex[] =
    evalExpression(`<-${edgeName}`, { graph, vertexes: vertex }) || [];
  return children;
}
