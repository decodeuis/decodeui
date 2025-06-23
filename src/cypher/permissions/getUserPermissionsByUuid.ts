import type { APIEvent } from "@solidjs/start/server";
import type { Node } from "neo4j-driver";

import type {
  SystemRoleType,
  UserWithPermissions,
} from "~/lib/permissions/type/types";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

/**
 * Asynchronously gets user permissions by querying the database for role relationships
 * @param uuid The user's UUID
 * @param request The API request (for database session)
 * @returns Promise resolving to UserWithPermissions
 */
export async function getUserPermissionsByUuid(
  uuid: string,
  request?: APIEvent["request"],
): Promise<undefined | UserWithPermissions> {
  let dbSession = null;

  try {
    // Get database session
    const sessionData = await getDBSessionForSubdomain(request);
    dbSession = sessionData.dbSession;

    // Query to find user and their roles
    const query = `
      MATCH (u:User {uuid: $uuid})
      OPTIONAL MATCH (u)-[:UserRole]->(r:Role)
      RETURN u as user, collect(r) as roles
    `;

    const result = await dbSession.run(query, { uuid });

    if (result.records.length === 0) {
      return undefined;
    }

    // Convert user node to JSON
    const userFromDb = convertNodeToJson(result.records[0].get("user"));

    // Get roles if they exist
    const rolesArray = result.records[0].get("roles") as Node[];
    let userRoles: SystemRoleType[] = [];

    if (rolesArray && rolesArray.length > 0) {
      userRoles = rolesArray.map(
        (roleNode) => roleNode.properties.key as SystemRoleType,
      );
    }

    return {
      // NOTE: to find permissions, use the role permissions.
      // permissions: userFromDb?.P?.permissions || [],
      roles: userRoles,
      user: userFromDb,
    };
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return undefined;
  } finally {
    // Ensure session is closed
    if (dbSession) {
      await dbSession.close();
    }
  }
}
