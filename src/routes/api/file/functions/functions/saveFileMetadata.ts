import type { Session, Transaction } from "neo4j-driver";

export async function saveFileMetadata(
  dbSession: Session | Transaction,
  properties: Record<string, any>,
  fileId?: string,
  vertexLabel?: string,
) {
  try {
    let query;
    const label = vertexLabel || "File";
    if (fileId) {
      // Update existing file node
      query = `
        MATCH (f:${label})
        WHERE elementId(f) = $fileId 
        SET f = $properties
        RETURN f
      `;
      const result = await dbSession.run(query, { fileId, properties });
      return result.records[0];
    }
    // Create new file node
    query = `CREATE (f:${label}) SET f = $properties RETURN f`;
    const result = await dbSession.run(query, { properties });
    return result.records[0];
  } catch (error) {
    console.error("Error saving file metadata to Neo4j:", error);
    throw error;
  }
}
