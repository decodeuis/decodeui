import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import type { Vertex } from "~/lib/graph/type/vertex";

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

    const settings = await request.json();

    // First check if GlobalSetting exists
    const checkResult = await dbSession.run(
      `MATCH (s:GlobalSetting) 
       RETURN s`,
    );

    let settingsVertex: Vertex;

    if (checkResult.records.length > 1) {
      throw new APIError("Multiple global settings found", 500);
    }

    if (checkResult.records.length === 0) {
      // Create new GlobalSetting if none exists
      const newKey = "Default";
      const createResult = await dbSession.run(
        `CREATE (s:GlobalSetting {
          key: $key,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        SET s += $settings
        RETURN s`,
        { key: newKey, settings },
      );
      settingsVertex = convertNodeToJson(createResult.records[0].get("s"));
    } else {
      // Update existing GlobalSetting
      const result = await dbSession.run(
        `MATCH (s:GlobalSetting)
         SET s += $settings,
             s.updatedAt = datetime()
         RETURN s`,
        { settings: settings },
      );
      settingsVertex = convertNodeToJson(result.records[0].get("s"));
    }

    await createActivityLog(
      dbSession,
      "UPDATE_GLOBAL_SETTING",
      "GlobalSetting",
      settingsVertex.P.key,
      user?.P?.email ?? "",
      "Updated global settings",
    );

    return {
      graph: {
        edges: {},
        vertexes: { [settingsVertex.id]: settingsVertex },
      },
      result: settingsVertex,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
