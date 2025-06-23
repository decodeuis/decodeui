import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }
    const uuid = user.P.uuid;
    const id = user.id;

    // Mark the user account for deletion (set pendingDeletion flag and timestamp)
    const userUpdate = await dbSession.run(
      `
      MATCH (u:User)
      WHERE u.uuid = $uuid
      SET u.pendingDeletion = true,
          u.deletionScheduledAt = datetime()
      RETURN u
    `,
      { uuid },
    );

    if (userUpdate.records.length === 0) {
      throw new APIError("User not found", 404);
    }

    const updatedUser = convertNodeToJson(userUpdate.records[0].get("u"));

    // Create a scheduled job to delete the account after 48 hours
    await dbSession.run(
      `
      CREATE (job:ScheduledJob {
        type: "account_deletion",
        userId: $id,
        userEmail: $email,
        scheduledAt: datetime(),
        executeAt: datetime() + duration('PT48H'),
        status: "scheduled"
      })
      `,
      { email: user.P.email, id },
    );

    // Log the account deletion request
    await createActivityLog(
      dbSession,
      "user_account_deletion_request",
      "User",
      updatedUser.P.uuid,
      user.P.email,
      `User ${updatedUser.P.name} (${updatedUser.P.email}) requested account deletion. Scheduled for removal in 48 hours.`,
    );

    return {
      message:
        "Account scheduled for deletion. It will be permanently removed after 48 hours.",
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
