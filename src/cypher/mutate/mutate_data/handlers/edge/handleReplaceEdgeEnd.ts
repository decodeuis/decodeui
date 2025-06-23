import type { Transaction } from "neo4j-driver";

import { convertRelationshipToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Id } from "~/lib/graph/type/id";
import type { Edge } from "~/lib/graph/type/edge";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";

// deprecated
export async function handleReplaceEdgeEnd(
  replaceEdgeEnd: Edge,
  tx: Transaction,
  clientToServerVertexIdMap: Map<Id, Id>,
  clientToServerEdgeIdMap: Map<Id, Id>,
  txnResult: any[],
  edges: EdgeMap = {},
) {
  const id =
    clientToServerEdgeIdMap.get(replaceEdgeEnd.id) || replaceEdgeEnd.id;
  const _startId =
    clientToServerVertexIdMap.get(replaceEdgeEnd.S) || replaceEdgeEnd.S;
  const endId =
    clientToServerVertexIdMap.get(replaceEdgeEnd.E) || replaceEdgeEnd.E;
  const type = replaceEdgeEnd.T;
  const query = `match ()-[r:${type}]->()
                WHERE elementId(r) = $edgeId
                match (s) where elementId(s) = elementId(startNode(r)) 
                match (e) where elementId(e) = $newend 
                create (s)-[t:${type}]->(e)
                set t = properties(r)
                SET t.updatedAt = localDateTime()
                delete r
                return t`;

  try {
    const result = await tx.run(query, {
      edgeId: id,
      newend: endId,
    });
    if (result.records.length > 0) {
      const oldId = replaceEdgeEnd.id;
      const relationship = result.records[0].get("t");
      const edgeId = relationship.elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);

      // Store the updated edge in the edges map
      const edge = convertRelationshipToJson(relationship);
      edges[edgeId] = edge;

      txnResult.push({ replaceEdgeEnd: { error: false } });
    }
  } catch (error) {
    throw new Error(
      `Can't replace edge end due to an internal server error: ${error}`,
    );
  }
}
