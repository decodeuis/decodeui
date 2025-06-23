import type { APIEvent } from "@solidjs/start/server";

import { getQuery } from "vinxi/http";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getSubdomainsForAccount } from "~/cypher/session/getSubdomainsForAccount";
import { API } from "~/lib/api/endpoints";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { validateAndConsumeToken } from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const query = getQuery();
    const token = query.token as string;

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

    const { email, uuid } = decodeUserData(userData);

    if (!(uuid && email)) {
      return new Response(null, {
        headers: { Location: `${API.urls.admin.signIn}?error=invalid_data` },
        status: 302,
      });
    }

    // Determine if we need to update across multiple databases
    if (subDomain === ADMIN_DB_NAME) {
      // Get all subdomains this user belongs to
      const subdomains = await getSubdomainsForAccount(dbSession, uuid);

      const driver = await getDriver();
      const updateSessions = subdomains.map((subdomain) =>
        driver.session({ database: subdomain }),
      );

      try {
        // Update in system DB
        const systemResult = await dbSession.run(
          `MATCH (u:User {uuid: $uuid, email: $email})
           SET u.emailConfirmed = true,
               u.updatedAt = datetime()
           RETURN u`,
          { email, uuid },
        );

        if (systemResult.records.length === 0) {
          return new Response(null, {
            headers: {
              Location: `${API.urls.admin.signIn}?error=user_not_found`,
            },
            status: 302,
          });
        }

        // Update in all subdomains
        const updatePromises = updateSessions.map((session) =>
          session.run(
            `MATCH (u:User {uuid: $uuid})
             SET u.emailConfirmed = true,
                 u.updatedAt = datetime()
             RETURN u`,
            { uuid },
          ),
        );

        await Promise.all(updatePromises);

        const updatedUser = convertNodeToJson(systemResult.records[0].get("u"));

        // Log the email verification
        await createActivityLog(
          dbSession,
          "email_verification",
          "User",
          updatedUser.P.uuid,
          updatedUser.P.email,
          `Email ${updatedUser.P.email} verified successfully`,
        );

        return new Response(null, {
          headers: {
            Location: `${API.urls.admin.signIn}?message=email_verified`,
          },
          status: 302,
        });
      } finally {
        await Promise.all(updateSessions.map((session) => session.close()));
      }
    } else {
      // Handle regular subdomain case
      const result = await dbSession.run(
        `MATCH (u:User {uuid: $uuid, email: $email})
         SET u.emailConfirmed = true,
             u.updatedAt = datetime()
         RETURN u`,
        { email, uuid },
      );

      if (result.records.length === 0) {
        return new Response(null, {
          headers: {
            Location: `${API.urls.admin.signIn}?error=user_not_found`,
          },
          status: 302,
        });
      }

      const updatedUser = convertNodeToJson(result.records[0].get("u"));

      // Log the email verification
      await createActivityLog(
        dbSession,
        "email_verification",
        "User",
        updatedUser.P.uuid,
        updatedUser.P.email,
        `Email ${updatedUser.P.email} verified successfully`,
      );

      return new Response(null, {
        headers: {
          Location: `${API.urls.admin.signIn}?message=email_verified`,
        },
        status: 302,
      });
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
