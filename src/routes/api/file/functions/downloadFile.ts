import type { Session } from "neo4j-driver";
import fs from "node:fs/promises";
import { getFileMetadata } from "~/routes/api/file/functions/functions/getFileMetadata";
import { APIError } from "~/lib/api/server/apiErrorHandler";

import type { Vertex } from "~/lib/graph/type/vertex";

interface FileMetadata {
  filePath: string;
  originalFilename: string;
  mimeType: string;
}

/**
 * Downloads a file from the server's file system and returns it as a Response
 * @param fileName - The unique name of the file to download
 * @param dbSession - Neo4j database session
 * @returns Response object containing the file data or an error message
 * @throws APIError if the file is not found or cannot be read
 */
export async function downloadFile(
  fileName: string,
  dbSession: Session,
): Promise<Response> {
  const fileMetadata = await getFileMetadata(dbSession, fileName);

  if (!fileMetadata) {
    throw new APIError("File not found", 404);
  }

  try {
    const metadata = fileMetadata as Vertex<FileMetadata>;
    const { filePath, originalFilename, mimeType } = metadata.P;
    const fileData = await fs.readFile(filePath);

    // Ensure the filename is safe for headers
    const safeFileName = encodeURIComponent(originalFilename);

    return new Response(fileData, {
      headers: {
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Type": mimeType,
      },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new APIError(`Error reading file from disk: ${errorMessage}`, 500);
  }
}
