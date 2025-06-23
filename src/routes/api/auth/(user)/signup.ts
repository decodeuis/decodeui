import type { APIEvent } from "@solidjs/start/server";
import type { Transaction } from "neo4j-driver";

import type { SignupRequestData } from "~/cypher/mutate/signup/type/SignupRequestData";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { signupAdmin } from "~/cypher/mutate/signup/signupAdmin";
import { signupUser } from "~/cypher/mutate/signup/signupUser";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { sendSignupEmailVerification } from "~/routes/api/auth/(profile)/functions/sendSignupEmailVerification";
import { updateRedirectUrl } from "~/routes/api/auth/(user)/functions/updateRedirectUrl";
import { updateSession } from "~/server/auth/session/updateSession";

export async function POST({ request }: APIEvent) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {
      error: "Invalid content type. Expected application/json",
      success: false,
    };
  }

  const { dbSession, domain, subDomain } =
    await getDBSessionForSubdomain(request);
  const tx = dbSession.beginTransaction();

  try {
    const data: SignupRequestData = await request.json();
    const user = await handleSignup(request, data, tx, subDomain);
    if (user.error) {
      return {
        error: user.error,
        success: false,
      };
    }
    await tx.commit();
    return user;
  } catch (error) {
    await tx.rollback();
    return handleAPIError(error);
  } finally {
    await tx.close();
    await dbSession.close();
  }
}

async function handleSignup(
  request: APIEvent["request"],
  data: SignupRequestData,
  tx: Transaction,
  subDomain: string,
) {
  try {
    let user;

    if (subDomain === ADMIN_DB_NAME) {
      const result = await signupAdmin(tx, data);
      if (result.error) {
        return {
          error: result.error,
        };
      }
      user = result.user;
    } else {
      user = await signupUser(tx, data);
    }

    if (!("id" in user)) {
      throw new Error("User creation failed");
    }

    // Welcome email
    sendNotificationEmail(
      EMAIL_TEMPLATES.WelcomeEmail,
      {},
      "Welcome to Our Platform",
      user,
      subDomain,
    );

    // by default, emailConfirmed is false
    // Send email verification
    await sendSignupEmailVerification(request, tx, user, subDomain);

    await updateSession(user);
    delete user.P.password;
    updateRedirectUrl(user, subDomain);

    return {
      graph: {
        edges: {},
        vertexes: { [user.id]: user },
      },
      result: user,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      error: errorMessage,
    };
  }
}
