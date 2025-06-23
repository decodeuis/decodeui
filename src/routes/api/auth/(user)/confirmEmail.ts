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

    const { email } = decodeUserData(userData);

    // Update user's emailConfirmed status
    const result = await dbSession.run(
      `MATCH (u:User {email: $email})
       SET u.emailConfirmed = true
       RETURN u`,
      { email },
    );

    if (result.records.length === 0) {
      return new Response(null, {
        headers: { Location: `${API.urls.admin.signIn}?error=user_not_found` },
        status: 302,
      });
    }

    // Redirect to signIn page with success message
    return new Response(null, {
      headers: { Location: `${API.urls.admin.signIn}?message=email_confirmed` },
      status: 302,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
