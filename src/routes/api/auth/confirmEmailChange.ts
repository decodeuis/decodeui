import type { APIEvent } from "@solidjs/start/server";

import { getQuery } from "vinxi/http";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getSubdomainsForAccount } from "~/cypher/session/getSubdomainsForAccount";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { validateAndConsumeToken } from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { updateSession } from "~/server/auth/session/updateSession";

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
        headers: { Location: "/auth/settings?error=invalid_token" },
        status: 302,
      });
    }

    const { email, newEmail, uuid } = decodeUserData(userData);

    if (!(uuid && email && newEmail)) {
      return new Response(null, {
        headers: { Location: "/auth/settings?error=invalid_data" },
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
          `MATCH (u:User {uuid: $uuid, email: $email, pendingEmail: $newEmail})
           SET u.email = $newEmail, 
               u.pendingEmail = null,
               u.updatedAt = datetime()
           RETURN u`,
          { email, newEmail, uuid },
        );

        if (systemResult.records.length === 0) {
          return new Response(null, {
            headers: { Location: "/auth/settings?error=user_not_found" },
            status: 302,
          });
        }

        // Update in all subdomains
        const updatePromises = updateSessions.map((session) =>
          session.run(
            `MATCH (u:User {uuid: $uuid})
             SET u.email = $newEmail, 
                 u.pendingEmail = null,
                 u.updatedAt = datetime()
             RETURN u`,
            { newEmail, uuid },
          ),
        );

        await Promise.all(updatePromises);

        const updatedUser = convertNodeToJson(systemResult.records[0].get("u"));

        // Log the email change activity
        await createActivityLog(
          dbSession,
          "email_change",
          "User",
          uuid,
          newEmail,
          `Email changed from ${email} to ${newEmail}`,
        );

        // Update session with new email
        await updateSession(updatedUser);

        // Send success email
        sendNotificationEmail(
          EMAIL_TEMPLATES.EmailChangeSuccessful,
          {},
          "Email Change Successful",
          updatedUser,
          subDomain,
        );

        return new Response(null, {
          headers: { Location: "/auth/settings?message=email_confirmed" },
          status: 302,
        });
      } finally {
        await Promise.all(updateSessions.map((session) => session.close()));
      }
    } else {
      // Handle regular subdomain case (existing code)
      const result = await dbSession.run(
        `MATCH (u:User {uuid: $uuid, email: $email, pendingEmail: $newEmail})
         SET u.email = $newEmail, 
             u.pendingEmail = null,
             u.updatedAt = datetime()
         RETURN u`,
        { email, newEmail, uuid },
      );

      if (result.records.length === 0) {
        return new Response(null, {
          headers: { Location: "/auth/settings?error=user_not_found" },
          status: 302,
        });
      }

      const updatedUser = convertNodeToJson(result.records[0].get("u"));

      // Log the email change activity
      await createActivityLog(
        dbSession,
        "email_change",
        "User",
        uuid,
        newEmail,
        `Email changed from ${email} to ${newEmail}`,
      );

      // Update session with new email
      await updateSession(updatedUser);

      // Send success email
      sendNotificationEmail(
        EMAIL_TEMPLATES.EmailChangeSuccessful,
        {},
        "Email Change Successful",
        updatedUser,
        subDomain,
      );

      return new Response(null, {
        headers: { Location: "/auth/settings?message=email_confirmed" },
        status: 302,
      });
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
