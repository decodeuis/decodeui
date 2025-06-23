// Function to update properties of an existing node.
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function updateNodeProperties(
  dbSession: Session,
  node: Vertex,
  properties: { [key: string]: any },
) {
  const result = await dbSession.run(
    "MATCH (n) WHERE elementId(n) = $id SET n += $properties SET n.updatedAt = localDateTime() RETURN n;",
    { id: node.id, properties },
  );
  return convertNodeToJson(result.records[0].get("n"));
}
