import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { hashPassword } from "~/lib/auth/password";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const { newPassword, resetSessionToken, userUuid } = await request.json();

    if (!(userUuid && newPassword && resetSessionToken)) {
      throw new APIError("Missing required fields", 400);
    }

    // Check if the user exists, OTP has been verified, and session token matches
    const userResult = await dbSession.run(
      `MATCH (u:User {uuid: $userUuid})
       WHERE u.resetOTPVerified = true
         AND u.resetSessionToken = $resetSessionToken
       RETURN u`,
      { resetSessionToken, userUuid },
    );

    if (userResult.records.length === 0) {
      throw new APIError(
        "User not found, OTP not verified, or invalid session",
        401,
      );
    }

    const user = convertNodeToJson(userResult.records[0].get("u"));

    // Hash the new password
    const { hashedPassword, salt } = await hashPassword(newPassword);

    // Update password and clear reset-related fields
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       SET u.password = $hashedPassword,
           u.salt = $salt,
           u.resetOTP = null,
           u.resetOTPExpiry = null,
           u.resetOTPVerified = null,
           u.resetSessionToken = null,
           u.updatedAt = datetime()
       RETURN u`,
      { hashedPassword, salt, uuid: user.P.uuid },
    );

    // Log the password reset
    await createActivityLog(
      dbSession,
      "password_reset_completed",
      "User",
      user.P.uuid,
      user.P.email,
      "Password was reset successfully",
    );

    // Send notification email
    sendNotificationEmail(
      EMAIL_TEMPLATES.PasswordChanged,
      {},
      "Your Password Has Been Reset",
      user,
      subDomain,
    ).catch((error) => {
      console.error("Failed to send password reset confirmation email:", error);
    });

    return {
      message: "Password has been reset successfully",
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
