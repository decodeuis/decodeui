import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function DELETE({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    // const [graph] = useGraph();

    // if (!(user?.P?.email && isAdminRole(graph))) {
    //   throw new APIError("Unauthorized", 401);
    // }

    const { id } = await request.json();

    // Check if role exists and is not in use
    const roleCheck = await dbSession.run(
      `
      MATCH (r:Role)
      WHERE elementId(r) = $id
      OPTIONAL MATCH (u:User)-[:UserRole]->(r)
      RETURN r, count(u) as userCount, r.key as roleName
    `,
      { id },
    );

    if (roleCheck.records.length === 0) {
      throw new APIError("Role not found", 404);
    }

    const roleName = roleCheck.records[0].get("roleName");
    if (Object.values(SYSTEM_ROLES).includes(roleName)) {
      throw new APIError("Cannot delete system role.", 403);
    }

    const userCount = roleCheck.records[0].get("userCount");
    if (userCount > 0) {
      throw new APIError("Cannot delete role that is assigned to users", 400);
    }

    // Delete the role
    const deletedRoleResult = await dbSession.run(
      `
      MATCH (r:Role)
      WHERE elementId(r) = $id
      DELETE r
      RETURN r
    `,
      { id },
    );
    const deletedRole = convertNodeToJson(
      deletedRoleResult.records[0].get("r"),
    );
    // Log role deletion activity
    await createActivityLog(
      dbSession,
      "role_delete",
      "Role",
      id,
      user.P.email,
      `Deleted role: ${deletedRole.P.key}`,
    );

    return {
      graph: {
        deleted_edges: [],
        deleted_vertexes: [roleCheck.records[0].get("r").identity],
      },
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
