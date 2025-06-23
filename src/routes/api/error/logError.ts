import type { APIEvent } from "@solidjs/start/server";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

interface ErrorLogData {
  additionalData?: Record<string, unknown>;
  componentStack?: string;
  location?: string;
  message: string;
  stack?: string;
}

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const errorData: ErrorLogData = await request.json();
    const user = await getUserFromSession(request);

    // Create a detailed error description
    const errorDetails = [
      `Message: ${errorData.message}`,
      errorData.location ? `Location: ${errorData.location}` : null,
      errorData.stack ? `Stack: ${errorData.stack}` : null,
      errorData.componentStack
        ? `Component Stack: ${errorData.componentStack}`
        : null,
      errorData.additionalData
        ? `Additional Data: ${JSON.stringify(errorData.additionalData)}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Log the error
    await createActivityLog(
      dbSession,
      "client_error",
      "Application",
      user?.P.uuid || "anonymous",
      user?.P.email || "anonymous",
      errorDetails,
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
