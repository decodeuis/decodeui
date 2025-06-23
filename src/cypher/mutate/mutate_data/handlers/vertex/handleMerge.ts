import type { Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { VertexMap } from "~/lib/graph/type/vertexMap";

export async function handleMerge(
  merge: Vertex,
  tx: Transaction,
  clientToServerVertexIdMap: Map<Id, Id>,
  txnResult: any[],
  vertexes: VertexMap = {},
) {
  let id = merge.id;
  if (clientToServerVertexIdMap.has(id)) {
    id = clientToServerVertexIdMap.get(id)!;
  }

  const query =
    "MATCH (n) WHERE elementId(n) = $id SET n += $properties, n.updatedAt = localDateTime() RETURN n";
  try {
    const result = await tx.run(query, { id: id, properties: merge.P });
    if (result.records.length > 0) {
      // Store the updated vertex in the vertexes map
      const node = result.records[0].get("n");
      const vertex = convertNodeToJson(node);
      vertexes[id] = vertex;

      txnResult.push({ merge: { error: false, id } });
    } else {
      throw new Error(`Vertex with id ${id} not found.`);
    }
  } catch (error: any) {
    throw new Error(
      `Can't merge due to an internal server error: ${error.message}`,
    );
  }
}
