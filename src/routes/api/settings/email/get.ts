import type { APIEvent } from "@solidjs/start/server";

import { processResult } from "~/cypher/conversion/processResult";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    let result;
    if (subDomain === ADMIN_DB_NAME) {
      // Get account-specific email settings
      const user = await getUserFromSession(request);
      result = await dbSession.run(
        `MATCH (a:Account)-[:AccountUser]->(u:User {uuid: $uuid})
         MATCH (a)-[:AccountEmailSetting]->(s:EmailSetting)
         RETURN s as settings`,
        { uuid: user?.P.uuid },
      );
    } else {
      // Get subdomain email settings
      result = await dbSession.run(
        `MATCH (s:EmailSetting)
         RETURN s as settings`,
      );
    }

    const settings = processResult(
      result.records,
      { nodes, relationships },
      "settings",
      "",
    );

    return {
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: settings,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
