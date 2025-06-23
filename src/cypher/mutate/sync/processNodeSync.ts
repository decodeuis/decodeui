import type { Session } from "neo4j-driver";

import type { NestedExpression } from "~/cypher/types/NestedExpression";

import { addNodeEdges } from "~/cypher/mutate/sync/addNodeEdges";
import { evalExpressionAsync } from "~/lib/expression_eval";

import { findOrCreateNodeAndUpdateProperties } from "./findOrCreateNodeAndUpdateProperties";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { VertexMap } from "~/lib/graph/type/vertexMap";

export async function processNodeSync(
  sessionSource: Session,
  sessionTarget: Session,
  expression: NestedExpression,
  vertexes: Vertex[],
  inward: boolean,
  createdVertex?: Vertex,
): Promise<{
  graph: { edges: EdgeMap; vertexes: VertexMap };
  result: Vertex[];
}> {
  const context = {
    dbSession: sessionSource,
    nodes: {} as VertexMap,
    relationships: {} as EdgeMap,
    setChildren: true,
    vertexes,
  };

  const mainResult: Vertex[] = await evalExpressionAsync(
    expression.expression,
    context,
  );
  if (
    expression.expression === "->ParentComp" &&
    vertexes[0]?.P?.key === "Resizable.Panel"
  ) {
  }

  if (!mainResult || mainResult.length === 0) {
    return {
      graph: { edges: context.relationships, vertexes: context.nodes },
      result: mainResult,
    };
  }

  const children: Vertex[] = [];
  if (createdVertex) {
    const relationshipMap = new Map<string, Vertex[]>();

    for (const [, relationship] of Object.entries(context.relationships)) {
      const edgeType = relationship.T;
      if (!relationshipMap.has(edgeType)) {
        relationshipMap.set(
          edgeType,
          inward
            ? mainResult.filter((vertex) => vertex.id === relationship.S)
            : mainResult.filter((vertex) => vertex.id === relationship.E),
        );
      }
    }

    for (const [edgeType, vertexResults] of relationshipMap.entries()) {
      const outLabel = vertexResults[0]?.L[0];
      if (outLabel) {
        const newChildren = await addNodeEdges(
          sessionSource,
          sessionTarget,
          createdVertex,
          vertexResults,
          edgeType,
          outLabel,
          inward,
        );
        children.push(...newChildren);
      }
    }
  }

  for (const vertex of mainResult) {
    const newCreatedVertex =
      children.find((child) => child.P.key === vertex.P.key) ||
      (await findOrCreateNodeAndUpdateProperties(
        sessionSource,
        sessionTarget,
        vertex,
        vertex.L[0],
      ));

    if (expression.incoming && expression.incoming.length > 0) {
      for (const exp of expression.incoming) {
        await processNodeSync(
          sessionSource,
          sessionTarget,
          exp,
          [vertex],
          true,
          newCreatedVertex,
        );
      }
    }

    if (expression.outgoing && expression.outgoing.length > 0) {
      for (const exp of expression.outgoing) {
        await processNodeSync(
          sessionSource,
          sessionTarget,
          exp,
          [vertex],
          false,
          newCreatedVertex,
        );
      }
    }
  }

  return {
    graph: {
      edges: context.relationships,
      vertexes: context.nodes,
    },
    result: mainResult,
  };
}
