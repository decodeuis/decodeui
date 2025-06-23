import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { API } from "~/lib/api/endpoints";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { validateAndConsumeToken } from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      throw new APIError("Invalid or missing token", 400);
    }

    // Validate and consume the token
    const userData = await validateAndConsumeToken(token, dbSession);
    if (!userData) {
      return new Response(null, {
        headers: { Location: `${API.urls.admin.signIn}?error=invalid_token` },
        status: 302,
      });
    }

    const { uuid } = decodeUserData(userData);

    // Update user status from "invited" to "active"
    const result = await dbSession.run(
      `MATCH (u:User {uuid: $uuid, status: "invited"})
       SET u.status = "active"
       RETURN u`,
      { uuid },
    );

    if (result.records.length === 0) {
      return new Response(null, {
        headers: {
          Location: `${API.urls.admin.signIn}?error=invalid_invitation`,
        },
        status: 302,
      });
    }

    // Redirect to set password page with token
    return new Response(null, {
      headers: { Location: `/auth/set-password?token=${token}` },
      status: 302,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
