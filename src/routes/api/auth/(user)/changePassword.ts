import type { APIEvent } from "@solidjs/start/server";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { hashPassword, verifyPassword } from "~/lib/auth/password";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { currentPassword, newPassword, uuid } = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  const user = await getUserFromSession(request);

  if (!user) {
    throw new APIError("User not found", 404);
  }
  if (user.P.uuid !== uuid) {
    throw new APIError("User not authorized", 401);
  }

  try {
    const userResult = await dbSession.run(
      "MATCH (u:User {uuid: $uuid}) RETURN u",
      { uuid },
    );

    const user = userResult.records[0]?.get("u").properties;

    if (!user) {
      throw new APIError("User not found", 404);
    }

    if (!user.password) {
      throw new APIError(
        "Admin user password changes not allowed through this interface",
        403,
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(
      currentPassword,
      user.password,
      user.salt,
    );
    if (!isValidPassword) {
      throw new APIError("Current password is incorrect", 401);
    }

    // Hash new password
    const { hashedPassword, salt } = await hashPassword(newPassword);

    // Update password and salt
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       SET u.password = $hashedPassword,
           u.salt = $salt`,
      { hashedPassword, salt, uuid: user.uuid },
    );

    // Log the password change activity
    await createActivityLog(
      dbSession,
      "password_change",
      "User",
      uuid,
      user.email,
      "User password was changed",
    );

    // Send email notification
    sendNotificationEmail(
      EMAIL_TEMPLATES.PasswordChanged,
      {},
      "Your Password Has Been Changed",
      user,
      subDomain,
    ).catch((error) => {
      console.error("Failed to send password changed email:", error);
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
