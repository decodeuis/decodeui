import type { APIEvent } from "@solidjs/start/server";

import { readMultipartFormData } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

import { uploadFiles } from "./functions/uploadFile";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const data = await readMultipartFormData();
    if (!data || data.length === 0) {
      throw new APIError("No file data available", 400);
    }
    return await uploadFiles(data, subDomain, dbSession);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
