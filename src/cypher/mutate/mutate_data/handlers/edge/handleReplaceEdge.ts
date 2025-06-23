import type { Transaction } from "neo4j-driver";

import { convertRelationshipToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Id } from "~/lib/graph/type/id";
import type { Edge } from "~/lib/graph/type/edge";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";

export async function handleReplaceEdge(
  replaceEdge: Edge,
  tx: Transaction,
  clientToServerVertexIdMap: Map<Id, Id>,
  clientToServerEdgeIdMap: Map<Id, Id>,
  txnResult: any[],
  edges: EdgeMap = {},
) {
  const id = clientToServerEdgeIdMap.get(replaceEdge.id) || replaceEdge.id;
  const startId = clientToServerVertexIdMap.get(replaceEdge.S) || replaceEdge.S;
  const endId = clientToServerVertexIdMap.get(replaceEdge.E) || replaceEdge.E;
  const type = replaceEdge.T;
  const query = `match (n1) where elementId(n1)=$startId
                match (n2) where elementId(n2)=$endId
                match (n1)-[r:${type}]->(n2)
                where elementId(r) = $id
                set r = $properties
                SET r.updatedAt = localDateTime()
                return r`;

  try {
    const result = await tx.run(query, {
      endId: endId,
      id: id,
      properties: replaceEdge.P,
      startId: startId,
    });
    if (result.records.length > 0) {
      const oldId = replaceEdge.id;
      const relationship = result.records[0].get("r");
      const edgeId = relationship.elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);

      // Store the updated edge in the edges map
      const edge = convertRelationshipToJson(relationship);
      edges[edgeId] = edge;

      txnResult.push({ replaceEdge: [oldId, edgeId] });
    }
  } catch (error: any) {
    throw new Error(
      `Can't replace edge due to an internal server error: ${error.message}`,
    );
  }
}
