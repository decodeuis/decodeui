import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

export async function getFileMetadata(dbSession: Session, fileName: string) {
  try {
    const query = "MATCH (f:File) WHERE f.fileName = $fileName RETURN f";
    const result = await dbSession.run(query, { fileName: fileName });
    if (result.records.length > 0) {
      return convertNodeToJson(result.records[0].get("f"));
    }
    return null;
  } catch (error) {
    console.error("Error retrieving file metadata from Neo4j:", error);
    throw error;
  }
}
