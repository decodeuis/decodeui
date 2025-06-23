import type { APIEvent } from "@solidjs/start/server";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { sendEmailConfirmation } from "./functions/sendEmailConfirmation";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

export async function POST(event: APIEvent): Promise<Response> {
  try {
    const user = await getUserFromSession(event.request);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
      });
    }
    const { dbSession, subDomain } = await getDBSessionForSubdomain(
      event.request,
    );

    try {
      // Get current user
      const userResult = await dbSession.run(
        "MATCH (u:User {uuid: $uuid}) RETURN u",
        { uuid: user.P.uuid },
      );

      if (!userResult.records.length) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
        });
      }

      const currentUser = convertNodeToJson(userResult.records[0].get("u"));
      if (!currentUser.P.password) {
        return new Response(
          JSON.stringify({
            error: "Administrator cannot resend email confirmation",
          }),
          {
            status: 404,
          },
        );
      }

      if (!currentUser.P.pendingEmail) {
        return new Response(
          JSON.stringify({ error: "No pending email confirmation found" }),
          { status: 400 },
        );
      }

      // Resend email confirmation
      await sendEmailConfirmation(
        event.request,
        currentUser,
        currentUser.P.pendingEmail,
        currentUser,
        event.params.tenant || "admin",
        dbSession,
      );

      const result: ServerResult = {
        graph: {
          edges: {},
          vertexes: { [currentUser.id]: currentUser },
        },
        result: currentUser,
        message: "Confirmation email has been resent. Please check your inbox.",
      };

      return new Response(JSON.stringify(result));
    } finally {
      await dbSession.close();
    }
  } catch (error) {
    console.error("Error resending email confirmation:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
}
