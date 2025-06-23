import type { Transaction } from "neo4j-driver";

import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

type VertexResult = {
  deleteVertex: {
    error: boolean;
    id: Id;
    message?: string;
  };
};

export async function handleDeleteVertex(
  deleteVertex: Vertex,
  tx: Transaction,
  clientToServerVertexIdMap: Map<Id, Id>,
  txnResult: VertexResult[],
  deletedVertexes: Id[] = [],
) {
  const id = clientToServerVertexIdMap.get(deleteVertex.id) || deleteVertex.id;
  const query = "MATCH (n) WHERE elementId(n) = $id DELETE n RETURN n";

  try {
    const result = await tx.run(query, { id: id });
    if (result.records.length > 0) {
      deletedVertexes.push(id);
      txnResult.push({ deleteVertex: { error: false, id } });
    } else {
      txnResult.push({
        deleteVertex: { error: true, id, message: "Vertex not found" },
      });
    }
  } catch (error: unknown) {
    throw new Error(
      `Can't delete vertex due to an internal server error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
