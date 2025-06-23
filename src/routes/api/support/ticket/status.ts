import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const { status, ticketId } = await request.json();

  const user = await getUserFromSession(request);
  if (!user) {
    throw new APIError("User not found", 404);
  }

  const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);
  if (!isAdmin) {
    throw new APIError("Unauthorized. Admin access required.", 403);
  }

  try {
    const query = `
      MATCH (t:Support), (s:SupportStatus {key: 'Open'})
      WHERE elementId(t) = $ticketId
      MERGE (t)-[:SupportSupportStatus]->(s)
      RETURN t
    `;

    const result = await dbSession.run(query, { status, ticketId });

    const ticket = convertNodeToJson(result.records[0].get("t"));

    return {
      graph: {
        edges: {},
        vertexes: {
          [ticket.id]: ticket,
        },
      },
      result: ticket,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
