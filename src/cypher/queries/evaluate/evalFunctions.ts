import type { EvalExpressionContext } from "~/cypher/types/EvalExpressionContext";

import { evalGetRelatedNodes } from "~/cypher/queries/evaluate/evalGetRelatedNodes";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function evalGetChildren(
  vertexes: Vertex[],
  edgeType: string,
  context: EvalExpressionContext = {},
) {
  "use server";
  return await evalGetRelatedNodes(vertexes, edgeType, context, "child");
}

export async function evalGetParents(
  vertexes: Vertex[],
  edgeType: string,
  context: EvalExpressionContext = {},
) {
  "use server";
  return await evalGetRelatedNodes(vertexes, edgeType, context, "parent");
}

export async function evalGlobalColl(
  edgeType: string,
  context: EvalExpressionContext = {},
) {
  "use server";
  return await evalGetRelatedNodes([], edgeType, context, "g");
}

export async function evalVertexById(
  id: string,
  context: EvalExpressionContext = {},
) {
  "use server";
  return await evalGetRelatedNodes([], id, context, "id");
}
