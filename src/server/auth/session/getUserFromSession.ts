import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getHttpsSession } from "~/server/auth/session/getHttpsSession";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getDriver } from "~/cypher/core/driver";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getAdminUser } from "~/cypher/permissions/utils/getAdminUser";

// Note: this return user from 'admin' database. so use uuid to find user from current subdomain.
export async function getUserFromSession(
  request?: APIEvent["request"],
): Promise<undefined | Vertex> {
  let dbSession = null;
  let adminDbSession = null;

  try {
    const httpSession = await getHttpsSession();
    const sessionUser = httpSession?.data?.user;

    if (!sessionUser) {
      return;
    }

    // Get user password from database
    const sessionData = await getDBSessionForSubdomain(request);
    dbSession = sessionData.dbSession;
    const subDomain = sessionData.subDomain;
    const query = "MATCH (u:User) WHERE u.uuid = $uuid RETURN u as u";
    const result = await dbSession.run(query, { uuid: sessionUser.P.uuid });

    if (result.records.length === 0) {
      return;
    }

    const userFromDb = convertNodeToJson(result.records[0].get("u"));

    if (!userFromDb.P.password) {
      // Create admin session
      const driver = await getDriver();
      adminDbSession = driver.session({ database: ADMIN_DB_NAME });

      // Check if user is a system user and get the user data
      const { exists, user: systemUser } = await getAdminUser(
        sessionUser.P.uuid,
        subDomain,
        adminDbSession,
      );

      if (exists && systemUser) {
        if (systemUser.P.password === sessionUser.P.password) {
          return systemUser;
        }
        return;
      }
    }

    // Return undefined if passwords don't match
    if (!userFromDb || userFromDb.P.password !== sessionUser.P.password) {
      return;
    }

    return sessionUser;
  } catch (error) {
    console.error("Error in getUserFromSession:", error);
    // Handle the error silently, returning undefined
    return;
  } finally {
    // Ensure sessions are always closed
    if (dbSession) {
      await dbSession.close();
    }
    if (adminDbSession) {
      await adminDbSession.close();
    }
  }
}
