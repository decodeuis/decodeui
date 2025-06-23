import type { APIEvent } from "@solidjs/start/server";

import { mutateData } from "~/cypher/mutate/mutate_data/mutateData";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

// only for updating ticket for now.
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

    const { data, ticket } = await request.json();

    if (!isAdmin && ticket.P.email !== user.P.email) {
      throw new APIError("Unauthorized.", 403);
    }

    const tx = dbSession.beginTransaction();
    try {
      const res = await mutateData(data, tx);
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
