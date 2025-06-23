import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { createOrUpdateAccountEmailSettings } from "~/cypher/mutate/email/createOrUpdateAccountEmailSettings";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
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

    const settings = await request.json();

    // Test email sending with the new settings
    // TODO: temporary comment out
    // await sendEmail(settings.testEmail, {
    //   customHtml: `
    //     <h1>Test Email</h1>
    //     <p>This is a test email to verify your email settings.</p>
    //     <p>If you received this email, your email settings are working correctly.</p>
    //   `,
    //   subject: "Test Email Settings"
    // });
    let settingsKey;
    if (subDomain === ADMIN_DB_NAME) {
      // Get account ID for the current user
      const accountResult = await dbSession.run(
        `MATCH (a:Account)-[:AccountUser]->(u:User {uuid: $uuid})
         RETURN a.id as accountId`,
        { uuid: user?.P.uuid },
      );
      const accountId = accountResult.records[0]?.get("accountId");

      if (!accountId) {
        throw new APIError("Account not found", 404);
      }

      // Create or update account-specific email settings
      settingsKey = await createOrUpdateAccountEmailSettings(
        dbSession,
        accountId,
        settings,
      );
    } else {
      const result = await dbSession.run(
        `MATCH (s:EmailSetting) 
         SET s += $settings,
             s.updatedAt = datetime() 
         RETURN s.key as key`,
        { settings },
      );

      if (result.records.length === 0) {
        const newKey = "Default";
        const createResult = await dbSession.run(
          `CREATE (s:EmailSetting {
            key: $key,
            createdAt: datetime(),
            updatedAt: datetime()
          })
          SET s += $settings
          RETURN s.key as key`,
          { key: newKey, settings },
        );
        settingsKey = createResult.records[0].get("key");
      } else {
        settingsKey = result.records[0].get("key");
      }
    }

    await createActivityLog(
      dbSession,
      "UPDATE_EMAIL_SETTINGS",
      "EmailSetting",
      settingsKey,
      user?.P.email ?? "",
      "Updated email settings",
    );

    // Fetch the updated settings to return
    const updatedSettingsResult = await dbSession.run(
      "MATCH (s:EmailSetting {key: $key}) RETURN s",
      { key: settingsKey },
    );
    const updatedSettings = convertNodeToJson(
      updatedSettingsResult.records[0]?.get("s"),
    );

    return {
      graph: {
        edges: {},
        vertexes: { [settingsKey]: updatedSettings },
      },
      result: updatedSettings,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
