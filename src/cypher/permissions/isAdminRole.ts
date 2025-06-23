import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { checkRole } from "./isPermission";
import { SYSTEM_ROLES } from "./type/types";

// unused function
export async function isAdminRole(request: Request): Promise<boolean> {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    return await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);
  } finally {
    await dbSession.close();
  }
}
