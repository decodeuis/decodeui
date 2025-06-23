import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import type { ServerResult } from "~/cypher/types/ServerResult";

import { updateProfile } from "./functions/updateProfile";

export async function POST({ request }: APIEvent) {
  const payload = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }
    if (user.P.uuid !== payload.uuid) {
      throw new APIError("User not authorized", 401);
    }

    const result = await updateProfile(
      request,
      user,
      payload,
      dbSession,
      subDomain,
    );

    if ("error" in result) {
      throw new APIError(
        (result as { error: string; status: number }).error ||
          "Failed to update profile",
        (result as { error: string; status: number }).status || 500,
      );
    }

    return result as ServerResult;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
