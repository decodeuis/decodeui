import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { fetchSubdomains } from "~/routes/api/subdomain/fetchSubdomains";

export async function getSubDomains(request?: Request) {
  "use server";
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    if (subDomain !== ADMIN_DB_NAME) {
      throw new APIError(
        "Unauthorized. System subdomain access required.",
        403,
      );
    }

    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    if (!user?.P?.email) {
      throw new APIError("Unauthorized", 401);
    }

    return await fetchSubdomains(dbSession, user.P.email);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
