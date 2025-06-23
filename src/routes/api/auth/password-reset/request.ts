import type { APIEvent } from "@solidjs/start/server";

import { v7 as uuidv7 } from "uuid";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const { identifier } = await request.json();

    if (!identifier) {
      throw new APIError("Email or username is required", 400);
    }

    // Check if user exists by either email or username
    const userResult = await dbSession.run(
      "MATCH (u:User) WHERE u.email = $identifier OR u.username = $identifier RETURN u",
      { identifier },
    );

    if (userResult.records.length === 0) {
      throw new APIError("No user found with this email or username", 404);
    }

    const user = convertNodeToJson(userResult.records[0].get("u"));
    const email = user.P.email; // Get the actual email for sending
    const userUuid = user.P.uuid; // Get the user UUID for secure reference

    // Generate a random 6-digit OTP on the server side
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Generate a unique reset session token
    const resetSessionToken = uuidv7();

    // Store the OTP, expiry, and session token in the database
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       SET u.resetOTP = $otp,
           u.resetOTPExpiry = datetime($expiresAt),
           u.resetSessionToken = $resetSessionToken
       RETURN u`,
      { expiresAt, otp, resetSessionToken, uuid: userUuid },
    );

    // Send the password reset email with OTP
    await sendNotificationEmail(
      EMAIL_TEMPLATES.PasswordReset,
      { otp },
      "Password Reset Request",
      user,
      subDomain,
    );

    // Log the password reset request
    await createActivityLog(
      dbSession,
      "password_reset_requested",
      "User",
      userUuid,
      email,
      "Password reset requested",
    );

    return {
      email: email, // Return email just for UI display purposes
      message: "Password reset instructions sent to your email",
      resetSessionToken: resetSessionToken,
      success: true,
      userUuid: userUuid, // Return UUID for more secure identification
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
