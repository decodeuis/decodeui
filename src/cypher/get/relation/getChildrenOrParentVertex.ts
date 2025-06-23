import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

export async function getChildrenOrParentVertex(
  dbSession: Session,
  id: string,
  edgeType: string,
  endLabel: string,
  inward: boolean,
): Promise<any[]> {
  try {
    const query = inward
      ? `MATCH (n${endLabel})<-[r:${edgeType}]-(m) WHERE elementId(n) = $id RETURN m;`
      : `MATCH (n)-[r:${edgeType}]->(m:${endLabel}) WHERE elementId(n) = $id RETURN m;`;

    const result = await dbSession.run(query, { id: id });

    return result.records.map((record) => convertNodeToJson(record.get("m")));
  } catch (error) {
    console.error(`Error fetching vertices for id ${id}:`, error);
    throw new Error(`Error fetching vertices for id ${id}: ${error.message}`);
  }
}
