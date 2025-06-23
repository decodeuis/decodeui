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

    const result = await dbSession.run(
      `MATCH (s:CompanySetting) 
       RETURN s.key as key`,
      { settings },
    );

    if (result.records.length > 1) {
      throw new APIError("Multiple company settings found", 500);
    }

    let settingsKey: string;
    let updatedSettings: Vertex;
    if (result.records.length === 0) {
      const newKey = "Default";
      const createResult = await dbSession.run(
        `CREATE (s:CompanySetting {
          key: $key,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        SET s += $settings
        RETURN s.key as key, s`,
        { key: newKey, settings },
      );
      settingsKey = createResult.records[0].get("key");
      updatedSettings = convertNodeToJson(createResult.records[0].get("s"));
    } else {
      settingsKey = result.records[0].get("key");
      const updatedResult = await dbSession.run(
        `MATCH (s:CompanySetting)
         SET s += $settings,
             s.updatedAt = datetime() 
         RETURN s`,
        { key: settingsKey, settings },
      );
      updatedSettings = convertNodeToJson(updatedResult.records[0].get("s"));
    }

    await createActivityLog(
      dbSession,
      "UPDATE_COMPANY_SETTINGS",
      "CompanySetting",
      settingsKey,
      user?.P?.email ?? "",
      "Updated company settings",
    );

    return {
      graph: {
        edges: {},
        vertexes: { [updatedSettings.id]: updatedSettings },
      },
      result: updatedSettings,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
