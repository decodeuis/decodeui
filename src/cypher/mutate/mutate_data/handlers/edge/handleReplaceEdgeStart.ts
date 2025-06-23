import type { Transaction } from "neo4j-driver";

import { convertRelationshipToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Id } from "~/lib/graph/type/id";
import type { Edge } from "~/lib/graph/type/edge";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";

// deprecated
export async function handleReplaceEdgeStart(
  replaceEdgeStart: Edge,
  tx: Transaction,
  clientToServerVertexIdMap: Map<Id, Id>,
  clientToServerEdgeIdMap: Map<Id, Id>,
  txnResult: any[],
  edges: EdgeMap = {},
) {
  const id =
    clientToServerEdgeIdMap.get(replaceEdgeStart.id) || replaceEdgeStart.id;
  const startId =
    clientToServerVertexIdMap.get(replaceEdgeStart.S) || replaceEdgeStart.S;
  const _endId =
    clientToServerVertexIdMap.get(replaceEdgeStart.E) || replaceEdgeStart.E;
  const type = replaceEdgeStart.T;
  const query = `match ()-[r:${type}]->()
                WHERE elementId(r) = $edgeId 
                match (s) where elementId(s) = $newstart 
                match (e) where elementId(e) = elementId(endNode(r)) 
                create (s)-[t:${type}]->(e)
                set t = properties(r)
                SET t.updatedAt = localDateTime()
                delete r
                return t`;

  try {
    const result = await tx.run(query, {
      edgeId: id,
      newstart: startId,
    });
    if (result.records.length > 0) {
      const oldId = replaceEdgeStart.id;
      const relationship = result.records[0].get("t");
      const edgeId = relationship.elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);

      // Store the updated edge in the edges map
      const edge = convertRelationshipToJson(relationship);
      edges[edgeId] = edge;

      txnResult.push({ replaceEdgeStart: { error: false } });
    }
  } catch (error) {
    throw new Error(
      `Can't replace edge start due to an internal server error: ${error}`,
    );
  }
}
