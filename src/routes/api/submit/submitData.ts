import type { APIEvent } from "@solidjs/start/server";

import { mutateData } from "~/cypher/mutate/mutate_data/mutateData";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

export async function POST({ request }: APIEvent) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new APIError("Invalid content type. Expected application/json", 415);
  }

  const data = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  // - Authorization -
  try {
    // const authorizationError = await checkAdminUserAuthorization(
    //   subDomain,
    //   dbSession,
    //   true,
    // );
    // if (authorizationError) {
    //   throw new APIError("Authorization failed", 403);
    // }
    // - End of Authorization -
    const tx = dbSession.beginTransaction();
    try {
      const res = await mutateData(data, tx);
      await tx.commit();
      return res;
    } catch (error: unknown) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  } catch (error: unknown) {
    // "Transaction failed: "
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
