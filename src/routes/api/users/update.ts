import type { APIEvent } from "@solidjs/start/server";
import type { Session, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { sendEmailConfirmation } from "~/routes/api/auth/(profile)/functions/sendEmailConfirmation";
import { validateUniqueFields } from "~/routes/api/auth/(profile)/functions/validateField";
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

    const { email, name, roles, username, uuid } = await request.json();

    if (!user.P.password) {
      return {
        error: "Admin Admin cannot update profile in subdomain",
        status: 404,
      };
    }

    const oldUser = user;
    const oldRoles = await getUserRoles(dbSession, uuid);

    await validateUniqueFields(dbSession, uuid, oldUser, email, username);

    // Start transaction after all validations are complete
    const transaction = dbSession.beginTransaction();

    try {
      // Store the pending email if changing
      const setEmail =
        email !== oldUser.P.email ? "u.pendingEmail = $email," : "";
      const isEmailChanged = email !== oldUser.P.email;
      const isUsernameChanged = username !== oldUser.P.username;
      const isNameChanged = name !== oldUser.P.name;

      // Update user properties
      const updatedUserNode = await updateUserProperties(
        transaction,
        isEmailChanged ? email : undefined,
        name,
        setEmail,
        username,
        uuid,
      );

      if (!updatedUserNode) {
        throw new APIError("User not found", 404);
      }

      // Handle role updates
      const existingRoleIds = await getExistingRoleIds(transaction, uuid);
      await removeOldRoles(transaction, roles, uuid);
      await addNewRoles(transaction, existingRoleIds, roles, uuid);

      const updatedUser = convertNodeToJson(updatedUserNode);
      const newRoles = await getUserRoles(transaction, uuid);

      // Build a detailed update message
      let details = "User updated";
      if (isNameChanged) {
        details += ` - name: ${oldUser.P.name} → ${name}`;
      }
      if (isUsernameChanged) {
        details += ` - username: ${oldUser.P.username} → ${username}`;
      }
      if (isEmailChanged) {
        details += ` - pending email change: ${oldUser.P.email} → ${email}`;
      }

      // Add role changes if any
      const addedRoles = newRoles.filter((r) => !oldRoles.includes(r));
      const removedRoles = oldRoles.filter((r) => !newRoles.includes(r));

      if (addedRoles.length > 0) {
        details += ` - added roles: ${addedRoles.join(", ")}`;
      }
      if (removedRoles.length > 0) {
        details += ` - removed roles: ${removedRoles.join(", ")}`;
      }

      // Log the user update activity
      await createActivityLog(
        transaction,
        "user_update",
        "User",
        uuid,
        user.P.email,
        details,
      );

      // If email was changed, send confirmation emails
      if (email !== oldUser.P.email) {
        await sendEmailConfirmation(
          request,
          oldUser,
          email,
          updatedUser,
          subDomain,
          transaction,
        );
      }

      await transaction.commit();

      return {
        graph: {
          edges: {},
          vertexes: { [updatedUser.id]: updatedUser },
        },
        result: updatedUser,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function addNewRoles(
  dbSession: Session | Transaction,
  existingRoleIds: string[],
  newRoleIds: string[],
  uuid: string,
) {
  await dbSession.run(
    `
    MATCH (u:User {uuid: $uuid})
    WITH u
    UNWIND $newRoleIds as roleId
    MATCH (r:Role)
    WHERE elementId(r) = roleId AND NOT roleId IN $existingRoleIds
    CREATE (u)-[:UserRole]->(r)
    `,
    { existingRoleIds, newRoleIds, uuid },
  );
}

async function getExistingRoleIds(
  dbSession: Session | Transaction,
  uuid: string,
) {
  const result = await dbSession.run(
    `
    MATCH (u:User {uuid: $uuid})-[:UserRole]->(role:Role)
    RETURN collect(elementId(role)) as roleIds
    `,
    { uuid },
  );
  return result.records[0]?.get("roleIds") || [];
}

// Helper function to get user roles
async function getUserRoles(
  dbSession: Session | Transaction,
  uuid: string,
): Promise<string[]> {
  const result = await dbSession.run(
    `MATCH (u:User {uuid: $uuid})-[:UserRole]->(r:Role)
     RETURN r.key`,
    { uuid },
  );

  return result.records.map((record) => record.get("r.key"));
}

async function removeOldRoles(
  dbSession: Session | Transaction,
  newRoleIds: string[],
  uuid: string,
) {
  await dbSession.run(
    `
    MATCH (u:User {uuid: $uuid})-[r:UserRole]->(role:Role)
    WHERE NOT elementId(role) IN $newRoleIds
    DELETE r
    `,
    { newRoleIds, uuid },
  );
}

async function updateUserProperties(
  dbSession: Session | Transaction,
  email: string | undefined,
  name: string,
  setEmail: string,
  username: string,
  uuid: string,
) {
  const result = await dbSession.run(
    `
    MATCH (u:User {uuid: $uuid})
    SET ${setEmail}
        u.username = $username,
        u.name = $name,
        u.updatedAt = datetime()
    RETURN u
    `,
    {
      email,
      name,
      username,
      uuid,
    },
  );
  return result.records[0]?.get("u");
}

// Remember to:
// 1. Implement the email sending functions
// 2. Add proper email templates for both notification types
// 3. Consider adding email verification for the new email address before making it active
// 4. Add rate limiting to prevent abuse

// Create an "EmailChanged" template for notification to the old email
// Create an "EmailConfirmation" template for verification sent to new email
// 3. Create an "EmailChangeSuccessful" template for final confirmation after verification
