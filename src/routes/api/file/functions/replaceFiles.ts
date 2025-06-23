import type { MultiPartData } from "h3";
import type { Session } from "neo4j-driver";

import path from "node:path";

import { processResult } from "~/cypher/conversion/processResult";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import type { EvalExpressionContext } from "~/cypher/types/EvalExpressionContext";
import { calculateChecksum } from "~/lib/files/calculateChecksum";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { getBaseDir } from "~/lib/files/getBaseDir";
import { saveFileToDisk } from "~/lib/files/saveFileToDisk";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getFileMetadataById } from "~/routes/api/file/functions/functions/getFileMetadataById";
import { saveFileMetadata } from "~/routes/api/file/functions/functions/saveFileMetadata";

export async function replaceFiles(
  request: Request,
  data: MultiPartData[],
  neo4jSession: Session,
  subDomain: string,
  user: Vertex,
) {
  const currentDate = new Date().toISOString();
  const [year, month, day] = currentDate.split("T")[0].split("-");
  const baseDir = getBaseDir();
  const userDir = path.join(baseDir, subDomain, year, month, day);

  ensureDirectoryExists(userDir);

  const query = new URL(request.url).searchParams;
  const fileId = query.get("fileId");
  if (!fileId) {
    return { error: "fileId is required" };
  }
  if (data.length > 1) {
    return { error: "Only one file is allowed to be replaced" };
  }

  const oldFileMetadata = await getFileMetadataById(neo4jSession, fileId);
  if (!oldFileMetadata) {
    return { error: "File metadata not found for the provided fileId" };
  }

  const newFileNodes = await Promise.all(
    data.map(async (file) => {
      if (!file?.filename) {
        return null;
      }

      const { ext, name } = path.parse(file.filename);
      const newVersion = (oldFileMetadata.P.version || 0) + 1;
      const newFilename = `${name}_v${newVersion}_${currentDate}${ext}`;
      const filePath = saveFileToDisk(userDir, newFilename, file.data);
      const fileSize = file.data.length;
      const mimeType = file.type;
      const checksum = calculateChecksum(file.data);

      const newMetadata = {
        checksum,
        fileName: newFilename,
        filePath: filePath,
        fileSize,
        mimeType,
        originalFileName: file.filename,
        subDomain,
        version: newVersion,
      };

      return await saveFileMetadata(neo4jSession, newMetadata, fileId);
    }),
  );

  const context: EvalExpressionContext = {
    nodes: {},
    relationships: {},
  };
  const result = processResult(
    newFileNodes.filter((node) => node !== null),
    context,
    "f",
  );
  // Log file replacement
  await createActivityLog(
    neo4jSession,
    "file_replace",
    "File",
    fileId,
    user.P.email,
    `File replaced: ${oldFileMetadata.P.fileName} -> ${data[0]?.filename}`,
  );
  return {
    graph: {
      edges: context.relationships,
      vertexes: context.nodes,
    },
    result,
  };
}
