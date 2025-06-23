import type { APIEvent } from "@solidjs/start/server";

import { insertComponents } from "~/cypher/mutate/signup/seed/insertComponents";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    const response = await insertComponents(dbSession);

    if (!response.success) {
      throw new APIError("Failed to insert component tree", 500);
    }

    return {
      graph: {
        edges: {},
        vertexes: {},
      },
      result: {},
    };
  } catch (error: unknown) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
