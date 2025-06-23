import type { APIEvent } from "@solidjs/start/server";
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { verifyPassword } from "~/lib/auth/password";
import { updateRedirectUrl } from "~/routes/api/auth/(user)/functions/updateRedirectUrl";
import { updateSession } from "~/server/auth/session/updateSession";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function POST({ request }: APIEvent) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new APIError("Invalid content type. Expected application/json", 415);
  }

  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const { email, password } = await request.json();

    if (!(email && password)) {
      throw new APIError("Email or password is missing", 400);
    }

    const user = await authenticateUser(email, password, subDomain, dbSession);

    // TODO: need signIn autdit log form in UI too.
    await createActivityLog(
      dbSession,
      "signin",
      "User",
      user.P.uuid,
      user.P.email,
      "User logged in successfully",
    );
    await updateSession(user);
    delete user.P.password;
    updateRedirectUrl(user, subDomain!);

    // Fire and forget the email sending process
    // sendNotificationEmail(EMAIL_TEMPLATES.LOGIN_NOTIFICATION,{}, "New Login to Your Account", user, subDomain!).catch(error => {
    //   console.error('Failed to send signIn notification email:', error);
    // });

    return {
      graph: {
        edges: {},
        vertexes: { [user.id]: user },
      },
      result: user,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function authenticateAdminUser(dbUser: Vertex, password: string) {
  const adminDbSession = (await getDriver()).session({
    database: ADMIN_DB_NAME,
  });

  try {
    const query = "MATCH (u:User) WHERE u.uuid = $uuid RETURN u";
    const adminDbResult = await adminDbSession.run(query, {
      uuid: dbUser.P.uuid,
    });

    if (adminDbResult.records.length === 0) {
      throw new APIError(
        `Not Authorized Email or Username for UUID: ${dbUser.P.uuid}. Please contact customer support.`,
        401,
      );
    }
    const adminUser = convertNodeToJson(adminDbResult.records[0].get("u"));

    // save admin user to session
    return comparePassword(adminUser, password);
  } finally {
    await adminDbSession.close();
  }
}

async function authenticateUser(
  emailOrUsername: string,
  password: string,
  _subDomain: string,
  dbSession: Session,
) {
  const query =
    "MATCH (u:User) WHERE u.email = $emailOrUsername OR u.username = $emailOrUsername RETURN u";
  const result = await dbSession.run(query, { emailOrUsername });

  if (result.records.length === 0) {
    throw new APIError("Not Authorized Email or Username.", 401);
  }

  const user = convertNodeToJson(result.records[0].get("u"));

  // Check if the user's account is pending deletion
  if (user.P.pendingDeletion === true) {
    throw new APIError(
      "This account is scheduled for deletion and cannot be accessed. Please contact support if this is a mistake.",
      403,
    );
  }

  if (!user.P.emailConfirmed) {
    throw new APIError(
      "Please confirm your email address before logging in.",
      403,
    );
  }

  // when system user, check password from system db
  if (!user.P.password) {
    return await authenticateAdminUser(user, password);
  }
  return comparePassword(user, password);
}

async function comparePassword(user: Vertex, password: string) {
  const isValid = await verifyPassword(password, user.P.password, user.P.salt);
  if (!isValid) {
    throw new APIError(
      "Unauthorized: Incorrect email, username, or password.",
      401,
    );
  }

  return user;
}
