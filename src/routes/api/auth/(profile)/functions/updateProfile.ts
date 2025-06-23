import type { APIEvent } from "@solidjs/start/server";
import type { Session } from "neo4j-driver";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getSubdomainsForAccount } from "~/cypher/session/getSubdomainsForAccount";
import { sendEmailConfirmation } from "~/routes/api/auth/(profile)/functions/sendEmailConfirmation";
import { validateUniqueFields } from "~/routes/api/auth/(profile)/functions/validateField";
import { updateSession } from "~/server/auth/session/updateSession";
import type { Vertex } from "~/lib/graph/type/vertex";

type ProfilePayload = {
  email?: string;
  username?: string;
  uuid: string;
};

export async function updateProfile(
  request: APIEvent["request"],
  currentUser: Vertex,
  payload: ProfilePayload,
  dbSession: Session,
  subDomain: string,
): Promise<ServerResult | { error: string; status: number }> {
  const { email, username, uuid } = payload;

  if (!currentUser.P.password) {
    return {
      error: "Administrator cannot update profile in subdomain",
      status: 404,
    };
  }

  const oldUser = currentUser;
  const isEmailChanged = !!email && email !== oldUser.P.email;
  const isUsernameChanged = !!username && username !== oldUser.P.username;

  if (subDomain === ADMIN_DB_NAME) {
    const subdomains = await getSubdomainsForAccount(
      dbSession,
      currentUser.P.uuid,
    );
    const driver = await getDriver();
    const validationSessions = subdomains.map((subdomain) =>
      driver.session({ database: subdomain }),
    );

    try {
      await validateUniqueFields(
        dbSession,
        currentUser.P.uuid,
        oldUser,
        email,
        username,
      );

      for (const session of validationSessions) {
        await validateUniqueFields(
          session,
          currentUser.P.uuid,
          oldUser,
          email,
          username,
        );
      }

      const updateQuery = buildUpdateQuery(isEmailChanged, isUsernameChanged);
      if (!updateQuery) {
        throw new Error("No updates to perform");
      }
      const updatePromises = [
        dbSession.run(updateQuery, {
          email,
          username,
          uuid: currentUser.P.uuid,
        }),
        ...validationSessions.map((session) =>
          session.run(updateQuery, {
            email,
            username,
            uuid: currentUser.P.uuid,
          }),
        ),
      ];

      const results = await Promise.all(updatePromises);
      const mainResult = results[0];

      if (mainResult.records.length === 0) {
        throw new Error("Failed to update profile");
      }

      const userNew = convertNodeToJson(mainResult.records[0].get("u"));
      await updateSession(userNew);

      if (isEmailChanged) {
        await sendEmailConfirmation(
          request,
          oldUser,
          email,
          userNew,
          subDomain,
          dbSession,
        );
      }

      await saveActivityLog(dbSession, userNew, payload);

      return {
        graph: {
          edges: {},
          vertexes: { [userNew.id]: userNew },
        },
        result: userNew,
        message: isEmailChanged
          ? "Profile updated successfully. Please check your email to confirm your new email address."
          : "Profile updated successfully",
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to update profile",
        status: 500,
      };
    } finally {
      await Promise.all(validationSessions.map((session) => session.close()));
    }
  } else {
    // Single subdomain update
    await validateUniqueFields(
      dbSession,
      currentUser.P.uuid,
      oldUser,
      email,
      username,
    );

    const finalQuery = buildUpdateQuery(isEmailChanged, isUsernameChanged);
    if (!finalQuery) {
      throw new Error("No updates to perform");
    }

    const updateResult = await dbSession.run(finalQuery, {
      email,
      username,
      uuid: currentUser.P.uuid,
    });

    if (updateResult.records.length === 0) {
      return { error: "User not found", status: 404 };
    }

    const userNew = convertNodeToJson(updateResult.records[0].get("u"));
    if (isEmailChanged) {
      await sendEmailConfirmation(
        request,
        oldUser,
        email,
        userNew,
        subDomain,
        dbSession,
      );
    }

    await saveActivityLog(dbSession, userNew, payload);

    return {
      graph: {
        edges: {},
        vertexes: { [userNew.id]: userNew },
      },
      result: userNew,
      message: isEmailChanged
        ? "Profile updated successfully. Please check your email to confirm your new email address."
        : "Profile updated successfully",
    };
  }
}

function buildUpdateQuery(
  isEmailChanged: boolean,
  isUsernameChanged: boolean,
): string {
  const updates = [];
  if (isEmailChanged) {
    updates.push("u.pendingEmail = $email");
  }
  if (isUsernameChanged) {
    updates.push("u.username = $username");
  }

  const updateString = updates.length ? `${updates.join(", ")},` : "";
  return updateString
    ? `
    MATCH (u:User {uuid: $uuid})
    SET ${updateString}
        u.updatedAt = datetime()
    RETURN u
  `
    : "";
}

async function saveActivityLog(
  dbSession: Session,
  user: Vertex,
  payload: ProfilePayload,
) {
  let details = "Profile updated";
  if (payload.username) {
    details += ` - username: ${payload.username}`;
  }
  if (payload.email) {
    details += ` - pending email: ${payload.email}`;
  }

  // Log the profile update activity
  await createActivityLog(
    dbSession,
    "profile_update",
    "User",
    user.P.uuid,
    user.P.email,
    details,
  );
}
