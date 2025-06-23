import type { APIEvent } from "@solidjs/start/server";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData, type UserData } from "~/lib/auth/userDataEncoder";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export interface SMTPSettings {
  fromEmail: string;
  smtpHost: string;
  smtpPassword: string;
  smtpPort: number;
  smtpUsername: string;
}

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

    const settings = (await request.json()) as SMTPSettings;

    // Generate a secure token instead of passing user data directly
    const secureToken = user
      ? await generateSecureToken(encodeUserData(user.P as UserData), dbSession)
      : undefined;

    try {
      await sendNotificationEmail(
        EMAIL_TEMPLATES.TestEmail,
        {
          param1: "value1",
          param2: "value2",
        },
        "Test Email",
        user,
        subDomain,
        secureToken,
      );

      await createActivityLog(
        dbSession,
        "TEST_EMAIL_SETTINGS",
        "EmailSetting",
        "email",
        user?.P?.email ?? "",
        `Tested email settings with SMTP host: ${settings.smtpHost}`,
      );

      return {
        message: "Test email sent successfully",
        success: true,
      };
    } catch (error) {
      return handleAPIError(error);
    }
  } finally {
    await dbSession.close();
  }
}
