import type { APIEvent } from "@solidjs/start/server";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { roleFormSchema } from "~/pages/global/role/functions/formSchema";
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

    if (!user?.P?.email) {
      throw new Error("Unauthorized");
    }

    const { id } = await request.json();

    const { incoming, outgoing } = getEdgesFromRowsAttr(
      roleFormSchema.attributes,
    );
    const data = await fetchDataFromDB({
      expression: `id:'${id}'`,
      incoming,
      outgoing,
    });

    return data;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
