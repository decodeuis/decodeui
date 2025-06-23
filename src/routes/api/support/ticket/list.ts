import type { APIEvent } from "@solidjs/start/server";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { getSupportTicketFormSchema } from "~/pages/global/support/functions/supportTicketFormSchema";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const user = await getUserFromSession(request);

  if (!user) {
    throw new APIError("User not found", 404);
  }

  const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

  if (!isAdmin) {
    throw new APIError("Unauthorized. Admin access required.", 403);
  }

  try {
    // Query based on user role, for admin we show all tickets, for non-admin we show only tickets created by the user
    const { incoming, outgoing } = getEdgesFromRowsAttr(
      getSupportTicketFormSchema(() => {}).attributes!,
    );

    let expression = `g:'Support'`;
    if (!isAdmin) {
      expression = `g:'Support[$0]'`;
    }

    const data = await fetchDataFromDB(
      {
        expression,
        incoming,
        outgoing,
      },
      {
        $0: {
          filter: { email: user.P.email },
        },
        nodes: {},
        relationships: {},
      },
    );

    return data;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
