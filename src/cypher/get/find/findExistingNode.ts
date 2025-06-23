// Function to find an existing node by key.
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

export async function findExistingNode(
  dbSession: Session,
  nodeType: string,
  key: string,
) {
  const result = await dbSession.run(
    `MATCH (n:${nodeType} {key: $key}) RETURN n;`,
    { key: key },
  );
  return result.records.length > 0
    ? convertNodeToJson(result.records[0].get("n"))
    : null;
}
