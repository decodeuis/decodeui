import type { APIEvent } from "@solidjs/start/server";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { logout } from "~/server/auth/session/logout";

export async function POST({ request }: APIEvent) {
  try {
    // Get user before we log them out
    const user = await getUserFromSession(request);

    // If we have a user, log the logout activity
    if (user) {
      const { dbSession } = await getDBSessionForSubdomain(request);

      try {
        await createActivityLog(
          dbSession,
          "logout",
          "User",
          user.P.uuid,
          user.P.email,
          "User logged out",
        );
      } finally {
        await dbSession.close();
      }
    }

    // Complete the logout process
    await logout();

    return {
      message: "Logout successful",
    };
  } catch (error) {
    return handleAPIError(
      new APIError(
        error instanceof Error ? error.message : "Failed to logout",
        500,
      ),
    );
  }
}
