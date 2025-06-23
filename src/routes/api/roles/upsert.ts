import type { APIEvent } from "@solidjs/start/server";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { mutateData } from "~/cypher/mutate/mutate_data/mutateData";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
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

    const { data, role } = await request.json();

    const existingRole = await dbSession.run(
      "MATCH (r:Role {key: $key}) where elementId(r) <> $elementId RETURN r",
      { elementId: role.id, key: role.P.key },
    );

    if (existingRole.records.length > 0) {
      throw new APIError("Role with this name already exists", 400);
    }

    // added frontend validation so system role keys are not updated

    // Determine if this is a new role or an update
    const isNewRole = !role.id || role.id.startsWith("-");
    const action = isNewRole ? "role_create" : "role_update";
    const details = isNewRole
      ? `Created new role: ${role.P.key}`
      : `Updated role: ${role.P.key}`;

    const tx = dbSession.beginTransaction();
    try {
      const res = await mutateData(data, tx);

      // Log role creation/update activity
      await createActivityLog(
        tx,
        action,
        "Role",
        isNewRole ? res.clientToServerVertexIdMap.get(role.id) : role.id,
        user.P.email,
        details,
      );

      await tx.commit();
      return res;
    } catch (error: unknown) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
