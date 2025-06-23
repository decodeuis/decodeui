import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { profileImage, uuid } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }
    if (user.P.uuid !== uuid) {
      throw new APIError("User not authorized", 401);
    }

    if (!profileImage) {
      throw new APIError("Profile image is required", 400);
    }

    // First check if the relationship already exists
    const existingResult = await dbSession.run(
      `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
       WHERE elementId(f) = $profileImage
       RETURN r`,
      { profileImage, uuid },
    );

    // If relationship exists, delete other relationships and return
    if (existingResult.records.length > 0) {
      await dbSession.run(
        `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
         WHERE elementId(f) <> $profileImage
         DELETE r`,
        { profileImage, uuid },
      );
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    }

    // Delete all existing UserProfileImage relationships
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
       DELETE r`,
      { uuid },
    );

    // Create new relationship
    const result = await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       MATCH (f:File) WHERE elementId(f) = $profileImage
       MERGE (u)-[:UserProfileImage]->(f)
       RETURN u, f`,
      { profileImage, uuid },
    );

    if (!(result.records[0]?.get("u") && result.records[0]?.get("f"))) {
      throw new APIError("User or file not found", 404);
    }
    const file = convertNodeToJson(result.records[0]?.get("f"));

    // Log the profile image update activity
    await createActivityLog(
      dbSession,
      "profile_image_update",
      "User",
      uuid,
      user.P.email,
      `Profile image updated to ${file.P.fileName || file.id}`,
    );

    return {
      graph: {
        edges: [],
        vertexes: [file],
      },
      result: file,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
