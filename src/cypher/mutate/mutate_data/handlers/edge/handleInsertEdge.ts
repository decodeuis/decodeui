import type { Transaction } from "neo4j-driver";

import { convertRelationshipToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Id } from "~/lib/graph/type/id";
import type { Edge } from "~/lib/graph/type/edge";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";

export async function handleInsertEdge(
  insertEdge: Edge,
  tx: Transaction,
  clientToServerVertexIdMap: Map<Id, Id>,
  clientToServerEdgeIdMap: Map<Id, Id>,
  txnResult: any[],
  edges: EdgeMap = {},
) {
  // if user has no permission to insert row vertex, do not allow and return error.
  // if user has no permission to insert select, dont allow it.
  //
  const startId = clientToServerVertexIdMap.get(insertEdge.S) || insertEdge.S;
  const endId = clientToServerVertexIdMap.get(insertEdge.E) || insertEdge.E;
  const type = insertEdge.T;
  const query = `match (n1) where elementId(n1)=$startId
                match (n2) where elementId(n2)=$endId
                merge (n1)-[r:${type}]->(n2)
                SET r += $properties
                SET r.updatedAt = localDateTime()
                return r`;

  try {
    const result = await tx.run(query, {
      endId: endId,
      properties: insertEdge.P,
      startId: startId,
    });
    if (result.records.length > 0) {
      const oldId = insertEdge.id;
      const relationship = result.records[0].get("r");
      const edgeId = relationship.elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);

      // Store the edge in the edges map
      const edge = convertRelationshipToJson(relationship);
      edges[edgeId] = edge;

      txnResult.push({ insertEdge: [oldId, edgeId] });
    }
  } catch (error: any) {
    throw new Error(
      `Can't insert edge due to an internal server error: ${error.message}`,
    );
  }
}
