import type { APIEvent } from "@solidjs/start/server";

import { v7 as uuidv7 } from "uuid";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { sendInvitationEmail } from "~/routes/api/users/functions/sendInvitationEmail";
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

    const { email, name, roles, username } = await request.json();

    // Check if user already exists with email
    const existingUserEmail = await dbSession.run(
      "MATCH (u:User {email: $email}) RETURN u",
      { email },
    );

    if (existingUserEmail.records.length > 0) {
      throw new APIError("User with this email already exists", 400);
    }

    // Check if username already exists
    const existingUsername = await dbSession.run(
      "MATCH (u:User {username: $username}) RETURN u",
      { username },
    );

    if (existingUsername.records.length > 0) {
      throw new APIError("Username already taken", 400);
    }

    const newUserUuid = uuidv7();

    // Create new user
    const result = await dbSession.run(
      `
      CREATE (u:User {
        uuid: $uuid,
        email: $email,
        username: $username,
        name: $name,
        status: "invited",
        createdAt: datetime()
      })
      WITH u
      UNWIND $roles as roleId
      MATCH (r:Role)
      WHERE elementId(r) = roleId
      CREATE (u)-[:UserRole]->(r)
      RETURN u
    `,
      {
        email,
        name,
        roles,
        username,
        uuid: newUserUuid,
      },
    );

    // Extract the created user from the result
    const createdUser = convertNodeToJson(result.records[0].get("u"));

    // Get role names for logging
    const rolesResult = await dbSession.run(
      `MATCH (r:Role) WHERE elementId(r) IN $roles
       RETURN r.key`,
      { roles },
    );

    const roleNames = rolesResult.records
      .map((record) => record.get("r.key"))
      .join(", ");

    // Log the user invitation
    await createActivityLog(
      dbSession,
      "user_invite",
      "User",
      newUserUuid,
      user.P.email,
      `Invited user ${name} (${email}) with roles: ${roleNames}`,
    );

    // Send invitation email
    await sendInvitationEmail(request, createdUser, subDomain, dbSession);

    return {
      graph: {
        edges: {},
        vertexes: { [createdUser.id]: createdUser },
      },
      result: createdUser,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
