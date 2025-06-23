import type { Session } from "neo4j-driver";

import fs from "node:fs/promises";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { deleteFileMetadata } from "~/routes/api/file/functions/functions/deleteFileMetadata";
import { getFileMetadataById } from "~/routes/api/file/functions/functions/getFileMetadataById";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function deleteFile(
  fileId: string,
  neo4jSession: Session,
  user: Vertex,
) {
  const fileMetadata = await getFileMetadataById(neo4jSession, fileId);

  if (!fileMetadata) {
    return new Response(JSON.stringify({ error: "File not found" }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }

  try {
    const filePath = fileMetadata.P.filePath;

    const deletedFileResult = await deleteFileMetadata(neo4jSession, fileId);

    if (deletedFileResult?.success) {
      if (filePath) {
        try {
          await fs.access(filePath); // Check if file exists
          await fs.unlink(filePath); // Delete the file from the disk only if it exists
        } catch {
          // Silently continue if file doesn't exist
        }
      }

      await createActivityLog(
        neo4jSession,
        "file_delete",
        "File",
        fileId as string,
        user.P.email,
        `File deleted: ${fileMetadata.P.fileName} (${fileMetadata.P.contentType})`,
      );
    }
    return deletedFileResult;
  } catch (error) {
    return {
      error: `Error deleting file ${error instanceof Error ? error.message : String(error)}`,
      success: false,
    };
  }
}
