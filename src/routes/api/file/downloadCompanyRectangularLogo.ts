import type { APIEvent } from "@solidjs/start/server";

import { redirect } from "@solidjs/router";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";

import { downloadFileById } from "./functions/downloadFileById";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    // Query to get the company logo file ID
    const result = await dbSession.run(`
      MATCH (g:GlobalSetting)-[:CompanyRectangularLogo]->(f:File)
      RETURN elementId(f) as fileId
    `);

    if (result.records.length === 0) {
      // throw new APIError("Company logo not found", 404);
      return redirect("/images/logo.svg");
    }

    const fileId = result.records[0].get("fileId");
    return await downloadFileById(fileId, dbSession);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
