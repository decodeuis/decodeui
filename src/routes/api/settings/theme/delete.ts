import type { APIEvent } from "@solidjs/start/server";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
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

    const { themeId } = await request.json();

    if (!themeId) {
      throw new APIError("Theme ID is required", 400);
    }

    // Check if theme exists and is not currently selected
    // First get the theme name before deleting it
    const themeQuery = await dbSession.run(
      `MATCH (t:Theme)
       WHERE elementId(t) = $themeId
       RETURN t`,
      { themeId },
    );

    if (themeQuery.records.length === 0) {
      throw new APIError("Theme not found", 404);
    }

    const theme = convertNodeToJson(themeQuery.records[0].get("t"));
    const themeName = theme.P.key || "Unknown theme";

    // Now check if it's not selected and delete it
    const deleteResult = await dbSession.run(
      `MATCH (t:Theme)
       WHERE elementId(t) = $themeId
       AND NOT EXISTS((:GlobalSetting)-[:GlobalSettingTheme]->(t))
       DELETE t
       RETURN count(t) as deletedCount`,
      { themeId },
    );

    const deletedCount = deleteResult.records[0].get("deletedCount");

    if (deletedCount === 0) {
      throw new APIError(
        "Theme is currently selected and cannot be deleted",
        400,
      );
    }
    // Log theme deletion
    await createActivityLog(
      dbSession,
      "theme_delete",
      "Theme",
      themeId,
      user.P.email,
      `Deleted theme: ${themeName}`,
    );

    return {
      graph: {
        deleted_vertexes: [themeId],
      },
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
