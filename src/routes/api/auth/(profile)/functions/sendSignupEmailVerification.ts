import type { APIEvent } from "@solidjs/start/server";
import type { Session, Transaction } from "neo4j-driver";

import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData } from "~/lib/auth/userDataEncoder";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function sendSignupEmailVerification(
  request: APIEvent["request"],
  dbSession: Session | Transaction,
  user: Vertex,
  subDomain: string,
) {
  // Create token payload with user data
  const userData = encodeUserData({
    email: user.P.email,
    uuid: user.P.uuid,
  });

  // Generate a secure token for email verification
  const token = await generateSecureToken(userData, dbSession);
  const protocol = request.url.startsWith("https") ? "https" : "http";
  const host = request.headers.get("host") || "";
  const url = `${protocol}://${host}/api/auth/verifyEmail?token=${token}`;

  // Send verification email
  await sendNotificationEmail(
    EMAIL_TEMPLATES.SignupEmailVerification,
    { url },
    "Verify Your Email Address",
    user,
    subDomain,
  );

  return true;
}
