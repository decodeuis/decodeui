// Function to add edges between nodes based on certain conditions.
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getChildrenOrParentVertex } from "~/cypher/get/relation/getChildrenOrParentVertex";
import { findOrCreateNodeAndUpdateProperties } from "~/cypher/mutate/sync/findOrCreateNodeAndUpdateProperties";

import { globalCollections } from "./constants/globalCollections";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function addNodeEdges(
  sessionSource: Session,
  sessionTarget: Session,
  parentVertex: Vertex,
  adminChildrenVertexes: Vertex[],
  type: string,
  outLabel: string,
  inward: boolean,
): Promise<Vertex[]> {
  // Find children with the same key in the target database; if not exists, create a node and edge.
  const userChildrenVertexes = await getChildrenOrParentVertex(
    sessionTarget,
    parentVertex.id,
    type,
    outLabel,
    inward,
  );

  const results: Vertex[] = [];

  for (const adminVertex of adminChildrenVertexes) {
    const existingChild = userChildrenVertexes.find(
      (childVertex) => adminVertex.P.key === childVertex.P.key,
    );

    if (existingChild) {
      const query = `
        MATCH (a) WHERE elementId(a) = $childId
        SET a += $props, a.updatedAt = localDateTime()
        RETURN a;
      `;
      const result = await sessionTarget.run(query, {
        childId: existingChild.id,
        props: adminVertex.P,
      });
      for (const v of result.records) {
        results.push(convertNodeToJson(v.get("a")));
      }
    } else {
      const isGlobalCollection = globalCollections.includes(adminVertex.L[0]);
      const targetNode = isGlobalCollection
        ? await findOrCreateNodeAndUpdateProperties(
            sessionSource,
            sessionTarget,
            adminVertex,
            adminVertex.L[0],
          )
        : null;

      const query = isGlobalCollection
        ? `
          MATCH (a), (b)
          WHERE elementId(a) = $parentNodeId AND elementId(b) = $targetNodeId
          CREATE (a)${inward ? "<-" : "-"}[:${type}]${inward ? "-" : "->"}(b)
          RETURN b;
        `
        : `
          MATCH (a) WHERE elementId(a) = $parentNodeId
          CREATE (a)${inward ? "<-" : "-"}[:${type}]${inward ? "-" : "->"}(b:${adminVertex.L[0]})
          SET b = $props, b.createdAt = localDateTime()
          RETURN b;
        `;

      const params = isGlobalCollection
        ? {
            parentNodeId: parentVertex.id,
            targetNodeId: targetNode!.id,
          }
        : {
            parentNodeId: parentVertex.id,
            props: adminVertex.P,
          };

      const result = await sessionTarget.run(query, params);
      for (const v of result.records) {
        results.push(convertNodeToJson(v.get("b")));
      }
    }
  }

  return results;
}
