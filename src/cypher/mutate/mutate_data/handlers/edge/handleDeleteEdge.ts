import type { Transaction } from "neo4j-driver";

import type { Id } from "~/lib/graph/type/id";
import type { Edge } from "~/lib/graph/type/edge";

type EdgeResult = {
  deleteEdge: {
    error: boolean;
    id: Id;
    message?: string;
  };
};

export async function handleDeleteEdge(
  deleteEdge: Edge,
  tx: Transaction,
  clientToServerVertexIdMap: Map<Id, Id>,
  clientToServerEdgeIdMap: Map<Id, Id>,
  txnResult: EdgeResult[],
  deletedEdges: Id[] = [],
) {
  const id = clientToServerEdgeIdMap.get(deleteEdge.id) || deleteEdge.id;
  const startId = clientToServerVertexIdMap.get(deleteEdge.S) || deleteEdge.S;
  const endId = clientToServerVertexIdMap.get(deleteEdge.E) || deleteEdge.E;
  const type = deleteEdge.T;
  const query = `match (n1)-[r:${type}]->(n2)
                where elementId(n1) = $startId and elementId(n2) = $endId and elementId(r) = $id 
                delete r
                return r;`;

  try {
    const result = await tx.run(query, {
      endId: endId,
      id: id,
      startId: startId,
    });
    if (result.records.length > 0) {
      const oldId = deleteEdge.id;
      const edgeId = result.records[0].get("r").elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);
      deletedEdges.push(id);
      txnResult.push({ deleteEdge: { error: false, id: edgeId } });
    } else {
      txnResult.push({
        deleteEdge: { error: true, id, message: "Edge not found" },
      });
    }
  } catch (error: unknown) {
    throw new Error(
      `Can't delete edge due to an internal server error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
