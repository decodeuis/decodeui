import type { APIEvent } from "@solidjs/start/server";

import { deleteVertex } from "~/cypher/mutate/page/deletePage";
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

    const { id } = await request.json();

    if (!id) {
      throw new APIError("Vertex ID is required", 400);
    }

    return await deleteVertex(dbSession, id, user);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
