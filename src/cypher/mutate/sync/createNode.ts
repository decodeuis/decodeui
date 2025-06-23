// Function to create a new node.
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

export async function createNode(
  dbSession: Session,
  nodeType: string,
  properties: { [key: string]: any },
) {
  const result = await dbSession.run(
    `CREATE (n:${nodeType}) SET n = $properties SET n.createdAt = localDateTime() RETURN n;`,
    { properties },
  );
  return convertNodeToJson(result.records[0].get("n"));
}
