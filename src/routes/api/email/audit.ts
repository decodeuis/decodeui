import type { APIEvent } from "@solidjs/start/server";

import { processResult } from "~/cypher/conversion/processResult";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function GET({ request }: APIEvent) {
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
    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    const result = await dbSession.run(`
      MATCH (e:Email)
      RETURN e
      ORDER BY e.sentAt DESC
      LIMIT 100
    `);

    const emails = processResult(
      result.records,
      { nodes, relationships },
      "e",
      "",
    );

    return {
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: emails,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
