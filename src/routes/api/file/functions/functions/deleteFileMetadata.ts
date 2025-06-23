import type { Session } from "neo4j-driver";

export async function deleteFileMetadata(dbSession: Session, fileId: string) {
  try {
    // First, get the file node to verify it exists
    const getFileQuery = `
      MATCH (f:File)
      WHERE elementId(f) = $fileId
      RETURN f
    `;
    const fileResult = await dbSession.run(getFileQuery, { fileId: fileId });
    if (fileResult.records.length === 0) {
      return null;
    }

    // Delete the ParentFolder edge
    const deleteEdgeQuery = `
      MATCH (f:File)
      WHERE elementId(f) = $fileId
      MATCH (f)-[r:ParentFolder]->(parent)
      DELETE r
      RETURN r.identity as edgeId
    `;
    const edgeResult = await dbSession.run(deleteEdgeQuery, { fileId: fileId });
    const deletedEdgeId = edgeResult.records[0]?.get("edgeId");

    // Finally, delete the file node
    const deleteNodeQuery = `
      MATCH (f:File)
      WHERE elementId(f) = $fileId
      DELETE f
      RETURN f.identity as nodeId
    `;
    const deleteResult = await dbSession.run(deleteNodeQuery, {
      fileId: fileId,
    });

    if (deleteResult.records.length === 0) {
      return null;
    }

    const deletedNodeId = deleteResult.records[0].get("nodeId");
    return {
      graph: {
        deleted_edges: deletedEdgeId ? [deletedEdgeId] : [],
        deleted_vertexes: [deletedNodeId],
      },
      success: true,
    };
  } catch (error) {
    console.error("Error deleting file metadata from Neo4j:", error);
    throw error;
  }
}
